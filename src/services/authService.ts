import { ApiService } from './apiService';

export type AdminRole = 'superuser' | 'editor';

export interface AuthUser {
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  roleTitle: string;
  avatar: string;
  token: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: AdminRole;
  roleTitle: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface ReaderUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  authProvider: 'google';
  savedArticles: string[];
  likedArticles?: string[];
  registeredAt: string;
}

const TOKEN_KEY = 'byte_jwt_token';
const USER_KEY = 'byte_user_session';
const ADMIN_ACCOUNTS_KEY = 'queryindo_admin_accounts';
const READER_SESSION_KEY = 'queryindo_reader_session';
const READER_USERS_KEY = 'queryindo_reader_db';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_AUTH_URL = `${API_BASE_URL}/auth/login`;

export class AuthService {
  private static SUPERUSER_EMAIL = 'rijalumami000@gmail.com';
  private static SUPERUSER_USERNAME = 'rijalumami';

  /**
   * Retrieve cached or default admin accounts list for display in CMS Settings
   */
  public static getAdminAccounts(): AdminAccount[] {
    try {
      const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
      let accounts: AdminAccount[] = raw ? JSON.parse(raw) : [];

      const hasSuperuser = accounts.some(a => a.email.toLowerCase() === this.SUPERUSER_EMAIL);
      if (!hasSuperuser) {
        const superuserAcc: AdminAccount = {
          id: 'adm_superuser_01',
          email: 'rijalumami000@gmail.com',
          username: 'Rijalumami',
          fullName: 'Rijal Umami',
          role: 'superuser',
          roleTitle: 'Founder & CEO',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          createdAt: '2025-01-01T00:00:00.000Z',
          isActive: true
        };
        accounts = [superuserAcc, ...accounts];
        localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
      }
      return accounts;
    } catch {
      return [{
        id: 'adm_superuser_01',
        email: 'rijalumami000@gmail.com',
        username: 'Rijalumami',
        fullName: 'Rijal Umami',
        role: 'superuser',
        roleTitle: 'Founder & CEO',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: '2025-01-01T00:00:00.000Z',
        isActive: true
      }];
    }
  }

