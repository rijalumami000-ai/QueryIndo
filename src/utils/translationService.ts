import type { Article } from '../types/news';
import { ApiService } from '../services/apiService';

// Static UI Translations Dictionary
export const UI_TRANSLATIONS = {
  id: {
    techIndex: 'Indeks Tekno:',
    trendingTitle: 'Populer Minggu Ini',
    feedTitle: 'Berita Terbaru',
    searchPlaceholder: 'Cari berita AI, gadget, kedaulatan digital...',
    fontSizeLabel: 'Ukuran Teks:',
    aiSummaryHeader: 'Ringkasan Eksekutif AI',
    audioNarrativeHeader: 'Dengarkan Narasi Audio Berita',
    audioNarrativeSub: 'Klik untuk memutar narasi suara sintetis',
    audioPlaying: 'Memutar narasi suara sintetis AI...',
    audioPaused: 'Narasi audio dihentikan sementara (Klik untuk melanjutkan)',
    commentPlaceholder: 'Tuliskan tanggapan atau opini Anda tentang isu ini...',
    commentSubmit: 'Kirim',
    commentsTitle: 'Diskusi Pembaca',
    likeBtn: 'Menyukai',
    bookmarkBtn: 'Simpan Artikel',
    bookmarkedBtn: 'Tersimpan',
    shareBtn: 'Bagikan',
    resultsCount: 'Menampilkan {count} hasil pencarian',
    lblSortBy: 'Urutkan Berdasarkan',
    lblDateRange: 'Rentang Waktu',
    lblPopularTags: 'Tag Populer',
    optLatest: 'Terbaru',
    optViews: 'Terpopuler (Dilihat)',
    optLikes: 'Paling Disukai',
    optAllTime: 'Semua Waktu',
    optLast24h: '24 Jam Terakhir',
    optThisWeek: 'Minggu Ini',
    optThisMonth: 'Bulan Ini',
    wismaAddress: 'QueryIndo Office. Jl. S. Parman No 07 Cintamulya Candipuro Lampung Selatan Lampung',
    aboutUs: 'Tentang Kami',
    getInTouch: 'Hubungi Kami',
    helpFaqs: 'Bantuan & FAQ',
    support: 'Dukungan',
    allCategories: 'Semua Berita',
    langLabel: 'Bahasa:',
    companyText: 'Perusahaan',
    infoText: 'Informasi',
    readTime: '{min} menit baca',
    views: '{count} dilihat',
    authorRolePrefix: 'Jurnalis',
    searchResultPrefix: 'Hasil untuk "{query}"',
    alertSubscribe: 'Terima kasih telah berlangganan newsletter QUERYINDO!',
    petaSitus: 'Peta Situs',
    newsletterSubText: 'Langganan dan dapatkan seluruh manfaat dari hari ini.',
    cookieMsg: 'Situs web kami menggunakan cookie untuk memberikan konten dan pengalaman terbaik kepada pengguna. Cookie diperlukan agar situs kami berfungsi. Dengan persetujuan Anda, cookie dapat digunakan untuk meningkatkan pengalaman pengguna, menganalisis lalu lintas situs web, mengumpulkan data kunjungan, dan untuk tujuan pemasaran.',
    cookieAccept: 'Menerima',
    cookieReject: 'Menolak',
    cookieToastAccept: 'Terima kasih! Anda telah menyetujui kebijakan cookie kami.',
    cookieToastReject: 'Anda telah menolak penggunaan cookie opsional.',
    careersText: 'Karir & Magang',
    redaksiText: 'Susunan Redaksi',
    ethicsCode: 'Kode Etik Jurnalistik',
    cyberGuidelines: 'Pedoman Media Siber',
    aiGuidelines: 'Transparansi AI',
    factCheck: 'Cek Fakta',
    disclaimerText: 'Disclaimer',
    rightOfReply: 'Hak Jawab & Koreksi',
    communityGuidelines: 'Panduan Komunitas',
    adsText: 'Info Iklan',
    privacyText: 'Kebijakan Privasi',
    termsText: 'Syarat & Ketentuan',
    chartFooter: '📊 Data real-time dari Yahoo Finance • Diperbarui setiap 5 menit',
    chartFooterFallback: '📊 Data 24 jam terakhir • Informasi statis'
  },
  en: {
    techIndex: 'Tech Index:',
    trendingTitle: 'Trending This Week',
    feedTitle: 'Latest Tech News',
    searchPlaceholder: 'Search AI, gadget, digital sovereignty news...',
    fontSizeLabel: 'Text Size:',
    aiSummaryHeader: 'AI Executive Summary',
    audioNarrativeHeader: 'Listen to Audio News Narrative',
    audioNarrativeSub: 'Click to play synthesized voice narration',
    audioPlaying: 'Playing AI synthesized voice narration...',
    audioPaused: 'Audio narration paused (Click to resume)',
    commentPlaceholder: 'Write your response or opinion about this issue...',
    commentSubmit: 'Submit',
    commentsTitle: 'Reader Discussion',
    likeBtn: 'Likes',
    bookmarkBtn: 'Save Article',
    bookmarkedBtn: 'Bookmarked',
    shareBtn: 'Share',
    resultsCount: 'Showing {count} search results',
    lblSortBy: 'Sort By',
    lblDateRange: 'Date Range',
    lblPopularTags: 'Popular Tags',
    optLatest: 'Latest',
    optViews: 'Most Read',
    optLikes: 'Most Liked',
    optAllTime: 'All Time',
    optLast24h: 'Last 24 Hours',
    optThisWeek: 'This Week',
    optThisMonth: 'This Month',
    wismaAddress: 'QueryIndo Office. Jl. S. Parman No 07 Cintamulya Candipuro Lampung Selatan Lampung',
    aboutUs: 'About Us',
    getInTouch: 'Get in Touch',
    helpFaqs: 'Help & FAQs',
    support: 'Support',
    allCategories: 'All News',
    langLabel: 'Language:',
    companyText: 'Company',
    infoText: 'Information',
    readTime: '{min} min read',
    views: '{count} views',
    authorRolePrefix: 'Journalist',
    searchResultPrefix: 'Results for "{query}"',
    alertSubscribe: 'Thank you for subscribing to QUERYINDO newsletter!',
    petaSitus: 'Sitemap',
    newsletterSubText: 'Subscribe and get all the benefits from today.',
    cookieMsg: 'Our website uses cookies to deliver the best content and experience to users. Cookies are necessary for our site to function. With your consent, cookies may be used to improve user experience, analyze website traffic, collect visitation data, and for marketing purposes.',
    cookieAccept: 'Accept',
    cookieReject: 'Reject',
    cookieToastAccept: 'Thank you! You have accepted our cookie policy.',
    cookieToastReject: 'You have rejected optional cookies.',
    careersText: 'Careers & Internships',
    redaksiText: 'Editorial Board',
    ethicsCode: 'Code of Ethics',
    cyberGuidelines: 'Cyber Media Guidelines',
    aiGuidelines: 'AI Transparency',
    factCheck: 'Fact Check',
    disclaimerText: 'Disclaimer',
    rightOfReply: 'Right of Reply & Correction',
    communityGuidelines: 'Community Guidelines',
    adsText: 'Advertising',
    privacyText: 'Privacy Policy',
    termsText: 'Terms of Service',
    chartFooter: '📊 Real-time data from Yahoo Finance • Updated every 5 minutes',
    chartFooterFallback: '📊 Last 24 hours data • Static information'
  }
};

