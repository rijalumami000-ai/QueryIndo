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
  private static STORAGE_KEY_CONFIG = 'queryindo_shopping_config_v2';

  private static DEFAULT_CONFIG: ShoppingWidgetConfig = {
    enabled: true,
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
   * Original High-Tech Artwork: Holographic Quantum Tech Core & Circuitry Seal.
   * Completely unique and bespoke for QUERYINDO, eliminating any cartoon resemblance.
   */
  private static getTechCoreSVG(): string {
    return `
      <svg class="shopping-tech-core-svg" viewBox="0 0 200 180" width="165" height="150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Core Radial Glow -->
          <radialGradient id="qCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.4" />
            <stop offset="60%" stop-color="#3b82f6" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>

          <!-- Hologram Hex Core Gradient -->
          <linearGradient id="qHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f2fe" />
            <stop offset="50%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>

          <!-- Plate Gradient -->
          <linearGradient id="qPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>

        <!-- Ambient Glow -->
        <circle cx="100" cy="90" r="75" fill="url(#qCoreGlow)" />

        <!-- Circuit Trace Lines -->
        <g stroke="rgba(0, 242, 254, 0.4)" stroke-width="1.5" stroke-linecap="round">
          <!-- Left circuits -->
          <path d="M20 90 L60 90 L75 75" />
          <circle cx="20" cy="90" r="3" fill="#00f2fe" />
          <path d="M35 120 L65 120 L80 105" />
          <circle cx="35" cy="120" r="2.5" fill="#38bdf8" />
          <path d="M30 60 L60 60 L75 75" />
          <circle cx="30" cy="60" r="2.5" fill="#38bdf8" />

          <!-- Right circuits -->
          <path d="M180 90 L140 90 L125 105" />
          <circle cx="180" cy="90" r="3" fill="#00f2fe" />
          <path d="M165 60 L135 60 L120 75" />
          <circle cx="165" cy="60" r="2.5" fill="#38bdf8" />
          <path d="M170 120 L140 120 L125 105" />
          <circle cx="170" cy="120" r="2.5" fill="#38bdf8" />
        </g>

        <!-- Outer Tech Ring -->
        <circle cx="100" cy="90" r="54" stroke="rgba(0, 242, 254, 0.3)" stroke-width="1.5" stroke-dasharray="4 6" />
        <circle cx="100" cy="90" r="46" stroke="rgba(59, 130, 246, 0.5)" stroke-width="2" />

        <!-- Isometric Quantum Tech Hexagon Platform -->
        <polygon points="100,50 135,70 135,110 100,130 65,110 65,70" fill="url(#qPlateGrad)" stroke="url(#qHexGrad)" stroke-width="2.5" />

        <!-- Inner Chip Die Core -->
        <rect x="84" y="74" width="32" height="32" rx="6" fill="#090d16" stroke="#00f2fe" stroke-width="2" />
        
        <!-- QueryIndo Tech "Q" Hologram Emblem -->
        <path d="M100 81 C94.5 81 90 85.5 90 91 C90 96.5 94.5 101 100 101 C102.2 101 104.2 100.2 105.8 99 L109 103 L111 101 L108 97 C109.2 95.3 110 93.2 110 91 C110 85.5 105.5 81 100 81 Z M100 85 C103.3 85 106 87.7 106 91 C106 94.3 103.3 97 100 97 C96.7 97 94 94.3 94 91 C94 87.7 96.7 85 100 85 Z" fill="#00f2fe" />

        <!-- Floating Pulse Nodes -->
        <circle cx="100" cy="42" r="3.5" fill="#00f2fe">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="145" cy="90" r="3.5" fill="#3b82f6">
          <animate attributeName="opacity" values="1;0.4;1" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="55" cy="90" r="3.5" fill="#3b82f6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
        </circle>

        <!-- Laser Scan Line -->
        <line x1="72" y1="90" x2="128" y2="90" stroke="#00f2fe" stroke-width="2" stroke-linecap="round" opacity="0.8">
          <animate attributeName="y1" values="65;115;65" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values="65;115;65" dur="3s" repeatCount="indefinite" />
        </line>
      </svg>
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
          <!-- Ambient Background Effects -->
          <div class="shopping-bg-glow"></div>
          <div class="shopping-bg-grid"></div>

          <!-- Left Column: Tech Branding, Title & Holographic Core -->
          <div class="shopping-brand-col">
            <div class="shopping-tag-badge">
              <span class="shopping-tag-icon">⚡</span>
              <span class="shopping-tag-label">${config.badgeText || 'QUERY PICKS'}</span>
              <span class="shopping-powered-by">${config.partnerText || 'Kurasi Lab Redaksi'}</span>
            </div>

            <h3 class="shopping-main-title">
              ${config.mainTitle || 'RADAR GADGET & HARDWARE PILIHAN'}
            </h3>

            <p class="shopping-main-desc">
              Kurasi perangkat cerdas, aksesoris produktivitas, dan penawaran terverifikasi oleh lab QueryIndo.
            </p>

            <div class="shopping-tech-core-container">
              ${this.getTechCoreSVG()}
            </div>
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
      </section>
    `;
  }

  /**
   * Renders an individual product card in the slider.
   */
  private static renderProductCardHTML(product: ShoppingProduct): string {
    const directUrl = ImageUtils.normalizeImageUrl(product.imageUrl);
    const fallbackSvg = ImageUtils.getInitialsAvatar(product.title, '#00f2fe');

    return `
      <div class="shopping-product-card" data-product-id="${product.id}">
        <!-- Category Pill & Discount Tag -->
        <div class="shop-card-top-row">
          <span class="shop-card-category-tag">${product.category || 'GEAR'}</span>
          ${product.discountPercent ? `
            <span class="shop-badge-discount">
              ${product.discountPercent.includes('%') ? product.discountPercent : `${product.discountPercent}%`}
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
          <h4 class="shop-card-title" title="${product.title}">
            ${product.title}
          </h4>

          <div class="shop-card-pricing">
            ${product.originalPrice ? `
              <div class="shop-price-original">${product.originalPrice}</div>
            ` : '<div class="shop-price-original-empty">&nbsp;</div>'}
            <div class="shop-price-discount">${product.discountPrice}</div>
          </div>

          <!-- CTA Buy Button -->
          <a 
            href="${product.targetUrl}" 
            target="_blank" 
            rel="noopener sponsored" 
            class="btn-shop-buy"
            data-product-id="${product.id}"
          >
            <span>Cek Promo</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
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
