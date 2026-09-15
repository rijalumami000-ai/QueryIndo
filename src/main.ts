import './styles/main.css';
import type { CategoryId, TechIndexItem } from './types/news';
import { ArticleService } from './services/articleService';
import { AdminCMS } from './components/AdminCMS';
import { ReaderAuthService, type ReaderUser } from './services/authService';
import { ApiService } from './services/apiService';
import { InstitutionalPages, type InstitutionalPageId } from './components/InstitutionalPages';
import { ByteShorts } from './components/ByteShorts';
import { Toast } from './utils/toast';
import { SeoService } from './utils/seoService';
import { SocialMediaService } from './services/socialMediaService';
import { store } from './state/store';
import { Router } from './router';
import { HeroSection } from './sections/HeroSection';
import { BentoSection } from './sections/BentoSection';
import { DeepTechSection } from './sections/DeepTechSection';
import { FeedSection } from './sections/FeedSection';
import { ArticleReaderModal } from './sections/ArticleReaderModal';
import { BookmarksModal } from './sections/BookmarksModal';
import { SearchPreview } from './sections/SearchPreview';
import Lenis from 'lenis';

// DOM Elements
const techTickerList = document.getElementById('tech-ticker-list');
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const themeToggleBtn = document.getElementById('theme-toggle');
const bookmarksBtn = document.getElementById('bookmarks-btn');
const bookmarksCloseBtn = document.getElementById('bookmarks-close-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const userAuthBtn = document.getElementById('user-auth-btn');
const mUserAuthBtn = document.getElementById('m-user-auth-btn');
const userAuthModal = document.getElementById('user-auth-modal');
const userAuthContainer = document.getElementById('user-auth-container');
const adminCmsModal = document.getElementById('admin-cms-modal');
const adminCmsContainer = document.getElementById('admin-cms-container');
const institutionalPageContainer = document.getElementById('institutional-page-container');
const mainContent = document.querySelector('main.container') as HTMLElement | null;
const byteShortsContainer = document.getElementById('byteshorts-bar-container');
const filterPanel = document.getElementById('advanced-filter-panel');
const filterToggleBtn = document.getElementById('btn-filter-toggle');
const filterSortBy = document.getElementById('filter-sort-by') as HTMLSelectElement | null;
const filterDateRange = document.getElementById('filter-date-range') as HTMLSelectElement | null;

// Admin CMS Instance
const adminCMS = new AdminCMS(() => {
  HeroSection.renderBreakingBanner();
  HeroSection.render();
  BentoSection.render();
  DeepTechSection.render();
  FeedSection.render();
});

// Smooth Scroll (Lenis)
let lenisInstance: Lenis | null = null;

window.addEventListener('modal-opened', () => {
  lenisInstance?.stop();
});

window.addEventListener('modal-closed', () => {
  const anyModalOpen = document.querySelector('.modal-overlay.open, #byte-focus-mode-overlay, #manuscript-editor-fullscreen');
  if (!anyModalOpen) {
    lenisInstance?.start();
  }
});

// --------------------------------------------------------------------------
// Application Initialization
// --------------------------------------------------------------------------
async function init() {
  // 1. Lenis Smooth Scroll
  if (window.innerWidth > 768) {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    const raf = (time: number) => {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // 2. Initialize Store Badges & UI
  store.updateCurrentDateBadge();
  store.updateBookmarkBadge();
  updateUserNavbarState();

  // 3. Fetch Articles & Indices from Backend
  try {
    await ApiService.checkBackendHealth();
    await ArticleService.syncWithBackend();
  } catch (err) {
    console.warn('Backend unavailable, using local mock data', err);
  }

  try {
    const liveIndices = await ApiService.getTechIndexes();
    if (liveIndices && liveIndices.length > 0) {
      store.liveTechIndexes = liveIndices;
    }
  } catch (err) {
    console.warn('Indices API error', err);
  }

  // 4. Render All UI Sections
  renderTechIndexes();
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
  renderByteShorts();
  renderFooterSocials();
  SocialMediaService.subscribe(() => renderFooterSocials());

  // 5. Setup Listeners, Router & PWA
  setupEventListeners();
  setupPWAInstallPrompt();
  setupCookieConsent();
  updateFooterLabels();
  updateFilterLabels();
  SeoService.setHomeSEO();

  // 6. Bind Router Subscriptions
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
      closeInstitutionalPage();
      closeAdminCMSModal();
    } else if (route.type === 'admin') {
      ArticleReaderModal.close(false);
      closeInstitutionalPage();
      openAdminCMSModal();
    } else if (route.type === 'article' && route.param) {
      closeInstitutionalPage();
      closeAdminCMSModal();
      ArticleReaderModal.open(route.param, false);
    } else if (route.type === 'page' && route.param) {
      ArticleReaderModal.close(false);
      closeAdminCMSModal();
      openInstitutionalPage(route.param as InstitutionalPageId);
    } else if (route.type === 'category' && route.param) {
      ArticleReaderModal.close(false);
      closeInstitutionalPage();
      closeAdminCMSModal();
      store.currentCategory = route.param as CategoryId;
      FeedSection.renderCategories();
      FeedSection.render();
    }
  });
}

