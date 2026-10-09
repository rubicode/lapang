import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app.js';

describe('Express REST API Endpoints Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('[BERHASIL] GET /api/v1/health mengembalikan status healthy', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
  });

  it('[BERHASIL] GET /api/v1/categories mengembalikan list kategori olahraga', async () => {
    const res = await fetch(`${baseUrl}/api/v1/categories`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 5);
  });

  it('[BERHASIL] GET /api/v1/venues mengembalikan daftar venue dengan metadata filter', async () => {
    const res = await fetch(`${baseUrl}/api/v1/venues?sport=futsal&city=Jakarta`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.meta);
  });

  it('[BERHASIL] POST /api/v1/bookings berhasil membuat reservasi', async () => {
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

  it('[GAGAL] GET /endpoint-tidak-dikenal mengembalikan 404 JSON seragam', async () => {
    const res = await fetch(`${baseUrl}/api/v1/random-endpoint-xyz`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.message.includes('tidak ditemukan'));
  });
});
