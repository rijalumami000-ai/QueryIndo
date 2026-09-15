package models

import (
	"time"

	"gorm.io/gorm"
)

// Comment Model (Komentar Pembaca & Balasan Diskusi)
type Comment struct {
	ID         string         `gorm:"primaryKey" json:"id"`
	ArticleID  string         `gorm:"index;not null" json:"articleId"`
	AuthorName string         `gorm:"not null" json:"authorName"`
	AuthorRole string         `json:"authorRole,omitempty"`
	Avatar     string         `json:"avatar,omitempty"`
	Content    string         `gorm:"type:text;not null" json:"content"`
	LikesCount int64          `gorm:"default:0" json:"likesCount"`
	ParentID   *string        `gorm:"index" json:"parentId,omitempty"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// CommentResponse Model with Nested Child Replies for Frontend Rendering
type CommentResponse struct {
	ID         string            `json:"id"`
	ArticleID  string            `json:"articleId"`
	AuthorName string            `json:"authorName"`
	AuthorRole string            `json:"authorRole,omitempty"`
	Avatar     string            `json:"avatar,omitempty"`
	Content    string            `json:"content"`
	CreatedAt  string            `json:"createdAt"`
	LikesCount int64             `json:"likesCount"`
	ParentID   *string           `json:"parentId,omitempty"`
	Replies    []CommentResponse `json:"replies"`
}
