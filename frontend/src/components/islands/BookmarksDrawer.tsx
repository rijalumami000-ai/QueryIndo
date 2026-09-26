import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Article } from '../../types/news';
import { isMockArticleId } from '../../services/articleService';

export default function BookmarksDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  // Sync bookmark IDs from LocalStorage
  const loadBookmarks = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('queryindo_bookmarks') || '[]');
      if (Array.isArray(saved)) {
        setBookmarkIds(saved);
        // Also update navbar badge if present
        const badge = document.getElementById('dropdown-bookmark-count');
        if (badge) badge.textContent = saved.length.toString();
      }
    } catch {}
  }, []);

  // Load articles catalogue
  useEffect(() => {
    try {
      const raw = localStorage.getItem('queryindo_articles_v5');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(a => a && a.id && !isMockArticleId(a.id));
          if (clean.length > 0) {
            setAllArticles(clean);
            return;
          }
        }
      }
    } catch {}
    setAllArticles([]);
  }, []);

  const openModal = useCallback(() => {
    loadBookmarks();
    setIsOpen(true);
    document.body.classList.add('modal-open');
  }, [loadBookmarks]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    loadBookmarks();

    // Bind triggers in DOM
    const triggerBtns = document.querySelectorAll('#dropdown-bookmarks-btn, [data-open-bookmarks]');
    triggerBtns.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    }));

    const handleCustomOpen = () => openModal();
    window.addEventListener('open-bookmarks-modal', handleCustomOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      triggerBtns.forEach(btn => btn.removeEventListener('click', openModal));
      window.removeEventListener('open-bookmarks-modal', handleCustomOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openModal, closeModal, isOpen, loadBookmarks]);

  const removeBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarkIds.filter(bId => bId !== id);
    setBookmarkIds(updated);
    try {
      localStorage.setItem('queryindo_bookmarks', JSON.stringify(updated));
      const badge = document.getElementById('dropdown-bookmark-count');
      if (badge) badge.textContent = updated.length.toString();
    } catch {}
  };

  const clearAllBookmarks = () => {
    if (!window.confirm('Hapus semua artikel dari daftar tersimpan?')) return;
    setBookmarkIds([]);
    try {
      localStorage.setItem('queryindo_bookmarks', JSON.stringify([]));
      const badge = document.getElementById('dropdown-bookmark-count');
      if (badge) badge.textContent = '0';
    } catch {}
  };

  // Filtered bookmark articles
  const savedArticles = useMemo(() => {
    const list = allArticles.filter(a => bookmarkIds.includes(a.id));
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(a => 
      a.title.toLowerCase().includes(q) || 
      (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
      a.category.toLowerCase().includes(q)
    );
  }, [allArticles, bookmarkIds, searchQuery]);

  const handleOpenArticle = (slugOrId: string) => {
    closeModal();
    window.location.href = `/berita/${slugOrId}`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(16px)',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '85vh',
          background: 'var(--bg-surface, #0b1120)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary, #ffffff)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: 'var(--bg-secondary, rgba(255,255,255,0.03))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔖</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              Artikel Tersimpan
            </h3>
            <span style={{ background: 'rgba(0, 242, 254, 0.12)', color: 'var(--brand-cyan, #00f2fe)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              {bookmarkIds.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {bookmarkIds.length > 0 && (
              <button
                onClick={clearAllBookmarks}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 51, 75, 0.3)',
                  color: '#ff4d6d',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={closeModal}
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
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Input inside Bookmarks */}
        {bookmarkIds.length > 1 && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
            <input
              type="text"
              placeholder="Cari dalam artikel tersimpan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Bookmarked Items List */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookmarkIds.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📑</div>
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary, #fff)', fontSize: '1.05rem', fontWeight: 700 }}>
                Belum Ada Artikel Tersimpan
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                Tekan tombol bookmark 🔖 pada kartu artikel atau saat membaca berita untuk menyimpannya di sini.
              </p>
            </div>
          )}

          {bookmarkIds.length > 0 && savedArticles.length === 0 && (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Tidak ada artikel tersimpan yang cocok dengan "{searchQuery}".
              </p>
            </div>
          )}

          {savedArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => handleOpenArticle(art.slug || art.id)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-cyan, #00f2fe)';
                e.currentTarget.style.background = 'rgba(0, 242, 254, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.08))';
                e.currentTarget.style.background = 'var(--bg-secondary, rgba(255,255,255,0.03))';
              }}
            >
              <img
                src={art.imageUrl}
                alt={art.title}
                style={{ width: '80px', height: '64px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {art.category}
                </span>
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#fff', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                    {art.author?.name} &bull; {art.readTimeMinutes || 5}m baca
                  </span>
                  <button
                    onClick={(e) => removeBookmark(art.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted, #94a3b8)',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                    title="Hapus dari daftar tersimpan"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
