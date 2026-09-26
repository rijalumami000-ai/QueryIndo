---
name: queryindo-coding-standards
description: >-
  Standard operational runbook and engineering discipline for QUERYINDO.
  Use when developing features, refactoring components, cleaning code, or deploying
  updates to ensure zero dead code, strict security, and clean SSR architecture.
---

# QUERYINDO Engineering Skill & Coding Runbook

Keahlian (*skill*) ini memandu agen AI dan pengembang dalam memelihara codebase **QUERYINDO** dengan standar senior engineering.

## 1. Alur Kerja Modifikasi Fitur (Feature Modification Workflow)

Setiap kali Anda diminta menambahkan atau merombak fitur:
1. **Pahami Lokasi Kode:**
   - Halaman Statis / SSR: Gunakan file `.astro` di `frontend/src/pages/`.
   - Interaktivitas Klien Dinamis: Buat komponen React Island di `frontend/src/components/islands/`.
   - Logika Bisnis & Komunikasi API Klien: Simpan di `frontend/src/services/` atau `frontend/src/state/`.
   - REST API & Basis Data: Tambahkan handler di `backend/handlers/` dan daftarkan rute di `backend/main.go`.

2. **Aturan "Zero Orphan" (Anti Kode Yatim):**
   - Jika mengubah komponen lama menjadi komponen baru:
     - Cari seluruh tempat di mana nama komponen lama diimpor menggunakan `grep_search`.
     - Hapus impor dan panggilannya.
     - Hapus file komponen lama secara permanen.
   - Jangan pernah menyisakan file `.ts` atau `.tsx` yang tidak diimpor oleh modul mana pun.

## 2. Aturan Struktur Komponen Frontend

- **Astro Components (`.astro`):**
  - Gunakan untuk layout semantik (`BaseLayout.astro`, `ArticleLayout.astro`), halaman katalog, dan komponen yang hanya perlu di-render di server.
  - Manfaatkan slot dan `<script slot="head">` untuk Schema.org JSON-LD dan OpenGraph meta tags.
- **React Islands (`.tsx`):**
  - Gunakan `client:load` hanya untuk elemen kritis di atas lipatan layar (*above-the-fold*) seperti tombol autentikasi atau drawer navigasi.
  - Gunakan `client:idle` untuk elemen sekunder seperti tombol bookmark, bar share, atau pencarian.

## 3. Aturan Backend Go (Fiber + GORM/PostgreSQL)

- **Database Safety:**
  - Selalu periksa `if database.DB == nil` sebelum menjalankan query untuk menangani mode offline / degraded secara aman.
  - Gunakan parameterized query atau method GORM resmi (`Find(&dest)`, `Where("...", param)`) untuk mencegah SQL Injection.
- **Rate Limiter:**
  - Pasang rate limiter ketat pada rute publik yang sensitif (auth, komentar, AI, CDN purge).

## 4. Runbook Pengujian & Verifikasi (Pre-Deployment Checklist)

Sebelum menyelesaikan giliran atau melakukan deploy, jalankan selalu verifikasi berikut:

```bash
# 1. Cek kompilasi frontend
cd frontend
npm run build

# 2. Cek integritas tipe dan sintaks backend Go
cd ../backend
go vet ./...
```

Jika keduanya menghasilkan kode keluar `0` (*exit code 0*), maka kode siap untuk di-commit dan di-push ke branch `main`.

## 5. Deployment ke VPS Production

Jalankan perintah ini untuk merilis perubahan ke VPS:
```bash
git push origin main
ssh Rijalumami@103.67.78.23 "cd /var/www/queryindo && bash deploy.sh"
```
Setelah deploy selesai, verifikasi respons web:
```bash
curl -sI https://queryindo.com | head -n 5
curl -s https://queryindo.com/health
```
