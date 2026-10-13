import test from 'node:test';
import assert from 'node:assert/strict';
import { OwnerService } from '../services/ownerService.js';
import { User, Venue, Court, Booking } from '../models/index.js';

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

  await t.test('2. getOverview mengembalikan metrik yang sesuai dengan desain', async () => {
    const overview = await OwnerService.getOverview(marcusUser.id);
    assert.ok(overview, 'Overview harus mengembalikan objek');
    assert.equal(overview.owner.name, 'Marcus Silva');
    assert.equal(overview.stats.totalRevenue, 24580, 'Total revenue harus tepat 24580');
    assert.equal(overview.stats.activeBookings, 142, 'Active bookings harus tepat 142');
    assert.equal(overview.stats.uniqueVisitors, '3,842');
    assert.equal(overview.stats.avgRatingScore, '98%');
    assert.equal(overview.stats.avgRatingBadge, '4.9/5');
    assert.equal(overview.fields.length, 3, 'Harus ada 3 fields');
    assert.equal(overview.fields[0].name, 'Arena X Elite');
    assert.equal(overview.fields[1].name, 'The Forest Turf');
    assert.ok(overview.recentBookings.length >= 4, 'Harus ada minimal 4 recent bookings');
  });

  await t.test('3. toggleEarlyBirdPromo memperbarui status promosi di PostgreSQL', async () => {
    const res1 = await OwnerService.toggleEarlyBirdPromo(marcusUser.id, true);
    assert.equal(res1.earlyBirdPromoActive, true);

    const updatedVenue = await Venue.findByPk(marcusVenue.id);
    assert.equal(updatedVenue.early_bird_promo_active, true);

    const res2 = await OwnerService.toggleEarlyBirdPromo(marcusUser.id, false);
    assert.equal(res2.earlyBirdPromoActive, false);
  });

  await t.test('4. createCourt menambahkan lapangan baru di database', async () => {
    const newCourt = await OwnerService.createCourt(marcusUser.id, {
      name: 'Pitch Gallery Cage Court',
      match_format: '5-a-side',
      surface_spec: 'Outdoor Pro',
      price_hourly: 90
    });

    assert.ok(newCourt.id, 'Court baru harus memiliki ID');
    assert.equal(newCourt.name, 'Pitch Gallery Cage Court');
    assert.equal(newCourt.price_hourly, 90);

    // Clean up
    await Court.destroy({ where: { id: newCourt.id } });
  });

  await t.test('5. exportReport menghasilkan format CSV yang valid', async () => {
    const csv = await OwnerService.exportReport(marcusUser.id);
    assert.ok(typeof csv === 'string');
    assert.ok(csv.includes('PITCH GALLERY - OWNER MANAGEMENT REPORT'));
    assert.ok(csv.includes('Arena X Elite'));
    assert.ok(csv.includes('Julian Draxler'));
  });

  await t.test('6. getBookings & updateBookingStatus berfungsi dengan database', async () => {
    const bookingsData = await OwnerService.getBookings(marcusUser.id, { page: 1, limit: 10 });
    assert.ok(bookingsData.bookings.length > 0, 'Harus ada data booking');
    assert.ok(bookingsData.summary.total > 0, 'Summary total harus > 0');
    assert.ok(bookingsData.summary.confirmed > 0, 'Summary confirmed harus > 0');

    // Test update booking status
    const firstBooking = bookingsData.bookings[0];
    const prevStatus = firstBooking.bookingStatusRaw;
    const updated = await OwnerService.updateBookingStatus(marcusUser.id, firstBooking.id, 'confirmed');
    assert.equal(updated.booking_status, 'confirmed');

    // Kembalikan status
    await OwnerService.updateBookingStatus(marcusUser.id, firstBooking.id, prevStatus);
  });

  await t.test('7. getSchedules & toggleScheduleBlock berfungsi langsung ke PostgreSQL', async () => {
    const schedData = await OwnerService.getSchedules(marcusUser.id, { date: '2026-10-14' });
    assert.ok(schedData.slots.length > 0, 'Harus ada deretan slot waktu');
    assert.ok(schedData.courts.length > 0, 'Harus ada daftar court');

    const courtId = schedData.courts[0].id;
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

  await t.test('8. getRevenueData menghitung metrik finansial riil', async () => {
    const revData = await OwnerService.getRevenueData(marcusUser.id);
    assert.ok(revData.grossRevenue > 0, 'Gross revenue harus > 0');
    assert.ok(revData.netRevenue > 0, 'Net revenue harus > 0');
    assert.ok(revData.platformFee > 0, 'Platform fee harus > 0');
    assert.ok(revData.courtBreakdown.length > 0, 'Harus ada breakdown court');
    assert.ok(revData.recentTransactions.length > 0, 'Harus ada transaksi terbaru');
  });

  await t.test('9. getSettings & updateSettings memutakhirkan PostgreSQL', async () => {
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
