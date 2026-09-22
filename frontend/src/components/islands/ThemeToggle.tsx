import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark';
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('queryindo_theme', next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-theme-toggle"
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: '8px',
        width: '36px',
        height: '36px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-primary, #ffffff)',
        transition: 'all 0.2s ease'
      }}
      title={`Beralih ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
      aria-label="Ganti Tema"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