  /**
   * Refresh admin accounts list from PostgreSQL database
   */
  public static async refreshAdminAccountsFromBackend(): Promise<AdminAccount[]> {
    try {
      const users = await ApiService.getAdminUsers();
      if (Array.isArray(users) && users.length > 0) {
        const accounts: AdminAccount[] = users.map((u: any) => {
          const isSuper = (u.role || '').toLowerCase().includes('super') || (u.role || '').toLowerCase().includes('founder') || u.email?.toLowerCase() === this.SUPERUSER_EMAIL;
          return {
            id: String(u.id || `adm_${u.username}`),
            email: u.email || '',
            username: u.username || '',
            fullName: u.full_name || u.username || 'Admin',
            role: isSuper ? 'superuser' : 'editor',
            roleTitle: isSuper ? 'Founder & CEO' : 'Redaktur / Editor',
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username)}&background=0B1120&color=00F2FE&bold=true`,
            createdAt: u.created_at || new Date().toISOString(),
            isActive: true
          };
        });
        localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
        return accounts;
      }
    } catch (err) {
      console.warn('Gagal memuat admin accounts dari backend:', err);
    }
    return this.getAdminAccounts();
  }

  /**
   * Create a new Editor account via PostgreSQL Backend API
   */
  public static async createEditorAccount(data: { email: string; fullName: string; password: string }): Promise<{ success: boolean; message: string; account?: AdminAccount }> {
    const email = data.email.trim().toLowerCase();
    const fullName = data.fullName.trim();
    const password = data.password.trim();

    if (!email || !fullName || !password) {
      return { success: false, message: 'Email, Nama Lengkap, dan Kata Sandi wajib diisi.' };
    }

    const res = await ApiService.createAdminUser({ email, fullName, password, role: 'editor' });
    if (res.success) {
      await this.refreshAdminAccountsFromBackend();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Gagal membuat akun editor di database.' };
  }

  /**
   * Delete an Editor account via PostgreSQL Backend API
   */
  public static async deleteAdminAccount(id: string): Promise<{ success: boolean; message: string }> {
    const res = await ApiService.deleteAdminUser(id);
    if (res.success) {
      await this.refreshAdminAccountsFromBackend();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Gagal menghapus akun.' };
  }

  /**
   * Change password for the current authenticated user via PostgreSQL Backend API
   */
  public static async changePassword(_emailOrUsername: string, oldPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    if (!oldPass || !newPass) {
      return { success: false, message: 'Kata sandi lama dan baru wajib diisi.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
    }
    return await ApiService.changePassword(oldPass, newPass);
  }

  /**
   * Authenticate admin exclusively against the Go PostgreSQL Backend API.
   * No fallback passwords or simulated client-side tokens.
   */
  public static async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    const trimmedInput = usernameInput.trim();
    const lowerInput = trimmedInput.toLowerCase();

    try {
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedInput,
          password: passwordInput
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        const isSuper = (data.user?.role || '').toLowerCase().includes('founder') || 
                        (data.user?.role || '').toLowerCase().includes('super') ||
                        lowerInput === this.SUPERUSER_EMAIL || 
                        lowerInput === this.SUPERUSER_USERNAME;

        const user: AuthUser = {
          username: data.user?.username || trimmedInput,
          email: lowerInput.includes('@') ? lowerInput : 'rijalumami000@gmail.com',
          fullName: data.user?.full_name || 'Rijal Umami',
          role: isSuper ? 'superuser' : 'editor',
          roleTitle: isSuper ? 'Founder & CEO' : 'Redaktur / Editor',
          avatar: data.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          token: data.token
        };

        sessionStorage.setItem(TOKEN_KEY, data.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true, message: data.message || 'Otentikasi Berhasil!', user };
      } else {
        return { success: false, message: data.message || 'Email/Username atau Kata Sandi Salah.' };
      }
    } catch (err: any) {
      return { success: false, message: 'Tidak dapat terhubung ke server autentikasi backend. Pastikan server backend sedang berjalan.' };
    }
  }

  public static logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  public static getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  public static getCurrentUser(): AuthUser | null {
    const userJson = sessionStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthUser;
    } catch {
      return null;
    }
  }

  public static isAuthenticated(): boolean {
    return sessionStorage.getItem(TOKEN_KEY) !== null;
  }
}

// --------------------------------------------------------------------------
// Reader Google Authentication & Cloud Bookmark Sync System
// --------------------------------------------------------------------------
export class ReaderAuthService {
  private static getStoredUsers(): ReaderUser[] {
    try {
      const raw = localStorage.getItem(READER_USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveStoredUsers(users: ReaderUser[]) {
    localStorage.setItem(READER_USERS_KEY, JSON.stringify(users));
  }

  public static getCurrentReader(): ReaderUser | null {
    try {
      const raw = localStorage.getItem(READER_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static isReaderLoggedIn(): boolean {
    return this.getCurrentReader() !== null;
  }

  public static loginWithGoogleProfile(profile: { email: string; name?: string; avatar?: string }): { success: boolean; message: string; user: ReaderUser } {
    if (!profile.email || !profile.email.trim()) {
      throw new Error('Alamat email Google diperlukan');
    }
    const email = profile.email.trim().toLowerCase();
    const rawName = profile.name?.trim() || email.split('@')[0];
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=4285F4&color=fff&bold=true`;

    const users = this.getStoredUsers();
    let existingUser = users.find(u => u.email === email);

    let localBookmarks: string[] = [];
    try {
      localBookmarks = JSON.parse(localStorage.getItem('byte_bookmarks') || '[]');
    } catch {}

    if (!existingUser) {
      existingUser = {
        id: `g_usr_${Date.now()}`,
        name: formattedName,
        email: email,
        avatar: avatarUrl,
        authProvider: 'google',
        savedArticles: localBookmarks,
        registeredAt: new Date().toISOString()
      };
      users.push(existingUser);
    } else {
      existingUser.savedArticles = Array.from(new Set([...existingUser.savedArticles, ...localBookmarks]));
      if (profile.name) existingUser.name = formattedName;
      if (profile.avatar) existingUser.avatar = avatarUrl;
    }

    this.saveStoredUsers(users);
    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(existingUser));
    localStorage.setItem('byte_bookmarks', JSON.stringify(existingUser.savedArticles));

    return {
      success: true,
      message: `Berhasil masuk dengan Akun Google: ${existingUser.name} (${existingUser.email})!`,
      user: existingUser
    };
  }

  public static loginWithGoogle(emailInput: string, nameInput?: string): { success: boolean; message: string; user: ReaderUser } {
    return this.loginWithGoogleProfile({ email: emailInput, name: nameInput });
  }

  public static async signInWithGoogleOAuth(): Promise<{ success: boolean; message: string; user: ReaderUser }> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '360953158889-7tir7khes5s1epp6bo3hqencsghier5n.apps.googleusercontent.com';

    return new Promise((resolve, reject) => {
      const g = (window as any).google;
      if (g?.accounts?.oauth2) {
        try {
          const client = g.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse?.access_token) {
                try {
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  });
                  const data = await res.json();
                  if (data && data.email) {
                    const authResult = ReaderAuthService.loginWithGoogleProfile({
                      email: data.email,
                      name: data.name || data.given_name || data.email.split('@')[0],
                      avatar: data.picture
                    });
                    resolve(authResult);
                    return;
                  }
                } catch (e: any) {
                  reject(new Error('Gagal mengambil data profil Google: ' + e.message));
                  return;
                }
              }
              if (tokenResponse?.error) {
                reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Otentikasi dibatalkan.'));
              }
            },
            error_callback: (err: any) => {
              reject(new Error(err?.message || 'Gagal membuka Google Sign-In.'));
            }
          });

          client.requestAccessToken();
        } catch (e: any) {
          reject(new Error('Gagal memproses otentikasi Google: ' + e.message));
        }
      } else {
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=token&scope=email%20profile%20openid`;
        window.open(authUrl, 'GoogleSignIn', 'width=500,height=600');
        reject(new Error('Membuka jendela Google Sign-In...'));
      }
    });
  }

  public static syncSavedArticles(articleIds: string[]) {
    const reader = this.getCurrentReader();
    if (!reader) return;

    reader.savedArticles = articleIds;
    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(reader));

    const users = this.getStoredUsers();
    const idx = users.findIndex(u => u.id === reader.id);
    if (idx !== -1) {
      users[idx].savedArticles = articleIds;
      this.saveStoredUsers(users);
    }
  }

  public static syncLikedArticles(articleIds: string[]) {
    const reader = this.getCurrentReader();
    if (!reader) return;

    reader.likedArticles = articleIds;
    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(reader));

    const users = this.getStoredUsers();
    const idx = users.findIndex(u => u.id === reader.id);
    if (idx !== -1) {
      users[idx].likedArticles = articleIds;
      this.saveStoredUsers(users);
    }
  }

  public static logout(): void {
    localStorage.removeItem(READER_SESSION_KEY);
  }
}
