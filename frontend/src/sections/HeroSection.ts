import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { ImageUtils } from '../utils/imageUtils';
import { escapeHtml, formatDate, calculateReadTime, getSafeImageUrl, IMG_ONERROR } from '../utils/helpers';

export class HeroSection {
  public static renderBreakingBanner(): void {
    // Breaking banner removed in unified header design
  }

  public static render(): void {
    const featuredArticleContainer = document.getElementById('featured-article-container');
    const trendingArticlesContainer = document.getElementById('trending-articles-container');
    const trendingHeader = document.getElementById('trending-title-header');
    if (trendingHeader) trendingHeader.textContent = store.t('trendingTitle');

    const articles = ArticleService.getArticles();
    const featuredArticle = articles.find(a => a.isFeatured) || articles[0];

    if (!featuredArticle) {
      if (featuredArticleContainer) {
        featuredArticleContainer.innerHTML = `
          <div style="padding: 3.5rem 1.5rem; text-align: center; background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); color: var(--text-muted);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; opacity: 0.7;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;">${store.preferences.language === 'en' ? 'No Articles Published Yet' : 'Belum Ada Artikel Berita'}</h3>
            <p style="font-size: 0.875rem;">${store.preferences.language === 'en' ? 'Publish articles through Admin CMS to feature them here.' : 'Seluruh artikel dummy telah dibersihkan. Terbitkan berita resmi melalui Manajer Publikasi Admin CMS.'}</p>
          </div>
        `;
      }
      if (trendingArticlesContainer) {
        trendingArticlesContainer.innerHTML = `
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            ${store.preferences.language === 'en' ? 'No trending stories.' : 'Belum ada tren berita.'}
          </div>
        `;
      }
      return;
    }

    if (featuredArticleContainer) {
      featuredArticleContainer.innerHTML = `
        <article class="hero-card" data-article-id="${featuredArticle.id}" data-article-slug="${featuredArticle.slug || ''}" data-article-title="${escapeHtml(featuredArticle.title)}">
          <div class="hero-img-wrapper">
            <img src="${getSafeImageUrl(featuredArticle.imageUrl)}" alt="${escapeHtml(featuredArticle.title)}" class="hero-img" loading="eager" fetchpriority="high" decoding="async" ${IMG_ONERROR} />
            <div class="hero-overlay"></div>
          </div>
          <div class="hero-content">
            <div class="badge-group">
              <span class="tag-badge badge-ai">${store.preferences.language === 'en' ? 'HEADLINE' : 'BERITA UTAMA'}</span>
              <span class="tag-badge">${featuredArticle.category.toUpperCase()}</span>
            </div>
            <h1 class="hero-title">${featuredArticle.title}</h1>
            <p class="hero-subtitle">${featuredArticle.subtitle}</p>
            <div class="meta-row">
              <div class="meta-author">
                <img src="${featuredArticle.author.avatar}" alt="${featuredArticle.author.name}" class="author-avatar" loading="lazy" decoding="async" />
                <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                  ${featuredArticle.author.name}
                  ${ImageUtils.getVerifiedBadgeHTML(15, 'Founder & Pemimpin Redaksi Terverifikasi')}
                </span>
              </div>
              <span>•</span>
              <span>${formatDate(featuredArticle.publishedAt, store.preferences.language)}</span>
              <span>•</span>
              <span>${store.t('readTime').replace('{min}', String(calculateReadTime(featuredArticle.content, featuredArticle.readTimeMinutes)))}</span>
            </div>
          </div>
        </article>
      `;

      featuredArticleContainer.querySelector('.hero-card')?.addEventListener('click', () => {
        Router.navigateToArticle(featuredArticle.slug || featuredArticle.id, featuredArticle.title);
      });
    }

    // Render Sidebar Trending
    if (trendingArticlesContainer) {
      let trendingArticles = articles.filter(a => a.isTrending && a.id !== featuredArticle.id).slice(0, 4);
      if (trendingArticles.length === 0) {
        trendingArticles = articles.filter(a => a.id !== featuredArticle.id).slice(0, 4);
      }
      trendingArticlesContainer.innerHTML = trendingArticles.map((art, idx) => `
        <div class="trending-item" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}">
          <div class="trending-num">0${idx + 1}</div>
          <div class="trending-info">
            <h3 class="trending-item-title">${art.title}</h3>
            <div class="trending-meta">
              <span style="display: inline-flex; align-items: center; gap: 0.2rem;">
                ${art.author.name}
                ${ImageUtils.getVerifiedBadgeHTML(13, 'Jurnalis Terverifikasi')}
              </span>
              <span>•</span>
              <span>${art.viewsCount >= 1000 ? (art.viewsCount / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : (art.viewsCount || 0)} ${store.preferences.language === 'en' ? 'Readers' : 'Pembaca'}</span>
            </div>
          </div>
        </div>
      `).join('');

      trendingArticlesContainer.querySelectorAll('.trending-item').forEach(item => {
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
  }
}
