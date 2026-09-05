export type InstitutionalPageId =
  | 'tentang-kami'
  | 'hubungi-kami'
  | 'kode-etik'
  | 'redaksi'
  | 'pedoman-media-siber'
  | 'disclaimer'
  | 'info-iklan'
  | 'karir';

const PAGE_TITLES: Record<InstitutionalPageId, { id: string; en: string }> = {
  'tentang-kami': { id: 'Tentang Kami', en: 'About Us' },
  'hubungi-kami': { id: 'Hubungi Kami', en: 'Contact Us' },
  'kode-etik': { id: 'Kode Etik Jurnalistik', en: 'Code of Ethics' },
  'redaksi': { id: 'Susunan Redaksi', en: 'Editorial Board' },
  'pedoman-media-siber': { id: 'Pedoman Media Siber', en: 'Cyber Media Guidelines' },
  'disclaimer': { id: 'Disclaimer', en: 'Disclaimer' },
  'info-iklan': { id: 'Info Iklan & Kemitraan', en: 'Advertising & Partnerships' },
  'karir': { id: 'Karir & Magang', en: 'Careers & Internships' },
};

// ──────────────────────────────────────────────
// Shared UI Helpers with Clean SVG Icons
// ──────────────────────────────────────────────

function sectionTitle(text: string): string {
  return `<h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0 0 1rem 0; text-transform:uppercase; letter-spacing:0.06em; display:flex; align-items:center; gap:0.6rem;">
    <span style="width:3px; height:1.25rem; background:var(--accent-cyan); border-radius:2px; flex-shrink:0;"></span>${text}</h3>`;
}

function infoCard(label: string, value: string, accent: string = 'var(--accent-cyan)'): string {
  return `<div style="background:var(--bg-tertiary); padding:1rem 1.15rem; border-radius:var(--radius-md); border:1px solid var(--border-color); border-left:3px solid ${accent}; transition:border-color 0.2s;">
    <span style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; font-family:var(--font-mono); display:block; margin-bottom:0.3rem;">${label}</span>
    <strong style="font-size:0.9rem; color:var(--text-primary); display:block; line-height:1.4;">${value}</strong>
  </div>`;
}

function staffCard(role: string, name: string, desc: string): string {
  return `<div style="background:var(--bg-tertiary); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); transition:transform 0.2s, border-color 0.2s, box-shadow 0.2s;" onmouseenter="this.style.transform='translateY(-2px)';this.style.borderColor='rgba(0,242,254,0.3)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)'" onmouseleave="this.style.transform='';this.style.borderColor='var(--border-color)';this.style.boxShadow=''">
    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem;">
      <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, rgba(0,242,254,0.2), rgba(139,92,246,0.2)); border:1px solid var(--accent-cyan); display:flex; align-items:center; justify-content:center; font-weight:800; color:var(--accent-cyan); font-size:1.05rem; flex-shrink:0;">${name.charAt(0)}</div>
      <div>
        <span style="font-size:0.68rem; color:var(--accent-cyan); text-transform:uppercase; letter-spacing:0.08em; font-family:var(--font-mono); font-weight:700; display:block;">${role}</span>
        <strong style="font-size:0.95rem; color:var(--text-primary); display:block;">${name}</strong>
      </div>
    </div>
    <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.5; margin:0;">${desc}</p>
  </div>`;
}

function ethicsArticle(num: number, title: string, body: string, accent: string): string {
  return `<div style="padding:1.15rem; background:var(--bg-tertiary); border-left:3px solid ${accent}; border-radius:0 var(--radius-md) var(--radius-md) 0; border-top:1px solid var(--border-color); border-right:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
    <strong style="display:block; color:var(--text-primary); margin-bottom:0.35rem; font-size:0.92rem; letter-spacing:-0.01em;">Pasal ${num}: ${title}</strong>
    <span style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6; display:block;">${body}</span>
  </div>`;
}

