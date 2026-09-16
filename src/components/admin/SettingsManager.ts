import { AuthService } from '../../services/authService';
import { SocialMediaService, PLATFORM_METAS } from '../../services/socialMediaService';
import { Toast } from '../../utils/toast';

export class SettingsManager {
  public static render(): string {
    const user = AuthService.getCurrentUser();
    const isSuperuser = user?.role === 'superuser';
    const adminAccounts = AuthService.getAdminAccounts();
    const activeSocials = SocialMediaService.getActiveLinks();

    return `
      <div style="display: flex; flex-direction: column; gap: 1.75rem; max-width: 1000px;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-cyan); font-family: var(--font-mono);">KONTROL AKSES & OTENTIKASI</span>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">
              Pengaturan Sistem & Manajemen Akun Redaksi
            </h2>
            <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">
              Kelola konfigurasi keamanan portal, kata sandi akun aktif, dan otoritas hak akses bertingkat (Superuser & Editor).
            </p>
          </div>
          
          ${isSuperuser ? `
            <button id="btn-add-admin-account" style="padding: 0.55rem 1.25rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; display: flex; align-items: center; gap: 0.45rem; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Tambah Akun Editor Baru</span>
            </button>
          ` : ''}
        </div>

        <!-- Role & Current Session Info Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          <!-- Current User Profile Card -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="position: relative; flex-shrink: 0;">
              <img src="${user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" alt="${user?.fullName}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid ${isSuperuser ? 'var(--accent-cyan)' : 'var(--accent-primary)'};" />
              <span style="position: absolute; bottom: 0; right: 0; width: 14px; height: 14px; border-radius: 50%; background: var(--accent-emerald); border: 2px solid var(--bg-secondary);" title="Sesi Aktif"></span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 style="font-size: 1rem; font-weight: 800; margin: 0; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user?.fullName}</h3>
                <span class="tag-badge" style="background: ${isSuperuser ? 'rgba(0, 242, 254, 0.12)' : 'rgba(59, 130, 246, 0.12)'}; color: ${isSuperuser ? 'var(--accent-cyan)' : '#60a5fa'}; border: 1px solid ${isSuperuser ? 'rgba(0, 242, 254, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; font-size: 0.68rem; font-weight: 800;">
                  ${user?.roleTitle || (isSuperuser ? 'FOUNDER & CEO' : 'EDITOR')}
                </span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.25rem;">${user?.email}</div>
              <div style="font-size: 0.72rem; color: var(--accent-emerald); margin-top: 0.2rem;">● Sesi Terotentikasi (JWT Active)</div>
            </div>
          </div>

          <!-- Hierarchy & Permission Level Card -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Hak Akses Menu Dasbor</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: ${isSuperuser ? 'var(--accent-cyan)' : 'var(--text-primary)'}; margin-top: 0.4rem;">
              ${isSuperuser ? 'Superuser (Akses Penuh 8 Menu)' : 'Editor (Manajer Publikasi & Analitik)'}
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.35rem 0 0 0; line-height: 1.4;">
              ${isSuperuser
        ? 'Sebagai Founder & CEO, Anda memiliki wewenang mengelola artikel, dewan redaksi, iklan, belanja, subscribers, medsos, dan manajemen akun admin.'
        : 'Akun Editor difokuskan untuk kurasi naskah berita, penulisan artikel, dan pemantauan kinerja redaksi harian.'}
            </p>
          </div>
        </div>

        ${isSuperuser ? `
          <!-- Admin Accounts Management Table (Superuser Only) -->
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 800; letter-spacing: -0.01em; margin: 0; color: var(--text-primary);">
                  Daftar Akun Pengelola Dasbor CMS (${adminAccounts.length} Akun)
                </h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">
                  Akun Superuser tidak dapat dihapus. Anda dapat menambahkan atau menghapus akun Editor redaksi kapan saja.
                </p>
              </div>
            </div>

            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
                <thead>
                  <tr style="background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    <th style="padding: 0.85rem 1.25rem;">Pengguna / Identitas</th>
                    <th style="padding: 0.85rem 1.25rem;">Email & Username</th>
                    <th style="padding: 0.85rem 1.25rem;">Peran (Role)</th>
                    <th style="padding: 0.85rem 1.25rem;">Waktu Dibuat</th>
                    <th style="padding: 0.85rem 1.25rem; text-align: right;">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminAccounts.map(acc => {
          const isAccSuper = acc.role === 'superuser' || acc.email.toLowerCase() === 'rijalumami000@gmail.com';
          const createdDateStr = acc.createdAt ? (acc.createdAt.includes('-') ? new Date(acc.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : acc.createdAt) : '1 Januari 2025';

          return `
                      <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 0.9rem 1.25rem;">
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <img src="${acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" alt="${acc.fullName}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isAccSuper ? 'var(--accent-cyan)' : 'var(--border-color)'};" />
                            <div>
                              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.875rem;">${acc.fullName}</div>
                              <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">${acc.id}</span>
                            </div>
                          </div>
                        </td>

                        <td style="padding: 0.9rem 1.25rem;">
                          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.825rem; font-family: var(--font-mono);">${acc.email}</div>
                          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">@${acc.username}</div>
                        </td>

                        <td style="padding: 0.9rem 1.25rem;">
                          <span class="tag-badge" style="background: ${isAccSuper ? 'rgba(0, 242, 254, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; color: ${isAccSuper ? 'var(--accent-cyan)' : '#60a5fa'}; border: 1px solid ${isAccSuper ? 'rgba(0, 242, 254, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; font-size: 0.68rem; font-weight: 800;">
                            ${isAccSuper ? ' SUPERUSER (FOUNDER & CEO)' : 'EDITOR REDAKSI'}
                          </span>
                        </td>

                        <td style="padding: 0.9rem 1.25rem; font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">
                          ${createdDateStr}
                        </td>

                        <td style="padding: 0.9rem 1.25rem; text-align: right;">
                          ${isAccSuper ? `
                            <span style="font-size: 0.72rem; color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700; background: rgba(0, 242, 254, 0.08); padding: 0.25rem 0.55rem; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.2);">
                               Akun Master
                            </span>
                          ` : `
                            <button class="btn-delete-admin-account" data-id="${acc.id}" data-name="${acc.fullName}" style="padding: 0.35rem 0.65rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--accent-rose); font-size: 0.75rem; font-weight: 600; cursor: pointer;">
                              Hapus Akun
                            </button>
                          `}
                        </td>
                      </tr>
                    `;
        }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Change Password Card -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;">
          <div style="margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <h3 style="font-size: 1.05rem; font-weight: 800; margin: 0 0 0.2rem 0; color: var(--text-primary);">
              Ganti Kata Sandi Akun
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
              Ubah kata sandi untuk akun yang sedang login (${user?.email}). Minimal 6 karakter.
            </p>
          </div>

          <form id="form-change-password" style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kata Sandi Lama *</label>
              <input type="password" id="change-old-password" required placeholder="Masukkan kata sandi lama..." style="width: 100%; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kata Sandi Baru *</label>
              <input type="password" id="change-new-password" required minlength="6" placeholder="Minimal 6 karakter..." style="width: 100%; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Konfirmasi Sandi Baru *</label>
              <input type="password" id="change-confirm-password" required minlength="6" placeholder="Ulangi kata sandi baru..." style="width: 100%; padding: 0.6rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
            </div>

            <button type="submit" style="padding: 0.6rem 1.35rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); border: none; font-size: 0.85rem; cursor: pointer; white-space: nowrap; box-shadow: var(--shadow-glow);">
              Perbarui Sandi
            </button>
          </form>
        </div>

        <!-- System Engine & Social Media Quick Panel -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
            <div>
              <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.2rem 0; color: var(--text-primary);">Integrasi Kanal Media Sosial</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
                Terdapat <strong>${activeSocials.length} akun resmi</strong> yang aktif ditampilkan di footer portal.
              </p>
            </div>
            ${isSuperuser ? `
              <button id="btn-goto-social-settings" style="padding: 0.45rem 0.9rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--accent-cyan); font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
                <span>Buka Manajer Media Sosial →</span>
              </button>
            ` : ''}
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${activeSocials.map(link => {
          const meta = PLATFORM_METAS[link.platform] || PLATFORM_METAS.custom;
          return `
                <span style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.35rem 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 600; color: var(--text-primary);">
                  <span style="color: ${meta.brandColor}; display: flex; align-items: center;">${meta.svgIcon}</span>
                  <span>${link.name}</span>
                </span>
              `;
        }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  public static bindEvents(modalElem: HTMLElement, onSwitchToSocial: () => void, onRefresh: () => void) {
    const user = AuthService.getCurrentUser();

    // Quick jump to Social Media settings
    modalElem.querySelector('#btn-goto-social-settings')?.addEventListener('click', () => {
      onSwitchToSocial();
    });

    // Add Editor Account Modal Trigger (Superuser only)
    modalElem.querySelector('#btn-add-admin-account')?.addEventListener('click', () => {
      this.showAddEditorModal(onRefresh);
    });

    // Delete Editor Account (Superuser only)
    modalElem.querySelectorAll('.btn-delete-admin-account').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name') || 'Akun';
        if (!id) return;
        if (confirm(`Apakah Anda yakin ingin menghapus akun Editor "${name}"? Akun ini tidak akan bisa login lagi.`)) {
          const res = AuthService.deleteAdminAccount(id);
          Toast.show(res.message);
          onRefresh();
        }
      });
    });

    // Change Password Form Handler
    const formPass = modalElem.querySelector('#form-change-password') as HTMLFormElement;
    if (formPass) {
      formPass.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPass = (modalElem.querySelector('#change-old-password') as HTMLInputElement).value;
        const newPass = (modalElem.querySelector('#change-new-password') as HTMLInputElement).value;
        const confirmPass = (modalElem.querySelector('#change-confirm-password') as HTMLInputElement).value;

        if (!oldPass || !newPass || !confirmPass) {
          Toast.show('Mohon lengkapi semua kolom kata sandi.');
          return;
        }

        if (newPass !== confirmPass) {
          Toast.show('Kata sandi baru dan konfirmasi kata sandi tidak cocok!');
          return;
        }

        if (newPass.length < 6) {
          Toast.show('Kata sandi baru minimal 6 karakter.');
          return;
        }

        const res = AuthService.changePassword(user?.email || 'rijalumami000@gmail.com', oldPass, newPass);
        if (res.success) {
          Toast.show(res.message);
          formPass.reset();
        } else {
          Toast.show(res.message);
        }
      });
    }
  }

  public static showAddEditorModal(onSave: () => void) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 1rem;';

    overlay.innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl); padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 2.2rem; height: 2.2rem; border-radius: 8px; background: rgba(0, 242, 254, 0.12); color: #00f2fe; display: flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                Tambah Akun Editor Baru
              </h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Akses khusus Manajer Publikasi & Kinerja Redaksi</span>
            </div>
          </div>
          <button class="btn-close" id="close-add-editor-modal" title="Tutup" style="background: none; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer;">✕</button>
        </div>

        <form id="form-create-editor" style="display: flex; flex-direction: column; gap: 1.15rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Nama Lengkap Jurnalis / Redaktur *</label>
            <input type="text" id="add-editor-name" required placeholder="e.g. Dimas Prasetyo" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Email Akun Redaksi *</label>
            <input type="email" id="add-editor-email" required placeholder="e.g. dimas@queryindo.com" style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Kata Sandi Awal *</label>
            <input type="password" id="add-editor-password" required minlength="6" placeholder="Minimal 6 karakter..." style="width: 100%; padding: 0.65rem 0.85rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem;" />
          </div>

          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
            💡 <em>Akun editor yang dibuat hanya dapat mengakses menu <strong>Manajer Publikasi</strong> dan <strong>Kinerja Redaksi</strong>.</em>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-cancel-add-editor" style="padding: 0.65rem 1.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; cursor: pointer;">
              Batal
            </button>
            <button type="submit" style="padding: 0.65rem 1.6rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-md); font-size: 0.85rem; border: none; cursor: pointer; box-shadow: var(--shadow-glow);">
              Buat Akun Editor
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeForm = () => overlay.remove();
    overlay.querySelector('#close-add-editor-modal')?.addEventListener('click', closeForm);
    overlay.querySelector('#btn-cancel-add-editor')?.addEventListener('click', closeForm);

    const form = overlay.querySelector('#form-create-editor') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = (overlay.querySelector('#add-editor-name') as HTMLInputElement).value.trim();
      const email = (overlay.querySelector('#add-editor-email') as HTMLInputElement).value.trim();
      const password = (overlay.querySelector('#add-editor-password') as HTMLInputElement).value.trim();

      const res = AuthService.createEditorAccount({ fullName, email, password });
      if (res.success) {
        Toast.show(res.message);
        closeForm();
        onSave();
      } else {
        Toast.show(res.message);
      }
    });
  }
}
