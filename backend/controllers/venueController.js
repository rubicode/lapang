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
        sort = 'recommended'
      } = req.query;

      const venues = await VenueService.getVenues({
        sport,
        city,
        radius,
        userLat: lat,
        userLng: lng,
        search,
        sort
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

  static async getCategories(req, res) {
    const categories = [
      { id: 'all', name: 'Semua Cabang', icon: '⚡' },
      { id: 'futsal', name: 'Futsal & Mini Soccer', icon: '⚽' },
      { id: 'badminton', name: 'Badminton', icon: '🏸' },
      { id: 'basketball', name: 'Basket (Full/3x3)', icon: '🏀' },
      { id: 'padel', name: 'Tenis & Padel', icon: '🎾' },
      { id: 'volleyball', name: 'Bola Voli', icon: '🏐' }
    ];
    return successResponse(res, 'Daftar kategori olahraga', categories);
  }

  static async getCities(req, res) {
    const cities = [
      { id: 'all', name: '📍 Seluruh Indonesia (38 Provinsi)' },
      { id: 'Jakarta', name: 'Jakarta & Sekitarnya (Jabodetabek)', lat: -6.2088, lng: 106.8456 },
      { id: 'Bandung', name: 'Bandung Raya (Jawa Barat)', lat: -6.9175, lng: 107.6191 },
      { id: 'Surabaya', name: 'Surabaya & Sidoarjo (Jawa Timur)', lat: -7.2575, lng: 112.7521 },
      { id: 'Bali', name: 'Denpasar & Badung (Bali)', lat: -8.6705, lng: 115.2126 },
      { id: 'Medan', name: 'Medan (Sumatera Utara)', lat: 3.5952, lng: 98.6722 },
      { id: 'Makassar', name: 'Makassar (Sulawesi Selatan)', lat: -5.1477, lng: 119.4327 }
    ];
    return successResponse(res, 'Daftar kota utama Indonesia', cities);
  }
}
