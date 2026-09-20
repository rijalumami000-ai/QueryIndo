package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var commentTagRegex = regexp.MustCompile(`<[^>]*>`)

const googleUserInfoURL = "https://openidconnect.googleapis.com/v1/userinfo"

var googleUserInfoClient = &http.Client{Timeout: 5 * time.Second}

type googleUserInfo struct {
	Subject       string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

func sanitizeCommentText(s string) string {
	clean := commentTagRegex.ReplaceAllString(s, "")
	clean = strings.ReplaceAll(clean, "\x00", "")
	return strings.TrimSpace(clean)
}

func sanitizeAvatarURL(raw string, defaultAvatar string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" || len(raw) > 500 {
		return defaultAvatar
	}
	u, err := url.Parse(raw)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return defaultAvatar
	}
	scheme := strings.ToLower(u.Scheme)
	if scheme != "http" && scheme != "https" {
		return defaultAvatar
	}
	lowerHost := strings.ToLower(u.Hostname())
	if lowerHost == "localhost" || strings.HasSuffix(lowerHost, ".local") || strings.HasSuffix(lowerHost, ".internal") {
		return defaultAvatar
	}
	return u.String()
}

// verifyGoogleAccessToken validates a reader's OAuth access token with
// Google's userinfo endpoint. Identity fields must come from this response,
// never from the browser payload.
func verifyGoogleAccessToken(token string) (*googleUserInfo, error) {
	if strings.TrimSpace(token) == "" {
		return nil, fmt.Errorf("token Google diperlukan")
	}

	req, err := http.NewRequest(http.MethodGet, googleUserInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat request verifikasi Google")
	}
	req.Header.Set("Authorization", "Bearer "+token)
	resp, err := googleUserInfoClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi layanan verifikasi Google")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("token Google tidak valid atau telah kedaluwarsa")
	}

	var profile googleUserInfo
	if err := json.NewDecoder(io.LimitReader(resp.Body, 64*1024)).Decode(&profile); err != nil {
		return nil, fmt.Errorf("respons verifikasi Google tidak valid")
	}
	if profile.Subject == "" || profile.Email == "" || !profile.EmailVerified {
		return nil, fmt.Errorf("akun Google belum memiliki email terverifikasi")
	}
	return &profile, nil
}


type CreateCommentRequest struct {
	GoogleAccessToken string `json:"googleAccessToken"`
	AuthorName string `json:"authorName"`
	AuthorRole string `json:"authorRole"`
	Avatar     string `json:"avatar"`
	Content    string `json:"content"`
	ParentID   string `json:"parentId"`
}

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
		// Normalize legacy records created before comment hardening. This stops
		// pre-existing stored values from reaching a browser in executable form.
		fallbackAvatar := "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
		authorName := sanitizeCommentText(cmt.AuthorName)
		if authorName == "" {
			authorName = "Pembaca QUERYINDO"
		}
		authorRole := sanitizeCommentText(cmt.AuthorRole)
		if authorRole == "" {
			authorRole = "Pembaca"
		}
		resp := models.CommentResponse{
			ID:         cmt.ID,
			ArticleID:  cmt.ArticleID,
			AuthorName: authorName,
			AuthorRole: authorRole,
			Avatar:     sanitizeAvatarURL(cmt.Avatar, fallbackAvatar),
			Content:    sanitizeCommentText(cmt.Content),
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

	var req CreateCommentRequest
	if err := c.BodyParser(&req); err != nil {
		if errJson := json.Unmarshal(c.Body(), &req); errJson != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Format payload tidak valid",
				"error":   err.Error(),
			})
		}
	}

	if database.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Layanan komentar tidak tersedia saat basis data offline.",
		})
	}

	cleanContent := sanitizeCommentText(req.Content)
	if len([]rune(cleanContent)) < 2 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Isi komentar terlalu pendek (minimal 2 karakter)",
		})
	}
	if len([]rune(cleanContent)) > 1000 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Isi komentar melebihi batas maksimum (maksimal 1000 karakter)",
		})
	}

	var authorName string
	var authorRole string
	var avatar string
	defaultAvatar := "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"

	if strings.TrimSpace(req.GoogleAccessToken) != "" {
		profile, err := verifyGoogleAccessToken(req.GoogleAccessToken)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Verifikasi Akun Google gagal atau token telah kedaluwarsa. Silakan masuk kembali.",
			})
		}
		authorName = sanitizeCommentText(profile.Name)
		if authorName == "" {
			authorName = sanitizeCommentText(strings.Split(profile.Email, "@")[0])
		}
		authorRole = "Pembaca Google Terverifikasi"
		avatar = sanitizeAvatarURL(profile.Picture, defaultAvatar)
	} else {
		// Guest / Unauthenticated Comment:
		// Never allow client to spoof "Terverifikasi" or "Admin" roles.
		authorName = sanitizeCommentText(req.AuthorName)
		if authorName == "" {
			authorName = "Pembaca QUERYINDO"
		}
		authorRole = "Pembaca"
		avatar = sanitizeAvatarURL(req.Avatar, defaultAvatar)
	}

	if len([]rune(authorName)) > 60 {
		authorName = string([]rune(authorName)[:60])
	}

	commentID := fmt.Sprintf("cmt-%d-%04d", time.Now().Unix(), rand.Intn(10000))

	var pID *string
	cleanPID := sanitizeCommentText(req.ParentID)
	if cleanPID != "" {
		if len(cleanPID) > 64 {
			cleanPID = cleanPID[:64]
		}
		pID = &cleanPID
	}

	comment := models.Comment{
		ID:         commentID,
		ArticleID:  articleID,
		AuthorName: authorName,
		AuthorRole: authorRole,
		Avatar:     avatar,
		Content:    cleanContent,
		LikesCount: 0,
		ParentID:   pID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan komentar ke basis data",
			"error":   err.Error(),
		})
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
