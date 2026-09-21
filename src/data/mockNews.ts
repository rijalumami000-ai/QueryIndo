import type { Article, Category, SubCategory, TechIndexItem } from '../types/news';

export const MASTER_TAXONOMY: Record<string, SubCategory[]> = {
  ai: [
    { id: 'gen-ai', name: 'Generatif AI & LLM', slug: 'gen-ai', description: 'Model penalaran, GPT, Claude, Gemini, Llama, DeepSeek' },
    { id: 'agentic-coding', name: 'Agentic AI & Koding Otonom', slug: 'agentic-coding', description: 'Autonomous agents, workflow automations, tool use' },
    { id: 'robotics-humanoid', name: 'Robotika & Humanoid Cerdas', slug: 'robotics-humanoid', description: 'Robot industri, bipedal humanoid, Tesla Optimus, Boston Dynamics' },
    { id: 'ai-chips-infra', name: 'Chipset AI & Superkomputer', slug: 'ai-chips-infra', description: 'NVIDIA GPU, TPU, NPU on-device, server rack, klaster komputasi' },
    { id: 'quantum-computing', name: 'Komputasi Kuantum & Fisika Komputasi', slug: 'quantum-computing', description: 'Qubit, error correction, simulasi kuantum' },
    { id: 'ethics-governance', name: 'Etika, Regulasi & AI Safety', slug: 'ethics-governance', description: 'AI Act, copyright data latih, alignment, mitigasi bias' },
    { id: 'computer-vision', name: 'Visi Komputer & Sintesis Media', slug: 'computer-vision', description: 'Video generator Sora, multimodal vision, pengenalan objek' },
    { id: 'enterprise-ai', name: 'AI Korporasi & Solusi Enterprise', slug: 'enterprise-ai', description: 'Integrasi ERP, database vektor, fine-tuning model internal' },
    { id: 'open-source-ai', name: 'Open Source AI & Komunitas Model', slug: 'open-source-ai', description: 'Hugging Face, model bobot terbuka, Ollama, local LLM' },
    { id: 'agi-frontier', name: 'AGI & Riset Perbatasan', slug: 'agi-frontier', description: 'Penelitian superintelligence, neuro-symbolic AI, riset akademis' }
  ],
  gadget: [
    { id: 'smartphones', name: 'Smartphone & Ponsel Lipat', slug: 'smartphones', description: 'Flagship, foldables, flip, mid-range, inovasi optik kamera' },
    { id: 'laptops-pc', name: 'Laptop, Mini PC & Workstation', slug: 'laptops-pc', description: 'MacBook, Windows Copilot+ PC, ultrabook, desktop' },
    { id: 'wearables-health', name: 'Smartwatch, Cincin Pintar & Pelacak Kebugaran', slug: 'wearables-health', description: 'Apple Watch, Garmin, Galaxy Ring, biosensor kebugaran' },
    { id: 'audio-sound', name: 'Audio Hi-Fi, TWS & Headphone', slug: 'audio-sound', description: 'Active noise cancellation, DAC, audiophile, spatial audio' },
    { id: 'tablets-ereaders', name: 'Tablet & Layar E-Ink', slug: 'tablets-ereaders', description: 'iPad, Android tablet produktif, Kindle, color e-ink' },
    { id: 'smart-home', name: 'Smart Home & Ekosistem IoT', slug: 'smart-home', description: 'Protokol Matter, robot vacuum, smart lock, ambient lighting' },
    { id: 'monitors-display', name: 'Monitor & Teknologi Display', slug: 'monitors-display', description: 'OLED 240Hz/360Hz, Mini-LED, color grading studio, ultra-wide' },
    { id: 'pc-components', name: 'Komponen PC, CPU & GPU Konsumen', slug: 'pc-components', description: 'Prosesor Intel/AMD/ARM, GPU konsumen, motherboard, RAM, SSD' },
    { id: 'charging-power', name: 'Pengisian Daya, GaN & Baterai Portabel', slug: 'charging-power', description: 'GaN charger 100W+, Qi2 wireless, power station outdoor' },
    { id: 'retro-niche-tech', name: 'Gadget Unik, Retro & Niche Gear', slug: 'retro-niche-tech', description: 'Kamera saku vintage, keyboard kustom mechanical, handheld retro' }
  ],
  software: [
    { id: 'mobile-apps', name: 'Aplikasi Mobile Android & iOS', slug: 'mobile-apps', description: 'Inovasi apps baru, navigasi, media sosial, kurasi mingguan' },
    { id: 'operating-systems', name: 'Sistem Operasi Desktop & Mobile', slug: 'operating-systems', description: 'Android, iOS, Windows 11, macOS, Linux desktop' },
    { id: 'productivity-saas', name: 'Produktivitas & Tools Kolaborasi', slug: 'productivity-saas', description: 'Notion, Obsidian, Slack, Google Workspace, project management' },
    { id: 'cloud-infrastructure', name: 'Komputasi Awan & DevOps', slug: 'cloud-infrastructure', description: 'AWS, GCP, Azure, Kubernetes, CI/CD, arsitektur serverless' },
    { id: 'dev-tools-frameworks', name: 'Bahasa Pemrograman & Framework', slug: 'dev-tools-frameworks', description: 'Rust, Go, TypeScript, React, Next.js, Python' },
    { id: 'browsers-search', name: 'Browser & Mesin Pencari Modern', slug: 'browsers-search', description: 'Chromium, Firefox, Arc, search engine berbasis AI' },
    { id: 'system-utility', name: 'Utilitas Sistem, Benchmark & Virtualisasi', slug: 'system-utility', description: 'Docker desktop, virtual machines, disk utility, terminal' },
    { id: 'api-backends', name: 'API, Basis Data & Backend Engineering', slug: 'api-backends', description: 'PostgreSQL, Supabase, Redis, GraphQL, ORM' },
    { id: 'open-source-software', name: 'Software FOSS & Ekosistem Bebas', slug: 'open-source-software', description: 'Lisensi open-source, proyek komunitas GitHub, alternatif mandiri' },
    { id: 'creative-software', name: 'Software Desain Grafis, Video & 3D', slug: 'creative-software', description: 'Figma, Adobe Creative Cloud, DaVinci Resolve, Blender' }
  ],
  startup: [
    { id: 'funding-vc', name: 'Pendanaan & Modal Ventura', slug: 'funding-vc', description: 'Seed, Series A-D, angel investor, venture debt, tren portofolio VC' },
    { id: 'unicorns-ipo', name: 'Unicorn, Decacorn & Pasar Saham IPO', slug: 'unicorns-ipo', description: 'Valuasi startup, prospek pencatatan bursa saham IDX/NASDAQ' },
    { id: 'big-tech', name: 'Big Tech & Dinamika Konglomerasi', slug: 'big-tech', description: 'Strategi raksasa: Apple, Microsoft, Alphabet, Meta, Amazon, Tencent' },
    { id: 'early-stage-founders', name: 'Founder Stories & Bootstrapping', slug: 'early-stage-founders', description: 'Kisah perjalanan pendiri awal, pencarian Product-Market Fit' },
    { id: 'business-models', name: 'Model Bisnis, Unit Economics & Monetisasi', slug: 'business-models', description: 'SaaS pricing, strategi profitabilitas, monetisasi platform' },
    { id: 'accelerator-incubator', name: 'Akselerator, Inkubator & Hub Startup', slug: 'accelerator-incubator', description: 'Y Combinator, program inkubasi nasional, demo day' },
    { id: 'ma-exits', name: 'Merger, Akuisisi & Exit Strategy', slug: 'ma-exits', description: 'Konsolidasi industri, buy-out, likuidasi aset, merger korporasi' },
    { id: 'tech-workforce', name: 'Ketenagakerjaan, Talenta & Budaya Kerja', slug: 'tech-workforce', description: 'Gaji insinyur software, layoff, budaya kerja remote, talent war' },
    { id: 'b2b-enterprise-tech', name: 'Startup B2B & Transformasi Korporat', slug: 'b2b-enterprise-tech', description: 'Solusi enterprise, pengadaan digital rantai pasok B2B' },
    { id: 'southeast-asia-ecosystem', name: 'Ekosistem Startup Asia Tenggara', slug: 'southeast-asia-ecosystem', description: 'Konektivitas Indonesia-Singapura-Vietnam, ekspansi regional' }
  ],
  fintech: [
    { id: 'digital-banking', name: 'Bank Digital & Neobank', slug: 'digital-banking', description: 'Fitur tabungan, bunga simpanan, onboarding biometrik, core banking' },
    { id: 'digital-payments', name: 'Pembayaran Digital, QRIS & Gerbang Bayar', slug: 'digital-payments', description: 'QRIS antarnegara, BI-FAST, e-wallet, payment gateway' },
    { id: 'crypto-bitcoin', name: 'Bitcoin & Dinamika Pasar Kripto', slug: 'crypto-bitcoin', description: 'Halving, ETF spot, on-chain metrics, sentimen makro kripto' },
    { id: 'ethereum-smart-contracts', name: 'Ethereum, Layer-2 & Smart Contract', slug: 'ethereum-smart-contracts', description: 'Arbitrum, Optimism, zkSync, ekosistem EVM' },
    { id: 'defi-lending', name: 'Keuangan Terdesentralisasi (DeFi) & Staking', slug: 'defi-lending', description: 'Liquidity pool, DEX, yield generation, protokol lending' },
    { id: 'tokenized-rwa', name: 'Aset Dunia Nyata Tertokenisasi (RWA)', slug: 'tokenized-rwa', description: 'Tokenisasi properti, sekuritas digital, komoditas emas token' },
    { id: 'stablecoins-cbdc', name: 'Stablecoin & Uang Digital Bank Sentral', slug: 'stablecoins-cbdc', description: 'USDT, USDC, Rupiah Digital/CBDC, regulasi cadangan aset' },
    { id: 'p2p-lending-bnpl', name: 'Pinjaman Digital, P2P Lending & Paylater', slug: 'p2p-lending-bnpl', description: 'Credit scoring alternatif AI, BNPL, pendanaan UMKM' },
    { id: 'insurtech-wealthtech', name: 'Investasi Digital & Asuransi Pintar', slug: 'insurtech-wealthtech', description: 'Reksa dana mikro, saham fraksional luar negeri, robo-advisor' },
    { id: 'regtech-anti-fraud', name: 'Kepatuhan Regulasi (OJK/BI), AML & Anti-Fraud', slug: 'regtech-anti-fraud', description: 'KYC biometrik, mitigasi penipuan transaksi keuangan' }
  ],
  ev: [
    { id: 'electric-cars', name: 'Mobil Penumpang Listrik', slug: 'electric-cars', description: 'EV Sedan, SUV, City Car, uji efisiensi daya, impresi berkendara' },
    { id: 'two-wheelers-motorcycle', name: 'Motor Listrik & Skuter Komuter', slug: 'two-wheelers-motorcycle', description: 'Motor listrik subsidi, konversi mesin bakar, motor komuter' },
    { id: 'commercial-fleet', name: 'Armada Komersial, Truk & Bus Listrik', slug: 'commercial-fleet', description: 'Bus rapid transit listrik, armada ekspedisi logistik hijau' },
    { id: 'battery-tech', name: 'Teknologi Sel Baterai EV & Rantai Pasok', slug: 'battery-tech', description: 'LFP, NMC, Solid-state, hilirisasi nikel untuk baterai EV' },
    { id: 'charging-infra-spklu', name: 'SPKLU, Ultra Fast Charging & Swap Station', slug: 'charging-infra-spklu', description: 'Infrastruktur pengisian daya umum, stasiun tukar baterai' },
    { id: 'autonomous-adas', name: 'Kemudi Otonom & Teknologi Sensor ADAS', slug: 'autonomous-adas', description: 'Level 2-4 autonomy, LiDAR, kamera computer vision otomotif' },
    { id: 'in-car-software-sdv', name: 'Software-Defined Vehicle & Sistem Operasi Mobil', slug: 'in-car-software-sdv', description: 'Android Automotive, infotainment, pembaruan OTA mobil' },
    { id: 'micromobility', name: 'Sepeda Listrik, Skuter & Mobilitas Mikro', slug: 'micromobility', description: 'E-bike jarak menengah, mobilitas first/last mile' },
    { id: 'v2x-smart-grid', name: 'Integrasi Kendaraan ke Rumah (V2G/V2L)', slug: 'v2x-smart-grid', description: 'Pemanfaatan daya baterai mobil untuk cadangan listrik darurat' },
    { id: 'alternative-clean-mobility', name: 'Mobilitas Hidrogen & Bahan Bakar Nol Emisi', slug: 'alternative-clean-mobility', description: 'Fuel cell hydrogen EV, e-fuels ramah lingkungan untuk transportasi' }
  ],
  gaming: [
    { id: 'game-releases-reviews', name: 'Ulasan & Rilis Game AAA Multiplatform', slug: 'game-releases-reviews', description: 'Review gameplay, skor performa game, ulasan judul blockbuster PC/Konsol' },
    { id: 'console-ecosystem', name: 'Ekosistem Konsol Game', slug: 'console-ecosystem', description: 'PlayStation, Xbox, Nintendo, langganan Game Pass/PS Plus' },
    { id: 'mobile-handheld', name: 'Game Mobile & Handheld PC', slug: 'mobile-handheld', description: 'Steam Deck, ROG Ally, game kompetitif Android/iOS' },
    { id: 'indie-local-games', name: 'Industri Game Lokal Indonesia & Pengembang Mandiri', slug: 'indie-local-games', description: 'Karya developer nusantara, publisher lokal' },
    { id: 'esports-pro-scene', name: 'Skena Esports & Turnamen Internasional', slug: 'esports-pro-scene', description: 'MPL, VCT, The International, analitik pro scene' },
    { id: 'game-engines-graphics', name: 'Game Engine, Grafis 3D & Audio Spasial', slug: 'game-engines-graphics', description: 'Unreal Engine 5, Unity, Ray tracing, DLSS/FSR gaming' },
    { id: 'vr-ar-immersive', name: 'Game Realitas Virtual & Spasial', slug: 'vr-ar-immersive', description: 'VR Headset, mixed reality, spatial games interaktif' },
    { id: 'game-narrative-design', name: 'Desain Narasi, Game Mechanics & Desain Level', slug: 'game-narrative-design', description: 'Studi kasus cerita game, ekonomi in-game, game design' },
    { id: 'game-audio-music', name: 'Musik Game & Desain Efek Suara', slug: 'game-audio-music', description: 'Soundtrack orkestra, adaptive music, sound engineering' },
    { id: 'streamers-content-creators', name: 'Industri Streaming & Kreator Konten Game', slug: 'streamers-content-creators', description: 'Setup broadcast OBS, ekosistem streaming video game' }
  ],
  cybersecurity: [
    { id: 'data-privacy-pdp', name: 'Hukum Perlindungan Data Pribadi (UU PDP)', slug: 'data-privacy-pdp', description: 'Hak subjek data, denda kepatuhan, ISO 27001' },
    { id: 'malware-ransomware', name: 'Analisis Malware, Ransomware & Trojan', slug: 'malware-ransomware', description: 'Teknik dekripsi ancaman, vektor serangan, analisis payload' },
    { id: 'data-breaches-leaks', name: 'Investigasi Kebocoran Database & Dark Web', slug: 'data-breaches-leaks', description: 'Audit kebocoran data instansi, pemantauan forum peretas' },
    { id: 'threat-intelligence-apt', name: 'Intelijen Ancaman & Peretas Negara (APT)', slug: 'threat-intelligence-apt', description: 'Spionase siber, taktik perang informasi antarnegara' },
    { id: 'cloud-infrastructure-security', name: 'Keamanan Cloud, Server & Kubernetes', slug: 'cloud-infrastructure-security', description: 'Konfigurasi IAM, postur keamanan cloud CSPM' },
    { id: 'vulnerability-zero-day', name: 'Kerentanan Sistem, CVE & Eksploit Zero-Day', slug: 'vulnerability-zero-day', description: 'Laporan bug bounty, pembobolan autentikasi' },
    { id: 'cryptography-encryption', name: 'Kriptografi & Komputasi Aman', slug: 'cryptography-encryption', description: 'Enkripsi end-to-end, post-quantum cryptography, ZK proofs' },
    { id: 'identity-auth', name: 'Arsitektur Identitas, MFA & Passkey', slug: 'identity-auth', description: 'Arsitektur passwordless, protokol FIDO2, manajemen sesi' },
    { id: 'network-ddos-mitigation', name: 'Keamanan Jaringan, Firewall & Pertahanan DDoS', slug: 'network-ddos-mitigation', description: 'Mitigasi serangan volumetrik, segmentasi zero trust' },
    { id: 'social-engineering-phishing', name: 'Rekayasa Sosial, Phishing & Fraud Digital', slug: 'social-engineering-phishing', description: 'Taktik rekayasa sosial, deepfake vishing, simulasi ancaman' }
  ],
  internet: [
    { id: 'telecom-5g-6g', name: 'Infrastruktur Telekomunikasi, 5G & Riset 6G', slug: 'telecom-5g-6g', description: 'Frekuensi spektrum, menara BTS, operator seluler nasional' },
    { id: 'satellite-constellation', name: 'Internet Satelit LEO & Komunikasi Luar Angkasa', slug: 'satellite-constellation', description: 'Starlink, konstelasi orbit rendah, akses kepulauan' },
    { id: 'submarine-cables', name: 'Jaringan Kabel Bawah Laut & Pusat Interkoneksi', slug: 'submarine-cables', description: 'Serat optik internasional, landing station, latensi RI' },
    { id: 'fiber-broadband-isp', name: 'Fiber Optic Rumahan (FTTH) & Layanan ISP', slug: 'fiber-broadband-isp', description: 'Provider internet rumah, Wi-Fi 7, kestabilan bandwidth' },
    { id: 'data-centers-ixp', name: 'Pusat Data Nasional & Internet Exchange', slug: 'data-centers-ixp', description: 'Fasilitas hyperscale data center, IXP peering internasional' },
    { id: 'digital-sovereignty-policy', name: 'Kedaulatan Digital & Regulasi Internet', slug: 'digital-sovereignty-policy', description: 'Aturan PSE, hak cipta digital, net neutrality' },
    { id: 'social-platforms-dynamics', name: 'Dinamika Media Sosial & Budaya Internet', slug: 'social-platforms-dynamics', description: 'Algoritma FYP, moderasi konten, tren platform komunitas' },
    { id: 'e-commerce-logistics', name: 'Infrastruktur E-Commerce & Logistik Digital', slug: 'e-commerce-logistics', description: 'Platform marketplace, sistem pelacakan gudang pintar' },
    { id: 'web-standards-protocols', name: 'Standar Web, Domain & Protokol Jaringan', slug: 'web-standards-protocols', description: 'HTTP/3, QUIC, DNS over HTTPS, IPv6 adoption' },
    { id: 'digital-inclusion-rural', name: 'Inklusi Digital & Konektivitas Wilayah Terluar', slug: 'digital-inclusion-rural', description: 'Akses internet sekolah 3T, literasi digital pedesaan' }
  ],
  space: [
    { id: 'rocket-propulsion', name: 'Roket Peluncur & Rekayasa Antariksa', slug: 'rocket-propulsion', description: 'SpaceX Starship, peluncur daur ulang, propulsi roket modern' },
    { id: 'satellite-earth-observation', name: 'Satelit Penginderaan Jauh & Pemetaan Bumi', slug: 'satellite-earth-observation', description: 'Citra satelit resolusi tinggi, pemantauan bumi' },
    { id: 'deep-space-exploration', name: 'Eksplorasi Luar Angkasa & Misi Antariksa', slug: 'deep-space-exploration', description: 'Misi Bulan Artemis, robot penjelajah Mars, misi asteroid' },
    { id: 'astronomy-astrophysics', name: 'Astronomi, Lubang Hitam & Kosmologi', slug: 'astronomy-astrophysics', description: 'Eksoplanet layak huni, gelombang gravitasi, materi gelap' },
    { id: 'space-industry-commercial', name: 'Ekonomi Antariksa Komersial & Space-Tech', slug: 'space-industry-commercial', description: 'Stasiun luar angkasa swasta, pariwisata orbit, kargo luar angkasa' },
    { id: 'planetary-defense', name: 'Pertahanan Planet & Sampah Antariksa', slug: 'planetary-defense', description: 'Penghindaran tabrakan debris orbit, pelacakan asteroid dekat bumi' },
    { id: 'space-telescopes-observatories', name: 'Teleskop Antariksa & Observatorium Astronomi', slug: 'space-telescopes-observatories', description: 'Teleskop James Webb, Roman Telescope, spektroskopi kosmik' },
    { id: 'space-propulsion-nuclear', name: 'Propulsi Nuklir Antariksa & Tenaga Wahana', slug: 'space-propulsion-nuclear', description: 'Nuclear thermal propulsion, ion drive, pendorong fusi antariksa' },
    { id: 'lunar-mars-habitats', name: 'Kolonisasi, Pangkalan Bulan & Habitat Mars', slug: 'lunar-mars-habitats', description: 'Pemanfaatan sumber daya in-situ/ISRU, pangkalan Bulan Artemis Base Camp' },
    { id: 'indonesian-space-research', name: 'Riset Antariksa & Observatorium Nasional', slug: 'indonesian-space-research', description: 'Aktivitas BRIN antariksa, observatorium Timau' }
  ],
  climatetech: [
    { id: 'solar-clean-energy', name: 'Energi Surya & Fotovoltaik Efisiensi Tinggi', slug: 'solar-clean-energy', description: 'Panel surya perovskite, PLTS terapung, inverter cerdas' },
    { id: 'wind-hydro-geothermal', name: 'Energi Angin, PLTA & Panas Bumi', slug: 'wind-hydro-geothermal', description: 'Turbin angin lepas pantai, pemanfaatan geothermal nusantara' },
    { id: 'fusion-advanced-clean-power', name: 'Fusi Nuklir & Energi Bersih Masa Depan', slug: 'fusion-advanced-clean-power', description: 'Reaktor fusi komersial, energi fusi tokamak, SMR nuklir generasi baru' },
    { id: 'carbon-capture-removal', name: 'Penangkapan Karbon (CCS/CCUS) & Reboisasi Digital', slug: 'carbon-capture-removal', description: 'Direct air capture, teknologi injeksi karbon' },
    { id: 'battery-grid-storage', name: 'Penyimpanan Energi Grid (BESS) & Baterai Industri', slug: 'battery-grid-storage', description: 'Baterai sodium-ion, iron-air storage skala utilitas PLN' },
    { id: 'smart-grid-metering', name: 'Smart Grid & Sistem Distribusi Daya Cerdas', slug: 'smart-grid-metering', description: 'Pencatatan meteran cerdas AMI, transmisi HVDC' },
    { id: 'green-hydrogen-biofuels', name: 'Hidrogen Hijau & Bahan Bakar Nabati Berkelanjutan', slug: 'green-hydrogen-biofuels', description: 'Elektrolisis air tenaga surya, bio-avtur aviasi' },
    { id: 'circular-economy-recycling', name: 'Daur Ulang Elektronik & Ekonomi Sirkular', slug: 'circular-economy-recycling', description: 'Pengolahan e-waste, ekstraksi logam tanah jarang dari HP bekas' },
    { id: 'agritech-sustainable-farming', name: 'Agritech Presisi & Pertanian Cerdas Iklim', slug: 'agritech-sustainable-farming', description: 'Sensor kelembaban tanah IoT, drone semprot presisi' },
    { id: 'esg-reporting-carbon-market', name: 'Bursa Karbon & Verifikasi Pelaporan ESG', slug: 'esg-reporting-carbon-market', description: 'Bursa Karbon Indonesia/IDXCarbon, verifikasi emisi' }
  ],
  biotech: [
    { id: 'genomics-crispr', name: 'Genomika, Sekuensing DNA & Rekayasa Genetik', slug: 'genomics-crispr', description: 'CRISPR-Cas9, pengurutan genom generasi baru, terapi gen' },
    { id: 'digital-health-telemedicine', name: 'Telemedicine & Pelayanan Medis Terintegrasi', slug: 'digital-health-telemedicine', description: 'Platform konsultasi online, rekam medis SATUSEHAT, RS digital' },
    { id: 'ai-drug-discovery', name: 'Desain Obat Berbasis AI & Biologi Komputasi', slug: 'ai-drug-discovery', description: 'Prediksi lipatan protein AlphaFold, penemuan molekul obat' },
    { id: 'medical-devices-diagnostics', name: 'Perangkat Medis Cerdas & Diagnostik Point-of-Care', slug: 'medical-devices-diagnostics', description: 'Mesin USG portabel, biosensor mikrofluida lab' },
    { id: 'bci-neurotechnology', name: 'Antarmuka Otak-Komputer (BCI) & Neuroteknologi', slug: 'bci-neurotechnology', description: 'Neuralink, implan saraf motorik, stimulasi otak' },
    { id: 'health-wearables-continuous', name: 'Sensor Medis Klinis & Pemantau Pasien Kontinu', slug: 'health-wearables-continuous', description: 'Pemantau glukosa kontinu/CGM klinis, sensor hemodinamik' },
    { id: 'synthetic-biology-biomanufacturing', name: 'Biologi Sintetis & Bio-Manufaktur', slug: 'synthetic-biology-biomanufacturing', description: 'Ragi rekayasa pembuat insulin, kultur protein alternatif' },
    { id: 'bioinformatics-health-data', name: 'Bioinformatika & Keamanan Data Medis', slug: 'bioinformatics-health-data', description: 'Analisis data populasi kesehatan, interoperabilitas biomedis' },
    { id: 'longevity-anti-aging', name: 'Riset Longevity & Terapi Regeneratif', slug: 'longevity-anti-aging', description: 'Penelitian penuaan seluler, terapi stem cell terverifikasi' },
    { id: 'public-health-epidemiology', name: 'Pengawasan Epidemiologi & Keamanan Hayati', slug: 'public-health-epidemiology', description: 'Sistem deteksi dini wabah penyakit berbasis AI' }
  ],
  review: [
    { id: 'flagship-smartphone-reviews', name: 'Uji Performa & Review Smartphone Flagship', slug: 'flagship-smartphone-reviews', description: 'Uji lab kamera, baterai, performa grafis gaming' },
    { id: 'laptop-computing-benchmarks', name: 'Benchmark Laptop, Mac & PC Komputasi', slug: 'laptop-computing-benchmarks', description: 'Perbandingan benchmark Geekbench, Cinebench, baterai' },
    { id: 'audiophile-sound-testing', name: 'Uji Akustik Audio & Perangkat Dengar', slug: 'audiophile-sound-testing', description: 'Kurva frekuensi respon, isolasi kebisingan ANC, latensi' },
    { id: 'camera-optics-gear', name: 'Review Kamera, Lensa & Alat Pembuat Konten', slug: 'camera-optics-gear', description: 'Sensor full-frame, gimbal stabilisator, mikrofon wireless' },
    { id: 'home-smart-appliances', name: 'Uji Perlengkapan Rumah Pintar & IoT', slug: 'home-smart-appliances', description: 'Robot vacuum, air purifier terhubung, smart TV' },
    { id: 'ergonomics-desk-setup', name: 'Uji Ergonomi, Meja Kerja & Aksesoris Produktivitas', slug: 'ergonomics-desk-setup', description: 'Kursi ergonomis, monitor light bar, mouse vertikal' },
    { id: 'gaming-peripherals-review', name: 'Review Aksesoris Gaming & Monitor Kencang', slug: 'gaming-peripherals-review', description: 'Mouse gaming ringan, keyboard 8000Hz, headset spasial' },
    { id: 'long-term-verdict', name: 'Ulasan Penggunaan Jangka Panjang (Long-Term Review)', slug: 'long-term-verdict', description: 'Kondisi gadget setelah 6 bulan/1 tahun pemakaian riil' },
    { id: 'buying-guides-tierlists', name: 'Panduan Beli, Rekomendasi Anggaran & Tier List', slug: 'buying-guides-tierlists', description: 'Rekomendasi HP terbaik di bawah 3 juta, 5 juta, laptop kuliah' },
    { id: 'market-trends-gadget-hype', name: 'Analisis Tren Pasar & Skeptisisme Inovasi', slug: 'market-trends-gadget-hype', description: 'Membedah fitur gimmick vs inovasi nyata, tren harga gadget' }
  ],
  tips: [
    { id: 'smartphones-tips-tricks', name: 'Panduan Optimalisasi Smartphone', slug: 'smartphones-tips-tricks', description: 'Trik rahasia Android & iOS, hemat baterai, optimasi kamera, storage' },
    { id: 'pc-windows-mac-optimization', name: 'Tutorial Sistem Windows & Mac', slug: 'pc-windows-mac-optimization', description: 'Pembersihan registry aman, shortcut produktivitas OS' },
    { id: 'ai-prompting-workflows', name: 'Panduan Prompt Engineering & Alur Kerja AI', slug: 'ai-prompting-workflows', description: 'Template prompt efektif, otomasi dokumen AI, panduan Claude/GPT' },
    { id: 'cyber-hygiene-safety', name: 'Panduan Keamanan Siber Personal & Privasi Akun', slug: 'cyber-hygiene-safety', description: 'Cara pasang Passkey, pemulihan akun 2FA, hapus jejak digital' },
    { id: 'home-wifi-networking', name: 'Trik Jaringan Internet Rumah & Wi-Fi Router', slug: 'home-wifi-networking', description: 'Mengatasi Wi-Fi lemot, setting DNS cepat, router mesh' },
    { id: 'developer-how-to', name: 'Tutorial Pemrograman Praktis & Tools Dev', slug: 'developer-how-to', description: 'Setup terminal Linux, integrasi Git/GitHub, deploy website mandiri' },
    { id: 'creative-design-video-editing', name: 'Panduan Software Kreatif & Editing Konten', slug: 'creative-design-video-editing', description: 'Trik color grading video kilat, template Figma' },
    { id: 'data-backup-recovery', name: 'Panduan Backup Data & Pemulihan File', slug: 'data-backup-recovery', description: 'Aturan backup 3-2-1, pemulihan harddisk, transfer antar HP' },
    { id: 'gadget-maintenance-diy', name: 'Perawatan & Perbaikan Mandiri (DIY Gadget Care)', slug: 'gadget-maintenance-diy', description: 'Pembersihan port charging, penggantian pasta pendingin laptop' },
    { id: 'app-mastery-efficiency', name: 'Tutorial Kuasai Aplikasi Produktivitas', slug: 'app-mastery-efficiency', description: 'Rumus Excel/Google Sheets, database Notion, otomatisasi Zapier' }
  ]
};

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Semua Berita', slug: 'semua', icon: 'layers', description: 'Semua kabar & pembaruan teknologi terkini', subCategories: [] },
  { id: 'ai', name: 'Future Tech & AI', slug: 'ai', icon: 'cpu', description: 'Inovasi AI, LLM, Robotika & Komputasi Cerdas', subCategories: MASTER_TAXONOMY.ai },
  { id: 'gadget', name: 'Gadget & Hardware', slug: 'gadget', icon: 'smartphone', description: 'Review, rumor & rilis perangkat smartphone, laptop & chip', subCategories: MASTER_TAXONOMY.gadget },
  { id: 'software', name: 'Software & Apps', slug: 'software', icon: 'layout', description: 'Aplikasi mobile, OS, cloud computing & SaaS', subCategories: MASTER_TAXONOMY.software },
  { id: 'startup', name: 'Bisnis Teknologi & Startup', slug: 'startup', icon: 'trending-up', description: 'Ekosistem pendanaan, unicorn & valuasi korporasi teknologi', subCategories: MASTER_TAXONOMY.startup },
  { id: 'fintech', name: 'Fintech & Aset Digital', slug: 'fintech', icon: 'coins', description: 'Perbankan digital, QRIS, blockchain & tokenisasi aset', subCategories: MASTER_TAXONOMY.fintech },
  { id: 'ev', name: 'Kendaraan Listrik & Mobilitas', slug: 'ev', icon: 'zap', description: 'Mobil/motor listrik, teknologi baterai, SPKLU & autonomous', subCategories: MASTER_TAXONOMY.ev },
  { id: 'gaming', name: 'Gaming & Industri Kreatif', slug: 'gaming', icon: 'gamepad-2', description: 'Industri game, esports, game engine & grafis 3D', subCategories: MASTER_TAXONOMY.gaming },
  { id: 'cybersecurity', name: 'Keamanan Siber & Privasi', slug: 'cybersecurity', icon: 'shield-alert', description: 'Perlindungan data pribadi, privasi siber & mitigasi ancaman', subCategories: MASTER_TAXONOMY.cybersecurity },
  { id: 'internet', name: 'Internet & Digital', slug: 'internet', icon: 'globe', description: 'Infrastruktur 5G/6G, ISP, internet satelit & dinamika sosial digital', subCategories: MASTER_TAXONOMY.internet },
  { id: 'space', name: 'Sains & Eksplorasi Antariksa', slug: 'space', icon: 'orbit', description: 'Konstelasi satelit LEO, riset luar angkasa & astronomi modern', subCategories: MASTER_TAXONOMY.space },
  { id: 'climatetech', name: 'Teknologi Hijau & Iklim', slug: 'climatetech', icon: 'leaf', description: 'Transisi energi bersih, dekarbonisasi & agritech berkelanjutan', subCategories: MASTER_TAXONOMY.climatetech },
  { id: 'biotech', name: 'Bioteknologi & Kesehatan', slug: 'biotech', icon: 'activity', description: 'HealthTech, perangkat wearable medis & rekayasa genetika', subCategories: MASTER_TAXONOMY.biotech },
  { id: 'review', name: 'Review & Tren', slug: 'review', icon: 'star', description: 'Uji performa mendalam, benchmark produk & tren belanja teknologi', subCategories: MASTER_TAXONOMY.review },
  { id: 'tips', name: 'Tips & Tutorial', slug: 'tips', icon: 'help-circle', description: 'Panduan praktis langkah demi langkah, how-to & trik digital', subCategories: MASTER_TAXONOMY.tips }
];

export function getSubCategories(categoryId: string): SubCategory[] {
  return MASTER_TAXONOMY[categoryId] || [];
}

export function findSubCategory(categoryId: string, subIdOrSlug: string): SubCategory | undefined {
  const list = MASTER_TAXONOMY[categoryId] || [];
  return list.find(s => s.id === subIdOrSlug || s.slug === subIdOrSlug);
}

export function getCategoryById(categoryId: string): Category | undefined {
  return CATEGORIES.find(c => c.id === categoryId);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug || c.id === slug);
}

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

export const ARTICLES: Article[] = [];


