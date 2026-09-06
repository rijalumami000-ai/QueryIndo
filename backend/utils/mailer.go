package utils

import (
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

// MailerConfig holds SMTP configuration
type MailerConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string
}

func getMailerConfig() MailerConfig {
	host := os.Getenv("SMTP_HOST")
	if host == "" {
		host = "smtp.hostinger.com"
	}
	port := os.Getenv("SMTP_PORT")
	if port == "" {
		port = "465"
	}
	user := os.Getenv("SMTP_USER")
	if user == "" {
		user = "redaksi@queryindo.com"
	}
	pass := os.Getenv("SMTP_PASS")
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		from = fmt.Sprintf("QUERYINDO Redaksi <%s>", user)
	}

	return MailerConfig{
		Host:     host,
		Port:     port,
		User:     user,
		Password: pass,
		From:     from,
	}
}

// SendHTMLEmail sends an HTML email via Resend API (HTTPS 443), Brevo API (HTTPS 443), or Direct SMTP (SSL 465)
func SendHTMLEmail(toEmail string, subject string, htmlBody string) error {
	// 1. Check if Resend API Key is provided (HTTPS Port 443 - Bypasses all VPS port blocks)
	resendKey := os.Getenv("RESEND_API_KEY")
	if resendKey != "" {
		return sendViaResend(resendKey, toEmail, subject, htmlBody)
	}

	// 2. Check if Brevo API Key is provided (HTTPS Port 443)
	brevoKey := os.Getenv("BREVO_API_KEY")
	if brevoKey != "" {
		return sendViaBrevo(brevoKey, toEmail, subject, htmlBody)
	}

	cfg := getMailerConfig()

	if cfg.Password == "" {
		log.Printf("ℹ️ [MAILER SIMULATION] To: %s | Subject: %s (SMTP_PASS not set, email simulated)\n", toEmail, subject)
		return nil
	}

	header := make(map[string]string)
	header["From"] = cfg.From
	header["To"] = toEmail
	header["Reply-To"] = cfg.User
	header["Subject"] = fmt.Sprintf("=?UTF-8?B?%s?=", base64.StdEncoding.EncodeToString([]byte(subject)))
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = "text/html; charset=\"UTF-8\""
	header["Date"] = time.Now().Format(time.RFC1123Z)

	message := ""
	for k, v := range header {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	// Hostinger Port 465 uses direct SSL/TLS connection
	if cfg.Port == "465" {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         cfg.Host,
		}

		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			log.Printf("❌ Failed to dial TLS to %s: %v\n", addr, err)
			return err
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, cfg.Host)
		if err != nil {
			log.Printf("❌ Failed to create SMTP client: %v\n", err)
			return err
		}
		defer client.Quit()

		auth := smtp.PlainAuth("", cfg.User, cfg.Password, cfg.Host)
		if err = client.Auth(auth); err != nil {
			log.Printf("❌ SMTP Auth failed for user %s: %v\n", cfg.User, err)
			return err
		}

		if err = client.Mail(cfg.User); err != nil {
			return err
		}
		if err = client.Rcpt(toEmail); err != nil {
			return err
		}

		w, err := client.Data()
		if err != nil {
			return err
		}
		_, err = w.Write([]byte(message))
		if err != nil {
			return err
		}
		err = w.Close()
		if err != nil {
			return err
		}

		log.Printf("✅ [MAILER] Email successfully sent to %s via %s (SSL 465)\n", toEmail, cfg.Host)
		return nil
	}

	// Standard STARTTLS (Port 587)
	auth := smtp.PlainAuth("", cfg.User, cfg.Password, cfg.Host)
	host, _, _ := net.SplitHostPort(addr)
	tlsConfig := &tls.Config{
		ServerName: host,
	}

	c, err := smtp.Dial(addr)
	if err != nil {
		return err
	}
	defer c.Close()

	if ok, _ := c.Extension("STARTTLS"); ok {
		if err = c.StartTLS(tlsConfig); err != nil {
			return err
		}
	}

	if err = c.Auth(auth); err != nil {
		return err
	}

	if err = c.Mail(cfg.User); err != nil {
		return err
	}
	if err = c.Rcpt(toEmail); err != nil {
		return err
	}

	w, err := c.Data()
	if err != nil {
		return err
	}
	_, err = w.Write([]byte(message))
	if err != nil {
		return err
	}
	err = w.Close()
	if err != nil {
		return err
	}

	log.Printf("✅ [MAILER] Email successfully sent to %s via %s (Port %s)\n", toEmail, cfg.Host, cfg.Port)
	return nil
}

