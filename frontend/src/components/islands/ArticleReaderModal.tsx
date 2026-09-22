import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Article } from '../../types/news';
import { isMockArticleId, ArticleService } from '../../services/articleService';
import ReaderComments from './ReaderComments';

export default function ArticleReaderModal() {
  const [article, setArticle] = useState<Article | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);

  const openArticle = useCallback((slugOrId: string) => {
    let found = ArticleService.getArticleBySlugOrId(slugOrId);
    if (!found) {
      let articles: Article[] = [];
      try {
        const raw = localStorage.getItem('queryindo_articles_v5');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const clean = parsed.filter(a => a && a.id && !isMockArticleId(a.id));
            if (clean.length > 0) articles = clean;
          }
        }
      } catch {}
      if (articles.length === 0) articles = ArticleService.getArticles();

      const clean = decodeURIComponent(slugOrId).trim().replace(/^\/+/, '').replace(/^(article|berita)\//, '');
      found = articles.find(a => 
        a.id === clean || 
        a.slug === clean || 
        (a.slug && a.slug.toLowerCase() === clean.toLowerCase()) ||
        (a.id && a.id.toLowerCase() === clean.toLowerCase())
      );
    }

    if (found) {
      setArticle(found);
      setLikesCount(found.likesCount || 0);

      // Check bookmark state
      try {
        const bookmarks = JSON.parse(localStorage.getItem('queryindo_bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(found.id));
      } catch {}

      setIsOpen(true);
      setScrollProgress(0);
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';

      // Update URL silently
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        window.history.pushState({ articleId: found.id }, found.title, `/berita/${found.slug || found.id}`);
      }
    }
  }, []);

  const closeReader = useCallback(() => {
    setIsOpen(false);
    setIsFocusMode(false);
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      if (window.location.pathname.startsWith('/berita/')) {
        window.history.pushState({}, '', '/');
      }
    }
  }, []);

  // Listen to custom open event and global article clicks
  useEffect(() => {
    const handleCustomOpen = (e: any) => {
      if (e.detail && (e.detail.slugOrId || e.detail.slug || e.detail.id)) {
        openArticle(e.detail.slugOrId || e.detail.slug || e.detail.id);
      }
    };

    window.addEventListener('open-article-reader', handleCustomOpen);

    // Intercept clicks on article cards throughout the page
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.btn-bookmark, .tag-badge, .btn-action, .cat-pill, .btn-lang, .btn-social-nav, button, input, select, textarea')) return;

      const card = target.closest('[data-article-id], [data-article-slug], [data-slug], [data-id], [data-rel-id], [data-rel-slug], .article-card, .hero-card, .trending-item, .matrix-card, .bento-featured-card, .feed-card') as HTMLElement | null;
      if (card) {
        const slug = card.getAttribute('data-article-slug') || card.getAttribute('data-slug') || card.getAttribute('data-rel-slug');
        const id = card.getAttribute('data-article-id') || card.getAttribute('data-id') || card.getAttribute('data-rel-id');
        if (slug || id) {
          e.preventDefault();
          e.stopPropagation();
          openArticle(slug || id!);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeReader();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-article-reader', handleCustomOpen);
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openArticle, closeReader, isOpen]);

  // Handle scroll progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight > 0) {
      setScrollProgress((target.scrollTop / totalHeight) * 100);
    }
  };

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount(prev => next ? prev + 1 : Math.max(0, prev - 1));
  };

  const toggleBookmark = () => {
    if (!article) return;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('queryindo_bookmarks') || '[]');
      let updated: string[];
      if (saved.includes(article.id)) {
        updated = saved.filter(id => id !== article.id);
        setIsBookmarked(false);
      } else {
        updated = [...saved, article.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('queryindo_bookmarks', JSON.stringify(updated));
    } catch {}
  };

  const handleShare = () => {
    if (!article) return;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.subtitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan artikel berhasil disalin!');
    }
  };

  if (!isOpen || !article) return null;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div
      ref={modalRef}
      onScroll={handleScroll}
      className={`modal-overlay open ${isFocusMode ? 'focus-mode-active' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(16px)',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: isFocusMode ? '0' : '40px 16px 80px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === modalRef.current) closeReader();
      }}
    >
      {/* Sticky Progress Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 10000
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #00f2fe 0%, #38bdf8 100%)',
            transition: 'width 0.08s ease-out'
          }}
        />
      </div>

      {/* Main Container Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isFocusMode ? '780px' : '880px',
          background: 'var(--bg-surface, #0b1120)',
          border: isFocusMode ? 'none' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
          borderRadius: isFocusMode ? '0' : '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
          padding: isFocusMode ? '40px 24px' : '36px 32px 48px',
          color: 'var(--text-primary, #ffffff)',
          margin: isFocusMode ? '0 auto' : 'auto',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))'
          }}
        >
          {/* Breadcrumbs */}
          <nav style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--brand-cyan, #00f2fe)', fontWeight: 700, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary, #94a3b8)' }}>{article.subCategory || 'Berita'}</span>
          </nav>

          {/* Quick Toolbar: Font Size, Focus Mode, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Font Size Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-secondary, rgba(255,255,255,0.06))', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
              <button
                onClick={() => setFontSize('normal')}
                style={{ background: fontSize === 'normal' ? 'var(--brand-cyan, #00f2fe)' : 'none', color: fontSize === 'normal' ? '#000' : 'var(--text-secondary, #94a3b8)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}
                title="Ukuran Font Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                style={{ background: fontSize === 'large' ? 'var(--brand-cyan, #00f2fe)' : 'none', color: fontSize === 'large' ? '#000' : 'var(--text-secondary, #94a3b8)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                title="Ukuran Font Besar"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                style={{ background: fontSize === 'xlarge' ? 'var(--brand-cyan, #00f2fe)' : 'none', color: fontSize === 'xlarge' ? '#000' : 'var(--text-secondary, #94a3b8)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}
                title="Ukuran Font Sangat Besar"
              >
                A++
              </button>
            </div>

            {/* Zen Focus Mode Button */}
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              style={{
                background: isFocusMode ? 'var(--brand-cyan, #00f2fe)' : 'var(--bg-secondary, rgba(255,255,255,0.06))',
                color: isFocusMode ? '#000' : 'var(--text-secondary, #94a3b8)',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: '6px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{isFocusMode ? 'Keluar Fokus' : 'Mode Fokus'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={closeReader}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
              aria-label="Tutup Reader"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Article Headline Header */}
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--brand-cyan, #00f2fe)', color: '#000', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {article.category}
            </span>
            {article.tags && article.tags.map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary, #cbd5e1)', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px' }}>
                #{t}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '14px',
              letterSpacing: '-0.5px'
            }}
          >
            {article.title}
          </h1>

          <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, margin: '0 0 20px' }}>
            {article.subtitle}
          </p>

          {/* Author Meta Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={article.author?.avatar || '/premium_3d_avatar.png'}
                alt={article.author?.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--brand-cyan, #00f2fe)' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {article.author?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-cyan, #00f2fe)' }}>
                  {article.author?.role || 'Dewan Redaksi Terverifikasi'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
              {formattedDate} &bull; ⏱️ {article.readTimeMinutes || 6} menit baca
            </div>
          </div>
        </header>

        {/* Cover Hero Image */}
        {article.imageUrl && (
          <figure style={{ margin: '0 0 28px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: '100%', height: 'auto', maxHeight: '460px', objectFit: 'cover', display: 'block' }}
            />
            {article.imageCaption && (
              <figcaption style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(0,0,0,0.3)' }}>
                Foto: {article.imageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* AI Key Points Box */}
        {article.aiSummary && article.aiSummary.length > 0 && (
          <div
            style={{
              background: 'rgba(0, 242, 254, 0.05)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '28px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', textTransform: 'uppercase', marginBottom: '8px' }}>
              <span>⚡</span> Ringkasan Inti Berita (AI Key Points)
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary, #cbd5e1)' }}>
              {article.aiSummary.map((point, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Prose */}
        <div
          className={`article-rich-content size-${fontSize}`}
          style={{
            fontFamily: "var(--font-reading, 'Newsreader', Georgia, serif)",
            fontSize: fontSize === 'xlarge' ? '1.35rem' : fontSize === 'large' ? '1.25rem' : '1.15rem',
            lineHeight: 1.85,
            color: 'var(--text-primary, #f1f5f9)'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Action Bar: Like, Bookmark, Share */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Like Button */}
            <button
              onClick={toggleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: isLiked ? '1px solid #ff334b' : '1px solid var(--border-color, rgba(255,255,255,0.15))',
                background: isLiked ? 'rgba(255, 51, 75, 0.1)' : 'var(--bg-secondary, rgba(255,255,255,0.05))',
                color: isLiked ? '#ff334b' : 'var(--text-primary, #fff)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{likesCount} Suka</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={toggleBookmark}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: isBookmarked ? '1px solid var(--brand-cyan, #00f2fe)' : '1px solid var(--border-color, rgba(255,255,255,0.15))',
                background: isBookmarked ? 'rgba(0, 242, 254, 0.1)' : 'var(--bg-secondary, rgba(255,255,255,0.05))',
                color: isBookmarked ? 'var(--brand-cyan, #00f2fe)' : 'var(--text-primary, #fff)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem'
              }}
            >
              <span>{isBookmarked ? '🔖 Tersimpan' : '📌 Simpan'}</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
              color: 'var(--text-primary, #fff)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📤 Bagikan Berita</span>
          </button>
        </div>

        {/* Interactive Reader Comments Island */}
        <ReaderComments articleId={article.id} />
      </div>
    </div>
  );
}
