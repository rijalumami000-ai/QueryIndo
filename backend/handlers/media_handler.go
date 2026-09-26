package handlers

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"byteindonesia/backend/utils"
	"github.com/disintegration/imaging"
	"github.com/gofiber/fiber/v2"
	_ "golang.org/x/image/webp"
)

// Allowed MIME types for media upload
var allowedMIMEs = map[string]string{
	"image/jpeg": ".jpg",
	"image/jpg":  ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
	"image/avif": ".avif",
}

// GetUploadBaseDir returns the base directory for uploaded media
func GetUploadBaseDir() string {
	// If running on VPS in /var/www/queryindo
	if _, err := os.Stat("/var/www/queryindo"); err == nil {
		return "/var/www/queryindo/uploads"
	}
	// Fallback to local dev directory
	return "./uploads"
}

// EnsureUploadDirs ensures upload directory and cache directory exist
func EnsureUploadDirs() error {
	baseDir := GetUploadBaseDir()
	yearMonth := time.Now().Format("2006/01")
	targetDir := filepath.Join(baseDir, "articles", filepath.FromSlash(yearMonth))
	cacheDir := filepath.Join(baseDir, ".cache")

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return err
	}
	return nil
}

// POST /api/v1/media/upload
// Handles direct image upload from Studio CMS (HP / Laptop)
func UploadMedia(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File gambar tidak ditemukan dalam formulir (field 'file' diperlukan).",
		})
	}

	// 15 MB Maximum Limit
	const maxFileSize = 15 * 1024 * 1024
	if file.Size > maxFileSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Ukuran file terlalu besar. Maksimum ukuran gambar adalah 15 MB.",
		})
	}

	// Check content type
	contentType := file.Header.Get("Content-Type")
	ext, ok := allowedMIMEs[strings.ToLower(contentType)]
	if !ok {
		// Fallback check extension from filename
		fileExt := strings.ToLower(filepath.Ext(file.Filename))
		if fileExt == ".jpg" || fileExt == ".jpeg" || fileExt == ".png" || fileExt == ".webp" || fileExt == ".gif" || fileExt == ".avif" {
			ext = fileExt
		} else {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format file tidak didukung. Harap unggah berkas gambar (JPG, PNG, WebP, GIF, AVIF).",
			})
		}
	}

	now := time.Now()
	yearMonth := now.Format("2006/01")

	// Create clean, unique file name
	rawName := strings.TrimSuffix(filepath.Base(file.Filename), filepath.Ext(file.Filename))
	cleanSlug := strings.ToLower(strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		return '-'
	}, rawName))
	cleanSlug = strings.Trim(cleanSlug, "-")
	if len(cleanSlug) > 50 {
		cleanSlug = cleanSlug[:50]
	}
	if cleanSlug == "" {
		cleanSlug = "foto-berita"
	}

	uniqueFilename := fmt.Sprintf("%s-%d%s", cleanSlug, now.UnixNano()%1000000, ext)
	relativePath := fmt.Sprintf("articles/%s/%s", yearMonth, uniqueFilename)

	// Open uploaded file in memory
	srcFile, err := file.Open()
	if err != nil {
		log.Printf("⚠️ [Media Upload] Gagal membaca file multipart: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membaca berkas gambar yang diunggah.",
		})
	}
	defer srcFile.Close()

	// Read image bytes into memory buffer for dimension inspection and upload
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, srcFile); err != nil {
		log.Printf("⚠️ [Media Upload] Gagal menyalin buffer gambar: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memproses data gambar.",
		})
	}

	// Read image dimensions in memory (zero disk write)
	width := 0
	height := 0
	if imgCfg, _, err := image.DecodeConfig(bytes.NewReader(buf.Bytes())); err == nil {
		width = imgCfg.Width
		height = imgCfg.Height
	}

	// ─── CLOUD-FIRST PATH: Direct Stream to Cloudflare R2 CDN (Zero VPS Disk) ───
	if utils.IsR2Configured() {
		r2URL, err := utils.UploadToR2(c.Context(), relativePath, bytes.NewReader(buf.Bytes()), contentType)
		if err == nil {
			log.Printf("☁️ [Media Upload -> R2 CDN] Berhasil diunggah ke Cloudflare R2: %s (%dx%d, %d KB)", r2URL, width, height, file.Size/1024)
			return c.Status(fiber.StatusCreated).JSON(fiber.Map{
				"success": true,
				"message": "Gambar berhasil diunggah ke Cloudflare R2 CDN.",
				"data": fiber.Map{
					"path":      relativePath,
					"url":       r2URL,
					"full_url":  r2URL,
					"cdn_url":   r2URL,
					"filename":  uniqueFilename,
					"width":     width,
					"height":    height,
					"size_kb":   file.Size / 1024,
					"mime_type": contentType,
					"storage":   "cloudflare_r2",
				},
			})
		}
		log.Printf("⚠️ [Media Upload -> R2 CDN] Gagal upload ke R2, beralih ke penyimpanan lokal VPS: %v", err)
	}

	// ─── LOCAL FALLBACK PATH: If R2 is not configured or network failed ───
	baseDir := GetUploadBaseDir()
	targetFolder := filepath.Join(baseDir, "articles", filepath.FromSlash(yearMonth))
	if err := os.MkdirAll(targetFolder, 0755); err != nil {
		log.Printf("⚠️ [Media Upload] Gagal membuat direktori upload: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mempersiapkan direktori penyimpanan di server.",
		})
	}

	targetFilePath := filepath.Join(targetFolder, uniqueFilename)
	if err := os.WriteFile(targetFilePath, buf.Bytes(), 0644); err != nil {
		log.Printf("⚠️ [Media Upload] Gagal menyimpan file ke lokal: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan berkas gambar ke server.",
		})
	}

	publicURL := fmt.Sprintf("/uploads/%s", relativePath)
	fullURL := fmt.Sprintf("https://queryindo.com/uploads/%s", relativePath)
	cdnURL := fmt.Sprintf("https://queryindo.com/media/w_1200,q_80/%s", relativePath)

	log.Printf("📸 [Media Upload -> Local Fallback] Berhasil disimpan lokal: %s (%dx%d, %d KB)", relativePath, width, height, file.Size/1024)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Gambar berhasil disimpan di penyimpanan server lokal.",
		"data": fiber.Map{
			"path":      relativePath,
			"url":       publicURL,
			"full_url":  fullURL,
			"cdn_url":   cdnURL,
			"filename":  uniqueFilename,
			"width":     width,
			"height":    height,
			"size_kb":   file.Size / 1024,
			"mime_type": contentType,
			"storage":   "local",
		},
	})
}

