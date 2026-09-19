package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	DefaultIndexNowKey = "queryindo7a9f8b1c2d3e4f5a6b7c8d9e0"
	DefaultBaseURL     = "https://queryindo.com"
	PubSubHubbubHubURL = "https://pubsubhubbub.appspot.com/"
	IndexNowEndpoint   = "https://api.indexnow.org/indexnow"
)

// GetIndexNowKey returns active IndexNow verification key from env or default
func GetIndexNowKey() string {
	k := os.Getenv("INDEXNOW_KEY")
	if k != "" {
		return k
	}
	return DefaultIndexNowKey
}

// IndexNowPayload structure for IndexNow API
type IndexNowPayload struct {
	Host        string   `json:"host"`
	Key         string   `json:"key"`
	KeyLocation string   `json:"keyLocation"`
	URLList     []string `json:"urlList"`
}

// PingSearchEngines sends instant indexing notifications to IndexNow and PubSubHubbub
func PingSearchEngines(slug string) {
	if slug == "" {
		return
	}
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	articleURL := fmt.Sprintf("%s/berita/%s", strings.TrimRight(baseURL, "/"), slug)
	PingBatchURLs([]string{articleURL})
}

// PingBatchURLs notifies both IndexNow and PubSubHubbub for a list of URLs
func PingBatchURLs(urls []string) {
	if len(urls) == 0 {
		return
	}

	go func(targetURLs []string) {
		baseURL := os.Getenv("BASE_URL")
		if baseURL == "" {
			baseURL = DefaultBaseURL
		}
		host := strings.TrimPrefix(strings.TrimPrefix(baseURL, "https://"), "http://")
		host = strings.Split(host, "/")[0]

		key := GetIndexNowKey()
		keyLocation := fmt.Sprintf("%s/%s.txt", strings.TrimRight(baseURL, "/"), key)

		// 1. Ping IndexNow (Bing, Yandex, Seznam, Naver)
		client := &http.Client{Timeout: 10 * time.Second}
		payload := IndexNowPayload{
			Host:        host,
			Key:         key,
			KeyLocation: keyLocation,
			URLList:     targetURLs,
		}

		jsonBody, err := json.Marshal(payload)
		if err == nil {
			req, rErr := http.NewRequest("POST", IndexNowEndpoint, bytes.NewBuffer(jsonBody))
			if rErr == nil {
				req.Header.Set("Content-Type", "application/json; charset=utf-8")
				resp, pErr := client.Do(req)
				if pErr != nil {
					log.Printf("⚠️ [SEO-PING] IndexNow request failed: %v", pErr)
				} else {
					defer resp.Body.Close()
					respBody, _ := io.ReadAll(resp.Body)
					log.Printf("🚀 [SEO-PING] IndexNow response: status=%d urls=%d msg=%s", resp.StatusCode, len(targetURLs), string(respBody))
				}
			}
		}

		// 2. Ping PubSubHubbub for RSS feed update
		rssURL := fmt.Sprintf("%s/rss.xml", strings.TrimRight(baseURL, "/"))
		form := url.Values{}
		form.Add("hub.mode", "publish")
		form.Add("hub.url", rssURL)

		reqHub, hErr := http.NewRequest("POST", PubSubHubbubHubURL, strings.NewReader(form.Encode()))
		if hErr == nil {
			reqHub.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			respHub, hubErr := client.Do(reqHub)
			if hubErr != nil {
				log.Printf("⚠️ [SEO-PING] PubSubHubbub ping failed: %v", hubErr)
			} else {
				defer respHub.Body.Close()
				log.Printf("📡 [SEO-PING] PubSubHubbub ping sent: status=%d (hub.url=%s)", respHub.StatusCode, rssURL)
			}
		}
	}(urls)
}
