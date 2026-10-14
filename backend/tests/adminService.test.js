import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../services/adminService.js';
import { Venue, User } from '../models/index.js';

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

    // Cek active fields telemetry & current admin
    assert.ok(overview.activeFields.length > 0);
    assert.ok(overview.currentAdmin.email);
  });

  await t.test('[BERHASIL] Memperbarui status verifikasi pengelola venue dengan issue note', async () => {
    const overview = await AdminService.getOverview();
    const marco = overview.verificationQueue.find((a) => a.facilityName === 'Arena Lisbon Pro');
    assert.ok(marco);

    const updated = await AdminService.updateVerificationStatus(marco.id, {
      status: 'Action Required',
      issueNote: 'Dokumen izin keselamatan belum diperbarui untuk tahun 2026.'
    });
    assert.equal(updated.status, 'Action Required');
    assert.equal(updated.issueNote, 'Dokumen izin keselamatan belum diperbarui untuk tahun 2026.');

    // Kembalikan ke Pending Review
    await AdminService.updateVerificationStatus(marco.id, {
      status: 'Pending Review',
      issueNote: null
    });
  });

  await t.test('[GAGAL] updateStatus dengan venue ID yang tidak ada melempar error', async () => {
    await assert.rejects(
      async () => {
        await AdminService.updateStatus('00000000-0000-0000-0000-000000000000', 'Verified');
      },
      /tidak ditemukan di database/
    );
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

  await t.test('[BERHASIL] inviteOwner dengan email pemilik yang sudah ada tidak membuat akun ganda', async () => {
    const invitedAgain = await AdminService.inviteOwner({
      name: 'Carlos Mendez',
      email: 'carlos@mendezsports.es',
      facilityName: 'Madrid Tennis Academy',
      sportType: 'Tennis',
      location: 'Madrid, Spain',
      courtsCount: 2
    });
    assert.equal(invitedAgain.user.email, 'carlos@mendezsports.es');
    assert.equal(invitedAgain.facilityName, 'Madrid Tennis Academy');

    // Clean up venue baru
    await Venue.destroy({ where: { id: invitedAgain.id } });
  });

  await t.test('[GAGAL] inviteOwner tanpa nama pemilik melempar error validasi', async () => {
    await assert.rejects(
      async () => {
        await AdminService.inviteOwner({
          name: '',
          email: 'valid@email.com',
          facilityName: 'Some Club'
        });
      },
      /Nama pemilik, email, dan nama fasilitas wajib diisi/
    );
  });

  await t.test('[GAGAL] inviteOwner tanpa email melempar error validasi', async () => {
    await assert.rejects(
      async () => {
        await AdminService.inviteOwner({
          name: 'Owner Valid',
          email: '',
          facilityName: 'Some Club'
        });
      },
      /Nama pemilik, email, dan nama fasilitas wajib diisi/
    );
  });

  await t.test('[GAGAL] inviteOwner tanpa nama fasilitas melempar error validasi', async () => {
    await assert.rejects(
      async () => {
        await AdminService.inviteOwner({
          name: 'Owner Valid',
          email: 'valid@email.com',
          facilityName: ''
        });
      },
      /Nama pemilik, email, dan nama fasilitas wajib diisi/
    );
  });

  await t.test('[BERHASIL] Ekspor data antrean ke format CSV', async () => {
    const csv = await AdminService.generateCsv();
    assert.ok(csv.includes('Owner Name'));
    assert.ok(csv.includes('Arena Lisbon Pro'));
    assert.ok(csv.includes('Jenkins Multisport'));
  });
});

