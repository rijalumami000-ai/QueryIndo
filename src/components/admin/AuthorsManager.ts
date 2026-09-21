import type { Article, AuthorProfile } from '../../types/news';
import { AuthorService, EDITORIAL_DIVISIONS } from '../../services/authorService';
import { Toast } from '../../utils/toast';
import { ImageUtils } from '../../utils/imageUtils';

export class AuthorsManager {
  private static formatStats(num: number): string {
    if (!num || num <= 0) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toLocaleString('id-ID');
  }

  public static render(articles: Article[]): string {
    const authors = AuthorService.getAuthors();
    const totalArticlesWritten = articles.length;

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Dewan Redaksi & Jurnalis
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola master data jurnalis, desk liputan, biografi, dan rekam jejak publikasi QUERYINDO.
            </p>
          </div>
          
          <button id="btn-add-author" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tambah Jurnalis</span>
          </button>
        </div>

        <!-- Metric Overview Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Dewan Jurnalis</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.35rem;">${authors.length} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Wartawan</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Naskah Terdistribusi</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-blue); margin-top: 0.35rem;">${totalArticlesWritten} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Berita</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Kualifikasi Jurnalistik</div>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.55rem;">Dewan Pers ID</div>
          </div>
        </div>

        <!-- Author Profile Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
          ${authors.map(author => {
            const authorArticles = articles.filter(a => a.author.name.toLowerCase() === author.name.toLowerCase());
            const totalAuthorViews = authorArticles.reduce((acc, a) => acc + a.viewsCount, 0);

            return `
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.1rem; transition: border-color var(--transition-fast);">
                
                <div>
                  <!-- Top Bar: Avatar & Verification -->
                  <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.85rem;">
                    <div style="position: relative; flex-shrink: 0;">
                      <img src="${author.avatar}" alt="${author.name}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);" />
                      <span style="position: absolute; bottom: 0; right: 0; background: var(--accent-emerald); color: #fff; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800;" title="Jurnalis Terverifikasi">✓</span>
                    </div>

                    <div style="flex: 1; min-width: 0;">
                      <h3 style="font-size: 1rem; font-weight: 800; margin: 0; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${author.name}</h3>
                      <span style="display: inline-block; font-size: 0.72rem; font-weight: 600; color: var(--accent-cyan); background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); padding: 0.15rem 0.5rem; border-radius: 4px; margin-top: 0.3rem;">
                        ${author.role}
                      </span>
                    </div>
                  </div>

                  <!-- Author Bio -->
                  <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45; margin: 0 0 0.85rem 0; min-height: 2.3rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${author.bio || 'Jurnalis berita dan analis riset teknologi di redaksi QUERYINDO.'}
                  </p>

                  <!-- Contact & Social Meta -->
                  <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-tertiary); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="display: flex; align-items: center; gap: 0.35rem;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        <span>Email:</span>
                      </span>
                      <strong style="color: var(--text-primary); font-family: var(--font-mono);">${author.email}</strong>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="display: flex; align-items: center; gap: 0.35rem;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <span>Terdaftar:</span>
                      </span>
                      <span style="color: var(--text-primary); font-family: var(--font-mono);">${author.joinedAt ? (author.joinedAt.includes('-') ? new Date(author.joinedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : author.joinedAt) : '1 Januari 2025'}</span>
                    </div>
                    ${author.socialTwitter ? `
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 0.35rem;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                          <span>X / Twitter:</span>
                        </span>
                        <span style="color: var(--accent-cyan); font-family: var(--font-mono);">${author.socialTwitter}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Bottom Metrics & Action Buttons -->
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-top: 1px solid var(--border-color); font-size: 0.78rem; margin-bottom: 0.65rem;">
                    <span style="color: var(--text-muted);">Naskah Dipublikasi:</span>
                    <strong style="color: var(--text-primary);">${authorArticles.length} Berita <span style="color: var(--accent-cyan);">(${AuthorsManager.formatStats(totalAuthorViews)} Views)</span></strong>
                  </div>

                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-edit-author" data-author-id="${author.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      <span>Sunting</span>
                    </button>
                    <button class="btn-delete-author" data-author-id="${author.id}" data-author-name="${author.name}" style="padding: 0.45rem 0.75rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem;" title="Hapus Jurnalis">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  public static bindEvents(modalElem: HTMLElement, articles: Article[], refreshCallback: () => void) {
    // Add New Author
    modalElem.querySelector('#btn-add-author')?.addEventListener('click', () => {
      AuthorsManager.showAuthorFormModal(null, modalElem, refreshCallback);
    });

    // Edit Author
    modalElem.querySelectorAll('.btn-edit-author').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-author-id');
        if (!id) return;
        const author = AuthorService.getAuthorById(id);
        if (author) {
          AuthorsManager.showAuthorFormModal(author, modalElem, refreshCallback);
        }
      });
    });

    // Delete Author
    modalElem.querySelectorAll('.btn-delete-author').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-author-id');
        const name = btn.getAttribute('data-author-name') || 'Jurnalis';
        if (!id) return;

        const relatedArticles = articles.filter(a => a.author.name.toLowerCase() === name.toLowerCase());
        const confirmMsg = relatedArticles.length > 0
          ? `Hapus jurnalis "${name}" dari dewan redaksi?\n\nPerhatian: Terdapat ${relatedArticles.length} artikel yang ditulis oleh jurnalis ini.`
          : `Yakin ingin menghapus jurnalis "${name}" dari dewan redaksi?`;

        if (confirm(confirmMsg)) {
          const success = await AuthorService.deleteAuthor(id);
          if (success) {
            Toast.show(`Jurnalis "${name}" berhasil dihapus.`);
            refreshCallback();
          }
        }
      });
    });
  }

  // Show Author Form Modal for Add & Edit
  public static showAuthorFormModal(author: AuthorProfile | null, _modalElem: HTMLElement, refreshCallback: () => void) {
    const isEdit = !!author;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '35000';
    overlay.style.background = 'rgba(7, 9, 14, 0.85)';
    overlay.style.backdropFilter = 'blur(10px)';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 580px; width: 92%; margin: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg);">
        <div class="modal-header-bar" style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2rem; height: 2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">✍️</div>
            <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary);">${isEdit ? 'Sunting Profil Jurnalis' : 'Tambah Jurnalis Redaksi Baru'}</h3>
          </div>
          <button class="btn-close" id="close-author-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>

        <form id="author-crud-form" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1.2rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Lengkap & Gelar *</label>
            <input type="text" id="form-author-name" required value="${author?.name || ''}" placeholder="e.g. Raditya Pratama, M.Kom." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Divisi / Bagian Redaksi *</label>
              <select id="form-author-division" required style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
                ${EDITORIAL_DIVISIONS.map(div => `<option value="${div}" ${author?.division === div ? 'selected' : ''}>${div}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Urutan Tampilan</label>
              <input type="number" id="form-author-order" value="${author?.order || 1}" min="1" max="99" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Jabatan / Posisi Redaksi *</label>
              <input type="text" id="form-author-role" required value="${author?.role || ''}" placeholder="e.g. Editor Senior AI & Cloud" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Email Resmi Redaksi *</label>
              <input type="email" id="form-author-email" required value="${author?.email || ''}" placeholder="e.g. raditya@queryindo.com" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">
                Foto Profil Avatar *
              </label>
              <label for="form-author-file-input" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat (Galeri/File)</span>
              </label>
              <input type="file" id="form-author-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-author-avatar-preview" src="${author?.avatar ? ImageUtils.normalizeImageUrl(author.avatar) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-cyan); flex-shrink: 0; background: var(--bg-tertiary);" />
              <input type="text" id="form-author-avatar" required value="${author?.avatar ? ImageUtils.normalizeImageUrl(author.avatar) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" placeholder="Tempel URL gambar atau Google Drive..." style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div id="author-avatar-help" style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.4rem; line-height: 1.4;">
              💡 <em>Mendukung link Google Drive, Unsplash, atau upload foto langsung dari perangkat Anda. (Link Google Drive otomatis dikonversi).</em>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Biografi Ringkas & Spesialisasi Liputan</label>
            <textarea id="form-author-bio" rows="3" placeholder="Tuliskan latar belakang dan fokus liputan..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; resize: vertical;">${author?.bio || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Handle X / Twitter</label>
              <input type="text" id="form-author-twitter" value="${author?.socialTwitter || ''}" placeholder="@username" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Link Profil LinkedIn</label>
              <input type="url" id="form-author-linkedin" value="${author?.socialLinkedin || ''}" placeholder="https://linkedin.com/in/..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-author-form" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow);">
              ${isEdit ? 'Simpan Perubahan' : 'Tambah Jurnalis'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => {
      overlay.remove();
    };

    overlay.querySelector('#close-author-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-author-form')?.addEventListener('click', closeForm);

    const avatarInput = overlay.querySelector('#form-author-avatar') as HTMLInputElement;
    const avatarPreview = overlay.querySelector('#form-author-avatar-preview') as HTMLImageElement;
    const fileInput = overlay.querySelector('#form-author-file-input') as HTMLInputElement;
    const helpMsg = overlay.querySelector('#author-avatar-help') as HTMLElement;

    const updateAvatarPreview = (rawUrl: string) => {
      const normalized = ImageUtils.normalizeImageUrl(rawUrl);
      if (normalized !== rawUrl && avatarInput) {
        avatarInput.value = normalized;
      }
      if (avatarPreview) {
        avatarPreview.src = normalized;
      }
    };

    if (avatarInput && avatarPreview) {
      avatarInput.addEventListener('input', () => updateAvatarPreview(avatarInput.value));
      avatarInput.addEventListener('change', () => updateAvatarPreview(avatarInput.value));
      avatarInput.addEventListener('paste', () => setTimeout(() => updateAvatarPreview(avatarInput.value), 40));

      avatarPreview.onerror = () => {
        const nameVal = (overlay.querySelector('#form-author-name') as HTMLInputElement)?.value || 'User';
        const currentSrc = avatarPreview.src;
        if (currentSrc.includes('lh3.googleusercontent.com/d/')) {
          const id = currentSrc.split('/d/')[1];
          if (id) {
            avatarPreview.src = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
            return;
          }
        }
        avatarPreview.src = ImageUtils.getInitialsAvatar(nameVal);
        if (helpMsg) {
          helpMsg.innerHTML = `<span style="color:var(--accent-rose);">⚠️ Gambar Google Drive tidak dapat dimuat. Pastikan izin berbagi file disetel ke <strong>"Siapa saja yang memiliki tautan" (Public)</strong>, atau klik <strong>"Upload dari Perangkat"</strong> di atas.</span>`;
        }
      };

      avatarPreview.onload = () => {
        if (helpMsg && !avatarPreview.src.startsWith('data:image/svg')) {
          helpMsg.innerHTML = `<span style="color:var(--accent-emerald);">✓ Foto profil berhasil dimuat.</span>`;
        }
      };
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 400, 0.85, (dataUrl) => {
            if (avatarInput) avatarInput.value = dataUrl;
            if (avatarPreview) avatarPreview.src = dataUrl;
            Toast.show('Foto berhasil dipilih dari perangkat!');
          }, (err) => {
            alert(err);
          });
        }
      });
    }

    const form = overlay.querySelector('#author-crud-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = (overlay.querySelector('#form-author-name') as HTMLInputElement).value.trim();
        const division = (overlay.querySelector('#form-author-division') as HTMLSelectElement).value;
        const order = parseInt((overlay.querySelector('#form-author-order') as HTMLInputElement).value) || 1;
        const role = (overlay.querySelector('#form-author-role') as HTMLInputElement).value.trim();
        const email = (overlay.querySelector('#form-author-email') as HTMLInputElement).value.trim();
        const avatar = (overlay.querySelector('#form-author-avatar') as HTMLInputElement).value.trim();
        const bio = (overlay.querySelector('#form-author-bio') as HTMLTextAreaElement).value.trim();
        const socialTwitter = (overlay.querySelector('#form-author-twitter') as HTMLInputElement).value.trim();
        const socialLinkedin = (overlay.querySelector('#form-author-linkedin') as HTMLInputElement).value.trim();

        if (!name || !role || !email) {
          alert('Nama, Jabatan, dan Email wajib diisi!');
          return;
        }

        if (isEdit && author) {
          await AuthorService.updateAuthor(author.id, {
            name,
            role,
            division,
            order,
            email,
            avatar: avatar || author.avatar,
            bio,
            socialTwitter: socialTwitter || undefined,
            socialLinkedin: socialLinkedin || undefined
          });
          Toast.show(`Profil jurnalis "${name}" berhasil diperbarui!`);
        } else {
          await AuthorService.addAuthor({
            name,
            role,
            division,
            order,
            email,
            avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            bio,
            socialTwitter: socialTwitter || undefined,
            socialLinkedin: socialLinkedin || undefined
          });
          Toast.show(`Jurnalis baru "${name}" berhasil ditambahkan!`);
        }

        closeForm();
        refreshCallback();
      });
    }
  }
}
