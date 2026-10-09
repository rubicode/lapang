import { VenueService } from '../services/venueService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class VenueController {
  static async listVenues(req, res, next) {
    try {
      const {
        sport = 'all',
        city = 'all',
        radius,
        lat,
        lng,
        search,
        sort = 'recommended',
        court_types,
        floor_types,
        amenities
      } = req.query;

      const venues = await VenueService.getVenues({
        sport,
        city,
        radius,
        userLat: lat,
        userLng: lng,
        search,
        sort,
        court_types,
        floor_types,
        amenities
      });

      return successResponse(res, 'Daftar lapangan berhasil diambil', venues, HTTP_STATUS.OK, {
        total: venues.length,
        filters: { sport, city, radius, sort }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVenueDetail(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      const venue = await VenueService.getVenueById(idOrSlug);

      if (!venue) {
        return errorResponse(res, 'Lapangan tidak ditemukan', null, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, 'Detail lapangan berhasil diambil', venue);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await VenueService.getCategories();
      return successResponse(res, 'Daftar kategori olahraga', categories);
    } catch (error) {
      next(error);
    }
  }

  static async getCities(req, res, next) {
    try {
      const rawCities = await VenueService.getCities();
      const cities = rawCities.map(c => ({
        id: c.name,
        name: `${c.name} (${c.province?.name || ''})`,
        lat: Number(c.latitude),
        lng: Number(c.longitude)
      }));
      return successResponse(res, 'Daftar kota Indonesia', cities);
    } catch (error) {
      next(error);
    }
  }

  static async getVenueReviews(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      const result = await VenueService.getVenueReviews(idOrSlug);
      return successResponse(res, 'Ulasan lapangan berhasil diambil', result);
    } catch (error) {
      next(error);
    }
  }

  static async addReview(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      const review = await VenueService.addReview(idOrSlug, req.body, req.user);
      return successResponse(res, 'Ulasan berhasil ditambahkan', review, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  static async replyReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { reply } = req.body;
      if (!reply || !reply.trim()) {
        return errorResponse(res, 'Teks balasan ulasan wajib diisi', null, HTTP_STATUS.BAD_REQUEST);
      }
      const updated = await VenueService.replyReview(reviewId, reply, req.user);
      return successResponse(res, 'Balasan ulasan berhasil disimpan', updated);
    } catch (error) {
      next(error);
    }
  }

  static async getVenueSchedules(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      const { date } = req.query;
      const schedules = await VenueService.getVenueSchedules(idOrSlug, date);
      return successResponse(res, 'Jadwal slot waktu berhasil diambil', schedules);
    } catch (error) {
      next(error);
    }
  }
}