// ResizerOptions holds parsed query/path parameters for image resizing
type ResizerOptions struct {
	Width    int    // Target width (e.g. 800)
	Height   int    // Target height (e.g. 450)
	Quality  int    // JPEG compression quality (10-100, default 80)
	Crop     string // Crop mode: "fill" (center-cropped) or "fit" (proportional)
	Format   string // Target format: "webp", "jpeg", "jpg", "png"
	Source   string // Local relative path or full external URL
}

// ParseResizerDirectives parses transformation string like "w_800,q_80,c_fill"
func ParseResizerDirectives(params string) ResizerOptions {
	opts := ResizerOptions{
		Quality: 80,
		Crop:    "fit",
		Format:  "jpeg",
	}

	parts := strings.Split(params, ",")
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if strings.HasPrefix(part, "w_") {
			if w, err := strconv.Atoi(strings.TrimPrefix(part, "w_")); err == nil && w > 0 && w <= 3840 {
				opts.Width = w
			}
		} else if strings.HasPrefix(part, "h_") {
			if h, err := strconv.Atoi(strings.TrimPrefix(part, "h_")); err == nil && h > 0 && h <= 3840 {
				opts.Height = h
			}
		} else if strings.HasPrefix(part, "q_") {
			if q, err := strconv.Atoi(strings.TrimPrefix(part, "q_")); err == nil && q >= 10 && q <= 100 {
				opts.Quality = q
			}
		} else if strings.HasPrefix(part, "c_") {
			opts.Crop = strings.TrimPrefix(part, "c_")
		} else if strings.HasPrefix(part, "f_") {
			opts.Format = strings.TrimPrefix(part, "f_")
		}
	}

	return opts
}

