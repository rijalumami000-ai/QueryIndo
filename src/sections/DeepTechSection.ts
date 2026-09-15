import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner } from '../components/AdBanner';
import { escapeHtml, calculateReadTime, getSafeImageUrl, IMG_ONERROR } from '../utils/helpers';
import type { Article } from '../types/news';

export class DeepTechSection {
  public static render(): void {
    this.renderDeepTechMatrix();
    this.renderRapidWire();
  }

  public static renderDeepTechMatrix(): void {
    const container = document.getElementById('deep-tech-matrix-container');
    if (!container) return;

    const articles = ArticleService.getArticles();
    const targetIds = ['art-009', 'art-004', 'art-010', 'art-018'];
    let matrixArticles = targetIds.map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];
    if (matrixArticles.length < 4) {
      matrixArticles = articles.filter(a => a.category === 'ai' || a.category === 'developer' || a.category === 'cybersecurity' || a.category === 'telecom').slice(0, 4);
    }

    const section = container.closest('section') as HTMLElement;
    if (matrixArticles.length === 0) {
      if (section) section.style.display = 'none';
      container.innerHTML = '';
      return;
    }
    if (section) section.style.display = '';

    container.innerHTML = matrixArticles.map(art => {
      const isBookmarked = store.isBookmarked(art.id);
      return `
        <article class="matrix-card" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}">
          <div class="matrix-card-img-wrap">
            <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="matrix-card-img" loading="lazy" ${IMG_ONERROR} />
            <span class="matrix-badge-cat">${art.category.toUpperCase()}</span>
          </div>
          <div class="matrix-card-body">
            <h4 class="matrix-card-title">${art.title}</h4>
            <div class="matrix-card-footer">
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <img src="${art.author.avatar}" alt="${art.author.name}" style="width: 1.25rem; height: 1.25rem; border-radius: 50%; object-fit: cover;" />
                <span style="font-size: 0.72rem; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 0.2rem;">
                  ${art.author.name}
                  ${ImageUtils.getVerifiedBadgeHTML(12, 'Jurnalis Terverifikasi')}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${calculateReadTime(art.content, art.readTimeMinutes)}m baca</span>
                <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-bookmark-id="${art.id}" title="${store.t('bookmarkBtn')}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    container.querySelectorAll('.matrix-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-bookmark')) return;
        const id = card.getAttribute('data-article-id');
        const slug = card.getAttribute('data-article-slug');
        const title = card.getAttribute('data-article-title');
        if (id) {
          Router.navigateToArticle(slug || id, title || undefined);
        }
      });
    });

    container.querySelectorAll('.btn-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).getAttribute('data-bookmark-id');
        if (id) {
          const isNowSaved = store.toggleBookmark(id);
          btn.classList.toggle('active', isNowSaved);
          btn.querySelector('svg')?.setAttribute('fill', isNowSaved ? 'currentColor' : 'none');
        }
      });
    });
  }

  public static renderRapidWire(): void {
    const wireContainer = document.getElementById('rapid-wire-container');
    const radarContainer = document.getElementById('radar-product-container');
    const adContainer = document.getElementById('wire-sidebar-ad-container');

    if (wireContainer) {
      const articles = ArticleService.getArticles();
      const wireIds = ['art-017', 'art-016', 'art-013', 'art-007'];
      let wireArticles = wireIds.map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];
      if (wireArticles.length < 4) {
        wireArticles = articles.slice(4, 8);
      }

      const timePills = store.preferences.language === 'en'
        ? ['12 MIN AGO', '34 MIN AGO', '1 HOUR AGO', '2 HOURS AGO']
        : ['12 MENIT LALU', '34 MENIT LALU', '1 JAM LALU', '2 JAM LALU'];

      wireContainer.innerHTML = wireArticles.map((art, idx) => `
        <div class="wire-item" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}">
          <span class="wire-time-pill">${timePills[idx] || 'TERKINI'}</span>
          <div class="wire-item-body">
            <h4 class="wire-item-title">${art.title}</h4>
            <p class="wire-item-desc">${art.subtitle}</p>
          </div>
        </div>
      `).join('');

      wireContainer.querySelectorAll('.wire-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-article-id');
          const slug = item.getAttribute('data-article-slug');
          const title = item.getAttribute('data-article-title');
          if (id) {
            Router.navigateToArticle(slug || id, title || undefined);
          }
        });
      });
    }

    if (radarContainer) {
      const articles = ArticleService.getArticles();
      const radarArt = articles.find(a => a.id === 'art-015') || articles[6] || articles[0];
      if (radarArt) {
        radarContainer.innerHTML = `
        <article class="radar-spotlight-card" data-article-id="${radarArt.id}" data-article-slug="${radarArt.slug || ''}" data-article-title="${escapeHtml(radarArt.title)}">
          <div class="radar-img-wrap">
            <img src="${getSafeImageUrl(radarArt.imageUrl)}" alt="${escapeHtml(radarArt.title)}" class="radar-img" loading="lazy" ${IMG_ONERROR} />
            <span style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(9, 11, 16, 0.85); color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.3);">LAB QUERYINDO</span>
          </div>
          <div class="radar-body">
            <h4 class="radar-title">${radarArt.title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0 0 0.65rem 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${radarArt.subtitle}</p>
            <div class="radar-meta">
              <span style="color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700;">NPU 52 TOPS • 28 Jam</span>
              <span style="color: var(--text-muted);">${radarArt.readTimeMinutes} min baca</span>
            </div>
          </div>
        </article>
        `;

        radarContainer.querySelector('.radar-spotlight-card')?.addEventListener('click', () => {
          Router.navigateToArticle(radarArt.slug || radarArt.id, radarArt.title);
        });
      }
    }

    if (adContainer) {
      adContainer.innerHTML = AdBanner.renderSidebarAdHTML();
      AdBanner.bindAdEvents(adContainer);
    }
  }
}
