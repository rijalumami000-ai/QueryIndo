import { AuthorService, EDITORIAL_DIVISIONS, DEFAULT_AUTHORS } from '../services/authorService';
import { Toast } from '../utils/toast';
import { Router } from '../router/index';
import { CATEGORIES, MASTER_TAXONOMY } from '../data/mockNews';

export type InstitutionalPageId =
  | 'tentang-kami'
  | 'hubungi-kami'
  | 'kode-etik'
  | 'redaksi'
  | 'pedoman-media-siber'
  | 'pedoman-ai'
  | 'cek-fakta'
  | 'disclaimer'
  | 'info-iklan'
  | 'privasi'
  | 'syarat-ketentuan'
  | 'panduan-komunitas'
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
  'pedoman-ai': {
    title: { id: 'Pedoman Transparansi AI & Etika Redaksi', en: 'AI Editorial Guidelines' },
    kicker: { id: 'Etika Komputasi', en: 'AI Policy' },
    lead: {
      id: 'Kebijakan resmi ruang redaksi QUERYINDO terkait penggunaan kecerdasan buatan, integritas jurnalistik, dan pengawasan manusia mutlak (Human-in-the-Loop).',
      en: 'Official QUERYINDO policy regarding artificial intelligence utilization, journalistic integrity, and strict human editorial oversight.'
    }
  },
  'cek-fakta': {
    title: { id: 'Cek Fakta & Standar Verifikasi', en: 'Fact Check & Verification' },
    kicker: { id: 'Integritas Fakta', en: 'Fact Integrity' },
    lead: {
      id: 'Metodologi verifikasi fakta, pengujian klaim sains dan teknologi, serta prosedur klarifikasi independen berstandar Dewan Pers dan IFCN.',
      en: 'Fact-checking methodology, technological claims testing, and independent clarification procedures in adherence to Press Council and IFCN standards.'
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
  'panduan-komunitas': {
    title: { id: 'Panduan Komunitas & Etika Komentar', en: 'Community Guidelines' },
    kicker: { id: 'Partisipasi Publik', en: 'Community Standards' },
    lead: {
      id: 'Pedoman partisipasi pembaca, etika diskusi ilmiah, moderasi komentar, dan perlindungan ruang digital dari spam serta pelecehan.',
      en: 'Reader participation guidelines, constructive discourse standards, comment moderation, and digital safety rules.'
    }
  },
  'peta-situs': {
    title: { id: 'Peta Situs (Sitemap Direktori)', en: 'Site Directory' },
    kicker: { id: 'Direktori Konten', en: 'Content Index' },
    lead: {
      id: 'Peta navigasi terstruktur yang mencakup seluruh 14 kanal berita teknologi, 140 sub-kanal, direktori kelembagaan pers, serta berkas umpan sindikasi crawler.',
      en: 'Comprehensive site index covering all 14 technology desks, 140 subcategories, editorial policies, and search engine syndication feeds.'
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
    id: 'pedoman-ai',
    label: { id: 'Transparansi AI', en: 'AI Policy' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v2"/><path d="M15 1v2"/><path d="M9 21v2"/><path d="M15 21v2"/></svg>'
  },
  {
    id: 'cek-fakta',
    label: { id: 'Cek Fakta', en: 'Fact Check' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
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
    id: 'panduan-komunitas',
    label: { id: 'Komunitas', en: 'Community' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  },
  {
    id: 'disclaimer',
    label: { id: 'Disclaimer', en: 'Disclaimer' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
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
    id: 'peta-situs',
    label: { id: 'Peta Situs', en: 'Sitemap' },
    iconSvg: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  }
];

// ──────────────────────────────────────────────
// Page 1: Tentang Kami
// ──────────────────────────────────────────────
function renderTentangKami(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "QUERYINDO berkomitmen menyajikan jurnalisme teknologi yang jernih, faktual, dan independen. Di tengah laju perkembangan komputasi dan maraknya disinformasi digital, kami hadir memberikan ulasan mendalam yang mengutamakan kepentingan publik dan kemajuan sains nasional."
        </p>
        <span class="inst-statement-caption">Pernyataan Dewan Redaksi QUERYINDO</span>
      </div>

      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Profil &amp; Latar Belakang</h3>
        </div>
        <p>
          QUERYINDO (<code>queryindo.com</code>) didirikan di bawah naungan <strong>PT Query Media Nusantara</strong> oleh para jurnalis teknologi dan praktisi sistem informasi. Kami melihat pentingnya kehadiran media spesialis yang mampu membedah isu-isu teknologi mutakhir—seperti kecerdasan buatan, keamanan siber, komputasi awan, infrastruktur jaringan, dan kebijakan publik digital—dengan bahasa yang lugas, terverifikasi, dan berbobot.
        </p>
        <p>
          Dalam menjalankan kerja jurnalistik, redaksi QUERYINDO beroperasi secara independen, mematuhi Undang-Undang Republik Indonesia Nomor 40 Tahun 1999 tentang Pers, Kode Etik Jurnalistik, dan Pedoman Pemberitaan Media Siber yang ditetapkan Dewan Pers.
        </p>
      </div>

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
              <td>58130 (Aktivitas Penerbitan Surat Kabar &amp; Majalah) &amp; 63122 (Portal Web Berita)</td>
            </tr>
            <tr>
              <th>Domisili Kantor</th>
              <td>Candipuro, Lampung Selatan / Perwakilan Redaksi Jakarta</td>
            </tr>
            <tr>
              <th>Status Perusahaan Pers</th>
              <td>Memenuhi Standar Perusahaan Pers Dewan Pers Republik Indonesia</td>
            </tr>
          </tbody>
        </table>
      </div>

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
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 2: Susunan Redaksi (Masthead)
// ──────────────────────────────────────────────
function renderRedaksi(): string {
  const allAuthors = AuthorService.getAuthors();
  const authors = allAuthors.length > 0 ? allAuthors : DEFAULT_AUTHORS;

  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "Penyelenggaraan penerbitan pers ini dilaksanakan secara transparan dan bertanggung jawab sesuai amanat Pasal 12 Undang-Undang Nomor 40 Tahun 1999 tentang Pers."
        </p>
        <span class="inst-statement-caption">Boks Redaksi Resmi QUERYINDO</span>
      </div>

      ${EDITORIAL_DIVISIONS.map(division => {
        const divAuthors = authors.filter(a => a.division === division).sort((a, b) => (a.order || 0) - (b.order || 0));
        if (divAuthors.length === 0) return '';
        return `
          <div style="margin-top: 2rem;">
            <div class="inst-sec-heading">
              <h3 class="inst-sec-title">${division}</h3>
            </div>
            <div class="inst-authors-grid">
              ${divAuthors.map(author => `
                <div class="inst-author-card">
                  <div class="inst-author-avatar-wrap">
                    <img src="${author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}" alt="${author.name}" class="inst-author-avatar" loading="lazy" />
                  </div>
                  <div class="inst-author-info">
                    <h4 class="inst-author-name">${author.name}</h4>
                    <span class="inst-author-role">${author.role || 'Redaksi'}</span>
                    <p class="inst-author-bio">${author.bio || ''}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 3: Kode Etik Jurnalistik
// ──────────────────────────────────────────────
function renderKodeEtik(): string {
  const articles = [
    { num: 1, title: 'Independensi & Akurasi', desc: 'Wartawan Indonesia bersikap independen, menghasilkan berita yang akurat, berimbang, dan tidak beritikad buruk.' },
    { num: 2, title: 'Profesionalisme & Prosedur', desc: 'Wartawan Indonesia menempuh cara-cara yang profesional dalam melaksanakan tugas jurnalistik.' },
    { num: 3, title: 'Uji Informasi & Keberimbangan', desc: 'Wartawan Indonesia selalu menguji informasi, memberitakan secara berimbang, tidak mencampurkan fakta dan opini yang menghakimi, serta menerapkan asas praduga tak bersalah.' },
    { num: 4, title: 'Larangan Berita Bohong & Fitnah', desc: 'Wartawan Indonesia tidak membuat berita bohong, fitnah, sadis, dan cabul.' },
    { num: 5, title: 'Perlindungan Identitas Korban', desc: 'Wartawan Indonesia tidak menyebutkan dan menyiarkan identitas korban kejahatan susila dan tidak menyebutkan identitas anak yang menjadi pelaku kejahatan.' },
    { num: 6, title: 'Integritas & Larangan Suap', desc: 'Wartawan Indonesia tidak menyalahgunakan profesi dan tidak menerima suap.' },
    { num: 7, title: 'Hak Tolak & Perlindungan Narasumber', desc: 'Wartawan Indonesia memiliki Hak Tolak untuk melindungi narasumber yang tidak bersedia diketahui identitas maupun keberadaannya, menghargai ketentuan embargo, informasi latar belakang, dan off the record sesuai dengan kesepakatan.' },
    { num: 8, title: 'Non-Diskriminasi', desc: 'Wartawan Indonesia tidak menulis atau menyiarkan berita berdasarkan prasangka atau diskriminasi terhadap seseorang atas dasar perbedaan suku, ras, warna kulit, agama, jenis kelamin, dan bahasa serta tidak merendahkan martabat orang lemah, miskin, sakit, cacat jiwa atau cacat jasmani.' },
    { num: 9, title: 'Penghormatan Kehidupan Pribadi', desc: 'Wartawan Indonesia menghormati hak narasumber tentang kehidupan pribadinya, kecuali untuk kepentingan publik.' },
    { num: 10, title: 'Kewajiban Cabut & Koreksi', desc: 'Wartawan Indonesia segera mencabut, meralat, dan memperbaiki berita yang keliru dan tidak akurat disertai dengan permintaan maaf kepada pembaca, pendengar, dan atau pemirsa.' },
    { num: 11, title: 'Hak Jawab & Hak Koreksi', desc: 'Wartawan Indonesia melayani Hak Jawab dan Hak Koreksi secara proporsional.' }
  ];

  return `
    <div class="inst-content-body">
      <div class="inst-preamble-text">
        Kemerdekaan berpendapat, berekspresi, dan pers adalah hak asasi manusia yang dilindungi Pancasila, UUD 1945, dan Deklarasi Universal HAM PBB. Dalam mewujudkan kemerdekaan pers, wartawan Indonesia menyadari adanya tanggung jawab sosial untuk mematuhi <strong>Kode Etik Jurnalistik</strong> yang ditetapkan Dewan Pers.
      </div>

      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">11 Pasal Kode Etik Jurnalistik Dewan Pers</h3>
        </div>
        <div class="inst-kej-list">
          ${articles.map(art => `
            <div class="inst-kej-item">
              <div class="inst-kej-num">Pasal ${art.num}</div>
              <div class="inst-kej-content">
                <h4 class="inst-kej-title">${art.title}</h4>
                <p class="inst-kej-desc">${art.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div id="hak-jawab" style="margin-top: 3rem; scroll-margin-top: 5rem;">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Panduan Layanan Hak Jawab &amp; Hak Koreksi</h3>
          <p class="inst-sec-subtitle">Mekanisme resmi sesuai UU Pers No. 40/1999 bagi pihak yang merasa dirugikan oleh pemberitaan.</p>
        </div>
        <div class="inst-editorial-prose">
          <p>
            Berdasarkan Pasal 1 ayat (11) dan (12) UU Pers No. 40 Tahun 1999, pihak yang merasa dirugikan atau menemukan kekeliruan fakta dalam artikel QUERYINDO berhak mengajukan <strong>Hak Jawab</strong> atau <strong>Hak Koreksi</strong>.
          </p>
          <p>
            Permohonan Hak Jawab dapat dikirimkan melalui surat elektronik resmi ke: <a href="mailto:redaksi@queryindo.com" style="color:var(--text-primary); font-weight:700;">redaksi@queryindo.com</a> dengan menyertakan:
          </p>
          <ul class="inst-numbered-list">
            <li><span class="inst-list-num">•</span><span>Tautan (URL) dan judul artikel yang dimaksud.</span></li>
            <li><span class="inst-list-num">•</span><span>Bagian materi berita yang dinilai keliru atau merugikan.</span></li>
            <li><span class="inst-list-num">•</span><span>Penjelasan fakta yang benar beserta dokumen atau data pendukung.</span></li>
            <li><span class="inst-list-num">•</span><span>Identitas resmi pemohon (KTP/Surat Kuasa Instansi).</span></li>
          </ul>
          <p>
            Redaksi QUERYINDO akan memproses dan menayangkan Hak Jawab dalam waktu maksimal 2 × 24 jam setelah verifikasi data selesai dilakukan.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 4: Pedoman Media Siber
// ──────────────────────────────────────────────
function renderPedomanMediaSiber(): string {
  const clauses = [
    { title: '1. Ruang Lingkup', body: 'Media Siber adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers.' },
    { title: '2. Verifikasi dan Keberimbangan Berita', body: 'Pada prinsipnya setiap berita harus melalui verifikasi. Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.' },
    { title: '3. Isi Buatan Pengguna (User Generated Content)', body: 'Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan UU Pers dan Kode Etik Jurnalistik. Media siber wajib menyediakan sarana pengaduan isi buatan pengguna yang melanggar hukum.' },
    { title: '4. Ralat, Koreksi, dan Hak Jawab', body: 'Ralat, koreksi, dan hak jawab mengacu pada UU Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers. Ralat dan hak jawab wajib ditautkan pada berita yang diralat atau dikoreksi.' },
    { title: '5. Pencabutan Berita', body: 'Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, atau pertimbangan khusus yang ditetapkan Dewan Pers.' },
    { title: '6. Praktik Komersial & Iklan', body: 'Media siber wajib membedakan dengan tegas antara produk berita jurnalistik dan artikel advertorial/iklan berbayar dengan pelabelan yang jelas.' }
  ];

  return `
    <div class="inst-content-body">
      <div class="inst-preamble-text">
        Pedoman Pemberitaan Media Siber ditetapkan oleh Dewan Pers bersama organisasi pers pada 3 Februari 2012 di Jakarta (Peraturan Dewan Pers No. 1/Peraturan-DP/III/2012) sebagai acuan penegakan etika dan akuntabilitas pers digital Indonesia.
      </div>

      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Pokok Ketentuan Pedoman Pemberitaan Media Siber</h3>
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
// Page 5: Pedoman Transparansi AI & Etika Redaksi
// ──────────────────────────────────────────────
function renderPedomanAI(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "QUERYINDO meyakini bahwa kecerdasan buatan adalah alat bantu akselerasi, bukan pengganti integritas dan akuntabilitas jurnalis manusia. Setiap kata dan fakta yang kami terbitkan adalah tanggung jawab penuh redaktur manusia (Human-in-the-Loop)."
        </p>
        <span class="inst-statement-caption">Deklarasi Integritas AI Redaksi QUERYINDO</span>
      </div>

      <div>
        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">1. Pengawasan Manusia Mutlak (Human-in-the-Loop)</h4>
          <p class="inst-legal-clause-text">
            Perangkat Large Language Model (LLM) atau AI generatif hanya diizinkan sebagai asisten riset sekunder, seperti perangkum data dokumen mentah atau penyusun draf terjemahan awal. Tidak ada artikel yang ditulis, disunting, dan dipublikasikan secara otonom oleh AI tanpa kurasi, verifikasi fakta, dan persetujuan tertulis dari redaktur manusia.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">2. Kebijakan Anti-AI Slop &amp; Konten Sintetis Massal</h4>
          <p class="inst-legal-clause-text">
            QUERYINDO menolak dengan tegas produksi konten massal hasil sintesis instan (*AI Slop*) yang mengejar clickbait tanpa nilai jurnalistik orisinal. Setiap karya liputan kami harus memuat wawancara narasumber, analisis data primer, atau investigasi langsung di lapangan.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Pelabelan Transparan Konten &amp; Ilustrasi AI</h4>
          <p class="inst-legal-clause-text">
            Apabila terdapat ilustrasi visual konseptual atau rekonstruksi gambar yang dibuat dengan bantuan perangkat AI generator, redaksi wajib menyematkan label transparan <em>(Ilustrasi: AI Generated / Dibuat dengan Bantuan AI)</em> agar tidak menyesatkan pembaca.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">4. Perlindungan Hak Cipta &amp; Data Latih</h4>
          <p class="inst-legal-clause-text">
            Redaksi QUERYINDO menghormati hak cipta kreator, fotografer, dan pembuat konten asli. Kami tidak menggunakan model AI untuk menduplikasi gaya penulisan atau karya cipta pihak lain tanpa atribusi dan lisensi yang sah.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 6: Cek Fakta & Standar Verifikasi
// ──────────────────────────────────────────────
function renderCekFakta(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "QUERYINDO memegang prinsip verifikasi fakta tanpa kompromi. Di era melimpahnya klaim sensasional, hype pemasaran teknologi, dan disinformasi digital, redaksi kami hadir sebagai penyaring independen berbasis sains dan bukti empiris."
        </p>
        <span class="inst-statement-caption">Pernyataan Standar Verifikasi Fakta Redaksi QUERYINDO</span>
      </div>

      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Komitmen &amp; Metodologi Cek Fakta</h3>
        </div>
        <p>
          Meja Cek Fakta QUERYINDO beroperasi sesuai dengan prinsip non-partisan, independensi sumber, transparansi metodologi, dan keterbukaan koreksi yang selaras dengan standar <em>International Fact-Checking Network</em> (IFCN) serta Pedoman Pemberitaan Media Siber Dewan Pers.
        </p>
      </div>

      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Protokol Verifikasi 3 Lapis</h3>
          <p class="inst-sec-subtitle">Bagaimana kami menguji dan memvalidasi setiap klaim sebelum disajikan kepada pembaca.</p>
        </div>
        <div class="inst-split-grid">
          <div class="inst-column-block">
            <h4>1. Penelusuran Sumber Primer &amp; Kode</h4>
            <p>
              Kami mengutamakan dokumen primer: repositori kode sumber (GitHub/GitLab), whitepaper ilmiah peer-reviewed (arXiv/IEEE), data laporan keuangan resmi bursa efek (IDX/SEC), dan konfirmasi wawancara langsung narasumber kredibel.
            </p>
          </div>
          <div class="inst-column-block">
            <h4>2. Forensik Digital &amp; Lab Benchmark</h4>
            <p>
              Klaim kemampuan perangkat keras atau model AI diuji secara langsung di lingkungan pengujian independen. Analisis metadata visual dan spektroskopi digital digunakan untuk mendeteksi rekayasa media sintetis (deepfake).
            </p>
          </div>
          <div class="inst-column-block">
            <h4>3. Peer-Review Dewan Redaksi</h4>
            <p>
              Setiap artikel penelusuran fakta melalui tinjauan silang minimal 2 (dua) redaktur bidang teknologi sebelum penetapan kesimpulan fakta untuk memastikan objektivitas data.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Skala Penilaian Fakta Redaksi</h3>
        </div>
        <table class="inst-meta-table">
          <tbody>
            <tr>
              <th style="color:#10b981;">✓ Benar / Terverifikasi</th>
              <td>Klaim sepenuhnya akurat, didukung oleh data empiris, dokumentasi teknis, dan verifikasi sumber primer.</td>
            </tr>
            <tr>
              <th style="color:#f59e0b;">! Sebagian Benar</th>
              <td>Klaim mengandung unsur fakta, namun ada data krusial yang terlewat atau angka yang tidak sepenuhnya tepat.</td>
            </tr>
            <tr>
              <th style="color:#ec4899;">⚠ Konteks Menyesatkan</th>
              <td>Informasi faktual digunakan dalam konteks keliru untuk menggiring opini atau melebih-lebihkan kemampuan teknologi tertentu.</td>
            </tr>
            <tr>
              <th style="color:#ef4444;">✕ Salah / Hoaks Tekno</th>
              <td>Klaim sepenuhnya palsu, fabrikasi tanpa bukti, penipuan investasi, atau hasil manipulasi visual/deepfake.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Kanal Pelaporan Hoaks &amp; Masukan Pembaca</h3>
        </div>
        <p>
          Menemukan klaim teknologi atau produk digital yang mencurigakan di media sosial? Kirimkan tautan dan tangkapan layar kepada Meja Cek Fakta kami melalui surel: <a href="mailto:redaksi@queryindo.com" style="color:var(--text-primary); font-weight:700;">redaksi@queryindo.com</a> dengan subjek <code>[Cek Fakta Tekno]</code>.
        </p>
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
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 8: Info Iklan & Kemitraan
// ──────────────────────────────────────────────
function renderInfoIklan(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-editorial-prose">
        <p>
          QUERYINDO menyediakan ruang periklanan dan kemitraan strategis bagi instansi, perusahaan teknologi, dan penyedia solusi digital yang ingin menjangkau pembaca terdidik di Indonesia. Pembaca kami terdiri dari praktisi teknologi informasi, pendiri startup, pengembang perangkat lunak, peneliti kecerdasan buatan, investor, serta pembuat kebijakan publik.
        </p>
      </div>

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
            </ul>
          </div>

          <div class="inst-ad-format-card">
            <h4>Native Advertorial</h4>
            <p class="inst-ad-format-desc">
              Artikel informatif yang mengulas inovasi produk atau rilis korporat dengan sudut pandang jurnalisme teknologi.
            </p>
            <ul class="inst-ad-spec-list">
              <li>• Penulisan berstandar jurnalistik</li>
              <li>• Pelabelan transparan (Sponsored/Advertorial)</li>
              <li>• Distribusi di kanal berita dan buletin surel</li>
            </ul>
          </div>

          <div class="inst-ad-format-card">
            <h4>Kemitraan Acara &amp; Riset</h4>
            <p class="inst-ad-format-desc">
              Kolaborasi liputan mendalam untuk konferensi teknologi, peluncuran produk, dan laporan riset sektoral.
            </p>
            <ul class="inst-ad-spec-list">
              <li>• Media Partner resmi kegiatan teknologi</li>
              <li>• Seri artikel ulasan mendalam</li>
              <li>• Wawancara eksekutif dan pembuat kebijakan</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="inst-editorial-prose">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">Kontak Bisnis &amp; Kemitraan</h3>
        </div>
        <p>
          Untuk mendapatkan <strong>Media Kit lengkap, Rate Card, dan proposal kerja sama</strong>, silakan hubungi tim kemitraan kami:
        </p>
        <ul style="list-style:none; padding:0; margin:1rem 0; font-size:0.92rem; line-height:1.8;">
          <li>Surel Bisnis: <a href="mailto:redaksi@queryindo.com" style="color:var(--text-primary); font-weight:700;">redaksi@queryindo.com</a></li>
          <li>WhatsApp: <a href="https://wa.me/62895323861966" target="_blank" style="color:var(--text-primary); font-weight:700;">+62 895-3238-61966</a></li>
          <li>Jam Layanan: Senin – Jumat, 09.00 – 17.00 WIB</li>
        </ul>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 9: Hubungi Kami
// ──────────────────────────────────────────────
function renderHubungiKami(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-contact-layout">
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
        </div>

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
                  <option value="cek-fakta">Laporan Cek Fakta / Hoaks</option>
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
              <textarea id="cf-message" rows="5" class="inst-form-textarea" required placeholder="Tuliskan pokok informasi atau tautan artikel terkait..."></textarea>
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
// Page 10: Kebijakan Privasi
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
          Kebijakan Privasi ini menjelaskan komitmen <strong>PT Query Media Nusantara</strong> dalam mengumpulkan, mengelola, dan melindungi data pribadi Anda saat mengakses portal <code>queryindo.com</code>, sesuai dengan amanat <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
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
            <strong>a. Data Teknis &amp; Navigasi:</strong> Alamat IP yang telah dianonimkan, jenis peramban (browser), dan sistem operasi untuk keperluan diagnostik stabilitas server.<br />
            <strong>b. Preferensi Antarmuka (Local Storage):</strong> Preferensi mode tampilan (terang/gelap), ukuran font, dan bookmark tersimpan di perangkat lokal Anda.<br />
            <strong>c. Data Langganan Surel:</strong> Alamat surel yang Anda daftarkan secara sukarela untuk menerima buletin berita teknologi harian.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Hak-Hak Subjek Data Pribadi</h4>
          <p class="inst-legal-clause-text">
            Berdasarkan UU PDP, Anda berhak meminta salinan data pribadi Anda, memperbarui data yang tidak akurat, serta memohon penghapusan data (Right to be Forgotten) kapan saja melalui surel: <code>privacy@queryindo.com</code>.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 11: Syarat & Ketentuan Penggunaan
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

      <div>
        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">1. Hak Cipta &amp; Hak Kekayaan Intelektual (UU No. 28/2014)</h4>
          <p class="inst-legal-clause-text">
            Seluruh konten jurnalistik, laporan investigasi, analisis data, kode sumber, dan tata letak QUERYINDO adalah hak milik intelektual eksklusif <strong>PT Query Media Nusantara</strong> yang dilindungi oleh UU No. 28 Tahun 2014 tentang Hak Cipta. Pengutipan wajar diperbolehkan maksimal 30% untuk keperluan pendidikan/riset dengan wajib menyertakan kredit dan tautan balik aktif.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">2. Larangan Scraping Otomatis &amp; Penyerangan Sistem</h4>
          <p class="inst-legal-clause-text">
            Dilarang melakukan scraping data massal tanpa izin melalui bot/skrip otomatis yang membebani kapasitas server, serta dilarang melakukan rekayasa balik terhadap sistem backend QUERYINDO.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Penyelesaian Sengketa</h4>
          <p class="inst-legal-clause-text">
            Setiap sengketa terkait produk pemberitaan jurnalistik diselesaikan terlebih dahulu melalui mekanisme Hak Jawab dan Mediasi Dewan Pers sesuai UU Pers No. 40/1999.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 12: Panduan Komunitas & Etika Komentar
// ──────────────────────────────────────────────
function renderPanduanKomunitas(): string {
  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "Kolom komentar QUERYINDO adalah ruang publik bagi komunitas pengembang, akademisi, praktisi industri, dan pembaca umum untuk bertukar wawasan secara cerdas, santun, dan saling menghormati."
        </p>
        <span class="inst-statement-caption">Standar Komunitas &amp; Partisipasi Pembaca</span>
      </div>

      <div>
        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">1. Diskusi Ilmiah Berbasis Argumen</h4>
          <p class="inst-legal-clause-text">
            Kami menyambut kritik, perdebatan teknis, sanggahan data, dan pandangan alternatif yang disampaikan dengan argumen logis dan rujukan yang jelas. Berdebatlah mengenai substansi ide, bukan menyerang pribadi (*ad hominem*).
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">2. Larangan Ujaran Kebencian &amp; Diskriminasi SARA</h4>
          <p class="inst-legal-clause-text">
            Dilarang keras mempublikasikan komentar yang mengandung unsur diskriminasi suku, agama, ras, gender, ancaman kekerasan fisik, pelecehan seksual, maupun perundungan siber (*cyberbullying*).
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">3. Bebas Spam, Promosi Gelap &amp; Judi Online</h4>
          <p class="inst-legal-clause-text">
            Segala bentuk tautan promosi tidak sah, skema investasi ilegal, tautan phishing, malware, serta promosi situs judi daring akan langsung dihapus oleh sistem filter otomatis kami dan akun terkait akan diblokir permanen.
          </p>
        </div>

        <div class="inst-legal-clause">
          <h4 class="inst-legal-clause-title">4. Hak Moderasi Redaksi</h4>
          <p class="inst-legal-clause-text">
            Tim moderator QUERYINDO berhak menyunting, menyembunyikan, atau menghapus komentar yang melanggar panduan ini tanpa pemberitahuan sebelumnya, demi menjaga kenyamanan ruang dialog seluruh pembaca.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Page 13: Peta Situs (Comprehensive Matrix)
// ──────────────────────────────────────────────
function renderPetaSitus(): string {
  const categories14 = CATEGORIES.filter(c => c.id !== 'all');

  return `
    <div class="inst-content-body">
      <div class="inst-statement-box">
        <p class="inst-statement-text">
          "Peta Situs Resmi QUERYINDO menyajikan direktori lengkap 14 Kanal Berita Teknologi Utama, 140 Sub-Kanal Terkurasi, kebijakan institusional ruang redaksi, dan berkas sindikasi publik."
        </p>
        <span class="inst-statement-caption">Direktori Lengkap Arsitektur Informasi QUERYINDO</span>
      </div>

      <!-- Bagian 1: 14 Kanal Berita & 140 Sub-Kategori -->
      <div>
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">1. Direktori 14 Kanal &amp; 140 Sub-Kanal Berita Teknologi</h3>
          <p class="inst-sec-subtitle">Navigasi langsung ke seluruh kanal dan sub-kategori jurnalisme teknologi kami.</p>
        </div>
        <div class="inst-sitemap-taxonomy-grid">
          ${categories14.map(cat => {
            const subCats = MASTER_TAXONOMY[cat.id] || [];
            return `
              <div class="inst-sitemap-cat-block">
                <a href="/kategori/${cat.slug || cat.id}" class="inst-sitemap-cat-header">
                  <span class="inst-sitemap-cat-name">${cat.name}</span>
                  <span class="inst-sitemap-cat-count">${subCats.length} Sub-Kanal</span>
                </a>
                <p class="inst-sitemap-cat-desc">${cat.description}</p>
                <ul class="inst-sitemap-sub-list">
                  ${subCats.map(sub => `
                    <li>
                      <a href="/${cat.id}/${sub.slug}" class="inst-sitemap-sub-link">
                        ${sub.name}
                      </a>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Bagian 2: Kelembagaan Pers & Regulasi Jurnalistik -->
      <div style="margin-top: 3.5rem;">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">2. Kelembagaan Pers, Redaksi &amp; Standar Regulasi</h3>
          <p class="inst-sec-subtitle">Kepatuhan UU Pers No. 40/1999 dan Pedoman Media Siber Dewan Pers.</p>
        </div>
        <div class="inst-sitemap-institutions-grid">
          <div class="inst-sitemap-card">
            <h4 class="inst-sitemap-card-title">Standar Editorial &amp; Redaksi</h4>
            <ul class="inst-sitemap-list">
              <li class="inst-sitemap-item"><a href="/page/tentang-kami"><span>Tentang Kami (Profil Perusahaan Pers)</span><span class="inst-sitemap-badge">Profil</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/redaksi"><span>Susunan Redaksi (Masthead Resmi)</span><span class="inst-sitemap-badge">UU Pers</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/kode-etik"><span>Kode Etik Jurnalistik (11 Pasal KEJ)</span><span class="inst-sitemap-badge">Etika</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/pedoman-media-siber"><span>Pedoman Pemberitaan Media Siber</span><span class="inst-sitemap-badge">Dewan Pers</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/pedoman-ai"><span>Pedoman Transparansi AI Redaksi</span><span class="inst-sitemap-badge">AI Policy</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/cek-fakta"><span>Cek Fakta &amp; Standar Verifikasi</span><span class="inst-sitemap-badge">Fakta</span></a></li>
            </ul>
          </div>
          <div class="inst-sitemap-card">
            <h4 class="inst-sitemap-card-title">Layanan Publik &amp; Ketentuan Hukum</h4>
            <ul class="inst-sitemap-list">
              <li class="inst-sitemap-item"><a href="/page/hubungi-kami"><span>Hubungi Redaksi &amp; Ruang Berita</span><span class="inst-sitemap-badge">Kontak</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/kode-etik#hak-jawab"><span>Panduan Hak Jawab &amp; Koreksi Berita</span><span class="inst-sitemap-badge">Hak Jawab</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/panduan-komunitas"><span>Panduan Komunitas &amp; Etika Komentar</span><span class="inst-sitemap-badge">Komunitas</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/info-iklan"><span>Info Iklan &amp; Media Kit Kemitraan</span><span class="inst-sitemap-badge">Iklan</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/disclaimer"><span>Disclaimer (Penafian Hukum)</span><span class="inst-sitemap-badge">Penafian</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/privasi"><span>Kebijakan Privasi (Kepatuhan UU PDP)</span><span class="inst-sitemap-badge">UU PDP</span></a></li>
              <li class="inst-sitemap-item"><a href="/page/syarat-ketentuan"><span>Syarat &amp; Ketentuan Penggunaan Layanan</span><span class="inst-sitemap-badge">Ketentuan</span></a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bagian 3: Berkas Sindikasi Mesin Pencari -->
      <div style="margin-top: 3.5rem;">
        <div class="inst-sec-heading">
          <h3 class="inst-sec-title">3. Berkas Mesin Pencari &amp; Sindikasi Terbuka</h3>
          <p class="inst-sec-subtitle">Protokol perayapan web, feed XML, dan direktif crawler resmi.</p>
        </div>
        <div class="inst-sitemap-card" style="max-width: 100%;">
          <ul class="inst-sitemap-list">
            <li class="inst-sitemap-item"><a href="/sitemap.xml" target="_blank" rel="noopener"><span>Sitemap XML Utama (sitemap.xml)</span><span class="inst-sitemap-badge">XML 0.9</span></a></li>
            <li class="inst-sitemap-item"><a href="/sitemap-news.xml" target="_blank" rel="noopener"><span>Google News Sitemap 48 Jam (sitemap-news.xml)</span><span class="inst-sitemap-badge">Google News</span></a></li>
            <li class="inst-sitemap-item"><a href="/rss.xml" target="_blank" rel="noopener"><span>RSS 2.0 Global News Feed (rss.xml)</span><span class="inst-sitemap-badge">RSS 2.0</span></a></li>
            <li class="inst-sitemap-item"><a href="/robots.txt" target="_blank" rel="noopener"><span>Direktif Perayapan Web (robots.txt)</span><span class="inst-sitemap-badge">Directives</span></a></li>
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
      case 'pedoman-ai': contentHTML = renderPedomanAI(); break;
      case 'cek-fakta': contentHTML = renderCekFakta(); break;
      case 'disclaimer': contentHTML = renderDisclaimer(); break;
      case 'info-iklan': contentHTML = renderInfoIklan(); break;
      case 'privasi': contentHTML = renderPrivasi(); break;
      case 'syarat-ketentuan': contentHTML = renderSyaratKetentuan(); break;
      case 'panduan-komunitas': contentHTML = renderPanduanKomunitas(); break;
      case 'peta-situs': contentHTML = renderPetaSitus(); break;
    }

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

        <header class="inst-header">
          <span class="inst-header-kicker">${kicker}</span>
          <h1 class="inst-header-title">${title}</h1>
          <p class="inst-header-lead">${lead}</p>
        </header>

        ${tabsHTML}

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
    container.querySelectorAll('.inst-back-btn, .inst-home-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Router.navigateTo('/');
      });
    });

    container.querySelectorAll('.inst-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = (tab as HTMLElement).getAttribute('data-page') as InstitutionalPageId;
        if (targetPage && targetPage !== pageId) {
          Router.navigateTo(`/page/${targetPage}`);
        }
      });
    });

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
