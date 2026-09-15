import { ArticleService } from '../services/articleService';

export interface StorySlide {
  id: string;
  articleId: string;
  titleId: string;
  titleEn: string;
  captionId: string;
  captionEn: string;
  imageUrl: string;
  category: string;
}

export interface ByteStory {
  id: string;
  authorName: string;
  authorAvatar: string;
  badge: string;
  isUnread: boolean;
  slides: StorySlide[];
}

export class ByteShorts {
  private static activeStoryIndex = 0;
  private static activeSlideIndex = 0;
  private static timerId: any = null;
  private static stories: ByteStory[] = [];

  public static getStories(): ByteStory[] {
    const articles = ArticleService.getArticles();
    if (!articles || articles.length === 0) {
      this.stories = [];
      return [];
    }

    this.stories = articles.slice(0, 6).map((art) => ({
      id: `story-${art.id}`,
      authorName: (art.author && art.author.name ? art.author.name.split(' ')[0] : 'Redaksi'),
      authorAvatar: (art.author && art.author.avatar ? art.author.avatar : art.imageUrl),
      badge: art.category.toUpperCase(),
      isUnread: true,
      slides: [
        {
          id: `slide-${art.id}-1`,
          articleId: art.id,
          titleId: art.title,
          titleEn: art.title,
          captionId: art.subtitle || (art.aiSummary && art.aiSummary[0]) || art.title,
          captionEn: art.subtitle || (art.aiSummary && art.aiSummary[0]) || art.title,
          imageUrl: art.imageUrl,
          category: art.category.toUpperCase()
        }
      ]
    }));
    return this.stories;
  }

  public static renderBarHTML(lang: 'id' | 'en'): string {
    const stories = this.getStories();
    if (stories.length === 0) {
      return '';
    }

    const sectionTitleText = lang === 'en' ? 'BYTESHORTS • VISUAL STORIES' : 'BYTESHORTS • BERITA KILAT';
    const clickHintText = lang === 'en' ? 'Click story to preview →' : 'Klik story untuk pratinjau →';

    return `
      <div style="margin: 1.25rem 0 0.5rem 0; padding: 0.85rem 1rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <div style="font-size: 0.72rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); letter-spacing: 0.06em; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            ${sectionTitleText}
          </span>
          <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 600;">${clickHintText}</span>
        </div>

        <div style="display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 0.35rem; scrollbar-width: none;">
          ${stories.map((story, idx) => `
            <div class="byte-story-item" data-story-index="${idx}" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; cursor: pointer; flex-shrink: 0; transition: transform 0.2s ease;">
              <div style="position: relative; width: 56px; height: 56px; border-radius: 50%; padding: 2px; background: ${story.isUnread ? 'linear-gradient(135deg, var(--accent-cyan), #3b82f6, #ec4899)' : 'var(--border-color)'};">
                <img src="${story.authorAvatar}" alt="${story.authorName}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid var(--bg-primary);" />
                <span style="position: absolute; bottom: -2px; right: -2px; background: var(--accent-cyan); color: #000; font-size: 0.55rem; font-weight: 800; padding: 0.1rem 0.3rem; border-radius: 100px; text-transform: uppercase;">
                  ${story.badge}
                </span>
              </div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-primary); max-width: 72px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${story.authorName}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  public static openViewer(storyIdx: number, lang: 'id' | 'en', onOpenArticle: (artId: string) => void) {
    if (!this.stories || this.stories.length === 0) {
      this.getStories();
    }
    if (!this.stories[storyIdx]) return;

    this.activeStoryIndex = storyIdx;
    this.activeSlideIndex = 0;
    
    // Mark as read
    this.stories[storyIdx].isUnread = false;

    let viewerModal = document.getElementById('byteshorts-viewer-modal');
    if (!viewerModal) {
      viewerModal = document.createElement('div');
      viewerModal.id = 'byteshorts-viewer-modal';
      viewerModal.style.cssText = `
        position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
      `;
      document.body.appendChild(viewerModal);
    }

    this.renderViewerContent(viewerModal, lang, onOpenArticle);
    viewerModal.style.opacity = '1';
    viewerModal.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';

    this.startAutoAdvance(viewerModal, lang, onOpenArticle);
  }

