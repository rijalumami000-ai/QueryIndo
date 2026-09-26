import type { Article } from '../types/news';
import { ArticleService } from '../services/articleService';
import { store } from '../state/store';
import { Router } from '../router';
import { ApiService } from '../services/apiService';
import { getCategoryById, findSubCategory } from '../data/mockNews';
import { ReaderAuthService } from '../services/authService';
import { SeoService } from '../utils/seoService';
import { Toast } from '../utils/toast';
import { ImageUtils } from '../utils/imageUtils';
import { AdBanner } from '../components/AdBanner';
import { ReaderComments } from '../components/ReaderComments';
import { FocusMode } from '../components/FocusMode';
import { ShareModal } from '../components/ShareModal';
import { TranslationService } from '../utils/translationService';
import { GoogleTranslateService } from '../utils/googleTranslateService';
import { 
  escapeHtml, 
  formatDate, 
  calculateReadTime, 
  getSafeImageUrl, 
  IMG_ONERROR, 
  findArticleBySlugOrId, 
  addReadingHistory,
  slugifyTitle,
  sanitizeArticleHtml
} from '../utils/helpers';

export class ArticleReaderModal {
  private static currentScrollHandler: (() => void) | null = null;

  public static async open(articleIdOrSlug: string, _updateUrl: boolean = true): Promise<void> {
    const art = findArticleBySlugOrId(articleIdOrSlug);
    const slug = art?.slug || articleIdOrSlug;
    window.location.href = `/berita/${slug}`;
    return;
  }

  public static close(updateUrl: boolean = true): void {
    const readerModal = document.getElementById('reader-modal');
    if (!readerModal || !readerModal.classList.contains('open')) return;

    if (this.currentScrollHandler) {
      readerModal.removeEventListener('scroll', this.currentScrollHandler);
      this.currentScrollHandler = null;
    }
    readerModal.classList.remove('open');
    document.body.style.overflow = '';

    window.dispatchEvent(new CustomEvent('modal-closed'));

    if (updateUrl) {
      Router.navigateHome();
    }
  }
}

// Attach to window for backwards-compatible programmatic closing
(window as any).closeArticleReader = ArticleReaderModal.close;
