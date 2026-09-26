package utils

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var (
	r2Client     *s3.Client
	r2Bucket     string
	r2PublicURL  string
	r2InitOnce   sync.Once
	r2Configured bool
)

// InitR2Storage initializes the Cloudflare R2 S3-compatible client
func InitR2Storage() {
	r2InitOnce.Do(func() {
		accountID := strings.TrimSpace(os.Getenv("R2_ACCOUNT_ID"))
		accessKey := strings.TrimSpace(os.Getenv("R2_ACCESS_KEY_ID"))
		secretKey := strings.TrimSpace(os.Getenv("R2_SECRET_ACCESS_KEY"))
		bucket := strings.TrimSpace(os.Getenv("R2_BUCKET_NAME"))
		publicURL := strings.TrimSpace(os.Getenv("R2_PUBLIC_URL"))

		if accountID == "" || accessKey == "" || secretKey == "" || bucket == "" {
			log.Println("ℹ️ [Cloudflare R2] Konfigurasi R2 belum lengkap di .env (Fallback ke disk lokal VPS).")
			r2Configured = false
			return
		}

		if publicURL == "" {
			publicURL = "https://cdn.queryindo.com"
		}
		publicURL = strings.TrimRight(publicURL, "/")

		r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

		cfg, err := config.LoadDefaultConfig(context.Background(),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
			config.WithRegion("auto"),
		)
		if err != nil {
			log.Printf("⚠️ [Cloudflare R2] Gagal memuat konfigurasi AWS SDK: %v", err)
			r2Configured = false
			return
		}

		client := s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(r2Endpoint)
		})

		r2Client = client
		r2Bucket = bucket
		r2PublicURL = publicURL
		r2Configured = true

		log.Printf("⚡ [Cloudflare R2] Berhasil terhubung ke Bucket: '%s' (Endpoint: %s, Public: %s)", r2Bucket, r2Endpoint, r2PublicURL)
	})
}

// IsR2Configured checks if Cloudflare R2 is initialized and ready
func IsR2Configured() bool {
	InitR2Storage()
	return r2Configured && r2Client != nil
}

// UploadToR2 uploads a file stream directly to Cloudflare R2
func UploadToR2(ctx context.Context, key string, body io.Reader, contentType string) (string, error) {
	if !IsR2Configured() {
		return "", fmt.Errorf("Cloudflare R2 belum terkonfigurasi")
	}

	// Normalize key (no leading slash)
	cleanKey := strings.TrimPrefix(key, "/")

	uploadCtx, cancel := context.WithTimeout(ctx, 45*time.Second)
	defer cancel()

	putInput := &s3.PutObjectInput{
		Bucket:      aws.String(r2Bucket),
		Key:         aws.String(cleanKey),
		Body:        body,
		ContentType: aws.String(contentType),
	}

	_, err := r2Client.PutObject(uploadCtx, putInput)
	if err != nil {
		log.Printf("❌ [Cloudflare R2] Gagal mengunggah '%s': %v", cleanKey, err)
		return "", fmt.Errorf("gagal upload ke Cloudflare R2: %w", err)
	}

	cdnURL := fmt.Sprintf("%s/%s", r2PublicURL, cleanKey)
	log.Printf("☁️ [Cloudflare R2] Berhasil upload: %s -> %s", cleanKey, cdnURL)
	return cdnURL, nil
}

// DeleteFromR2 removes a file from Cloudflare R2
func DeleteFromR2(ctx context.Context, key string) error {
	if !IsR2Configured() {
		return fmt.Errorf("Cloudflare R2 belum terkonfigurasi")
	}

	cleanKey := strings.TrimPrefix(key, "/")
	// If full URL was provided, strip domain
	if strings.Contains(cleanKey, r2PublicURL) {
		cleanKey = strings.TrimPrefix(cleanKey, r2PublicURL)
		cleanKey = strings.TrimPrefix(cleanKey, "/")
	}

	deleteCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	_, err := r2Client.DeleteObject(deleteCtx, &s3.DeleteObjectInput{
		Bucket: aws.String(r2Bucket),
		Key:    aws.String(cleanKey),
	})
	if err != nil {
		log.Printf("⚠️ [Cloudflare R2] Gagal menghapus '%s': %v", cleanKey, err)
		return err
	}

	log.Printf("🗑️ [Cloudflare R2] Berhasil dihapus: %s", cleanKey)
	return nil
}
