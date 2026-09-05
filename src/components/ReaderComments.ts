import { Toast } from '../utils/toast';

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

  // Realistic Pre-seeded comments for articles
  private static DEFAULT_SEED_COMMENTS: Record<string, CommentItem[]> = {
    'art-001': [
      {
        id: 'cmt-1',
        articleId: 'art-001',
        authorName: 'Dr. Irvan Kurniawan',
        authorRole: 'AI Infrastructure Researcher',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        content: 'Pembangunan superkomputer AI di IKN ini adalah tonggak besar kedaulatan komputasi nasional. Yang krusial sekarang adalah kesiapan talenta lokal dan keterbukaan akses API untuk kampus riset dan startup dalam negeri.',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        likesCount: 14,
        replies: [
          {
            id: 'cmt-1-1',
            articleId: 'art-001',
            authorName: 'Dimas Wicaksono',
            authorRole: 'Cloud Architect',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            content: 'Sepakat Pak Irvan. Efisiensi PUE data center hijau IKN dengan sumber hidro dan surya juga akan menekan OPEX pelatihan model LLM Bahasa Indonesia.',
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            likesCount: 6,
            parentId: 'cmt-1'
          }
        ]
      },
      {
        id: 'cmt-2',
        articleId: 'art-001',
        authorName: 'Sarah Alatas',
        authorRole: 'Tech VC Partner',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
        content: 'Investasi kluster GPU H200 di Asia Tenggara sedang sangat kompetitif. Langkah Indonesia ini tepat waktu sebelum tertinggal dari Singapura dan Malaysia.',
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        likesCount: 9,
        replies: []
      }
    ]
  };

  // Get All Comments for an article (Structured with replies)
  public static getComments(articleId: string): CommentItem[] {
    const raw = localStorage.getItem(this.STORAGE_PREFIX + articleId);
    if (!raw) {
      const seed = this.DEFAULT_SEED_COMMENTS[articleId] || [
        {
          id: `cmt-gen-${articleId}-1`,
          articleId: articleId,
          authorName: 'Bayu Pratama',
          authorRole: 'Senior Software Engineer',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          content: 'Ulasan yang sangat komprehensif dari redaksi QUERYINDO. Sangat relevan dengan arah transformasi ekosistem teknologi saat ini.',
          createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          likesCount: 5,
          replies: []
        }
      ];
      this.saveComments(articleId, seed);
      return seed;
    }

    try {
      return JSON.parse(raw);
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

    return { isLiked: newIsLiked, newCount: updatedCount };
  }

  // Add a new comment or reply
  public static addComment(
    articleId: string, 
    authorName: string, 
    content: string, 
    parentId?: string | null
  ): CommentItem {
    const comments = this.getComments(articleId);
    const newComment: CommentItem = {
      id: `cmt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      articleId,
      authorName: authorName.trim() || 'Pembaca QUERYINDO',
      authorRole: parentId ? 'Kontributor Tanggapan' : 'Pembaca Terverifikasi',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`,
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

        <!-- Main Comment Input Box -->
        <div class="comment-composer-card">
          <div class="composer-author-row">
            <input type="text" id="comment-author-input" class="comment-author-field" placeholder="${lang === 'en' ? 'Your Name or Alias...' : 'Nama Anda atau Alias Komunitas...'}" />
            <span class="composer-badge-note">${lang === 'en' ? 'Direct Post' : 'Publikasi Langsung'}</span>
          </div>
          <textarea class="comment-textarea-modern" id="comment-main-text" placeholder="${lang === 'en' ? 'Share your perspective, technical insight, or inquiry on this topic...' : 'Tuliskan pandangan, sanggahan kritis, atau wawasan teknis Anda seputar berita ini...'}" rows="3"></textarea>
          <div class="composer-actions-bar">
            <span class="composer-hint">${lang === 'en' ? 'Markdown formatting supported' : 'Mendukung pemformatan teks jelas'}</span>
            <button class="btn-post-comment" id="btn-submit-main-comment">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              ${lang === 'en' ? 'Post Comment' : 'Kirim Komentar'}
            </button>
          </div>
        </div>

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
    const avatarUrl = c.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.authorName)}`;

    return `
      <div class="comment-item-card ${isReply ? 'comment-item-reply' : ''}" id="comment-node-${c.id}" data-comment-id="${c.id}">
        <div class="comment-card-header">
          <div class="comment-user-info">
            <img src="${avatarUrl}" alt="${c.authorName}" class="comment-user-avatar" loading="lazy" />
            <div>
              <div class="comment-author-name">${c.authorName}</div>
              <div class="comment-meta-sub">
                <span class="comment-author-role">${c.authorRole || 'Pembaca Terverifikasi'}</span>
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
            <input type="text" class="reply-author-input" id="reply-author-${c.id}" placeholder="${lang === 'en' ? 'Your name...' : 'Nama Anda...'}" />
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

    // 1. Submit Main Top-level Comment
    const mainSubmitBtn = root.querySelector('#btn-submit-main-comment');
    const mainAuthorInput = root.querySelector('#comment-author-input') as HTMLInputElement;
    const mainTextarea = root.querySelector('#comment-main-text') as HTMLTextAreaElement;

    mainSubmitBtn?.addEventListener('click', () => {
      const text = mainTextarea?.value.trim();
      const author = mainAuthorInput?.value.trim() || 'Pembaca Terverifikasi';

      if (!text) {
        Toast.show(lang === 'en' ? 'Please write your comment before submitting.' : 'Mohon tuliskan komentar Anda terlebih dahulu.', 'warning');
        return;
      }

      this.addComment(articleId, author, text);
      mainTextarea.value = '';
      Toast.show(lang === 'en' ? 'Comment published successfully!' : 'Komentar Anda berhasil dipublikasikan!');
      
      this.refreshCommentsView(container, articleId, lang, onCountChange);
    });

    // 2. Delegate Like & Reply Click Events
    const streamContainer = root.querySelector('#comments-stream-container');
    if (!streamContainer) return;

    streamContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const likeBtn = target.closest('[data-action="like-comment"]') as HTMLElement;
      const replyBtn = target.closest('[data-action="reply-comment"]') as HTMLElement;
      const cancelReplyBtn = target.closest('.btn-cancel-reply') as HTMLElement;
      const submitReplyBtn = target.closest('.btn-submit-reply') as HTMLElement;

      // Handle Like Comment
      if (likeBtn) {
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

      // Handle Toggle Reply Composer
      if (replyBtn) {
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

      // Handle Submit Reply
      if (submitReplyBtn) {
        const commentId = submitReplyBtn.getAttribute('data-id');
        if (commentId) {
          const authorInput = root.querySelector(`#reply-author-${commentId}`) as HTMLInputElement;
          const textInput = root.querySelector(`#reply-text-${commentId}`) as HTMLTextAreaElement;
          const text = textInput?.value.trim();
          const author = authorInput?.value.trim() || 'Pembaca Terverifikasi';

          if (!text) {
            Toast.show(lang === 'en' ? 'Please enter your reply.' : 'Mohon tulis balasan Anda.', 'warning');
            return;
          }

          this.addComment(articleId, author, text, commentId);
          Toast.show(lang === 'en' ? 'Reply published!' : 'Balasan Anda berhasil dikirim!');
          this.refreshCommentsView(container, articleId, lang, onCountChange);
        }
      }
    });
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
}
