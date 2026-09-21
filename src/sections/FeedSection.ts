import { ArticleService } from '../services/articleService';
import { store, CATEGORIES_EN } from '../state/store';
import { Router } from '../router';
import { CATEGORIES, MASTER_TAXONOMY, getSubCategories, findSubCategory, getCategoryById } from '../data/mockNews';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner } from '../components/AdBanner';
import { escapeHtml, calculateReadTime, formatDate, getSafeImageUrl, IMG_ONERROR } from '../utils/helpers';
import type { CategoryId, Article } from '../types/news';

export class FeedSection {
  private static visibleCount = 12;

  public static resetPagination(): void {
    this.visibleCount = 12;
  }

  /**
   * Generates crisp SVG icons for each category.
   */
  public static getCategoryIconSvg(icon: string, size: number = 18): string {
    switch (icon) {
      case 'cpu':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
      case 'smartphone':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
      case 'layout':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`;
      case 'trending-up':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
      case 'coins':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18 6a6 6 0 0 1-5 9.8"/><path d="M12 18a6 6 0 0 0 9-4.8"/></svg>`;
      case 'zap':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
      case 'gamepad-2':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>`;
      case 'shield-alert':
      case 'shield':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      case 'globe':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
      case 'orbit':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a9 9 0 0 0-14.8-6"/><path d="M4.6 9a9 9 0 0 0 14.8 6"/><path d="m21.2 8.4-2.8.6.6 2.8"/><path d="m2.8 15.6 2.8-.6-.6-2.8"/></svg>`;
      case 'leaf':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
      case 'activity':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
      case 'star':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      case 'help-circle':
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      default:
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
    }
  }

