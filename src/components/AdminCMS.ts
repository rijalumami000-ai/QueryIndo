import type { Article } from '../types/news';
import { AuthService, ReaderAuthService } from '../services/authService';
import { AuthorService } from '../services/authorService';
import { ArticleService } from '../services/articleService';
import { Toast } from '../utils/toast';
import { ImageUtils } from '../utils/imageUtils';

import { ArticleEditor } from './admin/ArticleEditor';
import { AuthorsManager } from './admin/AuthorsManager';
import { AdsManager } from './admin/AdsManager';
import { ShoppingManager } from './admin/ShoppingManager';
import { PollsManager } from './admin/PollsManager';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { SubscribersManager } from './admin/SubscribersManager';
import { SocialManager } from './admin/SocialManager';
import { SettingsManager } from './admin/SettingsManager';

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

  // Format numeric statistics
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
                <button class="nav-sidebar-link ${this.activeTab === 'polls' ? 'active' : ''}" data-tab="polls">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                  <span>Jajak Pendapat</span>
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
            
            ${this.activeTab === 'analytics' ? AnalyticsTab.render() :
              this.activeTab === 'authors' ? AuthorsManager.render(this.articles) :
              this.activeTab === 'ads' ? AdsManager.render(this.adPlacementFilter) :
              this.activeTab === 'shopping' ? ShoppingManager.render() :
              this.activeTab === 'polls' ? PollsManager.render() :
              this.activeTab === 'subscribers' ? SubscribersManager.render() :
              this.activeTab === 'social' ? SocialManager.render() :
              this.activeTab === 'settings' ? SettingsManager.render() :
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
        ArticleEditor.open(null, modalElem, () => {
          this.articles = ArticleService.getArticles();
          this.onArticlesChange();
          this.refreshTable(modalElem);
        });
      });
    }

    // Bind Specific Tab Action Events
    if (this.activeTab === 'authors') {
      AuthorsManager.bindEvents(modalElem, this.articles, () => this.refreshDashboard(modalElem));
    } else if (this.activeTab === 'ads') {
      AdsManager.bindEvents(
        modalElem,
        (newFilter: string) => {
          this.adPlacementFilter = newFilter;
          this.refreshDashboard(modalElem);
        },
        () => this.refreshDashboard(modalElem)
      );
    } else if (this.activeTab === 'shopping') {
      ShoppingManager.bindEvents(modalElem, () => this.refreshDashboard(modalElem));
    } else if (this.activeTab === 'polls') {
      PollsManager.bindEvents(modalElem, () => this.refreshDashboard(modalElem));
    } else if (this.activeTab === 'subscribers') {
      SubscribersManager.bindEvents(modalElem, this.articles, () => this.refreshDashboard(modalElem));
    } else if (this.activeTab === 'social') {
      SocialManager.bindEvents(modalElem, () => this.refreshDashboard(modalElem));
    } else if (this.activeTab === 'settings') {
      SettingsManager.bindEvents(
        modalElem,
        () => {
          this.activeTab = 'social';
          this.refreshDashboard(modalElem);
        },
        () => this.refreshDashboard(modalElem)
      );
    } else if (this.activeTab === 'articles') {
      this.bindTableActionEvents(modalElem);
    }
  }

  // Bind Table Actions
  private bindTableActionEvents(modalElem: HTMLElement) {
    modalElem.querySelectorAll('.btn-edit-article').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const art = this.articles.find(a => a.id === id);
        if (art) {
          ArticleEditor.open(art, modalElem, () => {
            this.articles = ArticleService.getArticles();
            this.onArticlesChange();
            this.refreshTable(modalElem);
          });
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

  private refreshDashboard(modalElem: HTMLElement) {
    modalElem.innerHTML = this.renderAdminModalHTML();
    this.bindAdminEvents(modalElem);
  }
}
