package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// User Model (Jurnalis / Editor Admin)
type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"uniqueIndex;not null" json:"username"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string         `json:"-"`
	FullName     string         `json:"full_name"`
	Role         string         `gorm:"default:'editor'" json:"role"` // 'admin', 'editor', 'journalist'
	Avatar       string         `json:"avatar"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Category Model
type Category struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Icon        string    `json:"icon"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ArticleAuthor Model
type ArticleAuthor struct {
	Name   string `json:"name"`
	Role   string `json:"role"`
	Avatar string `json:"avatar"`
}

// Article Model
type Article struct {
	ID              string         `gorm:"primaryKey" json:"id"`
	Title           string         `gorm:"not null;type:text" json:"title"`
	Slug            string         `gorm:"uniqueIndex;not null" json:"slug"`
	Subtitle        string         `gorm:"type:text" json:"subtitle"`
	CategoryID      string         `gorm:"index;not null" json:"category"`
	Category        Category       `gorm:"foreignKey:CategoryID" json:"category_detail,omitempty"`
	AuthorJSON      string         `gorm:"type:text" json:"-"`
	Author          ArticleAuthor  `gorm:"-" json:"author"`
	TagsJSON        string         `gorm:"type:text" json:"-"`
	Tags            []string       `gorm:"-" json:"tags"`
	PublishedAt     time.Time      `json:"publishedAt"`
	ReadTimeMinutes int            `gorm:"default:4" json:"readTimeMinutes"`
	ImageURL        string         `gorm:"type:text" json:"imageUrl"`
	ImageCaption    string         `gorm:"type:text" json:"imageCaption,omitempty"`
	IsFeatured      bool           `gorm:"default:false;index" json:"isFeatured"`
	IsTrending      bool           `gorm:"default:false;index" json:"isTrending"`
	IsBreaking      bool           `gorm:"default:false;index" json:"isBreaking"`
	IsFactChecked   bool           `gorm:"default:false" json:"isFactChecked"`
	IsSponsored     bool           `gorm:"default:false" json:"isSponsored"`
	SponsorName     string         `json:"sponsorName,omitempty"`
	IsPremium       bool           `gorm:"default:false" json:"isPremium"`
	ViewsCount      int64          `gorm:"default:0" json:"viewsCount"`
	LikesCount      int64          `gorm:"default:0" json:"likesCount"`
	AISummaryJSON   string         `gorm:"type:text" json:"-"`
	AISummary       []string       `gorm:"-" json:"aiSummary"`
	Content         string         `gorm:"type:text" json:"content"`
	Status          string         `gorm:"default:'published';index" json:"status"` // 'draft', 'published'
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (a *Article) BeforeSave(tx *gorm.DB) error {
	if a.Author.Name != "" || a.Author.Role != "" || a.Author.Avatar != "" {
		bytes, _ := json.Marshal(a.Author)
		a.AuthorJSON = string(bytes)
	}
	if len(a.Tags) > 0 {
		bytes, _ := json.Marshal(a.Tags)
		a.TagsJSON = string(bytes)
	}
	if len(a.AISummary) > 0 {
		bytes, _ := json.Marshal(a.AISummary)
		a.AISummaryJSON = string(bytes)
	}
	return nil
}

func (a *Article) AfterFind(tx *gorm.DB) error {
	if a.AuthorJSON != "" {
		_ = json.Unmarshal([]byte(a.AuthorJSON), &a.Author)
	}
	if a.TagsJSON != "" {
		_ = json.Unmarshal([]byte(a.TagsJSON), &a.Tags)
	}
	if a.AISummaryJSON != "" {
		_ = json.Unmarshal([]byte(a.AISummaryJSON), &a.AISummary)
	}
	return nil
}

// TechIndex Model
type TechIndex struct {
	Symbol     string    `gorm:"primaryKey" json:"symbol"`
	Name       string    `json:"name"`
	Value      string    `json:"value"`
	Change     string    `json:"change"`
	IsPositive bool      `json:"is_positive"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Author Model (Susunan Dewan Redaksi)
type Author struct {
	ID             string    `gorm:"primaryKey" json:"id"`
	Name           string    `gorm:"not null" json:"name"`
	Role           string    `gorm:"not null" json:"role"`
	Division       string    `gorm:"default:'redaksi'" json:"division"`
	Order          int       `gorm:"default:1" json:"order"`
	Email          string    `json:"email"`
	Avatar         string    `json:"avatar"`
	Bio            string    `gorm:"type:text" json:"bio"`
	SocialTwitter  string    `json:"socialTwitter,omitempty"`
	SocialLinkedin string    `json:"socialLinkedin,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// AdCampaign Model (Kemitraan & Iklan Banner)
type AdCampaign struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	SponsorName string    `gorm:"not null" json:"sponsorName"`
	Tagline     string    `gorm:"type:text" json:"tagline"`
	Placement   string    `gorm:"index;not null" json:"placement"`
	ImageURL    string    `gorm:"type:text" json:"imageUrl"`
	TargetURL   string    `gorm:"type:text" json:"targetUrl"`
	CtaText     string    `json:"ctaText"`
	IsActive    bool      `gorm:"default:true" json:"isActive"`
	Impressions int64     `gorm:"default:0" json:"impressions"`
	Clicks      int64     `gorm:"default:0" json:"clicks"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ShoppingProduct Model (Rekomendasi Belanja / Query Picks)
type ShoppingProduct struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	Title           string    `gorm:"not null;type:text" json:"title"`
	ImageURL        string    `gorm:"type:text" json:"imageUrl"`
	OriginalPrice   string    `json:"originalPrice"`
	DiscountPrice   string    `json:"discountPrice"`
	DiscountPercent string    `json:"discountPercent"`
	TargetURL       string    `gorm:"type:text" json:"targetUrl"`
	Category        string    `json:"category"`
	IsActive        bool      `gorm:"default:true" json:"isActive"`
	Clicks          int64     `gorm:"default:0" json:"clicks"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// ShoppingConfig Model (Pengaturan Banner Rekomendasi Belanja)
type ShoppingConfig struct {
	Key         string `gorm:"primaryKey;default:'main'" json:"key"`
	BadgeText   string `json:"badgeText"`
	PartnerText string `json:"partnerText"`
	MainTitle   string `json:"mainTitle"`
	Enabled     bool   `gorm:"default:true" json:"enabled"`
}

// PollData Model (Jajak Pendapat / Polling Redaksi)
type PollData struct {
	Key        string `gorm:"primaryKey;default:'current'" json:"key"`
	QuestionID string `gorm:"type:text" json:"questionId"`
	QuestionEN string `gorm:"type:text" json:"questionEn"`
	Options    string `gorm:"type:text" json:"options"` // JSON array string
	TotalVotes int64  `gorm:"default:0" json:"totalVotes"`
}

