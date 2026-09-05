export type CompanyPageType = 'about' | 'ethics' | 'careers' | 'ads' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'cyber-guidelines';

export class CompanyModal {
  public static renderCompanyModalHTML(type: CompanyPageType): string {
    const closeButtonHTML = `
      <button class="btn-close" id="company-modal-close" style="width: 2.2rem; height: 2.2rem; border-radius: 50%; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer; transition: all 0.2s;" aria-label="Close modal">✕</button>
    `;

    switch (type) {
      case 'about':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Corporate Profile</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Tentang Kami — QUERYINDO</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.75rem; font-size: 0.95rem; line-height: 1.7; color: var(--text-primary);">
              <p style="font-size: 1.1rem; color: var(--text-secondary); border-left: 3px solid var(--accent-cyan); padding-left: 1rem; font-weight: 500;">
                QUERYINDO merupakan portal berita teknologi dan informasi digital nasional di bawah naungan PT Query Media Nusantara. Kami menyajikan jurnalisme teknologi yang kredibel, akurat, dan berwawasan luas.
              </p>
              
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Struktur Dewan Redaksi</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                  <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; display: block;">Direktur Utama / CEO</span>
                    <strong style="display: block; font-size: 0.9rem; margin-top: 0.25rem; color: var(--text-primary);">Rijal Umami</strong>
                  </div>
                  <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; display: block;">Pemimpin Redaksi</span>
                    <strong style="display: block; font-size: 0.9rem; margin-top: 0.25rem; color: var(--text-primary);">Dian Prasetyo, M.T.</strong>
                  </div>
                  <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; display: block;">Dewan Penasihat AI</span>
                    <strong style="display: block; font-size: 0.9rem; margin-top: 0.25rem; color: var(--text-primary);">Prof. Dr. Irwan Hakim</strong>
                  </div>
                </div>
              </div>

              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Komitmen Keberlanjutan Data</h3>
                <p style="color: var(--text-secondary);">
                  Dalam ekosistem informasi yang bergerak cepat, kami berpegang pada tiga pilar utama: <strong>Independensi</strong> (tanpa afiliasi politik/korporasi), <strong>Ketajaman Analisis</strong> (jurnalisme investigatif), dan <strong>Edukasi Nasional</strong> (mendukung agenda transformasi digital nasional).
                </p>
              </div>

              <div style="display: flex; gap: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem; font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
                <span>No. SK Kemenkumham: AHU-0091240.AH.01.01</span>
                <span>•</span>
                <span>Terdaftar Dewan Pers: ID-2910-BIMN</span>
              </div>
            </div>
          </div>
        `;

      case 'ethics':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Journalistic Standards</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Kode Etik & Standar Jurnalistik</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.75rem; font-size: 0.95rem; line-height: 1.7; color: var(--text-primary);">
              <p style="color: var(--text-secondary);">
                Setiap konten, infografis, dan ulasan yang disajikan oleh QUERYINDO wajib menaati <strong>Kode Etik Jurnalistik Dewan Pers</strong> serta undang-undang yang berlaku di Republik Indonesia.
              </p>

              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Prinsip Kredibilitas Informasi</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  <div style="padding: 1rem; background: var(--bg-tertiary); border-left: 3px solid var(--accent-cyan); border-radius: 0 8px 8px 0;">
                    <strong style="display: block; color: var(--text-primary); margin-bottom: 0.25rem;">1. Uji Informasi Multi-Sumber</strong>
                    Informasi wajib diverifikasi sekurang-kurangnya ke tiga narasumber atau dokumen kredibel sebelum ditayangkan.
                  </div>
                  <div style="padding: 1rem; background: var(--bg-tertiary); border-left: 3px solid var(--accent-violet); border-radius: 0 8px 8px 0;">
                    <strong style="display: block; color: var(--text-primary); margin-bottom: 0.25rem;">2. Kebijakan Koreksi & Hak Jawab</strong>
                    Jika terjadi kesalahan data, redaksi berkewajiban mencantumkan ralat secara eksplisit dalam waktu kurang dari 2x24 jam setelah laporan diterima.
                  </div>
                  <div style="padding: 1rem; background: var(--bg-tertiary); border-left: 3px solid var(--accent-emerald); border-radius: 0 8px 8px 0;">
                    <strong style="display: block; color: var(--text-primary); margin-bottom: 0.25rem;">3. Transparansi Rekayasa AI</strong>
                    Semua gambar ilustrasi buatan AI wajib dilabeli watermark "Ilustrasi AI" dan mengadopsi standar enkripsi metadata C2PA.
                  </div>
                </div>
              </div>

              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Pengaduan Resmi</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  Kritik, saran, maupun hak jawab atas pemberitaan dapat dikirimkan langsung ke divisi kepatuhan redaksi kami melalui surel resmi: <code style="color: var(--accent-cyan); font-weight: bold;">ombudsman@queryindo.id</code>.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'careers':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Career Opportunities</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Karir & Magang Redaksi</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.95rem;">
              <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.5rem;">
                Kami mengundang talenta berdedikasi tinggi di bidang jurnalistik, rekayasa digital, dan riset teknologi untuk bergabung dalam mengembangkan platform media nasional kami.
              </p>

              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 250px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                      <span style="font-size: 0.7rem; font-weight: 800; background: rgba(0, 242, 254, 0.1); color: var(--accent-cyan); padding: 0.15rem 0.45rem; border-radius: 4px; font-family: var(--font-mono);">Jakarta Hub</span>
                      <h4 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">Senior Tech Investigative Journalist</h4>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">Bertanggung jawab melakukan investigasi mendalam isu keamanan siber nasional, audit infrastruktur digital negara, dan kebijakan telekomunikasi.</p>
                  </div>
                  <button style="padding: 0.5rem 1.2rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.8rem; cursor: pointer;" onclick="alert('Kirim berkas lamaran ke karir@queryindo.id')">Daftar Sekarang</button>
                </div>

                <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1.25rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 250px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                      <span style="font-size: 0.7rem; font-weight: 800; background: rgba(139, 92, 246, 0.1); color: var(--accent-violet); padding: 0.15rem 0.45rem; border-radius: 4px; font-family: var(--font-mono);">IKN Hub</span>
                      <h4 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">AI Research Analyst & Reviewer</h4>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">Melakukan evaluasi berkala terhadap model AI lokal, kinerja superkomputer nasional, dan implementasi teknologi ramah lingkungan di IKN.</p>
                  </div>
                  <button style="padding: 0.5rem 1.2rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.8rem; cursor: pointer;" onclick="alert('Kirim berkas lamaran ke karir@queryindo.id')">Daftar Sekarang</button>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'ads':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Advertising & Sponsorships</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Pengiklanan & Solusi Media</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.75rem; font-size: 0.95rem; line-height: 1.7;">
              <p style="color: var(--text-secondary);">
                QUERYINDO merupakan mitra strategis untuk memperluas jangkauan promosi merek Anda ke audiens terarah di segmen pengambil keputusan, eksekutif teknologi, akademisi, dan profesional IT Indonesia.
              </p>

              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Demografi Audiens Redaksi</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                  <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                    <div style="font-size: 1.45rem; font-weight: 800; color: var(--accent-cyan);">500k+</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Pembaca Bulanan</span>
                  </div>
                  <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                    <div style="font-size: 1.45rem; font-weight: 800; color: var(--accent-violet);">80.4%</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Rentang Usia 22-45</span>
                  </div>
                  <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                    <div style="font-size: 1.45rem; font-weight: 800; color: var(--accent-emerald);">65.2%</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Profesional IT / Founder</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Kontak Kemitraan Bisnis</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  Hubungi tim pemasaran bisnis kami untuk mendapatkan lembar data media kit resmi dan penawaran kerja sama eksklusif: <code style="color: var(--accent-cyan); font-weight: bold;">partnership@queryindo.id</code>.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'contact':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Corporate Locations</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Kontak Redaksi & Kantor Biro</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.95rem; line-height: 1.7;">
              <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md);">
                <span style="font-size: 0.65rem; font-weight: 800; background: rgba(0, 242, 254, 0.1); color: var(--accent-cyan); padding: 0.2rem 0.55rem; border-radius: 4px; font-family: var(--font-mono); text-transform: uppercase;">Headquarters</span>
                <h4 style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-top: 0.5rem; margin-bottom: 0.25rem;">Kantor Pusat Redaksi Jakarta</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  Gedung Cyber 2 Tower, Lt. 18, Kav. X-5 No. 13, Jl. H.R. Rasuna Said, Kuningan, Jakarta Selatan 12950<br />
                  Email Utama: <code style="color:var(--accent-cyan);">redaksi@queryindo.id</code><br />
                  Telepon Hubungan Media: (021) 555-8900
                </p>
              </div>

              <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md);">
                <span style="font-size: 0.65rem; font-weight: 800; background: rgba(139, 92, 246, 0.1); color: var(--accent-violet); padding: 0.2rem 0.55rem; border-radius: 4px; font-family: var(--font-mono); text-transform: uppercase;">IKN Bureau</span>
                <h4 style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-top: 0.5rem; margin-bottom: 0.25rem;">Biro Perwakilan Pusat Data Nasional (IKN)</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                  Pusat Data Nasional (PDN) Hub, Kawasan Inti Pusat Pemerintahan (KIPP), Sepaku, Kabupaten Penajam Paser Utara, Ibu Kota Nusantara (IKN).
                </p>
              </div>
            </div>
          </div>
        `;

      case 'privacy':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Privacy Policy</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Kebijakan Privasi & PDP</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.95rem; line-height: 1.7; overflow-y: auto; max-height: 60vh;">
              <p style="color: var(--text-secondary);">
                Kebijakan Privasi ini tunduk sepenuhnya pada <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> Republik Indonesia. Kami berkomitmen melindungi data pribadi pengguna platform QUERYINDO.
              </p>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">1. Data yang Kami Kumpulkan</h3>
                <p style="color: var(--text-secondary);">
                  Kami mengumpulkan data minimal yang diperlukan untuk pengoperasian platform, meliputi: alamat email (untuk newsletter), log aktivitas anonim, preferensi tema tampilan (cookies lokal), serta daftar artikel yang disimpan oleh pengguna.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">2. Hak Subjek Data Pribadi</h3>
                <p style="color: var(--text-secondary);">
                  Sesuai UU PDP, Anda memiliki hak penuh untuk mengakses kembali data Anda, meminta perbaikan, membatasi pemrosesan, atau meminta penghapusan permanen dari server kami dengan menghubungi kontak kepatuhan data.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">3. Keamanan Data</h3>
                <p style="color: var(--text-secondary);">
                  Setiap pengiriman informasi dilindungi oleh enkripsi SSL (Secure Sockets Layer). Kami tidak akan membagikan, menjual, atau mentransfer data pribadi Anda kepada pihak ketiga tanpa persetujuan eksplisit Anda.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'terms':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Terms of Service</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Syarat & Ketentuan Penggunaan</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.95rem; line-height: 1.7; overflow-y: auto; max-height: 60vh;">
              <p style="color: var(--text-secondary);">
                Dengan mengakses dan membaca informasi di platform media teknologi QUERYINDO, Anda menyatakan setuju dan tunduk pada syarat dan ketentuan di bawah ini.
              </p>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">1. Hak Kekayaan Intelektual</h3>
                <p style="color: var(--text-secondary);">
                  Seluruh artikel, teks naskah berita, infografis data perbandingan, dan tata letak visual di situs ini dilindungi Hak Cipta. Pengutipan materi wajib menyertakan kredit tulisan "Sumber: QUERYINDO" dan tautan balik aktif (backlink).
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">2. Penggunaan yang Diperbolehkan</h3>
                <p style="color: var(--text-secondary);">
                  Pengguna dilarang menggunakan data, API, atau konten QUERYINDO untuk tujuan komersial sepihak tanpa izin tertulis, atau menggunakan skrip otomatis (scraping) yang membebani kinerja server.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">3. Batasan Tanggung Jawab</h3>
                <p style="color: var(--text-secondary);">
                  Materi berita bersifat informatif dan edukatif. QUERYINDO tidak bertanggung jawab atas keputusan investasi, pembelian perangkat keras, atau konsekuensi keputusan bisnis yang diambil berdasarkan ulasan produk atau artikel kami.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'disclaimer':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Legal Notice</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Penafian (Disclaimer)</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.95rem; line-height: 1.7; overflow-y: auto; max-height: 60vh;">
              <p style="color: var(--text-secondary);">
                Dengan menggunakan platform QUERYINDO, Anda memahami dan menyetujui seluruh ketentuan penafian hukum di bawah ini:
              </p>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">1. Akurasi & Sifat Informasi</h3>
                <p style="color: var(--text-secondary);">
                  Seluruh informasi, data spesifikasi gadget, hasil benchmark, dan infografis yang disajikan di portal ini bersifat umum dan bertujuan untuk edukasi. Meskipun kami berusaha menjaga kemutakhiran data, QUERYINDO tidak memberikan jaminan mutlak atas keakuratan, kelengkapan, atau keandalan instan dari konten tersebut.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">2. Pihak Ketiga & Link Luar</h3>
                <p style="color: var(--text-secondary);">
                  Portal kami mungkin memuat tautan menuju situs web eksternal yang dikelola pihak ketiga. QUERYINDO tidak memiliki kendali penuh dan tidak bertanggung jawab atas kebijakan privasi, isi, atau transaksi yang terjadi di platform eksternal tersebut.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">3. Keputusan Finansial & Investasi</h3>
                <p style="color: var(--text-secondary);">
                  Ulasan teknologi, analisis startup, maupun data indeks tekno yang kami rilis bukanlah rekomendasi investasi atau saran profesional. Segala tindakan atau keputusan finansial/pembelian perangkat yang Anda ambil setelah membaca konten kami adalah tanggung jawab pribadi Anda secara mandiri.
                </p>
              </div>
            </div>
          </div>
        `;

      case 'cyber-guidelines':
        return `
          <div style="padding: 2.5rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem;">
              <div>
                <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--accent-cyan); letter-spacing: 0.15em; display: block; margin-bottom: 0.25rem;">Press Regulation</span>
                <h2 style="font-weight: 800; font-size: 1.6rem; color: var(--text-primary); font-family: var(--font-main);">Pedoman Pemberitaan Media Siber</h2>
              </div>
              ${closeButtonHTML}
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1.5rem; font-size: 0.95rem; line-height: 1.7; overflow-y: auto; max-height: 60vh;">
              <p style="color: var(--text-secondary);">
                Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Undang-Undang Nomor 40 Tahun 1999 tentang Pers.
              </p>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">1. Verifikasi dan Keberimbangan Berita</h3>
                <p style="color: var(--text-secondary);">
                  Setiap berita di QUERYINDO harus melalui proses verifikasi yang ketat. Berita yang dapat merugikan pihak lain memerlukan konfirmasi (keberimbangan) pada berita yang sama atau pada berita pembaruan berikutnya guna menjaga keadilan informasi.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">2. Konten Buatan Pengguna (User Generated Content)</h3>
                <p style="color: var(--text-secondary);">
                  Kolom komentar dan diskusi pembaca disediakan sebagai sarana interaksi warga digital. QUERYINDO tidak bertanggung jawab atas isi komentar pengguna, namun kami berhak memoderasi, menyunting, atau menghapus komentar yang mengandung unsur SARA, fitnah, pornografi, atau provokasi kekerasan.
                </p>
              </div>

              <div>
                <h3 style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.5rem;">3. Ralat, Koreksi, dan Hak Jawab</h3>
                <p style="color: var(--text-secondary);">
                  Ralat, koreksi, maupun hak jawab dilakukan atas permintaan pembaca atau atas inisiatif redaksi sendiri apabila ditemukan kekeliruan dalam penayangan naskah berita. Proses ralat akan ditautkan pada berita yang bersangkutan dengan keterangan koreksi yang jelas.
                </p>
              </div>
            </div>
          </div>
        `;
    }
  }
}
