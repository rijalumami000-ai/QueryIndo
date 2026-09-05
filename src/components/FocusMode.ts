import type { Article } from '../types/news';

export type FocusTheme = 'dark' | 'sepia' | 'light';

export class FocusMode {
  private static isActive = false;
  private static currentTheme: FocusTheme = 'dark';
  private static overlayElement: HTMLElement | null = null;
  private static scrollListener: (() => void) | null = null;

  public static isFocusActive(): boolean {
    return this.isActive;
  }

  public static open(article: Article, lang: 'id' | 'en' = 'id') {
    this.isActive = true;
    this.currentTheme = (localStorage.getItem('byte_focus_theme') as FocusTheme) || 'dark';

    // Remove existing if any
    const existing = document.getElementById('byte-focus-mode-overlay');
    if (existing) existing.remove();

    const plainText = article.content.replace(/<[^>]*>?/gm, ' ');
    const wordCount = plainText.trim().split(/\s+/).length;
    const estMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const overlay = document.createElement('div');
    overlay.id = 'byte-focus-mode-overlay';
    overlay.className = `focus-mode-overlay theme-${this.currentTheme}`;

    overlay.innerHTML = `
      <!-- Focus Mode Top Toolbar -->
      <div class="focus-toolbar">
        <div class="focus-toolbar-left">
          <button id="btn-exit-focus" class="focus-btn-exit" title="Keluar dari Mode Fokus (Esc)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span>${lang === 'en' ? 'Exit Focus Mode' : 'Tutup Mode Fokus'}</span>
          </button>
          <div class="focus-meta-badge">
            <span>${wordCount} ${lang === 'en' ? 'words' : 'kata'}</span>
            <span>•</span>
            <span id="focus-time-remaining">~${estMinutes} ${lang === 'en' ? 'min read' : 'menit baca'}</span>
          </div>
        </div>

        <div class="focus-toolbar-right">
          <!-- Theme Switcher Pills -->
          <div class="focus-theme-pills">
            <button class="focus-pill-btn ${this.currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
              Dark
            </button>
            <button class="focus-pill-btn ${this.currentTheme === 'sepia' ? 'active' : ''}" data-theme="sepia">
              Sepia
            </button>
            <button class="focus-pill-btn ${this.currentTheme === 'light' ? 'active' : ''}" data-theme="light">
              Light
            </button>
          </div>
        </div>
      </div>

      <!-- Top Reading Progress Indicator -->
      <div class="focus-progress-track">
        <div class="focus-progress-fill" id="focus-progress-fill"></div>
      </div>

      <!-- Focus Mode Article Body Container -->
      <div class="focus-article-scroll-area" id="focus-scroll-area">
        <div class="focus-article-paper">
          <div class="focus-tag-header">${article.category.toUpperCase()} • QUERYINDO FOCUS</div>
          <h1 class="focus-article-title">${article.title}</h1>
          <p class="focus-article-subtitle">${article.subtitle}</p>

          <div class="focus-author-bar">
            <img src="${article.author.avatar}" alt="${article.author.name}" class="focus-author-avatar" />
            <div>
              <div class="focus-author-name">${article.author.name}</div>
              <div class="focus-author-sub">${article.author.role} • ${new Date(article.publishedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="focus-content-body">
            ${article.content}
          </div>

          <!-- Bottom Footer In Zen Mode -->
          <div class="focus-bottom-end">
            <div class="focus-end-symbol">❖ ❖ ❖</div>
            <p>${lang === 'en' ? 'You have reached the end of this editorial manuscript.' : 'Anda telah menyelesaikan pembacaan naskah redaksi ini.'}</p>
            <button id="btn-exit-focus-bottom" class="focus-btn-exit-large">
              ← ${lang === 'en' ? 'Back to Portal' : 'Kembali ke Beranda Berita'}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlayElement = overlay;
    document.body.style.overflow = 'hidden';

    // Bind Event Listeners
    this.bindEvents(overlay, estMinutes, lang);
  }

  public static close() {
    this.isActive = false;
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
    if (this.scrollListener) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.scrollListener = null;
    }
    // Only restore body overflow if no modal is open
    const openModal = document.querySelector('.modal-overlay.open');
    if (!openModal) {
      document.body.style.overflow = '';
    }
  }

  private static handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && FocusMode.isActive) {
      FocusMode.close();
    }
  };

  private static bindEvents(overlay: HTMLElement, totalEstMinutes: number, lang: 'id' | 'en') {
    // Exit button
    overlay.querySelector('#btn-exit-focus')?.addEventListener('click', () => this.close());
    overlay.querySelector('#btn-exit-focus-bottom')?.addEventListener('click', () => this.close());

    // Theme Switchers
    overlay.querySelectorAll('.focus-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme') as FocusTheme;
        if (theme) {
          this.currentTheme = theme;
          localStorage.setItem('byte_focus_theme', theme);
          overlay.className = `focus-mode-overlay theme-${theme}`;
          overlay.querySelectorAll('.focus-pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });

    // Keyboard ESC listener
    window.addEventListener('keydown', this.handleKeyDown);

    // Scroll Progress & Remaining Time Calculation
    const scrollArea = overlay.querySelector('#focus-scroll-area') as HTMLElement;
    const progressFill = overlay.querySelector('#focus-progress-fill') as HTMLElement;
    const timeRemainingSpan = overlay.querySelector('#focus-time-remaining') as HTMLElement;

    if (scrollArea && progressFill) {
      scrollArea.addEventListener('scroll', () => {
        const scrollTop = scrollArea.scrollTop;
        const scrollHeight = scrollArea.scrollHeight - scrollArea.clientHeight;
        if (scrollHeight > 0) {
          const ratio = Math.min(1, Math.max(0, scrollTop / scrollHeight));
          const pct = ratio * 100;
          progressFill.style.width = `${pct}%`;

          const remainingMinutes = Math.max(0, Math.ceil(totalEstMinutes * (1 - ratio)));
          if (timeRemainingSpan) {
            timeRemainingSpan.textContent = remainingMinutes > 0
              ? `~${remainingMinutes} ${lang === 'en' ? 'min left' : 'menit lagi'}`
              : (lang === 'en' ? 'Finished reading' : 'Selesai dibaca');
          }
        }
      });
    }
  }
}
