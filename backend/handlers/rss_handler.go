package handlers

import (
	"encoding/xml"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
	"byteindonesia/backend/utils"
)

// RSS 2.0 Structs
type AtomLink struct {
	XMLName xml.Name `xml:"atom:link"`
	Href    string   `xml:"href,attr"`
	Rel     string   `xml:"rel,attr"`
	Type    string   `xml:"type,attr,omitempty"`
}

type RSSItem struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate"`
	GUID        string `xml:"guid"`
	Category    string `xml:"category"`
	Author      string `xml:"author"`
}

type RSSChannel struct {
	Title         string     `xml:"title"`
	Link          string     `xml:"link"`
	Description   string     `xml:"description"`
	Language      string     `xml:"language"`
	LastBuildDate string     `xml:"lastBuildDate"`
	AtomLinks     []AtomLink `xml:"atom:link"`
	Items         []RSSItem  `xml:"item"`
}

type RSS struct {
	XMLName   xml.Name   `xml:"rss"`
	Version   string     `xml:"version,attr"`
	XmlnsAtom string     `xml:"xmlns:atom,attr"`
	Channel   RSSChannel `xml:"channel"`
}

// JSON Feed 1.1 Structs
type JSONFeedItem struct {
	ID            string   `json:"id"`
	URL           string   `json:"url"`
	Title         string   `json:"title"`
	Summary       string   `json:"summary_text"`
	ContentHTML   string   `json:"content_html"`
	DatePublished string   `json:"date_published"`
	Image         string   `json:"image"`
	Tags          []string `json:"tags"`
}

type JSONFeed struct {
	Version     string         `json:"version"`
	Title       string         `json:"title"`
	HomeStyle   string         `json:"home_page_url"`
	FeedURL     string         `json:"feed_url"`
	Description string         `json:"description"`
	Icon        string         `json:"icon"`
	Favicon     string         `json:"favicon"`
	Items       []JSONFeedItem `json:"items"`
}

// Sitemap 0.9 Structs
type SitemapURL struct {
	Loc        string  `xml:"loc"`
	LastMod    string  `xml:"lastmod"`
	ChangeFreq string  `xml:"changefreq"`
	Priority   float32 `xml:"priority"`
}

type URLSet struct {
	XMLName xml.Name     `xml:"http://www.sitemaps.org/schemas/sitemap/0.9 urlset"`
	URLs    []SitemapURL `xml:"url"`
}

// News Sitemap Structs (Google News 0.9)
type NewsPublication struct {
	Name     string `xml:"news:name"`
	Language string `xml:"news:language"`
}

type NewsStory struct {
	Publication     NewsPublication `xml:"news:publication"`
	PublicationDate string          `xml:"news:publication_date"`
	Title           string          `xml:"news:title"`
}

type NewsURL struct {
	Loc  string    `xml:"loc"`
	News NewsStory `xml:"news:news"`
}

type NewsURLSet struct {
	XMLName   xml.Name  `xml:"http://www.sitemaps.org/schemas/sitemap/0.9 urlset"`
	XmlnsNews string    `xml:"xmlns:news,attr"`
	URLs      []NewsURL `xml:"url"`
}

