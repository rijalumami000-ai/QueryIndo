package middleware

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Protected verifies the JWT token in Authorization header
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Akses Ditolak: Header 'Authorization' tidak ditemukan. Diperlukan token JWT.",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format Authorization tidak valid. Gunakan format: 'Bearer <token>'",
			})
		}

		tokenString := parts[1]
		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Konfigurasi server bermasalah: JWT_SECRET belum disetel di server.",
			})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("metode penandatanganan tidak valid: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token JWT tidak valid atau telah kedaluwarsa. Silakan login kembali.",
				"error":   err.Error(),
			})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Klaim token JWT tidak valid",
			})
		}

		// Store user data in context locals
		c.Locals("user", claims)
		if username, exists := claims["username"]; exists {
			c.Locals("username", username)
		}
		if role, exists := claims["role"]; exists {
			c.Locals("role", role)
		}

		return c.Next()
	}
}

// RequireRole enforces role-based access control (RBAC) on protected endpoints
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		roleVal := c.Locals("role")
		if roleVal == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Akses Ditolak: Peran akun tidak ditemukan dalam token.",
			})
		}

		userRole, ok := roleVal.(string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Akses Ditolak: Format data peran pengguna tidak valid.",
			})
		}

		userRoleLower := strings.ToLower(userRole)
		// Superuser / Founder & CEO / Admin always has full access
		if userRoleLower == "superuser" || userRoleLower == "founder & ceo" || userRoleLower == "admin" {
			return c.Next()
		}

		for _, r := range roles {
			if strings.EqualFold(userRole, r) {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Akses Ditolak: Tingkat otorisasi Anda tidak mencukupi untuk tindakan ini.",
		})
	}
}
