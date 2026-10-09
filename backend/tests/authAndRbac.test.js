import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../services/authService.js';
import { User } from '../models/index.js';
import { USER_ROLES } from '../constants/index.js';

describe('AuthService & RBAC Unit Tests (Skenario Berhasil & Gagal)', () => {
  const testEmail = `testuser_${Date.now()}@lapang.id`;

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

    // Cek password hash di DB
    const dbUser = await User.findOne({ where: { email: testEmail } });
    assert.notEqual(dbUser.password_hash, 'SecurePassword123!', 'Password tidak boleh plain text');
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
});
