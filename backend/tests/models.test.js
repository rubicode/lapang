import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sequelize,
  User,
  Province,
  City,
  SportsCategory,
  Venue,
  Court,
  VenueAmenity,
  Review,
  CourtSchedule,
  Booking
} from '../models/index.js';
import { USER_ROLES, BOOKING_STATUS, PAYMENT_STATUS, SCHEDULE_STATUS } from '../constants/index.js';

describe('Sequelize Models & Association Integrity Unit Tests', () => {
  test('[BERHASIL] Definisi model Sequelize terhubung ke instance database', () => {
    assert.ok(sequelize);
    assert.ok(User);
    assert.ok(Province);
    assert.ok(City);
    assert.ok(SportsCategory);
    assert.ok(Venue);
    assert.ok(Court);
    assert.ok(VenueAmenity);
    assert.ok(Review);
    assert.ok(CourtSchedule);
    assert.ok(Booking);
  });

  test('[BERHASIL] Relasi Province hasMany City dan City belongsTo Province', async () => {
    const cityWithProvince = await City.findOne({
      include: [{ model: Province, as: 'province' }]
    });

    assert.ok(cityWithProvince, 'Harus ada data kota');
    assert.ok(cityWithProvince.province, 'Kota harus berelasi dengan Province');
    assert.ok(cityWithProvince.province.name);

    const provinceWithCities = await Province.findByPk(cityWithProvince.province_id, {
      include: [{ model: City, as: 'cities' }]
    });
    assert.ok(provinceWithCities);
    assert.ok(Array.isArray(provinceWithCities.cities));
    assert.ok(provinceWithCities.cities.length > 0);
  });

  test('[BERHASIL] Relasi Venue hasMany Courts dan Court belongsTo Venue', async () => {
    const venue = await Venue.findOne({
      include: [{ model: Court, as: 'courts' }]
    });

    assert.ok(venue, 'Venue harus ditemukan');
    assert.ok(Array.isArray(venue.courts), 'Venue harus memiliki daftar courts');

    if (venue.courts.length > 0) {
      const courtId = venue.courts[0].id;
      const courtWithVenue = await Court.findByPk(courtId, {
        include: [{ model: Venue, as: 'venue' }]
      });
      assert.ok(courtWithVenue);
      assert.equal(courtWithVenue.venue.id, venue.id);
    }
  });

  test('[BERHASIL] Relasi Court belongsTo SportsCategory', async () => {
    const court = await Court.findOne({
      include: [{ model: SportsCategory, as: 'category' }]
    });

    if (court && court.category) {
      assert.ok(court.category.id);
      assert.ok(court.category.name);
      assert.ok(court.category.icon);
    }
  });

  test('[BERHASIL] Relasi Venue hasMany Amenities dan Reviews', async () => {
    const venue = await Venue.findOne({
      include: [
        { model: VenueAmenity, as: 'amenities' },
        { model: Review, as: 'reviews' }
      ]
    });

    assert.ok(venue);
    assert.ok(Array.isArray(venue.amenities));
    assert.ok(Array.isArray(venue.reviews));
  });

  test('[BERHASIL] Relasi Court hasMany CourtSchedules', async () => {
    const schedule = await CourtSchedule.findOne({
      include: [{ model: Court, as: 'court' }]
    });

    if (schedule) {
      assert.ok(schedule.court);
      assert.equal(schedule.court.id, schedule.court_id);
    }
  });

  test('[BERHASIL] Relasi Venue hasMany Bookings', async () => {
    const booking = await Booking.findOne({
      include: [{ model: Venue, as: 'Venue' }]
    });

    if (booking) {
      assert.ok(booking.Venue);
      assert.equal(booking.Venue.id, booking.venue_id);
    }
  });

  test('[BERHASIL] User model field default & verifikasi enum role', async () => {
    const dummyEmail = `model_test_${Date.now()}@lapang.id`;
    const user = await User.create({
      name: 'Model Test User',
      email: dummyEmail,
      password_hash: 'dummyhash123',
      role: USER_ROLES.USER
    });

    assert.ok(user.id);
    assert.equal(user.is_verified_player, false); // Default di model adalah false
    assert.equal(user.role, USER_ROLES.USER);

    // Clean up
    await user.destroy();
  });
});
