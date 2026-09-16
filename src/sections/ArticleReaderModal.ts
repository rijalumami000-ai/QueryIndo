import type { Article } from '../types/news';
import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { ApiService } from '../services/apiService';
import { ReaderAuthService } from '../services/authService';
import { SeoService } from '../utils/seoService';
import { TextToSpeechService } from '../utils/textToSpeech';
import { Toast } from '../utils/toast';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner } from '../components/AdBanner';
import { ReaderComments } from '../components/ReaderComments';
import { FocusMode } from '../components/FocusMode';
import { ShareModal } from '../components/ShareModal';
import { TranslationService } from '../utils/translationService';
import { 
  escapeHtml, 
  formatDate, 
  calculateReadTime, 
  getSafeImageUrl, 
  IMG_ONERROR, 
  findArticleBySlugOrId, 
  addReadingHistory,
  slugifyTitle
} from '../utils/helpers';
import Lenis from 'lenis';

export class ArticleReaderModal {
  private static readerLenis: Lenis | null = null;
  private static currentArticleSpeechText: string = '';

  public static async open(articleIdOrSlug: string, updateUrl: boolean = true): Promise<void> {
    let article = findArticleBySlugOrId(articleIdOrSlug);
    const readerModal = document.getElementById('reader-modal');
    const modalReaderContent = document.getElementById('modal-reader-content');
    if (!readerModal || !modalReaderContent) return;

    if (!article) {
      try {
        await ArticleService.syncWithBackend();
        article = findArticleBySlugOrId(articleIdOrSlug);
      } catch (err) {
        console.warn('Gagal sinkronisasi data artikel:', err);
      }
    }

    if (!article) {
      console.warn(`Artikel tidak ditemukan untuk param: ${articleIdOrSlug}`);
      return;
    }

    // Trigger modal opened event (stops global main lenis)
    window.dispatchEvent(new CustomEvent('modal-opened'));

    // Push clean URL to browser history
    if (updateUrl) {
      const slug = article.slug || slugifyTitle(article.title);
      Router.navigateTo(`/berita/${slug}`);
    }

    // Record into Reading History
    addReadingHistory(article);

    // Dynamic SEO Meta Tags & Schema.org JSON-LD NewsArticle
    SeoService.setArticleSEO(article);

    const isBookmarked = store.isBookmarked(article.id);
    const isLiked = store.isLiked(article.id);

    // Record article view counter to PostgreSQL server in background
    ApiService.viewArticle(article.id).catch(() => {});

    // Article Content Body
    const articleBody = article.content;

    // Prepare text & duration for Text-to-Speech Engine
    const plainBody = TextToSpeechService.extractPlainTextFromHTML(articleBody);
    this.currentArticleSpeechText = `${article.title}. ${article.subtitle}. ${plainBody}`;
    const totalWords = this.currentArticleSpeechText.split(/\s+/).length;
    const initialDurationStr = TextToSpeechService.formatTime(Math.ceil(totalWords / 2.2));

    modalReaderContent.innerHTML = `
      <!-- Sticky Reading Progress Bar -->
      <div style="position:sticky; top:-2.5rem; left:0; right:0; height:4px; background:var(--bg-secondary); z-index:90; margin:-2.5rem -2.5rem 1.5rem -2.5rem; overflow:hidden;">
        <div id="reader-progress-bar" style="height:100%; width:0%; background:var(--gradient-brand); transition:width 0.1s linear;"></div>
      </div>

      <div class="reader-header">
        <div class="badge-group">
          <span class="tag-badge">${article.category.toUpperCase()}</span>
          ${article.tags.map(t => `<span class="tag-badge" style="background:var(--bg-tertiary); color:var(--text-secondary); border-color:var(--border-color);">#${t}</span>`).join('')}
        </div>
        <h1 class="reader-title" id="reader-article-title">${article.title}</h1>
        <p class="reader-subtitle" id="reader-article-subtitle">${article.subtitle}</p>

        <div class="author-meta-block">
          <div class="author-detail">
            <img src="${article.author.avatar}" alt="${article.author.name}" class="author-lg-avatar" />
            <div>
              <div class="author-name-text" style="display: flex; align-items: center; gap: 0.35rem;">
                ${article.author.name}
                ${ImageUtils.getVerifiedBadgeHTML(16, 'Dewan Redaksi Terverifikasi')}
              </div>
              <div class="author-role-text">${article.author.role}</div>
            </div>
          </div>
          <div class="author-meta-right">
            <span class="author-pub-date">${store.preferences.language === 'en' ? 'Published' : 'Terbit'}: ${formatDate(article.publishedAt, store.preferences.language)}</span>
            <span class="author-read-pill">⏱️ ${calculateReadTime(article.content, article.readTimeMinutes)} ${store.preferences.language === 'en' ? 'min read' : 'menit baca'}</span>
          </div>
        </div>
      </div>

      <!-- Audio Player, Focus Mode & Text Size Toolbar -->
      <div class="reader-toolbar-card">
        <div class="reader-toolbar-top">
          <div class="reader-audio-main">
            <button id="btn-audio-play" class="btn-audio-circle-play" title="Play / Pause Audio">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button id="btn-audio-stop" class="btn-audio-circle-stop" title="Stop Audio">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
            </button>
            <div class="reader-audio-text-group">
              <div class="reader-audio-header">
                <span>${store.t('audioNarrativeHeader')}</span>
                <div class="audio-visualizer-wave" id="audio-visualizer-wave">
                  <span class="audio-bar"></span>
                  <span class="audio-bar"></span>
                  <span class="audio-bar"></span>
                  <span class="audio-bar"></span>
                </div>
              </div>
              <div class="reader-audio-sub" id="audio-status-text">${store.t('audioNarrativeSub')}</div>
            </div>
          </div>

          <div class="reader-audio-playback-ctrl">
            <div class="audio-speed-pills">
              <button class="btn-audio-speed active" data-speed="1.0">1.0x</button>
              <button class="btn-audio-speed" data-speed="1.25">1.25x</button>
              <button class="btn-audio-speed" data-speed="1.5">1.5x</button>
            </div>
            <span class="reader-audio-timer" id="audio-timer-text">00:00 / ${initialDurationStr}</span>
          </div>
        </div>

        <div class="reader-toolbar-bottom">
          <!-- Zen Focus Mode Button -->
          <button id="btn-reader-focus-mode" class="btn-reader-zen-focus">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 2 2h3"/></svg>
            <span>${store.preferences.language === 'en' ? 'Focus Mode' : 'Mode Fokus'}</span>
          </button>
          
          <!-- Text Size Control Toggle -->
          <div class="reader-font-size-group">
            <span class="reader-font-size-label">${store.t('fontSizeLabel')}</span>
            <div class="font-size-toggle">
              <button class="btn-size ${!store.preferences.fontSize || store.preferences.fontSize === 'normal' ? 'active' : ''}" data-size="normal">A</button>
              <button class="btn-size ${store.preferences.fontSize === 'large' ? 'active' : ''}" data-size="large">A+</button>
              <button class="btn-size ${store.preferences.fontSize === 'xlarge' ? 'active' : ''}" data-size="xlarge">A++</button>
            </div>
          </div>
        </div>
      </div>

      <img src="${getSafeImageUrl(article.imageUrl)}" alt="${escapeHtml(article.title)}" class="reader-hero-image" ${IMG_ONERROR} />
      ${article.imageCaption ? `<div class="image-caption">${article.imageCaption}</div>` : ''}

      <div class="article-rich-content size-${store.preferences.fontSize || 'normal'}" id="article-content-wrapper">
        ${articleBody}
      </div>

      <!-- Dynamic In-Article Sponsor Ad Placement -->
      ${AdBanner.renderInArticleHTML()}

      ${article.revisionHistory && article.revisionHistory.length > 0 ? `
        <div style="margin: 1.5rem 0; padding: 1rem; background: var(--bg-tertiary); border-left: 3px solid var(--accent-primary); border-radius: 4px; font-size: 0.8rem; color: var(--text-secondary);">
          <strong style="color: var(--accent-cyan); display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.4rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>${store.preferences.language === 'en' ? 'Editorial Revision History' : 'Catatan Revisi & Pemutakhiran Redaksi'}</span>
          </strong>
          ${article.revisionHistory.map(rev => `
            <div style="margin-top:0.25rem;">
              <span style="font-family:var(--font-mono); color:var(--text-muted); font-size:0.75rem;">[${rev.date}]</span> ${rev.note}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Action Bar (Likes, Bookmarks, Share) -->
      <div class="reader-action-bar">
        <div style="display:flex; gap:0.75rem; align-items:center;">
          <button class="btn-action ${isLiked ? 'active' : ''}" id="btn-like-article" style="display:flex; align-items:center; gap:0.45rem; ${isLiked ? 'color:var(--accent-red); border-color:var(--accent-red);' : ''}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span id="reader-like-counter">${article.likesCount || 0}</span>
          </button>
          <button class="btn-action" id="btn-bookmark-article">
            <span>${isBookmarked ? store.t('bookmarkedBtn') : store.t('bookmarkBtn')}</span>
          </button>
        </div>
        <button class="btn-action" id="btn-share-article">
          <span>${store.t('shareBtn')}</span>
        </button>
      </div>

      <!-- Related Articles Slider Block -->
      <div style="margin:2rem 0; padding:1.25rem; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md);">
        <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--accent-cyan); font-family:var(--font-mono); margin-bottom:1rem; letter-spacing:0.05em;">
          ${store.preferences.language === 'en' ? 'RELATED STORIES • UP NEXT' : 'BERITA TERKAIT • SELANJUTNYA'}
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;" id="related-articles-container">
          ${ArticleService.getArticles().filter(a => a.id !== article.id && (a.category === article.category || a.tags.some(t => article.tags.includes(t)))).slice(0, 3).map(rel => `
            <div class="related-art-card" data-rel-id="${rel.id}" data-rel-slug="${rel.slug || ''}" data-rel-title="${escapeHtml(rel.title)}" style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:0.85rem; cursor:pointer; transition:all 0.2s ease; display:flex; flex-direction:column; gap:0.5rem;" onmouseover="this.style.borderColor='var(--accent-cyan)'" onmouseout="this.style.borderColor='var(--border-color)'">
              <img src="${getSafeImageUrl(rel.imageUrl)}" alt="${escapeHtml(rel.title)}" style="width:100%; height:90px; border-radius:6px; object-fit:cover;" ${IMG_ONERROR} />
              <span class="tag-badge" style="font-size:0.65rem; align-self:flex-start;">${rel.category.toUpperCase()}</span>
              <h4 style="font-size:0.825rem; font-weight:700; color:var(--text-primary); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${rel.title}</h4>
              <span style="font-size:0.72rem; color:var(--text-muted);">${calculateReadTime(rel.content, rel.readTimeMinutes)}m ${store.preferences.language === 'en' ? 'read' : 'baca'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Reader Comments V2 Section -->
      ${ReaderComments.renderCommentsSectionHTML(article.id, store.preferences.language)}
    `;

    readerModal.classList.add('open');
    readerModal.scrollTop = 0;
    document.body.style.overflow = 'hidden';

    // Instantiate Lenis smooth scroll on Reader Modal for silky smooth reading experience
    if (window.innerWidth > 768) {
      if (this.readerLenis) {
        this.readerLenis.destroy();
        this.readerLenis = null;
      }
      const modalContainer = readerModal.querySelector('.modal-container') as HTMLElement;
      if (modalContainer) {
        this.readerLenis = new Lenis({
          wrapper: readerModal,
          content: modalContainer,
          lerp: 0.1,
          smoothWheel: true
        });
        const raf = (time: number) => {
          if (this.readerLenis && readerModal.classList.contains('open')) {
            this.readerLenis.raf(time);
            requestAnimationFrame(raf);
          }
        };
        requestAnimationFrame(raf);
      }
    }

    // Reading Progress Bar Scroll Handler
    const progressBar = document.getElementById('reader-progress-bar');
    if (progressBar && readerModal) {
      const handleScroll = () => {
        const scrollTop = readerModal.scrollTop;
        const scrollHeight = readerModal.scrollHeight - readerModal.clientHeight;
        if (scrollHeight > 0) {
          const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
          progressBar.style.width = `${pct}%`;
        }
      };
      readerModal.addEventListener('scroll', handleScroll);
    }

    // Related Articles Click Handlers
    modalReaderContent.querySelectorAll('.related-art-card').forEach(card => {
      card.addEventListener('click', () => {
        const relId = card.getAttribute('data-rel-id');
        const relSlug = card.getAttribute('data-rel-slug');
        const relTitle = card.getAttribute('data-rel-title');
        if (relId) {
          Router.navigateToArticle(relSlug || relId, relTitle || undefined);
          readerModal.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // Apply dynamic translation if language is English
    if (store.preferences.language === 'en') {
      const titleEl = document.getElementById('reader-article-title');
      const subtitleEl = document.getElementById('reader-article-subtitle');
      TranslationService.translateArticle(article, 'en').then(translated => {
        if (titleEl) titleEl.textContent = translated.title;
        if (subtitleEl) subtitleEl.textContent = translated.subtitle;
      });
    }

    this.setupReaderControls(article);
  }

  private static setupReaderControls(article: Article): void {
    const modalReaderContent = document.getElementById('modal-reader-content');
    if (!modalReaderContent) return;

    // Bind ReaderComments events
    ReaderComments.bindCommentEvents(modalReaderContent, article.id, store.preferences.language);

    // Focus Mode Trigger
    document.getElementById('btn-reader-focus-mode')?.addEventListener('click', () => {
      FocusMode.open(article, store.preferences.language);
    });

    // Font Size Buttons
    const sizeBtns = document.querySelectorAll('.font-size-toggle .btn-size');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        sizeBtns.forEach(b => b.classList.remove('active'));
        const target = e.currentTarget as HTMLElement;
        target.classList.add('active');
        const size = target.getAttribute('data-size') as 'normal' | 'large' | 'xlarge';
        store.setFontSize(size);
        
        const wrapper = document.getElementById('article-content-wrapper');
        if (wrapper) {
          wrapper.className = `article-rich-content size-${size}`;
        }
      });
    });

    // Article Like Button Handler (Strict 1-Account 1-Like Toggle)
    const likeBtn = document.getElementById('btn-like-article') as HTMLButtonElement | null;
    if (likeBtn) {
      likeBtn.addEventListener('click', async () => {
        if (!ReaderAuthService.isReaderLoggedIn()) {
          Toast.show(store.preferences.language === 'en' ? 'Please sign in with Google to like this article.' : 'Silakan login dengan Akun Google terlebih dahulu untuk menyukai artikel ini.', 'warning');
          window.dispatchEvent(new CustomEvent('open-auth-modal'));
          return;
        }

        const currentReader = ReaderAuthService.getCurrentReader();
        const readerId = currentReader?.email || currentReader?.id;

        likeBtn.disabled = true;

        const isCurrentlyLiked = store.isLiked(article.id);
        if (!isCurrentlyLiked) {
          // Like
          store.addLiked(article.id);
          ReaderAuthService.syncLikedArticles(store.preferences.likedArticleIds);

          likeBtn.classList.add('active');
          likeBtn.style.color = 'var(--accent-red)';
          likeBtn.style.borderColor = 'var(--accent-red)';
          const svg = likeBtn.querySelector('svg');
          if (svg) svg.setAttribute('fill', 'currentColor');

          article.likesCount = (article.likesCount || 0) + 1;
          const counter = document.getElementById('reader-like-counter');
          if (counter) counter.textContent = String(article.likesCount);

          try {
            const newCount = await ApiService.likeArticle(article.id, 'like', readerId);
            if (typeof newCount === 'number') {
              article.likesCount = newCount;
              if (counter) counter.textContent = String(newCount);
            }
          } catch {}

          Toast.show(store.preferences.language === 'en' ? 'Article liked! Thank you for your support.' : 'Artikel disukai! Terima kasih atas apresiasi Anda.');
        } else {
          // Unlike
          store.preferences.likedArticleIds = store.preferences.likedArticleIds.filter(id => id !== article.id);
          localStorage.setItem('byte_likes', JSON.stringify(store.preferences.likedArticleIds));
          ReaderAuthService.syncLikedArticles(store.preferences.likedArticleIds);

          likeBtn.classList.remove('active');
          likeBtn.style.color = '';
          likeBtn.style.borderColor = '';
          const svg = likeBtn.querySelector('svg');
          if (svg) svg.setAttribute('fill', 'none');

          article.likesCount = Math.max(0, (article.likesCount || 0) - 1);
          const counter = document.getElementById('reader-like-counter');
          if (counter) counter.textContent = String(article.likesCount);

          try {
            const newCount = await ApiService.likeArticle(article.id, 'unlike', readerId);
            if (typeof newCount === 'number') {
              article.likesCount = newCount;
              if (counter) counter.textContent = String(newCount);
            }
          } catch {}

          Toast.show(store.preferences.language === 'en' ? 'Like removed.' : 'Apresiasi suka dibatalkan.');
        }

        setTimeout(() => {
          if (likeBtn) likeBtn.disabled = false;
        }, 350);
      });
    }

    // Bookmark Button Handler
    const bookmarkBtn = document.getElementById('btn-bookmark-article');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        const isNowSaved = store.toggleBookmark(article.id);
        bookmarkBtn.querySelector('span')!.textContent = isNowSaved ? store.t('bookmarkedBtn') : store.t('bookmarkBtn');
      });
    }

    // Share Button Handler
    const shareBtn = document.getElementById('btn-share-article');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        ShareModal.shareArticle(article, store.preferences.language);
      });
    }

    // Audio Playback Speed Buttons
    modalReaderContent.querySelectorAll('.btn-audio-speed').forEach(btn => {
      btn.addEventListener('click', () => {
        modalReaderContent?.querySelectorAll('.btn-audio-speed').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.getAttribute('data-speed') || '1.0');
        TextToSpeechService.setSpeed(speed);
      });
    });

    // Real Web Speech Synthesis Text-to-Speech Handler
    const audioBtn = document.getElementById('btn-audio-play');
    const audioStopBtn = document.getElementById('btn-audio-stop');
    const audioStatusText = document.getElementById('audio-status-text');
    const audioTimerText = document.getElementById('audio-timer-text');
    const waveVisualizer = document.getElementById('audio-visualizer-wave');

    TextToSpeechService.stop();

    if (audioBtn && audioStatusText && audioTimerText) {
      audioBtn.addEventListener('click', () => {
        if (TextToSpeechService.getIsPlaying()) {
          TextToSpeechService.pause();
        } else {
          TextToSpeechService.play(this.currentArticleSpeechText, store.preferences.language, (state, curTime, durTime) => {
            const curStr = TextToSpeechService.formatTime(curTime);
            const durStr = TextToSpeechService.formatTime(durTime);

            if (state === 'playing') {
              audioBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
              (audioBtn as HTMLElement).style.background = 'var(--accent-emerald)';
              audioStatusText.textContent = store.t('audioPlaying');
              audioTimerText.textContent = `${curStr} / ${durStr}`;
              waveVisualizer?.classList.add('playing');
            } else if (state === 'paused') {
              audioBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
              (audioBtn as HTMLElement).style.background = 'var(--accent-cyan)';
              audioStatusText.textContent = store.t('audioPaused');
              audioTimerText.textContent = `${curStr} / ${durStr}`;
              waveVisualizer?.classList.remove('playing');
            } else {
              // stopped
              audioBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
              (audioBtn as HTMLElement).style.background = 'var(--accent-cyan)';
              audioStatusText.textContent = store.t('audioNarrativeSub');
              audioTimerText.textContent = `00:00 / ${durStr}`;
              waveVisualizer?.classList.remove('playing');
            }
          });
        }
      });

      audioStopBtn?.addEventListener('click', () => {
        TextToSpeechService.stop();
        waveVisualizer?.classList.remove('playing');
      });
    }

    AdBanner.bindAdEvents(modalReaderContent);
  }

  public static close(updateUrl: boolean = true): void {
    const readerModal = document.getElementById('reader-modal');
    if (!readerModal || !readerModal.classList.contains('open')) return;

    if (this.readerLenis) {
      this.readerLenis.destroy();
      this.readerLenis = null;
    }
    readerModal.classList.remove('open');
    document.body.style.overflow = '';
    TextToSpeechService.stop();

    window.dispatchEvent(new CustomEvent('modal-closed'));

    if (updateUrl) {
      Router.navigateHome();
    }
  }
}

// Attach to window for backwards-compatible programmatic closing
(window as any).closeArticleReader = ArticleReaderModal.close;