// --------------------------------------------------------------------------
// Admin CMS Modal Controller
// --------------------------------------------------------------------------
function openAdminCMSModal() {
  if (!adminCmsModal || !adminCmsContainer) return;
  window.dispatchEvent(new CustomEvent('modal-opened'));
  adminCmsContainer.innerHTML = adminCMS.renderAdminModalHTML();
  adminCmsModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  adminCMS.bindAdminEvents(adminCmsContainer);

  adminCmsContainer.querySelector('#admin-modal-close-btn')?.addEventListener('click', () => {
    closeAdminCMSModal();
    Router.navigateHome();
  });
}

function closeAdminCMSModal() {
  if (adminCmsModal && adminCmsModal.classList.contains('open')) {
    adminCmsModal.classList.remove('open');
    document.body.style.overflow = '';
    window.dispatchEvent(new CustomEvent('modal-closed'));
  }
}

// --------------------------------------------------------------------------
// Institutional Full-Page Controller
// --------------------------------------------------------------------------
function openInstitutionalPage(pageId: InstitutionalPageId) {
  if (!institutionalPageContainer || !mainContent) return;

  mainContent.style.display = 'none';
  institutionalPageContainer.innerHTML = InstitutionalPages.renderPage(pageId, store.preferences.language);
  institutionalPageContainer.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Back button returns home
  institutionalPageContainer.querySelectorAll('.inst-back-btn, nav a[href="/"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Router.navigateHome();
    });
  });

  // Contact form submission
  const contactForm = institutionalPageContainer.querySelector('#institutional-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      Toast.show(store.preferences.language === 'en' ? 'Your message has been sent! Our team will respond within 2 business days.' : 'Pesan Anda telah terkirim! Tim kami akan merespons dalam 2 hari kerja.');
    });
  }
}

function closeInstitutionalPage() {
  if (!institutionalPageContainer || !mainContent) return;
  if (institutionalPageContainer.style.display === 'none') return;

  institutionalPageContainer.style.display = 'none';
  institutionalPageContainer.innerHTML = '';
  mainContent.style.display = '';
}

// --------------------------------------------------------------------------
// User Authentication & Profile Drawer
// --------------------------------------------------------------------------
function updateUserNavbarState() {
  const currentReader = ReaderAuthService.getCurrentReader();
  if (currentReader) {
    const firstName = currentReader.name.split(' ')[0];
    if (userAuthBtn) {
      userAuthBtn.innerHTML = `
        <img src="${currentReader.avatar}" alt="${currentReader.name}" class="user-avatar-badge" />
        <span id="user-auth-btn-text" style="font-weight:700;">${firstName}</span>
      `;
      userAuthBtn.title = `Akun: ${currentReader.name} (Klik untuk Buka Profil)`;
      userAuthBtn.style.background = 'rgba(0, 242, 254, 0.12)';
    }
    if (mUserAuthBtn) {
      mUserAuthBtn.innerHTML = `
        <img src="${currentReader.avatar}" alt="${currentReader.name}" class="user-avatar-badge" />
        <span id="m-user-auth-btn-text">${firstName}</span>
      `;
    }
  } else {
    if (userAuthBtn) {
      userAuthBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span id="user-auth-btn-text">Masuk</span>
      `;
      userAuthBtn.title = 'Masuk / Daftar Akun Pembaca QUERYINDO';
      userAuthBtn.style.background = 'rgba(0, 242, 254, 0.08)';
    }
    if (mUserAuthBtn) {
      mUserAuthBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span id="m-user-auth-btn-text">Masuk / Akun</span>
      `;
    }
  }
}

