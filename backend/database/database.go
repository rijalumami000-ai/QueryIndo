package database

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"byteindonesia/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

//go:embed default_articles.json
var defaultArticlesJSON []byte

var DB *gorm.DB

func ConnectDB() (*gorm.DB, error) {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")

	if dbHost == "" {
		dbHost = "localhost"
	}
	if dbPort == "" {
		dbPort = "5432"
	}
	if dbUser == "" {
		dbUser = "Rijalumami1002"
	}
	if dbName == "" {
		dbName = "byteindonesia_db"
	}
	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		dbHost, dbUser, dbPassword, dbName, dbPort, dbSSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Printf("⚠️ PostgreSQL DB Connection Warning: %v (Client will run with mock DB or waiting for DB service)", err)
		return nil, err
	}

	log.Println("✅ Terhubung ke Database PostgreSQL QUERYINDO!")

	// Auto Migrate Schemas
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Article{},
		&models.TechIndex{},
		&models.NewsletterSubscriber{},
		&models.Author{},
		&models.AdCampaign{},
		&models.ShoppingProduct{},
		&models.ShoppingConfig{},
		&models.PollData{},
		&models.Comment{},
	)
	if err != nil {
		log.Printf("⚠️ AutoMigrate Error: %v", err)
	} else {
		log.Println("✅ AutoMigrate Skema Database PostgreSQL Selesai!")
		seedDefaultCMSData(db)
	}

	DB = db
	return db, nil
}

