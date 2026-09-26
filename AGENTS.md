# QUERYINDO — Agent & Coding Standards Guide (AGENTS.md)

Dokumen ini adalah panduan standar baku rekayasa perangkat lunak (*coding standards*), aturan arsitektur, dan prosedur operasional untuk seluruh agen AI dan pengembang yang bekerja di repositori **QUERYINDO**.

---

## 🏛️ 1. Arsitektur Proyek & Pemisahan Tanggung Jawab

| Komponen | Teknologi | Lokasi | Port / Domain | Tanggung Jawab |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend SSR** | Astro v5 + Node.js Adapter | `frontend/` | `4321` (`queryindo.com`) | Server-Side Rendering untuk SEO maksimal, tata letak artikel semantik, OpenGraph, JSON-LD Schema. |
| **Client Interactivity** | React 19 Islands | `frontend/src/components/islands/` | Client-side hydrate | Modul interaktif khusus: `BookmarksDrawer`, `UserAuthModal`, `ByteShortsReel`, `ShareBar`, `ThemeToggle`. |
| **Backend REST API** | Go 1.23+ Fiber | `backend/` | `8080` (`/api/v1`) | API performa tinggi, auth JWT, rate limiting, komentar, newsletter, proxy gambar anti-SSRF, feed RSS/Sitemap XML. |
| **Studio CMS** | Repositori Terpisah | `QueryIndo-Studio` | `studio.queryindo.com` | Dashboard admin mandiri untuk redaktur dan jurnalis menulis/mengedit berita. |

> [!IMPORTANT]
> **CMS Studio Terisolasi:** Jangan pernah menambahkan antarmuka atau modal CMS admin ke dalam repo `News` ini. Rute `/admin` di repo ini **hanya** melakukan HTTP 301 Redirect ke `https://studio.queryindo.com`.

---

## 🧹 2. Aturan Kebersihan Kode (Anti-Bloat & Zero Dead Code Policy)

1. **Prinsip "Ganti = Hapus yang Lama":**
   - Jika membuat komponen atau alur baru yang menggantikan komponen lama (contoh: rute `/berita/[slug]` menggantikan `ArticleReaderModal`), komponen lama **WAJIB langsung dihapus** beserta import dan event listener-nya.
   - Dilarang meninggalkan file yatim (*orphaned files*), file draft uji coba (`Header.astro`, `Footer.astro`), atau dump HTML mentah (`appHtml.txt`).
2. **Dilarang Menaruh DOM Fallback Mati:**
   - Dilarang menyisipkan elemen overlay mati seperti `<div class="modal-overlay" id="xxx-modal" style="display: none;">` jika fungsinya sudah diambil alih oleh React Island atau halaman rute baru.
3. **Disiplin Bundle Klien (`client-main.ts`):**
   - Setiap kali mengedit `frontend/src/client-main.ts`, pastikan tidak ada impor modul atau kelas yang sudah dihapus.
   - Ukuran bundle klien harus dijaga agar tetap ramping dan tidak bocor memori (*memory leak*).

---

## 🎨 3. Standar Desain Antarmuka (Aesthetics & UX Standards)

1. **Palet Warna & Identitas Visual:**
   - Latar belakang: *Obsidian Dark Theme* (`--bg-primary: #020408`, `--bg-secondary: #0b1120`, `--bg-surface: #0f172a`).
   - Aksen Utama: *Electric Cyan* (`--brand-cyan: #00f2fe`) dengan gradien ke *Royal Cobalt* (`#2563EB`).
   - Aksen Sekunder: *Indonesian Coral Red* (`--accent-red: #FF2E54`).
2. **Tipografi Premium:**
   - Judul & Heading: `Plus Jakarta Sans`, sans-serif (font modern tebal, tracking presisi).
   - Konten Bacaan Artikel: `Newsreader`, Georgia, serif (jarak baris 1.85, ukuran 1.22rem, ramah mata).
   - Angka & Metadata: Monospace / Inter (`var(--font-mono)`).
3. **Standar Responsivitas:**
   - Setiap elemen harus tampil sempurna di layar mobile (360px–430px) hingga monitor ultrawide (4K).
   - Gunakan *touch-friendly sizing* (target klik tombol minimal 44x44px di mobile).

---

## 🛡️ 4. Standar Keamanan & Defensive Coding

1. **Pencegahan Stored XSS:**
   - Seluruh konten HTML berita yang dirender ke DOM wajib disanitasi menggunakan `sanitizeArticleHtml()` dari `frontend/src/utils/helpers.ts`.
   - Dilarang menggunakan `innerHTML` langsung tanpa sanitasi terhadap konten yang berasal dari input pengguna atau server pihak ketiga.
2. **Perlindungan Anti-SSRF pada Image Proxy:**
   - Endpoint `/api/v1/image-proxy` di backend Go harus selalu memvalidasi URL target, melarang IP internal (localhost, 127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, link-local 169.254.0.0/16).
3. **Rate Limiting di Backend Go:**
   - Rute Login (`/auth/login`): Maksimal 5 percobaan per menit per IP (mencegah brute-force).
   - Rute Komentar (`/comments`): Maksimal 5 pengiriman per menit per IP (mencegah spam komentar).
   - Rute AI / Generative (`/ai/*`): Maksimal 15 permintaan per menit per IP.

---

## 🚀 5. Prosedur Uji Mutu Sebelum Push & Deploy

Sebelum melakukan `git push` atau mendeploy ke server produksi, jalankan langkah validasi wajib:

### Langkah 1: Validasi Frontend
```bash
cd frontend
npm run build
```
*(Wajib menghasilkan output `Complete!` dengan 0 error sintaks/TypeScript).*

### Langkah 2: Validasi Backend
```bash
cd backend
go vet ./...
go build -ldflags='-s -w' -o queryindo-backend.exe .
```
*(Wajib lolos tanpa peringatan tipe data atau variabel tak terpakai).*

### Langkah 3: Eksekusi Deploy ke Server VPS Production
```bash
git push origin main
ssh Rijalumami@103.67.78.23 "cd /var/www/queryindo && bash deploy.sh"
```

### Aturan Khusus Server VPS:
- VPS menggunakan **Node.js 22 terisolasi** di `/opt/node22/bin/node` agar tidak mengganggu aplikasi Node 20 lainnya.
- Backend Go dikompilasi langsung di VPS menggunakan `go build -ldflags='-s -w' -o queryindo-backend .`.
- Jangan pernah menjalankan PM2 di bawah akun `root`; seluruh proses web berjalan di bawah user `Rijalumami`.
