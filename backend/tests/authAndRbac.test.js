import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService.js';
import { User } from '../models/index.js';
import { USER_ROLES, HTTP_STATUS } from '../constants/index.js';
import { authenticate, optionalAuth, authorize } from '../middlewares/auth.js';
import { ENV } from '../config/environment.js';

describe('AuthService & RBAC Unit Tests (Skenario Berhasil & Gagal)', () => {
  const testEmail = `testuser_${Date.now()}@lapang.id`;
  let createdUserId = null;
  let validUserToken = null;

  // 1. Enkripsi Kata Sandi
  test('[BERHASIL] AuthService.hashPassword menghasilkan hash bcrypt yang aman', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await AuthService.hashPassword(rawPassword);

    assert.ok(hash);
    assert.notEqual(hash, rawPassword);
    assert.match(hash, /^\$2[ab]\$\d{2}\$/);

    const isMatch = await AuthService.comparePassword(rawPassword, hash);
    assert.equal(isMatch, true, 'Password yang benar harus cocok dengan hash');

    const isWrongMatch = await AuthService.comparePassword('WrongPassword123!', hash);
    assert.equal(isWrongMatch, false, 'Password yang salah harus ditolak');
  });

  // 2. Registrasi Akun
  test('[BERHASIL] Registrasi user baru berhasil dengan password ter-hash', async () => {
    const result = await AuthService.register({
      name: 'Pemain Baru Test',
      email: testEmail,
      password: 'SecurePassword123!',
      phone: '081299998888',
      role: USER_ROLES.USER
    });

    assert.ok(result.token, 'Token JWT harus dihasilkan');
    assert.equal(result.user.email, testEmail);
    assert.equal(result.user.role, USER_ROLES.USER);
    assert.equal(result.user.is_verified_player, true);
    assert.equal(result.user.phone, '081299998888');

    createdUserId = result.user.id;
    validUserToken = result.token;

    // Cek password hash di DB
    const dbUser = await User.findOne({ where: { email: testEmail } });
    assert.notEqual(dbUser.password_hash, 'SecurePassword123!', 'Password tidak boleh plain text');
  });

  test('[BERHASIL] Registrasi dengan email berhuruf besar dan spasi dinormalisasi otomatis', async () => {
    const mixedCaseEmail = `  MIXED_${Date.now()}@LAPANG.ID  `;
    const normalizedExpected = mixedCaseEmail.trim().toLowerCase();

    const result = await AuthService.register({
      name: 'User Case Sensitive',
      email: mixedCaseEmail,
      password: 'Password123!'
    });

    assert.equal(result.user.email, normalizedExpected);

    // Clean up
    await User.destroy({ where: { id: result.user.id } });
  });

  test('[BERHASIL] Registrasi tanpa phone menghasilkan phone null', async () => {
    const emailNoPhone = `nophone_${Date.now()}@lapang.id`;
    const result = await AuthService.register({
      name: 'No Phone User',
      email: emailNoPhone,
      password: 'Password123!'
    });

    assert.equal(result.user.phone, null);

    // Clean up
    await User.destroy({ where: { id: result.user.id } });
  });

  test('[BERHASIL] Registrasi dengan role invalid otomatis fallback ke USER', async () => {
    const emailFallback = `fallback_${Date.now()}@lapang.id`;
    const result = await AuthService.register({
      name: 'Fallback Role User',
      email: emailFallback,
      password: 'Password123!',
      role: 'super_hacker_role_invalid'
    });

    assert.equal(result.user.role, USER_ROLES.USER);

    // Clean up
    await User.destroy({ where: { id: result.user.id } });
  });

  test('[GAGAL] Registrasi dengan email duplikat harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({
          name: 'Duplikat User',
          email: testEmail,
          password: 'AnotherPassword123!'
        });
      },
      /Email sudah terdaftar/
    );
  });

  test('[GAGAL] Registrasi tanpa nama harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({
          name: '',
          email: `no_name_${Date.now()}@lapang.id`,
          password: 'Password123!'
        });
      },
      /Nama, email, dan kata sandi wajib diisi/
    );
  });

  test('[GAGAL] Registrasi tanpa email harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({
          name: 'Tanpa Email',
          email: '',
          password: 'Password123!'
        });
      },
      /Nama, email, dan kata sandi wajib diisi/
    );
  });

  test('[GAGAL] Registrasi tanpa password harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.register({
          name: 'Tanpa Password',
          email: `no_pass_${Date.now()}@lapang.id`,
          password: ''
        });
      },
      /Nama, email, dan kata sandi wajib diisi/
    );
  });

  // 3. Login Pengguna
  test('[BERHASIL] Login dengan email dan password benar mengembalikan JWT', async () => {
    const loginResult = await AuthService.login({
      email: testEmail,
      password: 'SecurePassword123!'
    });

    assert.ok(loginResult.token);
    assert.equal(loginResult.user.email, testEmail);

    // Verifikasi token
    const decoded = AuthService.verifyToken(loginResult.token);
    assert.equal(decoded.email, testEmail);
    assert.equal(decoded.role, USER_ROLES.USER);
  });

  test('[BERHASIL] Login dengan email huruf besar/kecil tetap dikenali (case-insensitive)', async () => {
    const loginResult = await AuthService.login({
      email: testEmail.toUpperCase(),
      password: 'SecurePassword123!'
    });

    assert.ok(loginResult.token);
    assert.equal(loginResult.user.email, testEmail);
  });

  test('[GAGAL] Login dengan password salah harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login({
          email: testEmail,
          password: 'WrongPassword999!'
        });
      },
      /Kredensial tidak valid/
    );
  });

  test('[GAGAL] Login dengan email yang belum terdaftar harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login({
          email: 'notfound_random_9999@lapang.id',
          password: 'Password123!'
        });
      },
      /Kredensial tidak valid/
    );
  });

  test('[GAGAL] Login tanpa email harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login({
          email: '',
          password: 'Password123!'
        });
      },
      /Email dan kata sandi wajib diisi/
    );
  });

  test('[GAGAL] Login tanpa password harus ditolak', async () => {
    await assert.rejects(
      async () => {
        await AuthService.login({
          email: testEmail,
          password: ''
        });
      },
      /Email dan kata sandi wajib diisi/
    );
  });

  test('[BERHASIL] Login default owner akun & verifikasi role OWNER', async () => {
    const ownerLogin = await AuthService.login({
      email: 'owner@lapang.id',
      password: 'Password123!'
    });

    assert.equal(ownerLogin.user.role, USER_ROLES.OWNER);
    const decoded = AuthService.verifyToken(ownerLogin.token);
    assert.equal(decoded.role, USER_ROLES.OWNER);
  });

  test('[BERHASIL] Login default admin akun & verifikasi role ADMIN', async () => {
    const adminLogin = await AuthService.login({
      email: 'admin@lapang.id',
      password: 'Password123!'
    });

    assert.equal(adminLogin.user.role, USER_ROLES.ADMIN);
    const decoded = AuthService.verifyToken(adminLogin.token);
    assert.equal(decoded.role, USER_ROLES.ADMIN);
  });

  // 4. Token JWT Verification & Security
  test('[GAGAL] verifyToken dengan token acak/palsu harus melempar error', () => {
    assert.throws(
      () => {
        AuthService.verifyToken('ini.token.palsu');
      },
      /jwt malformed|invalid token/
    );
  });

  test('[GAGAL] verifyToken dengan signature salah harus melempar error', () => {
    const forgedToken = jwt.sign({ id: 'fake', role: 'admin' }, 'wrong-secret-key-123');
    assert.throws(
      () => {
        AuthService.verifyToken(forgedToken);
      },
      /invalid signature/
    );
  });

  test('[GAGAL] verifyToken dengan token kedaluwarsa harus melempar error TokenExpiredError', () => {
    const expiredToken = jwt.sign(
      { id: 'expired-user', role: 'user' },
      ENV.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    assert.throws(
      () => {
        AuthService.verifyToken(expiredToken);
      },
      /jwt expired/
    );
  });

  // 5. Profil Pengguna (getProfile)
  test('[BERHASIL] getProfile mengembalikan data user tanpa password_hash', async () => {
    const profile = await AuthService.getProfile(createdUserId);
    assert.ok(profile);
    assert.equal(profile.id, createdUserId);
    assert.equal(profile.email, testEmail);
    assert.equal(profile.password_hash, undefined, 'password_hash tidak boleh bocor pada profil');
  });

  test('[GAGAL] getProfile dengan userId yang tidak ada melempar error', async () => {
    await assert.rejects(
      async () => {
        await AuthService.getProfile('00000000-0000-0000-0000-000000000000');
      },
      /Pengguna tidak ditemukan/
    );
  });

  // 6. Middleware Autentikasi & RBAC
  test('[GAGAL] Middleware authenticate menolak request tanpa header Authorization (401)', () => {
    let responseStatus = null;
    let responseJson = null;

    const req = { headers: {} };
    const res = {
      status(s) { responseStatus = s; return this; },
      json(j) { responseJson = j; return this; }
    };
    const next = () => { assert.fail('next() tidak boleh dipanggil'); };

    authenticate(req, res, next);
    assert.equal(responseStatus, HTTP_STATUS.UNAUTHORIZED);
    assert.equal(responseJson.success, false);
    assert.match(responseJson.message, /Token otentikasi tidak ditemukan/);
  });

  test('[GAGAL] Middleware authenticate menolak header tanpa format "Bearer "', () => {
    let responseStatus = null;
    const req = { headers: { authorization: 'Basic 12345' } };
    const res = {
      status(s) { responseStatus = s; return this; },
      json() { return this; }
    };
    const next = () => { assert.fail('next() tidak boleh dipanggil'); };

    authenticate(req, res, next);
    assert.equal(responseStatus, HTTP_STATUS.UNAUTHORIZED);
  });

  test('[GAGAL] Middleware authenticate menolak token tidak valid (401)', () => {
    let responseStatus = null;
    let responseJson = null;
    const req = { headers: { authorization: 'Bearer invalid.token.payload' } };
    const res = {
      status(s) { responseStatus = s; return this; },
      json(j) { responseJson = j; return this; }
    };
    const next = () => { assert.fail('next() tidak boleh dipanggil'); };

    authenticate(req, res, next);
    assert.equal(responseStatus, HTTP_STATUS.UNAUTHORIZED);
    assert.match(responseJson.message, /Token tidak valid atau telah kedaluwarsa/);
  });

  test('[BERHASIL] Middleware authenticate meloloskan token valid dan mengisi req.user', () => {
    let nextCalled = false;
    const req = { headers: { authorization: `Bearer ${validUserToken}` } };
    const res = {};
    const next = () => { nextCalled = true; };

    authenticate(req, res, next);
    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.email, testEmail);
    assert.equal(req.user.role, USER_ROLES.USER);
  });

  test('[BERHASIL] Middleware optionalAuth tetap memanggil next() meski tanpa token', () => {
    let nextCalled = false;
    const req = { headers: {} };
    const res = {};
    const next = () => { nextCalled = true; };

    optionalAuth(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(req.user, undefined);
  });

  test('[BERHASIL] Middleware optionalAuth mengisi req.user jika token valid diberikan', () => {
    let nextCalled = false;
    const req = { headers: { authorization: `Bearer ${validUserToken}` } };
    const res = {};
    const next = () => { nextCalled = true; };

    optionalAuth(req, res, next);
    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.email, testEmail);
  });

  test('[GAGAL] Middleware authorize menolak request jika req.user tidak ada (401)', () => {
    let responseStatus = null;
    const req = {};
    const res = {
      status(s) { responseStatus = s; return this; },
      json() { return this; }
    };
    const next = () => { assert.fail('next() tidak boleh dipanggil'); };

    const middleware = authorize(USER_ROLES.ADMIN);
    middleware(req, res, next);
    assert.equal(responseStatus, HTTP_STATUS.UNAUTHORIZED);
  });

  test('[GAGAL] Middleware authorize menolak user dengan peran tidak berhak (403)', () => {
    let responseStatus = null;
    let responseJson = null;
    const req = { user: { role: USER_ROLES.USER, email: testEmail } };
    const res = {
      status(s) { responseStatus = s; return this; },
      json(j) { responseJson = j; return this; }
    };
    const next = () => { assert.fail('next() tidak boleh dipanggil'); };

    const middleware = authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN);
    middleware(req, res, next);
    assert.equal(responseStatus, HTTP_STATUS.FORBIDDEN);
    assert.match(responseJson.message, /Akses ditolak/);
  });

  test('[BERHASIL] Middleware authorize meloloskan user dengan peran yang sesuai', () => {
    let nextCalled = false;
    const req = { user: { role: USER_ROLES.OWNER } };
    const res = {};
    const next = () => { nextCalled = true; };

    const middleware = authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN);
    middleware(req, res, next);
    assert.equal(nextCalled, true);
  });
});

