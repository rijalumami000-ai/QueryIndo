import { findArticleBySlugOrId, slugifyTitle } from '../utils/helpers';
import { InstitutionalPages } from '../components/InstitutionalPages';

export type RouteType = 'home' | 'admin' | 'article' | 'page' | 'category';

export interface RouteMatch {
  type: RouteType;
  param?: string;
  rawPath: string;
}

export type RouteListener = (route: RouteMatch) => void;

export class Router {
  private static listeners: Set<RouteListener> = new Set();
  private static isInitialized = false;

  public static subscribe(listener: RouteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Handle initial route
    this.handleRouting();

    // Listen to browser navigation
    window.addEventListener('popstate', () => this.handleRouting());
    window.addEventListener('hashchange', () => this.handleRouting());

    // Intercept clicks on links with data-route or relative internal links
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Handle data-route or internal paths
      if (href.startsWith('/') && !href.startsWith('/api') && !href.startsWith('/health')) {
        e.preventDefault();
        this.navigateTo(href);
      } else if (href.startsWith('#') && href.length > 1) {
        // Smoothly migrate hash clicks (e.g. #page/tentang-kami -> /page/tentang-kami)
        if (href.startsWith('#admin')) {
          e.preventDefault();
          this.navigateTo('/admin');
        } else if (href.startsWith('#page/')) {
          e.preventDefault();
          this.navigateTo(href.replace('#page/', '/page/'));
        } else if (href.startsWith('#article/')) {
          e.preventDefault();
          this.navigateTo(href.replace('#article/', '/berita/'));
        } else if (href.startsWith('#category/')) {
          e.preventDefault();
          this.navigateTo(href.replace('#category/', '/kategori/'));
        }
      }
    });
  }

  public static navigateTo(path: string, options: { replace?: boolean } = {}): void {
    if (options.replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    this.handleRouting();
  }

  public static navigateHome(): void {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      window.history.pushState(null, '', '/');
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    this.handleRouting();
  }

  public static navigateToArticle(slugOrId: string, title?: string): void {
    const slug = title ? slugifyTitle(title) : slugOrId;
    this.navigateTo(`/berita/${slug}`);
  }

  public static navigateToPage(pageId: string): void {
    this.navigateTo(`/page/${pageId}`);
  }

  public static navigateToCategory(category: string): void {
    this.navigateTo(`/kategori/${category}`);
  }

  public static navigateToAdmin(): void {
    this.navigateTo('/admin');
  }

  public static handleRouting(): void {
    const hash = window.location.hash;
    const rawPath = window.location.pathname;
    let path = decodeURIComponent(rawPath).replace(/^\/+/, '');

    // 1. Backwards compatibility migration for Hash-based links
    if (hash) {
      if (hash.startsWith('#admin')) {
        window.history.replaceState(null, '', '/admin');
        path = 'admin';
      } else if (hash.startsWith('#article/')) {
        const artParam = hash.replace('#article/', '');
        window.history.replaceState(null, '', `/berita/${artParam}`);
        path = `berita/${artParam}`;
      } else if (hash.startsWith('#page/')) {
        const pageParam = hash.replace('#page/', '');
        window.history.replaceState(null, '', `/page/${pageParam}`);
        path = `page/${pageParam}`;
      } else if (hash.startsWith('#category/')) {
        const catParam = hash.replace('#category/', '');
        window.history.replaceState(null, '', `/kategori/${catParam}`);
        path = `kategori/${catParam}`;
      }
    }

    // 2. Parse Clean URL Route
    let routeMatch: RouteMatch = { type: 'home', rawPath: path };

    if (!path || path === 'index.html') {
      routeMatch = { type: 'home', rawPath: '/' };
    } else if (path === 'admin') {
      routeMatch = { type: 'admin', rawPath: '/admin' };
    } else if (path.startsWith('berita/') || path.startsWith('article/')) {
      const slugOrId = path.replace(/^(berita|article)\//, '');
      routeMatch = { type: 'article', param: slugOrId, rawPath: `/${path}` };
    } else if (path.startsWith('page/') || path.startsWith('halaman/')) {
      const pageId = path.replace(/^(page|halaman)\//, '');
      if (InstitutionalPages.isValidPageId(pageId)) {
        routeMatch = { type: 'page', param: pageId, rawPath: `/${path}` };
      }
    } else if (path.startsWith('kategori/') || path.startsWith('category/')) {
      const category = path.replace(/^(kategori|category)\//, '');
      routeMatch = { type: 'category', param: category, rawPath: `/${path}` };
    } else if (!path.startsWith('api/') && !path.startsWith('health')) {
      // Direct title slug fallback e.g. /Indonesia-Resmi-Operasikan-Pusat-Data...
      const matchedArticle = findArticleBySlugOrId(path);
      if (matchedArticle) {
        routeMatch = { type: 'article', param: matchedArticle.slug || matchedArticle.id, rawPath: `/${path}` };
      } else {
        routeMatch = { type: 'home', rawPath: '/' };
      }
    }

    // Notify all route listeners
    this.listeners.forEach(listener => {
      try {
        listener(routeMatch);
      } catch (err) {
        console.error('Error in route listener:', err);
      }
    });
  }
}
