import { AuthorService, EDITORIAL_DIVISIONS } from '../services/authorService';
import { ImageUtils } from '../utils/imageUtils';
import { Toast } from '../utils/toast';
import { Router } from '../router/index';

export type InstitutionalPageId =
  | 'tentang-kami'
  | 'hubungi-kami'
  | 'kode-etik'
  | 'redaksi'
  | 'pedoman-media-siber'
  | 'disclaimer'
  | 'info-iklan'
  | 'privasi'
  | 'syarat-ketentuan'
  | 'peta-situs';

interface PageMeta {
  title: { id: string; en: string };
  lead: { id: string; en: string };
  kicker: { id: string; en: string };
}

const PAGE_METADATA: Record<InstitutionalPageId, PageMeta> = {
  'tentang-kami': {
    title: { id: 'Tentang Kami', en: 'About Us' },
    kicker: { id: 'Profil Perusahaan Pers', en: 'Company Profile' },
    lead: {
      id: 'Portal jurnalisme teknologi independen berskala nasional yang dikelola oleh PT Query Media Nusantara, menyajikan liputan teknologi, kecerdasan buatan, komputasi awan, dan transformasi digital Indonesia.',
      en: 'A national independent technology journalism publication published by PT Query Media Nusantara, covering AI, cloud infrastructure, cybersecurity, and digital policy.'
    }
  },
  'redaksi': {
    title: { id: 'Susunan Redaksi', en: 'Editorial Board' },
    kicker: { id: 'Boks Redaksi Resmi', en: 'Masthead' },
    lead: {
      id: 'Struktur kepemimpinan redaksi, dewan penasihat, redaktur pelaksana, dan jurnalis teknologi QUERYINDO sesuai amanat Pasal 12 UU Pers No. 40 Tahun 1999.',
      en: 'Editorial leadership, advisory board, managing editors, and journalists of QUERYINDO in compliance with Indonesian Press Law.'
    }
  },
  'kode-etik': {
    title: { id: 'Kode Etik Jurnalistik', en: 'Code of Ethics' },
    kicker: { id: 'Standar Etika Jurnalistik', en: 'Press Ethics' },
    lead: {
      id: '11 Pasal Kode Etik Jurnalistik (KEJ) yang disahkan oleh Dewan Pers Republik Indonesia sebagai pedoman moral dan profesional seluruh jurnalis QUERYINDO.',
      en: 'The 11 Articles of the Journalistic Code of Ethics enacted by the Indonesian Press Council as the moral and professional standard for all QUERYINDO journalists.'
    }
  },
  'pedoman-media-siber': {
    title: { id: 'Pedoman Media Siber', en: 'Cyber Media Guidelines' },
    kicker: { id: 'Regulasi Dewan Pers', en: 'Digital Press Policy' },
    lead: {
      id: 'Pedoman Pemberitaan Media Siber yang ditetapkan oleh Dewan Pers bersama organisasi pers Indonesia pada 3 Februari 2012 untuk menjamin jurnalisme digital yang sehat dan bertanggung jawab.',
      en: 'Cyber Media Coverage Guidelines established by the Indonesian Press Council for accountable, verified digital journalism.'
    }
  },
  'info-iklan': {
    title: { id: 'Info Iklan & Kemitraan', en: 'Advertising & Media Kit' },
    kicker: { id: 'Layanan Komersial', en: 'Commercial Inquiries' },
    lead: {
      id: 'Pilihan format periklanan display, konten bersponsor (advertorial), dan kemitraan strategis untuk menjangkau ekosistem teknologi, pelaku startup, dan pemangku kepentingan digital di Indonesia.',
      en: 'Advertising formats, sponsored editorial content, and partnership solutions reaching technology executives, software engineers, and digital innovators across Indonesia.'
    }
  },
  'hubungi-kami': {
    title: { id: 'Hubungi Kami & Kantor Redaksi', en: 'Contact Newsroom' },
    kicker: { id: 'Saluran Komunikasi', en: 'Contact & Inquiries' },
    lead: {
      id: 'Alamat kantor redaksi, saluran surel resmi, layanan Hak Jawab Dewan Pers, dan formulir korespondensi pembaca.',
      en: 'Newsroom office address, official email directories, Right of Reply inquiries, and editorial contact form.'
    }
  },
  'disclaimer': {
    title: { id: 'Disclaimer (Penafian)', en: 'Legal Disclaimer' },
    kicker: { id: 'Penafian Hukum', en: 'Legal Terms' },
    lead: {
      id: 'Ketentuan batasan tanggung jawab pemberitaan, penafian nasihat keuangan, perlindungan hak cipta (UU 28/2014), dan kepatuhan privasi data (UU PDP 27/2022).',
      en: 'Terms regarding limitation of liability, non-financial advice notice, copyright protection, and data privacy compliance.'
    }
  },
  'privasi': {
    title: { id: 'Kebijakan Privasi & PDP', en: 'Privacy Policy' },
    kicker: { id: 'Pelindungan Data Pribadi', en: 'Data Privacy' },
    lead: {
      id: 'Komitmen perlindungan privasi pembaca dan kepatuhan penuh terhadap Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) Republik Indonesia.',
      en: 'Our commitment to reader privacy and full compliance with Indonesian Personal Data Protection Law (UU PDP No. 27/2022).'
    }
  },
  'syarat-ketentuan': {
    title: { id: 'Syarat & Ketentuan Penggunaan', en: 'Terms of Service' },
    kicker: { id: 'Ketentuan Layanan', en: 'Terms of Use' },
    lead: {
      id: 'Ketentuan dan pedoman hukum penggunaan seluruh layanan, hak kekayaan intelektual (UU 28/2014), serta etika partisipasi publik pada platform QUERYINDO.',
      en: 'Legal terms governing platform usage, intellectual property rights, reader comments etiquette, and liability standards.'
    }
  },
  'peta-situs': {
    title: { id: 'Peta Situs (Sitemap Direktori)', en: 'Site Directory' },
    kicker: { id: 'Direktori Konten', en: 'Content Index' },
    lead: {
      id: 'Peta navigasi terstruktur yang mencakup seluruh kanal berita teknologi, direktori kelembagaan pers, serta berkas umpan sindikasi crawler.',
      en: 'Comprehensive site index covering all technology news desks, editorial policies, article archives, and search engine syndication feeds.'
    }
  }
};

