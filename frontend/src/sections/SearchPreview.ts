import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { escapeHtml } from '../utils/helpers';
import { FeedSection } from './FeedSection';

export class SearchPreview {
  private static activeSearchIndex: number = -1;

  public static highlightMatch(text: string, query: string): string {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  public static render(query: string): void {
    const searchPreviewDropdown = document.getElementById('search-preview-dropdown');
    if (!searchPreviewDropdown) return;
    const trimmed = query.trim().toLowerCase();
    
    if (!trimmed) {
      this.close();
      return;
    }

    let articles = ArticleService.getArticles();
    if ((!articles || articles.length === 0) && typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_ARTICLES__)) {
      articles = (window as any).__INITIAL_ARTICLES__;
    }

    // Fallback to DOM article cards if memory list is still loading
    if ((!articles || articles.length === 0) && typeof document !== 'undefined') {
      const cards = document.querySelectorAll('.article-card[data-slug]');
      if (cards.length > 0) {
        articles = Array.from(cards).map(c => ({
          id: c.getAttribute('data-slug') || '',
          slug: c.getAttribute('data-slug') || '',
          title: c.querySelector('.article-title')?.textContent?.trim() || '',
          subtitle: '',
          category: c.getAttribute('data-category') || 'Berita',
          readTimeMinutes: 3,
          imageUrl: c.querySelector('img')?.src || '/logo-brand.svg',
          tags: []
        } as any));
      }
    }

    const matches = (articles || []).filter(art => {
      if (!art || !art.title) return false;
      const t = art.title.toLowerCase();
      const s = (art.subtitle || '').toLowerCase();
      const cat = (art.category || '').toLowerCase();
      const tags = Array.isArray(art.tags) ? art.tags.join(' ').toLowerCase() : '';
      return t.includes(trimmed) || s.includes(trimmed) || cat.includes(trimmed) || tags.includes(trimmed);
    });

    const lang = store.preferences.language;

    if (matches.length === 0) {
      searchPreviewDropdown.innerHTML = `
        <div class="search-preview-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:0.4rem; opacity:0.6;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p style="margin: 0; font-size: 0.85rem; font-weight: 600;">${lang === 'en' ? `No articles found for "${escapeHtml(query)}"` : `Tidak ditemukan berita untuk "${escapeHtml(query)}"`}</p>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${lang === 'en' ? 'Try keywords like AI, Apple, Startup, Cyber' : 'Coba kata kunci lain seperti: AI, Apple, Startup, Cyber'}</span>
        </div>
      `;
      searchPreviewDropdown.style.display = 'block';
      return;
    }

    const topMatches = matches.slice(0, 5);

    searchPreviewDropdown.innerHTML = `
      <div class="search-preview-header">
        <span>${lang === 'en' ? 'Quick Article Preview' : 'Pratinjau Berita Terkait'}</span>
        <span>${matches.length} ${lang === 'en' ? 'articles found' : 'berita ditemukan'}</span>
      </div>
      <div class="search-preview-list" id="search-preview-items-list">
        ${topMatches.map((art, idx) => `
          <div class="search-preview-item ${idx === this.activeSearchIndex ? 'active' : ''}" data-art-id="${art.id}" data-art-slug="${art.slug || ''}" data-art-title="${escapeHtml(art.title)}" data-item-idx="${idx}">
            <img src="${art.imageUrl || '/logo-brand.svg'}" alt="${escapeHtml(art.title)}" class="search-preview-thumb" onerror="this.onerror=null;this.src='/logo-brand.svg';" />
            <div class="search-preview-info">
              <div class="search-preview-meta">
                <span class="search-preview-tag">${(art.category || 'BERITA').toUpperCase()}</span>
                <span>•</span>
                <span>${art.readTimeMinutes || 3} min ${lang === 'en' ? 'read' : 'baca'}</span>
              </div>
              <div class="search-preview-title">${this.highlightMatch(art.title, query)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="search-preview-footer">
        <button type="button" class="search-preview-all-btn" id="btn-see-all-search">
          ${lang === 'en' ? `View all ${matches.length} results for "${escapeHtml(query)}" →` : `Lihat semua ${matches.length} hasil untuk "${escapeHtml(query)}" →`}
        </button>
      </div>
    `;

    searchPreviewDropdown.style.display = 'block';

    // Bind item clicks
    searchPreviewDropdown.querySelectorAll('.search-preview-item').forEach(item => {
      item.addEventListener('click', () => {
        const artId = item.getAttribute('data-art-id');
        const artSlug = item.getAttribute('data-art-slug');
        const artTitle = item.getAttribute('data-art-title');
        if (artId) {
          this.close();
          const searchBar = document.getElementById('search-overlay-bar');
          if (searchBar) searchBar.style.display = 'none';

          const targetSlug = artSlug || artId;
          if (targetSlug) {
            window.location.href = `/berita/${targetSlug}`;
          }
        }
      });
    });

    // Bind see all button
    searchPreviewDropdown.querySelector('#btn-see-all-search')?.addEventListener('click', () => {
      this.close();
      const searchBar = document.getElementById('search-overlay-bar');
      if (searchBar) searchBar.style.display = 'none';
      FeedSection.render();
      document.getElementById('news-feed-heading')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  public static handleKeyNavigation(e: KeyboardEvent): void {
    const searchPreviewDropdown = document.getElementById('search-preview-dropdown');
    if (!searchPreviewDropdown || searchPreviewDropdown.style.display === 'none') return;
    const items = searchPreviewDropdown.querySelectorAll('.search-preview-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeSearchIndex = (this.activeSearchIndex + 1) % items.length;
      items.forEach((item, idx) => item.classList.toggle('active', idx === this.activeSearchIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeSearchIndex = (this.activeSearchIndex - 1 + items.length) % items.length;
      items.forEach((item, idx) => item.classList.toggle('active', idx === this.activeSearchIndex));
    } else if (e.key === 'Enter') {
      if (this.activeSearchIndex >= 0 && this.activeSearchIndex < items.length) {
        e.preventDefault();
        const activeItem = items[this.activeSearchIndex] as HTMLElement;
        const artId = activeItem.getAttribute('data-art-id');
        const artSlug = activeItem.getAttribute('data-art-slug');
        const artTitle = activeItem.getAttribute('data-art-title');
        if (artId) {
          this.close();
          const searchBar = document.getElementById('search-overlay-bar');
          if (searchBar) searchBar.style.display = 'none';
          const targetSlug = artSlug || artId;
          if (targetSlug) {
            window.location.href = `/berita/${targetSlug}`;
          }
        }
      } else {
        this.close();
      }
    } else if (e.key === 'Escape') {
      this.close();
    }
  }

  public static close(): void {
    const searchPreviewDropdown = document.getElementById('search-preview-dropdown');
    if (searchPreviewDropdown) {
      searchPreviewDropdown.style.display = 'none';
      searchPreviewDropdown.innerHTML = '';
      this.activeSearchIndex = -1;
    }
  }
}
