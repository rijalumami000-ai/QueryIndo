import { ApiService } from '../../services/apiService';
import { Toast } from '../../utils/toast';
import type { Article } from '../../types/news';

export class SubscribersManager {
  public static render(): string {
    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        
        <!-- Header & Action Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Pelanggan Newsletter & Broadcast Berita
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola basis data pembaca terdaftar, pantau status gateway SMTP Hostinger SSL, dan kirim buletin harian.
            </p>
          </div>
          
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <button id="btn-export-subscribers-csv" style="padding: 0.55rem 1.15rem; background: var(--bg-tertiary); color: var(--text-primary); font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid var(--border-color); cursor: pointer; display: flex; align-items: center; gap: 0.45rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Ekspor Data (CSV)</span>
            </button>
            <button id="btn-open-broadcast-modal" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>Kirim Broadcast Berita</span>
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;">
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Total Pelanggan Aktif</div>
            <div id="metric-subscribers-count" style="font-size: 1.75rem; font-weight: 800; color: var(--accent-cyan); margin-top: 0.35rem;">Memuat...</div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Gateway Email Resmi</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-emerald); margin-top: 0.55rem; display: flex; align-items: center; gap: 0.4rem;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-emerald);"></span>
              <span>Hostinger SSL 465</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem; font-family: var(--font-mono);">redaksi@queryindo.com</div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Template Otomatis</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 0.55rem;">Welcome & Broadcast</div>
            <div style="font-size: 0.72rem; color: var(--accent-cyan); margin-top: 0.2rem;">HTML Responsive Branded</div>
          </div>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md);">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Keamanan & Anti-Spam</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-amber); margin-top: 0.55rem;">SPF • DKIM • DMARC</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">DNS Terverifikasi 100%</div>
          </div>
        </div>

        <!-- Table Container -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em;">Daftar Alamat Email Terdaftar</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Data pembaca yang telah melakukan konfirmasi berlangganan buletin harian.</p>
            </div>
            <input type="text" id="filter-subscriber-input" placeholder="Cari alamat email pelanggan..." style="padding: 0.5rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.825rem; min-width: 260px;" />
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 0.85rem 1.25rem; width: 60px;">No</th>
                  <th style="padding: 0.85rem 1.25rem;">Alamat Email Pembaca</th>
                  <th style="padding: 0.85rem 1.25rem;">Waktu Registrasi</th>
                  <th style="padding: 0.85rem 1.25rem;">Status Langganan</th>
                  <th style="padding: 0.85rem 1.25rem;">Pengiriman Email</th>
                  <th style="padding: 0.85rem 1.25rem; width: 80px; text-align: right;">Aksi</th>
                </tr>
              </thead>
              <tbody id="subscribers-table-body">
                <tr>
                  <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    Memuat daftar pelanggan newsletter...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  public static async bindEvents(modalElem: HTMLElement, articles: Article[], onRefresh: () => void) {
    const subs = await ApiService.getSubscribers();
    
    // Update metric count
    const metricCount = modalElem.querySelector('#metric-subscribers-count');
    if (metricCount) {
      metricCount.textContent = `${subs.length} Pembaca`;
    }

    const renderTableContent = (items: typeof subs) => {
      const tbody = modalElem.querySelector('#subscribers-table-body');
      if (!tbody) return;

      if (items.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
              Belum ada pelanggan newsletter yang terdaftar.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = items.map((s, idx) => {
        const dateStr = s.createdAt || s.date ? new Date(s.createdAt || s.date!).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Baru saja';
        const subId = s.id || s.email;
        return `
          <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); color: var(--text-muted); font-size: 0.8rem;">#${idx + 1}</td>
            <td style="padding: 0.9rem 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: rgba(0, 242, 254, 0.1); color: var(--accent-cyan);">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <span style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${s.email}</span>
              </div>
            </td>
            <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary);">
              ${dateStr}
            </td>
            <td style="padding: 0.9rem 1.25rem;">
              <span class="tag-badge" style="background: rgba(16, 185, 129, 0.08); color: var(--accent-emerald); font-size: 0.68rem; border-color: rgba(16, 185, 129, 0.25);">
                AKTIF BERLANGGANAN
              </span>
            </td>
            <td style="padding: 0.9rem 1.25rem;">
              <span style="font-size: 0.75rem; color: var(--accent-cyan); display: inline-flex; align-items: center; gap: 0.35rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Hostinger API (HTTPS 443)</span>
              </span>
            </td>
            <td style="padding: 0.9rem 1.25rem; text-align: right;">
              <button class="btn-delete-subscriber" data-id="${subId}" data-email="${s.email}" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171; border-radius: 6px; padding: 0.35rem 0.65rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; transition: background 0.15s;" title="Hapus Pelanggan">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span>Hapus</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind delete events
      tbody.querySelectorAll('.btn-delete-subscriber').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const email = btn.getAttribute('data-email') || '';
          if (!id) return;
          if (confirm(`Hapus email "${email}" dari daftar pelanggan newsletter?`)) {
            const res = await ApiService.deleteSubscriber(id);
            if (res.success) {
              Toast.show(`Pelanggan "${email}" berhasil dihapus.`);
              onRefresh();
            } else {
              Toast.show(res.message);
            }
          }
        });
      });
    };

    renderTableContent(subs);

    // Live search filter
    const filterInput = modalElem.querySelector('#filter-subscriber-input') as HTMLInputElement;
    if (filterInput) {
      filterInput.addEventListener('input', (e) => {
        const kw = (e.target as HTMLInputElement).value.trim().toLowerCase();
        const filtered = subs.filter(s => s.email.toLowerCase().includes(kw));
        renderTableContent(filtered);
      });
    }

    // Export CSV
    modalElem.querySelector('#btn-export-subscribers-csv')?.addEventListener('click', () => {
      if (subs.length === 0) {
        Toast.show('Belum ada data pelanggan untuk diekspor.');
        return;
      }
      const csvHeader = 'No,Email,Tanggal_Pendaftaran,Status\n';
      const csvRows = subs.map((s, idx) => `"${idx + 1}","${s.email}","${s.createdAt || s.date || ''}","Aktif"`).join('\n');
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `queryindo_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.show('Data pelanggan newsletter berhasil diekspor ke CSV!');
    });

    // Open Broadcast Modal
    modalElem.querySelector('#btn-open-broadcast-modal')?.addEventListener('click', () => {
      this.showBroadcastModal(articles, subs);
    });
  }

  public static showBroadcastModal(articles: Article[], subscribers: Array<any>) {
    const recentArticles = articles.slice(0, 8);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.style.zIndex = '35000';
    overlay.style.background = 'rgba(7, 9, 14, 0.88)';
    overlay.style.backdropFilter = 'blur(12px)';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 680px; width: 92%; margin: auto; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header-bar" style="padding: 1.25rem 1.5rem; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 2.2rem; height: 2.2rem; background: var(--gradient-brand); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 800;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary);">Kirim Broadcast Buletin Berita</h3>
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono);">Gateway: Hostinger Mail API (HTTPS 443)</span>
            </div>
          </div>
          <button class="btn-close" id="close-broadcast-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
        </div>

        <form id="broadcast-news-form" style="padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; flex: 1;">
          <div style="background: rgba(0, 242, 254, 0.05); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.75rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div style="font-size: 0.825rem; color: var(--text-secondary);">
              Buletin ini akan dikirimkan ke <strong style="color: var(--accent-cyan);">${subscribers.length} pelanggan terdaftar</strong> menggunakan template HTML responsif dengan branding eksekutif QUERYINDO.
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Subjek Email (Subject Line) *</label>
            <input type="text" id="bc-subject" required value="QUERYINDO Daily Brief: Wawasan Berita Tekno & AI Terkini" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.9rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Headline Banner Utama Email *</label>
            <input type="text" id="bc-headline" required value="Rangkuman Berita Paling Krusial Hari Ini" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-secondary);">Pilih Naskah Berita untuk Disertakan (Maks. 5 Artikel):</label>
            <div style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 220px; overflow-y: auto; padding-right: 0.5rem;">
              ${recentArticles.map((art, idx) => `
                <label style="display: flex; align-items: center; gap: 0.75rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; cursor: pointer; transition: border-color 0.15s;">
                  <input type="checkbox" class="broadcast-article-chk" value="${art.id}" ${idx < 3 ? 'checked' : ''} style="accent-color: var(--accent-cyan); width: 16px; height: 16px;" />
                  <img src="${art.imageUrl}" alt="" style="width: 44px; height: 32px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.825rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${art.title}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${art.category.toUpperCase()} • ${art.readTimeMinutes} mnt baca</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-broadcast" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" id="btn-submit-broadcast" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow); display: flex; align-items: center; gap: 0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>Kirim Broadcast Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeOverlay = () => overlay.remove();
    overlay.querySelector('#close-broadcast-modal')?.addEventListener('click', closeOverlay);
    overlay.querySelector('#btn-cancel-broadcast')?.addEventListener('click', closeOverlay);

    const form = overlay.querySelector('#broadcast-news-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = overlay.querySelector('#btn-submit-broadcast') as HTMLButtonElement;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Mengirimkan Buletin via SMTP...</span>';
      }

      const subject = (overlay.querySelector('#bc-subject') as HTMLInputElement).value.trim();
      const headline = (overlay.querySelector('#bc-headline') as HTMLInputElement).value.trim();

      const selectedArticles = Array.from(overlay.querySelectorAll<HTMLInputElement>('.broadcast-article-chk:checked')).map(chk => {
        const artId = chk.value;
        const art = articles.find(a => a.id === artId);
        return {
          title: art?.title || '',
          category: art?.category?.toUpperCase() || 'TEKNO',
          excerpt: art?.subtitle || (art?.aiSummary ? art.aiSummary[0] : ''),
          url: `https://www.queryindo.com/#article-${art?.id || ''}`,
          imageUrl: art?.imageUrl || '',
          readTime: `${art?.readTimeMinutes || 3} mnt baca`
        };
      }).filter(a => a.title);

      const res = await ApiService.broadcastNewsletter({
        subject,
        headline,
        articles: selectedArticles
      });

      if (res.success) {
        Toast.show(res.message || 'Broadcast buletin berita berhasil diproses dan dikirim!');
        closeOverlay();
      } else {
        Toast.show(res.message || 'Gagal mengirimkan broadcast.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Kirim Broadcast Sekarang</span>';
        }
      }
    });
  }
}
