package handlers

import (
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
	"byteindonesia/backend/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Token   string `json:"token,omitempty"`
	User    struct {
		Username string `json:"username"`
		FullName string `json:"full_name"`
		Role     string `json:"role"`
	} `json:"user,omitempty"`
}

// GenerateJWT creates a signed JWT token for an authenticated user
func GenerateJWT(username, fullName, role string) (string, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return "", fmt.Errorf("JWT_SECRET environment variable is not configured")
	}

	claims := jwt.MapClaims{
		"username":  username,
		"full_name": fullName,
		"role":      role,
		"exp":       time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days expiration
		"iat":       time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}

// POST /api/v1/auth/login
// 100% verified against PostgreSQL database with bcrypt hash. No fallback plaintext passwords.
func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Username) == "" || strings.TrimSpace(req.Password) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(LoginResponse{
			Success: false,
			Message: "Format payload login tidak valid. Username dan password wajib diisi.",
		})
	}

	if database.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(LoginResponse{
			Success: false,
			Message: "Layanan database belum siap. Hubungi administrator sistem.",
		})
	}

	input := strings.ToLower(strings.TrimSpace(req.Username))
	var user models.User
	if err := database.DB.Where("LOWER(username) = ? OR LOWER(email) = ?", input, input).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(LoginResponse{
			Success: false,
			Message: "Kredensial Username/Email atau Kata Sandi Salah.",
		})
	}

	// Validate hashed password with bcrypt
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return c.Status(fiber.StatusUnauthorized).JSON(LoginResponse{
			Success: false,
			Message: "Kredensial Username/Email atau Kata Sandi Salah.",
		})
	}

	signedToken, err := GenerateJWT(user.Username, user.FullName, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(LoginResponse{
			Success: false,
			Message: "Gagal membuat sesi token JWT",
		})
	}

	resp := LoginResponse{
		Success: true,
		Message: fmt.Sprintf("Selamat datang kembali, %s!", user.FullName),
		Token:   signedToken,
	}
	resp.User.Username = user.Username
	resp.User.FullName = user.FullName
	resp.User.Role = user.Role
	return c.JSON(resp)
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// POST /api/v1/auth/change-password
func ChangePassword(c *fiber.Ctx) error {
	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil || req.OldPassword == "" || len(req.NewPassword) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kata sandi lama dan kata sandi baru (minimal 6 karakter) wajib diisi.",
		})
	}

	usernameVal := c.Locals("username")
	if usernameVal == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Sesi tidak valid.",
		})
	}
	username := usernameVal.(string)

	if database.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Layanan database belum siap.",
		})
	}

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Akun pengguna tidak ditemukan di database.",
		})
	}

	if !utils.CheckPasswordHash(req.OldPassword, user.PasswordHash) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kata sandi lama salah.",
		})
	}

	newHash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengenkripsi kata sandi baru.",
		})
	}

	user.PasswordHash = newHash
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan kata sandi baru ke database.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kata sandi akun berhasil diperbarui di database!",
	})
}

// GET /api/v1/auth/users
func GetAdminUsers(c *fiber.Ctx) error {
	if database.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Layanan database belum siap.",
		})
	}

	var users []models.User
	if err := database.DB.Select("id, username, email, full_name, role, avatar, created_at, updated_at").Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar pengguna admin.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"users":   users,
	})
}

type CreateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

// POST /api/v1/auth/users
func CreateAdminUser(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil || strings.TrimSpace(req.Email) == "" || strings.TrimSpace(req.FullName) == "" || len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Email, Nama Lengkap, dan Kata Sandi (minimal 6 karakter) wajib diisi.",
		})
	}

	if database.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Layanan database belum siap.",
		})
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	username := strings.ToLower(strings.TrimSpace(req.Username))
	if username == "" {
		username = strings.Split(email, "@")[0]
	}

	var existing models.User
	if err := database.DB.Where("LOWER(email) = ? OR LOWER(username) = ?", email, username).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Akun dengan email atau username tersebut sudah terdaftar.",
		})
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengenkripsi kata sandi.",
		})
	}

	role := req.Role
	if role == "" {
		role = "editor"
	}

	newUser := models.User{
		Username:     username,
		Email:        email,
		FullName:     req.FullName,
		PasswordHash: hash,
		Role:         role,
		Avatar:       fmt.Sprintf("https://ui-avatars.com/api/?name=%s&background=0B1120&color=00F2FE&bold=true", url.QueryEscape(req.FullName)),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan akun baru ke database.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Akun %s (%s) berhasil dibuat!", newUser.FullName, newUser.Email),
		"user": fiber.Map{
			"id":        newUser.ID,
			"username":  newUser.Username,
			"email":     newUser.Email,
			"full_name": newUser.FullName,
			"role":      newUser.Role,
		},
	})
}

// DELETE /api/v1/auth/users/:id
func DeleteAdminUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID akun diperlukan.",
		})
	}

	if database.DB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Layanan database belum siap.",
		})
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Akun tidak ditemukan.",
		})
	}

	if strings.ToLower(user.Role) == "superuser" || strings.ToLower(user.Username) == "rijalumami" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Akun Superuser tidak dapat dihapus demi keamanan sistem.",
		})
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus akun pengguna.",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Akun %s berhasil dihapus.", user.FullName),
	})
}
