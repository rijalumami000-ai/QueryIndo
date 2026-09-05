package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
	"byteindonesia/backend/database"
	"byteindonesia/backend/models"
)

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Success bool   `json:"success"`
	Reply   string `json:"reply"`
}

// Gemini API structures
type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiCandidate struct {
	Content struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"content"`
}

type GeminiResponse struct {
	Candidates []GeminiCandidate `json:"candidates"`
}

// stripHTML removes HTML tags and sanitizes plain text for Gemini API prompt context
func stripHTML(html string) string {
	re := regexp.MustCompile("<[^>]*>")
	plain := re.ReplaceAllString(html, "")
	spaceRe := regexp.MustCompile(`\s+`)
	return spaceRe.ReplaceAllString(plain, " ")
}

// ChatAI handles live RAG AI query on QUERYINDO database with real backend Gemini integration
func ChatAI(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	userMsg := strings.ToLower(req.Message)
	var articles []models.Article
	db := database.DB

	// 1. Retrieve RAG context: Search database for relevant articles
	if db != nil {
		db.Where("LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(subtitle) LIKE ?", "%"+userMsg+"%", "%"+userMsg+"%", "%"+userMsg+"%").Limit(3).Find(&articles)
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey != "" {
		// Build RAG context block
		var contextBuilder strings.Builder
		if len(articles) > 0 {
			contextBuilder.WriteString("Berikut adalah beberapa artikel berita dari database QUERYINDO yang sangat relevan:\n\n")
			for _, art := range articles {
				contextBuilder.WriteString(fmt.Sprintf("--- \nJudul: %s\nSubtitle: %s\nIsi Ringkas: %s\nSlug: %s\n---\n\n", art.Title, art.Subtitle, stripHTML(art.Content), art.Slug))
			}
		}

		// Prompt construction telling Gemini to cite articles using standard format: [Title](#article/slug)
		prompt := "Kamu adalah QueryAI Assistant, jurnalis AI dari media teknologi QUERYINDO. Jawablah pertanyaan pembaca secara informatif, terpercaya, dan ringkas.\n"
		if contextBuilder.Len() > 0 {
			prompt += "Kamu harus memprioritaskan dan menggunakan data dari database artikel QUERYINDO di bawah ini untuk menjawab. Jika informasi tidak ada di artikel, kamu boleh menjawab menggunakan pengetahuan umummu, tetapi prioritaskan data dari artikel.\n"
			prompt += "Kewajiban Penting: Jika kamu merujuk atau mengutip artikel berita di bawah, kamu wajib menyertakan link rujukan ke halaman artikel tersebut dengan format markdown persis seperti ini: [Judul Artikel](#article/slug-artikel) agar pembaca dapat membacanya langsung.\n\n"
			prompt += "DATABASE ARTIKEL:\n" + contextBuilder.String()
		} else {
			prompt += "Gunakan pengetahuan umummu tentang teknologi untuk menjawab secara ringkas karena tidak ditemukan artikel terkait di database kami saat ini.\n\n"
		}
		prompt += "Pertanyaan Pembaca:\n" + req.Message

		geminiReq := GeminiRequest{
			Contents: []GeminiContent{
				{
					Parts: []GeminiPart{
						{Text: prompt},
					},
				},
			},
		}

		jsonData, err := json.Marshal(geminiReq)
		if err == nil {
			resp, err := http.Post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apiKey, "application/json", bytes.NewBuffer(jsonData))
			if err == nil {
				defer resp.Body.Close()
				body, err := io.ReadAll(resp.Body)
				if err == nil {
					var geminiResp GeminiResponse
					if err := json.Unmarshal(body, &geminiResp); err == nil && len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
						replyText := geminiResp.Candidates[0].Content.Parts[0].Text
						return c.JSON(ChatResponse{
							Success: true,
							Reply:   replyText,
						})
					}
				}
			}
		}
	}

	// Fallback to local semantic offline RAG response
	var reply string
	if len(articles) > 0 {
		art := articles[0]
		reply = "Berdasarkan rilis berita resmi **QUERYINDO**:\n\n**[" + art.Title + "](#article/" + art.Slug + ")**\n\n" + art.Subtitle + "\n\nRedaksi mengonfirmasi bahwa perkembangan ini terus dipantau secara langsung oleh tim jurnalis kami."
	} else {
		if strings.Contains(userMsg, "ikn") || strings.Contains(userMsg, "superkomputer") {
			reply = "Superkomputer AI **Ganesha-1** berkapasitas 100 Petaflops di Pusat Data Nasional (PDN) IKN kini telah aktif sepenuhnya untuk riset LLM Bahasa Indonesia."
		} else if strings.Contains(userMsg, "ruu") || strings.Contains(userMsg, "kedaulatan") {
			reply = "Draf terbaru RUU Kedaulatan AI mewajibkan pelabelan enkripsi kriptografi C2PA pada media buatan AI guna menanggulangi penyebaran konten deepfake."
		} else if strings.Contains(userMsg, "starlink") || strings.Contains(userMsg, "satelit") {
			reply = "Layanan roaming satelit orbit rendah (LEO) Direct-to-Cell dirancang untuk menghubungkan smartphone standar di pelosok Indonesia tanpa stasiun bumi tambahan."
		} else {
			reply = "Pertanyaan Anda mengenai \"" + req.Message + "\" telah diterima. Asisten QueryAI merekomendasikan untuk menelusuri kategori AI atau Kebijakan Digital di portal utama kami."
		}
	}

	return c.JSON(ChatResponse{
		Success: true,
		Reply:   reply,
	})
}
