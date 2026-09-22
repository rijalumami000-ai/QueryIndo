export interface SpecItem {
  id: string;
  name: string;
  category: string;
  scores: {
    performance: number; // 0-100
    efficiency: number;
    aiPower: number;
    value: number;
  };
  specs: Record<string, string>;
}

export const COMPARISON_ITEMS: SpecItem[] = [
  {
    id: 'snapdragon-8-gen5',
    name: 'Snapdragon 8 Gen 5',
    category: 'Chipset Flagship',
    scores: { performance: 96, efficiency: 92, aiPower: 98, value: 90 },
    specs: {
      'Fabrikasi': '2nm N2 TSMC',
      'Core CPU': '2x Prime 4.5GHz + 6x Performance 3.6GHz',
      'NPU AI Power': '65 TOPS (Hexagon AI Direct)',
      'GPU': 'Adreno 850 Ray-Tracing Gen 3',
      'Konektivitas': 'Modem Snapdragon X80 5G 10Gbps'
    }
  },
  {
    id: 'apple-a19-pro',
    name: 'Apple A19 Pro',
    category: 'Chipset Flagship',
    scores: { performance: 98, efficiency: 96, aiPower: 94, value: 85 },
    specs: {
      'Fabrikasi': '2nm N2P TSMC',
      'Core CPU': '2x High-Perf 4.6GHz + 4x Energy-Efficient',
      'NPU AI Power': '58 TOPS (Neural Engine 20-Core)',
      'GPU': '6-Core Metal 4 Ray-Tracing',
      'Konektivitas': 'Apple Custom 5G Modem Gen 2'
    }
  },
  {
    id: 'ganesha-1-ikn',
    name: 'Superkomputer Ganesha-1 (IKN)',
    category: 'Superkomputer AI',
    scores: { performance: 100, efficiency: 95, aiPower: 100, value: 92 },
    specs: {
      'Kapasitas Hitung': '100 Petaflops (FP16 AI)',
      'Arsitektur Accelerator': '1.024x NVIDIA H200 NVLink',
      'Sumber Daya': '100% PLTS Surya IKN (Zero Emission)',
      'Fungsi Utama': 'Pusat Riset LLM Bahasa Indonesia & BMKG',
      'Lokasi': 'Pusat Data Nasional (PDN) Sepaku, IKN'
    }
  },
  {
    id: 'nusantara-dc',
    name: 'Pusat Komputasi Nusantara (Jakarta)',
    category: 'Superkomputer AI',
    scores: { performance: 85, efficiency: 80, aiPower: 88, value: 88 },
    specs: {
      'Kapasitas Hitung': '45 Petaflops (FP16 AI)',
      'Arsitektur Accelerator': '512x NVIDIA H100 SXM5',
      'Sumber Daya': 'Jaringan Listrik Hybrid PLN + REC',
      'Fungsi Utama': 'Layanan Cloud Kominfo & Instansi Negara',
      'Lokasi': 'Cikarang Data Center Hub, Jawa Barat'
    }
  }
];

export class SpecsComparator {
  private itemA: SpecItem = COMPARISON_ITEMS[0];
  private itemB: SpecItem = COMPARISON_ITEMS[1];

  public renderComparatorHTML(): string {
    return `
      <div style="padding: 1.5rem;">
        <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-weight: 800; font-size: 1.3rem; color: var(--text-primary);">Visualisasi Data & Perbandingan Spesifikasi Interaktif</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Bandingkan performa hardware, superkomputer AI, dan teknologi secara berdampingan.</p>
          </div>
        </div>

        <!-- Selectors Header -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-active);">
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 0.4rem;">Perangkat A</label>
            <select id="select-spec-a" style="width: 100%; padding: 0.6rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-weight: 700;">
              ${COMPARISON_ITEMS.map(item => `<option value="${item.id}" ${item.id === this.itemA.id ? 'selected' : ''}>${item.name} (${item.category})</option>`).join('')}
            </select>
          </div>

          <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--accent-violet);">
            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--accent-violet); text-transform: uppercase; margin-bottom: 0.4rem;">Perangkat B</label>
            <select id="select-spec-b" style="width: 100%; padding: 0.6rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-weight: 700;">
              ${COMPARISON_ITEMS.map(item => `<option value="${item.id}" ${item.id === this.itemB.id ? 'selected' : ''}>${item.name} (${item.category})</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Score Comparison Bar Chart -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
          <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 1rem;">Skor Visual Performa</h4>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${[
              { label: 'Performa Raw Compute', a: this.itemA.scores.performance, b: this.itemB.scores.performance },
              { label: 'Efisiensi Daya / Energy', a: this.itemA.scores.efficiency, b: this.itemB.scores.efficiency },
              { label: 'Kemampuan AI / NPU TOPS', a: this.itemA.scores.aiPower, b: this.itemB.scores.aiPower }
            ].map(metric => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem;">
                  <span style="color: var(--accent-cyan);">${this.itemA.name}: ${metric.a}%</span>
                  <span style="color: var(--text-secondary);">${metric.label}</span>
                  <span style="color: var(--accent-violet);">${this.itemB.name}: ${metric.b}%</span>
                </div>
                <div style="display: flex; height: 12px; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="width: ${metric.a}%; background: var(--accent-cyan);"></div>
                  <div style="flex: 1;"></div>
                  <div style="width: ${metric.b}%; background: var(--accent-violet);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Side-by-Side Specs Table -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
            <thead>
              <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 0.85rem 1rem; color: var(--text-muted);">Parameter Spesifikasi</th>
                <th style="padding: 0.85rem 1rem; color: var(--accent-cyan); font-weight: 800;">${this.itemA.name}</th>
                <th style="padding: 0.85rem 1rem; color: var(--accent-violet); font-weight: 800;">${this.itemB.name}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(this.itemA.specs).map(key => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 0.75rem 1rem; font-weight: 700; color: var(--text-secondary);">${key}</td>
                  <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-family: var(--font-mono);">${this.itemA.specs[key] || '-'}</td>
                  <td style="padding: 0.75rem 1rem; color: var(--text-primary); font-family: var(--font-mono);">${this.itemB.specs[key] || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  public bindEvents(modalElem: HTMLElement, onRefresh: () => void) {
    const selA = modalElem.querySelector('#select-spec-a') as HTMLSelectElement;
    const selB = modalElem.querySelector('#select-spec-b') as HTMLSelectElement;

    selA?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      const found = COMPARISON_ITEMS.find(i => i.id === val);
      if (found) {
        this.itemA = found;
        onRefresh();
      }
    });

    selB?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      const found = COMPARISON_ITEMS.find(i => i.id === val);
      if (found) {
        this.itemB = found;
        onRefresh();
      }
    });
  }
}
