import type { TechIndexItem } from '../types/news';
import { ApiService } from '../services/apiService';
import { store } from '../state/store';

export class TechTicker {
  public static render(): void {
    const techTickerList = document.getElementById('tech-ticker-list');
    if (!techTickerList) return;
    const items = store.liveTechIndexes;
    const renderItem = (item: TechIndexItem) => `
      <div class="ticker-item" data-symbol="${item.symbol}">
        <span class="ticker-symbol">${item.symbol}</span>
        <span class="ticker-val">${item.value}</span>
        <span class="ticker-change ${item.isPositive ? 'up' : 'down'}">${item.change}</span>
      </div>
    `;
    techTickerList.innerHTML = items.map(renderItem).join('') + items.map(renderItem).join('');

    techTickerList.querySelectorAll('.ticker-item').forEach(el => {
      el.addEventListener('click', (e) => {
        const sym = (el as HTMLElement).getAttribute('data-symbol');
        const item = items.find(i => i.symbol === sym);
        if (item) this.showTickerChart(item, e.currentTarget as HTMLElement);
      });
    });
  }

  private static generateSVGChart(item: TechIndexItem): string {
    const data = item.historicalData;
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 260;
    const h = 70;
    const pad = 6;

    const points = values.map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const lineColor = item.isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)';
    const gradId = `tgrad-${item.symbol.replace(/[^a-zA-Z0-9]/g, '')}`;
    const areaPoints = `${pad},${h} ${points.join(' ')} ${w - pad},${h}`;
    const dots = points.map(p => {
      const [x, y] = p.split(',');
      return `<circle cx="${x}" cy="${y}" r="2.5" fill="${lineColor}" class="chart-dot"/>`;
    }).join('');

    return `
    <svg class="ticker-chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <polygon points="${areaPoints}" fill="url(#${gradId})"/>
      <polyline points="${points.join(' ')}" fill="none" stroke="${lineColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chart-line"/>
      ${dots}
    </svg>`;
  }

  public static showTickerChart(item: TechIndexItem, anchorEl: HTMLElement): void {
    document.querySelector('.ticker-chart-popup')?.remove();
    const values = item.historicalData.map(d => d.value);
    const fmt = (v: number) => v >= 1000 ? v.toLocaleString('id-ID') : v.toFixed(2);
    const isLive = ApiService.isBackendAvailable && item.symbol !== 'STARTUP-RI';
    const footerText = isLive ? store.t('chartFooter') : store.t('chartFooterFallback');

    const popup = document.createElement('div');
    popup.className = 'ticker-chart-popup';
    popup.innerHTML = `
      <div class="ticker-chart-header">
        <div class="ticker-chart-title">
          <span class="ticker-chart-symbol">${item.symbol}</span>
          <span class="ticker-chart-name">${item.name}</span>
        </div>
        <div class="ticker-chart-meta">
          <span class="ticker-chart-value">${item.value}</span>
          <span class="ticker-chart-change ${item.isPositive ? 'up' : 'down'}">${item.change}</span>
        </div>
        <button class="ticker-chart-close" aria-label="Tutup">&times;</button>
      </div>
      <div class="ticker-chart-body">
        ${this.generateSVGChart(item)}
      </div>
      <div class="ticker-chart-stats">
        <div class="stat-item"><span class="stat-label">Open</span><span class="stat-val">${fmt(values[0])}</span></div>
        <div class="stat-item"><span class="stat-label">High</span><span class="stat-val up">${fmt(Math.max(...values))}</span></div>
        <div class="stat-item"><span class="stat-label">Low</span><span class="stat-val down">${fmt(Math.min(...values))}</span></div>
        <div class="stat-item"><span class="stat-label">Close</span><span class="stat-val">${fmt(values[values.length - 1])}</span></div>
      </div>
      <div class="ticker-chart-footer">
        <span>${footerText}</span>
      </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.ticker-chart-close')!;
    closeBtn.addEventListener('click', () => popup.remove());

    const onClickOutside = (e: MouseEvent) => {
      if (!popup.contains(e.target as Node) && !anchorEl.contains(e.target as Node)) {
        popup.remove();
        document.removeEventListener('click', onClickOutside);
      }
    };
    setTimeout(() => document.addEventListener('click', onClickOutside), 50);

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);
    requestAnimationFrame(() => popup.classList.add('show'));
  }
}
