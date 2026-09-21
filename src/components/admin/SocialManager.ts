import { SocialMediaService, type SocialLink, type SocialPlatform, PLATFORM_METAS } from '../../services/socialMediaService';
import { Toast } from '../../utils/toast';

export class SocialManager {
  public static render(): string {
    const links = SocialMediaService.getLinks();
    const activeLinks = links.filter(l => l.isActive);
    const inactiveLinks = links.filter(l => !l.isActive);

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono);">EKOSISTEM DIGITAL RESMI</span>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Kanal & Media Sosial Resmi QUERYINDO
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola tautan akun media sosial resmi (Facebook, Instagram, Threads, X, TikTok, YouTube, WhatsApp, dll.) yang ditampilkan di footer portal publik.
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button id="btn-reset-social" style="padding: 0.55rem 1rem; background: var(--bg-tertiary); color: var(--text-secondary); font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid var(--border-color); cursor: pointer;" title="Kembalikan daftar ke susunan standar awal">
              Reset Standar
            </button>
            <button id="btn-add-social" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 1px 2px rgba(0,0,0,0.2); cursor: pointer;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              <span>Tambah Tautan Medsos</span>
            </button>
          </div>
        </div>

        <!-- 3 Top Metric Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Saluran Didaftarkan</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-top: 0.35rem;">${links.length} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">Platform</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Aktif Tampil di Footer</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.35rem;">${activeLinks.length} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">Aktif</span></div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Disembunyikan / Cadangan</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-muted); margin-top: 0.35rem;">${inactiveLinks.length} <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">Nonaktif</span></div>
          </div>
        </div>

        <!-- Social Media Table Section -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em;">Daftar Akun Media Sosial Portal</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Urutan di bawah ini menentukan posisi kiri-ke-kanan ikon pada footer portal.</p>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 0.85rem 1.25rem; width: 60px; text-align: center;">Urutan</th>
                  <th style="padding: 0.85rem 1.25rem;">Platform & Logo</th>
                  <th style="padding: 0.85rem 1.25rem;">Nama / Handle Akun</th>
                  <th style="padding: 0.85rem 1.25rem;">Tautan URL Resmi</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: center;">Status Footer</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi Redaksi</th>
                </tr>
              </thead>
              <tbody>
                ${links.map((item, index) => {
                  const meta = PLATFORM_METAS[item.platform] || PLATFORM_METAS.custom;
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                      <td style="padding: 0.9rem 1.25rem; text-align: center;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                          <button class="btn-move-social-up" data-id="${item.id}" ${index === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : 'style="cursor:pointer;"'} title="Pindah ke Kiri / Atas" style="border:none; background:transparent; color:var(--text-secondary); font-size:0.75rem; padding:1px 4px;">▲</button>
                          <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">${item.order}</span>
                          <button class="btn-move-social-down" data-id="${item.id}" ${index === links.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : 'style="cursor:pointer;"'} title="Pindah ke Kanan / Bawah" style="border:none; background:transparent; color:var(--text-secondary); font-size:0.75rem; padding:1px 4px;">▼</button>
                        </div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <div style="width: 2.2rem; height: 2.2rem; border-radius: 8px; background: ${meta.brandColor === '#000000' ? '#111827' : meta.brandColor}; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 2px 8px ${meta.hoverGlow}; flex-shrink: 0;">
                            ${meta.svgIcon}
                          </div>
                          <div>
                            <div style="font-weight: 800; color: var(--text-primary); font-size: 0.9rem;">${meta.name}</div>
                            <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">${item.platform}</span>
                          </div>
                        </div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem;">
                        <div style="font-weight: 700; color: var(--text-primary); font-size: 0.875rem;">${item.name}</div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; max-width: 320px;">
                          <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.82rem; font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px;" title="${item.url}">
                            ${item.url}
                          </a>
                          <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-muted); text-decoration: none; font-size: 0.75rem;" title="Buka di tab baru">
                            ↗
                          </a>
                        </div>
                      </td>

                      <td style="padding: 0.9rem 1.25rem; text-align: center;">
                        <button class="btn-toggle-social" data-id="${item.id}" style="padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; cursor: pointer; border: 1px solid ${item.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(156, 163, 175, 0.3)'}; background: ${item.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)'}; color: ${item.isActive ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                          ${item.isActive ? '● AKTIF (TAMPIL)' : '○ NONAKTIF'}
                        </button>
                      </td>

                      <td style="padding: 0.9rem 1.25rem; text-align: right;">
                        <div style="display: inline-flex; gap: 0.45rem;">
                          <button class="btn-cms-action btn-edit-social" data-id="${item.id}" style="padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                            Sunting
                          </button>
                          <button class="btn-cms-action btn-delete-social" data-id="${item.id}" data-name="${item.name}" style="padding: 0.35rem 0.55rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); font-size: 0.75rem; cursor: pointer;">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  public static bindEvents(modalElem: HTMLElement, onRefresh: () => void) {
    // Add Social Link
    modalElem.querySelector('#btn-add-social')?.addEventListener('click', () => {
      this.showSocialFormModal(null, onRefresh);
    });

    // Reset to Default
    modalElem.querySelector('#btn-reset-social')?.addEventListener('click', () => {
      if (confirm('Kembalikan daftar kanal media sosial resmi ke konfigurasi standar QUERYINDO?')) {
        SocialMediaService.resetToDefault();
        Toast.show('Daftar media sosial direset ke standar.');
        onRefresh();
      }
    });

    // Edit Social Link
    modalElem.querySelectorAll('.btn-edit-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        const link = SocialMediaService.getLinks().find(l => l.id === id);
        if (link) {
          this.showSocialFormModal(link, onRefresh);
        }
      });
    });

    // Delete Social Link
    modalElem.querySelectorAll('.btn-delete-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || 'Akun';
        if (!id) return;

        if (confirm(`Hapus akun media sosial "${name}" dari sistem?`)) {
          SocialMediaService.deleteLink(id);
          Toast.show(`Akun "${name}" berhasil dihapus.`);
          onRefresh();
        }
      });
    });

    // Toggle Active Status
    modalElem.querySelectorAll('.btn-toggle-social').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        SocialMediaService.toggleActive(id);
        onRefresh();
      });
    });

    // Move Order Up
    modalElem.querySelectorAll('.btn-move-social-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (SocialMediaService.moveOrder(id, 'up')) {
          onRefresh();
        }
      });
    });

    // Move Order Down
    modalElem.querySelectorAll('.btn-move-social-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (SocialMediaService.moveOrder(id, 'down')) {
          onRefresh();
        }
      });
    });
  }

  public static showSocialFormModal(link: SocialLink | null, onSave: () => void) {
    const isEdit = !!link;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '35000';
    overlay.style.background = 'rgba(7, 9, 14, 0.85)';
    overlay.style.backdropFilter = 'blur(10px)';

    const platforms: SocialPlatform[] = [
      'facebook',
      'instagram',
      'threads',
      'x',
      'tiktok',
      'youtube',
      'linkedin',
      'telegram',
      'whatsapp',
      'custom'
    ];

    const currentPlatform = link?.platform || 'instagram';
    const currentMeta = PLATFORM_METAS[currentPlatform] || PLATFORM_METAS.custom;

    overlay.innerHTML = `
      <div class="modal-card" style="width: 100%; max-width: 520px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl); overflow: hidden; display: flex; flex-direction: column;">
        
        <div style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div id="form-platform-icon-preview" style="width: 2.2rem; height: 2.2rem; border-radius: 8px; background: ${currentMeta.brandColor === '#000000' ? '#111827' : currentMeta.brandColor}; display: flex; align-items: center; justify-content: center; color: #ffffff;">
              ${currentMeta.svgIcon}
            </div>
            <div>
              <h3 style="font-weight: 800; font-size: 1.05rem; margin: 0; color: var(--text-primary);">
                ${isEdit ? 'Sunting Akun Media Sosial' : 'Tambah Akun Media Sosial'}
              </h3>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Integrasi ekosistem digital resmi QUERYINDO</span>
            </div>
          </div>
          <button id="close-social-modal" style="background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="social-form" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.15rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Pilih Platform Media Sosial *</label>
            <select id="form-social-platform" required style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
              ${platforms.map(p => {
                const meta = PLATFORM_METAS[p];
                return `<option value="${p}" ${p === currentPlatform ? 'selected' : ''}>${meta.name}</option>`;
              }).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama / Handle Akun *</label>
            <input type="text" id="form-social-name" required value="${link?.name || ''}" placeholder="e.g. @queryindo atau QUERYINDO Official" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tautan URL Lengkap *</label>
            <input type="url" id="form-social-url" required value="${link?.url || ''}" placeholder="${currentMeta.placeholderUrl}" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-family: var(--font-mono);" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Urutan Tampilan</label>
              <input type="number" id="form-social-order" min="1" max="99" value="${link?.order ?? (SocialMediaService.getLinks().length + 1)}" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <div style="padding-top: 1.25rem;">
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); cursor: pointer;">
                <input type="checkbox" id="form-social-active" ${link ? (link.isActive ? 'checked' : '') : 'checked'} style="width: 1.1rem; height: 1.1rem; accent-color: var(--accent-primary);" />
                <span>Tampilkan di Footer</span>
              </label>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <button type="button" id="btn-cancel-social-form" style="padding: 0.6rem 1.1rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: pointer;">Batal</button>
            <button type="submit" style="padding: 0.6rem 1.4rem; background: var(--accent-primary); border: none; border-radius: var(--radius-md); color: #ffffff; font-size: 0.85rem; font-weight: 700; cursor: pointer;">Simpan Akun</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-social-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-social-form')?.addEventListener('click', closeForm);

    const platformSelect = overlay.querySelector('#form-social-platform') as HTMLSelectElement;
    const urlInput = overlay.querySelector('#form-social-url') as HTMLInputElement;
    const nameInput = overlay.querySelector('#form-social-name') as HTMLInputElement;
    const previewContainer = overlay.querySelector('#form-platform-icon-preview') as HTMLElement;

    platformSelect?.addEventListener('change', () => {
      const selected = platformSelect.value as SocialPlatform;
      const meta = PLATFORM_METAS[selected] || PLATFORM_METAS.custom;
      if (previewContainer) {
        previewContainer.style.background = meta.brandColor === '#000000' ? '#111827' : meta.brandColor;
        previewContainer.innerHTML = meta.svgIcon;
      }
      if (urlInput && (!urlInput.value || urlInput.value.includes('queryindo'))) {
        urlInput.placeholder = meta.placeholderUrl;
      }
      if (nameInput && !nameInput.value) {
        nameInput.value = meta.name;
      }
    });

    const form = overlay.querySelector('#social-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const platform = platformSelect.value as SocialPlatform;
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      const order = parseInt((overlay.querySelector('#form-social-order') as HTMLInputElement).value, 10) || 1;
      const isActive = (overlay.querySelector('#form-social-active') as HTMLInputElement).checked;

      if (!name || !url) {
        alert('Mohon isi nama dan URL tautan media sosial secara lengkap.');
        return;
      }

      if (isEdit && link) {
        SocialMediaService.updateLink(link.id, {
          platform,
          name,
          url,
          order,
          isActive
        });
        Toast.show(`Akun "${name}" berhasil diperbarui.`);
      } else {
        SocialMediaService.addLink({
          platform,
          name,
          url,
          order,
          isActive
        });
        Toast.show(`Akun "${name}" berhasil ditambahkan.`);
      }

      closeForm();
      onSave();
    });
  }
}
