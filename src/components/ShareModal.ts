import type { Article } from '../types/news';
import { Toast } from '../utils/toast';

export class ShareModal {
  public static async shareArticle(article: Article, lang: 'id' | 'en' = 'id') {
    const url = window.location.href;
    const title = article.title;
    const summary = article.subtitle || article.title;

    // 1. Try Native Mobile Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: summary,
          url
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User canceled share sheet
      }
    }

    // 2. Desktop Fallback Share Modal
    this.openModal(article, url, lang);
  }

  public static openModal(article: Article, url: string, lang: 'id' | 'en') {
    const existing = document.getElementById('byte-share-modal-overlay');
    if (existing) existing.remove();

    const title = article.title;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title} — Baca di QUERYINDO:`);
    const fullWaText = encodeURIComponent(`*${title}*\n\n${article.subtitle}\n\nBaca selengkapnya di QUERYINDO:\n${url}`);

    const shareLinks = {
      whatsapp: `https://api.whatsapp.com/send?text=${fullWaText}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title + ' via @QUERYINDO')}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    const overlay = document.createElement('div');
    overlay.id = 'byte-share-modal-overlay';
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '5500';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 480px; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); border: 1px solid var(--border-color); background: var(--bg-secondary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 2rem; height: 2rem; border-radius: 50%; background: rgba(0, 242, 254, 0.15); color: var(--accent-cyan); display: flex; align-items: center; justify-content: center; font-size: 1rem;">
              🚀
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 0;">
              ${lang === 'en' ? 'Share Story' : 'Bagikan Artikel Berita'}
            </h3>
          </div>
          <button id="btn-close-share-modal" class="btn-close" style="padding: 0.25rem 0.5rem; cursor: pointer;">✕</button>
        </div>

        <!-- Article Preview Card in Modal -->
        <div style="display: flex; gap: 0.75rem; padding: 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 1.5rem; align-items: center;">
          <img src="${article.imageUrl}" alt="${article.title}" style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;" />
          <div style="flex: 1;">
            <span class="tag-badge" style="font-size: 0.65rem; margin-bottom: 0.2rem; display: inline-block;">${article.category.toUpperCase()}</span>
            <h4 style="font-size: 0.825rem; font-weight: 700; color: var(--text-primary); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
              ${article.title}
            </h4>
          </div>
        </div>

        <!-- Social Media 1-Click Buttons Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
          <!-- WhatsApp -->
          <a href="${shareLinks.whatsapp}" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-decoration: none; padding: 0.75rem 0.5rem; background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3); border-radius: var(--radius-md); color: #25D366; font-size: 0.75rem; font-weight: 700; transition: transform 0.2s ease;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>WhatsApp</span>
          </a>

          <!-- Telegram -->
          <a href="${shareLinks.telegram}" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-decoration: none; padding: 0.75rem 0.5rem; background: rgba(0, 136, 204, 0.1); border: 1px solid rgba(0, 136, 204, 0.3); border-radius: var(--radius-md); color: #0088cc; font-size: 0.75rem; font-weight: 700; transition: transform 0.2s ease;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            <span>Telegram</span>
          </a>

          <!-- X / Twitter -->
          <a href="${shareLinks.twitter}" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-decoration: none; padding: 0.75rem 0.5rem; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.75rem; font-weight: 700; transition: transform 0.2s ease;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>X (Twitter)</span>
          </a>

          <!-- LinkedIn -->
          <a href="${shareLinks.linkedin}" target="_blank" rel="noopener noreferrer" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-decoration: none; padding: 0.75rem 0.5rem; background: rgba(10, 102, 194, 0.1); border: 1px solid rgba(10, 102, 194, 0.3); border-radius: var(--radius-md); color: #0a66c2; font-size: 0.75rem; font-weight: 700; transition: transform 0.2s ease;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            <span>LinkedIn</span>
          </a>
        </div>

        <!-- Copy Direct URL Bar -->
        <div style="display: flex; gap: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 0.3rem 0.4rem 0.3rem 1rem; align-items: center;">
          <span style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
            ${url}
          </span>
          <button id="btn-copy-share-link" style="padding: 0.5rem 1.25rem; background: var(--accent-cyan); color: #000; font-weight: 800; font-size: 0.8rem; border-radius: var(--radius-full); border: none; cursor: pointer; white-space: nowrap;">
            ${lang === 'en' ? 'Copy Link' : 'Salin Tautan'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btn-close-share-modal')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#btn-copy-share-link')?.addEventListener('click', () => {
      navigator.clipboard.writeText(url);
      Toast.show(lang === 'en' ? 'Article link copied to clipboard!' : 'Tautan artikel berhasil disalin!');
      overlay.remove();
    });
  }
}
