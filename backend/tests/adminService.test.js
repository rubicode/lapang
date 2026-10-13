import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../services/adminService.js';

test('AdminService & Dashboard Integration Tests', async (t) => {
  await t.test('[BERHASIL] Mengambil overview platform dengan statistik dan antrean verifikasi', async () => {
    const overview = await AdminService.getOverview();
    assert.ok(overview.stats);
    assert.ok(overview.stats.totalUsers >= 14280);
    assert.equal(overview.stats.totalUsersGrowth, '+12%');
    assert.ok(overview.stats.monthlyRevenue >= 40000);
    assert.ok(overview.stats.monthlyRevenueFormatted.startsWith('$'));
    assert.ok(Array.isArray(overview.verificationQueue));
    assert.ok(overview.verificationQueue.length >= 4);

    const marco = overview.verificationQueue.find((a) => a.facilityName === 'Arena Lisbon Pro');
    assert.ok(marco);
    assert.equal(marco.facilityName, 'Arena Lisbon Pro');
    assert.equal(marco.status, 'Pending Review');

    const sarah = overview.verificationQueue.find((a) => a.facilityName === 'Jenkins Multisport');
    assert.ok(sarah);
    assert.equal(sarah.facilityName, 'Jenkins Multisport');
    assert.equal(sarah.status, 'Verified');

    const robert = overview.verificationQueue.find((a) => a.facilityName === 'Kyoto Soccer Park');
    assert.ok(robert);
    assert.equal(robert.facilityName, 'Kyoto Soccer Park');
    assert.equal(robert.status, 'Action Required');

    const david = overview.verificationQueue.find((a) => a.facilityName === 'Victory Stadium Shanghai');
    assert.ok(david);
    assert.equal(david.facilityName, 'Victory Stadium Shanghai');
    assert.equal(david.status, 'Verified');
  });

  await t.test('[BERHASIL] Memperbarui status verifikasi pengelola venue', async () => {
    const overview = await AdminService.getOverview();
    const marco = overview.verificationQueue.find((a) => a.facilityName === 'Arena Lisbon Pro');
    assert.ok(marco);

    const updated = await AdminService.updateVerificationStatus(marco.id, {
      status: 'Verified'
    });
    assert.equal(updated.status, 'Verified');

    // Kembalikan ke Pending Review
    await AdminService.updateVerificationStatus(marco.id, {
      status: 'Pending Review'
    });
  });

  await t.test('[BERHASIL] Mengundang pemilik fasilitas baru via inviteOwner', async () => {
    const invited = await AdminService.inviteOwner({
      name: 'Carlos Mendez',
      email: 'carlos@mendezsports.es',
      facilityName: 'Madrid Padel Club',
      sportType: 'Padel Tennis',
      location: 'Madrid, Spain',
      courtsCount: 4
    });
    assert.equal(invited.user.name, 'Carlos Mendez');
    assert.equal(invited.status, 'Pending Review');
  });

  await t.test('[BERHASIL] Ekspor data antrean ke format CSV', async () => {
    const csv = await AdminService.generateCsv();
    assert.ok(csv.includes('Owner Name'));
    assert.ok(csv.includes('Arena Lisbon Pro'));
    assert.ok(csv.includes('Jenkins Multisport'));
  });
});
