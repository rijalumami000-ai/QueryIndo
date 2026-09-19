import { Toast } from '../utils/toast';
import { ReaderAuthService } from '../services/authService';
import { ApiService } from '../services/apiService';

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorRole?: string;
  avatar?: string;
  content: string;
  createdAt: string; // ISO String
  likesCount: number;
  userLiked?: boolean;
  parentId?: string | null;
  replies?: CommentItem[];
}

export class ReaderComments {
  private static STORAGE_PREFIX = 'byte_comments_';
  private static LIKED_COMMENTS_KEY = 'byte_liked_comments';

  // Realistic Pre-seeded comments for articles (Cleaned)
  private static DEFAULT_SEED_COMMENTS: Record<string, CommentItem[]> = {};

  // Get All Comments for an article (Structured with replies)
  public static getComments(articleId: string): CommentItem[] {
    const raw = localStorage.getItem(this.STORAGE_PREFIX + articleId);
    if (!raw) {
      const seed = this.DEFAULT_SEED_COMMENTS[articleId] || [];
      if (seed.length > 0) {
        this.saveComments(articleId, seed);
      }
      return seed;
    }

    try {
      const parsed: CommentItem[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Clean up accidentally injected dummy seed comments for user-published articles
        if (!this.DEFAULT_SEED_COMMENTS[articleId]) {
          const cleaned = parsed.filter(c => !c.id.startsWith('cmt-gen-'));
          if (cleaned.length !== parsed.length) {
            this.saveComments(articleId, cleaned);
            return cleaned;
          }
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }

  // Count total comments including replies
  public static countTotalComments(articleId: string): number {
    const comments = this.getComments(articleId);
    let count = 0;
    const traverse = (list: CommentItem[]) => {
      for (const item of list) {
        count++;
        if (item.replies && item.replies.length > 0) {
          traverse(item.replies);
        }
      }
    };
    traverse(comments);
    return count;
  }

  // Save comments array to localStorage
  public static saveComments(articleId: string, comments: CommentItem[]): void {
    localStorage.setItem(this.STORAGE_PREFIX + articleId, JSON.stringify(comments));
  }

  // Check if comment is liked by current user
  public static isCommentLiked(commentId: string): boolean {
    try {
      const liked: string[] = JSON.parse(localStorage.getItem(this.LIKED_COMMENTS_KEY) || '[]');
      return liked.includes(commentId);
    } catch {
      return false;
    }
  }

  // Toggle Like on a comment
  public static toggleLikeComment(articleId: string, commentId: string): { isLiked: boolean; newCount: number } {
    let likedList: string[] = [];
    try {
      likedList = JSON.parse(localStorage.getItem(this.LIKED_COMMENTS_KEY) || '[]');
    } catch {
      likedList = [];
    }

    const isAlreadyLiked = likedList.includes(commentId);
    let newIsLiked = !isAlreadyLiked;
    if (newIsLiked) {
      likedList.push(commentId);
    } else {
      likedList = likedList.filter(id => id !== commentId);
    }
    localStorage.setItem(this.LIKED_COMMENTS_KEY, JSON.stringify(likedList));

    const comments = this.getComments(articleId);
    let updatedCount = 0;

    const findAndUpdate = (list: CommentItem[]): boolean => {
      for (const c of list) {
        if (c.id === commentId) {
          c.likesCount = Math.max(0, (c.likesCount || 0) + (newIsLiked ? 1 : -1));
          updatedCount = c.likesCount;
          return true;
        }
        if (c.replies && findAndUpdate(c.replies)) {
          return true;
        }
      }
      return false;
    };

    findAndUpdate(comments);
    this.saveComments(articleId, comments);

    if (newIsLiked) {
      ApiService.likeComment(commentId).catch(() => {});
    }

    return { isLiked: newIsLiked, newCount: updatedCount };
  }

  // Add a new comment or reply with verified Google user credentials
  public static addComment(
    articleId: string, 
    authorName: string, 
    content: string, 
    parentId?: string | null,
    avatarUrl?: string
  ): CommentItem {
    const comments = this.getComments(articleId);
    const newComment: CommentItem = {
      id: `cmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      articleId,
      authorName: authorName.trim() || 'Pembaca Terverifikasi Google',
      authorRole: 'Pembaca Terverifikasi Google',
      avatar: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=4285F4&color=fff&bold=true`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      parentId: parentId || null,
      replies: []
    };

    if (parentId) {
      // Find parent and push reply
      let attached = false;
      const attachReply = (list: CommentItem[]) => {
        for (const c of list) {
          if (c.id === parentId) {
            if (!c.replies) c.replies = [];
            c.replies.push(newComment);
            attached = true;
            return;
          }
          if (c.replies && c.replies.length > 0) {
            attachReply(c.replies);
            if (attached) return;
          }
        }
      };
      attachReply(comments);
    } else {
      // Main top-level comment
      comments.unshift(newComment);
    }

    this.saveComments(articleId, comments);

    // Persist to PostgreSQL backend in background
    ApiService.postComment(articleId, {
      authorName: newComment.authorName,
      authorRole: newComment.authorRole,
      avatar: newComment.avatar,
      content: newComment.content,
      parentId: newComment.parentId
    }).then(serverComment => {
      if (serverComment && serverComment.id) {
        newComment.id = serverComment.id;
        this.saveComments(articleId, comments);
      }
    }).catch(err => {
      console.warn('Gagal sinkronisasi komentar ke server:', err);
    });

    return newComment;
  }

  // Time formatter helper
  public static formatRelativeTime(isoDate: string, lang: 'id' | 'en'): string {
    const now = Date.now();
    const past = new Date(isoDate).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return lang === 'en' ? 'Just now' : 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return lang === 'en' ? `${diffMin}m ago` : `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return lang === 'en' ? `${diffHour}h ago` : `${diffHour} jam lalu`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return lang === 'en' ? `${diffDays}d ago` : `${diffDays} hari lalu`;

    return new Date(isoDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Render HTML for comments section
  public static renderCommentsSectionHTML(articleId: string, lang: 'id' | 'en'): string {
    const comments = this.getComments(articleId);
    const totalCount = this.countTotalComments(articleId);
    const currentReader = ReaderAuthService.getCurrentReader();

    return `
      <div class="comments-section-v2" id="comments-section-root" data-article-id="${articleId}">
        <div class="comments-header-row">
          <div class="comments-title-wrap">
            <h3 class="comments-main-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              ${lang === 'en' ? 'Reader Discussions' : 'Ruang Diskusi & Opini Pembaca'}
            </h3>
            <span class="comments-badge-counter" id="comments-badge-counter">${totalCount} ${lang === 'en' ? 'Comments' : 'Tanggapan'}</span>
          </div>
          <div class="comments-guidelines-tip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>${lang === 'en' ? 'Moderated Tech Discourse' : 'Standar Etika Komunitas Terbuka'}</span>
          </div>
        </div>

        ${currentReader ? `
          <!-- Main Comment Input Box (Authenticated with Google) -->
          <div class="comment-composer-card">
            <div class="composer-author-row">
              <div class="composer-user-profile">
                <img src="${currentReader.avatar}" alt="${currentReader.name}" class="composer-user-avatar" />
                <div>
                  <div class="composer-user-name">${currentReader.name}</div>
                  <div class="composer-user-email">${currentReader.email}</div>
                </div>
              </div>
              <span class="composer-badge-verified">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ${lang === 'en' ? 'Google Verified' : 'Akun Google Terverifikasi'}
              </span>
            </div>
            <textarea class="comment-textarea-modern" id="comment-main-text" placeholder="${lang === 'en' ? 'Share your perspective, technical insight, or inquiry on this topic...' : 'Tuliskan pandangan, sanggahan kritis, atau wawasan teknis Anda seputar berita ini...'}" rows="3"></textarea>
            <div class="composer-actions-bar">
              <span class="composer-hint">${lang === 'en' ? `Posting as ${currentReader.name}` : `Berkomentar sebagai ${currentReader.name}`}</span>
              <button class="btn-post-comment" id="btn-submit-main-comment">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                ${lang === 'en' ? 'Post Comment' : 'Kirim Komentar'}
              </button>
            </div>
          </div>
        ` : `
          <!-- Google Authentication Gate Card (Unauthenticated) -->
          <div class="comment-auth-gate-card" id="comment-auth-gate">
            <div class="auth-gate-left">
              <div class="auth-gate-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div>
                <h4 class="auth-gate-title">${lang === 'en' ? 'Sign in with Google to Comment' : 'Masuk dengan Akun Google untuk Berkomentar'}</h4>
                <p class="auth-gate-desc">${lang === 'en' 
                  ? 'To preserve constructive discussion and eliminate spam, readers are required to sign in with their Google account.' 
                  : 'Untuk menjaga etika diskusi berkualitas tinggi dan bebas spam, pembaca wajib masuk dengan Akun Google sebelum mengirim opini atau tanggapan.'}
                </p>
              </div>
            </div>
            <button class="btn-comment-google-login" id="btn-login-to-comment" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>${lang === 'en' ? 'Sign in with Google' : 'Masuk dengan Google'}</span>
            </button>
          </div>
        `}

        <!-- Comments List Tree -->
        <div class="comments-stream-container" id="comments-stream-container">
          ${this.renderCommentsListHTML(comments, lang)}
        </div>
      </div>
    `;
  }

  // Render individual comments recursively
  private static renderCommentsListHTML(comments: CommentItem[], lang: 'id' | 'en'): string {
    if (comments.length === 0) {
      return `
        <div class="comments-empty-state">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
          <div style="font-weight: 700;">${lang === 'en' ? 'No comments yet' : 'Belum ada komentar'}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">${lang === 'en' ? 'Be the first to share your thoughts on this story!' : 'Jadilah yang pertama menyampaikan pandangan Anda!'}</div>
        </div>
      `;
    }

    return comments.map(c => this.renderCommentNodeHTML(c, lang, false)).join('');
  }

  private static renderCommentNodeHTML(c: CommentItem, lang: 'id' | 'en', isReply: boolean): string {
    const isLiked = this.isCommentLiked(c.id);
    const timeAgo = this.formatRelativeTime(c.createdAt, lang);
    const avatarUrl = c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorName)}&background=4285F4&color=fff&bold=true`;
    const currentReader = ReaderAuthService.getCurrentReader();

    return `
      <div class="comment-item-card ${isReply ? 'comment-item-reply' : ''}" id="comment-node-${c.id}" data-comment-id="${c.id}">
        <div class="comment-card-header">
          <div class="comment-user-info">
            <img src="${avatarUrl}" alt="${c.authorName}" class="comment-user-avatar" loading="lazy" />
            <div>
              <div class="comment-author-name">${c.authorName}</div>
              <div class="comment-meta-sub">
                <span class="comment-author-role">${c.authorRole || 'Pembaca Terverifikasi Google'}</span>
                <span class="comment-dot-sep">•</span>
                <span class="comment-time-text">${timeAgo}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="comment-content-body">
          ${c.content.replace(/\n/g, '<br/>')}
        </div>

        <div class="comment-actions-footer">
          <button class="btn-comment-like ${isLiked ? 'active' : ''}" data-action="like-comment" data-id="${c.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span class="comment-like-count">${c.likesCount || 0}</span>
          </button>

          <button class="btn-comment-reply" data-action="reply-comment" data-id="${c.id}" data-name="${c.authorName}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
            ${lang === 'en' ? 'Reply' : 'Balas'}
          </button>
        </div>

        <!-- Inline Reply Input Box (Hidden by default) -->
        <div class="reply-composer-inline" id="reply-box-${c.id}" style="display:none;">
          <div class="reply-composer-inner">
            ${currentReader ? `
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; font-size:0.78rem; color:var(--text-muted);">
                <img src="${currentReader.avatar}" style="width:20px; height:20px; border-radius:50%; object-fit:cover;" />
                <span>${lang === 'en' ? 'Replying as' : 'Membalas sebagai'} <strong style="color:var(--text-primary);">${currentReader.name}</strong></span>
              </div>
            ` : ''}
            <textarea class="reply-textarea" id="reply-text-${c.id}" placeholder="${lang === 'en' ? `Replying to @${c.authorName}...` : `Membalas komentar @${c.authorName}...`}" rows="2"></textarea>
            <div class="reply-composer-btns">
              <button class="btn-cancel-reply" data-id="${c.id}">${lang === 'en' ? 'Cancel' : 'Batal'}</button>
              <button class="btn-submit-reply" data-id="${c.id}">${lang === 'en' ? 'Send Reply' : 'Kirim Balasan'}</button>
            </div>
          </div>
        </div>

        <!-- Nested Replies List -->
        ${c.replies && c.replies.length > 0 ? `
          <div class="replies-nested-thread">
            ${c.replies.map(rep => this.renderCommentNodeHTML(rep, lang, true)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Bind all interactive events for comments
  public static bindCommentEvents(
    container: HTMLElement, 
    articleId: string, 
    lang: 'id' | 'en',
    onCountChange?: (count: number) => void
  ): void {
    const root = container.querySelector('#comments-section-root') as HTMLElement;
    if (!root) return;

    // Background sync from PostgreSQL server
    this.syncCommentsWithServer(container, articleId, lang, onCountChange);

    // 1. Google Login CTA Button (if unauthenticated)
    const loginBtn = root.querySelector('#btn-login-to-comment');
    loginBtn?.addEventListener('click', async () => {
      try {
        const res = await ReaderAuthService.signInWithGoogleOAuth();
        Toast.show(res.message);
        window.dispatchEvent(new CustomEvent('reader-auth-change'));
        this.refreshFullSection(container, articleId, lang, onCountChange);
      } catch {
        window.dispatchEvent(new CustomEvent('open-reader-auth-modal'));
      }
    });

    // 2. Submit Main Top-level Comment (Only if authenticated)
    const mainSubmitBtn = root.querySelector('#btn-submit-main-comment');
    const mainTextarea = root.querySelector('#comment-main-text') as HTMLTextAreaElement;

    mainSubmitBtn?.addEventListener('click', () => {
      const currentReader = ReaderAuthService.getCurrentReader();
      if (!currentReader) {
        Toast.show(lang === 'en' ? 'Please sign in with your Google account to comment.' : 'Silakan masuk dengan Akun Google terlebih dahulu.', 'warning');
        window.dispatchEvent(new CustomEvent('open-reader-auth-modal'));
        return;
      }

      const text = mainTextarea?.value.trim();
      if (!text) {
        Toast.show(lang === 'en' ? 'Please write your comment before submitting.' : 'Mohon tuliskan komentar Anda terlebih dahulu.', 'warning');
        return;
      }

      this.addComment(articleId, currentReader.name, text, null, currentReader.avatar);
      mainTextarea.value = '';
      Toast.show(lang === 'en' ? 'Comment published successfully!' : 'Komentar Anda berhasil dipublikasikan!');
      
      this.refreshCommentsView(container, articleId, lang, onCountChange);
    });

    // 3. Delegate Like & Reply Click Events
    const streamContainer = root.querySelector('#comments-stream-container');
    if (!streamContainer) return;

    streamContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const likeBtn = target.closest('[data-action="like-comment"]') as HTMLElement;
      const replyBtn = target.closest('[data-action="reply-comment"]') as HTMLElement;
      const cancelReplyBtn = target.closest('.btn-cancel-reply') as HTMLElement;
      const submitReplyBtn = target.closest('.btn-submit-reply') as HTMLElement;

      // Handle Like Comment (Enforces Reader Login)
      if (likeBtn) {
        const isReaderLoggedIn = ReaderAuthService.isReaderLoggedIn();
        if (!isReaderLoggedIn) {
          Toast.show(lang === 'en' ? 'Please log in to like comments.' : 'Silakan login terlebih dahulu untuk menyukai komentar ini.', 'warning');
          window.dispatchEvent(new CustomEvent('open-reader-auth-modal'));
          return;
        }

        const commentId = likeBtn.getAttribute('data-id');
        if (commentId) {
          const { isLiked, newCount } = this.toggleLikeComment(articleId, commentId);
          likeBtn.classList.toggle('active', isLiked);
          const counterSpan = likeBtn.querySelector('.comment-like-count');
          if (counterSpan) counterSpan.textContent = String(newCount);
          const svg = likeBtn.querySelector('svg');
          if (svg) svg.setAttribute('fill', isLiked ? 'currentColor' : 'none');
        }
        return;
      }

      // Handle Toggle Reply Composer (Enforces Google Login)
      if (replyBtn) {
        const isReaderLoggedIn = ReaderAuthService.isReaderLoggedIn();
        if (!isReaderLoggedIn) {
          Toast.show(lang === 'en' ? 'Please sign in with Google to reply.' : 'Silakan masuk dengan Akun Google untuk membalas komentar.', 'warning');
          window.dispatchEvent(new CustomEvent('open-reader-auth-modal'));
          return;
        }

        const commentId = replyBtn.getAttribute('data-id');
        if (commentId) {
          const replyBox = root.querySelector(`#reply-box-${commentId}`) as HTMLElement;
          if (replyBox) {
            const isVisible = replyBox.style.display !== 'none';
            replyBox.style.display = isVisible ? 'none' : 'block';
            if (!isVisible) {
              const textEl = replyBox.querySelector('textarea');
              textEl?.focus();
            }
          }
        }
        return;
      }

      // Handle Cancel Reply
      if (cancelReplyBtn) {
        const commentId = cancelReplyBtn.getAttribute('data-id');
        if (commentId) {
          const replyBox = root.querySelector(`#reply-box-${commentId}`) as HTMLElement;
          if (replyBox) replyBox.style.display = 'none';
        }
        return;
      }

      // Handle Submit Reply (Enforces Google Login)
      if (submitReplyBtn) {
        const currentReader = ReaderAuthService.getCurrentReader();
        if (!currentReader) {
          Toast.show(lang === 'en' ? 'Please sign in with Google to reply.' : 'Silakan masuk dengan Akun Google terlebih dahulu.', 'warning');
          window.dispatchEvent(new CustomEvent('open-reader-auth-modal'));
          return;
        }

        const commentId = submitReplyBtn.getAttribute('data-id');
        if (commentId) {
          const textInput = root.querySelector(`#reply-text-${commentId}`) as HTMLTextAreaElement;
          const text = textInput?.value.trim();

          if (!text) {
            Toast.show(lang === 'en' ? 'Please enter your reply.' : 'Mohon tulis balasan Anda.', 'warning');
            return;
          }

          this.addComment(articleId, currentReader.name, text, commentId, currentReader.avatar);
          Toast.show(lang === 'en' ? 'Reply published!' : 'Balasan Anda berhasil dikirim!');
          this.refreshCommentsView(container, articleId, lang, onCountChange);
        }
      }
    });

    // 4. Listen to external login events to refresh comments section seamlessly
    const handleAuthEvent = () => {
      if (document.body.contains(root)) {
        this.refreshFullSection(container, articleId, lang, onCountChange);
      } else {
        window.removeEventListener('reader-auth-change', handleAuthEvent);
      }
    };
    window.addEventListener('reader-auth-change', handleAuthEvent);
  }

  // Refresh Entire Section (e.g. after login/logout)
  public static refreshFullSection(
    container: HTMLElement, 
    articleId: string, 
    lang: 'id' | 'en',
    onCountChange?: (count: number) => void
  ) {
    const root = container.querySelector('#comments-section-root');
    if (!root) return;

    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.renderCommentsSectionHTML(articleId, lang);
    const newRoot = tempWrapper.firstElementChild;
    if (newRoot) {
      root.replaceWith(newRoot);
      this.bindCommentEvents(container, articleId, lang, onCountChange);
    }
  }

  // Refresh View after adding/replying
  private static refreshCommentsView(
    container: HTMLElement, 
    articleId: string, 
    lang: 'id' | 'en',
    onCountChange?: (count: number) => void
  ) {
    const comments = this.getComments(articleId);
    const totalCount = this.countTotalComments(articleId);

    const stream = container.querySelector('#comments-stream-container');
    if (stream) {
      stream.innerHTML = this.renderCommentsListHTML(comments, lang);
    }

    const badge = container.querySelector('#comments-badge-counter');
    if (badge) {
      badge.textContent = `${totalCount} ${lang === 'en' ? 'Comments' : 'Tanggapan'}`;
    }

    if (onCountChange) {
      onCountChange(totalCount);
    }
  }

  // Background sync from PostgreSQL server
  public static async syncCommentsWithServer(
    container: HTMLElement, 
    articleId: string, 
    lang: 'id' | 'en',
    onCountChange?: (count: number) => void
  ): Promise<void> {
    try {
      const serverComments = await ApiService.getComments(articleId);
      if (serverComments && Array.isArray(serverComments) && serverComments.length > 0) {
        this.saveComments(articleId, serverComments);
        this.refreshCommentsView(container, articleId, lang, onCountChange);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi komentar dari server:', err);
    }
  }
}

