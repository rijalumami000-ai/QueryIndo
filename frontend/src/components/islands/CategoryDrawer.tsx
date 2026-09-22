import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MASTER_TAXONOMY, CATEGORIES } from '../../data/mockNews';

export default function CategoryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setSearchFilter('');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }, []);

  const openDrawer = useCallback(() => {
    setIsOpen(true);
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }, []);

  useEffect(() => {
    // Bind hamburger buttons across all layouts
    const hamburgerBtns = document.querySelectorAll('#btn-hamburger-menu, .btn-hamburger-menu, [data-open-drawer]');
    const onHamburgerClick = (e: Event) => {
      e.preventDefault();
      openDrawer();
    };
    hamburgerBtns.forEach(btn => btn.addEventListener('click', onHamburgerClick));

    const handleCustomOpen = () => openDrawer();
    window.addEventListener('open-category-drawer', handleCustomOpen);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      hamburgerBtns.forEach(btn => btn.removeEventListener('click', onHamburgerClick));
      window.removeEventListener('open-category-drawer', handleCustomOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDrawer, closeDrawer, isOpen]);

  // Filtered categories based on search query
  const filteredTaxonomy = useMemo(() => {
    if (!searchFilter.trim()) return MASTER_TAXONOMY;
    const q = searchFilter.toLowerCase().trim();
    const result: typeof MASTER_TAXONOMY = {};

    Object.entries(MASTER_TAXONOMY).forEach(([catKey, subList]) => {
      const catObj = CATEGORIES.find(c => c.id === catKey);
      const catNameMatches = catObj && catObj.name.toLowerCase().includes(q);
      const matchingSubs = subList.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
      );

      if (catNameMatches || matchingSubs.length > 0) {
        result[catKey] = catNameMatches ? subList : matchingSubs;
      }
    });

    return result;
  }, [searchFilter]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    closeDrawer();
    window.location.href = path;
  };

  return (
    <div
      className="category-drawer-overlay open"
      id="category-drawer-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(16px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
    >
      <div
        className="category-drawer-panel"
        id="category-drawer-panel"
        style={{
          width: '100%',
          minHeight: '100vh',
          background: 'var(--bg-surface, #0b1120)',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary, #ffffff)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className="drawer-header-bar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg-surface, #0b1120)',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            padding: '16px 24px'
          }}
        >
          <div
            className="container drawer-header-inner"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <div className="drawer-brand-lockup">
              <span
                className="drawer-main-title"
                style={{
                  display: 'block',
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  color: 'var(--text-primary, #ffffff)'
                }}
              >
                DIREKTORI SELURUH KANAL BERITA
              </span>
              <span
                className="drawer-subtitle"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted, #94a3b8)',
                  marginTop: '2px'
                }}
              >
                14 Kanal Berita Teknologi & 140 Sub-Kanal Komprehensif Nusantara
              </span>
            </div>

            {/* Quick Search Filter Input inside Drawer */}
            <div style={{ flex: 1, maxWidth: '400px', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Cari subkategori (mis. LLM, RISC-V, EV, Robotik)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.2))',
                  background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={closeDrawer}
              className="btn-drawer-close"
              aria-label="Tutup Menu Direktori"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Directory Body Grid */}
        <div
          className="container drawer-body-container"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '32px 24px',
            flex: 1,
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="drawer-categories-tree"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}
          >
            {Object.entries(filteredTaxonomy).map(([catKey, subList]) => {
              const catObj = CATEGORIES.find(c => c.id === catKey);
              const catName = catObj ? catObj.name : catKey.toUpperCase();

              return (
                <div
                  key={catKey}
                  style={{
                    background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                    border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    onClick={() => handleNavigate(`/${catKey}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                      cursor: 'pointer'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                        fontSize: '0.98rem',
                        fontWeight: 800,
                        color: 'var(--brand-cyan, #00f2fe)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {catName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                      {subList.length} topik &rarr;
                    </span>
                  </div>

                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {subList.map(sub => (
                      <li key={sub.id}>
                        <a
                          href={`/${catKey}/${sub.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavigate(`/${catKey}/${sub.slug}`);
                          }}
                          style={{
                            display: 'block',
                            fontSize: '0.84rem',
                            color: 'var(--text-secondary, #cbd5e1)',
                            textDecoration: 'none',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.background = 'rgba(0, 242, 254, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary, #cbd5e1)';
                            e.currentTarget.style.background = 'none';
                          }}
                          title={sub.description}
                        >
                          {sub.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Institutional Footer Block inside Drawer */}
          <div
            className="drawer-footer-institutional"
            style={{
              paddingTop: '28px',
              borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px'
            }}
          >
            <div className="drawer-footer-col">
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', marginBottom: '10px', textTransform: 'uppercase' }}>
                STANDAR EDITORIAL
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <a href="/page/tentang-kami" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Tentang Kami</a>
                <a href="/page/redaksi" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Susunan Redaksi</a>
                <a href="/page/pedoman-media-siber" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Pedoman Media Siber</a>
                <a href="/page/kode-etik" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Kode Etik Jurnalistik</a>
                <a href="/page/pedoman-ai" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Transparansi AI</a>
                <a href="/page/cek-fakta" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Cek Fakta</a>
              </div>
            </div>

            <div className="drawer-footer-col">
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', marginBottom: '10px', textTransform: 'uppercase' }}>
                KEBIJAKAN & HUKUM
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <a href="/page/disclaimer" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Disclaimer (Penafian)</a>
                <a href="/page/kode-etik#hak-jawab" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Hak Jawab & Koreksi</a>
                <a href="/page/panduan-komunitas" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Panduan Komunitas</a>
                <a href="/page/privasi" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Kebijakan Privasi</a>
                <a href="/page/syarat-ketentuan" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Syarat & Ketentuan</a>
              </div>
            </div>

            <div className="drawer-footer-col">
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', marginBottom: '10px', textTransform: 'uppercase' }}>
                LAYANAN & SINDIKASI
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <a href="/page/hubungi-kami" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Kontak Redaksi</a>
                <a href="/page/info-iklan" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Kerjasama & Beriklan</a>
                <a href="/sitemap.xml" target="_blank" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Peta Situs (Sitemap)</a>
                <a href="/rss.xml" target="_blank" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>RSS Feed Sindikasi</a>
                <a href="mailto:redaksi@queryindo.com" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Kirim Siaran Pers</a>
              </div>
            </div>

            <div className="drawer-footer-col">
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brand-cyan, #00f2fe)', marginBottom: '10px', textTransform: 'uppercase' }}>
                SALURAN RESMI
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <a href="https://twitter.com/queryindo" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>X (Twitter) @queryindo</a>
                <a href="https://instagram.com/queryindo" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>Instagram @queryindo</a>
                <a href="https://linkedin.com/company/queryindo" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>LinkedIn QueryIndo</a>
                <a href="https://youtube.com/@queryindo" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none' }}>YouTube Official</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