function openUserAuthModal() {
  if (!userAuthModal || !userAuthContainer) return;
  window.dispatchEvent(new CustomEvent('modal-opened'));

  const currentReader = ReaderAuthService.getCurrentReader();
  if (currentReader) {
    renderUserProfileHTML(currentReader);
  } else {
    renderGoogleAuthModalHTML();
  }

  userAuthModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderUserProfileHTML(reader: ReaderUser) {
  if (!userAuthContainer) return;
  const savedCount = store.preferences.savedArticleIds.length;
  let historyCount = 0;
  try {
    const history = JSON.parse(localStorage.getItem('byte_reading_history') || '[]');
    historyCount = history.length;
  } catch {}

  const joinDate = new Date(reader.registeredAt).toLocaleDateString(store.preferences.language === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  userAuthContainer.innerHTML = `
    <div class="modal-header-bar" style="background: var(--bg-tertiary); padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.1rem; font-weight: 800;">Akun Pembaca</span>
        <span style="font-size: 0.68rem; padding: 0.15rem 0.5rem; background: rgba(66, 133, 244, 0.15); color: #60a5fa; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.3rem;">
          Google Connected
        </span>
      </div>
      <button class="btn-close" id="user-auth-close-btn" style="color: var(--text-muted); cursor: pointer; font-size: 1.1rem; background:none; border:none;">✕</button>
    </div>

    <div style="padding: 1.5rem;">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle);">
        <img src="${reader.avatar}" alt="${reader.name}" style="width: 58px; height: 58px; border-radius: 50%; border: 2px solid var(--accent-cyan); object-fit: cover;" />
        <div>
          <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0 0 0.25rem 0; color: var(--text-primary);">${reader.name}</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${reader.email}</p>
          <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Terdaftar sejak ${joinDate}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem;">
        <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono);">${savedCount}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Artikel Tersimpan</div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--accent-emerald); font-family: var(--font-mono);">${historyCount}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Riwayat Baca</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        <button id="btn-open-my-bookmarks" style="width: 100%; padding: 0.75rem; background: var(--gradient-brand); color: #000; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-md); border: none; cursor: pointer;">
          📌 Buka Koleksi Tersimpan (${savedCount})
        </button>
        <button id="btn-user-logout" style="width: 100%; padding: 0.7rem; background: rgba(244, 63, 94, 0.1); color: var(--accent-rose); border: 1px solid rgba(244, 63, 94, 0.25); font-weight: 700; font-size: 0.825rem; border-radius: var(--radius-md); cursor: pointer;">
          🚪 Keluar dari Akun Google
        </button>
      </div>
    </div>
  `;

  userAuthContainer.querySelector('#user-auth-close-btn')?.addEventListener('click', closeUserAuthModal);
  userAuthContainer.querySelector('#btn-open-my-bookmarks')?.addEventListener('click', () => {
    closeUserAuthModal();
    BookmarksModal.open();
  });
  userAuthContainer.querySelector('#btn-user-logout')?.addEventListener('click', () => {
    ReaderAuthService.logout();
    Toast.show('Anda telah keluar dari akun Google.');
    updateUserNavbarState();
    closeUserAuthModal();
  });
}

function renderGoogleAuthModalHTML() {
  if (!userAuthContainer) return;

  userAuthContainer.innerHTML = `
    <div class="modal-header-bar" style="background: var(--bg-tertiary); padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">Masuk dengan Google</span>
      </div>
      <button class="btn-close" id="user-auth-close-btn" style="color: var(--text-muted); cursor: pointer; font-size: 1.1rem; background: none; border: none;">✕</button>
    </div>

    <div style="padding: 1.75rem 1.5rem; text-align: center;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: #ffffff; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
        <svg width="28" height="28" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      </div>

      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem 0;">
        Hubungkan Akun Google Anda
      </h3>
      
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 1.5rem 0; line-height: 1.55;">
        Simpan artikel favorit, riwayat baca, dan sinkronkan preferensi berita secara aman dengan Akun Google Anda di <strong>QUERYINDO</strong>.
      </p>

      <button 
        id="btn-google-oauth-launch"
        type="button"
        style="width: 100%; padding: 0.9rem 1.25rem; background: #ffffff; color: #1f2937; font-weight: 700; font-size: 0.95rem; border-radius: var(--radius-md); border: 1px solid rgba(0,0,0,0.12); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.12); transition: all 0.2s ease;"
      >
        <span id="btn-google-oauth-text">Lanjutkan dengan Google</span>
      </button>

      <div style="margin-top: 1.5rem; padding-top: 0.85rem; border-top: 1px solid var(--border-subtle); text-align: center; font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">
        Dengan melanjutkan, preferensi baca, apresiasi suka, dan artikel tersimpan Anda akan disinkronkan secara otomatis dan aman di akun Google Anda.
      </div>
    </div>
  `;

  userAuthContainer.querySelector('#user-auth-close-btn')?.addEventListener('click', closeUserAuthModal);

  const launchBtn = userAuthContainer.querySelector('#btn-google-oauth-launch') as HTMLButtonElement;
  const launchText = userAuthContainer.querySelector('#btn-google-oauth-text') as HTMLElement;

  launchBtn?.addEventListener('click', async () => {
    if (launchBtn.disabled) return;
    launchBtn.disabled = true;
    if (launchText) launchText.textContent = 'Membuka Google Sign-In...';

    try {
      const res = await ReaderAuthService.signInWithGoogleOAuth();
      store.preferences.savedArticleIds = res.user.savedArticles || [];
      if (res.user.likedArticles) {
        store.preferences.likedArticleIds = Array.from(new Set([...store.preferences.likedArticleIds, ...res.user.likedArticles]));
        localStorage.setItem('byte_likes', JSON.stringify(store.preferences.likedArticleIds));
      }
      store.updateBookmarkBadge();
      updateUserNavbarState();
      Toast.show(res.message);
      closeUserAuthModal();
    } catch (err: any) {
      Toast.show(err.message || 'Gagal login dengan Google.');
    } finally {
      if (launchBtn) launchBtn.disabled = false;
      if (launchText) launchText.textContent = 'Lanjutkan dengan Google';
    }
  });
}

function closeUserAuthModal() {
  if (userAuthModal) {
    userAuthModal.classList.remove('open');
    document.body.style.overflow = '';
    window.dispatchEvent(new CustomEvent('modal-closed'));
  }
}

// --------------------------------------------------------------------------
// Tech Index Ticker & Charts
// --------------------------------------------------------------------------
function renderTechIndexes() {
  if (!techTickerList) return;
  const items = store.liveTechIndexes;
  const renderItem = (item: TechIndexItem) => `
    <div class="ticker-item" data-symbol="${item.symbol}">
      <span class="ticker-symbol">${item.symbol}</span>
      <span class="ticker-val">${item.value}</span>
      <span class="ticker-change ${item.isPositive ? 'up' : 'down'}">${item.change}</span>
    </div>
  `;
  techTickerList.innerHTML = items.map(renderItem).join('') + items.map(renderItem).join('');

  techTickerList.querySelectorAll('.ticker-item').forEach(el => {
    el.addEventListener('click', (e) => {
      const sym = (el as HTMLElement).getAttribute('data-symbol');
      const item = items.find(i => i.symbol === sym);
      if (item) showTickerChart(item, e.currentTarget as HTMLElement);
    });
  });
}

function generateSVGChart(item: TechIndexItem): string {
  const data = item.historicalData;
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 260;
  const h = 70;
  const pad = 6;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lineColor = item.isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)';
  const gradId = `tgrad-${item.symbol.replace(/[^a-zA-Z0-9]/g, '')}`;
  const areaPoints = `${pad},${h} ${points.join(' ')} ${w - pad},${h}`;
  const dots = points.map(p => {
    const [x, y] = p.split(',');
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="${lineColor}" class="chart-dot"/>`;
  }).join('');

  return `
  <svg class="ticker-chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <polygon points="${areaPoints}" fill="url(#${gradId})"/>
    <polyline points="${points.join(' ')}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chart-line"/>
    ${dots}
  </svg>`;
}

function showTickerChart(item: TechIndexItem, anchorEl: HTMLElement) {
  document.querySelector('.ticker-chart-popup')?.remove();
  const values = item.historicalData.map(d => d.value);
  const fmt = (v: number) => v >= 1000 ? v.toLocaleString('id-ID') : v.toFixed(2);
  const isLive = ApiService.isBackendAvailable && item.symbol !== 'STARTUP-RI';
  const footerText = isLive ? store.t('chartFooter') : store.t('chartFooterFallback');

  const popup = document.createElement('div');
  popup.className = 'ticker-chart-popup';
  popup.innerHTML = `
    <div class="ticker-chart-header">
      <div class="ticker-chart-title">
        <span class="ticker-chart-symbol">${item.symbol}</span>
        <span class="ticker-chart-name">${item.name}</span>
      </div>
      <div class="ticker-chart-meta">
        <span class="ticker-chart-value">${item.value}</span>
        <span class="ticker-chart-change ${item.isPositive ? 'up' : 'down'}">${item.change}</span>
      </div>
      <button class="ticker-chart-close" aria-label="Tutup">&times;</button>
    </div>
    <div class="ticker-chart-body">
      ${generateSVGChart(item)}
    </div>
    <div class="ticker-chart-stats">
      <div class="stat-item"><span class="stat-label">Open</span><span class="stat-val">${fmt(values[0])}</span></div>
      <div class="stat-item"><span class="stat-label">High</span><span class="stat-val up">${fmt(Math.max(...values))}</span></div>
      <div class="stat-item"><span class="stat-label">Low</span><span class="stat-val down">${fmt(Math.min(...values))}</span></div>
      <div class="stat-item"><span class="stat-label">Close</span><span class="stat-val">${fmt(values[values.length - 1])}</span></div>
    </div>
    <div class="ticker-chart-footer">
      <span>${footerText}</span>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = popup.querySelector('.ticker-chart-close')!;
  closeBtn.addEventListener('click', () => popup.remove());

  const onClickOutside = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
      popup.remove();
      document.removeEventListener('click', onClickOutside);
    }
  };
  setTimeout(() => document.addEventListener('click', onClickOutside), 50);

  const onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      popup.remove();
      document.removeEventListener('keydown', onEsc);
    }
  };
  document.addEventListener('keydown', onEsc);
  requestAnimationFrame(() => popup.classList.add('show'));
}

