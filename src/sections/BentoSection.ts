import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner } from '../components/AdBanner';
import { ShoppingCarousel } from '../components/ShoppingCarousel';
import { escapeHtml, formatDate, calculateReadTime, getSafeImageUrl, IMG_ONERROR } from '../utils/helpers';
import type { Article } from '../types/news';

export class BentoSection {
  public static renderBillboardAd(): void {
    const container = document.getElementById('top-billboard-ad-container');
    if (!container) return;
    container.innerHTML = AdBanner.renderBillboardHTML();
    AdBanner.bindAdEvents(container);
  }

  public static renderMidstreamAd(): void {
    const container = document.getElementById('midstream-ad-container');
    if (!container) return;
    container.innerHTML = AdBanner.renderMidstreamHTML();
    AdBanner.bindAdEvents(container);
  }

  public static renderShoppingCarousel(): void {
    const container = document.getElementById('shopping-carousel-container');
    if (!container) return;
    container.innerHTML = ShoppingCarousel.renderWidgetHTML();
    ShoppingCarousel.bindEvents(container);
  }

  public static render(): void {
    const container = document.getElementById('editors-pick-container');
    if (!container) return;
    const section = container.closest('section') as HTMLElement;

    const articles = ArticleService.getArticles();
    const featured = articles.find(a => a.id === 'art-008') || articles[1] || articles[0];
    if (!featured) {
      if (section) section.style.display = 'none';
      container.innerHTML = '';
      return;
    }
    if (section) section.style.display = '';

    const stackedArticles = [
      articles.find(a => a.id === 'art-002'),
      articles.find(a => a.id === 'art-005')
    ].filter(Boolean) as Article[];

    container.innerHTML = `
      <!-- Bento Large Featured Card (60%) -->
      <article class="bento-featured-card" data-article-id="${featured.id}" data-article-slug="${featured.slug || ''}" data-article-title="${escapeHtml(featured.title)}">
        <div class="bento-featured-img-wrap">
          <img src="${getSafeImageUrl(featured.imageUrl)}" alt="${escapeHtml(featured.title)}" class="bento-featured-img" loading="lazy" ${IMG_ONERROR} />
        </div>
        <div class="bento-featured-overlay"></div>
        <div class="bento-featured-body">
          <div class="bento-badges">
            <span class="bento-tag bento-tag-curated">${store.preferences.language === 'en' ? 'SPECIAL REPORT' : 'LAPORAN KHUSUS'}</span>
            <span class="bento-tag bento-tag-cat">${featured.category.toUpperCase()}</span>
          </div>
          <h3 class="bento-featured-title">${featured.title}</h3>
          <p class="bento-featured-excerpt">${featured.subtitle}</p>
          <div class="bento-meta-row">
            <div class="bento-author">
              <img src="${featured.author.avatar}" alt="${featured.author.name}" />
              <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                ${featured.author.name}
                ${ImageUtils.getVerifiedBadgeHTML(14, 'Redaksi Terverifikasi')}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span>${formatDate(featured.publishedAt, store.preferences.language)}</span>
              <span>•</span>
              <span>${calculateReadTime(featured.content, featured.readTimeMinutes)} ${store.preferences.language === 'en' ? 'min read' : 'menit baca'}</span>
            </div>
          </div>
        </div>
      </article>

      <!-- Bento Stacked Side Cards (40%) -->
      <div class="bento-stacked-col">
        ${stackedArticles.map(art => {
          const isBookmarked = store.isBookmarked(art.id);
          return `
            <article class="bento-stacked-card" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}">
              <div class="bento-stacked-img-wrap">
                <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="bento-stacked-img" loading="lazy" ${IMG_ONERROR} />
              </div>
              <div class="bento-stacked-body">
                <div>
                  <span class="bento-tag bento-tag-cat" style="font-size:0.6rem; padding:0.15rem 0.4rem; margin-bottom:0.35rem; display:inline-block;">${art.category.toUpperCase()}</span>
                  <h4 class="bento-stacked-title">${art.title}</h4>
                </div>
                <div class="bento-stacked-meta">
                  <span style="display: inline-flex; align-items: center; gap: 0.2rem;">
                    ${art.author.name}
                    ${ImageUtils.getVerifiedBadgeHTML(12, 'Jurnalis Terverifikasi')}
                  </span>
                  <span>•</span>
                  <span>${calculateReadTime(art.content, art.readTimeMinutes)}m baca</span>
                  <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-bookmark-id="${art.id}" title="${store.t('bookmarkBtn')}" style="margin-left: auto;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    // Bind click handlers
    container.querySelectorAll('[data-article-id]').forEach(card => {
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
}
