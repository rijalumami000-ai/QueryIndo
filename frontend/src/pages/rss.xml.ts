import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  let articles: any[] = [];

  // Try fetching live articles from backend if running
  try {
    const res = await fetch('http://localhost:8080/api/v1/articles?limit=50', {
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        articles = json.data;
      }
    }
  } catch {}

  const siteUrl = 'https://queryindo.com';
  const now = new Date().toUTCString();

  const escapeXml = (unsafe: string) => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const itemsXml = articles.map(art => {
    const artUrl = `${siteUrl}/berita/${art.slug || art.id}`;
    const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : now;
    const authorName = art.author?.name || 'Redaksi QueryIndo';
    const categoryName = art.category ? art.category.toUpperCase() : 'TEKNOLOGI';
    const desc = art.subtitle || (art.aiSummary && art.aiSummary[0]) || art.title;

    return `    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${artUrl}</link>
      <guid isPermaLink="true">${artUrl}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(categoryName)}</category>
      <author>${escapeXml(authorName)}</author>
      ${art.imageUrl ? `<enclosure url="${escapeXml(art.imageUrl)}" type="image/jpeg" length="0" />` : ''}
    </item>`;
  }).join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>QueryIndo — Portal Berita Teknologi Indonesia</title>
    <link>${siteUrl}</link>
    <description>Liputan mendalam, investigasi, dan analisis independen seputar AI, semikonduktor, keamanan siber, startup, dan transformasi digital Indonesia.</description>
    <language>id-ID</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon.svg</url>
      <title>QueryIndo</title>
      <link>${siteUrl}</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
};
