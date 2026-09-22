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

/**
 * Sanitizes rich article HTML to prevent Stored XSS attacks.
 * Strips out script tags, unauthorized iframes, inline event handlers (on*), and javascript: URIs.
 */
export function sanitizeArticleHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirtyHtml, 'text/html');

    // 1. Remove dangerous executable elements
    const dangerousTags = ['script', 'style', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'base'];
    dangerousTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    // 2. Sanitize iframes (allow only trusted embeds like YouTube / Vimeo)
    doc.querySelectorAll('iframe').forEach(iframe => {
      const src = (iframe.getAttribute('src') || '').toLowerCase();
      const isAllowedVideo = src.includes('youtube.com/embed/') || 
                             src.includes('youtube-nocookie.com/embed/') || 
                             src.includes('player.vimeo.com/');
      if (!isAllowedVideo) {
        iframe.remove();
      } else {
        Array.from(iframe.attributes).forEach(attr => {
          if (!['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title'].includes(attr.name.toLowerCase())) {
            iframe.removeAttribute(attr.name);
          }
        });
      }
    });

    // 3. Clean all elements of on* attributes and javascript: URIs
    const allElements = doc.body.querySelectorAll('*');
    allElements.forEach(el => {
      const attrs = Array.from(el.attributes);
      attrs.forEach(attr => {
        const attrName = attr.name.toLowerCase();
        const attrVal = (attr.value || '').trim().toLowerCase();

        // Strip inline event handlers (onclick, onerror, onload, etc.)
        if (attrName.startsWith('on')) {
          el.removeAttribute(attr.name);
        }

        // Strip dangerous URI schemes
        if (['href', 'src', 'action', 'data'].includes(attrName)) {
          if (attrVal.startsWith('javascript:') || attrVal.startsWith('vbscript:') || (attrVal.startsWith('data:') && !attrVal.startsWith('data:image/'))) {
            el.removeAttribute(attr.name);
          }
        }
      });
    });

    return doc.body.innerHTML;
  } catch {
    return dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, '')
      .replace(/javascript:[^"']*/gi, '');
  }
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
  if (typeof fallback === 'number' && fallback > 0) return fallback;
  if (!content) return 4;
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
  const fallback = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  const normalized = ImageUtils.normalizeImageUrl(url || '');
  if (!normalized || /["'<>\s]/.test(normalized)) return fallback;
  if (normalized.startsWith('/')) return normalized;
  if (normalized.startsWith('data:image/') || normalized.startsWith('blob:')) return normalized;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

// Image failures are handled with DOM listeners so CSP can forbid inline
// event-handler attributes.
export const IMG_ONERROR = '';

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
