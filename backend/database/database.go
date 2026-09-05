package database

import (
	"fmt"
	"log"
	"os"

	"byteindonesia/backend/models"

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
	)
	if err != nil {
		log.Printf("⚠️ AutoMigrate Error: %v", err)
	} else {
		log.Println("✅ AutoMigrate Skema Database PostgreSQL Selesai!")
	}

	DB = db
	return db, nil
}
