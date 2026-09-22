import { findArticleBySlugOrId, slugifyTitle } from '../utils/helpers';
import { InstitutionalPages } from '../components/InstitutionalPages';
import { findSubCategory, getCategoryBySlug, getCategoryById } from '../data/mockNews';

export type RouteType = 'home' | 'admin' | 'article' | 'page' | 'category' | 'subcategory';

export interface RouteMatch {
  type: RouteType;
  param?: string;
  subParam?: string;
  category?: string;
  subCategory?: string;
  articleSlug?: string;
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
      if (
        href.startsWith('/') && 
        !href.startsWith('/api') && 
        !href.startsWith('/health') &&
        !href.endsWith('.xml') &&
        !href.endsWith('.json') &&
        !href.endsWith('.txt') &&
        !href.endsWith('.pdf') &&
        target.getAttribute('target') !== '_blank'
      ) {
        e.preventDefault();
        this.navigateTo(href);
      } else if (href.startsWith('#') && href.length > 1) {
        // Smoothly migrate hash clicks
        if (href.startsWith('#admin')) {
          e.preventDefault();
          this.navigateTo('/admin');
        } else if (href.startsWith('#page/')) {
          e.preventDefault();
          this.navigateTo(href.replace('#page/', '/page/'));
        } else if (href.startsWith('#article/')) {
          e.preventDefault();
          this.navigateTo(href.replace('#article/', '/berita/'));
        } else if (href.startsWith('#subcategory/')) {
          e.preventDefault();
          const parts = href.replace('#subcategory/', '').split('/');
          if (parts.length >= 2) {
            this.navigateTo(`/${parts[0]}/${parts[1]}`);
          }
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

  public static navigateToArticle(slugOrId: string, title?: string, category?: string, subCategory?: string): void {
    if (!slugOrId && !title) return;
    let target = slugOrId;
    if (!target || target.startsWith('art-')) {
      target = title ? slugifyTitle(title) : (slugOrId || '');
    } else {
      target = slugifyTitle(target);
    }

    if (category && subCategory) {
      this.navigateTo(`/${category}/${subCategory}/${target}`);
    } else {
      this.navigateTo(`/berita/${target}`);
    }
  }

  public static navigateToPage(pageId: string): void {
    this.navigateTo(`/page/${pageId}`);
  }

  public static navigateToCategory(category: string): void {
    this.navigateTo(`/kategori/${category}`);
  }

  public static navigateToSubCategory(category: string, subCategory: string): void {
    this.navigateTo(`/${category}/${subCategory}`);
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
      } else if (hash.startsWith('#subcategory/')) {
        const parts = hash.replace('#subcategory/', '').split('/');
        if (parts.length >= 2) {
          window.history.replaceState(null, '', `/${parts[0]}/${parts[1]}`);
          path = `${parts[0]}/${parts[1]}`;
        }
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
      routeMatch = { type: 'article', param: slugOrId, articleSlug: slugOrId, rawPath: `/${path}` };
    } else if (path.startsWith('page/') || path.startsWith('halaman/')) {
      const pageId = path.replace(/^(page|halaman)\//, '');
      if (InstitutionalPages.isValidPageId(pageId)) {
        routeMatch = { type: 'page', param: pageId, rawPath: `/${path}` };
      }
    } else {
      // Split path segments
      // Strip optional leading 'kategori/' or 'category/'
      const normalizedPath = path.replace(/^(kategori|category)\//, '');
      const segments = normalizedPath.split('/').filter(Boolean);

      if (segments.length === 1) {
        const catOrSlug = segments[0];
        const matchedCategory = getCategoryBySlug(catOrSlug) || getCategoryById(catOrSlug);
        if (matchedCategory) {
          routeMatch = {
            type: 'category',
            param: matchedCategory.id,
            category: matchedCategory.id,
            rawPath: `/${path}`
          };
        } else {
          // Direct title slug fallback e.g. /Indonesia-Resmi-Operasikan-Pusat-Data...
          const matchedArticle = findArticleBySlugOrId(path);
          if (matchedArticle) {
            routeMatch = {
              type: 'article',
              param: matchedArticle.slug || matchedArticle.id,
              articleSlug: matchedArticle.slug || matchedArticle.id,
              category: matchedArticle.category,
              subCategory: matchedArticle.subCategory,
              rawPath: `/${path}`
            };
          } else {
            routeMatch = { type: 'home', rawPath: '/' };
          }
        }
      } else if (segments.length === 2) {
        // Either /:category/:subCategory OR /kategori/:category/:subCategory OR /:category/:articleSlug
        const [seg1, seg2] = segments;
        const matchedCategory = getCategoryBySlug(seg1) || getCategoryById(seg1);
        if (matchedCategory) {
          const matchedSub = findSubCategory(matchedCategory.id, seg2);
          if (matchedSub) {
            routeMatch = {
              type: 'subcategory',
              param: matchedCategory.id,
              subParam: matchedSub.id,
              category: matchedCategory.id,
              subCategory: matchedSub.id,
              rawPath: `/${path}`
            };
          } else {
            // Check if seg2 is an article slug in seg1 category
            const matchedArticle = findArticleBySlugOrId(seg2);
            if (matchedArticle) {
              routeMatch = {
                type: 'article',
                param: matchedArticle.slug || matchedArticle.id,
                articleSlug: matchedArticle.slug || matchedArticle.id,
                category: matchedCategory.id,
                rawPath: `/${path}`
              };
            } else {
              routeMatch = {
                type: 'category',
                param: matchedCategory.id,
                category: matchedCategory.id,
                rawPath: `/${path}`
              };
            }
          }
        } else {
          // Fallback to article search
          const matchedArticle = findArticleBySlugOrId(seg2);
          if (matchedArticle) {
            routeMatch = {
              type: 'article',
              param: matchedArticle.slug || matchedArticle.id,
              articleSlug: matchedArticle.slug || matchedArticle.id,
              rawPath: `/${path}`
            };
          } else {
            routeMatch = { type: 'home', rawPath: '/' };
          }
        }
      } else if (segments.length >= 3) {
        // Hierarchical 3-level route: /:category/:subCategory/:articleSlug
        const [seg1, seg2, seg3] = segments;
        const matchedCategory = getCategoryBySlug(seg1) || getCategoryById(seg1);
        const articleSlug = seg3;
        const matchedArticle = findArticleBySlugOrId(articleSlug);

        routeMatch = {
          type: 'article',
          param: matchedArticle ? (matchedArticle.slug || matchedArticle.id) : articleSlug,
          articleSlug: articleSlug,
          category: matchedCategory ? matchedCategory.id : seg1,
          subCategory: seg2,
          rawPath: `/${path}`
        };
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
