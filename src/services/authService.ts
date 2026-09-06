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

  public static logout(): void {
    localStorage.removeItem(READER_SESSION_KEY);
  }
}
