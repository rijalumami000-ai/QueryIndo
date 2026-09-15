import { store } from '../state/store';
import { Toast } from './toast';

export class PWAUtils {
  private static deferredPrompt: any = null;

  public static setupPWAInstallPrompt(): void {
    const pwaInstallBtn = document.getElementById('pwa-install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (pwaInstallBtn) pwaInstallBtn.style.display = 'inline-flex';
    });

    pwaInstallBtn?.addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          Toast.show(store.preferences.language === 'en' ? 'Thank you for installing QUERYINDO App!' : 'Terima kasih telah memasang aplikasi QUERYINDO!');
        }
        this.deferredPrompt = null;
        pwaInstallBtn.style.display = 'none';
      } else {
        Toast.show(store.preferences.language === 'en' ? 'App can be added via browser "Add to Home screen" menu.' : 'Gunakan menu browser "Tambahkan ke Layar Utama" untuk memasang aplikasi.');
      }
    });

    window.addEventListener('appinstalled', () => {
      if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
      this.deferredPrompt = null;
    });
  }
}
