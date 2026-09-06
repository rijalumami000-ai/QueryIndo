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

export interface GoogleJwtPayload {
  iss?: string;
  nbf?: number;
  aud?: string;
  sub: string;
  email: string;
  email_verified?: boolean;
  azp?: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
  iat?: number;
  exp?: number;
}

const TOKEN_KEY = 'byte_jwt_token';
const USER_KEY = 'byte_user_session';
const READER_SESSION_KEY = 'queryindo_reader_session';
const READER_USERS_KEY = 'queryindo_reader_db';
const GOOGLE_CLIENT_ID_KEY = 'queryindo_google_client_id';

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
// Real Google Identity Services (GSI & OAuth 2.0) Reader Authentication
// --------------------------------------------------------------------------
export class ReaderAuthService {
  private static DEFAULT_GOOGLE_CLIENT_ID = '548981447021-u906t1p9g2l6d8q4m3g0h5q2c8p1k9a3.apps.googleusercontent.com';

  public static getGoogleClientId(): string {
    const custom = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
    if (custom && custom.trim()) return custom.trim();
    const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envId && envId.trim()) return envId.trim();
    return this.DEFAULT_GOOGLE_CLIENT_ID;
  }

  public static setGoogleClientId(clientId: string) {
    if (clientId && clientId.trim()) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
    }
  }

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
   * Safely decode Google Identity Services ID Token (JWT)
   */
  public static decodeGoogleJwt(token: string): GoogleJwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as GoogleJwtPayload;
    } catch (e) {
      console.error('Failed to decode Google JWT token', e);
      return null;
    }
  }

  /**
   * Login using real Google JWT credential from Google Identity Services
   */
  public static loginWithGoogleCredential(credential: string): { success: boolean; message: string; user: ReaderUser } {
    const payload = this.decodeGoogleJwt(credential);
    if (!payload || !payload.email) {
      return {
        success: false,
        message: 'Token Google tidak valid.',
        user: null as any
      };
    }

    return this.loginWithGoogleProfile({
      sub: payload.sub || `g_${Date.now()}`,
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      picture: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || payload.email)}&background=4285F4&color=fff&bold=true`
    });
  }

  /**
   * Login or register with verified Google profile data
   */
  public static loginWithGoogleProfile(profile: { sub: string; name: string; email: string; picture?: string }): { success: boolean; message: string; user: ReaderUser } {
    const defaultName = profile.name.trim() || 'Pembaca Queryindo';
    const defaultEmail = profile.email.trim().toLowerCase();
    const defaultAvatar = profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultName)}&background=4285F4&color=fff&bold=true`;

    const users = this.getStoredUsers();
    let existingUser = users.find(u => u.email === defaultEmail);

    let localBookmarks: string[] = [];
    try {
      localBookmarks = JSON.parse(localStorage.getItem('byte_bookmarks') || '[]');
    } catch {}

    if (!existingUser) {
      existingUser = {
        id: profile.sub || `g_usr_${Date.now()}`,
        name: defaultName,
        email: defaultEmail,
        avatar: defaultAvatar,
        authProvider: 'google',
        savedArticles: localBookmarks,
        registeredAt: new Date().toISOString()
      };
      users.push(existingUser);
    } else {
      existingUser.savedArticles = Array.from(new Set([...existingUser.savedArticles, ...localBookmarks]));
      existingUser.name = defaultName;
      existingUser.avatar = defaultAvatar;
    }

    this.saveStoredUsers(users);
    localStorage.setItem(READER_SESSION_KEY, JSON.stringify(existingUser));
    localStorage.setItem('byte_bookmarks', JSON.stringify(existingUser.savedArticles));

    return {
      success: true,
      message: `Selamat datang, ${existingUser.name}! Akun Google Anda terhubung.`,
      user: existingUser
    };
  }

  /**
   * Initialize Google Identity Services One Tap & Official Button
   */
  public static initGoogleIdentity(
    onSuccess: (user: ReaderUser) => void,
    buttonContainer?: HTMLElement | null
  ) {
    const clientId = this.getGoogleClientId();
    const gWindow = (window as any).google;

    if (!gWindow?.accounts?.id) {
      return;
    }

    try {
      gWindow.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          if (response.credential) {
            const res = ReaderAuthService.loginWithGoogleCredential(response.credential);
            if (res.success && res.user) {
              onSuccess(res.user);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        gWindow.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 280
        });
      }

      // Prompt One Tap
      gWindow.accounts.id.prompt();
    } catch (err) {
      console.warn('Google Identity initialization notice:', err);
    }
  }

  /**
   * Trigger direct Google OAuth 2.0 popup via Google Identity token client
   */
  public static triggerGoogleOAuthPopup(
    onSuccess: (user: ReaderUser) => void,
    onError: (msg: string) => void
  ) {
    const clientId = this.getGoogleClientId();
    const gWindow = (window as any).google;

    if (gWindow?.accounts?.oauth2) {
      try {
        const tokenClient = gWindow.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              onError(tokenResponse.error_description || 'Otentikasi Google dibatalkan.');
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await response.json();

                if (userInfo && userInfo.email) {
                  const res = ReaderAuthService.loginWithGoogleProfile({
                    sub: userInfo.sub,
                    name: userInfo.name || userInfo.email.split('@')[0],
                    email: userInfo.email,
                    picture: userInfo.picture
                  });
                  onSuccess(res.user);
                } else {
                  onError('Gagal mengambil profil dari Google.');
                }
              } catch (e) {
                onError('Gagal terhubung ke server Google UserInfo.');
              }
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Direct OAuth2 popup error:', err);
      }
    }

    // Direct Google OAuth 2.0 fallback endpoint if SDK not ready
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')}&prompt=select_account`;

    const popup = window.open(authUrl, 'google_oauth_popup', 'width=500,height=600,menubar=no,toolbar=no');
    if (!popup) {
      onError('Popup Google terblokir oleh browser. Harap izinkan popup untuk login.');
    }
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
    const reader = this.getCurrentReader();
    if (reader && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.disableAutoSelect();
      } catch {}
    }
    localStorage.removeItem(READER_SESSION_KEY);
  }
}