// --------------------------------------------------------------------------
// ByteShorts & Social Channels
// --------------------------------------------------------------------------
function renderByteShorts() {
  if (!byteShortsContainer) return;
  byteShortsContainer.innerHTML = ByteShorts.renderBarHTML(store.preferences.language);
  ByteShorts.bindBarEvents(byteShortsContainer, store.preferences.language, (articleId: string) => {
    const article = ArticleService.getArticleById(articleId);
    if (article) {
      Router.navigateToArticle(article.slug || article.id, article.title);
    }
  });
}

function renderFooterSocials() {
  const container = document.getElementById('footer-social-list');
  if (container) {
    container.innerHTML = SocialMediaService.renderFooterSocialListHTML();
  }
}

// --------------------------------------------------------------------------
// Localization & Filter UI Sync
// --------------------------------------------------------------------------
function updateFooterLabels() {
  const companyTitle = document.getElementById('footer-company-title');
  const linkAbout = document.getElementById('link-about');
  const linkContact = document.getElementById('link-contact');
  const linkRedaksi = document.getElementById('link-redaksi');
  const linkEthics = document.getElementById('link-ethics');
  const linkCyber = document.getElementById('link-cyber-guidelines');
  const linkDisclaimer = document.getElementById('link-disclaimer');
  const linkAds = document.getElementById('link-ads');

  if (companyTitle) companyTitle.textContent = store.t('companyText');
  if (linkAbout) linkAbout.textContent = store.t('aboutUs');
  if (linkContact) linkContact.textContent = store.t('getInTouch');
  if (linkRedaksi) linkRedaksi.textContent = store.t('redaksiText');
  if (linkEthics) linkEthics.textContent = store.t('ethicsCode');
  if (linkCyber) linkCyber.textContent = store.t('cyberGuidelines');
  if (linkDisclaimer) linkDisclaimer.textContent = store.t('disclaimerText');
  if (linkAds) linkAds.textContent = store.t('adsText');
}