  /**
   * Toggles Home-only sections depending on route.
   */
  public static updateLayoutVisibility(): void {
    const isHome = store.currentCategory === 'all' && !store.searchQuery && !store.selectedFilterTag;
    const homeSectionIds = [
      'top-billboard-ad-container',
      'hero-section',
      'editors-pick-section',
      'shopping-carousel-container',
      'midstream-ad-container',
      'deep-tech-matrix-section',
      'rapid-wire-section'
    ];

    homeSectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = isHome ? '' : 'none';
      }
    });
  }

  public static renderCategories(): void {
    // Sync active category state on unified header navbar
    const headerNavLinks = document.querySelectorAll('#header-categories-nav a[data-nav-category]');
    headerNavLinks.forEach(link => {
      const cat = link.getAttribute('data-nav-category');
      link.classList.toggle('active', cat === store.currentCategory);
    });

    const categoryContainer = document.getElementById('category-container');
    if (!categoryContainer) return;
    const lang = store.preferences.language;
    categoryContainer.innerHTML = CATEGORIES.map(cat => `
      <button class="cat-pill ${cat.id === store.currentCategory ? 'active' : ''}" data-category="${cat.id}">
        <span>${lang === 'en' ? (CATEGORIES_EN[cat.id] || cat.name) : cat.name}</span>
      </button>
    `).join('');

    categoryContainer.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const catId = target.getAttribute('data-category') as CategoryId;
        if (catId) {
          this.resetPagination();
          store.currentCategory = catId;
          store.currentSubCategory = null;
          if (catId === 'all') {
            Router.navigateHome();
          } else {
            Router.navigateToCategory(catId);
          }
          this.renderCategories();
          this.renderSubCategories();
          this.render();
          target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
  }

  public static renderSubCategories(): void {
    const subBar = document.getElementById('subcategory-bar');
    const subContainer = document.getElementById('subcategory-container');
    if (!subBar || !subContainer) return;

    if (store.currentCategory === 'all') {
      subBar.style.display = 'none';
      subContainer.innerHTML = '';
      return;
    }

    const subCats = getSubCategories(store.currentCategory);
    if (subCats.length === 0) {
      subBar.style.display = 'none';
      subContainer.innerHTML = '';
      return;
    }

    subBar.style.display = 'block';
    const catObj = CATEGORIES.find(c => c.id === store.currentCategory);
    const allLabel = store.preferences.language === 'en' ? `All ${catObj?.name || 'Category'}` : `Semua ${catObj?.name || 'Kanal'}`;

    subContainer.innerHTML = `
      <button class="subcat-pill ${!store.currentSubCategory ? 'active' : ''}" data-subcategory="all">
        <span>${allLabel}</span>
      </button>
      ${subCats.map(sub => `
        <button class="subcat-pill ${store.currentSubCategory === sub.id || store.currentSubCategory === sub.slug ? 'active' : ''}" data-subcategory="${sub.slug}" title="${sub.description || sub.name}">
          <span>${sub.name}</span>
        </button>
      `).join('')}
    `;

    subContainer.querySelectorAll('.subcat-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const subSlug = target.getAttribute('data-subcategory');
        this.resetPagination();
        if (!subSlug || subSlug === 'all') {
          store.currentSubCategory = null;
          Router.navigateToCategory(store.currentCategory);
        } else {
          store.currentSubCategory = subSlug;
          Router.navigateToSubCategory(store.currentCategory, subSlug);
        }
        FeedSection.renderSubCategories();
        FeedSection.render();
        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });
  }

  public static renderFilterTags(): void {
    const filterTagChips = document.getElementById('filter-tag-chips');
    if (!filterTagChips) return;

    const popularTags = ['AI', 'OpenAI', 'Google', 'Apple', 'NVIDIA', 'Keamanan Siber', 'Startup', 'Telkomsel', 'IKN'];
    filterTagChips.innerHTML = popularTags.map(tag => `
      <button class="tag-chip ${store.selectedFilterTag.toLowerCase() === tag.toLowerCase() ? 'active' : ''}" data-tag="${tag}">
        #${tag}
      </button>
    `).join('');

    filterTagChips.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const tag = (e.currentTarget as HTMLElement).getAttribute('data-tag') || '';
        this.resetPagination();
        if (store.selectedFilterTag.toLowerCase() === tag.toLowerCase()) {
          store.selectedFilterTag = '';
        } else {
          store.selectedFilterTag = tag;
        }
        this.renderFilterTags();
        this.render();
      });
    });
  }

  /**
   * Main Render Entrypoint
   */
  public static render(): void {
    const articlesGrid = document.getElementById('articles-grid');
    const feedTitle = document.getElementById('feed-title');
    const resultsCount = document.getElementById('results-count');
    const loadMoreContainer = document.getElementById('feed-load-more-container');
    if (!articlesGrid) return;

    // Update section visibility (Home vs Category vs Search)
    this.updateLayoutVisibility();

    // Render Dynamic Leaderboard Ad Banner
    const leaderboardAdContainer = document.getElementById('leaderboard-ad-container');
    if (leaderboardAdContainer) {
      leaderboardAdContainer.innerHTML = AdBanner.renderLeaderboardHTML();
      AdBanner.bindAdEvents(leaderboardAdContainer);
    }

    const isHome = store.currentCategory === 'all' && !store.searchQuery && !store.selectedFilterTag;
    const isCategoryHub = store.currentCategory !== 'all' && !store.currentSubCategory && !store.searchQuery && !store.selectedFilterTag;

    // 1. Case A: HOME VIEW -> 14 Channel Editorial Matrix (Max 10 articles per category)
    if (isHome) {
      if (feedTitle) {
        feedTitle.innerHTML = store.preferences.language === 'en'
          ? `Editorial Channel Matrix <span style="opacity:0.4; font-weight:400;">/</span> <span style="color:var(--accent-cyan); font-size:1rem; font-weight:700;">14 Tech Channels</span>`
          : `Eksplorasi Seluruh Kanal Berita <span style="opacity:0.4; font-weight:400;">/</span> <span style="color:var(--accent-cyan); font-size:1rem; font-weight:700;">14 Kanal Teknologi</span>`;
      }
      if (resultsCount) {
        const totalArts = ArticleService.getArticles().length;
        resultsCount.textContent = store.preferences.language === 'en'
          ? `${totalArts} Curated Stories Across 14 Channels`
          : `${totalArts} Berita Terkurasi di 14 Kanal`;
      }
      if (loadMoreContainer) loadMoreContainer.innerHTML = '';

      this.renderHomeCategoryMatrix(articlesGrid);
      this.bindMatrixEvents(articlesGrid);
      return;
    }

    // 2. Case B: CATEGORY HUB VIEW -> Sub-Category Matrix Blocks
    if (isCategoryHub) {
      const catObj = getCategoryById(store.currentCategory);
      const catName = catObj ? (store.preferences.language === 'en' ? (CATEGORIES_EN[catObj.id] || catObj.name) : catObj.name) : 'Kanal Teknologi';
      if (feedTitle) {
        feedTitle.innerHTML = `${catName} <span style="opacity:0.4; font-weight:400;">/</span> <span style="color:var(--accent-cyan); font-size:1rem; font-weight:700;">Direktori Sub-Kanal</span>`;
      }
      if (resultsCount) {
        const catArtsCount = ArticleService.getArticles().filter(a => a.category.toLowerCase() === store.currentCategory.toLowerCase()).length;
        resultsCount.textContent = store.preferences.language === 'en'
          ? `${catArtsCount} Stories in this Channel`
          : `${catArtsCount} Berita dalam Kanal Ini`;
      }
      if (loadMoreContainer) loadMoreContainer.innerHTML = '';

      this.renderCategorySubCategoryMatrix(articlesGrid, store.currentCategory);
      this.bindMatrixEvents(articlesGrid);
      return;
    }

    // 3. Case C: SUBCATEGORY ARCHIVE OR SEARCH RESULTS -> Standard Single Grid Feed
    this.renderSingleGridFeed(articlesGrid, feedTitle, resultsCount, loadMoreContainer);
    this.bindStandardGridEvents(articlesGrid);
  }

  /**
   * Renders the 14 Channel Matrix Blocks on Home Page
   */
  private static renderHomeCategoryMatrix(container: HTMLElement): void {
    const allArticles = ArticleService.getArticles();
    const categories14 = CATEGORIES.filter(c => c.id !== 'all');
    const lang = store.preferences.language;

    let html = `<div class="category-matrix-container">`;

    categories14.forEach((cat, index) => {
      // Get up to 10 articles for this category
      const catArticles = allArticles
        .filter(a => a.category.toLowerCase() === cat.id.toLowerCase())
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 10);

      const catName = lang === 'en' ? (CATEGORIES_EN[cat.id] || cat.name) : cat.name;
      const subCats = MASTER_TAXONOMY[cat.id] || [];
      const topSubCats = subCats.slice(0, 4);

      html += `
        <section class="category-matrix-block" data-matrix-category="${cat.id}">
          <!-- Section Header -->
          <div class="matrix-block-header">
            <div class="matrix-header-left">
              <div class="matrix-channel-badge">
                ${this.getCategoryIconSvg(cat.icon, 20)}
              </div>
              <div class="matrix-title-group">
                <h3 class="matrix-channel-title">
                  <a href="/kategori/${cat.id}" data-category-link="${cat.id}">
                    ${catName}
                  </a>
                </h3>
                <span class="matrix-channel-desc">${cat.description || 'Liputan mendalam seputar ' + catName}</span>
              </div>
            </div>
            <div class="matrix-header-right">
              ${topSubCats.length > 0 ? `
                <div class="matrix-subcat-pills">
                  ${topSubCats.map(sub => `
                    <a href="/${cat.id}/${sub.slug}" class="matrix-subcat-pill" data-subcat-cat="${cat.id}" data-subcat-slug="${sub.slug}">
                      ${sub.name}
                    </a>
                  `).join('')}
                </div>
              ` : ''}
              <a href="/kategori/${cat.id}" class="matrix-view-all-btn" data-category-link="${cat.id}">
                <span>${lang === 'en' ? 'Explore Channel' : 'Lihat Semua'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            </div>
          </div>

          <!-- Editorial Grid / Bento / List Layout -->
          ${this.renderMatrixArticlesHTML(catArticles, cat.id, catName)}
        </section>
      `;

      // Insert Midstream In-Feed Ad Banner periodically
      if ((index === 2 || index === 6) && AdBanner) {
        const adHtml = AdBanner.renderInFeedAdHTML();
        if (adHtml) {
          html += `<div class="matrix-ad-strip" style="margin: 2rem 0;">${adHtml}</div>`;
        }
      }
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  /**
   * Renders Sub-Category Matrix Blocks for a specific Channel Page
   */
  private static renderCategorySubCategoryMatrix(container: HTMLElement, categoryId: string): void {
    const allArticles = ArticleService.getArticles();
    const catObj = getCategoryById(categoryId);
    const lang = store.preferences.language;
    const catName = catObj ? (lang === 'en' ? (CATEGORIES_EN[catObj.id] || catObj.name) : catObj.name) : categoryId;
    const subCats = MASTER_TAXONOMY[categoryId] || [];

    const totalCategoryArticles = allArticles.filter(a => a.category.toLowerCase() === categoryId.toLowerCase());

    let html = `
      <!-- Category Hub Banner -->
      <div class="category-hub-banner">
        <div class="category-hub-breadcrumb">
          <a href="/" data-nav-home="true">Beranda</a>
          <span>/</span>
          <span style="color:var(--text-primary); font-weight:700;">${catName}</span>
        </div>
        <div class="category-hub-main">
          <div class="category-hub-info">
            <div class="category-hub-icon-wrap">
              ${this.getCategoryIconSvg(catObj?.icon || 'layers', 28)}
            </div>
            <div class="category-hub-headings">
              <h1 class="category-hub-title">${catName}</h1>
              <p class="category-hub-desc">${catObj?.description || 'Liputan berita, ulasan mendalam, dan tren teknologi terdepan.'}</p>
            </div>
          </div>
          <div class="category-hub-stats">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${totalCategoryArticles.length} ${lang === 'en' ? 'Articles' : 'Artikel'}</span>
          </div>
        </div>
      </div>

      <div class="category-matrix-container">
    `;

    if (subCats.length > 0) {
      subCats.forEach(sub => {
        // Match articles with this subcategory
        const subArticles = totalCategoryArticles
          .filter(a => {
            const subLower = (a.subCategory || '').toLowerCase();
            return subLower === sub.id.toLowerCase() || subLower === sub.slug.toLowerCase() || subLower === sub.name.toLowerCase();
          })
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 10);

        // Only render subcategory block if it has articles OR if top 3 subcategories
        html += `
          <section class="category-matrix-block" data-matrix-subcategory="${sub.slug}">
            <div class="matrix-block-header">
              <div class="matrix-header-left">
                <div class="matrix-channel-badge" style="background: rgba(56, 189, 248, 0.08); border-color: rgba(56, 189, 248, 0.25); color: #38bdf8;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div class="matrix-title-group">
                  <h3 class="matrix-channel-title">
                    <a href="/${categoryId}/${sub.slug}" data-subcat-cat="${categoryId}" data-subcat-slug="${sub.slug}">
                      ${sub.name}
                    </a>
                  </h3>
                  <span class="matrix-channel-desc">${sub.description || 'Kumpulan berita dan ulasan ' + sub.name}</span>
                </div>
              </div>
              <div class="matrix-header-right">
                <a href="/${categoryId}/${sub.slug}" class="matrix-view-all-btn" data-subcat-cat="${categoryId}" data-subcat-slug="${sub.slug}">
                  <span>${lang === 'en' ? 'View All Stories' : 'Lihat Semua Liputan'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </div>

            ${this.renderMatrixArticlesHTML(subArticles, categoryId, sub.name)}
          </section>
        `;
      });
    } else {
      // Fallback: render all category articles in matrix
      html += `
        <section class="category-matrix-block">
          ${this.renderMatrixArticlesHTML(totalCategoryArticles.slice(0, 10), categoryId, catName)}
        </section>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  }

  /**
   * Generates the Asymmetrical Editorial Matrix HTML for a group of up to 10 articles
   */
  private static renderMatrixArticlesHTML(articles: Article[], categoryId: string, channelName: string): string {
    const lang = store.preferences.language;

    if (articles.length === 0) {
      return `
        <div class="matrix-empty-card">
          <div class="matrix-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h4 class="matrix-empty-title">${lang === 'en' ? 'Special Coverage Coming Soon' : 'Liputan Khusus Segera Hadir'}</h4>
          <p class="matrix-empty-desc">${lang === 'en' ? `Our editorial newsroom is currently curating investigations for ${channelName}.` : `Dewan redaksi QUERYINDO sedang menyiapkan laporan investigasi terbaru untuk kanal ${channelName}.`}</p>
          <a href="/kategori/${categoryId}" class="matrix-view-all-btn" data-category-link="${categoryId}" style="margin-top:0.25rem;">
            <span>${lang === 'en' ? 'Visit Channel' : 'Kunjungi Kanal'}</span>
          </a>
        </div>
      `;
    }

    // Case 1: 5 or more articles -> Asymmetrical Editorial 60/40 Matrix (1 Lead + Sub-Grid + Compact Feed)
    if (articles.length >= 5) {
      const leadArt = articles[0];
      const gridArts = articles.slice(1, 4); // 2 or 3 articles
      const listArts = articles.slice(4, 10); // up to 6 articles

      const isLeadBookmarked = store.isBookmarked(leadArt.id);

      return `
        <div class="matrix-editorial-layout">
          <!-- Main 60% Column -->
          <div class="matrix-main-col">
            <!-- 1. Lead Featured Card -->
            <article class="matrix-lead-card" data-article-id="${leadArt.id}" data-article-slug="${leadArt.slug || ''}" data-article-title="${escapeHtml(leadArt.title)}" data-article-category="${leadArt.category || ''}" data-article-subcategory="${leadArt.subCategory || ''}">
              <div class="matrix-lead-thumb-wrap">
                <img src="${getSafeImageUrl(leadArt.imageUrl)}" alt="${escapeHtml(leadArt.title)}" class="matrix-lead-thumb" loading="lazy" ${IMG_ONERROR} />
                <div class="matrix-lead-badges">
                  <span class="card-category-badge">${leadArt.category}</span>
                  ${leadArt.subCategory ? `<span style="font-size:0.65rem; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px; background:rgba(9,11,16,0.94); color:var(--accent-cyan); border:1px solid rgba(0,242,254,0.4); text-transform:uppercase;">${leadArt.subCategory}</span>` : ''}
                </div>
              </div>
              <div class="matrix-lead-body">
                <h4 class="matrix-lead-title">${leadArt.title}</h4>
                <p class="matrix-lead-excerpt">${leadArt.subtitle}</p>
                <div class="matrix-lead-footer">
                  <div class="card-author-info">
                    <img src="${leadArt.author.avatar}" alt="${leadArt.author.name}" style="width: 1.35rem; height: 1.35rem; border-radius: 50%; object-fit: cover;" />
                    <span style="display: inline-flex; align-items: center; gap: 0.2rem;">
                      ${leadArt.author.name}
                      ${ImageUtils.getVerifiedBadgeHTML(13, 'Jurnalis Terverifikasi')}
                    </span>
                  </div>
                  <div class="card-actions">
                    <span>${calculateReadTime(leadArt.content, leadArt.readTimeMinutes)}m baca</span>
                    <button class="btn-bookmark ${isLeadBookmarked ? 'active' : ''}" data-bookmark-id="${leadArt.id}" title="${store.t('bookmarkBtn')}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="${isLeadBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <!-- 2. Sub Grid Cards (2-3 Articles) -->
            <div class="matrix-sub-grid">
              ${gridArts.map(art => {
                const isBookmarked = store.isBookmarked(art.id);
                return `
                  <article class="matrix-sub-card" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}" data-article-category="${art.category || ''}" data-article-subcategory="${art.subCategory || ''}">
                    <div class="matrix-sub-thumb-wrap">
                      <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="matrix-sub-thumb" loading="lazy" ${IMG_ONERROR} />
                      ${art.subCategory ? `
                        <div style="position: absolute; top: 0.5rem; left: 0.5rem; z-index: 2;">
                          <span style="font-size:0.6rem; font-weight:700; padding:0.15rem 0.45rem; border-radius:3px; background:rgba(9,11,16,0.94); color:var(--accent-cyan); border:1px solid rgba(0,242,254,0.35); text-transform:uppercase;">${art.subCategory}</span>
                        </div>
                      ` : ''}
                    </div>
                    <div class="matrix-sub-body">
                      <h4 class="matrix-sub-title">${art.title}</h4>
                      <div class="matrix-sub-footer">
                        <span>${calculateReadTime(art.content, art.readTimeMinutes)}m baca</span>
                        <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-bookmark-id="${art.id}" title="${store.t('bookmarkBtn')}">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Compact 40% Side Column (Articles #5..#10) -->
          <div class="matrix-compact-col">
            <div class="matrix-compact-panel">
              <div class="matrix-compact-header">
                <span class="matrix-compact-heading">
                  ${lang === 'en' ? 'Top Stories' : 'Liputan Pilihan'}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${articles.length} Liputan</span>
              </div>
              <div class="matrix-compact-list">
                ${listArts.map((art, idx) => {
                  const numStr = String(idx + 5).padStart(2, '0');
                  const isBookmarked = store.isBookmarked(art.id);
                  return `
                    <div class="matrix-compact-row" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}" data-article-category="${art.category || ''}" data-article-subcategory="${art.subCategory || ''}">
                      <span class="matrix-compact-num">${numStr}</span>
                      <div class="matrix-compact-content">
                        ${art.subCategory ? `<span class="matrix-compact-subcat">${art.subCategory}</span>` : ''}
                        <h5 class="matrix-compact-title">${art.title}</h5>
                        <div class="matrix-compact-meta">
                          <span>${art.author.name}</span>
                          <span>•</span>
                          <span>${formatDate(art.publishedAt, lang)}</span>
                          <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-bookmark-id="${art.id}" title="${store.t('bookmarkBtn')}" style="margin-left: auto;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                          </button>
                        </div>
                      </div>
                      <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="matrix-compact-thumb" loading="lazy" ${IMG_ONERROR} />
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Case 2: 1 to 4 articles -> Standard Bento Grid
    return `
      <div class="articles-grid">
        ${articles.map(art => {
          const isBookmarked = store.isBookmarked(art.id);
          return `
            <article class="article-card" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}" data-article-category="${art.category || ''}" data-article-subcategory="${art.subCategory || ''}">
              <div class="card-img-wrap">
                <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="card-img" loading="lazy" ${IMG_ONERROR} />
                <div style="position: absolute; top: 0.75rem; left: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; z-index: 2; align-items: flex-start;">
                  <span class="card-category-badge">${art.category}</span>
                  ${art.subCategory ? `<span style="font-size:0.62rem; font-weight:700; padding:0.18rem 0.5rem; border-radius:4px; background:rgba(9,11,16,0.94); color:var(--accent-cyan); border:1px solid rgba(0,242,254,0.4); text-transform:uppercase;">${art.subCategory}</span>` : ''}
                </div>
              </div>
              <div class="card-body">
                <h3 class="card-title">${art.title}</h3>
                <p class="card-excerpt">${art.subtitle}</p>
                <div class="card-footer">
                  <div class="card-author-info">
                    <img src="${art.author.avatar}" alt="${art.author.name}" style="width: 1.3rem; height: 1.3rem; border-radius: 50%; object-fit: cover;" />
                    <span style="display: inline-flex; align-items: center; gap: 0.2rem;">
                      ${art.author.name}
                      ${ImageUtils.getVerifiedBadgeHTML(13, 'Jurnalis Terverifikasi')}
                    </span>
                  </div>
                  <div class="card-actions">
                    <span>${calculateReadTime(art.content, art.readTimeMinutes)}m baca</span>
                    <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-bookmark-id="${art.id}" title="${store.t('bookmarkBtn')}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * Renders the single grid feed for Sub-category archives and Search queries
   */
  private static renderSingleGridFeed(articlesGrid: HTMLElement, feedTitle: HTMLElement | null, resultsCount: HTMLElement | null, loadMoreContainer: HTMLElement | null): void {
    // Filter Articles
    const filtered = ArticleService.getArticles().filter(art => {
      const matchesCategory = store.currentCategory === 'all' || art.category.toLowerCase() === store.currentCategory.toLowerCase();
      const matchesSubCategory = !store.currentSubCategory || 
        (art.subCategory && art.subCategory.toLowerCase() === store.currentSubCategory.toLowerCase()) || 
        (store.currentCategory !== 'all' && (() => {
          const matched = findSubCategory(store.currentCategory, store.currentSubCategory);
          return matched ? (art.subCategory?.toLowerCase() === matched.id.toLowerCase() || art.subCategory?.toLowerCase() === matched.slug.toLowerCase()) : false;
        })());

      const matchesSearch = store.searchQuery === '' || 
        art.title.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        art.subtitle.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(store.searchQuery.toLowerCase()));

      const matchesDate = (() => {
        if (store.selectedFilterDateRange === 'all') return true;
        const pubTime = new Date(art.publishedAt).getTime();
        const now = Date.now();
        const diff = now - pubTime;
        if (store.selectedFilterDateRange === '24h') return diff <= 24 * 60 * 60 * 1000;
        if (store.selectedFilterDateRange === 'week') return diff <= 7 * 24 * 60 * 60 * 1000;
        if (store.selectedFilterDateRange === 'month') return diff <= 30 * 24 * 60 * 60 * 1000;
        return true;
      })();

      const matchesTag = store.selectedFilterTag === '' || art.tags.some(t => t.toLowerCase() === store.selectedFilterTag.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesSearch && matchesDate && matchesTag;
    });

    // Sort Articles
    filtered.sort((a, b) => {
      if (store.selectedFilterSortBy === 'views') {
        return b.viewsCount - a.viewsCount;
      }
      if (store.selectedFilterSortBy === 'likes') {
        return b.likesCount - a.likesCount;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Update Title & Count
    if (feedTitle) {
      if (store.searchQuery) {
        feedTitle.innerHTML = `Pencarian: <span style="color:var(--accent-cyan);">"${escapeHtml(store.searchQuery)}"</span>`;
      } else if (store.selectedFilterTag) {
        feedTitle.innerHTML = `Topik: <span style="color:var(--accent-cyan);">#${escapeHtml(store.selectedFilterTag)}</span>`;
      } else if (store.currentSubCategory && store.currentCategory !== 'all') {
        const categoryObj = CATEGORIES.find(c => c.id === store.currentCategory);
        const subCatObj = findSubCategory(store.currentCategory, store.currentSubCategory);
        const catName = categoryObj ? (store.preferences.language === 'en' ? (CATEGORIES_EN[categoryObj.id] || categoryObj.name) : categoryObj.name) : '';
        const subName = subCatObj ? subCatObj.name : store.currentSubCategory;
        feedTitle.innerHTML = `${catName} <span style="opacity:0.4; font-weight:400;">/</span> <span style="color:var(--accent-cyan);">${subName}</span>`;
      } else {
        const categoryObj = CATEGORIES.find(c => c.id === store.currentCategory);
        feedTitle.innerHTML = categoryObj ? categoryObj.name : 'Berita Terbaru';
      }
    }

    if (resultsCount) {
      resultsCount.textContent = store.preferences.language === 'en'
        ? `Showing ${Math.min(filtered.length, this.visibleCount)} of ${filtered.length} articles`
        : `Menampilkan ${Math.min(filtered.length, this.visibleCount)} dari ${filtered.length} artikel`;
    }

    if (filtered.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${store.preferences.language === 'en' ? 'No Articles Found' : 'Tidak Ada Berita Ditemukan'}</h3>
          <p style="margin-top: 0.5rem; font-size:0.9rem;">${store.preferences.language === 'en' ? 'Try a different search keyword or category.' : 'Coba gunakan kata kunci pencarian lain atau pilih kategori berbeda.'}</p>
        </div>
      `;
      if (loadMoreContainer) loadMoreContainer.innerHTML = '';
      return;
    }

    const displayedArticles = filtered.slice(0, this.visibleCount);
    let feedHTML = '';
    const inFeedAdHTML = AdBanner.renderInFeedAdHTML();

    displayedArticles.forEach((art, idx) => {
      const isBookmarked = store.isBookmarked(art.id);
      feedHTML += `
        <article class="article-card" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}" data-article-category="${art.category || ''}" data-article-subcategory="${art.subCategory || ''}">
          <div class="card-img-wrap">
            <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="card-img" loading="lazy" ${IMG_ONERROR} />
            <div style="position: absolute; top: 0.75rem; left: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; z-index: 2; align-items: flex-start;">
              <span class="card-category-badge">${art.category}</span>
              ${art.subCategory ? `<span style="font-size:0.62rem; font-weight:700; padding:0.18rem 0.5rem; border-radius:4px; background:rgba(9,11,16,0.94); color:var(--accent-cyan); border:1px solid rgba(0,242,254,0.4); text-transform:uppercase;">${art.subCategory}</span>` : ''}
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${art.title}</h3>
            <p class="card-excerpt">${art.subtitle}</p>
            <div class="card-footer">
              <div class="card-author-info">
                <img src="${art.author.avatar}" alt="${art.author.name}" style="width: 1.3rem; height: 1.3rem; border-radius: 50%; object-fit: cover;" />
                <span style="display: inline-flex; align-items: center; gap: 0.2rem;">
                  ${art.author.name}
                  ${ImageUtils.getVerifiedBadgeHTML(13, 'Jurnalis Terverifikasi')}
                </span>
              </div>
              <div class="card-actions">
                <span>${calculateReadTime(art.content, art.readTimeMinutes)}m baca</span>
                <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-bookmark-id="${art.id}" title="${store.t('bookmarkBtn')}">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;

      if (idx === 3 && inFeedAdHTML) {
        feedHTML += inFeedAdHTML;
      }
    });

    articlesGrid.innerHTML = feedHTML;

    // Load More Button
    if (loadMoreContainer) {
      if (filtered.length > this.visibleCount) {
        const remaining = filtered.length - this.visibleCount;
        loadMoreContainer.innerHTML = `
          <button id="btn-feed-load-more" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 2.25rem; border-radius: 9999px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); box-shadow: var(--shadow-sm);">
            <span>${store.preferences.language === 'en' ? `Load More Stories (${remaining} remaining)` : `Muat Berita Lainnya (${remaining} tersisa)`}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        `;
        const loadBtn = loadMoreContainer.querySelector('#btn-feed-load-more') as HTMLElement | null;
        loadBtn?.addEventListener('click', () => {
          this.visibleCount += 12;
          this.render();
        });
      } else {
        loadMoreContainer.innerHTML = '';
      }
    }
  }

  /**
   * Binds click events for Matrix Architecture (Categories, Subcategories, Articles, Bookmarks)
   */
  private static bindMatrixEvents(container: HTMLElement): void {
    // Article Cards, Leads, Subs, and Compact rows
    const articleElements = container.querySelectorAll('.matrix-lead-card, .matrix-sub-card, .matrix-compact-row, .article-card');
    articleElements.forEach(el => {
      el.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.btn-bookmark') || target.closest('a') || target.closest('.btn-ad-cta')) return;

        const artId = el.getAttribute('data-article-id');
        const slug = el.getAttribute('data-article-slug');
        const title = el.getAttribute('data-article-title');
        const cat = el.getAttribute('data-article-category') || undefined;
        const sub = el.getAttribute('data-article-subcategory') || undefined;
        if (artId) {
          Router.navigateToArticle(slug || artId, title || undefined, cat, sub);
        }
      });
    });

    // Category Links
    container.querySelectorAll('[data-category-link]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const catId = btn.getAttribute('data-category-link');
        if (catId) {
          this.resetPagination();
          store.currentCategory = catId as CategoryId;
          store.currentSubCategory = null;
          Router.navigateToCategory(catId);
          this.renderCategories();
          this.renderSubCategories();
          this.render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Subcategory Links
    container.querySelectorAll('[data-subcat-slug]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = btn.getAttribute('data-subcat-cat') || store.currentCategory;
        const subSlug = btn.getAttribute('data-subcat-slug');
        if (cat && subSlug) {
          this.resetPagination();
          store.currentCategory = cat as CategoryId;
          store.currentSubCategory = subSlug;
          Router.navigateToSubCategory(cat, subSlug);
          this.renderCategories();
          this.renderSubCategories();
          this.render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Breadcrumb Nav Home
    container.querySelectorAll('[data-nav-home]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetPagination();
        store.currentCategory = 'all';
        store.currentSubCategory = null;
        Router.navigateHome();
        this.renderCategories();
        this.renderSubCategories();
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Bookmark Buttons
    container.querySelectorAll('.btn-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const artId = (btn as HTMLElement).getAttribute('data-bookmark-id');
        if (artId) {
          const isNowSaved = store.toggleBookmark(artId);
          btn.classList.toggle('active', isNowSaved);
          btn.querySelector('svg')?.setAttribute('fill', isNowSaved ? 'currentColor' : 'none');
        }
      });
    });

    AdBanner.bindAdEvents(container);
  }

  /**
   * Binds click events for standard single grid feed
   */
  private static bindStandardGridEvents(container: HTMLElement): void {
    container.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.btn-bookmark') || target.closest('.btn-ad-cta') || card.classList.contains('sponsored-feed-card')) return;

        const artId = card.getAttribute('data-article-id');
        const slug = card.getAttribute('data-article-slug');
        const title = card.getAttribute('data-article-title');
        const cat = card.getAttribute('data-article-category') || undefined;
        const sub = card.getAttribute('data-article-subcategory') || undefined;
        if (artId) {
          Router.navigateToArticle(slug || artId, title || undefined, cat, sub);
        }
      });
    });

    container.querySelectorAll('.btn-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const artId = (btn as HTMLElement).getAttribute('data-bookmark-id');
        if (artId) {
          const isNowSaved = store.toggleBookmark(artId);
          btn.classList.toggle('active', isNowSaved);
          btn.querySelector('svg')?.setAttribute('fill', isNowSaved ? 'currentColor' : 'none');
        }
      });
    });

    AdBanner.bindAdEvents(container);
  }
}
