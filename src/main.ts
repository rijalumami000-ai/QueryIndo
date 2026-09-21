import './styles/main.css';
import type { CategoryId } from './types/news';
import { ArticleService } from './services/articleService';
import { AuthorService } from './services/authorService';
import { ShoppingCarousel } from './components/ShoppingCarousel';
import { AdBanner } from './components/AdBanner';
import { ApiService } from './services/apiService';
import { InstitutionalPages, type InstitutionalPageId } from './components/InstitutionalPages';
import { ByteShorts } from './components/ByteShorts';
import { Toast } from './utils/toast';
import { SeoService } from './utils/seoService';
import { SocialMediaService } from './services/socialMediaService';
import { PWAUtils } from './utils/pwa';
import { store } from './state/store';
import { Router } from './router';
import { HeroSection } from './sections/HeroSection';
import { BentoSection } from './sections/BentoSection';
import { DeepTechSection } from './sections/DeepTechSection';
import { FeedSection } from './sections/FeedSection';
import { ArticleReaderModal } from './sections/ArticleReaderModal';
import { BookmarksModal } from './sections/BookmarksModal';
import { SearchPreview } from './sections/SearchPreview';
import { UserAuthModal } from './components/UserAuthModal';
import { CookieConsent } from './components/CookieConsent';
import { GoogleTranslateService } from './utils/googleTranslateService';
import { CATEGORIES, MASTER_TAXONOMY } from './data/mockNews';
import { escapeHtml, formatDate, getSafeImageUrl, IMG_ONERROR } from './utils/helpers';
import { ReaderAuthService } from './services/authService';

// Admin CMS & Modal (Code-split: Loaded dynamically on-demand)
const adminCmsModal = document.getElementById('admin-cms-modal');
const adminCmsContainer = document.getElementById('admin-cms-container');
let adminCMSInstance: any = null;

async function getAdminCMS() {
  if (!adminCMSInstance) {
    const { AdminCMS } = await import('./components/AdminCMS');
    adminCMSInstance = new AdminCMS(() => {
      HeroSection.renderBreakingBanner();
      HeroSection.render();
      BentoSection.render();
      DeepTechSection.render();
      FeedSection.render();
    });
  }
  return adminCMSInstance;
}

// Modal Scroll Lock Handling (Native 120fps)
window.addEventListener('modal-opened', () => document.body.classList.add('modal-open'));
window.addEventListener('modal-closed', () => {
  if (!document.querySelector('.modal-overlay.open, #byte-focus-mode-overlay, #manuscript-editor-fullscreen')) {
    document.body.classList.remove('modal-open');
  }
});

// Cached DOM Elements for Ultra-Fast 120fps Scroll Handling (Zero Layout Thrashing)
let cachedNavbar: HTMLElement | null = null;
let cachedCategoryBar: HTMLElement | null = null;
let cachedScrollProgress: HTMLElement | null = null;
let cachedBackToTopBtn: HTMLElement | null = null;
let cachedDocHeight = 1;
let isScrollTicking = false;
let lastIsScrolled = false;
let lastBackToTopVisible = false;

