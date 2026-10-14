import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app.js';
import { AuthService } from '../services/authService.js';
import { Court } from '../models/index.js';

describe('Owner Controller & Endpoints Integration Tests (RBAC & Feature Verification)', () => {
  let server;
  let baseUrl;
  let ownerToken;
  let userToken;
  let createdCourtId;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Login Marcus Silva (Owner)
    const ownerLogin = await AuthService.login({
      email: 'marcus@lapang.id',
      password: 'Password123!'
    });
    ownerToken = ownerLogin.token;

    // Login Rian Pratama (Regular User)
    const userLogin = await AuthService.login({
      email: 'rian@lapang.id',
      password: 'Password123!'
    });
    userToken = userLogin.token;
  });

  after(async () => {
    if (createdCourtId) {
      await Court.destroy({ where: { id: createdCourtId } }).catch(() => {});
    }
    await new Promise((resolve) => server.close(resolve));
  });

  // 1. RBAC Tests
  it('[GAGAL] Akses GET /api/v1/owner/overview tanpa token ditolak (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/overview`);
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Token otentikasi tidak ditemukan/);
  });

  it('[GAGAL] Akses GET /api/v1/owner/overview dengan role USER ditolak (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/overview`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Akses ditolak/);
  });

  // 2. Owner Overview
  it('[BERHASIL] GET /api/v1/owner/overview berhasil dimuat oleh OWNER (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/overview`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.stats);
    assert.equal(json.data.owner.name, 'Marcus Silva');
    assert.ok(Array.isArray(json.data.fields));
  });

  // 3. Create & Update Court (Fields)
  it('[BERHASIL] POST /api/v1/owner/fields menambah court baru (201)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: 'Field Arena 5 Pro',
        match_format: '5-a-side',
        surface_spec: 'Synthetic Turf 4G',
        price_hourly: 120
      })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.name, 'Field Arena 5 Pro');
    createdCourtId = json.data.id;
  });

  it('[BERHASIL] PATCH /api/v1/owner/fields/:id memperbarui data court (200)', async () => {
    assert.ok(createdCourtId);
    const res = await fetch(`${baseUrl}/api/v1/owner/fields/${createdCourtId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: 'Field Arena 5 Pro Updated',
        price_hourly: 135
      })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.name, 'Field Arena 5 Pro Updated');
    assert.equal(json.data.price_hourly, 135);
  });

  // 4. Promotions (Early Bird)
  it('[BERHASIL] POST /api/v1/owner/promotions/early-bird mengaktifkan promo diskon (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/promotions/early-bird`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ promoActive: true })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.earlyBirdPromoActive, true);

    // Kembalikan ke false
    await fetch(`${baseUrl}/api/v1/owner/promotions/early-bird`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ promoActive: false })
    });
  });

  // 5. Export Report CSV
  it('[BERHASIL] GET /api/v1/owner/export-report mengembalikan berkas CSV (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/export-report`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
    const text = await res.text();
    assert.ok(text.includes('PITCH GALLERY'));
  });

  // 6. Bookings & Status
  it('[BERHASIL] GET /api/v1/owner/bookings mengambil daftar reservasi (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/bookings?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.bookings));
    assert.ok(json.data.summary);
  });

  it('[BERHASIL] PATCH /api/v1/owner/bookings/:id/status memperbarui status booking (200)', async () => {
    // Ambil 1 booking
    const listRes = await fetch(`${baseUrl}/api/v1/owner/bookings?limit=1`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const listJson = await listRes.json();
    const targetBooking = listJson.data.bookings[0];

    const patchRes = await fetch(`${baseUrl}/api/v1/owner/bookings/${targetBooking.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ status: 'confirmed' })
    });

    assert.equal(patchRes.status, 200);
    const patchJson = await patchRes.json();
    assert.equal(patchJson.success, true);
    assert.equal(patchJson.data.booking_status, 'confirmed');
  });

  // 7. Schedules & Toggle Block
  it('[BERHASIL] GET /api/v1/owner/schedules memuat matriks slot waktu (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/schedules?date=2026-10-14`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.slots);
    assert.ok(json.data.courts);
  });

  it('[BERHASIL] POST /api/v1/owner/schedules/toggle-block memblokir slot (200)', async () => {
    const schedRes = await fetch(`${baseUrl}/api/v1/owner/schedules?date=2026-10-14`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const schedJson = await schedRes.json();
    const courtId = schedJson.data.courts[0].id;

    const blockRes = await fetch(`${baseUrl}/api/v1/owner/schedules/toggle-block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        courtId,
        date: '2026-10-14',
        timeSlot: '09:00',
        status: 'blocked'
      })
    });

    assert.equal(blockRes.status, 200);
    const blockJson = await blockRes.json();
    assert.equal(blockJson.success, true);
    assert.equal(blockJson.data.status, 'blocked');

    // Unblock kembali
    await fetch(`${baseUrl}/api/v1/owner/schedules/toggle-block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        courtId,
        date: '2026-10-14',
        timeSlot: '09:00',
        status: 'available'
      })
    });
  });

  // 8. Revenue Analytics
  it('[BERHASIL] GET /api/v1/owner/revenue memuat metrik pendapatan (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/owner/revenue?period=month`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.grossRevenue > 0);
    assert.ok(json.data.netRevenue > 0);
  });

  // 9. Settings
  it('[BERHASIL] GET /api/v1/owner/settings dan PATCH /api/v1/owner/settings (200)', async () => {
    const getRes = await fetch(`${baseUrl}/api/v1/owner/settings`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(getRes.status, 200);
    const getJson = await getRes.json();
    assert.equal(getJson.success, true);

    const prevPhone = getJson.data.owner.phone;

    const patchRes = await fetch(`${baseUrl}/api/v1/owner/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        ownerPhone: '+62 899 7777 6666'
      })
    });
    assert.equal(patchRes.status, 200);
    const patchJson = await patchRes.json();
    assert.equal(patchJson.data.owner.phone, '+62 899 7777 6666');

    // Kembalikan ke phone lama
    await fetch(`${baseUrl}/api/v1/owner/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ ownerPhone: prevPhone })
    });
  });
});
