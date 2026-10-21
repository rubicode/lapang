# 🚀 PANDUAN LENGKAP PENGEMBANGAN & DEPLOYMENT LAPANG.ID
### (Localhost ➔ Local Docker ➔ AWS EC2 via CI/CD GitHub Actions)

Dokumen ini merupakan panduan teknis resmi langkah demi langkah untuk menjalankan platform **Lapang.id** di semua tahapan:
1. **Localhost (Native Node.js)** untuk pengembangan sehari-hari yang cepat.
2. **Local Docker (`docker-compose.yml`)** untuk simulasi multi-kontainer yang identik dengan server produksi.
3. **AWS EC2 Production via CI/CD (`.github/workflows/`)** untuk otomatisasi pengujian, build, dan *zero-downtime deployment* setiap kali kode di-push ke GitHub.

---

## 📑 Daftar Isi
1. [Arsitektur Sistem & Stack Komponen](#1-arsitektur-sistem--stack-komponen)
2. [Prasyarat Sistem](#2-prasyarat-sistem)
3. [Tahap 1: Menjalankan di Localhost (Native Development)](#3-tahap-1-menjalankan-di-localhost-native-development)
4. [Tahap 2: Menjalankan di Local Docker (Multi-Container)](#4-tahap-2-menjalankan-di-local-docker-multi-container)
5. [Tahap 3: Persiapan Awal Server AWS EC2 (First-Time Setup)](#5-tahap-3-persiapan-awal-server-aws-ec2-first-time-setup)
6. [Tahap 4: Otomasi Pipeline CI/CD GitHub Actions](#6-tahap-4-otomasi-pipeline-cicd-github-actions)
7. [Tahap 5: Konfigurasi Domain & Sertifikat SSL Gratis (HTTPS Certbot)](#7-tahap-5-konfigurasi-domain--sertifikat-ssl-gratis-https-certbot)
8. [Tahap 6: Pemeliharaan, Monitoring, & Troubleshooting](#8-tahap-6-pemeliharaan-monitoring--troubleshooting)

---

## 1. Arsitektur Sistem & Stack Komponen

Lapang.id menggunakan arsitektur **Self-Hosted Containerized Stack** mandiri di dalam satu instance **AWS EC2** tanpa memerlukan layanan berbayar tambahan seperti AWS RDS (Database) maupun AWS S3 (Storage). Seluruh layanan berjalan di jaringan internal Docker yang aman:

```mermaid
graph TD
    User["🌐 Pengguna / Browser (lapang.click / 13.251.214.94)"]
    
    subgraph AWS_EC2["AWS EC2 Instance (Ubuntu 24.04 LTS)"]
        subgraph Networking["Reverse Proxy & Firewall (UFW)"]
            Nginx["Nginx Reverse Proxy (Port 80 / 443)"]
            Certbot["Certbot Container (Auto-renew SSL)"]
        end

        subgraph DockerNet["Private Docker Network (lapang_prod_net)"]
            FE["Frontend Next.js 16 (Port 3000)"]
            BE["Backend Express.js API (Port 5001)"]
            DB[("PostgreSQL 16 + PostGIS")]
            MinIO[("Chainguard MinIO S3 Storage (Port 9000/9001)")]
        end
    end

    User -->|HTTP :80 / HTTPS :443| Nginx
    Nginx -->|Proxy: /| FE
    Nginx -->|Proxy: /api/*| BE
    BE -->|Query Spasial PostGIS & Relasi Data| DB
    BE -->|Upload & Retrieve Gambar Lapangan| MinIO
    FE -->|Fetch REST API| Nginx
```

### Spesifikasi Image & Teknologi:
| Komponen | Teknologi | Base Image / Runtime | Keterangan |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 16 (Turbopack, App Router, Tailwind CSS, Leaflet) | `node:20-bookworm-slim` | Mode standalone output, dioptimasi untuk kecepatan & SEO |
| **Backend** | Express.js, Sequelize ORM, Sharp, Multer | `node:20-bookworm-slim` | Multi-stage build, non-root user `nodejs`, auto-migration |
| **Database** | PostgreSQL 16 + PostGIS Extension | `postgis/postgis:16-3.4-alpine` | Mendukung query spasial geospasial (`ST_DistanceSphere`, `uuid-ossp`) |
| **Storage S3** | MinIO Object Storage | `cgr.dev/chainguard/minio:latest` | S3-compatible storage resmi, aman dari limit Docker Hub |
| **Web Server** | Nginx Reverse Proxy | `nginx:1.25-alpine` | SSL termination, caching aset statis, routing API |

---

## 2. Prasyarat Sistem

Sebelum memulai, pastikan perangkat komputer lokal Anda telah terpasang:
- **Git** (versi 2.30+)
- **Node.js** (versi 20 LTS disarankan) & **npm** (versi 10+)
- **Docker Desktop** (versi terbaru untuk macOS/Windows/Linux)
- Terminal / Shell (Zsh, Bash, atau PowerShell)

---

## 3. Tahap 1: Menjalankan di Localhost (Native Development)

Mode ini ideal untuk proses *coding* sehari-hari karena mendukung *hot-reloading* instan baik di sisi frontend (Turbopack) maupun backend (`node --watch`).

### A. Persiapan Database & Storage Lokal
Pastikan database PostgreSQL lokal aktif di port `5432` dengan database `lapang_db`:
```bash
# Buat database jika belum ada
createdb -U postgres lapang_db
```
*(Atau Anda bisa menyalakan database & MinIO saja dari Docker dengan perintah: `docker compose up -d postgres minio`)*.

---

### B. Menjalankan Backend API

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Buat file `.env` lokal:
   ```bash
   cp .env.example .env
   ```
   *Pastikan nilai `DB_HOST=localhost`, `DB_PORT=5432`, `DB_NAME=lapang_db`, `DB_USER=postgres`, dan `DB_PASS=postgres` sesuai dengan PostgreSQL lokal Anda.*

3. Pasang dependensi:
   ```bash
   npm install
   ```

4. Jalankan migrasi tabel database:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. Isi database dengan data master (38 Provinsi, Kota, Venue, Lapangan, dan Jadwal):
   ```bash
   node seeders/seed.js
   ```

6. Jalankan Unit Tests untuk memastikan semua fungsi normal (161 skenario):
   ```bash
   npm test
   ```

7. Jalankan server backend development:
   ```bash
   npm run dev
   ```
   Backend aktif di: **[http://localhost:5001](http://localhost:5001)**  
   Health check: **[http://localhost:5001/api/v1/health](http://localhost:5001/api/v1/health)**

---

### C. Menjalankan Frontend Next.js

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Buat file environment lokal:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1" > .env.local
   ```

3. Pasang dependensi:
   ```bash
   npm install
   ```

4. Periksa audit linting:
   ```bash
   npm run lint
   ```

5. Uji proses kompilasi Next.js:
   ```bash
   npm run build
   ```

6. Jalankan frontend development server:
   ```bash
   npm run dev
   ```
   Frontend aktif di: **[http://localhost:3000](http://localhost:3000)**

---

## 4. Tahap 2: Menjalankan di Local Docker (Multi-Container)

Mode ini menjalankan seluruh ekosistem (PostgreSQL PostGIS, Chainguard MinIO, Backend, dan Frontend) di dalam kontainer yang saling terisolasi persis seperti di server produksi.

### 1. Build dan Nyalakan Kontainer:
Di direktori utama proyek (`lapang/`):
```bash
docker compose up -d --build
```
> **Catatan Port:** Port PostgreSQL di lokal dipetakan ke `5433:5432` agar tidak bentrok jika port `5432` laptop Anda sudah digunakan oleh PostgreSQL lokal.

### 2. Periksa Status Kesehatan Kontainer:
```bash
docker compose ps
```
Pastikan seluruh 4 kontainer berstatus `Up` dan `(healthy)`:
- `lapang_postgres` ➔ Port `5433:5432`
- `lapang_minio` ➔ Port `9000:9000` (API) & `9001:9001` (Web Console)
- `lapang_backend` ➔ Port `5001:5001`
- `lapang_frontend` ➔ Port `3000:3000`

### 3. Eksekusi Seeding Database di Dalam Kontainer:
Migrasi tabel dijalankan secara otomatis saat kontainer backend start. Untuk mengisi data master, jalankan:
```bash
docker compose exec backend node seeders/seed.js
```

### 4. Eksekusi Unit Tests di Dalam Kontainer:
```bash
docker compose exec backend npm test
```

### 5. Akses Layanan Melalui Browser:
| Layanan | URL Akses | Kredensial Default |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3000](http://localhost:3000) | - |
| **Backend API Health** | [http://localhost:5001/api/v1/health](http://localhost:5001/api/v1/health) | - |
| **Backend Venues API** | [http://localhost:5001/api/v1/venues](http://localhost:5001/api/v1/venues) | - |
| **MinIO Web Console** | [http://localhost:9001](http://localhost:9001) | User: `minioadmin` / Pass: `minioadmin` |

### 6. Perintah Manajemen Docker:
- **Melihat log real-time backend:**
  ```bash
  docker compose logs -f backend
  ```
- **Melihat log real-time frontend:**
  ```bash
  docker compose logs -f frontend
  ```
- **Menghentikan seluruh layanan:**
  ```bash
  docker compose down
  ```
- **Menghentikan dan menghapus seluruh data volume lokal:**
  ```bash
  docker compose down -v
  ```

---

## 5. Tahap 3: Persiapan Awal Server AWS EC2 (First-Time Setup)

Tahap ini hanya dilakukan **satu kali saja** saat pertama kali menyiapkan server cloud EC2 baru.

### 1. Spesifikasi Instance & Firewall (AWS Console)
- **Tipe Instance:** `t3.small` (2 vCPU, 2 GB RAM) atau `t3.medium`.
- **Sistem Operasi:** Ubuntu Server 24.04 LTS (64-bit x86).
- **Storage:** 30 GB gp3 SSD.
- **Inbound Rules Security Group:**
  - `SSH` (Port 22) ➔ Source: `0.0.0.0/0` (atau IP Anda)
  - `HTTP` (Port 80) ➔ Source: `0.0.0.0/0`
  - `HTTPS` (Port 443) ➔ Source: `0.0.0.0/0`

### 2. Masuk ke Server EC2 via SSH:
```bash
chmod 400 /path/ke/lapang-key.pem
ssh -i /path/ke/lapang-key.pem ubuntu@13.251.214.94
```
*(Ganti `13.251.214.94` dengan IP publik EC2 Anda).*

### 3. Jalankan Skrip Otomasi Persiapan Server:
Di dalam terminal EC2, jalankan perintah satu baris berikut:
```bash
curl -fsSL https://raw.githubusercontent.com/rubicode/lapang/main/deploy/setup-ec2.sh | bash
```
> **Fungsi skrip ini:**
> - Mengupdate sistem operasi Ubuntu secara non-interaktif tanpa error 404.
> - Memasang Docker Engine resmi dan Docker Compose plugin.
> - Menambahkan user `ubuntu` ke grup `docker`.
> - Mengonfigurasi firewall `ufw` mengunci port selain 22, 80, dan 443.
> - Membuat direktori kerja `/home/ubuntu/lapang`.

Setelah selesai, aktifkan grup docker tanpa logout:
```bash
newgrp docker
docker --version && docker compose version
```

### 4. Clone Repositori & Konfigurasi File `.env` Produksi:
```bash
cd ~
git clone https://github.com/rubicode/lapang.git ~/lapang
cd ~/lapang
cp env.production.example .env
nano .env
```

Sesuaikan isi `.env` di server:
```ini
NODE_ENV=production

# --- PostgreSQL + PostGIS Container ---
DB_NAME=lapang_db
DB_USER=postgres
DB_PASS=Rubicamp_2026_SecurePassword

# --- MinIO S3 Object Storage Container ---
MINIO_ACCESS_KEY=minio_lapang_admin
MINIO_SECRET_KEY=Rubicamp_2026_SecurePassword

# --- Midtrans Payment Gateway ---
MIDTRANS_SERVER_KEY=Mid-server-your-key-here
MIDTRANS_CLIENT_KEY=Mid-client-your-key-here
MIDTRANS_IS_PRODUCTION=false

# --- Authentication & CORS ---
ALLOWED_ORIGINS=https://lapang.click,http://lapang.click,http://13.251.214.94
JWT_SECRET=super_secret_jwt_key_lapang_production_minimum_32_chars

# --- Frontend Next.js Public Endpoint ---
NEXT_PUBLIC_API_URL=/api/v1
```
*(Simpan di nano: `Ctrl + O` ➔ `Enter`, lalu `Ctrl + X`).*

### 5. Build Pertama Kali & Seeding Database di EC2:
```bash
# Nyalakan seluruh container produksi
docker compose -f docker-compose.prod.yml up -d --build

# Periksa status
docker compose -f docker-compose.prod.yml ps

# Eksekusi seeder data master
docker compose -f docker-compose.prod.yml exec backend node seeders/seed.js
```
Akses `http://13.251.214.94/` di browser. Aplikasi web Lapang.id sudah aktif!

---

## 6. Tahap 4: Otomasi Pipeline CI/CD GitHub Actions

Mulai tahap ini dan seterusnya, Anda **tidak perlu lagi login SSH manual ke server untuk mendeploy pembaruan kode**. Semua ditangani otomatis oleh GitHub Actions.

### A. Memahami 2 Workflow GitHub Actions
Di folder `.github/workflows/`, terdapat dua file workflow:

1. **Continuous Integration (`.github/workflows/ci.yml`):**
   - Berjalan pada setiap Pull Request dan Push ke branch `main`, `master`, dan `develop`.
   - **Tugas:**
     - Menjalankan container service PostgreSQL PostGIS di GitHub Runner.
     - Mengeksekusi migrasi & seeding database.
     - Menjalankan 161 Backend Unit Tests (`npm test`).
     - Mengecek aturan linter Next.js (`npm run lint`).
     - Menjalankan kompilasi produksi Next.js (`npm run build`).
     - Memvalidasi build image Docker backend & frontend (*dry-run*).

2. **Continuous Deployment (`.github/workflows/cd.yml`):**
   - Berjalan otomatis saat ada push ke branch `main`.
   - **Tugas:**
     - Mem-build image container dan menyimpannya ke GitHub Container Registry (`ghcr.io`).
     - Melakukan koneksi aman via SSH Port 22 ke instance EC2.
     - Menjalankan perintah `git pull origin main`.
     - Menjalankan `docker compose -f docker-compose.prod.yml up -d --build --remove-orphans`.
     - Membersihkan image usang via `docker image prune` agar disk EC2 tetap bersih.

---

### B. Konfigurasi GitHub Secrets
Agar CD dapat mengakses server EC2 via SSH:
1. Buka repositori GitHub Anda: **[github.com/rubicode/lapang](https://github.com/rubicode/lapang)**.
2. Masuk ke tab **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Klik tombol **New repository secret** dan daftarkan 3 rahasia berikut:

| Nama Secret | Nilai / Value | Contoh |
| :--- | :--- | :--- |
| `EC2_HOST` | Alamat IP Publik EC2 Anda | `13.251.214.94` |
| `EC2_USER` | Username default EC2 Ubuntu | `ubuntu` |
| `EC2_SSH_KEY` | Seluruh isi file private key `.pem` Anda | `-----BEGIN RSA PRIVATE KEY----- ... -----END RSA PRIVATE KEY-----` |

---

### C. Alur Kerja Harian Pengembang (Daily Workflow):
Setiap kali Anda selesai memodifikasi kode di laptop lokal:

1. Pastikan tes lokal lulus:
   ```bash
   npm test --prefix backend
   npm run lint --prefix frontend
   ```
2. Lakukan commit dan push ke GitHub:
   ```bash
   git add .
   git commit -m "feat: perbarui halaman detail venue"
   git push origin main
   ```
3. GitHub Actions akan otomatis menguji kode (CI) dan mendeploy ke server EC2 (CD).
4. Dalam 1-2 menit, perubahan sudah langsung aktif di server cloud tanpa downtime!

---

### D. Cara Memantau Proses CI/CD di GitHub:
1. Buka menu **Actions** di repositori GitHub Anda:
   👉 **[https://github.com/rubicode/lapang/actions](https://github.com/rubicode/lapang/actions)**
2. Klik judul proses yang sedang berjalan.
3. Anda dapat melihat log eksekusi terminal secara langsung (*real-time*):
   - 🟢 **Centang Hijau (Passed):** Uji coba & deploy sukses.
   - 🔴 **Silang Merah (Failed):** Terdapat error; klik job terkait untuk melihat baris error.

---

### E. Cara Mematikan atau Menonaktifkan CI/CD (Disable Workflows):
Jika Anda ingin mematikan proses CI atau CD sementara waktu atau secara permanen, tersedia 4 metode yang dapat Anda gunakan:

#### 1. Disable Workflow via Web GitHub (Paling Mudah & Tanpa Ubah Kode)
- Masuk ke tab **Actions** di repositori: **[github.com/rubicode/lapang/actions](https://github.com/rubicode/lapang/actions)**.
- Di sidebar sebelah kiri, klik nama workflow yang ingin dimatikan (`Lapang.id Continuous Integration (CI)` atau `Lapang.id Continuous Deployment (CD)`).
- Di sebelah kanan atas (di samping judul workflow), klik tombol **titik tiga (`...`)**.
- Pilih **`Disable workflow`**.
- *Untuk mengaktifkan kembali, cukup buka halaman yang sama lalu klik **`Enable workflow`**.*

#### 2. Matikan Total Seluruh Actions di Repository (Global Disable)
- Buka tab **Settings** di repositori GitHub Anda.
- Di menu samping kiri, klik **Actions** ➔ **General**.
- Pada bagian **Actions permissions**, pilih opsi:
  - 🔘 **Disable actions** *(No actions will run in this repository)*.
- Klik tombol hijau **Save**.

#### 3. Ubah Menjadi Manual Trigger (`workflow_dispatch`)
Jika Anda tidak ingin CI/CD berjalan otomatis saat `git push`, tetapi tetap ingin bisa menjalankannya sesekali secara manual lewat tombol di GitHub:
- Buka berkas `.github/workflows/ci.yml` atau `.github/workflows/cd.yml`.
- Ubah bagian `on:` menjadi:
  ```yaml
  on:
    workflow_dispatch:
  ```
  *(Hapus bagian `push:` dan `pull_request:`)*. Dengan cara ini, workflow hanya akan dieksekusi ketika Anda menekan tombol **"Run workflow"** di tab Actions.

#### 4. Melewati (Skip) CI/CD Hanya untuk Commit Tertentu
Jika Anda hanya ingin melewati eksekusi CI/CD pada commit tertentu (misalnya commit untuk pembaruan dokumentasi teks atau perbaikan typo tanpa perlu deploy ke server):
- Cukup tambahkan tag `[skip ci]` atau `[ci skip]` pada pesan commit Anda:
  ```bash
  git commit -m "docs: perbarui panduan [skip ci]"
  git push origin main
  ```
- GitHub Actions akan secara otomatis mengabaikan workflow untuk commit tersebut.

---

## 7. Tahap 5: Konfigurasi Domain & Sertifikat SSL Gratis (HTTPS Certbot)

Setelah Anda memiliki domain (misalnya `lapang.click`):

### 1. Pengaturan DNS Record di Provider Domain (Cloudflare / Namecheap / Niagahoster):
- **Tipe A Record:** `@` (atau `lapang.click`) ➔ Isi: `13.251.214.94`
- **Tipe A Record:** `www` ➔ Isi: `13.251.214.94`

### 2. Terbitkan Sertifikat SSL Let's Encrypt:
Masuk ke terminal EC2 di folder `~/lapang` dan jalankan:
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d lapang.click \
  -d www.lapang.click \
  --email admin@lapang.click \
  --agree-tos \
  --no-eff-email
```

### 3. Aktifkan Blok SSL di Nginx:
Buka `nginx/conf.d/lapang.conf`:
```bash
nano nginx/conf.d/lapang.conf
```
Tambahkan konfigurasi port 443 di bagian bawah:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name lapang.click www.lapang.click;

    ssl_certificate /etc/letsencrypt/live/lapang.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lapang.click/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 25M;

    location /api/ {
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /_next/static/ {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Redirect HTTP port 80 ke HTTPS port 443
server {
    listen 80;
    listen [::]:80;
    server_name lapang.click www.lapang.click;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 4. Reload Nginx:
```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```
Situs Anda kini dapat diakses dengan gembok hijau aman: **`https://lapang.click`**.  
*Kontainer `lapang_certbot_prod` akan otomatis memperpanjang masa berlaku sertifikat setiap 12 jam.*

---

## 8. Tahap 6: Pemeliharaan, Monitoring, & Troubleshooting

### A. Melihat Log Kontainer Produksi
```bash
# Log Backend API
docker compose -f docker-compose.prod.yml logs -f backend

# Log Frontend Next.js
docker compose -f docker-compose.prod.yml logs -f frontend

# Log Nginx Access & Error
docker compose -f docker-compose.prod.yml logs -f nginx
```

### B. Backup & Restore Database PostgreSQL Mandiri
- **Backup database ke file `.sql`:**
  ```bash
  docker exec -t lapang_postgres_prod pg_dump -U postgres lapang_db > backup_lapang_$(date +%F).sql
  ```
- **Restore database dari file backup:**
  ```bash
  cat backup_lapang_YYYY-MM-DD.sql | docker exec -i lapang_postgres_prod psql -U postgres -d lapang_db
  ```

### C. Pembersihan Disk Server
Untuk membersihkan cache docker dan image usang yang memakan ruang disk:
```bash
docker system prune -af --volumes=false
```
*(Perintah ini aman; data database dan media upload tidak akan terhapus karena disimpan pada volume persistent).*

---

### D. Troubleshooting Masalah Umum

1. **MinIO Terus Menerus *Restarting* / Permission Denied:**
   - **Penyebab:** Image MinIO Chainguard berjalan sebagai user non-root (UID 65532) dan tidak memiliki izin menulis pada volume yang sebelumnya dimiliki oleh root.
   - **Solusi:** Pastikan pada file compose service `minio` memiliki deklarasi:
     ```yaml
     user: "0:0"
     ```

2. **Error `404 Not Found` Saat Menjalankan `apt-get` di EC2:**
   - **Penyebab:** Mirror arsip Ubuntu AWS mengalami perubahan paket bertahap (*phasing*).
   - **Solusi:** Jalankan `sudo apt-get update --fix-missing` sebelum memasang paket. Skrip `deploy/setup-ec2.sh` sudah menangani hal ini secara otomatis.

3. **Backend Gagal Konek Database Saat Pertama Start:**
   - **Solusi:** Skrip [backend/docker-entrypoint.sh](file:///Users/rubihenjaya/Desktop/lapang/backend/docker-entrypoint.sh) sudah diprogram untuk melakukan loop pengecekan koneksi database via `pg_isready` setiap 2 detik hingga PostgreSQL benar-benar siap menerima transaksi sebelum server Express dijalankan.

4. **CI GitHub Actions Gagal Menjalankan Backend Tests:**
   - **Solusi:** Pastikan job `backend-test` di `.github/workflows/ci.yml` mendefinisikan container service `postgis/postgis:16-3.4-alpine` dan mengeksekusi `npx sequelize-cli db:migrate && node seeders/seed.js` sebelum `npm test`.

---

**Lapang.id Engineering Team** — Dokumentasi Deployment Terpadu 2026.
