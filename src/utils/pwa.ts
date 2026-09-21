export class PWAUtils {
  public static setupPWAInstallPrompt(): void {
    // App install prompt deactivated per user requirements
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
    });
  }
}