// Fallback Translations for Mock Articles (Cleaned)
const MOCK_ARTICLE_TRANSLATIONS: Record<string, { title: string; subtitle: string; aiSummary: string[] }> = {};


// Memory Cache for Dynamically Translated Content
const translationCache: Record<string, { title: string; subtitle: string; aiSummary: string[] }> = {};

export class TranslationService {
  /**
   * Helper to fetch static UI labels based on language preference
   */
  static getLabel(key: keyof typeof UI_TRANSLATIONS['id'], lang: 'id' | 'en'): string {
    return UI_TRANSLATIONS[lang][key] || UI_TRANSLATIONS['id'][key] || '';
  }

  /**
   * Translates article title, subtitle, and AI takeaways dynamically using Google Gemini API.
   * Leverages caching and offline presets for high reliability.
   */
  static async translateArticle(
    article: Article,
    targetLang: 'id' | 'en'
  ): Promise<{ title: string; subtitle: string; aiSummary: string[] }> {
    // If target language is Indonesian, return the original content directly
    if (targetLang === 'id') {
      return {
        title: article.title,
        subtitle: article.subtitle,
        aiSummary: article.aiSummary
      };
    }

    // Check Memory Cache first
    const cacheKey = `${article.id}_${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // Check pre-configured offline fallback dictionary (for Mock Articles)
    if (MOCK_ARTICLE_TRANSLATIONS[article.id]) {
      const translated = MOCK_ARTICLE_TRANSLATIONS[article.id];
      translationCache[cacheKey] = translated;
      return translated;
    }

    // Attempt dynamic translation via Go Backend Gemini Proxy
    try {
      const backendRes = await ApiService.translateArticle({
        title: article.title,
        subtitle: article.subtitle,
        aiSummary: article.aiSummary,
        targetLang
      });

      if (backendRes && backendRes.success && backendRes.title) {
        const result = {
          title: backendRes.title,
          subtitle: backendRes.subtitle,
          aiSummary: backendRes.aiSummary
        };
        translationCache[cacheKey] = result;
        return result;
      }
    } catch (err) {
      console.warn('Backend translation API failed, utilizing default English generator fallback:', err);
    }

    // Simple programmatical translation fallback for user-generated CMS articles
    const fallbackTranslation = {
      title: `[EN] ${article.title}`,
      subtitle: `[EN] ${article.subtitle}`,
      aiSummary: article.aiSummary.map(bullet => `[EN] ${bullet}`)
    };
    
    translationCache[cacheKey] = fallbackTranslation;
    return fallbackTranslation;
  }
}