// sendViaResend sends email via Resend HTTP REST API over HTTPS port 443
func sendViaResend(apiKey, toEmail, subject, htmlBody string) error {
	cfg := getMailerConfig()
	payload := map[string]interface{}{
		"from":    cfg.From,
		"to":      []string{toEmail},
		"subject": subject,
		"html":    htmlBody,
	}
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ [MAILER RESEND] HTTP Request Error: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("✅ [MAILER RESEND] Email successfully delivered to %s via HTTPS 443\n", toEmail)
		return nil
	}

	body, _ := io.ReadAll(resp.Body)
	log.Printf("❌ [MAILER RESEND] Delivery failed (HTTP %d): %s\n", resp.StatusCode, string(body))
	return fmt.Errorf("resend api error (status %d): %s", resp.StatusCode, string(body))
}

// sendViaBrevo sends email via Brevo (Sendinblue) HTTP REST API over HTTPS port 443
func sendViaBrevo(apiKey, toEmail, subject, htmlBody string) error {
	cfg := getMailerConfig()
	payload := map[string]interface{}{
		"sender": map[string]string{
			"name":  "QUERYINDO Redaksi",
			"email": cfg.User,
		},
		"to": []map[string]string{
			{"email": toEmail},
		},
		"subject":     subject,
		"htmlContent": htmlBody,
	}
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.brevo.com/v3/smtp/email", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("api-key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("❌ [MAILER BREVO] HTTP Request Error: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("✅ [MAILER BREVO] Email successfully delivered to %s via HTTPS 443\n", toEmail)
		return nil
	}

	body, _ := io.ReadAll(resp.Body)
	log.Printf("❌ [MAILER BREVO] Delivery failed (HTTP %d): %s\n", resp.StatusCode, string(body))
	return fmt.Errorf("brevo api error (status %d): %s", resp.StatusCode, string(body))
}

// BroadcastArticleItem defines an article card in the newsletter blast
type BroadcastArticleItem struct {
	Title    string `json:"title"`
	Category string `json:"category"`
	Excerpt  string `json:"excerpt"`
	URL      string `json:"url"`
	ImageURL string `json:"imageUrl"`
	ReadTime string `json:"readTime"`
}

