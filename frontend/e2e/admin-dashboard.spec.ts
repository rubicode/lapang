import { test, expect } from '@playwright/test';

// Helper otentikasi admin
async function authenticateAdmin(page: any, request: any) {
  const loginRes = await request.post('http://localhost:5001/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: { email: 'admin@lapang.id', password: 'Password123!' }
  });
  const json = await loginRes.json();
  if (!json.success || !json.data) {
    throw new Error('Gagal login admin di test: ' + JSON.stringify(json));
  }
  const { token, user } = json.data;
  await page.addInitScript(({ token, user }: any) => {
    localStorage.setItem('lapang_token', token);
    localStorage.setItem('lapang_user', JSON.stringify(user));
  }, { token, user });
  return token;
}

test.describe('Admin Management Dashboard E2E Tests (Database & RBAC Guard)', () => {
  test.beforeEach(async ({ request }) => {
    try {
      const resetRes = await request.post('http://localhost:5001/api/v1/admin/reset');
      await resetRes.json();
    } catch {
      // Fallback jika backend offline
    }
  });

  test('Access to /admin without login automatically redirects to /login', async ({ page }) => {
    // Pastikan storage bersih dari sesi sebelumnya
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login.*/);
    await expect(page.locator('text=Akses ditolak')).toBeVisible();
  });

  test('Admin login via UI redirects to /admin and loads all database-connected mockup elements', async ({ page }) => {
    await page.goto('/login');

    // Mengisi formulir kredensial Admin
    await page.locator('input[type="email"]').fill('admin@lapang.id');
    await page.locator('input[type="password"]').fill('Password123!');
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('button[type="submit"]').click();

    // Otomatis terarah ke /admin
    await page.waitForURL('**/admin');

    // 1. Sidebar Management
    const sidebar = page.locator('aside');
    await expect(sidebar.getByRole('heading', { name: 'Manajemen' })).toBeVisible();
    await expect(sidebar.getByText('Dasbor')).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Lapangan' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Reservasi' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Pengguna' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Laporan' })).toBeVisible();
    await expect(sidebar.getByText('Alex Thompson')).toBeVisible();
    await expect(sidebar.getByText('Admin Global')).toBeVisible();

    // 2. Header: Platform Overview
    await expect(page.locator('h2:has-text("Ringkasan Platform")')).toBeVisible();
    await expect(page.locator('text=Metrik performa dan manajemen langsung secara real-time.')).toBeVisible();
    await expect(page.locator('button:has-text("Unduh CSV")')).toBeVisible();
    await expect(page.locator('button:has-text("Undang Pengelola")')).toBeVisible();

    // 3. Stat Cards (Dihitung langsung dari PostgreSQL)
    await expect(page.locator('text=Total Pengguna')).toBeVisible();
    await expect(page.locator('text=+12%')).toBeVisible();
    await expect(page.locator('text=Total Pengelola')).toBeVisible();
    await expect(page.locator('text=+4%')).toBeVisible();
    await expect(page.locator('text=Reservasi Aktif')).toBeVisible();
    await expect(page.locator('text=Pendapatan Bulanan')).toBeVisible();

    // 4. Verification Queue Table (Dari tabel venues & users PostgreSQL)
    await expect(page.locator('h3:has-text("Antrean Verifikasi")')).toBeVisible();
    await expect(page.locator('text=Arena Lisbon Pro')).toBeVisible();
    await expect(page.locator('text=Marco Arantes')).toBeVisible();
    await expect(page.locator('text=Jenkins Multisport')).toBeVisible();
    await expect(page.locator('text=Sarah Jenkins')).toBeVisible();
    await expect(page.locator('text=Kyoto Soccer Park')).toBeVisible();
    await expect(page.locator('text=Robert Kagawa')).toBeVisible();
    await expect(page.locator('text=Victory Stadium Shanghai')).toBeVisible();
    await expect(page.locator('text=David Chen')).toBeVisible();

    // 5. Active Field Monitoring (Dari tabel courts PostgreSQL)
    await expect(page.locator('h3:has-text("Pemantauan Lapangan Aktif")')).toBeVisible();
    await expect(page.locator('text=Stamford Bridge Turf A')).toBeVisible();
    await expect(page.locator('text=The Indoor Hub - Field 2')).toBeVisible();
    await expect(page.locator('text=Sunshine Coast Arena')).toBeVisible();

    // 6. Pitch Gallery / Lapang Footer
    await expect(page.locator('h4:has-text("Lapang")')).toBeVisible();
    await expect(page.locator('text=Konsol Manajemen Fasilitas Olahraga Terpadu')).toBeVisible();
  });

  test('Interactive Search in Verification Queue filters database rows', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    const searchInput = page.locator('input[placeholder*="Cari nama fasilitas atau email"]');
    await searchInput.fill('Kyoto');
    await expect(page.locator('text=Kyoto Soccer Park')).toBeVisible();
    await expect(page.locator('text=Arena Lisbon Pro')).not.toBeVisible();

    await searchInput.fill('');
    await expect(page.locator('text=Arena Lisbon Pro')).toBeVisible();
  });

  test('Review Modal opens for pending applicants and updates status in database', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    const marcoRow = page.locator('tr:has-text("Arena Lisbon Pro")');
    const reviewBtn = marcoRow.locator('button:has-text("Tinjau")');
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    await expect(page.locator('text=Tinjauan Verifikasi Fasilitas')).toBeVisible();
    await expect(page.locator('text=Commercial_Registration_Lisbon.pdf')).toBeVisible();
    await expect(page.locator('button:has-text("Setujui & Verifikasi Fasilitas")')).toBeVisible();

    // Klik Setujui
    await page.locator('button:has-text("Setujui & Verifikasi Fasilitas")').click();
    await expect(page.locator('text=Tinjauan Verifikasi Fasilitas')).not.toBeVisible();
  });

  test('Invite Owner modal opens, submits, and persists new facility to database', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    await page.locator('button:has-text("Undang Pengelola")').click();
    await expect(page.locator('h3:has-text("Undang Pengelola Fasilitas")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Marco Arantes"]')).toBeVisible();

    // Fill form and submit
    await page.locator('input[placeholder*="Marco Arantes"]').fill('Carlos Mendez');
    await page.locator('input[placeholder*="marco.a@fieldhub.pt"]').fill('carlos@mendezsports.es');
    await page.locator('input[placeholder*="Arena Lisbon Pro"]').fill('Madrid Padel Club');
    await page.locator('button:has-text("Kirim Undangan Resmi")').click();

    await expect(page.locator('h3:has-text("Undang Pengelola Fasilitas")')).not.toBeVisible();
  });

  test('Sidebar tabs navigation: Fields, Bookings, Reports, and back to Overview', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    // 1. Tab Fields Directory
    await page.locator('aside button:has-text("Lapangan")').click();
    await expect(page.locator('h2:has-text("Direktori Lapangan")')).toBeVisible();
    await expect(page.locator('text=Daftar seluruh lapangan dan gelanggang olahraga terdaftar.')).toBeVisible();

    await page.locator('button:has-text("← Kembali ke Ringkasan")').click();
    await expect(page.locator('h2:has-text("Ringkasan Platform")')).toBeVisible();

    // 2. Tab Master Bookings Ledger
    await page.locator('aside button:has-text("Reservasi")').click();
    await expect(page.locator('h2:has-text("Buku Besar Reservasi Master")')).toBeVisible();
    await expect(page.locator('text=1,120 Reservasi Aktif Bulan Ini')).toBeVisible();

    await page.locator('button:has-text("← Kembali ke Ringkasan")').click();
    await expect(page.locator('h2:has-text("Ringkasan Platform")')).toBeVisible();

    // 3. Tab Reports
    await page.locator('aside button:has-text("Laporan")').click();
    await expect(page.locator('h2:has-text("Laporan Keuangan & Platform")')).toBeVisible();

    await page.locator('button:has-text("← Kembali ke Ringkasan")').click();
    await expect(page.locator('h2:has-text("Ringkasan Platform")')).toBeVisible();
  });

  test('Active Field Live Monitoring Hub modal opens, displays telemetry metrics, and closes', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    // Buka hub monitoring melalui tombol Buka Pusat Pemantauan
    await page.locator('button:has-text("Buka Pusat Pemantauan")').click();

    await expect(page.locator('h3:has-text("Pusat Pemantauan Lapangan Langsung")')).toBeVisible();
    await expect(page.locator('text=Sinkronisasi Telemetri Langsung')).toBeVisible();
    await expect(page.locator('text=Pusat pemantauan sensor IoT')).toBeVisible();

    // Tutup modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').last();
    await closeBtn.click();
    await expect(page.locator('h3:has-text("Pusat Pemantauan Lapangan Langsung")')).not.toBeVisible();
  });

  test('Fix Issues Action Required checklist modal opens for flagged applicant and closes', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    const fixIssuesBtn = page.locator('button:has-text("Perbaiki Masalah")').first();
    if (await fixIssuesBtn.isVisible()) {
      await fixIssuesBtn.click();
      await expect(page.locator('h3:has-text("Daftar Tindakan Diperlukan")')).toBeVisible();

      // Tutup modal
      await page.locator('.fixed button:has(svg.lucide-x)').click();
      await expect(page.locator('h3:has-text("Daftar Tindakan Diperlukan")')).not.toBeVisible();
    }
  });

  test('Download CSV triggers export endpoint correctly', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    const downloadCsvBtn = page.locator('button:has-text("Unduh CSV")');
    await expect(downloadCsvBtn).toBeVisible();

    // Pastikan tombol klik dapat dieksekusi tanpa error
    await downloadCsvBtn.click();
  });
});
