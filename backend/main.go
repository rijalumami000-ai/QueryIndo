package main

import (
	"log"
	"os"
	"time"

	"byteindonesia/backend/database"
	"byteindonesia/backend/handlers"
	"byteindonesia/backend/middleware"

	"github.com/gofiber/fiber/v2"
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

	if os.Getenv("HOSTINGER_MAIL_API_KEY") != "" {
		log.Println("📧 Mailer System: Hostinger Mail REST API (HTTPS Port 443) Aktif")
	} else if os.Getenv("SMTP_PASS") != "" {
		log.Printf("📧 Mailer System: SMTP Direct (%s:%s)\n", os.Getenv("SMTP_HOST"), os.Getenv("SMTP_PORT"))
	} else {
		log.Println("ℹ️ Mailer System: Mode Simulasi (HOSTINGER_MAIL_API_KEY / SMTP_PASS tidak disetel)")
	}

	// Initialize Database Connection
	_, _ = database.ConnectDB()

	// Initialize Fiber App
	app := fiber.New(fiber.Config{
		AppName:      "QUERYINDO News Backend API v1.0",
		ServerHeader: "Fiber/Go-PostgreSQL",
	})

	// Global Middlewares
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

	// Health Check Route
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":    "online",
			"service":   "QUERYINDO High-Performance Go Service",
			"db_status": database.DB != nil,
			"user_db":   os.Getenv("DB_USER"),
			"database":  os.Getenv("DB_NAME"),
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

	// Authentication Endpoint (Protected with Brute-Force Limiter)
	api.Post("/auth/login", authLimiter, handlers.Login)

	// Public Article Read Endpoints
	api.Get("/articles", handlers.GetArticles)
	api.Get("/articles/:slug", handlers.GetArticleBySlug)

	// Protected Article Mutation Endpoints (Requires Valid JWT Bearer Token)
	api.Post("/articles", middleware.Protected(), handlers.CreateArticle)
	api.Put("/articles/:id", middleware.Protected(), handlers.UpdateArticle)
	api.Delete("/articles/:id", middleware.Protected(), handlers.DeleteArticle)

	// Public Article Engagement Endpoints (Likes & Views)
	api.Post("/articles/:id/like", handlers.LikeArticle)
	api.Post("/articles/:id/view", handlers.ViewArticle)

	// Reader Comments Endpoints
	api.Get("/articles/:articleId/comments", handlers.GetArticleComments)
	api.Post("/articles/:articleId/comments", handlers.PostArticleComment)
	api.Post("/comments/:id/like", handlers.LikeComment)
	api.Delete("/comments/:id", middleware.Protected(), handlers.DeleteComment)

	// Financial Index Endpoint
	api.Get("/tech-indexes", handlers.GetTechIndexes)

	// High-Performance Safe Image Proxy Endpoint (Bypasses CORS, Google Drive, and Referrer Restrictions)
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

	// AI Assistant Endpoints
	api.Post("/ai/summarize", aiLimiter, handlers.AISummarize)
	api.Post("/ai/chat", aiLimiter, handlers.ChatAI)

	// Newsletter Subscription & Redaksi Management Endpoints
	api.Post("/newsletter/subscribe", handlers.SubscribeNewsletter)
	api.Get("/newsletter/subscribers", middleware.Protected(), handlers.GetSubscribers)
	api.Delete("/newsletter/subscribers/:id", middleware.Protected(), handlers.DeleteSubscriber)
	api.Post("/newsletter/broadcast", middleware.Protected(), handlers.BroadcastNewsletter)

	// Dewan Redaksi (Authors) Endpoints
	api.Get("/authors", handlers.GetAuthors)
	api.Post("/authors", middleware.Protected(), handlers.CreateAuthor)
	api.Put("/authors/:id", middleware.Protected(), handlers.UpdateAuthor)
	api.Delete("/authors/:id", middleware.Protected(), handlers.DeleteAuthor)

	// Kemitraan & Iklan (Ads) Endpoints
	api.Get("/ads", handlers.GetAds)
	api.Post("/ads", middleware.Protected(), handlers.CreateAd)
	api.Put("/ads/:id", middleware.Protected(), handlers.UpdateAd)
	api.Delete("/ads/:id", middleware.Protected(), handlers.DeleteAd)

	// Rekomendasi Belanja (Shopping Carousel) Endpoints
	api.Get("/shopping", handlers.GetShopping)
	api.Post("/shopping/config", middleware.Protected(), handlers.SaveShoppingConfig)
	api.Post("/shopping/products", middleware.Protected(), handlers.CreateShoppingProduct)
	api.Put("/shopping/products/:id", middleware.Protected(), handlers.UpdateShoppingProduct)
	api.Delete("/shopping/products/:id", middleware.Protected(), handlers.DeleteShoppingProduct)

	// Jajak Pendapat (Reader Poll) Endpoints
	api.Get("/poll", handlers.GetPoll)
	api.Post("/poll/vote", handlers.VotePoll)

	// Media Sosial Resmi (Social Links) Endpoints
	api.Get("/social-links", handlers.GetSocialLinks)
	api.Post("/social-links", middleware.Protected(), handlers.CreateSocialLink)
	api.Put("/social-links/:id", middleware.Protected(), handlers.UpdateSocialLink)
	api.Delete("/social-links/:id", middleware.Protected(), handlers.DeleteSocialLink)

	// Syndication & Aggregator RSS/JSON Feeds & SEO Sitemap
	app.Get("/rss.xml", handlers.GetRSSFeed)
	app.Get("/feed.json", handlers.GetJSONFeed)
	app.Get("/sitemap.xml", handlers.GetSitemap)
	app.Get("/robots.txt", handlers.GetRobotsTxt)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("⚡ QUERYINDO Go REST API server aktif pada http://localhost:%s\n", port)
	log.Fatal(app.Listen(":" + port))
}
