import './styles/main.css';
import type { CategoryId } from './types/news';
import { ArticleService } from './services/articleService';
import { AuthorService } from './services/authorService';
import { ShoppingCarousel } from './components/ShoppingCarousel';
import { AdBanner } from './components/AdBanner';
import { AdminCMS } from './components/AdminCMS';
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
import Lenis from 'lenis';

// Admin CMS & Modal
const adminCmsModal = document.getElementById('admin-cms-modal');
const adminCmsContainer = document.getElementById('admin-cms-container');
const adminCMS = new AdminCMS(() => {
  HeroSection.renderBreakingBanner();
  HeroSection.render();
  BentoSection.render();
  DeepTechSection.render();
  FeedSection.render();
});

// Smooth Scroll (Lenis)
let lenisInstance: Lenis | null = null;
window.addEventListener('modal-opened', () => lenisInstance?.stop());
window.addEventListener('modal-closed', () => {
  if (!document.querySelector('.modal-overlay.open, #byte-focus-mode-overlay, #manuscript-editor-fullscreen')) {
    lenisInstance?.start();
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
      const progress = (scrollY / cachedDocHeight) * 100;
      cachedScrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
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

  // 2. Lenis Smooth Scroll (Ultra-Snappy 120fps Configuration)
  if (window.innerWidth > 768) {
    lenisInstance = new Lenis({ duration: 0.6, lerp: 0.12, smoothWheel: true, touchMultiplier: 1.2 });
    lenisInstance.on('scroll', handleGlobalScroll);
    const raf = (time: number) => { lenisInstance?.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', handleGlobalScroll, { passive: true });
  }
  handleGlobalScroll();

  // 3. Initialize Store Badges
  store.updateCurrentDateBadge();
  store.updateBookmarkBadge();
  UserAuthModal.updateUserNavbarState();

  // 4. INSTANT First Paint (0ms) from local memory/cache
  FeedSection.renderCategories();
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
    } else if (route.type === 'category' && route.param) {
      ArticleReaderModal.close(false);
      InstitutionalPages.close();
      closeAdminCMSModal();
      store.currentCategory = route.param as CategoryId;
      FeedSection.renderCategories();
      FeedSection.render();
      SeoService.setCategorySEO(route.param.toUpperCase(), route.param as CategoryId);
    }
  });
}

async function openAdminCMSModal() {
  if (!adminCmsModal || !adminCmsContainer) return;
  window.dispatchEvent(new CustomEvent('modal-opened'));

  // If local cache has no articles, fetch from backend first
  if (ArticleService.getArticles().length === 0) {
    await ArticleService.syncWithBackend();
  }

  adminCmsContainer.innerHTML = adminCMS.renderAdminModalHTML();
  adminCmsModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  adminCMS.bindAdminEvents(adminCmsContainer);

  adminCmsContainer.querySelector('#admin-modal-close-btn')?.addEventListener('click', () => {
    closeAdminCMSModal();
    Router.navigateHome();
  });

  // Always keep admin articles synchronized with backend
  ArticleService.syncWithBackend().then(() => {
    if (adminCmsModal?.classList.contains('open')) {
      adminCmsContainer.innerHTML = adminCMS.renderAdminModalHTML();
      adminCMS.bindAdminEvents(adminCmsContainer);
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

  document.getElementById('user-auth-btn')?.addEventListener('click', () => UserAuthModal.open());
  document.getElementById('m-user-auth-btn')?.addEventListener('click', () => UserAuthModal.open());

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

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isTyping) {
      e.preventDefault();
      searchInput?.focus();
    }
    if (e.key === 'Escape') {
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
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { duration: 0.8 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