// SendWelcomeEmail sends a high-grade welcome letter to new subscribers
func SendWelcomeEmail(toEmail string) {
	subject := "Selamat Datang di Newsletter Resmi QUERYINDO 🚀"
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #090b10; color: #ffffff; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 20px auto; background: #0f131c; border: 1px solid #1e2638; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%%, #2563eb 100%%); padding: 30px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .body { padding: 32px 24px; line-height: 1.6; color: #cbd5e1; font-size: 15px; }
    .body strong { color: #38bdf8; }
    .card { background: #161b26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
    .feature-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .feature-item:last-child { margin-bottom: 0; }
    .feature-icon { color: #0ea5e9; font-weight: bold; margin-right: 10px; font-size: 16px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%%, #2563eb 100%%); color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin-top: 10px; text-align: center; font-size: 15px; }
    .footer { background: #090b10; border-top: 1px solid #1e2638; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>QUERYINDO</h1>
      <p>Jurnalisme Teknologi, Kecerdasan Buatan & Industri Digital</p>
    </div>
    <div class="body">
      <h2 style="margin-top: 0; font-size: 18px; color: #ffffff;">Halo Pembaca Setia,</h2>
      <p>Terima kasih telah bergabung dalam buletin harian resmi <strong>QUERYINDO</strong>. Anda kini menjadi bagian dari komunitas pembaca eksklusif yang memantau perkembangan teknologi, AI, cloud computing, semikonduktor, dan ekonomi digital Indonesia secara mendalam.</p>
      
      <div class="card">
        <div style="font-weight: 700; color: #ffffff; margin-bottom: 12px; font-size: 14px;">Apa yang Akan Anda Dapatkan:</div>
        <div class="feature-item">
          <span class="feature-icon">⚡</span>
          <div><strong>Breaking News & Analisis Kilat</strong> — Liputan eksklusif mengenai terobosan teknologi dunia dan dampaknya ke tanah air.</div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🧠</span>
          <div><strong>Insight AI & Ekosistem Digital</strong> — Ulasan arsitektur AI, perkembangan startup, dan riset sains komputasi.</div>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🛡️</span>
          <div><strong>Jurnalisme Terverifikasi Bebas Clickbait</strong> — Informasi akurat yang telah melalui proses kurasi dan fact-checking dewan redaksi.</div>
        </div>
      </div>

      <p style="margin-bottom: 24px;">Buletin berita terkini akan dikirimkan langsung ke kotak masuk email Anda setiap pagi dan sore hari.</p>
      
      <div style="text-align: center;">
        <a href="https://www.queryindo.com" class="cta-btn">Jelajahi Portal Berita QUERYINDO →</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">&copy; %d QUERYINDO Media. Seluruh hak cipta dilindungi.</p>
      <p style="margin: 0;">Email ini dikirimkan otomatis karena Anda mendaftarkan alamat <strong>%s</strong> di portal queryindo.com.</p>
    </div>
  </div>
</body>
</html>
`, time.Now().Year(), toEmail)

	if err := SendHTMLEmail(toEmail, subject, html); err != nil {
		log.Printf("⚠️ Could not send welcome email to %s: %v\n", toEmail, err)
	}
}

// SendNewsBroadcastEmail sends formatted daily digest to a list of subscribers
func SendNewsBroadcastEmail(subscribers []string, subject string, headline string, articles []BroadcastArticleItem) (int, error) {
	if len(subscribers) == 0 {
		return 0, nil
	}

	articlesHTML := ""
	for _, art := range articles {
		readTimeStr := art.ReadTime
		if readTimeStr == "" {
			readTimeStr = "3 mnt baca"
		}
		articlesHTML += fmt.Sprintf(`
      <div style="background: #161b26; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 16px; overflow: hidden;">
        %s
        <div style="padding: 16px;">
          <span style="display:inline-block; font-size: 11px; font-weight: 800; color: #0ea5e9; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">%s • %s</span>
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; line-height: 1.4; color: #ffffff;"><a href="%s" style="color: #ffffff; text-decoration: none;">%s</a></h3>
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">%s</p>
          <a href="%s" style="font-size: 13px; font-weight: 700; color: #38bdf8; text-decoration: none;">Baca Selengkapnya →</a>
        </div>
      </div>
    `, func() string {
			if art.ImageURL != "" {
				return fmt.Sprintf(`<img src="%s" alt="%s" style="width: 100%%; max-height: 200px; object-fit: cover; display: block;" />`, art.ImageURL, art.Title)
			}
			return ""
		}(), art.Category, readTimeStr, art.URL, art.Title, art.Excerpt, art.URL)
	}

	dateStr := time.Now().Format("2 January 2006")
	htmlTemplate := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #090b10; color: #ffffff; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 20px auto; background: #0f131c; border: 1px solid #1e2638; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%%, #2563eb 100%%); padding: 26px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; }
    .header p { margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .body { padding: 24px; color: #cbd5e1; }
    .headline-box { background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0ea5e9; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }
    .headline-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0; }
    .footer { background: #090b10; border-top: 1px solid #1e2638; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>QUERYINDO DAILY BRIEF</h1>
      <p>Update Berita & Analisis Tekno • %s</p>
    </div>
    <div class="body">
      <div class="headline-box">
        <p class="headline-title">📢 %s</p>
      </div>

      %s

      <div style="text-align: center; margin: 24px 0 12px 0;">
        <a href="https://www.queryindo.com" style="display: inline-block; background: linear-gradient(135deg, #38bdf8 0%%, #2563eb 100%%); color: #000000 !important; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px;" target="_blank">Lihat Semua Berita di QUERYINDO.COM →</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 QUERYINDO Media Group. Wisma Nugra Santana, Jl Jend Sudirman, Jakarta Pusat.</p>
      <p>Anda menerima email ini karena terdaftar sebagai pelanggan newsletter di <a href="https://www.queryindo.com">www.queryindo.com</a>.</p>
    </div>
  </div>
</body>
</html>
`, dateStr, headline, articlesHTML)

	sentCount := 0
	for _, email := range subscribers {
		if strings.TrimSpace(email) == "" {
			continue
		}
		if err := SendHTMLEmail(email, subject, htmlTemplate); err == nil {
			sentCount++
		}
	}

	return sentCount, nil
}
