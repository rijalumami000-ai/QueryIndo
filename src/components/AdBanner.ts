export type AdPlacement = 
  | 'leaderboard' 
  | 'in_article' 
  | 'sidebar' 
  | 'midstream' 
  | 'billboard' 
  | 'skyscraper_left' 
  | 'skyscraper_right' 
  | 'in_feed';

export interface AdCampaign {
  id: string;
  sponsorName: string;
  tagline: string;
  placement: AdPlacement;
  imageUrl: string;
  targetUrl: string;
  ctaText: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export interface GoogleAdSenseConfig {
  enabled: boolean;
  client: string; // e.g. "ca-pub-1234567890123456"
  slots: {
    billboard?: string;
    in_article?: string;
    in_feed?: string;
    sidebar?: string;
    midstream?: string;
    skyscraper_left?: string;
    skyscraper_right?: string;
  };
}

export class AdBanner {
  private static STORAGE_KEY = 'byte_ad_campaigns';
  private static ADSENSE_KEY = 'byte_adsense_config';

  private static DEFAULT_ADS: AdCampaign[] = [
    {
      id: 'ad-01',
      sponsorName: 'NVIDIA Enterprise AI',
      tagline: 'Akselerasi Infrastruktur Komputasi AI dan LLM Nasional dengan Kluster NVIDIA H200 Tensor Core.',
      placement: 'leaderboard',
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      targetUrl: 'https://nvidia.com',
      ctaText: 'Pelajari Solusi Enterprise →',
      isActive: true,
      impressions: 4820,
      clicks: 342
    },
    {
      id: 'ad-02',
      sponsorName: 'AWS Sovereign Cloud Indonesia',
      tagline: 'Kepatuhan Regulasi Data Nasional & Efisiensi Cloud Multi-Region Skala Industri.',
      placement: 'in_article',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      targetUrl: 'https://aws.amazon.com',
      ctaText: 'Konsultasi Arsitek Cloud →',
      isActive: true,
      impressions: 2150,
      clicks: 189
    },
    {
      id: 'ad-03',
      sponsorName: 'Telkomsel Enterprise 5G',
      tagline: 'Solusi IoT Industri Cerdas & Jaringan Private 5G Pabrik Otomasi.',
      placement: 'sidebar',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
      targetUrl: 'https://telkomsel.com/enterprise',
      ctaText: 'Uji Coba Gratis →',
      isActive: true,
      impressions: 3200,
      clicks: 214
    },
    {
      id: 'ad-04',
      sponsorName: 'Google Cloud Platform RI',
      tagline: 'Bangun Model Gen AI & Vertex AI Terdistribusi di Region Jakarta dengan Latensi Terendah.',
      placement: 'billboard',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
      targetUrl: 'https://cloud.google.com',
      ctaText: 'Mulai Uji Coba $300 →',
      isActive: true,
      impressions: 5120,
      clicks: 410
    },
    {
      id: 'ad-05',
      sponsorName: 'Indosat Ooredoo AI Cloud',
      tagline: 'Kedaulatan Cloud AI Berbasis GPU Sovereign Pertama untuk Ekosistem Startup Nasional.',
      placement: 'midstream',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      targetUrl: 'https://indosatooredoo.com',
      ctaText: 'Akses Kuota Cloud →',
      isActive: true,
      impressions: 3890,
      clicks: 295
    },
    {
      id: 'ad-06',
      sponsorName: 'Microsoft Azure AI',
      tagline: 'Akselerasi Transformasi Copilot Enterprise & Agentic AI Terintegrasi.',
      placement: 'skyscraper_left',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      targetUrl: 'https://azure.microsoft.com',
      ctaText: 'Eksplorasi Azure →',
      isActive: true,
      impressions: 1980,
      clicks: 142
    },
    {
      id: 'ad-07',
      sponsorName: 'CyberArk Zero Trust',
      tagline: 'Perlindungan Identitas Mesin & Akses Istimewa Standar Perbankan.',
      placement: 'skyscraper_right',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
      targetUrl: 'https://cyberark.com',
      ctaText: 'Audit Privilese →',
      isActive: true,
      impressions: 2140,
      clicks: 168
    },
    {
      id: 'ad-08',
      sponsorName: 'Lenovo ThinkSystem AI',
      tagline: 'Server Berpendingin Cair Neptune™ untuk Komputasi AI Skala Data Center Nasional.',
      placement: 'in_feed',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      targetUrl: 'https://lenovo.com',
      ctaText: 'Lihat Spesifikasi Server →',
      isActive: true,
      impressions: 3410,
      clicks: 260
    }
  ];

