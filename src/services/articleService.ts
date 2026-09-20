import type { Article } from '../types/news';
import { ApiService } from './apiService';
import { ImageUtils } from '../utils/imageUtils';

const STORAGE_KEY = 'queryindo_articles_v3';
export const DUMMY_IDS = new Set([
  'art-001', 'art-002', 'art-003', 'art-004', 'art-005', 'art-006',
  'art-007', 'art-008', 'art-009', 'art-010', 'art-011', 'art-012',
  'art-013', 'art-014', 'art-015', 'art-016', 'art-017', 'art-018',
  'art-official-01', 'art-official-02', 'art-official-03',
  'art-official-04', 'art-official-05', 'art-official-06'
]);

export function isMockArticleId(id: string): boolean {
  if (!id) return true;
  if (id.startsWith('art-official-')) return true;
  return DUMMY_IDS.has(id);
}

// Clear old cache keys & purge any mock articles from existing local storage
try {
  localStorage.removeItem('queryindo_articles_v2');
  localStorage.removeItem('byteindonesia_articles');

  const rawOld = localStorage.getItem(STORAGE_KEY);
  if (rawOld) {
    const parsed = JSON.parse(rawOld);
    if (Array.isArray(parsed)) {
      const sanitized = parsed.filter(a => a && a.id && !isMockArticleId(a.id));
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      }
    }
  }
} catch {}

export class ArticleService {
  private static cachedArticles: Article[] | null = null;

  public static getArticles(): Article[] {
    if (this.cachedArticles !== null) {
      return this.cachedArticles;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.cachedArticles = parsed
            .filter(a => a && a.id && !isMockArticleId(a.id))
            .map(a => ({
              ...a,
              imageUrl: ImageUtils.normalizeImageUrl(a.imageUrl || '')
            }));
          return this.cachedArticles;
        }
      } catch {}
    }

    this.cachedArticles = [];
    return this.cachedArticles;
  }

  public static saveArticles(articles: Article[]): void {
    const cleanArticles = (articles || [])
      .filter(a => a && a.id && !isMockArticleId(a.id))
      .map(a => ({
        ...a,
        imageUrl: ImageUtils.normalizeImageUrl(a.imageUrl || '')
      }));
    this.cachedArticles = cleanArticles;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanArticles));
    } catch (err) {
      console.warn('Gagal menyimpan cache artikel ke localStorage:', err);
    }
  }

  public static async syncWithBackend(): Promise<Article[]> {
    try {
      const serverArticles = await ApiService.getArticles();
      if (Array.isArray(serverArticles) && serverArticles.length > 0) {
        this.saveArticles(serverArticles);
        return this.cachedArticles || [];
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data artikel dari server:', err);
    }
    return this.cachedArticles || [];
  }

  public static getArticleById(id: string): Article | undefined {
    return this.getArticles().find(a => a.id === id);
  }

  public static getArticleBySlugOrId(idOrSlug: string): Article | undefined {
    if (!idOrSlug) return undefined;
    const decoded = decodeURIComponent(idOrSlug).trim().replace(/^\/+/, '').replace(/^(article|berita)\//, '');
    const cleanSlug = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const normalizeAlphaNum = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const targetDecoded = decoded.toLowerCase();
    const targetClean = cleanSlug(decoded);
    const targetNorm = normalizeAlphaNum(decoded);

    return this.getArticles().find(a => {
      if (!a) return false;
      const aId = (a.id || '').toLowerCase();
      const aSlug = (a.slug || '').toLowerCase();
      const aTitle = (a.title || '').toLowerCase();

      return (
        aId === targetDecoded ||
        aSlug === targetDecoded ||
        aSlug === targetClean ||
        cleanSlug(aTitle) === targetClean ||
        (targetNorm.length > 3 && (
          normalizeAlphaNum(aId) === targetNorm ||
          normalizeAlphaNum(aSlug) === targetNorm ||
          normalizeAlphaNum(aTitle) === targetNorm
        ))
      );
    });
  }

  public static async createArticle(article: Article): Promise<Article> {
    article.imageUrl = ImageUtils.normalizeImageUrl(article.imageUrl || '');

    // 1. Persist to PostgreSQL backend first
    const ok = await ApiService.createArticle(article);
    if (!ok) {
      throw new Error('Gagal menyimpan artikel ke server PostgreSQL. Pastikan Anda terhubung dan memiliki sesi admin yang valid.');
    }

    // 2. Update local state and cache upon successful backend confirmation
    const list = [...this.getArticles()];
    list.unshift(article);
    this.saveArticles(list);
    return article;
  }

  public static async updateArticle(id: string, updated: Partial<Article>): Promise<boolean> {
    if (updated.imageUrl) {
      updated.imageUrl = ImageUtils.normalizeImageUrl(updated.imageUrl);
    }

    // 1. Persist to PostgreSQL backend first
    const ok = await ApiService.updateArticle(id, updated);
    if (!ok) {
      throw new Error('Gagal memperbarui artikel di server PostgreSQL. Pastikan Anda terhubung dan memiliki sesi admin yang valid.');
    }

    // 2. Update local state and cache upon successful backend confirmation
    const list = [...this.getArticles()];
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updated };
      this.saveArticles(list);
    }
    return true;
  }

  public static async deleteArticle(id: string): Promise<boolean> {
    // 1. Delete from PostgreSQL backend first
    const ok = await ApiService.deleteArticle(id);
    if (!ok) {
      throw new Error('Gagal menghapus artikel di server PostgreSQL. Pastikan Anda terhubung dan memiliki sesi admin yang valid.');
    }

    // 2. Update local state and cache upon successful backend confirmation
    const list = [...this.getArticles()];
    const filtered = list.filter(a => a.id !== id);
    this.saveArticles(filtered);
    return true;
  }
}
