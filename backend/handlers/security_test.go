package handlers

import (
	"strings"
	"testing"
)

func TestSanitizeCommentText(t *testing.T) {
	cases := []struct {
		input    string
		expected string
	}{
		{
			input:    "Komentar biasa yang bersih",
			expected: "Komentar biasa yang bersih",
		},
		{
			input:    "<script>alert('xss')</script>Halo Dunia",
			expected: "alert('xss')Halo Dunia",
		},
		{
			input:    "<img src=x onerror=alert(1)>Teks Komentar",
			expected: "Teks Komentar",
		},
		{
			input:    "Komentar dengan null byte\x00 tersembunyi",
			expected: "Komentar dengan null byte tersembunyi",
		},
		{
			input:    "   <div style='color:red;'>Halo</div>   ",
			expected: "Halo",
		},
	}

	for _, tc := range cases {
		actual := sanitizeCommentText(tc.input)
		if actual != tc.expected {
			t.Errorf("sanitizeCommentText(%q) = %q; expected %q", tc.input, actual, tc.expected)
		}
	}
}

func TestSanitizeAvatarURL(t *testing.T) {
	fallback := "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"

	cases := []struct {
		input    string
		expected string
	}{
		{
			input:    "javascript:alert('xss')",
			expected: fallback,
		},
		{
			input:    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
			expected: fallback,
		},
		{
			input:    "http://localhost:8080/avatar.jpg",
			expected: fallback,
		},
		{
			input:    "http://internal.local/pic.png",
			expected: fallback,
		},
		{
			input:    "https://images.unsplash.com/photo-12345?w=100",
			expected: "https://images.unsplash.com/photo-12345?w=100",
		},
		{
			input:    "",
			expected: fallback,
		},
	}

	for _, tc := range cases {
		actual := sanitizeAvatarURL(tc.input, fallback)
		if actual != tc.expected {
			t.Errorf("sanitizeAvatarURL(%q) = %q; expected %q", tc.input, actual, tc.expected)
		}
	}
}

func TestSanitizePlainText(t *testing.T) {
	dirty := "<b>Judul</b> Artikel <script>alert(1)</script>"
	clean := sanitizePlainText(dirty)
	if strings.Contains(clean, "<") || strings.Contains(clean, ">") {
		t.Errorf("sanitizePlainText failed to strip HTML tags: %q", clean)
	}
}

func TestValidateSafeTargetURL(t *testing.T) {
	unsafeTargets := []string{
		"http://127.0.0.1:8080/health",
		"http://localhost:5432",
		"http://169.254.169.254/latest/meta-data/",
		"http://10.0.0.1/admin",
		"http://192.168.1.1/router",
		"file:///etc/passwd",
		"ftp://malicious.host/file",
	}

	for _, target := range unsafeTargets {
		_, err := validateSafeTargetURL(target)
		if err == nil {
			t.Errorf("validateSafeTargetURL(%q) should have been rejected as SSRF risk, but passed", target)
		}
	}

	safeTarget := "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
	safeURL, err := validateSafeTargetURL(safeTarget)
	if err != nil {
		t.Errorf("validateSafeTargetURL(%q) valid URL was unexpectedly rejected: %v", safeTarget, err)
	}
	if safeURL != safeTarget {
		t.Errorf("validateSafeTargetURL returned %q; expected %q", safeURL, safeTarget)
	}
}