function jobCard(title: string, type: string, location: string, desc: string): string {
  return `<div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color); transition:transform 0.2s, border-color 0.2s;" onmouseenter="this.style.transform='translateY(-2px)';this.style.borderColor='rgba(0,242,254,0.3)'" onmouseleave="this.style.transform='';this.style.borderColor='var(--border-color)'">
    <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.75rem; flex-wrap:wrap;">
      <h4 style="font-size:0.98rem; font-weight:800; color:var(--text-primary); margin:0;">${title}</h4>
      <span style="font-size:0.65rem; font-weight:700; padding:0.2rem 0.55rem; border-radius:100px; background:rgba(0,242,254,0.12); color:var(--accent-cyan); text-transform:uppercase; letter-spacing:0.06em; font-family:var(--font-mono);">${type}</span>
    </div>
    <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.6rem; display:flex; align-items:center; gap:0.35rem; font-family:var(--font-mono);">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      ${location}
    </div>
    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.55; margin:0 0 1rem 0;">${desc}</p>
    <a href="mailto:karir@queryindo.id?subject=Lamaran: ${title}" style="font-size:0.8rem; font-weight:700; color:var(--accent-cyan); text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; transition:opacity 0.2s;" onmouseenter="this.style.opacity='0.7'" onmouseleave="this.style.opacity='1'">Lamar Posisi Ini →</a>
  </div>`;
}


// ──────────────────────────────────────────────
// Page Content Generators
// ──────────────────────────────────────────────

