# QUERYINDO - Go (Golang) High-Performance Backend API

Panduan arsitektur backend skala nasional untuk **QUERYINDO** menggunakan **Go (Golang)** dan **Fiber Framework** (berbasis Fasthttp) untuk penanganan konkurensi ekstrem, latensi rendah, dan konsumsi memori minimal.

---

## ⚡ Mengapa Go (Golang) + Fiber?

1. **Sub-Millisecond Latency**: Mampu memproses puluhan ribu permintaan (*requests*) per detik per instance node.
2. **Low RAM Footprint**: Memori kerja hanya ~15MB-30MB per instance server, menghemat biaya cloud infrastruktur hingga 80%.
3. **Built-in Concurrency**: Goroutines bawaan Go memudahkan pembuatan pemroses data paralel real-time (live tickers, notifikasi push, analisis tren).

---

## 📐 Arsitektur Endpoint REST API (`/api/v1`)

### 1. Artikel & Berita
- `GET /api/v1/articles` — Mengambil daftar artikel (support query param `category`, `search`, `page`, `limit`).
- `GET /api/v1/articles/:slug` — Mengambil detail artikel tunggal berdasarkan slug/id.
- `GET /api/v1/articles/trending` — Mengambil top 5 artikel paling banyak dibaca.
- `POST /api/v1/articles/:id/like` — Menambahkan jumlah *like* artikel (Redis counter).

### 2. Kategori & Indeks
- `GET /api/v1/categories` — Daftar kategori berita & metadata.
- `GET /api/v1/indexes/ticker` — Indeks tekno & kripto real-time (Cached 60s di Redis).

---

## 🛠️ Cara Menjalankan Server Go (Lokal & Produksi)

```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Unduh modul dependensi Go
go mod tidy

# 3. Jalankan server lokal
go run main.go
```

Server akan berjalan pada `http://localhost:8080`.
