import { test, expect } from '@playwright/test';

test.describe('Platform Lapang.id - End-to-End (E2E) Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Tunggu sampai elemen aplikasi utama termuat
    await expect(page.locator('text=Lapang.id')).toBeVisible();
  });

  test('1. Verifikasi Top App Bar, Logo Nasional & Quick Search', async ({ page }) => {
    // Brand header
    await expect(page.locator('text=Lapang.id')).toBeVisible();
    await expect(page.locator('text=Nasional')).toBeVisible();
    await expect(page.locator('text=Peta & Booking Lapangan Olahraga Seluruh Indonesia')).toBeVisible();

    // Tombol Dekat Saya
    await expect(page.locator('button:has-text("Dekat Saya")')).toBeVisible();

    // User profile status
    await expect(page.locator('text=Rian Pratama')).toBeVisible();
    await expect(page.locator('text=Verified Player')).toBeVisible();

    // Quick search input
    const searchInput = page.locator('input[placeholder*="Cari lapangan"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Emerald');
    await expect(page.locator('text=The Emerald Arena Jakarta')).toBeVisible();
  });

  test('2. Filter Cabang Olahraga & Dropdown Kota', async ({ page }) => {
    // Ubah dropdown kota ke "all" (Seluruh Indonesia)
    const citySelect = page.locator('select').first();
    await citySelect.selectOption('all');

    // Klik filter Badminton
    const badmintonBtn = page.locator('button:has-text("Badminton")');
    await badmintonBtn.click();
    await expect(page.locator('text=GOR Badminton Bintang Dago')).toBeVisible();

    // Ganti ke Futsal
    const futsalBtn = page.locator('button:has-text("Futsal & Mini Soccer")');
    await futsalBtn.click();
    await expect(page.locator('text=The Emerald Arena Jakarta')).toBeVisible();
  });

  test('3. Buka Detail Drawer Venue, Galeri MinIO & Ulasan', async ({ page }) => {
    // Klik kartu venue pertama
    const venueCard = page.locator('.venue-card').first();
    await expect(venueCard).toBeVisible();
    await venueCard.click();

    // Pastikan Drawer terbuka
    await expect(page.locator('text=Verified MinIO S3 Storage')).toBeVisible();
    await expect(page.locator('text=Tentang Venue & Lapangan')).toBeVisible();
    await expect(page.locator('text=Fasilitas Penunjang')).toBeVisible();
    await expect(page.locator('text=Jam Operasional')).toBeVisible();
    await expect(page.locator('text=Jenis Lantai')).toBeVisible();

    // Ulasan & Rating Breakdown
    await expect(page.getByText('Ulasan Pemain Terverifikasi', { exact: true })).toBeVisible();
    await expect(page.locator('text=Kualitas Lantai')).toBeVisible();
    await expect(page.locator('text=Penerangan Lampu')).toBeVisible();
    await expect(page.locator('text=Kebersihan & Toilet')).toBeVisible();
    await expect(page.locator('text=Pelayanan Staf')).toBeVisible();
    await expect(page.locator('text=Verified Booker').first()).toBeVisible();
  });

  test('4. Alur Pemilihan Slot Jam & Checkout Midtrans QRIS', async ({ page }) => {
    // Buka detail drawer
    const venueCard = page.locator('.venue-card').first();
    await venueCard.click();

    // Pilih slot waktu dari grid yang tersedia
    const slotBtns = page.locator('.grid button:not([disabled])');
    if (await slotBtns.count() > 0) {
      await slotBtns.first().click();
    }

    // Klik tombol Pesan Sekarang
    const checkoutBtn = page.locator('button:has-text("Pesan Sekarang (QRIS/VA)")');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Verifikasi Checkout Modal
    await expect(page.locator('text=Reservasi Lapangan Berhasil!')).toBeVisible();
    await expect(page.locator('text=Kode Booking:')).toBeVisible();
    await expect(page.getByText('QRIS', { exact: true })).toBeVisible();
    await expect(page.locator('img[alt="Midtrans QRIS Barcode"]')).toBeVisible();

    // Tutup dan konfirmasi E-Tiket
    const closeBtn = page.locator('button:has-text("Selesai & Buka E-Tiket")');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
  });

  test('5. Modal Filter Spesifikasi Lapangan', async ({ page }) => {
    // Buka modal spesifikasi
    const filterBtn = page.locator('button:has-text("Filter Spesifikasi")');
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // Periksa opsi filter
    await expect(page.locator('text=Filter Spesifikasi Lapangan')).toBeVisible();
    await expect(page.locator('text=Tipe Ruangan')).toBeVisible();
    await expect(page.locator('text=Indoor (AC)')).toBeVisible();
    await expect(page.locator('text=Jenis Permukaan Lantai')).toBeVisible();
    await expect(page.locator('text=Rumput Sintetis (FIFA)')).toBeVisible();
    await expect(page.locator('text=Fasilitas Wajib')).toBeVisible();

    // Terapkan filter
    const applyBtn = page.locator('button:has-text("Terapkan Filter")');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
  });

  test('6. Verifikasi UI Modal Login & Register Sesuai Desain Mockup', async ({ page }) => {
    // Klik profil atau tombol akun untuk membuka modal auth
    const profileBtn = page.locator('text=Rian Pratama');
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    // Verifikasi elemen visual mockup sisi kiri (The Pitch is Waiting)
    await expect(page.locator('text=Lapangan Siap')).toBeVisible();
    await expect(page.locator('text=Menunggumu.')).toBeVisible();

    // Verifikasi elemen formulir login sisi kanan
    await expect(page.locator('text=Selamat Datang')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Ingat saya selama 30 hari')).toBeVisible();
    await expect(page.locator('button:has-text("Masuk Sekarang")')).toBeVisible();
    await expect(page.locator('text=Atau Lanjutkan Dengan')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("Facebook")')).toBeVisible();

    // Beralih ke Register
    const switchRegisterBtn = page.locator('button:has-text("Daftar sekarang")');
    await expect(switchRegisterBtn).toBeVisible();
    await switchRegisterBtn.click();

    // Verifikasi form register
    await expect(page.locator('text=Buat Akun Baru')).toBeVisible();
    await expect(page.locator('input[placeholder*="Rian Pratama"]')).toBeVisible();
    await expect(page.locator('button:has-text("Pemain Olahraga")')).toBeVisible();
    await expect(page.locator('button:has-text("Pengelola Venue")')).toBeVisible();
    await expect(page.locator('button:has-text("Daftar Sekarang")')).toBeVisible();
  });
});

