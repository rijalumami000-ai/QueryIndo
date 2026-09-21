export class Toast {
  // Show Toast Message Banner
  public static show(message: string, type: 'info' | 'success' | 'warning' = 'success') {
    let toastContainer = document.getElementById('byte-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'byte-toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '2rem';
      toastContainer.style.left = '50%';
      toastContainer.style.transform = 'translateX(-50%)';
      toastContainer.style.zIndex = '50000';
      toastContainer.style.display = 'flex';
      toastContainer.style.flexDirection = 'column';
      toastContainer.style.gap = '0.5rem';
      toastContainer.style.pointerEvents = 'none';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.style.pointerEvents = 'auto';
    toast.style.padding = '0.85rem 1.5rem';
    toast.style.borderRadius = 'var(--radius-full)';
    toast.style.background = type === 'success' ? 'var(--bg-secondary)' : type === 'warning' ? 'rgba(245, 158, 11, 0.9)' : 'var(--bg-secondary)';
    toast.style.border = '1px solid var(--accent-cyan)';
    toast.style.color = 'var(--text-primary)';
    toast.style.fontSize = '0.875rem';
    toast.style.fontWeight = '700';
    toast.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
    toast.style.backdropFilter = 'blur(16px)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '0.6rem';
    toast.style.animation = 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span style="color:var(--accent-cyan); font-weight:800;">${icon}</span> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Show Custom Term Glossary Modal
  public static showGlossaryCard(term: string, category: string, definition: string, example: string) {
    const existing = document.getElementById('glossary-card-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'glossary-card-overlay';
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '40000';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 480px; padding: 2rem; border: 1px solid var(--accent-cyan); box-shadow: var(--shadow-lg), var(--shadow-glow);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-weight: 800; font-size: 1.25rem; color: var(--accent-cyan); font-family: var(--font-mono);">${term}</span>
            <span class="tag-badge" style="font-size: 0.7rem;">${category}</span>
          </div>
          <button id="close-glossary-card" class="btn-close">✕</button>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.35rem;">Definisi Istilah</h4>
          <p style="font-size: 0.925rem; color: var(--text-primary); line-height: 1.6;">${definition}</p>
        </div>

        <div style="background: var(--bg-tertiary); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.72rem; color: var(--accent-cyan); text-transform: uppercase; font-weight: 800; margin-bottom: 0.25rem;">Contoh Penggunaan</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">"${example}"</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#close-glossary-card')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
}
