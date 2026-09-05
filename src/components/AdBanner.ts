export interface AdCampaign {
  id: string;
  sponsorName: string;
  tagline: string;
  placement: 'leaderboard' | 'in_article' | 'sidebar';
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

  public static getActiveAd(placement: 'leaderboard' | 'in_article' | 'sidebar'): AdCampaign | null {
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

  // Render Leaderboard Banner (Di atas feed berita)
  public static renderLeaderboardHTML(): string {
    const ad = this.getActiveAd('leaderboard');
    if (!ad) return '';

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
