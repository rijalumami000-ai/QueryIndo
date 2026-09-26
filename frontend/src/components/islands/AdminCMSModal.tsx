import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Article } from '../../types/news';
import { isMockArticleId } from '../../services/articleService';
import { CATEGORIES, MASTER_TAXONOMY } from '../../data/mockNews';

interface Props {
  initialOpen?: boolean;
}

export default function AdminCMSModal({ initialOpen = false }: Props) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'stats'>('list');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  // Editor Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('ai');
  const [subCategory, setSubCategory] = useState('');
  const [authorName, setAuthorName] = useState('Rijal Umami');
  const [authorRole, setAuthorRole] = useState('Editor in Chief');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [aiSummaryPoints, setAiSummaryPoints] = useState<string[]>(['', '', '']);
  const [contentHtml, setContentHtml] = useState('');
  const [editorSuccess, setEditorSuccess] = useState(false);

  // Load articles
  const loadArticles = useCallback(() => {
    try {
      const raw = localStorage.getItem('queryindo_articles_v5');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(a => a && a.id && !a.id.startsWith('qi-art-') && !a.id.startsWith('mock-'));
          if (clean.length > 0) {
            setArticles(clean);
            return;
          }
        }
      }
    } catch {}
    setArticles([]);
  }, []);

  const openModal = useCallback(() => {
    loadArticles();
    setIsOpen(true);
    document.body.classList.add('modal-open');
  }, [loadArticles]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    document.body.classList.remove('modal-open');
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    } else if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    loadArticles();

    // Check if current URL is /admin or #admin or initialOpen
    if (initialOpen || (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'))) {
      openModal();
    }

    const handleCustomOpen = () => openModal();
    window.addEventListener('open-admin-cms', handleCustomOpen);

    const triggers = document.querySelectorAll('#dropdown-admin-cms-btn, #link-admin-cms, [data-open-admin-cms]');
    const onTriggerClick = (e: Event) => {
      e.preventDefault();
      const dropdown = document.getElementById('user-avatar-dropdown');
      if (dropdown) dropdown.style.display = 'none';
      openModal();
    };
    triggers.forEach(el => el.addEventListener('click', onTriggerClick));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-admin-cms', handleCustomOpen);
      triggers.forEach(el => el.removeEventListener('click', onTriggerClick));
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openModal, closeModal, isOpen, loadArticles, initialOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'redaksi2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleStartNewArticle = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setCategory('ai');
    setSubCategory('');
    setAuthorName('Rijal Umami');
    setAuthorRole('Editor in Chief');
    setImageUrl('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop');
    setImageCaption('');
    setIsFeatured(false);
    setIsBreaking(false);
    setAiSummaryPoints(['', '', '']);
    setContentHtml('<p>Tuliskan naskah laporan berita investigatif di sini...</p>');
    setActiveTab('editor');
    setEditorSuccess(false);
  };

  const handleEditArticle = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSlug(art.slug || art.id);
    setSubtitle(art.subtitle || '');
    setCategory(art.category || 'ai');
    setSubCategory(art.subCategory || '');
    setAuthorName(art.author?.name || 'Redaksi');
    setAuthorRole(art.author?.role || 'Jurnalis');
    setImageUrl(art.imageUrl || '');
    setImageCaption(art.imageCaption || '');
    setIsFeatured(!!art.isFeatured);
    setIsBreaking(!!art.isBreaking);
    setAiSummaryPoints(art.aiSummary && art.aiSummary.length >= 3 ? art.aiSummary : [
      art.aiSummary?.[0] || '',
      art.aiSummary?.[1] || '',
      art.aiSummary?.[2] || ''
    ]);
    let resolvedContent = (art.content && art.content.trim().length > 0) ? art.content : '';
    if (!resolvedContent) {
      try {
        const draft = localStorage.getItem(`queryindo_draft_${art.id}`) || localStorage.getItem(`manuscript_draft_${art.id}`);
        if (draft && draft.trim()) resolvedContent = draft;
      } catch {}
    }
    if (!resolvedContent && art.subtitle) {
      resolvedContent = `<p class="article-lead">${art.subtitle}</p>`;
    }
    setContentHtml(resolvedContent || '<p>Tuliskan naskah laporan berita investigatif di sini...</p>');
    setActiveTab('editor');
    setEditorSuccess(false);
  };

  const handleDeleteArticle = (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    const updated = articles.filter(a => a.id !== id);
    setArticles(updated);
    try {
      localStorage.setItem('queryindo_articles_v5', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const generatedSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newArticleData: Article = {
      id: editingId || `qi-custom-${Date.now()}`,
      title: title.trim(),
      slug: generatedSlug,
      subtitle: subtitle.trim(),
      category,
      subCategory: subCategory || undefined,
      tags: [category.toUpperCase(), 'Teknologi', 'QueryIndo'],
      author: {
        name: authorName.trim(),
        role: authorRole.trim(),
        avatar: '/premium_3d_avatar.png'
      },
      publishedAt: new Date().toISOString(),
      readTimeMinutes: Math.max(3, Math.ceil(contentHtml.split(' ').length / 150)),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop',
      imageCaption: imageCaption.trim() || undefined,
      isFeatured,
      isBreaking,
      viewsCount: 1,
      likesCount: 0,
      aiSummary: aiSummaryPoints.filter(p => p.trim().length > 0),
      content: contentHtml
    };

    let updatedArticles: Article[];
    if (editingId) {
      updatedArticles = articles.map(a => a.id === editingId ? newArticleData : a);
    } else {
      updatedArticles = [newArticleData, ...articles];
    }

    setArticles(updatedArticles);
    try {
      localStorage.setItem('queryindo_articles_v5', JSON.stringify(updatedArticles));
    } catch {}

    setEditorSuccess(true);
    setTimeout(() => {
      setActiveTab('list');
      setEditorSuccess(false);
    }, 1000);
  };

  // Filtered articles list
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchCat = catFilter === 'all' || a.category === catFilter;
      const q = searchFilter.toLowerCase().trim();
      const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.author?.name && a.author.name.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [articles, catFilter, searchFilter]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 10, 20, 0.92)',
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
          maxWidth: '1040px',
          maxHeight: '90vh',
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
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            background: 'var(--bg-secondary, rgba(255,255,255,0.03))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>
              CMS
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)", fontSize: '1.05rem', fontWeight: 800, display: 'block' }}>
                ADMIN PUBLIKASI & REDAKSI QUERYINDO
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                Manajemen Konten & Investigasi Jurnalisme Teknologi
              </span>
            </div>
          </div>

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
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Auth Gate (If not authenticated) */}
        {!isAuthenticated ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '380px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800 }}>Autentikasi Redaksi</h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
              Portal ini khusus diperuntukkan bagi jurnalis dan dewan redaksi QueryIndo.
            </p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                placeholder="Kata sandi redaksi (Ketik: admin)..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: passcodeError ? '1px solid #ef4444' : '1px solid var(--border-color, rgba(255,255,255,0.2))', background: 'var(--bg-secondary, rgba(255,255,255,0.05))', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
              {passcodeError && (
                <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>Kata sandi salah. Coba: <code>admin</code></span>
              )}
              <button
                type="submit"
                style={{ padding: '10px', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 800, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Buka Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Main CMS Workspace */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Workspace Tab Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 24px',
                borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                background: 'var(--bg-secondary, rgba(255,255,255,0.02))'
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('list')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'list' ? 'var(--brand-cyan, #00f2fe)' : 'none',
                    color: activeTab === 'list' ? '#000' : 'var(--text-secondary, #94a3b8)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  📰 Daftar Artikel ({articles.length})
                </button>
                <button
                  onClick={handleStartNewArticle}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'editor' ? 'var(--brand-cyan, #00f2fe)' : 'none',
                    color: activeTab === 'editor' ? '#000' : 'var(--text-secondary, #94a3b8)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  ✍️ {editingId ? 'Edit Artikel' : 'Tulis Berita Baru'}
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--brand-cyan, #00f2fe)', fontWeight: 600 }}>
                ● Sesi Redaksi Aktif
              </div>
            </div>

            {/* Tab 1: Articles List */}
            {activeTab === 'list' && (
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Cari judul berita atau penulis..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{ flex: 1, minWidth: '220px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <select
                    value={catFilter}
                    onChange={(e) => setCatFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, #1e293b)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="all">Semua Kanal</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Articles Table */}
                <div style={{ border: '1px solid var(--border-color, rgba(255,255,255,0.08))', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.04))', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
                      <tr>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted, #94a3b8)' }}>Artikel Berita</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted, #94a3b8)' }}>Kanal</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted, #94a3b8)' }}>Penulis</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted, #94a3b8)' }}>Views</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted, #94a3b8)' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((art) => (
                        <tr key={art.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.04))' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '2px', lineHeight: 1.35 }}>
                              {art.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                              {new Date(art.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {art.isFeatured && <span style={{ marginLeft: '8px', color: '#ff334b', fontWeight: 700 }}>[HEADLINE]</span>}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--brand-cyan, #00f2fe)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              {art.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-secondary, #cbd5e1)' }}>
                            {art.author?.name}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-muted, #94a3b8)' }}>
                            {art.viewsCount || 0}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditArticle(art)}
                                style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.08))', border: 'none', padding: '4px 10px', borderRadius: '4px', color: 'var(--brand-cyan, #00f2fe)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '4px 10px', borderRadius: '4px', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Article Editor */}
            {activeTab === 'editor' && (
              <form onSubmit={handleSaveArticle} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {editorSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                    ✓ Berita berhasil disimpan dan diterbitkan ke portal!
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {/* Title */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Judul Artikel Berita</label>
                    <input
                      type="text"
                      placeholder="Masukkan judul investigatif berita..."
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }}
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>URL Slug</label>
                    <input
                      type="text"
                      placeholder="slug-artikel"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Kanal Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, #1e293b)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Subtitle / Ringkasan Awal</label>
                  <input
                    type="text"
                    placeholder="Penjelasan ringkas 1-2 kalimat..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Image & Author Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>URL Gambar Sampul (Unsplash / CDN)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Penulis Berita</label>
                    <input
                      type="text"
                      placeholder="Nama Jurnalis..."
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Checkboxes: Headline & Breaking */}
                <div style={{ display: 'flex', gap: '24px', padding: '10px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                    <span>Jadikan <strong>Berita Utama (Headline)</strong></span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} />
                    <span style={{ color: '#ff334b' }}>Tandai sebagai <strong>Breaking News</strong></span>
                  </label>
                </div>

                {/* AI Summary Key Points */}
                <div style={{ background: 'rgba(0, 242, 254, 0.03)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '8px', padding: '14px' }}>
                  <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', marginBottom: '8px' }}>
                    ⚡ 3 Poin Kunci AI Summary
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiSummaryPoints.map((pt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`Poin inti ${idx + 1}...`}
                        value={pt}
                        onChange={(e) => {
                          const newPts = [...aiSummaryPoints];
                          newPts[idx] = e.target.value;
                          setAiSummaryPoints(newPts);
                        }}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color, rgba(255,255,255,0.12))', background: 'var(--bg-surface, #0b1120)', color: '#fff', fontSize: '0.82rem', boxSizing: 'border-box' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Body Content Editor */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>Konten Berita (Format HTML)</label>
                  <textarea
                    rows={8}
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-secondary, rgba(255,255,255,0.04))', color: '#fff', fontSize: '0.88rem', fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    style={{ padding: '8px 18px', background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.2))', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 24px', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 800, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.88rem' }}
                  >
                    Simpan & Terbitkan Berita
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
