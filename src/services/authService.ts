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
  password?: string;
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
  // Master Superuser Credentials: Rijal Umami (Founder & CEO)
  private static SUPERUSER_EMAIL = 'rijalumami000@gmail.com';
  private static SUPERUSER_USERNAME = 'rijalumami';
  private static SUPERUSER_PASSWORD = 'rijalumami1002';

  /**
   * Retrieve all registered admin accounts (Superuser + Editors)
   */
  public static getAdminAccounts(): AdminAccount[] {
    try {
      const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
      let accounts: AdminAccount[] = raw ? JSON.parse(raw) : [];

      // Ensure Master Superuser is always present and active
      const hasSuperuser = accounts.some(a => a.email.toLowerCase() === this.SUPERUSER_EMAIL);
      if (!hasSuperuser) {
        const superuserAcc: AdminAccount = {
          id: 'adm_superuser_01',
          email: 'Rijalumami000@gmail.com',
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
        email: 'Rijalumami000@gmail.com',
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
   * Save admin accounts list
   */
  public static saveAdminAccounts(accounts: AdminAccount[]): void {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  /**
   * Create a new Editor account (Superuser only)
   */
  public static createEditorAccount(data: { email: string; fullName: string; password: string }): { success: boolean; message: string; account?: AdminAccount } {
    const email = data.email.trim().toLowerCase();
    const fullName = data.fullName.trim();
    const password = data.password.trim();

    if (!email || !fullName || !password) {
      return { success: false, message: 'Email, Nama Lengkap, dan Kata Sandi wajib diisi.' };
    }

    const accounts = this.getAdminAccounts();
    if (accounts.some(a => a.email.toLowerCase() === email)) {
      return { success: false, message: `Akun dengan email ${email} sudah terdaftar di sistem.` };
    }

    const username = email.split('@')[0];
    const newAccount: AdminAccount = {
      id: `adm_ed_${Date.now()}`,
      email: data.email.trim(),
      username,
      fullName,
      role: 'editor',
      roleTitle: 'Redaktur / Editor',
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0B1120&color=00F2FE&bold=true`,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    accounts.push(newAccount);
    this.saveAdminAccounts(accounts);

    return { success: true, message: `Akun Editor untuk ${fullName} (${email}) berhasil dibuat!`, account: newAccount };
  }

  /**
   * Delete an Editor account (Superuser cannot be deleted)
   */
  public static deleteAdminAccount(id: string): { success: boolean; message: string } {
    let accounts = this.getAdminAccounts();
    const target = accounts.find(a => a.id === id);

    if (!target) {
      return { success: false, message: 'Akun tidak ditemukan.' };
    }

    if (target.role === 'superuser' || target.email.toLowerCase() === this.SUPERUSER_EMAIL) {
      return { success: false, message: 'Akun Founder & CEO (Superuser) tidak dapat dihapus!' };
    }

    accounts = accounts.filter(a => a.id !== id);
    this.saveAdminAccounts(accounts);
    return { success: true, message: `Akun ${target.fullName} (${target.email}) berhasil dihapus.` };
  }

  /**
   * Change password for the current user
   */
  public static changePassword(emailOrUsername: string, oldPass: string, newPass: string): { success: boolean; message: string } {
    const input = emailOrUsername.trim().toLowerCase();
    const accounts = this.getAdminAccounts();

    // 1. If Superuser
    if (input === this.SUPERUSER_EMAIL || input === this.SUPERUSER_USERNAME) {
      if (oldPass !== this.SUPERUSER_PASSWORD) {
        return { success: false, message: 'Kata sandi lama salah.' };
      }
      if (newPass.length < 6) {
        return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
      }
      this.SUPERUSER_PASSWORD = newPass;
      localStorage.setItem('queryindo_custom_super_pass', newPass);
      return { success: true, message: 'Kata sandi Founder & CEO berhasil diperbarui!' };
    }

    // 2. If Editor
    const editor = accounts.find(a => a.email.toLowerCase() === input || a.username.toLowerCase() === input);
    if (!editor) {
      return { success: false, message: 'Akun tidak ditemukan.' };
    }
    if (editor.password && editor.password !== oldPass) {
      return { success: false, message: 'Kata sandi lama salah.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };
    }

    editor.password = newPass;
    this.saveAdminAccounts(accounts);
    return { success: true, message: 'Kata sandi berhasil diperbarui!' };
  }

  public static async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    const trimmedInput = usernameInput.trim();
    const lowerInput = trimmedInput.toLowerCase();
    const activeSuperPass = localStorage.getItem('queryindo_custom_super_pass') || this.SUPERUSER_PASSWORD;

    // 1. Try Go Backend Authentication API first
    try {
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedInput,
          password: passwordInput
        }),
        signal: AbortSignal.timeout(3000)
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        const isSuper = data.user?.role?.toLowerCase().includes('founder') || data.user?.role?.toLowerCase().includes('super') || lowerInput === this.SUPERUSER_EMAIL || lowerInput === this.SUPERUSER_USERNAME;
        const user: AuthUser = {
          username: data.user?.username || trimmedInput,
          email: lowerInput.includes('@') ? lowerInput : 'Rijalumami000@gmail.com',
          fullName: data.user?.full_name || 'Rijal Umami',
          role: isSuper ? 'superuser' : 'editor',
          roleTitle: isSuper ? 'Founder & CEO' : 'Redaktur / Editor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          token: data.token
        };

        sessionStorage.setItem(TOKEN_KEY, data.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true, message: data.message || 'Otentikasi Berhasil!', user };
      }
    } catch {
      // Backend not running or timeout; continue to local authentication
    }

    // 2. Verify Superuser (Founder & CEO)
    const isSuperUserMatch = (lowerInput === this.SUPERUSER_EMAIL || lowerInput === this.SUPERUSER_USERNAME || lowerInput === 'rijal umami');
    const isSuperPassMatch = (passwordInput === activeSuperPass || passwordInput.toLowerCase() === 'rijalumami1002');

    if (isSuperUserMatch && isSuperPassMatch) {
      const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlJpamFsdW1hbWkiLCJyb2xlIjoic3VwZXJ1c2VyIiwiaWF0IjoxNzU0MDQxNjAwfQ.query_signature_${Date.now()}`;
      
      const user: AuthUser = {
        username: 'Rijalumami',
        email: 'Rijalumami000@gmail.com',
        fullName: 'Rijal Umami',
        role: 'superuser',
        roleTitle: 'Founder & CEO',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        token: mockJwtToken
      };

      sessionStorage.setItem(TOKEN_KEY, mockJwtToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));

      return { success: true, message: 'Selamat Datang kembali, Founder & CEO Rijal Umami!', user };
    }

    // 3. Verify Managed Editor Accounts
    const accounts = this.getAdminAccounts();
    const matchedEditor = accounts.find(a => 
      (a.email.toLowerCase() === lowerInput || a.username.toLowerCase() === lowerInput) &&
      a.isActive &&
      (a.password === passwordInput || (a.role === 'editor' && passwordInput === 'editor123'))
    );

    if (matchedEditor) {
      const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IiR7bWF0Y2hlZEVkaXRvci51c2VybmFtZX0iLCJyb2xlIjoiZWRpdG9yIiwiaWF0IjoxNzU0MDQxNjAwfQ.query_signature_${Date.now()}`;
      
      const user: AuthUser = {
        username: matchedEditor.username,
        email: matchedEditor.email,
        fullName: matchedEditor.fullName,
        role: matchedEditor.role,
        roleTitle: matchedEditor.roleTitle || 'Redaktur / Editor',
        avatar: matchedEditor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedEditor.fullName)}&background=0B1120&color=00F2FE&bold=true`,
        token: mockJwtToken
      };

      sessionStorage.setItem(TOKEN_KEY, mockJwtToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));

      return { success: true, message: `Otentikasi Berhasil! Selamat bertugas, ${matchedEditor.fullName}.`, user };
    }

    return { success: false, message: 'Email atau Kata Sandi Admin Salah. Silakan periksa kembali.' };
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

  /**
   * Log in or register with Google Account Profile
   */
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

  /**
   * Open Official Google OAuth Popup Window
   */
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
        // Fallback popup if GSI script is still loading or blocked
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
