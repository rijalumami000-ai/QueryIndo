/**
 * Image Utilities: Link normalization for Google Drive/Cloud storage,
 * client-side file compression, and initials avatar generation.
 */

export class ImageUtils {
  /**
   * Normalizes Google Drive, Dropbox, and cloud storage URLs to direct embeddable CDN links.
   * Resolves Google Drive download/sharing links that are otherwise blocked by CORS or attachment headers.
   */
  public static normalizeImageUrl(url: string): string {
    if (!url) return '';
    let trimmed = url.trim();

    // 1. Google Drive links (sharing, download, uc, etc.)
    if (trimmed.includes('drive.google.com') || trimmed.includes('drive.usercontent.google.com') || trimmed.includes('lh3.googleusercontent.com')) {
      let fileId = '';
      const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
      } else {
        const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          fileId = idMatch[1];
        } else {
          const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (dMatch && dMatch[1]) {
            fileId = dMatch[1];
          }
        }
      }

      if (fileId) {
        // Return reliable high-performance thumbnail proxy
        return `/api/v1/image-proxy?url=${encodeURIComponent(trimmed)}`;
      }
    }

    // 2. Dropbox links (replace dl=0 with raw=1)
    if (trimmed.includes('dropbox.com')) {
      if (trimmed.includes('dl=0')) {
        return trimmed.replace('dl=0', 'raw=1');
      }
      if (!trimmed.includes('raw=1')) {
        const sep = trimmed.includes('?') ? '&' : '?';
        return `${trimmed}${sep}raw=1`;
      }
    }

    return trimmed;
  }

  /**
   * Premium Scalloped Verified Seal (Similar to Meta Verified / Twitter X / Telegram Star)
   */
  public static getVerifiedBadgeHTML(size: number = 16, title: string = 'Dewan Redaksi Terverifikasi'): string {
    return `<span class="verified-badge-wrap" title="${title}" style="display:inline-flex; align-items:center; vertical-align:middle; margin-left:4px; flex-shrink:0;">
      <svg class="verified-badge-svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1L14.7 3.7L18.5 3.3L19.7 7L23 8.9L22.2 12.7L24 16.1L20.8 18.3L20 22.1L16.2 22.2L13.8 25.1L10.2 25.1L7.8 22.2L4 22.1L3.2 18.3L0 16.1L1.8 12.7L1 8.9L4.3 7L5.5 3.3L9.3 3.7L12 1Z" fill="url(#metaVerifyGrad_${size})" style="filter: drop-shadow(0 1px 3px rgba(0, 168, 255, 0.45));"/>
        <defs>
          <linearGradient id="metaVerifyGrad_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f2fe" />
            <stop offset="45%" stop-color="#0080ff" />
            <stop offset="100%" stop-color="#0052d4" />
          </linearGradient>
        </defs>
        <path d="M8.2 12.2L11 15L16.2 9.2" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>`;
  }


  /**
   * Generates a fallback initials avatar URL using a clean SVG Data URL (works 100% offline).
   */
  public static getInitialsAvatar(name: string, bgGradient: string = '#00f2fe'): string {
    const initials = (name || 'Q')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="50" fill="${bgGradient}" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="40" font-weight="bold" fill="#000000">${initials}</text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  /**
   * Reads a local file from <input type="file">, resizes it in an HTML5 canvas to max dimension,
   * and returns an optimized JPEG data URL to store cleanly in localStorage without lag.
   */
  public static processImageFile(
    file: File,
    maxDimension: number = 400,
    quality: number = 0.85,
    onSuccess: (dataUrl: string) => void,
    onError?: (err: string) => void
  ): void {
    if (!file || !file.type.startsWith('image/')) {
      onError?.('File yang dipilih bukan gambar.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => onError?.('Gagal membaca file.');
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => onError?.('Gagal memproses gambar.');
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onSuccess(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        onSuccess(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }
}
