import { ImageUtils } from '../utils/imageUtils';

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
  badgeText: string; // e.g. "LAGI DISKON"
  partnerText: string; // e.g. "Powered by QUERYINDO"
  mainTitle: string; // e.g. "REKOMENDASI BARANG PILIHANMU"
}

export class ShoppingCarousel {
  private static STORAGE_KEY_PRODUCTS = 'queryindo_shopping_products';
  private static STORAGE_KEY_CONFIG = 'queryindo_shopping_config';

  private static DEFAULT_CONFIG: ShoppingWidgetConfig = {
    enabled: true,
    badgeText: 'LAGI DISKON',
    partnerText: 'Powered by QUERYINDO',
    mainTitle: 'REKOMENDASI BARANG PILIHANMU'
  };

  private static DEFAULT_PRODUCTS: ShoppingProduct[] = [
    {
      id: 'shop-01',
      title: 'COSI ACTIVE Baju Olahraga Wanita DryFit QuickDry',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 168.086',
      discountPrice: 'Rp 79.000',
      discountPercent: '53%',
      targetUrl: 'https://shopee.co.id',
      category: 'Fashion & Sport',
      isActive: true,
      clicks: 124
    },
    {
      id: 'shop-02',
      title: 'POCO C65 (6/128 GB) Baterai 5000mAh Layar 90Hz',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 2.240.000',
      discountPrice: 'Rp 1.899.000',
      discountPercent: '15%',
      targetUrl: 'https://tokopedia.com',
      category: 'Gadget & Smartphone',
      isActive: true,
      clicks: 310
    },
    {
      id: 'shop-03',
      title: 'Bendera HUT RI 81 Merah Putih Agustusan Satin Super',
      imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 271.107',
      discountPrice: 'Rp 178.990',
      discountPercent: '34%',
      targetUrl: 'https://shopee.co.id',
      category: 'Peralatan & Dekorasi',
      isActive: true,
      clicks: 87
    },
    {
      id: 'shop-04',
      title: 'Anker Soundcore R50i TWS Bluetooth 5.3 BassBoost IPX5',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 399.000',
      discountPrice: 'Rp 195.000',
      discountPercent: '51%',
      targetUrl: 'https://tokopedia.com',
      category: 'Audio & Gadget',
      isActive: true,
      clicks: 254
    },
    {
      id: 'shop-05',
      title: 'ACOME Smartwatch IP68 Waterproof Heart Rate Monitor',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 599.000',
      discountPrice: 'Rp 279.000',
      discountPercent: '53%',
      targetUrl: 'https://shopee.co.id',
      category: 'Wearable Tech',
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
      category: 'PC & Peripherals',
      isActive: true,
      clicks: 195
    },
    {
      id: 'shop-07',
      title: 'Baseus Powerbank 20.000mAh 65W Fast Charging PD Laptop',
      imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80',
      originalPrice: 'Rp 650.000',
      discountPrice: 'Rp 389.000',
      discountPercent: '40%',
      targetUrl: 'https://shopee.co.id',
      category: 'Aksesoris Mobile',
      isActive: true,
      clicks: 142
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
  }

  public static getProducts(): ShoppingProduct[] {
    const raw = localStorage.getItem(this.STORAGE_KEY_PRODUCTS);
    if (!raw) {
      this.saveProducts(this.DEFAULT_PRODUCTS);
      return this.DEFAULT_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      this.saveProducts(this.DEFAULT_PRODUCTS);
      return this.DEFAULT_PRODUCTS;
    } catch {
      return this.DEFAULT_PRODUCTS;
    }
  }

  public static saveProducts(products: ShoppingProduct[]): void {
    localStorage.setItem(this.STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  }

  public static addProduct(data: Omit<ShoppingProduct, 'id' | 'clicks'>): ShoppingProduct {
    const products = this.getProducts();
    const newProduct: ShoppingProduct = {
      ...data,
      id: `shop-${Date.now().toString().slice(-4)}`,
      clicks: 0
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  public static updateProduct(id: string, updated: Partial<ShoppingProduct>): boolean {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    products[idx] = { ...products[idx], ...updated };
    this.saveProducts(products);
    return true;
  }

  public static deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    this.saveProducts(filtered);
    return true;
  }

  public static toggleProduct(id: string): boolean {
    const products = this.getProducts();
    const item = products.find(p => p.id === id);
    if (!item) return false;
    item.isActive = !item.isActive;
    this.saveProducts(products);
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
   * SVG Mascot Illustration: Cool Blue Smartphone wearing sunglasses, smiling,
   * carrying bright orange shopping bags with dynamic energy lines.
   */
  private static getMascotSVG(): string {
    return `
      <svg class="shopping-mascot-svg" viewBox="0 0 200 220" width="160" height="175" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Drop Shadow / Glow -->
        <ellipse cx="105" cy="205" rx="55" ry="9" fill="rgba(0,0,0,0.25)" />
        
        <!-- Left Arm Carrying Shopping Bag -->
        <path d="M60 115 C40 120 28 140 38 160" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round"/>
        <path d="M38 160 C38 152 48 152 48 160 L54 195 C54 198 48 200 32 200 C26 200 22 198 22 195 L28 160 Z" fill="#ff6b00" />
        <path d="M30 160 Q38 146 46 160" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="38" y="184" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="Arial, sans-serif">Q</text>
        
        <!-- Right Leg -->
        <path d="M125 170 L140 195" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round"/>
        <!-- Right Shoe (Sneaker) -->
        <ellipse cx="148" cy="200" rx="14" ry="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
        <path d="M137 200 C137 194 148 194 160 200 L158 203 L137 203 Z" fill="#ff5722"/>

        <!-- Left Leg -->
        <path d="M85 170 L78 196" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round"/>
        <!-- Left Shoe (Sneaker) -->
        <ellipse cx="73" cy="202" rx="14" ry="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
        <path d="M62 202 C62 196 73 196 85 202 L83 205 L62 205 Z" fill="#ff5722"/>

        <!-- Smartphone Body -->
        <rect x="55" y="30" width="95" height="150" rx="20" fill="url(#phoneGrad)" stroke="#60a5fa" stroke-width="3.5" />
        <!-- Screen Bezel / Glass Reflection -->
        <rect x="62" y="38" width="81" height="134" rx="14" fill="#0f172a" />
        <path d="M64 40 L135 40 L64 120 Z" fill="rgba(255,255,255,0.08)" />

        <!-- Camera Notch / Speaker -->
        <rect x="90" y="44" width="25" height="4" rx="2" fill="#334155" />
        <circle cx="102" cy="53" r="2.5" fill="#38bdf8" />

        <!-- Cool Sunglasses -->
        <!-- Left Lens -->
        <path d="M68 82 C68 76 83 74 97 78 C97 94 85 98 71 94 C68 91 68 86 68 82 Z" fill="#090d16" stroke="#1e293b" stroke-width="1.5" />
        <!-- Right Lens -->
        <path d="M106 79 C120 75 136 78 136 84 C136 88 135 93 131 96 C118 100 106 94 106 79 Z" fill="#090d16" stroke="#1e293b" stroke-width="1.5" />
        <!-- Sunglasses Bridge -->
        <path d="M97 80 Q101.5 76 106 81" stroke="#090d16" stroke-width="3.5" stroke-linecap="round" />
        <!-- Lens Shine / Highlight Reflection -->
        <path d="M72 82 L86 78 L80 90 Z" fill="rgba(255,255,255,0.4)" />
        <path d="M110 82 L124 78 L118 90 Z" fill="rgba(255,255,255,0.4)" />

        <!-- Big Happy Mouth with Smile -->
        <path d="M85 110 Q102 128 120 110" stroke="#f1f5f9" stroke-width="3.5" stroke-linecap="round" fill="#b91c1c" />
        <path d="M95 118 Q102 125 110 118" fill="#f43f5e" />

        <!-- Rosy Cheeks -->
        <circle cx="75" cy="112" r="5" fill="rgba(251,113,133,0.6)" />
        <circle cx="128" cy="112" r="5" fill="rgba(251,113,133,0.6)" />

        <!-- Right Arm Waving Cheerfully -->
        <path d="M148 105 Q172 90 168 72" stroke="#f1f5f9" stroke-width="8" stroke-linecap="round" />
        <!-- White Glove Hand -->
        <circle cx="168" cy="70" r="9" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <circle cx="162" cy="65" r="4.5" fill="#ffffff" />
        <circle cx="170" cy="62" r="4" fill="#ffffff" />

        <!-- Floating Shopping Badge/Stars -->
        <path d="M175 42 L178 49 L185 50 L180 55 L181 62 L175 58 L169 62 L170 55 L165 50 L172 49 Z" fill="#fbbf24" />
        <circle cx="28" cy="95" r="4" fill="#38bdf8" />
        <circle cx="185" cy="120" r="3" fill="#f43f5e" />

        <defs>
          <linearGradient id="phoneGrad" x1="55" y1="30" x2="150" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="50%" stop-color="#1d4ed8" />
            <stop offset="100%" stop-color="#1e3a8a" />
          </linearGradient>
        </defs>
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
          <div class="shopping-bg-stripes"></div>

          <!-- Left Column: Branding, Title & Mascot -->
          <div class="shopping-brand-col">
            <div class="shopping-tag-badge">
              <span class="shopping-tag-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.79 2.29a2.5 2.5 0 0 0-3.54 0L2.29 9.25a2.5 2.5 0 0 0 0 3.54l6.96 6.96a2.5 2.5 0 0 0 3.54 0l6.96-6.96a2.5 2.5 0 0 0 0-3.54l-6.96-6.96zM7.5 9A1.5 1.5 0 1 1 9 7.5 1.5 1.5 0 0 1 7.5 9z"/></svg>
              </span>
              <span class="shopping-tag-label">${config.badgeText || 'LAGI DISKON'}</span>
              <span class="shopping-powered-by">${config.partnerText || 'Powered by QUERYINDO'}</span>
            </div>

            <h3 class="shopping-main-title">
              ${config.mainTitle || 'REKOMENDASI BARANG PILIHANMU'}
            </h3>

            <div class="shopping-mascot-container">
              ${this.getMascotSVG()}
            </div>
          </div>

          <!-- Right Column: Horizontal Product Slider -->
          <div class="shopping-slider-col">
            <!-- Navigation Left Button -->
            <button class="shopping-nav-btn shopping-nav-prev" id="btn-shop-prev" aria-label="Geser ke kiri" title="Produk Sebelumnya">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <!-- Scrollable Track of Products -->
            <div class="shopping-products-track" id="shopping-products-track">
              ${products.map(prod => this.renderProductCardHTML(prod)).join('')}
            </div>

            <!-- Navigation Right Button -->
            <button class="shopping-nav-btn shopping-nav-next" id="btn-shop-next" aria-label="Geser ke kanan" title="Produk Selanjutnya">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
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
    const fallbackSvg = ImageUtils.getInitialsAvatar(product.title, '#ff9800');

    return `
      <div class="shopping-product-card" data-product-id="${product.id}">
        <!-- Discount Tag Badge -->
        ${product.discountPercent ? `
          <div class="shop-badge-discount">
            ${product.discountPercent.includes('%') ? product.discountPercent : `${product.discountPercent}%`}
          </div>
        ` : ''}

        <!-- Product Image -->
        <div class="shop-card-img-wrap">
          <img 
            src="${directUrl || fallbackSvg}" 
            alt="${product.title}" 
            class="shop-card-img"
            loading="lazy"
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
            Beli
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
      const scrollStep = 240;

      btnPrev.addEventListener('click', () => {
        track.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      });

      btnNext.addEventListener('click', () => {
        track.scrollBy({ left: scrollStep, behavior: 'smooth' });
      });

      // Update button visibility based on scroll position
      const updateNavVisibility = () => {
        const atStart = track.scrollLeft <= 10;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
        
        btnPrev.style.opacity = atStart ? '0.3' : '1';
        btnPrev.style.pointerEvents = atStart ? 'none' : 'auto';

        btnNext.style.opacity = atEnd ? '0.3' : '1';
        btnNext.style.pointerEvents = atEnd ? 'none' : 'auto';
      };

      track.addEventListener('scroll', updateNavVisibility, { passive: true });
      // Trigger once on init
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
