import type { Article, Category, AuthorProfile } from '../types/news';
import { CATEGORIES } from '../data/mockNews';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export class ApiService {
  /**
   * Mengambil semua artikel (dengan fallback ke mock data jika backend Go offline)
   */
  public static async getArticles(category?: string, limit: number = 30): Promise<Article[]> {
    try {
      const url = new URL(`${API_BASE}/articles`);
      if (category && category !== 'all') {
        url.searchParams.set('category', category);
      }
      url.searchParams.set('limit', limit.toString());

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        // Short timeout for fast serverless/SSR response
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Backend offline or error
    }

    return [];
  }

  /**
   * Mengambil detail artikel berdasarkan slug
   */
  public static async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          return json.data;
        }
      }
    } catch {
      // Backend offline or error
    }

    return null;
  }

  /**
   * Mengambil daftar kategori
   */
  public static async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }
    return CATEGORIES;
  }
}
