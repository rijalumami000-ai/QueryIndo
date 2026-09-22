import type { Article } from '../types/news';
import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { Toast } from '../utils/toast';
import type { ReadingHistoryItem } from '../utils/helpers';

export class BookmarksModal {
  private static activeSavedTab: 'bookmarks' | 'history' = 'bookmarks';

  public static open(): void {
    const bookmarksModal = document.getElementById('bookmarks-modal');
    if (!bookmarksModal) return;
    window.dispatchEvent(new CustomEvent('modal-opened'));
    this.render();
    bookmarksModal.classList.add('open');
  }

  public static close(): void {
    const bookmarksModal = document.getElementById('bookmarks-modal');
    if (!bookmarksModal) return;
    bookmarksModal.classList.remove('open');
    window.dispatchEvent(new CustomEvent('modal-closed'));
  }

  public static render(): void {
    const bookmarksListContainer = document.getElementById('bookmarks-list-container');
    if (!bookmarksListContainer) return;

    const savedArticles = ArticleService.getArticles().filter(a => store.isBookmarked(a.id));
    const readingHistory: ReadingHistoryItem[] = JSON.parse(localStorage.getItem('byte_reading_history') || '[]');

    bookmarksListContainer.innerHTML = `
      <!-- Tab Switcher -->
      <div class="saved-modal-tabs" style="margin: -1.5rem -1.5rem 1.25rem -1.5rem;">
        <button class="saved-tab-btn ${this.activeSavedTab === 'bookmarks' ? 'active' : ''}" id="tab-btn-bookmarks">
          📌 ${store.preferences.language === 'en' ? 'Saved Articles' : 'Disimpan'} (${savedArticles.length})
        </button>
        <button class="saved-tab-btn ${this.activeSavedTab === 'history' ? 'active' : ''}" id="tab-btn-history">
          ⏱️ ${store.preferences.language === 'en' ? 'Reading History' : 'Riwayat Baca'} (${readingHistory.length})
        </button>
      </div>

      <div id="saved-tab-content">
        ${this.activeSavedTab === 'bookmarks' ? this.renderBookmarksListHTML(savedArticles) : this.renderHistoryListHTML(readingHistory)}
      </div>
    `;

    // Bind Tab Switchers
    bookmarksListContainer.querySelector('#tab-btn-bookmarks')?.addEventListener('click', () => {
      this.activeSavedTab = 'bookmarks';
      this.render();
    });

    bookmarksListContainer.querySelector('#tab-btn-history')?.addEventListener('click', () => {
      this.activeSavedTab = 'history';
      this.render();
    });

    // Bind Clear History
    bookmarksListContainer.querySelector('#btn-clear-history')?.addEventListener('click', () => {
      localStorage.removeItem('byte_reading_history');
      Toast.show(store.preferences.language === 'en' ? 'Reading history cleared.' : 'Riwayat baca berhasil dibersihkan.');
      this.render();
    });

    // Bind Explore button
    bookmarksListContainer.querySelector('#btn-explore-bookmarks')?.addEventListener('click', () => {
      this.close();
      document.getElementById('news-feed-heading')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  private static renderBookmarksListHTML(savedArticles: Article[]): string {
    const lang = store.preferences.language;
    if (savedArticles.length === 0) {
      return `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.35rem 0;">${lang === 'en' ? 'No Bookmarked Articles' : 'Belum Ada Artikel Tersimpan'}</h4>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0; line-height: 1.5; max-width: 260px;">${lang === 'en' ? 'Save interesting tech stories to read anytime.' : 'Simpan artikel berita menarik untuk dibaca kapan saja.'}</p>
          </div>
          <button id="btn-explore-bookmarks" style="padding: 0.5rem 1.25rem; background: var(--gradient-brand); color: #000; font-weight: 800; font-size: 0.8rem; border-radius: var(--radius-full); border: none; cursor: pointer;">
            ${lang === 'en' ? 'Explore Trending Stories →' : 'Eksplor Berita Terbaru →'}
          </button>
        </div>
      `;
    }

    return savedArticles.map(art => `
      <div style="display: flex; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--border-color); align-items: center;">
        <img src="${art.imageUrl}" alt="${art.title}" style="width: 70px; height: 50px; border-radius: 8px; object-fit: cover;" />
        <div style="flex: 1;">
          <h4 style="font-size: 0.875rem; font-weight: 700; cursor: pointer; color: var(--text-primary);" onclick="window.openArticleReaderFromOutside('${art.id}')">${art.title}</h4>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${art.category.toUpperCase()} • ${art.readTimeMinutes}m ${lang === 'en' ? 'read' : 'baca'}</span>
        </div>
        <button style="color: var(--accent-rose); font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; background: none;" onclick="window.removeBookmarkFromOutside('${art.id}')">${lang === 'en' ? 'Remove' : 'Hapus'}</button>
      </div>
    `).join('');
  }

  private static renderHistoryListHTML(readingHistory: ReadingHistoryItem[]): string {
    const lang = store.preferences.language;
    if (readingHistory.length === 0) {
      return `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.35rem 0;">${lang === 'en' ? 'No Reading History' : 'Belum Ada Riwayat Baca'}</h4>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0; line-height: 1.5; max-width: 260px;">${lang === 'en' ? 'Articles you open will automatically appear here.' : 'Artikel yang Anda buka akan tercatat otomatis di sini.'}</p>
          </div>
        </div>
      `;
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
        <span style="font-size: 0.775rem; color: var(--text-muted); font-family: var(--font-mono);">${readingHistory.length} ${lang === 'en' ? 'articles read' : 'artikel dibaca'}</span>
        <button id="btn-clear-history" style="font-size: 0.75rem; color: var(--accent-rose); background: none; border: none; cursor: pointer; font-weight: 700;">
          🗑️ ${lang === 'en' ? 'Clear History' : 'Bersihkan Riwayat'}
        </button>
      </div>
      ${readingHistory.map(item => `
        <div class="history-item-card" onclick="window.openArticleReaderFromOutside('${item.articleId}')">
          <div style="flex: 1;">
            <div class="history-item-title">${item.title}</div>
            <div class="history-item-meta">
              <span>${item.category.toUpperCase()}</span>
              <span>•</span>
              <span>${new Date(item.readAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <img src="${item.imageUrl}" alt="${item.title}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;" />
        </div>
      `).join('')}
    `;
  }
}

(window as any).openArticleReaderFromOutside = (articleId: string) => {
  BookmarksModal.close();
  Router.navigateToArticle(articleId);
};

(window as any).removeBookmarkFromOutside = (articleId: string) => {
  store.toggleBookmark(articleId);
  BookmarksModal.render();
};
