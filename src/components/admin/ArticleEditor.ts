import type { Article, CategoryId } from '../../types/news';
import { CATEGORIES } from '../../data/mockNews';
import { AuthService } from '../../services/authService';
import { AuthorService } from '../../services/authorService';
import { ArticleService } from '../../services/articleService';
import { Toast } from '../../utils/toast';
import { ImageUtils } from '../../utils/imageUtils';
import { escapeHtml } from '../../utils/helpers';

export class ArticleEditor {
  // Professional Fullscreen Manuscript WYSIWYG & Visual Studio Canvas
  public static open(article: Article | null, _parentModal: HTMLElement, onSave: () => void) {
    const isEdit = article !== null;
    const user = AuthService.getCurrentUser();

    const initialContent = article ? article.content : `
      <p class="article-lead">Tulis paragraf pembuka naskah berita di sini dengan bahasa lugas dan berbobot.</p>
      <h2>Sub-Bab Analisis & Fakta Lapangan</h2>
      <p>Paparkan fakta teknis, kutipan narasumber, atau temuan investigasi di paragraf ini.</p>
      <blockquote>"Kedaulatan digital dan komputasi cerdas menjadi pilar masa depan pertumbuhan ekonomi nasional."</blockquote>
    `;

    const authorsList = AuthorService.getAuthors();
    const currentAuthorName = article ? article.author.name : (user?.fullName || 'Rijal Umami');
    const isKnownAuthor = authorsList.some(a => a.name.toLowerCase() === currentAuthorName.toLowerCase());

    const editorPage = document.createElement('div');
    editorPage.id = 'manuscript-editor-fullscreen';
    editorPage.setAttribute('data-lenis-prevent', 'true');
    editorPage.style.position = 'fixed';
    editorPage.style.inset = '0';
    editorPage.style.zIndex = '3000';
    editorPage.style.background = 'var(--bg-primary)';
    editorPage.style.color = 'var(--text-primary)';
    editorPage.style.display = 'flex';
    editorPage.style.flexDirection = 'column';
    editorPage.style.overflow = 'hidden';

    editorPage.innerHTML = `
      <!-- Professional Editor Header Bar -->
      <header style="height: 4.25rem; flex-shrink: 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); padding: 0 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <button id="editor-back-btn" style="padding: 0.45rem 0.9rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-primary); font-weight: 700; font-size: 0.825rem; display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
            ← Kembali ke Dasbor CMS
          </button>
          <div style="height: 1.5rem; width: 1px; background: var(--border-color);"></div>
          <div>
            <h2 style="font-size: 1.1rem; font-weight: 800;">${isEdit ? 'Sunting Naskah Berita' : 'Studio Penulisan Berita Pro'}</h2>
            <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">QUERYINDO Manuscript Engine — ${user?.fullName || 'Rijal Umami'}</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button type="submit" form="editor-fullscreen-form" style="padding: 0.6rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.875rem; box-shadow: var(--shadow-glow); cursor: pointer;">
            ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Berita'}
          </button>
        </div>
      </header>

      <!-- Fullscreen Body Layout Grid -->
      <form id="editor-fullscreen-form" data-lenis-prevent style="flex: 1; height: calc(100vh - 4.25rem); display: grid; grid-template-columns: 1fr 1fr 360px; overflow: hidden;">
        <!-- Left Column: Title, Toolbar, & Visual WYSIWYG Canvas -->
        <div data-lenis-prevent style="height: 100%; padding: 2rem 2.5rem; overflow-y: auto !important; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <input type="text" id="edit-title" required value="${article ? article.title : ''}" placeholder="Masukkan Judul Berita Utama..." style="width: 100%; padding: 0.75rem 0; background: transparent; border: none; border-bottom: 2px solid var(--border-color); color: var(--text-primary); font-size: 1.6rem; font-weight: 800; font-family: var(--font-main);" />
          </div>

          <div>
            <input type="text" id="edit-subtitle" required value="${article ? article.subtitle : ''}" placeholder="Sub-judul / Ringkasan Pengantar Berita (1-2 kalimat)..." style="width: 100%; padding: 0.6rem 0; background: transparent; border: none; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); font-size: 1.05rem;" />
          </div>

          <!-- Professional Editorial Formatting Toolbar -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.5rem 0.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px);">
            <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
              <button type="button" class="btn-tb" data-cmd="bold" title="Tebal (Bold) <b>"><b>B</b></button>
              <button type="button" class="btn-tb" data-cmd="italic" title="Miring (Italic) <i>"><i>I</i></button>
              <button type="button" class="btn-tb" data-cmd="underline" title="Garis Bawah <u>"><u>U</u></button>
              <div style="width: 1px; height: 1.2rem; background: var(--border-color); margin: 0 0.2rem;"></div>
              
              <button type="button" class="btn-tb-tag" data-tag="h2" title="Sub-Judul Utama (H2)">H2</button>
              <button type="button" class="btn-tb-tag" data-tag="h3" title="Sub-Judul (H3)">H3</button>
              <button type="button" class="btn-tb-tag" data-tag="lead" title="Paragraf Lead">Lead</button>
              <button type="button" class="btn-tb-tag" data-tag="blockquote" title="Blok Kutipan (Quote)">Kutipan</button>
              <div style="width: 1px; height: 1.2rem; background: var(--border-color); margin: 0 0.2rem;"></div>

              <button type="button" class="btn-tb" data-cmd="insertUnorderedList" title="Daftar Bullet (List)">List</button>
              <button type="button" class="btn-tb" data-cmd="insertOrderedList" title="Daftar Angka">123</button>
              <button type="button" class="btn-tb" id="btn-tb-link" title="Sisipkan Tautan (Link)">Link</button>
              <button type="button" class="btn-tb" id="btn-tb-img" title="Sisipkan Gambar Berita (URL Link)" style="display:inline-flex; align-items:center; gap:0.3rem; color:var(--accent-cyan); font-weight:700;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Gambar (URL)</span>
              </button>
            </div>

            <!-- View Switcher Toggle -->
            <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-tertiary); padding: 0.15rem 0.3rem; border-radius: var(--radius-full); border: 1px solid var(--border-color);">
              <button type="button" id="btn-mode-visual" class="btn-mode-toggle active" style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; color: #000; background: var(--accent-cyan); border: none; cursor: pointer;">Visual</button>
              <button type="button" id="btn-mode-code" class="btn-mode-toggle" style="padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; color: var(--text-muted); background: transparent; border: none; cursor: pointer;">HTML</button>
            </div>
          </div>

          <!-- Manuscript Canvas Container -->
          <div style="display: flex; flex-direction: column; position: relative; margin-bottom: 2rem;">
            <div id="wysiwyg-editor-canvas" contenteditable="true" style="min-height: 480px; height: auto; box-sizing: border-box; padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-main); font-size: 1.05rem; line-height: 1.75; outline: none; margin-bottom: 1.5rem;">
              ${initialContent}
            </div>

            <textarea id="edit-content" name="content" style="display: none; min-height: 480px; height: auto; box-sizing: border-box; padding: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.5; resize: vertical; margin-bottom: 1.5rem;">${initialContent}</textarea>
          </div>

          <!-- Real-Time Word & Reading Time Analytics Bar (Docked Bottom Footer) -->
          <div style="position: sticky; bottom: -2rem; z-index: 50; margin: 0 -2.5rem -2rem -2.5rem; background: var(--bg-secondary); padding: 0.75rem 2.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted); box-shadow: 0 -4px 16px rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
            <div style="display: flex; gap: 1.25rem; font-family: var(--font-mono);">
              <span><strong id="cnt-words" style="color: var(--accent-cyan);">0</strong> Kata</span>
              <span><strong id="cnt-chars" style="color: var(--accent-violet);">0</strong> Karakter</span>
              <span>Estimasi Waktu Baca: <strong id="cnt-readtime" style="color: var(--accent-emerald);">1m</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--accent-emerald);">
              <span>Auto-saved</span>
            </div>
          </div>
        </div>

        <!-- Middle Column: Live Reader Preview Column -->
        <div data-lenis-prevent style="height: 100%; padding: 2rem 2.5rem; overflow-y: auto !important; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; background: var(--bg-tertiary); display: flex; flex-direction: column; gap: 1.5rem; border-right: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono); display: flex; align-items: center; gap: 0.4rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Pratinjau Langsung Pembaca (Live Preview)</span>
          </div>

          <div class="reader-header" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div class="badge-group" style="margin-bottom: 0.75rem;">
              <span class="tag-badge" id="preview-category-badge" style="text-transform: uppercase;">${article ? article.category.toUpperCase() : 'TEKNO'}</span>
            </div>
            <h1 class="reader-title" id="preview-title" style="font-size: 1.5rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.75rem; color: var(--text-primary);">${article ? article.title : '[Judul Berita]'}</h1>
            <p class="reader-subtitle" id="preview-subtitle" style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.45;">${article ? article.subtitle : '[Sub-judul berita]'}</p>
          </div>

          <div class="article-rich-content size-normal" id="preview-content-body">
            ${initialContent}
          </div>
        </div>

        <!-- Right Sidebar Area: Metadata, Monetization & Transparency Attributes -->
        <div data-lenis-prevent style="height: 100%; background: var(--bg-secondary); padding: 2rem 1.5rem; overflow-y: auto !important; scroll-behavior: smooth; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; gap: 1.25rem;">
          <h3 style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">Atribut & Kemitraan</h3>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kategori Berita</label>
            <select id="edit-category" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem; font-weight: 600;">
              ${CATEGORIES.filter(c => c.id !== 'all').map(c => `
                <option value="${c.id}" ${article && article.category === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tags Berita (Pisahkan Koma)</label>
            <input type="text" id="edit-tags" value="${article ? article.tags.join(', ') : 'Teknologi, Indonesia, AI'}" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">URL Sampul Berita (HD Image)</label>
              <label for="edit-image-file-input" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat</span>
              </label>
              <input type="file" id="edit-image-file-input" accept="image/*" style="display: none;" />
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="edit-image-preview" src="${article ? ImageUtils.normalizeImageUrl(article.imageUrl) : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}" style="width: 72px; height: 48px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--border-color); flex-shrink: 0; background: var(--bg-tertiary);" />
              <input type="text" id="edit-image-url" required value="${article ? article.imageUrl : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}" placeholder="Tempel URL gambar atau link Google Drive..." style="flex: 1; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div id="edit-image-help" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.4;">
              💡 <em>Mendukung upload dari laptop/HP, Unsplash, atau Google Drive. (Jika pakai Google Drive, pastikan file diset ke <strong>"Siapa saja yang memiliki link / Anyone with link"</strong>).</em>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Penulis / Jurnalis</label>
            <select id="edit-author-select" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 600;">
              ${authorsList.map(a => `
                <option value="${a.name}" ${currentAuthorName.toLowerCase() === a.name.toLowerCase() ? 'selected' : ''}>
                  ${a.name} (${a.role})
                </option>
              `).join('')}
              <option value="__custom__" ${!isKnownAuthor ? 'selected' : ''}>+ Tulis Nama Jurnalis Manual...</option>
            </select>
            <input type="text" id="edit-author-custom" value="${!isKnownAuthor ? currentAuthorName : ''}" placeholder="Tuliskan nama jurnalis manual..." style="display: ${!isKnownAuthor ? 'block' : 'none'}; width: 100%; margin-top: 0.5rem; padding: 0.55rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-size: 0.85rem;" />
          </div>
        </div>
      </form>
    `;

    document.body.appendChild(editorPage);
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('modal-opened'));

    // Elements
    const wysiwygCanvas = editorPage.querySelector('#wysiwyg-editor-canvas') as HTMLDivElement;
    const rawTextarea = editorPage.querySelector('#edit-content') as HTMLTextAreaElement;
    const cntWords = editorPage.querySelector('#cnt-words') as HTMLElement;
    const cntChars = editorPage.querySelector('#cnt-chars') as HTMLElement;
    const cntReadtime = editorPage.querySelector('#cnt-readtime') as HTMLElement;

    // Live Preview Elements
    const previewTitle = editorPage.querySelector('#preview-title') as HTMLElement;
    const previewSubtitle = editorPage.querySelector('#preview-subtitle') as HTMLElement;
    const previewCategory = editorPage.querySelector('#preview-category-badge') as HTMLElement;
    const previewBody = editorPage.querySelector('#preview-content-body') as HTMLElement;

    const editTitle = editorPage.querySelector('#edit-title') as HTMLInputElement;
    const editSubtitle = editorPage.querySelector('#edit-subtitle') as HTMLInputElement;
    const editCategory = editorPage.querySelector('#edit-category') as HTMLSelectElement;

    const authorSelect = editorPage.querySelector('#edit-author-select') as HTMLSelectElement;
    const authorCustomInput = editorPage.querySelector('#edit-author-custom') as HTMLInputElement;

    if (authorSelect && authorCustomInput) {
      authorSelect.addEventListener('change', () => {
        authorCustomInput.style.display = authorSelect.value === '__custom__' ? 'block' : 'none';
        if (authorSelect.value === '__custom__') {
          authorCustomInput.focus();
        }
      });
    }

    // Article Image URL and File Upload Handlers
    const editImageInput = editorPage.querySelector('#edit-image-url') as HTMLInputElement;
    const editImagePreview = editorPage.querySelector('#edit-image-preview') as HTMLImageElement;
    const editImageFileInput = editorPage.querySelector('#edit-image-file-input') as HTMLInputElement;

    const updateImagePreview = (rawUrl: string) => {
      const normalized = ImageUtils.normalizeImageUrl(rawUrl);
      if (normalized !== rawUrl && editImageInput) {
        editImageInput.value = normalized;
      }
      if (editImagePreview) {
        editImagePreview.src = normalized;
      }
    };

    if (editImageInput && editImagePreview) {
      editImageInput.addEventListener('input', () => updateImagePreview(editImageInput.value));
      editImageInput.addEventListener('change', () => updateImagePreview(editImageInput.value));
      editImageInput.addEventListener('paste', () => setTimeout(() => updateImagePreview(editImageInput.value), 40));

      editImagePreview.onerror = () => {
        const cur = editImagePreview.src;
        if (cur.includes('lh3.googleusercontent.com/d/')) {
          const id = cur.split('/d/')[1];
          if (id) {
            editImagePreview.src = `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
            return;
          }
        }
        editImagePreview.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
      };
    }

    if (editImageFileInput) {
      editImageFileInput.addEventListener('change', () => {
        const file = editImageFileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 1200, 0.85, (dataUrl) => {
            if (editImageInput) editImageInput.value = dataUrl;
            if (editImagePreview) editImagePreview.src = dataUrl;
            Toast.show('Gambar sampul berhasil diunggah dari perangkat!');
          }, (err) => {
            Toast.show(err, 'warning');
          });
        }
      });
    }

    // Live preview sync function
    const syncLivePreview = () => {
      if (previewTitle && editTitle) {
        previewTitle.textContent = editTitle.value.trim() || '[Judul Berita]';
      }
      if (previewSubtitle && editSubtitle) {
        previewSubtitle.textContent = editSubtitle.value.trim() || '[Sub-judul berita]';
      }
      if (previewCategory && editCategory) {
        previewCategory.textContent = editCategory.value.toUpperCase();
      }
      if (previewBody) {
        previewBody.innerHTML = wysiwygCanvas.style.display !== 'none'
          ? ArticleEditor.getCleanArticleHtml(wysiwygCanvas)
          : rawTextarea.value;
      }
    };

    // Unified sync function for content, analytics, and live preview
    const syncAll = () => {
      rawTextarea.value = ArticleEditor.getCleanArticleHtml(wysiwygCanvas);
      updateAnalytics();
    };

    // Analytics Counter Updater
    const updateAnalytics = () => {
      const text = wysiwygCanvas.innerText || wysiwygCanvas.textContent || '';
      const charCount = text.length;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 180));

      if (cntWords) cntWords.textContent = wordCount.toLocaleString('id-ID');
      if (cntChars) cntChars.textContent = charCount.toLocaleString('id-ID');
      if (cntReadtime) cntReadtime.textContent = `${readTime}m`;

      syncLivePreview();
    };

    // Initial hydration of existing figures in canvas
    ArticleEditor.hydrateCanvasFigures(wysiwygCanvas, syncAll);
    updateAnalytics();

    // Listeners for Live Metadata Changes
    editTitle?.addEventListener('input', syncLivePreview);
    editSubtitle?.addEventListener('input', syncLivePreview);
    editCategory?.addEventListener('change', syncLivePreview);

    // Sync Content WYSIWYG <-> Textarea
    wysiwygCanvas.addEventListener('input', () => {
      syncAll();
    });

    // Click outside figures deselects all selected figures smoothly
    wysiwygCanvas.addEventListener('click', (e) => {
      const targetFig = (e.target as HTMLElement).closest('.article-inline-image');
      if (!targetFig) {
        wysiwygCanvas.querySelectorAll('.article-inline-image.is-selected').forEach(f => {
          f.classList.remove('is-selected');
          f.setAttribute('draggable', 'false');
        });
      }
    });

    // Keyboard shortcuts for selected figure: Delete, Backspace, Alt+Up, Alt+Down
    wysiwygCanvas.addEventListener('keydown', (e) => {
      const selectedFig = wysiwygCanvas.querySelector('.article-inline-image.is-selected') as HTMLElement | null;
      if (!selectedFig) return;

      const activeEl = document.activeElement;
      if (activeEl && selectedFig.querySelector('figcaption')?.contains(activeEl)) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const nextSibling = selectedFig.nextElementSibling as HTMLElement | null || selectedFig.previousElementSibling as HTMLElement | null;
        selectedFig.remove();
        syncAll();
        if (nextSibling) {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(nextSibling);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
          nextSibling.focus();
        }
        Toast.show('Gambar berhasil dihapus dari naskah.');
      } else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = selectedFig.previousElementSibling as HTMLElement | null;
        if (prev) {
          prev.before(selectedFig);
          selectedFig.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          syncAll();
          Toast.show('Gambar digeser ke atas.');
        }
      } else if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        const next = selectedFig.nextElementSibling as HTMLElement | null;
        if (next) {
          next.after(selectedFig);
          if (!selectedFig.nextElementSibling) {
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            selectedFig.after(p);
          }
          selectedFig.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          syncAll();
          Toast.show('Gambar digeser ke bawah.');
        }
      }
    });

    // Canvas Drag-and-Drop Relocation Mechanics
    wysiwygCanvas.addEventListener('dragover', (e: DragEvent) => {
      const draggedFig = (wysiwygCanvas as any)._draggedFigure as HTMLElement | null;
      if (!draggedFig) return;

      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }

      const children = Array.from(wysiwygCanvas.children).filter(
        c => c !== draggedFig && !c.classList.contains('wysiwyg-drop-indicator')
      ) as HTMLElement[];

      if (children.length === 0) return;

      const clientY = e.clientY;
      let targetBlock: HTMLElement | null = null;
      let insertPos: 'before' | 'after' = 'after';

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const rect = child.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (clientY < midY) {
          targetBlock = child;
          insertPos = 'before';
          break;
        } else if (i === children.length - 1 || clientY < rect.bottom) {
          targetBlock = child;
          insertPos = 'after';
          break;
        }
      }

      if (!targetBlock) {
        targetBlock = children[children.length - 1];
        insertPos = 'after';
      }

      let dropIndicator = wysiwygCanvas.querySelector('.wysiwyg-drop-indicator') as HTMLElement | null;
      if (!dropIndicator) {
        dropIndicator = document.createElement('div');
        dropIndicator.className = 'wysiwyg-drop-indicator';
      }

      if (insertPos === 'before') {
        if (dropIndicator.nextElementSibling !== targetBlock) {
          targetBlock.before(dropIndicator);
        }
      } else {
        if (dropIndicator.previousElementSibling !== targetBlock) {
          targetBlock.after(dropIndicator);
        }
      }
    });

    wysiwygCanvas.addEventListener('dragleave', (e: DragEvent) => {
      const rect = wysiwygCanvas.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        wysiwygCanvas.querySelector('.wysiwyg-drop-indicator')?.remove();
      }
    });

    wysiwygCanvas.addEventListener('drop', (e: DragEvent) => {
      const draggedFig = (wysiwygCanvas as any)._draggedFigure as HTMLElement | null;
      if (!draggedFig) return;

      e.preventDefault();

      const dropIndicator = wysiwygCanvas.querySelector('.wysiwyg-drop-indicator') as HTMLElement | null;
      if (dropIndicator) {
        dropIndicator.replaceWith(draggedFig);
      }

      // Ensure trailing editable paragraph exists if placed at the end
      let nextEl = draggedFig.nextElementSibling as HTMLElement | null;
      if (!nextEl || nextEl.tagName.toLowerCase() === 'figure') {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        draggedFig.after(p);
      }

      draggedFig.classList.remove('is-dragging');
      draggedFig.classList.add('is-selected');
      delete (wysiwygCanvas as any)._draggedFigure;

      syncAll();
      Toast.show('Posisi gambar berhasil dipindahkan!');
    });

    rawTextarea.addEventListener('input', () => {
      wysiwygCanvas.innerHTML = rawTextarea.value;
      ArticleEditor.hydrateCanvasFigures(wysiwygCanvas, syncAll);
      updateAnalytics();
    });

    // Formatting Toolbar Event Listeners
    editorPage.querySelectorAll('.btn-tb[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (cmd) {
          document.execCommand(cmd, false);
          wysiwygCanvas.focus();
          syncAll();
        }
      });
    });

    editorPage.querySelectorAll('.btn-tb-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        if (tag === 'h2' || tag === 'h3') {
          document.execCommand('formatBlock', false, `<${tag}>`);
        } else if (tag === 'blockquote') {
          document.execCommand('formatBlock', false, '<blockquote>');
        } else if (tag === 'lead') {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const p = document.createElement('p');
            p.className = 'article-lead';
            p.textContent = range.toString() || 'Paragraf lead pembuka berita utama';
            range.deleteContents();
            range.insertNode(p);
          }
        }
        wysiwygCanvas.focus();
        syncAll();
      });
    });

    // Insert Link
    editorPage.querySelector('#btn-tb-link')?.addEventListener('click', () => {
      const url = prompt('Masukkan URL tautan:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        wysiwygCanvas.focus();
        syncAll();
      }
    });

    // Insert Editorial In-Content Image via URL Modal
    editorPage.querySelector('#btn-tb-img')?.addEventListener('click', () => {
      let targetBlock: HTMLElement | null = null;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        let node: Node | null = r.startContainer;
        while (node && node !== wysiwygCanvas) {
          if (node.parentElement === wysiwygCanvas && node instanceof HTMLElement) {
            targetBlock = node;
            break;
          }
          node = node.parentElement;
        }
      }

      ArticleEditor.openInlineImageModal(editorPage, null, (figureHtml) => {
        wysiwygCanvas.focus();
        ArticleEditor.insertInlineImage(figureHtml, wysiwygCanvas, targetBlock, syncAll);
      });
    });

    // Drag-over and drop support for figure dragging between paragraphs
    wysiwygCanvas.addEventListener('dragover', (e) => {
      const dragged = (wysiwygCanvas as any)._draggedFigure as HTMLElement | null;
      if (!dragged) return;
      e.preventDefault();
      const target = (e.target as HTMLElement).closest('#wysiwyg-editor-canvas > p, #wysiwyg-editor-canvas > h2, #wysiwyg-editor-canvas > h3, #wysiwyg-editor-canvas > blockquote, #wysiwyg-editor-canvas > figure') as HTMLElement | null;
      if (target && target !== dragged) {
        const rect = target.getBoundingClientRect();
        if (e.clientY > rect.top + rect.height / 2) {
          target.after(dragged);
        } else {
          target.before(dragged);
        }
      }
    });

    wysiwygCanvas.addEventListener('drop', (e) => {
      const dragged = (wysiwygCanvas as any)._draggedFigure as HTMLElement | null;
      if (!dragged) return;
      e.preventDefault();
      dragged.classList.remove('is-dragging');
      delete (wysiwygCanvas as any)._draggedFigure;
      syncAll();
      Toast.show('Posisi gambar berhasil dipindahkan.');
    });

    // Toggle Visual vs HTML Mode
    const btnVisual = editorPage.querySelector('#btn-mode-visual') as HTMLButtonElement;
    const btnCode = editorPage.querySelector('#btn-mode-code') as HTMLButtonElement;

    btnVisual?.addEventListener('click', () => {
      btnVisual.classList.add('active');
      btnVisual.style.background = 'var(--accent-cyan)';
      btnVisual.style.color = '#000';

      btnCode.classList.remove('active');
      btnCode.style.background = 'transparent';
      btnCode.style.color = 'var(--text-muted)';

      wysiwygCanvas.style.display = 'block';
      rawTextarea.style.display = 'none';
      wysiwygCanvas.innerHTML = rawTextarea.value;
      ArticleEditor.hydrateCanvasFigures(wysiwygCanvas, syncAll);
      updateAnalytics();
    });

    btnCode?.addEventListener('click', () => {
      btnCode.classList.add('active');
      btnCode.style.background = 'var(--accent-cyan)';
      btnCode.style.color = '#000';

      btnVisual.classList.remove('active');
      btnVisual.style.background = 'transparent';
      btnVisual.style.color = 'var(--text-muted)';

      rawTextarea.style.display = 'block';
      wysiwygCanvas.style.display = 'none';
      rawTextarea.value = ArticleEditor.getCleanArticleHtml(wysiwygCanvas);
    });

    // Close & Return
    const closeEditor = () => {
      editorPage.remove();
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('modal-closed'));
    };

    editorPage.querySelector('#editor-back-btn')?.addEventListener('click', closeEditor);

    // Submit Fullscreen Form Handler
    const form = editorPage.querySelector('#editor-fullscreen-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (editorPage.querySelector('#edit-title') as HTMLInputElement).value;
      const subtitle = (editorPage.querySelector('#edit-subtitle') as HTMLInputElement).value;
      const category = (editorPage.querySelector('#edit-category') as HTMLSelectElement).value as CategoryId;
      const tagsStr = (editorPage.querySelector('#edit-tags') as HTMLInputElement).value;
      const rawImageUrl = (editorPage.querySelector('#edit-image-url') as HTMLInputElement).value.trim();
      const imageUrl = ImageUtils.normalizeImageUrl(rawImageUrl);
      
      let authorName = authorSelect?.value === '__custom__' ? authorCustomInput?.value.trim() : authorSelect?.value;
      if (!authorName) authorName = user?.fullName || 'Rijal Umami';

      const matchedAuthor = AuthorService.getAuthorByName(authorName);
      const authorAvatar = matchedAuthor?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
      const authorRole = matchedAuthor?.role || 'Jurnalis Redaksi';

      const content = ArticleEditor.getCleanArticleHtml(wysiwygCanvas);
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      if (isEdit && article) {
        await ArticleService.updateArticle(article.id, {
          title,
          subtitle,
          category,
          tags,
          imageUrl,
          author: {
            name: authorName,
            role: authorRole,
            avatar: authorAvatar
          },
          aiSummary: article.aiSummary || [],
          content,
          isFactChecked: false,
          isPremium: false,
          isSponsored: false
        });
        Toast.show('Perubahan naskah berita berhasil disimpan.');
      } else {
        const newArt: Article = {
          id: `art-${Date.now().toString().slice(-4)}`,
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          subtitle,
          category,
          tags,
          author: {
            name: authorName,
            role: authorRole,
            avatar: authorAvatar
          },
          publishedAt: new Date().toISOString(),
          readTimeMinutes: Math.max(3, Math.ceil(content.length / 500)),
          imageUrl,
          isFeatured: false,
          isTrending: false,
          isBreaking: false,
          isFactChecked: false,
          isPremium: false,
          isSponsored: false,
          viewsCount: 0,
          likesCount: 0,
          aiSummary: [],
          content
        };
        await ArticleService.createArticle(newArt);
        Toast.show('Berita baru berhasil diterbitkan di QUERYINDO!');
      }

      onSave();
      closeEditor();
    });
  }

  // ==========================================================================
  // Inline Article Image Engine (Microsoft Word Concept: Handles & Layout Options)
  // ==========================================================================

  private static openInlineImageModal(
    _parentContainer: HTMLElement,
    existingData: { url: string; align: string; caption: string; source: string } | null,
    onConfirm: (figureHtml: string) => void
  ) {
    const isEdit = existingData !== null;
    let selectedAlign = existingData?.align || 'center';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'inline-img-modal-overlay';
    modalOverlay.style.cssText = `
      position: fixed; inset: 0; z-index: 6000;
      background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; padding: 1.25rem;
    `;

    modalOverlay.innerHTML = `
      <div class="inline-img-modal-card" style="max-width: 520px;">
        <!-- Header -->
        <div style="padding: 1.1rem 1.4rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>${isEdit ? 'Ubah Informasi Gambar Naskah' : 'Sisipkan Gambar (URL / Tautan)'}</span>
            </h3>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Sederhana seperti Microsoft Word: masukkan tautan, atur tata letak & keterangan.</p>
          </div>
          <button type="button" id="modal-inline-close-btn" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-secondary); width: 28px; height: 28px; border-radius: 50%; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- Body -->
        <div style="padding: 1.25rem 1.4rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; max-height: calc(85vh - 120px);">
          <!-- URL Input -->
          <div>
            <label style="display: block; font-size: 0.76rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.35rem;">
              URL / Link Tautan Gambar
            </label>
            <input type="url" id="modal-inline-url" required value="${existingData ? escapeHtml(existingData.url) : ''}" placeholder="https://images.unsplash.com/... atau tautan Google Drive / CDN" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; outline: none; font-family: var(--font-mono);" />
            <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">Tautan Google Drive (Share link) akan otomatis dinormalisasi.</span>
          </div>

          <!-- Live Image Preview Box -->
          <div id="modal-inline-preview-container" style="width: 100%; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; padding: 0.75rem; display: flex; flex-direction: column; align-items: center;">
            <div id="modal-inline-preview-frame" style="width: 100%; max-height: 200px; border-radius: var(--radius-sm); overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center;">
              <img id="modal-inline-preview-img" src="${existingData?.url || ''}" alt="Pratinjau Gambar" style="display: ${existingData?.url ? 'block' : 'none'}; max-width: 100%; max-height: 200px; object-fit: contain;" />
              <div id="modal-inline-preview-placeholder" style="display: ${existingData?.url ? 'none' : 'flex'}; padding: 1.8rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.78rem; flex-direction: column; align-items: center; gap: 0.4rem;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>Masukkan URL gambar untuk melihat pratinjau</span>
              </div>
            </div>
            <div id="modal-inline-preview-caption-text" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center; font-style: italic;">
              ${existingData?.caption ? escapeHtml(existingData.caption) : 'Keterangan gambar akan muncul di sini'}
            </div>
          </div>

          <!-- Placement (Wrap Text ala Word) -->
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.35rem;">
              Tata Letak Teks (Layout / Wrap Text)
            </label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
              <button type="button" class="inline-img-option-pill opt-align ${selectedAlign === 'left' ? 'active' : ''}" data-val="left">
                ⇦ Wrap Kiri
              </button>
              <button type="button" class="inline-img-option-pill opt-align ${selectedAlign === 'center' ? 'active' : ''}" data-val="center">
                ▣ In Line (Tengah)
              </button>
              <button type="button" class="inline-img-option-pill opt-align ${selectedAlign === 'right' ? 'active' : ''}" data-val="right">
                Wrap Kanan ⇨
              </button>
            </div>
          </div>

          <!-- Caption & Photo Source Credit -->
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.3rem;">
                Keterangan Foto (Caption)
              </label>
              <input type="text" id="modal-inline-caption" value="${existingData ? escapeHtml(existingData.caption) : ''}" placeholder="Penjelasan konteks foto..." style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.3rem;">
                Sumber Foto / Kredit
              </label>
              <input type="text" id="modal-inline-source" value="${existingData ? escapeHtml(existingData.source) : ''}" placeholder="Contoh: Reuters / ANTARA" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="padding: 1rem 1.4rem; background: var(--bg-secondary); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" id="modal-inline-cancel-btn" style="padding: 0.5rem 1.15rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-secondary); font-size: 0.825rem; font-weight: 600; cursor: pointer;">
            Batal
          </button>
          <button type="button" id="modal-inline-confirm-btn" style="padding: 0.5rem 1.4rem; background: var(--gradient-brand); color: #000; border-radius: var(--radius-full); font-size: 0.825rem; font-weight: 800; cursor: pointer; box-shadow: var(--shadow-glow);">
            ${isEdit ? 'Perbarui Gambar' : 'Sisipkan ke Naskah'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const urlInput = modalOverlay.querySelector('#modal-inline-url') as HTMLInputElement;
    const previewImg = modalOverlay.querySelector('#modal-inline-preview-img') as HTMLImageElement;
    const previewPlaceholder = modalOverlay.querySelector('#modal-inline-preview-placeholder') as HTMLElement;
    const previewCaption = modalOverlay.querySelector('#modal-inline-preview-caption-text') as HTMLElement;
    const captionInput = modalOverlay.querySelector('#modal-inline-caption') as HTMLInputElement;
    const sourceInput = modalOverlay.querySelector('#modal-inline-source') as HTMLInputElement;

    const updatePreview = () => {
      const rawUrl = urlInput.value.trim();
      const normUrl = ImageUtils.normalizeImageUrl(rawUrl);
      if (normUrl !== rawUrl) {
        urlInput.value = normUrl;
      }

      if (normUrl) {
        previewImg.src = normUrl;
        previewImg.style.display = 'block';
        previewPlaceholder.style.display = 'none';
      } else {
        previewImg.style.display = 'none';
        previewPlaceholder.style.display = 'flex';
      }

      const capText = captionInput.value.trim();
      const srcText = sourceInput.value.trim();
      if (capText || srcText) {
        previewCaption.innerHTML = `${escapeHtml(capText)} ${srcText ? `<strong style="color:var(--accent-cyan); font-style:normal;">(Foto: ${escapeHtml(srcText)})</strong>` : ''}`;
      } else {
        previewCaption.textContent = 'Keterangan gambar akan muncul di sini';
      }
    };

    updatePreview();

    urlInput.addEventListener('input', updatePreview);
    urlInput.addEventListener('paste', () => setTimeout(updatePreview, 40));
    captionInput.addEventListener('input', updatePreview);
    sourceInput.addEventListener('input', updatePreview);

    modalOverlay.querySelectorAll('.opt-align').forEach(btn => {
      btn.addEventListener('click', () => {
        modalOverlay.querySelectorAll('.opt-align').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAlign = btn.getAttribute('data-val') || 'center';
      });
    });

    const closeModal = () => modalOverlay.remove();
    modalOverlay.querySelector('#modal-inline-close-btn')?.addEventListener('click', closeModal);
    modalOverlay.querySelector('#modal-inline-cancel-btn')?.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    modalOverlay.querySelector('#modal-inline-confirm-btn')?.addEventListener('click', () => {
      const finalUrl = ImageUtils.normalizeImageUrl(urlInput.value.trim());
      if (!finalUrl) {
        Toast.show('Harap masukkan URL tautan gambar yang valid.', 'warning');
        urlInput.focus();
        return;
      }

      const finalCaption = captionInput.value.trim();
      const finalSource = sourceInput.value.trim();

      const figureHtml = `
        <figure class="article-inline-image align-${selectedAlign}" data-align="${selectedAlign}" contenteditable="false">
          <div class="inline-image-frame" contenteditable="false">
            <img src="${finalUrl}" alt="${escapeHtml(finalCaption || 'Ilustrasi Berita')}" loading="lazy" />
          </div>
          <figcaption contenteditable="true" placeholder="Tulis keterangan foto atau kredit sumber di sini...">
            ${finalCaption ? `<span class="inline-caption-text">${escapeHtml(finalCaption)}</span>` : ''}
            ${finalSource ? `<span class="inline-caption-source">(Foto: ${escapeHtml(finalSource)})</span>` : ''}
          </figcaption>
        </figure>
      `;

      closeModal();
      onConfirm(figureHtml);
    });
  }

  // ==========================================================================
  // In-Canvas Figure Engine (Word-Style Handles & Sibling Mechanics)
  // ==========================================================================

  // Clean HTML serializer: strips temporary editing handles and badges
  public static getCleanArticleHtml(wysiwygCanvas: HTMLElement): string {
    const clone = wysiwygCanvas.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.figure-canvas-tools, .crop-resize-handle, .word-resize-handle, .word-layout-badge, .word-dim-badge, .wysiwyg-drop-indicator').forEach(el => el.remove());
    clone.querySelectorAll('.article-inline-image').forEach(fig => {
      fig.removeAttribute('contenteditable');
      fig.removeAttribute('draggable');
      fig.classList.remove('is-selected', 'is-dragging');
      const frame = fig.querySelector('.inline-image-frame') as HTMLElement | null;
      if (frame) {
        frame.removeAttribute('contenteditable');
      }
      const figcaption = fig.querySelector('figcaption') as HTMLElement | null;
      if (figcaption) {
        figcaption.removeAttribute('contenteditable');
        figcaption.removeAttribute('placeholder');
        if (!figcaption.textContent?.trim()) {
          figcaption.remove();
        }
      }
    });
    return clone.innerHTML;
  }

  // Hydrate all figures inside wysiwyg editor canvas
  public static hydrateCanvasFigures(wysiwygCanvas: HTMLElement, syncCallback: () => void) {
    const figures = wysiwygCanvas.querySelectorAll<HTMLElement>('.article-inline-image');
    figures.forEach(fig => {
      ArticleEditor.hydrateSingleFigure(fig, wysiwygCanvas, syncCallback);
    });
  }

  // Hydrate a single figure with Word-style 8-point handles & floating Layout Options badge
  private static hydrateSingleFigure(figure: HTMLElement, wysiwygCanvas: HTMLElement, syncCallback: () => void) {
    figure.setAttribute('contenteditable', 'false');

    let frame = figure.querySelector('.inline-image-frame') as HTMLElement | null;
    let img = figure.querySelector('img') as HTMLImageElement | null;
    if (!frame && img) {
      frame = document.createElement('div');
      frame.className = 'inline-image-frame';
      img.before(frame);
      frame.appendChild(img);
    }
    if (frame) {
      frame.setAttribute('contenteditable', 'false');
    }

    let figcaption = figure.querySelector('figcaption') as HTMLElement | null;
    if (!figcaption) {
      figcaption = document.createElement('figcaption');
      figure.appendChild(figcaption);
    }
    figcaption.setAttribute('contenteditable', 'true');
    figcaption.setAttribute('placeholder', 'Tulis keterangan foto atau kredit sumber di sini...');

    // Live sync when editor types directly into caption
    figcaption.oninput = () => syncCallback();

    // Prevent figcaption clicks from bubbling to figure selection
    figcaption.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Clean up existing handles/badges to avoid duplicates
    figure.querySelectorAll('.figure-canvas-tools, .crop-resize-handle, .word-resize-handle, .word-layout-badge, .word-dim-badge').forEach(el => el.remove());

    // 1. Create 8 Microsoft Word-Style Resize Handles
    const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handlePositions.forEach(pos => {
      const h = document.createElement('div');
      h.className = `word-resize-handle handle-${pos}`;
      h.setAttribute('contenteditable', 'false');
      h.title = 'Tarik untuk mengubah ukuran gambar (seperti Microsoft Word)';
      figure.appendChild(h);

      // Mouse drag resizing
      h.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = figure.getBoundingClientRect().width;
        const startH = frame ? frame.getBoundingClientRect().height : figure.getBoundingClientRect().height;
        const canvasW = wysiwygCanvas.clientWidth - 32;

        document.body.style.userSelect = 'none';

        // Floating dimension tooltip
        let dimBadge = figure.querySelector('.word-dim-badge') as HTMLElement | null;
        if (!dimBadge) {
          dimBadge = document.createElement('div');
          dimBadge.className = 'word-dim-badge';
          dimBadge.setAttribute('contenteditable', 'false');
          figure.appendChild(dimBadge);
        }

        const updateDim = (w: number, h: number) => {
          if (dimBadge) {
            dimBadge.textContent = `${Math.round(w)} × ${Math.round(h)} px`;
          }
        };
        updateDim(startW, startH);

        const onMouseMove = (moveEvt: MouseEvent) => {
          const diffX = moveEvt.clientX - startX;
          const diffY = moveEvt.clientY - startY;

          let newW = startW;
          let newH = startH;

          // Width adjustment
          if (pos === 'e' || pos === 'se' || pos === 'ne') {
            newW = Math.max(140, Math.min(canvasW, startW + diffX));
            figure.style.width = `${Math.round(newW)}px`;
            figure.style.maxWidth = '100%';
          } else if (pos === 'w' || pos === 'sw' || pos === 'nw') {
            newW = Math.max(140, Math.min(canvasW, startW - diffX));
            figure.style.width = `${Math.round(newW)}px`;
            figure.style.maxWidth = '100%';
          }

          // Height adjustment (Crop)
          if (pos === 's' || pos === 'se' || pos === 'sw') {
            newH = Math.max(90, Math.min(900, startH + diffY));
            if (frame) {
              frame.style.height = `${Math.round(newH)}px`;
              frame.style.aspectRatio = 'auto';
            }
            if (img) img.style.objectFit = 'cover';
          } else if (pos === 'n' || pos === 'ne' || pos === 'nw') {
            newH = Math.max(90, Math.min(900, startH - diffY));
            if (frame) {
              frame.style.height = `${Math.round(newH)}px`;
              frame.style.aspectRatio = 'auto';
            }
            if (img) img.style.objectFit = 'cover';
          }

          updateDim(newW, newH);
        };

        const onMouseUp = () => {
          document.body.style.userSelect = '';
          dimBadge?.remove();
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          syncCallback();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });

    // 2. Create Floating Word-Style Layout Options Badge (Wrap Text & Movement)
    const align = figure.getAttribute('data-align') || (figure.classList.contains('align-left') ? 'left' : figure.classList.contains('align-right') ? 'right' : 'center');

    const badge = document.createElement('div');
    badge.className = 'word-layout-badge';
    badge.setAttribute('contenteditable', 'false');
    badge.innerHTML = `
      <button type="button" class="word-layout-btn opt-drag-handle" draggable="true" title="Tahan & tarik untuk menggeser posisi gambar ke paragraf lain" style="cursor: grab; background: rgba(0, 242, 254, 0.15); border-color: var(--accent-cyan); color: var(--accent-cyan);">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
        <span>Geser</span>
      </button>
      <button type="button" class="word-layout-btn opt-move-up" title="Geser gambar 1 paragraf ke atas (Alt + Panah Atas)">▲ Naik</button>
      <button type="button" class="word-layout-btn opt-move-down" title="Geser gambar 1 paragraf ke bawah (Alt + Panah Bawah)">▼ Turun</button>
      <div class="word-layout-divider"></div>
      <button type="button" class="word-layout-btn opt-wrap ${align === 'left' ? 'active' : ''}" data-align="left" title="Wrap Kiri: Teks mengalir di kanan gambar">⇦ Kiri</button>
      <button type="button" class="word-layout-btn opt-wrap ${align === 'center' ? 'active' : ''}" data-align="center" title="Tengah / In Line: Sejajar naskah penuh">▣ Tengah</button>
      <button type="button" class="word-layout-btn opt-wrap ${align === 'right' ? 'active' : ''}" data-align="right" title="Wrap Kanan: Teks mengalir di kiri gambar">Kanan ⇨</button>
      <div class="word-layout-divider"></div>
      <button type="button" class="word-layout-btn opt-edit" title="Ubah link gambar atau keterangan">✎ Ubah</button>
      <button type="button" class="word-layout-btn opt-delete danger" title="Hapus gambar dari naskah">🗑 Hapus</button>
    `;
    figure.appendChild(badge);

    // Movement Buttons: Move Up & Move Down
    badge.querySelector('.opt-move-up')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const prev = figure.previousElementSibling as HTMLElement | null;
      if (prev) {
        prev.before(figure);
        figure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        syncCallback();
        Toast.show('Gambar digeser ke atas.');
      } else {
        Toast.show('Gambar sudah berada di posisi paling atas.');
      }
    });

    badge.querySelector('.opt-move-down')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const next = figure.nextElementSibling as HTMLElement | null;
      if (next) {
        next.after(figure);
        if (!figure.nextElementSibling) {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          figure.after(p);
        }
        figure.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        syncCallback();
        Toast.show('Gambar digeser ke bawah.');
      } else {
        Toast.show('Gambar sudah berada di posisi paling bawah.');
      }
    });

    // Layout Option Buttons (Wrap Text)
    badge.querySelectorAll('.opt-wrap').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = (btn.getAttribute('data-align') || 'center') as 'left' | 'center' | 'right';
        figure.classList.remove('align-left', 'align-center', 'align-right');
        figure.classList.add(`align-${a}`);
        figure.setAttribute('data-align', a);
        badge.querySelectorAll('.opt-wrap').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        syncCallback();
      });
    });

    // Edit in Modal
    badge.querySelector('.opt-edit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const captionText = figure.querySelector('.inline-caption-text')?.textContent || '';
      const captionSource = figure.querySelector('.inline-caption-source')?.textContent?.replace(/^\(Foto:\s*|\)$/g, '') || '';
      const existingData = {
        url: img?.src || '',
        align: figure.getAttribute('data-align') || 'center',
        caption: captionText,
        source: captionSource
      };

      ArticleEditor.openInlineImageModal(wysiwygCanvas.closest('#manuscript-editor-fullscreen') as HTMLElement || document.body, existingData, (updatedFigureHtml) => {
        const temp = document.createElement('div');
        temp.innerHTML = updatedFigureHtml;
        const newFig = temp.querySelector('.article-inline-image') as HTMLElement | null;
        if (newFig) {
          if (figure.style.width) newFig.style.width = figure.style.width;
          const newFrame = newFig.querySelector('.inline-image-frame') as HTMLElement | null;
          if (newFrame && frame && frame.style.height) {
            newFrame.style.height = frame.style.height;
          }
          figure.replaceWith(newFig);
          ArticleEditor.hydrateSingleFigure(newFig, wysiwygCanvas, syncCallback);
          syncCallback();
          Toast.show('Pengaturan gambar berhasil diperbarui.');
        }
      });
    });

    // Delete Button
    badge.querySelector('.opt-delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextSibling = figure.nextElementSibling as HTMLElement | null || figure.previousElementSibling as HTMLElement | null;
      figure.remove();
      syncCallback();
      if (nextSibling) {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(nextSibling);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
        nextSibling.focus();
      }
      Toast.show('Gambar berhasil dihapus dari naskah.');
    });

    // 3. Selection & Caret Safety
    figure.setAttribute('draggable', 'true');

    figure.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('figcaption, .word-layout-badge')) return;
      e.stopPropagation();

      wysiwygCanvas.querySelectorAll('.article-inline-image.is-selected').forEach(f => {
        if (f !== figure) {
          f.classList.remove('is-selected');
        }
      });

      figure.classList.add('is-selected');
    });

    // Drag-and-drop initiation from figure or dedicated handle
    const startDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('figcaption') || (target.closest('.word-layout-btn') && !target.closest('.opt-drag-handle'))) {
        return;
      }

      wysiwygCanvas.querySelectorAll('.article-inline-image.is-selected').forEach(f => {
        if (f !== figure) f.classList.remove('is-selected');
      });
      figure.classList.add('is-selected');
      figure.classList.add('is-dragging');

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'queryindo-figure');
      }
      (wysiwygCanvas as any)._draggedFigure = figure;
    };

    figure.addEventListener('dragstart', startDrag);

    const dragHandle = badge.querySelector('.opt-drag-handle');
    dragHandle?.addEventListener('dragstart', (e: any) => {
      startDrag(e);
    });

    figure.addEventListener('dragend', () => {
      figure.classList.remove('is-dragging');
      delete (wysiwygCanvas as any)._draggedFigure;
      wysiwygCanvas.querySelector('.wysiwyg-drop-indicator')?.remove();
      syncCallback();
    });
  }

  // Insert Inline Image Safely as a Top-Level Sibling Block
  private static insertInlineImage(
    figureHtml: string,
    wysiwygCanvas: HTMLElement,
    targetBlock: HTMLElement | null,
    syncCallback: () => void
  ) {
    const temp = document.createElement('div');
    temp.innerHTML = figureHtml;
    const figure = temp.querySelector('.article-inline-image') as HTMLElement | null;
    if (!figure) return;

    figure.setAttribute('contenteditable', 'false');

    // Insert as a clean top-level sibling
    if (targetBlock && wysiwygCanvas.contains(targetBlock)) {
      const isBlockEmpty = !targetBlock.textContent?.trim() && (!targetBlock.querySelector('img') || targetBlock.innerHTML === '<br>');
      if (isBlockEmpty && targetBlock.tagName.toLowerCase() === 'p') {
        targetBlock.replaceWith(figure);
      } else {
        targetBlock.after(figure);
      }
    } else {
      wysiwygCanvas.appendChild(figure);
    }

    // Ensure there is always an editable sibling paragraph after the figure
    let nextBlock = figure.nextElementSibling as HTMLElement | null;
    if (!nextBlock || nextBlock.tagName.toLowerCase() === 'figure') {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      figure.after(p);
      nextBlock = p;
    }

    // Hydrate controls onto the new figure
    ArticleEditor.hydrateSingleFigure(figure, wysiwygCanvas, syncCallback);

    // Place caret cleanly in the trailing paragraph
    if (nextBlock) {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(nextBlock);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      nextBlock.focus();
    }

    syncCallback();
    Toast.show('Gambar berhasil disisipkan ke naskah!');
  }
}
