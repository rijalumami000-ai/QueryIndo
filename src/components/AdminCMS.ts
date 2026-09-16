import type { Article, CategoryId, AuthorProfile } from '../types/news';
import { CATEGORIES } from '../data/mockNews';
import { AuthService, ReaderAuthService } from '../services/authService';
import { AuthorService, EDITORIAL_DIVISIONS } from '../services/authorService';
import { ApiService } from '../services/apiService';
import { ArticleService } from '../services/articleService';
import { Toast } from '../utils/toast';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner, type AdCampaign, type AdPlacement } from './AdBanner';
import { ShoppingCarousel, type ShoppingProduct } from './ShoppingCarousel';
import { ReaderPoll, type PollData } from './ReaderPoll';
import { SocialMediaService, type SocialLink, type SocialPlatform, PLATFORM_METAS } from '../services/socialMediaService';
import { escapeHtml } from '../utils/helpers';

export class AdminCMS {
  private articles: Article[];
  private onArticlesChange: () => void;
  private searchKeyword: string = '';
  private activeTab: 'articles' | 'analytics' | 'authors' | 'ads' | 'shopping' | 'polls' | 'subscribers' | 'social' | 'settings' = 'articles';
  private adPlacementFilter: string = 'all';

  constructor(onArticlesChange: () => void) {
    this.articles = ArticleService.getArticles();
    this.onArticlesChange = onArticlesChange;
  }

  public renderAdminModalHTML(): string {
    this.articles = ArticleService.getArticles();
    const user = AuthService.getCurrentUser();

    // If not logged in, render Encrypted Login View
    if (!user) {
      return this.renderLoginViewHTML();
    }

    // If logged in, render Professional Fullscreen CMS Dashboard Workspace View
    return this.renderFullscreenDashboardHTML(user);
  }

  // Login View HTML
  private renderLoginViewHTML(): string {
    return `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: var(--bg-primary);">
        <div class="modal-header-bar" style="background: var(--bg-tertiary);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.2rem; height: 2.2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h3 style="font-weight: 800; font-size: 1.1rem;">Otentikasi Redaksi QUERYINDO</h3>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">Encrypted 256-Bit SSL Guard</span>
            </div>
          </div>
          <button class="btn-close" id="admin-login-close-btn" title="Tutup">✕</button>
        </div>

        <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem;">
          <div style="width: 100%; max-width: 420px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-xl);">
            <div style="text-align: center; margin-bottom: 2rem;">
              <div style="width: 3.5rem; height: 3.5rem; background: rgba(0, 242, 254, 0.1); border: 1px solid var(--accent-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto; color: var(--accent-cyan);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.4rem;">Dasbor Editorial</h2>
              <p style="font-size: 0.85rem; color: var(--text-muted);">Masuk dengan akun Founder & CEO atau Editor terverifikasi</p>
            </div>

            <form id="cms-login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div id="login-error-alert" style="display: none; padding: 0.75rem; background: rgba(244, 63, 94, 0.15); border: 1px solid var(--accent-rose); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.8rem;">
                Email atau kata sandi tidak valid.
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Email Redaksi / Akun Founder</label>
                <input type="text" id="login-email" required value="" placeholder="Rijalumami000@gmail.com" autocomplete="username" style="width: 100%; padding: 0.75rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Kata Sandi (Password)</label>
                <input type="password" id="login-password" required value="" placeholder="Masukkan kata sandi..." autocomplete="current-password" style="width: 100%; padding: 0.75rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
              </div>

              <button type="submit" id="btn-login-submit" style="margin-top: 0.5rem; width: 100%; padding: 0.85rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); border: none; font-size: 0.95rem; cursor: pointer; box-shadow: var(--shadow-glow);">
                Buka Dasbor Redaksi →
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

   // Format numeric statistics (handles <1k accurately without confusing 0.0k / 0.2k rounding)
  private formatStats(num: number): string {
    if (!num || num <= 0) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toLocaleString('id-ID');
  }

  // Professional Fullscreen CMS Dashboard Workspace
  private renderFullscreenDashboardHTML(user: ReturnType<typeof AuthService.getCurrentUser>): string {
    const isSuperuser = user?.role === 'superuser';
    if (!isSuperuser && this.activeTab !== 'articles' && this.activeTab !== 'analytics') {
      this.activeTab = 'articles';
    }

    const totalViews = this.articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0);
    const totalLikes = this.articles.reduce((acc, a) => acc + (a.likesCount || 0), 0);
    const featuredCount = this.articles.filter(a => a.isFeatured).length;

    const currentReader = ReaderAuthService.getCurrentReader();
    const matchedAuthor = user?.fullName ? AuthorService.getAuthorByName(user.fullName) : undefined;
    const userAvatar = (user?.avatar && !user.avatar.includes('unsplash.com/photo-1534528741775-53994a69daeb'))
      ? user.avatar
      : (matchedAuthor?.avatar || currentReader?.avatar || user?.avatar || '');
    const activeAvatar = ImageUtils.normalizeImageUrl(userAvatar);

    return `
      <div style="width: 100%; height: 100vh; display: flex; background: var(--bg-primary); color: var(--text-primary); overflow: hidden;">
        
        <!-- Left Navigation Sidebar Rail -->
        <aside style="width: 260px; height: 100vh; flex-shrink: 0; background: var(--bg-secondary); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem 1rem; overflow-y: auto;">
          <div>
            <!-- Brand CMS Header -->
            <div style="display: flex; align-items: center; gap: 0.75rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem;">
              <div style="width: 2.2rem; height: 2.2rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent-primary);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; letter-spacing: -0.02em; color: var(--text-primary);">QUERYINDO</h3>
                <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-cyan);">EDITORIAL CMS</span>
              </div>
            </div>

            <!-- Navigation Links with Clean SVG Icons (Role-Based Permissions) -->
            <nav style="display: flex; flex-direction: column; gap: 0.35rem;">
              <button class="nav-sidebar-link ${this.activeTab === 'articles' ? 'active' : ''}" data-tab="articles">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                <span>Manajer Publikasi</span>
              </button>
              ${isSuperuser ? `
                <button class="nav-sidebar-link ${this.activeTab === 'authors' ? 'active' : ''}" data-tab="authors">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>Dewan Redaksi</span>
                </button>
              ` : ''}
              <button class="nav-sidebar-link ${this.activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                <span>Kinerja Redaksi</span>
              </button>
              ${isSuperuser ? `
                <button class="nav-sidebar-link ${this.activeTab === 'ads' ? 'active' : ''}" data-tab="ads">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  <span>Iklan Banner</span>
                </button>
                <button class="nav-sidebar-link ${this.activeTab === 'shopping' ? 'active' : ''}" data-tab="shopping">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  <span>Belanja Tekno</span>
                </button>
                <button class="nav-sidebar-link ${this.activeTab === 'subscribers' ? 'active' : ''}" data-tab="subscribers">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>Pelanggan Surel</span>
                </button>
                <button class="nav-sidebar-link ${this.activeTab === 'social' ? 'active' : ''}" data-tab="social">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  <span>Media Sosial</span>
                </button>
                <button class="nav-sidebar-link ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <span>Pengaturan Sistem</span>
                </button>
              ` : ''}
            </nav>
          </div>

          <!-- Bottom User & Logout Profile Card -->
          <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
              <img src="${activeAvatar}" alt="${user?.fullName}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid ${isSuperuser ? 'var(--accent-cyan)' : 'var(--accent-primary)'};" />
              <div style="overflow: hidden;">
                <div style="font-weight: 800; font-size: 0.85rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; color: var(--text-primary);">${user?.fullName}</div>
                <div style="font-size: 0.72rem; color: ${isSuperuser ? 'var(--accent-cyan)' : 'var(--text-secondary)'}; font-weight: 700;">
                  ${user?.roleTitle || (isSuperuser ? 'Founder & CEO' : 'Editor Redaksi')}
                </div>
              </div>
            </div>

            <button id="cms-logout-btn" style="width: 100%; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); color: var(--accent-rose); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Keluar Dasbor</span>
            </button>
          </div>
        </aside>

        <!-- Right Main Content Area -->
        <main style="flex: 1; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-primary);">
          
          <!-- Top Global Utility Header -->
          <header style="height: 4.25rem; flex-shrink: 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <h2 style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;">
                ${this.activeTab === 'analytics' ? 'Analitik & Kinerja Editorial' :
                  this.activeTab === 'authors' ? 'Dewan Redaksi & Jurnalis' :
                  this.activeTab === 'ads' ? 'Manajemen Iklan Banner Sponsor' :
                  this.activeTab === 'shopping' ? 'Manajemen Belanja Tekno & Produk Rekomendasi' :
                  this.activeTab === 'polls' ? 'Manajemen Jajak Pendapat Komunitas' :
                  this.activeTab === 'subscribers' ? 'Basis Data Pelanggan Newsletter Surel' :
                  this.activeTab === 'social' ? 'Integrasi Kanal Media Sosial' :
                  this.activeTab === 'settings' ? 'Konfigurasi & Pengaturan Portal' :
                  'Pusat Manajemen Berita & Konten'}
              </h2>
            </div>

            <div style="display: flex; align-items: center; gap: 1rem;">
              ${this.activeTab === 'articles' ? `
                <div style="position: relative;">
                  <input type="text" id="cms-search-input" value="${this.searchKeyword}" placeholder="Cari judul atau tag berita..." style="width: 260px; padding: 0.5rem 0.75rem 0.5rem 2.2rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-full); font-size: 0.8rem; color: var(--text-primary);" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <button id="cms-btn-new-article" style="padding: 0.55rem 1.25rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.825rem; display: flex; align-items: center; gap: 0.4rem; box-shadow: var(--shadow-glow); cursor: pointer;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  <span>Tulis Berita Baru</span>
                </button>
              ` : ''}

              <!-- Close Modal Button -->
              <button id="admin-modal-close-btn" class="btn-close" style="width: 2.2rem; height: 2.2rem; border-radius: 50%; background: var(--bg-tertiary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary);" title="Kembali ke Beranda">✕</button>
            </div>
          </header>

          <!-- Main Scrollable Body View -->
          <div class="cms-scroll-view" style="flex: 1; min-height: 0; height: calc(100vh - 4.25rem); padding: 2rem 2rem 4rem 2rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth;">
            
            ${this.activeTab === 'analytics' ? this.renderAnalyticsTabHTML() :
              this.activeTab === 'authors' ? this.renderAuthorsManagementHTML() :
              this.activeTab === 'ads' ? this.renderAdsManagementHTML() :
              this.activeTab === 'shopping' ? this.renderShoppingManagementHTML() :
              this.activeTab === 'polls' ? this.renderPollsManagementHTML() :
              this.activeTab === 'subscribers' ? this.renderSubscribersManagementHTML() :
              this.activeTab === 'social' ? this.renderSocialManagementHTML() :
              this.activeTab === 'settings' ? this.renderSettingsTabHTML() :
              `
              <!-- Analytics Top Summary Cards -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Publikasi</div>
                  <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-top: 0.35rem;">${this.articles.length} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">Artikel</span></div>
                </div>
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Pembaca (Views)</div>
                  <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.35rem;">${this.formatStats(totalViews)}</div>
                </div>
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Interaksi (Likes)</div>
                  <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.35rem;">${this.formatStats(totalLikes)}</div>
                </div>
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Headline Utama (Featured)</div>
                  <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-amber); margin-top: 0.35rem;">${featuredCount} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">Aktif</span></div>
                </div>
              </div>

              <!-- Content Manager Table Section -->
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
                <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em;">Daftar Naskah & Berita Redaksi</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Kelola publikasi, kurasi naskah, verifikasi cek fakta, dan penugasan redaksional.</p>
                  </div>
                </div>

                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
                    <thead>
                      <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                        <th style="padding: 0.85rem 1.25rem;">Berita & Judul Utama</th>
                        <th style="padding: 0.85rem 1.25rem;">Kategori</th>
                        <th style="padding: 0.85rem 1.25rem;">Penulis</th>
                        <th style="padding: 0.85rem 1.25rem;">Statistik</th>
                        <th style="padding: 0.85rem 1.25rem;">Status / Lencana</th>
                        <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi Redaksi</th>
                      </tr>
                    </thead>
                    <tbody id="cms-table-body">
                      ${this.renderTableRowsHTML()}
                    </tbody>
                  </table>
                </div>
              </div>
            `}

          </div>
        </main>
      </div>
    `;
  }

  // Authors & Journalists Management Tab View (CRUD)
  private renderAuthorsManagementHTML(): string {
    const authors = AuthorService.getAuthors();
    const totalArticlesWritten = this.articles.length;

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Dewan Redaksi & Jurnalis
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola master data jurnalis, desk liputan, biografi, dan rekam jejak publikasi QUERYINDO.
            </p>
          </div>
          
          <button id="btn-add-author" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tambah Jurnalis</span>
          </button>
        </div>

        <!-- Metric Overview Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Dewan Jurnalis</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.35rem;">${authors.length} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Wartawan</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Naskah Terdistribusi</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-blue); margin-top: 0.35rem;">${totalArticlesWritten} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Berita</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Kualifikasi Jurnalistik</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.55rem;">Dewan Pers ID</div>
          </div>
        </div>

        <!-- Author Profile Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
          ${authors.map(author => {
            const authorArticles = this.articles.filter(a => a.author.name.toLowerCase() === author.name.toLowerCase());
            const totalAuthorViews = authorArticles.reduce((acc, a) => acc + a.viewsCount, 0);

            return `
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.1rem; transition: border-color var(--transition-fast);">
                
                <div>
                  <!-- Top Bar: Avatar & Verification -->
                  <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.85rem;">
                    <div style="position: relative; flex-shrink: 0;">
                      <img src="${author.avatar}" alt="${author.name}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);" />
                      <span style="position: absolute; bottom: 0; right: 0; background: var(--accent-emerald); color: #fff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800;" title="Jurnalis Terverifikasi">✓</span>
                    </div>

                    <div style="flex: 1; min-width: 0;">
                      <h3 style="font-size: 1rem; font-weight: 800; margin: 0; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${author.name}</h3>
                      <span style="display: inline-block; font-size: 0.72rem; font-weight: 600; color: var(--accent-cyan); background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); padding: 0.15rem 0.5rem; border-radius: 4px; margin-top: 0.3rem;">
                        ${author.role}
                      </span>
                    </div>
                  </div>

                  <!-- Author Bio -->
                  <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 0.85rem 0; min-height: 2.3rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${author.bio || 'Jurnalis berita dan analis riset teknologi di redaksi QUERYINDO.'}
                  </p>

