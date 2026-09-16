import type { Article } from '../types/news';
import { ArticleService } from '../services/articleService';
import { ImageUtils } from './imageUtils';

export function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function slugifyTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calculateReadTime(content?: string, fallback: number = 4): number {
  if (!content) return fallback;
  const clean = content.replace(/<[^>]*>/g, ' ').trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(dateStr: string, language: 'id' | 'en' = 'id'): string {
  try {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', options);
  } catch {
    return dateStr;
  }
}

export function getSafeImageUrl(url?: string): string {
  return ImageUtils.normalizeImageUrl(url || '') || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
}

export const IMG_ONERROR = `onerror="if(this.dataset.tried!=='1'&&this.src.includes('lh3.googleusercontent.com/d/')){this.dataset.tried='1';const id=this.src.split('/d/')[1];if(id){this.src='https://drive.google.com/thumbnail?id='+id+'&sz=w1200';return;}}this.onerror=null;this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';"`;

export function findArticleBySlugOrId(idOrSlug: string): Article | undefined {
  return ArticleService.getArticleBySlugOrId(idOrSlug);
}

export interface ReadingHistoryItem {
  articleId: string;
  title: string;
  category: string;
  imageUrl: string;
  readTimeMinutes: number;
  readAt: string;
}

export function addReadingHistory(article: Article): void {
  try {
    let history: ReadingHistoryItem[] = JSON.parse(localStorage.getItem('byte_reading_history') || '[]');
    history = history.filter(h => h.articleId !== article.id);
    history.unshift({
      articleId: article.id,
      title: article.title,
      category: article.category,
      imageUrl: article.imageUrl,
      readTimeMinutes: article.readTimeMinutes,
      readAt: new Date().toISOString()
    });
    if (history.length > 40) history = history.slice(0, 40);
    localStorage.setItem('byte_reading_history', JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save reading history', e);
  }
}
