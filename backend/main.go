package main

import (
	"log"
	"os"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/handlers"
	"byteindonesia/backend/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file with multi-path fallback
	if err := godotenv.Load(".env", "/var/www/queryindo/backend/.env", "../.env"); err != nil {
		log.Println("ℹ️ Info: Menggunakan environment sistem / default.")
	}

	// Fail-closed validation: JWT_SECRET is mandatory for production security
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("🚨 [FATAL ERROR] Variabel JWT_SECRET belum disetel. Server menolak berjalan tanpa kunci JWT.")
	}

	if os.Getenv("HOSTINGER_MAIL_API_KEY") != "" {
		log.Println("📧 Mailer System: Hostinger Mail REST API (HTTPS Port 443) Aktif")
	} else if os.Getenv("SMTP_PASS") != "" {
		log.Printf("📧 Mailer System: SMTP Direct (%s:%s)\n", os.Getenv("SMTP_HOST"), os.Getenv("SMTP_PORT"))
	} else {
		log.Println("ℹ️ Mailer System: Mode Simulasi (HOSTINGER_MAIL_API_KEY / SMTP_PASS tidak disetel)")
	}

	// Initialize Database Connection
	if _, err := database.ConnectDB(); err != nil {
		log.Printf("⚠️ PERINGATAN KRITIS: Gagal terhubung ke basis data PostgreSQL: %v\n", err)
		if os.Getenv("ALLOW_DEGRADED_MODE") != "true" {
			log.Fatalf("FATAL: Basis data wajib aktif. Set ALLOW_DEGRADED_MODE=true hanya untuk development: %v", err)
		}
		log.Println("⚠️ Development degraded mode aktif; rute terlindungi tetap menolak akses.")
	}

	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "QUERYINDO News Backend API v1.0",
		ServerHeader: "Fiber/Go-PostgreSQL",
	})

	// Global Middlewares
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))
	app.Use(logger.New())

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "https://www.queryindo.com,https://queryindo.com,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// General API Rate Limiter (Max 120 req / 1 min per IP)
	apiLimiter := limiter.New(limiter.Config{
		Max:        120,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Batas permintaan terlampaui. Silakan tunggu beberapa saat.",
			})
		},
	})
	app.Use("/api/", apiLimiter)

	// Health Check Route (Cleaned - No Database / System Info Disclosure)
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":             "online",
			"service":            "QUERYINDO High-Performance Go Service",
			"database_connected": database.DB != nil,
		})
	})

	// API Group v1
	api := app.Group("/api/v1")

	// Strict Auth Rate Limiter (Anti Brute-Force: Max 5 attempts / 1 min per IP)
	authLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak percobaan login gagal. Demi keamanan, akun terkunci selama 1 menit.",
			})
		},
	})

	// Authentication Endpoints
	api.Post("/auth/login", authLimiter, handlers.Login)
	api.Post("/auth/change-password", middleware.Protected(), handlers.ChangePassword)
	api.Get("/auth/users", middleware.Protected(), middleware.RequireRole("superuser"), handlers.GetAdminUsers)
	api.Post("/auth/users", middleware.Protected(), middleware.RequireRole("superuser"), handlers.CreateAdminUser)
	api.Delete("/auth/users/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.DeleteAdminUser)

	// Public Article Read Endpoints
	api.Get("/articles", handlers.GetArticles)
	api.Get("/articles/:slug", handlers.GetArticleBySlug)

	// Protected Article Mutation Endpoints (Requires Valid JWT Bearer Token & Role)
	api.Post("/articles", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.CreateArticle)
	api.Put("/articles/:id", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.UpdateArticle)
	api.Delete("/articles/:id", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.DeleteArticle)

	// Public Article Engagement Endpoints (Likes & Views)
	api.Post("/articles/:id/like", handlers.LikeArticle)
	api.Post("/articles/:id/view", handlers.ViewArticle)

	// Reader Comments Rate Limiter (Anti-Spam: Max 5 comments / 1 min per IP)
	commentLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak pengiriman komentar dalam waktu singkat. Mohon tunggu 1 menit sebelum mengirim lagi.",
			})
		},
	})

	// Reader Comments Endpoints
	api.Get("/articles/:articleId/comments", handlers.GetArticleComments)
	api.Post("/articles/:articleId/comments", commentLimiter, handlers.PostArticleComment)
	api.Post("/comments/:id/like", handlers.LikeComment)
	api.Delete("/comments/:id", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.DeleteComment)

	// Financial Index Endpoint
	api.Get("/tech-indexes", handlers.GetTechIndexes)

	// High-Performance Safe Image Proxy Endpoint (Anti-SSRF Protected)
	api.Get("/image-proxy", handlers.ImageProxy)

	// AI Assistant Rate Limiter (Max 15 requests / 1 min per IP)
	aiLimiter := limiter.New(limiter.Config{
		Max:        15,
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Batas kuota AI tercapai untuk menit ini. Silakan coba lagi sebentar lagi.",
			})
		},
	})

	// AI Assistant Endpoints (Backend Gemini Proxy)
	api.Post("/ai/summarize", aiLimiter, handlers.AISummarize)
	api.Post("/ai/chat", aiLimiter, handlers.ChatAI)
	api.Post("/ai/translate", aiLimiter, handlers.TranslateArticle)

	// Newsletter Subscription & Redaksi Management Endpoints
	api.Post("/newsletter/subscribe", handlers.SubscribeNewsletter)
	api.Get("/newsletter/subscribers", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.GetSubscribers)
	api.Delete("/newsletter/subscribers/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.DeleteSubscriber)
	api.Post("/newsletter/broadcast", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.BroadcastNewsletter)

	// Dewan Redaksi (Authors) Endpoints
	api.Get("/authors", handlers.GetAuthors)
	api.Post("/authors", middleware.Protected(), middleware.RequireRole("superuser"), handlers.CreateAuthor)
	api.Put("/authors/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.UpdateAuthor)
	api.Delete("/authors/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.DeleteAuthor)

	// Kemitraan & Iklan (Ads) Endpoints
	api.Get("/ads", handlers.GetAds)
	api.Post("/ads", middleware.Protected(), middleware.RequireRole("superuser"), handlers.CreateAd)
	api.Put("/ads/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.UpdateAd)
	api.Delete("/ads/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.DeleteAd)

	// Rekomendasi Belanja (Shopping Carousel) Endpoints
	api.Get("/shopping", handlers.GetShopping)
	api.Post("/shopping/config", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.SaveShoppingConfig)
	api.Post("/shopping/products", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.CreateShoppingProduct)
	api.Put("/shopping/products/:id", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.UpdateShoppingProduct)
	api.Delete("/shopping/products/:id", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.DeleteShoppingProduct)

	// Jajak Pendapat (Reader Poll) Endpoints
	api.Get("/poll", handlers.GetPoll)
	api.Post("/poll/vote", handlers.VotePoll)

	// Media Sosial Resmi (Social Links) Endpoints
	api.Get("/social-links", handlers.GetSocialLinks)
	api.Post("/social-links", middleware.Protected(), middleware.RequireRole("superuser"), handlers.CreateSocialLink)
	api.Put("/social-links/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.UpdateSocialLink)
	api.Delete("/social-links/:id", middleware.Protected(), middleware.RequireRole("superuser"), handlers.DeleteSocialLink)

	// SEO & Search Engine Indexing Endpoints (Protected)
	api.Post("/seo/ping", middleware.Protected(), middleware.RequireRole("superuser", "editor"), handlers.TriggerSEOPing)
	app.Get("/queryindo7a9f8b1c2d3e4f5a6b7c8d9e0.txt", handlers.GetIndexNowKey)

	// Syndication & Aggregator RSS/JSON Feeds & SEO Sitemap
	app.Get("/rss.xml", handlers.GetRSSFeed)
	app.Get("/feed.json", handlers.GetJSONFeed)
	app.Get("/sitemap.xml", handlers.GetSitemap)
	app.Get("/sitemap-news.xml", handlers.GetNewsSitemap)
	app.Get("/robots.txt", handlers.GetRobotsTxt)

	// SSR Article OpenGraph Metadata for Social Media Crawlers & Direct Access
	app.Get("/berita/:slug", handlers.ServeArticleSSR)
	app.Get("/berita", handlers.ServeArticleSSR)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("⚡ QUERYINDO Go REST API server aktif pada http://localhost:%s\n", port)
	log.Fatal(app.Listen(":" + port))
}
