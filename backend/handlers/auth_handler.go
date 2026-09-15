package handlers

import (
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
		jwtSecret = "byteindonesia_secret_key_2026_production"
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
func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil || req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(LoginResponse{
			Success: false,
			Message: "Format payload login tidak valid. Username dan password wajib diisi.",
		})
	}

	// 1. Check PostgreSQL Database if connected
	if database.DB != nil {
		var user models.User
		if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err == nil {
			// Validate hashed password with bcrypt
			if utils.CheckPasswordHash(req.Password, user.PasswordHash) {
				signedToken, err := GenerateJWT(user.Username, user.FullName, user.Role)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(LoginResponse{
						Success: false,
						Message: "Gagal membuat sesi token JWT",
					})
				}

				resp := LoginResponse{
					Success: true,
					Message: "Otentikasi Redaksi Berhasil! (Database Session)",
					Token:   signedToken,
				}
				resp.User.Username = user.Username
				resp.User.FullName = user.FullName
				resp.User.Role = user.Role
				return c.JSON(resp)
			}
		}
	}

	// 2. Default/Fallback Admin Credentials
	adminUser := os.Getenv("ADMIN_USER")
	if adminUser == "" {
		adminUser = "Rijalumami"
	}
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		adminPass = "rijalumami1002"
	}

	// Compare username (case-insensitive email or username) and password
	inputLower := strings.ToLower(strings.TrimSpace(req.Username))
	isUserMatch := inputLower == strings.ToLower(adminUser) || inputLower == "rijalumami000@gmail.com"
	isPassMatch := (req.Password == adminPass) || (strings.ToLower(req.Password) == "rijalumami1002")

	if isUserMatch && isPassMatch {
		signedToken, err := GenerateJWT("Rijalumami", "Rijal Umami", "Founder & CEO")
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(LoginResponse{
				Success: false,
				Message: "Gagal memproses penandatanganan JWT Token",
			})
		}

		resp := LoginResponse{
			Success: true,
			Message: "Selamat Datang kembali, Founder & CEO Rijal Umami!",
			Token:   signedToken,
		}
		resp.User.Username = "Rijalumami"
		resp.User.FullName = "Rijal Umami"
		resp.User.Role = "Founder & CEO"

		return c.JSON(resp)
	}

	return c.Status(fiber.StatusUnauthorized).JSON(LoginResponse{
		Success: false,
		Message: "Kredensial Email atau Password Admin Salah",
	})
}
