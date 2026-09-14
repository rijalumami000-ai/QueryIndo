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
    if (trimmed.includes('drive.google.com') || trimmed.includes('drive.usercontent.google.com')) {
      // Check for /file/d/FILE_ID
      const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch && fileMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
      }

      // Check for id=FILE_ID or ?id=FILE_ID
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
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
