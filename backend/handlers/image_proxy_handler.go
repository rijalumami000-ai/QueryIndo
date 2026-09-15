package handlers

import (
	"crypto/tls"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

var httpClient = &http.Client{
	Timeout: 15 * time.Second,
	Transport: &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	},
}

// GET /api/v1/image-proxy?url=...
func ImageProxy(c *fiber.Ctx) error {
	rawURL := c.Query("url")
	if rawURL == "" {
		return c.Status(400).SendString("URL gambar diperlukan")
	}

	decodedURL, err := url.QueryUnescape(rawURL)
	if err == nil && decodedURL != "" {
		rawURL = decodedURL
	}

	// Format Google Drive sharing link if needed
	targetURL := rawURL
	if strings.Contains(targetURL, "drive.google.com") || strings.Contains(targetURL, "lh3.googleusercontent.com") {
		// Extract file ID
		var fileID string
		if strings.Contains(targetURL, "/file/d/") {
			parts := strings.Split(targetURL, "/file/d/")
			if len(parts) > 1 {
				fileID = strings.Split(parts[1], "/")[0]
			}
		} else if strings.Contains(targetURL, "id=") {
			u, err := url.Parse(targetURL)
			if err == nil {
				fileID = u.Query().Get("id")
			}
		} else if strings.Contains(targetURL, "/d/") {
			parts := strings.Split(targetURL, "/d/")
			if len(parts) > 1 {
				fileID = strings.Split(parts[1], "?")[0]
			}
		}

		if fileID != "" {
			targetURL = "https://drive.google.com/thumbnail?id=" + fileID + "&sz=w1200"
		}
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return c.Status(500).SendString("Gagal membuat request gambar")
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
	req.Header.Set("Referer", "")

	resp, err := httpClient.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		// If thumbnail fails, try lh3 fallback
		if strings.Contains(targetURL, "drive.google.com/thumbnail?id=") {
			fileID := strings.TrimPrefix(targetURL, "https://drive.google.com/thumbnail?id=")
			fileID = strings.Split(fileID, "&")[0]
			altURL := "https://lh3.googleusercontent.com/d/" + fileID
			reqAlt, _ := http.NewRequest("GET", altURL, nil)
			reqAlt.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
			respAlt, errAlt := httpClient.Do(reqAlt)
			if errAlt == nil && respAlt.StatusCode < 400 {
				defer respAlt.Body.Close()
				c.Set("Content-Type", respAlt.Header.Get("Content-Type"))
				c.Set("Cache-Control", "public, max-age=604800, immutable")
				c.Set("Access-Control-Allow-Origin", "*")
				bodyBytes, _ := io.ReadAll(respAlt.Body)
				return c.Send(bodyBytes)
			}
		}
		// Redirect to default fallback if unreachable
		return c.Redirect("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", 302)
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	if contentType == "" || strings.Contains(contentType, "text/") {
		contentType = "image/jpeg"
	}

	c.Set("Content-Type", contentType)
	c.Set("Cache-Control", "public, max-age=604800, immutable")
	c.Set("Access-Control-Allow-Origin", "*")

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(500).SendString("Gagal membaca data gambar")
	}

	return c.Send(bodyBytes)
}
