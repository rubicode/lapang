import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import { successResponse, errorResponse } from '../utils/response.js';
import { globalErrorHandler } from '../middlewares/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { ENV } from '../config/environment.js';
import app from '../app.js';

describe('Middlewares & Utils Unit Tests', () => {
  // 1. Response Helper: successResponse
  test('[BERHASIL] successResponse menghasilkan format standar dengan nilai default', () => {
    let capturedStatus = null;
    let capturedPayload = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedPayload = payload; return this; }
    };

    successResponse(mockRes);

    assert.equal(capturedStatus, HTTP_STATUS.OK);
    assert.equal(capturedPayload.success, true);
    assert.equal(capturedPayload.message, 'Operasi berhasil');
    assert.equal(capturedPayload.data, null);
    assert.equal(capturedPayload.meta, undefined);
  });

  test('[BERHASIL] successResponse menyertakan meta, data kustom, dan status code kustom', () => {
    let capturedStatus = null;
    let capturedPayload = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedPayload = payload; return this; }
    };

    const mockData = { venueId: 'venue-123', name: 'Arena Futsal' };
    const mockMeta = { total: 1, page: 1 };

    successResponse(mockRes, 'Data berhasil dimuat', mockData, HTTP_STATUS.CREATED, mockMeta);

    assert.equal(capturedStatus, HTTP_STATUS.CREATED);
    assert.equal(capturedPayload.success, true);
    assert.equal(capturedPayload.message, 'Data berhasil dimuat');
    assert.deepEqual(capturedPayload.data, mockData);
    assert.deepEqual(capturedPayload.meta, mockMeta);
  });

  // 2. Response Helper: errorResponse
  test('[BERHASIL] errorResponse menghasilkan format error standar dengan nilai default', () => {
    let capturedStatus = null;
    let capturedPayload = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedPayload = payload; return this; }
    };

    errorResponse(mockRes);

    assert.equal(capturedStatus, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    assert.equal(capturedPayload.success, false);
    assert.equal(capturedPayload.message, 'Terjadi kesalahan sistem');
    assert.equal(capturedPayload.errors, undefined);
  });

  test('[BERHASIL] errorResponse menyertakan errors detail dan status code yang ditentukan', () => {
    let capturedStatus = null;
    let capturedPayload = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedPayload = payload; return this; }
    };

    const errorDetails = ['Email tidak valid', 'Password terlalu pendek'];
    errorResponse(mockRes, 'Validasi gagal', errorDetails, HTTP_STATUS.BAD_REQUEST);

    assert.equal(capturedStatus, HTTP_STATUS.BAD_REQUEST);
    assert.equal(capturedPayload.success, false);
    assert.equal(capturedPayload.message, 'Validasi gagal');
    assert.deepEqual(capturedPayload.errors, errorDetails);
  });

  // 3. Centralized Global Error Handler
  test('[BERHASIL] globalErrorHandler menangani error dengan statusCode bawaan', () => {
    let capturedStatus = null;
    let capturedPayload = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedPayload = payload; return this; }
    };

    const mockReq = { method: 'POST', originalUrl: '/api/v1/test' };
    const customError = new Error('Akses dilarang untuk entitas ini');
    customError.statusCode = HTTP_STATUS.FORBIDDEN;

    globalErrorHandler(customError, mockReq, mockRes, () => {});

    assert.equal(capturedStatus, HTTP_STATUS.FORBIDDEN);
    assert.equal(capturedPayload.success, false);
    assert.equal(capturedPayload.message, 'Akses dilarang untuk entitas ini');
  });

  test('[BERHASIL] globalErrorHandler fallback ke 500 jika error tidak memiliki statusCode', () => {
    let capturedStatus = null;
    let capturedPayload = null;

    const mockRes = {
      status(code) { capturedStatus = code; return this; },
      json(payload) { capturedPayload = payload; return this; }
    };

    const mockReq = { method: 'GET', originalUrl: '/api/v1/error-unhandled' };
    const genericError = new Error('Database connection timeout');

    globalErrorHandler(genericError, mockReq, mockRes, () => {});

    assert.equal(capturedStatus, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    assert.equal(capturedPayload.success, false);
    assert.equal(capturedPayload.message, 'Database connection timeout');
  });

  // 4. Security Headers & Root Endpoint via Express App
  test('[BERHASIL] Express App menyertakan security headers Helmet dan CORS', async () => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, HTTP_STATUS.OK);
      const json = await res.json();
      assert.equal(json.app, 'Lapang.id Backend Service');

      // Cek Helmet Security Headers
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.ok(res.headers.get('cross-origin-resource-policy'));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
