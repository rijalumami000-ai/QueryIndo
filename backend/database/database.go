package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"byteindonesia/backend/models"
	"byteindonesia/backend/utils"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

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
		&models.SocialLink{},
		&models.ArticleLike{},
	)
	if err != nil {
		log.Printf("⚠️ AutoMigrate Error: %v", err)
	} else {
		log.Println("✅ AutoMigrate Skema Database PostgreSQL Selesai!")
		seedSuperuserIfEmpty(db)
		seedDefaultCMSData(db)
		seedSocialLinksIfEmpty(db)
	}

	DB = db
	return db, nil
}

func seedSuperuserIfEmpty(db *gorm.DB) {
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		adminUser := os.Getenv("ADMIN_USER")
		if adminUser == "" {
			adminUser = "Rijalumami"
		}
		adminEmail := os.Getenv("ADMIN_EMAIL")
		if adminEmail == "" {
			adminEmail = "rijalumami000@gmail.com"
		}
		adminPass := os.Getenv("ADMIN_PASSWORD")
		if adminPass == "" {
			adminPass = "rijalumami1002"
		}

		hash, err := utils.HashPassword(adminPass)
		if err != nil {
			log.Printf("⚠️ Gagal membuat bcrypt hash untuk superuser: %v", err)
			return
		}

		superuser := models.User{
			Username:     adminUser,
			Email:        adminEmail,
			PasswordHash: hash,
			FullName:     "Rijal Umami",
			Role:         "superuser",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if err := db.Create(&superuser).Error; err != nil {
			log.Printf("⚠️ Gagal seed superuser ke PostgreSQL: %v", err)
		} else {
			log.Printf("🌱 Superuser [%s (%s)] berhasil di-seed ke PostgreSQL dengan bcrypt hash!", adminUser, adminEmail)
		}
	}
}

type SystemSeedRecord struct {
	Key       string    `gorm:"primaryKey"`
	Seeded    bool      `gorm:"default:true"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func seedDefaultCMSData(db *gorm.DB) {
	_ = db.AutoMigrate(&SystemSeedRecord{})
	var seedRecord SystemSeedRecord
	if err := db.Where("key = ?", "initial_seed_v1").First(&seedRecord).Error; err == nil {
		log.Println("ℹ️ Database sudah di-seed sebelumnya. Melewati auto-seed agar konten yang telah dihapus tidak muncul kembali.")
		return
	}

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
				Title:           "EMBA Perfume - Reef EDP 30ml",
				ImageURL:        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 199.000",
				DiscountPrice:   "Rp 79.900",
				DiscountPercent: "60%",
				TargetURL:       "https://shopee.co.id",
				Category:        "BEAUTY & PERSONAL CARE",
				IsActive:        true,
				Clicks:          310,
			},
			{
				ID:              "shop-02",
				Title:           "MODOFO Tumbler Stainless 710ml Botol Minum Termos",
				ImageURL:        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 98.000",
				DiscountPrice:   "Rp 37.385",
				DiscountPercent: "61%",
				TargetURL:       "https://shopee.co.id",
				Category:        "HOME & LIVING",
				IsActive:        true,
				Clicks:          195,
			},
			{
				ID:              "shop-03",
				Title:           "Sepatu Reebok classic premium sepatu sneakers",
				ImageURL:        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 310.000",
				DiscountPrice:   "Rp 150.351",
				DiscountPercent: "51%",
				TargetURL:       "https://tokopedia.com",
				Category:        "FASHION",
				IsActive:        true,
				Clicks:          254,
			},
			{
				ID:              "shop-04",
				Title:           "KING LUCKY M11 Portable Fan Turbo Kipas USB Mini",
				ImageURL:        "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 90.000",
				DiscountPrice:   "Rp 39.004",
				DiscountPercent: "56%",
				TargetURL:       "https://shopee.co.id",
				Category:        "GADGET & TECH",
				IsActive:        true,
				Clicks:          142,
			},
			{
				ID:              "shop-05",
				Title:           "IP13 256GB FULLSET MULUS Garansi Resmi",
				ImageURL:        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 3.999.000",
				DiscountPrice:   "Rp 2.999.000",
				DiscountPercent: "25%",
				TargetURL:       "https://tokopedia.com",
				Category:        "GADGET & TECH",
				IsActive:        true,
				Clicks:          168,
			},
			{
				ID:              "shop-06",
				Title:           "Keychron K2 V2 Wireless Mechanical Keyboard RGB Hot-Swap",
				ImageURL:        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
				OriginalPrice:   "Rp 1.450.000",
				DiscountPrice:   "Rp 1.087.000",
				DiscountPercent: "25%",
				TargetURL:       "https://tokopedia.com",
				Category:        "PC & PERIPHERALS",
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
				Email:          "redaksi@queryindo.com",
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
				Email:          "deva@queryindo.com",
				Avatar:         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
				Bio:            "Menganalisis perkembangan hyperscaler, arsitektur microservices, dan adopsi supercomputing regional.",
			},
			{
				ID:             "author-03",
				Name:           "Sarah Oktavia",
				Role:           "Redaktur Finansial & Kebijakan Digital",
				Division:       "redaksi",
				Order:          3,
				Email:          "sarah@queryindo.com",
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

	// Mark database as seeded so future restarts never re-insert deleted dummy data
	db.Create(&SystemSeedRecord{Key: "initial_seed_v1", Seeded: true, CreatedAt: time.Now()})
}

// 6. Seed Official Social Media Links if empty
func seedSocialLinksIfEmpty(db *gorm.DB) {
	var socialCount int64
	db.Model(&models.SocialLink{}).Count(&socialCount)
	if socialCount == 0 {
		defaultSocials := []models.SocialLink{
			{
				ID:        "soc-facebook",
				Platform:  "facebook",
				Name:      "Facebook",
				URL:       "https://facebook.com/queryindo",
				IsActive:  true,
				Order:     1,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-instagram",
				Platform:  "instagram",
				Name:      "Instagram",
				URL:       "https://instagram.com/queryindo",
				IsActive:  true,
				Order:     2,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-threads",
				Platform:  "threads",
				Name:      "Threads",
				URL:       "https://threads.net/@queryindo",
				IsActive:  true,
				Order:     3,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-x",
				Platform:  "x",
				Name:      "X (Twitter)",
				URL:       "https://x.com/queryindo",
				IsActive:  true,
				Order:     4,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-tiktok",
				Platform:  "tiktok",
				Name:      "TikTok",
				URL:       "https://tiktok.com/@queryindo",
				IsActive:  true,
				Order:     5,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-youtube",
				Platform:  "youtube",
				Name:      "YouTube",
				URL:       "https://youtube.com/@queryindo",
				IsActive:  true,
				Order:     6,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-linkedin",
				Platform:  "linkedin",
				Name:      "LinkedIn",
				URL:       "https://linkedin.com/company/queryindo",
				IsActive:  true,
				Order:     7,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			{
				ID:        "soc-telegram",
				Platform:  "telegram",
				Name:      "Telegram",
				URL:       "https://t.me/queryindo",
				IsActive:  false,
				Order:     8,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		}
		for _, s := range defaultSocials {
			db.Create(&s)
		}
		log.Println("🌱 Seed Media Sosial Resmi QUERYINDO berhasil!")
	}
}

