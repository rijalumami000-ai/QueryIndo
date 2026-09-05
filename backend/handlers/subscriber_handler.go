package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
)

type SubscribeRequest struct {
	Email string `json:"email"`
}

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

	return c.Status(200).JSON(fiber.Map{
		"status":  "success",
		"message": "Terima kasih! Alamat email Anda berhasil terdaftar di newsletter QUERYINDO.",
	})
}
