package handlers

import (
	"encoding/json"
	"fmt"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/models"

	"github.com/gofiber/fiber/v2"
)

// =========================================================================
// 1. DEWAN REDAKSI (AUTHORS) HANDLERS
// =========================================================================

// GET /api/v1/authors
func GetAuthors(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var authors []models.Author
	database.DB.Order("\"order\" asc, created_at desc").Find(&authors)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    authors,
	})
}

// POST /api/v1/authors
func CreateAuthor(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var author models.Author
	if err := c.BodyParser(&author); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data profil jurnalis tidak valid"})
	}

	if author.ID == "" {
		author.ID = fmt.Sprintf("author-%d", time.Now().UnixMilli()%100000)
	}

	if err := database.DB.Create(&author).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "data": author})
}

// PUT /api/v1/authors/:id
func UpdateAuthor(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	id := c.Params("id")
	var existing models.Author
	if err := database.DB.Where("id = ?", id).First(&existing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Profil jurnalis tidak ditemukan"})
	}

	var payload models.Author
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data jurnalis tidak valid"})
	}

	payload.ID = id
	database.DB.Model(&existing).Updates(&payload)

	return c.JSON(fiber.Map{"success": true, "data": existing})
}

// DELETE /api/v1/authors/:id
func DeleteAuthor(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	id := c.Params("id")
	if err := database.DB.Where("id = ?", id).Delete(&models.Author{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Jurnalis berhasil dihapus dari sistem"})
}

// =========================================================================
// 2. KEMITRAAN & IKLAN BANNER (ADS) HANDLERS
// =========================================================================

// GET /api/v1/ads
func GetAds(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	placement := c.Query("placement")
	var ads []models.AdCampaign
	query := database.DB.Model(&models.AdCampaign{})

	if placement != "" && placement != "all" {
		query = query.Where("placement = ?", placement)
	}

	query.Order("created_at desc").Find(&ads)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    ads,
	})
}

// POST /api/v1/ads
func CreateAd(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var ad models.AdCampaign
	if err := c.BodyParser(&ad); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data kampanye iklan tidak valid"})
	}

	if ad.ID == "" {
		ad.ID = fmt.Sprintf("ad-%d", time.Now().UnixMilli()%100000)
	}

	if err := database.DB.Create(&ad).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "data": ad})
}

// PUT /api/v1/ads/:id
func UpdateAd(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	id := c.Params("id")
	var existing models.AdCampaign
	if err := database.DB.Where("id = ?", id).First(&existing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Kampanye iklan tidak ditemukan"})
	}

	var payload models.AdCampaign
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data iklan tidak valid"})
	}

	payload.ID = id
	database.DB.Model(&existing).Updates(&payload)

	return c.JSON(fiber.Map{"success": true, "data": existing})
}

// DELETE /api/v1/ads/:id
func DeleteAd(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	id := c.Params("id")
	if err := database.DB.Where("id = ?", id).Delete(&models.AdCampaign{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Kampanye iklan sponsor berhasil dihapus"})
}

// =========================================================================
// 3. REKOMENDASI BELANJA (SHOPPING CAROUSEL) HANDLERS
// =========================================================================

// GET /api/v1/shopping
func GetShopping(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var config models.ShoppingConfig
	if err := database.DB.Where("key = ?", "main").First(&config).Error; err != nil {
		config = models.ShoppingConfig{
			Key:         "main",
			BadgeText:   "⚡ QUERY PICKS",
			PartnerText: "Kurasi Lab Redaksi",
			MainTitle:   "RADAR GADGET & HARDWARE PILIHAN",
			Enabled:     true,
		}
	}

	var products []models.ShoppingProduct
	database.DB.Order("created_at desc").Find(&products)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"config":   config,
			"products": products,
		},
	})
}

// POST /api/v1/shopping/config
func SaveShoppingConfig(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var payload models.ShoppingConfig
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format konfigurasi belanja tidak valid"})
	}

	payload.Key = "main"
	database.DB.Save(&payload)

	return c.JSON(fiber.Map{"success": true, "data": payload})
}

// POST /api/v1/shopping/products
func CreateShoppingProduct(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var prod models.ShoppingProduct
	if err := c.BodyParser(&prod); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format data produk tidak valid"})
	}

	if prod.ID == "" {
		prod.ID = fmt.Sprintf("shop-%d", time.Now().UnixMilli()%100000)
	}

	if err := database.DB.Create(&prod).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "data": prod})
}

// PUT /api/v1/shopping/products/:id
func UpdateShoppingProduct(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	id := c.Params("id")
	var existing models.ShoppingProduct
	if err := database.DB.Where("id = ?", id).First(&existing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Produk tidak ditemukan"})
	}

	var payload models.ShoppingProduct
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Format produk tidak valid"})
	}

	payload.ID = id
	database.DB.Model(&existing).Updates(&payload)

	return c.JSON(fiber.Map{"success": true, "data": existing})
}

// DELETE /api/v1/shopping/products/:id
func DeleteShoppingProduct(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	id := c.Params("id")
	if err := database.DB.Where("id = ?", id).Delete(&models.ShoppingProduct{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Produk berhasil dihapus"})
}

// =========================================================================
// 4. JAJAK PENDAPAT (POLL) HANDLERS
// =========================================================================

type PollOptionPayload struct {
	ID     string `json:"id"`
	TextID string `json:"textId"`
	TextEN string `json:"textEn"`
	Votes  int64  `json:"votes"`
}

// GET /api/v1/poll
func GetPoll(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var poll models.PollData
	if err := database.DB.Where("key = ?", "current").First(&poll).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Jajak pendapat belum dibuat"})
	}

	var options []PollOptionPayload
	_ = json.Unmarshal([]byte(poll.Options), &options)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id":         poll.Key,
			"questionId": poll.QuestionID,
			"questionEn": poll.QuestionEN,
			"options":    options,
			"totalVotes": poll.TotalVotes,
		},
	})
}

// POST /api/v1/poll/vote
func VotePoll(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database belum terhubung"})
	}

	var req struct {
		OptionID string `json:"optionId"`
	}
	if err := c.BodyParser(&req); err != nil || req.OptionID == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Pilihan vote tidak valid"})
	}

	var poll models.PollData
	if err := database.DB.Where("key = ?", "current").First(&poll).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"success": false, "message": "Polling tidak aktif"})
	}

	var options []PollOptionPayload
	if err := json.Unmarshal([]byte(poll.Options), &options); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "Format opsi polling rusak"})
	}

	found := false
	for i := range options {
		if options[i].ID == req.OptionID {
			options[i].Votes++
			poll.TotalVotes++
			found = true
			break
		}
	}

	if !found {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "Opsi tidak ditemukan"})
	}

	bytes, _ := json.Marshal(options)
	poll.Options = string(bytes)
	database.DB.Save(&poll)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id":         poll.Key,
			"questionId": poll.QuestionID,
			"questionEn": poll.QuestionEN,
			"options":    options,
			"totalVotes": poll.TotalVotes,
		},
	})
}

