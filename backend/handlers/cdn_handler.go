package handlers

import (
	"byteindonesia/backend/utils"
	"log"

	"github.com/gofiber/fiber/v2"
)

// GET /api/v1/cdn/status — Returns Cloudflare CDN integration status
func GetCDNStatus(c *fiber.Ctx) error {
	status := utils.GetCloudflareConfigStatus()

	return c.JSON(fiber.Map{
		"success": true,
		"data":    status,
	})
}

// POST /api/v1/cdn/purge — Manual cache purge endpoint for superusers
// Supports: { "purge_everything": true } or { "urls": ["https://..."] }
func PurgeCDNCache(c *fiber.Ctx) error {
	type PurgeRequest struct {
		PurgeEverything bool     `json:"purge_everything"`
		URLs            []string `json:"urls"`
	}

	var req PurgeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Format permintaan tidak valid",
		})
	}

	if !utils.IsCloudflareConfigured() {
		return c.Status(503).JSON(fiber.Map{
			"success": false,
			"message": "Cloudflare belum terkonfigurasi. Pastikan CLOUDFLARE_ZONE_ID dan CLOUDFLARE_API_TOKEN telah disetel di .env server.",
		})
	}

	var err error

	if req.PurgeEverything {
		log.Println("🧹 [CDN Handler] Manual full cache purge triggered by superuser")
		err = utils.PurgeCloudflareEverything()
	} else if len(req.URLs) > 0 {
		log.Printf("🧹 [CDN Handler] Manual targeted purge triggered: %d URLs", len(req.URLs))
		err = utils.PurgeCloudflareURLs(req.URLs)
	} else {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Harap sertakan 'purge_everything: true' atau daftar 'urls' yang ingin dibersihkan.",
		})
	}

	if err != nil {
		return c.Status(502).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membersihkan cache Cloudflare: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cache CDN Cloudflare berhasil dibersihkan",
	})
}