function updateFilterLabels() {
  const lblSortBy = document.getElementById('lbl-sort-by');
  const lblDateRange = document.getElementById('lbl-date-range');
  const lblPopularTags = document.getElementById('lbl-popular-tags');

  if (lblSortBy) lblSortBy.textContent = store.t('lblSortBy');
  if (lblDateRange) lblDateRange.textContent = store.t('lblDateRange');
  if (lblPopularTags) lblPopularTags.textContent = store.t('lblPopularTags');

  if (filterSortBy) {
    filterSortBy.options[0].text = store.t('optLatest');
    filterSortBy.options[1].text = store.t('optViews');
    filterSortBy.options[2].text = store.t('optLikes');
  }

  if (filterDateRange) {
    filterDateRange.options[0].text = store.t('optAllTime');
    filterDateRange.options[1].text = store.t('optLast24h');
    filterDateRange.options[2].text = store.t('optThisWeek');
    filterDateRange.options[3].text = store.t('optThisMonth');
  }
}

// --------------------------------------------------------------------------
// Cookie Consent & PWA Prompt
// --------------------------------------------------------------------------
function setupCookieConsent() {
  const banner = document.getElementById('cookie-consent-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  const rejectBtn = document.getElementById('cookie-reject-btn');
  if (!banner || !acceptBtn || !rejectBtn) return;

  const consent = localStorage.getItem('byte_cookie_consent');
  if (!consent) {
    setTimeout(() => banner.classList.add('show'), 1500);
  }

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('byte_cookie_consent', 'accepted');
    banner.classList.remove('show');
    Toast.show(store.t('cookieToastAccept'));
  });

  rejectBtn.addEventListener('click', () => {
    localStorage.setItem('byte_cookie_consent', 'rejected');
    banner.classList.remove('show');
    Toast.show(store.t('cookieToastReject'));
  });
}