// GetRSSFeed renders valid XML RSS 2.0 feed with PubSubHubbub integration
func GetRSSFeed(c *fiber.Ctx) error {
	var articles []models.Article
	db := database.DB

	if db != nil {
		db.Order("published_at desc").Limit(30).Find(&articles)
	}

	baseUrl := "https://queryindo.com"
	nowStr := time.Now().Format(time.RFC1123Z)

	var items []RSSItem
	if len(articles) > 0 {
		for _, art := range articles {
			artUrl := fmt.Sprintf("%s/berita/%s", baseUrl, art.Slug)
			pubTimeStr := art.PublishedAt.Format(time.RFC1123Z)
			authorName := art.Author.Name
			if authorName == "" {
				authorName = "Redaksi QUERYINDO"
			}

			items = append(items, RSSItem{
				Title:       art.Title,
				Link:        artUrl,
				Description: art.Subtitle,
				PubDate:     pubTimeStr,
				GUID:        artUrl,
				Category:    art.CategoryID,
				Author:      authorName,
			})
		}
	} else {
		// Fallback articles if DB is temporarily empty
		fallbackArticles := []struct {
			Title    string
			Slug     string
			Subtitle string
			Category string
		}{
			{
				Title:    "Indonesia Tak Mau Cuma Jadi Pengguna AI, Pemerintah Bidik Posisi Strategis",
				Slug:     "indonesia-tak-mau-cuma-jadi-pengguna-ai-pemerintah-bidik-posisi-strategis",
				Subtitle: "Wamenkomdigi Nezar Patria menilai Indonesia perlu mengambil posisi dalam rantai industri AI global, mulai dari infrastruktur hingga semikonduktor.",
				Category: "ai",
			},
			{
				Title:    "Belanja AI Tembus US$795 Miliar, Investor Mulai Pertanyakan Keberlanjutannya",
				Slug:     "belanja-ai-tembus-us-795-miliar-investor-mulai-pertanyakan-keberlanjutannya",
				Subtitle: "Microsoft, Alphabet, Amazon, Meta, dan Oracle diperkirakan menggelontorkan sekitar US$795 miliar untuk belanja modal pada 2026.",
				Category: "ai",
			},
			{
				Title:    "CEO Anthropic Minta Pengembangan AI Diperlambat, Ini Alasannya",
				Slug:     "ceo-anthropic-minta-pengembangan-ai-diperlambat-ini-alasannya",
				Subtitle: "Dario Amodei menilai perkembangan kemampuan AI bergerak terlalu cepat dibanding kesiapan sistem keselamatan.",
				Category: "ai",
			},
		}
		for _, art := range fallbackArticles {
			artUrl := fmt.Sprintf("%s/berita/%s", baseUrl, art.Slug)
			items = append(items, RSSItem{
				Title:       art.Title,
				Link:        artUrl,
				Description: art.Subtitle,
				PubDate:     nowStr,
				GUID:        artUrl,
				Category:    art.Category,
				Author:      "Redaksi QUERYINDO",
			})
		}
	}

	atomLinks := []AtomLink{
		{Href: baseUrl + "/rss.xml", Rel: "self", Type: "application/rss+xml"},
		{Href: "https://pubsubhubbub.appspot.com/", Rel: "hub"},
	}

	rssData := RSS{
		Version:   "2.0",
		XmlnsAtom: "http://www.w3.org/2005/Atom",
		Channel: RSSChannel{
			Title:         "QUERYINDO — Portal Berita Teknologi Terdepan",
			Link:          baseUrl,
			Description:   "Jurnalisme teknologi independen, kritis, dan berintegritas khusus AI, Gadget, & Kedaulatan Digital RI",
			Language:      "id-ID",
			LastBuildDate: nowStr,
			AtomLinks:     atomLinks,
			Items:         items,
		},
	}

	c.Set("Content-Type", "application/xml; charset=utf-8")
	xmlBytes, err := xml.MarshalIndent(rssData, "", "  ")
	if err != nil {
		return c.Status(500).SendString("Error generating RSS feed")
	}

	return c.SendString(xml.Header + string(xmlBytes))
}

// GetJSONFeed renders valid JSON Feed 1.1
func GetJSONFeed(c *fiber.Ctx) error {
	var articles []models.Article
	db := database.DB

	if db != nil {
		db.Order("published_at desc").Limit(20).Find(&articles)
	}

	baseUrl := "https://queryindo.com"

	var items []JSONFeedItem
	for _, art := range articles {
		artUrl := fmt.Sprintf("%s/berita/%s", baseUrl, art.Slug)
		tags := []string{art.CategoryID}

		items = append(items, JSONFeedItem{
			ID:            art.ID,
			URL:           artUrl,
			Title:         art.Title,
			Summary:       art.Subtitle,
			ContentHTML:   art.Content,
			DatePublished: art.PublishedAt.Format(time.RFC3339),
			Image:         art.ImageURL,
			Tags:          tags,
		})
	}

	jsonFeed := JSONFeed{
		Version:     "https://jsonfeed.org/version/1.1",
		Title:       "QUERYINDO News Feed",
		HomeStyle:   baseUrl,
		FeedURL:     baseUrl + "/feed.json",
		Description: "Portal Berita Teknologi Terdepan & Terupdate",
		Icon:        baseUrl + "/logo.png",
		Favicon:     baseUrl + "/favicon.svg",
		Items:       items,
	}

	return c.JSON(jsonFeed)
}

