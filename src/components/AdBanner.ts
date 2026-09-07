export interface AdCampaign {
  id: string;
  sponsorName: string;
  tagline: string;
  placement: 'leaderboard' | 'in_article' | 'sidebar' | 'midstream' | 'billboard';
  imageUrl: string;
  targetUrl: string;
  ctaText: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

export class AdBanner {
  private static STORAGE_KEY = 'byte_ad_campaigns';

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
    }
  ];

  public static getCampaigns(): AdCampaign[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.saveCampaigns(this.DEFAULT_ADS);
      return this.DEFAULT_ADS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return this.DEFAULT_ADS;
    }
  }

  public static saveCampaigns(campaigns: AdCampaign[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(campaigns));
  }

  public static getActiveAd(placement: 'leaderboard' | 'in_article' | 'sidebar' | 'midstream' | 'billboard'): AdCampaign | null {
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

  // Bind click tracking on all rendered ads
  public static bindAdEvents(container: HTMLElement = document.body) {
    container.querySelectorAll('.btn-ad-cta').forEach(btn => {
      btn.addEventListener('click', () => {
        const adId = btn.getAttribute('data-ad-id');
        if (adId) this.trackClick(adId);
      });
    });
  }
}
