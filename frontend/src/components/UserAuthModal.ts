import { ReaderAuthService, type ReaderUser } from '../services/authService';
import { store } from '../state/store';
import { Toast } from '../utils/toast';
import { BookmarksModal } from '../sections/BookmarksModal';

export class UserAuthModal {
  public static updateUserNavbarState(): void {
    const userAuthBtn = document.getElementById('user-auth-btn');
    const mUserAuthBtn = document.getElementById('m-user-auth-btn');
    const currentReader = ReaderAuthService.getCurrentReader();

    const dropdownUserName = document.getElementById('dropdown-user-name');
    const dropdownUserStatus = document.getElementById('dropdown-user-status');
    const dropdownAuthActionBtn = document.getElementById('dropdown-auth-action-btn');
    const dropdownLogoutWrap = document.getElementById('dropdown-logout-wrapper');

    if (currentReader) {
      const firstName = currentReader.name.split(' ')[0];
      if (userAuthBtn) {
        userAuthBtn.innerHTML = `
          <img src="${currentReader.avatar}" alt="${currentReader.name}" class="user-avatar-badge" />
        `;
        userAuthBtn.title = `Akun: ${currentReader.name} (Preferensi & Profil)`;
      }
      if (dropdownUserName) dropdownUserName.textContent = currentReader.name;
      if (dropdownUserStatus) dropdownUserStatus.textContent = 'Terhubung Google';
      if (dropdownAuthActionBtn) dropdownAuthActionBtn.textContent = 'Lihat Profil';
      if (dropdownLogoutWrap) dropdownLogoutWrap.style.display = 'block';
      if (mUserAuthBtn) {
        mUserAuthBtn.innerHTML = `
          <img src="${currentReader.avatar}" alt="${currentReader.name}" class="user-avatar-badge" />
          <span id="m-user-auth-btn-text">${firstName}</span>
        `;
      }
    } else {
      if (userAuthBtn) {
        userAuthBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        `;
        userAuthBtn.title = 'Akun & Preferensi';
      }
      if (dropdownUserName) dropdownUserName.textContent = 'Pengunjung Tamu';
      if (dropdownUserStatus) dropdownUserStatus.textContent = 'Belum Masuk';
      if (dropdownAuthActionBtn) dropdownAuthActionBtn.textContent = 'Masuk Akun';
      if (dropdownLogoutWrap) dropdownLogoutWrap.style.display = 'none';
      if (mUserAuthBtn) {
        mUserAuthBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span id="m-user-auth-btn-text">Masuk / Akun</span>
        `;
      }
    }
  }

  public static open(): void {
    const userAuthModal = document.getElementById('user-auth-modal');
    const userAuthContainer = document.getElementById('user-auth-container');
    if (!userAuthModal || !userAuthContainer) return;
    window.dispatchEvent(new CustomEvent('modal-opened'));

    const currentReader = ReaderAuthService.getCurrentReader();
    if (currentReader) {
      this.renderUserProfileHTML(currentReader);
    } else {
      this.renderGoogleAuthModalHTML();
    }

    userAuthModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  public static close(): void {
    const userAuthModal = document.getElementById('user-auth-modal');
    if (userAuthModal) {
      userAuthModal.classList.remove('open');
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }

  private static renderUserProfileHTML(reader: ReaderUser): void {
    const userAuthContainer = document.getElementById('user-auth-container');
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

    userAuthContainer.querySelector('#user-auth-close-btn')?.addEventListener('click', () => this.close());
    userAuthContainer.querySelector('#btn-open-my-bookmarks')?.addEventListener('click', () => {
      this.close();
      BookmarksModal.open();
    });
    userAuthContainer.querySelector('#btn-user-logout')?.addEventListener('click', () => {
      ReaderAuthService.logout();
      Toast.show('Anda telah keluar dari akun Google.');
      this.updateUserNavbarState();
      this.close();
    });
  }

  private static renderGoogleAuthModalHTML(): void {
    const userAuthContainer = document.getElementById('user-auth-container');
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

    userAuthContainer.querySelector('#user-auth-close-btn')?.addEventListener('click', () => this.close());

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
        this.updateUserNavbarState();
        Toast.show(res.message);
        this.close();
      } catch (err: any) {
        Toast.show(err.message || 'Gagal login dengan Google.');
      } finally {
        if (launchBtn) launchBtn.disabled = false;
        if (launchText) launchText.textContent = 'Lanjutkan dengan Google';
      }
    });
  }
}
