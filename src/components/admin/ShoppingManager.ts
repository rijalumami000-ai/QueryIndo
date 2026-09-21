import { ShoppingCarousel, type ShoppingProduct } from '../ShoppingCarousel';
import { BentoSection } from '../../sections/BentoSection';
import { Toast } from '../../utils/toast';
import { ImageUtils } from '../../utils/imageUtils';

export class ShoppingManager {
  public static render(): string {
    const config = ShoppingCarousel.getConfig();
    const products = ShoppingCarousel.getProducts();

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Rekomendasi Belanja & Afiliasi E-Commerce
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola widget banner "Query Picks / Radar Gadget & Hardware Pilihan" di beranda. Atur teks promosi, upload produk belanja, harga coret & diskon, serta tautan afiliasi.
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="btn-add-shopping-product" style="padding: 0.55rem 1.25rem; background: var(--accent-cyan); color: #000000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; cursor: pointer; border: none; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 2px 10px rgba(0, 242, 254, 0.35);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>+ Tambah Produk Belanja</span>
            </button>
          </div>
        </div>

        <!-- Banner Configuration Card -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 0.95rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary);">Pengaturan Banner Rekomendasi</h3>
              <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Sesuaikan status tayang dan teks tajuk promosi pada banner.</p>
            </div>
            <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
              <span style="font-size: 0.8rem; font-weight: 700; color: ${config.enabled ? 'var(--accent-emerald)' : 'var(--text-muted)'};">
                ${config.enabled ? '● Banner Aktif Tayang' : '○ Banner Dinonaktifkan (Tersembunyi)'}
              </span>
              <input type="checkbox" id="toggle-shopping-banner" ${config.enabled ? 'checked' : ''} style="width: 1.2rem; height: 1.2rem; cursor: pointer;" />
            </label>
          </div>

          <form id="form-shopping-config" style="display: grid; grid-template-columns: 1fr 1fr 1.5fr auto; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Badge Promosi</label>
              <input type="text" id="cfg-shop-badge" value="${config.badgeText || '⚡ QUERY PICKS'}" placeholder="⚡ QUERY PICKS" style="width: 100%; padding: 0.55rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Partner Brand</label>
              <input type="text" id="cfg-shop-partner" value="${config.partnerText || 'Kurasi Lab Redaksi'}" placeholder="Kurasi Lab Redaksi" style="width: 100%; padding: 0.55rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Judul Utama Banner</label>
              <input type="text" id="cfg-shop-title" value="${config.mainTitle || 'RADAR GADGET & HARDWARE PILIHAN'}" placeholder="RADAR GADGET & HARDWARE PILIHAN" style="width: 100%; padding: 0.55rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem;" />
            </div>
            <button type="submit" id="btn-save-shop-config" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #fff; font-weight: 700; font-size: 0.825rem; border-radius: var(--radius-md); border: none; cursor: pointer; white-space: nowrap;">
              Simpan Teks
            </button>
          </form>
        </div>

        <!-- Live Preview Accordion/Box -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 0.7rem; font-weight: 800; font-family: var(--font-mono); background: rgba(0, 242, 254, 0.12); color: #00f2fe; padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.3);">LIVE PREVIEW</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">Tampilan Widget Rekomendasi di Beranda</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Mendukung geser panah kiri/kanan</span>
          </div>
          <div id="admin-shopping-live-preview">
            ${ShoppingCarousel.renderWidgetHTML()}
          </div>
        </div>

