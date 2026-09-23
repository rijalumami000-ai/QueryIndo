package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	CloudflareAPIBase = "https://api.cloudflare.com/client/v4"
)

// CloudflareConfig holds the Cloudflare API credentials
type CloudflareConfig struct {
	ZoneID   string
	APIToken string
}

// GetCloudflareConfig reads Cloudflare credentials from environment variables
func GetCloudflareConfig() CloudflareConfig {
	return CloudflareConfig{
		ZoneID:   os.Getenv("CLOUDFLARE_ZONE_ID"),
		APIToken: os.Getenv("CLOUDFLARE_API_TOKEN"),
	}
}

// IsCloudflareConfigured returns true if both Zone ID and API Token are set
func IsCloudflareConfigured() bool {
	cfg := GetCloudflareConfig()
	return cfg.ZoneID != "" && cfg.APIToken != ""
}

// GetCloudflareConfigStatus returns a summary of Cloudflare integration state
func GetCloudflareConfigStatus() map[string]interface{} {
	cfg := GetCloudflareConfig()
	configured := cfg.ZoneID != "" && cfg.APIToken != ""

	// Mask Zone ID for security (show first 6 chars only)
	maskedZoneID := ""
	if cfg.ZoneID != "" {
		if len(cfg.ZoneID) > 6 {
			maskedZoneID = cfg.ZoneID[:6] + "••••••••"
		} else {
			maskedZoneID = "••••••"
		}
	}

	return map[string]interface{}{
		"configured": configured,
		"zone_id":    maskedZoneID,
		"provider":   "Cloudflare",
		"api_base":   CloudflareAPIBase,
	}
}

// cloudflareRequest is a helper for making authenticated Cloudflare API calls
func cloudflareRequest(method, endpoint string, body interface{}) (int, []byte, error) {
	cfg := GetCloudflareConfig()
	if cfg.ZoneID == "" || cfg.APIToken == "" {
		return 0, nil, fmt.Errorf("Cloudflare credentials not configured")
	}

	url := fmt.Sprintf("%s/zones/%s/%s", CloudflareAPIBase, cfg.ZoneID, endpoint)

	var reqBody io.Reader
	if body != nil {
		jsonBytes, err := json.Marshal(body)
		if err != nil {
			return 0, nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBytes)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+cfg.APIToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("Cloudflare API request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	return resp.StatusCode, respBody, nil
}

// PurgeCloudflareURLs purges specific URLs from Cloudflare's edge cache
func PurgeCloudflareURLs(urls []string) error {
	if len(urls) == 0 {
		return nil
	}

	if !IsCloudflareConfigured() {
		log.Println("ℹ️ [Cloudflare] Credentials not set, skipping CDN purge")
		return nil
	}

	payload := map[string]interface{}{
		"files": urls,
	}

	statusCode, respBody, err := cloudflareRequest("POST", "purge_cache", payload)
	if err != nil {
		log.Printf("⚠️ [Cloudflare] Purge request error: %v", err)
		return err
	}

	if statusCode >= 200 && statusCode < 300 {
		log.Printf("✅ [Cloudflare] Cache purged successfully for %d URLs (HTTP %d)", len(urls), statusCode)
	} else {
		log.Printf("⚠️ [Cloudflare] Purge returned HTTP %d: %s", statusCode, string(respBody))
		return fmt.Errorf("Cloudflare purge failed with HTTP %d", statusCode)
	}

	return nil
}

// PurgeCloudflareEverything purges the entire zone cache
func PurgeCloudflareEverything() error {
	if !IsCloudflareConfigured() {
		log.Println("ℹ️ [Cloudflare] Credentials not set, skipping full purge")
		return nil
	}

	payload := map[string]interface{}{
		"purge_everything": true,
	}

	statusCode, respBody, err := cloudflareRequest("POST", "purge_cache", payload)
	if err != nil {
		log.Printf("⚠️ [Cloudflare] Full purge request error: %v", err)
		return err
	}

	if statusCode >= 200 && statusCode < 300 {
		log.Printf("✅ [Cloudflare] Full zone cache purged successfully (HTTP %d)", statusCode)
	} else {
		log.Printf("⚠️ [Cloudflare] Full purge returned HTTP %d: %s", statusCode, string(respBody))
		return fmt.Errorf("Cloudflare full purge failed with HTTP %d", statusCode)
	}

	return nil
}

// PurgeArticleCache purges all cache entries related to a specific article
// This is the main hook called from article CRUD handlers
func PurgeArticleCache(slug string, categoryID string) {
	if !IsCloudflareConfigured() {
		log.Println("ℹ️ [Cloudflare] Credentials not set, skipping article cache purge")
		return
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	baseURL = strings.TrimRight(baseURL, "/")

	// Collect all URLs that should be invalidated when an article changes
	urls := []string{
		baseURL + "/",                       // Homepage
		baseURL + "/berita/" + slug,         // Article page
		baseURL + "/rss.xml",                // RSS feed
		baseURL + "/sitemap.xml",            // Main sitemap
		baseURL + "/sitemap-news.xml",       // News sitemap
		baseURL + "/feed.json",              // JSON feed
	}

	// Add category page if available
	if categoryID != "" {
		urls = append(urls, baseURL+"/kategori/"+categoryID)
	}

	log.Printf("🔄 [Cloudflare Hook] Triggering automatic cache purge for slug: %s (%d URLs)", slug, len(urls))

	// Run purge asynchronously so it doesn't block the API response
	go func(targetURLs []string) {
		if err := PurgeCloudflareURLs(targetURLs); err != nil {
			log.Printf("⚠️ [Cloudflare Hook] Async purge failed: %v", err)
		}
	}(urls)
}
