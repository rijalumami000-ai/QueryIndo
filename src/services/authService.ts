export interface AuthUser {
  username: string;
  fullName: string;
  role: string;
  avatar: string;
  token: string;
}

const TOKEN_KEY = 'byte_jwt_token';
const USER_KEY = 'byte_user_session';
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

    // 2. Offline Fallback Authentication
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