function renderTentangKami(): string {
  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">

      <!-- Hero Quote -->
      <div style="background:var(--bg-tertiary); padding:2rem; border-radius:var(--radius-lg); border:1px solid var(--border-color); position:relative;">
        <p style="font-size:1.05rem; color:var(--text-secondary); line-height:1.75; border-left:3px solid var(--accent-cyan); padding-left:1.25rem; font-style:normal; margin:0;">
          "QUERYINDO merupakan portal berita teknologi dan informasi digital nasional di bawah naungan <strong style="color:var(--text-primary);">PT Query Media Nusantara</strong>. Kami menyajikan jurnalisme teknologi yang kredibel, akurat, dan berwawasan luas untuk mendukung agenda transformasi digital Indonesia."
        </p>
      </div>

      <!-- Visi & Misi -->
      ${sectionTitle('Visi & Misi Redaksi')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
        <div style="background:var(--bg-tertiary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(0,242,254,0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-cyan); margin-bottom:1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <h4 style="font-size:0.92rem; font-weight:800; color:var(--accent-cyan); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em; font-family:var(--font-mono);">Visi</h4>
          <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">Menjadi media teknologi terpercaya dan inovatif di Asia Tenggara yang memberikan informasi terverifikasi, analisis mendalam, dan wawasan strategis bagi pemangku kepentingan digital Indonesia.</p>
        </div>
        <div style="background:var(--bg-tertiary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="width:36px; height:36px; border-radius:8px; background:rgba(139,92,246,0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-violet); margin-bottom:1rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h4 style="font-size:0.92rem; font-weight:800; color:var(--accent-violet); margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.05em; font-family:var(--font-mono);">Misi</h4>
          <ul style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; padding-left:1.15rem; margin:0; display:flex; flex-direction:column; gap:0.4rem;">
            <li>Menyajikan berita teknologi akurat, terverifikasi, dan bebas intervensi.</li>
            <li>Mendorong literasi digital nasional melalui artikel edukatif dan riset.</li>
            <li>Menjadi penghubung antara pembuat kebijakan, pelaku industri, dan publik.</li>
            <li>Menjunjung tinggi standar jurnalisme Dewan Pers dengan transparansi penuh.</li>
          </ul>
        </div>
      </div>

      <!-- Sejarah Pendirian -->
      ${sectionTitle('Sejarah & Latar Belakang')}
      <div style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7; display:flex; flex-direction:column; gap:0.85rem;">
        <p>QUERYINDO didirikan pada <strong style="color:var(--text-primary);">Maret 2025</strong> oleh sekelompok jurnalis teknologi senior dan insinyur perangkat lunak yang melihat kebutuhan mendesak akan media teknologi nasional yang kredibel dan mendalam. Di tengah pesatnya perkembangan AI dan maraknya disinformasi digital, QUERYINDO hadir dengan komitmen akurasi data dan independensi editorial.</p>
        <p>QUERYINDO menjadi rujukan utama bagi pendiri startup, investor ventura, pengambil kebijakan, insinyur teknologi, dan masyarakat luas. Tim redaksi kami berpengalaman meliput bidang Kecerdasan Buatan, Keamanan Siber, Ekonomi Digital, Gadget, dan Infrastruktur Cloud.</p>
      </div>

      <!-- Tiga Pilar -->
      ${sectionTitle('Tiga Pilar Jurnalisme')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
        <div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="width:32px; height:32px; border-radius:6px; background:rgba(0,242,254,0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-cyan); margin-bottom:0.75rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <strong style="display:block; font-size:0.9rem; color:var(--text-primary); margin-bottom:0.4rem;">Independensi Editorial</strong>
          <span style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">Tanpa masukan politik maupun korporasi. Ruang redaksi beroperasi independen dari unit bisnis.</span>
        </div>
        <div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="width:32px; height:32px; border-radius:6px; background:rgba(139,92,246,0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-violet); margin-bottom:0.75rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <strong style="display:block; font-size:0.9rem; color:var(--text-primary); margin-bottom:0.4rem;">Verifikasi Multi-Sumber</strong>
          <span style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">Jurnalisme berbasis bukti dengan standar verifikasi minimal tiga sumber independen dan ralat terbuka.</span>
        </div>
        <div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="width:32px; height:32px; border-radius:6px; background:rgba(16,185,129,0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-emerald); margin-bottom:0.75rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <strong style="display:block; font-size:0.9rem; color:var(--text-primary); margin-bottom:0.4rem;">Edukasi Digital</strong>
          <span style="font-size:0.82rem; color:var(--text-muted); line-height:1.5;">Mendukung literasi teknologi masyarakat melalui penjelasan istilah teknis yang jernih dan relevan.</span>
        </div>
      </div>

      <!-- Legalitas -->
      ${sectionTitle('Legalitas & Lisensi')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
        ${infoCard('Badan Hukum', 'PT Byte Media Nusantara')}
        ${infoCard('No. SK Kemenkumham', 'AHU-0091240.AH.01.01.TAHUN 2025', 'var(--accent-violet)')}
        ${infoCard('Terdaftar Dewan Pers', 'ID-2910-BIMN (Verifikasi Administrasi & Faktual)', 'var(--accent-emerald)')}
        ${infoCard('NPWP Perusahaan', '09.321.456.7-012.000')}
        ${infoCard('Domisili Hukum', 'DKI Jakarta, Indonesia', 'var(--accent-violet)')}
        ${infoCard('Tahun Berdiri', '2025', 'var(--accent-emerald)')}
      </div>
    </section>
  `;
}


function renderHubungiKami(): string {
  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">

      <!-- Kantor Pusat -->
      ${sectionTitle('Alamat Kantor & Kontak')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
        <div style="background:var(--bg-tertiary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h4 style="font-size:0.9rem; font-weight:800; color:var(--text-primary); margin-bottom:1rem; display:flex; align-items:center; gap:0.4rem; text-transform:uppercase; font-family:var(--font-mono); letter-spacing:0.05em;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Kantor Pusat Redaksi
          </h4>
          <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
            <strong style="color:var(--text-primary);">Wisma Nugra Santana, Lantai 12</strong><br/>
            Jl. Jend. Sudirman Kav. 7-8<br/>
            Jakarta Pusat 10220<br/>
            DKI Jakarta, Indonesia
          </p>
        </div>
        <div style="background:var(--bg-tertiary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <h4 style="font-size:0.9rem; font-weight:800; color:var(--text-primary); margin-bottom:1rem; text-transform:uppercase; font-family:var(--font-mono); letter-spacing:0.05em; display:flex; align-items:center; gap:0.4rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Layanan Komunikasi
          </h4>
          <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.88rem; color:var(--text-secondary);">
            <div><strong style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; font-family:var(--font-mono);">Telepon Kantor</strong><br/><span style="color:var(--text-primary);">+62 21 5790 1234</span></div>
            <div><strong style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; font-family:var(--font-mono);">WhatsApp Redaksi</strong><br/><span style="color:var(--text-primary);">+62 812-7093-9344</span></div>
            <div><strong style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; font-family:var(--font-mono);">Jam Operasional</strong><br/><span style="color:var(--text-primary);">Senin – Jumat, 08.00 – 17.00 WIB</span></div>
          </div>
        </div>
      </div>

      <!-- Email Per Divisi -->
      ${sectionTitle('Email Departemen')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${infoCard('Redaksi & Newsroom', 'redaksi@queryindo.id')}
        ${infoCard('Iklan & Kemitraan Bisnis', 'iklan@queryindo.id', 'var(--accent-violet)')}
        ${infoCard('Humas & Media Relations', 'humas@queryindo.id', 'var(--accent-emerald)')}
        ${infoCard('Teknologi & Pengembangan', 'tech@queryindo.id')}
        ${infoCard('Ombudsman & Pengaduan', 'ombudsman@queryindo.id', 'var(--accent-violet)')}
        ${infoCard('Karir & Rekrutmen', 'karir@queryindo.id', 'var(--accent-emerald)')}
      </div>

      <!-- Jaringan Biro -->
      ${sectionTitle('Jaringan Biro Daerah')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
        ${infoCard('Biro Jawa Barat', 'Bandung Digital Valley, Jl. Asia Afrika No. 65')}
        ${infoCard('Biro Jawa Timur', 'Surabaya Tech Hub, Jl. Pemuda No. 31', 'var(--accent-violet)')}
        ${infoCard('Biro Bali & Nusa Tenggara', 'Denpasar Innovation Center, Jl. Teuku Umar No. 12', 'var(--accent-emerald)')}
        ${infoCard('Biro Kalimantan (IKN)', 'IKN Media Center, Penajam Paser Utara')}
      </div>

      <!-- Formulir Kontak -->
      ${sectionTitle('Kirim Pesan Resmi')}
      <form id="institutional-contact-form" style="display:flex; flex-direction:column; gap:1rem; max-width:600px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:0.35rem; font-family:var(--font-mono);">Nama Lengkap</label>
            <input type="text" required style="width:100%; padding:0.75rem 1rem; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:0.88rem; outline:none; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:0.35rem; font-family:var(--font-mono);">Email</label>
            <input type="email" required style="width:100%; padding:0.75rem 1rem; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:0.88rem; outline:none; box-sizing:border-box;" />
          </div>
        </div>
        <div>
          <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:0.35rem; font-family:var(--font-mono);">Kategori Subjek</label>
          <select style="width:100%; padding:0.75rem 1rem; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:0.88rem; outline:none; box-sizing:border-box;">
            <option>Pertanyaan Umum</option>
            <option>Hak Jawab / Klarifikasi Berita</option>
            <option>Kerjasama Iklan & Sponsorship</option>
            <option>Laporan Kesalahan Teknis</option>
            <option>Pertanyaan Karir & Magang</option>
          </select>
        </div>
        <div>
          <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:block; margin-bottom:0.35rem; font-family:var(--font-mono);">Pesan Anda</label>
          <textarea rows="5" required style="width:100%; padding:0.75rem 1rem; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-md); color:var(--text-primary); font-size:0.88rem; outline:none; resize:vertical; box-sizing:border-box;"></textarea>
        </div>
        <button type="submit" style="align-self:flex-start; padding:0.75rem 2rem; background:var(--gradient-brand); border:none; border-radius:var(--radius-md); color:#000; font-weight:800; font-size:0.85rem; cursor:pointer; transition:transform 0.2s, opacity 0.2s;" onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform=''">Kirim Pesan →</button>
      </form>
    </section>
  `;
}


function renderKodeEtik(): string {
  const articles = [
    { title: 'Independensi', body: 'Wartawan Indonesia bersikap independen, menghasilkan berita akurat, berimbang, dan tidak beritikad buruk. Redaksi QUERYINDO memastikan jurnalis tidak menerima suap atau tekanan dalam produksi berita.' },
    { title: 'Metode Profesional', body: 'Wartawan Indonesia menempuh cara profesional dalam melaksanakan tugas jurnalistik. QUERYINDO menerapkan SOP liputan digital yang meliputi verifikasi dokumen elektronik dan pengecekan metadata.' },
    { title: 'Uji Informasi', body: 'Wartawan Indonesia selalu menguji informasi, memberitakan secara berimbang, tidak mencampurkan fakta dan opini yang menghakimi, serta menerapkan asas praduga tak bersalah. Berita dipublikasikan wajib diverifikasi minimal tiga sumber.' },
    { title: 'Larangan Berita Bohong', body: 'Wartawan Indonesia tidak membuat berita bohong, fitnah, sadis, dan cabul. Redaksi menerapkan sistem pemeriksaan berlapis sebelum artikel dipublikasikan.' },
    { title: 'Perlindungan Identitas', body: 'Wartawan Indonesia tidak menyebutkan identitas korban kejahatan susila dan anak pelaku kejahatan. Prinsip perlindungan identitas diterapkan ketat.' },
    { title: 'Hak Jawab & Koreksi', body: 'QUERYINDO menyediakan mekanisme Hak Jawab dan Koreksi digital yang dapat diakses narasumber melalui surel resmi ombudsman@queryindo.id.' },
    { title: 'Perlindungan Sumber', body: 'Wartawan Indonesia memiliki Hak Tolak untuk melindungi narasumber rahasia yang tidak bersedia diketahui identitasnya demi alasan keamanan.' },
    { title: 'Embargo & Ralat Berita', body: 'Wartawan Indonesia menghormati embargo informasi dan segera mengoreksi berita yang keliru dengan pencantuman stempel waktu revisi yang transparan.' },
    { title: 'Larangan Plagiarisme', body: 'Orisinalitas konten dijaga ketat. Setiap pengutipan karya pihak lain wajib mencantumkan atribusi dan tautan balik secara eksplisit.' },
    { title: 'Transparansi Konten AI', body: 'Konten yang diproduksi dengan bantuan kecerdasan buatan wajib dilabeli secara eksplisit (seperti ringkasan berita AI atau gambar ilustrasi berlabel watermark AI).' },
    { title: 'Pertanggungjawaban', body: 'QUERYINDO memiliki Dewan Etik Internal yang berwenang menangani pengaduan publik dan memastikan kepatuhan terhadap kode etik jurnalistik.' },
  ];

  const accentColors = ['var(--accent-cyan)', 'var(--accent-violet)', 'var(--accent-emerald)'];

  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">
      <div style="background:var(--bg-tertiary); padding:1.75rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7; margin:0;">
          Seluruh jurnalis dan editor QUERYINDO wajib mematuhi <strong style="color:var(--text-primary);">Kode Etik Jurnalistik Dewan Pers Republik Indonesia</strong> (Peraturan Dewan Pers No. 6/Peraturan-DP/V/2008) serta UU Pers No. 40 Tahun 1999.
        </p>
      </div>

      ${sectionTitle('11 Pasal Kode Etik & Standar Editorial')}
      <div style="display:flex; flex-direction:column; gap:0.85rem;">
        ${articles.map((a, i) => ethicsArticle(i + 1, a.title, a.body, accentColors[i % 3])).join('')}
      </div>

      ${sectionTitle('Prosedur Pengaduan Ombudsman')}
      <div style="background:var(--bg-tertiary); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.88rem; color:var(--text-secondary); line-height:1.7;">
        <p style="margin:0 0 0.75rem 0;">Laporan pelanggaran etik atau permohonan Hak Jawab disampaikan melalui:</p>
        <ul style="padding-left:1.15rem; display:flex; flex-direction:column; gap:0.4rem; margin:0; font-family:var(--font-mono);">
          <li>Email Ombudsman: ombudsman@queryindo.id</li>
          <li>WhatsApp Pengaduan: +62 812-7093-9344</li>
        </ul>
      </div>
    </section>
  `;
}


function renderRedaksi(): string {
  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">

      <div style="background:var(--bg-tertiary); padding:1.75rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7; margin:0;">
          Susunan redaksi QUERYINDO disusun berdasarkan <strong style="color:var(--text-primary);">UU Pers No. 40 Tahun 1999</strong> dan Standar Perusahaan Pers Dewan Pers Republik Indonesia.
        </p>
      </div>

      <!-- Pimpinan Utama -->
      ${sectionTitle('Pimpinan & Penanggung Jawab')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${staffCard('Direktur Utama / CEO', 'Rijal Umami', 'Pendiri QUERYINDO. Lulusan Teknik Informatika dengan pengalaman 12 tahun di industri media digital.')}
        ${staffCard('Pemimpin Redaksi', 'Dian Prasetyo, M.T.', 'Mantan Redaktur Senior TechScape. 15 tahun pengalaman jurnalisme teknologi investigatif.')}
        ${staffCard('Wakil Pemimpin Redaksi', 'Sari Wulandari, M.Kom.', 'Spesialis liputan AI & Big Data. Fellow Knight-Wallace Journalism, Univ. of Michigan 2023.')}
      </div>

      <!-- Dewan Redaksi & Penasihat -->
      ${sectionTitle('Dewan Redaksi & Penasihat Hukum')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${staffCard('Dewan Penasihat AI', 'Prof. Dr. Irwan Hakim', 'Guru Besar Ilmu Komputer UI. Pakar etika AI dan regulasi kecerdasan buatan.')}
        ${staffCard('Penasihat Hukum Media', 'Dr. Hendra Kurniawan, S.H.', 'Advokat senior spesialis hukum pers dan siber. Partner KHK Law Firm.')}
        ${staffCard('Penasihat Keamanan Siber', 'Ir. Teguh Aprianto, CISSP', 'Praktisi keamanan siber nasional dan penasihat independen proteksi data.')}
      </div>

      <!-- Redaktur Desk -->
      ${sectionTitle('Redaktur Pelaksana & Koordinator Desk')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
        ${staffCard('Redaktur Pelaksana', 'Ahmad Fauzi', 'Mengelola alur berita harian dan koordinasi newsroom digital.')}
        ${staffCard('Desk AI & Data', 'Rina Maharani, M.Sc.', 'Lulusan Data Science ETH Zürich. Mengampu liputan machine learning & LLM.')}
        ${staffCard('Desk Gadget & Hardware', 'Bayu Setiawan', 'Reviewer perangkat keras 8 tahun. Sertifikasi CompTIA A+.')}
        ${staffCard('Desk Fintech & Crypto', 'Dewi Anggraeni, MBA', 'Mantan analis OJK. Mengulas regulasi keuangan digital dan aset kripto.')}
        ${staffCard('Desk Cybersecurity', 'Fajar Nugroho, CEH', 'Ethical hacker bersertifikat. Menginvestigasi insiden kebocoran data.')}
        ${staffCard('Desk Startup & VC', 'Laras Permata', '7 tahun meliput industri ventura Asia Tenggara. Kontributor TechCrunch SEA.')}
      </div>

      <!-- Tim Reporter & Teknologi -->
      ${sectionTitle('Tim Teknologi & Engineering')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
        ${staffCard('CTO / Lead Engineer', 'Hasan Maulana', 'Arsitek platform QUERYINDO. 10 tahun pengalaman cloud architecture.')}
        ${staffCard('Backend Engineer', 'Arif Hidayat', 'Spesialis Go, PostgreSQL, dan arsitektur microservices.')}
        ${staffCard('Frontend Engineer', 'Putri Ayu', 'Spesialis TypeScript, React, dan optimasi Core Web Vitals.')}
        ${staffCard('UI/UX Designer', 'Galih Pramono', 'Desainer antarmuka platform berbasis Stanford HCI guidelines.')}
      </div>
    </section>
  `;
}


function renderPedomanMediaSiber(): string {
  const babs = [
    { title: 'Ruang Lingkup', content: 'Pedoman ini mencakup seluruh kegiatan pemberitaan digital QUERYINDO yang didistribusikan melalui situs web, aplikasi mobile, dan media sosial.' },
    { title: 'Verifikasi & Keberimbangan Berita', content: 'Setiap berita wajib melalui uji informasi dan verifikasi berimbang. Berita mendesak (breaking news) dapat ditayangkan segera dengan kewajiban ralat/pembaruan berkala.' },
    { title: 'Isi Buatan Pengguna (UGC)', content: 'QUERYINDO mengelola komentar pembaca dengan filter AI otomatis dan fitur pelaporan pengguna untuk menolak ujaran kebencian atau disinformasi.' },
    { title: 'Ralat, Koreksi, & Hak Jawab', content: 'Setiap kesalahan data diperbaiki segera dengan pencantuman ralat transparan pada artikel tanpa mengubah URL asal.' },
    { title: 'Pencabutan Berita', content: 'Pencabutan berita hanya dilakukan atas putusan pengadilan yang berkekuatan hukum tetap atau rekomendasi resmi Dewan Pers.' },
    { title: 'Iklan & Konten Bersponsor', content: 'Setiap artikel advertorial atau berbayar wajib diberi tanda/badge SPONSORED secara jelas dan tegas.' },
    { title: 'Hak Cipta & Pengutipan', content: 'Pengutipan artikel QUERYINDO diperbolehkan maksimal 30% isi dengan kewajiban menyertakan tautan balik (backlink) aktif ke sumber.' },
    { title: 'Sengketa Pemberitaan', content: 'Sengketa pemberitaan diselesaikan terlebih dahulu melalui mekanisme Hak Jawab atau mediasi di Dewan Pers sesuai UU Pers.' },
    { title: 'Perlindungan Data Pribadi', content: 'QUERYINDO tunduk pada UU PDP No. 27 Tahun 2022. Pengumpulan data pengguna dibatasi sesuai kebutuhan operasional platform.' },
  ];

  const accentColors = ['var(--accent-cyan)', 'var(--accent-violet)', 'var(--accent-emerald)'];

  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">
      <div style="background:var(--bg-tertiary); padding:1.75rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7; margin:0;">
          Pedoman ini berpedoman pada <strong style="color:var(--text-primary);">Pedoman Pemberitaan Media Siber Dewan Pers</strong> (3 Februari 2012) untuk menjamin jurnalisme digital yang sehat.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${babs.map((bab, i) => `
          <div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color); border-left:3px solid ${accentColors[i % 3]};">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-primary); margin:0 0 0.5rem 0; display:flex; align-items:center; gap:0.5rem;">
              <span style="background:${accentColors[i % 3]}; color:#000; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:800; flex-shrink:0;">${i + 1}</span>
              ${bab.title}
            </h4>
            <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6; margin:0;">${bab.content}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}


function renderDisclaimer(): string {
  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">

      ${sectionTitle('Batasan Tanggung Jawab')}
      <div style="font-size:0.9rem; color:var(--text-secondary); line-height:1.7; display:flex; flex-direction:column; gap:0.85rem;">
        <p>Seluruh informasi di portal QUERYINDO (<code style="color:var(--accent-cyan);">queryindo.id</code>) disediakan <strong style="color:var(--text-primary);">as-is</strong> untuk tujuan informasi umum. QUERYINDO berupaya menjaga keakuratan informasi namun tidak bertanggung jawab atas keputusan independen yang diambil pembaca berdasarkan konten situs ini.</p>
        <p>Informasi harga saham, data teknis gadget, atau ulasan produk bersifat informatif dan bukan merupakan nasihat finansial atau investasi resmi.</p>
      </div>

      ${sectionTitle('Hak Kekayaan Intelektual')}
      <div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.88rem; color:var(--text-secondary); line-height:1.7;">
        <p style="margin:0 0 0.5rem 0;">Seluruh materi merek, desain logo, dan artikel terlindungi oleh <strong style="color:var(--text-primary);">UU Hak Cipta No. 28 Tahun 2014</strong> dan Hak Merek PT Query Media Nusantara.</p>
      </div>

      ${sectionTitle('Privasi Data (UU PDP)')}
      <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.7;">
        <p style="margin:0;">Pemrosesan data pribadi mematuhi <strong style="color:var(--text-primary);">UU No. 27 Tahun 2022 tentang PDP</strong>. Pengguna dapat mengajukan permohonan pembaruan atau penghapusan data melalui surel dpo@queryindo.id.</p>
      </div>
    </section>
  `;
}


function renderInfoIklan(): string {
  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">

      <div style="background:var(--bg-tertiary); padding:1.75rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7; margin:0;">
          Jangkau <strong style="color:var(--text-primary);">audiens teknologi premium Indonesia</strong> melalui berbagai format iklan dan kemitraan native QUERYINDO.
        </p>
      </div>

      <!-- Statistik Audiens -->
      ${sectionTitle('Demografi & Jangkauan')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:1rem;">
        ${infoCard('Monthly Unique Visitors', '2.8 Juta+')}
        ${infoCard('Monthly Pageviews', '12.5 Juta+', 'var(--accent-violet)')}
        ${infoCard('Newsletter Subscribers', '185.000+', 'var(--accent-emerald)')}
        ${infoCard('Rata-Rata Durasi Sesi', '4m 32s')}
      </div>

      <!-- Paket Iklan -->
      ${sectionTitle('Pilihan Paket Iklan')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.25rem;">
        ${[
          { name: 'Display Banner', price: 'Mulai Rp 15 Juta / bulan', items: ['Leaderboard 728×90', 'Medium Rectangle 300×250', 'Billboard 970×250'] },
          { name: 'Native Advertorial', price: 'Mulai Rp 25 Juta / artikel', items: ['Artikel ditulis tim editorial', 'Distribusi newsletter & sosmed', 'Badge SPONSORED transparan'] },
          { name: 'Sponsored Content Series', price: 'Mulai Rp 85 Juta / 4 artikel', items: ['Seri konten mendalam 4 artikel', 'Dedicated brand landing page', 'Analytics performa lengkap'] },
        ].map((pkg, i) => {
          const accent = ['var(--accent-cyan)', 'var(--accent-violet)', 'var(--accent-emerald)'][i];
          return `<div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color); border-top:3px solid ${accent};">
            <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-primary); margin:0 0 0.35rem 0;">${pkg.name}</h4>
            <span style="font-size:0.8rem; font-weight:700; color:${accent}; font-family:var(--font-mono); display:block; margin-bottom:0.85rem;">${pkg.price}</span>
            <ul style="font-size:0.82rem; color:var(--text-secondary); line-height:1.6; padding-left:1.1rem; margin:0;">
              ${pkg.items.map(it => `<li>${it}</li>`).join('')}
            </ul>
          </div>`;
        }).join('')}
      </div>

      <!-- Kontak -->
      ${sectionTitle('Kontak Tim Iklan')}
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${infoCard('Email Iklan', 'iklan@queryindo.id')}
        ${infoCard('WhatsApp Commercial', '+62 813-2000-8899', 'var(--accent-violet)')}
      </div>
    </section>
  `;
}


function renderKarir(): string {
  return `
    <section style="display:flex; flex-direction:column; gap:2rem;">

      <div style="background:var(--bg-tertiary); padding:1.75rem; border-radius:var(--radius-lg); border:1px solid var(--border-color);">
        <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7; margin:0;">
          Bergabunglah bersama QUERYINDO untuk membangun media teknologi terbaik di Indonesia.
        </p>
      </div>

      <!-- Lowongan Aktif -->
      ${sectionTitle('Lowongan Aktif')}
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${jobCard('Reporter Teknologi Senior', 'Full-Time', 'Jakarta / Remote', 'Meliput AI, cloud, dan transformasi digital. Minimal 3 tahun pengalaman di media teknologi.')}
        ${jobCard('Data Journalist', 'Full-Time', 'Jakarta', 'Mengolah data menjadi visualisasi interaktif. Menguasai Python, R, atau Tableau.')}
        ${jobCard('UI/UX Designer', 'Full-Time', 'Jakarta / Remote', 'Merancang antarmuka platform berita berbasis design system modern.')}
        ${jobCard('Backend Engineer (Go)', 'Full-Time', 'Jakarta / Remote', 'Mengembangkan arsitektur backend platform berita skala tinggi.')}
      </div>

      <!-- Cara Melamar -->
      ${sectionTitle('Prosedur Lamaran')}
      <div style="background:var(--bg-tertiary); padding:1.35rem; border-radius:var(--radius-md); border:1px solid var(--border-color); font-size:0.88rem; color:var(--text-secondary); line-height:1.7;">
        Kirimkan CV dan portofolio ke <code style="color:var(--accent-cyan); font-family:var(--font-mono);">karir@queryindo.id</code> dengan subjek <code style="color:var(--accent-cyan); font-family:var(--font-mono);">[Posisi] — Nama Lengkap</code>.
      </div>
    </section>
  `;
}


// ──────────────────────────────────────────────
// Main Exported Class
// ──────────────────────────────────────────────

export class InstitutionalPages {

  public static getPageTitle(pageId: InstitutionalPageId, lang: 'id' | 'en'): string {
    return PAGE_TITLES[pageId]?.[lang] ?? pageId;
  }

  public static renderPage(pageId: InstitutionalPageId, lang: 'id' | 'en'): string {
    const title = this.getPageTitle(pageId, lang);
    const homeLabel = lang === 'en' ? 'Home' : 'Beranda';
    const backLabel = lang === 'en' ? '← Back to Home' : '← Kembali ke Beranda';

    let contentHTML = '';
    switch (pageId) {
      case 'tentang-kami': contentHTML = renderTentangKami(); break;
      case 'hubungi-kami': contentHTML = renderHubungiKami(); break;
      case 'kode-etik': contentHTML = renderKodeEtik(); break;
      case 'redaksi': contentHTML = renderRedaksi(); break;
      case 'pedoman-media-siber': contentHTML = renderPedomanMediaSiber(); break;
      case 'disclaimer': contentHTML = renderDisclaimer(); break;
      case 'info-iklan': contentHTML = renderInfoIklan(); break;
      case 'karir': contentHTML = renderKarir(); break;
    }

    return `
      <div style="max-width:880px; margin:0 auto; padding:2rem 1rem 4rem 1rem;">
        <!-- Breadcrumb & Back Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.75rem; flex-wrap:wrap; gap:0.75rem;">
          <nav style="font-size:0.78rem; color:var(--text-muted); display:flex; align-items:center; gap:0.4rem; font-family:var(--font-mono);">
            <a href="#" style="color:var(--accent-cyan); text-decoration:none; font-weight:600;">${homeLabel}</a>
            <span>/</span>
            <span style="color:var(--text-primary); font-weight:600;">${title}</span>
          </nav>
          <a href="#" class="inst-back-btn" style="font-size:0.8rem; font-weight:700; color:var(--text-primary); text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; padding:0.45rem 1rem; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:var(--radius-full); transition:all 0.2s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            ${backLabel}
          </a>
        </div>

        <!-- Page Hero Header -->
        <div style="background:var(--bg-secondary); padding:2.25rem 2rem; border-radius:var(--radius-lg); border:1px solid var(--border-color); margin-bottom:2.25rem; position:relative; overflow:hidden;">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem;">
            <span style="width:8px; height:8px; border-radius:50%; background:var(--accent-cyan);"></span>
            <span style="font-size:0.68rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.12em; font-family:var(--font-mono);">QUERYINDO INSTITUTIONAL</span>
          </div>
          <h1 style="font-size:1.75rem; font-weight:800; color:var(--text-primary); margin:0; line-height:1.3; letter-spacing:-0.02em;">${title}</h1>
        </div>

        <!-- Page Content -->
        ${contentHTML}
      </div>
    `;
  }

  public static isValidPageId(id: string): id is InstitutionalPageId {
    return id in PAGE_TITLES;
  }
}
