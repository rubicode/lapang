import { Venue, Court, SportsCategory, Review, VenueAmenity, City, Province, CourtSchedule } from '../models/index.js';
import { SCHEDULE_STATUS } from '../constants/index.js';

// Haversine Formula untuk kalkulasi jarak (kilometer)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export class VenueService {
  /**
   * Mengambil daftar venue dari PostgreSQL dengan filter lengkap
   */
  static async getVenues({
    sport = 'all',
    city = 'all',
    radius = null,
    userLat = null,
    userLng = null,
    search = '',
    sort = 'recommended',
    court_types = null,
    floor_types = null,
    amenities = null
  }) {
    let venues = await Venue.findAll({
      include: [
        {
          model: Court,
          as: 'courts',
          include: [{ model: SportsCategory, as: 'category' }]
        },
        { model: VenueAmenity, as: 'amenities' }
      ]
    });

    // Konversi ke format JSON biasa
    let list = venues.map(v => {
      const json = v.toJSON();
      const firstCourt = json.courts?.[0];
      const category = firstCourt?.category;

      return {
        ...json,
        sport: category?.id || 'futsal',
        sportName: category?.name || 'Futsal & Mini Soccer',
        sportIcon: category?.icon || '⚽',
        lat: parseFloat(json.latitude),
        lng: parseFloat(json.longitude),
        latitude: parseFloat(json.latitude),
        longitude: parseFloat(json.longitude),
        priceFormatted: `Rp ${Number(json.base_price_hourly).toLocaleString('id-ID')}`,
        amenities: json.amenities?.map(a => a.amenity_name) || []
      };
    });

    // Kalkulasi jarak Haversine jika koordinat pengguna diberikan
    list = list.map(v => {
      let distanceKm = null;
      if (userLat !== null && userLng !== null && v.latitude && v.longitude) {
        distanceKm = calculateDistance(parseFloat(userLat), parseFloat(userLng), v.latitude, v.longitude);
      }
      return {
        ...v,
        distanceKm: distanceKm !== null ? distanceKm : 2.5,
        distanceText: distanceKm !== null ? `${distanceKm} km` : '2.5 km'
      };
    });

    // 1. Filter Sport
    if (sport && sport !== 'all') {
      list = list.filter(v => {
        if (v.sport === sport) return true;
        if (v.courts && v.courts.some(c => c.category_id === sport)) return true;
        return false;
      });
    }

    // 2. Filter Kota
    if (city && city !== 'all') {
      const qCity = city.toLowerCase();
      list = list.filter(v => 
        (v.city_name && v.city_name.toLowerCase().includes(qCity)) ||
        (v.province_name && v.province_name.toLowerCase().includes(qCity)) ||
        (v.address && v.address.toLowerCase().includes(qCity))
      );
    }

    // 3. Filter Radius (km)
    if (radius && radius !== 'all' && !isNaN(parseFloat(radius))) {
      const maxR = parseFloat(radius);
      list = list.filter(v => v.distanceKm <= maxR);
    }

    // 4. Filter Keyword Search
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.name.toLowerCase().includes(q) ||
        (v.city_name && v.city_name.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        (v.sportName && v.sportName.toLowerCase().includes(q))
      );
    }

    // 5. Filter Spesifikasi (Tipe Ruangan, Lantai, Fasilitas)
    if (court_types && court_types.length > 0) {
      const types = Array.isArray(court_types) ? court_types : court_types.split(',');
      list = list.filter(v => 
        types.some(t => v.court_type?.toLowerCase().includes(t.toLowerCase())) ||
        (v.courts && v.courts.some(c => types.some(t => c.court_type?.toLowerCase().includes(t.toLowerCase()))))
      );
    }

    if (floor_types && floor_types.length > 0) {
      const ftypes = Array.isArray(floor_types) ? floor_types : floor_types.split(',');
      list = list.filter(v => 
        ftypes.some(f => v.floor_type?.toLowerCase().includes(f.toLowerCase())) ||
        (v.courts && v.courts.some(c => ftypes.some(f => c.floor_type?.toLowerCase().includes(f.toLowerCase()))))
      );
    }

    if (amenities && amenities.length > 0) {
      const amArray = Array.isArray(amenities) ? amenities : amenities.split(',');
      list = list.filter(v =>
        amArray.every(reqAm => v.amenities.some(a => a.toLowerCase().includes(reqAm.toLowerCase())))
      );
    }

    // 6. Sorting
    if (sort === 'price_low') {
      list.sort((a, b) => a.base_price_hourly - b.base_price_hourly);
    } else if (sort === 'rating_high') {
      list.sort((a, b) => b.rating_avg - a.rating_avg);
    } else if (sort === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      list.sort((a, b) => (b.rating_avg * b.review_count) - (a.rating_avg * a.review_count));
    }

    return list;
  }

  /**
   * Detail venue berdasarkan ID atau Slug dari PostgreSQL
   */
  static async getVenueById(idOrSlug) {
    const isUuid = typeof idOrSlug === 'string' && idOrSlug.length === 36;
    const venue = await Venue.findOne({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: [
        {
          model: Court,
          as: 'courts',
          include: [{ model: SportsCategory, as: 'category' }]
        },
        { model: VenueAmenity, as: 'amenities' },
        { model: Review, as: 'reviews' }
      ]
    });

    if (!venue) return null;

    const json = venue.toJSON();
    const firstCourt = json.courts?.[0];
    const category = firstCourt?.category;

    return {
      ...json,
      sport: category?.id || 'futsal',
      sportName: category?.name || 'Futsal & Mini Soccer',
      sportIcon: category?.icon || '⚽',
      lat: parseFloat(json.latitude),
      lng: parseFloat(json.longitude),
      latitude: parseFloat(json.latitude),
      longitude: parseFloat(json.longitude),
      priceFormatted: `Rp ${Number(json.base_price_hourly).toLocaleString('id-ID')}`,
      amenities: json.amenities?.map(a => a.amenity_name) || []
    };
  }

  /**
   * Ambil seluruh kategori olahraga dari database
   */
  static async getCategories() {
    return SportsCategory.findAll({ order: [['id', 'ASC']] });
  }

  /**
   * Ambil daftar kota & provinsi dari database
   */
  static async getCities() {
    return City.findAll({
      include: [{ model: Province, as: 'province' }],
      order: [['id', 'ASC']]
    });
  }

  /**
   * Ambil ulasan venue beserta ringkasan rating 4 aspek
   */
  static async getVenueReviews(idOrSlug) {
    const venue = await this.getVenueById(idOrSlug);
    if (!venue) throw new Error('Lapangan tidak ditemukan');

    const reviews = await Review.findAll({
      where: { venue_id: venue.id },
      order: [['created_at', 'DESC']]
    });

    const reviewsList = reviews.map(r => r.toJSON());

    // Hitung rata-rata tiap aspek
    const count = reviewsList.length;
    let avgFloor = 5.0, avgLighting = 5.0, avgCleanliness = 5.0, avgHospitality = 5.0;

    if (count > 0) {
      avgFloor = +(reviewsList.reduce((acc, r) => acc + (r.rating_floor || 5), 0) / count).toFixed(1);
      avgLighting = +(reviewsList.reduce((acc, r) => acc + (r.rating_lighting || 5), 0) / count).toFixed(1);
      avgCleanliness = +(reviewsList.reduce((acc, r) => acc + (r.rating_cleanliness || 5), 0) / count).toFixed(1);
      avgHospitality = +(reviewsList.reduce((acc, r) => acc + (r.rating_hospitality || 5), 0) / count).toFixed(1);
    }

    return {
      venue_id: venue.id,
      venue_name: venue.name,
      rating_avg: venue.rating_avg,
      review_count: venue.review_count || count,
      aspects: {
        floor: avgFloor,
        lighting: avgLighting,
        cleanliness: avgCleanliness,
        hospitality: avgHospitality
      },
      reviews: reviewsList
    };
  }

  /**
   * Simpan ulasan baru ke database dan perbarui rata-rata rating venue
   */
  static async addReview(idOrSlug, reviewData, user = null) {
    const venue = await this.getVenueById(idOrSlug);
    if (!venue) throw new Error('Lapangan tidak ditemukan');

    const newReview = await Review.create({
      venue_id: venue.id,
      user_id: user?.id || null,
      user_name: user?.name || reviewData.user_name || 'Verified Booker',
      user_role: user?.role === 'user' ? 'Verified Booker' : (user?.role || 'Verified Player'),
      rating_overall: Number(reviewData.rating_overall || 5),
      rating_floor: Number(reviewData.rating_floor || 5),
      rating_lighting: Number(reviewData.rating_lighting || 5),
      rating_cleanliness: Number(reviewData.rating_cleanliness || 5),
      rating_hospitality: Number(reviewData.rating_hospitality || 5),
      comment: reviewData.comment || 'Fasilitas sangat memuaskan.',
      photos: reviewData.photos || []
    });

    // Update rata-rata rating venue
    const allReviews = await Review.findAll({ where: { venue_id: venue.id } });
    const newCount = allReviews.length;
    const newAvg = +(allReviews.reduce((sum, r) => sum + parseFloat(r.rating_overall), 0) / newCount).toFixed(1);

    await Venue.update(
      { rating_avg: newAvg, review_count: newCount },
      { where: { id: venue.id } }
    );

    return newReview;
  }

  /**
   * Respon ulasan oleh pemilik venue (Role-Based)
   */
  static async replyReview(reviewId, replyText, ownerUser) {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new Error('Ulasan tidak ditemukan');

    review.owner_reply = replyText;
    review.owner_replied_at = new Date();
    await review.save();

    return review;
  }

  /**
   * Ambil jadwal slot waktu real-time dari PostgreSQL (court_schedules)
   */
  static async getVenueSchedules(idOrSlug, date = null) {
    const venue = await this.getVenueById(idOrSlug);
    if (!venue) throw new Error('Lapangan tidak ditemukan');

    const targetDate = date || new Date().toISOString().split('T')[0];
    const courtIds = venue.courts?.map(c => c.id) || [];

    let schedules = await CourtSchedule.findAll({
      where: {
        court_id: courtIds,
        date: targetDate
      },
      order: [['time_slot', 'ASC']]
    });

    // Default slot jika tanggal baru belum ada di schedule
    const defaultSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    let slots = defaultSlots;
    let bookedSlots = ['08:00', '15:00', '19:00'];

    if (schedules.length > 0) {
      slots = [...new Set(schedules.map(s => s.time_slot))];
      bookedSlots = schedules
        .filter(s => s.status === SCHEDULE_STATUS.BOOKED || s.status === SCHEDULE_STATUS.BLOCKED)
        .map(s => s.time_slot);
    }

    return {
      venue_id: venue.id,
      date: targetDate,
      slots,
      bookedSlots,
      schedules: schedules.map(s => s.toJSON())
    };
  }
}
