import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import sharp from 'sharp';
import app from '../app.js';
import { AuthService } from '../services/authService.js';
import { Review, User } from '../models/index.js';

describe('Express REST API Endpoints Integration Tests (Skenario Berhasil & Gagal)', () => {
  let server;
  let baseUrl;
  let sampleReviewId;
  let ownerToken;
  let userToken;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Login owner & user
    const ownerLogin = await AuthService.login({
      email: 'owner@lapang.id',
      password: 'Password123!'
    });
    ownerToken = ownerLogin.token;

    const userLogin = await AuthService.login({
      email: 'rian@lapang.id',
      password: 'Password123!'
    });
    userToken = userLogin.token;

    // Ambil 1 review untuk pengujian reply
    const review = await Review.findOne();
    if (review) sampleReviewId = review.id;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // 1. Health & Root Info
  it('[BERHASIL] GET /api/v1/health mengembalikan status healthy', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.service, 'LapangID API');
  });

  // 2. Master Data: Kategori & Kota
  it('[BERHASIL] GET /api/v1/categories mengembalikan list kategori olahraga', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 5);
  });

  it('[BERHASIL] GET /api/v1/regions/cities mengembalikan list kota terformat', async () => {
    const res = await fetch(`${baseUrl}/api/v1/regions/cities`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length > 0);
    const first = json.data[0];
    assert.ok(first.name);
    assert.ok(typeof first.lat === 'number');
    assert.ok(typeof first.lng === 'number');
  });

  // 3. Autentikasi API Endpoints
  it('[BERHASIL] POST /api/v1/auth/register mendaftar akun baru (201)', async () => {
    const dummyEmail = `reg_api_${Date.now()}@lapang.id`;
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Test User',
        email: dummyEmail,
        password: 'Password123!',
        phone: '08123456789'
      })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.token);
    assert.equal(json.data.user.email, dummyEmail);

    // Clean up
    await User.destroy({ where: { id: json.data.user.id } });
  });

  it('[GAGAL] POST /api/v1/auth/register dengan email duplikat mengembalikan 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rian Pratama',
        email: 'rian@lapang.id',
        password: 'Password123!'
      })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Email sudah terdaftar/);
  });

  it('[BERHASIL] POST /api/v1/auth/login dengan kredensial benar mengembalikan 200 & JWT', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rian@lapang.id',
        password: 'Password123!'
      })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.token);
  });

  it('[GAGAL] POST /api/v1/auth/login dengan password salah mengembalikan 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rian@lapang.id',
        password: 'PasswordSalah999!'
      })
    });

    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Kredensial tidak valid/);
  });

  it('[BERHASIL] GET /api/v1/auth/me mengembalikan profil pengguna login (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.email, 'rian@lapang.id');
    assert.equal(json.data.password_hash, undefined);
  });

  it('[GAGAL] GET /api/v1/auth/me tanpa token otentikasi mengembalikan 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/me`);
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  // 4. Katalog & Detail Venue
  it('[BERHASIL] GET /api/v1/venues mengembalikan daftar venue dengan metadata filter', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues?sport=futsal&city=Jakarta`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.meta);
    assert.equal(json.meta.filters.sport, 'futsal');
  });

  it('[BERHASIL] GET /api/v1/venues/:idOrSlug mengembalikan detail lapangan valid (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues/the-emerald-arena-jakarta`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.slug, 'the-emerald-arena-jakarta');
    assert.ok(Array.isArray(json.data.courts));
  });

  it('[GAGAL] GET /api/v1/venues/:idOrSlug dengan slug yang tidak ada mengembalikan 404', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues/slug-lapangan-tidak-pernah-ada-404`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Lapangan tidak ditemukan/);
  });

  // 5. Ulasan Lapangan & Balasan
  it('[BERHASIL] GET /api/v1/venues/:idOrSlug/reviews mengembalikan daftar ulasan (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues/the-emerald-arena-jakarta/reviews`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.aspects);
    assert.ok(Array.isArray(json.data.reviews));
  });

  it('[BERHASIL] POST /api/v1/venues/:idOrSlug/reviews berhasil mengirim ulasan baru (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues/the-emerald-arena-jakarta/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        rating_overall: 5,
        rating_floor: 5,
        rating_lighting: 5,
        rating_cleanliness: 5,
        rating_hospitality: 5,
        comment: 'Pencahayaan LED sangat terang dan tidak silau.'
      })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(Number(json.data.rating_overall), 5);

    // Clean up
    await Review.destroy({ where: { id: json.data.id } });
  });

  it('[GAGAL] POST /api/v1/venues/reviews/:reviewId/reply tanpa auth ditolak (401)', async () => {
    assert.ok(sampleReviewId);
    const res = await fetch(`${baseUrl}/api/v1/venues/reviews/${sampleReviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'Terima kasih!' })
    });

    assert.equal(res.status, 401);
  });

  it('[GAGAL] POST /api/v1/venues/reviews/:reviewId/reply oleh role USER ditolak (403)', async () => {
    assert.ok(sampleReviewId);
    const res = await fetch(`${baseUrl}/api/v1/venues/reviews/${sampleReviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ reply: 'Balasan ilegal' })
    });

    assert.equal(res.status, 403);
  });

  it('[GAGAL] POST /api/v1/venues/reviews/:reviewId/reply dengan reply kosong mengembalikan 400', async () => {
    assert.ok(sampleReviewId);
    const res = await fetch(`${baseUrl}/api/v1/venues/reviews/${sampleReviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ reply: '   ' })
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.message, /Teks balasan ulasan wajib diisi/);
  });

  it('[BERHASIL] POST /api/v1/venues/reviews/:reviewId/reply oleh OWNER berhasil disimpan (200)', async () => {
    assert.ok(sampleReviewId);
    const res = await fetch(`${baseUrl}/api/v1/venues/reviews/${sampleReviewId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ reply: 'Terima kasih atas kunjungannya!' })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.owner_reply, 'Terima kasih atas kunjungannya!');
  });

  // 6. Jadwal Slot Waktu Real-Time
  it('[BERHASIL] GET /api/v1/venues/:idOrSlug/schedules mengembalikan matriks slot (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues/the-emerald-arena-jakarta/schedules?date=2026-10-15`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.slots));
    assert.ok(Array.isArray(json.data.bookedSlots));
  });

  // 7. Booking Endpoints
  it('[BERHASIL] POST /api/v1/bookings berhasil membuat reservasi (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        venueId: '11111111-1111-1111-1111-111111111111',
        customerName: 'Deni Setiawan',
        customerPhone: '081312345678',
        date: '2026-10-20',
        timeSlot: '20:00',
        totalAmount: 175000,
        paymentMethod: 'QRIS'
      })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.meta?.bookingCode);
  });

  it('[BERHASIL] GET /api/v1/bookings/:code mengembalikan detail tiket reservasi (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/bookings/LAPANG-2024-ID-8849`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.booking_code, 'LAPANG-2024-ID-8849');
  });

  // 8. Media Upload ke MinIO
  it('[GAGAL] POST /api/v1/media/upload tanpa file mengembalikan 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/media/upload`, {
      method: 'POST'
    });

    assert.equal(res.status, 400);
    const json = await res.json();
    assert.match(json.message, /Tidak ada berkas yang diunggah/);
  });

  it('[BERHASIL] POST /api/v1/media/upload berhasil mengunggah gambar multipart ke MinIO (201)', async () => {
    const sampleBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 40, g: 120, b: 60, alpha: 1 }
      }
    }).png().toBuffer();

    const formData = new FormData();
    formData.append('image', new Blob([sampleBuffer], { type: 'image/png' }), 'lapangan_test.png');
    formData.append('type', 'venue');

    const res = await fetch(`${baseUrl}/api/v1/media/upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.fileName.endsWith('.webp'));
    assert.ok(json.data.url);
  });

  // 9. Error Handler & 404
  it('[GAGAL] GET /endpoint-tidak-dikenal mengembalikan 404 JSON seragam', async () => {
    const res = await fetch(`${baseUrl}/api/v1/random-endpoint-xyz`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.message.includes('tidak ditemukan'));
  });
});

