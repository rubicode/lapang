import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BookingService } from '../services/bookingService.js';
import { CourtSchedule, Venue } from '../models/index.js';

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
  });

  it('[BERHASIL] Mengambil riwayat booking berdasarkan booking_code', async () => {
    const booking = await BookingService.getBookingByCode('LAPANG-2024-ID-8849');
    assert.ok(booking, 'Data booking harus ditemukan');
    assert.equal(booking.booking_code, 'LAPANG-2024-ID-8849');
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
});