func seedDefaultCMSData(db *gorm.DB) {
	// 0. Seed Categories
	var catCount int64
	db.Model(&models.Category{}).Count(&catCount)
	if catCount == 0 {
		defaultCategories := []models.Category{
			{ID: "all", Name: "Semua Berita", Icon: "layers", Description: "Semua kabar & pembaruan teknologi terkini"},
			{ID: "ai", Name: "Kecerdasan Buatan", Icon: "cpu", Description: "Inovasi AI, LLM, Otomasi & Agentic Coding"},
			{ID: "gadget", Name: "Gadget & Inovasi", Icon: "smartphone", Description: "Review, rumor & rilis perangkat terbaru"},
			{ID: "cybersecurity", Name: "Keamanan Siber", Icon: "shield-alert", Description: "Perlindungan data, privasi & ancaman siber"},
			{ID: "startup", Name: "Startup & Bisnis", Icon: "trending-up", Description: "Ekosistem pendanaan, unicorn & inovasi bisnis"},
			{ID: "policy", Name: "Kebijakan Digital", Icon: "file-text", Description: "Regulasi pemerintah, PDP & infrastruktur nasional"},
			{ID: "telecom", Name: "Telekomunikasi", Icon: "radio", Description: "Jaringan 5G/6G, internet satelit & konektivitas"},
			{ID: "developer", Name: "Kolektif Developer", Icon: "code", Description: "Bahasa pemrograman, cloud & tren software engineering"},
		}
		for _, cat := range defaultCategories {
			db.Create(&cat)
		}
		log.Println("🌱 Seed Categories default berhasil!")
	}

	// 1. Seed Shopping Config
	var shopCfg models.ShoppingConfig
	if err := db.Where("key = ?", "main").First(&shopCfg).Error; err != nil {
		db.Create(&models.ShoppingConfig{
			Key:         "main",
			BadgeText:   "⚡ QUERY PICKS",
			PartnerText: "Kurasi Lab Redaksi",
			MainTitle:   "RADAR GADGET & HARDWARE PILIHAN",
			Enabled:     true,
		})
		log.Println("🌱 Seed ShoppingConfig berhasil!")
	}

	// 2. Seed Shopping Products
	var prodCount int64
	db.Model(&models.ShoppingProduct{}).Count(&prodCount)
	if prodCount == 0 {
		defaultProds := []models.ShoppingProduct{
			{
				ID:              "shop-01",
				Title:           "POCO C65 (6/128 GB) 90Hz Display 5000mAh Garansi Resmi",
				ImageURL:        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 2.240.000",
				DiscountPrice:   "Rp 1.899.000",
				DiscountPercent: "15%",
				TargetURL:       "https://tokopedia.com",
				Category:        "Gadget & Smartphone",
				IsActive:        true,
				Clicks:          310,
			},
			{
				ID:              "shop-02",
				Title:           "Keychron K2 V2 Wireless Mechanical Keyboard RGB Hot-Swap",
				ImageURL:        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 1.450.000",
				DiscountPrice:   "Rp 1.087.000",
				DiscountPercent: "25%",
				TargetURL:       "https://tokopedia.com",
				Category:        "PC & Peripherals",
				IsActive:        true,
				Clicks:          195,
			},
			{
				ID:              "shop-03",
				Title:           "Anker Soundcore R50i TWS Earbuds Bluetooth 5.3 BassBoost IPX5",
				ImageURL:        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 399.000",
				DiscountPrice:   "Rp 195.000",
				DiscountPercent: "51%",
				TargetURL:       "https://tokopedia.com",
				Category:        "Audio & Gadget",
				IsActive:        true,
				Clicks:          254,
			},
			{
				ID:              "shop-04",
				Title:           "Baseus GaN 65W Fast Charger Multi-Port Laptop & Smartphone",
				ImageURL:        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 650.000",
				DiscountPrice:   "Rp 389.000",
				DiscountPercent: "40%",
				TargetURL:       "https://shopee.co.id",
				Category:        "Aksesoris Daya",
				IsActive:        true,
				Clicks:          142,
			},
			{
				ID:              "shop-05",
				Title:           "ACOME Smartwatch AMOLED Always-On IP68 Waterproof Sport",
				ImageURL:        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 599.000",
				DiscountPrice:   "Rp 279.000",
				DiscountPercent: "53%",
				TargetURL:       "https://shopee.co.id",
				Category:        "Wearable Tech",
				IsActive:        true,
				Clicks:          168,
			},
			{
				ID:              "shop-06",
				Title:           "Logitech MX Master 3S Wireless Ergonomic Mouse Darkfield 8K",
				ImageURL:        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 1.890.000",
				DiscountPrice:   "Rp 1.490.000",
				DiscountPercent: "21%",
				TargetURL:       "https://tokopedia.com",
				Category:        "Produktivitas",
				IsActive:        true,
				Clicks:          182,
			},
		}
		for _, p := range defaultProds {
			db.Create(&p)
		}
		log.Println("🌱 Seed ShoppingProducts default berhasil!")
	}

	// 3. Seed Ads
	var adCount int64
	db.Model(&models.AdCampaign{}).Count(&adCount)
	if adCount == 0 {
		defaultAds := []models.AdCampaign{
			{
				ID:          "ad-01",
				SponsorName: "NVIDIA Enterprise AI",
				Tagline:     "Akselerasi Infrastruktur Komputasi AI dan LLM Nasional dengan Kluster NVIDIA H200 Tensor Core.",
				Placement:   "leaderboard",
				ImageURL:    "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80",
				TargetURL:   "https://nvidia.com",
				CtaText:     "Pelajari Solusi Enterprise →",
				IsActive:    true,
				Impressions: 4820,
				Clicks:      342,
			},
			{
				ID:          "ad-02",
				SponsorName: "AWS Sovereign Cloud Indonesia",
				Tagline:     "Kepatuhan Regulasi Data Nasional & Efisiensi Cloud Multi-Region Skala Industri.",
				Placement:   "in_article",
				ImageURL:    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
				TargetURL:   "https://aws.amazon.com",
				CtaText:     "Konsultasi Arsitektur →",
				IsActive:    true,
				Impressions: 3120,
				Clicks:      188,
			},
			{
				ID:          "ad-03",
				SponsorName: "Alibaba Cloud Intelligence",
				Tagline:     "Infrastruktur Cloud & AI Generatif Generasi Baru untuk Akselerasi Bisnis Indonesia.",
				Placement:   "billboard",
				ImageURL:    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
				TargetURL:   "https://alibabacloud.com",
				CtaText:     "Klaim Free Tier Sekarang →",
				IsActive:    true,
				Impressions: 5940,
				Clicks:      412,
			},
			{
				ID:          "ad-04",
				SponsorName: "Google Cloud Vertex AI",
				Tagline:     "Bangun Agen Cerdas dan Integrasikan Model Gemini Enterprise dengan Privasi Penuh.",
				Placement:   "midstream",
				ImageURL:    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
				TargetURL:   "https://cloud.google.com/vertex-ai",
				CtaText:     "Mulai Eksplorasi API →",
				IsActive:    true,
				Impressions: 2780,
				Clicks:      215,
			},
			{
				ID:          "ad-05",
				SponsorName: "Bank Mandiri Digital Tech",
				Tagline:     "Kemitraan API Perbankan Terbuka & Solusi Payment Gateway untuk Startup Terkemuka.",
				Placement:   "sidebar",
				ImageURL:    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
				TargetURL:   "https://bankmandiri.co.id",
				CtaText:     "Buka Integrasi API →",
				IsActive:    true,
				Impressions: 1950,
				Clicks:      134,
			},
		}
		for _, ad := range defaultAds {
			db.Create(&ad)
		}
		log.Println("🌱 Seed AdCampaigns default berhasil!")
	}

	// 4. Seed Authors
	var authorCount int64
	db.Model(&models.Author{}).Count(&authorCount)
	if authorCount == 0 {
		defaultAuthors := []models.Author{
			{
				ID:             "author-01",
				Name:           "Rijal Umami",
				Role:           "Pemimpin Redaksi & Penanggung Jawab",
				Division:       "pimpinan",
				Order:          1,
				Email:          "redaksi@queryindo.id",
				Avatar:         "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
				Bio:            "Jurnalis investigasi teknologi senior dengan spesialisasi semikonduktor, infrastruktur AI, dan kedaulatan data nasional.",
				SocialLinkedin: "https://linkedin.com",
			},
			{
				ID:             "author-02",
				Name:           "Deva Mahendra",
				Role:           "Wakil Pemimpin Redaksi & Komputasi Awan",
				Division:       "redaksi",
				Order:          2,
				Email:          "deva@queryindo.id",
				Avatar:         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
				Bio:            "Menganalisis perkembangan hyperscaler, arsitektur microservices, dan adopsi supercomputing regional.",
			},
			{
				ID:             "author-03",
				Name:           "Sarah Oktavia",
				Role:           "Redaktur Finansial & Kebijakan Digital",
				Division:       "redaksi",
				Order:          3,
				Email:          "sarah@queryindo.id",
				Avatar:         "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
				Bio:            "Fokus pada regulasi fintech, pergerakan modal ventura AI, dan pasar semikonduktor Asia-Pasifik.",
			},
		}
		for _, a := range defaultAuthors {
			db.Create(&a)
		}
		log.Println("🌱 Seed Authors default berhasil!")
	}

	// 5. Seed Poll
	var pollCount int64
	db.Model(&models.PollData{}).Count(&pollCount)
	if pollCount == 0 {
		defaultPoll := models.PollData{
			Key:        "current",
			QuestionID: "Apakah regulasi dan transparansi metadata AI di Indonesia sudah cukup memadai untuk menekan penipuan deepfake?",
			QuestionEN: "Is AI metadata transparency and regulation in Indonesia adequate enough to suppress deepfake scams?",
			Options:    `[{"id":"opt-1","textId":"Sangat Memadai & Siap","textEn":"Highly Adequate & Ready","votes":1420},{"id":"opt-2","textId":"Perlu Pengawasan Ketat","textEn":"Needs Stricter Supervision","votes":2890},{"id":"opt-3","textId":"Belum Memadai","textEn":"Not Yet Adequate","votes":3120},{"id":"opt-4","textId":"Butuh Sosialisasi Publik","textEn":"Needs Public Outreach","votes":850}]`,
			TotalVotes: 8280,
		}
		db.Create(&defaultPoll)
		log.Println("🌱 Seed Poll default berhasil!")
	}

	// 6. Seed Default Articles
	var articleCount int64
	db.Model(&models.Article{}).Count(&articleCount)
	if articleCount == 0 && len(defaultArticlesJSON) > 0 {
		var defaultArticles []models.Article
		if err := json.Unmarshal(defaultArticlesJSON, &defaultArticles); err == nil {
			for _, art := range defaultArticles {
				db.Create(&art)
			}
			log.Printf("🌱 Seed %d Artikel Berita default berhasil!\n", len(defaultArticles))
		} else {
			log.Printf("⚠️ Gagal unmarshal default articles JSON: %v\n", err)
		}
	}

	// 7. Seed Default Comments
	var commentCount int64
	db.Model(&models.Comment{}).Count(&commentCount)
	if commentCount == 0 {
		pid1 := "cmt-1"
		defaultComments := []models.Comment{
			{
				ID:         "cmt-1",
				ArticleID:  "art-001",
				AuthorName: "Dr. Irvan Kurniawan",
				AuthorRole: "AI Infrastructure Researcher",
				Avatar:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
				Content:    "Pembangunan superkomputer AI di IKN ini adalah tonggak besar kedaulatan komputasi nasional. Yang krusial sekarang adalah kesiapan talenta lokal dan keterbukaan akses API untuk kampus riset dan startup dalam negeri.",
				LikesCount: 14,
				CreatedAt:  time.Now().Add(-2 * time.Hour),
				UpdatedAt:  time.Now().Add(-2 * time.Hour),
			},
			{
				ID:         "cmt-1-1",
				ArticleID:  "art-001",
				AuthorName: "Dimas Wicaksono",
				AuthorRole: "Cloud Architect",
				Avatar:     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
				Content:    "Sepakat Pak Irvan. Efisiensi PUE data center hijau IKN dengan sumber hidro dan surya juga akan menekan OPEX pelatihan model LLM Bahasa Indonesia.",
				LikesCount: 6,
				ParentID:   &pid1,
				CreatedAt:  time.Now().Add(-45 * time.Minute),
				UpdatedAt:  time.Now().Add(-45 * time.Minute),
			},
			{
				ID:         "cmt-2",
				ArticleID:  "art-001",
				AuthorName: "Sarah Alatas",
				AuthorRole: "Tech VC Partner",
				Avatar:     "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
				Content:    "Investasi kluster GPU H200 di Asia Tenggara sedang sangat kompetitif. Langkah Indonesia ini tepat waktu sebelum tertinggal dari Singapura dan Malaysia.",
				LikesCount: 9,
				CreatedAt:  time.Now().Add(-4 * time.Hour),
				UpdatedAt:  time.Now().Add(-4 * time.Hour),
			},
		}
		for _, cmt := range defaultComments {
			db.Create(&cmt)
		}
		log.Println("🌱 Seed Komentar Pembaca default berhasil!")
	}
}

