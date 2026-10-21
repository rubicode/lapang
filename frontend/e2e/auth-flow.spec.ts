import { test, expect } from '@playwright/test';

test.describe('Autentikasi & Registrasi Pengguna E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('1. Render Halaman Login, Komponen Formulir & Toggle Masking Password', async ({ page }) => {
    await page.goto('/login');

    // Visual Branding & Stadium Banner
    await expect(page.locator('text=Lapang.id')).toBeVisible();
    await expect(page.locator('text=Lapangan Siap')).toBeVisible();
    await expect(page.locator('text=Menunggumu.')).toBeVisible();

    // Formulir Input
    await expect(page.locator('text=Selamat Datang')).toBeVisible();
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[placeholder="Minimal 6 karakter"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Toggle Masking Password
    await passwordInput.fill('Rahasia123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Klik tombol mata untuk menampilkan password
    const toggleEyeBtn = page.locator('button:has(svg.lucide-eye), button:has(svg.lucide-eye-off)');
    await toggleEyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Klik tombol mata lagi untuk menyembunyikan password
    await toggleEyeBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Checkbox Ingat Saya
    const rememberCheckbox = page.locator('#remember');
    await expect(rememberCheckbox).toBeChecked();
    await rememberCheckbox.uncheck();
    await expect(rememberCheckbox).not.toBeChecked();

    // Tombol Sosial Media (Google & Facebook)
    let dialogMessage = '';
    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.accept();
    });
    await page.locator('button:has-text("Google")').click();
    expect(dialogMessage).toContain('Google Sign-In akan segera hadir');

    page.once('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.accept();
    });
    await page.locator('button:has-text("Facebook")').click();
    expect(dialogMessage).toContain('Facebook Login akan segera hadir');
  });

  test('2. Validasi Kredensial Salah Menampilkan Pesan Error Tanpa Dialihkan', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill('nonexistent@lapang.id');
    await page.locator('input[placeholder="Minimal 6 karakter"]').fill('WrongPassword123');

    await page.locator('button[type="submit"]').click();

    // Error alert banner harus muncul
    const errorBanner = page.locator('.bg-red-50');
    await expect(errorBanner).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('3. Menampilkan Pesan Akses Ditolak Berdasarkan Parameter URL Query', async ({ page }) => {
    // 1. Unauthorized Admin
    await page.goto('/login?error=unauthorized');
    await expect(
      page.locator('text=Akses ditolak. Anda harus login dengan akun Administrator untuk membuka Dasbor Admin.')
    ).toBeVisible();

    // 2. Unauthorized Owner
    await page.goto('/login?error=unauthorized_owner');
    await expect(
      page.locator('text=Akses ditolak. Anda harus login dengan akun Pemilik Lapangan (Owner) untuk membuka Dasbor Pemilik.')
    ).toBeVisible();
  });

  test('4. Akses Cepat Preset Demo RBAC (Pemain, Marcus Owner, dan Admin)', async ({ page }) => {
    // A. Preset Pemain (User)
    await page.goto('/login');
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('button:has-text("Pemain (User)")').click();
    await page.waitForURL('**/');
    const tokenUser = await page.evaluate(() => localStorage.getItem('lapang_token'));
    expect(tokenUser).toBeTruthy();

    // B. Preset Marcus Silva (Owner)
    await page.goto('/login');
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('button:has-text("Marcus Silva (Owner)")').click();
    await page.waitForURL('**/owner');
    const tokenOwner = await page.evaluate(() => localStorage.getItem('lapang_token'));
    expect(tokenOwner).toBeTruthy();

    // C. Preset Admin
    await page.goto('/login');
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('button:has-text("Admin")').click();
    await page.waitForURL('**/admin');
    const tokenAdmin = await page.evaluate(() => localStorage.getItem('lapang_token'));
    expect(tokenAdmin).toBeTruthy();
  });

  test('5. Redireksi Otomatis ReturnUrl Setelah Login Berhasil', async ({ page }) => {
    await page.goto('/login?returnUrl=/admin');

    await page.locator('input[type="email"]').fill('admin@lapang.id');
    await page.locator('input[placeholder="Minimal 6 karakter"]').fill('Password123!');

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/admin');
    await expect(page.locator('h2:has-text("Ringkasan Platform")')).toBeVisible();
  });

  test('6. Validasi Formulir Pendaftaran Akun Baru (/register)', async ({ page }) => {
    await page.goto('/register');

    // Visual Branding & Header
    await expect(page.locator('text=Bergabung di')).toBeVisible();
    await expect(page.locator('text=Komunitas Olahraga.')).toBeVisible();
    await expect(page.locator('text=Buat Akun Baru')).toBeVisible();

    // Pilihan Peran: Pemain Olahraga vs Pengelola Venue
    const userRoleBtn = page.locator('button:has-text("Pemain Olahraga")');
    const ownerRoleBtn = page.locator('button:has-text("Pengelola Venue")');
    await expect(userRoleBtn).toBeVisible();
    await expect(ownerRoleBtn).toBeVisible();

    // Pilih Owner
    await ownerRoleBtn.click();
    await expect(ownerRoleBtn).toHaveClass(/bg-amber-50/);

    // Kembalikan ke Pemain
    await userRoleBtn.click();
    await expect(userRoleBtn).toHaveClass(/bg-brand-50/);

    // Validasi checkbox syarat & ketentuan
    const termsCheckbox = page.locator('#terms');
    await termsCheckbox.uncheck();

    await page.locator('input[placeholder*="Rian Pratama"]').fill('Test Player');
    await page.locator('input[type="email"]').fill('testplayer@lapang.id');
    await page.locator('input[placeholder="Minimal 6 karakter"]').fill('Password123!');

    let termsAlertMsg = '';
    page.once('dialog', (dialog) => {
      termsAlertMsg = dialog.message();
      dialog.accept();
    });

    await page.locator('button[type="submit"]').click();
    expect(termsAlertMsg).toContain('Harap setujui syarat dan ketentuan');
  });

  test('7. Pendaftaran Akun Baru Berhasil dan Dialihkan ke Beranda', async ({ page }) => {
    await page.goto('/register');

    const randomSuffix = Math.floor(Math.random() * 90000) + 10000;
    const newEmail = `pemain_${randomSuffix}@lapang.id`;
    const newName = `Bambang Pamungkas ${randomSuffix}`;

    await page.locator('input[placeholder*="Rian Pratama"]').fill(newName);
    await page.locator('input[type="email"]').fill(newEmail);
    await page.locator('input[placeholder="081234567890"]').fill('081234567890');
    await page.locator('input[placeholder="Minimal 6 karakter"]').fill('Password123!');

    const dialogPromise = page.waitForEvent('dialog');
    await page.locator('button[type="submit"]').click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Pendaftaran berhasil');
    await dialog.accept();

    await page.waitForURL('**/');
  });

  test('8. Navigasi Antara Login, Register dan Beranda Melalui Tombol Link dan Tutup', async ({ page }) => {
    // Dari Login ke Register
    await page.goto('/login');
    await page.locator('a:has-text("Daftar sekarang")').click();
    await expect(page).toHaveURL(/.*\/register/);

    // Dari Register ke Login
    await page.locator('a:has-text("Masuk ke akun")').click();
    await expect(page).toHaveURL(/.*\/login/);

    // Tombol Tutup (X) kembali ke Beranda (/)
    const closeBtn = page.locator('a[title="Kembali ke Beranda"]').first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page).toHaveURL(/.*:(3000|3002)?\/?$/);
  });
});
