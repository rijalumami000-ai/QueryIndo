package handlers

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
)

// GET /api/v1/articles/:articleId/comments
func GetArticleComments(c *fiber.Ctx) error {
	articleID := c.Params("articleId")
	if articleID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Parameter articleId wajib disertakan",
		})
	}

	if database.DB == nil {
		return c.JSON(fiber.Map{
			"success": true,
			"data":    []models.CommentResponse{},
		})
	}

	var allComments []models.Comment
	if err := database.DB.Where("article_id = ?", articleID).Order("created_at asc").Find(&allComments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil komentar dari basis data",
			"error":   err.Error(),
		})
	}

	// Build map and hierarchy
	repliesMap := make(map[string][]models.CommentResponse)
	var rootComments []models.CommentResponse

	for _, cmt := range allComments {
		resp := models.CommentResponse{
			ID:         cmt.ID,
			ArticleID:  cmt.ArticleID,
			AuthorName: cmt.AuthorName,
			AuthorRole: cmt.AuthorRole,
			Avatar:     cmt.Avatar,
			Content:    cmt.Content,
			CreatedAt:  cmt.CreatedAt.Format(time.RFC3339),
			LikesCount: cmt.LikesCount,
			ParentID:   cmt.ParentID,
			Replies:    []models.CommentResponse{},
		}

		if cmt.ParentID == nil || *cmt.ParentID == "" {
			rootComments = append(rootComments, resp)
		} else {
			pid := *cmt.ParentID
			repliesMap[pid] = append(repliesMap[pid], resp)
		}
	}

	// Attach replies to roots
	for i := range rootComments {
		pid := rootComments[i].ID
		if reps, exists := repliesMap[pid]; exists {
			rootComments[i].Replies = reps
		}
	}

	// Reverse roots so latest is first
	for i, j := 0, len(rootComments)-1; i < j; i, j = i+1, j-1 {
		rootComments[i], rootComments[j] = rootComments[j], rootComments[i]
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    rootComments,
		"total":   len(allComments),
	})
}

// POST /api/v1/articles/:articleId/comments
func PostArticleComment(c *fiber.Ctx) error {
	articleID := c.Params("articleId")
	if articleID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Parameter articleId wajib disertakan",
		})
	}

	type CreateCommentRequest struct {
		AuthorName string  `json:"authorName"`
		AuthorRole string  `json:"authorRole"`
		Avatar     string  `json:"avatar"`
		Content    string  `json:"content"`
		ParentID   *string `json:"parentId"`
	}

	var req CreateCommentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Format payload tidak valid",
		})
	}

	trimmedContent := strings.TrimSpace(req.Content)
	if trimmedContent == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Isi komentar tidak boleh kosong",
		})
	}

	authorName := strings.TrimSpace(req.AuthorName)
	if authorName == "" {
		authorName = "Pembaca QUERYINDO"
	}

	avatar := strings.TrimSpace(req.Avatar)
	if avatar == "" {
		avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
	}

	commentID := fmt.Sprintf("cmt-%d-%04d", time.Now().Unix(), rand.Intn(10000))

	var pID *string
	if req.ParentID != nil && strings.TrimSpace(*req.ParentID) != "" {
		cleanPID := strings.TrimSpace(*req.ParentID)
		pID = &cleanPID
	}

	comment := models.Comment{
		ID:         commentID,
		ArticleID:  articleID,
		AuthorName: authorName,
		AuthorRole: strings.TrimSpace(req.AuthorRole),
		Avatar:     avatar,
		Content:    trimmedContent,
		LikesCount: 0,
		ParentID:   pID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if database.DB != nil {
		if err := database.DB.Create(&comment).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal menyimpan komentar ke basis data",
				"error":   err.Error(),
			})
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Komentar berhasil dipublikasikan",
		"data": models.CommentResponse{
			ID:         comment.ID,
			ArticleID:  comment.ArticleID,
			AuthorName: comment.AuthorName,
			AuthorRole: comment.AuthorRole,
			Avatar:     comment.Avatar,
			Content:    comment.Content,
			CreatedAt:  comment.CreatedAt.Format(time.RFC3339),
			LikesCount: comment.LikesCount,
			ParentID:   comment.ParentID,
			Replies:    []models.CommentResponse{},
		},
	})
}

// POST /api/v1/comments/:id/like
func LikeComment(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "ID komentar diperlukan",
		})
	}

	if database.DB != nil {
		if err := database.DB.Model(&models.Comment{}).Where("id = ?", id).UpdateColumn("likes_count", gorm.Expr("likes_count + ?", 1)).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal menyukai komentar",
				"error":   err.Error(),
			})
		}
	}

	var updated models.Comment
	if database.DB != nil {
		database.DB.First(&updated, "id = ?", id)
	}

	return c.JSON(fiber.Map{
		"success":    true,
		"message":    "Komentar berhasil disukai",
		"likesCount": updated.LikesCount,
	})
}

// DELETE /api/v1/comments/:id (Moderasi Admin / Redaksi)
func DeleteComment(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "ID komentar diperlukan",
		})
	}

	if database.DB != nil {
		// Delete any replies first, then delete the comment
		database.DB.Where("parent_id = ?", id).Delete(&models.Comment{})
		database.DB.Where("id = ?", id).Delete(&models.Comment{})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Komentar %s dan balasannya berhasil dihapus", id),
	})
}
