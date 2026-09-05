package handlers

import (
	"encoding/xml"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
)

// RSS 2.0 Structs
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
	Title         string    `xml:"title"`
	Link          string    `xml:"link"`
	Description   string    `xml:"description"`
	Language      string    `xml:"language"`
	LastBuildDate string    `xml:"lastBuildDate"`
	Items         []RSSItem `xml:"item"`
}

type RSS struct {
	XMLName string     `xml:"rss"`
	Version string     `xml:"version,attr"`
	Channel RSSChannel `xml:"channel"`
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

// GetRSSFeed renders valid XML RSS 2.0 feed
func GetRSSFeed(c *fiber.Ctx) error {
	var articles []models.Article
	db := database.DB

	if db != nil {
		db.Order("published_at desc").Limit(20).Find(&articles)
	}

	baseUrl := "https://queryindo.id"
	nowStr := time.Now().Format(time.RFC1123Z)

	var items []RSSItem
	for _, art := range articles {
		artUrl := fmt.Sprintf("%s/#article/%s", baseUrl, art.Slug)
		pubTimeStr := art.PublishedAt.Format(time.RFC1123Z)

		items = append(items, RSSItem{
			Title:       art.Title,
			Link:        artUrl,
			Description: art.Subtitle,
			PubDate:     pubTimeStr,
			GUID:        artUrl,
			Category:    art.CategoryID,
			Author:      art.AuthorName,
		})
	}

	rssData := RSS{
		Version: "2.0",
		Channel: RSSChannel{
			Title:         "QUERYINDO — News Tech Feed",
			Link:          baseUrl,
			Description:   "Portal Berita Teknologi Terdepan & Terupdate khusus AI, Gadget, & Kedaulatan Digital RI",
			Language:      "id-ID",
			LastBuildDate: nowStr,
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

	baseUrl := "https://queryindo.id"

	var items []JSONFeedItem
	for _, art := range articles {
		artUrl := fmt.Sprintf("%s/#article/%s", baseUrl, art.Slug)
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
	baseUrl := "https://queryindo.id"
	nowDate := time.Now().Format("2006-01-02")

	// Base Static URLs
	urls := []SitemapURL{
		{Loc: baseUrl, LastMod: nowDate, ChangeFreq: "hourly", Priority: 1.0},
		{Loc: baseUrl + "/#category/ai", LastMod: nowDate, ChangeFreq: "hourly", Priority: 0.8},
		{Loc: baseUrl + "/#category/gadget", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/#category/cybersecurity", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/#category/startup", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
		{Loc: baseUrl + "/#category/policy", LastMod: nowDate, ChangeFreq: "daily", Priority: 0.8},
	}

	var articles []models.Article
	if database.DB != nil {
		database.DB.Order("published_at desc").Limit(100).Find(&articles)
	}

	// If DB is empty, provide default indexed articles
	if len(articles) == 0 {
		mockSlugs := []string{
			"pusat-data-nasional-superkomputer-ai-ikn",
			"apple-buka-fasilitas-rd-hardware-jakarta",
			"bappebti-luncurkan-sandbox-aset-kripto-fintech",
			"kemenkominfo-undang-undang-etika-kecerdasan-buatan",
			"satelit-satria-2-orbit-penetrasi-internet-3t",
		}
		for _, slug := range mockSlugs {
			urls = append(urls, SitemapURL{
				Loc:        fmt.Sprintf("%s/#article/%s", baseUrl, slug),
				LastMod:    nowDate,
				ChangeFreq: "hourly",
				Priority:   0.9,
			})
		}
	} else {
		for _, art := range articles {
			modTime := art.PublishedAt.Format("2006-01-02")
			urls = append(urls, SitemapURL{
				Loc:        fmt.Sprintf("%s/#article/%s", baseUrl, art.Slug),
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

// GET /robots.txt
func GetRobotsTxt(c *fiber.Ctx) error {
	robotsTxt := `User-agent: *
Allow: /
Allow: /api/v1/articles
Allow: /rss.xml
Allow: /feed.json
Allow: /sitemap.xml
Disallow: /api/v1/auth/

Sitemap: https://queryindo.id/sitemap.xml
`
	c.Set("Content-Type", "text/plain; charset=utf-8")
	return c.SendString(robotsTxt)
}
