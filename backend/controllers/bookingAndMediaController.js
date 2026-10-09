import { BookingService } from '../services/bookingService.js';
import { MinioService } from '../services/minioService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS, MINIO_BUCKETS } from '../constants/index.js';

export class BookingController {
  static async create(req, res, next) {
    try {
      const {
        venueId,
        courtId,
        customerName,
        customerPhone,
        date,
        timeSlot,
        totalAmount,
        paymentMethod
      } = req.body;

      const result = await BookingService.createBooking({
        venueId,
        courtId,
        customerName,
        customerPhone,
        date,
        timeSlot,
        totalAmount,
        paymentMethod
      });

      return successResponse(
        res,
        'Reservasi lapangan berhasil dibuat',
        result.data,
        HTTP_STATUS.CREATED,
        { bookingCode: result.bookingCode }
      );
    } catch (error) {
      next(error);
    }
  }

  static async getByCode(req, res, next) {
    try {
      const { code } = req.params;
      const booking = await BookingService.getBookingByCode(code);
      return successResponse(res, 'Detail tiket booking berhasil ditemukan', booking);
    } catch (error) {
      next(error);
    }
  }
}

export class MediaController {
  static async upload(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Tidak ada berkas yang diunggah.', null, HTTP_STATUS.BAD_REQUEST);
      }

      const bucket = req.body.type === 'review' ? MINIO_BUCKETS.REVIEWS : MINIO_BUCKETS.VENUES;
      const uploaded = await MinioService.uploadImage(req.file.buffer, bucket, req.file.originalname);

      return successResponse(res, 'Foto berhasil diunggah ke MinIO Storage', uploaded, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }
}
