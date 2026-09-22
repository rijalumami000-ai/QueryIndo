import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Article } from '../../types/news';
import { ArticleService } from '../../services/articleService';

interface ChannelTab {
  id: string;
  name: string;
}

const CHANNELS: ChannelTab[] = [
  { id: 'all', name: 'Semua' },
  { id: 'ai', name: 'AI' },
  { id: 'gadget', name: 'Gadget' },
  { id: 'software', name: 'Software' },
  { id: 'cybersecurity', name: 'Siber' },
  { id: 'startup', name: 'Startup' },
  { id: 'fintech', name: 'Fintech' },
  { id: 'ev', name: 'EV' }
];

const QUICK_TOPICS = [
  'Kecerdasan Buatan',
  'Semikonduktor',
  'Keamanan Siber',
  'Mobil Listrik',
  'Software Engineering',
  'Fintech',
  'Startup'
];

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Visual Query State
  const [showVisualDrop, setShowVisualDrop] = useState(false);
  const [visualAttached, setVisualAttached] = useState<{
    dataUrl: string;
    fileName: string;
    entityTag?: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(false);

  // Reload articles from storage / memory
  const reloadArticles = useCallback(() => {
    try {
      const list = ArticleService.getArticles();
      if (Array.isArray(list)) setArticles(list);
    } catch {}
  }, []);

  useEffect(() => {
    reloadArticles();
    try {
      const raw = localStorage.getItem('queryindo_recent_searches');
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {}
  }, [reloadArticles]);

  const saveRecent = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches(prev => {
      const updated = [clean, ...prev.filter(t => t.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem('queryindo_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const openSearch = useCallback((initialQuery?: string) => {
    reloadArticles();
    setIsOpen(true);
    isOpenRef.current = true;
    if (initialQuery !== undefined) setQuery(initialQuery);
    setActiveIndex(-1);
    document.body.classList.add('modal-open');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [reloadArticles]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    isOpenRef.current = false;
    setShowVisualDrop(false);
    document.body.classList.remove('modal-open');
  }, []);

  // Global Keybindings & Custom Events
  useEffect(() => {
    const handleOpen = (e: any) => openSearch(e?.detail?.query);
    const handleClose = () => closeSearch();

    window.addEventListener('open-search-modal', handleOpen);
    window.addEventListener('open-search-overlay', handleOpen);
    window.addEventListener('close-search-modal', handleClose);

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA'
      ) {
        e.preventDefault();
        openSearch();
        return;
      }
      if (e.key === 'Escape' && isOpenRef.current) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('#btn-search-toggle, .btn-search-toggle, #btn-search-trigger, .btn-search-trigger, [data-search-trigger]')) {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
      }
    };
    document.addEventListener('click', handleDocClick, true);

    return () => {
      window.removeEventListener('open-search-modal', handleOpen);
      window.removeEventListener('open-search-overlay', handleOpen);
      window.removeEventListener('close-search-modal', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleDocClick, true);
    };
  }, [openSearch, closeSearch]);

  // Results calculation
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const hasVisual = !!visualAttached?.entityTag;
    const vTag = visualAttached?.entityTag?.toLowerCase() || '';

    if (!q && selectedChannel === 'all' && !hasVisual) return [];

    return articles.filter(a => {
      // Channel filter
      if (selectedChannel !== 'all') {
        if ((a.category || '').toLowerCase() !== selectedChannel.toLowerCase()) return false;
      }

      // Visual query match
      if (hasVisual && vTag) {
        const matchesVisual =
          (a.tags && a.tags.some(t => t.toLowerCase().includes(vTag))) ||
          (a.title || '').toLowerCase().includes(vTag) ||
          (a.category || '').toLowerCase().includes(vTag);
        if (!matchesVisual) return false;
      }

      if (!q) return true;

      // Text query match
      return (
        (a.title || '').toLowerCase().includes(q) ||
        (a.subtitle || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
        (a.author?.name || '').toLowerCase().includes(q)
      );
    });
  }, [query, selectedChannel, articles, visualAttached]);

  const handleSelect = (slugOrId: string) => {
    if (query.trim()) saveRecent(query);
    closeSearch();
    window.dispatchEvent(new CustomEvent('open-article-reader', { detail: { slugOrId } }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 >= results.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 < 0 ? results.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        const sel = results[activeIndex];
        handleSelect(sel.slug || sel.id);
      } else if (query.trim()) {
        saveRecent(query);
      }
    }
  };

  // Visual Image Handling
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const name = file.name.toLowerCase();
      let entity = 'Hardware & Komputasi';
      if (name.includes('phone') || name.includes('gadget') || name.includes('hp')) entity = 'Gadget';
      else if (name.includes('car') || name.includes('ev') || name.includes('mobil')) entity = 'EV';
      else if (name.includes('ai') || name.includes('chip') || name.includes('server')) entity = 'AI';
      else if (name.includes('security') || name.includes('siber')) entity = 'Siber';

      setVisualAttached({
        dataUrl,
        fileName: file.name,
        entityTag: entity
      });
      setShowVisualDrop(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    reader.readAsDataURL(file);
  };

  const highlight = (text: string, q: string) => {
    if (!q || !text) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="search-cmd-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) closeSearch();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Pusat Pencarian QueryIndo"
    >
      <div className="search-cmd-dialog" onClick={e => e.stopPropagation()}>
        {/* Single Integrated Command Input Bar */}
        <div className="search-cmd-input-bar">
          <svg className="search-cmd-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            className="search-cmd-field"
            placeholder="Cari berita, investigasi, teknologi..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />

          <div className="search-cmd-actions">
            {query && (
              <button
                type="button"
                className="btn-cmd-action"
                onClick={() => setQuery('')}
                title="Hapus input"
              >
                ✕
              </button>
            )}

            {/* Visual Lens Action Button */}
            <button
              type="button"
              className={`btn-cmd-action ${visualAttached || showVisualDrop ? 'active-lens' : ''}`}
              onClick={() => {
                if (visualAttached) {
                  setVisualAttached(null);
                } else {
                  setShowVisualDrop(prev => !prev);
                }
              }}
              title="Pencarian Visual / Gambar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{visualAttached ? 'Visual Aktif' : 'Visual'}</span>
            </button>

            <span className="search-cmd-esc">ESC</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
            }}
          />
        </div>

        {/* Visual Lens Attached Strip (when image is loaded) */}
        {visualAttached && (
          <div className="search-cmd-visual-strip">
            <div className="visual-strip-left">
              <img src={visualAttached.dataUrl} alt="Visual Attachment" className="visual-strip-thumb" />
              <div className="visual-strip-meta">
                <span className="visual-strip-label">{visualAttached.fileName}</span>
                <span className="visual-strip-sub">Visual Terdeteksi: {visualAttached.entityTag}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-remove-visual"
              onClick={() => setVisualAttached(null)}
              title="Hapus lampiran gambar"
            >
              ✕ Lepas
            </button>
          </div>
        )}

        {/* Compact Visual Dropzone (when lens toggled and no image yet) */}
        {showVisualDrop && !visualAttached && (
          <div
            className={`search-cmd-dropzone ${isDragOver ? 'drag-active' : ''}`}
            onDragOver={e => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={e => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="dropzone-text">Seret gambar ke sini atau klik untuk memilih file</p>
            <p className="dropzone-hint">Mencocokkan entitas visual (perangkat keras, chip, foto teknologi) dengan arsip berita</p>
          </div>
        )}

        {/* Minimalist Channel Filter Strip */}
        <nav className="search-cmd-nav" aria-label="Kanal Pencarian">
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              type="button"
              className={`search-cmd-tab ${selectedChannel === ch.id ? 'active' : ''}`}
              onClick={() => setSelectedChannel(ch.id)}
            >
              {ch.name}
            </button>
          ))}
        </nav>

        {/* Results Wire / Initial State */}
        <div className="search-cmd-results">
          {results.map((art, idx) => (
            <div
              key={art.id}
              className={`search-cmd-row ${idx === activeIndex ? 'active-row' : ''}`}
              onClick={() => handleSelect(art.slug || art.id)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className="search-cmd-badge">{art.category}</span>
              <p className="search-cmd-title">{highlight(art.title, query)}</p>
              <span className="search-cmd-meta">
                {art.readTimeMinutes || 5}m
              </span>
            </div>
          ))}

          {/* Empty Match */}
          {(query.trim() || selectedChannel !== 'all' || visualAttached) && results.length === 0 && (
            <div className="search-cmd-empty">
              Tidak ditemukan artikel yang cocok.
            </div>
          )}

          {/* Initial Quiet State: Quick Topics & History */}
          {!query.trim() && selectedChannel === 'all' && !visualAttached && (
            <div className="search-cmd-quick-links">
              {recentSearches.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div className="search-cmd-quick-title" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Pencarian Terakhir</span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted, #64748b)', fontSize: '0.7rem', cursor: 'pointer' }}
                      onClick={() => {
                        setRecentSearches([]);
                        try { localStorage.removeItem('queryindo_recent_searches'); } catch {}
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="search-cmd-tags-inline">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        type="button"
                        className="search-cmd-tag-link"
                        onClick={() => setQuery(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="search-cmd-quick-title" style={{ marginBottom: '6px' }}>Topik Utama</p>
                <div className="search-cmd-tags-inline">
                  {QUICK_TOPICS.map(topic => (
                    <button
                      key={topic}
                      type="button"
                      className="search-cmd-tag-link"
                      onClick={() => setQuery(topic)}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Command Bar Footer */}
        <div className="search-cmd-footer">
          <span>QUERYINDO DISCOVERY</span>
          <div className="search-cmd-footer-shortcuts">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigasi</span>
            <span><kbd>↵</kbd> Buka</span>
            <span><kbd>ESC</kbd> Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
