import type { Article, CategoryId, AuthorProfile } from '../types/news';
import { ARTICLES, CATEGORIES } from '../data/mockNews';
import { AuthService } from '../services/authService';
import { AuthorService } from '../services/authorService';
import { Toast } from '../utils/toast';
import { AdBanner, type AdCampaign } from './AdBanner';
import { ReaderPoll, type PollData } from './ReaderPoll';

export class AdminCMS {
  private articles: Article[];
  private onArticlesChange: () => void;
  private searchKeyword: string = '';
  private activeTab: 'articles' | 'analytics' | 'authors' | 'ads' | 'polls' | 'settings' = 'articles';

  constructor(onArticlesChange: () => void) {
    this.articles = ARTICLES;
    this.onArticlesChange = onArticlesChange;
  }

  public renderAdminModalHTML(): string {
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
              <p style="font-size: 0.85rem; color: var(--text-muted);">Masuk dengan akun editor/jurnalis terverifikasi</p>
            </div>

            <form id="cms-login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div id="login-error-alert" style="display: none; padding: 0.75rem; background: rgba(244, 63, 94, 0.15); border: 1px solid var(--accent-rose); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.8rem;">
                Email atau kata sandi tidak valid.
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Email Redaksi</label>
                <input type="email" id="login-email" required value="editor@queryindo.id" style="width: 100%; padding: 0.75rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-secondary);">Kata Sandi (Password)</label>
                <input type="password" id="login-password" required value="redaksi2026" style="width: 100%; padding: 0.75rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
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

  // Professional Fullscreen CMS Dashboard Workspace
  private renderFullscreenDashboardHTML(user: ReturnType<typeof AuthService.getCurrentUser>): string {
    const totalViews = this.articles.reduce((acc, a) => acc + a.viewsCount, 0);
    const totalLikes = this.articles.reduce((acc, a) => acc + a.likesCount, 0);
    const featuredCount = this.articles.filter(a => a.isFeatured).length;

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

            <!-- Navigation Links with Clean SVG Icons -->
            <nav style="display: flex; flex-direction: column; gap: 0.35rem;">
              <button class="nav-sidebar-link ${this.activeTab === 'articles' ? 'active' : ''}" data-tab="articles">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                <span>Manajer Publikasi</span>
              </button>
              <button class="nav-sidebar-link ${this.activeTab === 'authors' ? 'active' : ''}" data-tab="authors">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Dewan Redaksi</span>
              </button>
              <button class="nav-sidebar-link ${this.activeTab === 'ads' ? 'active' : ''}" data-tab="ads">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
                <span>Kemitraan & Iklan</span>
              </button>
              <button class="nav-sidebar-link ${this.activeTab === 'polls' ? 'active' : ''}" data-tab="polls">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                <span>Jajak Pendapat</span>
              </button>
              <button class="nav-sidebar-link ${this.activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span>Analitik Redaksi</span>
              </button>
              <button class="nav-sidebar-link ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                <span>Pengaturan Sistem</span>
              </button>
            </nav>
          </div>

          <!-- User Profile Card & Actions -->
          <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <img src="${user?.avatar}" alt="${user?.fullName}" style="width: 2.2rem; height: 2.2rem; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--accent-primary);" />
              <div style="overflow: hidden;">
                <div style="font-weight: 700; font-size: 0.85rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user?.fullName}</div>
                <div style="font-size: 0.7rem; color: var(--accent-cyan); font-family: var(--font-mono);">${user?.role}</div>
              </div>
            </div>

            <button id="btn-logout-cms" style="width: 100%; padding: 0.55rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </aside>

        <!-- Right Main Workspace Content Area -->
        <main style="flex: 1; min-width: 0; height: 100vh; display: flex; flex-direction: column; overflow: hidden;">
          
          <!-- Top Header Bar -->
          <header style="height: 4.25rem; flex-shrink: 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; flex: 1; max-width: 450px;">
              <input type="text" id="admin-search-input" value="${this.searchKeyword}" placeholder="Cari judul berita, kata kunci..." style="width: 100%; padding: 0.55rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; outline: none;" />
            </div>

            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="font-size: 0.75rem; color: var(--accent-emerald); background: rgba(16, 185, 129, 0.08); padding: 0.3rem 0.75rem; border-radius: var(--radius-full); border: 1px solid rgba(16, 185, 129, 0.25); font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-emerald); display: inline-block;"></span>
                <span>API Gateway Online</span>
              </span>
              
              <button id="btn-create-article" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; display: flex; align-items: center; gap: 0.45rem; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 1px 2px rgba(0,0,0,0.2); cursor: pointer;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                <span>Tulis Berita Baru</span>
              </button>

              <button class="btn-close" id="admin-modal-close-btn" title="Tutup & Kembali ke Portal Publik" aria-label="Close CMS" style="width: 2rem; height: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; cursor: pointer;">✕</button>
            </div>
          </header>

          <!-- Main Scrollable Dashboard Content -->
          <div class="cms-scroll-view" style="flex: 1; min-height: 0; height: calc(100vh - 4.25rem); padding: 2rem 2rem 4rem 2rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth;">
            
            ${this.activeTab === 'analytics' ? this.renderAnalyticsTabHTML() :
              this.activeTab === 'authors' ? this.renderAuthorsManagementHTML() :
              this.activeTab === 'ads' ? this.renderAdsManagementHTML() :
              this.activeTab === 'polls' ? this.renderPollsManagementHTML() :
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
                  <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.35rem;">${(totalViews / 1000).toFixed(1)}k</div>
                </div>
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Interaksi (Likes)</div>
                  <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.35rem;">${totalLikes.toLocaleString('id-ID')}</div>
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
                      <span style="color: var(--text-primary); font-family: var(--font-mono);">${author.joinedAt}</span>
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
                    <strong style="color: var(--text-primary);">${authorArticles.length} Berita <span style="color: var(--accent-cyan);">(${(totalAuthorViews / 1000).toFixed(1)}k Views)</span></strong>
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
    const campaigns = AdBanner.getCampaigns();

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">Kemitraan Iklan & Sponsor Brand</h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">Kelola inventori penempatan banner Leaderboard, In-Article, dan Mitra Strategis.</p>
          </div>
          <button id="btn-add-ad-campaign" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 0.45rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tambah Kampanye</span>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          ${campaigns.map(ad => `
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                  <span class="tag-badge" style="background: rgba(37, 99, 235, 0.08); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2);">${ad.placement.toUpperCase()}</span>
                  <span style="font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 4px; background: ${ad.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${ad.isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; border: 1px solid ${ad.isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};">
                    ${ad.isActive ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>

                <div style="display: flex; gap: 0.85rem; align-items: center; margin-bottom: 0.85rem;">
                  <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 52px; height: 52px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color);" />
                  <div>
                    <h3 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary);">${ad.sponsorName}</h3>
                    <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${ad.tagline}</p>
                  </div>
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
                <button class="btn-toggle-ad" data-ad-id="${ad.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                  ${ad.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button class="btn-delete-ad" data-ad-id="${ad.id}" style="padding: 0.45rem 0.75rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                  Hapus
                </button>
              </div>
            </div>
          `).join('')}
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

  // Settings Tab View
  private renderSettingsTabHTML(): string {
    return `
      <div style="max-width: 680px; display: flex; flex-direction: column; gap: 1.5rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary);">Konfigurasi Portal & Redaksi</h2>
        
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700;">Informasi Sistem Publikasi</h3>
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Portal Media</label>
            <input type="text" value="QUERYINDO Media" readonly style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Versi Engine</label>
            <input type="text" value="QueryManuscript Engine v2.4 (Go Fiber + PostgreSQL + TypeScript)" readonly style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-family: var(--font-mono);" />
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
          <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--text-secondary);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>${(art.viewsCount / 1000).toFixed(1)}k</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem; color: var(--accent-rose); margin-top: 0.2rem;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <span>${art.likesCount}</span>
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
    const logoutBtn = modalElem.querySelector('#btn-logout-cms');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout();
        modalElem.innerHTML = this.renderAdminModalHTML();
        this.bindAdminEvents(modalElem);
        Toast.show('Sesi redaksi telah berakhir.');
      });
    }

    const searchInput = modalElem.querySelector('#admin-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = (e.target as HTMLInputElement).value;
        const tbody = modalElem.querySelector('#cms-table-body');
        if (tbody) tbody.innerHTML = this.renderTableRowsHTML();
        this.bindTableActionEvents(modalElem);
      });
    }

    const createBtn = modalElem.querySelector('#btn-create-article');
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
    } else if (this.activeTab === 'polls') {
      this.bindPollsEvents(modalElem);
    } else if (this.activeTab === 'articles') {
      this.bindTableActionEvents(modalElem);
    }
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
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-author-id');
        const name = btn.getAttribute('data-author-name') || 'Jurnalis';
        if (!id) return;

        const relatedArticles = this.articles.filter(a => a.author.name.toLowerCase() === name.toLowerCase());
        const confirmMsg = relatedArticles.length > 0
          ? `Hapus jurnalis "${name}" dari dewan redaksi?\n\nPerhatian: Terdapat ${relatedArticles.length} artikel yang ditulis oleh jurnalis ini.`
          : `Yakin ingin menghapus jurnalis "${name}" dari dewan redaksi?`;

        if (confirm(confirmMsg)) {
          const success = AuthorService.deleteAuthor(id);
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

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Jabatan / Posisi Redaksi *</label>
              <input type="text" id="form-author-role" required value="${author?.role || ''}" placeholder="e.g. Editor Senior AI & Cloud" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Email Resmi Redaksi *</label>
              <input type="email" id="form-author-email" required value="${author?.email || ''}" placeholder="e.g. raditya@queryindo.id" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">URL Foto Profil Avatar (HD Image)</label>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-author-avatar-preview" src="${author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-cyan); flex-shrink: 0;" />
              <input type="url" id="form-author-avatar" required value="${author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
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
    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('input', () => {
        if (avatarInput.value) avatarPreview.src = avatarInput.value;
      });
    }

    const form = overlay.querySelector('#author-crud-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (overlay.querySelector('#form-author-name') as HTMLInputElement).value.trim();
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
          AuthorService.updateAuthor(author.id, {
            name,
            role,
            email,
            avatar: avatar || author.avatar,
            bio,
            socialTwitter: socialTwitter || undefined,
            socialLinkedin: socialLinkedin || undefined
          });
          Toast.show(`Profil jurnalis "${name}" berhasil diperbarui!`);
        } else {
          AuthorService.addAuthor({
            name,
            role,
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
      });
    }
  }

  // Bind Ads Management Events
  private bindAdsEvents(modalElem: HTMLElement) {
    // Add New Campaign
    modalElem.querySelector('#btn-add-ad-campaign')?.addEventListener('click', () => {
      const sponsor = prompt('Masukkan Nama Sponsor Baru (e.g. Google Cloud):');
      if (!sponsor) return;
      const tagline = prompt('Masukkan Tagline Iklan:', 'Solusi teknologi terdepan untuk transformasi digital Indonesia.');
      const targetUrl = prompt('Masukkan URL Link Tujuan:', 'https://google.com');

      const campaigns = AdBanner.getCampaigns();
      const newAd: AdCampaign = {
        id: `ad-${Date.now().toString().slice(-4)}`,
        sponsorName: sponsor,
        tagline: tagline || sponsor,
        placement: 'leaderboard',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        targetUrl: targetUrl || '#',
        ctaText: 'Kunjungi Situs Mitra →',
        isActive: true,
        impressions: 0,
        clicks: 0
      };

      campaigns.unshift(newAd);
      AdBanner.saveCampaigns(campaigns);
      Toast.show(`Kampanye iklan ${sponsor} berhasil ditambahkan!`);
      modalElem.innerHTML = this.renderAdminModalHTML();
      this.bindAdminEvents(modalElem);
      this.onArticlesChange();
    });

    // Toggle Active Status
    modalElem.querySelectorAll('.btn-toggle-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        const campaigns = AdBanner.getCampaigns();
        const ad = campaigns.find(a => a.id === id);
        if (ad) {
          ad.isActive = !ad.isActive;
          AdBanner.saveCampaigns(campaigns);
          Toast.show(`Status iklan ${ad.sponsorName} diubah ke ${ad.isActive ? 'Aktif' : 'Nonaktif'}.`);
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
          this.onArticlesChange();
        }
      });
    });

    // Delete Ad Campaign
    modalElem.querySelectorAll('.btn-delete-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (confirm('Yakin ingin menghapus kampanye iklan sponsor ini?')) {
          const campaigns = AdBanner.getCampaigns().filter(a => a.id !== id);
          AdBanner.saveCampaigns(campaigns);
          Toast.show('Kampanye iklan sponsor telah dihapus.');
          modalElem.innerHTML = this.renderAdminModalHTML();
          this.bindAdminEvents(modalElem);
          this.onArticlesChange();
        }
      });
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
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const art = this.articles.find(a => a.id === id);
        if (art) {
          this.articles.forEach(a => { if (a.id !== id) a.isFeatured = false; });
          art.isFeatured = !art.isFeatured;
          this.onArticlesChange();
          this.refreshTable(modalElem);
          Toast.show(`Status Headline artikel "${art.title}" berhasil diubah.`);
        }
      });
    });

    modalElem.querySelectorAll('.btn-delete-article').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Apakah Anda yakin ingin menghapus artikel berita ini dari portal QUERYINDO?')) {
          const idx = this.articles.findIndex(a => a.id === id);
          if (idx > -1) {
            this.articles.splice(idx, 1);
            this.onArticlesChange();
            this.refreshTable(modalElem);
            Toast.show('Artikel berita berhasil dihapus.');
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

    const initialAiSummary = article ? article.aiSummary.join('\n') : `Pusat komputasi AI diperluas untuk dukung riset nasional.
Investasi hardware mutakhir capai efisiensi hingga 40%.
Regulasi keamanan siber menjamin perlindungan kedaulatan data.`;

    const authorsList = AuthorService.getAuthors();
    const currentAuthorName = article ? article.author.name : (user?.fullName || 'Rijal Umami');
    const isKnownAuthor = authorsList.some(a => a.name.toLowerCase() === currentAuthorName.toLowerCase());

    const editorPage = document.createElement('div');
    editorPage.id = 'manuscript-editor-fullscreen';
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
      <header style="height: 4.25rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); padding: 0 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
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
          <button type="button" id="btn-generate-ai-summary" style="padding: 0.55rem 1.1rem; background: var(--gradient-ai); border: 1px solid var(--border-active); color: var(--accent-cyan); font-weight: 800; border-radius: var(--radius-full); font-size: 0.825rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            Ringkasan AI
          </button>
          <button type="submit" form="editor-fullscreen-form" style="padding: 0.6rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.875rem; box-shadow: var(--shadow-glow); cursor: pointer;">
            ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Berita'}
          </button>
        </div>
      </header>

      <!-- Fullscreen Body Layout Grid -->
      <form id="editor-fullscreen-form" style="flex: 1; display: grid; grid-template-columns: 1fr 1fr 360px; overflow: hidden;">
        <!-- Left Column: Title, Toolbar, & Visual WYSIWYG Canvas -->
        <div style="padding: 2rem 2.5rem; overflow-y: auto; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1.25rem;">
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
              <button type="button" class="btn-tb" id="btn-tb-img" title="Sisipkan Gambar">Img</button>
            </div>

            <!-- View Switcher Toggle -->
            <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-tertiary); padding: 0.15rem 0.3rem; border-radius: var(--radius-full); border: 1px solid var(--border-color);">
              <button type="button" id="btn-mode-visual" class="btn-mode-toggle active" style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; color: #000; background: var(--accent-cyan); border: none; cursor: pointer;">Visual</button>
              <button type="button" id="btn-mode-code" class="btn-mode-toggle" style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; color: var(--text-muted); background: transparent; border: none; cursor: pointer;">HTML</button>
            </div>
          </div>

          <!-- Manuscript Canvas Container -->
          <div style="flex: 1; min-height: 380px; display: flex; flex-direction: column; position: relative;">
            <div id="wysiwyg-editor-canvas" contenteditable="true" style="flex: 1; min-height: 380px; padding: 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-main); font-size: 1.05rem; line-height: 1.7; outline: none; overflow-y: auto;">
              ${initialContent}
            </div>

            <textarea id="edit-content" name="content" style="display: none; flex: 1; min-height: 380px; padding: 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.5; resize: vertical;">${initialContent}</textarea>
          </div>

          <!-- Real-Time Word & Reading Time Analytics Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); background: var(--bg-secondary); padding: 0.65rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
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
        <div style="padding: 2rem 2.5rem; overflow-y: auto; background: var(--bg-tertiary); display: flex; flex-direction: column; gap: 1.5rem; border-right: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono); display: flex; align-items: center; gap: 0.4rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Pratinjau Langsung Pembaca (Live Preview)</span>
          </div>

          <div class="reader-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div class="badge-group" style="margin-bottom: 0.75rem;">
              <span class="tag-badge" id="preview-category-badge" style="text-transform: uppercase;">${article ? article.category.toUpperCase() : 'TEKNO'}</span>
              <span class="tag-badge" id="preview-factcheck-badge" style="display: ${article?.isFactChecked ? 'inline-block' : 'none'}; background: rgba(16,185,129,0.15); color: var(--accent-emerald);">✓ VERIFIED FACT-CHECK</span>
              <span class="tag-badge" id="preview-sponsored-badge" style="display: ${article?.isSponsored ? 'inline-block' : 'none'}; background: rgba(234,179,8,0.15); color: #eab308;">SPONSORED BY PARTNER</span>
            </div>
            <h1 class="reader-title" id="preview-title" style="font-size: 1.5rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.75rem; color: var(--text-primary);">${article ? article.title : '[Judul Berita]'}</h1>
            <p class="reader-subtitle" id="preview-subtitle" style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.45;">${article ? article.subtitle : '[Sub-judul berita]'}</p>
          </div>

          <div class="article-rich-content size-large" id="preview-content-body" style="font-size: 0.95rem; line-height: 1.65; color: var(--text-primary);">
            ${initialContent}
          </div>
        </div>

        <!-- Right Sidebar Area: Metadata, Monetization & Transparency Attributes -->
        <div style="background: var(--bg-secondary); padding: 2rem 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">Atribut & Kemitraan</h3>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kategori Berita</label>
            <select id="edit-category" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem; font-weight: 600;">
              ${CATEGORIES.filter(c => c.id !== 'all').map(c => `
                <option value="${c.id}" ${article && article.category === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Editorial Transparency & Quality Badges Box -->
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.75rem;">
            <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); text-transform: uppercase;">Lencana Kualitas & Standar Redaksi</span>
            
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.825rem; cursor: pointer; color: var(--text-primary);">
              <input type="checkbox" id="edit-is-factchecked" ${article?.isFactChecked ? 'checked' : ''} />
              <span>✓ Terverifikasi Cek Fakta (Fact-Checked)</span>
            </label>

            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.825rem; cursor: pointer; color: var(--text-primary);">
              <input type="checkbox" id="edit-is-premium" ${article?.isPremium ? 'checked' : ''} />
              <span>🔒 Riset Mendalam (QUERYINDO Pro)</span>
            </label>

            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.825rem; cursor: pointer; color: var(--text-primary);">
              <input type="checkbox" id="edit-is-sponsored" ${article?.isSponsored ? 'checked' : ''} />
              <span>📢 Kemitraan Bersponsor (Sponsored Post)</span>
            </label>

            <div id="sponsor-name-field" style="display: ${article?.isSponsored ? 'block' : 'none'};">
              <input type="text" id="edit-sponsor-name" value="${article?.sponsorName || ''}" placeholder="Nama Brand Mitra (e.g. Google Cloud Indonesia)" style="width: 100%; padding: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.8rem;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tags Berita (Pisahkan Koma)</label>
            <input type="text" id="edit-tags" value="${article ? article.tags.join(', ') : 'Teknologi, Indonesia, AI'}" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">URL Sampul Berita (HD Image)</label>
            <input type="url" id="edit-image-url" required value="${article ? article.imageUrl : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
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

          <!-- AI Summary Sidebar Box -->
          <div style="background: var(--gradient-ai); border: 1px solid var(--border-active); padding: 1rem; border-radius: var(--radius-md); margin-top: 0.5rem;">
            <label style="display: block; font-weight: 800; font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 0.4rem;">Ringkasan Poin AI</label>
            <textarea id="edit-ai-summary" rows="4" placeholder="Tuliskan 3 poin ringkasan utama (1 baris per poin)..." style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.8rem; resize: vertical;">${initialAiSummary}</textarea>
          </div>
        </div>
      </form>
    `;

    document.body.appendChild(editorPage);
    document.body.style.overflow = 'hidden';

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
    const previewFactCheck = editorPage.querySelector('#preview-factcheck-badge') as HTMLElement;
    const previewSponsored = editorPage.querySelector('#preview-sponsored-badge') as HTMLElement;
    const previewBody = editorPage.querySelector('#preview-content-body') as HTMLElement;

    const editTitle = editorPage.querySelector('#edit-title') as HTMLInputElement;
    const editSubtitle = editorPage.querySelector('#edit-subtitle') as HTMLInputElement;
    const editCategory = editorPage.querySelector('#edit-category') as HTMLSelectElement;
    const editIsFactChecked = editorPage.querySelector('#edit-is-factchecked') as HTMLInputElement;
    const editIsSponsored = editorPage.querySelector('#edit-is-sponsored') as HTMLInputElement;
    const sponsorNameField = editorPage.querySelector('#sponsor-name-field') as HTMLElement;

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

    // Toggle sponsor name field
    editIsSponsored?.addEventListener('change', () => {
      if (sponsorNameField) {
        sponsorNameField.style.display = editIsSponsored.checked ? 'block' : 'none';
      }
      if (previewSponsored) {
        previewSponsored.style.display = editIsSponsored.checked ? 'inline-block' : 'none';
      }
    });

    editIsFactChecked?.addEventListener('change', () => {
      if (previewFactCheck) {
        previewFactCheck.style.display = editIsFactChecked.checked ? 'inline-block' : 'none';
      }
    });

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
        previewBody.innerHTML = wysiwygCanvas.style.display !== 'none' ? wysiwygCanvas.innerHTML : rawTextarea.value;
      }
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

    updateAnalytics();

    // Listeners for Live Metadata Changes
    editTitle?.addEventListener('input', syncLivePreview);
    editSubtitle?.addEventListener('input', syncLivePreview);
    editCategory?.addEventListener('change', syncLivePreview);

    // Sync Content WYSIWYG <-> Textarea
    wysiwygCanvas.addEventListener('input', () => {
      rawTextarea.value = wysiwygCanvas.innerHTML;
      updateAnalytics();
    });

    rawTextarea.addEventListener('input', () => {
      wysiwygCanvas.innerHTML = rawTextarea.value;
      updateAnalytics();
    });

    // Formatting Toolbar Event Listeners
    editorPage.querySelectorAll('.btn-tb[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          document.execCommand(cmd, false);
          wysiwygCanvas.focus();
          rawTextarea.value = wysiwygCanvas.innerHTML;
          updateAnalytics();
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
        rawTextarea.value = wysiwygCanvas.innerHTML;
        updateAnalytics();
      });
    });

    // Insert Link
    editorPage.querySelector('#btn-tb-link')?.addEventListener('click', () => {
      const url = prompt('Masukkan URL tautan:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        wysiwygCanvas.focus();
        rawTextarea.value = wysiwygCanvas.innerHTML;
        updateAnalytics();
      }
    });

    // Insert Image
    editorPage.querySelector('#btn-tb-img')?.addEventListener('click', () => {
      const imgUrl = prompt('Masukkan URL gambar:', 'https://images.unsplash.com/');
      if (imgUrl) {
        document.execCommand('insertImage', false, imgUrl);
        wysiwygCanvas.focus();
        rawTextarea.value = wysiwygCanvas.innerHTML;
        updateAnalytics();
      }
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
      rawTextarea.value = wysiwygCanvas.innerHTML;
    });

    // Close & Return
    const closeEditor = () => {
      editorPage.remove();
      document.body.style.overflow = '';
    };

    editorPage.querySelector('#editor-back-btn')?.addEventListener('click', closeEditor);

    // Generate AI Summary
    editorPage.querySelector('#btn-generate-ai-summary')?.addEventListener('click', () => {
      const title = editTitle.value.trim() || 'Berita Teknologi';
      const aiSummaryArea = editorPage.querySelector('#edit-ai-summary') as HTMLTextAreaElement;
      aiSummaryArea.value = [
        `Inisiatif ${title} memperkuat daya saing ekosistem digital nasional.`,
        'Penerapan standar operasional tingkat tinggi menekan risiko dan mengoptimalkan efisiensi.',
        'Langkah strategis ini diproyeksikan memberikan dampak positif bagi industri tekno Indonesia.'
      ].join('\n');
      Toast.show('Ringkasan AI berhasil digenerasi!');
    });

    // Submit Fullscreen Form Handler
    const form = editorPage.querySelector('#editor-fullscreen-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = (editorPage.querySelector('#edit-title') as HTMLInputElement).value;
      const subtitle = (editorPage.querySelector('#edit-subtitle') as HTMLInputElement).value;
      const category = (editorPage.querySelector('#edit-category') as HTMLSelectElement).value as CategoryId;
      const tagsStr = (editorPage.querySelector('#edit-tags') as HTMLInputElement).value;
      const imageUrl = (editorPage.querySelector('#edit-image-url') as HTMLInputElement).value;
      
      let authorName = authorSelect?.value === '__custom__' ? authorCustomInput?.value.trim() : authorSelect?.value;
      if (!authorName) authorName = user?.fullName || 'Rijal Umami';

      const matchedAuthor = AuthorService.getAuthorByName(authorName);
      const authorAvatar = matchedAuthor?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
      const authorRole = matchedAuthor?.role || 'Jurnalis Redaksi';

      const aiSummaryText = (editorPage.querySelector('#edit-ai-summary') as HTMLTextAreaElement).value;
      const content = wysiwygCanvas.innerHTML;

      const isFactChecked = (editorPage.querySelector('#edit-is-factchecked') as HTMLInputElement).checked;
      const isPremium = (editorPage.querySelector('#edit-is-premium') as HTMLInputElement).checked;
      const isSponsored = (editorPage.querySelector('#edit-is-sponsored') as HTMLInputElement).checked;
      const sponsorName = (editorPage.querySelector('#edit-sponsor-name') as HTMLInputElement)?.value || undefined;

      const aiSummary = aiSummaryText.split('\n').filter(line => line.trim().length > 0);
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      if (isEdit && article) {
        article.title = title;
        article.subtitle = subtitle;
        article.category = category;
        article.tags = tags;
        article.imageUrl = imageUrl;
        article.author.name = authorName;
        article.author.avatar = authorAvatar;
        article.author.role = authorRole;
        article.aiSummary = aiSummary;
        article.content = content;
        article.isFactChecked = isFactChecked;
        article.isPremium = isPremium;
        article.isSponsored = isSponsored;
        article.sponsorName = isSponsored ? sponsorName : undefined;
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
          isFactChecked,
          isPremium,
          isSponsored,
          sponsorName: isSponsored ? sponsorName : undefined,
          viewsCount: 150,
          likesCount: 12,
          aiSummary,
          content
        };
        this.articles.unshift(newArt);
        Toast.show('Berita baru berhasil diterbitkan di QUERYINDO!');
      }

      this.onArticlesChange();
      this.refreshTable(parentModal);
      closeEditor();
    });
  }
}
