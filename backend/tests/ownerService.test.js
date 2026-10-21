import test from 'node:test';
import assert from 'node:assert/strict';
import { OwnerService } from '../services/ownerService.js';
import { User, Venue, Court, Booking } from '../models/index.js';
import { BOOKING_STATUS } from '../constants/index.js';

test('OwnerService Unit Tests', async (t) => {
  let marcusUser;
  let marcusVenue;

  await t.test('1. Menemukan akun Marcus Silva dan venue Pitch Gallery', async () => {
    marcusUser = await User.findOne({ where: { email: 'marcus@lapang.id' } });
    assert.ok(marcusUser, 'Akun Marcus Silva harus ada di database');
    assert.equal(marcusUser.name, 'Marcus Silva');

    marcusVenue = await Venue.findOne({ where: { owner_id: marcusUser.id } });
    assert.ok(marcusVenue, 'Venue milik Marcus Silva harus ada');
    assert.equal(marcusVenue.district, 'Downtown Sports District');
  });

  await t.test('2. getOwnerVenue menangani user tidak ada dan fallback peran admin', async () => {
    // Non-existent user
    await assert.rejects(
      async () => {
        await OwnerService.getOwnerVenue('00000000-0000-0000-0000-000000000000');
      },
      /User tidak ditemukan/
    );

    // Admin user fallback
    const adminUser = await User.findOne({ where: { email: 'admin@lapang.id' } });
    assert.ok(adminUser);
    const result = await OwnerService.getOwnerVenue(adminUser.id);
    assert.ok(result.venue);
  });

  await t.test('3. getOverview mengembalikan metrik yang sesuai dengan desain', async () => {
    const overview = await OwnerService.getOverview(marcusUser.id);
    assert.ok(overview, 'Overview harus mengembalikan objek');
    assert.equal(overview.owner.name, 'Marcus Silva');
    assert.equal(overview.stats.totalRevenue, 24580, 'Total revenue harus tepat 24580');
    assert.equal(overview.stats.activeBookings, 142, 'Active bookings harus tepat 142');
    assert.equal(overview.stats.uniqueVisitors, '3,842');
    assert.equal(overview.stats.avgRatingScore, '98%');
    assert.equal(overview.stats.avgRatingBadge, '4.9/5');
    assert.ok(overview.fields.length >= 3, 'Harus ada minimal 3 fields');
    assert.equal(overview.fields[0].name, 'Arena X Elite');
    assert.equal(overview.fields[1].name, 'The Forest Turf');
    assert.ok(overview.recentBookings.length >= 4, 'Harus ada minimal 4 recent bookings');
  });

  await t.test('4. toggleEarlyBirdPromo memperbarui status promosi di PostgreSQL', async () => {
    const res1 = await OwnerService.toggleEarlyBirdPromo(marcusUser.id, true);
    assert.equal(res1.earlyBirdPromoActive, true);

    const updatedVenue = await Venue.findByPk(marcusVenue.id);
    assert.equal(updatedVenue.early_bird_promo_active, true);

    const res2 = await OwnerService.toggleEarlyBirdPromo(marcusUser.id, false);
    assert.equal(res2.earlyBirdPromoActive, false);
  });

  await t.test('5. createCourt & updateCourt memanipulasi sub-lapangan di database', async () => {
    const newCourt = await OwnerService.createCourt(marcusUser.id, {
      name: 'Pitch Gallery Cage Court',
      match_format: '5-a-side',
      surface_spec: 'Outdoor Pro',
      price_hourly: 90
    });

    assert.ok(newCourt.id, 'Court baru harus memiliki ID');
    assert.equal(newCourt.name, 'Pitch Gallery Cage Court');
    assert.equal(newCourt.price_hourly, 90);

    // Update court
    const updated = await OwnerService.updateCourt(marcusUser.id, newCourt.id, {
      name: 'Pitch Gallery Cage Court VIP',
      price_hourly: 110
    });
    assert.equal(updated.name, 'Pitch Gallery Cage Court VIP');
    assert.equal(updated.price_hourly, 110);

    // Clean up
    await Court.destroy({ where: { id: newCourt.id } });
  });

  await t.test('6. updateCourt dengan courtId tidak valid melempar error', async () => {
    await assert.rejects(
      async () => {
        await OwnerService.updateCourt(marcusUser.id, '00000000-0000-0000-0000-000000000000', { name: 'Nonexistent' });
      },
      /Lapangan tidak ditemukan/
    );
  });

  await t.test('7. exportReport menghasilkan format CSV yang valid', async () => {
    const csv = await OwnerService.exportReport(marcusUser.id);
    assert.ok(typeof csv === 'string');
    assert.ok(csv.includes('PITCH GALLERY - OWNER MANAGEMENT REPORT'));
    assert.ok(csv.includes('Arena X Elite'));
    assert.ok(csv.includes('Julian Draxler'));
  });

  await t.test('8. getBookings dengan filter status, search, dan pagination', async () => {
    // 8a. All status pagination
    const allData = await OwnerService.getBookings(marcusUser.id, { page: 1, limit: 3 });
    assert.ok(allData.bookings.length <= 3);
    assert.ok(allData.summary.total > 0);

    // 8b. Filter confirmed
    const confirmedData = await OwnerService.getBookings(marcusUser.id, { status: 'confirmed' });
    confirmedData.bookings.forEach((b) => {
      assert.equal(b.bookingStatusRaw, 'confirmed');
    });

    // 8c. Search by customer name
    const searchData = await OwnerService.getBookings(marcusUser.id, { search: 'Julian' });
    searchData.bookings.forEach((b) => {
      assert.ok(b.customerName.includes('Julian') || b.bookingCode.includes('Julian'));
    });
  });

  await t.test('9. updateBookingStatus mengubah status dan melempar error jika bookingId salah', async () => {
    const bookingsData = await OwnerService.getBookings(marcusUser.id, { page: 1, limit: 1 });
    assert.ok(bookingsData.bookings.length > 0);

    const firstBooking = bookingsData.bookings[0];
    const prevStatus = firstBooking.bookingStatusRaw;

    const updated = await OwnerService.updateBookingStatus(marcusUser.id, firstBooking.id, BOOKING_STATUS.CONFIRMED);
    assert.equal(updated.booking_status, BOOKING_STATUS.CONFIRMED);

    // Kembalikan status
    await OwnerService.updateBookingStatus(marcusUser.id, firstBooking.id, prevStatus);

    // Error test
    await assert.rejects(
      async () => {
        await OwnerService.updateBookingStatus(marcusUser.id, '00000000-0000-0000-0000-000000000000', 'confirmed');
      },
      /Pemesanan tidak ditemukan/
    );
  });

  await t.test('10. getSchedules & toggleScheduleBlock berfungsi langsung ke PostgreSQL', async () => {
    const schedData = await OwnerService.getSchedules(marcusUser.id, { date: '2026-10-14' });
    assert.ok(schedData.slots.length > 0, 'Harus ada deretan slot waktu');
    assert.ok(schedData.courts.length > 0, 'Harus ada daftar court');

    const courtId = schedData.courts[0].id;

    // Filter by courtId
    const courtSched = await OwnerService.getSchedules(marcusUser.id, { courtId, date: '2026-10-14' });
    assert.ok(courtSched.selectedCourt);
    assert.equal(courtSched.selectedCourt.id, courtId);

    // Block slot 07:00
    const blocked = await OwnerService.toggleScheduleBlock(marcusUser.id, {
      courtId,
      date: '2026-10-14',
      timeSlot: '07:00',
      status: 'blocked'
    });
    assert.equal(blocked.status, 'blocked');

    // Unblock slot 07:00
    const unblocked = await OwnerService.toggleScheduleBlock(marcusUser.id, {
      courtId,
      date: '2026-10-14',
      timeSlot: '07:00',
      status: 'available'
    });
    assert.equal(unblocked.status, 'available');
  });

  await t.test('11. getRevenueData menghitung metrik finansial untuk berbagai periode (month, week, year)', async () => {
    // Month
    const monthData = await OwnerService.getRevenueData(marcusUser.id, { period: 'month' });
    assert.ok(monthData.grossRevenue > 0);
    assert.ok(monthData.netRevenue > 0);
    assert.ok(monthData.platformFee > 0);
    assert.ok(Array.isArray(monthData.courtBreakdown));
    assert.ok(Array.isArray(monthData.recentTransactions));

    // Week
    const weekData = await OwnerService.getRevenueData(marcusUser.id, { period: 'week' });
    assert.ok(weekData.grossRevenue > 0);
    assert.ok(Array.isArray(weekData.courtBreakdown));

    // Year
    const yearData = await OwnerService.getRevenueData(marcusUser.id, { period: 'year' });
    assert.ok(yearData.grossRevenue > 0);
    assert.ok(Array.isArray(yearData.courtBreakdown));
  });

  await t.test('12. getSettings & updateSettings memutakhirkan PostgreSQL', async () => {
    const currentSettings = await OwnerService.getSettings(marcusUser.id);
    assert.equal(currentSettings.owner.name, 'Marcus Silva');
    assert.equal(currentSettings.venue.name, 'Pitch Gallery Sports Complex');

    const updated = await OwnerService.updateSettings(marcusUser.id, {
      ownerPhone: '+62 811 9999 8888',
      openingHours: '07:00 - 23:00'
    });
    assert.equal(updated.owner.phone, '+62 811 9999 8888');
    assert.equal(updated.venue.openingHours, '07:00 - 23:00');

    // Kembalikan
    await OwnerService.updateSettings(marcusUser.id, {
      ownerPhone: currentSettings.owner.phone,
      openingHours: currentSettings.venue.openingHours
    });
  });
});