function setupPWAInstallPrompt() {
  let deferredPrompt: any = null;
  const pwaInstallBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) pwaInstallBtn.style.display = 'inline-flex';
  });

  pwaInstallBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        Toast.show(store.preferences.language === 'en' ? 'Thank you for installing QUERYINDO App!' : 'Terima kasih telah memasang aplikasi QUERYINDO!');
      }
      deferredPrompt = null;
      pwaInstallBtn.style.display = 'none';
    } else {
      Toast.show(store.preferences.language === 'en' ? 'App can be added via browser "Add to Home screen" menu.' : 'Gunakan menu browser "Tambahkan ke Layar Utama" untuk memasang aplikasi.');
    }
  });

  window.addEventListener('appinstalled', () => {
    if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
    deferredPrompt = null;
  });
}

// --------------------------------------------------------------------------
// Global Event Listeners
// --------------------------------------------------------------------------
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn?.addEventListener('click', () => store.toggleTheme());

  // Store Event Listeners
  store.subscribe('bookmarks-change', () => {
    BentoSection.render();
    DeepTechSection.render();
    FeedSection.render();
  });

  // Global Auth Events
  window.addEventListener('open-auth-modal', () => openUserAuthModal());
  window.addEventListener('open-reader-auth-modal', () => openUserAuthModal());
  window.addEventListener('reader-auth-change', () => {
    updateUserNavbarState();
    store.updateBookmarkBadge();
  });

  userAuthBtn?.addEventListener('click', () => openUserAuthModal());
  mUserAuthBtn?.addEventListener('click', () => openUserAuthModal());

  // Search Live Preview
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    store.searchQuery = query;
    FeedSection.render();
    SearchPreview.render(query);
  });

  searchInput?.addEventListener('focus', () => {
    if (searchInput.value.trim()) {
      SearchPreview.render(searchInput.value);
    }
  });

  searchInput?.addEventListener('keydown', (e) => {
    SearchPreview.handleKeyNavigation(e);
  });

  document.addEventListener('click', (e) => {
    const searchBox = document.getElementById('navbar-search-box');
    if (searchBox && !searchBox.contains(e.target as Node)) {
      SearchPreview.close();
    }
  });

  // Filter Panel Toggle & Selects
  filterToggleBtn?.addEventListener('click', () => {
    if (filterPanel) {
      const isHidden = filterPanel.style.display === 'none';
      filterPanel.style.display = isHidden ? 'block' : 'none';
      (filterToggleBtn as HTMLElement).style.color = isHidden ? 'var(--accent-cyan)' : 'var(--text-secondary)';
    }
  });

  filterSortBy?.addEventListener('change', () => {
    store.selectedFilterSortBy = filterSortBy.value;
    FeedSection.render();
  });

  filterDateRange?.addEventListener('change', () => {
    store.selectedFilterDateRange = filterDateRange.value;
    FeedSection.render();
  });

  // Global Keyboard Shortcuts (Esc to close modals, '/' or 'Ctrl+K' to focus search)
  window.addEventListener('keydown', (e) => {
    const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';

    if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && !isTyping) {
      e.preventDefault();
      searchInput?.focus();
    }

    if (e.key === 'Escape') {
      SearchPreview.close();
      ArticleReaderModal.close(true);
      closeUserAuthModal();
      BookmarksModal.close();
      closeAdminCMSModal();
    }
  });

  // Modal Closures
  modalCloseBtn?.addEventListener('click', () => ArticleReaderModal.close(true));
  bookmarksBtn?.addEventListener('click', () => BookmarksModal.open());
  bookmarksCloseBtn?.addEventListener('click', () => BookmarksModal.close());

  userAuthModal?.addEventListener('click', (e) => {
    if (e.target === userAuthModal) closeUserAuthModal();
  });

  const readerModal = document.getElementById('reader-modal');
  readerModal?.addEventListener('click', (e) => {
    if (e.target === readerModal) ArticleReaderModal.close(true);
  });

  const bookmarksModal = document.getElementById('bookmarks-modal');
  bookmarksModal?.addEventListener('click', (e) => {
    if (e.target === bookmarksModal) BookmarksModal.close();
  });

  adminCmsModal?.addEventListener('click', (e) => {
    if (e.target === adminCmsModal) {
      closeAdminCMSModal();
      Router.navigateHome();
    }
  });

  // Logo Button
  const logoBtn = document.getElementById('logo-btn');
  logoBtn?.addEventListener('click', (e) => {
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

  // Newsletter Subscriptions
  const newsletterForm = document.getElementById('newsletter-form');
  newsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]') as HTMLInputElement;
    const email = input?.value || '';
    const res = await ApiService.subscribeNewsletter(email);
    Toast.show(res || store.t('alertSubscribe'));
    (newsletterForm as HTMLFormElement).reset();
  });

  const footerNewsletterForm = document.getElementById('footer-newsletter-form');
  footerNewsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = footerNewsletterForm.querySelector('input[type="email"]') as HTMLInputElement;
    const email = input?.value || '';
    const res = await ApiService.subscribeNewsletter(email);
    Toast.show(res || store.t('alertSubscribe'));
    (footerNewsletterForm as HTMLFormElement).reset();
  });

  // Language Switcher
  const langSwitcher = document.getElementById('lang-toggle-switcher');
  if (langSwitcher) {
    langSwitcher.querySelectorAll('.btn-lang').forEach(btn => {
      const lang = (btn as HTMLElement).getAttribute('data-lang');
      btn.classList.toggle('active', lang === store.preferences.language);
    });

    langSwitcher.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.btn-lang') as HTMLElement | null;
      if (!target) return;
      const lang = target.getAttribute('data-lang') as 'id' | 'en';
      if (lang === store.preferences.language) return;

      store.setLanguage(lang);

      langSwitcher.querySelectorAll('.btn-lang').forEach(btn => {
        btn.classList.toggle('active', (btn as HTMLElement).getAttribute('data-lang') === lang);
      });

      if (searchInput) searchInput.placeholder = store.t('searchPlaceholder');

      // Re-render UI
      FeedSection.renderCategories();
      HeroSection.renderBreakingBanner();
      HeroSection.render();
      BentoSection.render();
      DeepTechSection.render();
      FeedSection.renderFilterTags();
      FeedSection.render();
      renderByteShorts();
      updateFooterLabels();
      updateFilterLabels();

      Toast.show(lang === 'en' ? 'Language switched to English' : 'Bahasa diubah ke Indonesia');
    });
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById('btn-back-to-top');
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (backToTopBtn) {
      if (window.scrollY > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.pointerEvents = 'auto';
        backToTopBtn.style.transform = 'translateY(0)';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.pointerEvents = 'none';
        backToTopBtn.style.transform = 'translateY(10px)';
      }
    }
  });
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', init);
