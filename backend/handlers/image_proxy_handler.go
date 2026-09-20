package handlers

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

var safeDialer = &net.Dialer{
	Timeout:   8 * time.Second,
	KeepAlive: 15 * time.Second,
}

// secureHTTPClient enforces strict Anti-SSRF at both redirect time and TCP socket dial time
var secureHTTPClient = &http.Client{
	Timeout: 12 * time.Second,
	// CheckRedirect validates every single hop to prevent open redirect SSRF bypasses
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) >= 3 {
			return fmt.Errorf("terlalu banyak redirect (maksimal 3 redirect)")
		}
		if _, err := validateSafeTargetURL(req.URL.String()); err != nil {
			return fmt.Errorf("redirect ditolak (SSRF protection): %w", err)
		}
		return nil
	},
	Transport: &http.Transport{
		// DialContext verifies physical IP at exact moment of connection to defeat DNS Rebinding (TOCTOU)
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, fmt.Errorf("format target host:port tidak valid: %w", err)
			}

			ips, err := net.DefaultResolver.LookupIP(ctx, "ip", host)
			if err != nil {
				return nil, fmt.Errorf("resolusi DNS gagal untuk %s: %w", host, err)
			}

			if len(ips) == 0 {
				return nil, fmt.Errorf("tidak ada alamat IP ditemukan untuk %s", host)
			}

			var safeIP net.IP
			for _, ip := range ips {
				if isRestrictedIP(ip) {
					return nil, fmt.Errorf("akses ditolak (SSRF): IP target %s adalah jaringan internal/privat", ip.String())
				}
				if safeIP == nil {
					safeIP = ip
				}
			}

			// Connect directly to the validated IP address
			safeAddr := net.JoinHostPort(safeIP.String(), port)
			return safeDialer.DialContext(ctx, network, safeAddr)
		},
		TLSClientConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
		},
		ResponseHeaderTimeout: 10 * time.Second,
	},
}

// isRestrictedIP validates that an IP address is NOT private, loopback, link-local, multicast, or unspecified.
func isRestrictedIP(ip net.IP) bool {
	if ip == nil {
		return true
	}
	// Loopback: 127.0.0.0/8, ::1
	if ip.IsLoopback() {
		return true
	}
	// Unspecified: 0.0.0.0, ::
	if ip.IsUnspecified() {
		return true
	}
	// Link-local: 169.254.0.0/16, fe80::/10 (AWS/GCP/Azure instance metadata service 169.254.169.254!)
	if ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}
	// Multicast
	if ip.IsMulticast() {
		return true
	}
	// Private IP blocks: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
	if ip.IsPrivate() {
		return true
	}
	return false
}

// validateSafeTargetURL checks if the parsed URL targets an external public internet IP (Anti-SSRF)
func validateSafeTargetURL(rawURL string) (string, error) {
	u, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return "", fmt.Errorf("format URL tidak valid: %v", err)
	}

	scheme := strings.ToLower(u.Scheme)
	if scheme != "http" && scheme != "https" {
		return "", fmt.Errorf("skema protokol hanya mendukung HTTP dan HTTPS")
	}

	hostname := u.Hostname()
	if hostname == "" {
		return "", fmt.Errorf("hostname tidak ditemukan dalam URL")
	}

	// Reject obvious loopback and internal domain names
	lowerHost := strings.ToLower(hostname)
	if lowerHost == "localhost" || strings.HasSuffix(lowerHost, ".local") || strings.HasSuffix(lowerHost, ".internal") {
		return "", fmt.Errorf("target hostname internal tidak diizinkan")
	}

	// Resolve DNS host to check physical IP destinations
	ips, err := net.LookupIP(hostname)
	if err != nil {
		return "", fmt.Errorf("gagal meresolusi alamat IP untuk hostname %s: %v", hostname, err)
	}

	if len(ips) == 0 {
		return "", fmt.Errorf("tidak ada alamat IP yang ditemukan untuk hostname %s", hostname)
	}

	for _, ip := range ips {
		if isRestrictedIP(ip) {
			return "", fmt.Errorf("akses ditolak: IP target (%s) merupakan jaringan lokal/privat/internal", ip.String())
		}
	}

	return u.String(), nil
}

// GET /api/v1/image-proxy?url=...
func ImageProxy(c *fiber.Ctx) error {
	rawURL := c.Query("url")
	if rawURL == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Parameter 'url' gambar diperlukan")
	}

	decodedURL, err := url.QueryUnescape(rawURL)
	if err == nil && decodedURL != "" {
		rawURL = decodedURL
	}

	// Format Google Drive sharing links to direct image thumbnail CDN if detected
	targetURL := rawURL
	if strings.Contains(targetURL, "drive.google.com") || strings.Contains(targetURL, "lh3.googleusercontent.com") {
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

	// Anti-SSRF Validation
	safeURL, err := validateSafeTargetURL(targetURL)
	if err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Akses Ditolak (Proteksi Keamanan SSRF): " + err.Error(),
		})
	}

	req, err := http.NewRequest("GET", safeURL, nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Gagal membuat request gambar")
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
	req.Header.Set("Referer", "")

	resp, err := secureHTTPClient.Do(req)
	if err != nil || resp.StatusCode >= 400 {
		// If thumbnail fails and was drive thumbnail, try lh3 CDN safely
		if strings.Contains(targetURL, "drive.google.com/thumbnail?id=") {
			fileID := strings.TrimPrefix(targetURL, "https://drive.google.com/thumbnail?id=")
			fileID = strings.Split(fileID, "&")[0]
			altURL := "https://lh3.googleusercontent.com/d/" + fileID
			
			if safeAltURL, errAltSafe := validateSafeTargetURL(altURL); errAltSafe == nil {
				reqAlt, _ := http.NewRequest("GET", safeAltURL, nil)
				reqAlt.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
				respAlt, errAlt := secureHTTPClient.Do(reqAlt)
				if errAlt == nil && respAlt.StatusCode < 400 {
					defer respAlt.Body.Close()
					c.Set("Content-Type", respAlt.Header.Get("Content-Type"))
					c.Set("Cache-Control", "public, max-age=604800, immutable")
					c.Set("Access-Control-Allow-Origin", "*")
					c.Set("X-Content-Type-Options", "nosniff")
					// Limit to 10MB
					bodyBytes, _ := io.ReadAll(io.LimitReader(respAlt.Body, 10*1024*1024))
					return c.Send(bodyBytes)
				}
			}
		}
		// Redirect to safe fallback CDN if unreachable
		return c.Redirect("https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80", 302)
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	contentTypeLower := strings.ToLower(contentType)
	// Enforce image MIME type
	if !strings.HasPrefix(contentTypeLower, "image/") && !strings.Contains(contentTypeLower, "application/octet-stream") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Target URL tidak mengembalikan berkas gambar yang valid (Content-Type bukan image/*).",
		})
	}

	if contentType == "" || strings.Contains(contentType, "text/") {
		contentType = "image/jpeg"
	}

	// Enforce 10MB maximum download limit to prevent DoS/OOM
	bodyBytes, err := io.ReadAll(io.LimitReader(resp.Body, 10*1024*1024))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Gagal membaca data gambar")
	}

	c.Set("Content-Type", contentType)
	c.Set("Cache-Control", "public, max-age=604800, immutable")
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("X-Content-Type-Options", "nosniff")

	return c.Send(bodyBytes)
}
