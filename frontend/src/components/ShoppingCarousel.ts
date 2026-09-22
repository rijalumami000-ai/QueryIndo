import { ImageUtils } from '../utils/imageUtils';
import { ApiService } from '../services/apiService';

export interface ShoppingProduct {
  id: string;
  title: string;
  imageUrl: string;
  originalPrice: string; // e.g. "Rp 168.086"
  discountPrice: string; // e.g. "Rp 79.000"
  discountPercent: string; // e.g. "53%"
  targetUrl: string; // Shopee / Tokopedia / Mitra link
  category?: string;
  isActive: boolean;
  clicks?: number;
}

export interface ShoppingWidgetConfig {
  enabled: boolean;
  badgeText: string; // e.g. "⚡ QUERY PICKS"
  partnerText: string; // e.g. "Kurasi Lab Redaksi"
  mainTitle: string; // e.g. "RADAR GADGET & HARDWARE PILIHAN"
}

export class ShoppingCarousel {
  private static STORAGE_KEY_PRODUCTS = 'queryindo_shopping_products_v2';
  private static STORAGE_KEY_CONFIG = 'queryindo_shopping_config_v3';

  private static DEFAULT_CONFIG: ShoppingWidgetConfig = {
    enabled: false,
    badgeText: '⚡ QUERY PICKS',
    partnerText: 'Kurasi Lab Redaksi',
    mainTitle: 'RADAR GADGET & HARDWARE PILIHAN'
  };

  // @ts-ignore
  private static DEFAULT_PRODUCTS: ShoppingProduct[] = [
    {
      id: 'shop-01',
      title: 'EMBA Perfume - Reef EDP 30ml',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 199.000',
      discountPrice: 'Rp 79.900',
      discountPercent: '60%',
      targetUrl: 'https://shopee.co.id',
      category: 'BEAUTY & PERSONAL CARE',
      isActive: true,
      clicks: 310
    },
    {
      id: 'shop-02',
      title: 'MODOFO Tumbler Stainless 710ml Botol Minum Termos',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 98.000',
      discountPrice: 'Rp 37.385',
      discountPercent: '61%',
      targetUrl: 'https://shopee.co.id',
      category: 'HOME & LIVING',
      isActive: true,
      clicks: 195
    },
    {
      id: 'shop-03',
      title: 'Sepatu Reebok classic premium sepatu sneakers',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 310.000',
      discountPrice: 'Rp 150.351',
      discountPercent: '51%',
      targetUrl: 'https://tokopedia.com',
      category: 'FASHION',
      isActive: true,
      clicks: 254
    },
    {
      id: 'shop-04',
      title: 'KING LUCKY M11 Portable Fan Turbo Kipas USB Mini',
      imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 90.000',
      discountPrice: 'Rp 39.004',
      discountPercent: '56%',
      targetUrl: 'https://shopee.co.id',
      category: 'GADGET & TECH',
      isActive: true,
      clicks: 142
    },
    {
      id: 'shop-05',
      title: 'IP13 256GB FULLSET MULUS Garansi Resmi',
      imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 3.999.000',
      discountPrice: 'Rp 2.999.000',
      discountPercent: '25%',
      targetUrl: 'https://tokopedia.com',
      category: 'GADGET & TECH',
      isActive: true,
      clicks: 168
    },
    {
      id: 'shop-06',
      title: 'Keychron K2 V2 Wireless Mechanical Keyboard RGB Hot-Swap',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 1.450.000',
      discountPrice: 'Rp 1.087.000',
      discountPercent: '25%',
      targetUrl: 'https://tokopedia.com',
      category: 'PC & PERIPHERALS',
      isActive: true,
      clicks: 182
    }
  ];

  public static getConfig(): ShoppingWidgetConfig {
    const raw = localStorage.getItem(this.STORAGE_KEY_CONFIG);
    if (!raw) {
      this.saveConfig(this.DEFAULT_CONFIG);
      return this.DEFAULT_CONFIG;
    }
    try {
      return { ...this.DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return this.DEFAULT_CONFIG;
    }
  }

  public static saveConfig(config: ShoppingWidgetConfig): void {
    localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(config));
    ApiService.saveShoppingConfig(config).catch(() => {});
  }

  public static async syncWithBackend(): Promise<void> {
    try {
      const serverData = await ApiService.getShoppingData();
      if (serverData) {
        if (serverData.config) {
          localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(serverData.config));
        }
        if (Array.isArray(serverData.products)) {
          localStorage.setItem(this.STORAGE_KEY_PRODUCTS, JSON.stringify(serverData.products));
        }
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data belanja dari server:', err);
    }
  }

