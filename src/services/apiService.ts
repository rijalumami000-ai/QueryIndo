import type { Article, TechIndexItem, AuthorProfile } from '../types/news';
import type { AdCampaign } from '../components/AdBanner';
import type { ShoppingProduct, ShoppingWidgetConfig } from '../components/ShoppingCarousel';
import type { PollData } from '../components/ReaderPoll';
import type { CommentItem } from '../components/ReaderComments';
import type { SocialLink } from './socialMediaService';
import { TECH_INDEXES } from '../data/mockNews';
import { AuthService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_HEALTH_URL = import.meta.env.VITE_API_HEALTH_URL || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '/health') : '/health');

export class ApiService {
  public static isBackendAvailable = true;

  // Check Backend Server Health
  public static async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(API_HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.isBackendAvailable = true;
        return true;
      }
    } catch {
      this.isBackendAvailable = false;
    }
    return false;
  }

  // Fetch Articles from Go Backend
  public static async getArticles(category?: string, search?: string): Promise<Article[]> {
    try {
      const url = new URL(`${API_BASE_URL}/articles`, window.location.origin);
      if (category && category !== 'all') url.searchParams.append('category', category);
      if (search) url.searchParams.append('search', search);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.isBackendAvailable = true;
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend API request failed.', err);
      this.isBackendAvailable = false;
    }
    return [];
  }

  // Fetch Tech Indexes from Go Backend or Fallback Dataset
  public static async getTechIndexes(): Promise<TechIndexItem[]> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/tech-indexes`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Backend Tech Indexes API failed, falling back to mock dataset.', err);
      }
    }
    return TECH_INDEXES;
  }

  // Helper to build headers with JWT Authorization if available
  private static getAuthHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = AuthService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Create Article via Go Backend (Protected Endpoint)
  public static async createArticle(article: Article): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(article)
      });
      if (res.ok) this.isBackendAvailable = true;
      return res.ok;
    } catch (err) {
      console.error('Failed to post article to Go Backend', err);
      this.isBackendAvailable = false;
    }
    return false;
  }

  // Update Article via Go Backend (Protected Endpoint)
  public static async updateArticle(id: string, article: Partial<Article>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(article)
      });
      if (res.ok) this.isBackendAvailable = true;
      return res.ok;
    } catch (err) {
      console.error('Failed to update article on Go Backend', err);
      this.isBackendAvailable = false;
    }
    return false;
  }

  // Delete Article via Go Backend (Protected Endpoint)
  public static async deleteArticle(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (res.ok) this.isBackendAvailable = true;
      return res.ok;
    } catch (err) {
      console.error('Failed to delete article on Go Backend', err);
      this.isBackendAvailable = false;
    }
    return false;
  }

  // Ask ByteAI Assistant (RAG Chatbot with Rate Limiting)
  public static async askByteAI(message: string): Promise<string> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.reply) {
            return json.reply;
          }
        } else if (res.status === 429) {
          return 'Mohon tunggu sebentar, permintaan AI sedang dibatasi untuk menjaga performa server.';
        }
      } catch (err) {
        console.warn('Backend ByteAI chat API failed, falling back to local fallback.', err);
      }
    }
    return '';
  }

  // Subscribe Email to Newsletter with backend sync & persistent local storage
  public static async subscribeNewsletter(email: string): Promise<string> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      return 'Format alamat email tidak valid (contoh: user@domain.com)';
    }

    // Persist locally in queryindo_newsletter_subscribers
    try {
      const localSubs: Array<{ email: string; date: string }> = JSON.parse(localStorage.getItem('queryindo_newsletter_subscribers') || '[]');
      const alreadyExists = localSubs.some(s => s.email === trimmed);
      if (!alreadyExists) {
        localSubs.push({ email: trimmed, date: new Date().toISOString() });
        localStorage.setItem('queryindo_newsletter_subscribers', JSON.stringify(localSubs));
      } else if (!this.isBackendAvailable) {
        return 'Alamat email Anda sudah terdaftar dalam langganan newsletter QUERYINDO!';
      }
    } catch {}

    // Sync to Go Backend if available
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed })
        });
        const json = await res.json();
        if (json.message) return json.message;
      } catch (err) {
        console.warn('Newsletter subscription API sync failed, stored locally.', err);
      }
    }

    return 'Terima kasih! Alamat email Anda berhasil terdaftar di newsletter harian QUERYINDO.';
  }

  // Get list of newsletter subscribers (Protected)
  public static async getSubscribers(): Promise<Array<{ id?: string | number; email: string; createdAt?: string; date?: string; is_active?: boolean }>> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/newsletter/subscribers`, {
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch subscribers from backend, reading local storage.', err);
      }
    }

    try {
      const localSubs: Array<{ email: string; date: string }> = JSON.parse(localStorage.getItem('queryindo_newsletter_subscribers') || '[]');
      return localSubs.map(s => ({
        email: s.email,
        createdAt: s.date,
        is_active: true
      }));
    } catch {
      return [];
    }
  }

  // Delete subscriber by ID or Email
  public static async deleteSubscriber(idOrEmail: string | number): Promise<{ success: boolean; message: string }> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/newsletter/subscribers/${encodeURIComponent(String(idOrEmail))}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        const json = await res.json();
        return {
          success: json.success ?? res.ok,
          message: json.message || 'Pelanggan berhasil dihapus'
        };
      } catch (err) {
        return { success: false, message: 'Gagal terhubung ke server untuk menghapus pelanggan' };
      }
    }
    return { success: true, message: 'Pelanggan berhasil dihapus dari simulasi lokal' };
  }

  // Send Broadcast Newsletter Blast (Protected)
  public static async broadcastNewsletter(payload: {
    subject?: string;
    headline?: string;
    articles: Array<{
      title: string;
      category: string;
      excerpt?: string;
      url: string;
      imageUrl?: string;
      readTime?: string;
    }>;
  }): Promise<{ success: boolean; message: string; recipients_count?: number }> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/newsletter/broadcast`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        return {
          success: json.success ?? res.ok,
          message: json.message || (res.ok ? 'Broadcast berhasil diproses.' : 'Gagal mengirim broadcast.'),
          recipients_count: json.recipients_count
        };
      } catch (err) {
        return { success: false, message: 'Gagal terhubung ke backend untuk pengiriman broadcast.' };
      }
    }
    return {
      success: true,
      message: '[Simulasi Lokal] Broadcast disiapkan dan diproses secara virtual (koneksi backend offline).',
      recipients_count: 1
    };
  }

  // =========================================================================
  // Authors (Dewan Redaksi) API Methods
  // =========================================================================
  public static async getAuthors(): Promise<AuthorProfile[] | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/authors`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch authors from backend', err);
      }
    }
    return null;
  }

  public static async createAuthor(author: Partial<AuthorProfile>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/authors`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(author)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to create author on backend', err);
      }
    }
    return false;
  }

  public static async updateAuthor(id: string, author: Partial<AuthorProfile>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/authors/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(author)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to update author on backend', err);
      }
    }
    return false;
  }

  public static async deleteAuthor(id: string): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/authors/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to delete author on backend', err);
      }
    }
    return false;
  }

  // =========================================================================
  // Ads (Kemitraan & Iklan) API Methods
  // =========================================================================
  public static async getAds(placement?: string): Promise<AdCampaign[] | null> {
    if (this.isBackendAvailable) {
      try {
        const url = new URL(`${API_BASE_URL}/ads`, window.location.origin);
        if (placement && placement !== 'all') url.searchParams.append('placement', placement);
        const res = await fetch(url.toString());
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch ads from backend', err);
      }
    }
    return null;
  }

  public static async createAd(ad: Partial<AdCampaign>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/ads`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(ad)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to create ad on backend', err);
      }
    }
    return false;
  }

  public static async updateAd(id: string, ad: Partial<AdCampaign>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/ads/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(ad)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to update ad on backend', err);
      }
    }
    return false;
  }

  public static async deleteAd(id: string): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/ads/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to delete ad on backend', err);
      }
    }
    return false;
  }

  // =========================================================================
  // Shopping (Rekomendasi Belanja) API Methods
  // =========================================================================
  public static async getShoppingData(): Promise<{ config?: ShoppingWidgetConfig; products?: ShoppingProduct[] } | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopping`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch shopping data from backend', err);
      }
    }
    return null;
  }

  public static async saveShoppingConfig(config: Partial<ShoppingWidgetConfig>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopping/config`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(config)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to save shopping config on backend', err);
      }
    }
    return false;
  }

  public static async createShoppingProduct(prod: Partial<ShoppingProduct>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopping/products`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(prod)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to create shopping product on backend', err);
      }
    }
    return false;
  }

  public static async updateShoppingProduct(id: string, prod: Partial<ShoppingProduct>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopping/products/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(prod)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to update shopping product on backend', err);
      }
    }
    return false;
  }

  public static async deleteShoppingProduct(id: string): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/shopping/products/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to delete shopping product on backend', err);
      }
    }
    return false;
  }

  // =========================================================================
  // Poll (Jajak Pendapat) API Methods
  // =========================================================================
  public static async getPoll(): Promise<PollData | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/poll`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch poll from backend', err);
      }
    }
    return null;
  }

  public static async votePoll(optionId: string): Promise<PollData | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/poll/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionId })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.error('Failed to submit poll vote to backend', err);
      }
    }
    return null;
  }

  // =========================================================================
  // Article Engagement (Likes & Views Counter)
  // =========================================================================
  public static async likeArticle(id: string, action: 'like' | 'unlike' = 'like', readerId?: string): Promise<number | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, readerId })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && typeof json.likesCount === 'number') {
            return json.likesCount;
          }
        }
      } catch (err) {
        console.warn('Gagal sinkronisasi like artikel ke server:', err);
      }
    }
    return null;
  }


  public static async viewArticle(id: string): Promise<number | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles/${id}/view`, { method: 'POST' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && typeof json.viewsCount === 'number') {
            return json.viewsCount;
          }
        }
      } catch (err) {
        console.warn('Gagal mencatat view artikel ke server:', err);
      }
    }
    return null;
  }

  // =========================================================================
  // Reader Comments API Methods
  // =========================================================================
  public static async getComments(articleId: string): Promise<CommentItem[] | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles/${articleId}/comments`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn(`Gagal mengambil komentar untuk artikel ${articleId} dari server:`, err);
      }
    }
    return null;
  }

  public static async postComment(
    articleId: string,
    payload: { authorName: string; authorRole?: string; avatar?: string; content: string; parentId?: string | null }
  ): Promise<CommentItem | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles/${articleId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.error('Gagal mengirim komentar ke server:', err);
      }
    }
    return null;
  }

  public static async likeComment(commentId: string): Promise<number | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, { method: 'POST' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && typeof json.likesCount === 'number') {
            return json.likesCount;
          }
        }
      } catch (err) {
        console.warn('Gagal menyukai komentar di server:', err);
      }
    }
    return null;
  }

  public static async deleteComment(commentId: string): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const json = await res.json();
          return json.success === true;
        }
      } catch (err) {
        console.error('Gagal menghapus komentar di server:', err);
      }
    }
    return false;
  }

  // =========================================================================
  // Official Social Media Channels (CRUD)
  // =========================================================================
  public static async getSocialLinks(activeOnly = false): Promise<SocialLink[] | null> {
    if (this.isBackendAvailable) {
      try {
        const url = new URL(`${API_BASE_URL}/social-links`, window.location.origin);
        if (activeOnly) url.searchParams.append('active_only', 'true');
        const res = await fetch(url.toString());
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Gagal mengambil data media sosial dari backend:', err);
      }
    }
    return null;
  }

  public static async createSocialLink(link: Partial<SocialLink>): Promise<SocialLink | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/social-links`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(link)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.error('Gagal menambahkan media sosial di server:', err);
      }
    }
    return null;
  }

  public static async updateSocialLink(id: string, payload: Partial<SocialLink>): Promise<SocialLink | null> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/social-links/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return json.data;
          }
        }
      } catch (err) {
        console.error('Gagal memperbarui media sosial di server:', err);
      }
    }
    return null;
  }

  public static async deleteSocialLink(id: string): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/social-links/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        if (res.ok) {
          const json = await res.json();
          return json.success === true;
        }
      } catch (err) {
        console.error('Gagal menghapus media sosial di server:', err);
      }
    }
    return false;
  }

  // Translate Article via Backend Gemini Proxy
  public static async translateArticle(payload: {
    title: string;
    subtitle: string;
    aiSummary: string[];
    targetLang: string;
  }): Promise<{ success: boolean; title: string; subtitle: string; aiSummary: string[] } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return json;
        }
      }
    } catch (err) {
      console.warn('Backend translation API failed:', err);
    }
    return null;
  }

  // Change Password via Go Backend
  public static async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      return { success: res.ok && data.success, message: data.message || (res.ok ? 'Kata sandi berhasil diperbarui!' : 'Gagal memperbarui sandi.') };
    } catch (err: any) {
      return { success: false, message: 'Tidak dapat menghubungi server: ' + (err?.message || 'Koneksi gagal') };
    }
  }

  // Get Admin Users from Database
  public static async getAdminUsers(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          return data.users;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat pengguna admin dari backend:', err);
    }
    return [];
  }

  // Create Admin User in Database
  public static async createAdminUser(data: { email: string; fullName: string; password: string; role?: string }): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email: data.email,
          full_name: data.fullName,
          password: data.password,
          role: data.role || 'editor'
        })
      });
      const json = await res.json();
      return { success: res.ok && json.success, message: json.message || '', user: json.user };
    } catch (err: any) {
      return { success: false, message: 'Gagal menghubungi server: ' + (err?.message || '') };
    }
  }

  // Delete Admin User in Database
  public static async deleteAdminUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      const json = await res.json();
      return { success: res.ok && json.success, message: json.message || '' };
    } catch (err: any) {
      return { success: false, message: 'Gagal menghapus pengguna di server: ' + (err?.message || '') };
    }
  }
}


