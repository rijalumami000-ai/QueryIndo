import type { AuthorProfile } from '../types/news';

const AUTHORS_STORAGE_KEY = 'query_editorial_authors_v1';

const DEFAULT_AUTHORS: AuthorProfile[] = [
  {
    id: 'author-001',
    name: 'Rijal Umami',
    role: 'Editor in Chief (Pemred)',
    email: 'rijal@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Pendiri QUERYINDO dengan pengalaman 12 tahun memimpin newsroom teknologi dan rekayasa perangkat lunak skala tinggi.',
    socialTwitter: '@rijalumami',
    socialLinkedin: 'https://linkedin.com/in/rijalumami',
    joinedAt: '2025-03-01'
  },
  {
    id: 'author-002',
    name: 'Raditya Pratama',
    role: 'Editor Senior Teknologi & Kebijakan',
    email: 'raditya@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Spesialis investigasi keamanan siber, arsitektur cloud sovereign, dan regulasi infrastruktur digital Indonesia.',
    socialTwitter: '@radityapratama',
    socialLinkedin: 'https://linkedin.com/in/radityapratama',
    joinedAt: '2025-03-15'
  },
  {
    id: 'author-003',
    name: 'Nabila Hapsari',
    role: 'Analis Telekomunikasi & Spektrum',
    email: 'nabila@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    bio: 'Pakar jaringan nirkabel, satelit orbit rendah LEO, serta ekonomi broadband daerah 3T di Asia Tenggara.',
    socialTwitter: '@nabilahapsari',
    socialLinkedin: 'https://linkedin.com/in/nabilahapsari',
    joinedAt: '2025-04-01'
  },
  {
    id: 'author-004',
    name: 'Bima Sakti',
    role: 'Jurnalis Hukum & Regulasi Digital',
    email: 'bima@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    bio: 'Mengupas aspek hukum kecerdasan buatan, etika komputasi, perlindungan hak cipta digital, dan UU PDP.',
    socialTwitter: '@bimasakti',
    socialLinkedin: 'https://linkedin.com/in/bimasakti',
    joinedAt: '2025-04-10'
  },
  {
    id: 'author-005',
    name: 'Maya Indah',
    role: 'Reviewer Gadget & Lab Hardware',
    email: 'maya@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    bio: 'Penguji performa chipset, display panel, efisiensi termal smartphone, dan ekosistem perangkat pintar terdepan.',
    socialTwitter: '@mayaindah',
    socialLinkedin: 'https://linkedin.com/in/mayaindah',
    joinedAt: '2025-05-01'
  },
  {
    id: 'author-006',
    name: 'Dian Prasetyo, M.T.',
    role: 'Wakil Pemimpin Redaksi',
    email: 'dian@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    bio: 'Mantan Redaktur Senior TechScape dengan 15 tahun dedikasi liputan jurnalisme sains dan teknologi investigatif.',
    socialTwitter: '@dianprasetyo',
    socialLinkedin: 'https://linkedin.com/in/dianprasetyo',
    joinedAt: '2025-03-01'
  },
  {
    id: 'author-007',
    name: 'Sari Wulandari, M.Kom.',
    role: 'Redaktur Khusus AI & Big Data',
    email: 'sari@queryindo.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    bio: 'Fellow Knight-Wallace Journalism. Mengampu riset komprehensif model LLM Nusantara dan superkomputer nasional.',
    socialTwitter: '@sariwulandari',
    socialLinkedin: 'https://linkedin.com/in/sariwulandari',
    joinedAt: '2025-03-10'
  }
];

export class AuthorService {
  public static getAuthors(): AuthorProfile[] {
    const raw = localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (!raw) {
      this.saveAuthors(DEFAULT_AUTHORS);
      return DEFAULT_AUTHORS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_AUTHORS;
    } catch {
      return DEFAULT_AUTHORS;
    }
  }

  public static saveAuthors(authors: AuthorProfile[]): void {
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(authors));
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
      id: `author-${Date.now().toString().slice(-4)}`,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    authors.push(newAuthor);
    this.saveAuthors(authors);
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
    return true;
  }

  public static deleteAuthor(id: string): boolean {
    const authors = this.getAuthors();
    const filtered = authors.filter(a => a.id !== id);
    if (filtered.length === authors.length) return false;

    this.saveAuthors(filtered);
    return true;
  }
}