// GET /sitemap.xml (Dynamic Automated XML Sitemap for Google/Bing Indexing)
func GetSitemap(c *fiber.Ctx) error {
	baseUrl := "https://queryindo.com"
	nowDate := time.Now().Format("2006-01-02")

	// Base Static URLs
	urls := []SitemapURL{
		{Loc: baseUrl + "/", LastMod: nowDate, ChangeFreq: "hourly", Priority: 1.0},
		{Loc: baseUrl + "/kategori/ai", LastMod: nowDate, ChangeFreq: "hourly", Priority: 0.9},
		{Loc: baseUrl + "/kategori/gadget", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/kategori/cybersecurity", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/kategori/startup", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/kategori/policy", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/kategori/telecom", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/kategori/developer", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/page/tentang-kami", LastMod: nowDate, ChangeFreq: "weekly", Priority: 0.7},
		{Loc: baseUrl + "/page/redaksi", LastMod: nowDate, ChangeFreq: "weekly", Priority: 0.7},
		{Loc: baseUrl + "/page/kode-etik", LastMod: nowDate, ChangeFreq: "monthly", Priority: 0.7},
		{Loc: baseUrl + "/page/pedoman-media-siber", LastMod: nowDate, ChangeFreq: "monthly", Priority: 0.7},
		{Loc: baseUrl + "/page/hubungi-kami", LastMod: nowDate, ChangeFreq: "monthly", Priority: 0.7},
		{Loc: baseUrl + "/page/disclaimer", LastMod: nowDate, ChangeFreq: "monthly", Priority: 0.5},
		{Loc: baseUrl + "/page/info-iklan", LastMod: nowDate, ChangeFreq: "monthly", Priority: 0.6},
	}

	var articles []models.Article
	if database.DB != nil {
		database.DB.Order("published_at desc").Limit(500).Find(&articles)
	}

	if len(articles) == 0 {
		mockSlugs := []string{
			"indonesia-tak-mau-cuma-jadi-pengguna-ai-pemerintah-bidik-posisi-strategis",
			"belanja-ai-tembus-us-795-miliar-investor-mulai-pertanyakan-keberlanjutannya",
			"ceo-anthropic-minta-pengembangan-ai-diperlambat-ini-alasannya",
		}
		for _, slug := range mockSlugs {
			urls = append(urls, SitemapURL{
				Loc:        fmt.Sprintf("%s/berita/%s", baseUrl, slug),
				LastMod:    nowDate,
				ChangeFreq: "hourly",
				Priority:   0.9,
			})
		}
	} else {
		for _, art := range articles {
			modTime := art.PublishedAt.Format("2006-01-02")
			urls = append(urls, SitemapURL{
				Loc:        fmt.Sprintf("%s/berita/%s", baseUrl, art.Slug),
				LastMod:    modTime,
				ChangeFreq: "daily",
				Priority:   0.9,
			})
		}
	}

	urlSet := URLSet{URLs: urls}

	c.Set("Content-Type", "application/xml; charset=utf-8")
	xmlBytes, err := xml.MarshalIndent(urlSet, "", "  ")
	if err != nil {
		return c.Status(500).SendString("Error generating sitemap XML")
	}

	return c.SendString(xml.Header + string(xmlBytes))
}