function updateCachedDimensions() {
  cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

// Global Scroll Handler with requestAnimationFrame Throttling
function handleGlobalScroll() {
  if (isScrollTicking) return;
  isScrollTicking = true;

  requestAnimationFrame(() => {
    isScrollTicking = false;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    const isScrolled = scrollY > 40;
    if (isScrolled !== lastIsScrolled) {
      lastIsScrolled = isScrolled;
      document.body.classList.toggle('is-scrolled', isScrolled);
      cachedNavbar?.classList.toggle('is-scrolled', isScrolled);
      cachedCategoryBar?.classList.toggle('is-scrolled', isScrolled);
    }

    if (cachedScrollProgress) {
      const ratio = Math.min(1, Math.max(0, scrollY / cachedDocHeight));
      cachedScrollProgress.style.transform = `scaleX(${ratio})`;
    }

    if (cachedBackToTopBtn) {
      const show = scrollY > 300;
      if (show !== lastBackToTopVisible) {
        lastBackToTopVisible = show;
        cachedBackToTopBtn.style.opacity = show ? '1' : '0';
        cachedBackToTopBtn.style.pointerEvents = show ? 'auto' : 'none';
        cachedBackToTopBtn.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
      }
    }
  });
}

// --------------------------------------------------------------------------
// Application Initialization
// --------------------------------------------------------------------------
async function init() {
  // 1. Cache Elements & Layout Dimensions Once
  cachedNavbar = document.querySelector('.navbar');
  cachedCategoryBar = document.querySelector('.category-bar');
  cachedScrollProgress = document.getElementById('navbar-scroll-progress');
  cachedBackToTopBtn = document.getElementById('btn-back-to-top');
  updateCachedDimensions();
  window.addEventListener('resize', updateCachedDimensions, { passive: true });

  // 2. Native Hardware-Accelerated 120Hz/144Hz Smooth Scrolling (Zero Input Latency)
  window.addEventListener('scroll', handleGlobalScroll, { passive: true });
  handleGlobalScroll();

  // 3. Initialize Store Badges
  store.updateCurrentDateBadge();
  store.updateBookmarkBadge();
  UserAuthModal.updateUserNavbarState();

  // 4. INSTANT First Paint (0ms) from local memory/cache
  FeedSection.renderCategories();
  FeedSection.renderSubCategories();
  HeroSection.renderBreakingBanner();
  HeroSection.render();
  BentoSection.renderBillboardAd();
  BentoSection.render();
  BentoSection.renderShoppingCarousel();
  BentoSection.renderMidstreamAd();
  DeepTechSection.render();
  FeedSection.renderFilterTags();
  FeedSection.render();

  // 5. Asynchronous Background Sync (Non-blocking Stale-While-Revalidate)
  Promise.allSettled([
    ArticleService.syncWithBackend(),
    AuthorService.syncWithBackend(),
    ShoppingCarousel.syncWithBackend(),
    AdBanner.syncWithBackend()
  ]).then(() => {
    updateCachedDimensions();
    FeedSection.renderCategories();
    FeedSection.renderSubCategories();
    HeroSection.renderBreakingBanner();
    HeroSection.render();
    BentoSection.render();
    DeepTechSection.render();
    FeedSection.render();
  }).catch(() => {});

  // 5. ByteShorts & Social Channels
  const byteShortsContainer = document.getElementById('byteshorts-bar-container');
  if (byteShortsContainer) {
    byteShortsContainer.innerHTML = ByteShorts.renderBarHTML(store.preferences.language);
    ByteShorts.bindBarEvents(byteShortsContainer, store.preferences.language, (id) => {
      const art = ArticleService.getArticleById(id);
      if (art) Router.navigateToArticle(art.slug || art.id, art.title);
    });
  }

  const socialContainer = document.getElementById('footer-social-list');
  if (socialContainer) socialContainer.innerHTML = SocialMediaService.renderFooterSocialListHTML();
  SocialMediaService.subscribe(() => {
    if (socialContainer) socialContainer.innerHTML = SocialMediaService.renderFooterSocialListHTML();
  });

  // 6. Setup Listeners, Utilities & Routing
  setupEventListeners();
  GoogleTranslateService.init();
  PWAUtils.setupPWAInstallPrompt();
  CookieConsent.init();
  updateFooterLabels();
  updateFilterLabels();
  SeoService.setHomeSEO();

  setupRouting();
  Router.init();
}

// --------------------------------------------------------------------------
// Routing Controller
// --------------------------------------------------------------------------
function setupRouting() {
  Router.subscribe((route) => {
    if (route.type === 'home') {
      ArticleReaderModal.close(false);
      InstitutionalPages.close();
      closeAdminCMSModal();
      store.currentCategory = 'all';
      store.currentSubCategory = null;
      FeedSection.renderCategories();
      FeedSection.renderSubCategories();
      FeedSection.render();
      SeoService.setHomeSEO();
    } else if (route.type === 'admin') {
      ArticleReaderModal.close(false);
      InstitutionalPages.close();
      openAdminCMSModal();
    } else if (route.type === 'article' && route.param) {
      InstitutionalPages.close();
      closeAdminCMSModal();
      ArticleReaderModal.open(route.param, false);
    } else if (route.type === 'page' && route.param) {
      ArticleReaderModal.close(false);
      closeAdminCMSModal();
      const pageId = route.param as InstitutionalPageId;
      InstitutionalPages.open(pageId, store.preferences.language);
      const title = InstitutionalPages.getPageTitle(pageId, store.preferences.language);
      const lead = InstitutionalPages.getPageLead(pageId, store.preferences.language);
      SeoService.setPageSEO(pageId, title, lead);
    } else if (route.type === 'category' && (route.category || route.param)) {
      ArticleReaderModal.close(false);
      InstitutionalPages.close();
      closeAdminCMSModal();
      const cat = (route.category || route.param) as CategoryId;
      store.currentCategory = cat;
      store.currentSubCategory = null;
      FeedSection.renderCategories();
      FeedSection.renderSubCategories();
      FeedSection.render();
      SeoService.setCategorySEO(cat.toUpperCase(), cat);
    } else if (route.type === 'subcategory') {
      ArticleReaderModal.close(false);
      InstitutionalPages.close();
      closeAdminCMSModal();
      const cat = (route.category || route.param) as CategoryId;
      const sub = route.subCategory || route.subParam || null;
      store.currentCategory = cat;
      store.currentSubCategory = sub;
      FeedSection.renderCategories();
      FeedSection.renderSubCategories();
      FeedSection.render();
      SeoService.setCategorySEO(`${cat.toUpperCase()} - ${sub || ''}`, cat);
    }
  });
}

async function openAdminCMSModal() {
  if (!adminCmsModal || !adminCmsContainer) return;
  window.dispatchEvent(new CustomEvent('modal-opened'));

  // Load Admin CMS bundle dynamically on demand
  const cms = await getAdminCMS();

  // If local cache has no articles, fetch from backend with full content
  if (ArticleService.getArticles().length === 0) {
    await ArticleService.syncWithBackend(true);
  }

  adminCmsContainer.innerHTML = cms.renderAdminModalHTML();
  adminCmsModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  cms.bindAdminEvents(adminCmsContainer);

  adminCmsContainer.querySelector('#admin-modal-close-btn')?.addEventListener('click', () => {
    closeAdminCMSModal();
    Router.navigateHome();
  });

  // Always keep admin articles synchronized with backend
  ArticleService.syncWithBackend(true).then(async () => {
    if (adminCmsModal?.classList.contains('open')) {
      const activeCms = await getAdminCMS();
      adminCmsContainer.innerHTML = activeCms.renderAdminModalHTML();
      activeCms.bindAdminEvents(adminCmsContainer);
      adminCmsContainer.querySelector('#admin-modal-close-btn')?.addEventListener('click', () => {
        closeAdminCMSModal();
        Router.navigateHome();
      });
    }
  });
}

function closeAdminCMSModal() {
  if (adminCmsModal?.classList.contains('open')) {
    adminCmsModal.classList.remove('open');
    document.body.style.overflow = '';
    window.dispatchEvent(new CustomEvent('modal-closed'));
  }
}

// --------------------------------------------------------------------------
// Footer & Filter Localization Sync
// --------------------------------------------------------------------------
function updateFooterLabels() {
  const ids: Record<string, keyof typeof import('./utils/translationService').UI_TRANSLATIONS['id']> = {
    'footer-company-title': 'companyText',
    'link-about': 'aboutUs',
    'link-contact': 'getInTouch',
    'link-redaksi': 'redaksiText',
    'link-ethics': 'ethicsCode',
    'link-cyber-guidelines': 'cyberGuidelines',
    'link-disclaimer': 'disclaimerText',
    'link-ads': 'adsText',
    'link-privacy': 'privacyText',
    'link-terms': 'termsText',
    'link-sitemap': 'petaSitus'
  };
  Object.entries(ids).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = store.t(key);
  });
}

