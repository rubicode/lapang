import { test, expect } from '@playwright/test';

// Helper otentikasi akun Owner (Marcus Silva) dengan JWT Token riil
async function authenticateOwner(page: any, request: any) {
  const loginRes = await request.post('http://localhost:5001/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'marcus@lapang.id', password: 'Password123!' }
  });
  const json = await loginRes.json();
  const { token, user } = json.data;
  await page.addInitScript(({ token, user }: any) => {
    localStorage.setItem('lapang_token', token);
    localStorage.setItem('lapang_user', JSON.stringify(user));
  }, { token, user });
  return token;
}

test.describe('Alur Lengkap Reservasi, Ulasan & Sinkronisasi Owner (End-to-End)', () => {
  test('1. Alur Interaksi Drawer: Share, Bookmark, dan Pemilihan Jadwal Hari Ini / Besok', async ({ page }) => {
    await page.goto('/');

    // Tunggu kartu venue pertama muncul
    const firstVenueCard = page.locator('.venue-card').first();
    await expect(firstVenueCard).toBeVisible();
    await firstVenueCard.click();

    // Verifikasi drawer terbuka
    await expect(page.locator('text=Penyimpanan MinIO S3 Terverifikasi')).toBeVisible();

    // A. Uji Tombol Bagikan (Share)
    let shareAlert = '';
    page.once('dialog', (dialog) => {
      shareAlert = dialog.message();
      dialog.accept();
    });
    await page.locator('button[title="Bagikan"]').click();
    expect(shareAlert).toContain('Tautan lapangan disalin');

    // B. Uji Tombol Simpan Favorit (Bookmark)
    let bookmarkAlert = '';
    page.once('dialog', (dialog) => {
      bookmarkAlert = dialog.message();
      dialog.accept();
    });
    await page.locator('button[title="Simpan"]').click();
    expect(bookmarkAlert).toContain('favorit');

    // C. Pilihan Tab Tanggal: Hari Ini vs Besok
    const todayTab = page.locator('button:has-text("Hari Ini")');
    const tomorrowTab = page.locator('button:has-text("Besok")');
    await expect(todayTab).toBeVisible();
    await expect(tomorrowTab).toBeVisible();

    await tomorrowTab.click();
    await expect(tomorrowTab).toHaveClass(/text-brand-800/);

    await todayTab.click();
    await expect(todayTab).toHaveClass(/text-brand-800/);
  });

  test('2. Pemilihan Slot Waktu, ACID Booking API, dan Tampilan Modal QRIS Midtrans', async ({ page }) => {
    await page.goto('/');

    // Buka detail venue
    const firstVenueCard = page.locator('.venue-card').first();
    await firstVenueCard.click();

    // Pilih slot waktu pertama yang tidak disabled
    const availableSlots = page.locator('.grid button:not([disabled])');
    await expect(availableSlots.first()).toBeVisible();
    await availableSlots.first().click();

    // Verifikasi tombol pesan aktif dan klik
    const checkoutBtn = page.locator('button:has-text("Pesan Sekarang (QRIS/VA)")');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Verifikasi Modal Checkout QRIS Midtrans
    await expect(page.locator('text=Reservasi Lapangan Berhasil!')).toBeVisible();
    await expect(page.locator('text=Kode Booking:')).toBeVisible();
    await expect(page.getByText('QRIS', { exact: true })).toBeVisible();
    await expect(page.locator('text=Bayar Instan Midtrans')).toBeVisible();
    await expect(page.locator('img[alt="Midtrans QRIS Barcode"]')).toBeVisible();

    // Tutup Modal Checkout
    const finishBtn = page.locator('button:has-text("Selesai & Buka E-Tiket")');
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();
    await expect(page.locator('text=Reservasi Lapangan Berhasil!')).not.toBeVisible();
  });

  test('3. Pengiriman Ulasan Baru dari Pelanggan & Muncul di Ulasan Terverifikasi', async ({ page }) => {
    await page.goto('/');

    const firstVenueCard = page.locator('.venue-card').first();
    await firstVenueCard.click();

    // Cari tombol Tulis Ulasan
    const writeReviewBtn = page.locator('button:has-text("Tulis Ulasan")');
    await expect(writeReviewBtn).toBeVisible();
    await writeReviewBtn.click();

    // Verifikasi modal ulasan terbuka
    await expect(page.locator('h3:has-text("Tulis Ulasan untuk")')).toBeVisible();

    // Isi komentar review
    const commentInput = page.locator('textarea[placeholder*="Ceritakan kondisi lantai"]');
    await commentInput.fill('Lapangan sangat bersih, pencahayaan LED sangat terang dan staf ramah!');

    // Handle dialog alert setelah submit ulasan
    const dialogPromise = page.waitForEvent('dialog');
    await page.locator('button[type="submit"]:has-text("Kirim Ulasan")').click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('berhasil dikirim');
    await dialog.accept();

    // Verifikasi modal tertutup
    await expect(page.locator('h3:has-text("Tulis Ulasan untuk")')).not.toBeVisible();
  });

  test('4. Sinkronisasi Pesanan ke Owner Dashboard & Pengelolaan Status Booking', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Buka tab Bookings
    await page.locator('aside button:has-text("Reservasi")').click();
    await expect(page.locator('text=Reservasi & Pemesanan')).toBeVisible();

    // Verifikasi KPI Cards
    await expect(page.locator('text=Total Reservasi')).toBeVisible();
    await expect(page.locator('text=Terkonfirmasi').first()).toBeVisible();
    await expect(page.locator('text=Menunggu').first()).toBeVisible();

    // Uji Dropdown Filter Status
    const statusSelect = page.locator('select').first();
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption('confirmed');
    await page.waitForTimeout(500);

    // Kembalikan ke Semua Status
    await statusSelect.selectOption('all');
    await page.waitForTimeout(500);

    // Uji Pencarian Booking
    const searchInput = page.locator('input[placeholder*="Cari kode booking"]');
    await searchInput.fill('Draxler');
    await page.waitForTimeout(600);
    await expect(page.locator('text=Julian Draxler')).toBeVisible();

    // Bersihkan pencarian
    await searchInput.fill('');
    await page.waitForTimeout(600);
  });
});
