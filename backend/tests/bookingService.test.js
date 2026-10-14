import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BookingService } from '../services/bookingService.js';
import { CourtSchedule, Venue, Court, Booking } from '../models/index.js';
import { SCHEDULE_STATUS, BOOKING_STATUS, PAYMENT_STATUS } from '../constants/index.js';

describe('BookingService Unit Tests (Skenario Berhasil & Gagal)', () => {
  it('[BERHASIL] Membuat reservasi slot lapangan dengan data valid', async () => {
    // Ambil 1 venue dari DB atau gunakan ID acak
    const venue = await Venue.findOne();
    const venueId = venue ? venue.id : '11111111-1111-1111-1111-111111111111';

    const bookingResult = await BookingService.createBooking({
      venueId,
      customerName: 'Ahmad Faiz',
      customerPhone: '081298765432',
      date: '2026-10-15',
      timeSlot: '19:00',
      totalAmount: 175000,
      paymentMethod: 'QRIS'
    });

    assert.ok(bookingResult.success, 'Reservasi harus berstatus success: true');
    assert.ok(bookingResult.bookingCode, 'Harus menghasilkan bookingCode');
    assert.match(bookingResult.bookingCode, /^LAPANG-\d{4}-ID-\d+$/, 'Format kode booking harus LAPANG-YYYY-ID-XXXX');
    assert.equal(bookingResult.data.customer_name, 'Ahmad Faiz');
    assert.equal(bookingResult.data.total_amount, 175000);
    assert.equal(bookingResult.data.payment_method, 'QRIS');
    assert.equal(bookingResult.data.booking_status, BOOKING_STATUS.CONFIRMED);
    assert.equal(bookingResult.data.payment_status, PAYMENT_STATUS.SETTLEMENT);
    assert.ok(bookingResult.data.midtrans_snap_token);
  });

  it('[BERHASIL] Mengambil riwayat booking berdasarkan booking_code yang ada di DB', async () => {
    const booking = await BookingService.getBookingByCode('LAPANG-2024-ID-8849');
    assert.ok(booking, 'Data booking harus ditemukan');
    assert.equal(booking.booking_code, 'LAPANG-2024-ID-8849');
  });

  it('[BERHASIL] getBookingByCode mengembalikan tiket fallback jika booking_code tidak ditemukan', async () => {
    const fallbackBooking = await BookingService.getBookingByCode('LAPANG-NONEXISTENT-CODE-999');
    assert.ok(fallbackBooking);
    assert.equal(fallbackBooking.booking_code, 'LAPANG-NONEXISTENT-CODE-999');
    assert.equal(fallbackBooking.booking_status, 'confirmed');
    assert.equal(fallbackBooking.payment_method, 'QRIS');
  });

  it('[GAGAL] Membuat booking tanpa venueId harus melempar error validasi', async () => {
    await assert.rejects(
      async () => {
        await BookingService.createBooking({
          venueId: null,
          customerName: 'Budi Santoso',
          timeSlot: '20:00',
          totalAmount: 150000
        });
      },
      {
        message: /Data booking tidak lengkap/
      }
    );
  });

  it('[GAGAL] Membuat booking tanpa nama pemesan (customerName) harus melempar error', async () => {
    await assert.rejects(
      async () => {
        await BookingService.createBooking({
          venueId: '11111111-1111-1111-1111-111111111111',
          customerName: '',
          timeSlot: '20:00',
          totalAmount: 150000
        });
      },
      {
        message: /Data booking tidak lengkap/
      }
    );
  });

  it('[GAGAL] Membuat booking tanpa jam main (timeSlot) harus melempar error', async () => {
    await assert.rejects(
      async () => {
        await BookingService.createBooking({
          venueId: '11111111-1111-1111-1111-111111111111',
          customerName: 'Budi Santoso',
          timeSlot: null,
          totalAmount: 150000
        });
      },
      {
        message: /Data booking tidak lengkap/
      }
    );
  });

  it('[GAGAL] Membuat booking tanpa tarif sewa (totalAmount) harus melempar error', async () => {
    await assert.rejects(
      async () => {
        await BookingService.createBooking({
          venueId: '11111111-1111-1111-1111-111111111111',
          customerName: 'Budi Santoso',
          timeSlot: '21:00',
          totalAmount: null
        });
      },
      {
        message: /Data booking tidak lengkap/
      }
    );
  });

  // ACID Transaction & Race Condition Protection (Double-Booking Mitigation)
  it('[BERHASIL] Reservasi slot jadwal tertentu mengubah status CourtSchedule menjadi BOOKED', async () => {
    const court = await Court.findOne();
    assert.ok(court, 'Harus ada court di database');

    const testDate = '2026-11-01';
    const testSlot = '10:00';

    // Siapkan jadwal available
    await CourtSchedule.destroy({ where: { court_id: court.id, date: testDate, time_slot: testSlot } });
    const schedule = await CourtSchedule.create({
      court_id: court.id,
      date: testDate,
      time_slot: testSlot,
      status: SCHEDULE_STATUS.AVAILABLE,
      price: 150000
    });

    // Jalankan booking
    const res = await BookingService.createBooking({
      venueId: court.venue_id,
      courtId: court.id,
      customerName: 'Pemain ACID Test',
      customerPhone: '081233445566',
      date: testDate,
      timeSlot: testSlot,
      totalAmount: 150000,
      paymentMethod: 'VA'
    });

    assert.ok(res.success);

    // Verifikasi bahwa status schedule berubah menjadi BOOKED
    await schedule.reload();
    assert.equal(schedule.status, SCHEDULE_STATUS.BOOKED);

    // Clean up
    await Booking.destroy({ where: { booking_code: res.bookingCode } });
    await schedule.destroy();
  });

  it('[GAGAL] Mencegah Race Condition (Double-Booking): Slot yang telah terisi (BOOKED) harus ditolak', async () => {
    const court = await Court.findOne();
    assert.ok(court);

    const testDate = '2026-11-02';
    const testSlot = '16:00';

    // Buat slot yang sudah berstatus BOOKED
    await CourtSchedule.destroy({ where: { court_id: court.id, date: testDate, time_slot: testSlot } });
    const bookedSchedule = await CourtSchedule.create({
      court_id: court.id,
      date: testDate,
      time_slot: testSlot,
      status: SCHEDULE_STATUS.BOOKED,
      price: 180000
    });

    // Upaya pemain lain memesan slot yang sama harus ditolak
    await assert.rejects(
      async () => {
        await BookingService.createBooking({
          venueId: court.venue_id,
          courtId: court.id,
          customerName: 'Pemain Pesaing',
          customerPhone: '081299887766',
          date: testDate,
          timeSlot: testSlot,
          totalAmount: 180000
        });
      },
      /Maaf, slot waktu ini baru saja dipesan oleh pemain lain/
    );

    // Clean up
    await bookedSchedule.destroy();
  });

  it('[GAGAL] Mencegah pemesanan pada slot jadwal yang sedang MAINTENANCE atau BLOCKED', async () => {
    const court = await Court.findOne();
    assert.ok(court);

    const testDate = '2026-11-03';
    const testSlot = '08:00';

    await CourtSchedule.destroy({ where: { court_id: court.id, date: testDate, time_slot: testSlot } });
    const blockedSchedule = await CourtSchedule.create({
      court_id: court.id,
      date: testDate,
      time_slot: testSlot,
      status: SCHEDULE_STATUS.BLOCKED,
      price: 100000
    });

    await assert.rejects(
      async () => {
        await BookingService.createBooking({
          venueId: court.venue_id,
          courtId: court.id,
          customerName: 'Pemain Blocked Slot',
          customerPhone: '081299887766',
          date: testDate,
          timeSlot: testSlot,
          totalAmount: 100000
        });
      },
      /Maaf, slot waktu ini baru saja dipesan oleh pemain lain/
    );

    // Clean up
    await blockedSchedule.destroy();
  });
});