const NAVIGATION_TABS: Array<{ id: InstitutionalPageId; label: { id: string; en: string }; iconSvg: string }> = [
  {
    id: 'tentang-kami',
    label: { id: 'Tentang Kami', en: 'About Us' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>'
  },
  {
    id: 'redaksi',
    label: { id: 'Susunan Redaksi', en: 'Masthead' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  },
  {
    id: 'kode-etik',
    label: { id: 'Kode Etik', en: 'Code of Ethics' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
  },
  {
    id: 'pedoman-media-siber',
    label: { id: 'Pedoman Siber', en: 'Cyber Guidelines' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
  },
  {
    id: 'privasi',
    label: { id: 'Privasi & PDP', en: 'Privacy' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
  },
  {
    id: 'syarat-ketentuan',
    label: { id: 'Syarat Ketentuan', en: 'Terms' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
  },
  {
    id: 'peta-situs',
    label: { id: 'Peta Situs', en: 'Sitemap' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  },
  {
    id: 'info-iklan',
    label: { id: 'Info Iklan', en: 'Advertising' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'
  },
  {
    id: 'hubungi-kami',
    label: { id: 'Hubungi Kami', en: 'Contact Us' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'
  },
  {
    id: 'disclaimer',
    label: { id: 'Disclaimer', en: 'Disclaimer' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  }
];

// ──────────────────────────────────────────────
// Page 1: Tentang Kami (Human-crafted Editorial Prose)
// ──────────────────────────────────────────────

function renderTentangKami(): string {
  return `
    <div class="inst-content-body">
      <!-- Executive Mission Statement -->
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "QUERYINDO berkomitmen menyajikan jurnalisme teknologi yang jernih, faktual, dan independen. Di tengah laju perkembangan komputasi dan maraknya disinformasi digital, kami hadir memberikan ulasan mendalam yang mengutamakan kepentingan publik dan kemajuan sains nasional."
        </p>
        <span class="inst-statement-caption">Pernyataan Dewan Redaksi QUERYINDO</span>
      </div>

      <!-- Profil & Sejarah Singkat -->
      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Profil & Latar Belakang</h3>
        </div>
        <p>
          QUERYINDO (<code>queryindo.com</code>) didirikan pada awal tahun 2025 di bawah naungan <strong>PT Query Media Nusantara</strong> oleh sekelompok jurnalis media massa senior dan praktisi teknologi informasi. Kami melihat pentingnya kehadiran media spesialis yang mampu membedah isu-isu teknologi mutakhir—seperti kecerdasan buatan, keamanan siber, komputasi awan, infrastruktur jaringan, dan kebijakan publik digital—dengan bahasa yang lugas dan berbobot.
        </p>
        <p>
          Dalam menjalankan kerja jurnalistik, redaksi QUERYINDO beroperasi secara independen, mematuhi Undang-Undang Republik Indonesia Nomor 40 Tahun 1999 tentang Pers, Kode Etik Jurnalistik, dan Pedoman Pemberitaan Media Siber yang ditetapkan Dewan Pers.
        </p>
      </div>

      <!-- Legalitas Badan Hukum (Clean Table Format) -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Identitas Perusahaan Pers</h3>
          <p class="inst-sec-subtitle">Data legalitas badan hukum penerbit sesuai ketentuan Undang-Undang Pers.</p>
        </div>
        <table class="inst-meta-table">
          <tbody>
            <tr>
              <th>Nama Badan Hukum</th>
              <td>PT Query Media Nusantara</td>
            </tr>
            <tr>
              <th>Pengesahan Kemenkumham RI</th>
              <td>Nomor AHU-0091240.AH.01.01.TAHUN 2025</td>
            </tr>
            <tr>
              <th>Nomor Pokok Wajib Pajak (NPWP)</th>
              <td>09.321.456.7-012.000</td>
            </tr>
            <tr>
              <th>Bidang Usaha (KBLI)</th>
              <td>58130 (Aktivitas Penerbitan Surat Kabar, Jurnal, dan Buletin atau Majalah) &amp; 63122 (Portal Web Berita)</td>
            </tr>
            <tr>
              <th>Domisili Kantor</th>
              <td>Candipuro, Lampung Selatan, Lampung / Perwakilan Redaksi Jakarta</td>
            </tr>
            <tr>
              <th>Status Perusahaan Pers</th>
              <td>Memenuhi Standar Perusahaan Pers Dewan Pers Republik Indonesia</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Visi & Misi Redaksi -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Visi &amp; Misi</h3>
        </div>
        <div class="inst-split-grid">
          <div class="inst-column-block">
            <h4>Visi</h4>
            <p>
              Menjadi media teknologi rujukan utama yang kredibel, berintegritas, dan inovatif dalam mengawal perkembangan ekosistem sains dan transformasi digital di Indonesia.
            </p>
          </div>
          <div class="inst-column-block">
            <h4>Misi</h4>
            <ul class="inst-numbered-list">
              <li>
                <span class="inst-list-num">1.</span>
                <span>Menghasilkan karya jurnalistik teknologi yang akurat, berimbang, dan melalui proses verifikasi yang ketat.</span>
              </li>
              <li>
                <span class="inst-list-num">2.</span>
                <span>Mendorong peningkatan literasi digital dan keamanan siber masyarakat melalui artikel ulasan, analisis data, dan liputan investigatif.</span>
              </li>
              <li>
                <span class="inst-list-num">3.</span>
                <span>Menjaga independensi ruang redaksi dari segala bentuk intervensi politik maupun tekanan komersial.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Standar Independensi & Etika -->
      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Independensi &amp; Etika Redaksi</h3>
        </div>
        <p>
          Ruang redaksi QUERYINDO memegang teguh batas tegas antara fungsi editorial dan kegiatan bisnis. Wartawan kami dilarang menerima imbalan, hadiah, atau fasilitas dalam bentuk apapun yang dapat memengaruhi objektivitas pemberitaan.
        </p>
        <p>
          Konten advertorial, kerja sama sponsor, atau materi promosi komersial dipisahkan secara tegas dan diberi penanda tertulis yang jelas demi transparansi kepada pembaca.
        </p>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 2: Susunan Redaksi (Boks Redaksi Masthead)
// ──────────────────────────────────────────────

function renderRedaksi(): string {
  const allAuthors = AuthorService.getAuthors();

  const divisionsMap: Record<string, typeof allAuthors> = {};
  EDITORIAL_DIVISIONS.forEach(div => {
    divisionsMap[div] = [];
  });

  allAuthors.forEach(author => {
    const div = author.division || 'Redaktur Pelaksana & Koordinator Desk';
    if (!divisionsMap[div]) {
      divisionsMap[div] = [];
    }
    divisionsMap[div].push(author);
  });

  Object.keys(divisionsMap).forEach(key => {
    divisionsMap[key].sort((a, b) => (a.order || 99) - (b.order || 99));
  });

  const divisionSections = Object.entries(divisionsMap)
    .filter(([_, authors]) => authors.length > 0)
    .map(([divName, authors]) => `
      <div class="inst-masthead-group">
        <h4 class="inst-masthead-group-title">${divName}</h4>
        <div class="inst-masthead-grid">
          ${authors.map(a => {
            const avatarUrl = a.avatar ? ImageUtils.normalizeImageUrl(a.avatar) : '';
            const fallbackAvatar = ImageUtils.getInitialsAvatar(a.name);
            const avatarHtml = avatarUrl
              ? `<img src="${avatarUrl}" alt="${a.name}" class="inst-masthead-avatar" onerror="this.onerror=null;this.src='${fallbackAvatar}';" />`
              : `<div class="inst-masthead-avatar-fallback">${a.name.charAt(0)}</div>`;

            return `
              <div class="inst-masthead-person">
                ${avatarHtml}
                <div class="inst-masthead-info">
                  <span class="inst-masthead-role">${a.role}</span>
                  <div class="inst-masthead-name">${a.name}</div>
                  ${a.bio ? `<p class="inst-masthead-bio">${a.bio}</p>` : ''}
                  ${a.email ? `
                    <a href="mailto:${a.email}" class="inst-masthead-email" title="Surel resmi">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      <span>${a.email}</span>
                    </a>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

  return `
    <div class="inst-content-body">
      <!-- Masthead Mandate Notice -->
      <div class="inst-masthead-notice">
        Berdasarkan amanat <strong>Pasal 12 Undang-Undang Republik Indonesia Nomor 40 Tahun 1999 tentang Pers</strong>, Perusahaan Pers wajib mengumumkan nama, alamat, dan penanggung jawab secara terbuka melalui media yang bersangkutan. Susunan di bawah ini adalah dewan penanggung jawab dan tim pelaksana redaksi QUERYINDO.
      </div>

      <!-- Masthead Grouped Sections -->
      <div>
        ${divisionSections}
      </div>

      <!-- Legal Protection Note -->
      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Perlindungan Profesi Wartawan</h3>
        </div>
        <p>
          Dalam menjalankan tugas jurnalistik, wartawan QUERYINDO memperoleh perlindungan hukum berdasarkan Pasal 8 Undang-Undang Pers. Wartawan kami dibekali Surat Tugas dan Kartu Pers resmi yang mencantumkan nama, nomor kontak redaksi, dan masa berlaku.
        </p>
        <p style="font-size:0.88rem; color:var(--text-muted);">
          Narasumber berhak menolak wawancara dan meminta klarifikasi ke redaksi melalui surel <code>redaksi@queryindo.com</code> apabila pewarta yang bersangkutan tidak dapat menunjukkan identitas resmi.
        </p>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 3: Kode Etik Jurnalistik (11 Pasal Resmi Dewan Pers)
// ──────────────────────────────────────────────

function renderKodeEtik(): string {
  const articles = [
    {
      num: 1,
      title: 'Independen, Akurat, dan Berimbang',
      body: 'Wartawan Indonesia bersikap independen, menghasilkan berita yang akurat, berimbang, dan tidak beritikad buruk.'
    },
    {
      num: 2,
      title: 'Cara-cara yang Profesional',
      body: 'Wartawan Indonesia menempuh cara-cara yang profesional dalam melaksanakan tugas jurnalistik.'
    },
    {
      num: 3,
      title: 'Uji Informasi dan Praduga Tak Bersalah',
      body: 'Wartawan Indonesia selalu menguji informasi, memberitakan secara berimbang, tidak mencampurkan fakta dan opini yang menghakimi, serta menerapkan asas praduga tak bersalah.'
    },
    {
      num: 4,
      title: 'Larangan Berita Bohong dan Fitnah',
      body: 'Wartawan Indonesia tidak membuat berita bohong, fitnah, sadis, dan cabul.'
    },
    {
      num: 5,
      title: 'Perlindungan Identitas Korban dan Anak',
      body: 'Wartawan Indonesia tidak menyebutkan dan menyiarkan identitas korban kejahatan susila dan tidak menyebutkan identitas anak yang menjadi pelaku kejahatan.'
    },
    {
      num: 6,
      title: 'Larangan Menyalahgunakan Profesi dan Menyuap',
      body: 'Wartawan Indonesia tidak menyalahgunakan profesi dan tidak menerima suap.'
    },
    {
      num: 7,
      title: 'Hak Tolak, Embargo, dan Informasi Rahasia',
      body: 'Wartawan Indonesia memiliki hak tolak untuk melindungi narasumber yang tidak bersedia diketahui identitas maupun keberadaannya, menghargai ketentuan embargo, informasi latar belakang, dan "off the record" sesuai dengan kesepakatan.'
    },
    {
      num: 8,
      title: 'Bebas Prasangka dan Diskriminasi',
      body: 'Wartawan Indonesia tidak menulis atau menyiarkan berita berdasarkan prasangka atau diskriminasi terhadap seseorang atas dasar perbedaan suku, ras, warna kulit, agama, jenis kelamin, dan bahasa serta tidak merendahkan martabat orang lemah, miskin, difabel, atau cacat jasmani/mental.'
    },
    {
      num: 9,
      title: 'Penghormatan atas Kehidupan Pribadi',
      body: 'Wartawan Indonesia menghormati hak narasumber tentang kehidupan pribadinya, kecuali untuk kepentingan publik.'
    },
    {
      num: 10,
      title: 'Kewajiban Ralat dan Permintaan Maaf',
      body: 'Wartawan Indonesia segera mencabut, meralat, dan memperbaiki berita yang keliru dan tidak akurat disertai dengan permintaan maaf kepada pembaca, pendengar, dan atau pemirsa.'
    },
    {
      num: 11,
      title: 'Pelayanan Hak Jawab dan Hak Koreksi',
      body: 'Wartawan Indonesia melayani hak jawab dan hak koreksi secara proporsional.'
    }
  ];

  return `
    <div class="inst-content-body">
      <!-- Preamble Dewan Pers -->
      <div class="inst-preamble-text">
        <strong>Pembukaan Kode Etik Jurnalistik:</strong><br/>
        Kemerdekaan pers adalah salah satu wujud kedaulatan rakyat yang berasaskan prinsip-prinsip demokrasi, keadilan, dan supremasi hukum. Dalam mewujudkan kemerdekaan pers itu, wartawan Indonesia juga menyadari adanya kepentingan bangsa, tanggung jawab sosial, keberagaman masyarakat, dan norma-norma agama. Dalam melaksanakan fungsi, hak, kewajiban dan peranannya, pers menghormati hak asasi setiap orang, karena itu pers dituntut profesional dan terbuka untuk dikontrol oleh masyarakat.
      </div>

      <!-- 11 Articles List (Classic Editorial Presentation) -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">11 Pasal Kode Etik Jurnalistik</h3>
          <p class="inst-sec-subtitle">Ditetapkan oleh Dewan Pers melalui Surat Keputusan Dewan Pers Nomor 03/SK-DP/III/2006 di Jakarta.</p>
        </div>
        <div class="inst-articles-list">
          ${articles.map(art => `
            <div class="inst-article-row">
              <div class="inst-article-meta">
                <span class="inst-article-num">Pasal ${art.num}</span>
                <h4 class="inst-article-title">${art.title}</h4>
              </div>
              <p class="inst-article-text">${art.body}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Penilaian & Pengaduan Pelanggaran -->
      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Mekanisme Pengaduan &amp; Dewan Pers</h3>
        </div>
        <p>
          Penilaian akhir atas dugaan pelanggaran kode etik jurnalistik dilakukan oleh <strong>Dewan Pers Republik Indonesia</strong>. Pihak yang merasa dirugikan oleh pemberitaan QUERYINDO dapat menyampaikan pengaduan langsung kepada redaksi kami atau mengadukannya kepada Dewan Pers sesuai mekanisme yang berlaku.
        </p>
        <p style="font-size:0.9rem;">
          Pengaduan ke redaksi dapat dikirimkan melalui surel resmi: <code>redaksi@queryindo.com</code> dengan subjek: <strong>[PENGADUAN ETIKA]</strong>.
        </p>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 4: Pedoman Media Siber (Pedoman Dewan Pers 2012)
// ──────────────────────────────────────────────

function renderPedomanMediaSiber(): string {
  const clauses = [
    {
      title: '1. Ruang Lingkup',
      body: 'Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pokok Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers. Pedoman ini berlaku untuk seluruh produk berita dan konten yang diterbitkan oleh QUERYINDO.'
    },
    {
      title: '2. Verifikasi dan Keberimbangan Berita',
      body: 'Pada prinsipnya setiap berita harus melalui verifikasi. Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan. Dalam situasi berita mendesak (breaking news) yang belum dapat dikonfirmasi seketika, redaksi wajib mencantumkan keterangan bahwa konfirmasi masih terus diupayakan dan memperbarui artikel secara berkala.'
    },
    {
      title: '3. Isi Buatan Pengguna (User Generated Content)',
      body: 'QUERYINDO mewajibkan pengguna untuk melakukan pendaftaran dan menyetujui syarat layanan sebelum memuat komentar atau opini. Redaksi berhak menyunting atau menghapus isi buatan pengguna yang memuat unsur fitnah, kebencian SARA, hasutan kekerasan, pornografi, dan materi yang melanggar hukum.'
    },
    {
      title: '4. Ralat, Koreksi, dan Hak Jawab',
      body: 'Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman ini. Ralat atau koreksi ditautkan pada berita yang diralat dengan menyebutkan waktu pembaruan serta bagian yang diperbaiki secara transparan.'
    },
    {
      title: '5. Pencabutan Berita',
      body: 'Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak korban kejahatan, putusan pengadilan yang berkekuatan hukum tetap, atau atas rekomendasi khusus Dewan Pers. Pencabutan berita wajib disertai alasan dan diumumkan kepada publik.'
    },
    {
      title: '6. Iklan dan Konten Komersial',
      body: 'QUERYINDO membedakan secara tegas antara produk berita jurnalistik dan konten iklan. Setiap artikel advertorial, materi bersponsor, atau kemitraan komersial wajib mencantumkan keterangan "Iklan", "Advertorial", atau "Sponsored" secara jelas.'
    },
    {
      title: '7. Hak Cipta dan Pengutipan',
      body: 'QUERYINDO menghormati hak cipta pihak lain sebagaimana diatur dalam peraturan perundang-undangan. Pengutipan berita QUERYINDO oleh pihak lain wajib menyebutkan sumber dan menyertakan tautan balik (link) aktif ke artikel asli.'
    },
    {
      title: '8. Sengketa Pemberitaan',
      body: 'Pelaksanaan Pedoman Pemberitaan Media Siber ini diawasi oleh Dewan Pers. Sengketa mengenai pelaksanaan pedoman ini diselesaikan melalui mediasi di Dewan Pers.'
    }
  ];

  return `
    <div class="inst-content-body">
      <!-- Preamble Pedoman Siber -->
      <div class="inst-preamble-text">
        Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Untuk mendorong perkembangan media siber yang profesional, Dewan Pers bersama organisasi pers menyusun <strong>Pedoman Pemberitaan Media Siber</strong> di Jakarta pada 3 Februari 2012.
      </div>

      <!-- Clauses List -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Ketentuan Pedoman Pemberitaan Media Siber</h3>
        </div>
        <div>
          ${clauses.map(clause => `
            <div class="inst-siber-section">
              <h4 class="inst-siber-title">${clause.title}</h4>
              <p class="inst-siber-body">${clause.body}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 5: Info Iklan & Kemitraan (Professional Media Kit)
// ──────────────────────────────────────────────

function renderInfoIklan(): string {
  return `
    <div class="inst-content-body">
      <!-- Editorial Intro -->
      <div class="inst-editorial-prose">
        <p>
          QUERYINDO menyediakan ruang periklanan dan kemitraan strategis bagi instansi, perusahaan teknologi, dan penyedia solusi digital yang ingin menjangkau pembaca terdidik di Indonesia. Pembaca kami terdiri dari praktisi teknologi informasi, pendiri startup, pengembang perangkat lunak, peneliti kecerdasan buatan, investor, serta pembuat kebijakan publik.
        </p>
      </div>

      <!-- Ringkasan Jangkauan Media -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Profil &amp; Jangkauan Media</h3>
          <p class="inst-sec-subtitle">Gambaran audiens dan distribusi konten platform QUERYINDO.</p>
        </div>
        <div class="inst-ad-metrics">
          <div class="inst-ad-metric-item">
            <span class="inst-ad-metric-value">2.8 Juta+</span>
            <span class="inst-ad-metric-label">Pengunjung Unik Bulanan</span>
          </div>
          <div class="inst-ad-metric-item">
            <span class="inst-ad-metric-value">12.5 Juta+</span>
            <span class="inst-ad-metric-label">Tayangan Halaman (Pageviews)</span>
          </div>
          <div class="inst-ad-metric-item">
            <span class="inst-ad-metric-value">185.000+</span>
            <span class="inst-ad-metric-label">Pelanggan Buletin Surel</span>
          </div>
          <div class="inst-ad-metric-item">
            <span class="inst-ad-metric-value">84%</span>
            <span class="inst-ad-metric-label">Audiens Sektor Teknologi &amp; Bisnis</span>
          </div>
        </div>
      </div>

      <!-- Format Iklan Standar IAB -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Pilihan Format Periklanan</h3>
        </div>
        <div class="inst-ad-formats-grid">
          <div class="inst-ad-format-card">
            <h4>Display Banner</h4>
            <p class="inst-ad-format-desc">
              Penempatan spanduk digital di posisi strategis beranda dan artikel berita dengan rasio impresi terukur.
            </p>
            <ul class="inst-ad-spec-list">
              <li>• Top Leaderboard: 728 × 90 px</li>
              <li>• Medium Rectangle: 300 × 250 px</li>
              <li>• Billboard Panorama: 970 × 250 px</li>
              <li>• Format file: JPG, PNG, GIF, HTML5</li>
            </ul>
          </div>

          <div class="inst-ad-format-card">
            <h4>Native Advertorial</h4>
            <p class="inst-ad-format-desc">
              Artikel informatif yang mengulas studi kasus, inovasi produk, atau rilis korporat dengan sudut pandang jurnalisme teknologi.
            </p>
            <ul class="inst-ad-spec-list">
              <li>• Penulisan berstandar jurnalistik</li>
              <li>• Pelabelan transparan (Sponsored/Advertorial)</li>
              <li>• Distribusi di kanal berita dan arsip permanen</li>
              <li>• Penyebaran melalui buletin surel redaksi</li>
            </ul>
          </div>

          <div class="inst-ad-format-card">
            <h4>Kemitraan Acara &amp; Liputan Khusus</h4>
            <p class="inst-ad-format-desc">
              Kolaborasi liputan mendalam untuk konferensi teknologi, peluncuran produk industri, dan laporan riset sektoral.
            </p>
            <ul class="inst-ad-spec-list">
              <li>• Media Partner resmi kegiatan teknologi</li>
              <li>• Seri artikel ulasan mendalam</li>
              <li>• Wawancara eksekutif dan pembuat kebijakan</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Ketentuan Iklan & Kontak Bisnis -->
      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Kebijakan Pemasangan Iklan</h3>
        </div>
        <p>
          Redaksi QUERYINDO berhak menolak materi iklan yang menyesatkan publik, memuat unsur perjudian, pornografi, investasi bodong tanpa izin OJK/Bappebti, atau bertentangan dengan hukum yang berlaku di Republik Indonesia. Pemasangan iklan tidak memengaruhi independensi peliputan dan penilaian editorial kami.
        </p>
        <p>
          Untuk mendapatkan <strong>Media Kit lengkap, Rate Card, dan proposal kerja sama</strong>, silakan menghubungi divisi periklanan kami:
        </p>
        <ul style="list-style:none; padding:0; margin:1rem 0; font-size:0.92rem; line-height:1.8;">
          <li>Surel Bisnis: <a href="mailto:redaksi@queryindo.com" style="color:var(--text-primary); font-weight:700;">redaksi@queryindo.com</a></li>
          <li>WhatsApp Komersial: <a href="https://wa.me/62895323861966" target="_blank" style="color:var(--text-primary); font-weight:700;">+62 895-3238-61966</a></li>
          <li>Jam Layanan: Senin – Jumat, 09.00 – 17.00 WIB</li>
        </ul>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 6: Hubungi Kami & Kantor Redaksi
// ──────────────────────────────────────────────

function renderHubungiKami(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-contact-layout">
        <!-- Kolom Kiri: Alamat & Kontak Resmi -->
        <div>
          <div class="inst-sec-heading" style="margin-top:0;">
            <h3 class="inst-sec-title">Kantor &amp; Alamat Korespondensi</h3>
          </div>

          <div class="inst-contact-channel-block">
            <h4>Kantor Redaksi</h4>
            <p>
              <strong>QUERYINDO Office</strong><br/>
              Jl. S. Parman No. 07, Cintamulya<br/>
              Kec. Candipuro, Kab. Lampung Selatan<br/>
              Lampung, Indonesia 35356
            </p>
          </div>

          <div class="inst-contact-channel-block">
            <h4>Badan Hukum Penyelenggara</h4>
            <p>
              PT Query Media Nusantara<br/>
              SK Kemenkumham: AHU-0091240.AH.01.01.TAHUN 2025
            </p>
          </div>

          <div class="inst-contact-channel-block">
            <h4>Surat Elektronik (Email)</h4>
            <p>
              Redaksi: <a href="mailto:redaksi@queryindo.com">redaksi@queryindo.com</a><br/>
              Hak Jawab / Koreksi: <a href="mailto:redaksi@queryindo.com">redaksi@queryindo.com</a>
            </p>
          </div>

          <div class="inst-contact-channel-block">
            <h4>Telepon &amp; WhatsApp Resmi</h4>
            <p>
              <a href="https://wa.me/62895323861966" target="_blank">+62 895-3238-61966</a>
            </p>
          </div>

          <div class="inst-contact-channel-block">
            <h4>Waktu Operasional Redaksi</h4>
            <p style="font-size:0.9rem; color:var(--text-secondary);">
              Senin – Jumat: 08.00 – 17.00 WIB<br/>
              Sabtu – Minggu: Piket Meja Berita Daring
            </p>
          </div>
        </div>

        <!-- Kolom Kanan: Formulir Pesan Resmi -->
        <div>
          <div class="inst-sec-heading" style="margin-top:0;">
            <h3 class="inst-sec-title">Formulir Pesan Redaksi</h3>
            <p class="inst-sec-subtitle">Sampaikan pertanyaan, permohonan klarifikasi, atau masukan kepada tim redaksi kami.</p>
          </div>

          <form id="inst-contact-form">
            <div class="inst-form-row">
              <div class="inst-form-group">
                <label for="cf-name">Nama Lengkap *</label>
                <input type="text" id="cf-name" class="inst-form-input" required />
              </div>
              <div class="inst-form-group">
                <label for="cf-email">Alamat Email *</label>
                <input type="email" id="cf-email" class="inst-form-input" required />
              </div>
            </div>

            <div class="inst-form-row">
              <div class="inst-form-group">
                <label for="cf-institution">Instansi / Organisasi</label>
                <input type="text" id="cf-institution" class="inst-form-input" />
              </div>
              <div class="inst-form-group">
                <label for="cf-category">Kategori Pesan *</label>
                <select id="cf-category" class="inst-form-select" required>
                  <option value="umum">Pertanyaan Umum</option>
                  <option value="hak-jawab">Permohonan Hak Jawab / Koreksi Berita</option>
                  <option value="iklan">Kerja Sama Periklanan &amp; Media Kit</option>
                  <option value="tips-liputan">Informasi Liputan &amp; Riset</option>
                </select>
              </div>
            </div>

            <div class="inst-form-group">
              <label for="cf-subject">Subjek Surat *</label>
              <input type="text" id="cf-subject" class="inst-form-input" required />
            </div>

            <div class="inst-form-group">
              <label for="cf-message">Isi Pesan *</label>
              <textarea id="cf-message" rows="5" class="inst-form-textarea" required placeholder="Tuliskan pokok informasi atau tautan artikel terkait jika mengajukan koreksi/hak jawab..."></textarea>
            </div>

            <button type="submit" class="inst-form-btn-submit">
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 7: Disclaimer (Penafian Legal)
// ──────────────────────────────────────────────

function renderDisclaimer(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-editorial-prose">
        <p>
          Seluruh isi dan materi yang disajikan di situs <strong>QUERYINDO</strong> (<code>queryindo.com</code>) dimaksudkan untuk tujuan pemberian informasi umum dan edukasi publik di bidang teknologi dan sains. Dengan mengakses portal ini, Anda menyatakan setuju terhadap ketentuan-ketentuan berikut:
        </p>
      </div>

      <div>
        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">1. Batasan Tanggung Jawab Informasi</h4>
          <p class="inst-legal-clause-text">
            QUERYINDO berupaya sebaik mungkin memastikan setiap data, fakta, dan ulasan yang diterbitkan akurat pada saat penulisan. Namun demikian, kami tidak memberikan jaminan mutlak atas kelengkapan dan kesesuaian informasi untuk keperluan bisnis atau keputusan investasi spesifik. Redaksi tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat penggunaan informasi dari situs ini.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">2. Bukan Nasihat Keuangan atau Investasi</h4>
          <p class="inst-legal-clause-text">
            Artikel yang membahas valuasi startup, putaran pendanaan, aset kripto, kecerdasan buatan, maupun analisis pasar modal disajikan semata-mata sebagai produk jurnalistik informasi industri. Konten tersebut bukan merupakan nasihat keuangan, anjuran investasi, atau rekomendasi perdagangan aset resmi. Pembaca disarankan berkonsultasi dengan penasihat keuangan berlisensi sebelum mengambil keputusan finansial.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Hak Cipta &amp; Pengutipan (UU No. 28 Tahun 2014)</h4>
          <p class="inst-legal-clause-text">
            Seluruh artikel berita, laporan investigasi, foto jurnalistik, ilustrasi visual, dan tata letak grafis di situs ini dilindungi oleh Undang-Undang Republik Indonesia Nomor 28 Tahun 2014 tentang Hak Cipta. Dilarang menyalin, menyebarluaskan, atau mempublikasikan ulang materi QUERYINDO secara komersial tanpa izin tertulis dari penerbit. Pengutipan wajar diperbolehkan dengan kewajiban mencantumkan kredit dan tautan balik (hyperlink) aktif ke sumber aslinya.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">4. Perlindungan Data Pribadi (UU No. 27 Tahun 2022)</h4>
          <p class="inst-legal-clause-text">
            QUERYINDO menghormati hak privasi setiap pembaca dan berkomitmen mematuhi Undang-Undang Perlindungan Data Pribadi (UU PDP). Data yang dikirimkan melalui pendaftaran buletin surel atau formulir kontak hanya digunakan untuk keperluan komunikasi resmi redaksi dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan pemilik data.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">5. Transparansi Penggunaan Perangkat Komputasi</h4>
          <p class="inst-legal-clause-text">
            Redaksi QUERYINDO memegang kendali manusia (*human oversight*) penuh atas setiap produk berita yang dipublikasikan. Apabila terdapat alat bantu komputasi atau kecerdasan buatan yang digunakan untuk analisis data mentah atau visualisasi pendukung, redaksi akan menyatakannya secara transparan demi akuntabilitas kepada pembaca.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 8: Kebijakan Privasi & Perlindungan Data Pribadi (UU PDP No. 27/2022)
// ──────────────────────────────────────────────

function renderPrivasi(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "QUERYINDO menjunjung tinggi hak privasi pembaca. Kami tidak pernah dan tidak akan pernah menjual data pribadi pembaca kepada pialang data (data broker) maupun pihak ketiga manapun."
        </p>
        <span class="inst-statement-caption">Pernyataan Pelindungan Data Pribadi Redaksi QUERYINDO</span>
      </div>

      <div class="inst-editorial-prose">
        <p>
          Kebijakan Privasi ini menjelaskan komitmen <strong>PT Query Media Nusantara</strong> dalam mengumpulkan, mengelola, dan melindungi data pribadi Anda saat mengakses portal <code>queryindo.com</code>, aplikasi web (PWA), maupun layanan buletin digital kami, sesuai dengan amanat <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
        </p>
      </div>

      <div>
        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">1. Landasan Hukum &amp; Kepatuhan Regulasi</h4>
          <p class="inst-legal-clause-text">
            Pemrosesan data pribadi di QUERYINDO berlandaskan pada asas kepatuhan hukum, integritas, dan transparansi sebagaimana diatur dalam UU PDP No. 27/2022. QUERYINDO bertindak sebagai <em>Pengendali Data Pribadi</em> (Data Controller) atas data akun pembaca dan langganan surel buletin resmi.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">2. Data yang Kami Kumpulkan</h4>
          <p class="inst-legal-clause-text">
            <strong>a. Data Teknis &amp; Navigasi:</strong> Alamat IP yang telah dianonimkan (anonymized IP), jenis peramban (browser), sistem operasi, resolusi layar, dan waktu akses untuk keperluan diagnostik stabilitas server dan analisis performa membaca agregat.<br />
            <strong>b. Preferensi Antarmuka (Local Storage):</strong> Preferensi mode tampilan (terang/gelap), ukuran font baca, bookmark artikel, dan riwayat baca disimpan secara lokal di perangkat Anda (client-side storage) tanpa diunggah ke server kami.<br />
            <strong>c. Data Langganan Surel &amp; Interaksi:</strong> Alamat surel (email) yang Anda berikan secara sukarela saat mendaftar buletin teknologi atau mengisi formulir Hak Jawab dan kontak redaksi.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Kebijakan Cookie &amp; Penyimpanan Lokal</h4>
          <p class="inst-legal-clause-text">
            Kami menggunakan cookie fungsional esensial untuk mengelola sesi login pembaca, mengingat persetujuan banner privasi, dan menjaga keamanan sistem dari serangan DDoS atau scraping otomatis. Kami tidak menyuntikkan cookie pelacak lintas situs (cross-site tracking cookies) pihak ketiga yang menginvasi privasi penjelajahan Anda.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">4. Hak-Hak Subjek Data Pribadi (Pembaca)</h4>
          <p class="inst-legal-clause-text">
            Berdasarkan Pasal 5 sampai dengan Pasal 13 UU PDP, Anda memiliki hak penuh untuk:<br />
            • Meminta konfirmasi dan salinan data pribadi yang tersimpan di sistem kami.<br />
            • Memperbaiki atau memperbarui data pribadi yang tidak akurat.<br />
            • Menghapus atau memusnahkan data pribadi Anda (<em>Right to Erasure / Right to be Forgotten</em>) kapan saja.<br />
            • Menarik kembali persetujuan penerimaan buletin berita cukup dengan mengeklik tautan 'Unsubscribe' di bagian bawah setiap surel.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">5. Pengamanan &amp; Enkripsi Data</h4>
          <p class="inst-legal-clause-text">
            Seluruh transmisi data antara peramban pembaca dan server QUERYINDO dienkripsi menggunakan protokol aman Transport Layer Security (TLS 1.3 dengan sertifikasi SHA-256). Basis data kami dilindungi oleh firewall berlapis, otentikasi token JWT terenkripsi, dan akses terbatas hanya untuk staf IT yang terikat perjanjian kerahasiaan (NDA).
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">6. Kontak Pejabat Pelindungan Data (DPO)</h4>
          <p class="inst-legal-clause-text">
            Apabila Anda memiliki pertanyaan, keberatan, atau ingin mengajukan permohonan penghapusan data pribadi Anda, silakan hubungi Pejabat Pelindungan Data kami melalui surel: <code>privacy@queryindo.com</code> atau melalui formulir surat resmi di halaman Hubungi Kami.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 9: Syarat & Ketentuan Penggunaan (Terms of Service)
// ──────────────────────────────────────────────

function renderSyaratKetentuan(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "QUERYINDO didirikan untuk menyebarkan literasi dan wawasan teknologi yang mencerahkan bangsa. Setiap interaksi di platform ini diatur oleh semangat saling menghormati, integritas akademik, dan kepatuhan terhadap hukum Republik Indonesia."
        </p>
        <span class="inst-statement-caption">Ketentuan Layanan &amp; Penggunaan Platform</span>
      </div>

      <div class="inst-editorial-prose">
        <p>
          Selamat datang di <strong>QUERYINDO</strong> (<code>queryindo.com</code>). Dengan mengakses, membaca, berinteraksi di kolom komentar, atau menggunakan layanan buletin kami, Anda menyetujui untuk terikat secara hukum oleh Syarat dan Ketentuan Penggunaan Layanan ini.
        </p>
      </div>

      <div>
        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">1. Hak Cipta &amp; Hak Kekayaan Intelektual (UU No. 28/2014)</h4>
          <p class="inst-legal-clause-text">
            Seluruh konten jurnalistik, laporan mendalam, analisis data, foto, video, kode sumber antarmuka, dan tata letak merek dagang QUERYINDO adalah hak milik intelektual eksklusif <strong>PT Query Media Nusantara</strong> atau pemegang lisensi resminya, yang dilindungi oleh Undang-Undang No. 28 Tahun 2014 tentang Hak Cipta.<br />
            <strong>Ketentuan Pengutipan:</strong> Pengutipan materi berita diperbolehkan maksimal 30% dari total artikel untuk keperluan edukasi, tinjauan pers, atau referensi riset, dengan kewajiban mutlak mencantumkan nama 'QUERYINDO' serta menyertakan tautan balik (hyperlink) aktif langsung menuju URL artikel asli.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">2. Larangan Scraping Otomatis &amp; Pelanggaran Sistem</h4>
          <p class="inst-legal-clause-text">
            Dilarang keras melakukan web scraping agresif, penarikan konten massal tanpa izin melalui bot/skrip otomatis yang membebani kapasitas server (DDoS), maupun upaya rekayasa balik (reverse-engineering) terhadap sistem backend QUERYINDO. Untuk sindikasi data terstruktur, silakan gunakan berkas resmi yang telah kami sediakan seperti <code>/rss.xml</code>, <code>/sitemap.xml</code>, dan <code>/feed.json</code> sesuai petunjuk <code>/robots.txt</code>.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Etika Kolom Komentar &amp; Partisipasi Pembaca</h4>
          <p class="inst-legal-clause-text">
            Kolom komentar pembaca adalah ruang diskusi publik yang konstruktif. Redaksi melarang keras komentar yang mengandung ujaran kebencian, pelecehan, ancaman kekerasan, diskriminasi SARA, fitnah, konten pornografi, penipuan finansial, atau tautan promosi judi daring dan malware. Redaksi berhak penuh menyaring, memoderasi, atau menghapus komentar yang melanggar hukum tanpa pemberitahuan sebelumnya.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">4. Tautan Eksternal &amp; Transparansi Kemitraan Komersial</h4>
          <p class="inst-legal-clause-text">
            Dalam liputan tinjauan produk gadget atau rekomendasi perangkat keras (hardware), portal QUERYINDO dapat menyertakan tautan belanja resmi (merchant) atau tautan afiliasi. QUERYINDO mungkin menerima komisi rujukan apabila pembaca membeli produk melalui tautan tersebut, tanpa menambah biaya bagi pembaca. Independensi penilaian dan objektivitas review redaksi tetap terjaga tanpa dipengaruhi oleh pihak pengiklan.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">5. Batasan Tanggung Jawab (Limitation of Liability)</h4>
          <p class="inst-legal-clause-text">
            QUERYINDO berupaya menjaga agar situs web dapat diakses 24 jam sehari dengan performa tinggi. Namun, kami tidak bertanggung jawab atas gangguan teknis di luar kendali wajar kami (force majeure), seperti kegagalan jaringan telekomunikasi global, pemeliharaan darurat infrastruktur komputasi awan, atau peretasan siber massal.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">6. Hukum yang Mengatur &amp; Penyelesaian Sengketa</h4>
          <p class="inst-legal-clause-text">
            Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia. Setiap sengketa terkait produk pemberitaan jurnalistik diselesaikan terlebih dahulu melalui mekanisme Hak Jawab dan Mediasi Dewan Pers sesuai UU Pers No. 40/1999. Sengketa non-jurnalistik yang tidak mencapai kesepakatan mufakat akan diselesaikan melalui yurisdiksi Pengadilan Negeri Jakarta Pusat.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 10: Peta Situs (Interactive Site Directory)
// ──────────────────────────────────────────────

function renderPetaSitus(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-editorial-prose">
        <p>
          Selamat datang di <strong>Peta Situs Resmi QUERYINDO</strong>. Halaman direktori ini dirancang untuk memudahkan navigasi pembaca dan perayapan mesin pencari dalam menelusuri seluruh kanal berita teknologi, indeks topik khusus, transparansi institusi pers, serta berkas umpan sindikasi XML.
        </p>
      </div>

      <div class="inst-sitemap-grid">
        <!-- Card 1: Kanal Berita Teknologi -->
        <div class="inst-sitemap-card">
          <div class="inst-sitemap-card-header">
            <div class="inst-sitemap-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <h3 class="inst-sitemap-card-title">Kanal Berita Teknologi</h3>
          </div>
          <ul class="inst-sitemap-list">
            <li class="inst-sitemap-item"><a href="/" class="inst-sitemap-link"><span>Beranda Berita Terkini</span><span class="inst-sitemap-badge">Home</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/ai" class="inst-sitemap-link"><span>Kecerdasan Buatan (AI &amp; LLM)</span><span class="inst-sitemap-badge">Kanal</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/gadget" class="inst-sitemap-link"><span>Gadget &amp; Inovasi Perangkat</span><span class="inst-sitemap-badge">Kanal</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/cybersecurity" class="inst-sitemap-link"><span>Keamanan Siber &amp; Enkripsi</span><span class="inst-sitemap-badge">Kanal</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/startup" class="inst-sitemap-link"><span>Startup &amp; Bisnis Digital</span><span class="inst-sitemap-badge">Kanal</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/policy" class="inst-sitemap-link"><span>Kebijakan Digital &amp; UU PDP</span><span class="inst-sitemap-badge">Kanal</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/telecom" class="inst-sitemap-link"><span>Telekomunikasi (5G/6G)</span><span class="inst-sitemap-badge">Kanal</span></a></li>
            <li class="inst-sitemap-item"><a href="/kategori/developer" class="inst-sitemap-link"><span>Kolektif Developer &amp; Cloud</span><span class="inst-sitemap-badge">Kanal</span></a></li>
          </ul>
        </div>

        <!-- Card 2: Kelembagaan Pers & Regulasi E-E-A-T -->
        <div class="inst-sitemap-card">
          <div class="inst-sitemap-card-header">
            <div class="inst-sitemap-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="inst-sitemap-card-title">Institusi Pers &amp; Legal</h3>
          </div>
          <ul class="inst-sitemap-list">
            <li class="inst-sitemap-item"><a href="/page/tentang-kami" class="inst-sitemap-link"><span>Tentang Kami (Profil Redaksi)</span><span class="inst-sitemap-badge">Info</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/redaksi" class="inst-sitemap-link"><span>Susunan Redaksi (Masthead)</span><span class="inst-sitemap-badge">UU Pers</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/kode-etik" class="inst-sitemap-link"><span>Kode Etik Jurnalistik (KEJ)</span><span class="inst-sitemap-badge">Etika</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/pedoman-media-siber" class="inst-sitemap-link"><span>Pedoman Pemberitaan Media Siber</span><span class="inst-sitemap-badge">Dewan Pers</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/privasi" class="inst-sitemap-link"><span>Kebijakan Privasi &amp; PDP</span><span class="inst-sitemap-badge">UU 27/22</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/syarat-ketentuan" class="inst-sitemap-link"><span>Syarat &amp; Ketentuan Penggunaan</span><span class="inst-sitemap-badge">Terms</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/disclaimer" class="inst-sitemap-link"><span>Disclaimer (Penafian Hukum)</span><span class="inst-sitemap-badge">Legal</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/info-iklan" class="inst-sitemap-link"><span>Info Iklan &amp; Media Kit</span><span class="inst-sitemap-badge">Komersial</span></a></li>
            <li class="inst-sitemap-item"><a href="/page/hubungi-kami" class="inst-sitemap-link"><span>Hubungi Redaksi &amp; Hak Jawab</span><span class="inst-sitemap-badge">Kontak</span></a></li>
          </ul>
        </div>

        <!-- Card 3: Berkas Mesin Pencari & Sindikasi -->
        <div class="inst-sitemap-card">
          <div class="inst-sitemap-card-header">
            <div class="inst-sitemap-card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
            </div>
            <h3 class="inst-sitemap-card-title">Mesin Pencari &amp; Sindikasi</h3>
          </div>
          <ul class="inst-sitemap-list">
            <li class="inst-sitemap-item"><a href="/sitemap.xml" target="_blank" rel="noopener" class="inst-sitemap-link"><span>Peta Situs Utama (Sitemap XML)</span><span class="inst-sitemap-badge">XML 0.9</span></a></li>
            <li class="inst-sitemap-item"><a href="/sitemap-news.xml" target="_blank" rel="noopener" class="inst-sitemap-link"><span>Google News Sitemap (48 Jam)</span><span class="inst-sitemap-badge">Google News</span></a></li>
            <li class="inst-sitemap-item"><a href="/rss.xml" target="_blank" rel="noopener" class="inst-sitemap-link"><span>RSS 2.0 Feed (PubSubHubbub)</span><span class="inst-sitemap-badge">RSS 2.0</span></a></li>
            <li class="inst-sitemap-item"><a href="/feed.json" target="_blank" rel="noopener" class="inst-sitemap-link"><span>JSON Feed 1.1 Specification</span><span class="inst-sitemap-badge">JSON</span></a></li>
            <li class="inst-sitemap-item"><a href="/robots.txt" target="_blank" rel="noopener" class="inst-sitemap-link"><span>Direktif Crawler (robots.txt)</span><span class="inst-sitemap-badge">Directives</span></a></li>
            <li class="inst-sitemap-item"><a href="/queryindo7a9f8b1c2d3e4f5a6b7c8d9e0.txt" target="_blank" rel="noopener" class="inst-sitemap-link"><span>Kunci IndexNow Protocol</span><span class="inst-sitemap-badge">IndexNow</span></a></li>
            <li class="inst-sitemap-item"><a href="/admin" class="inst-sitemap-link"><span>Portal Redaksi &amp; Login CMS</span><span class="inst-sitemap-badge">Admin</span></a></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Main Exported Class
// ──────────────────────────────────────────────

export class InstitutionalPages {
  public static getPageTitle(pageId: InstitutionalPageId, lang: 'id' | 'en'): string {
    return PAGE_METADATA[pageId]?.title[lang] ?? pageId;
  }

  public static getPageLead(pageId: InstitutionalPageId, lang: 'id' | 'en'): string {
    return PAGE_METADATA[pageId]?.lead[lang] ?? '';
  }

  public static getPageKicker(pageId: InstitutionalPageId, lang: 'id' | 'en'): string {
    return PAGE_METADATA[pageId]?.kicker[lang] ?? 'Informasi Perusahaan';
  }

  public static renderPage(pageId: InstitutionalPageId, lang: 'id' | 'en'): string {
    const title = this.getPageTitle(pageId, lang);
    const lead = this.getPageLead(pageId, lang);
    const kicker = this.getPageKicker(pageId, lang);
    const homeLabel = lang === 'en' ? 'Home' : 'Beranda';
    const backLabel = lang === 'en' ? 'Back to Home' : 'Kembali ke Beranda';

    let contentHTML = '';
    switch (pageId) {
      case 'tentang-kami': contentHTML = renderTentangKami(); break;
      case 'hubungi-kami': contentHTML = renderHubungiKami(); break;
      case 'kode-etik': contentHTML = renderKodeEtik(); break;
      case 'redaksi': contentHTML = renderRedaksi(); break;
      case 'pedoman-media-siber': contentHTML = renderPedomanMediaSiber(); break;
      case 'disclaimer': contentHTML = renderDisclaimer(); break;
      case 'info-iklan': contentHTML = renderInfoIklan(); break;
      case 'privasi': contentHTML = renderPrivasi(); break;
      case 'syarat-ketentuan': contentHTML = renderSyaratKetentuan(); break;
      case 'peta-situs': contentHTML = renderPetaSitus(); break;
    }

    // Authentic Editorial Tab Navigation
    const tabsHTML = `
      <div class="inst-nav-tabs-wrapper">
        <nav class="inst-nav-tabs" aria-label="Navigasi Informasi Perusahaan">
          ${NAVIGATION_TABS.map(tab => {
            const isActive = tab.id === pageId;
            return `
              <a href="/page/${tab.id}" class="inst-nav-tab ${isActive ? 'active' : ''}" data-page="${tab.id}">
                ${tab.iconSvg}
                <span>${tab.label[lang]}</span>
              </a>
            `;
          }).join('')}
        </nav>
      </div>
    `;

    return `
      <div class="inst-wrapper">
        <!-- Top Editorial Navigation Bar -->
        <div class="inst-topbar">
          <nav class="inst-breadcrumb" aria-label="Breadcrumb">
            <a href="/" class="inst-home-link">${homeLabel}</a>
            <span class="inst-breadcrumb-separator">/</span>
            <span>Informasi Perusahaan</span>
            <span class="inst-breadcrumb-separator">/</span>
            <span class="inst-breadcrumb-current">${title}</span>
          </nav>

          <div style="display:flex; align-items:center; gap:1.25rem;">
            <span class="inst-accreditation-note">Standar Perusahaan Pers Dewan Pers RI</span>
            <a href="/" class="inst-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              <span>${backLabel}</span>
            </a>
          </div>
        </div>

        <!-- Editorial Page Header -->
        <header class="inst-header">
          <span class="inst-header-kicker">${kicker}</span>
          <h1 class="inst-header-title">${title}</h1>
          <p class="inst-header-lead">${lead}</p>
        </header>

        <!-- Hub Tabs Navigation -->
        ${tabsHTML}

        <!-- Active Page Content -->
        <main id="inst-active-page-content">
          ${contentHTML}
        </main>
      </div>
    `;
  }

  public static isValidPageId(id: string): id is InstitutionalPageId {
    return id in PAGE_METADATA;
  }

  public static open(pageId: InstitutionalPageId, lang: 'id' | 'en'): void {
    const container = document.getElementById('institutional-page-container');
    const mainContent = document.querySelector('main.container') as HTMLElement | null;
    if (!container || !mainContent) return;

    mainContent.style.display = 'none';
    container.innerHTML = this.renderPage(pageId, lang);
    container.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.bindEvents(container, pageId, lang);
  }

  private static bindEvents(container: HTMLElement, pageId: InstitutionalPageId, lang: 'id' | 'en'): void {
    // 1. Back & Home navigation
    container.querySelectorAll('.inst-back-btn, .inst-home-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigateTo('/');
      });
    });

    // 2. Hub Navigation Tabs (Client-side routing)
    container.querySelectorAll('.inst-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = (tab as HTMLElement).getAttribute('data-page') as InstitutionalPageId;
        if (targetPage && targetPage !== pageId) {
          Router.navigateTo(`/page/${targetPage}`);
        }
      });
    });

    // 3. Contact Form Submission
    if (pageId === 'hubungi-kami') {
      const contactForm = container.querySelector('#inst-contact-form') as HTMLFormElement | null;
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = container.querySelector('#cf-name') as HTMLInputElement | null;
          const name = nameInput?.value.trim() || 'Pembaca';

          contactForm.reset();
          Toast.show(
            lang === 'en'
              ? `Thank you, ${name}. Your message has been received by QUERYINDO newsroom.`
              : `Terima kasih, ${name}. Pesan Anda telah diterima oleh Meja Redaksi QUERYINDO.`
          );
        });
      }
    }
  }

  public static close(): void {
    const container = document.getElementById('institutional-page-container');
    const mainContent = document.querySelector('main.container') as HTMLElement | null;
    if (!container || !mainContent) return;
    if (container.style.display === 'none') return;
    container.style.display = 'none';
    container.innerHTML = '';
    mainContent.style.display = '';
  }
}
