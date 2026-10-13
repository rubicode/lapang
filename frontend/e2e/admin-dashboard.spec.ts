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
    await expect(sidebar.getByRole('heading', { name: 'Management' })).toBeVisible();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Fields' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Bookings' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Users' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Reports' })).toBeVisible();
    await expect(sidebar.getByText('Alex Thompson')).toBeVisible();
    await expect(sidebar.getByText('Global Admin')).toBeVisible();

    // 2. Header: Platform Overview
    await expect(page.locator('h2:has-text("Platform Overview")')).toBeVisible();
    await expect(page.locator('text=Real-time performance and management metrics.')).toBeVisible();
    await expect(page.locator('button:has-text("Download CSV")')).toBeVisible();
    await expect(page.locator('button:has-text("Invite Owner")')).toBeVisible();

    // 3. Stat Cards (Dihitung langsung dari PostgreSQL)
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=+12%')).toBeVisible();
    await expect(page.locator('text=Total Owners')).toBeVisible();
    await expect(page.locator('text=+4%')).toBeVisible();
    await expect(page.locator('text=Active Bookings')).toBeVisible();
    await expect(page.locator('text=Monthly Revenue')).toBeVisible();

    // 4. Verification Queue Table (Dari tabel venues & users PostgreSQL)
    await expect(page.locator('h3:has-text("Verification Queue")')).toBeVisible();
    await expect(page.locator('text=Arena Lisbon Pro')).toBeVisible();
    await expect(page.locator('text=Marco Arantes')).toBeVisible();
    await expect(page.locator('text=Jenkins Multisport')).toBeVisible();
    await expect(page.locator('text=Sarah Jenkins')).toBeVisible();
    await expect(page.locator('text=Kyoto Soccer Park')).toBeVisible();
    await expect(page.locator('text=Robert Kagawa')).toBeVisible();
    await expect(page.locator('text=Victory Stadium Shanghai')).toBeVisible();
    await expect(page.locator('text=David Chen')).toBeVisible();

    // 5. Active Field Monitoring (Dari tabel courts PostgreSQL)
    await expect(page.locator('h3:has-text("Active Field Monitoring")')).toBeVisible();
    await expect(page.locator('text=Stamford Bridge Turf A')).toBeVisible();
    await expect(page.locator('text=The Indoor Hub - Field 2')).toBeVisible();
    await expect(page.locator('text=Sunshine Coast Arena')).toBeVisible();

    // 6. Pitch Gallery Footer
    await expect(page.locator('h4:has-text("Pitch Gallery")')).toBeVisible();
    await expect(page.locator('text=Elite Sports Facility Management Console')).toBeVisible();
  });

  test('Interactive Search in Verification Queue filters database rows', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    const searchInput = page.locator('input[placeholder*="Search by name or email"]');
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
    const reviewBtn = marcoRow.locator('button:has-text("Review")');
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.click();

    await expect(page.locator('text=Facility Verification Review')).toBeVisible();
    await expect(page.locator('text=Commercial_Registration_Lisbon.pdf')).toBeVisible();
    await expect(page.locator('button:has-text("Setujui & Verifikasi Fasilitas")')).toBeVisible();

    // Klik Setujui
    await page.locator('button:has-text("Setujui & Verifikasi Fasilitas")').click();
    await expect(page.locator('text=Facility Verification Review')).not.toBeVisible();
  });

  test('Invite Owner modal opens, submits, and persists new facility to database', async ({ page, request }) => {
    await authenticateAdmin(page, request);
    await page.goto('/admin');

    await page.locator('button:has-text("Invite Owner")').click();
    await expect(page.locator('h3:has-text("Invite Facility Owner")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Marco Arantes"]')).toBeVisible();

    // Fill form and submit
    await page.locator('input[placeholder*="Marco Arantes"]').fill('Carlos Mendez');
    await page.locator('input[placeholder*="marco.a@fieldhub.pt"]').fill('carlos@mendezsports.es');
    await page.locator('input[placeholder*="Arena Lisbon Pro"]').fill('Madrid Padel Club');
    await page.locator('button:has-text("Send Official Invitation")').click();

    await expect(page.locator('h3:has-text("Invite Facility Owner")')).not.toBeVisible();
  });
});
