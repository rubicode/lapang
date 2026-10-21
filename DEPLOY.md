# 🚀 PANDUAN DEPLOYMENT & CI/CD LAPANG.ID (AWS EC2 + DOCKER)

Dokumen ini memuat panduan lengkap langkah demi langkah untuk mengimplementasikan kontainerisasi (Docker), infrastruktur server (AWS EC2), reverse proxy Nginx, serta pipeline otomatisasi CI/CD menggunakan GitHub Actions untuk platform **Lapang.id**.

---

## 📑 Daftar Isi
1. [Arsitektur Deployment Sistem](#1-arsitektur-deployment-sistem)
2. [Spesifikasi & Prasyarat Infrastruktur](#2-spesifikasi--prasyarat-infrastruktur)
3. [Tahap 1: Pengujian di Lingkungan Lokal (Docker Local)](#3-tahap-1-pengujian-di-lingkungan-lokal-docker-local)
4. [Tahap 2: Persiapan & Otomasi Server AWS EC2](#4-tahap-2-persiapan--otomasi-server-aws-ec2)
5. [Tahap 3: Konfigurasi Proyek & File `.env` Production](#5-tahap-3-konfigurasi-proyek--file-env-production)
6. [Tahap 4: Menjalankan Kontainer & Seeding Database di EC2](#6-tahap-4-menjalankan-kontainer--seeding-database-di-ec2)
7. [Tahap 5: Konfigurasi Sertifikat SSL Gratis (HTTPS Certbot)](#7-tahap-5-konfigurasi-sertifikat-ssl-gratis-https-certbot)
8. [Tahap 6: Otomasi Pipeline CI/CD GitHub Actions (SSH Port 22)](#8-tahap-6-otomasi-pipeline-cicd-github-actions-ssh-port-22)
9. [Pemeliharaan, Monitoring, & Troubleshooting](#9-pemeliharaan-monitoring--troubleshooting)

---

## 1. Arsitektur Deployment Sistem

Sistem menggunakan pendekatan **Self-Hosted Containerized Stack** di dalam satu instance **AWS EC2** tanpa memerlukan AWS RDS maupun AWS S3, sehingga memangkas biaya operasional secara signifikan.

```mermaid
graph TD
    User["🌐 Pengguna / Browser (lapang.click / 56.10.84.144)"]
    
    subgraph AWS_EC2["AWS EC2 Instance (Ubuntu 24.04 LTS)"]
        subgraph Networking["Reverse Proxy & Firewall (UFW)"]
            Nginx["Nginx Reverse Proxy (Port 80 / 443)"]
            Certbot["Certbot Container (Auto-renew SSL)"]
        end

        subgraph DockerNet["Private Docker Network (lapang_prod_net)"]
            FE["Frontend Next.js (Port 3000)"]
            BE["Backend Express.js API (Port 5001)"]
            DB[("PostgreSQL 16 + PostGIS")]
            MinIO[("Chainguard MinIO S3 Storage (Port 9000/9001)")]
        end
    end

    User -->|HTTP :80 / HTTPS :443| Nginx
    Nginx -->|Proxy: /| FE
    Nginx -->|Proxy: /api/*| BE
    BE -->|Query Spasial & Transaksi| DB
    BE -->|Upload & Retrieve Gambar| MinIO
    FE -->|Fetch REST API| Nginx
```

### Rincian Image Docker yang Digunakan:
- **Backend:** `node:20-bookworm-slim` (Multi-stage build, non-root user `nodejs`, auto-wait PostgreSQL & auto-run Sequelize migrations).
- **Frontend:** `node:20-bookworm-slim` (Next.js 16 App Router dengan mode `output: 'standalone'`).
- **Database:** `postgis/postgis:16-3.4-alpine` (PostgreSQL 16 dengan ekstensi PostGIS geospasial).
- **Object Storage:** `cgr.dev/chainguard/minio:latest` (Distribusi Chainguard MinIO resmi, open-source, bebas pembatasan Docker Hub, 100% kompatibel S3 API).
- **Web Server:** `nginx:1.25-alpine` + `certbot/certbot:latest`.

---

## 2. Spesifikasi & Prasyarat Infrastruktur

### A. Rekomendasi Spesifikasi AWS EC2
| Parameter | Nilai Rekomendasi | Catatan |
| :--- | :--- | :--- |
| **Sistem Operasi** | Ubuntu Server 24.04 LTS (64-bit x86) | Kompatibel penuh dengan skrip otomasi `setup-ec2.sh`. |
| **Tipe Instance** | **`t3.small`** (2 vCPU, 2 GB RAM) atau **`t3.medium`** (2 vCPU, 4 GB RAM) | Diperlukan RAM cukup untuk kompilasi Next.js & PostgreSQL. |
| **Storage (EBS)** | 30 GB gp3 SSD | Cukup untuk image Docker, volume database, dan media upload. |
| **Elastic IP** | Disarankan dipasang | Agar IP server tidak berubah saat instance di-stop/start. |

### B. Konfigurasi Firewall AWS Security Group
Pastikan **Inbound Rules** pada Security Group EC2 Anda diatur sebagai berikut:
- **SSH (Port 22):** Source `0.0.0.0/0` (atau IP pribadi Anda).
- **HTTP (Port 80):** Source `0.0.0.0/0`.
- **HTTPS (Port 443):** Source `0.0.0.0/0`.
> ⚠️ **PENTING:** Port `5432` (Database), `9000/9001` (MinIO), `5001` (Backend), dan `3000` (Frontend) **TIDAK BOLEH** dibuka ke publik pada Security Group AWS. Komunikasi antar-layanan berjalan aman di dalam private Docker network.

### C. Pengaturan DNS Domain (Opsional tapi Direkomendasikan)
Jika Anda memiliki domain (contoh: `lapang.click`):
- Buat **A Record**: `lapang.click` ➔ `56.10.84.144` (IP Publik EC2).
- Buat **A Record**: `www.lapang.click` ➔ `56.10.84.144`.

---

## 3. Tahap 1: Pengujian di Lingkungan Lokal (Docker Local)

Sebelum melakukan deployment ke server cloud, stack aplikasi ini dapat dijalankan dan diuji 100% di komputer lokal menggunakan file `docker-compose.yml`.

### 1. Jalankan Stack Docker Lokal:
```bash
docker compose up -d
```
*(Catatan: Port database di lokal dipetakan ke port `5433:5432` agar tidak bentrok jika komputer lokal Anda sudah memiliki service PostgreSQL yang sedang aktif).*

### 2. Periksa Status Kontainer:
```bash
docker compose ps
```
Pastikan `lapang_backend`, `lapang_frontend`, dan `lapang_postgres` berstatus `Up (healthy)`.

### 3. Eksekusi Seeder Data Master di Lokal:
```bash
docker compose exec backend node seeders/seed.js
```

### 4. Verifikasi di Browser Lokal:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend Health Check: [http://localhost:5001/api/v1/health](http://localhost:5001/api/v1/health)
- MinIO Web Console: [http://localhost:9001](http://localhost:9001) (User: `minioadmin`, Pass: `minioadmin`)

---

## 4. Tahap 2: Persiapan & Otomasi Server AWS EC2

### 1. Masuk ke Server EC2 via SSH:
Gunakan file key pair `.pem` yang telah diunduh dari AWS:
```bash
chmod 400 /path/ke/lapang-key.pem
ssh -i /path/ke/lapang-key.pem ubuntu@56.10.84.144
```

### 2. Jalankan Skrip Otomasi Persiapan Server:
Eksekusi skrip otomasi yang telah disediakan di repositori:
```bash
curl -fsSL https://raw.githubusercontent.com/rubicode/lapang/main/deploy/setup-ec2.sh | bash
```
> **Apa saja yang dilakukan skrip ini secara otomatis?**
> 1. Memperbarui indeks paket Ubuntu secara non-interaktif tanpa bentrok mirror 404.
> 2. Memasang Docker Engine resmi dan Docker Compose plugin terbaru.
> 3. Memasukkan user `ubuntu` ke grup `docker` (tanpa perlu mengetik `sudo docker`).
> 4. Mengaktifkan firewall `ufw` dengan aturan ketat: hanya mengizinkan port `22`, `80`, dan `443`.
> 5. Membuat direktori `/home/ubuntu/lapang`.

### 3. Aktifkan Grup Docker (Tanpa Perlu Logout):
```bash
newgrp docker
docker --version && docker compose version
```

---

## 5. Tahap 3: Konfigurasi Proyek & File `.env` Production

### 1. Clone Repositori ke Direktori Home:
```bash
cd ~
rm -rf ~/lapang
git clone https://github.com/rubicode/lapang.git ~/lapang
cd ~/lapang
```

### 2. Buat File Konfigurasi `.env`:
Salin template konfigurasi produksi:
```bash
cp env.production.example .env
nano .env
```

### 3. Isi Nilai Konfigurasi Produksi:
Sesuaikan nilainya seperti contoh berikut:
```ini
# ==============================================================================
# Lapang.id - Environment Konfigurasi Server Produksi (AWS EC2)
# ==============================================================================

NODE_ENV=production

# --- PostgreSQL + PostGIS Container ---
DB_NAME=lapang_db
DB_USER=postgres
DB_PASS=Rubicamp_2026_SecurePass

# --- MinIO S3 Object Storage Container ---
MINIO_ACCESS_KEY=minio_lapang_admin
MINIO_SECRET_KEY=Rubicamp_2026_SecureMinio

# --- Midtrans Payment Gateway ---
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
MIDTRANS_IS_PRODUCTION=false

# --- Authentication & CORS ---
ALLOWED_ORIGINS=https://lapang.click,http://lapang.click,http://56.10.84.144
JWT_SECRET=lapang_jwt_super_secret_key_minimum_32_characters_2026

# --- Frontend Next.js Public Endpoint ---
NEXT_PUBLIC_API_URL=/api/v1
```
> Simpan file di editor nano: Tekan `Ctrl + O` ➔ `Enter`, lalu keluar dengan `Ctrl + X`.

---

## 6. Tahap 4: Menjalankan Kontainer & Seeding Database di EC2

### 1. Build dan Nyalakan Seluruh Layanan:
Di direktori `~/lapang`, jalankan:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Proses ini akan mengunduh base image resmi, mengompilasi frontend Next.js standalone, menyiapkan backend Express, dan menyalakan reverse proxy Nginx.

### 2. Periksa Status Seluruh Kontainer:
```bash
docker compose -f docker-compose.prod.yml ps
```
Pastikan seluruh 5 kontainer berstatus `Up` / `healthy`:
- `lapang_postgres_prod`
- `lapang_minio_prod`
- `lapang_backend_prod`
- `lapang_frontend_prod`
- `lapang_nginx_prod`

### 3. Isi Data Awal Database (Cukup Dijalankan 1x):
Saat backend pertama kali dinyalakan, berkas migrasi tabel Sequelize sudah otomatis dieksekusi oleh `docker-entrypoint.sh`. Sekarang cukup jalankan seeder untuk mengisi data master 38 provinsi, kategori olahraga, dan venue:
```bash
docker compose -f docker-compose.prod.yml exec backend node seeders/seed.js
```

### 4. Uji Coba di Browser:
Buka alamat IP publik atau domain server Anda:
- `http://56.10.84.144/`
- `http://lapang.click/`

Aplikasi web Lapang.id beserta peta interaktif Leaflet, katalog lapangan, dan sistem ulasan kini sudah aktif di cloud!

---

## 7. Tahap 5: Konfigurasi Sertifikat SSL Gratis (HTTPS Certbot)

Setelah DNS domain `lapang.click` berhasil mengarah ke IP `56.10.84.144`:

### 1. Terbitkan Sertifikat SSL Let's Encrypt:
Jalankan perintah certbot melalui kontainer:
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

### 2. Aktifkan Blok HTTPS di Nginx:
Buka berkas konfigurasi Nginx:
```bash
nano nginx/conf.d/lapang.conf
```

Tambahkan blok server SSL port 443 di bagian bawah berkas:
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

# Redirect seluruh traffic HTTP ke HTTPS
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

### 3. Reload Konfigurasi Nginx:
```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```
*Sertifikat SSL akan diperbarui secara otomatis oleh kontainer `lapang_certbot_prod` setiap 12 jam.*

---

## 8. Tahap 6: Otomasi Pipeline CI/CD GitHub Actions (SSH Port 22)

Repositori ini telah dilengkapi dengan 2 alur kerja (workflow) GitHub Actions:
- **CI (`.github/workflows/ci.yml`):** Menjalankan pengujian linting, unit test backend (`node --test`), dan build Next.js pada setiap Pull Request dan Push ke branch `main`.
- **CD (`.github/workflows/cd.yml`):** Mem-build image container, mem-push ke **GitHub Container Registry (`ghcr.io`)**, dan melakukan remote deployment ke server EC2 via SSH port 22 secara otomatis saat branch `main` di-update.

### 1. Daftarkan GitHub Secrets:
Buka repositori di browser ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **New repository secret**:

| Secret Name | Value | Contoh |
| :--- | :--- | :--- |
| `EC2_HOST` | Alamat IP Publik instance EC2 Anda | `56.10.84.144` |
| `EC2_USER` | Username login SSH instance EC2 | `ubuntu` |
| `EC2_SSH_KEY` | Seluruh isi teks berkas `.pem` privat key Anda | Salin dari `-----BEGIN RSA PRIVATE KEY-----` sampai `-----END RSA PRIVATE KEY-----` |

### 2. Alur Eksekusi Deployment Otomatis:
Setiap kali pengembang melakukan perubahan kode di komputer lokal dan melakukan push:
```bash
git add .
git commit -m "feat: perbaikan fitur baru"
git push origin main
```
GitHub Actions akan secara otomatis:
1. Memvalidasi seluruh unit test & build.
2. Mem-build image Docker backend dan frontend terbaru.
3. Login ke server EC2 melalui koneksi aman SSH Port 22.
4. Menjalankan `docker compose pull` dan me-restart kontainer tanpa downtime (`zero-downtime rolling update`).
5. Menghapus image usang secara otomatis via `docker image prune` agar disk EC2 tetap lega.

---

## 9. Pemeliharaan, Monitoring, & Troubleshooting

### A. Melihat Log Kontainer Real-Time
- **Log Backend API:**
  ```bash
  docker compose -f docker-compose.prod.yml logs -f backend
  ```
- **Log Frontend Next.js:**
  ```bash
  docker compose -f docker-compose.prod.yml logs -f frontend
  ```
- **Log Nginx Web Server:**
  ```bash
  docker compose -f docker-compose.prod.yml logs -f nginx
  ```

### B. Backup Database PostgreSQL Mandiri
Lakukan dump database ke file SQL secara berkala:
```bash
docker exec -t lapang_postgres_prod pg_dump -U postgres lapang_db > backup_lapang_$(date +%F).sql
```

Untuk me-restore backup:
```bash
cat backup_lapang_YYYY-MM-DD.sql | docker exec -i lapang_postgres_prod psql -U postgres -d lapang_db
```

### C. Pembersihan Disk Server (Maintenance)
Jika disk server mulai penuh oleh cache Docker:
```bash
docker system prune -af --volumes=false
```
*(Perintah ini aman dan tidak akan menghapus data PostgreSQL atau data MinIO karena volume database bersifat persistent).*