  public static getProducts(): ShoppingProduct[] {
    const raw = localStorage.getItem(this.STORAGE_KEY_PRODUCTS);
    if (raw === null) {
      this.saveProducts(this.DEFAULT_PRODUCTS);
      return this.DEFAULT_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }

  public static saveProducts(products: ShoppingProduct[]): void {
    localStorage.setItem(this.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }

  public static async addProduct(data: Omit<ShoppingProduct, 'id' | 'clicks'>): Promise<ShoppingProduct> {
    const products = this.getProducts();
    const newProduct: ShoppingProduct = {
      ...data,
      id: `shop-${Date.now().toString().slice(-4)}`,
      clicks: 0
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    await ApiService.createShoppingProduct(newProduct);
    return newProduct;
  }

  public static async updateProduct(id: string, updated: Partial<ShoppingProduct>): Promise<boolean> {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products[idx] = { ...products[idx], ...updated };
    this.saveProducts(products);
    await ApiService.updateShoppingProduct(id, updated);
    return true;
  }

  public static async deleteProduct(id: string): Promise<boolean> {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    this.saveProducts(filtered);
    await ApiService.deleteShoppingProduct(id);
    return true;
  }

  public static toggleProduct(id: string): boolean {
    const products = this.getProducts();
    const item = products.find(p => p.id === id);
    if (!item) return false;
    item.isActive = !item.isActive;
    this.saveProducts(products);
    ApiService.updateShoppingProduct(id, { isActive: item.isActive }).catch(() => {});
    return true;
  }

  public static trackClick(id: string): void {
    const products = this.getProducts();
    const item = products.find(p => p.id === id);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      this.saveProducts(products);
    }
  }

  /**
   * Editorial Guarantee & Trust Box for Shopping Recommendations.
   * Promotes credibility and elevates conversion (ala Wirecutter / The Verge Deals).
   */
  private static getEditorialTrustCard(): string {
    return `
      <div class="shopping-trust-card">
        <div class="trust-card-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>STANDAR KURASI QUERYINDO</span>
        </div>
        <ul class="trust-card-list">
          <li>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Unit orisinal garansi resmi distributor</span>
          </li>
          <li>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Penurunan harga riil terverifikasi</span>
          </li>
          <li>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Bebas intervensi komersial pabrikan</span>
          </li>
        </ul>
      </div>
    `;
  }

  /**
   * Renders the complete Shopping Recommendation Carousel Banner HTML.
   */
  public static renderWidgetHTML(): string {
    const config = this.getConfig();
    if (!config.enabled) return '';

    const products = this.getProducts().filter(p => p.isActive);
    if (products.length === 0) return '';

    return `
      <section class="shopping-recommendation-section" id="shopping-recommendation-block">
        <div class="shopping-banner-wrapper">
          <!-- Left Column: Tech Branding, Title & Editorial Trust -->
          <div class="shopping-brand-col">
            <div class="shopping-tag-badge">
              <span class="shopping-tag-icon">⚡</span>
              <span class="shopping-tag-label">${config.badgeText || 'PILIHAN LAB REDAKSI'}</span>
              <span class="shopping-powered-by">${config.partnerText || 'Diskon Terverifikasi'}</span>
            </div>

            <h3 class="shopping-main-title">
              ${config.mainTitle || 'RADAR GADGET & PROMO TERBAIK'}
            </h3>

            <p class="shopping-main-desc">
              Kurasi perangkat cerdas, aksesoris produktivitas, dan penawaran harga terbaik yang terverifikasi redaksi QueryIndo.
            </p>

            ${this.getEditorialTrustCard()}
          </div>

          <!-- Right Column: Horizontal Product Slider -->
          <div class="shopping-slider-col">
            <!-- Navigation Left Button -->
            <button class="shopping-nav-btn shopping-nav-prev" id="btn-shop-prev" aria-label="Geser ke kiri" title="Produk Sebelumnya">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <!-- Scrollable Track of Products -->
            <div class="shopping-products-track" id="shopping-products-track">
              ${products.map(prod => this.renderProductCardHTML(prod)).join('')}
            </div>

            <!-- Navigation Right Button -->
            <button class="shopping-nav-btn shopping-nav-next" id="btn-shop-next" aria-label="Geser ke kanan" title="Produk Selanjutnya">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <!-- Affiliate Trust Disclosure (Wirecutter/Verge Standard) -->
        <div class="shopping-affiliate-disclaimer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span><strong>Transparansi Afiliasi:</strong> Redaksi QUERYINDO mengkurasi promo gadget terverifikasi secara independen. Kami dapat memperoleh komisi atas pembelian melalui tautan resmi ini tanpa biaya tambahan bagi Anda.</span>
        </div>
      </section>
    `;
  }

  /**
   * Renders an individual product card in the slider with high conversion cues.
   */
  private static renderProductCardHTML(product: ShoppingProduct): string {
    const directUrl = ImageUtils.normalizeImageUrl(product.imageUrl);
    const fallbackSvg = ImageUtils.getInitialsAvatar(product.title, '#00f2fe');

    // Detect merchant from target URL
    const urlLower = (product.targetUrl || '').toLowerCase();
    let merchantName = 'Mitra Resmi';
    if (urlLower.includes('shopee')) merchantName = 'Shopee';
    else if (urlLower.includes('tokopedia')) merchantName = 'Tokopedia';
    else if (urlLower.includes('blibli')) merchantName = 'Blibli';
    else if (urlLower.includes('lazada')) merchantName = 'Lazada';

    const discountClean = product.discountPercent ? product.discountPercent.replace(/[^0-9%]/g, '') : '';
    const discountLabel = discountClean ? (discountClean.includes('%') ? `HEMAT ${discountClean}` : `HEMAT ${discountClean}%`) : '';

    return `
      <div class="shopping-product-card" data-product-id="${product.id}">
        <!-- Top Row: Category & Savings Tag -->
        <div class="shop-card-top-row">
          <span class="shop-card-category-tag">${product.category || 'GADGET'}</span>
          ${discountLabel ? `
            <span class="shop-badge-discount">
              ${discountLabel}
            </span>
          ` : ''}
        </div>

        <!-- Product Image Frame -->
        <div class="shop-card-img-wrap">
          <img 
            src="${directUrl || fallbackSvg}" 
            alt="${product.title}" 
            class="shop-card-img"
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="this.onerror=null; this.src='${fallbackSvg}';"
          />
        </div>

        <!-- Product Meta & Title -->
        <div class="shop-card-content">
          <div class="shop-card-merchant-pill">
            <span class="merchant-dot"></span>
            <span>${merchantName}</span>
          </div>

          <h4 class="shop-card-title" title="${product.title}">
            ${product.title}
          </h4>

          <div class="shop-card-pricing">
            ${product.originalPrice ? `
              <div class="shop-price-original">${product.originalPrice}</div>
            ` : '<div class="shop-price-original-empty">&nbsp;</div>'}
            <div class="shop-price-discount">${product.discountPrice}</div>
          </div>

          <!-- High-Converting CTA Buy Button -->
          <a 
            href="${product.targetUrl}" 
            target="_blank" 
            rel="noopener sponsored" 
            class="btn-shop-buy"
            data-product-id="${product.id}"
            title="Beli produk ini di ${merchantName}"
          >
            <span>Cek Promo ${merchantName}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Binds user interactions: Horizontal scroll buttons, dragging, and click tracking.
   */
  public static bindEvents(container: HTMLElement = document.body): void {
    const track = container.querySelector('#shopping-products-track') as HTMLElement;
    const btnPrev = container.querySelector('#btn-shop-prev') as HTMLButtonElement;
    const btnNext = container.querySelector('#btn-shop-next') as HTMLButtonElement;

    if (track && btnPrev && btnNext) {
      const scrollStep = 220;

      btnPrev.addEventListener('click', () => {
        track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      });

      btnNext.addEventListener('click', () => {
        track.scrollBy({ left: scrollStep, behavior: 'smooth' });
      });

      // Update button visibility based on scroll position
      const updateNavVisibility = () => {
        const atStart = track.scrollLeft <= 8;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
        
        btnPrev.style.opacity = atStart ? '0.3' : '1';
        btnPrev.style.pointerEvents = atStart ? 'none' : 'auto';

        btnNext.style.opacity = atEnd ? '0.3' : '1';
        btnNext.style.pointerEvents = atEnd ? 'none' : 'auto';
      };

      track.addEventListener('scroll', updateNavVisibility, { passive: true });
      setTimeout(updateNavVisibility, 150);
    }

    // Bind click tracking on "Beli" buttons
    container.querySelectorAll('.btn-shop-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = btn.getAttribute('data-product-id');
        if (prodId) {
          this.trackClick(prodId);
        }
      });
    });
  }
}
