import { store } from '../state/store';

export class GoogleTranslateService {
  private static isInitialized = false;
  private static isScriptLoaded = false;

  /**
   * Loads the Google Translate script dynamically on-demand only
   */
  private static loadScript(): Promise<void> {
    if (this.isScriptLoaded || document.getElementById('google-translate-script')) {
      this.isScriptLoaded = true;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Translate'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initializes the Google Translate listener and synchronizes
   * the stored language preference. Script is NOT loaded if language is 'id'.
   */
  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const savedLang = store.preferences.language || (localStorage.getItem('byte_lang') as 'id' | 'en') || 'id';

    // Only load external script if English was previously explicitly selected
    if (savedLang === 'en') {
      this.setCookie('en');
      this.loadScript().then(() => {
        this.triggerTranslationCombo('en');
      }).catch(() => {});
    }
  }

  /**
   * Sets the website language natively using Google Translate Engine
   */
  public static setLanguage(lang: 'id' | 'en'): void {
    const currentLang = store.preferences.language;
    store.setLanguage(lang);
    this.setCookie(lang);

    // When switching from English back to Indonesian, a quick reload guarantees
    // clean restoration of original text and unloads translation listeners
    if (currentLang === 'en' && lang === 'id') {
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }

    // When switching to English, load script on-demand and trigger combo
    if (lang === 'en') {
      this.loadScript().then(() => {
        this.triggerTranslationCombo('en');
      }).catch(() => {});
    }
  }

  /**
   * Re-triggers translation for dynamically opened containers (e.g. Article Reader Modal)
   */
  public static refreshModalTranslation(): void {
    if (store.preferences.language === 'en') {
      this.loadScript().then(() => {
        this.triggerTranslationCombo('en');
      }).catch(() => {});
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
      } else if (attempts >= 15) {
        clearInterval(interval);
      }
    }, 150);
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
