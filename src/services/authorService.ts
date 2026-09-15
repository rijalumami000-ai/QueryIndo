import type { AuthorProfile } from '../types/news';
import { ApiService } from './apiService';

export const EDITORIAL_DIVISIONS = [
  'Pimpinan & Penanggung Jawab',
  'Dewan Redaksi & Penasihat',
  'Redaktur Pelaksana & Koordinator Desk',
  'Tim Teknologi & Engineering'
] as const;

export type EditorialDivision = typeof EDITORIAL_DIVISIONS[number];

const AUTHORS_STORAGE_KEY = 'query_editorial_authors_v2';

export const DEFAULT_AUTHORS: AuthorProfile[] = [
  // 1. Pimpinan & Penanggung Jawab
  {
    id: 'author-001',
    name: 'Rijal Umami',
    role: 'Direktur Utama / CEO',
    division: 'Pimpinan & Penanggung Jawab',
    order: 1,
    email: 'rijal@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Pendiri QUERYINDO. Lulusan Teknik Informatika dengan pengalaman 12 tahun di industri media digital dan komputasi awan.',
    socialTwitter: '@rijalumami',
    socialLinkedin: 'https://linkedin.com/in/rijalumami',
    joinedAt: '2025-01-01'
  },
  {
    id: 'author-006',
    name: 'Dian Prasetyo, M.T.',
    role: 'Pemimpin Redaksi',
    division: 'Pimpinan & Penanggung Jawab',
    order: 2,
    email: 'dian@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    bio: 'Mantan Redaktur Senior TechScape. 15 tahun pengalaman jurnalisme teknologi investigatif dan kebijakan siber.',
    socialTwitter: '@dianprasetyo',
    socialLinkedin: 'https://linkedin.com/in/dianprasetyo',
    joinedAt: '2025-01-15'
  },
  {
    id: 'author-007',
    name: 'Sari Wulandari, M.Kom.',
    role: 'Wakil Pemimpin Redaksi',
    division: 'Pimpinan & Penanggung Jawab',
    order: 3,
    email: 'sari@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: 'Spesialis liputan AI & Big Data. Fellow Knight-Wallace Journalism, Univ. of Michigan 2023.',
    socialTwitter: '@sariwulandari',
    socialLinkedin: 'https://linkedin.com/in/sariwulandari',
    joinedAt: '2025-02-01'
  },

  // 2. Dewan Redaksi & Penasihat
  {
    id: 'author-101',
    name: 'Prof. Dr. Irwan Hakim',
    role: 'Dewan Penasihat AI',
    division: 'Dewan Redaksi & Penasihat',
    order: 4,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Guru Besar Ilmu Komputer UI. Pakar etika AI dan regulasi kecerdasan buatan nasional.',
    joinedAt: '2025-02-15'
  },
  {
    id: 'author-102',
    name: 'Dr. Hendra Kurniawan, S.H.',
    role: 'Penasihat Hukum Media',
    division: 'Dewan Redaksi & Penasihat',
    order: 5,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Advokat senior spesialis hukum pers dan siber. Partner KHK Law Firm.',
    joinedAt: '2025-02-15'
  },
  {
    id: 'author-103',
    name: 'Ir. Teguh Aprianto, CISSP',
    role: 'Penasihat Keamanan Siber',
    division: 'Dewan Redaksi & Penasihat',
    order: 6,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    bio: 'Praktisi keamanan siber nasional dan penasihat independen proteksi data.',
    joinedAt: '2025-02-20'
  },

  // 3. Redaktur Pelaksana & Koordinator Desk
  {
    id: 'author-201',
    name: 'Ahmad Fauzi',
    role: 'Redaktur Pelaksana',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 7,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    bio: 'Mengelola alur berita harian dan koordinasi newsroom digital.',
    joinedAt: '2025-03-01'
  },
  {
    id: 'author-002',
    name: 'Raditya Pratama',
    role: 'Editor Senior Teknologi & Kebijakan',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 8,
    email: 'raditya@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Spesialis investigasi keamanan siber, arsitektur cloud sovereign, dan regulasi infrastruktur digital Indonesia.',
    socialTwitter: '@radityapratama',
    socialLinkedin: 'https://linkedin.com/in/radityapratama',
    joinedAt: '2025-03-15'
  },
  {
    id: 'author-202',
    name: 'Rina Maharani, M.Sc.',
    role: 'Desk AI & Data',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 9,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Lulusan Data Science ETH Zürich. Mengampu liputan machine learning & LLM.',
    joinedAt: '2025-03-15'
  },
  {
    id: 'author-005',
    name: 'Maya Indah',
    role: 'Desk Gadget & Hardware Lab',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 10,
    email: 'maya@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    bio: 'Penguji performa chipset, display panel, efisiensi termal smartphone, dan ekosistem perangkat pintar.',
    socialTwitter: '@mayaindah',
    socialLinkedin: 'https://linkedin.com/in/mayaindah',
    joinedAt: '2025-04-01'
  },
  {
    id: 'author-003',
    name: 'Nabila Hapsari',
    role: 'Desk Telekomunikasi & Spektrum',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 11,
    email: 'nabila@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    bio: 'Pakar jaringan nirkabel, satelit orbit rendah LEO, serta ekonomi broadband daerah 3T di Asia Tenggara.',
    socialTwitter: '@nabilahapsari',
    socialLinkedin: 'https://linkedin.com/in/nabilahapsari',
    joinedAt: '2025-04-01'
  },
  {
    id: 'author-004',
    name: 'Bima Sakti',
    role: 'Desk Regulasi Digital & UU PDP',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 12,
    email: 'bima@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Mengupas aspek hukum kecerdasan buatan, etika komputasi, perlindungan hak cipta digital, dan kepatuhan UU PDP.',
    socialTwitter: '@bimasakti',
    socialLinkedin: 'https://linkedin.com/in/bimasakti',
    joinedAt: '2025-04-10'
  },
  {
    id: 'author-203',
    name: 'Fajar Nugroho, CEH',
    role: 'Desk Cybersecurity & Forensik',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 13,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
    bio: 'Ethical hacker bersertifikat. Menginvestigasi insiden kebocoran data dan ancaman siber enterprise.',
    joinedAt: '2025-04-15'
  },
  {
    id: 'author-204',
    name: 'Laras Permata',
    role: 'Desk Startup & Modal Ventura',
    division: 'Redaktur Pelaksana & Koordinator Desk',
    order: 14,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: '7 tahun meliput industri ventura Asia Tenggara. Analis valuasi dan dinamika pendanaan startup.',
    joinedAt: '2025-04-20'
  },

  // 4. Tim Teknologi & Engineering
  {
    id: 'author-301',
    name: 'Hasan Maulana',
    role: 'CTO / Lead Engineer',
    division: 'Tim Teknologi & Engineering',
    order: 15,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    bio: 'Arsitek platform QUERYINDO. 10 tahun pengalaman cloud architecture, high-availability, dan DevOps.',
    joinedAt: '2025-01-10'
  },
  {
    id: 'author-302',
    name: 'Arif Hidayat',
    role: 'Backend & Infrastructure Engineer',
    division: 'Tim Teknologi & Engineering',
    order: 16,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    bio: 'Spesialis Go, PostgreSQL, redis caching, dan arsitektur microservices performa tinggi.',
    joinedAt: '2025-01-20'
  },
  {
    id: 'author-303',
    name: 'Putri Ayu',
    role: 'Frontend & UI Performance Engineer',
    division: 'Tim Teknologi & Engineering',
    order: 17,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    bio: 'Spesialis TypeScript, CSS arsitektur modern, dan optimasi Core Web Vitals 100/100.',
    joinedAt: '2025-02-01'
  },
  {
    id: 'author-304',
    name: 'Galih Pramono',
    role: 'Product & UI/UX Designer',
    division: 'Tim Teknologi & Engineering',
    order: 18,
    email: 'redaksi@queryindo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Desainer antarmuka platform digital berorientasi pembaca berita teknologi dan aksesibilitas.',
    joinedAt: '2025-02-15'
  }
];

