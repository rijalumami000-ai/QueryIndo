import type { Article, Category, TechIndexItem } from '../types/news';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Semua Berita', icon: 'layers', description: 'Semua kabar & pembaruan teknologi terkini' },
  { id: 'ai', name: 'Kecerdasan Buatan', icon: 'cpu', description: 'Inovasi AI, LLM, Otomasi & Agentic Coding' },
  { id: 'gadget', name: 'Gadget & Inovasi', icon: 'smartphone', description: 'Review, rumor & rilis perangkat terbaru' },
  { id: 'cybersecurity', name: 'Keamanan Siber', icon: 'shield-alert', description: 'Perlindungan data, privasi & ancaman siber' },
  { id: 'startup', name: 'Startup & Bisnis', icon: 'trending-up', description: 'Ekosistem pendanaan, unicorn & inovasi bisnis' },
  { id: 'policy', name: 'Kebijakan Digital', icon: 'file-text', description: 'Regulasi pemerintah, PDP & infrastruktur nasional' },
  { id: 'telecom', name: 'Telekomunikasi', icon: 'radio', description: 'Jaringan 5G/6G, internet satelit & konektivitas' },
  { id: 'developer', name: 'Kolektif Developer', icon: 'code', description: 'Bahasa pemrograman, cloud & tren software engineering' }
];

