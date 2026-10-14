import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../app.js';
import { AuthService } from '../services/authService.js';
import { Venue } from '../models/index.js';

describe('Admin Controller & Endpoints Integration Tests (RBAC & Feature Verification)', () => {
  let server;
  let baseUrl;
  let adminToken;
  let ownerToken;
  let userToken;
  let testVenueId;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // Login Admin
    const adminLogin = await AuthService.login({
      email: 'admin@lapang.id',
      password: 'Password123!'
    });
    adminToken = adminLogin.token;

    // Login Owner
    const ownerLogin = await AuthService.login({
      email: 'owner@lapang.id',
      password: 'Password123!'
    });
    ownerToken = ownerLogin.token;

    // Login Regular User
    const userLogin = await AuthService.login({
      email: 'rian@lapang.id',
      password: 'Password123!'
    });
    userToken = userLogin.token;

    // Cari salah satu venue untuk verifikasi status
    const venue = await Venue.findOne();
    if (venue) testVenueId = venue.id;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  // 1. RBAC Tests
  it('[GAGAL] GET /api/v1/admin/overview tanpa token otentikasi ditolak (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/overview`);
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Token otentikasi tidak ditemukan/);
  });

  it('[GAGAL] GET /api/v1/admin/overview dengan role USER ditolak (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/overview`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Akses ditolak/);
  });

  it('[GAGAL] GET /api/v1/admin/overview dengan role OWNER ditolak (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/overview`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.message, /Akses ditolak/);
  });

  // 2. Admin Overview
  it('[BERHASIL] GET /api/v1/admin/overview berhasil diakses oleh ADMIN (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.stats);
    assert.ok(Array.isArray(json.data.verificationQueue));
    assert.ok(Array.isArray(json.data.activeFields));
    assert.ok(json.data.currentAdmin);
  });

  // 3. Update Verification Status
  it('[BERHASIL] PUT /api/v1/admin/verifications/:id/status mengubah status verifikasi (200)', async () => {
    assert.ok(testVenueId);
    const res = await fetch(`${baseUrl}/api/v1/admin/verifications/${testVenueId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Verified',
        issueNote: null
      })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, 'Verified');
  });

  // 4. Invite Owner
  it('[BERHASIL] POST /api/v1/admin/invite-owner mengundang mitra pemilik venue (201)', async () => {
    const dummyEmail = `invite_api_${Date.now()}@sportsvenue.id`;
    const res = await fetch(`${baseUrl}/api/v1/admin/invite-owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Mitra Owner Baru',
        email: dummyEmail,
        facilityName: 'Gelanggang Olahraga Nusantara',
        sportType: 'Badminton & Futsal',
        location: 'Surabaya, Jawa Timur',
        courtsCount: 6
      })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, 'Pending Review');

    // Clean up
    await Venue.destroy({ where: { id: json.data.id } });
  });

  // 5. Export CSV
  it('[BERHASIL] GET /api/v1/admin/export-csv mengembalikan antrean dalam format CSV (200)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/export-csv`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
    const csvContent = await res.text();
    assert.ok(csvContent.includes('Owner Name'));
    assert.ok(csvContent.includes('Facility Name'));
  });
});