// GET /sitemap-news.xml (Google News XML Sitemap)
func GetNewsSitemap(c *fiber.Ctx) error {
	baseUrl := "https://queryindo.com"
	var articles []models.Article
	if database.DB != nil {
		// Google News prefers articles published in the last 48 hours, or latest articles
		twoDaysAgo := time.Now().Add(-48 * time.Hour)
		database.DB.Where("published_at >= ?", twoDaysAgo).Order("published_at desc").Limit(100).Find(&articles)
		if len(articles) == 0 {
			database.DB.Order("published_at desc").Limit(50).Find(&articles)
		}
	}

	var urls []NewsURL
	if len(articles) == 0 {
		mockItems := []struct {
			Slug  string
			Title string
		}{
			{"indonesia-tak-mau-cuma-jadi-pengguna-ai-pemerintah-bidik-posisi-strategis", "Indonesia Tak Mau Cuma Jadi Pengguna AI, Pemerintah Bidik Posisi Strategis"},
			{"belanja-ai-tembus-us-795-miliar-investor-mulai-pertanyakan-keberlanjutannya", "Belanja AI Tembus US$795 Miliar, Investor Mulai Pertanyakan Keberlanjutannya"},
			{"ceo-anthropic-minta-pengembangan-ai-diperlambat-ini-alasannya", "CEO Anthropic Minta Pengembangan AI Diperlambat, Ini Alasannya"},
		}
		nowStr := time.Now().Format(time.RFC3339)
		for _, item := range mockItems {
			urls = append(urls, NewsURL{
				Loc: fmt.Sprintf("%s/berita/%s", baseUrl, item.Slug),
				News: NewsStory{
					Publication: NewsPublication{
						Name:     "QUERYINDO",
						Language: "id",
					},
					PublicationDate: nowStr,
					Title:           item.Title,
				},
			})
		}
	} else {
		for _, art := range articles {
			urls = append(urls, NewsURL{
				Loc: fmt.Sprintf("%s/berita/%s", baseUrl, art.Slug),
				News: NewsStory{
					Publication: NewsPublication{
						Name:     "QUERYINDO",
						Language: "id",
					},
					PublicationDate: art.PublishedAt.Format(time.RFC3339),
					Title:           art.Title,
				},
			})
		}
	}

	urlSet := NewsURLSet{
		XmlnsNews: "http://www.google.com/schemas/sitemap-news/0.9",
		URLs:      urls,
	}

	c.Set("Content-Type", "application/xml; charset=utf-8")
	xmlBytes, err := xml.MarshalIndent(urlSet, "", "  ")
	if err != nil {
		return c.Status(500).SendString("Error generating Google News sitemap")
	}

	return c.SendString(xml.Header + string(xmlBytes))
}

// GET /queryindo7a9f8b1c2d3e4f5a6b7c8d9e0.txt (IndexNow Verification File)
func GetIndexNowKey(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/plain; charset=utf-8")
	return c.SendString(utils.GetIndexNowKey())
}

// POST /api/v1/seo/ping (Trigger manual ping to IndexNow & PubSubHubbub for all articles)
func TriggerSEOPing(c *fiber.Ctx) error {
	baseUrl := "https://queryindo.com"
	var urls []string

	if database.DB != nil {
		var articles []models.Article
		database.DB.Select("slug").Where("status = ?", "published").Order("published_at desc").Limit(100).Find(&articles)
		for _, art := range articles {
			urls = append(urls, fmt.Sprintf("%s/berita/%s", baseUrl, art.Slug))
		}
	}

	if len(urls) == 0 {
		urls = []string{
			baseUrl + "/berita/indonesia-tak-mau-cuma-jadi-pengguna-ai-pemerintah-bidik-posisi-strategis",
			baseUrl + "/berita/belanja-ai-tembus-us-795-miliar-investor-mulai-pertanyakan-keberlanjutannya",
			baseUrl + "/berita/ceo-anthropic-minta-pengembangan-ai-diperlambat-ini-alasannya",
		}
	}

	utils.PingBatchURLs(urls)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sinyal IndexNow dan PubSubHubbub berhasil dikirimkan ke mesin pencari",
		"urls":    urls,
	})
}

// GET /robots.txt
func GetRobotsTxt(c *fiber.Ctx) error {
	robotsTxt := `User-agent: *
Allow: /
Allow: /berita/
Allow: /kategori/
Allow: /page/
Allow: /api/v1/articles
Allow: /rss.xml
Allow: /feed.json
Allow: /sitemap.xml
Allow: /sitemap-news.xml
Allow: /queryindo7a9f8b1c2d3e4f5a6b7c8d9e0.txt
Disallow: /api/v1/auth/

User-agent: Googlebot
Allow: /
Allow: /berita/

User-agent: Googlebot-News
Allow: /
Allow: /berita/

Sitemap: https://queryindo.com/sitemap.xml
Sitemap: https://queryindo.com/sitemap-news.xml
`
	c.Set("Content-Type", "text/plain; charset=utf-8")
	return c.SendString(robotsTxt)
}
