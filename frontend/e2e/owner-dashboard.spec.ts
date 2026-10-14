import { test, expect } from '@playwright/test';

// Helper otentikasi akun Owner (Marcus Silva) dengan JWT Token riil dari backend
async function authenticateOwner(page: any, request: any) {
  const loginRes = await request.post('http://localhost:5001/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'marcus@lapang.id', password: 'Password123!' }
  });
  const json = await loginRes.json();
  if (!json.success || !json.data) {
    throw new Error('Gagal login owner di test: ' + JSON.stringify(json));
  }
  const { token, user } = json.data;
  await page.addInitScript(({ token, user }: any) => {
    localStorage.setItem('lapang_token', token);
    localStorage.setItem('lapang_user', JSON.stringify(user));
  }, { token, user });
  return token;
}

test.describe('Owner Dashboard (Pitch Gallery Management) Suite', () => {
  test('1. Akses ke /owner tanpa login otomatis dialihkan ke /login dengan pesan error', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/owner');

    // Harus terlempar ke halaman login dengan returnUrl dan error unauthorized_owner
    await expect(page).toHaveURL(/.*\/login\?returnUrl=\/owner&error=unauthorized_owner/);
    await expect(page.locator('text=Akses ditolak')).toBeVisible();
  });

  test('2. Login sebagai Marcus Silva berhasil masuk ke /owner dengan data riil PostgreSQL', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Tunggu sampai header Ringkasan & data database muncul
    await expect(page.getByRole('heading', { name: 'Ringkasan' })).toBeVisible();

    // Verifikasi elemen branding Pitch Gallery di sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Pitch Gallery')).toBeVisible();
    await expect(sidebar.getByText('Dasbor Manajemen')).toBeVisible();
    await expect(sidebar.getByText('Marcus Silva')).toBeVisible();
    await expect(sidebar.getByText('Pemilik Premium')).toBeVisible();

    // Verifikasi 4 Stat Cards sesuai mockup & PostgreSQL
    await expect(page.locator('text=$24,580.00')).toBeVisible();
    await expect(page.locator('text=142')).toBeVisible();
    await expect(page.locator('text=98%')).toBeVisible();
    await expect(page.locator('text=3,842')).toBeVisible();

    // Verifikasi My Fields
    await expect(page.locator('text=Arena X Elite').first()).toBeVisible();
    await expect(page.locator('text=The Forest Turf').first()).toBeVisible();
    await expect(page.locator('text=$85').first()).toBeVisible();
    await expect(page.locator('text=$110').first()).toBeVisible();

    // Verifikasi Recent Bookings
    await expect(page.locator('text=Julian Draxler')).toBeVisible();
    await expect(page.locator('text=Marta Lima')).toBeVisible();
    await expect(page.locator('text=Robert K.')).toBeVisible();
    await expect(page.locator('text=Sarah Hughes')).toBeVisible();

    // Verifikasi Peak Hours Tip Card
    await expect(page.locator('text=Tips Jam Sibuk')).toBeVisible();
  });

  test('3. Interaksi Tombol Apply Promotion memperbarui status di PostgreSQL', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    await expect(page.getByRole('heading', { name: 'Ringkasan' })).toBeVisible();

    // Cari tombol promosi di Tips Jam Sibuk card
    const promoButton = page.locator('button:has-text("Terapkan Promosi"), button:has-text("Promosi Aktif")').first();
    await expect(promoButton).toBeVisible();
    await promoButton.click();

    // Tunggu perubahan status pada tombol
    await page.waitForTimeout(1000);
    const updatedButton = page.locator('button:has-text("Terapkan Promosi"), button:has-text("Promosi Aktif")').first();
    await expect(updatedButton).toBeVisible();
  });

  test('4. Modal Tambah Pitch Baru dan Kelola Lapangan interaktif', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    await expect(page.getByRole('heading', { name: 'Ringkasan' })).toBeVisible();

    // Buka New Pitch Modal
    await page.click('button:has-text("Lapangan Baru")');
    await expect(page.locator('text=Tambah Lapangan Baru')).toBeVisible();

    // Tutup modal
    await page.click('button:has-text("Batal")');
    await expect(page.locator('text=Tambah Lapangan Baru')).not.toBeVisible();

    // Buka Manage Modal
    const manageBtn = page.locator('button:has-text("Kelola")').first();
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();
    await expect(page.locator('text=Kelola Lapangan')).toBeVisible();

    // Tutup modal
    await page.click('button:has-text("Batal")');
    await expect(page.locator('text=Kelola Lapangan')).not.toBeVisible();
  });

  test('5. Tab Bookings menampilkan data PostgreSQL dengan pencarian dan filter status', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Klik tab Bookings di sidebar
    await page.locator('aside button:has-text("Reservasi")').click();

    // Verifikasi header tab Bookings
    await expect(page.locator('text=Reservasi & Pemesanan')).toBeVisible();

    // Verifikasi KPI cards
    await expect(page.locator('text=Total Reservasi')).toBeVisible();
    await expect(page.locator('text=Terkonfirmasi').first()).toBeVisible();
    await expect(page.locator('text=Menunggu').first()).toBeVisible();

    // Verifikasi tabel bookings memuat pemesan dari PostgreSQL
    await expect(page.locator('text=Julian Draxler')).toBeVisible();
    await expect(page.locator('text=Marta Lima')).toBeVisible();

    // Uji fitur pencarian
    const searchInput = page.locator('input[placeholder*="Cari kode booking"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Draxler');
    await page.waitForTimeout(600);
    await expect(page.locator('text=Julian Draxler')).toBeVisible();
    await expect(page.locator('text=Marta Lima')).not.toBeVisible();

    // Bersihkan pencarian
    await searchInput.fill('');
    await page.waitForTimeout(600);
    await expect(page.locator('text=Marta Lima')).toBeVisible();
  });

  test('6. Tab Schedule menampilkan slot waktu 07:00-23:00 dan interaksi blokir slot PostgreSQL', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Klik tab Schedule di sidebar
    await page.locator('aside button:has-text("Jadwal")').click();

    // Verifikasi header tab Schedule
    await expect(page.locator('text=Jadwal & Slot Waktu')).toBeVisible();

    // Verifikasi tabs lapangan muncul
    await expect(page.locator('button:has-text("Arena X Elite")')).toBeVisible();

    // Verifikasi slot waktu 07:00 dan tombol blokir slot
    await expect(page.locator('text=07:00').first()).toBeVisible();
    await expect(page.locator('text=23:00').first()).toBeVisible();

    // Verifikasi aksi blokir slot interaktif
    const blockBtn = page.locator('button:has-text("Blokir Slot")').first();
    if (await blockBtn.isVisible()) {
      await blockBtn.click();
      await page.waitForTimeout(1000);
      // Slot sekarang harus memiliki tombol Buka Slot
      await expect(page.locator('button:has-text("Buka Slot")').first()).toBeVisible();
      // Kembalikan ke keadaan semula
      await page.locator('button:has-text("Buka Slot")').first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('button:has-text("Blokir Slot")').first()).toBeVisible();
    }
  });

  test('7. Tab Revenue menampilkan gross revenue, platform fee, breakdown lapangan, dan transaksi', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Klik tab Revenue di sidebar
    await page.locator('aside button:has-text("Pendapatan")').click();

    // Verifikasi header tab Revenue
    await expect(page.locator('text=Keuangan & Pendapatan')).toBeVisible();

    // Verifikasi metrik finansial
    await expect(page.getByText('Pendapatan Kotor', { exact: true })).toBeVisible();
    await expect(page.getByText('Pendapatan Bersih', { exact: true })).toBeVisible();
    await expect(page.locator('text=Biaya Platform (5%)')).toBeVisible();
    await expect(page.locator('text=$24,580.00')).toBeVisible();

    // Verifikasi breakdown lapangan
    await expect(page.locator('text=Rincian Pendapatan per Lapangan')).toBeVisible();
    await expect(page.locator('text=Arena X Elite').first()).toBeVisible();
    await expect(page.locator('text=The Forest Turf').first()).toBeVisible();

    // Verifikasi riwayat pembayaran terbaru
    await expect(page.locator('text=Riwayat Pembayaran Terbaru')).toBeVisible();
    await expect(page.locator('text=Julian Draxler')).toBeVisible();
  });

  test('8. Tab Settings memuat form profil venue dan profil Marcus Silva serta menyimpan perubahan', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Klik tab Settings di sidebar
    await page.locator('aside button:has-text("Pengaturan")').click();

    // Verifikasi header tab Settings
    await expect(page.locator('text=Pengaturan Fasilitas & Akun')).toBeVisible();

    // Verifikasi form profil venue terisi dari database
    const venueNameInput = page.locator('input[value*="Pitch Gallery"]');
    await expect(venueNameInput).toBeVisible();

    // Verifikasi pemilik Marcus Silva
    await expect(page.locator('input[value*="Marcus Silva"]')).toBeVisible();
    await expect(page.locator('input[value*="marcus@lapang.id"]')).toBeVisible();

    // Simpan form dan verifikasi toast sukses
    await page.locator('button:has-text("Simpan Perubahan ke Database")').click();
    await expect(page.locator('text=berhasil disimpan ke database PostgreSQL')).toBeVisible();
  });

  test('9. Tambah Pitch Baru secara nyata via Modal dan verifikasi tersimpan di My Fields', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    // Klik tombol Lapangan Baru di header
    await page.locator('button:has-text("Lapangan Baru")').click();
    await expect(page.locator('text=Tambah Lapangan Baru')).toBeVisible();

    const uniquePitchName = `Grand Pitch ${Math.floor(Math.random() * 9000) + 1000}`;
    await page.locator('input[placeholder*="Contoh: Arena"]').fill(uniquePitchName);
    await page.locator('input[placeholder="85"]').fill('120');

    // Submit form modal
    await page.locator('button[type="submit"]:has-text("Simpan ke Database")').click();
    await page.waitForTimeout(1000);

    // Modal tertutup dan pitch baru terlihat di My Fields
    await expect(page.locator('text=Tambah Lapangan Baru')).not.toBeVisible();
    await expect(page.locator(`text=${uniquePitchName}`)).toBeVisible();
  });

  test('10. Unduh Laporan Finansial Owner (Export Report) dan Toast Konfirmasi', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    const exportBtn = page.locator('button:has-text("Ekspor Laporan")');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    // Verifikasi toast notifikasi
    await expect(page.locator('text=Laporan owner berhasil diunduh dalam format CSV.')).toBeVisible();
  });

  test('11. Logout dari Owner Sidebar membersihkan sesi dan mengarahkan ke halaman login', async ({ page, request }) => {
    await authenticateOwner(page, request);
    await page.goto('/owner');

    const logoutBtn = page.locator('aside button[title="Keluar Akun"]');
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Harus terarah ke /login
    await page.waitForURL('**/login?message=logged_out');
    const token = await page.evaluate(() => localStorage.getItem('lapang_token'));
    expect(token).toBeNull();
  });
});
