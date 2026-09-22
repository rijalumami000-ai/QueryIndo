import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';

interface Props {
  articleId: string;
  articleTitle?: string;
}

export default function BookmarkButton({ articleId, articleTitle }: Props) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('queryindo_bookmarks') || '[]');
      setIsSaved(saved.includes(articleId));
    } catch {
      // Ignore storage error
    }
  }, [articleId]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('queryindo_bookmarks') || '[]');
      let updated: string[];
      if (saved.includes(articleId)) {
        updated = saved.filter(id => id !== articleId);
        setIsSaved(false);
      } else {
        updated = [...saved, articleId];
        setIsSaved(true);
      }
      localStorage.setItem('queryindo_bookmarks', JSON.stringify(updated));
    } catch (err) {
      console.error('Gagal menyimpan bookmark:', err);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`btn-action-bookmark ${isSaved ? 'active' : ''}`}
      style={{
        background: isSaved ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
        border: '1px solid ' + (isSaved ? 'var(--brand-cyan, #00f2fe)' : 'var(--border-color, rgba(255,255,255,0.15))'),
        color: isSaved ? 'var(--brand-cyan, #00f2fe)' : 'var(--text-secondary, #94a3b8)',
        borderRadius: '6px',
        padding: '6px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      title={isSaved ? 'Hapus dari simpanan' : 'Simpan artikel untuk dibaca nanti'}
      aria-label="Simpan Artikel"
    >
      <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
      <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
    </button>
  );
}
