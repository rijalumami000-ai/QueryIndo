import { ArticleService } from '../services/articleService';
import { store, CATEGORIES_EN } from '../state/store';
import { Router } from '../router';
import { CATEGORIES } from '../data/mockNews';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner } from '../components/AdBanner';
import { escapeHtml, calculateReadTime, getSafeImageUrl, IMG_ONERROR } from '../utils/helpers';
import type { CategoryId } from '../types/news';

export class FeedSection {
  public static renderCategories(): void {
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
          store.currentCategory = catId;
          Router.navigateToCategory(catId);
          this.renderCategories();
          this.render();
          target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });

    // Wire up category scroll arrows
    const scrollLeftBtn = document.getElementById('cat-scroll-left') as HTMLButtonElement;
    const scrollRightBtn = document.getElementById('cat-scroll-right') as HTMLButtonElement;

    const updateArrowStates = () => {
      if (!categoryContainer) return;
      if (scrollLeftBtn) {
        scrollLeftBtn.disabled = categoryContainer.scrollLeft <= 5;
      }
      if (scrollRightBtn) {
        const maxScroll = categoryContainer.scrollWidth - categoryContainer.clientWidth;
        scrollRightBtn.disabled = categoryContainer.scrollLeft >= maxScroll - 5;
      }
    };

    if (scrollLeftBtn) {
      scrollLeftBtn.onclick = () => {
        categoryContainer.scrollBy({ left: -260, behavior: 'smooth' });
        setTimeout(updateArrowStates, 300);
      };
    }

    if (scrollRightBtn) {
      scrollRightBtn.onclick = () => {
        categoryContainer.scrollBy({ left: 260, behavior: 'smooth' });
        setTimeout(updateArrowStates, 300);
      };
    }

    categoryContainer.onscroll = () => {
      updateArrowStates();
    };

    updateArrowStates();
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

  public static render(): void {
    const articlesGrid = document.getElementById('articles-grid');
    const feedTitle = document.getElementById('feed-title');
    const resultsCount = document.getElementById('results-count');
    if (!articlesGrid) return;

    // Filter Articles
    const filtered = ArticleService.getArticles().filter(art => {
      const matchesCategory = store.currentCategory === 'all' || art.category === store.currentCategory;
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

      return matchesCategory && matchesSearch && matchesDate && matchesTag;
    });

    // Sort Articles
    filtered.sort((a, b) => {
      if (store.selectedFilterSortBy === 'views') {
        return b.viewsCount - a.viewsCount;
      }
      if (store.selectedFilterSortBy === 'likes') {
        return b.likesCount - a.likesCount;
      }
      // default 'latest'
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Update Title & Count
    if (feedTitle) {
      const categoryObj = CATEGORIES.find(c => c.id === store.currentCategory);
      if (store.preferences.language === 'en') {
        feedTitle.innerHTML = categoryObj ? (CATEGORIES_EN[categoryObj.id] || categoryObj.name) : 'Latest Tech News';
      } else {
        feedTitle.innerHTML = categoryObj ? categoryObj.name : 'Berita Terbaru';
      }
    }

    if (resultsCount) {
      resultsCount.textContent = store.preferences.language === 'en'
        ? `Showing ${filtered.length} articles`
        : `Menampilkan ${filtered.length} artikel`;
    }

    // Render Leaderboard Sponsor Ad Banner
    const leaderboardAdContainer = document.getElementById('leaderboard-ad-container');
    if (leaderboardAdContainer) {
      leaderboardAdContainer.innerHTML = AdBanner.renderLeaderboardHTML();
      AdBanner.bindAdEvents(leaderboardAdContainer);
    }

    if (filtered.length === 0) {
      articlesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${store.preferences.language === 'en' ? 'No Articles Found' : 'Tidak Ada Berita Ditemukan'}</h3>
          <p style="margin-top: 0.5rem; font-size:0.9rem;">${store.preferences.language === 'en' ? 'Try a different search keyword or category.' : 'Coba gunakan kata kunci pencarian lain atau pilih kategori berbeda.'}</p>
        </div>
      `;
      return;
    }

    let feedHTML = '';
    const inFeedAdHTML = AdBanner.renderInFeedAdHTML();

    filtered.forEach((art, idx) => {
      const isBookmarked = store.isBookmarked(art.id);
      feedHTML += `
        <article class="article-card" data-article-id="${art.id}" data-article-slug="${art.slug || ''}" data-article-title="${escapeHtml(art.title)}">
          <div class="card-img-wrap">
            <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="card-img" loading="lazy" ${IMG_ONERROR} />
            <span class="card-category-badge">${art.category}</span>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      `;

      // Insert native in-feed sponsored ad after the 4th article
      if (idx === 3 && inFeedAdHTML) {
        feedHTML += inFeedAdHTML;
      }
    });

    articlesGrid.innerHTML = feedHTML;

    // Add click handlers
    articlesGrid.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.btn-bookmark') || target.closest('.btn-ad-cta') || card.classList.contains('sponsored-feed-card')) return;

        const artId = card.getAttribute('data-article-id');
        const slug = card.getAttribute('data-article-slug');
        const title = card.getAttribute('data-article-title');
        if (artId) {
          Router.navigateToArticle(slug || artId, title || undefined);
        }
      });
    });

    articlesGrid.querySelectorAll('.btn-bookmark').forEach(btn => {
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

    AdBanner.bindAdEvents(articlesGrid);
  }
}
