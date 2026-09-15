import type { Article } from '../types/news';
import { ApiService } from './apiService';

const STORAGE_KEY = 'queryindo_articles_v2';

export class ArticleService {
  private static cachedArticles: Article[] | null = null;

  public static getArticles(): Article[] {
    if (this.cachedArticles !== null) {
      return this.cachedArticles;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      this.cachedArticles = [];
      return this.cachedArticles;
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.cachedArticles = parsed;
        return this.cachedArticles;
      }
      this.cachedArticles = [];
      return this.cachedArticles;
    } catch {
      this.cachedArticles = [];
      return this.cachedArticles;
    }
  }

  public static saveArticles(articles: Article[]): void {
    this.cachedArticles = articles;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (err) {
      console.warn('Gagal menyimpan cache artikel ke localStorage:', err);
    }
  }

  public static async syncWithBackend(): Promise<void> {
    try {
      const serverArticles = await ApiService.getArticles();
      if (Array.isArray(serverArticles)) {
        this.saveArticles(serverArticles);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data artikel dari server:', err);
    }
  }

  public static getArticleById(id: string): Article | undefined {
    return this.getArticles().find(a => a.id === id);
  }

  public static getArticleBySlugOrId(idOrSlug: string): Article | undefined {
    if (!idOrSlug) return undefined;
    const decoded = decodeURIComponent(idOrSlug).trim().replace(/^\/+/, '').replace(/^article\//, '');
    const cleanSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.getArticles().find(a =>
      a.id === decoded ||
      a.slug === decoded ||
      a.slug.toLowerCase() === decoded.toLowerCase() ||
      cleanSlug(a.title) === decoded.toLowerCase()
    );
  }

  public static async createArticle(article: Article): Promise<Article> {
    const list = [...this.getArticles()];
    list.unshift(article);
    this.saveArticles(list);
    await ApiService.createArticle(article).catch(() => {});
    return article;
  }

  public static async updateArticle(id: string, updated: Partial<Article>): Promise<boolean> {
    const list = [...this.getArticles()];
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return false;

    list[idx] = { ...list[idx], ...updated };
    this.saveArticles(list);
    await ApiService.updateArticle(id, updated).catch(() => {});
    return true;
  }

  public static async deleteArticle(id: string): Promise<boolean> {
    const list = [...this.getArticles()];
    const filtered = list.filter(a => a.id !== id);
    if (filtered.length === list.length) return false;

    this.saveArticles(filtered);
    await ApiService.deleteArticle(id).catch(() => {});
    return true;
  }
}
