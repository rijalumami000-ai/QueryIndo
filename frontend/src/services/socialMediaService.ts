import { ApiService } from './apiService';

export type SocialPlatform = 
  | 'facebook' 
  | 'instagram' 
  | 'threads' 
  | 'x' 
  | 'tiktok' 
  | 'youtube' 
  | 'linkedin' 
  | 'telegram' 
  | 'whatsapp' 
  | 'custom';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  name: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformMeta {
  id: SocialPlatform;
  name: string;
  brandColor: string;
  hoverGlow: string;
  placeholderUrl: string;
  svgIcon: string;
}

export const PLATFORM_METAS: Record<SocialPlatform, PlatformMeta> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    brandColor: '#1877F2',
    hoverGlow: 'rgba(24, 119, 242, 0.45)',
    placeholderUrl: 'https://facebook.com/queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    brandColor: '#E1306C',
    hoverGlow: 'rgba(225, 48, 108, 0.45)',
    placeholderUrl: 'https://instagram.com/queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    brandColor: '#000000',
    hoverGlow: 'rgba(255, 255, 255, 0.35)',
    placeholderUrl: 'https://threads.net/@queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007C5.463 23.974 0 18.528 0 11.815 0 5.088 5.488 0 12.186 0c6.685 0 12.155 5.074 12.186 11.785.032 6.744-5.464 12.215-12.186 12.215zm-.008-21.758c-5.462 0-9.92 4.444-9.92 9.907 0 5.476 4.472 9.922 9.928 9.936 5.434 0 9.877-4.437 9.877-9.906 0-5.49-4.43-9.937-9.885-9.937zm5.545 10.103a4.93 4.93 0 0 0-2.148-3.957 5.767 5.767 0 0 0-3.69-1.127c-3.155 0-5.26 2.016-5.26 5.04 0 2.944 2.08 5.03 5.342 5.03 2.11 0 3.75-.89 4.49-2.448l-1.847-.98c-.463.926-1.47 1.428-2.643 1.428-1.748 0-3.08-1.04-3.167-2.613h9.027c.05-.443.088-.888.088-1.373h-.192zm-7.14-.37c.18-1.373 1.258-2.222 2.658-2.222 1.34 0 2.408.82 2.61 2.222H10.583z"/></svg>`
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    brandColor: '#000000',
    hoverGlow: 'rgba(0, 242, 254, 0.45)',
    placeholderUrl: 'https://x.com/queryindo',
    svgIcon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    brandColor: '#000000',
    hoverGlow: 'rgba(0, 242, 254, 0.45)',
    placeholderUrl: 'https://tiktok.com/@queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.28 6.28 0 0 0 1.95-4.52V8.41a8.28 8.28 0 0 0 4.82 1.54V6.5a4.85 4.85 0 0 1-1-.06z"/></svg>`
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    brandColor: '#FF0000',
    hoverGlow: 'rgba(255, 0, 0, 0.45)',
    placeholderUrl: 'https://youtube.com/@queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    brandColor: '#0A66C2',
    hoverGlow: 'rgba(10, 102, 194, 0.45)',
    placeholderUrl: 'https://linkedin.com/company/queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    brandColor: '#229ED9',
    hoverGlow: 'rgba(34, 158, 217, 0.45)',
    placeholderUrl: 'https://t.me/queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/></svg>`
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Channel',
    brandColor: '#25D366',
    hoverGlow: 'rgba(37, 211, 102, 0.45)',
    placeholderUrl: 'https://whatsapp.com/channel/queryindo',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`
  },
  custom: {
    id: 'custom',
    name: 'Tautan Kustom / Web',
    brandColor: '#00F2FE',
    hoverGlow: 'rgba(0, 242, 254, 0.45)',
    placeholderUrl: 'https://queryindo.com/channel',
    svgIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`
  }
};

const STORAGE_KEY = 'query_social_links_v1';

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'soc-facebook',
    platform: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com/queryindo',
    isActive: true,
    order: 1
  },
  {
    id: 'soc-instagram',
    platform: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/queryindo',
    isActive: true,
    order: 2
  },
  {
    id: 'soc-threads',
    platform: 'threads',
    name: 'Threads',
    url: 'https://threads.net/@queryindo',
    isActive: true,
    order: 3
  },
  {
    id: 'soc-x',
    platform: 'x',
    name: 'X (Twitter)',
    url: 'https://x.com/queryindo',
    isActive: true,
    order: 4
  },
  {
    id: 'soc-tiktok',
    platform: 'tiktok',
    name: 'TikTok',
    url: 'https://tiktok.com/@queryindo',
    isActive: true,
    order: 5
  },
  {
    id: 'soc-youtube',
    platform: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com/@queryindo',
    isActive: true,
    order: 6
  },
  {
    id: 'soc-linkedin',
    platform: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/queryindo',
    isActive: true,
    order: 7
  },
  {
    id: 'soc-telegram',
    platform: 'telegram',
    name: 'Telegram',
    url: 'https://t.me/queryindo',
    isActive: false,
    order: 8
  }
];

