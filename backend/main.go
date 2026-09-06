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
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️ Warning: File .env tidak ditemukan, menggunakan nilai default environment.")
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

	// Financial Index Endpoint
	api.Get("/tech-indexes", handlers.GetTechIndexes)

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
	api.Post("/newsletter/broadcast", middleware.Protected(), handlers.BroadcastNewsletter)

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
