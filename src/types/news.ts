export type CategoryId = 'all' | 'ai' | 'gadget' | 'cybersecurity' | 'startup' | 'policy' | 'telecom' | 'developer';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
}

export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  bio: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  joinedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: CategoryId;
  tags: string[];
  author: Author;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  imageCaption?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBreaking?: boolean;
  isFactChecked?: boolean;
  isSponsored?: boolean;
  sponsorName?: string;
  isPremium?: boolean;
  revisionHistory?: Array<{ date: string; note: string }>;
  viewsCount: number;
  likesCount: number;
  aiSummary: string[]; // 3-4 bullet takeaways
  content: string; // Rich HTML content
}

export interface TechIndexDataPoint {
  time: string;   // e.g. "08:00", "09:00"
  value: number;
}

export interface TechIndexItem {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
  historicalData: TechIndexDataPoint[];
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  savedArticleIds: string[];
  likedArticleIds: string[];
  fontSize: 'normal' | 'large' | 'xlarge';
  language: 'id' | 'en';
}
