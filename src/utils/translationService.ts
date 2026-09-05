import type { Article } from '../types/news';

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
    wismaAddress: 'Wisma Nugra Santana Jl Jend Sudirman Kav 7-8 Jakarta Pusat',
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
    ethicsCode: 'Kode Etik Redaksi',
    cyberGuidelines: 'Pedoman Media Siber',
    disclaimerText: 'Disclaimer (Penafian)',
    adsText: 'Info Iklan',
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
    wismaAddress: 'Wisma Nugra Santana Jl Jend Sudirman Kav 7-8 Central Jakarta',
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
    ethicsCode: 'Redactional Ethics',
    cyberGuidelines: 'Cyber Media Guidelines',
    disclaimerText: 'Disclaimer',
    adsText: 'Advertising',
    chartFooter: '📊 Real-time data from Yahoo Finance • Updated every 5 minutes',
    chartFooterFallback: '📊 Last 24 hours data • Static information'
  }
};

// Hardcoded Fallback Translations for Mock Articles (100% Offline Resilience)
const MOCK_ARTICLE_TRANSLATIONS: Record<string, { title: string; subtitle: string; aiSummary: string[] }> = {
  'art-001': {
    title: 'Indonesia Officially Operates First AI Supercomputer National Data Center in IKN',
    subtitle: 'This high-performance computing facility with 100 Petaflops capacity is designed to accelerate digital sovereignty and national data research.',
    aiSummary: [
      'IKN National Data Center (PDN) officially operates an AI supercomputer cluster with 100 Petaflops capacity.',
      'This facility prioritizes Indonesian Language processing (Nusantara Large Language Model) and real-time disaster analysis.',
      'The entire infrastructure is 100% powered by renewable energy from the IKN Solar Power Plant (PLTS).'
    ]
  },
  'art-002': {
    title: 'Starlink & Indonesian Telcos Agree on National Roaming: Zero Blindspots in 3T Outer Areas',
    subtitle: 'Strategic collaboration of Direct-to-Cell cellular signals brings 5G connectivity to remote islands of Indonesia without changing SIM cards.',
    aiSummary: [
      'Indonesian consortium cellular operators agree to integrate LEO satellite-based Direct-to-Cell technology.',
      'Users do not need to buy additional satellite dishes; standard 4G/5G phones automatically catch emergency signals when tower BTS is out of reach.',
      'Successful trials were conducted in Natuna Islands and remote Papua.'
    ]
  },
  'art-003': {
    title: 'AI Sovereignty Bill Officially Passed: Mandatory Algorithm Transparency & Synthetic Content Watermarking',
    subtitle: 'New regulation asserts copyright protection for human creations, ethical automation, and heavy punishments for malicious deepfakes.',
    aiSummary: [
      'Indonesian Parliament passes the Bill on Governance & Sovereignty of Artificial Intelligence.',
      'All digital platforms must include invisible metadata/watermarks (C2PA) on AI-generated images, audio, and videos.',
      'Large AI model developers must submit safety audit reports before public releases.'
    ]
  },
  'art-004': {
    title: 'Snapdragon 8 Gen 5 Review on Local Flagship: 45 TOPS AI Performance & Extreme Battery Efficiency',
    subtitle: 'In-depth testing of the latest mobile chipset: 120 FPS game rendering without overheating and offline LLM processing in your hand.',
    aiSummary: [
      'Snapdragon 8 Gen 5 brings NPU enhancements up to 45 TOPS for On-Device AI tasks.',
      'Max temperature during heavy gaming consistently stays under 39°C thanks to the 2nm fabrication process.',
      'Favorite feature: Two-way real-time spoken language translation without internet connection.'
    ]
  },
  'art-005': {
    title: 'BSSN Alert: Generation 4 Ransomware Wave Targets Financial & Logistics Sectors',
    subtitle: 'This new type of cyber threat utilizes autonomous AI agents to scan server vulnerabilities in seconds.',
    aiSummary: [
      'BSSN releases early warning on AI ransomware variants that can adapt and penetrate traditional Firewalls.',
      'Companies are advised to implement Zero-Trust architecture and multi-layered biometric authentication.',
      'No data breach cases in major banks so far due to emergency lock protocols.'
    ]
  },
  'art-006': {
    title: 'Bandung Climate-Tech Startup Raises $15 Million Series A for Salt-Based Battery',
    subtitle: 'Sodium battery technology based on locally refined salt is ready to become a cheap storage alternative for solar energy.',
    aiSummary: [
      'NusaVolt startup produces Sodium-ion batteries that are 40% cheaper than Lithium batteries.',
      'Series A funding of $15 Million is led by green venture capital consortium in Asia.',
      'The first commercial factory will be built in Karawang in the final quarter of this year.'
    ]
  },
  'art-007': {
    title: 'TypeScript 5.8 & Go 1.26 Ecosystem Guide: Latest Fullstack Computing Stack Trends 2026',
    subtitle: 'Why the combination of TypeScript for frontend and Go for microservices becomes the gold standard of modern software engineering.',
    aiSummary: [
      'TypeScript 5.8 provides type-checking speed enhancements up to 2x.',
      'Go 1.26 introduces an optional JIT-based compiler for extreme performance scenarios.',
      'Top-tier Indonesian tech companies switch to this stack to save cloud infrastructure costs.'
    ]
  }
};

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

    // Attempt dynamic translation using Gemini API if key is available
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    if (apiKey) {
      try {
        const prompt = `Translate the following Indonesian news article metadata into English. Return ONLY a valid JSON object matching this structure:
{
  "title": "translated title",
  "subtitle": "translated subtitle",
  "aiSummary": ["bullet 1", "bullet 2", "bullet 3"]
}

Do NOT wrap the JSON in Markdown backticks (e.g. do not write \`\`\`json) and do not add any explaining text.

Original Title: "${article.title}"
Original Subtitle: "${article.subtitle}"
Original Summary Takeaways:
${article.aiSummary.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean up potential markdown formatting block wrapper if AI returned it
          rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

          const parsed = JSON.parse(rawText);
          if (parsed.title && parsed.subtitle && Array.isArray(parsed.aiSummary)) {
            const result = {
              title: parsed.title,
              subtitle: parsed.subtitle,
              aiSummary: parsed.aiSummary
            };
            translationCache[cacheKey] = result;
            return result;
          }
        }
      } catch (err) {
        console.warn('Gemini translation API failed, utilizing default English generator fallback:', err);
      }
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