  private static renderViewerContent(container: HTMLElement, lang: 'id' | 'en', onOpenArticle: (artId: string) => void) {
    const story = this.stories[this.activeStoryIndex];
    if (!story || !story.slides[this.activeSlideIndex]) {
      this.closeViewer(container);
      return;
    }

    const slide = story.slides[this.activeSlideIndex];
    const title = lang === 'en' ? slide.titleEn : slide.titleId;
    const caption = lang === 'en' ? slide.captionEn : slide.captionId;
    const readFullText = lang === 'en' ? 'Read Full Story →' : 'Baca Berita Selengkapnya →';

    container.innerHTML = `
      <div style="position: relative; width: 100%; max-width: 420px; height: 90vh; max-height: 750px; background: #000; border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); border: 1px solid rgba(255,255,255,0.1);">
        
        <!-- Progress Bars Header -->
        <div style="position: absolute; top: 12px; left: 12px; right: 12px; display: flex; gap: 4px; z-index: 20;">
          ${story.slides.map((_, sIdx) => `
            <div style="flex: 1; height: 3px; background: rgba(255,255,255,0.25); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: ${sIdx < this.activeSlideIndex ? '100%' : sIdx === this.activeSlideIndex ? '100%' : '0%'}; background: var(--accent-cyan); transition: width ${sIdx === this.activeSlideIndex ? '4.5s linear' : '0.1s linear'};"></div>
            </div>
          `).join('')}
        </div>

        <!-- Author Header Overlay -->
        <div style="position: absolute; top: 24px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; z-index: 20; color: #fff;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <img src="${story.authorAvatar}" alt="${story.authorName}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid #fff;" />
            <div>
              <div style="font-size: 0.85rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${story.authorName}</div>
              <div style="font-size: 0.65rem; color: rgba(255,255,255,0.8); font-family: var(--font-mono);">${slide.category}</div>
            </div>
          </div>
          <button id="btn-close-byteshorts" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); width: 32px; height: 32px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px);">✕</button>
        </div>

        <!-- Main Slide Media -->
        <div style="position: relative; flex: 1; width: 100%; height: 100%; overflow: hidden;">
          <img src="${slide.imageUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 60%, rgba(0,0,0,0.92) 100%);"></div>
          
          <!-- Tap Navigation Invisible Zones -->
          <div id="touch-prev-slide" style="position: absolute; top: 70px; bottom: 120px; left: 0; width: 40%; z-index: 15; cursor: pointer;"></div>
          <div id="touch-next-slide" style="position: absolute; top: 70px; bottom: 120px; right: 0; width: 60%; z-index: 15; cursor: pointer;"></div>
        </div>

        <!-- Slide Caption & Read Full CTA -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1.25rem 1.25rem 1.5rem 1.25rem; z-index: 20; color: #fff;">
          <span style="display: inline-block; padding: 0.2rem 0.6rem; background: var(--accent-cyan); color: #000; font-size: 0.65rem; font-weight: 800; border-radius: var(--radius-full); margin-bottom: 0.5rem; text-transform: uppercase;">
            ${slide.category}
          </span>
          <h2 style="font-size: 1.15rem; font-weight: 800; line-height: 1.35; margin-bottom: 0.45rem; text-shadow: 0 2px 6px rgba(0,0,0,0.8);">${title}</h2>
          <p style="font-size: 0.85rem; color: rgba(255,255,255,0.85); line-height: 1.45; margin-bottom: 1rem; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">${caption}</p>
          
          <button id="btn-read-full-byteshorts" data-article-id="${slide.articleId}" style="width: 100%; padding: 0.75rem; background: var(--gradient-brand); color: #000; font-weight: 800; font-size: 0.85rem; border: none; border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: transform 0.15s ease;">
            <span>${readFullText}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    `;

    // Event Bindings
    container.querySelector('#btn-close-byteshorts')?.addEventListener('click', () => this.closeViewer(container));
    container.querySelector('#touch-prev-slide')?.addEventListener('click', () => this.prevSlide(container, lang, onOpenArticle));
    container.querySelector('#touch-next-slide')?.addEventListener('click', () => this.nextSlide(container, lang, onOpenArticle));
    
    const readFullBtn = container.querySelector('#btn-read-full-byteshorts');
    readFullBtn?.addEventListener('click', () => {
      const artId = readFullBtn.getAttribute('data-article-id');
      this.closeViewer(container);
      if (artId) onOpenArticle(artId);
    });
  }

  private static startAutoAdvance(container: HTMLElement, lang: 'id' | 'en', onOpenArticle: (artId: string) => void) {
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.nextSlide(container, lang, onOpenArticle);
    }, 4500);
  }

  private static nextSlide(container: HTMLElement, lang: 'id' | 'en', onOpenArticle: (artId: string) => void) {
    if (!this.stories[this.activeStoryIndex]) return;
    const story = this.stories[this.activeStoryIndex];

    if (this.activeSlideIndex < story.slides.length - 1) {
      this.activeSlideIndex++;
      this.renderViewerContent(container, lang, onOpenArticle);
      this.startAutoAdvance(container, lang, onOpenArticle);
    } else if (this.activeStoryIndex < this.stories.length - 1) {
      this.activeStoryIndex++;
      this.activeSlideIndex = 0;
      this.stories[this.activeStoryIndex].isUnread = false;
      this.renderViewerContent(container, lang, onOpenArticle);
      this.startAutoAdvance(container, lang, onOpenArticle);
    } else {
      this.closeViewer(container);
    }
  }

  private static prevSlide(container: HTMLElement, lang: 'id' | 'en', onOpenArticle: (artId: string) => void) {
    if (this.activeSlideIndex > 0) {
      this.activeSlideIndex--;
      this.renderViewerContent(container, lang, onOpenArticle);
      this.startAutoAdvance(container, lang, onOpenArticle);
    } else if (this.activeStoryIndex > 0) {
      this.activeStoryIndex--;
      this.activeSlideIndex = this.stories[this.activeStoryIndex].slides.length - 1;
      this.renderViewerContent(container, lang, onOpenArticle);
      this.startAutoAdvance(container, lang, onOpenArticle);
    }
  }

  private static closeViewer(container: HTMLElement) {
    if (this.timerId) clearTimeout(this.timerId);
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }

  public static bindBarEvents(container: HTMLElement, lang: 'id' | 'en', onOpenArticle: (artId: string) => void) {
    container.querySelectorAll('.byte-story-item').forEach(item => {
      item.addEventListener('click', () => {
        const sIdx = parseInt(item.getAttribute('data-story-index') || '0', 10);
        this.openViewer(sIdx, lang, onOpenArticle);
      });
    });
  }
}