        <!-- Products Management Table -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0; color: var(--text-primary);">Daftar Kartu Produk Rekomendasi (${products.length} Produk)</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">Produk yang berstatus aktif akan otomatis tampil di slider rekomendasi.</p>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 0.85rem 1.25rem;">Produk Belanja</th>
                  <th style="padding: 0.85rem 1.25rem;">Kategori</th>
                  <th style="padding: 0.85rem 1.25rem;">Diskon %</th>
                  <th style="padding: 0.85rem 1.25rem;">Harga Asli / Promo</th>
                  <th style="padding: 0.85rem 1.25rem;">Tautan Afiliasi</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: center;">Status</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${products.length === 0 ? `
                  <tr>
                    <td colspan="7" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
                      Belum ada produk belanja yang ditambahkan. Klik tombol "+ Tambah Produk Belanja" di atas.
                    </td>
                  </tr>
                ` : products.map(prod => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.85rem 1.25rem;">
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${ImageUtils.normalizeImageUrl(prod.imageUrl) || ImageUtils.getInitialsAvatar(prod.title, '#ff9800')}" alt="${prod.title}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: contain; background: #fff; border: 1px solid var(--border-color); padding: 2px;" />
                        <div>
                          <div style="font-weight: 700; color: var(--text-primary); max-width: 260px; line-height: 1.3;">${prod.title}</div>
                          <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${prod.clicks || 0}x klik</span>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <span style="font-size: 0.75rem; background: var(--bg-tertiary); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-secondary);">
                        ${prod.category || 'Umum'}
                      </span>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <span style="font-weight: 800; color: #dc2626; font-size: 0.8rem; background: rgba(220, 38, 38, 0.1); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid rgba(220, 38, 38, 0.2);">
                        ${prod.discountPercent ? (prod.discountPercent.includes('%') ? prod.discountPercent : `${prod.discountPercent}%`) : '-'}
                      </span>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <div style="font-size: 0.75rem; color: var(--text-muted); text-decoration: line-through;">${prod.originalPrice || '-'}</div>
                      <div style="font-size: 0.88rem; font-weight: 800; color: #ea580c;">${prod.discountPrice}</div>
                    </td>
                    <td style="padding: 0.85rem 1.25rem;">
                      <a href="${prod.targetUrl}" target="_blank" rel="noopener" style="font-size: 0.75rem; color: var(--accent-cyan); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${prod.targetUrl.replace(/^https?:\/\//, '')} ↗
                      </a>
                    </td>
                    <td style="padding: 0.85rem 1.25rem; text-align: center;">
                      <button class="btn-toggle-shop-product" data-product-id="${prod.id}" style="padding: 0.25rem 0.65rem; font-size: 0.72rem; font-weight: 700; border-radius: var(--radius-full); cursor: pointer; border: 1px solid ${prod.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; background: ${prod.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${prod.isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                        ${prod.isActive ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td style="padding: 0.85rem 1.25rem; text-align: right;">
                      <div style="display: inline-flex; gap: 0.4rem;">
                        <button class="btn-edit-shop-product" data-product-id="${prod.id}" style="padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-secondary); cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                          Edit
                        </button>
                        <button class="btn-delete-shop-product" data-product-id="${prod.id}" data-product-title="${prod.title}" style="padding: 0.35rem 0.65rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); cursor: pointer; font-size: 0.75rem; font-weight: 600;">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  public static bindEvents(modalElem: HTMLElement, refreshCallback: () => void) {
    const previewContainer = modalElem.querySelector('#admin-shopping-live-preview') as HTMLElement;
    if (previewContainer) {
      ShoppingCarousel.bindEvents(previewContainer);
    }

    // Toggle entire banner
    const toggleBanner = modalElem.querySelector('#toggle-shopping-banner') as HTMLInputElement;
    if (toggleBanner) {
      toggleBanner.addEventListener('change', () => {
        const config = ShoppingCarousel.getConfig();
        config.enabled = toggleBanner.checked;
        ShoppingCarousel.saveConfig(config);
        Toast.show(`Banner Rekomendasi Belanja sekarang ${config.enabled ? 'Diaktifkan (Tayang)' : 'Dinonaktifkan (Tersembunyi)'}.`);
        BentoSection.renderShoppingCarousel();
        refreshCallback();
      });
    }

    // Save config texts
    const formConfig = modalElem.querySelector('#form-shopping-config') as HTMLFormElement;
    if (formConfig) {
      formConfig.addEventListener('submit', (e) => {
        e.preventDefault();
        const badge = (modalElem.querySelector('#cfg-shop-badge') as HTMLInputElement).value;
        const partner = (modalElem.querySelector('#cfg-shop-partner') as HTMLInputElement).value;
        const title = (modalElem.querySelector('#cfg-shop-title') as HTMLInputElement).value;

        const config = ShoppingCarousel.getConfig();
        config.badgeText = badge;
        config.partnerText = partner;
        config.mainTitle = title;
        ShoppingCarousel.saveConfig(config);

        Toast.show('Pengaturan teks banner belanja berhasil disimpan.');
        BentoSection.renderShoppingCarousel();
        refreshCallback();
      });
    }

    // Add Product Modal
    modalElem.querySelector('#btn-add-shopping-product')?.addEventListener('click', () => {
      ShoppingManager.showShoppingProductModal(undefined, modalElem, refreshCallback);
    });

    // Edit Product Modal
    modalElem.querySelectorAll('.btn-edit-shop-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-product-id');
        if (!id) return;
        const product = ShoppingCarousel.getProducts().find(p => p.id === id);
        if (product) {
          ShoppingManager.showShoppingProductModal(product, modalElem, refreshCallback);
        }
      });
    });

    // Toggle Product Active
    modalElem.querySelectorAll('.btn-toggle-shop-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-product-id');
        if (!id) return;
        ShoppingCarousel.toggleProduct(id);
        refreshCallback();
      });
    });

    // Delete Product
    modalElem.querySelectorAll('.btn-delete-shop-product').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-product-id');
        const title = btn.getAttribute('data-product-title') || 'Produk';
        if (!id) return;
        if (confirm(`Yakin ingin menghapus produk "${title}" dari daftar rekomendasi?`)) {
          await ShoppingCarousel.deleteProduct(id);
          Toast.show(`Produk "${title}" telah dihapus.`);
          refreshCallback();
        }
      });
    });
  }

  public static showShoppingProductModal(product?: ShoppingProduct, _parentModal?: HTMLElement, refreshCallback?: () => void) {
    const isEdit = !!product;
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1rem;';

    const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
    const initialImg = product?.imageUrl ? ImageUtils.normalizeImageUrl(product.imageUrl) : defaultImg;

    overlay.innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl); padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 2rem; height: 2rem; border-radius: 8px; background: rgba(0, 242, 254, 0.12); color: #00f2fe; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                ${isEdit ? 'Edit Produk Belanja' : 'Tambah Produk Belanja Baru'}
              </h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Tampil di widget carousel Query Picks / Radar Gadget</span>
            </div>
          </div>
          <button class="btn-close" id="close-shop-modal" title="Tutup" style="background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="form-shopping-product" style="display: flex; flex-direction: column; gap: 1.15rem;">
          <!-- Product Title -->
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama / Judul Produk *</label>
            <input type="text" id="form-shop-title" required value="${product?.title || ''}" placeholder="e.g. POCO C65 (6/128 GB) Baterai 5000mAh Layar 90Hz" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <!-- Category -->
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kategori Produk</label>
            <input type="text" id="form-shop-category" value="${product?.category || 'Gadget & Tech'}" placeholder="e.g. Gadget, Fashion, Audio, PC" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <!-- Product Image & Direct Upload -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Foto Produk *</label>
              <label for="form-shop-file-input" style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(0, 242, 254, 0.08); padding: 0.2rem 0.55rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.25);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload dari Perangkat</span>
              </label>
              <input type="file" id="form-shop-file-input" accept="image/*" style="display: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <img id="form-shop-img-preview" src="${initialImg}" style="width: 58px; height: 58px; border-radius: 8px; object-fit: contain; background: #ffffff; border: 1.5px solid var(--border-color); padding: 2px; flex-shrink: 0;" />
              <input type="text" id="form-shop-image" required value="${initialImg}" placeholder="URL foto atau Google Drive link" style="flex: 1; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>
            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              Bisa langsung upload file foto dari galeri/laptop Anda, atau paste link Google Drive / URL CDN.
            </span>
          </div>

          <!-- Pricing Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 90px; gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Harga Asli (Coret)</label>
              <input type="text" id="form-shop-orig-price" value="${product?.originalPrice || ''}" placeholder="e.g. Rp 168.086" style="width: 100%; padding: 0.65rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Harga Promo / Diskon *</label>
              <input type="text" id="form-shop-disc-price" required value="${product?.discountPrice || ''}" placeholder="e.g. Rp 79.000" style="width: 100%; padding: 0.65rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--accent-cyan); font-weight: 800; font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Diskon %</label>
              <input type="text" id="form-shop-percent" value="${product?.discountPercent || ''}" placeholder="53%" style="width: 100%; padding: 0.65rem 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: #dc2626; font-weight: 800; font-size: 0.85rem; text-align: center;" />
            </div>
          </div>

          <!-- Target Link -->
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Tautan Beli / Link Afiliasi (Shopee / Tokopedia / Toko) *</label>
            <input type="url" id="form-shop-target" required value="${product?.targetUrl || 'https://shopee.co.id'}" placeholder="https://shopee.co.id/..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <!-- Active Switch -->
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.825rem; color: var(--text-primary);">Status Tayang Produk</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Aktifkan produk agar langsung berputar di carousel beranda</div>
            </div>
            <input type="checkbox" id="form-shop-active" ${product ? (product.isActive ? 'checked' : '') : 'checked'} style="width: 1.25rem; height: 1.25rem; cursor: pointer;" />
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-shop-form" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: #ea580c; color: #ffffff; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.4);">
              ${isEdit ? 'Simpan Perubahan' : 'Tambahkan Produk'}
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-shop-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-shop-form')?.addEventListener('click', closeForm);

    const imgInput = overlay.querySelector('#form-shop-image') as HTMLInputElement;
    const imgPreview = overlay.querySelector('#form-shop-img-preview') as HTMLImageElement;
    const fileInput = overlay.querySelector('#form-shop-file-input') as HTMLInputElement;

    const updatePreview = (url: string) => {
      const normalized = ImageUtils.normalizeImageUrl(url);
      if (normalized !== url && imgInput) {
        imgInput.value = normalized;
      }
      if (imgPreview) {
        imgPreview.src = normalized || ImageUtils.getInitialsAvatar('Produk', '#ff9800');
      }
    };

    if (imgInput) {
      imgInput.addEventListener('input', () => updatePreview(imgInput.value));
      imgInput.addEventListener('change', () => updatePreview(imgInput.value));
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file) {
          ImageUtils.processImageFile(file, 600, 0.85, (base64) => {
            imgInput.value = base64;
            imgPreview.src = base64;
            Toast.show('Foto produk berhasil diunggah dari perangkat.');
          });
        }
      });
    }

    // Handle Form Submit
    const form = overlay.querySelector('#form-shopping-product') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (overlay.querySelector('#form-shop-title') as HTMLInputElement).value.trim();
      const category = (overlay.querySelector('#form-shop-category') as HTMLInputElement).value.trim();
      const imageUrl = (overlay.querySelector('#form-shop-image') as HTMLInputElement).value.trim();
      const originalPrice = (overlay.querySelector('#form-shop-orig-price') as HTMLInputElement).value.trim();
      const discountPrice = (overlay.querySelector('#form-shop-disc-price') as HTMLInputElement).value.trim();
      let discountPercent = (overlay.querySelector('#form-shop-percent') as HTMLInputElement).value.trim();
      const targetUrl = (overlay.querySelector('#form-shop-target') as HTMLInputElement).value.trim();
      const isActive = (overlay.querySelector('#form-shop-active') as HTMLInputElement).checked;

      if (!title || !discountPrice || !targetUrl) {
        Toast.show('Harap lengkapi nama produk, harga promo, dan link beli.');
        return;
      }

      if (discountPercent && !discountPercent.includes('%') && !isNaN(Number(discountPercent))) {
        discountPercent = `${discountPercent}%`;
      }

      if (isEdit && product) {
        await ShoppingCarousel.updateProduct(product.id, {
          title,
          category,
          imageUrl,
          originalPrice,
          discountPrice,
          discountPercent,
          targetUrl,
          isActive
        });
        Toast.show(`Produk "${title}" berhasil diperbarui.`);
      } else {
        await ShoppingCarousel.addProduct({
          title,
          category,
          imageUrl,
          originalPrice,
          discountPrice,
          discountPercent,
          targetUrl,
          isActive
        });
        Toast.show(`Produk "${title}" berhasil ditambahkan.`);
      }

      closeForm();
      if (refreshCallback) refreshCallback();
    });
  }
}
