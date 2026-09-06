import type { Article, TechIndexItem } from '../types/news';
import { ARTICLES, TECH_INDEXES } from '../data/mockNews';
import { AuthService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const API_HEALTH_URL = import.meta.env.VITE_API_HEALTH_URL || (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '/health') : '/health');

export class ApiService {
  public static isBackendAvailable = false;

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

  // Fetch Articles from Go Backend or Fallback Dataset
  public static async getArticles(category?: string, search?: string): Promise<Article[]> {
    if (this.isBackendAvailable) {
      try {
        const url = new URL(`${API_BASE_URL}/articles`);
        if (category && category !== 'all') url.searchParams.append('category', category);
        if (search) url.searchParams.append('search', search);

        const res = await fetch(url.toString());
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Backend API request failed, falling back to local dataset.', err);
      }
    }
    return ARTICLES;
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
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(article)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to post article to Go Backend', err);
      }
    }
    return false;
  }

  // Update Article via Go Backend (Protected Endpoint)
  public static async updateArticle(id: string, article: Partial<Article>): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(article)
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to update article on Go Backend', err);
      }
    }
    return false;
  }

  // Delete Article via Go Backend (Protected Endpoint)
  public static async deleteArticle(id: string): Promise<boolean> {
    if (this.isBackendAvailable) {
      try {
        const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to delete article on Go Backend', err);
      }
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
}

