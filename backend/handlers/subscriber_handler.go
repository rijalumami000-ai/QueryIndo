package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
	"byteindonesia/backend/utils"
)

type SubscribeRequest struct {
	Email string `json:"email"`
}

// SubscribeNewsletter handles visitor newsletter subscription & triggers welcome email
func SubscribeNewsletter(c *fiber.Ctx) error {
	var req SubscribeRequest
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Email) == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format alamat email tidak valid",
		})
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return c.Status(400).JSON(fiber.Map{
			"status":  "error",
			"message": "Format email harus valid (contoh: user@domain.com)",
		})
	}

	db := database.DB
	if db != nil {
		var existing models.NewsletterSubscriber
		if err := db.Where("email = ?", email).First(&existing).Error; err == nil {
			return c.Status(200).JSON(fiber.Map{
				"status":  "success",
				"message": "Email Anda sudah terdaftar dalam langganan newsletter QUERYINDO!",
			})
		}

		newSub := models.NewsletterSubscriber{
			Email:     email,
			IPAddress: c.IP(),
		}
		db.Create(&newSub)
	}

	// Trigger high-grade welcome email in background
	go utils.SendWelcomeEmail(email)

	return c.Status(200).JSON(fiber.Map{
		"status":  "success",
		"message": "Terima kasih! Alamat email Anda berhasil terdaftar di newsletter QUERYINDO.",
	})
}

// GetSubscribers returns the full list of subscribers for Admin CMS (Protected)
func GetSubscribers(c *fiber.Ctx) error {
	db := database.DB
	if db == nil {
		return c.JSON(fiber.Map{
			"success": true,
			"count":   0,
			"data":    []models.NewsletterSubscriber{},
		})
	}

	var subscribers []models.NewsletterSubscriber
	if err := db.Order("created_at desc").Find(&subscribers).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar pelanggan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"count":   len(subscribers),
		"data":    subscribers,
	})
}

// BroadcastRequest defines the payload to blast newsletter to subscribers
type BroadcastRequest struct {
	Subject   string                       `json:"subject"`
	Headline  string                       `json:"headline"`
	Articles  []utils.BroadcastArticleItem `json:"articles"`
}

// BroadcastNewsletter sends a newsletter blast to all registered subscribers (Protected)
func BroadcastNewsletter(c *fiber.Ctx) error {
	var req BroadcastRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Format data broadcast tidak valid",
		})
	}

	if strings.TrimSpace(req.Subject) == "" {
		req.Subject = "QUERYINDO Daily Brief: Wawasan Berita Tekno & AI Terkini"
	}
	if strings.TrimSpace(req.Headline) == "" {
		req.Headline = "Rangkuman Berita Paling Krusial Hari Ini"
	}

	db := database.DB
	var emails []string
	if db != nil {
		var subs []models.NewsletterSubscriber
		db.Select("email").Find(&subs)
		for _, s := range subs {
			emails = append(emails, s.Email)
		}
	}

	if len(emails) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Belum ada pelanggan terdaftar untuk dikirimkan newsletter.",
		})
	}

	// Trigger broadcast in background
	go func() {
		utils.SendNewsBroadcastEmail(emails, req.Subject, req.Headline, req.Articles)
	}()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Broadcast newsletter sedang diproses dan dikirim ke seluruh pelanggan!",
		"recipients_count": len(emails),
	})
}