export const TECH_INDEXES: TechIndexItem[] = [
  {
    symbol: 'IDXTECH', name: 'Indeks Tekno RI', value: '7,420.5', change: '+2.4%', isPositive: true,
    historicalData: [
      {time:'00:00',value:7245},{time:'01:00',value:7230},{time:'02:00',value:7218},{time:'03:00',value:7240},
      {time:'04:00',value:7260},{time:'05:00',value:7275},{time:'06:00',value:7310},{time:'07:00',value:7295},
      {time:'08:00',value:7330},{time:'09:00',value:7365},{time:'10:00',value:7340},{time:'11:00',value:7380},
      {time:'12:00',value:7350},{time:'13:00',value:7370},{time:'14:00',value:7395},{time:'15:00',value:7410},
      {time:'16:00',value:7385},{time:'17:00',value:7400},{time:'18:00',value:7390},{time:'19:00',value:7405},
      {time:'20:00',value:7415},{time:'21:00',value:7425},{time:'22:00',value:7418},{time:'23:00',value:7420}
    ]
  },
  {
    symbol: 'NVDA', name: 'NVIDIA Corp', value: '$138.25', change: '+3.8%', isPositive: true,
    historicalData: [
      {time:'00:00',value:133.2},{time:'01:00',value:133.0},{time:'02:00',value:132.8},{time:'03:00',value:133.1},
      {time:'04:00',value:133.5},{time:'05:00',value:133.9},{time:'06:00',value:134.4},{time:'07:00',value:134.1},
      {time:'08:00',value:134.8},{time:'09:00',value:135.6},{time:'10:00',value:135.2},{time:'11:00',value:136.0},
      {time:'12:00',value:135.7},{time:'13:00',value:136.3},{time:'14:00',value:136.8},{time:'15:00',value:137.2},
      {time:'16:00',value:136.9},{time:'17:00',value:137.5},{time:'18:00',value:137.1},{time:'19:00',value:137.6},
      {time:'20:00',value:137.9},{time:'21:00',value:138.1},{time:'22:00',value:138.0},{time:'23:00',value:138.25}
    ]
  },
  {
    symbol: 'BTC/IDR', name: 'Bitcoin', value: 'Rp 1.085B', change: '+1.9%', isPositive: true,
    historicalData: [
      {time:'00:00',value:1065},{time:'01:00',value:1060},{time:'02:00',value:1058},{time:'03:00',value:1062},
      {time:'04:00',value:1068},{time:'05:00',value:1070},{time:'06:00',value:1075},{time:'07:00',value:1072},
      {time:'08:00',value:1078},{time:'09:00',value:1080},{time:'10:00',value:1076},{time:'11:00',value:1082},
      {time:'12:00',value:1079},{time:'13:00',value:1081},{time:'14:00',value:1083},{time:'15:00',value:1085},
      {time:'16:00',value:1082},{time:'17:00',value:1084},{time:'18:00',value:1080},{time:'19:00',value:1083},
      {time:'20:00',value:1084},{time:'21:00',value:1086},{time:'22:00',value:1084},{time:'23:00',value:1085}
    ]
  },
  {
    symbol: 'AI-IDX', name: 'Global AI Index', value: '4,150.1', change: '+4.1%', isPositive: true,
    historicalData: [
      {time:'00:00',value:3985},{time:'01:00',value:3970},{time:'02:00',value:3960},{time:'03:00',value:3980},
      {time:'04:00',value:4005},{time:'05:00',value:4020},{time:'06:00',value:4050},{time:'07:00',value:4035},
      {time:'08:00',value:4070},{time:'09:00',value:4095},{time:'10:00',value:4080},{time:'11:00',value:4105},
      {time:'12:00',value:4090},{time:'13:00',value:4100},{time:'14:00',value:4115},{time:'15:00',value:4125},
      {time:'16:00',value:4110},{time:'17:00',value:4130},{time:'18:00',value:4120},{time:'19:00',value:4135},
      {time:'20:00',value:4140},{time:'21:00',value:4148},{time:'22:00',value:4145},{time:'23:00',value:4150}
    ]
  },
  {
    symbol: 'STARTUP-RI', name: 'Funding Vol', value: '$450M', change: '-0.5%', isPositive: false,
    historicalData: [
      {time:'00:00',value:455},{time:'01:00',value:456},{time:'02:00',value:457},{time:'03:00',value:455},
      {time:'04:00',value:454},{time:'05:00',value:453},{time:'06:00',value:452},{time:'07:00',value:454},
      {time:'08:00',value:453},{time:'09:00',value:451},{time:'10:00',value:452},{time:'11:00',value:450},
      {time:'12:00',value:451},{time:'13:00',value:449},{time:'14:00',value:450},{time:'15:00',value:451},
      {time:'16:00',value:450},{time:'17:00',value:449},{time:'18:00',value:450},{time:'19:00',value:451},
      {time:'20:00',value:450},{time:'21:00',value:449},{time:'22:00',value:450},{time:'23:00',value:450}
    ]
  },
  {
    symbol: 'NASDAQ', name: 'NASDAQ Composite', value: '16.730,20', change: '+1.8%', isPositive: true,
    historicalData: [
      {time:'00:00',value:16500},{time:'01:00',value:16520},{time:'02:00',value:16490},{time:'03:00',value:16530},
      {time:'04:00',value:16550},{time:'05:00',value:16580},{time:'06:00',value:16610},{time:'07:00',value:16590},
      {time:'08:00',value:16620},{time:'09:00',value:16650},{time:'10:00',value:16630},{time:'11:00',value:16670},
      {time:'12:00',value:16640},{time:'13:00',value:16660},{time:'14:00',value:16690},{time:'15:00',value:16710},
      {time:'16:00',value:16680},{time:'17:00',value:16700},{time:'18:00',value:16690},{time:'19:00',value:16705},
      {time:'20:00',value:16715},{time:'21:00',value:16725},{time:'22:00',value:16718},{time:'23:00',value:16730.2}
    ]
  },
  {
    symbol: 'GOTO', name: 'GoTo Gojek Tokopedia', value: 'Rp 53', change: '0.0%', isPositive: true,
    historicalData: [
      {time:'00:00',value:50},{time:'01:00',value:51},{time:'02:00',value:50},{time:'03:00',value:52},
      {time:'04:00',value:51},{time:'05:00',value:50},{time:'06:00',value:51},{time:'07:00',value:52},
      {time:'08:00',value:53},{time:'09:00',value:52},{time:'10:00',value:51},{time:'11:00',value:50},
      {time:'12:00',value:51},{time:'13:00',value:52},{time:'14:00',value:53},{time:'15:00',value:52},
      {time:'16:00',value:51},{time:'17:00',value:52},{time:'18:00',value:53},{time:'19:00',value:52},
      {time:'20:00',value:51},{time:'21:00',value:52},{time:'22:00',value:53},{time:'23:00',value:53}
    ]
  },
  {
    symbol: 'ETH/IDR', name: 'Ethereum', value: 'Rp 53.60M', change: '+1.2%', isPositive: true,
    historicalData: [
      {time:'00:00',value:52100000},{time:'01:00',value:52000000},{time:'02:00',value:51900000},{time:'03:00',value:52200000},
      {time:'04:00',value:52400000},{time:'05:00',value:52600000},{time:'06:00',value:52900000},{time:'07:00',value:52700000},
      {time:'08:00',value:53000000},{time:'09:00',value:53300000},{time:'10:00',value:53100000},{time:'11:00',value:53400000},
      {time:'12:00',value:53200000},{time:'13:00',value:53300000},{time:'14:00',value:53500000},{time:'15:00',value:53600000},
      {time:'16:00',value:53400000},{time:'17:00',value:53500000},{time:'18:00',value:53300000},{time:'19:00',value:53400000},
      {time:'20:00',value:53500000},{time:'21:00',value:53600000},{time:'22:00',value:53500000},{time:'23:00',value:53600000}
    ]
  },
  {
    symbol: 'USD/IDR', name: 'Kurs USD/IDR', value: 'Rp 16.254', change: '+0.2%', isPositive: true,
    historicalData: [
      {time:'00:00',value:16210},{time:'01:00',value:16215},{time:'02:00',value:16200},{time:'03:00',value:16220},
      {time:'04:00',value:16225},{time:'05:00',value:16230},{time:'06:00',value:16240},{time:'07:00',value:16235},
      {time:'08:00',value:16242},{time:'09:00',value:16248},{time:'10:00',value:16240},{time:'11:00',value:16250},
      {time:'12:00',value:16244},{time:'13:00',value:16246},{time:'14:00',value:16252},{time:'15:00',value:16254},
      {time:'16:00',value:16248},{time:'17:00',value:16250},{time:'18:00',value:16249},{time:'19:00',value:16251},
      {time:'20:00',value:16253},{time:'21:00',value:16255},{time:'22:00',value:16252},{time:'23:00',value:16254}
    ]
  }
];

