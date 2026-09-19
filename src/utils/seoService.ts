import type { Article } from '../types/news';

export class SeoService {
  private static SITE_NAME = 'QUERYINDO';
  private static BASE_URL = 'https://queryindo.com';
  private static DEFAULT_IMAGE = 'https://queryindo.com/logo.png';
  private static DEFAULT_DESCRIPTION = 'Portal jurnalisme teknologi, kecerdasan buatan, dan pasar finansial digital independen terdepan Indonesia.';

  // Helper to update or create meta tag by name or property
  private static setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }

  // Update Canonical URL
  private static setCanonical(url: string) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  // Inject or update Schema.org JSON-LD structured data
  private static setJsonLd(schemaData: object) {
    let script = document.getElementById('byte-schema-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'byte-schema-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);
  }

  // Set SEO for Homepage / Category Feed
  public static setHomeSEO(categoryTitle?: string) {
    const title = categoryTitle 
      ? `${categoryTitle} — ${this.SITE_NAME}`
      : `${this.SITE_NAME} — Jurnalisme Teknologi & Finansial Indonesia`;

    document.title = title;
    this.setMetaTag('name', 'description', this.DEFAULT_DESCRIPTION);
    this.setCanonical(this.BASE_URL);

    // OpenGraph
    this.setMetaTag('property', 'og:site_name', this.SITE_NAME);
    this.setMetaTag('property', 'og:type', 'website');
    this.setMetaTag('property', 'og:title', title);
    this.setMetaTag('property', 'og:description', this.DEFAULT_DESCRIPTION);
    this.setMetaTag('property', 'og:image', this.DEFAULT_IMAGE);
    this.setMetaTag('property', 'og:url', this.BASE_URL);

    // Twitter Card
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:site', '@queryindo');
    this.setMetaTag('name', 'twitter:title', title);
    this.setMetaTag('name', 'twitter:description', this.DEFAULT_DESCRIPTION);
    this.setMetaTag('name', 'twitter:image', this.DEFAULT_IMAGE);

    // Schema.org WebSite & NewsMediaOrganization
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsMediaOrganization',
          '@id': `${this.BASE_URL}/#organization`,
          'name': 'QUERYINDO',
          'url': this.BASE_URL,
          'logo': {
            '@type': 'ImageObject',
            'url': this.DEFAULT_IMAGE,
            'width': 512,
            'height': 512
          },
          'sameAs': [
            'https://twitter.com/queryindo',
            'https://linkedin.com/company/queryindo'
          ]
        },
        {
          '@type': 'WebSite',
          '@id': `${this.BASE_URL}/#website`,
          'url': this.BASE_URL,
          'name': 'QUERYINDO',
          'publisher': { '@id': `${this.BASE_URL}/#organization` },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${this.BASE_URL}/?search={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      ]
    });
  }

  // Set SEO for Single Article Reader
  public static setArticleSEO(article: Article) {
    const title = `${article.title} — ${this.SITE_NAME}`;
    const description = article.subtitle || article.title;
    const cleanSlug = article.slug || article.id;
    const articleUrl = `${this.BASE_URL}/berita/${cleanSlug}`;
    const imageUrl = article.imageUrl || this.DEFAULT_IMAGE;

    document.title = title;
    this.setMetaTag('name', 'description', description);
    this.setCanonical(articleUrl);

    // OpenGraph Article
    this.setMetaTag('property', 'og:site_name', this.SITE_NAME);
    this.setMetaTag('property', 'og:type', 'article');
    this.setMetaTag('property', 'og:title', article.title);
    this.setMetaTag('property', 'og:description', description);
    this.setMetaTag('property', 'og:image', imageUrl);
    this.setMetaTag('property', 'og:url', articleUrl);
    this.setMetaTag('property', 'article:published_time', article.publishedAt);
    this.setMetaTag('property', 'article:modified_time', article.publishedAt);
    this.setMetaTag('property', 'article:section', article.category.toUpperCase());
    this.setMetaTag('property', 'article:author', article.author.name);

    // Twitter Card
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:site', '@queryindo');
    this.setMetaTag('name', 'twitter:title', article.title);
    this.setMetaTag('name', 'twitter:description', description);
    this.setMetaTag('name', 'twitter:image', imageUrl);

    // Schema.org NewsArticle Rich Snippet for Google News / Discover
    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': articleUrl
      },
      'headline': article.title,
      'description': description,
      'image': [imageUrl],
      'datePublished': article.publishedAt,
      'dateModified': article.publishedAt,
      'articleSection': article.category.toUpperCase(),
      'inLanguage': 'id-ID',
      'isAccessibleForFree': 'True',
      'isPartOf': {
        '@type': ['CreativeWork', 'Product'],
        'name': 'QUERYINDO',
        'productID': 'CAowvezHDA:openaccess'
      },
      'author': {
        '@type': 'Person',
        'name': article.author.name,
        'jobTitle': article.author.role || 'Jurnalis Teknologi Terverifikasi'
      },
      'publisher': {
        '@type': 'NewsMediaOrganization',
        'name': 'QUERYINDO',
        'url': this.BASE_URL,
        'logo': {
          '@type': 'ImageObject',
          'url': `${this.BASE_URL}/logo.png`,
          'width': 512,
          'height': 512
        }
      }
    });
  }

  // Set SEO for Institutional & Corporate Pages
  public static setPageSEO(pageId: string, pageTitle: string, description?: string) {
    const title = `${pageTitle} — ${this.SITE_NAME}`;
    const pageUrl = `${this.BASE_URL}/page/${pageId}`;
    const pageDesc = description || `Informasi resmi ${pageTitle} portal jurnalisme teknologi independen QUERYINDO.`;

    document.title = title;
    this.setMetaTag('name', 'description', pageDesc);
    this.setCanonical(pageUrl);

    this.setMetaTag('property', 'og:site_name', this.SITE_NAME);
    this.setMetaTag('property', 'og:type', 'website');
    this.setMetaTag('property', 'og:title', title);
    this.setMetaTag('property', 'og:description', pageDesc);
    this.setMetaTag('property', 'og:image', `${this.BASE_URL}/og-image.png`);
    this.setMetaTag('property', 'og:url', pageUrl);

    this.setMetaTag('name', 'twitter:card', 'summary');
    this.setMetaTag('name', 'twitter:title', title);
    this.setMetaTag('name', 'twitter:description', pageDesc);
  }

  // Set SEO for Category Feed Pages
  public static setCategorySEO(categoryName: string, categoryId: string) {
    const title = `Berita ${categoryName} Terkini & Analisis Mendalam — ${this.SITE_NAME}`;
    const catUrl = `${this.BASE_URL}/kategori/${categoryId}`;
    const catDesc = `Kumpulan berita, analisis mendalam, dan laporan investigasi seputar ${categoryName} di Indonesia dan global oleh redaksi QUERYINDO.`;

    document.title = title;
    this.setMetaTag('name', 'description', catDesc);
    this.setCanonical(catUrl);

    this.setMetaTag('property', 'og:site_name', this.SITE_NAME);
    this.setMetaTag('property', 'og:type', 'website');
    this.setMetaTag('property', 'og:title', title);
    this.setMetaTag('property', 'og:description', catDesc);
    this.setMetaTag('property', 'og:url', catUrl);
  }
}
