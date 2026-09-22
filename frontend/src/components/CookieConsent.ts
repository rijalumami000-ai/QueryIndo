import { store } from '../state/store';
import { Toast } from '../utils/toast';

export class CookieConsent {
  public static updateLabels(): void {
    const bannerMsg = document.getElementById('cookie-consent-msg');
    const acceptBtn = document.getElementById('cookie-accept-btn');
    const rejectBtn = document.getElementById('cookie-reject-btn');
    if (bannerMsg) bannerMsg.textContent = store.t('cookieMsg');
    if (acceptBtn) acceptBtn.textContent = store.t('cookieAccept');
    if (rejectBtn) rejectBtn.textContent = store.t('cookieReject');
  }

  public static init(): void {
    const banner = document.getElementById('cookie-consent-banner');
    const acceptBtn = document.getElementById('cookie-accept-btn');
    const rejectBtn = document.getElementById('cookie-reject-btn');
    if (!banner || !acceptBtn || !rejectBtn) return;

    this.updateLabels();

    const consent = localStorage.getItem('byte_cookie_consent');
    if (!consent) {
      setTimeout(() => banner.classList.add('show'), 1500);
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('byte_cookie_consent', 'accepted');
      banner.classList.remove('show');
      Toast.show(store.t('cookieToastAccept'));
    });

    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('byte_cookie_consent', 'rejected');
      banner.classList.remove('show');
      Toast.show(store.t('cookieToastReject'));
    });
  }
}
