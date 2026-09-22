import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import type { Article } from '../../types/news';

interface Props {
  initialArticles?: Article[];
}

export default function SearchModal({ initialArticles = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !isOpen) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          setIsOpen(true);
        }
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = initialArticles.filter(
      a => a.title.toLowerCase().includes(q) || a.subtitle?.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 6);
    setResults(filtered);
  }, [query, initialArticles]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-search-trigger"
        style={{
          background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
          border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
          color: 'var(--text-secondary, #94a3b8)',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        title="Cari Berita (Tekan /)"
        aria-label="Cari Berita"
      >
        <Search size={16} />
        <span>Cari berita...</span>
        <kbd style={{
          background: 'var(--bg-primary, rgba(0,0,0,0.3))',
          border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
          borderRadius: '4px',
          padding: '1px 5px',
          fontSize: '0.7rem',
          color: 'var(--text-muted, #64748b)'
        }}>/</kbd>
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10vh'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary, #0f172a)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '560px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))'
            }}>
              <Search size={20} style={{ color: 'var(--brand-cyan, #00f2fe)', marginRight: '10px' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ketik kata kunci investigasi teknologi..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary, #ffffff)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #64748b)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px' }}>
              {query.trim() && results.length === 0 && (
                <p style={{ color: 'var(--text-muted, #64748b)', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
                  Tidak ada berita yang cocok dengan "{query}".
                </p>
              )}

              {results.map(article => (
                <a
                  key={article.id}
                  href={`/berita/${article.slug || article.id}`}
                  style={{
                    display: 'block',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    marginBottom: '6px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary, rgba(255,255,255,0.06))')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan, #00f2fe)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {article.category}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)', margin: '2px 0' }}>
                    {article.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    {article.subtitle}
                  </div>
                </a>
              ))}

              {!query.trim() && (
                <div style={{ padding: '12px', color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>
                  <span>Kategori Cepat: </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {['ai', 'gadget', 'software', 'cybersecurity', 'startup'].map(cat => (
                      <a
                        key={cat}
                        href={`/${cat}`}
                        style={{
                          background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
                          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                          color: 'var(--text-secondary, #cbd5e1)',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          textTransform: 'uppercase'
                        }}
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
