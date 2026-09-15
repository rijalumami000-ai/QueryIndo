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
    id: 'art-official-01',
    title: 'CEO Anthropic Minta Pengembangan AI Diperlambat, Ini Alasannya',
    slug: 'ceo-anthropic-minta-pengembangan-ai-diperlambat-ini-alasannya',
    subtitle: 'Dario Amodei menilai perkembangan kemampuan AI bergerak terlalu cepat dibanding kesiapan sistem keselamatan. Ia menyerukan pengawasan independen dan koordinasi global agar kemajuan AI tidak memicu risiko eksistensial.',
    category: 'ai',
    author: {
      name: 'Rijal Umami',
      role: 'Founder & Pemimpin Redaksi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    },
    tags: ['AI', 'Anthropic', 'Claude', 'AI Safety', 'Regulasi'],
    publishedAt: '2026-09-15T08:30:00.000Z',
    readTimeMinutes: 9,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ilustrasi arsitektur mikroprosesor komputasi kecerdasan buatan.',
    isFeatured: true,
    isTrending: true,
    isBreaking: true,
    isFactChecked: true,
    viewsCount: 14250,
    likesCount: 42,
    aiSummary: [
      'CEO Anthropic Dario Amodei menyatakan kekhawatiran terhadap laju eksponensial kemampuan model AI yang melampaui mekanisme mitigasi risiko.',
      'Menyerukan pembentukan protokol pengujian keamanan independen sebelum model frontier generasi berikutnya dirilis ke publik.',
      'Menekankan pentingnya konsensus tata kelola internasional antara regulator pemerintah dan laboratorium riset AI.'
    ],
    content: `<p><strong>SAN FRANCISCO</strong> — Pemimpin eksekutif Anthropic, Dario Amodei, kembali menyuarakan peringatan keras mengenai kecepatan pengembangan model kecerdasan buatan (Artificial Intelligence/AI) generatif mutakhir. Dalam simposium tata kelola teknologi global baru-baru ini, Amodei menegaskan bahwa industri teknologi saat ini membutuhkan jeda terukur atau penurunan akselerasi pengembangan guna memastikan lapisan keamanan (safety benchmarks) teruji secara matang.</p>

<p>"Kita menyaksikan kurva kapabilitas model yang melompat setiap beberapa bulan, sementara instrumen evaluasi keselamatan, alignment, dan pencegahan penyalahgunaan otonom bergerak secara linear. Kesenjangan ini menciptakan kerentanan sistemik yang tidak boleh diabaikan," papar Amodei dalam keterangannya.</p>

<h3>Urgensi Pengawasan Independen dan Evaluasi Pihak Ketiga</h3>
<p>Anthropic, yang dikenal mengembangkan model bahasa Claude, mengusulkan standarisasi kerangka kerja evaluasi pihak ketiga yang diawasi oleh badan independen. Kerangka kerja ini mencakup pengujian ketat terhadap potensi model dalam memfasilitasi serangan siber otonom, manipulasi opini publik berskala masif, serta kemampuan replikasi diri tanpa kendali operator manusia.</p>

<p>Amodei juga menyoroti perlunya insentif industri yang tidak semata-mata didorong oleh perlombaan pasar komersial. Menurutnya, kepemimpinan AI sejati diukur dari seberapa tangguh suatu sistem menjaga keamanan data, privasi pengguna, dan stabilitas peradaban manusia saat diimplementasikan ke ranah publik.</p>`
  },
  {
    id: 'art-official-02',
    title: 'Indonesia Resmi Operasikan Pusat Data Nasional Superkomputer AI Pertama di IKN',
    slug: 'indonesia-resmi-operasikan-pusat-data-nasional-superkomputer-ai-pertama-di-ikn',
    subtitle: 'Fasilitas superkomputasi 120 Petaflops berbasis energi hijau di Ibu Kota Nusantara siap mempercepat kedaulatan riset nasional, model AI berbahasa daerah, dan layanan publik cerdas.',
    category: 'ai',
    author: {
      name: 'Rijal Umami',
      role: 'Founder & Pemimpin Redaksi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    },
    tags: ['IKN', 'Superkomputer', 'Data Center', 'Kedaulatan Digital', 'Infrastruktur'],
    publishedAt: '2026-09-14T14:15:00.000Z',
    readTimeMinutes: 7,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Pusat Data Nasional Berteknologi Pendingin Imersi Hijau di IKN.',
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
    isFactChecked: true,
    viewsCount: 11890,
    likesCount: 38,
    aiSummary: [
      'Pusat Data Nasional Superkomputer AI IKN berdaya 120 Petaflops resmi mulai beroperasi penuh.',
      'Didukung 100% pasokan energi terbarukan dari PLTS dan PLTA Nusantara.',
      'Membuka akses komputasi bagi 50+ perguruan tinggi dan startup AI dalam negeri.'
    ],
    content: `<p><strong>NUSANTARA</strong> — Langkah historis kedaulatan infrastruktur digital Indonesia resmi tercapai dengan peresmian Pusat Data Nasional (PDN) bertenaga Superkomputer AI terintegrasi di kawasan Ibu Kota Nusantara (IKN). Fasilitas ini dilengkapi dengan kluster komputasi terakselerasi berdaya 120 Petaflops yang menjadikannya salah satu infrastruktur komputasi publik terkuat di Asia Tenggara.</p>

<p>Infrastruktur ini didesain khusus untuk mendukung pemrosesan data skala nasional, pelatihan fondasi model bahasa lokal (LLM Bahasa Indonesia dan bahasa daerah), serta integrasi satu data antarkementerian yang aman dan terenkripsi secara penuh.</p>`
  },
  {
    id: 'art-official-03',
    title: 'NVIDIA Rilis Arsitektur GPU Generasi Baru, Efisiensi Energi Naik 4x Lipat',
    slug: 'nvidia-rilis-arsitektur-gpu-generasi-baru-efisiensi-energi-naik-4x-lipat',
    subtitle: 'Lompatan silikon semikonduktor terbaru menawarkan kemampuan inferensi model transformer raksasa dengan konsumsi daya operasional yang jauh lebih hemat.',
    category: 'gadget',
    author: {
      name: 'Deva Mahendra',
      role: 'Wakil Pemimpin Redaksi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    },
    tags: ['NVIDIA', 'Hardware', 'Semikonduktor', 'GPU', 'Efisiensi Energi'],
    publishedAt: '2026-09-13T10:00:00.000Z',
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Arsitektur chip silikon terakselerasi generasi mutakhir.',
    isFeatured: false,
    isTrending: true,
    isBreaking: false,
    isFactChecked: true,
    viewsCount: 8420,
    likesCount: 29,
    aiSummary: [
      'NVIDIA mengumumkan arsitektur chip AI generasi mutakhir dengan peningkatan efisiensi energi 4x lipat.',
      'Mengadopsi teknologi interkoneksi optical quantum untuk mengurangi latensi antar-rak server.',
      'Siap didistribusikan ke cloud hyperscaler global mulai kuartal IV 2026.'
    ],
    content: `<p><strong>SANTA CLARA</strong> — NVIDIA mengumumkan lompatan arsitektur silikon komputasi terbaru yang secara dramatis menaikkan efisiensi energi komputasi data center hingga empat kali lipat. Arsitektur ini dirancang untuk menjawab tantangan krisis pasokan daya listrik yang melanda pusat data global akibat ledakan adopsi kecerdasan buatan.</p>`
  },
  {
    id: 'art-official-04',
    title: 'BSSN Terbitkan Regulasi Enkripsi Pasca-Kuantum untuk Lindungi Infrastruktur Kritis Nasional',
    slug: 'bssn-terbitkan-regulasi-enkripsi-pasca-kuantum-untuk-lindungi-infrastruktur-kritis-nasional',
    subtitle: 'Standar kriptografi tahan serangan komputer kuantum diwajibkan bagi perbankan, telekomunikasi, dan instansi strategis negara mulai 2026.',
    category: 'cybersecurity',
    author: {
      name: 'Sarah Oktavia',
      role: 'Redaktur Finansial & Kebijakan Digital',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
    },
    tags: ['BSSN', 'Keamanan Siber', 'Post-Quantum', 'Kriptografi', 'PDP'],
    publishedAt: '2026-09-12T16:45:00.000Z',
    readTimeMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Perlindungan enkripsi siber pasca-kuantum untuk sektor strategis.',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    isFactChecked: true,
    viewsCount: 6510,
    likesCount: 24,
    aiSummary: [
      'BSSN menerbitkan peta jalan migrasi algoritma kriptografi pasca-kuantum (PQC).',
      'Sektor perbankan, telekomunikasi, dan energi wajib menerapkan standar enkripsi kisi kuantum.',
      'Langkah antisipasi terhadap ancaman dekripsi masa depan (Harvest Now, Decrypt Later).'
    ],
    content: `<p><strong>JAKARTA</strong> — Badan Siber dan Sandi Negara (BSSN) secara resmi mengundangkan kerangka regulasi implementasi algoritma Kriptografi Pasca-Kuantum (Post-Quantum Cryptography/PQC). Regulasi ini mewajibkan seluruh pengelola Penyelenggara Sistem Elektronik (PSE) sektor vital untuk memperbarui standar enkripsi kunci publik mereka.</p>`
  },
  {
    id: 'art-official-05',
    title: 'Ekosistem Startup DeepTech Indonesia Raih Pendanaan Seri B US$ 85 Juta',
    slug: 'ekosistem-startup-deeptech-indonesia-raih-pendanaan-seri-b-us-85-juta',
    subtitle: 'Investor global kian melirik inovasi bioteknologi dan otomasi cerdas buatan engineer dalam negeri yang memiliki paten internasional.',
    category: 'startup',
    author: {
      name: 'Sarah Oktavia',
      role: 'Redaktur Finansial & Kebijakan Digital',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
    },
    tags: ['Startup', 'DeepTech', 'Pendanaan', 'Venture Capital', 'Inovasi'],
    publishedAt: '2026-09-11T11:20:00.000Z',
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Kolaborasi riset industri dan pendanaan modal ventura teknologi mutakhir.',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    isFactChecked: true,
    viewsCount: 5240,
    likesCount: 19,
    aiSummary: [
      'Startup DeepTech lokal mengamankan pendanaan Seri B sebesar US$ 85 Juta dari konsorsium global.',
      'Pendanaan ditujukan untuk ekspansi pabrik manufaktur semikonduktor mikro dan riset sensor IoT.',
      'Membuktikan daya saing riset hardware dan rekayasa cerdas anak bangsa di panggung global.'
    ],
    content: `<p><strong>JAKARTA</strong> — Aliran modal ventura global ke kawasan Asia Tenggara menunjukkan pergeseran signifikan ke sektor rekayasa teknologi mendalam (DeepTech). Startup teknologi asal Indonesia berhasil mengamankan putaran pendanaan Seri B senilai US$ 85 Juta yang dipimpin oleh konsorsium investor Silicon Valley dan Asia Pasifik.</p>`
  },
  {
    id: 'art-official-06',
    title: 'Kemenkomdigi Rampungkan Uji Coba Spektrum 6G Terestrial di 5 Kota Metropolitan',
    slug: 'kemenkomdigi-rampungkan-uji-coba-spektrum-6g-terestrial-di-5-kota-metropolitan',
    subtitle: 'Latensi sub-milidetik dan kecepatan transfer terabit membuka era komputasi spasial dan komunikasi holografik tanpa hambatan di Indonesia.',
    category: 'telecom',
    author: {
      name: 'Deva Mahendra',
      role: 'Wakil Pemimpin Redaksi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
    },
    tags: ['Telekomunikasi', '6G', 'Kemenkomdigi', 'Jaringan', 'Konektivitas'],
    publishedAt: '2026-09-10T09:10:00.000Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Menara transmisi telekomunikasi generasi masa depan.',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    isFactChecked: true,
    viewsCount: 4920,
    likesCount: 17,
    aiSummary: [
      'Kemenkomdigi sukses menggelar uji coba lapangan frekuensi Terahertz untuk jaringan 6G.',
      'Mencapai kecepatan transmisi data 1,2 Terabit per detik dengan latensi 0,1 milidetik.',
      'Mempersiapkan peta jalan komersialisasi teknologi nirkabel generasi ke-6 pada akhir dekade ini.'
    ],
    content: `<p><strong>BANDUNG</strong> — Kementerian Komunikasi dan Digital (Kemenkomdigi) bersama konsorsium operator seluler dan perguruan tinggi teknik terkemuka sukses menuntaskan uji coba perdana transmisi gelombang Terahertz untuk jaringan seluler generasi ke-6 (6G) di lima kota metropolitan tanah air.</p>`
  }
];

