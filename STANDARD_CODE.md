# STANDAR KODE & PANDUAN KEAMANAN SISTEM (STANDARD_CODE.md)
**Pedoman Rekayasa Perangkat Lunak, Arsitektur Bersih, dan Keamanan Standar Industri (Pentest-Ready)**  
**Proyek: Platform Pengolahan & Reservasi Lapangan Olahraga (LapangID)**

---

## 1. Prinsip Utama & Filosofi Rekayasa
Setiap baris kode dalam proyek ini harus mematuhi 4 pilar utama:
1. **Maintainability & Clean Architecture:** Pemisahan tanggung jawab (*Separation of Concerns*) yang tegas antara rute, logika bisnis, dan akses data.
2. **Readability & Consistency:** Format kode seragam, mudah dibaca pengembang lain, menerapkan penamaan deklaratif.
3. **Robustness & Predictability:** Penanganan error terpusat, validasi input ketat, transaksi atomik (*ACID*) untuk mencegah *race condition*.
4. **Security by Design (Pentest-Ready):** Pertahanan berlapis (*Defense-in-Depth*) mematuhi panduan OWASP Top 10 versi terbaru untuk memastikan sistem lolos uji penetrasi (*penetration testing*).

---

## 2. Struktur Arsitektur Backend (Express.js & JavaScript)

### A. Pola *Layered Architecture* (4-Tier Pattern)
Backend Express.js **wajib** dipisahkan menjadi 4 lapisan terisolasi:

```
[ HTTP Request ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ 1. ROUTE LAYER (routes/)                               │
│    - Menerima request & memetakan path endpoint        │
│    - Menjalankan Middleware (Auth, RBAC, Rate-Limit,   │
│      Upload, Input Validation)                         │
└───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│ 2. CONTROLLER LAYER (controllers/)                     │
│    - Menerima `req` dan mengembalikan `res`            │
│    - Mengambil data dari `req.body`, `req.query`, dll  │
│    - Memanggil Service Layer                           │
│    - TIDAK BOLEH memuat logika bisnis rumit            │
│    - TIDAK BOLEH melakukan query langsung ke Sequelize │
└───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│ 3. SERVICE LAYER (services/)                           │
│    - Tempat seluruh ATURAN BISNIS (Business Logic)     │
│    - Kalkulasi harga sewa, validasi ketersediaan slot, │
│      koneksi MinIO, pembuatan token, logika transaksi  │
│    - Tidak bergantung pada objek HTTP (`req`/`res`)    │
│    - Dapat diuji secara unit test independen           │
└───────────────────────────────────┬────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────┐
│ 4. DATA ACCESS LAYER (models/ & Sequelize ORM)         │
│    - Definisi skema, relasi, migrasi, dan seeder       │
│    - Kueri PostgreSQL + PostGIS (Spatial queries)      │
└────────────────────────────────────────────────────────┘
```

### B. Struktur Direktori Proyek Standar
```
lapang/
├── backend/
│   ├── .env.example                # Template konfigurasi environment (NO SECRETS)
│   ├── .eslintrc.json              # Konfigurasi linter
│   ├── .prettierrc                 # Konfigurasi code formatter
│   ├── server.js                   # Inisialisasi HTTP server & graceful shutdown
│   ├── app.js                      # Inisialisasi Express, middleware global, security headers
│   ├── config/
│   │   ├── database.js             # Konfigurasi Sequelize & koneksi PostgreSQL
│   │   ├── minio.js                # Inisialisasi MinIO Client SDK
│   │   └── environment.js          # Validasi skema env saat startup
│   ├── constants/                  # Kode error, role, status booking, enum
│   ├── controllers/                # HTTP Request/Response handlers
│   ├── middlewares/                # Auth, Role, Validator, RateLimiter, ErrorHandler
│   ├── models/                     # Sequelize models & associations
│   ├── routes/                     # Definisi rute Express
│   ├── services/                   # Core business logic (Venue, Booking, MinIO, dll)
│   ├── utils/                      # Helper umum, response formatter, crypto utils
│   └── validators/                 # Skema validasi request (Joi / Zod)
```

