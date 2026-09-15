import type { CategoryId, UserPreferences, TechIndexItem } from '../types/news';
import { TECH_INDEXES } from '../data/mockNews';
import { TranslationService, UI_TRANSLATIONS } from '../utils/translationService';

export const CATEGORIES_EN: Record<string, string> = {
  'all': 'All News',
  'ai': 'Artificial Intelligence',
  'gadget': 'Gadget & Innovation',
  'cybersecurity': 'Cybersecurity',
  'startup': 'Startup & Business',
  'policy': 'Digital Policy',
  'telecom': 'Telecommunications',
  'developer': 'Developer Collective'
};

class Store {
  public preferences: UserPreferences = {
    theme: (localStorage.getItem('byte_theme') as 'dark' | 'light') || 'light',
    savedArticleIds: JSON.parse(localStorage.getItem('byte_bookmarks') || '[]'),
    likedArticleIds: JSON.parse(localStorage.getItem('byte_likes') || '[]'),
    fontSize: (localStorage.getItem('byte_font_size') as 'normal' | 'large' | 'xlarge') || 'normal',
    language: (localStorage.getItem('byte_lang') as 'id' | 'en') || 'id'
  };

  public currentCategory: CategoryId = 'all';
  public searchQuery: string = '';
  public liveTechIndexes: TechIndexItem[] = [...TECH_INDEXES];
  public selectedFilterSortBy: string = 'latest';
  public selectedFilterDateRange: string = 'all';
  public selectedFilterTag: string = '';

  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.initThemeAndFont();
  }

  public subscribe(event: string, callback: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.error(`Error in store listener for ${event}:`, err);
        }
      });
    }
  }

  public t(key: keyof typeof UI_TRANSLATIONS['id']): string {
    return TranslationService.getLabel(key, this.preferences.language);
  }

  public initThemeAndFont(): void {
    const appElement = document.documentElement;
    appElement.setAttribute('data-theme', this.preferences.theme);
    appElement.setAttribute('data-font-size', this.preferences.fontSize);
  }

  public applyTheme(theme: 'dark' | 'light'): void {
    this.preferences.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('byte_theme', theme);

    const themeSvgIcon = document.getElementById('theme-svg-icon');
    if (themeSvgIcon) {
      if (theme === 'dark') {
        themeSvgIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
      } else {
        themeSvgIcon.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
      }
    }
    this.emit('theme-change');
  }

  public toggleTheme(): void {
    const newTheme = this.preferences.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  public setLanguage(lang: 'id' | 'en'): void {
    this.preferences.language = lang;
    localStorage.setItem('byte_lang', lang);
    this.updateCurrentDateBadge();
    this.emit('lang-change');
  }

  public setFontSize(size: 'normal' | 'large' | 'xlarge'): void {
    this.preferences.fontSize = size;
    document.documentElement.setAttribute('data-font-size', size);
    localStorage.setItem('byte_font_size', size);
    this.emit('font-change');
  }

  public updateBookmarkBadge(): void {
    const bookmarkCountBadge = document.getElementById('bookmark-count');
    if (bookmarkCountBadge) {
      bookmarkCountBadge.textContent = this.preferences.savedArticleIds.length.toString();
    }
  }

  public isBookmarked(articleId: string): boolean {
    return this.preferences.savedArticleIds.includes(articleId);
  }

  public toggleBookmark(articleId: string): boolean {
    const index = this.preferences.savedArticleIds.indexOf(articleId);
    let bookmarked = false;
    if (index > -1) {
      this.preferences.savedArticleIds.splice(index, 1);
      bookmarked = false;
    } else {
      this.preferences.savedArticleIds.push(articleId);
      bookmarked = true;
    }
    localStorage.setItem('byte_bookmarks', JSON.stringify(this.preferences.savedArticleIds));
    this.updateBookmarkBadge();
    this.emit('bookmarks-change');
    return bookmarked;
  }

  public isLiked(articleId: string): boolean {
    return this.preferences.likedArticleIds.includes(articleId);
  }

  public addLiked(articleId: string): void {
    if (!this.preferences.likedArticleIds.includes(articleId)) {
      this.preferences.likedArticleIds.push(articleId);
      localStorage.setItem('byte_likes', JSON.stringify(this.preferences.likedArticleIds));
      this.emit('likes-change');
    }
  }

  public updateCurrentDateBadge(): void {
    const dateEl = document.getElementById('current-date-text');
    if (!dateEl) return;
    const now = new Date();
    if (this.preferences.language === 'en') {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      dateEl.textContent = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }
}

export const store = new Store();