export const ARTICLES: Article[] = [
  {
    id: 'art-001',
    title: 'Indonesia Resmi Operasikan Pusat Data Nasional Superkomputer AI Pertama di IKN',
    slug: 'pusat-data-nasional-superkomputer-ai-ikn',
    subtitle: 'Fasilitas komputasi tinggi berkapasitas 100 Petaflops ini disiapkan untuk mempercepat kemandirian kecerdasan buatan dan riset data nasional.',
    category: 'ai',
    tags: ['ArtificialIntelligence', 'IKN', 'Superkomputer', 'KedaulatanDigital', 'PemerintahRI'],
    author: {
      name: 'Raditya Pratama',
      role: 'Editor Senior Teknologi & Kebijakan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-08-01T08:30:00Z',
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ruang Server Pusat Data Nasional berpendingin cair (liquid cooling) modern di Ibu Kota Nusantara.',
    isFeatured: true,
    isTrending: true,
    isBreaking: true,
    isFactChecked: true,
    revisionHistory: [
      { date: '01 Ags 2026 10:15 WIB', note: 'Menambahkan rincian spesifikasi pendingin liquid cooling dari Kominfo.' }
    ],
    viewsCount: 42800,
    likesCount: 3120,
    aiSummary: [
      'Pusat Data Nasional (PDN) IKN resmi mengoperasikan klaster superkomputer AI berkapasitas 100 Petaflops.',
      'Fasilitas ini memprioritaskan pemrosesan Bahasa Indonesia (Large Language Model Nusantara) serta analisis kebencanaan real-time.',
      'Seluruh infrastruktur ditenagai 100% energi terbarukan dari Pembangkit Listrik Tenaga Surya (PLTS) IKN.'
    ],
    content: `
      <p class="lead"><strong>JAKARTA & IKN, QUERYINDO</strong> — Langkah besar menuju kedaulatan digital nasional resmi terwujud hari ini. Kementerian Komunikasi dan Informatika bersama Badan Riset dan Inovasi Nasional (BRIN) meresmikan beroperasinya <strong>Pusat Data Nasional (PDN) berteknologi Superkomputer AI</strong> pertama di Ibu Kota Nusantara (IKN).</p>

      <p>Superkomputer yang dinamai <em>"Ganesha-1"</em> ini mengusung arsitektur akselerator AI generasi terbaru dengan daya komputasi mencapai <strong>100 Petaflops</strong>. Fasilitas ini dirancang khusus untuk memproses volume data raksasa lintas kementerian, riset keanekaragaman hayati, hingga pelatihan Large Language Model (LLM) berbahasa daerah di Indonesia.</p>

      <h3>1. Pelatihan LLM Bahasa Daerah & Nusantara</h3>
      <p>Salah satu agenda prioritas utama keberadaan PDN IKN adalah mempercepat pengembangan AI lokal yang paham akan konteks budaya, hukum, dan bahasa di Indonesia. Proyek LLM Nusantara yang melibatkan konsorsium universitas ternama kini memiliki rumah komputasi mandiri tanpa tergantung server luar negeri.</p>

      <blockquote>
        "Keberadaan superkomputer ini bukan sekadar soal kebanggaan teknologi, melainkan fondasi utama agar data warga dan aset digital bangsa diproses secara mandiri di tanah air." 
        <cite>— Prof. Dr. Aris Munandar, Kepala Tim Peneliti AI Nasional</cite>
      </blockquote>

      <h3>2. Ramah Lingkungan dengan Liquid Cooling</h3>
      <p>Mengingat tingginya daya komputasi AI, PDN IKN memanfaatkan sistem <em>Direct-to-Chip Liquid Cooling</em> yang efisien. Penggunaan energi listrik didukung sepenuhnya oleh PLTS IKN 50 MW, menjadikannya salah satu Green Data Center Petaflops paling ramah lingkungan di Asia Tenggara.</p>

      <h3>3. Implikasi bagi Startup & Peneliti Lokal</h3>
      <p>Pemerintah membuka akses komputasi kuota khusus (credit-grant) bagi startup deep-tech dan peneliti independen Indonesia. Akses ini diharapkan mampu memangkas biaya riset pembuatan model AI hingga 70% dibandingkan menyewa instance cloud global.</p>
    `
  },
  {
    id: 'art-002',
    title: 'Starlink & Operator Seluler RI Sepakati Roaming Nasional: Bebas Blindspot di Pelosok 3T',
    slug: 'starlink-operator-seluler-ri-roaming-nasional',
    subtitle: 'Kolaborasi strategis sinyal seluler Direct-to-Cell menghadirkan konektivitas 5G hingga ke pelosok kepulauan Indonesia tanpa perlu ganti kartu SIM.',
    category: 'telecom',
    tags: ['Telekomunikasi', 'Starlink', '5G', 'InternetDesa', 'Konektivitas3T'],
    author: {
      name: 'Nabila Hapsari',
      role: 'Analis Telekomunikasi & Spektrum',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-08-01T07:15:00Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ilustrasi jaringan komunikasi satelit orbit rendah yang terhubung langsung ke perangkat seluler.',
    isFeatured: true,
    isTrending: true,
    isBreaking: false,
    viewsCount: 28900,
    likesCount: 1840,
    aiSummary: [
      'Operator konsorsium seluler Indonesia sepakat mengintegrasikan teknologi Direct-to-Cell berbasis satelit LEO.',
      'Pengguna tidak perlu membeli perangkat tambahan atau parabola; HP standar 4G/5G otomatis menangkap sinyal darurat saat berada di area tanpa tower BTS.',
      'Uji coba sukses dilakukan di kepulauan Natuna dan pedalaman Papua.'
    ],
    content: `
      <p class="lead"><strong>JAKARTA, QUERYINDO</strong> — Masalah area tanpa sinyal (blankspot) di kawasan 3T (Tertinggal, Terdepan, dan Terluar) Indonesia kini menemukan titik terang. Asosiasi Penyelenggara Telekomunikasi Seluruh Indonesia (ATSI) mengumumkan kesepakatan roaming nasional integrasi satelit LEO (Low Earth Orbit).</p>

      <p>Dengan teknologi <em>Direct-to-Cell</em>, ponsel pintar 4G/5G milik masyarakat secara otomatis dapat terhubung ke jaringan satelit ketika berada jauh dari jangkauan pemancar BTS darat.</p>

      <h3>Konektivitas Otomatis Tanpa Ganti SIM Card</h3>
      <p>Skema pengoperasian ini transparan bagi konsumen. Pengguna HP cukup mengaktifkan fitur data seluler seperti biasa. Ketika sistem mendeteksi hilangnya sinyal BTS terestrial selama lebih dari 30 detik, modem ponsel akan menyambung ke frekuensi satelit mitra.</p>

      <p>Langkah ini disambut hangat oleh para penggiat pariwisata bahari, nelayan tradisional, serta petugas medis lapangan yang kerap beraktivitas di daerah terpencil.</p>
    `
  },
  {
    id: 'art-003',
    title: 'RUU Kedaulatan AI Resmi Disahkan: Kewajiban Transparansi Algoritma & Watermark Konten Sintetis',
    slug: 'ruu-kedaulatan-ai-resmi-disahkan-pemerintah',
    subtitle: 'Regulasi baru menegaskan perlindungan hak cipta karya manusia, etika otomasi, dan hukuman berat bagi penyalahgunaan deepfake penipuan.',
    category: 'policy',
    tags: ['RegulasiAI', 'RUUKedaulatanAI', 'EtikaDigital', 'Deepfake', 'HukumTekno'],
    author: {
      name: 'Bima Sakti',
      role: 'Jurnalis Hukum & Regulasi Digital',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-08-01T06:00:00Z',
    readTimeMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ilustrasi regulasi teknologi digital dan keamanan hukum data di Indonesia.',
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
    viewsCount: 19500,
    likesCount: 1420,
    aiSummary: [
      'DPR RI mengetok palu pengesahan Undang-Undang Tata Kelola & Kedaulatan Kecerdasan Buatan.',
      'Semua platform digital wajib mencantumkan metadata/watermark tak kasat mata pada gambar, audio, dan video hasil buatan AI.',
      'Pengembang model AI besar wajib menyetorkan laporan audit keamanan bias sebelum merilis produk ke publik.'
    ],
    content: `
      <p class="lead"><strong>JAKARTA, QUERYINDO</strong> — Indonesia resmi menjadi negara pionir di Asia Tenggara yang memiliki Undang-Undang komprehensif mengatur etik dan operasional Kecerdasan Buatan. Sidang Paripurna DPR RI hari ini menyepakati pengesahan <em>RUU Kedaulatan Kecerdasan Buatan</em>.</p>

      <p>Undang-Undang ini berfokus pada tiga pilar utama: perlindungan privasi publik, kewajiban transparansi model generative AI, serta jaminan perlindungan bagi para pencipta konten orisinal dari penyedotan data tanpa izin (data scraping).</p>

      <h3>Wajib Watermark C2PA pada Media Sintetis</h3>
      <p>Setiap konten audio, gambar, maupun rekaman video yang dihasilkan oleh perangkat lunak Generative AI kini diwajibkan menyertakan standar lisensi metadata terenkripsi (C2PA). Hal ini bertujuan menekan maraknya modus penipuan kloning suara dan video <em>deepfake</em> tokoh publik.</p>
    `
  },
  {
    id: 'art-004',
    title: 'Review Snapdragon 8 Gen 5 di Flagship Lokal: Performa AI 45 TOPS & Baterai Efisiensi Ekstrem',
    slug: 'review-snapdragon-8-gen-5-flagship-lokal',
    subtitle: 'Pengujian mendalam chipset mobile terkini: rendering game 120 FPS tanpa panas berlebih dan pemrosesan LLM offline langsung di genggaman.',
    category: 'gadget',
    tags: ['Snapdragon', 'Gadget', 'ReviewHP', 'Flagship', 'Smartphone2026'],
    author: {
      name: 'Maya Indah',
      role: 'Reviewer Gadget & Lab Hardware',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-07-31T14:20:00Z',
    readTimeMinutes: 7,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Pengujian benchmark chipset mobile di laboratorium QUERYINDO.',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    viewsCount: 35100,
    likesCount: 2900,
    aiSummary: [
      'Snapdragon 8 Gen 5 menghadirkan peningkatan NPU hingga 45 TOPS untuk tugas AI On-Device.',
      'Suhu maksimal saat bermain game kelas berat konsisten di bawah 39°C berkat proses pabrikasi 2nm.',
      'Fitur terfavorit: Terjemahan bahasa lisan langsung dua arah tanpa koneksi internet.'
    ],
    content: `
      <p class="lead"><strong>JAKARTA, QUERYINDO</strong> — Pengujian berkala Lab Gadget QUERYINDO kembali kedatangan salah satu produk paling ditunggu tahun ini: Smartphone berbekal SoC Qualcomm Snapdragon 8 Gen 5.</p>

      <p>Chipset ini tidak hanya menjanjikan angka benchmark sintetis melambung tinggi, namun membawa lompatan nyata pada pemrosesan kecerdasan buatan langsung di perangkat (on-device AI) tanpa menguras baterai.</p>
    `
  },
  {
    id: 'art-005',
    title: 'Peringatan Tim BSSN: Gelombang Ransomware Generasi 4 Sasar Sektor Keuangan & Logistik',
    slug: 'peringatan-bssn-ransomware-generasi-4-sektor-keuangan',
    subtitle: 'Ancaman siber tipe baru ini memanfaatkan agen autonomous AI untuk memindai celah keamanan server hanya dalam hitungan detik.',
    category: 'cybersecurity',
    tags: ['CyberSecurity', 'BSSN', 'Ransomware', 'KeamananData', 'Perbankan'],
    author: {
      name: 'Raditya Pratama',
      role: 'Editor Senior Teknologi & Kebijakan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-07-31T11:00:00Z',
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Pusat pemantauan siber jaringan nasional mengawasi lalu lintas enkripsi paket data.',
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
    viewsCount: 22400,
    likesCount: 1150,
    aiSummary: [
      'BSSN merilis peringatan dini munculnya varian ransomware AI yang mampu beradaptasi menembus Firewall tradisional.',
      'Perusahaan disarankan menerapkan arsitektur Zero-Trust dan otentikasi biometrik berlapis.',
      'Tidak ada kasus kebocoran bank besar sejauh ini berkat penghentian darurat protokol enkripsi.'
    ],
    content: `
      <p class="lead"><strong>JAKARTA, QUERYINDO</strong> — Badan Siber dan Sandi Negara (BSSN) mengimbau seluruh divisi IT perusahaan publik, instansi perbankan, dan penyedia rantai pasok logistik di Indonesia untuk meningkatkan kewaspadaan tingkat tinggi.</p>

      <p>Laporan intelijen ancaman siber terbaru menunjukkan munculnya varian ransomware AI yang mampu melakukan eksploitasi celah keamanan secara mandiri dan cepat.</p>
    `
  },
  {
    id: 'art-006',
    title: 'Startup Climate-Tech Asal Bandung Raih Pendanaan Seri A $15 Juta untuk Baterai Garam',
    slug: 'startup-climate-tech-bandung-pendanaan-seri-a-baterai-garam',
    subtitle: 'Teknologi baterai natrium berbasis olahan garam lokal siap menjadi alternatif murah penyimpanan energi bersih PV matahari.',
    category: 'startup',
    tags: ['Startup', 'ClimateTech', 'Pendanaan', 'EnergiTerbarukan', 'InovasiBandung'],
    author: {
      name: 'Nabila Hapsari',
      role: 'Analis Telekomunikasi & Spektrum',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-07-30T16:45:00Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Pengembangan sel baterai Natrium buatan insinyur muda di Bandung.',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    viewsCount: 16800,
    likesCount: 1980,
    aiSummary: [
      'Startup "NusaVolt" memproduksi baterai Sodium-ion berbiaya 40% lebih murah dibanding Lithium.',
      'Suntikan dana Seri A sebesar $15 Juta dipimpin oleh konsorsium ventura hijau kawasan Asia.',
      'Pabrik komersial pertama akan dibangun di Karawang pada kuartal akhir tahun ini.'
    ],
    content: `
      <p class="lead"><strong>BANDUNG, QUERYINDO</strong> — Industri teknologi bersih Indonesia kembali mengukir prestasi berkelas dunia. Startup asal Bandung, NusaVolt, mengumumkan penerimaan pendanaan Seri A senilai US$ 15 Juta (sekitar Rp 245 Miliar).</p>

      <p>NusaVolt berhasil mengkomersialisasi Baterai Natrium-Ion (Sodium-Ion) dengan menggunakan turunan ekstrak garam industri lokal sebagai pengganti litium dan kobalt yang langka.</p>
    `
  },
  {
    id: 'art-007',
    title: 'Panduan Ekosistem TypeScript 5.8 & Go 1.26: Tren Stack Komputasi Fullstack Terbaru 2026',
    slug: 'panduan-ekosistem-typescript-go-fullstack-2026',
    subtitle: 'Mengapa kombinasi TypeScript untuk frontend dan Go untuk microservices menjadi standar emas rekayasa perangkat lunak modern.',
    category: 'developer',
    tags: ['Developer', 'TypeScript', 'Golang', 'SoftwareEngineering', 'WebDev'],
    author: {
      name: 'Bima Sakti',
      role: 'Jurnalis Hukum & Regulasi Digital',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    },
    publishedAt: '2026-07-30T09:10:00Z',
    readTimeMinutes: 8,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Tampilan editor kode dan arsitektur perangkat lunak berbasis Go dan TypeScript.',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    viewsCount: 14200,
    likesCount: 1670,
    aiSummary: [
      'TypeScript 5.8 memberikan peningkatan kecepatan pengecekan tipe data hingga 2x lipat.',
      'Go 1.26 memperkenalkan kompiler berbasis JIT opsional untuk skenario performa ekstrem.',
      'Perusahaan teknologi papan atas RI beralih ke stack ini demi efisiensi biaya infrastruktur cloud.'
    ],
    content: `
      <p class="lead"><strong>JAKARTA, QUERYINDO</strong> — Dalam dunia rekayasa perangkat lunak yang terus berevolusi pesat, efisiensi waktu eksekusi dan kecepatan pengembangan (*developer velocity*) adalah kunci utama keunggulan kompetitif.</p>

      <p>Tahun ini, sinergi antara <strong>TypeScript</strong> di sisi antarmuka pengguna dan <strong>Go (Golang)</strong> di sisi layanan data backend mengukuhkan posisinya sebagai arsitektur pilihan utama para Tech Lead di Indonesia.</p>
    `
  }
];
