package handlers

import (
	"html"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/models"

	"github.com/gofiber/fiber/v2"
)

var (
	htmlTemplateCache string
	htmlCacheMutex     sync.RWMutex
	lastTemplateCheck  time.Time

	// Precompiled regular expressions for fast meta tag replacement
	reTitle       = regexp.MustCompile(`(?i)<title>.*?</title>`)
	reMetaDesc    = regexp.MustCompile(`(?i)<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*/?>`)
	reCanonical   = regexp.MustCompile(`(?i)<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*/?>`)
	reOgUrl       = regexp.MustCompile(`(?i)<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*/?>`)
	reOgTitle     = regexp.MustCompile(`(?i)<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*/?>`)
	reOgDesc      = regexp.MustCompile(`(?i)<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*/?>`)
	reOgImage     = regexp.MustCompile(`(?i)<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*/?>`)
	reOgType      = regexp.MustCompile(`(?i)<meta\s+property=["']og:type["']\s+content=["'][^"']*["']\s*/?>`)
	reTwTitle     = regexp.MustCompile(`(?i)<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*/?>`)
	reTwDesc      = regexp.MustCompile(`(?i)<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*/?>`)
	reTwImage     = regexp.MustCompile(`(?i)<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*/?>`)
	reHtmlTags    = regexp.MustCompile(`<[^>]*>`)
	reMultiSpaces = regexp.MustCompile(`\s+`)
)

// getDistIndexPath returns the first existing index.html path from candidate paths
func getDistIndexPath() string {
	candidates := []string{
		os.Getenv("DIST_INDEX_PATH"),
		"/var/www/queryindo/dist/index.html",
		"../dist/index.html",
		"dist/index.html",
		"./dist/index.html",
	}

	for _, p := range candidates {
		if p == "" {
			continue
		}
		if fi, err := os.Stat(p); err == nil && !fi.IsDir() {
			return p
		}
	}
	return ""
}

// loadIndexHTML returns the raw index.html content with a 10-second refresh cache
func loadIndexHTML() (string, error) {
	htmlCacheMutex.RLock()
	if htmlTemplateCache != "" && time.Since(lastTemplateCheck) < 10*time.Second {
		content := htmlTemplateCache
		htmlCacheMutex.RUnlock()
		return content, nil
	}
	htmlCacheMutex.RUnlock()

	htmlCacheMutex.Lock()
	defer htmlCacheMutex.Unlock()

	path := getDistIndexPath()
	if path == "" {
		if htmlTemplateCache != "" {
			return htmlTemplateCache, nil
		}
		return "", os.ErrNotExist
	}

	bytes, err := os.ReadFile(path)
	if err != nil {
		if htmlTemplateCache != "" {
			return htmlTemplateCache, nil
		}
		return "", err
	}

	htmlTemplateCache = string(bytes)
	lastTemplateCheck = time.Now()
	return htmlTemplateCache, nil
}

// cleanExcerpt strips HTML/Markdown and returns a truncated plain text string
func cleanExcerpt(raw string, maxLen int) string {
	stripped := reHtmlTags.ReplaceAllString(raw, " ")
	stripped = strings.ReplaceAll(stripped, "#", "")
	stripped = strings.ReplaceAll(stripped, "*", "")
	stripped = strings.ReplaceAll(stripped, "`", "")
	stripped = reMultiSpaces.ReplaceAllString(stripped, " ")
	stripped = strings.TrimSpace(stripped)

	if len(stripped) <= maxLen {
		return stripped
	}
	runes := []rune(stripped)
	if len(runes) > maxLen {
		return string(runes[:maxLen]) + "..."
	}
	return stripped
}

// ServeArticleSSR serves the single page app with dynamically injected OpenGraph
// and Twitter meta tags for specific articles, allowing WhatsApp, Facebook, and
// Twitter crawlers to render the actual article thumbnail, title, and subtitle.
func ServeArticleSSR(c *fiber.Ctx) error {
	rawHTML, err := loadIndexHTML()
	if err != nil {
		return c.Status(500).SendString("dist/index.html tidak ditemukan.")
	}

	slug := strings.TrimSpace(c.Params("slug"))
	slug = strings.TrimPrefix(slug, "/")
	slug = strings.TrimSuffix(slug, "/")
	slug = strings.TrimSuffix(slug, ".html")

	// If no slug provided or database not ready, return standard index.html
	if slug == "" || database.DB == nil {
		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.SendString(rawHTML)
	}

	// Fetch article from database
	var article models.Article
	if err := database.DB.Where("slug = ? OR id = ?", slug, slug).First(&article).Error; err != nil || article.ID == "" {
		// Article not found: serve index.html anyway so frontend SPA can show friendly 404
		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.SendString(rawHTML)
	}

	// Build metadata
	title := article.Title + " — QUERYINDO"
	desc := article.Subtitle
	if strings.TrimSpace(desc) == "" {
		desc = cleanExcerpt(article.Content, 160)
	}
	if strings.TrimSpace(desc) == "" {
		desc = "Baca selengkapnya berita teknologi terpercaya hanya di QUERYINDO."
	}

	imageURL := strings.TrimSpace(article.ImageURL)
	if imageURL == "" {
		imageURL = "https://www.queryindo.com/og-image.png"
	} else if strings.HasPrefix(imageURL, "/") {
		imageURL = "https://www.queryindo.com" + imageURL
	}

	canonicalURL := "https://www.queryindo.com/berita/" + article.Slug

	escapedTitle := html.EscapeString(article.Title)
	escapedFullTitle := html.EscapeString(title)
	escapedDesc := html.EscapeString(desc)

	// Replace HTML tags
	res := rawHTML
	res = reTitle.ReplaceAllString(res, "<title>"+escapedFullTitle+"</title>")
	res = reMetaDesc.ReplaceAllString(res, `<meta name="description" content="`+escapedDesc+`" />`)
	res = reCanonical.ReplaceAllString(res, `<link rel="canonical" href="`+canonicalURL+`" />`)
	res = reOgUrl.ReplaceAllString(res, `<meta property="og:url" content="`+canonicalURL+`" />`)
	res = reOgTitle.ReplaceAllString(res, `<meta property="og:title" content="`+escapedTitle+`" />`)
	res = reOgDesc.ReplaceAllString(res, `<meta property="og:description" content="`+escapedDesc+`" />`)
	
	// Enhanced OpenGraph image tags with alt and secure_url
	ogImageBlock := `<meta property="og:image" content="` + imageURL + `" />` +
		"\n  " + `<meta property="og:image:secure_url" content="` + imageURL + `" />` +
		"\n  " + `<meta property="og:image:alt" content="` + escapedTitle + `" />` +
		"\n  " + `<meta property="og:image:width" content="1200" />` +
		"\n  " + `<meta property="og:image:height" content="630" />`
	res = reOgImage.ReplaceAllString(res, ogImageBlock)

	res = reOgType.ReplaceAllString(res, `<meta property="og:type" content="article" />`)
	res = reTwTitle.ReplaceAllString(res, `<meta name="twitter:title" content="`+escapedTitle+`" />`)
	res = reTwDesc.ReplaceAllString(res, `<meta name="twitter:description" content="`+escapedDesc+`" />`)
	res = reTwImage.ReplaceAllString(res, `<meta name="twitter:image" content="`+imageURL+`" />`)

	c.Set("Content-Type", "text/html; charset=utf-8")
	c.Set("Cache-Control", "public, max-age=60, s-maxage=300")
	return c.SendString(res)
}
