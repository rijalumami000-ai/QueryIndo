package handlers

import (
	"fmt"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GET /api/v1/articles
func GetArticles(c *fiber.Ctx) error {
	category := c.Query("category")
	search := c.Query("search")
	status := c.Query("status", "published")

	if database.DB == nil {
		// Mock response if DB not yet initialized
		return c.JSON(fiber.Map{
			"success": true,
			"source":  "mock_memory",
			"count":   1,
			"data": []fiber.Map{
				{
					"id":         "art-001",
					"title":      "Indonesia Resmi Operasikan Pusat Data Nasional Superkomputer AI Pertama di IKN",
					"slug":       "pusat-data-nasional-superkomputer-ai-ikn",
					"category":   "ai",
					"status":     status,
					"search":     search,
					"cat_filter": category,
				},
			},
		})
	}

	var articles []models.Article
	query := database.DB.Model(&models.Article{})

	if category != "" && category != "all" {
		query = query.Where("category_id = ?", category)
	}

	if search != "" {
		likePattern := "%" + search + "%"
		query = query.Where("title ILIKE ? OR subtitle ILIKE ?", likePattern, likePattern)
	}

	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	query.Order("published_at desc").Find(&articles)

	return c.JSON(fiber.Map{
		"success": true,
		"count":   len(articles),
		"data":    articles,
	})
}

// GET /api/v1/articles/:slug
func GetArticleBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")

	if database.DB == nil {
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"slug":  slug,
				"title": "Indonesia Resmi Operasikan Pusat Data Nasional Superkomputer AI Pertama di IKN",
			},
		})
	}

	var article models.Article
	if err := database.DB.Where("slug = ? OR id = ?", slug, slug).First(&article).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Artikel berita tidak ditemukan",
		})
	}

	// Increment Views Count
	database.DB.Model(&article).UpdateColumn("views_count", article.ViewsCount+1)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    article,
	})
}

// POST /api/v1/articles (Create Article)
func CreateArticle(c *fiber.Ctx) error {
	var article models.Article
	if err := c.BodyParser(&article); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Bad request format",
		})
	}

	if article.ID == "" {
		article.ID = fmt.Sprintf("art-%d", time.Now().Unix())
	}
	if article.PublishedAt.IsZero() {
		article.PublishedAt = time.Now()
	}
	if article.Status == "" {
		article.Status = "published"
	}

	if database.DB != nil {
		if err := database.DB.Create(&article).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal menyimpan artikel ke PostgreSQL",
				"error":   err.Error(),
			})
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil diterbitkan",
		"data":    article,
	})
}

// PUT /api/v1/articles/:id (Update Article)
func UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")

	if database.DB == nil {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Artikel berhasil diperbarui (Mock)",
			"id":      id,
		})
	}

	var article models.Article
	if err := database.DB.First(&article, "id = ?", id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Artikel tidak ditemukan",
		})
	}

	if err := c.BodyParser(&article); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid payload",
		})
	}

	database.DB.Save(&article)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Artikel berhasil diperbarui",
		"data":    article,
	})
}

// DELETE /api/v1/articles/:id
func DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")

	if database.DB != nil {
		database.DB.Delete(&models.Article{}, "id = ?", id)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Artikel %s berhasil dihapus", id),
	})
}

// POST /api/v1/ai/summarize
func AISummarize(c *fiber.Ctx) error {
	type SummarizeRequest struct {
		Title    string `json:"title"`
		Subtitle string `json:"subtitle"`
		Content  string `json:"content"`
	}

	var req SummarizeRequest
	if err := c.BodyParser(&req); err != nil || req.Title == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Judul artikel wajib diisi untuk ringkasan AI",
		})
	}

	summaryPoints := []string{
		fmt.Sprintf("Poin Utama: Analisis mendalam seputar %s.", req.Title),
		fmt.Sprintf("Ringkasan Eksekutif: %s", req.Subtitle),
		"Implikasi Nasional: Mengakselerasi transformasi digital & kedaulatan teknologi Indonesia.",
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    summaryPoints,
	})
}

// POST /api/v1/articles/:id/like
func LikeArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "ID artikel diperlukan",
		})
	}

	if database.DB != nil {
		if err := database.DB.Model(&models.Article{}).Where("id = ?", id).UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1)).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal menyukai artikel",
				"error":   err.Error(),
			})
		}
	}

	var article models.Article
	if database.DB != nil {
		database.DB.Select("id", "likes_count").First(&article, "id = ?", id)
	}

	return c.JSON(fiber.Map{
		"success":    true,
		"message":    "Artikel berhasil disukai",
		"likesCount": article.LikesCount,
	})
}

// POST /api/v1/articles/:id/view
func ViewArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "ID artikel diperlukan",
		})
	}

	if database.DB != nil {
		if err := database.DB.Model(&models.Article{}).Where("id = ?", id).UpdateColumn("views_count", gorm.Expr("views_count + ?", 1)).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal mencatat kunjungan artikel",
				"error":   err.Error(),
			})
		}
	}

	var article models.Article
	if database.DB != nil {
		database.DB.Select("id", "views_count").First(&article, "id = ?", id)
	}

	return c.JSON(fiber.Map{
		"success":    true,
		"message":    "Kunjungan artikel berhasil dicatat",
		"viewsCount": article.ViewsCount,
	})
}

