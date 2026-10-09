# 🏟️ Lapang.id — Platform Manajemen & Reservasi Lapangan Olahraga Seluruh Indonesia

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org/)
[![MinIO](https://img.shields.io/badge/MinIO-S3%20Storage-C72C48?logo=minio&logoColor=white)](https://min.io/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Tested-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

> **Lapang.id** adalah platform modern berbasis web untuk eksplorasi, penemuan, dan reservasi lapangan olahraga di seluruh Indonesia. Dilengkapi peta interaktif geospasial, ulasan mendalam multi-kriteria, galeri foto penyimpanan awan mandiri (MinIO S3), dan sistem reservasi real-time anti-*double-booking*.

---

## 📑 Daftar Isi
1. [Fitur Unggulan](#-fitur-unggulan)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
4. [Prasyarat Sistem](#-prasyarat-sistem)
5. [Panduan Memulai Langkah demi Langkah (Pemula)](#-panduan-memulai-langkah-demi-langkah-pemula)
   - [Langkah 1: Clone Repositori](#langkah-1-clone-repositori)
   - [Langkah 2: Konfigurasi Database & MinIO](#langkah-2-konfigurasi-database--minio)
   - [Langkah 3: Menjalankan Backend API](#langkah-3-menjalankan-backend-api)
   - [Langkah 4: Menjalankan Frontend Next.js](#langkah-4-menjalankan-frontend-nextjs)
   - [Langkah 5: Buka Aplikasi](#langkah-5-buka-aplikasi)
6. [Panduan Menjalankan Pengujian (Testing)](#-panduan-menjalankan-pengujian-testing)
   - [Unit Testing (Backend)](#1-unit-testing-backend)
   - [End-to-End Testing (Frontend Playwright)](#2-end-to-end-testing-frontend-playwright)
7. [Dokumentasi Tambahan](#-dokumentasi-tambahan)

---

## ✨ Fitur Unggulan

- 🗺️ **Peta Geospasial Interaktif (Leaflet)**: Peta seluruh Indonesia dengan pin dinamis per cabang olahraga dan deteksi GPS pengguna untuk mencari lapangan terdekat menggunakan kalkulasi jarak Haversine.
- ⚽ **Katalog Multi-Cabang Olahraga**: Futsal & Mini Soccer, Badminton, Basket, Padel Tennis, Tenis Lapangan, dan Voli.
- 🏙️ **Cakupan Wilayah Lengkap**: Filter berbasis 38 Provinsi dan Kota/Kabupaten di Indonesia.
- 🖼️ **Penyimpanan Gambar Aman (MinIO S3)**: Validasi Magic Byte MIME tipe file asli dan konversi WebP otomatis.
- 📊 **Sistem Ulasan Multi-Aspek**: Penilaian terperinci (kualitas lantai, pencahayaan, kebersihan toilet, keramahan staf) serta balasan resmi dari pemilik lapangan (*owner reply*).
- 🔒 **Reservasi ACID & Transaksi Aman**: Pencegahan *race condition* dan *double booking* menggunakan mekanisme database row-level locking (`FOR UPDATE`).
- 💳 **Simulasi Pembayaran Midtrans**: Checkout otomatis dengan barcode QRIS dan pembuatan kode e-tiket unik.

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS 4
- **Peta**: Leaflet.js & React-Leaflet
- **Ikon**: Lucide React
- **Testing**: Playwright (Headless & Headed Slow Motion)

### Backend
- **Framework**: Express.js (JavaScript murni ES Modules)
- **ORM**: Sequelize ORM v6
- **Database**: PostgreSQL (dengan dukungan PostGIS)
- **Object Storage**: MinIO Client SDK (S3 compatible)
- **Keamanan**: Helmet, Rate Limiter, Parameterized Queries (Standar Pentest OWASP)
- **Testing**: Node.js Built-in Test Runner (`node --test`)

---

## 📁 Arsitektur & Struktur Folder

```text
lapang/
├── backend/                  # Server API Express.js
│   ├── config/              # Konfigurasi Database & Environment
│   ├── controllers/         # Handler HTTP Request/Response
│   ├── migrations/          # 9 Berkas Migrasi Resmi Sequelize
│   ├── models/              # Model Definisi Entitas Database
│   ├── routes/              # Rute Endpoint API v1
│   ├── seeders/             # Data Awal Master & Lapangan Sampel
│   ├── services/            # Logika Bisnis (Haversine, Booking ACID, MinIO)
│   ├── tests/               # 21 Skenario Unit Test (Sukses & Gagal)
│   └── server.js            # Entry Point Server API
│
├── frontend/                 # Web Application Next.js (App Router)
│   ├── e2e/                 # Skenario Pengujian Playwright E2E
│   ├── src/
│   │   ├── app/             # Layout & Halaman Utama
│   │   ├── components/      # UI: Map, Drawer, FilterBar, Modals, dll.
│   │   ├── services/        # Client API Wrapper
│   │   └── types/           # Definisi Tipe Data TypeScript
│   └── playwright.config.ts # Konfigurasi Playwright (slowMo support)
│
├── mockup/                   # Acuan Tampilan Desain (code.html)
├── SPECIFICATION.md          # Spesifikasi Lengkap Sistem
├── STANDARD_CODE.md          # Standar Rekayasa Kode & Keamanan Pentest
└── README.md                 # Panduan ini
```

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat komputer Anda sudah terpasang:
1. **Node.js**: Versi **v20.x** atau **v22.x** ([Download Node.js](https://nodejs.org/))
2. **PostgreSQL**: Versi 14 atau lebih baru ([Download PostgreSQL](https://www.postgresql.org/download/))
3. **MinIO**: Object Storage Server lokal ([Download MinIO](https://min.io/download))
4. **Git**: Version Control System

---

## 🚀 Panduan Memulai Langkah demi Langkah (Pemula)

### Langkah 1: Clone Repositori
Buka terminal dan unduh proyek ini:
```bash
git clone git@github.com:rubicode/lapang.git
cd lapang
```

---

### Langkah 2: Konfigurasi Database & MinIO

#### 1. Buat Database PostgreSQL
Masuk ke terminal PostgreSQL (psql) atau aplikasi GUI seperti DBeaver/pgAdmin, lalu buat database:
```sql
CREATE DATABASE lapang_db;
```

#### 2. Siapkan MinIO Server
Jalankan MinIO server lokal Anda (default port `9000` dan console `9001`):
```bash
# Contoh menjalankan MinIO di macOS / Linux:
minio server ~/minio-data --console-address ":9001"
```
Buat bucket berikut di MinIO (via MinIO Console di `http://localhost:9001`):
- `lapang-venues`
- `lapang-reviews`
- `lapang-documents`

---

### Langkah 3: Menjalankan Backend API

1. Pindah ke direktori backend dan instal dependensi:
   ```bash
   cd backend
   npm install
   ```

2. Buat file `.env` dari template:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan `DB_USER` dan `DB_PASS` di file `.env` jika kredensial PostgreSQL Anda berbeda.*

3. Jalankan **Migrasi Database** (membuat tabel-tabel):
   ```bash
   npm run db:migrate
   ```

4. Jalankan **Seeding Data** (mengisi data master provinsi, kategori olahraga, dan sampel lapangan):
   ```bash
   npm run db:seed
   ```

5. Jalankan server Backend:
   ```bash
   npm run dev
   ```
   Backend sekarang aktif di: **`http://localhost:5001`**  
   Cek status kesehatan API di: `http://localhost:5001/api/v1/health`

---

### Langkah 4: Menjalankan Frontend Next.js

1. Buka jendela terminal baru, masuk ke direktori frontend, lalu instal dependensi:
   ```bash
   cd frontend
   npm install
   ```

2. Buat file `.env.local` dari template:
   ```bash
   cp .env.example .env.local
   ```

3. Jalankan server Frontend Next.js:
   ```bash
   npm run dev
   ```
   Frontend sekarang aktif di: **`http://localhost:3000`**

---

### Langkah 5: Buka Aplikasi
Buka peramban (browser) Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)**

Sekarang Anda sudah dapat menjelajahi peta lapangan, menyaring berdasarkan kota atau cabang olahraga, melihat ulasan dan fasilitas, serta mencoba alur reservasi lapangan!

---

## 🧪 Panduan Menjalankan Pengujian (Testing)

Proyek ini telah dilengkapi rangkaian pengujian otomatis lengkap sesuai standar industri.

### 1. Unit Testing (Backend)
Menguji logika bisnis (*Business Logic*), formula Haversine, pencegahan *race-condition* booking, serta validasi berkas upload.

Jalankan dari direktori `backend/`:
```bash
cd backend
npm test
```
*Hasil: 21 skenario unit test (skenario berhasil dan skenario gagal) akan dieksekusi secara otomatis.*

---

### 2. End-to-End Testing (Frontend Playwright)
Menguji alur interaksi pengguna secara nyata mulai dari pencarian, filter, pembukaan drawer detail, hingga modal pembayaran QRIS.

Jalankan dari direktori `frontend/`:

| Kebutuhan | Perintah | Keterangan |
| :--- | :--- | :--- |
| **Headed (Direkomendasikan untuk Presentasi/Demo)** | `npm run test:e2e:headed` | Membuka jendela browser Chrome otomatis dengan fitur **Slow Motion (1000ms)** agar setiap klik dan animasi terlihat jelas. |
| **Headed Ekstra Santai** | `npm run test:e2e:slow` | Jeda interaksi lebih santai (1500ms per aksi). |
| **Interactive UI Runner** | `npm run test:e2e:ui` | Membuka Playwright GUI dengan *time-travel debugger* visual. |
| **Headless Cepat (CI/CD)** | `npm run test:e2e` | Berjalan cepat di latar belakang tanpa memunculkan jendela browser. |

> 💡 **Tip:** Anda juga dapat menjalankan pengujian langsung dari folder root (`lapang/`):
> ```bash
> # Menjalankan seluruh test (Unit + E2E):
> npm test
> 
> # Menjalankan E2E mode browser santai:
> npm run test:e2e:headed
> ```

---

## 📖 Dokumentasi Tambahan

Untuk panduan arsitektur yang lebih mendalam, silakan baca dokumen berikut:
- 📄 [**SPECIFICATION.md**](file:///Users/rubihenjaya/Desktop/lapang/SPECIFICATION.md): Spesifikasi fungsional, relasi entitas basis data, serta seluruh rancangan endpoint REST API.
- 🛡️ [**STANDARD_CODE.md**](file:///Users/rubihenjaya/Desktop/lapang/STANDARD_CODE.md): Standar arsitektur 4-lapisan, keamanan pencegahan celah OWASP Top 10, dan checklist kelulusan penetration testing.

---

## 👨‍💻 Kontribusi & Lisensi

Dibuat dengan dedikasi untuk memajukan ekosistem olahraga digital di Indonesia.  
Lisensi: **ISC License**
