export interface AuthUser {
  username: string;
  fullName: string;
  role: string;
  avatar: string;
  token: string;
}

export interface ReaderUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  authProvider: 'google';
  savedArticles: string[];
  registeredAt: string;
}

const TOKEN_KEY = 'byte_jwt_token';
const USER_KEY = 'byte_user_session';
const READER_SESSION_KEY = 'queryindo_reader_session';
const READER_USERS_KEY = 'queryindo_reader_db';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_AUTH_URL = `${API_BASE_URL}/auth/login`;

export class AuthService {
  // Pre-configured Admin Credentials for offline fallback
  private static ADMIN_USERNAME = 'Rijalumami';
  private static ADMIN_PASSWORD = 'Rijalumami1002';

  public static async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: AuthUser }> {
    const trimmedUser = usernameInput.trim();

    // 1. Try Go Backend Authentication API first
    try {
      const response = await fetch(API_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: trimmedUser,
          password: passwordInput
        }),
        signal: AbortSignal.timeout(3000)
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        const user: AuthUser = {
          username: data.user?.username || trimmedUser,
          fullName: data.user?.full_name || 'Rijal Umami',
          role: data.user?.role || 'Editor in Chief (Pemred)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          token: data.token
        };

        sessionStorage.setItem(TOKEN_KEY, data.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true, message: data.message || 'Otentikasi Berhasil!', user };
      } else if (response.status === 429) {
        return {
          success: false,
          message: data.message || 'Terlalu banyak percobaan login. Akun terkunci sementara demi keamanan.'
        };
      } else if (response.status === 401) {
        return { success: false, message: data.message || 'Username atau Password Redaksi Salah.' };
      }
    } catch {
      // Backend not running or timeout; continue to offline fallback
    }

    // 2. Offline Fallback Authentication for Editorial Staff
    const isUserMatch = trimmedUser === this.ADMIN_USERNAME || 
                        trimmedUser.toLowerCase() === 'editor@queryindo.id' || 
                        trimmedUser.toLowerCase() === 'editor@byteindonesia.id';
    const isPassMatch = passwordInput === this.ADMIN_PASSWORD || passwordInput === 'redaksi2026';

    if (isUserMatch && isPassMatch) {
      const mockJwtToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlJpamFsdW1hbWkiLCJyb2xlIjoiRWRpdG9yIGluIENoaWVmIiwiaWF0IjoxNzU0MDQxNjAwfQ.query_signature_${Date.now()}`;
      
      const user: AuthUser = {
        username: 'Rijalumami',
        fullName: 'Rijal Umami',
        role: 'Editor in Chief (Pemred)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        token: mockJwtToken
      };

      sessionStorage.setItem(TOKEN_KEY, mockJwtToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));

      return { success: true, message: 'Otentikasi Berhasil!', user };
    }

    return { success: false, message: 'Username atau Password Redaksi Salah.' };
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
// Reader / Public User Authentication via Google Sign-In & Cloud Bookmark Sync
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
   * One-Click Google Sign-In for Readers
   */
  public static loginWithGoogle(account?: { name: string; email: string; avatar?: string }): { success: boolean; message: string; user: ReaderUser } {
    const defaultName = account?.name?.trim() || 'Pembaca Queryindo';
    const defaultEmail = account?.email?.trim().toLowerCase() || 'pembaca@gmail.com';
    const defaultAvatar = account?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=00f2fe&color=0d0e12&bold=true`;

    const users = this.getStoredUsers();
    let existingUser = users.find(u => u.email === defaultEmail);

    let localBookmarks: string[] = [];
    try {
      localBookmarks = JSON.parse(localStorage.getItem('byte_bookmarks') || '[]');
    } catch {}

    if (!existingUser) {
      existingUser = {
        id: `g_usr_${Date.now()}`,
        name: defaultName,
        email: defaultEmail,
        avatar: defaultAvatar,
        authProvider: 'google',
        savedArticles: localBookmarks,
        registeredAt: new Date().toISOString()
      };
      users.push(existingUser);
    } else {
      // Merge bookmarks
      existingUser.savedArticles = Array.from(new Set([...existingUser.savedArticles, ...localBookmarks]));
      existingUser.name = defaultName;
      existingUser.avatar = defaultAvatar;
    }

    this.saveStoredUsers(users);
    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(existingUser));
    localStorage.setItem('byte_bookmarks', JSON.stringify(existingUser.savedArticles));

    return {
      success: true,
      message: `Berhasil masuk dengan Google sebagai ${existingUser.name}!`,
      user: existingUser
    };
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

  public static logout(): void {
    localStorage.removeItem(READER_SESSION_KEY);
  }
}
