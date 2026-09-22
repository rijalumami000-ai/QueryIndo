export class AnalyticsTab {
  public static render(): string {
    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        <h2 style="font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary);">Analitik Redaksi & Metrik Pembaca</h2>

        <!-- Bar Chart Daily Visitors -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
          <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--text-primary);">Distribusi Kunjungan Harian (7 Hari Terakhir)</h3>
          
          <div style="display: flex; align-items: flex-end; gap: 1.25rem; height: 180px; padding: 1rem 0; border-bottom: 1px solid var(--border-color);">
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 45%; background: rgba(37, 99, 235, 0.4); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Sen</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 60%; background: rgba(37, 99, 235, 0.5); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Sel</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 85%; background: rgba(37, 99, 235, 0.7); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Rab</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 70%; background: rgba(37, 99, 235, 0.6); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Kam</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 95%; background: var(--accent-primary); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: #60a5fa; font-weight: 700; font-family: var(--font-mono);">Jum</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 50%; background: rgba(37, 99, 235, 0.45); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Sab</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
              <div style="width: 100%; height: 40%; background: rgba(37, 99, 235, 0.35); border-radius: 4px;"></div>
              <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">Min</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