                  <!-- Contact & Social Meta -->
                  <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-tertiary); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="display: flex; align-items: center; gap: 0.35rem;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        <span>Email:</span>
                      </span>
                      <strong style="color: var(--text-primary); font-family: var(--font-mono);">${author.email}</strong>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="display: flex; align-items: center; gap: 0.35rem;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span>Terdaftar:</span>
                      </span>
                      <span style="color: var(--text-primary); font-family: var(--font-mono);">${author.joinedAt ? (author.joinedAt.includes('-') ? new Date(author.joinedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : author.joinedAt) : '1 Januari 2025'}</span>
                    </div>
                    ${author.socialTwitter ? `
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 0.35rem;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                          <span>X / Twitter:</span>
                        </span>
                        <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${author.socialTwitter}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Bottom Metrics & Action Buttons -->
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-top: 1px solid var(--border-color); font-size: 0.78rem; margin-bottom: 0.65rem;">
                    <span style="color: var(--text-muted);">Naskah Dipublikasi:</span>
                    <strong style="color: var(--text-primary);">${authorArticles.length} Berita <span style="color: var(--accent-cyan);">(${this.formatStats(totalAuthorViews)} Views)</span></strong>
                  </div>

                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-edit-author" data-author-id="${author.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      <span>Sunting</span>
                    </button>
                    <button class="btn-delete-author" data-author-id="${author.id}" data-author-name="${author.name}" style="padding: 0.45rem 0.75rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem;" title="Hapus Jurnalis">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  // Ads & Sponsorship Management Tab View
  private renderAdsManagementHTML(): string {
    const allCampaigns = AdBanner.getCampaigns();
    const campaigns = this.adPlacementFilter === 'all'
      ? allCampaigns
      : allCampaigns.filter(a => a.placement === this.adPlacementFilter);

    const PLACEMENT_INFO: Record<string, { label: string; tag: string; color: string; desc: string }> = {
      leaderboard: { label: 'Leaderboard (728x90)', tag: 'LEADERBOARD', color: '#38bdf8', desc: 'Banner atas utama di bawah navigasi header' },
      billboard: { label: 'Billboard (970x250)', tag: 'BILLBOARD', color: '#fbbf24', desc: 'Banner horizontal raksasa di atas feed berita' },
      midstream: { label: 'Midstream Banner', tag: 'MIDSTREAM', color: '#a855f7', desc: 'Banner horizontal interstitial di tengah aliran berita' },
      sidebar: { label: 'Sidebar (300x250)', tag: 'SIDEBAR', color: '#34d399', desc: 'Banner kotak di sidebar kilas cepat & rekomendasi' },
      skyscraper_left: { label: 'Skyscraper Kiri', tag: 'SKYSCRAPER L', color: '#818cf8', desc: 'Banner vertikal 160x600 di rail kiri layar lebar' },
      skyscraper_right: { label: 'Skyscraper Kanan', tag: 'SKYSCRAPER R', color: '#818cf8', desc: 'Banner vertikal 160x600 di rail kanan layar lebar' },
      in_article: { label: 'In-Article Ad', tag: 'IN-ARTICLE', color: '#f43f5e', desc: 'Banner sponsor di dalam modal baca artikel penuh' },
      in_feed: { label: 'In-Feed Native', tag: 'IN-FEED', color: '#2dd4bf', desc: 'Kartu iklan sponsor di antara grid kartu berita' }
    };

    const filterPills = [
      { id: 'all', name: `Semua (${allCampaigns.length})` },
      { id: 'leaderboard', name: 'Leaderboard' },
      { id: 'billboard', name: 'Billboard' },
      { id: 'midstream', name: 'Midstream' },
      { id: 'sidebar', name: 'Sidebar' },
      { id: 'skyscraper_left', name: 'Skyscraper L' },
      { id: 'skyscraper_right', name: 'Skyscraper R' },
      { id: 'in_article', name: 'In-Article' },
      { id: 'in_feed', name: 'In-Feed' }
    ];

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header & Action Button -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Kemitraan Iklan & Sponsor Brand
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola inventori banner promosi: Leaderboard, Billboard, Midstream, Sidebar, Skyscrapers, dan In-Article.
            </p>
          </div>
          <button id="btn-add-ad-campaign" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tambah Kampanye Iklan</span>
          </button>
        </div>

        <!-- Filter Pills Bar -->
        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.35rem;">
          ${filterPills.map(p => {
            const isActive = this.adPlacementFilter === p.id;
            return `
              <button class="ad-filter-pill" data-placement="${p.id}" style="padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; border: 1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}; background: ${isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; color: ${isActive ? '#ffffff' : 'var(--text-secondary)'}; cursor: pointer; white-space: nowrap; transition: all 0.15s ease;">
                ${p.name}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Campaign Cards Grid -->
        ${campaigns.length === 0 ? `
          <div style="background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 3rem; text-align: center; color: var(--text-muted);">
            <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">Tidak ada kampanye iklan di slot ini.</p>
            <button id="btn-add-ad-empty" style="padding: 0.5rem 1rem; background: var(--accent-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 600; cursor: pointer;">
              + Tambah Iklan Baru
            </button>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
            ${campaigns.map(ad => {
              const info = PLACEMENT_INFO[ad.placement] || { label: ad.placement, tag: ad.placement.toUpperCase(), color: 'var(--accent-cyan)', desc: '' };
              return `
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; transition: transform 0.2s ease, border-color 0.2s ease;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                      <span class="tag-badge" style="background: rgba(255,255,255,0.06); color: ${info.color}; border: 1px solid ${info.color}40; font-size: 0.68rem; font-weight: 700; font-family: var(--font-mono);">${info.tag}</span>
                      <span style="font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 4px; background: ${ad.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${ad.isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; border: 1px solid ${ad.isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};">
                        ${ad.isActive ? 'AKTIF TAYANG' : 'NONAKTIF'}
                      </span>
                    </div>

                    <div style="display: flex; gap: 0.85rem; align-items: center; margin-bottom: 0.85rem;">
                      <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 64px; height: 48px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color); flex-shrink: 0;" />
                      <div style="min-width: 0; flex: 1;">
                        <h3 style="font-size: 0.98rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${ad.sponsorName}</h3>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${ad.tagline}</p>
                      </div>
                    </div>

                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.35rem; font-family: var(--font-mono); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                      <span style="color: var(--text-muted);">Target:</span>
                      <a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none;">${ad.targetUrl} ↗</a>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: var(--bg-tertiary); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid var(--border-color);">
                      <div>
                        <span style="color: var(--text-muted); display: block;">Impressions:</span>
                        <strong style="color: var(--text-primary); font-size: 0.85rem;">${ad.impressions.toLocaleString('id-ID')}</strong>
                      </div>
                      <div>
                        <span style="color: var(--text-muted); display: block;">Clicks (CTR):</span>
                        <strong style="color: var(--accent-cyan); font-size: 0.85rem;">${ad.clicks} (${ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%)</strong>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.65rem;">
                    <button class="btn-edit-ad" data-ad-id="${ad.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      <span>Sunting</span>
                    </button>
                    <button class="btn-toggle-ad" data-ad-id="${ad.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                      ${ad.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button class="btn-delete-ad" data-ad-id="${ad.id}" style="padding: 0.45rem 0.65rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.75rem; font-weight: 600; cursor: pointer;" title="Hapus Iklan">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  // Shopping & Affiliate Recommendation Management Tab View (CRUD)
  private renderShoppingManagementHTML(): string {
    const config = ShoppingCarousel.getConfig();
    const products = ShoppingCarousel.getProducts();

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Rekomendasi Belanja & Afiliasi E-Commerce
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola widget banner "Query Picks / Radar Gadget & Hardware Pilihan" di beranda. Atur teks promosi, upload produk belanja, harga coret & diskon, serta tautan afiliasi.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="btn-add-shopping-product" style="padding: 0.55rem 1.25rem; background: var(--accent-cyan); color: #000000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; cursor: pointer; border: none; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 2px 10px rgba(0, 242, 254, 0.35);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>+ Tambah Produk Belanja</span>
            </button>
          </div>
        </div>

        <!-- Banner Configuration Card -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary);">Pengaturan Banner Rekomendasi</h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Sesuaikan status tayang dan teks tajuk promosi pada banner.</p>
            </div>
            <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
              <span style="font-size: 0.8rem; font-weight: 700; color: ${config.enabled ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                ${config.enabled ? '● Banner Aktif Tayang' : '○ Banner Dinonaktifkan'}
              </span>
              <input type="checkbox" id="toggle-shopping-banner" ${config.enabled ? 'checked' : ''} style="width: 1.2rem; height: 1.2rem; cursor: pointer;" />
            </label>
          </div>

          <form id="form-shopping-config" style="display: grid; grid-template-columns: 1fr 1fr 1.5fr auto; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Badge Promosi</label>
              <input type="text" id="cfg-shop-badge" value="${config.badgeText || '⚡ QUERY PICKS'}" placeholder="⚡ QUERY PICKS" style="width: 100%; padding: 0.55rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Partner Brand</label>
              <input type="text" id="cfg-shop-partner" value="${config.partnerText || 'Kurasi Lab Redaksi'}" placeholder="Kurasi Lab Redaksi" style="width: 100%; padding: 0.55rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Judul Utama Banner</label>
              <input type="text" id="cfg-shop-title" value="${config.mainTitle || 'RADAR GADGET & HARDWARE PILIHAN'}" placeholder="RADAR GADGET & HARDWARE PILIHAN" style="width: 100%; padding: 0.55rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <button type="submit" id="btn-save-shop-config" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #fff; font-weight: 700; font-size: 0.825rem; border-radius: var(--radius-md); border: none; cursor: pointer; white-space: nowrap;">
              Simpan Teks
            </button>
          </form>
        </div>

        <!-- Live Preview Accordion/Box -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.7rem; font-weight: 800; font-family: var(--font-mono); background: rgba(0, 242, 254, 0.12); color: #00f2fe; padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.3);">LIVE PREVIEW</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">Tampilan Widget Rekomendasi di Beranda</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Mendukung geser panah kiri/kanan</span>
          </div>
          <div id="admin-shopping-live-preview">
            ${ShoppingCarousel.renderWidgetHTML()}
          </div>
        </div>

        <!-- Products Management Table -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0; color: var(--text-primary);">Daftar Kartu Produk Rekomendasi (${products.length} Produk)</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">Produk yang berstatus aktif akan otomatis tampil di slider rekomendasi.</p>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 0.85rem 1.25rem;">Produk Belanja</th>
                  <th style="padding: 0.85rem 1.25rem;">Kategori</th>
                  <th style="padding: 0.85rem 1.25rem;">Diskon %</th>
                  <th style="padding: 0.85rem 1.25rem;">Harga Asli / Promo</th>
                  <th style="padding: 0.85rem 1.25rem;">Tautan Afiliasi</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: center;">Status</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${products.length === 0 ? `
                  <tr>
                    <td colspan="7" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
                      Belum ada produk belanja yang ditambahkan. Klik tombol "+ Tambah Produk Belanja" di atas.
                    </td>
                  </tr>
                ` : products.map(prod => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.85rem 1.25rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${ImageUtils.normalizeImageUrl(prod.imageUrl) || ImageUtils.getInitialsAvatar(prod.title, '#ff9800')}" alt="${prod.title}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: contain; background: #fff; border: 1px solid var(--border-color); padding: 2px;" />
                        <div>
                          <div style="font-weight: 700; color: var(--text-primary); max-width: 260px; line-height: 1.3;">${prod.title}</div>
                          <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${prod.clicks || 0}x klik</span>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <span style="font-size: 0.75rem; background: var(--bg-tertiary); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-secondary);">
                        ${prod.category || 'Umum'}
                      </span>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <span style="font-weight: 800; color: #dc2626; font-size: 0.8rem; background: rgba(220, 38, 38, 0.1); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(220, 38, 38, 0.2);">
                        ${prod.discountPercent ? (prod.discountPercent.includes('%') ? prod.discountPercent : `${prod.discountPercent}%`) : '-'}
                      </span>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <div style="font-size: 0.75rem; color: var(--text-muted); text-decoration: line-through;">${prod.originalPrice || '-'}</div>
                      <div style="font-size: 0.88rem; font-weight: 800; color: #ea580c;">${prod.discountPrice}</div>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <a href="${prod.targetUrl}" target="_blank" rel="noopener" style="font-size: 0.75rem; color: var(--accent-cyan); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${prod.targetUrl.replace(/^https?:\/\//, '')} ↗
                      </a>
                    </td>
                    <td style="padding: 0.85rem 1.25rem; text-align: center;">
                      <button class="btn-toggle-shop-product" data-product-id="${prod.id}" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; font-weight: 700; border-radius: var(--radius-full); cursor: pointer; border: 1px solid ${prod.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; background: ${prod.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${prod.isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                        ${prod.isActive ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td style="padding: 0.85rem 1.25rem; text-align: right;">
                      <div style="display: inline-flex; gap: 0.4rem;">
                        <button class="btn-edit-shop-product" data-product-id="${prod.id}" style="padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                          Edit
                        </button>
                        <button class="btn-delete-shop-product" data-product-id="${prod.id}" data-product-title="${prod.title}" style="padding: 0.35rem 0.65rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // Editorial Polls Management Tab View
  private renderPollsManagementHTML(): string {
    const poll = ReaderPoll.getPollData();
    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">Jajak Pendapat & Polling Redaksi</h2>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">Sesuaikan pertanyaan dan opsi pilihan opini pembaca yang ditampilkan secara realtime di sidebar portal.</p>
        </div>

        <form id="form-manage-poll" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Pertanyaan Polling (Bahasa Indonesia)</label>
            <input type="text" id="poll-question-id" required value="${poll.questionId}" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Pertanyaan Polling (English Translation)</label>
            <input type="text" id="poll-question-en" required value="${poll.questionEn}" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem;" />
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 0.75rem;">Pilihan Respon (${totalVotes} Total Suara)</label>
            
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              ${poll.options.map((opt, idx) => `
                <div style="display: grid; grid-template-columns: 1fr 1fr 100px; gap: 0.75rem; align-items: center;">
                  <input type="text" class="poll-opt-id" data-idx="${idx}" value="${opt.textId}" placeholder="Teks Pilihan (ID)" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.8rem;" />
                  <input type="text" class="poll-opt-en" data-idx="${idx}" value="${opt.textEn}" placeholder="Option Text (EN)" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.8rem;" />
                  <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">${opt.votes} suara</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-reset-poll-votes" style="padding: 0.55rem 1rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.78rem; font-weight: 600; cursor: pointer;">
              Reset Total Suara ke 0
            </button>
            <button type="submit" style="padding: 0.55rem 1.35rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              Simpan & Publikasikan Polling
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // Analytics Tab View
  private renderAnalyticsTabHTML(): string {
    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary);">Analitik Redaksi & Metrik Pembaca</h2>

        <!-- Bar Chart Daily Visitors -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary);">Distribusi Kunjungan Harian (7 Hari Terakhir)</h3>
          
          <div style="display: flex; align-items: flex-end; gap: 1.25rem; height: 180px; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 45%; background: rgba(37, 99, 235, 0.4); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Sen</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 60%; background: rgba(37, 99, 235, 0.5); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Sel</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 85%; background: rgba(37, 99, 235, 0.7); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Rab</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 70%; background: rgba(37, 99, 235, 0.6); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Kam</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 95%; background: var(--accent-primary); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: #60a5fa; font-weight: 700; font-family: var(--font-mono);">Jum</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 50%; background: rgba(37, 99, 235, 0.45); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Sab</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 40%; background: rgba(37, 99, 235, 0.35); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Min</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Subscribers Management Tab View
  private renderSubscribersManagementHTML(): string {
    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Pelanggan Newsletter & Broadcast Berita
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola basis data pembaca terdaftar, pantau status gateway SMTP Hostinger SSL, dan kirim buletin harian.
            </p>
          </div>
          
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button id="btn-export-subscribers-csv" style="padding: 0.55rem 1.15rem; background: var(--bg-tertiary); color: var(--text-primary); font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; gap: 0.45rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Ekspor Data (CSV)</span>
            </button>
            <button id="btn-open-broadcast-modal" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>Kirim Broadcast Berita</span>
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Pelanggan Aktif</div>
            <div id="metric-subscribers-count" style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.35rem;">Memuat...</div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Gateway Email Resmi</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.55rem; display: flex; align-items: center; gap: 0.4rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-emerald);"></span>
              <span>Hostinger SSL 465</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; font-family: var(--font-mono);">redaksi@queryindo.com</div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Template Otomatis</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 0.55rem;">Welcome & Broadcast</div>
            <div style="font-size: 0.72rem; color: var(--accent-cyan); margin-top: 0.2rem;">HTML Responsive Branded</div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Keamanan & Anti-Spam</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-amber); margin-top: 0.55rem;">SPF • DKIM • DMARC</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">DNS Terverifikasi 100%</div>
          </div>
        </div>

        <!-- Table Container -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em;">Daftar Alamat Email Terdaftar</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Data pembaca yang telah melakukan konfirmasi berlangganan buletin harian.</p>
            </div>
            <input type="text" id="filter-subscriber-input" placeholder="Cari alamat email pelanggan..." style="padding: 0.5rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem; min-width: 260px;" />
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 0.85rem 1.25rem; width: 60px;">No</th>
                  <th style="padding: 0.85rem 1.25rem;">Alamat Email Pembaca</th>
                  <th style="padding: 0.85rem 1.25rem;">Waktu Registrasi</th>
                  <th style="padding: 0.85rem 1.25rem;">Status Langganan</th>
                  <th style="padding: 0.85rem 1.25rem;">Pengiriman Email</th>
                  <th style="padding: 0.85rem 1.25rem; width: 80px; text-align: right;">Aksi</th>
                </tr>
              </thead>
              <tbody id="subscribers-table-body">
                <tr>
                  <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    Memuat daftar pelanggan newsletter...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // Settings & Admin Accounts Management Tab View
  private renderSettingsTabHTML(): string {
    const user = AuthService.getCurrentUser();
    const isSuperuser = user?.role === 'superuser';
    const adminAccounts = AuthService.getAdminAccounts();
    const activeSocials = SocialMediaService.getActiveLinks();

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem; max-width: 1000px;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono);">KONTROL AKSES & OTENTIKASI</span>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Pengaturan Sistem & Manajemen Akun Redaksi
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola konfigurasi keamanan portal, kata sandi akun aktif, dan otoritas hak akses bertingkat (Superuser & Editor).
            </p>
          </div>
          
          ${isSuperuser ? `
            <button id="btn-add-admin-account" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Tambah Akun Editor Baru</span>
            </button>
          ` : ''}
        </div>

        <!-- Role & Current Session Info Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          <!-- Current User Profile Card -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="position: relative; flex-shrink: 0;">
              <img src="${user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" alt="${user?.fullName}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid ${isSuperuser ? 'var(--accent-cyan)' : 'var(--accent-primary)'};" />
              <span style="position: absolute; bottom: 0; right: 0; width: 14px; height: 14px; border-radius: 50%; background: var(--accent-emerald); border: 2px solid var(--bg-secondary);" title="Sesi Aktif"></span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 style="font-size: 1rem; font-weight: 800; margin: 0; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user?.fullName}</h3>
                <span class="tag-badge" style="background: ${isSuperuser ? 'rgba(0, 242, 254, 0.12)' : 'rgba(59, 130, 246, 0.12)'}; color: ${isSuperuser ? 'var(--accent-cyan)' : '#60a5fa'}; border: 1px solid ${isSuperuser ? 'rgba(0, 242, 254, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; font-size: 0.68rem; font-weight: 800;">
                  ${user?.roleTitle || (isSuperuser ? 'FOUNDER & CEO' : 'EDITOR')}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.25rem;">${user?.email}</div>
              <div style="font-size: 0.72rem; color: var(--accent-emerald); margin-top: 0.2rem;">● Sesi Terotentikasi (JWT Active)</div>
            </div>
          </div>

          <!-- Hierarchy & Permission Level Card -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Hak Akses Menu Dasbor</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: ${isSuperuser ? 'var(--accent-cyan)' : 'var(--text-primary)'}; margin-top: 0.4rem;">
              ${isSuperuser ? 'Superuser (Akses Penuh 8 Menu)' : 'Editor (Manajer Publikasi & Analitik)'}
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.35rem 0 0 0; line-height: 1.4;">
              ${isSuperuser
                ? 'Sebagai Founder & CEO, Anda memiliki wewenang mengelola artikel, dewan redaksi, iklan, belanja, subscribers, medsos, dan manajemen akun admin.'
                : 'Akun Editor difokuskan untuk kurasi naskah berita, penulisan artikel, dan pemantauan kinerja redaksi harian.'}
            </p>
          </div>
        </div>

        ${isSuperuser ? `
          <!-- Admin Accounts Management Table (Superuser Only) -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em; margin: 0; color: var(--text-primary);">
                  Daftar Akun Pengelola Dasbor CMS (${adminAccounts.length} Akun)
                </h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">
                  Akun Superuser tidak dapat dihapus. Anda dapat menambahkan atau menghapus akun Editor redaksi kapan saja.
                </p>
              </div>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
                <thead>
                  <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    <th style="padding: 0.85rem 1.25rem;">Pengguna / Identitas</th>
                    <th style="padding: 0.85rem 1.25rem;">Email & Username</th>
                    <th style="padding: 0.85rem 1.25rem;">Peran (Role)</th>
                    <th style="padding: 0.85rem 1.25rem;">Waktu Dibuat</th>
                    <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminAccounts.map(acc => {
                    const isAccSuper = acc.role === 'superuser' || acc.email.toLowerCase() === 'rijalumami000@gmail.com';
                    const createdDateStr = acc.createdAt ? (acc.createdAt.includes('-') ? new Date(acc.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : acc.createdAt) : '1 Januari 2025';

                    return `
                      <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 0.9rem 1.25rem;">
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <img src="${acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" alt="${acc.fullName}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isAccSuper ? 'var(--accent-cyan)' : 'var(--border-color)'};" />
                            <div>
                              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.875rem;">${acc.fullName}</div>
                              <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${acc.id}</span>
                            </div>
                          </div>
                        </td>

                        <td style="padding: 0.9rem 1.25rem;">
                          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.825rem; font-family: var(--font-mono);">${acc.email}</div>
                          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">@${acc.username}</div>
                        </td>

                        <td style="padding: 0.9rem 1.25rem;">
                          <span class="tag-badge" style="background: ${isAccSuper ? 'rgba(0, 242, 254, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; color: ${isAccSuper ? 'var(--accent-cyan)' : '#60a5fa'}; border: 1px solid ${isAccSuper ? 'rgba(0, 242, 254, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; font-size: 0.68rem; font-weight: 800;">
                            ${isAccSuper ? '👑 SUPERUSER (FOUNDER & CEO)' : 'EDITOR REDAKSI'}
                          </span>
                        </td>

                        <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">
                          ${createdDateStr}
                        </td>

                        <td style="padding: 0.9rem 1.25rem; text-align: right;">
                          ${isAccSuper ? `
                            <span style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700; background: rgba(0, 242, 254, 0.08); padding: 0.25rem 0.55rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.2);">
                              🔒 Akun Master
                            </span>
                          ` : `
                            <button class="btn-delete-admin-account" data-id="${acc.id}" data-name="${acc.fullName}" style="padding: 0.35rem 0.65rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                              Hapus Akun
                            </button>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Change Password Card -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
          <div style="margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary);">
              Ganti Kata Sandi Akun
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
              Ubah kata sandi untuk akun yang sedang login (${user?.email}). Minimal 6 karakter.
            </p>
          </div>

          <form id="form-change-password" style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kata Sandi Lama *</label>
              <input type="password" id="change-old-password" required placeholder="Masukkan kata sandi lama..." style="width: 100%; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kata Sandi Baru *</label>
              <input type="password" id="change-new-password" required minlength="6" placeholder="Minimal 6 karakter..." style="width: 100%; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Konfirmasi Sandi Baru *</label>
              <input type="password" id="change-confirm-password" required minlength="6" placeholder="Ulangi kata sandi baru..." style="width: 100%; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <button type="submit" style="padding: 0.6rem 1.35rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); border: none; font-size: 0.85rem; cursor: pointer; white-space: nowrap; box-shadow: var(--shadow-glow);">
              Perbarui Sandi
            </button>
          </form>
        </div>

        <!-- System Engine & Social Media Quick Panel -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
            <div>
              <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.2rem 0; color: var(--text-primary);">Integrasi Kanal Media Sosial</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
                Terdapat <strong>${activeSocials.length} akun resmi</strong> yang aktif ditampilkan di footer portal.
              </p>
            </div>
            ${isSuperuser ? `
              <button id="btn-goto-social-settings" style="padding: 0.45rem 0.9rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--accent-cyan); font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
                <span>Buka Manajer Media Sosial →</span>
              </button>
            ` : ''}
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${activeSocials.map(link => {
              const meta = PLATFORM_METAS[link.platform] || PLATFORM_METAS.custom;
              return `
                <span style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 600; color: var(--text-primary);">
                  <span style="color: ${meta.brandColor}; display: flex; align-items: center;">${meta.svgIcon}</span>
                  <span>${link.name}</span>
                </span>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // Official Social Media Channels Management Tab View (CRUD)
  private renderSocialManagementHTML(): string {
    const links = SocialMediaService.getLinks();
    const activeLinks = links.filter(l => l.isActive);
    const inactiveLinks = links.filter(l => !l.isActive);

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono);">EKOSISTEM DIGITAL RESMI</span>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Kanal & Media Sosial Resmi QUERYINDO
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola tautan akun media sosial resmi (Facebook, Instagram, Threads, X, TikTok, YouTube, WhatsApp, dll.) yang ditampilkan di footer portal publik.
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button id="btn-reset-social" style="padding: 0.55rem 1rem; background: var(--bg-tertiary); color: var(--text-secondary); font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid var(--border-color); cursor: pointer;" title="Kembalikan daftar ke susunan standar awal">
              Reset Standar
            </button>
            <button id="btn-add-social" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 1px 2px rgba(0,0,0,0.2); cursor: pointer;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              <span>Tambah Tautan Medsos</span>
            </button>
          </div>
        </div>

        <!-- 3 Top Metric Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Saluran Didaftarkan</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-top: 0.35rem;">${links.length} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">Platform</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Aktif Tampil di Footer</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.35rem;">${activeLinks.length} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">Aktif</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Disembunyikan / Cadangan</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-muted); margin-top: 0.35rem;">${inactiveLinks.length} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">Nonaktif</span></div>
          </div>
        </div>

        <!-- Social Media Table Section -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em;">Daftar Akun Media Sosial Portal</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Urutan di bawah ini menentukan posisi kiri-ke-kanan ikon pada footer portal.</p>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 0.85rem 1.25rem; width: 60px; text-align: center;">Urutan</th>
                  <th style="padding: 0.85rem 1.25rem;">Platform & Logo</th>
                  <th style="padding: 0.85rem 1.25rem;">Nama / Handle Akun</th>
                  <th style="padding: 0.85rem 1.25rem;">Tautan URL Resmi</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: center;">Status Footer</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi Redaksi</th>
                </tr>
              </thead>
              <tbody>
                ${links.map((item, index) => {
                  const meta = PLATFORM_METAS[item.platform] || PLATFORM_METAS.custom;
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 0.9rem 1.25rem; text-align: center;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                          <button class="btn-move-social-up" data-id="${item.id}" ${index === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : 'style="cursor:pointer;"'} title="Pindah ke Kiri / Atas" style="border:none; background:transparent; color:var(--text-secondary); font-size:0.75rem; padding:1px 4px;">▲</button>
                          <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">${item.order}</span>
                          <button class="btn-move-social-down" data-id="${item.id}" ${index === links.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : 'style="cursor:pointer;"'} title="Pindah ke Kanan / Bawah" style="border:none; background:transparent; color:var(--text-secondary); font-size:0.75rem; padding:1px 4px;">▼</button>
                        </div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <div style="width: 2.2rem; height: 2.2rem; border-radius: 8px; background: ${meta.brandColor === '#000000' ? '#111827' : meta.brandColor}; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 2px 8px ${meta.hoverGlow}; flex-shrink: 0;">
                            ${meta.svgIcon}
                          </div>
                          <div>
                            <div style="font-weight: 800; color: var(--text-primary); font-size: 0.9rem;">${meta.name}</div>
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">${item.platform}</span>
                          </div>
                        </div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem;">
                        <div style="font-weight: 700; color: var(--text-primary); font-size: 0.875rem;">${item.name}</div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; max-width: 320px;">
                          <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.82rem; font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px;" title="${item.url}">
                            ${item.url}
                          </a>
                          <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-muted); text-decoration: none; font-size: 0.75rem;" title="Buka di tab baru">
                            ↗
                          </a>
                        </div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem; text-align: center;">
                        <button class="btn-toggle-social" data-id="${item.id}" style="padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; cursor: pointer; border: 1px solid ${item.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(156, 163, 175, 0.3)'}; background: ${item.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)'}; color: ${item.isActive ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                          ${item.isActive ? '● AKTIF (TAMPIL)' : '○ NONAKTIF'}
                        </button>
                      </td>

                      <td style="padding: 0.9rem 1.25rem; text-align: right;">
                        <div style="display: inline-flex; gap: 0.45rem;">
                          <button class="btn-cms-action btn-edit-social" data-id="${item.id}" style="padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                            Sunting
                          </button>
                          <button class="btn-cms-action btn-delete-social" data-id="${item.id}" data-name="${item.name}" style="padding: 0.35rem 0.55rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); font-size: 0.75rem; cursor: pointer;">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // Render Table Rows HTML
  private renderTableRowsHTML(): string {
    const filtered = this.articles.filter(art => {
      if (!this.searchKeyword) return true;
      const kw = this.searchKeyword.toLowerCase();
      return art.title.toLowerCase().includes(kw) || art.subtitle.toLowerCase().includes(kw) || art.author.name.toLowerCase().includes(kw);
    });

    if (filtered.length === 0) {
      return `
        <tr>
          <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
            Tidak ada naskah berita yang cocok dengan kata kunci pencarian.
          </td>
        </tr>
      `;
    }

    return filtered.map(art => `
      <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
        <td style="padding: 0.9rem 1.25rem; max-width: 320px;">
          <div style="font-weight: 700; line-height: 1.35; color: var(--text-primary); font-size: 0.9rem;">${art.title}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; font-family: var(--font-mono);">ID: ${art.id} • ${new Date(art.publishedAt).toLocaleDateString('id-ID')}</div>
        </td>
        <td style="padding: 0.9rem 1.25rem;">
          <span class="tag-badge" style="font-size: 0.68rem;">${art.category.toUpperCase()}</span>
        </td>
        <td style="padding: 0.9rem 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <img src="${art.author.avatar}" alt="${art.author.name}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
            <span style="font-size: 0.825rem; font-weight: 600;">${art.author.name}</span>
          </div>
        </td>
        <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); font-size: 0.78rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--text-secondary);" title="${art.viewsCount || 0} pembaca">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>${this.formatStats(art.viewsCount || 0)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--accent-rose); margin-top: 0.2rem;" title="${art.likesCount || 0} suka">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <span>${this.formatStats(art.likesCount || 0)}</span>
          </div>
        </td>
        <td style="padding: 0.9rem 1.25rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            ${art.isFeatured ? `<span class="tag-badge" style="background: rgba(234, 179, 8, 0.08); color: var(--accent-amber); font-size: 0.65rem; border-color: rgba(234, 179, 8, 0.25);">HEADLINE</span>` : ''}
            ${art.isBreaking ? `<span class="tag-badge" style="background: rgba(239, 68, 68, 0.08); color: var(--accent-rose); font-size: 0.65rem; border-color: rgba(239, 68, 68, 0.25);">BREAKING</span>` : ''}
            ${art.isFactChecked ? `<span class="tag-badge" style="background: rgba(16, 185, 129, 0.08); color: var(--accent-emerald); font-size: 0.65rem; border-color: rgba(16, 185, 129, 0.25);">FACT CHECKED</span>` : ''}
            ${art.isSponsored ? `<span class="tag-badge" style="background: rgba(37, 99, 235, 0.08); color: #60a5fa; font-size: 0.65rem; border-color: rgba(59, 130, 246, 0.25);">SPONSORED</span>` : ''}
            ${!art.isFeatured && !art.isBreaking && !art.isFactChecked && !art.isSponsored ? `<span style="color: var(--text-muted); font-size: 0.72rem; font-family: var(--font-mono);">STANDAR</span>` : ''}
          </div>
        </td>
        <td style="padding: 0.9rem 1.25rem; text-align: right;">
          <div style="display: inline-flex; gap: 0.45rem;">
            <button class="btn-cms-action btn-edit-article" data-id="${art.id}" style="padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
              Sunting
            </button>
            <button class="btn-cms-action btn-toggle-featured" data-id="${art.id}" style="padding: 0.35rem 0.55rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: ${art.isFeatured ? 'var(--accent-amber)' : 'var(--text-muted)'}; font-size: 0.75rem; cursor: pointer;">
              ${art.isFeatured ? 'Headline ✓' : 'Set Headline'}
            </button>
            <button class="btn-cms-action btn-delete-article" data-id="${art.id}" style="padding: 0.35rem 0.55rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); font-size: 0.75rem; cursor: pointer;">
              Hapus
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Bind All Admin Events
  public bindAdminEvents(modalElem: HTMLElement) {
    const user = AuthService.getCurrentUser();

    // Login Form Handler
    if (!user) {
      const loginForm = modalElem.querySelector('#cms-login-form') as HTMLFormElement;
      const loginCloseBtn = modalElem.querySelector('#admin-login-close-btn');
      
      loginCloseBtn?.addEventListener('click', () => {
        const modal = document.getElementById('admin-cms-modal');
        if (modal) modal.classList.remove('open');
      });

      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const emailInput = modalElem.querySelector('#login-email') as HTMLInputElement;
          const passwordInput = modalElem.querySelector('#login-password') as HTMLInputElement;
          const errorAlert = modalElem.querySelector('#login-error-alert') as HTMLElement;
          const submitBtn = modalElem.querySelector('#btn-login-submit') as HTMLButtonElement;

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memverifikasi Kredensial...';
          }

          const result = await AuthService.login(emailInput.value, passwordInput.value);
          
          if (result.success) {
            modalElem.innerHTML = this.renderAdminModalHTML();
            this.bindAdminEvents(modalElem);
          } else {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Buka Dasbor Redaksi →';
            }
            if (errorAlert) {
              errorAlert.textContent = result.message;
              errorAlert.style.display = 'block';
            }
          }
        });
      }
      return;
    }

    // Top Header Close Button (✕)
    const adminCloseBtn = modalElem.querySelector('#admin-modal-close-btn');
    adminCloseBtn?.addEventListener('click', () => {
      window.location.hash = '';
      const modal = document.getElementById('admin-cms-modal');
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('modal-closed'));
    });

    // Sidebar Tab Switcher
    modalElem.querySelectorAll('.nav-sidebar-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as any;
        if (tab) {
          this.activeTab = tab;
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
        }
      });
    });

    // Logout Handler
    const logoutBtn = modalElem.querySelector('#cms-logout-btn, #btn-logout-cms');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout();
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        Toast.show('Sesi redaksi telah berakhir.');
      });
    }

    const searchInput = modalElem.querySelector('#cms-search-input, #admin-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = (e.target as HTMLInputElement).value;
        const tbody = modalElem.querySelector('#cms-table-body');
        if (tbody) tbody.innerHTML = this.renderTableRowsHTML();
        this.bindTableActionEvents(modalElem);
      });
    }

    const createBtn = modalElem.querySelector('#cms-btn-new-article, #btn-create-article');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.openFullscreenArticleEditor(null, modalElem);
      });
    }

    // Bind Specific Tab Action Events
    if (this.activeTab === 'authors') {
      this.bindAuthorsEvents(modalElem);
    } else if (this.activeTab === 'ads') {
      this.bindAdsEvents(modalElem);
    } else if (this.activeTab === 'shopping') {
      this.bindShoppingEvents(modalElem);
    } else if (this.activeTab === 'polls') {
      this.bindPollsEvents(modalElem);
    } else if (this.activeTab === 'subscribers') {
      this.bindSubscribersEvents(modalElem);
    } else if (this.activeTab === 'social') {
      this.bindSocialEvents(modalElem);
    } else if (this.activeTab === 'settings') {
      this.bindSettingsEvents(modalElem);
    } else if (this.activeTab === 'articles') {
      this.bindTableActionEvents(modalElem);
    }
  }

  // Bind Settings Tab Events (Admin Accounts & Password Management)
  private bindSettingsEvents(modalElem: HTMLElement) {
    const user = AuthService.getCurrentUser();

    // Quick jump to Social Media settings
    modalElem.querySelector('#btn-goto-social-settings')?.addEventListener('click', () => {
      this.activeTab = 'social';
      modalElem.innerHTML = this.renderAdminModalHTML();
      this.bindAdminEvents(modalElem);
    });

    // Add Editor Account Modal Trigger (Superuser only)
    modalElem.querySelector('#btn-add-admin-account')?.addEventListener('click', () => {
      this.showAddEditorModal(modalElem);
    });

    // Delete Editor Account (Superuser only)
    modalElem.querySelectorAll('.btn-delete-admin-account').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || 'Akun';
        if (!id) return;
        if (confirm(`Apakah Anda yakin ingin menghapus akun Editor "${name}"? Akun ini tidak akan bisa login lagi.`)) {
          const res = AuthService.deleteAdminAccount(id);
          Toast.show(res.message);
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
        }
      });
    });

    // Change Password Form Handler
    const formPass = modalElem.querySelector('#form-change-password') as HTMLFormElement;
    if (formPass) {
      formPass.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPass = (modalElem.querySelector('#change-old-password') as HTMLInputElement).value;
        const newPass = (modalElem.querySelector('#change-new-password') as HTMLInputElement).value;
        const confirmPass = (modalElem.querySelector('#change-confirm-password') as HTMLInputElement).value;

        if (!oldPass || !newPass || !confirmPass) {
          Toast.show('Mohon lengkapi semua kolom kata sandi.');
          return;
        }

        if (newPass !== confirmPass) {
          Toast.show('Kata sandi baru dan konfirmasi kata sandi tidak cocok!');
          return;
        }

        if (newPass.length < 6) {
          Toast.show('Kata sandi baru minimal 6 karakter.');
          return;
        }

        const res = AuthService.changePassword(user?.email || 'rijalumami000@gmail.com', oldPass, newPass);
        if (res.success) {
          Toast.show(res.message);
          formPass.reset();
        } else {
          Toast.show(res.message);
        }
      });
    }
  }

  // Modal for Superuser to Create a New Editor Account
  private showAddEditorModal(parentModal: HTMLElement) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1rem;';

    overlay.innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl); padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 2.2rem; height: 2.2rem; border-radius: 8px; background: rgba(0, 242, 254, 0.12); color: #00f2fe; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                Tambah Akun Editor Baru
              </h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Akses khusus Manajer Publikasi & Kinerja Redaksi</span>
            </div>
          </div>
          <button class="btn-close" id="close-add-editor-modal" title="Tutup" style="background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="form-create-editor" style="display: flex; flex-direction: column; gap: 1.15rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Lengkap Jurnalis / Redaktur *</label>
            <input type="text" id="add-editor-name" required placeholder="e.g. Dimas Prasetyo" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Email Akun Redaksi *</label>
            <input type="email" id="add-editor-email" required placeholder="e.g. dimas@queryindo.com" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kata Sandi Awal *</label>
            <input type="password" id="add-editor-password" required minlength="6" placeholder="Minimal 6 karakter..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
            💡 <em>Akun editor yang dibuat hanya dapat mengakses menu <strong>Manajer Publikasi</strong> dan <strong>Kinerja Redaksi</strong>.</em>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-add-editor" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow);">
              Buat Akun Editor
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-add-editor-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-add-editor')?.addEventListener('click', closeForm);

    const form = overlay.querySelector('#form-create-editor') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = (overlay.querySelector('#add-editor-name') as HTMLInputElement).value.trim();
      const email = (overlay.querySelector('#add-editor-email') as HTMLInputElement).value.trim();
      const password = (overlay.querySelector('#add-editor-password') as HTMLInputElement).value.trim();

      const res = AuthService.createEditorAccount({ fullName, email, password });
      if (res.success) {
        Toast.show(res.message);
        closeForm();
        parentModal.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(parentModal);
      } else {
        Toast.show(res.message);
      }
    });
  }

  // Bind Social Media Management Events (CRUD)
  private bindSocialEvents(modalElem: HTMLElement) {
    // Add Social Link
    modalElem.querySelector('#btn-add-social')?.addEventListener('click', () => {
      this.showSocialFormModal(null, modalElem);
    });

    // Reset to Default
    modalElem.querySelector('#btn-reset-social')?.addEventListener('click', () => {
      if (confirm('Kembalikan daftar kanal media sosial resmi ke konfigurasi standar QUERYINDO?')) {
        SocialMediaService.resetToDefault();
        Toast.show('Daftar media sosial direset ke standar.');
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
      }
    });

    // Edit Social Link
    modalElem.querySelectorAll('.btn-edit-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        const link = SocialMediaService.getLinks().find(l => l.id === id);
        if (link) {
          this.showSocialFormModal(link, modalElem);
        }
      });
    });

    // Delete Social Link
    modalElem.querySelectorAll('.btn-delete-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || 'Akun';
        if (!id) return;

        if (confirm(`Hapus akun media sosial "${name}" dari sistem?`)) {
          SocialMediaService.deleteLink(id);
          Toast.show(`Akun "${name}" berhasil dihapus.`);
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
        }
      });
    });

    // Toggle Active Status
    modalElem.querySelectorAll('.btn-toggle-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        SocialMediaService.toggleActive(id);
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
      });
    });

    // Move Order Up
    modalElem.querySelectorAll('.btn-move-social-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (SocialMediaService.moveOrder(id, 'up')) {
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
        }
      });
    });

    // Move Order Down
    modalElem.querySelectorAll('.btn-move-social-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (SocialMediaService.moveOrder(id, 'down')) {
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
        }
      });
    });
  }

  // Show Social Media Form Modal for Add & Edit
  private showSocialFormModal(link: SocialLink | null, modalElem: HTMLElement) {
    const isEdit = !!link;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '2500';
    overlay.style.background = 'rgba(7, 9, 14, 0.85)';
    overlay.style.backdropFilter = 'blur(10px)';

    const platforms: SocialPlatform[] = [
      'facebook',
      'instagram',
      'threads',
      'x',
      'tiktok',
      'youtube',
      'linkedin',
      'telegram',
      'whatsapp',
      'custom'
    ];

    const currentPlatform = link?.platform || 'instagram';
    const currentMeta = PLATFORM_METAS[currentPlatform] || PLATFORM_METAS.custom;

    overlay.innerHTML = `
      <div class="modal-card" style="width: 100%; max-width: 520px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); overflow: hidden; display: flex; flex-direction: column;">
        
        <div style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div id="form-platform-icon-preview" style="width: 2.2rem; height: 2.2rem; border-radius: 8px; background: ${currentMeta.brandColor === '#000000' ? '#111827' : currentMeta.brandColor}; display: flex; align-items: center; justify-content: center; color: #ffffff;">
              ${currentMeta.svgIcon}
            </div>
            <div>
              <h3 style="font-weight: 800; font-size: 1.05rem; margin: 0; color: var(--text-primary);">
                ${isEdit ? 'Sunting Akun Media Sosial' : 'Tambah Akun Media Sosial'}
              </h3>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Integrasi ekosistem digital resmi QUERYINDO</span>
            </div>
          </div>
          <button id="close-social-modal" style="background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="social-form" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Pilih Platform Media Sosial *</label>
            <select id="form-social-platform" required style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
              ${platforms.map(p => {
                const meta = PLATFORM_METAS[p];
                return `<option value="${p}" ${p === currentPlatform ? 'selected' : ''}>${meta.name}</option>`;
              }).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama / Handle Akun *</label>
            <input type="text" id="form-social-name" required value="${link?.name || ''}" placeholder="e.g. @queryindo atau QUERYINDO Official" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tautan URL Lengkap *</label>
            <input type="url" id="form-social-url" required value="${link?.url || ''}" placeholder="${currentMeta.placeholderUrl}" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-family: var(--font-mono);" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Urutan Tampilan</label>
              <input type="number" id="form-social-order" min="1" max="99" value="${link?.order ?? (SocialMediaService.getLinks().length + 1)}" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div style="padding-top: 1.25rem;">
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); cursor: pointer;">
                <input type="checkbox" id="form-social-active" ${link ? (link.isActive ? 'checked' : '') : 'checked'} style="width: 1.1rem; height: 1.1rem; accent-color: var(--accent-primary);" />
                <span>Tampilkan di Footer</span>
              </label>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <button type="button" id="btn-cancel-social-form" style="padding: 0.6rem 1.1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Batal</button>
            <button type="submit" style="padding: 0.6rem 1.4rem; background: var(--accent-primary); border: none; border-radius: var(--radius-md); color: #ffffff; font-size: 0.85rem; font-weight: 700; cursor: pointer;">Simpan Akun</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-social-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-social-form')?.addEventListener('click', closeForm);

    const platformSelect = overlay.querySelector('#form-social-platform') as HTMLSelectElement;
    const urlInput = overlay.querySelector('#form-social-url') as HTMLInputElement;
    const nameInput = overlay.querySelector('#form-social-name') as HTMLInputElement;
    const previewContainer = overlay.querySelector('#form-platform-icon-preview') as HTMLElement;

    platformSelect?.addEventListener('change', () => {
      const selected = platformSelect.value as SocialPlatform;
      const meta = PLATFORM_METAS[selected] || PLATFORM_METAS.custom;
      if (previewContainer) {
        previewContainer.style.background = meta.brandColor === '#000000' ? '#111827' : meta.brandColor;
        previewContainer.innerHTML = meta.svgIcon;
      }
      if (urlInput && (!urlInput.value || urlInput.value.includes('queryindo'))) {
        urlInput.placeholder = meta.placeholderUrl;
      }
      if (nameInput && !nameInput.value) {
        nameInput.value = meta.name;
      }
    });

    const form = overlay.querySelector('#social-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const platform = platformSelect.value as SocialPlatform;
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      const order = parseInt((overlay.querySelector('#form-social-order') as HTMLInputElement).value, 10) || 1;
      const isActive = (overlay.querySelector('#form-social-active') as HTMLInputElement).checked;

      if (!name || !url) {
        alert('Mohon isi nama dan URL tautan media sosial secara lengkap.');
        return;
      }

      if (isEdit && link) {
        SocialMediaService.updateLink(link.id, {
          platform,
          name,
          url,
          order,
          isActive
        });
        Toast.show(`Akun "${name}" berhasil diperbarui.`);
      } else {
        SocialMediaService.addLink({
          platform,
          name,
          url,
          order,
          isActive
        });
        Toast.show(`Akun "${name}" berhasil ditambahkan.`);
      }

      closeForm();
      modalElem.innerHTML = this.renderAdminModalHTML();
      this.bindAdminEvents(modalElem);
    });
  }

  // Bind Authors Management Events (CRUD)
  private bindAuthorsEvents(modalElem: HTMLElement) {
    // Add New Author
    modalElem.querySelector('#btn-add-author')?.addEventListener('click', () => {
      this.showAuthorFormModal(null, modalElem);
    });

    // Edit Author
    modalElem.querySelectorAll('.btn-edit-author').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-author-id');
        if (!id) return;
        const author = AuthorService.getAuthorById(id);
        if (author) {
          this.showAuthorFormModal(author, modalElem);
        }
      });
    });

    // Delete Author
    modalElem.querySelectorAll('.btn-delete-author').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-author-id');
        const name = btn.getAttribute('data-author-name') || 'Jurnalis';
        if (!id) return;

        const relatedArticles = this.articles.filter(a => a.author.name.toLowerCase() === name.toLowerCase());
        const confirmMsg = relatedArticles.length > 0
          ? `Hapus jurnalis "${name}" dari dewan redaksi?\n\nPerhatian: Terdapat ${relatedArticles.length} artikel yang ditulis oleh jurnalis ini.`
          : `Yakin ingin menghapus jurnalis "${name}" dari dewan redaksi?`;

        if (confirm(confirmMsg)) {
          const success = await AuthorService.deleteAuthor(id);
          if (success) {
            Toast.show(`Jurnalis "${name}" berhasil dihapus.`);
            modalElem.innerHTML = this.renderAdminModalHTML();
            this.bindAdminEvents(modalElem);
          }
        }
      });
    });
  }

  // Show Author Form Modal for Add & Edit
  private showAuthorFormModal(author: AuthorProfile | null, modalElem: HTMLElement) {
    const isEdit = !!author;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '2500';
    overlay.style.background = 'rgba(7, 9, 14, 0.85)';
    overlay.style.backdropFilter = 'blur(10px)';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 580px; width: 92%; margin: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg);">
        <div class="modal-header-bar" style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2rem; height: 2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">✍️</div>
            <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary);">${isEdit ? 'Sunting Profil Jurnalis' : 'Tambah Jurnalis Redaksi Baru'}</h3>
          </div>
          <button class="btn-close" id="close-author-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>

        <form id="author-crud-form" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1.2rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Lengkap & Gelar *</label>
            <input type="text" id="form-author-name" required value="${author?.name || ''}" placeholder="e.g. Raditya Pratama, M.Kom." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Divisi / Bagian Redaksi *</label>
              <select id="form-author-division" required style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
                ${EDITORIAL_DIVISIONS.map(div => `<option value="${div}" ${author?.division === div ? 'selected' : ''}>${div}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Urutan Tampilan</label>
              <input type="number" id="form-author-order" value="${author?.order || 1}" min="1" max="99" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Jabatan / Posisi Redaksi *</label>
              <input type="text" id="form-author-role" required value="${author?.role || ''}" placeholder="e.g. Editor Senior AI & Cloud" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Email Resmi Redaksi *</label>
              <input type="email" id="form-author-email" required value="${author?.email || ''}" placeholder="e.g. raditya@queryindo.com" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">
                Foto Profil Avatar *
              </label>
              <label for="form-author-file-input" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat (Galeri/File)</span>
              </label>
              <input type="file" id="form-author-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-author-avatar-preview" src="${author?.avatar ? ImageUtils.normalizeImageUrl(author.avatar) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-cyan); flex-shrink: 0; background: var(--bg-tertiary);" />
              <input type="text" id="form-author-avatar" required value="${author?.avatar ? ImageUtils.normalizeImageUrl(author.avatar) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" placeholder="Tempel URL gambar atau Google Drive..." style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div id="author-avatar-help" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem; line-height: 1.4;">
              💡 <em>Mendukung link Google Drive, Unsplash, atau upload foto langsung dari perangkat Anda. (Link Google Drive otomatis dikonversi).</em>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Biografi Ringkas & Spesialisasi Liputan</label>
            <textarea id="form-author-bio" rows="3" placeholder="Tuliskan latar belakang dan fokus liputan..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; resize: vertical;">${author?.bio || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Handle X / Twitter</label>
              <input type="text" id="form-author-twitter" value="${author?.socialTwitter || ''}" placeholder="@username" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Link Profil LinkedIn</label>
              <input type="url" id="form-author-linkedin" value="${author?.socialLinkedin || ''}" placeholder="https://linkedin.com/in/..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-author-form" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow);">
              ${isEdit ? 'Simpan Perubahan' : 'Tambah Jurnalis'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => {
      overlay.remove();
    };

    overlay.querySelector('#close-author-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-author-form')?.addEventListener('click', closeForm);

    const avatarInput = overlay.querySelector('#form-author-avatar') as HTMLInputElement;
    const avatarPreview = overlay.querySelector('#form-author-avatar-preview') as HTMLImageElement;
    const fileInput = overlay.querySelector('#form-author-file-input') as HTMLInputElement;
    const helpMsg = overlay.querySelector('#author-avatar-help') as HTMLElement;

    const updateAvatarPreview = (rawUrl: string) => {
      const normalized = ImageUtils.normalizeImageUrl(rawUrl);
      if (normalized !== rawUrl && avatarInput) {
        avatarInput.value = normalized;
      }
      if (avatarPreview) {
        avatarPreview.src = normalized;
      }
    };

    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('input', () => updateAvatarPreview(avatarInput.value));
      avatarInput.addEventListener('change', () => updateAvatarPreview(avatarInput.value));
      avatarInput.addEventListener('paste', () => setTimeout(() => updateAvatarPreview(avatarInput.value), 40));

      avatarPreview.onerror = () => {
        const nameVal = (overlay.querySelector('#form-author-name') as HTMLInputElement)?.value || 'User';
        const currentSrc = avatarPreview.src;
        // If Google Drive link failed on lh3, try Google thumbnail endpoint
        if (currentSrc.includes('lh3.googleusercontent.com/d/')) {
          const id = currentSrc.split('/d/')[1];
          if (id) {
            avatarPreview.src = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
            return;
          }
        }
        // Fallback to initials avatar
        avatarPreview.src = ImageUtils.getInitialsAvatar(nameVal);
        if (helpMsg) {
          helpMsg.innerHTML = `<span style="color:var(--accent-rose);">⚠️ Gambar Google Drive tidak dapat dimuat. Pastikan izin berbagi file disetel ke <strong>"Siapa saja yang memiliki tautan" (Public)</strong>, atau klik <strong>"Upload dari Perangkat"</strong> di atas.</span>`;
        }
      };

      avatarPreview.onload = () => {
        if (helpMsg && !avatarPreview.src.startsWith('data:image/svg')) {
          helpMsg.innerHTML = `<span style="color:var(--accent-emerald);">✓ Foto profil berhasil dimuat.</span>`;
        }
      };
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 400, 0.85, (dataUrl) => {
            if (avatarInput) avatarInput.value = dataUrl;
            if (avatarPreview) avatarPreview.src = dataUrl;
            Toast.show('Foto berhasil dipilih dari perangkat!');
          }, (err) => {
            alert(err);
          });
        }
      });
    }

    const form = overlay.querySelector('#author-crud-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (overlay.querySelector('#form-author-name') as HTMLInputElement).value.trim();
        const division = (overlay.querySelector('#form-author-division') as HTMLSelectElement).value;
        const order = parseInt((overlay.querySelector('#form-author-order') as HTMLInputElement).value) || 1;
        const role = (overlay.querySelector('#form-author-role') as HTMLInputElement).value.trim();
        const email = (overlay.querySelector('#form-author-email') as HTMLInputElement).value.trim();
        const avatar = (overlay.querySelector('#form-author-avatar') as HTMLInputElement).value.trim();
        const bio = (overlay.querySelector('#form-author-bio') as HTMLTextAreaElement).value.trim();
        const socialTwitter = (overlay.querySelector('#form-author-twitter') as HTMLInputElement).value.trim();
        const socialLinkedin = (overlay.querySelector('#form-author-linkedin') as HTMLInputElement).value.trim();

        if (!name || !role || !email) {
          alert('Nama, Jabatan, dan Email wajib diisi!');
          return;
        }

        if (isEdit && author) {
          await AuthorService.updateAuthor(author.id, {
            name,
            role,
            division,
            order,
            email,
            avatar: avatar || author.avatar,
            bio,
            socialTwitter: socialTwitter || undefined,
            socialLinkedin: socialLinkedin || undefined
          });
          Toast.show(`Profil jurnalis "${name}" berhasil diperbarui!`);
        } else {
          await AuthorService.addAuthor({
            name,
            role,
            division,
            order,
            email,
            avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            bio,
            socialTwitter: socialTwitter || undefined,
            socialLinkedin: socialLinkedin || undefined
          });
          Toast.show(`Jurnalis baru "${name}" berhasil ditambahkan!`);
        }

        closeForm();
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    }
  }

  // Show Ad Campaign Modal (Add & Edit)
  private showAdFormModal(ad: AdCampaign | null, modalElem: HTMLElement) {
    const isEdit = !!ad;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '2500';
    overlay.style.background = 'rgba(7, 9, 14, 0.85)';
    overlay.style.backdropFilter = 'blur(10px)';

    const placementOptions = [
      { value: 'leaderboard', label: 'Leaderboard Banner (728x90 • Header Top Portal)' },
      { value: 'billboard', label: 'Billboard Banner (970x250 • Panoramic Atas Berita)' },
      { value: 'midstream', label: 'Midstream Interstitial (Horizontal Tengah Feed Berita)' },
      { value: 'sidebar', label: 'Sidebar Widget Ad (300x250 • Kolom Samping Berita)' },
      { value: 'skyscraper_left', label: 'Skyscraper Kiri (160x600 • Rail Desktop Kiri)' },
      { value: 'skyscraper_right', label: 'Skyscraper Kanan (160x600 • Rail Desktop Kanan)' },
      { value: 'in_article', label: 'In-Article Ad (Banner Sponsor di Dalam Pembaca Artikel)' },
      { value: 'in_feed', label: 'In-Feed Native Ad (Kartu Sponsor di Grid Berita)' }
    ];

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 640px; width: 92%; margin: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header-bar" style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.2rem; height: 2.2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">📢</div>
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary);">${isEdit ? 'Sunting Kampanye Iklan' : 'Tambah Kampanye Iklan Baru'}</h3>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">Inventori Slot Iklan & Kemitraan Digital</span>
            </div>
          </div>
          <button class="btn-close" id="close-ad-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>

        <form id="ad-crud-form" style="padding: 1.75rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.15rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Sponsor / Brand Pengiklan *</label>
            <input type="text" id="form-ad-sponsor" required value="${ad?.sponsorName || ''}" placeholder="e.g. NVIDIA Enterprise AI" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Slot Penempatan Iklan (Placement) *</label>
              <select id="form-ad-placement" required style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
                ${placementOptions.map(opt => `<option value="${opt.value}" ${ad?.placement === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Status Tayang</label>
              <select id="form-ad-status" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
                <option value="true" ${ad ? (ad.isActive ? 'selected' : '') : 'selected'}>Aktif (Tayang)</option>
                <option value="false" ${ad && !ad.isActive ? 'selected' : ''}>Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tagline / Pesan Promosi Sponsor *</label>
            <textarea id="form-ad-tagline" rows="2" required placeholder="Tuliskan pesan promosi produk atau solusi..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; resize: vertical;">${ad?.tagline || ''}</textarea>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">
                URL Banner Gambar (Image URL) *
              </label>
              <label for="form-ad-file-input" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat</span>
              </label>
              <input type="file" id="form-ad-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-ad-img-preview" src="${ad?.imageUrl ? ImageUtils.normalizeImageUrl(ad.imageUrl) : 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'}" style="width: 68px; height: 44px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--border-color); flex-shrink: 0; background: var(--bg-tertiary);" />
              <input type="text" id="form-ad-image" required value="${ad?.imageUrl ? ImageUtils.normalizeImageUrl(ad.imageUrl) : 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'}" placeholder="https://... atau Google Drive link" style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">URL Link Tujuan (Target URL) *</label>
              <input type="url" id="form-ad-target" required value="${ad?.targetUrl || 'https://'}" placeholder="https://..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Teks Tombol CTA *</label>
              <input type="text" id="form-ad-cta" required value="${ad?.ctaText || 'Pelajari Selengkapnya →'}" placeholder="e.g. Uji Coba Gratis →" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-ad-form" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow);">
              ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Iklan'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-ad-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-ad-form')?.addEventListener('click', closeForm);

    const imgInput = overlay.querySelector('#form-ad-image') as HTMLInputElement;
    const imgPreview = overlay.querySelector('#form-ad-img-preview') as HTMLImageElement;
    const adFileInput = overlay.querySelector('#form-ad-file-input') as HTMLInputElement;

    const updateAdPreview = (rawUrl: string) => {
      const normalized = ImageUtils.normalizeImageUrl(rawUrl);
      if (normalized !== rawUrl && imgInput) {
        imgInput.value = normalized;
      }
      if (imgPreview) {
        imgPreview.src = normalized;
      }
    };

    if (imgInput && imgPreview) {
      imgInput.addEventListener('input', () => updateAdPreview(imgInput.value));
      imgInput.addEventListener('change', () => updateAdPreview(imgInput.value));
      imgInput.addEventListener('paste', () => setTimeout(() => updateAdPreview(imgInput.value), 40));
    }

    if (adFileInput) {
      adFileInput.addEventListener('change', () => {
        const file = adFileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 1200, 0.85, (dataUrl) => {
            if (imgInput) imgInput.value = dataUrl;
            if (imgPreview) imgPreview.src = dataUrl;
            Toast.show('Banner berhasil dipilih dari perangkat!');
          }, (err) => {
            alert(err);
          });
        }
      });
    }

    const form = overlay.querySelector('#ad-crud-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sponsorName = (overlay.querySelector('#form-ad-sponsor') as HTMLInputElement).value.trim();
        const placement = (overlay.querySelector('#form-ad-placement') as HTMLSelectElement).value as AdPlacement;
        const tagline = (overlay.querySelector('#form-ad-tagline') as HTMLTextAreaElement).value.trim();
        const imageUrl = (overlay.querySelector('#form-ad-image') as HTMLInputElement).value.trim();
        const targetUrl = (overlay.querySelector('#form-ad-target') as HTMLInputElement).value.trim();
        const ctaText = (overlay.querySelector('#form-ad-cta') as HTMLInputElement).value.trim();
        const isActive = (overlay.querySelector('#form-ad-status') as HTMLSelectElement).value === 'true';

        if (!sponsorName || !tagline || !imageUrl || !targetUrl) {
          alert('Mohon lengkapi seluruh kolom yang wajib diisi!');
          return;
        }

        if (isEdit && ad) {
          AdBanner.updateCampaign(ad.id, {
            sponsorName,
            placement,
            tagline,
            imageUrl,
            targetUrl,
            ctaText,
            isActive
          });
          Toast.show(`Kampanye iklan "${sponsorName}" berhasil diperbarui!`);
        } else {
          AdBanner.addCampaign({
            sponsorName,
            placement,
            tagline,
            imageUrl,
            targetUrl,
            ctaText,
            isActive
          });
          Toast.show(`Kampanye iklan baru "${sponsorName}" berhasil ditambahkan!`);
        }

        closeForm();
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    }
  }

  // Bind Ads Management Events
  private bindAdsEvents(modalElem: HTMLElement) {
    // Placement filter pills
    modalElem.querySelectorAll('.ad-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const placement = pill.getAttribute('data-placement') || 'all';
        this.adPlacementFilter = placement;
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
      });
    });

    // Add New Campaign modal
    modalElem.querySelector('#btn-add-ad-campaign')?.addEventListener('click', () => {
      this.showAdFormModal(null, modalElem);
    });
    modalElem.querySelector('#btn-add-ad-empty')?.addEventListener('click', () => {
      this.showAdFormModal(null, modalElem);
    });

    // Edit Campaign modal
    modalElem.querySelectorAll('.btn-edit-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (!id) return;
        const ad = AdBanner.getCampaignById(id);
        if (ad) {
          this.showAdFormModal(ad, modalElem);
        }
      });
    });

    // Toggle Active Status
    modalElem.querySelectorAll('.btn-toggle-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (!id) return;
        AdBanner.toggleCampaign(id);
        const ad = AdBanner.getCampaignById(id);
        Toast.show(`Status iklan "${ad?.sponsorName || ''}" diubah ke ${ad?.isActive ? 'Aktif' : 'Nonaktif'}.`);
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    });

    // Delete Ad Campaign
    modalElem.querySelectorAll('.btn-delete-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (!id) return;
        const ad = AdBanner.getCampaignById(id);
        if (confirm(`Yakin ingin menghapus kampanye iklan "${ad?.sponsorName || ''}"?`)) {
          AdBanner.deleteCampaign(id);
          Toast.show('Kampanye iklan sponsor telah dihapus.');
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
          this.onArticlesChange();
        }
      });
    });
  }

  // Bind Shopping Management Events
  private bindShoppingEvents(modalElem: HTMLElement) {
    // Re-bind preview slider controls
    const previewContainer = modalElem.querySelector('#admin-shopping-live-preview') as HTMLElement;
    if (previewContainer) {
      ShoppingCarousel.bindEvents(previewContainer);
    }

    // Toggle entire banner
    const toggleBanner = modalElem.querySelector('#toggle-shopping-banner') as HTMLInputElement;
    if (toggleBanner) {
      toggleBanner.addEventListener('change', () => {
        const config = ShoppingCarousel.getConfig();
        config.enabled = toggleBanner.checked;
        ShoppingCarousel.saveConfig(config);
        Toast.show(`Banner Rekomendasi Belanja sekarang ${config.enabled ? 'Diaktifkan' : 'Dinonaktifkan'}.`);
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    }

    // Save config texts
    const formConfig = modalElem.querySelector('#form-shopping-config') as HTMLFormElement;
    if (formConfig) {
      formConfig.addEventListener('submit', (e) => {
        e.preventDefault();
        const badge = (modalElem.querySelector('#cfg-shop-badge') as HTMLInputElement).value;
        const partner = (modalElem.querySelector('#cfg-shop-partner') as HTMLInputElement).value;
        const title = (modalElem.querySelector('#cfg-shop-title') as HTMLInputElement).value;

        const config = ShoppingCarousel.getConfig();
        config.badgeText = badge;
        config.partnerText = partner;
        config.mainTitle = title;
        ShoppingCarousel.saveConfig(config);

        Toast.show('Pengaturan teks banner belanja berhasil disimpan.');
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    }

    // Add Product Modal
    modalElem.querySelector('#btn-add-shopping-product')?.addEventListener('click', () => {
      this.showShoppingProductModal(undefined, modalElem);
    });

    // Edit Product Modal
    modalElem.querySelectorAll('.btn-edit-shop-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-product-id');
        if (!id) return;
        const product = ShoppingCarousel.getProducts().find(p => p.id === id);
        if (product) {
          this.showShoppingProductModal(product, modalElem);
        }
      });
    });

    // Toggle Product Active
    modalElem.querySelectorAll('.btn-toggle-shop-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-product-id');
        if (!id) return;
        ShoppingCarousel.toggleProduct(id);
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    });

    // Delete Product
    modalElem.querySelectorAll('.btn-delete-shop-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-product-id');
        const title = btn.getAttribute('data-product-title') || 'Produk';
        if (!id) return;
        if (confirm(`Yakin ingin menghapus produk "${title}" dari daftar rekomendasi?`)) {
          await ShoppingCarousel.deleteProduct(id);
          Toast.show(`Produk "${title}" telah dihapus.`);
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
          this.onArticlesChange();
        }
      });
    });
  }

  // Modal Form for Adding or Editing a Shopping Product
  private showShoppingProductModal(product?: ShoppingProduct, parentModal?: HTMLElement) {
    const isEdit = !!product;
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1rem;';

    const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
    const initialImg = product?.imageUrl ? ImageUtils.normalizeImageUrl(product.imageUrl) : defaultImg;

    overlay.innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl); padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 2rem; height: 2rem; border-radius: 8px; background: rgba(0, 242, 254, 0.12); color: #00f2fe; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                ${isEdit ? 'Edit Produk Belanja' : 'Tambah Produk Belanja Baru'}
              </h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Tampil di widget carousel Query Picks / Radar Gadget</span>
            </div>
          </div>
          <button class="btn-close" id="close-shop-modal" title="Tutup" style="background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="form-shopping-product" style="display: flex; flex-direction: column; gap: 1.15rem;">
          <!-- Product Title -->
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama / Judul Produk *</label>
            <input type="text" id="form-shop-title" required value="${product?.title || ''}" placeholder="e.g. POCO C65 (6/128 GB) Baterai 5000mAh Layar 90Hz" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <!-- Category -->
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kategori Produk</label>
            <input type="text" id="form-shop-category" value="${product?.category || 'Gadget & Tech'}" placeholder="e.g. Gadget, Fashion, Audio, PC" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <!-- Product Image & Direct Upload -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Foto Produk *</label>
              <label for="form-shop-file-input" style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(0, 242, 254, 0.08); padding: 0.2rem 0.55rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.25);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat</span>
              </label>
              <input type="file" id="form-shop-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-shop-img-preview" src="${initialImg}" style="width: 58px; height: 58px; border-radius: 8px; object-fit: contain; background: #ffffff; border: 1.5px solid var(--border-color); padding: 2px; flex-shrink: 0;" />
              <input type="text" id="form-shop-image" required value="${initialImg}" placeholder="URL foto atau Google Drive link" style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              Bisa langsung upload file foto dari galeri/laptop Anda, atau paste link Google Drive / URL CDN.
            </span>
          </div>

          <!-- Pricing Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 90px; gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Harga Asli (Coret)</label>
              <input type="text" id="form-shop-orig-price" value="${product?.originalPrice || ''}" placeholder="e.g. Rp 168.086" style="width: 100%; padding: 0.65rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Harga Promo / Diskon *</label>
              <input type="text" id="form-shop-disc-price" required value="${product?.discountPrice || ''}" placeholder="e.g. Rp 79.000" style="width: 100%; padding: 0.65rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--accent-cyan); font-weight: 800; font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Diskon %</label>
              <input type="text" id="form-shop-percent" value="${product?.discountPercent || ''}" placeholder="53%" style="width: 100%; padding: 0.65rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: #dc2626; font-weight: 800; font-size: 0.85rem; text-align: center;" />
            </div>
          </div>

          <!-- Target Link -->
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tautan Beli / Link Afiliasi (Shopee / Tokopedia / Toko) *</label>
            <input type="url" id="form-shop-target" required value="${product?.targetUrl || 'https://shopee.co.id'}" placeholder="https://shopee.co.id/..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <!-- Active Switch -->
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary);">Status Tayang Produk</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Aktifkan produk agar langsung berputar di carousel beranda</div>
            </div>
            <input type="checkbox" id="form-shop-active" ${product ? (product.isActive ? 'checked' : '') : 'checked'} style="width: 1.25rem; height: 1.25rem; cursor: pointer;" />
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-shop-form" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: #ea580c; color: #ffffff; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4);">
              ${isEdit ? 'Simpan Perubahan' : 'Tambahkan Produk'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-shop-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-shop-form')?.addEventListener('click', closeForm);

    const imgInput = overlay.querySelector('#form-shop-image') as HTMLInputElement;
    const imgPreview = overlay.querySelector('#form-shop-img-preview') as HTMLImageElement;
    const fileInput = overlay.querySelector('#form-shop-file-input') as HTMLInputElement;

    const updatePreview = (url: string) => {
      const normalized = ImageUtils.normalizeImageUrl(url);
      if (normalized !== url && imgInput) {
        imgInput.value = normalized;
      }
      if (imgPreview) {
        imgPreview.src = normalized || ImageUtils.getInitialsAvatar('Produk', '#ff9800');
      }
    };

    if (imgInput) {
      imgInput.addEventListener('input', () => updatePreview(imgInput.value));
      imgInput.addEventListener('change', () => updatePreview(imgInput.value));
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 600, 0.85, (base64) => {
            imgInput.value = base64;
            imgPreview.src = base64;
            Toast.show('Foto produk berhasil diunggah dari perangkat.');
          });
        }
      });
    }

    // Handle Form Submit
    const form = overlay.querySelector('#form-shopping-product') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (overlay.querySelector('#form-shop-title') as HTMLInputElement).value.trim();
      const category = (overlay.querySelector('#form-shop-category') as HTMLInputElement).value.trim();
      const imageUrl = (overlay.querySelector('#form-shop-image') as HTMLInputElement).value.trim();
      const originalPrice = (overlay.querySelector('#form-shop-orig-price') as HTMLInputElement).value.trim();
      const discountPrice = (overlay.querySelector('#form-shop-disc-price') as HTMLInputElement).value.trim();
      let discountPercent = (overlay.querySelector('#form-shop-percent') as HTMLInputElement).value.trim();
      const targetUrl = (overlay.querySelector('#form-shop-target') as HTMLInputElement).value.trim();
      const isActive = (overlay.querySelector('#form-shop-active') as HTMLInputElement).checked;

      if (!title || !discountPrice || !targetUrl) {
        Toast.show('Harap lengkapi nama produk, harga promo, dan link beli.');
        return;
      }

      if (discountPercent && !discountPercent.includes('%') && !isNaN(Number(discountPercent))) {
        discountPercent = `${discountPercent}%`;
      }

      if (isEdit && product) {
        await ShoppingCarousel.updateProduct(product.id, {
          title,
          category,
          imageUrl,
          originalPrice,
          discountPrice,
          discountPercent,
          targetUrl,
          isActive
        });
        Toast.show(`Produk "${title}" berhasil diperbarui.`);
      } else {
        await ShoppingCarousel.addProduct({
          title,
          category,
          imageUrl,
          originalPrice,
          discountPrice,
          discountPercent,
          targetUrl,
          isActive
        });
        Toast.show(`Produk "${title}" berhasil ditambahkan.`);
      }

      closeForm();
      if (parentModal) {
        parentModal.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(parentModal);
      }
      this.onArticlesChange();
    });
  }

  // Bind Polls Management Events
  private bindPollsEvents(modalElem: HTMLElement) {
    const form = modalElem.querySelector('#form-manage-poll') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const qId = (modalElem.querySelector('#poll-question-id') as HTMLInputElement).value;
        const qEn = (modalElem.querySelector('#poll-question-en') as HTMLInputElement).value;

        const currentPoll = ReaderPoll.getPollData();
        const newOptions = currentPoll.options.map((opt, idx) => {
          const idInput = modalElem.querySelector(`.poll-opt-id[data-idx="${idx}"]`) as HTMLInputElement;
          const enInput = modalElem.querySelector(`.poll-opt-en[data-idx="${idx}"]`) as HTMLInputElement;
          return {
            ...opt,
            textId: idInput ? idInput.value : opt.textId,
            textEn: enInput ? enInput.value : opt.textEn
          };
        });

        const updatedPoll: PollData = {
          id: `poll-${Date.now()}`,
          questionId: qId,
          questionEn: qEn,
          options: newOptions
        };

        ReaderPoll.savePollData(updatedPoll);
        Toast.show('Polling editorial baru berhasil dirilis ke beranda!');
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      });
    }

    // Reset votes button
    modalElem.querySelector('#btn-reset-poll-votes')?.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mereset total perolehan suara polling ke 0?')) {
        const currentPoll = ReaderPoll.getPollData();
        currentPoll.options.forEach(opt => { opt.votes = 0; });
        ReaderPoll.savePollData(currentPoll);
        Toast.show('Total suara polling telah direset ke 0.');
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        this.onArticlesChange();
      }
    });
  }

  // Bind Subscribers Management Events
  private async bindSubscribersEvents(modalElem: HTMLElement) {
    const subs = await ApiService.getSubscribers();
    
    // Update metric count
    const metricCount = modalElem.querySelector('#metric-subscribers-count');
    if (metricCount) {
      metricCount.textContent = `${subs.length} Pembaca`;
    }

    const renderTableContent = (items: typeof subs) => {
      const tbody = modalElem.querySelector('#subscribers-table-body');
      if (!tbody) return;

      if (items.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="padding: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
              Belum ada pelanggan newsletter yang terdaftar.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = items.map((s, idx) => {
        const dateStr = s.createdAt || s.date ? new Date(s.createdAt || s.date!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja';
        const subId = s.id || s.email;
        return `
          <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); color: var(--text-muted); font-size: 0.8rem;">#${idx + 1}</td>
            <td style="padding: 0.9rem 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: rgba(0, 242, 254, 0.1); color: var(--accent-cyan);">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <span style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${s.email}</span>
              </div>
            </td>
            <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary);">
              ${dateStr}
            </td>
            <td style="padding: 0.9rem 1.25rem;">
              <span class="tag-badge" style="background: rgba(16, 185, 129, 0.08); color: var(--accent-emerald); font-size: 0.68rem; border-color: rgba(16, 185, 129, 0.25);">
                AKTIF BERLANGGANAN
              </span>
            </td>
            <td style="padding: 0.9rem 1.25rem;">
              <span style="font-size: 0.75rem; color: var(--accent-cyan); display: inline-flex; align-items: center; gap: 0.35rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Hostinger API (HTTPS 443)</span>
              </span>
            </td>
            <td style="padding: 0.9rem 1.25rem; text-align: right;">
              <button class="btn-delete-subscriber" data-id="${subId}" data-email="${s.email}" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171; border-radius: 6px; padding: 0.35rem 0.65rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: background 0.15s;" title="Hapus Pelanggan">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span>Hapus</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind delete events
      tbody.querySelectorAll('.btn-delete-subscriber').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const email = btn.getAttribute('data-email') || '';
          if (!id) return;
          if (confirm(`Hapus email "${email}" dari daftar pelanggan newsletter?`)) {
            const res = await ApiService.deleteSubscriber(id);
            if (res.success) {
              Toast.show(`Pelanggan "${email}" berhasil dihapus.`);
              modalElem.innerHTML = this.renderAdminModalHTML();
              this.bindAdminEvents(modalElem);
            } else {
              Toast.show(res.message);
            }
          }
        });
      });
    };

    renderTableContent(subs);

    // Live search filter
    const filterInput = modalElem.querySelector('#filter-subscriber-input') as HTMLInputElement;
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        const kw = (e.target as HTMLInputElement).value.trim().toLowerCase();
        const filtered = subs.filter(s => s.email.toLowerCase().includes(kw));
        renderTableContent(filtered);
      });
    }

    // Export CSV
    modalElem.querySelector('#btn-export-subscribers-csv')?.addEventListener('click', () => {
      if (subs.length === 0) {
        Toast.show('Belum ada data pelanggan untuk diekspor.');
        return;
      }
      const csvHeader = 'No,Email,Tanggal_Pendaftaran,Status\n';
      const csvRows = subs.map((s, idx) => `"${idx + 1}","${s.email}","${s.createdAt || s.date || ''}","Aktif"`).join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queryindo_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.show('Data pelanggan newsletter berhasil diekspor ke CSV!');
    });

    // Open Broadcast Modal
    modalElem.querySelector('#btn-open-broadcast-modal')?.addEventListener('click', () => {
      this.showBroadcastModal(modalElem, subs);
    });
  }

  // Show Broadcast Newsletter Modal
  private showBroadcastModal(_modalElem: HTMLElement, subscribers: Array<any>) {
    const recentArticles = this.articles.slice(0, 8);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '2600';
    overlay.style.background = 'rgba(7, 9, 14, 0.88)';
    overlay.style.backdropFilter = 'blur(12px)';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 680px; width: 92%; margin: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header-bar" style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.2rem; height: 2.2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary);">Kirim Broadcast Buletin Berita</h3>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">Gateway: Hostinger Mail API (HTTPS 443)</span>
            </div>
          </div>
          <button class="btn-close" id="close-broadcast-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>

        <form id="broadcast-news-form" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; flex: 1;">
          <div style="background: rgba(0, 242, 254, 0.05); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div style="font-size: 0.825rem; color: var(--text-secondary);">
              Buletin ini akan dikirimkan ke <strong style="color: var(--accent-cyan);">${subscribers.length} pelanggan terdaftar</strong> menggunakan template HTML responsif dengan branding eksekutif QUERYINDO.
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Subjek Email (Subject Line) *</label>
            <input type="text" id="bc-subject" required value="QUERYINDO Daily Brief: Wawasan Berita Tekno & AI Terkini" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Headline Banner Utama Email *</label>
            <input type="text" id="bc-headline" required value="Rangkuman Berita Paling Krusial Hari Ini" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-secondary);">Pilih Naskah Berita untuk Disertakan (Maks. 5 Artikel):</label>
            <div style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 220px; overflow-y: auto; padding-right: 0.5rem;">
              ${recentArticles.map((art, idx) => `
                <label style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; cursor: pointer; transition: border-color 0.15s;">
                  <input type="checkbox" class="broadcast-article-chk" value="${art.id}" ${idx < 3 ? 'checked' : ''} style="accent-color: var(--accent-cyan); width: 16px; height: 16px;" />
                  <img src="${art.imageUrl}" alt="" style="width: 44px; height: 32px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.825rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${art.title}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${art.category.toUpperCase()} • ${art.readTimeMinutes} mnt baca</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-broadcast" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" id="btn-submit-broadcast" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow); display: flex; align-items: center; gap: 0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>Kirim Broadcast Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeOverlay = () => overlay.remove();
    overlay.querySelector('#close-broadcast-modal')?.addEventListener('click', closeOverlay);
    overlay.querySelector('#btn-cancel-broadcast')?.addEventListener('click', closeOverlay);

    const form = overlay.querySelector('#broadcast-news-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = overlay.querySelector('#btn-submit-broadcast') as HTMLButtonElement;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Mengirimkan Buletin via SMTP...</span>';
      }

      const subject = (overlay.querySelector('#bc-subject') as HTMLInputElement).value.trim();
      const headline = (overlay.querySelector('#bc-headline') as HTMLInputElement).value.trim();

      const selectedArticles = Array.from(overlay.querySelectorAll<HTMLInputElement>('.broadcast-article-chk:checked')).map(chk => {
        const artId = chk.value;
        const art = this.articles.find(a => a.id === artId);
        return {
          title: art?.title || '',
          category: art?.category?.toUpperCase() || 'TEKNO',
          excerpt: art?.subtitle || (art?.aiSummary ? art.aiSummary[0] : ''),
          url: `https://www.queryindo.com/#article-${art?.id || ''}`,
          imageUrl: art?.imageUrl || '',
          readTime: `${art?.readTimeMinutes || 3} mnt baca`
        };
      }).filter(a => a.title);

      const res = await ApiService.broadcastNewsletter({
        subject,
        headline,
        articles: selectedArticles
      });

      if (res.success) {
        Toast.show(res.message || 'Broadcast buletin berita berhasil diproses dan dikirim!');
        closeOverlay();
      } else {
        Toast.show(res.message || 'Gagal mengirimkan broadcast.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Kirim Broadcast Sekarang</span>';
        }
      }
    });
  }

  // Bind Table Actions
  private bindTableActionEvents(modalElem: HTMLElement) {
    modalElem.querySelectorAll('.btn-edit-article').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const art = this.articles.find(a => a.id === id);
        if (art) {
          this.openFullscreenArticleEditor(art, modalElem);
        }
      });
    });

    modalElem.querySelectorAll('.btn-toggle-featured').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const art = this.articles.find(a => a.id === id);
        if (art && id) {
          const newFeatured = !art.isFeatured;
          await ArticleService.updateArticle(id, { isFeatured: newFeatured });
          this.articles = ArticleService.getArticles();
          this.onArticlesChange();
          this.refreshTable(modalElem);
          Toast.show(`Status Headline artikel "${art.title}" berhasil diubah.`);
        }
      });
    });

    modalElem.querySelectorAll('.btn-delete-article').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (confirm('Apakah Anda yakin ingin menghapus artikel berita ini secara permanen dari portal QUERYINDO?')) {
          const success = await ArticleService.deleteArticle(id);
          if (success) {
            this.articles = ArticleService.getArticles();
            this.onArticlesChange();
            this.refreshTable(modalElem);
            Toast.show('Artikel berita berhasil dihapus secara permanen.');
          }
        }
      });
    });
  }

  private refreshTable(modalElem: HTMLElement) {
    const tbody = modalElem.querySelector('#cms-table-body');
    if (tbody) {
      tbody.innerHTML = this.renderTableRowsHTML();
      this.bindTableActionEvents(modalElem);
    }
  }

  // Professional Fullscreen Manuscript WYSIWYG & Visual Studio Canvas
  private openFullscreenArticleEditor(article: Article | null, parentModal: HTMLElement) {
    const isEdit = article !== null;
    const user = AuthService.getCurrentUser();

    const initialContent = article ? article.content : `
      <p class="article-lead">Tulis paragraf pembuka naskah berita di sini dengan bahasa lugas dan berbobot.</p>
      <h2>Sub-Bab Analisis & Fakta Lapangan</h2>
      <p>Paparkan fakta teknis, kutipan narasumber, atau temuan investigasi di paragraf ini.</p>
      <blockquote>"Kedaulatan digital dan komputasi cerdas menjadi pilar masa depan pertumbuhan ekonomi nasional."</blockquote>
    `;


    const authorsList = AuthorService.getAuthors();
    const currentAuthorName = article ? article.author.name : (user?.fullName || 'Rijal Umami');
    const isKnownAuthor = authorsList.some(a => a.name.toLowerCase() === currentAuthorName.toLowerCase());

    const editorPage = document.createElement('div');
    editorPage.id = 'manuscript-editor-fullscreen';
    editorPage.setAttribute('data-lenis-prevent', 'true');
    editorPage.style.position = 'fixed';
    editorPage.style.inset = '0';
    editorPage.style.zIndex = '3000';
    editorPage.style.background = 'var(--bg-primary)';
    editorPage.style.color = 'var(--text-primary)';
    editorPage.style.display = 'flex';
    editorPage.style.flexDirection = 'column';
    editorPage.style.overflow = 'hidden';

    editorPage.innerHTML = `
      <!-- Professional Editor Header Bar -->
      <header style="height: 4.25rem; flex-shrink: 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); padding: 0 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button id="editor-back-btn" style="padding: 0.45rem 0.9rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-primary); font-weight: 700; font-size: 0.825rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            ← Kembali ke Dasbor CMS
          </button>
          <div style="height: 1.5rem; width: 1px; background: var(--border-color);"></div>
          <div>
            <h2 style="font-size: 1.1rem; font-weight: 800;">${isEdit ? 'Sunting Naskah Berita' : 'Studio Penulisan Berita Pro'}</h2>
            <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">QUERYINDO Manuscript Engine — ${user?.fullName || 'Rijal Umami'}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button type="submit" form="editor-fullscreen-form" style="padding: 0.6rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.875rem; box-shadow: var(--shadow-glow); cursor: pointer;">
            ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Berita'}
          </button>
        </div>
      </header>

      <!-- Fullscreen Body Layout Grid -->
      <form id="editor-fullscreen-form" data-lenis-prevent style="flex: 1; height: calc(100vh - 4.25rem); display: grid; grid-template-columns: 1fr 1fr 360px; overflow: hidden;">
        <!-- Left Column: Title, Toolbar, & Visual WYSIWYG Canvas -->
        <div data-lenis-prevent style="height: 100%; padding: 2rem 2.5rem; overflow-y: auto !important; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <input type="text" id="edit-title" required value="${article ? article.title : ''}" placeholder="Masukkan Judul Berita Utama..." style="width: 100%; padding: 0.75rem 0; background: transparent; border: none; border-bottom: 2px solid var(--border-color); color: var(--text-primary); font-size: 1.6rem; font-weight: 800; font-family: var(--font-main);" />
          </div>

          <div>
            <input type="text" id="edit-subtitle" required value="${article ? article.subtitle : ''}" placeholder="Sub-judul / Ringkasan Pengantar Berita (1-2 kalimat)..." style="width: 100%; padding: 0.6rem 0; background: transparent; border: none; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 1.05rem;" />
          </div>

          <!-- Professional Editorial Formatting Toolbar -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.5rem 0.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);">
            <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
              <button type="button" class="btn-tb" data-cmd="bold" title="Tebal (Bold) <b>"><b>B</b></button>
              <button type="button" class="btn-tb" data-cmd="italic" title="Miring (Italic) <i>"><i>I</i></button>
              <button type="button" class="btn-tb" data-cmd="underline" title="Garis Bawah <u>"><u>U</u></button>
              <div style="width: 1px; height: 1.2rem; background: var(--border-color); margin: 0 0.2rem;"></div>
              
              <button type="button" class="btn-tb-tag" data-tag="h2" title="Sub-Judul Utama (H2)">H2</button>
              <button type="button" class="btn-tb-tag" data-tag="h3" title="Sub-Judul (H3)">H3</button>
              <button type="button" class="btn-tb-tag" data-tag="lead" title="Paragraf Lead">Lead</button>
              <button type="button" class="btn-tb-tag" data-tag="blockquote" title="Blok Kutipan (Quote)">Kutipan</button>
              <div style="width: 1px; height: 1.2rem; background: var(--border-color); margin: 0 0.2rem;"></div>

              <button type="button" class="btn-tb" data-cmd="insertUnorderedList" title="Daftar Bullet (List)">List</button>
              <button type="button" class="btn-tb" data-cmd="insertOrderedList" title="Daftar Angka">123</button>
              <button type="button" class="btn-tb" id="btn-tb-link" title="Sisipkan Tautan (Link)">Link</button>
              <button type="button" class="btn-tb" id="btn-tb-img" title="Sisipkan Gambar Berita (URL Link)" style="display:inline-flex; align-items:center; gap:0.3rem; color:var(--accent-cyan); font-weight:700;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Gambar (URL)</span>
              </button>
            </div>

            <!-- View Switcher Toggle -->
            <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-tertiary); padding: 0.15rem 0.3rem; border-radius: var(--radius-full); border: 1px solid var(--border-color);">
              <button type="button" id="btn-mode-visual" class="btn-mode-toggle active" style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; color: #000; background: var(--accent-cyan); border: none; cursor: pointer;">Visual</button>
              <button type="button" id="btn-mode-code" class="btn-mode-toggle" style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; color: var(--text-muted); background: transparent; border: none; cursor: pointer;">HTML</button>
            </div>
          </div>

          <!-- Manuscript Canvas Container -->
          <div style="display: flex; flex-direction: column; position: relative; margin-bottom: 2rem;">
            <div id="wysiwyg-editor-canvas" contenteditable="true" style="min-height: 480px; height: auto; box-sizing: border-box; padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-main); font-size: 1.05rem; line-height: 1.75; outline: none; margin-bottom: 1.5rem;">
              ${initialContent}
            </div>

            <textarea id="edit-content" name="content" style="display: none; min-height: 480px; height: auto; box-sizing: border-box; padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.5; resize: vertical; margin-bottom: 1.5rem;">${initialContent}</textarea>
          </div>

          <!-- Real-Time Word & Reading Time Analytics Bar (Docked Bottom Footer) -->
          <div style="position: sticky; bottom: -2rem; z-index: 50; margin: 0 -2.5rem -2rem -2.5rem; background: var(--bg-secondary); padding: 0.75rem 2.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); box-shadow: 0 -4px 16px rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
            <div style="display: flex; gap: 1.25rem; font-family: var(--font-mono);">
              <span><strong id="cnt-words" style="color: var(--accent-cyan);">0</strong> Kata</span>
              <span><strong id="cnt-chars" style="color: var(--accent-violet);">0</strong> Karakter</span>
              <span>Estimasi Waktu Baca: <strong id="cnt-readtime" style="color: var(--accent-emerald);">1m</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--accent-emerald);">
              <span>Auto-saved</span>
            </div>
          </div>
        </div>

        <!-- Middle Column: Live Reader Preview Column -->
        <div data-lenis-prevent style="height: 100%; padding: 2rem 2.5rem; overflow-y: auto !important; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; background: var(--bg-tertiary); display: flex; flex-direction: column; gap: 1.5rem; border-right: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono); display: flex; align-items: center; gap: 0.4rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Pratinjau Langsung Pembaca (Live Preview)</span>
          </div>

          <div class="reader-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div class="badge-group" style="margin-bottom: 0.75rem;">
              <span class="tag-badge" id="preview-category-badge" style="text-transform: uppercase;">${article ? article.category.toUpperCase() : 'TEKNO'}</span>
            </div>
            <h1 class="reader-title" id="preview-title" style="font-size: 1.5rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.75rem; color: var(--text-primary);">${article ? article.title : '[Judul Berita]'}</h1>
            <p class="reader-subtitle" id="preview-subtitle" style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.45;">${article ? article.subtitle : '[Sub-judul berita]'}</p>
          </div>

          <div class="article-rich-content size-large" id="preview-content-body" style="font-size: 0.95rem; line-height: 1.65; color: var(--text-primary);">
            ${initialContent}
          </div>
        </div>

        <!-- Right Sidebar Area: Metadata, Monetization & Transparency Attributes -->
        <div data-lenis-prevent style="height: 100%; background: var(--bg-secondary); padding: 2rem 1.5rem; overflow-y: auto !important; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">Atribut & Kemitraan</h3>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kategori Berita</label>
            <select id="edit-category" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem; font-weight: 600;">
              ${CATEGORIES.filter(c => c.id !== 'all').map(c => `
                <option value="${c.id}" ${article && article.category === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>



          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tags Berita (Pisahkan Koma)</label>
            <input type="text" id="edit-tags" value="${article ? article.tags.join(', ') : 'Teknologi, Indonesia, AI'}" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">URL Sampul Berita (HD Image)</label>
              <label for="edit-image-file-input" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat</span>
              </label>
              <input type="file" id="edit-image-file-input" accept="image/*" style="display: none;" />
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="edit-image-preview" src="${article ? ImageUtils.normalizeImageUrl(article.imageUrl) : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}" style="width: 72px; height: 48px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--border-color); flex-shrink: 0; background: var(--bg-tertiary);" />
              <input type="text" id="edit-image-url" required value="${article ? article.imageUrl : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}" placeholder="Tempel URL gambar atau link Google Drive..." style="flex: 1; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div id="edit-image-help" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.4;">
              💡 <em>Mendukung upload dari laptop/HP, Unsplash, atau Google Drive. (Jika pakai Google Drive, pastikan file diset ke <strong>"Siapa saja yang memiliki link / Anyone with link"</strong>).</em>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Penulis / Jurnalis</label>
            <select id="edit-author-select" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 600;">
              ${authorsList.map(a => `
                <option value="${a.name}" ${currentAuthorName.toLowerCase() === a.name.toLowerCase() ? 'selected' : ''}>
                  ${a.name} (${a.role})
                </option>
              `).join('')}
              <option value="__custom__" ${!isKnownAuthor ? 'selected' : ''}>+ Tulis Nama Jurnalis Manual...</option>
            </select>
            <input type="text" id="edit-author-custom" value="${!isKnownAuthor ? currentAuthorName : ''}" placeholder="Tuliskan nama jurnalis manual..." style="display: ${!isKnownAuthor ? 'block' : 'none'}; width: 100%; margin-top: 0.5rem; padding: 0.55rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.85rem;" />
          </div>


        </div>
      </form>
    `;

    document.body.appendChild(editorPage);
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('modal-opened'));

    // Elements
    const wysiwygCanvas = editorPage.querySelector('#wysiwyg-editor-canvas') as HTMLDivElement;
    const rawTextarea = editorPage.querySelector('#edit-content') as HTMLTextAreaElement;
    const cntWords = editorPage.querySelector('#cnt-words') as HTMLElement;
    const cntChars = editorPage.querySelector('#cnt-chars') as HTMLElement;
    const cntReadtime = editorPage.querySelector('#cnt-readtime') as HTMLElement;

    // Live Preview Elements
    const previewTitle = editorPage.querySelector('#preview-title') as HTMLElement;
    const previewSubtitle = editorPage.querySelector('#preview-subtitle') as HTMLElement;
    const previewCategory = editorPage.querySelector('#preview-category-badge') as HTMLElement;
    const previewBody = editorPage.querySelector('#preview-content-body') as HTMLElement;

    const editTitle = editorPage.querySelector('#edit-title') as HTMLInputElement;
    const editSubtitle = editorPage.querySelector('#edit-subtitle') as HTMLInputElement;
    const editCategory = editorPage.querySelector('#edit-category') as HTMLSelectElement;

    const authorSelect = editorPage.querySelector('#edit-author-select') as HTMLSelectElement;
    const authorCustomInput = editorPage.querySelector('#edit-author-custom') as HTMLInputElement;

    if (authorSelect && authorCustomInput) {
      authorSelect.addEventListener('change', () => {
        authorCustomInput.style.display = authorSelect.value === '__custom__' ? 'block' : 'none';
        if (authorSelect.value === '__custom__') {
          authorCustomInput.focus();
        }
      });
    }

    // Article Image URL and File Upload Handlers
    const editImageInput = editorPage.querySelector('#edit-image-url') as HTMLInputElement;
    const editImagePreview = editorPage.querySelector('#edit-image-preview') as HTMLImageElement;
    const editImageFileInput = editorPage.querySelector('#edit-image-file-input') as HTMLInputElement;

    const updateImagePreview = (rawUrl: string) => {
      const normalized = ImageUtils.normalizeImageUrl(rawUrl);
      if (normalized !== rawUrl && editImageInput) {
        editImageInput.value = normalized;
      }
      if (editImagePreview) {
        editImagePreview.src = normalized;
      }
    };

    if (editImageInput && editImagePreview) {
      editImageInput.addEventListener('input', () => updateImagePreview(editImageInput.value));
      editImageInput.addEventListener('change', () => updateImagePreview(editImageInput.value));
      editImageInput.addEventListener('paste', () => setTimeout(() => updateImagePreview(editImageInput.value), 40));

      editImagePreview.onerror = () => {
        const cur = editImagePreview.src;
        if (cur.includes('lh3.googleusercontent.com/d/')) {
          const id = cur.split('/d/')[1];
          if (id) {
            editImagePreview.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
            return;
          }
        }
        editImagePreview.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
      };
    }

    if (editImageFileInput) {
      editImageFileInput.addEventListener('change', () => {
        const file = editImageFileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 1200, 0.85, (dataUrl) => {
            if (editImageInput) editImageInput.value = dataUrl;
            if (editImagePreview) editImagePreview.src = dataUrl;
            Toast.show('Gambar sampul berhasil diunggah dari perangkat!');
          }, (err) => {
            Toast.show(err, 'warning');
          });
        }
      });
    }



    // Live preview sync function
    const syncLivePreview = () => {
      if (previewTitle && editTitle) {
        previewTitle.textContent = editTitle.value.trim() || '[Judul Berita]';
      }
      if (previewSubtitle && editSubtitle) {
        previewSubtitle.textContent = editSubtitle.value.trim() || '[Sub-judul berita]';
      }
      if (previewCategory && editCategory) {
        previewCategory.textContent = editCategory.value.toUpperCase();
      }
      if (previewBody) {
        previewBody.innerHTML = wysiwygCanvas.style.display !== 'none'
          ? this.getCleanArticleHtml(wysiwygCanvas)
          : rawTextarea.value;
      }
    };

    // Unified sync function for content, analytics, and live preview
    const syncAll = () => {
      rawTextarea.value = this.getCleanArticleHtml(wysiwygCanvas);
      updateAnalytics();
    };

    // Analytics Counter Updater
    const updateAnalytics = () => {
      const text = wysiwygCanvas.innerText || wysiwygCanvas.textContent || '';
      const charCount = text.length;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 180));

      if (cntWords) cntWords.textContent = wordCount.toLocaleString('id-ID');
      if (cntChars) cntChars.textContent = charCount.toLocaleString('id-ID');
      if (cntReadtime) cntReadtime.textContent = `${readTime}m`;

      syncLivePreview();
    };

    // Initial hydration of existing figures in canvas
    this.hydrateCanvasFigures(wysiwygCanvas, syncAll);
    updateAnalytics();

    // Listeners for Live Metadata Changes
    editTitle?.addEventListener('input', syncLivePreview);
    editSubtitle?.addEventListener('input', syncLivePreview);
    editCategory?.addEventListener('change', syncLivePreview);

    // Sync Content WYSIWYG <-> Textarea
    wysiwygCanvas.addEventListener('input', () => {
      syncAll();
    });

    // Click outside figures deselects all selected figures smoothly
    wysiwygCanvas.addEventListener('click', (e) => {
      const targetFig = (e.target as HTMLElement).closest('.article-inline-image');
      if (!targetFig) {
        wysiwygCanvas.querySelectorAll('.article-inline-image.is-selected').forEach(f => {
          f.classList.remove('is-selected');
          f.setAttribute('draggable', 'false');
        });
      }
    });

    // Native Backspace or Delete removes currently selected figure
    wysiwygCanvas.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const selectedFig = wysiwygCanvas.querySelector('.article-inline-image.is-selected') as HTMLElement | null;
        if (selectedFig) {
          const activeEl = document.activeElement;
          if (activeEl && selectedFig.querySelector('figcaption')?.contains(activeEl)) {
            return;
          }
          e.preventDefault();
          const nextSibling = selectedFig.nextElementSibling as HTMLElement | null || selectedFig.previousElementSibling as HTMLElement | null;
          selectedFig.remove();
          syncAll();
          if (nextSibling) {
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(nextSibling);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
            nextSibling.focus();
          }
          Toast.show('Gambar berhasil dihapus dari naskah.');
        }
      }
    });

    rawTextarea.addEventListener('input', () => {
      wysiwygCanvas.innerHTML = rawTextarea.value;
      this.hydrateCanvasFigures(wysiwygCanvas, syncAll);
      updateAnalytics();
    });

    // Formatting Toolbar Event Listeners
    editorPage.querySelectorAll('.btn-tb[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          document.execCommand(cmd, false);
          wysiwygCanvas.focus();
          syncAll();
        }
      });
    });

    editorPage.querySelectorAll('.btn-tb-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (tag === 'h2' || tag === 'h3') {
          document.execCommand('formatBlock', false, `<${tag}>`);
        } else if (tag === 'blockquote') {
          document.execCommand('formatBlock', false, '<blockquote>');
        } else if (tag === 'lead') {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const p = document.createElement('p');
            p.className = 'article-lead';
            p.textContent = range.toString() || 'Paragraf lead pembuka berita utama';
            range.deleteContents();
            range.insertNode(p);
          }
        }
        wysiwygCanvas.focus();
        syncAll();
      });
    });

    // Insert Link
    editorPage.querySelector('#btn-tb-link')?.addEventListener('click', () => {
      const url = prompt('Masukkan URL tautan:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        wysiwygCanvas.focus();
        syncAll();
      }
    });

    // Insert Editorial In-Content Image via URL Modal
    editorPage.querySelector('#btn-tb-img')?.addEventListener('click', () => {
      // Find the active top-level block inside wysiwygCanvas before opening modal
      let targetBlock: HTMLElement | null = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        let node: Node | null = r.startContainer;
        while (node && node !== wysiwygCanvas) {
          if (node.parentElement === wysiwygCanvas && node instanceof HTMLElement) {
            targetBlock = node;
            break;
          }
          node = node.parentElement;
        }
      }

      this.openInlineImageModal(editorPage, null, (figureHtml) => {
        wysiwygCanvas.focus();
        this.insertInlineImage(figureHtml, wysiwygCanvas, targetBlock, syncAll);
      });
    });

    // Drag-over and drop support for figure dragging between paragraphs
    wysiwygCanvas.addEventListener('dragover', (e) => {
      const dragged = (wysiwygCanvas as any)._draggedFigure as HTMLElement | null;
      if (!dragged) return;
      e.preventDefault();
      const target = (e.target as HTMLElement).closest('#wysiwyg-editor-canvas > p, #wysiwyg-editor-canvas > h2, #wysiwyg-editor-canvas > h3, #wysiwyg-editor-canvas > blockquote, #wysiwyg-editor-canvas > figure') as HTMLElement | null;
      if (target && target !== dragged) {
        const rect = target.getBoundingClientRect();
        if (e.clientY > rect.top + rect.height / 2) {
          target.after(dragged);
        } else {
          target.before(dragged);
        }
      }
    });

    wysiwygCanvas.addEventListener('drop', (e) => {
      const dragged = (wysiwygCanvas as any)._draggedFigure as HTMLElement | null;
      if (!dragged) return;
      e.preventDefault();
      dragged.classList.remove('is-dragging');
      delete (wysiwygCanvas as any)._draggedFigure;
      syncAll();
      Toast.show('Posisi gambar berhasil dipindahkan.');
    });

    // Toggle Visual vs HTML Mode
    const btnVisual = editorPage.querySelector('#btn-mode-visual') as HTMLButtonElement;
    const btnCode = editorPage.querySelector('#btn-mode-code') as HTMLButtonElement;

    btnVisual?.addEventListener('click', () => {
      btnVisual.classList.add('active');
      btnVisual.style.background = 'var(--accent-cyan)';
      btnVisual.style.color = '#000';

      btnCode.classList.remove('active');
      btnCode.style.background = 'transparent';
      btnCode.style.color = 'var(--text-muted)';

      wysiwygCanvas.style.display = 'block';
      rawTextarea.style.display = 'none';
      wysiwygCanvas.innerHTML = rawTextarea.value;
      this.hydrateCanvasFigures(wysiwygCanvas, syncAll);
      updateAnalytics();
    });

    btnCode?.addEventListener('click', () => {
      btnCode.classList.add('active');
      btnCode.style.background = 'var(--accent-cyan)';
      btnCode.style.color = '#000';

      btnVisual.classList.remove('active');
      btnVisual.style.background = 'transparent';
      btnVisual.style.color = 'var(--text-muted)';

      rawTextarea.style.display = 'block';
      wysiwygCanvas.style.display = 'none';
      rawTextarea.value = this.getCleanArticleHtml(wysiwygCanvas);
    });

    // Close & Return
    const closeEditor = () => {
      editorPage.remove();
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('modal-closed'));
    };

    editorPage.querySelector('#editor-back-btn')?.addEventListener('click', closeEditor);

    // Submit Fullscreen Form Handler
    const form = editorPage.querySelector('#editor-fullscreen-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (editorPage.querySelector('#edit-title') as HTMLInputElement).value;
      const subtitle = (editorPage.querySelector('#edit-subtitle') as HTMLInputElement).value;
      const category = (editorPage.querySelector('#edit-category') as HTMLSelectElement).value as CategoryId;
      const tagsStr = (editorPage.querySelector('#edit-tags') as HTMLInputElement).value;
      const rawImageUrl = (editorPage.querySelector('#edit-image-url') as HTMLInputElement).value.trim();
      const imageUrl = ImageUtils.normalizeImageUrl(rawImageUrl);
      
      let authorName = authorSelect?.value === '__custom__' ? authorCustomInput?.value.trim() : authorSelect?.value;
      if (!authorName) authorName = user?.fullName || 'Rijal Umami';

      const matchedAuthor = AuthorService.getAuthorByName(authorName);
      const authorAvatar = matchedAuthor?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
      const authorRole = matchedAuthor?.role || 'Jurnalis Redaksi';

      const content = this.getCleanArticleHtml(wysiwygCanvas);
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      if (isEdit && article) {
        await ArticleService.updateArticle(article.id, {
          title,
          subtitle,
          category,
          tags,
          imageUrl,
          author: {
            name: authorName,
            role: authorRole,
            avatar: authorAvatar
          },
          aiSummary: article.aiSummary || [],
          content,
          isFactChecked: false,
          isPremium: false,
          isSponsored: false
        });
        Toast.show('Perubahan naskah berita berhasil disimpan.');
      } else {
        const newArt: Article = {
          id: `art-${Date.now().toString().slice(-4)}`,
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          subtitle,
          category,
          tags,
          author: {
            name: authorName,
            role: authorRole,
            avatar: authorAvatar
          },
          publishedAt: new Date().toISOString(),
          readTimeMinutes: Math.max(3, Math.ceil(content.length / 500)),
          imageUrl,
          isFeatured: false,
          isTrending: false,
          isBreaking: false,
          isFactChecked: false,
          isPremium: false,
          isSponsored: false,
          viewsCount: 0,
          likesCount: 0,
          aiSummary: [],
          content
        };
        await ArticleService.createArticle(newArt);
        Toast.show('Berita baru berhasil diterbitkan di QUERYINDO!');
      }

      this.articles = ArticleService.getArticles();
      this.onArticlesChange();
      this.refreshTable(parentModal);
      closeEditor();
    });
  }

  // ==========================================================================
  // Inline Article Image Engine (Microsoft Word Concept: Handles & Layout Options)
  // ==========================================================================

  private openInlineImageModal(
    _parentContainer: HTMLElement,
    existingData: { url: string; align: string; caption: string; source: string } | null,
    onConfirm: (figureHtml: string) => void
  ) {
    const isEdit = existingData !== null;
    let selectedAlign = existingData?.align || 'center';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'inline-img-modal-overlay';
    modalOverlay.style.cssText = `
      position: fixed; inset: 0; z-index: 6000;
      background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; padding: 1.25rem;
    `;

    modalOverlay.innerHTML = `
      <div class="inline-img-modal-card" style="max-width: 520px;">
        <!-- Header -->
        <div style="padding: 1.1rem 1.4rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>${isEdit ? 'Ubah Informasi Gambar Naskah' : 'Sisipkan Gambar (URL / Tautan)'}</span>
            </h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Sederhana seperti Microsoft Word: masukkan tautan, atur tata letak & keterangan.</p>
          </div>
          <button type="button" id="modal-inline-close-btn" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-secondary); width: 28px; height: 28px; border-radius: 50%; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- Body -->
        <div style="padding: 1.25rem 1.4rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; max-height: calc(85vh - 120px);">
          <!-- URL Input -->
          <div>
            <label style="display: block; font-size: 0.76rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.35rem;">
              URL / Link Tautan Gambar
            </label>
            <input type="url" id="modal-inline-url" required value="${existingData ? escapeHtml(existingData.url) : ''}" placeholder="https://images.unsplash.com/... atau tautan Google Drive / CDN" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; outline: none; font-family: var(--font-mono);" />
            <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">Tautan Google Drive (Share link) akan otomatis dinormalisasi.</span>
          </div>

          <!-- Live Image Preview Box -->
          <div id="modal-inline-preview-container" style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; padding: 0.75rem; display: flex; flex-direction: column; align-items: center;">
            <div id="modal-inline-preview-frame" style="width: 100%; max-height: 200px; border-radius: var(--radius-sm); overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
              <img id="modal-inline-preview-img" src="${existingData?.url || ''}" alt="Pratinjau Gambar" style="display: ${existingData?.url ? 'block' : 'none'}; max-width: 100%; max-height: 200px; object-fit: contain;" />
              <div id="modal-inline-preview-placeholder" style="display: ${existingData?.url ? 'none' : 'flex'}; padding: 1.8rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.78rem; flex-direction: column; align-items: center; gap: 0.4rem;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Masukkan URL gambar untuk melihat pratinjau</span>
              </div>
            </div>
            <div id="modal-inline-preview-caption-text" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center; font-style: italic;">
              ${existingData?.caption ? escapeHtml(existingData.caption) : 'Keterangan gambar akan muncul di sini'}
            </div>
          </div>

          <!-- Placement (Wrap Text ala Word) -->
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
              Tata Letak Teks (Layout / Wrap Text)
            </label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
              <button type="button" class="inline-img-option-pill opt-align ${selectedAlign === 'left' ? 'active' : ''}" data-val="left">
                ⇦ Wrap Kiri
              </button>
              <button type="button" class="inline-img-option-pill opt-align ${selectedAlign === 'center' ? 'active' : ''}" data-val="center">
                ▣ In Line (Tengah)
              </button>
              <button type="button" class="inline-img-option-pill opt-align ${selectedAlign === 'right' ? 'active' : ''}" data-val="right">
                Wrap Kanan ⇨
              </button>
            </div>
          </div>

          <!-- Caption & Photo Source Credit -->
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.3rem;">
                Keterangan Foto (Caption)
              </label>
              <input type="text" id="modal-inline-caption" value="${existingData ? escapeHtml(existingData.caption) : ''}" placeholder="Penjelasan konteks foto..." style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.3rem;">
                Sumber Foto / Kredit
              </label>
              <input type="text" id="modal-inline-source" value="${existingData ? escapeHtml(existingData.source) : ''}" placeholder="Contoh: Reuters / ANTARA" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="padding: 1rem 1.4rem; background: var(--bg-secondary); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" id="modal-inline-cancel-btn" style="padding: 0.5rem 1.15rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-secondary); font-size: 0.825rem; font-weight: 600; cursor: pointer;">
            Batal
          </button>
          <button type="button" id="modal-inline-confirm-btn" style="padding: 0.5rem 1.4rem; background: var(--gradient-brand); color: #000; border-radius: var(--radius-full); font-size: 0.825rem; font-weight: 800; cursor: pointer; box-shadow: var(--shadow-glow);">
            ${isEdit ? 'Perbarui Gambar' : 'Sisipkan ke Naskah'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const urlInput = modalOverlay.querySelector('#modal-inline-url') as HTMLInputElement;
    const previewImg = modalOverlay.querySelector('#modal-inline-preview-img') as HTMLImageElement;
    const previewPlaceholder = modalOverlay.querySelector('#modal-inline-preview-placeholder') as HTMLElement;
    const previewCaption = modalOverlay.querySelector('#modal-inline-preview-caption-text') as HTMLElement;
    const captionInput = modalOverlay.querySelector('#modal-inline-caption') as HTMLInputElement;
    const sourceInput = modalOverlay.querySelector('#modal-inline-source') as HTMLInputElement;

    const updatePreview = () => {
      const rawUrl = urlInput.value.trim();
      const normUrl = ImageUtils.normalizeImageUrl(rawUrl);
      if (normUrl !== rawUrl) {
        urlInput.value = normUrl;
      }

      if (normUrl) {
        previewImg.src = normUrl;
        previewImg.style.display = 'block';
        previewPlaceholder.style.display = 'none';
      } else {
        previewImg.style.display = 'none';
        previewPlaceholder.style.display = 'flex';
      }

      const capText = captionInput.value.trim();
      const srcText = sourceInput.value.trim();
      if (capText || srcText) {
        previewCaption.innerHTML = `${escapeHtml(capText)} ${srcText ? `<strong style="color:var(--accent-cyan); font-style:normal;">(Foto: ${escapeHtml(srcText)})</strong>` : ''}`;
      } else {
        previewCaption.textContent = 'Keterangan gambar akan muncul di sini';
      }
    };

    updatePreview();

    urlInput.addEventListener('input', updatePreview);
    urlInput.addEventListener('paste', () => setTimeout(updatePreview, 40));
    captionInput.addEventListener('input', updatePreview);
    sourceInput.addEventListener('input', updatePreview);

    modalOverlay.querySelectorAll('.opt-align').forEach(btn => {
      btn.addEventListener('click', () => {
        modalOverlay.querySelectorAll('.opt-align').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAlign = btn.getAttribute('data-val') || 'center';
      });
    });

    const closeModal = () => modalOverlay.remove();
    modalOverlay.querySelector('#modal-inline-close-btn')?.addEventListener('click', closeModal);
    modalOverlay.querySelector('#modal-inline-cancel-btn')?.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    modalOverlay.querySelector('#modal-inline-confirm-btn')?.addEventListener('click', () => {
      const finalUrl = ImageUtils.normalizeImageUrl(urlInput.value.trim());
      if (!finalUrl) {
        Toast.show('Harap masukkan URL tautan gambar yang valid.', 'warning');
        urlInput.focus();
        return;
      }

      const finalCaption = captionInput.value.trim();
      const finalSource = sourceInput.value.trim();

      const figureHtml = `
        <figure class="article-inline-image align-${selectedAlign}" data-align="${selectedAlign}" contenteditable="false">
          <div class="inline-image-frame" contenteditable="false">
            <img src="${finalUrl}" alt="${escapeHtml(finalCaption || 'Ilustrasi Berita')}" loading="lazy" />
          </div>
          <figcaption contenteditable="true" placeholder="Tulis keterangan foto atau kredit sumber di sini...">
            ${finalCaption ? `<span class="inline-caption-text">${escapeHtml(finalCaption)}</span>` : ''}
            ${finalSource ? `<span class="inline-caption-source">(Foto: ${escapeHtml(finalSource)})</span>` : ''}
          </figcaption>
        </figure>
      `;

      closeModal();
      onConfirm(figureHtml);
    });
  }

  // ==========================================================================
  // In-Canvas Figure Engine (Word-Style Handles & Sibling Mechanics)
  // ==========================================================================

  // Clean HTML serializer: strips temporary editing handles and badges
  private getCleanArticleHtml(wysiwygCanvas: HTMLElement): string {
    const clone = wysiwygCanvas.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.figure-canvas-tools, .crop-resize-handle, .word-resize-handle, .word-layout-badge, .word-dim-badge').forEach(el => el.remove());
    clone.querySelectorAll('.article-inline-image').forEach(fig => {
      fig.removeAttribute('contenteditable');
      fig.removeAttribute('draggable');
      fig.classList.remove('is-selected', 'is-dragging');
      const frame = fig.querySelector('.inline-image-frame') as HTMLElement | null;
      if (frame) {
        frame.removeAttribute('contenteditable');
      }
      const figcaption = fig.querySelector('figcaption') as HTMLElement | null;
      if (figcaption) {
        figcaption.removeAttribute('contenteditable');
        figcaption.removeAttribute('placeholder');
        if (!figcaption.textContent?.trim()) {
          figcaption.remove();
        }
      }
    });
    return clone.innerHTML;
  }

  // Hydrate all figures inside wysiwyg editor canvas
  private hydrateCanvasFigures(wysiwygCanvas: HTMLElement, syncCallback: () => void) {
    const figures = wysiwygCanvas.querySelectorAll<HTMLElement>('.article-inline-image');
    figures.forEach(fig => {
      this.hydrateSingleFigure(fig, wysiwygCanvas, syncCallback);
    });
  }

  // Hydrate a single figure with Word-style 8-point handles & floating Layout Options badge
  private hydrateSingleFigure(figure: HTMLElement, wysiwygCanvas: HTMLElement, syncCallback: () => void) {
    figure.setAttribute('contenteditable', 'false');

    let frame = figure.querySelector('.inline-image-frame') as HTMLElement | null;
    let img = figure.querySelector('img') as HTMLImageElement | null;
    if (!frame && img) {
      frame = document.createElement('div');
      frame.className = 'inline-image-frame';
      img.before(frame);
      frame.appendChild(img);
    }
    if (frame) {
      frame.setAttribute('contenteditable', 'false');
    }

    let figcaption = figure.querySelector('figcaption') as HTMLElement | null;
    if (!figcaption) {
      figcaption = document.createElement('figcaption');
      figure.appendChild(figcaption);
    }
    figcaption.setAttribute('contenteditable', 'true');
    figcaption.setAttribute('placeholder', 'Tulis keterangan foto atau kredit sumber di sini...');

    // Live sync when editor types directly into caption
    figcaption.oninput = () => syncCallback();

    // Prevent figcaption clicks from bubbling to figure selection
    figcaption.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Clean up existing handles/badges to avoid duplicates
    figure.querySelectorAll('.figure-canvas-tools, .crop-resize-handle, .word-resize-handle, .word-layout-badge, .word-dim-badge').forEach(el => el.remove());

    // 1. Create 8 Microsoft Word-Style Resize Handles
    const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handlePositions.forEach(pos => {
      const h = document.createElement('div');
      h.className = `word-resize-handle handle-${pos}`;
      h.setAttribute('contenteditable', 'false');
      h.title = 'Tarik untuk mengubah ukuran gambar (seperti Microsoft Word)';
      figure.appendChild(h);

      // Mouse drag resizing
      h.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = figure.getBoundingClientRect().width;
        const startH = frame ? frame.getBoundingClientRect().height : figure.getBoundingClientRect().height;
        const canvasW = wysiwygCanvas.clientWidth - 32;

        document.body.style.userSelect = 'none';

        // Floating dimension tooltip
        let dimBadge = figure.querySelector('.word-dim-badge') as HTMLElement | null;
        if (!dimBadge) {
          dimBadge = document.createElement('div');
          dimBadge.className = 'word-dim-badge';
          dimBadge.setAttribute('contenteditable', 'false');
          figure.appendChild(dimBadge);
        }

        const updateDim = (w: number, h: number) => {
          if (dimBadge) {
            dimBadge.textContent = `${Math.round(w)} × ${Math.round(h)} px`;
          }
        };
        updateDim(startW, startH);

        const onMouseMove = (moveEvt: MouseEvent) => {
          const diffX = moveEvt.clientX - startX;
          const diffY = moveEvt.clientY - startY;

          let newW = startW;
          let newH = startH;

          // Width adjustment
          if (pos === 'e' || pos === 'se' || pos === 'ne') {
            newW = Math.max(140, Math.min(canvasW, startW + diffX));
            figure.style.width = `${Math.round(newW)}px`;
            figure.style.maxWidth = '100%';
          } else if (pos === 'w' || pos === 'sw' || pos === 'nw') {
            newW = Math.max(140, Math.min(canvasW, startW - diffX));
            figure.style.width = `${Math.round(newW)}px`;
            figure.style.maxWidth = '100%';
          }

          // Height adjustment (Crop)
          if (pos === 's' || pos === 'se' || pos === 'sw') {
            newH = Math.max(90, Math.min(900, startH + diffY));
            if (frame) {
              frame.style.height = `${Math.round(newH)}px`;
              frame.style.aspectRatio = 'auto';
            }
            if (img) img.style.objectFit = 'cover';
          } else if (pos === 'n' || pos === 'ne' || pos === 'nw') {
            newH = Math.max(90, Math.min(900, startH - diffY));
            if (frame) {
              frame.style.height = `${Math.round(newH)}px`;
              frame.style.aspectRatio = 'auto';
            }
            if (img) img.style.objectFit = 'cover';
          }

          updateDim(newW, newH);
        };

        const onMouseUp = () => {
          document.body.style.userSelect = '';
          dimBadge?.remove();
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          syncCallback();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });

    // 2. Create Floating Word-Style Layout Options Badge (Wrap Text)
    const align = figure.getAttribute('data-align') || (figure.classList.contains('align-left') ? 'left' : figure.classList.contains('align-right') ? 'right' : 'center');

    const badge = document.createElement('div');
    badge.className = 'word-layout-badge';
    badge.setAttribute('contenteditable', 'false');
    badge.innerHTML = `
      <button type="button" class="word-layout-btn opt-wrap ${align === 'left' ? 'active' : ''}" data-align="left" title="Wrap Kiri: Teks mengalir di kanan gambar">⇦ Wrap Kiri</button>
      <button type="button" class="word-layout-btn opt-wrap ${align === 'center' ? 'active' : ''}" data-align="center" title="Tengah / In Line: Sejajar naskah penuh">▣ Tengah</button>
      <button type="button" class="word-layout-btn opt-wrap ${align === 'right' ? 'active' : ''}" data-align="right" title="Wrap Kanan: Teks mengalir di kiri gambar">Wrap Kanan ⇨</button>
      <div class="word-layout-divider"></div>
      <button type="button" class="word-layout-btn opt-edit" title="Ubah link gambar atau keterangan">✎ Ubah</button>
      <button type="button" class="word-layout-btn opt-delete danger" title="Hapus gambar dari naskah">🗑 Hapus</button>
    `;
    figure.appendChild(badge);

    // Layout Option Buttons (Wrap Text)
    badge.querySelectorAll('.opt-wrap').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = (btn.getAttribute('data-align') || 'center') as 'left' | 'center' | 'right';
        figure.classList.remove('align-left', 'align-center', 'align-right');
        figure.classList.add(`align-${a}`);
        figure.setAttribute('data-align', a);
        badge.querySelectorAll('.opt-wrap').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syncCallback();
      });
    });

    // Edit in Modal
    badge.querySelector('.opt-edit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const captionText = figure.querySelector('.inline-caption-text')?.textContent || '';
      const captionSource = figure.querySelector('.inline-caption-source')?.textContent?.replace(/^\(Foto:\s*|\)$/g, '') || '';
      const existingData = {
        url: img?.src || '',
        align: figure.getAttribute('data-align') || 'center',
        caption: captionText,
        source: captionSource
      };

      this.openInlineImageModal(wysiwygCanvas.closest('#manuscript-editor-fullscreen') as HTMLElement || document.body, existingData, (updatedFigureHtml) => {
        const temp = document.createElement('div');
        temp.innerHTML = updatedFigureHtml;
        const newFig = temp.querySelector('.article-inline-image') as HTMLElement | null;
        if (newFig) {
          if (figure.style.width) newFig.style.width = figure.style.width;
          const newFrame = newFig.querySelector('.inline-image-frame') as HTMLElement | null;
          if (newFrame && frame && frame.style.height) {
            newFrame.style.height = frame.style.height;
          }
          figure.replaceWith(newFig);
          this.hydrateSingleFigure(newFig, wysiwygCanvas, syncCallback);
          syncCallback();
          Toast.show('Pengaturan gambar berhasil diperbarui.');
        }
      });
    });

    // Delete Button
    badge.querySelector('.opt-delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextSibling = figure.nextElementSibling as HTMLElement | null || figure.previousElementSibling as HTMLElement | null;
      figure.remove();
      syncCallback();
      if (nextSibling) {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(nextSibling);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
        nextSibling.focus();
      }
      Toast.show('Gambar berhasil dihapus dari naskah.');
    });

    // 3. Selection & Caret Safety
    figure.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('figcaption, .word-layout-badge')) return;
      e.stopPropagation();

      wysiwygCanvas.querySelectorAll('.article-inline-image.is-selected').forEach(f => {
        if (f !== figure) {
          f.classList.remove('is-selected');
          f.setAttribute('draggable', 'false');
        }
      });

      figure.classList.add('is-selected');
      figure.setAttribute('draggable', 'true');
    });

    // Drag-and-drop to move between paragraphs
    figure.addEventListener('dragstart', (e) => {
      if (!figure.classList.contains('is-selected')) {
        e.preventDefault();
        return;
      }
      figure.classList.add('is-dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'queryindo-figure');
      }
      (wysiwygCanvas as any)._draggedFigure = figure;
    });

    figure.addEventListener('dragend', () => {
      figure.classList.remove('is-dragging');
      delete (wysiwygCanvas as any)._draggedFigure;
      syncCallback();
    });
  }

  // Insert Inline Image Safely as a Top-Level Sibling Block
  private insertInlineImage(
    figureHtml: string,
    wysiwygCanvas: HTMLElement,
    targetBlock: HTMLElement | null,
    syncCallback: () => void
  ) {
    const temp = document.createElement('div');
    temp.innerHTML = figureHtml;
    const figure = temp.querySelector('.article-inline-image') as HTMLElement | null;
    if (!figure) return;

    figure.setAttribute('contenteditable', 'false');

    // Insert as a clean top-level sibling
    if (targetBlock && wysiwygCanvas.contains(targetBlock)) {
      const isBlockEmpty = !targetBlock.textContent?.trim() && (!targetBlock.querySelector('img') || targetBlock.innerHTML === '<br>');
      if (isBlockEmpty && targetBlock.tagName.toLowerCase() === 'p') {
        targetBlock.replaceWith(figure);
      } else {
        targetBlock.after(figure);
      }
    } else {
      wysiwygCanvas.appendChild(figure);
    }

    // Ensure there is always an editable sibling paragraph after the figure
    let nextBlock = figure.nextElementSibling as HTMLElement | null;
    if (!nextBlock || nextBlock.tagName.toLowerCase() === 'figure') {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      figure.after(p);
      nextBlock = p;
    }

    // Hydrate controls onto the new figure
    this.hydrateSingleFigure(figure, wysiwygCanvas, syncCallback);

    // Place caret cleanly in the trailing paragraph
    if (nextBlock) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(nextBlock);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      nextBlock.focus();
    }

    syncCallback();
    Toast.show('Gambar berhasil disisipkan ke naskah!');
  }
}