// GET /media/:params/* or GET /media/resizer
// Dynamic on-the-fly Image Resizer & Optimizer with Cloudflare Edge Caching
func ServeResizedMedia(c *fiber.Ctx) error {
	var opts ResizerOptions

	// 1. Check if invoked via query parameters: /media/resizer?src=...&w=800&q=80
	if c.Path() == "/media/resizer" || c.Path() == "/media/resizer/" {
		opts = ResizerOptions{
			Quality: 80,
			Crop:    "fit",
			Format:  "jpeg",
		}

		if w, err := strconv.Atoi(c.Query("w")); err == nil && w > 0 && w <= 3840 {
			opts.Width = w
		}
		if h, err := strconv.Atoi(c.Query("h")); err == nil && h > 0 && h <= 3840 {
			opts.Height = h
		}
		if q, err := strconv.Atoi(c.Query("q")); err == nil && q >= 10 && q <= 100 {
			opts.Quality = q
		}
		if c.Query("c") != "" {
			opts.Crop = c.Query("c")
		}
		if c.Query("f") != "" {
			opts.Format = c.Query("f")
		}

		// Source can be in "src" or "url" query param
		src := c.Query("src")
		if src == "" {
			src = c.Query("url")
		}
		opts.Source = src
	} else {
		// 2. Invoked via path parameters: /media/w_800,q_80/articles/2026/09/foto.webp
		params := c.Params("params")
		opts = ParseResizerDirectives(params)

		// The rest of the wildcard path is the image source
		wildcard := c.Params("*")
		opts.Source = wildcard
	}

	if opts.Source == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Sumber gambar (source path atau URL) diperlukan")
	}

	// Normalize source: strip leading /uploads/ or /media/ if included
	sourcePath := strings.TrimPrefix(opts.Source, "/uploads/")
	sourcePath = strings.TrimPrefix(sourcePath, "uploads/")
	sourcePath = strings.TrimPrefix(sourcePath, "/")

	// Decode URL if encoded
	if unescaped, err := url.QueryUnescape(sourcePath); err == nil && unescaped != "" {
		sourcePath = unescaped
	}

	// Check if source is external URL
	if strings.HasPrefix(sourcePath, "ext/") {
		sourcePath = strings.TrimPrefix(sourcePath, "ext/")
	}
	if strings.HasPrefix(sourcePath, "https:/") && !strings.HasPrefix(sourcePath, "https://") {
		sourcePath = "https://" + strings.TrimPrefix(sourcePath, "https:/")
	} else if strings.HasPrefix(sourcePath, "http:/") && !strings.HasPrefix(sourcePath, "http://") {
		sourcePath = "http://" + strings.TrimPrefix(sourcePath, "http:/")
	}
	isExternal := strings.HasPrefix(sourcePath, "http://") || strings.HasPrefix(sourcePath, "https://")

	// Compute unique cache key (MD5 of source + transformation parameters)
	cacheKeyStr := fmt.Sprintf("%s|w=%d|h=%d|q=%d|c=%s|f=%s", sourcePath, opts.Width, opts.Height, opts.Quality, opts.Crop, opts.Format)
	hasher := md5.New()
	hasher.Write([]byte(cacheKeyStr))
	cacheHash := hex.EncodeToString(hasher.Sum(nil))

	baseDir := GetUploadBaseDir()
	cacheDir := filepath.Join(baseDir, ".cache")
	_ = os.MkdirAll(cacheDir, 0755)

	cacheExt := ".jpg"
	mimeType := "image/jpeg"
	if opts.Format == "png" {
		cacheExt = ".png"
		mimeType = "image/png"
	}

	cachedFilePath := filepath.Join(cacheDir, cacheHash+cacheExt)

	// Set standard Edge CDN Caching Headers (Cloudflare Edge Cache 1 year, Browser 30 days)
	c.Set("Cache-Control", "public, max-age=2592000, s-maxage=31536000, immutable")
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("X-Content-Type-Options", "nosniff")

	// ─── FAST PATH: If already processed and cached on disk, serve directly! ───
	if _, err := os.Stat(cachedFilePath); err == nil {
		c.Set("Content-Type", mimeType)
		c.Set("X-CDN-Cache", "HIT-LOCAL")
		return c.SendFile(cachedFilePath)
	}

	// ─── SLOW PATH: Decode source image, resize, compress, save to cache ───
	var srcImage image.Image

	if isExternal {
		// External Image Fetch (SSRF Protected)
		targetURL := sourcePath
		// If Google Drive link, convert to direct thumbnail
		if strings.Contains(targetURL, "drive.google.com") || strings.Contains(targetURL, "lh3.googleusercontent.com") {
			fileID := ""
			if strings.Contains(targetURL, "/file/d/") {
				parts := strings.Split(targetURL, "/file/d/")
				if len(parts) > 1 {
					fileID = strings.Split(parts[1], "/")[0]
				}
			} else if strings.Contains(targetURL, "id=") {
				if u, err := url.Parse(targetURL); err == nil {
					fileID = u.Query().Get("id")
				}
			}
			if fileID != "" {
				targetURL = "https://drive.google.com/thumbnail?id=" + fileID + "&sz=w1600"
			}
		}

		safeURL, err := validateSafeTargetURL(targetURL)
		if err != nil {
			return c.Status(fiber.StatusForbidden).SendString("URL eksternal tidak diizinkan: " + err.Error())
		}

		req, err := http.NewRequest("GET", safeURL, nil)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Gagal menghubungi server sumber gambar")
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")

		resp, err := secureHTTPClient.Do(req)
		if err != nil || resp.StatusCode >= 400 {
			return c.Status(fiber.StatusBadGateway).SendString("Gagal mengunduh gambar dari server eksternal")
		}
		defer resp.Body.Close()

		// Decode from stream (limit 15MB)
		img, err := imaging.Decode(io.LimitReader(resp.Body, 15*1024*1024), imaging.AutoOrientation(true))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Format gambar eksternal tidak dapat didekode")
		}
		srcImage = img
	} else {
		// Local File Fetch
		localFilePath := filepath.Join(baseDir, filepath.FromSlash(sourcePath))

		// If not found in uploads, check in public/
		if _, err := os.Stat(localFilePath); err != nil {
			// Check /var/www/queryindo/frontend/public or ./frontend/public
			altPublic := filepath.Join("./frontend/public", filepath.FromSlash(sourcePath))
			if _, err2 := os.Stat("/var/www/queryindo/frontend/public"); err2 == nil {
				altPublic = filepath.Join("/var/www/queryindo/frontend/public", filepath.FromSlash(sourcePath))
			}
			if _, err3 := os.Stat(altPublic); err3 == nil {
				localFilePath = altPublic
			} else {
				return c.Status(fiber.StatusNotFound).SendString("File gambar sumber tidak ditemukan di server: " + sourcePath)
			}
		}

		img, err := imaging.Open(localFilePath, imaging.AutoOrientation(true))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Gagal membuka file gambar lokal")
		}
		srcImage = img
	}

	// ─── Perform Resize / Crop ───
	var finalImage image.Image = srcImage
	bounds := srcImage.Bounds()
	curWidth := bounds.Dx()
	curHeight := bounds.Dy()

	targetW := opts.Width
	targetH := opts.Height

	// Only resize if target dimensions are requested and different
	if targetW > 0 || targetH > 0 {
		if opts.Crop == "fill" && targetW > 0 && targetH > 0 {
			// Center crop to exact aspect ratio
			finalImage = imaging.Fill(srcImage, targetW, targetH, imaging.Center, imaging.Lanczos)
		} else if targetW > 0 && targetH > 0 {
			// Fit inside bounds while preserving aspect ratio
			finalImage = imaging.Fit(srcImage, targetW, targetH, imaging.Lanczos)
		} else if targetW > 0 && targetW < curWidth {
			// Resize width proportionally
			finalImage = imaging.Resize(srcImage, targetW, 0, imaging.Lanczos)
		} else if targetH > 0 && targetH < curHeight {
			// Resize height proportionally
			finalImage = imaging.Resize(srcImage, 0, targetH, imaging.Lanczos)
		}
	}

	// ─── Save Resized File to Cache on Disk ───
	out, err := os.Create(cachedFilePath)
	if err != nil {
		log.Printf("⚠️ [Media Resizer] Gagal membuat file cache disk: %v", err)
	} else {
		defer out.Close()

		if opts.Format == "png" {
			_ = imaging.Encode(out, finalImage, imaging.PNG)
		} else {
			_ = imaging.Encode(out, finalImage, imaging.JPEG, imaging.JPEGQuality(opts.Quality))
		}
	}

	c.Set("Content-Type", mimeType)
	c.Set("X-CDN-Cache", "MISS-PROCESSED")

	// If cache file was written successfully, send it
	if _, err := os.Stat(cachedFilePath); err == nil {
		return c.SendFile(cachedFilePath)
	}

	// Fallback: encode directly to response
	c.Context().SetContentType(mimeType)
	if opts.Format == "png" {
		return imaging.Encode(c.Response().BodyWriter(), finalImage, imaging.PNG)
	}
	return imaging.Encode(c.Response().BodyWriter(), finalImage, imaging.JPEG, imaging.JPEGQuality(opts.Quality))
}