  public static getCampaigns(): AdCampaign[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.saveCampaigns(this.DEFAULT_ADS);
      return this.DEFAULT_ADS;
    }
    try {
      const parsed = JSON.parse(raw);
      // Merge any new default placements if missing in stored data
      if (Array.isArray(parsed) && parsed.length < this.DEFAULT_ADS.length) {
        const ids = new Set(parsed.map((a: any) => a.id));
        const missing = this.DEFAULT_ADS.filter(a => !ids.has(a.id));
        const merged = [...parsed, ...missing];
        this.saveCampaigns(merged);
        return merged;
      }
      return parsed;
    } catch {
      return this.DEFAULT_ADS;
    }
  }

  public static saveCampaigns(campaigns: AdCampaign[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(campaigns));
  }

  public static getActiveAd(placement: AdPlacement): AdCampaign | null {
    const list = this.getCampaigns();
    const matches = list.filter(a => a.placement === placement && a.isActive);
    if (matches.length === 0) return null;
    return matches[Math.floor(Math.random() * matches.length)];
  }

  public static trackClick(adId: string) {
    const list = this.getCampaigns();
    const ad = list.find(a => a.id === adId);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.saveCampaigns(list);
    }
  }

  public static trackImpression(adId: string) {
    const list = this.getCampaigns();
    const ad = list.find(a => a.id === adId);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.saveCampaigns(list);
    }
  }

  // --------------------------------------------------------------------------
  // Google AdSense Integration Architecture
  // --------------------------------------------------------------------------
  public static getAdSenseConfig(): GoogleAdSenseConfig {
    const raw = localStorage.getItem(this.ADSENSE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return {
      enabled: false,
      client: '', // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
      slots: {}
    };
  }

  public static saveAdSenseConfig(config: GoogleAdSenseConfig) {
    localStorage.setItem(this.ADSENSE_KEY, JSON.stringify(config));
  }

  public static isAdSenseEnabled(): boolean {
    const cfg = this.getAdSenseConfig();
    return cfg.enabled && Boolean(cfg.client);
  }

  public static renderGoogleAdSenseHTML(slotId: string, format: 'auto' | 'rectangle' | 'vertical' = 'auto'): string {
    const cfg = this.getAdSenseConfig();
    return `
      <div class="google-adsense-wrap" style="text-align:center; margin:1rem 0; overflow:hidden;">
        <span style="display:block; font-size:0.6rem; color:var(--text-muted); font-family:var(--font-mono); margin-bottom:0.25rem;">ADVERTISEMENT • GOOGLE ADS</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${cfg.client}"
             data-ad-slot="${slotId}"
             data-ad-format="${format}"
             data-full-width-responsive="true"></ins>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // Renderers for Direct Sponsor Banners
  // --------------------------------------------------------------------------

  // Render Top Billboard Banner
  public static renderBillboardHTML(): string {
    const ad = this.getActiveAd('billboard');
    if (!ad) {
      return `
        <div class="ad-billboard-space ad-fallback-space" style="margin: 1.25rem 0; padding: 0.9rem 1.25rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 800; border: 1px solid rgba(0,242,254,0.3); padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(0,242,254,0.06);">RUANG IKLAN PREMIUM</span>
            <span style="font-size: 0.825rem; color: var(--text-secondary); font-weight: 500;">Jangkau ratusan ribu pembaca eksekutif & profesional teknologi di portal QUERYINDO.</span>
          </div>
          <a href="#page/info-iklan" style="font-size: 0.78rem; font-weight: 700; color: var(--accent-cyan); text-decoration: none; border-bottom: 1px solid var(--accent-cyan); padding-bottom: 1px;">Pasang Iklan Banner Disini →</a>
        </div>
      `;
    }

    this.trackImpression(ad.id);

    return `
      <div class="ad-billboard-space" data-ad-id="${ad.id}" style="margin: 1.25rem 0; padding: 1rem 1.5rem; background: linear-gradient(90deg, rgba(14, 165, 233, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%); border: 1px solid var(--border-color); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.25rem; position: relative; overflow: hidden;">
        <span style="position: absolute; top: 0.4rem; right: 0.65rem; font-size: 0.6rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.05em;">
          SPONSORED TOP BILLBOARD
        </span>
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 260px;">
          <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 52px; height: 52px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border-color);" />
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">${ad.sponsorName}</span>
              <span style="font-size: 0.65rem; color: var(--accent-cyan); font-weight: 700; font-family: var(--font-mono); background: rgba(0, 242, 254, 0.1); padding: 0.05rem 0.35rem; border-radius: 3px;">MITRA STRATEGIS</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${ad.tagline}</p>
          </div>
        </div>
        <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta" data-ad-id="${ad.id}" style="padding: 0.55rem 1.15rem; background: var(--accent-cyan); color: #000; font-weight: 800; font-size: 0.8rem; border-radius: var(--radius-full); text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; box-shadow: 0 4px 12px rgba(0, 242, 254, 0.25); white-space: nowrap;">
          ${ad.ctaText}
        </a>
      </div>
    `;
  }

  // Render Mid-Stream Panoramic Interstitial Banner
  public static renderMidstreamHTML(): string {
    const ad = this.getActiveAd('midstream');
    if (!ad) {
      return `
        <div class="ad-midstream-space ad-fallback-space" style="margin: 2.5rem 0; padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 800; border: 1px solid rgba(0,242,254,0.3); padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(0,242,254,0.06);">RUANG IKLAN EDITORIAL</span>
            <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">Kemitraan Industri Teknologi & Peluncuran Produk</span>
          </div>
          <p style="font-size: 0.825rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 0.75rem auto; line-height: 1.5;">Tampilkan solusi enterprise, cloud, atau inovasi hardware Anda di hadapan para pengambil keputusan IT nasional.</p>
          <a href="#page/info-iklan" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); text-decoration: none;">Konsultasi Penempatan Iklan Bersama Tim Media QUERYINDO →</a>
        </div>
      `;
    }

    this.trackImpression(ad.id);

    return `
      <div class="ad-midstream-space" data-ad-id="${ad.id}" style="margin: 2.5rem 0; padding: 1.5rem 2rem; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%); border: 1px solid var(--border-color); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; position: relative; overflow: hidden; box-shadow: var(--shadow-lg);">
        <span style="position: absolute; top: 0.5rem; right: 0.85rem; font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.05em;">
          SPONSORED SPOTLIGHT
        </span>
        <div style="display: flex; align-items: center; gap: 1.5rem; flex: 1; min-width: 280px;">
          <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);" />
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
              <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">${ad.sponsorName}</span>
              <span style="font-size: 0.68rem; color: #a855f7; font-weight: 800; font-family: var(--font-mono); background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.25); padding: 0.1rem 0.4rem; border-radius: 4px;">KOLABORASI TEKNOLOGI</span>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0; line-height: 1.5; max-width: 640px;">${ad.tagline}</p>
          </div>
        </div>
        <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta" data-ad-id="${ad.id}" style="padding: 0.75rem 1.6rem; background: linear-gradient(135deg, var(--accent-cyan) 0%, #3b82f6 100%); color: #000; font-weight: 800; font-size: 0.85rem; border-radius: var(--radius-full); text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem; box-shadow: 0 4px 16px rgba(0, 242, 254, 0.35); white-space: nowrap; transition: transform 0.2s;">
          ${ad.ctaText}
        </a>
      </div>
    `;
  }

  // Render Sidebar Ad Card (300x250 format)
  public static renderSidebarAdHTML(): string {
    const ad = this.getActiveAd('sidebar');
    if (!ad) {
      return `
        <div class="ad-sidebar-card ad-fallback-space" style="margin-top: 1.5rem; padding: 1.25rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-md); text-align: center;">
          <span style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 800; border: 1px solid rgba(0,242,254,0.3); padding: 0.15rem 0.45rem; border-radius: 4px; display: inline-block; margin-bottom: 0.5rem;">SPACE IKLAN SIDEBAR</span>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0 0 0.6rem 0;">Pasang banner produk Anda di kolom samping aktif.</p>
          <a href="#page/info-iklan" style="font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); text-decoration: none;">Hubungi Redaksi Iklan →</a>
        </div>
      `;
    }

    this.trackImpression(ad.id);

    return `
      <div class="ad-sidebar-card" data-ad-id="${ad.id}" style="margin-top: 1.5rem; padding: 1.25rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); position: relative; overflow: hidden;">
        <span style="position: absolute; top: 0.5rem; right: 0.65rem; font-size: 0.6rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.05em;">
          SPONSORED
        </span>
        <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 100%; height: 130px; border-radius: 8px; object-fit: cover; margin-bottom: 0.75rem; border: 1px solid var(--border-color);" />
        <h4 style="font-size: 0.925rem; font-weight: 800; margin: 0 0 0.35rem 0; color: var(--text-primary);">${ad.sponsorName}</h4>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 0.85rem 0; line-height: 1.45;">${ad.tagline}</p>
        <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta" data-ad-id="${ad.id}" style="display: block; text-align: center; padding: 0.55rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); font-weight: 800; font-size: 0.78rem; border-radius: var(--radius-md); text-decoration: none; transition: background 0.2s;">
          ${ad.ctaText}
        </a>
      </div>
    `;
  }

  // Render Leaderboard Banner (Di atas feed berita)
  public static renderLeaderboardHTML(): string {
    const ad = this.getActiveAd('leaderboard');
    if (!ad) {
      return `
        <div class="ad-leaderboard-card ad-fallback-space" style="margin: 2rem 0; padding: 1rem 1.5rem; background: rgba(255,255,255,0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 800; border: 1px solid rgba(0,242,254,0.3); padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(0,242,254,0.06);">SLOT BANNER LEADERBOARD</span>
            <span style="font-size: 0.825rem; color: var(--text-secondary);">Penempatan banner horizontal visibilitas tinggi di atas agregasi berita.</span>
          </div>
          <a href="#page/info-iklan" style="font-size: 0.78rem; font-weight: 700; color: var(--accent-cyan); text-decoration: none;">Reservasi Slot Iklan →</a>
        </div>
      `;
    }

    this.trackImpression(ad.id);

    return `
      <div class="ad-leaderboard-card" data-ad-id="${ad.id}" style="margin: 2rem 0; padding: 1.25rem 1.5rem; background: linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%); border: 1px solid var(--border-color); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; position: relative; overflow: hidden;">
        <span style="position: absolute; top: 0.5rem; right: 0.75rem; font-size: 0.65rem; font-weight: 800; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.05em; background: var(--bg-secondary); padding: 0.15rem 0.45rem; border-radius: 4px; border: 1px solid var(--border-color);">
          SPONSORED PARTNERSHIP
        </span>

        <div style="display: flex; align-items: center; gap: 1.25rem; flex: 1; min-width: 280px;">
          <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 72px; height: 72px; border-radius: 12px; object-fit: cover; border: 1px solid var(--border-color);" />
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
              <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${ad.sponsorName}</span>
              <span style="font-size: 0.68rem; color: var(--accent-cyan); font-weight: 700; font-family: var(--font-mono); background: rgba(0, 242, 254, 0.12); padding: 0.1rem 0.4rem; border-radius: 4px;">KEMITRAAN RESMI</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.45; max-width: 620px;">${ad.tagline}</p>
          </div>
        </div>

        <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta" data-ad-id="${ad.id}" style="padding: 0.65rem 1.35rem; background: var(--accent-cyan); color: #000; font-weight: 800; font-size: 0.825rem; border-radius: var(--radius-full); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 14px rgba(0, 242, 254, 0.3); transition: transform 0.2s ease;">
          ${ad.ctaText}
        </a>
      </div>
    `;
  }

  // Render Skyscraper Left / Right Gutters (Fixed Rails for >= 1400px Desktop)
  public static renderSkyscraperHTML(side: 'left' | 'right'): string {
    const isDismissed = sessionStorage.getItem(`byte_dismiss_skyscraper_${side}`);
    if (isDismissed) return '';

    const placement: AdPlacement = side === 'left' ? 'skyscraper_left' : 'skyscraper_right';
    const ad = this.getActiveAd(placement);

    if (!ad) {
      return `
        <div class="skyscraper-card skyscraper-fallback" data-skyscraper-side="${side}">
          <button class="btn-dismiss-skyscraper" data-dismiss-side="${side}" title="Tutup Iklan">✕</button>
          <div class="skyscraper-header-tag">IKLAN SPONSOR</div>
          <div class="skyscraper-content-wrap">
            <span class="skyscraper-icon">📢</span>
            <div class="skyscraper-title">Ruang Iklan Vertikal</div>
            <p class="skyscraper-desc">Jangkau audiens eksekutif secara eksklusif di sisi halaman.</p>
            <a href="#page/info-iklan" class="skyscraper-btn">Pasang Iklan →</a>
          </div>
        </div>
      `;
    }

    this.trackImpression(ad.id);

    return `
      <div class="skyscraper-card" data-ad-id="${ad.id}" data-skyscraper-side="${side}">
        <button class="btn-dismiss-skyscraper" data-dismiss-side="${side}" title="Tutup Iklan">✕</button>
        <div class="skyscraper-header-tag">SPONSORED RAIL</div>
        <div class="skyscraper-content-wrap">
          <img src="${ad.imageUrl}" alt="${ad.sponsorName}" class="skyscraper-img" />
          <div class="skyscraper-sponsor-badge">${ad.sponsorName}</div>
          <p class="skyscraper-desc">${ad.tagline}</p>
          <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta skyscraper-btn" data-ad-id="${ad.id}">
            ${ad.ctaText}
          </a>
        </div>
      </div>
    `;
  }

  // Render Native In-Feed Sponsored Card (Blends directly into News Grid)
  public static renderInFeedAdHTML(): string {
    const ad = this.getActiveAd('in_feed');
    if (!ad) return '';

    this.trackImpression(ad.id);

    return `
      <article class="article-card sponsored-feed-card" data-ad-id="${ad.id}">
        <div class="card-img-wrap">
          <img src="${ad.imageUrl}" alt="${ad.sponsorName}" class="card-img" loading="lazy" />
          <span class="card-category-badge sponsored-badge">SPONSORED</span>
        </div>
        <div class="card-body">
          <div class="sponsored-card-header">
            <span class="sponsored-sponsor-name">${ad.sponsorName}</span>
            <span class="sponsored-chip">MITRA RESMI</span>
          </div>
          <h3 class="card-title">${ad.tagline}</h3>
          <p class="card-excerpt">Solusi komputasi dan teknologi generasi terbaru untuk mendukung efisiensi operasional industri modern Indonesia.</p>
          <div class="card-footer" style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">
              Promosi Terverifikasi
            </div>
            <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta btn-sponsored-action" data-ad-id="${ad.id}">
              ${ad.ctaText}
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // Render In-Article Sponsored Box
  public static renderInArticleHTML(): string {
    const ad = this.getActiveAd('in_article');
    if (!ad) return '';

    this.trackImpression(ad.id);

    return `
      <div class="ad-in-article-card" data-ad-id="${ad.id}" style="margin: 2rem 0; padding: 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono); color: var(--accent-cyan); letter-spacing: 0.05em; text-transform: uppercase;">
            Mitra Teknologi Pilihan Redaksi
          </span>
          <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">Kemitraan Sponsor</span>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <img src="${ad.imageUrl}" alt="${ad.sponsorName}" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover;" />
          <div style="flex: 1;">
            <h4 style="font-size: 0.9rem; font-weight: 800; margin: 0 0 0.25rem 0; color: var(--text-primary);">${ad.sponsorName}</h4>
            <p style="font-size: 0.825rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${ad.tagline}</p>
          </div>
        </div>

        <div style="margin-top: 0.85rem; text-align: right;">
          <a href="${ad.targetUrl}" target="_blank" rel="noopener sponsored" class="btn-ad-cta" data-ad-id="${ad.id}" style="font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); text-decoration: none; font-family: var(--font-mono);">
            ${ad.ctaText}
          </a>
        </div>
      </div>
    `;
  }

  // Bind click tracking & dismiss on all rendered ads
  public static bindAdEvents(container: HTMLElement = document.body) {
    // Click Tracking
    container.querySelectorAll('.btn-ad-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const adId = btn.getAttribute('data-ad-id');
        if (adId) this.trackClick(adId);
      });
    });

    // Dismiss Skyscraper
    container.querySelectorAll('.btn-dismiss-skyscraper').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const side = btn.getAttribute('data-dismiss-side');
        if (side) {
          sessionStorage.setItem(`byte_dismiss_skyscraper_${side}`, 'true');
          const rail = document.getElementById(`skyscraper-${side}-ad`);
          if (rail) rail.innerHTML = '';
        }
      });
    });
  }
}
