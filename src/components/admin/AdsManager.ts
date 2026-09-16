import { AdBanner, type AdCampaign, type AdPlacement } from '../AdBanner';
import { Toast } from '../../utils/toast';
import { ImageUtils } from '../../utils/imageUtils';

export class AdsManager {
  public static render(adPlacementFilter: string): string {
    const allCampaigns = AdBanner.getCampaigns();
    const campaigns = adPlacementFilter === 'all'
      ? allCampaigns
      : allCampaigns.filter(a => a.placement === adPlacementFilter);

    const PLACEMENT_INFO: Record<string, { label: string; tag: string; color: string; desc: string }> = {
      leaderboard: { label: 'Leaderboard (728x90)', tag: 'LEADERBOARD', color: '#38bdf8', desc: 'Banner atas utama di bawah navigasi header' },
      billboard: { label: 'Billboard (970x250)', tag: 'BILLBOARD', color: '#fbbf24', desc: 'Banner horizontal raksasa di atas feed berita' },
      midstream: { label: 'Midstream Banner', tag: 'MIDSTREAM', color: '#a855f7', desc: 'Banner horizontal interstitial di tengah aliran berita' },
      sidebar: { label: 'Sidebar (300x250)', tag: 'SIDEBAR', color: '#34d399', desc: 'Banner kotak di sidebar kilas cepat & rekomendasi' },
      skyscraper_left: { label: 'Skyscraper Kiri', tag: 'SKYSCRAPER L', color: '#818cf8', desc: 'Banner vertikal 160x600 di rail kiri layar lebar' },
      skyscraper_right: { label: 'Skyscraper Kanan', tag: 'SKYSCRAPER R', color: '#818cf8', desc: 'Banner vertikal 160x600 di rail kanan layar lebar' },
      in_article: { label: 'In-Article Ad', tag: 'IN-ARTICLE', color: '#f43f5e', desc: 'Banner sponsor di dalam modal baca artikel penuh' },
      in_feed: { label: 'In-Feed Native', tag: 'IN-FEED', color: '#2dd4bf', desc: 'Kartu iklan sponsor di antara grid kartu berita' }
    };

    const filterPills = [
      { id: 'all', name: `Semua (${allCampaigns.length})` },
      { id: 'leaderboard', name: 'Leaderboard' },
      { id: 'billboard', name: 'Billboard' },
      { id: 'midstream', name: 'Midstream' },
      { id: 'sidebar', name: 'Sidebar' },
      { id: 'skyscraper_left', name: 'Skyscraper L' },
      { id: 'skyscraper_right', name: 'Skyscraper R' },
      { id: 'in_article', name: 'In-Article' },
      { id: 'in_feed', name: 'In-Feed' }
    ];

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header & Action Button -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Kemitraan Iklan & Sponsor Brand
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola inventori banner promosi: Leaderboard, Billboard, Midstream, Sidebar, Skyscrapers, dan In-Article.
            </p>
          </div>
          <button id="btn-add-ad-campaign" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Tambah Kampanye Iklan</span>
          </button>
        </div>

        <!-- Filter Pills Bar -->
        <div style="display: gap: 0.5rem; display: flex; overflow-x: auto; padding-bottom: 0.35rem;">
          ${filterPills.map(p => {
            const isActive = adPlacementFilter === p.id;
            return `
              <button class="ad-filter-pill" data-placement="${p.id}" style="padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 700; border: 1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}; background: ${isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)'}; color: ${isActive ? '#ffffff' : 'var(--text-secondary)'}; cursor: pointer; white-space: nowrap; transition: all 0.15s ease;">
                ${p.name}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Campaign Cards Grid -->
        ${campaigns.length === 0 ? `
          <div style="background: var(--bg-secondary); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 3rem; text-align: center; color: var(--text-muted);">
            <p style="margin: 0 0 0.5rem 0; font-size: 0.95rem;">Tidak ada kampanye iklan di slot ini.</p>
            <button id="btn-add-ad-empty" style="padding: 0.5rem 1rem; background: var(--accent-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 600; cursor: pointer;">
              + Tambah Iklan Baru
            </button>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;">
            ${campaigns.map(ad => {
              const info = PLACEMENT_INFO[ad.placement] || { label: ad.placement, tag: ad.placement.toUpperCase(), color: 'var(--accent-cyan)', desc: '' };
              return `
                <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; transition: transform 0.2s ease, border-color 0.2s ease;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                      <span class="tag-badge" style="background: rgba(255,255,255,0.06); color: ${info.color}; border: 1px solid ${info.color}40; font-size: 0.68rem; font-weight: 700; font-family: var(--font-mono);">${info.tag}</span>
                      <span style="font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 4px; background: ${ad.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${ad.isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; border: 1px solid ${ad.isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};">
                        ${ad.isActive ? 'AKTIF TAYANG' : 'NONAKTIF'}
                      </span>
                    </div>

                    <div style="display: flex; gap: 0.85rem; align-items: center; margin-bottom: 0.85rem;">
                      <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 64px; height: 48px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color); flex-shrink: 0;" />
                      <div style="min-width: 0; flex: 1;">
                        <h3 style="font-size: 0.98rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${ad.sponsorName}</h3>
                        <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${ad.tagline}</p>
                      </div>
                    </div>

                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.35rem; font-family: var(--font-mono); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                      <span style="color: var(--text-muted);">Target:</span>
                      <a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-cyan); text-decoration: none;">${ad.targetUrl} ↗</a>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: var(--bg-tertiary); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid var(--border-color);">
                      <div>
                        <span style="color: var(--text-muted); display: block;">Impressions:</span>
                        <strong style="color: var(--text-primary); font-size: 0.85rem;">${ad.impressions.toLocaleString('id-ID')}</strong>
                      </div>
                      <div>
                        <span style="color: var(--text-muted); display: block;">Clicks (CTR):</span>
                        <strong style="color: var(--accent-cyan); font-size: 0.85rem;">${ad.clicks} (${ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%)</strong>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.65rem;">
                    <button class="btn-edit-ad" data-ad-id="${ad.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.3rem;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      <span>Sunting</span>
                    </button>
                    <button class="btn-toggle-ad" data-ad-id="${ad.id}" style="flex: 1; padding: 0.45rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                      ${ad.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button class="btn-delete-ad" data-ad-id="${ad.id}" style="padding: 0.45rem 0.65rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.75rem; font-weight: 600; cursor: pointer;" title="Hapus Iklan">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  }

  public static bindEvents(
    modalElem: HTMLElement,
    onFilterChange: (placement: string) => void,
    refreshCallback: () => void
  ) {
    // Placement filter pills
    modalElem.querySelectorAll('.ad-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const placement = pill.getAttribute('data-placement') || 'all';
        onFilterChange(placement);
      });
    });

    // Add New Campaign modal
    modalElem.querySelector('#btn-add-ad-campaign')?.addEventListener('click', () => {
      AdsManager.showAdFormModal(null, modalElem, refreshCallback);
    });
    modalElem.querySelector('#btn-add-ad-empty')?.addEventListener('click', () => {
      AdsManager.showAdFormModal(null, modalElem, refreshCallback);
    });

    // Edit Campaign modal
    modalElem.querySelectorAll('.btn-edit-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (!id) return;
        const ad = AdBanner.getCampaignById(id);
        if (ad) {
          AdsManager.showAdFormModal(ad, modalElem, refreshCallback);
        }
      });
    });

    // Toggle Active Status
    modalElem.querySelectorAll('.btn-toggle-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (!id) return;
        AdBanner.toggleCampaign(id);
        const ad = AdBanner.getCampaignById(id);
        Toast.show(`Status iklan "${ad?.sponsorName || ''}" diubah ke ${ad?.isActive ? 'Aktif' : 'Nonaktif'}.`);
        refreshCallback();
      });
    });

    // Delete Ad Campaign
    modalElem.querySelectorAll('.btn-delete-ad').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-ad-id');
        if (!id) return;
        const ad = AdBanner.getCampaignById(id);
        if (confirm(`Yakin ingin menghapus kampanye iklan "${ad?.sponsorName || ''}"?`)) {
          AdBanner.deleteCampaign(id);
          Toast.show('Kampanye iklan sponsor telah dihapus.');
          refreshCallback();
        }
      });
    });
  }

  public static showAdFormModal(ad: AdCampaign | null, _modalElem: HTMLElement, refreshCallback: () => void) {
    const isEdit = !!ad;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '2500';
    overlay.style.background = 'rgba(7, 9, 14, 0.85)';
    overlay.style.backdropFilter = 'blur(10px)';

    const placementOptions = [
      { value: 'leaderboard', label: 'Leaderboard Banner (728x90 • Header Top Portal)' },
      { value: 'billboard', label: 'Billboard Banner (970x250 • Panoramic Atas Berita)' },
      { value: 'midstream', label: 'Midstream Interstitial (Horizontal Tengah Feed Berita)' },
      { value: 'sidebar', label: 'Sidebar Widget Ad (300x250 • Kolom Samping Berita)' },
      { value: 'skyscraper_left', label: 'Skyscraper Kiri (160x600 • Rail Desktop Kiri)' },
      { value: 'skyscraper_right', label: 'Skyscraper Kanan (160x600 • Rail Desktop Kanan)' },
      { value: 'in_article', label: 'In-Article Ad (Banner Sponsor di Dalam Pembaca Artikel)' },
      { value: 'in_feed', label: 'In-Feed Native Ad (Kartu Sponsor di Grid Berita)' }
    ];

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 640px; width: 92%; margin: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header-bar" style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.2rem; height: 2.2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">📢</div>
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary);">${isEdit ? 'Sunting Kampanye Iklan' : 'Tambah Kampanye Iklan Baru'}</h3>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">Inventori Slot Iklan & Kemitraan Digital</span>
            </div>
          </div>
          <button class="btn-close" id="close-ad-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>

        <form id="ad-crud-form" style="padding: 1.75rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.15rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Sponsor / Brand Pengiklan *</label>
            <input type="text" id="form-ad-sponsor" required value="${ad?.sponsorName || ''}" placeholder="e.g. NVIDIA Enterprise AI" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Slot Penempatan Iklan (Placement) *</label>
              <select id="form-ad-placement" required style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
                ${placementOptions.map(opt => `<option value="${opt.value}" ${ad?.placement === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Status Tayang</label>
              <select id="form-ad-status" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;">
                <option value="true" ${ad ? (ad.isActive ? 'selected' : '') : 'selected'}>Aktif (Tayang)</option>
                <option value="false" ${ad && !ad.isActive ? 'selected' : ''}>Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tagline / Pesan Promosi Sponsor *</label>
            <textarea id="form-ad-tagline" rows="2" required placeholder="Tuliskan pesan promosi produk atau solusi..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; resize: vertical;">${ad?.tagline || ''}</textarea>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">
                URL Banner Gambar (Image URL) *
              </label>
              <label for="form-ad-file-input" style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat</span>
              </label>
              <input type="file" id="form-ad-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-ad-img-preview" src="${ad?.imageUrl ? ImageUtils.normalizeImageUrl(ad.imageUrl) : 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'}" style="width: 68px; height: 44px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--border-color); flex-shrink: 0; background: var(--bg-tertiary);" />
              <input type="text" id="form-ad-image" required value="${ad?.imageUrl ? ImageUtils.normalizeImageUrl(ad.imageUrl) : 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80'}" placeholder="https://... atau Google Drive link" style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">URL Link Tujuan (Target URL) *</label>
              <input type="url" id="form-ad-target" required value="${ad?.targetUrl || 'https://'}" placeholder="https://..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Teks Tombol CTA *</label>
              <input type="text" id="form-ad-cta" required value="${ad?.ctaText || 'Pelajari Selengkapnya →'}" placeholder="e.g. Uji Coba Gratis →" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-ad-form" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow);">
              ${isEdit ? 'Simpan Perubahan' : 'Terbitkan Iklan'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-ad-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-ad-form')?.addEventListener('click', closeForm);

    const imgInput = overlay.querySelector('#form-ad-image') as HTMLInputElement;
    const imgPreview = overlay.querySelector('#form-ad-img-preview') as HTMLImageElement;
    const adFileInput = overlay.querySelector('#form-ad-file-input') as HTMLInputElement;

    const updateAdPreview = (rawUrl: string) => {
      const normalized = ImageUtils.normalizeImageUrl(rawUrl);
      if (normalized !== rawUrl && imgInput) {
        imgInput.value = normalized;
      }
      if (imgPreview) {
        imgPreview.src = normalized;
      }
    };

    if (imgInput && imgPreview) {
      imgInput.addEventListener('input', () => updateAdPreview(imgInput.value));
      imgInput.addEventListener('change', () => updateAdPreview(imgInput.value));
      imgInput.addEventListener('paste', () => setTimeout(() => updateAdPreview(imgInput.value), 40));
    }

    if (adFileInput) {
      adFileInput.addEventListener('change', () => {
        const file = adFileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 1200, 0.85, (dataUrl) => {
            if (imgInput) imgInput.value = dataUrl;
            if (imgPreview) imgPreview.src = dataUrl;
            Toast.show('Banner berhasil dipilih dari perangkat!');
          }, (err) => {
            alert(err);
          });
        }
      });
    }

    const form = overlay.querySelector('#ad-crud-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sponsorName = (overlay.querySelector('#form-ad-sponsor') as HTMLInputElement).value.trim();
        const placement = (overlay.querySelector('#form-ad-placement') as HTMLSelectElement).value as AdPlacement;
        const tagline = (overlay.querySelector('#form-ad-tagline') as HTMLTextAreaElement).value.trim();
        const imageUrl = (overlay.querySelector('#form-ad-image') as HTMLInputElement).value.trim();
        const targetUrl = (overlay.querySelector('#form-ad-target') as HTMLInputElement).value.trim();
        const ctaText = (overlay.querySelector('#form-ad-cta') as HTMLInputElement).value.trim();
        const isActive = (overlay.querySelector('#form-ad-status') as HTMLSelectElement).value === 'true';

        if (!sponsorName || !tagline || !imageUrl || !targetUrl) {
          alert('Mohon lengkapi seluruh kolom yang wajib diisi!');
          return;
        }

        if (isEdit && ad) {
          AdBanner.updateCampaign(ad.id, {
            sponsorName,
            placement,
            tagline,
            imageUrl,
            targetUrl,
            ctaText,
            isActive
          });
          Toast.show(`Kampanye iklan "${sponsorName}" berhasil diperbarui!`);
        } else {
          AdBanner.addCampaign({
            sponsorName,
            placement,
            tagline,
            imageUrl,
            targetUrl,
            ctaText,
            isActive
          });
          Toast.show(`Kampanye iklan baru "${sponsorName}" berhasil ditambahkan!`);
        }

        closeForm();
        refreshCallback();
      });
    }
  }
}
