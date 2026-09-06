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
// Reader / Public User Authentication & Bookmark Cloud Sync System
// --------------------------------------------------------------------------
export class ReaderAuthService {
  private static getStoredUsers(): Array<ReaderUser & { passwordHash: string }> {
    try {
      const raw = localStorage.getItem(READER_USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveStoredUsers(users: Array<ReaderUser & { passwordHash: string }>) {
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

  public static register(name: string, email: string, password: string): { success: boolean; message: string; user?: ReaderUser } {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      return { success: false, message: 'Mohon lengkapi semua kolom pendaftaran.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter.' };
    }

    const users = this.getStoredUsers();
    if (users.some(u => u.email === trimmedEmail)) {
      return { success: false, message: 'Email sudah terdaftar. Silakan langsung masuk.' };
    }

    // Get any existing local bookmarks to sync into the new account
    let currentSaved: string[] = [];
    try {
      currentSaved = JSON.parse(localStorage.getItem('byte_bookmarks') || '[]');
    } catch {}

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=00f2fe&color=0d0e12&bold=true`;

    const newUser: ReaderUser & { passwordHash: string } = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatar: avatarUrl,
      savedArticles: currentSaved,
      registeredAt: new Date().toISOString(),
      passwordHash: btoa(password) // Base64 encoding for client storage
    };

    users.push(newUser);
    this.saveStoredUsers(users);

    const safeUser: ReaderUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      savedArticles: newUser.savedArticles,
      registeredAt: newUser.registeredAt
    };

    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(safeUser));
    return { success: true, message: 'Pendaftaran berhasil! Selamat datang di QUERYINDO.', user: safeUser };
  }

  public static login(email: string, password: string): { success: boolean; message: string; user?: ReaderUser } {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { success: false, message: 'Email dan kata sandi wajib diisi.' };
    }

    const users = this.getStoredUsers();
    const found = users.find(u => u.email === trimmedEmail && u.passwordHash === btoa(password));

    if (!found) {
      return { success: false, message: 'Email atau kata sandi tidak cocok.' };
    }

    // Merge bookmarks between account and current browser session
    let localSaved: string[] = [];
    try {
      localSaved = JSON.parse(localStorage.getItem('byte_bookmarks') || '[]');
    } catch {}

    const mergedBookmarks = Array.from(new Set([...found.savedArticles, ...localSaved]));
    found.savedArticles = mergedBookmarks;
    this.saveStoredUsers(users);
    localStorage.setItem('byte_bookmarks', JSON.stringify(mergedBookmarks));

    const safeUser: ReaderUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      avatar: found.avatar,
      savedArticles: found.savedArticles,
      registeredAt: found.registeredAt
    };

    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(safeUser));
    return { success: true, message: `Selamat datang kembali, ${found.name}!`, user: safeUser };
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
