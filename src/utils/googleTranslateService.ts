import { store } from '../state/store';

export class GoogleTranslateService {
  private static isInitialized = false;

  /**
   * Initializes the Google Translate listener and synchronizes
   * the stored language preference.
   */
  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const savedLang = store.preferences.language || (localStorage.getItem('byte_lang') as 'id' | 'en') || 'id';

    // Synchronize cookie on initial load
    if (savedLang === 'en') {
      this.setCookie('en');
      this.triggerTranslationCombo('en');
    }
  }

  /**
   * Sets the website language natively using Google Translate Engine
   */
  public static setLanguage(lang: 'id' | 'en'): void {
    const currentLang = store.preferences.language;
    store.setLanguage(lang);
    this.setCookie(lang);

    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change'));
    }

    // When switching from English back to Indonesian, a quick reload guarantees
    // clean restoration of the original Indonesian text without translation artifacts
    if (currentLang === 'en' && lang === 'id') {
      setTimeout(() => {
        window.location.reload();
      }, 150);
      return;
    }

    // If switching to English and combo wasn't immediately ready
    if (lang === 'en') {
      this.triggerTranslationCombo('en');
    }
  }

  /**
   * Re-triggers translation for dynamically opened containers (e.g. Article Reader Modal)
   */
  public static refreshModalTranslation(): void {
    if (store.preferences.language === 'en') {
      this.triggerTranslationCombo('en');
    }
  }

  private static triggerTranslationCombo(lang: 'id' | 'en'): void {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        clearInterval(interval);
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change'));
        }
      } else if (attempts >= 12) {
        clearInterval(interval);
      }
    }, 200);
  }

  private static setCookie(lang: 'id' | 'en'): void {
    const hostname = window.location.hostname;
    const val = lang === 'en' ? '/id/en' : '/id/id';

    document.cookie = `googtrans=${val}; path=/;`;
    document.cookie = `googtrans=${val}; path=/; domain=${hostname};`;

    if (hostname.includes('.')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        const rootDomain = '.' + parts.slice(-2).join('.');
        document.cookie = `googtrans=${val}; path=/; domain=${rootDomain};`;
      }
    }

    if (lang === 'id') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      if (hostname.includes('.')) {
        const parts = hostname.split('.');
        if (parts.length >= 2) {
          const rootDomain = '.' + parts.slice(-2).join('.');
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
        }
      }
    }
  }
}
