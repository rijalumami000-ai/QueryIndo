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

const DELETED_AUTHORS_KEY = 'query_editorial_deleted_authors_v1';

export class AuthorService {
  /**
   * Get all deleted author IDs and lowercased names
   */
  public static getDeletedIdentifiers(): Set<string> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(DELETED_AUTHORS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr.map(s => String(s).toLowerCase().trim()));
        }
      }
    } catch {}
    return new Set();
  }

  /**
   * Permanently mark an author as deleted so they cannot be resurrected
   */
  public static markAuthorDeleted(id: string, name?: string): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const deleted = this.getDeletedIdentifiers();
      if (id) deleted.add(id.toLowerCase().trim());
      if (name) deleted.add(name.toLowerCase().trim());
      localStorage.setItem(DELETED_AUTHORS_KEY, JSON.stringify(Array.from(deleted)));
    } catch {}
  }

  /**
   * Check if author is marked as deleted
   */
  public static isAuthorDeleted(author: Partial<AuthorProfile> | null | undefined): boolean {
    if (!author) return true;
    const deleted = this.getDeletedIdentifiers();
    if (deleted.size === 0) return false;
    const idMatch = author.id && deleted.has(author.id.toLowerCase().trim());
    const nameMatch = author.name && deleted.has(author.name.toLowerCase().trim());
    return !!(idMatch || nameMatch);
  }

  public static getAuthors(): AuthorProfile[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return DEFAULT_AUTHORS.filter(a => !this.isAuthorDeleted(a));
    }

    try {
      const raw = localStorage.getItem(AUTHORS_STORAGE_KEY);
      if (!raw) {
        // Migrate from old storage key if exists
        const oldRaw = localStorage.getItem('query_editorial_authors_v1');
        if (oldRaw) {
          try {
            const oldList: AuthorProfile[] = JSON.parse(oldRaw);
            const cleanOld = oldList.filter(a => !this.isAuthorDeleted(a));
            if (cleanOld.length > 0) {
              this.saveAuthors(cleanOld);
              return cleanOld;
            }
          } catch {}
        }
        const initial = DEFAULT_AUTHORS.filter(a => !this.isAuthorDeleted(a));
        this.saveAuthors(initial);
        return initial;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleanList = parsed.filter(a => !this.isAuthorDeleted(a));
        return cleanList.map((a: AuthorProfile, idx: number) => ({
          ...a,
          division: a.division || 'Redaktur Pelaksana & Koordinator Desk',
          order: a.order !== undefined ? a.order : (idx + 1),
          joinedAt: a.joinedAt || ((a as any).created_at ? new Date((a as any).created_at).toISOString().split('T')[0] : '2025-01-01')
        }));
      }
    } catch {}

    return DEFAULT_AUTHORS.filter(a => !this.isAuthorDeleted(a));
  }

  public static saveAuthors(authors: AuthorProfile[]): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const cleanList = (authors || []).filter(a => !this.isAuthorDeleted(a));
      localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(cleanList));
    } catch {}
  }

  public static async syncWithBackend(): Promise<void> {
    try {
      const serverAuthors = await ApiService.getAuthors();
      if (serverAuthors && Array.isArray(serverAuthors)) {
        const cleanList = serverAuthors.filter(a => !this.isAuthorDeleted(a));
        this.saveAuthors(cleanList);
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

  public static async addAuthor(data: Omit<AuthorProfile, 'id' | 'joinedAt'>): Promise<AuthorProfile> {
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
    await ApiService.createAuthor(newAuthor);
    return newAuthor;
  }

  public static async updateAuthor(id: string, updated: Partial<AuthorProfile>): Promise<boolean> {
    const authors = this.getAuthors();
    const idx = authors.findIndex(a => a.id === id);
    if (idx === -1) return false;

    authors[idx] = {
      ...authors[idx],
      ...updated
    };
    this.saveAuthors(authors);
    await ApiService.updateAuthor(id, updated);
    return true;
  }

  public static async deleteAuthor(id: string, name?: string): Promise<boolean> {
    const authors = this.getAuthors();
    const target = authors.find(a => a.id === id || (name && a.name.toLowerCase() === name.toLowerCase()));
    const authorName = target?.name || name || '';
    const authorId = target?.id || id;

    // 1. Mark as permanently deleted in Tombstone so sync/defaults never resurrect them
    this.markAuthorDeleted(authorId, authorName);

    // 2. Filter out from memory and localStorage
    const filtered = authors.filter(a => a.id !== authorId && (!authorName || a.name.toLowerCase() !== authorName.toLowerCase()));

    this.saveAuthors(filtered);

    // 3. Delete on backend (sending both ID and Name to overcome ID mismatches)
    await ApiService.deleteAuthor(authorId, authorName);
    return true;
  }

  public static resetToDefault(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DELETED_AUTHORS_KEY);
    }
    this.saveAuthors(DEFAULT_AUTHORS);
  }
}