export class AuthorService {
  public static getAuthors(): AuthorProfile[] {
    const raw = localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (!raw) {
      // Migrate from old storage key if exists
      const oldRaw = localStorage.getItem('query_editorial_authors_v1');
      if (oldRaw) {
        try {
          const oldList: AuthorProfile[] = JSON.parse(oldRaw);
          // Merge old list with default divisions
          const merged = DEFAULT_AUTHORS.map(def => {
            const found = oldList.find(o => o.id === def.id || o.name.toLowerCase() === def.name.toLowerCase());
            return found ? { ...def, ...found, division: found.division || def.division } : def;
          });
          this.saveAuthors(merged);
          return merged;
        } catch {
          // fall through
        }
      }
      this.saveAuthors([]);
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Ensure every author has a division, order, and joinedAt
        return parsed.map((a: AuthorProfile, idx: number) => ({
          ...a,
          division: a.division || 'Redaktur Pelaksana & Koordinator Desk',
          order: a.order !== undefined ? a.order : (idx + 1),
          joinedAt: a.joinedAt || ((a as any).created_at ? new Date((a as any).created_at).toISOString().split('T')[0] : '2025-01-01')
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  public static saveAuthors(authors: AuthorProfile[]): void {
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
  }

  public static async syncWithBackend(): Promise<void> {
    try {
      const serverAuthors = await ApiService.getAuthors();
      if (serverAuthors && Array.isArray(serverAuthors)) {
        this.saveAuthors(serverAuthors);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi data jurnalis dari server:', err);
    }
  }

  public static getAuthorById(id: string): AuthorProfile | undefined {
    return this.getAuthors().find(a => a.id === id);
  }

  public static getAuthorByName(name: string): AuthorProfile | undefined {
    return this.getAuthors().find(a => a.name.toLowerCase() === name.toLowerCase());
  }

  public static addAuthor(data: Omit<AuthorProfile, 'id' | 'joinedAt'>): AuthorProfile {
    const authors = this.getAuthors();
    const newAuthor: AuthorProfile = {
      ...data,
      division: data.division || 'Redaktur Pelaksana & Koordinator Desk',
      order: data.order !== undefined ? data.order : authors.length + 1,
      id: `author-${Date.now().toString().slice(-4)}`,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    authors.push(newAuthor);
    this.saveAuthors(authors);
    ApiService.createAuthor(newAuthor).catch(() => {});
    return newAuthor;
  }

  public static updateAuthor(id: string, updated: Partial<AuthorProfile>): boolean {
    const authors = this.getAuthors();
    const idx = authors.findIndex(a => a.id === id);
    if (idx === -1) return false;

    authors[idx] = {
      ...authors[idx],
      ...updated
    };
    this.saveAuthors(authors);
    ApiService.updateAuthor(id, updated).catch(() => {});
    return true;
  }

  public static deleteAuthor(id: string): boolean {
    const authors = this.getAuthors();
    const filtered = authors.filter(a => a.id !== id);
    if (filtered.length === authors.length) return false;

    this.saveAuthors(filtered);
    ApiService.deleteAuthor(id).catch(() => {});
    return true;
  }

  public static resetToDefault(): void {
    this.saveAuthors(DEFAULT_AUTHORS);
  }
}