type ChangeListener = (links: SocialLink[]) => void;

export class SocialMediaService {
  private static listeners: ChangeListener[] = [];
  private static isInitialized = false;

  public static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.syncWithBackend().catch(() => {});
  }

  public static subscribe(fn: ChangeListener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private static notify(): void {
    const links = this.getLinks();
    for (const fn of this.listeners) {
      try {
        fn(links);
      } catch (err) {
        console.error('SocialMediaService listener error:', err);
      }
    }
  }

  public static getLinks(): SocialLink[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SocialLink[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => a.order - b.order);
        }
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_SOCIAL_LINKS].sort((a, b) => a.order - b.order);
  }

  public static getActiveLinks(): SocialLink[] {
    return this.getLinks().filter(l => l.isActive);
  }

  public static saveLinks(links: SocialLink[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
      // ignore
    }
    this.notify();
  }

  public static async syncWithBackend(): Promise<void> {
    try {
      const serverLinks = await ApiService.getSocialLinks();
      if (serverLinks && Array.isArray(serverLinks) && serverLinks.length > 0) {
        this.saveLinks(serverLinks);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data media sosial dari server:', err);
    }
  }

  public static addLink(payload: Omit<SocialLink, 'id'>): SocialLink {
    const links = this.getLinks();
    const newLink: SocialLink = {
      ...payload,
      id: `soc-${Date.now().toString().slice(-6)}`,
      order: payload.order !== undefined ? payload.order : links.length + 1
    };

    links.push(newLink);
    links.sort((a, b) => a.order - b.order);
    this.saveLinks(links);

    ApiService.createSocialLink(newLink).catch(err => {
      console.warn('Gagal menyimpan media sosial ke server:', err);
    });

    return newLink;
  }

  public static updateLink(id: string, updated: Partial<SocialLink>): boolean {
    const links = this.getLinks();
    const idx = links.findIndex(l => l.id === id);
    if (idx === -1) return false;

    links[idx] = {
      ...links[idx],
      ...updated
    };

    links.sort((a, b) => a.order - b.order);
    this.saveLinks(links);

    ApiService.updateSocialLink(id, updated).catch(err => {
      console.warn('Gagal memperbarui media sosial di server:', err);
    });

    return true;
  }

  public static deleteLink(id: string): boolean {
    const links = this.getLinks();
    const filtered = links.filter(l => l.id !== id);
    if (filtered.length === links.length) return false;

    this.saveLinks(filtered);

    ApiService.deleteSocialLink(id).catch(err => {
      console.warn('Gagal menghapus media sosial di server:', err);
    });

    return true;
  }

  public static toggleActive(id: string): boolean {
    const link = this.getLinks().find(l => l.id === id);
    if (!link) return false;
    return this.updateLink(id, { isActive: !link.isActive });
  }

  public static moveOrder(id: string, direction: 'up' | 'down'): boolean {
    const links = this.getLinks();
    const idx = links.findIndex(l => l.id === id);
    if (idx === -1) return false;

    if (direction === 'up' && idx > 0) {
      const tempOrder = links[idx].order;
      links[idx].order = links[idx - 1].order;
      links[idx - 1].order = tempOrder;
      [links[idx], links[idx - 1]] = [links[idx - 1], links[idx]];
    } else if (direction === 'down' && idx < links.length - 1) {
      const tempOrder = links[idx].order;
      links[idx].order = links[idx + 1].order;
      links[idx + 1].order = tempOrder;
      [links[idx], links[idx + 1]] = [links[idx + 1], links[idx]];
    } else {
      return false;
    }

    this.saveLinks(links);
    for (const item of links) {
      ApiService.updateSocialLink(item.id, { order: item.order }).catch(() => {});
    }
    return true;
  }

  public static resetToDefault(): void {
    this.saveLinks(DEFAULT_SOCIAL_LINKS);
  }

  // Render Official Footer HTML with high-fidelity vector icons
  public static renderFooterSocialListHTML(): string {
    const active = this.getActiveLinks();
    if (active.length === 0) {
      return '';
    }

    return active.map(item => {
      const meta = PLATFORM_METAS[item.platform] || PLATFORM_METAS.custom;
      return `
        <li>
          <a 
            href="${item.url}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="footer-social-item ${item.platform}" 
            title="${item.name} Official"
            aria-label="${item.name} QUERYINDO"
          >
            ${meta.svgIcon}
          </a>
        </li>
      `;
    }).join('');
  }

  // Render Drawer Social Channels HTML
  public static renderDrawerSocialHTML(): string {
    const active = this.getActiveLinks();
    if (active.length === 0) {
      return '';
    }

    return active.map(item => {
      const meta = PLATFORM_METAS[item.platform] || PLATFORM_METAS.custom;
      return `
        <a 
          href="${item.url}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="drawer-social-badge ${item.platform}" 
          title="${item.name} Official"
        >
          <span class="drawer-social-icon">${meta.svgIcon}</span>
          <span class="drawer-social-name">${item.name}</span>
        </a>
      `;
    }).join('');
  }
}