---

## 3. Konvensi Penulisan Kode (Clean Code Guidelines)

### A. Aturan Penamaan (Naming Conventions)
| Elemen | Format | Contoh |
| :--- | :--- | :--- |
| **Variabel & Fungsi** | `camelCase` | `calculateBookingPrice()`, `venueList` |
| **Model & Class** | `PascalCase` | `Venue`, `CourtSchedule`, `MinioService` |
| **File Biasa** | `camelCase.js` | `venueController.js`, `minioService.js` |
| **File Model Sequelize** | `PascalCase.js` atau `camelCase.js` | `Venue.js`, `User.js` (konsisten) |
| **Konstanta Global** | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE_BYTES`, `BOOKING_STATUS` |
| **Tabel & Kolom Database** | `snake_case` | `opening_hours`, `created_at`, `courts` |
| **Endpoint REST API** | `kebab-case` (jamak) | `/api/v1/venues`, `/api/v1/sports-categories` |

### B. Larangan Keras (*Strict Prohibitions*)
1. **Dilarang *Magic Numbers* & *Magic Strings*:**
   *Salah:* `if (booking.status === 2) ...`  
   *Benar:* `if (booking.status === BOOKING_STATUS.CONFIRMED) ...`
2. **Dilarang *Callback Hell*:** Selalu gunakan sintaks `async / await` dengan blok `try-catch` terstruktur.
3. **Dilarang Mengabaikan Error:** Blok `catch` tidak boleh kosong. Error harus diteruskan ke handler (`next(error)`) atau dicatat dengan logger.
4. **Hindari *Deep Nesting*:** Maksimal 3 tingkat kedalaman logika. Gunakan *Guard Clauses* (*early return*).

---

## 4. Standar Keamanan Aplikasi (OWASP Top 10 & Pentest Hardening)

Untuk memastikan aplikasi **lolos audit pengujian penetrasi (Pentest)**, setiap poin mitigasi berikut wajib diimplementasikan:

### A. Perlindungan Terhadap Injeksi (SQLi & NoSQL Injection)
- **Kueri Terparameter:** Semua operasi database wajib menggunakan fungsi bawaan Sequelize ORM (`findOne`, `findAll`, `create`).
- **Larangan String Concatenation pada SQL:**
  ```javascript
  // ❌ SANGAT DILARANG (VULNERABLE TO SQL INJECTION)
  const query = `SELECT * FROM venues WHERE name = '${userInput}'`;
  
  // ✅ WAJIB: Gunakan Sequelize Parameterized Replacement
  const venue = await Venue.findOne({
    where: { name: userInput }
  });
  ```
- **Kueri Geospasial PostGIS Aman:**
  Gunakan operator spasial Sequelize atau literal dengan parameter binding:
  ```javascript
  // ✅ Parameterized spatial binding
  const venues = await Venue.findAll({
    where: sequelize.where(
      sequelize.fn(
        'ST_DWithin',
        sequelize.col('location'),
        sequelize.fn('ST_SetSRID', sequelize.fn('ST_MakePoint', parseFloat(lng), parseFloat(lat)), 4326),
        radiusInMeters
      ),
      true
    )
  });
  ```

### B. Akses Kontrol & Pencegahan IDOR (*Insecure Direct Object Reference*)
- **Verifikasi Kepemilikan Objek (Object-Level Authorization):**
  Sebelum mengedit/menghapus entitas (misal mengubah data venue, menghapus foto), backend **wajib** memvalidasi bahwa entitas tersebut milik pengguna yang sedang login:
  ```javascript
  // ✅ Mencegah IDOR pada endpoint PUT /api/v1/venues/:id
  const venue = await Venue.findByPk(venueId);
  if (!venue) throw new NotFoundError('Venue tidak ditemukan');
  
  if (venue.owner_id !== req.user.id && req.user.role !== ROLES.ADMIN) {
    throw new ForbiddenError('Anda tidak memiliki akses ke venue ini');
  }
  ```
- **Gunakan UUIDv4 untuk Identitas Publik:**
  ID record pada tabel `venues`, `courts`, `reviews`, dan `bookings` wajib menggunakan `UUIDv4` untuk mencegah serangan enumerasi ID berurutan (`/venues/1`, `/venues/2`).

### C. Autentikasi & Manajemen Sesi yang Aman
- **Password Hashing:** Wajib menggunakan algoritma `argon2` atau `bcrypt` dengan cost factor minimal **12 rounds**. Dilarang menyimpan password dalam bentuk teks polos atau MD5/SHA256.
- **JWT Architecture:**
  - *Access Token:* Masa berlaku singkat (**15 menit**).
  - *Refresh Token:* Disimpan di database dengan rotasi token dan dikirim melalui Cookie **`httpOnly`, `secure`, `sameSite: 'strict'`**.
- **Perlindungan Brute-Force & Rate Limiting:**
  Gunakan `express-rate-limit` pada endpoint sensitif:
  - `/api/v1/auth/login`: Maksimal 5 percobaan gagal per 15 menit per IP.
  - `/api/v1/auth/register`: Maksimal 3 pendaftaran per jam per IP.
  - API publik umum: Maksimal 100 request per menit per IP.

### D. Keamanan Unggah Berkas & Integrasi MinIO
Penyimpanan file ke MinIO rawan eksploitasi jika tidak dibatasi ketat:
1. **Validasi Tipe Konten Sejati (Magic Bytes):**
   Jangan hanya percaya pada ekstensi file dari user (`.jpg`). Periksa *MIME Magic Numbers* menggunakan pustaka `file-type`.
2. **Whitelist Ekstensi & MIME Type:**
   Hanya izinkan `image/jpeg`, `image/png`, `image/webp`. Dilarang menerima berkas SVG (mencegah XSS melalui script SVG), HTML, atau berkas eksekusi.
3. **Pembatasan Ukuran File:** Maksimal **5 MB** per gambar.
4. **Sanitasi Nama File:**
   Nama file asli pengguna **tidak boleh digunakan** di MinIO. Hasilkan nama acak baru:
   ```javascript
   const fileExtension = 'webp';
   const secureFileName = `${crypto.randomUUID()}.${fileExtension}`;
   ```
5. **Konversi Format & Optimasi Otomatis:**
   Gunakan library `sharp` untuk melakukan re-encoding gambar ke format WebP sebelum diunggah ke MinIO. Ini menghapus *metadata EXIF berbahaya* sekaligus memperkecil ukuran berkas.

### E. Header Keamanan HTTP & Konfigurasi Server (Helmet & CORS)
- **Helmet Middleware:** Wajib diaktifkan di lapisan paling atas `app.js`:
  ```javascript
  import helmet from 'helmet';
  app.use(helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: false // jika diperlukan untuk resource Leaflet
  }));
  ```
- **Sembunyikan Fingerprint Teknologi:** Nonaktifkan `x-powered-by` (otomatis oleh Helmet).
- **CORS Ketat (Cross-Origin Resource Sharing):**
  Dilarang menggunakan `origin: "*"` pada lingkungan produksi:
  ```javascript
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Diblokir oleh kebijakan CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```
- **Payload Limit:** Batasi payload JSON untuk mencegah serangan Memory Exhaustion / DoS:
  ```javascript
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  ```

### F. Pencegahan Race Condition pada Booking Lapangan (ACID)
Salah satu celah kritis pada sistem reservasi adalah **Double Booking** (dua orang memesan slot waktu yang sama di detik yang sama).
- **Wajib Gunakan Database Transactions & Row Locking (`FOR UPDATE`):**
  ```javascript
  // ✅ Mencegah Race Condition saat booking
  const transaction = await sequelize.transaction();
  try {
    const schedule = await CourtSchedule.findOne({
      where: { id: scheduleId, status: 'available' },
      lock: transaction.LOCK.UPDATE, // Row-level lock
      transaction
    });

    if (!schedule) {
      throw new ConflictError('Slot lapangan ini baru saja dipesan oleh orang lain');
    }

    schedule.status = 'booked';
    await schedule.save({ transaction });

    const booking = await Booking.create({ ...bookingData }, { transaction });

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
  ```

---

## 5. Standar Validasi Input & Penanganan Error Terpusat

### A. Validasi Input di Lapisan Rute (Joi / Zod)
Semua input (`req.body`, `req.query`, `req.params`) harus divalidasi dan disanitasi sebelum masuk ke controller. Request yang gagal divalidasi langsung ditolak dengan status HTTP `422 Unprocessable Entity` atau `400 Bad Request`.

### B. Format Respons API yang Seragam (Standard JSON Response)
Semua endpoint harus mengembalikan format JSON yang konsisten:

**Format Respons Sukses:**
```json
{
  "success": true,
  "message": "Data lapangan berhasil diambil",
  "data": {
    "id": "e3f89832-6a84-48b8-8097-f018a14ec86f",
    "name": "GOR Bulutangkis Senayan",
    "slug": "gor-bulutangkis-senayan"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 1
  }
}
```

**Format Respons Error:**
```json
{
  "success": false,
  "message": "Validasi input gagal",
  "errors": [
    {
      "field": "phone_number",
      "message": "Nomor telepon harus diawali dengan 08 atau +62"
    }
  ]
}
```

### C. Penanganan Error Terpusat (Centralized Error Handler)
- **Dilarang Mengekspos Stack Trace:** Pada mode `NODE_ENV=production`, jangan pernah mengirimkan detail error internal database atau stack trace ke klien (informasi ini membantu penyerang memetakan sistem).
- **Log Error Internal:** Gunakan logger terstruktur (`Winston` atau `Pino`) untuk merekam jejak error di server.

---

## 6. Standar Logging & Sanitasi Data Rahasia

1. **Format Log Terstruktur (JSON):** Setiap log mencakup `timestamp`, `level` (`info`, `warn`, `error`), `requestId`, `userId`, dan `message`.
2. **Sanitasi Data Pribadi (PII Masking):**
   Dilarang keras mencatat data berikut ke log:
   - Password / Password Hash
   - Token JWT (Access Token / Refresh Token)
   - Nomor Rekening / Bukti Pembayaran Sensitif
   - KTP / Dokumen Identitas

---

## 7. Checklist Kesiapan Uji Penetrasi (Pentest Checklist)

Sebelum aplikasi dinyatakan siap produksi, wajib melalui checklist pengujian berikut:

| Kategori | Item Pengujian | Standar Verifikasi |
| :--- | :--- | :--- |
| **Authentication** | Brute force login | Rate limiting aktif (blokir IP setelah 5 kali gagal berturut-turut). |
| **Authentication** | Password strength | Minimal 8 karakter, wajib angka + simbol + huruf besar/kecil. |
| **Authorization** | IDOR pada resource | User A tidak dapat mengedit / menghapus lapangan milik User B. |
| **Authorization** | Role privilege escalation | Pengguna biasa tidak dapat mengakses endpoint `/admin/*` atau `/owner/*`. |
| **Data Security** | SQL Injection | Seluruh input parameter diuji payload `' OR 1=1 --` dan lolos tanpa error SQL. |
| **Data Security** | XSS Protection | Input ulasan & nama venue disanitasi dari tag script `<script>alert(1)</script>`. |
| **File Storage** | Unrestricted File Upload | Mencoba upload file `.php`, `.sh`, `.exe`, `.svg` tertolak secara otomatis. |
| **File Storage** | Path Traversal MinIO | Nama file di-generate ulang dengan UUID acak, nama asli dibuang. |
| **Business Logic** | Race condition booking | Uji coba 10 request bersamaan untuk 1 slot jadwal, hanya 1 yang berhasil. |
| **Network & Header**| Security Headers | Helmet aktif, SSL/TLS HSTS terpasang, CORS spesifik domain. |
| **Information Leak**| Error disclosure | Tidak ada error SQL, path direktori server, atau stack trace bocor di response. |
