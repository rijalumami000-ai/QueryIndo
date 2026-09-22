export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  example: string;
}

export const TECH_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'LLM',
    category: 'Kecerdasan Buatan',
    definition: 'Large Language Model — Model kecerdasan buatan berbasis jaringan saraf tiruan skala besar yang dilatih menggunakan miliaran teks untuk memahami dan menghasilkan bahasa alami.',
    example: 'Model ByteAI dan GPT-4o menggunakan arsitektur LLM transformer.'
  },
  {
    term: 'Petaflops',
    category: 'Superkomputer',
    definition: 'Satuan kecepatan komputasi yang menggambarkan satu kuadriliun (10^15) operasi titik kambang (floating-point operations) per detik.',
    example: 'Superkomputer Ganesha-1 di IKN memiliki kapasitas daya hitung 100 Petaflops.'
  },
  {
    term: 'Zero-Day Exploit',
    category: 'Keamanan Siber',
    definition: 'Celah keamanan perangkat lunak yang belum diketahui oleh pembuat software dan belum memiliki tambalan (patch) keamanan resmi.',
    example: 'Tim BSSN mengisolasi serangan Zero-Day sebelum terjadi peretasan data.'
  },
  {
    term: 'NPU',
    category: 'Hardware & Chipset',
    definition: 'Neural Processing Unit — Akselerator perangkat keras khusus yang dirancang untuk mempercepat pemrosesan algoritma Machine Learning dan AI pada perangkat seluler.',
    example: 'Chipset Snapdragon 8 Gen 5 dilengkapi NPU khusus dengan kemampuan 60 TOPS.'
  },
  {
    term: 'Direct-to-Cell',
    category: 'Telekomunikasi',
    definition: 'Teknologi komunikasi satelit orbit rendah (LEO) yang memungkinkan smartphone standar terhubung langsung ke satelit tanpa perlu antena parabola khusus.',
    example: 'Satelit Starlink LEO menguji coba jaringan Direct-to-Cell untuk daerah 3T Indonesia.'
  },
  {
    term: 'C2PA Metadata',
    category: 'Regulasi & Media',
    definition: 'Standardisasi kriptografi internasional untuk melacak asal-usul, riwayat penyuntingan, dan membuktikan keaslian konten gambar/video guna mendeteksi deepfake.',
    example: 'Pemerintah merilis RUU yang mewajibkan lencana C2PA pada media buatan AI.'
  },
  {
    term: 'Kedaulatan Digital',
    category: 'Kebijakan Publik',
    definition: 'Hak dan kemampuan suatu negara untuk mengontrol infrastruktur digital, data warga negara, dan teknologi kunci di dalam wilayah hukumnya.',
    example: 'Pengoperasian Pusat Data Nasional di IKN memperkuat Kedaulatan Digital Indonesia.'
  }
];