function updateFilterLabels() {
  const lblSortBy = document.getElementById('lbl-sort-by');
  const lblDateRange = document.getElementById('lbl-date-range');
  const lblPopularTags = document.getElementById('lbl-popular-tags');
  if (lblSortBy) lblSortBy.textContent = store.t('lblSortBy');
  if (lblDateRange) lblDateRange.textContent = store.t('lblDateRange');
  if (lblPopularTags) lblPopularTags.textContent = store.t('lblPopularTags');

  const filterSortBy = document.getElementById('filter-sort-by') as HTMLSelectElement | null;
  if (filterSortBy) {
    filterSortBy.options[0].text = store.t('optLatest');
    filterSortBy.options[1].text = store.t('optViews');
    filterSortBy.options[2].text = store.t('optLikes');
  }

  const filterDateRange = document.getElementById('filter-date-range') as HTMLSelectElement | null;
  if (filterDateRange) {
    filterDateRange.options[0].text = store.t('optAllTime');
    filterDateRange.options[1].text = store.t('optLast24h');
    filterDateRange.options[2].text = store.t('optThisWeek');
    filterDateRange.options[3].text = store.t('optThisMonth');
  }
}

// --------------------------------------------------------------------------
// Global Event Listeners
// --------------------------------------------------------------------------
function setupEventListeners() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => store.toggleTheme());

  store.subscribe('bookmarks-change', () => {
    BentoSection.render();
    DeepTechSection.render();
    FeedSection.render();
  });

  window.addEventListener('open-auth-modal', () => UserAuthModal.open());
  window.addEventListener('open-reader-auth-modal', () => UserAuthModal.open());
  window.addEventListener('reader-auth-change', () => {
    UserAuthModal.updateUserNavbarState();
    store.updateBookmarkBadge();
  });

  // --------------------------------------------------------------------------
  // User Avatar & Integrated Profile Dropdown
  // --------------------------------------------------------------------------
  const userAuthBtn = document.getElementById('user-auth-btn');
  const userAvatarDropdown = document.getElementById('user-avatar-dropdown');
  const userAvatarMenuWrap = document.getElementById('user-avatar-menu-wrap');

  const openUserAvatarDropdown = () => {
    if (userAvatarDropdown) {
      userAvatarDropdown.style.display = 'block';
      userAuthBtn?.setAttribute('aria-expanded', 'true');
    }
  };

  const closeUserAvatarDropdown = () => {
    if (userAvatarDropdown) {
      userAvatarDropdown.style.display = 'none';
      userAuthBtn?.setAttribute('aria-expanded', 'false');
    }
  };

  userAuthBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userAvatarDropdown && userAvatarDropdown.style.display !== 'none') {
      closeUserAvatarDropdown();
    } else {
      openUserAvatarDropdown();
    }
  });

  document.getElementById('m-user-auth-btn')?.addEventListener('click', () => UserAuthModal.open());

  // Dropdown Items Event Wiring
  document.getElementById('dropdown-auth-action-btn')?.addEventListener('click', () => {
    closeUserAvatarDropdown();
    UserAuthModal.open();
  });

  document.getElementById('dropdown-bookmarks-btn')?.addEventListener('click', () => {
    closeUserAvatarDropdown();
    BookmarksModal.open();
  });

  // Dropdown Theme Toggle Switch
  const updateDropdownThemeUI = () => {
    const isDark = store.preferences.theme === 'dark';
    const themeText = document.getElementById('dropdown-theme-text');
    const themeIcon = document.getElementById('dropdown-theme-icon');
    if (themeText) themeText.textContent = isDark ? 'Mode Gelap' : 'Mode Terang';
    if (themeIcon) {
      themeIcon.innerHTML = isDark
        ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
        : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    }
  };
  updateDropdownThemeUI();

  document.getElementById('dropdown-theme-toggle-btn')?.addEventListener('click', () => {
    store.toggleTheme();
    updateDropdownThemeUI();
  });

  // Dropdown Language Switcher Pills
  const syncDropdownLangUI = (lang: 'id' | 'en') => {
    document.querySelectorAll('#dropdown-lang-switcher .btn-lang-pill').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
  };
  syncDropdownLangUI(store.preferences.language);

  document.getElementById('dropdown-lang-switcher')?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('.btn-lang-pill') as HTMLElement | null;
    if (!target) return;
    const lang = target.getAttribute('data-lang') as 'id' | 'en';
    if (lang && lang !== store.preferences.language) {
      GoogleTranslateService.setLanguage(lang);
      syncDropdownLangUI(lang);
      if (searchInput) searchInput.placeholder = store.t('searchPlaceholder');
      FeedSection.renderCategories();
      HeroSection.render();
      BentoSection.render();
      DeepTechSection.render();
      FeedSection.renderFilterTags();
      FeedSection.render();
      updateFooterLabels();
      updateFilterLabels();
      CookieConsent.updateLabels();
      Toast.show(lang === 'en' ? 'Website diterjemahkan ke Bahasa Inggris' : 'Bahasa dikembalikan ke Indonesia');
    }
  });

  // Dropdown Logout Button
  document.getElementById('dropdown-logout-btn')?.addEventListener('click', () => {
    ReaderAuthService.logout();
    Toast.show('Anda telah keluar dari akun Google.');
    UserAuthModal.updateUserNavbarState();
    closeUserAvatarDropdown();
  });

  // Close Dropdown on Click Outside
  document.addEventListener('click', (e) => {
    if (userAvatarDropdown && userAvatarDropdown.style.display !== 'none') {
      if (userAvatarMenuWrap && !userAvatarMenuWrap.contains(e.target as Node)) {
        closeUserAvatarDropdown();
      }
    }
  });

  // Search Live Preview
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    store.searchQuery = query;
    FeedSection.render();
    SearchPreview.render(query);
  });
  searchInput?.addEventListener('focus', () => {
    if (searchInput.value.trim()) SearchPreview.render(searchInput.value);
  });
  searchInput?.addEventListener('keydown', (e) => SearchPreview.handleKeyNavigation(e));
  document.addEventListener('click', (e) => {
    const searchBox = document.getElementById('navbar-search-box');
    if (searchBox && !searchBox.contains(e.target as Node)) SearchPreview.close();
  });

  // Filter Panel Toggle
  const filterPanel = document.getElementById('advanced-filter-panel');
  document.getElementById('btn-filter-toggle')?.addEventListener('click', (e) => {
    if (filterPanel) {
      const isHidden = filterPanel.style.display === 'none';
      filterPanel.style.display = isHidden ? 'block' : 'none';
      (e.currentTarget as HTMLElement).style.color = isHidden ? 'var(--accent-cyan)' : 'var(--text-secondary)';
    }
  });

  document.getElementById('filter-sort-by')?.addEventListener('change', (e) => {
    store.selectedFilterSortBy = (e.target as HTMLSelectElement).value;
    FeedSection.render();
  });
  document.getElementById('filter-date-range')?.addEventListener('change', (e) => {
    store.selectedFilterDateRange = (e.target as HTMLSelectElement).value;
    FeedSection.render();
  });

  // Search Overlay Toggle
  const searchOverlayBar = document.getElementById('search-overlay-bar');
  const btnSearchToggle = document.getElementById('btn-search-toggle');
  const btnSearchClose = document.getElementById('btn-search-close');

  const openSearchOverlay = () => {
    if (searchOverlayBar) {
      searchOverlayBar.style.display = 'block';
      searchInput?.focus();
    }
  };

  const closeSearchOverlay = () => {
    if (searchOverlayBar) {
      searchOverlayBar.style.display = 'none';
      SearchPreview.close();
    }
  };

  btnSearchToggle?.addEventListener('click', () => {
    if (searchOverlayBar && searchOverlayBar.style.display !== 'none') {
      closeSearchOverlay();
    } else {
      openSearchOverlay();
    }
  });

  btnSearchClose?.addEventListener('click', closeSearchOverlay);

  // --------------------------------------------------------------------------
  // Unified Category Navigation & Full-Width Mega Menu Controller (Ala Reuters)
  // --------------------------------------------------------------------------
  const headerMegaMenu = document.getElementById('header-mega-menu');
  let megaMenuTimer: any = null;

  const hideMegaMenu = () => {
    if (headerMegaMenu) headerMegaMenu.style.display = 'none';
    document.querySelectorAll('#header-categories-nav .cat-nav-item').forEach(item => {
      item.classList.remove('dropdown-open');
    });
  };

  const scheduleHideMegaMenu = () => {
    clearTimeout(megaMenuTimer);
    megaMenuTimer = setTimeout(hideMegaMenu, 260);
  };

  const cancelHideMegaMenu = () => {
    clearTimeout(megaMenuTimer);
  };

  const renderMegaMenu = (catId: string) => {
    cancelHideMegaMenu();
    if (!headerMegaMenu || catId === 'all') {
      hideMegaMenu();
      return;
    }

    // Set active dropdown-open state on the corresponding nav item for indicator & chevron animation
    document.querySelectorAll('#header-categories-nav .cat-nav-item').forEach(item => {
      const itemCat = item.getAttribute('data-nav-category');
      item.classList.toggle('dropdown-open', itemCat === catId);
    });

    if (catId === 'more') {
      const moreCatIds = ['internet', 'space', 'climatetech', 'biotech', 'review', 'tips'];
      const moreCats = CATEGORIES.filter(c => moreCatIds.includes(c.id));
      let recentArticles = ArticleService.getArticles().filter(a => moreCatIds.includes(a.category)).slice(0, 3);
      if (recentArticles.length === 0) {
        recentArticles = ArticleService.getArticles().slice(0, 3);
      }

      headerMegaMenu.innerHTML = `
        <div class="mega-menu-inner container">
          <!-- Left: Browse Other Channels -->
          <div class="mega-browse-col">
            <div class="mega-col-heading">
              <span>Kanal Berita Lainnya</span>
              <a href="#" class="mega-view-all-link" id="mega-view-all-directory">Buka Direktori Lengkap →</a>
            </div>
            <div class="mega-subcategories-2col">
              ${moreCats.map(cat => `
                <a href="#" class="mega-subcat-link more-cat-link" data-cat="${cat.id}">
                  ${cat.name}
                </a>
              `).join('')}
            </div>
          </div>

          <!-- Right: Latest in Other Channels -->
          <div class="mega-latest-col">
            <div class="mega-col-heading">
              <span>Liputan Terkini & Pilihan Redaksi</span>
            </div>
            <div class="mega-articles-stack">
              ${recentArticles.map(art => `
                <div class="mega-article-row" data-slug="${art.slug || art.id}" data-title="${escapeHtml(art.title)}">
                  <div class="mega-article-row-content">
                    <span class="mega-article-row-tag">${art.subCategory || art.category}</span>
                    <h4 class="mega-article-row-title">${art.title}</h4>
                    <div class="mega-article-row-meta">
                      <span>${formatDate(art.publishedAt, store.preferences.language)}</span>
                    </div>
                  </div>
                  <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="mega-article-row-thumb" loading="lazy" ${IMG_ONERROR} />
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      headerMegaMenu.style.display = 'block';

      headerMegaMenu.querySelector('#mega-view-all-directory')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideMegaMenu();
        openCategoryDrawer();
      });

      headerMegaMenu.querySelectorAll('.more-cat-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const c = link.getAttribute('data-cat');
          if (c) {
            hideMegaMenu();
            handleCategoryNavClick(c);
          }
        });
      });

      headerMegaMenu.querySelectorAll('.mega-article-row').forEach(row => {
        row.addEventListener('click', () => {
          const slug = row.getAttribute('data-slug');
          const title = row.getAttribute('data-title');
          if (slug) {
            hideMegaMenu();
            Router.navigateToArticle(slug, title || '');
          }
        });
      });

      return;
    }

    // Standard Category
    const catObj = CATEGORIES.find(c => c.id === catId);
    const catName = catObj?.name || catId.toUpperCase();
    const subCats = MASTER_TAXONOMY[catId] || [];
    const subCatSet = new Set(subCats.flatMap(s => [s.id.toLowerCase(), s.slug.toLowerCase(), s.name.toLowerCase()]));

    // Strictly match articles belonging to this category or its subcategories
    const catArticles = ArticleService.getArticles().filter(a => {
      const aCat = (a.category || '').toLowerCase();
      const aSub = (a.subCategory || '').toLowerCase();
      return aCat === catId.toLowerCase() || (aSub && subCatSet.has(aSub));
    }).slice(0, 3);

    headerMegaMenu.innerHTML = `
      <div class="mega-menu-inner container">
        <!-- Left: Browse Category (2 Parallel Columns of 10 Subcategories) -->
        <div class="mega-browse-col">
          <div class="mega-col-heading">
            <span>Kanal ${catName}</span>
            <a href="#" class="mega-view-all-link" data-cat="${catId}">Lihat Semua Berita ${catName} →</a>
          </div>
          <div class="mega-subcategories-2col">
            ${subCats.map(sub => `
              <a href="#" class="mega-subcat-link" data-cat="${catId}" data-subcat="${sub.slug}">
                ${sub.name}
              </a>
            `).join('')}
          </div>
        </div>

        <!-- Right: Latest Articles in this Specific Category -->
        <div class="mega-latest-col">
          <div class="mega-col-heading">
            <span>Liputan Terkini: ${catName}</span>
          </div>
          ${catArticles.length > 0 ? `
            <div class="mega-articles-stack">
              ${catArticles.map(art => `
                <div class="mega-article-row" data-slug="${art.slug || art.id}" data-title="${escapeHtml(art.title)}">
                  <div class="mega-article-row-content">
                    <span class="mega-article-row-tag">${art.subCategory || art.category}</span>
                    <h4 class="mega-article-row-title">${art.title}</h4>
                    <div class="mega-article-row-meta">
                      <span>${formatDate(art.publishedAt, store.preferences.language)}</span>
                    </div>
                  </div>
                  <img src="${getSafeImageUrl(art.imageUrl)}" alt="${escapeHtml(art.title)}" class="mega-article-row-thumb" loading="lazy" ${IMG_ONERROR} />
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="mega-empty-articles">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style="font-size:0.85rem; color:var(--text-muted);">Belum ada berita terbaru di kanal ${catName}. Liputan khusus sedang disiapkan oleh redaksi.</span>
            </div>
          `}
        </div>
      </div>
    `;

    headerMegaMenu.style.display = 'block';

    // Subcategory links click handlers
    headerMegaMenu.querySelectorAll('.mega-subcat-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const c = link.getAttribute('data-cat');
        const s = link.getAttribute('data-subcat');
        if (c && s) {
          hideMegaMenu();
          store.currentCategory = c as any;
          store.currentSubCategory = s;
          Router.navigateToSubCategory(c as any, s);
          FeedSection.renderCategories();
          FeedSection.renderSubCategories();
          FeedSection.render();
          document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // "Lihat Semua Berita..." link
    headerMegaMenu.querySelector('.mega-view-all-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      hideMegaMenu();
      handleCategoryNavClick(catId);
    });

    // Article rows click handlers
    headerMegaMenu.querySelectorAll('.mega-article-row').forEach(row => {
      row.addEventListener('click', () => {
        const slug = row.getAttribute('data-slug');
        const title = row.getAttribute('data-title');
        if (slug) {
          hideMegaMenu();
          Router.navigateToArticle(slug, title || '');
        }
      });
    });
  };

  headerMegaMenu?.addEventListener('mouseenter', cancelHideMegaMenu);
  headerMegaMenu?.addEventListener('mouseleave', scheduleHideMegaMenu);

  const handleCategoryNavClick = (catId: string) => {
    if (!catId) return;
    store.currentCategory = catId as any;
    store.currentSubCategory = null;
    if (catId === 'all') {
      Router.navigateHome();
    } else {
      Router.navigateToCategory(catId as any);
    }
    FeedSection.renderCategories();
    FeedSection.renderSubCategories();
    FeedSection.render();

    // Update active state in unified header nav
    document.querySelectorAll('#header-categories-nav a[data-nav-category]').forEach(link => {
      const linkCat = link.getAttribute('data-nav-category');
      link.classList.toggle('active', linkCat === catId);
    });

    const feedEl = document.getElementById('hero-section') || document.getElementById('featured-article-container');
    feedEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Bind Header Categories Nav links (hover triggers mega menu, click navigates)
  document.querySelectorAll('#header-categories-nav a[data-nav-category]').forEach(link => {
    const cat = link.getAttribute('data-nav-category');
    link.addEventListener('mouseenter', () => {
      if (cat && cat !== 'all') {
        renderMegaMenu(cat);
      } else {
        hideMegaMenu();
      }
    });
    link.addEventListener('mouseleave', scheduleHideMegaMenu);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      hideMegaMenu();
      if (cat === 'more') {
        openCategoryDrawer();
        return;
      }
      if (cat) handleCategoryNavClick(cat);
    });
  });

  // Footer Category Links
  document.querySelectorAll('.footer-category-link[data-footer-category]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-footer-category');
      if (cat) handleCategoryNavClick(cat);
    });
  });

  // --------------------------------------------------------------------------
  // Hamburger Menu & Structured Directory Controller (Ala CNN/Reuters Directory)
  // --------------------------------------------------------------------------
  const btnHamburgerMenu = document.getElementById('btn-hamburger-menu');
  const categoryDrawerOverlay = document.getElementById('category-drawer-overlay');
  const btnDrawerClose = document.getElementById('btn-drawer-close');
  const drawerCategoriesTree = document.getElementById('drawer-categories-tree');

  const openCategoryDrawer = () => {
    if (categoryDrawerOverlay) {
      categoryDrawerOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('modal-opened'));
    }
  };

  const closeCategoryDrawer = () => {
    if (categoryDrawerOverlay) {
      categoryDrawerOverlay.style.display = 'none';
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  };

  btnHamburgerMenu?.addEventListener('click', openCategoryDrawer);
  btnDrawerClose?.addEventListener('click', closeCategoryDrawer);
  categoryDrawerOverlay?.addEventListener('click', (e) => {
    if (e.target === categoryDrawerOverlay) closeCategoryDrawer();
  });

  // Populate Structured Directory Overlay with 14 Categories and their Subcategories (CNN Style)
  if (drawerCategoriesTree) {
    const categories14 = CATEGORIES.filter(c => c.id !== 'all');
    drawerCategoriesTree.innerHTML = categories14.map(cat => {
      const subCats = MASTER_TAXONOMY[cat.id] || [];
      return `
        <div class="directory-col-group">
          <a href="#" class="directory-cat-title" data-cat="${cat.id}">
            ${cat.name}
          </a>
          <div class="directory-subcats-stack">
            ${subCats.map(sub => `
              <a href="#" class="directory-subcat-link" data-cat="${cat.id}" data-subcat="${sub.slug}">
                ${sub.name}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    drawerCategoriesTree.querySelectorAll('.directory-cat-title').forEach(hdr => {
      hdr.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = hdr.getAttribute('data-cat');
        if (cat) {
          closeCategoryDrawer();
          handleCategoryNavClick(cat);
        }
      });
    });

    drawerCategoriesTree.querySelectorAll('.directory-subcat-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-cat');
        const sub = link.getAttribute('data-subcat');
        if (cat && sub) {
          closeCategoryDrawer();
          store.currentCategory = cat as any;
          store.currentSubCategory = sub;
          Router.navigateToSubCategory(cat as any, sub);
          FeedSection.renderCategories();
          FeedSection.renderSubCategories();
          FeedSection.render();
          document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isTyping) {
      e.preventDefault();
      openSearchOverlay();
    }
    if (e.key === 'Escape') {
      closeSearchOverlay();
      closeCategoryDrawer();
      closeUserAvatarDropdown();
      hideMegaMenu();
      SearchPreview.close();
      ArticleReaderModal.close(true);
      UserAuthModal.close();
      BookmarksModal.close();
      closeAdminCMSModal();
    }
  });

  // Modals close triggers
  document.getElementById('modal-close-btn')?.addEventListener('click', () => ArticleReaderModal.close(true));
  document.getElementById('bookmarks-btn')?.addEventListener('click', () => BookmarksModal.open());
  document.getElementById('bookmarks-close-btn')?.addEventListener('click', () => BookmarksModal.close());
  document.getElementById('user-auth-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('user-auth-modal')) UserAuthModal.close();
  });
  document.getElementById('reader-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('reader-modal')) ArticleReaderModal.close(true);
  });
  document.getElementById('bookmarks-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('bookmarks-modal')) BookmarksModal.close();
  });
  adminCmsModal?.addEventListener('click', (e) => {
    if (e.target === adminCmsModal) { closeAdminCMSModal(); Router.navigateHome(); }
  });

  // Logo Button
  document.getElementById('logo-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    store.currentCategory = 'all';
    store.searchQuery = '';
    SearchPreview.close();
    if (searchInput) searchInput.value = '';
    Router.navigateHome();
    FeedSection.renderCategories();
    FeedSection.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Newsletter Handlers
  const handleNewsletter = async (formId: string) => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]') as HTMLInputElement;
      const res = await ApiService.subscribeNewsletter(input?.value || '');
      Toast.show(res || store.t('alertSubscribe'));
      form.reset();
    });
  };
  handleNewsletter('newsletter-form');
  handleNewsletter('footer-newsletter-form');

  // Language Switcher
  const langSwitcher = document.getElementById('lang-toggle-switcher');
  if (langSwitcher) {
    const currentLang = store.preferences.language;
    langSwitcher.querySelectorAll('.btn-lang').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === currentLang);
    });

    langSwitcher.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.btn-lang') as HTMLElement | null;
      if (!target) return;
      const lang = target.getAttribute('data-lang') as 'id' | 'en';
      if (lang === store.preferences.language) return;

      GoogleTranslateService.setLanguage(lang);
      langSwitcher.querySelectorAll('.btn-lang').forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
      if (searchInput) searchInput.placeholder = store.t('searchPlaceholder');

      FeedSection.renderCategories();
      HeroSection.renderBreakingBanner();
      HeroSection.render();
      BentoSection.render();
      DeepTechSection.render();
      FeedSection.renderFilterTags();
      FeedSection.render();
      updateFooterLabels();
      updateFilterLabels();
      CookieConsent.updateLabels();

      Toast.show(lang === 'en' ? 'Website diterjemahkan ke Bahasa Inggris' : 'Bahasa dikembalikan ke Indonesia');
    });
  }

  // Back to Top Button click handler
  document.getElementById('btn-back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', init);
