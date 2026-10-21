import { Op } from 'sequelize';
import { User, Venue, Court, Booking, Review, CourtSchedule } from '../models/index.js';
import { BOOKING_STATUS, PAYMENT_STATUS, SCHEDULE_STATUS, USER_ROLES } from '../constants/index.js';

export class OwnerService {
  /**
   * Helper untuk mendapatkan venue yang dikelola pemilik (atau fallback admin)
   */
  static async getOwnerVenue(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User tidak ditemukan.');

    let venue = await Venue.findOne({ where: { owner_id: userId } });
    if (!venue && user.role === USER_ROLES.ADMIN) {
      const marcus = await User.findOne({ where: { email: 'marcus@lapang.id' } });
      if (marcus) {
        venue = await Venue.findOne({ where: { owner_id: marcus.id } });
      }
    }

    if (!venue && user.role === USER_ROLES.OWNER) {
      const slugBase = (user.name || 'owner').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSuffix = user.id.slice(0, 8);
      venue = await Venue.create({
        owner_id: user.id,
        city_id: 1,
        city_name: 'Jakarta Selatan',
        province_name: 'DKI Jakarta',
        name: `Arena Olahraga ${user.name}`,
        slug: `${slugBase}-arena-${uniqueSuffix}`,
        address: 'Jl. Pemuda Olahraga No. 1, Jakarta Selatan',
        latitude: -6.2615,
        longitude: 106.8106,
        phone_number: user.phone || '081234567890',
        opening_hours: '08:00 - 23:00 WIB',
        floor_type: 'Vinyl Approved',
        court_type: 'Indoor',
        base_price_hourly: 150000,
        main_image_url: 'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
        gallery_images: [
          'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
        ],
        description: `Fasilitas venue olahraga resmi dikelola oleh ${user.name}.`,
        rating_avg: 5.0,
        review_count: 0,
        is_verified: true,
        verification_status: 'Approved',
        sport_type: 'Futsal & Mini Soccer'
      });

      await Court.create({
        venue_id: venue.id,
        category_id: 'futsal',
        name: 'Lapangan Utama (Pitch 1)',
        floor_type: 'Vinyl Approved',
        court_type: 'indoor',
        match_format: '5-a-side',
        surface_spec: 'Indoor Vinyl Pro',
        price_hourly: 150000,
        main_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'],
        is_active: true,
        monitoring_status: 'LIVE',
        occupancy_rate: 65,
        active_players_count: 10
      });
    }

    if (!venue) {
      venue = await Venue.findOne();
    }

    return { user, venue };
  }

  /**
   * 1. Mengambil data ikhtisar dashboard pemilik lapangan langsung dari PostgreSQL
   */
  static async getOverview(userId) {
    const { user, venue } = await this.getOwnerVenue(userId);

    if (!venue) {
      return {
        owner: {
          name: user.name,
          roleTitle: 'Premium Owner',
          avatarUrl: user.avatar_url
        },
        stats: {
          totalRevenue: 0,
          revenueGrowth: '+0%',
          activeBookings: 0,
          bookingDemandBadge: 'Normal',
          avgRatingScore: '0%',
          avgRatingBadge: '0/5',
          uniqueVisitors: 0
        },
        fields: [],
        recentBookings: [],
        peakHoursTip: {
          title: 'Peak Hours Tip',
          description: 'Belum ada data reservasi.',
          isPromoApplied: false
        }
      };
    }

    // Ambil semua venue yang dimiliki oleh user ini
    const ownerVenues = await Venue.findAll({ where: { owner_id: user.id } });
    const venueIds = ownerVenues.length > 0 ? ownerVenues.map(v => v.id) : [venue.id];

    // Ambil daftar Courts (lapangan) untuk venue ini
    const courts = await Court.findAll({
      where: { venue_id: venueIds },
      include: [{ model: Venue, as: 'venue' }],
      order: [['created_at', 'ASC']]
    });

    // Ambil semua Bookings untuk venue ini
    const allBookings = await Booking.findAll({
      where: { venue_id: venueIds },
      order: [['created_at', 'DESC']]
    });

    // Hitung Total Pendapatan Riil dari booking berstatus settlement
    const totalRevenue = allBookings
      .filter((b) => b.payment_status === PAYMENT_STATUS.SETTLEMENT)
      .reduce((sum, b) => sum + Number(b.total_amount), 0);

    // Hitung Pemesanan Aktif (Confirmed & Pending)
    const activeBookingsCount = allBookings
      .filter((b) => b.booking_status === BOOKING_STATUS.CONFIRMED || b.booking_status === BOOKING_STATUS.PENDING)
      .length;

    // Hitung rata-rata rating
    const ratingValue = Number(venue.rating_avg || 4.9);
    const ratingPercentage = Math.round((ratingValue / 5.0) * 100);

    // Format Courts (Fields)
    const formattedFields = courts.map((c) => {
      let image = c.main_image;
      if (!image && Array.isArray(c.images) && c.images.length > 0) {
        image = c.images[0];
      }
      if (!image) {
        image = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
      }

      return {
        id: c.id,
        name: c.name,
        venueName: c.venue?.name || venue.name,
        district: c.venue?.district || venue.district || 'Downtown Sports District',
        status: c.is_active ? 'ACTIVE' : 'MAINTENANCE',
        isActive: c.is_active,
        matchFormat: c.match_format || '5-a-side',
        surfaceSpec: c.surface_spec || (c.court_type === 'indoor' ? 'Indoor' : 'Outdoor Pro'),
        priceHourly: c.price_hourly,
        currencySymbol: venue.currency === 'USD' ? '$' : 'Rp',
        image,
        occupancyRate: c.occupancy_rate || 75
      };
    });

    // Format Recent Bookings (Ambil 6 terbaru)
    const recentBookingsList = allBookings.slice(0, 6).map((b) => {
      const names = (b.customer_name || 'Member').trim().split(' ');
      const initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0].slice(0, 2).toUpperCase();

      const timeDisplay = b.time_slot ? b.time_slot.split(' ')[0] : '18:00';

      return {
        id: b.id,
        bookingCode: b.booking_code,
        customerName: b.customer_name,
        initials,
        courtName: b.venue_name || venue.name,
        timeSlot: timeDisplay,
        fullTimeSlot: b.time_slot,
        date: b.date,
        status: b.booking_status.charAt(0).toUpperCase() + b.booking_status.slice(1).toLowerCase(),
        statusRaw: b.booking_status,
        amount: Number(b.total_amount),
        currencySymbol: venue.currency === 'USD' ? '$' : 'Rp'
      };
    });

    return {
      owner: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleTitle: 'Premium Owner',
        avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      venue: {
        id: venue.id,
        name: venue.name,
        district: venue.district,
        currency: venue.currency || 'USD',
        earlyBirdPromoActive: Boolean(venue.early_bird_promo_active),
        earlyBirdDiscountPercent: venue.early_bird_discount_percent || 20
      },
      stats: {
        totalRevenue,
        revenueFormatted: venue.currency === 'USD' ? `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `Rp ${totalRevenue.toLocaleString('id-ID')}`,
        revenueGrowth: '+12.5%',
        activeBookings: activeBookingsCount,
        bookingDemandBadge: 'High',
        avgRatingScore: `${ratingPercentage}%`,
        avgRatingBadge: `${ratingValue.toFixed(1)}/5`,
        uniqueVisitors: (venue.unique_visitors_count || 3842).toLocaleString('en-US')
      },
      fields: formattedFields,
      recentBookings: recentBookingsList,
      peakHoursTip: {
        title: 'Peak Hours Tip',
        description: 'Most bookings are happening between 18:00 and 21:00. Consider offering an "Early Bird" discount to fill morning slots.',
        isPromoApplied: Boolean(venue.early_bird_promo_active)
      }
    };
  }

  /**
   * 2. Ambil data Bookings lengkap dengan filter & pencarian langsung dari PostgreSQL
   */
  static async getBookings(userId, { status = 'all', search = '', courtId = 'all', page = 1, limit = 50 } = {}) {
    const { user, venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue tidak ditemukan.');

    const ownerVenues = await Venue.findAll({ where: { owner_id: user.id } });
    const venueIds = ownerVenues.length > 0 ? ownerVenues.map(v => v.id) : [venue.id];

    const whereClause = { venue_id: venueIds };

    if (status && status !== 'all') {
      whereClause.booking_status = status.toLowerCase();
    }

    if (courtId && courtId !== 'all') {
      whereClause.court_id = courtId;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { customer_name: { [Op.iLike]: q } },
        { booking_code: { [Op.iLike]: q } },
        { venue_name: { [Op.iLike]: q } },
        { customer_phone: { [Op.iLike]: q } }
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset
    });

    // Ambil statistik ringkasan semua booking untuk venue ini
    const allBookings = await Booking.findAll({
      where: { venue_id: venueIds },
      attributes: ['id', 'booking_status', 'total_amount', 'payment_status']
    });

    const summary = {
      total: allBookings.length,
      confirmed: allBookings.filter((b) => b.booking_status === BOOKING_STATUS.CONFIRMED).length,
      pending: allBookings.filter((b) => b.booking_status === BOOKING_STATUS.PENDING).length,
      cancelled: allBookings.filter((b) => b.booking_status === BOOKING_STATUS.CANCELLED).length,
      completed: allBookings.filter((b) => b.booking_status === BOOKING_STATUS.COMPLETED).length,
      totalRevenue: allBookings
        .filter((b) => b.payment_status === PAYMENT_STATUS.SETTLEMENT)
        .reduce((sum, b) => sum + Number(b.total_amount), 0)
    };

    const courts = await Court.findAll({
      where: { venue_id: venueIds },
      attributes: ['id', 'name']
    });

    const formattedBookings = rows.map((b) => {
      const names = (b.customer_name || 'Member').trim().split(' ');
      const initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0].slice(0, 2).toUpperCase();

      return {
        id: b.id,
        bookingCode: b.booking_code,
        customerName: b.customer_name,
        customerPhone: b.customer_phone,
        initials,
        courtId: b.court_id,
        courtName: b.venue_name || venue.name,
        date: b.date,
        timeSlot: b.time_slot,
        totalAmount: Number(b.total_amount),
        currencySymbol: venue.currency === 'USD' ? '$' : 'Rp',
        paymentMethod: b.payment_method || 'Stripe',
        paymentStatus: b.payment_status,
        bookingStatus: b.booking_status.charAt(0).toUpperCase() + b.booking_status.slice(1).toLowerCase(),
        bookingStatusRaw: b.booking_status,
        createdAt: b.created_at
      };
    });

    return {
      summary,
      courts,
      currencySymbol: venue.currency === 'USD' ? '$' : 'Rp',
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      },
      bookings: formattedBookings
    };
  }

  /**
   * 3. Update status booking (Confirm, Cancel, Complete) langsung ke PostgreSQL
   */
  static async updateBookingStatus(userId, bookingId, newStatus) {
    const { venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue tidak ditemukan.');

    const booking = await Booking.findOne({
      where: { id: bookingId, venue_id: venue.id }
    });

    if (!booking) {
      throw new Error('Pemesanan tidak ditemukan atau tidak memiliki hak akses.');
    }

    const validStatuses = [
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.COMPLETED
    ];

    const targetStatus = newStatus.toLowerCase();
    if (!validStatuses.includes(targetStatus)) {
      throw new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
    }

    booking.booking_status = targetStatus;
    if (targetStatus === BOOKING_STATUS.CONFIRMED) {
      booking.payment_status = PAYMENT_STATUS.SETTLEMENT;
    } else if (targetStatus === BOOKING_STATUS.CANCELLED) {
      booking.payment_status = PAYMENT_STATUS.CANCEL;
    } else if (targetStatus === BOOKING_STATUS.PENDING) {
      booking.payment_status = PAYMENT_STATUS.UNPAID;
    }

    await booking.save();
    return booking;
  }

  /**
   * 4. Ambil jadwal slot waktu harian (Schedule) untuk court tertentu
   */
  static async getSchedules(userId, { courtId, date } = {}) {
    const { user, venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue tidak ditemukan.');

    const ownerVenues = await Venue.findAll({ where: { owner_id: user.id } });
    const venueIds = ownerVenues.length > 0 ? ownerVenues.map(v => v.id) : [venue.id];

    const courts = await Court.findAll({
      where: { venue_id: venueIds },
      order: [['created_at', 'ASC']]
    });

    if (courts.length === 0) {
      return { courts: [], selectedCourt: null, date, slots: [] };
    }

    const selectedCourt = courtId ? (courts.find((c) => c.id === courtId) || courts[0]) : courts[0];
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Ambil jadwal tersimpan dari tabel court_schedules di PostgreSQL
    const existingSchedules = await CourtSchedule.findAll({
      where: {
        court_id: selectedCourt.id,
        date: targetDate
      }
    });

    // Ambil juga bookings yang terdaftar untuk tanggal dan court ini
    const bookings = await Booking.findAll({
      where: {
        court_id: selectedCourt.id,
        date: targetDate,
        booking_status: { [Op.ne]: BOOKING_STATUS.CANCELLED }
      }
    });

    const standardTimeSlots = [
      '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00', '22:00', '23:00'
    ];

    const scheduleMap = new Map();
    existingSchedules.forEach((s) => {
      scheduleMap.set(s.time_slot, s);
    });

    const bookingMap = new Map();
    bookings.forEach((b) => {
      const slotHour = b.time_slot ? b.time_slot.split(' ')[0] : '';
      if (slotHour) bookingMap.set(slotHour, b);
    });

    const slots = [];
    for (const slotTime of standardTimeSlots) {
      const dbSched = scheduleMap.get(slotTime);
      const bookedData = bookingMap.get(slotTime);

      let status = SCHEDULE_STATUS.AVAILABLE;
      let bookerName = null;
      let bookingCode = null;

      if (bookedData) {
        status = SCHEDULE_STATUS.BOOKED;
        bookerName = bookedData.customer_name;
        bookingCode = bookedData.booking_code;
      } else if (dbSched) {
        status = dbSched.status;
      }

      slots.push({
        id: dbSched ? dbSched.id : null,
        timeSlot: slotTime,
        status,
        price: selectedCourt.price_hourly,
        currencySymbol: venue.currency === 'USD' ? '$' : 'Rp',
        bookerName,
        bookingCode,
        isBlocked: status === SCHEDULE_STATUS.BLOCKED || status === SCHEDULE_STATUS.MAINTENANCE
      });
    }

    return {
      courts: courts.map((c) => ({
        id: c.id,
        name: c.name,
        priceHourly: c.price_hourly,
        matchFormat: c.match_format || '5-a-side',
        surfaceSpec: c.surface_spec || 'Outdoor Pro',
        isActive: c.is_active
      })),
      selectedCourt: {
        id: selectedCourt.id,
        name: selectedCourt.name,
        priceHourly: selectedCourt.price_hourly,
        matchFormat: selectedCourt.match_format,
        surfaceSpec: selectedCourt.surface_spec,
        isActive: selectedCourt.is_active
      },
      date: targetDate,
      venueName: venue.name,
      currencySymbol: venue.currency === 'USD' ? '$' : 'Rp',
      slots
    };
  }

  /**
   * 5. Toggle block / unblock slot waktu operasional (Schedule) di PostgreSQL
   */
  static async toggleScheduleBlock(userId, { courtId, date, timeSlot, status = 'blocked' }) {
    const { venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue tidak ditemukan.');

    const court = await Court.findOne({
      where: { id: courtId, venue_id: venue.id }
    });
    if (!court) throw new Error('Lapangan tidak ditemukan atau bukan milik venue Anda.');

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Cek apakah ada booking aktif di slot tersebut
    const existingBooking = await Booking.findOne({
      where: {
        court_id: courtId,
        date: targetDate,
        time_slot: { [Op.like]: `${timeSlot}%` },
        booking_status: { [Op.ne]: BOOKING_STATUS.CANCELLED }
      }
    });

    if (existingBooking && status === 'blocked') {
      throw new Error(`Slot ${timeSlot} pada ${targetDate} sudah memiliki reservasi aktif (${existingBooking.customer_name}). Tidak dapat diblokir.`);
    }

    let schedule = await CourtSchedule.findOne({
      where: {
        court_id: courtId,
        date: targetDate,
        time_slot: timeSlot
      }
    });

    const targetStatus = status.toLowerCase() === 'blocked' ? SCHEDULE_STATUS.BLOCKED : SCHEDULE_STATUS.AVAILABLE;

    if (schedule) {
      schedule.status = targetStatus;
      await schedule.save();
    } else {
      schedule = await CourtSchedule.create({
        court_id: courtId,
        date: targetDate,
        time_slot: timeSlot,
        status: targetStatus,
        price: court.price_hourly
      });
    }

    return schedule;
  }

  /**
   * 6. Ambil data Revenue & Finansial lengkap langsung dari PostgreSQL
   */
  static async getRevenueData(userId, { period = 'month' } = {}) {
    const { user, venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue tidak ditemukan.');

    const ownerVenues = await Venue.findAll({ where: { owner_id: user.id } });
    const venueIds = ownerVenues.length > 0 ? ownerVenues.map(v => v.id) : [venue.id];

    const courts = await Court.findAll({
      where: { venue_id: venueIds }
    });

    const allBookings = await Booking.findAll({
      where: { venue_id: venueIds },
      order: [['created_at', 'DESC']]
    });

    const settlementBookings = allBookings.filter((b) => b.payment_status === PAYMENT_STATUS.SETTLEMENT);
    const grossRevenue = settlementBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    const platformFeeRate = 0.05; // 5% fee platform
    const platformFee = Math.round(grossRevenue * platformFeeRate);
    const netRevenue = grossRevenue - platformFee;

    const pendingRevenue = allBookings
      .filter((b) => b.booking_status === BOOKING_STATUS.PENDING)
      .reduce((sum, b) => sum + Number(b.total_amount), 0);

    const averageOrderValue = settlementBookings.length > 0
      ? Math.round((grossRevenue / settlementBookings.length) * 100) / 100
      : 0;

    // Breakdown pendapatan per lapangan
    const courtRevenueMap = {};
    courts.forEach((c) => {
      courtRevenueMap[c.id] = {
        courtId: c.id,
        courtName: c.name,
        matchFormat: c.match_format || '5-a-side',
        surfaceSpec: c.surface_spec || 'Outdoor Pro',
        totalBookings: 0,
        totalRevenue: 0
      };
    });

    settlementBookings.forEach((b) => {
      if (courtRevenueMap[b.court_id]) {
        courtRevenueMap[b.court_id].totalBookings += 1;
        courtRevenueMap[b.court_id].totalRevenue += Number(b.total_amount);
      }
    });

    const courtBreakdown = Object.values(courtRevenueMap).map((cr) => {
      const percentage = grossRevenue > 0 ? Math.round((cr.totalRevenue / grossRevenue) * 100) : 0;
      return {
        ...cr,
        percentage
      };
    });

    // 15 transaksi pembayaran terbaru
    const recentTransactions = settlementBookings.slice(0, 15).map((b) => ({
      id: b.id,
      invoiceCode: b.booking_code,
      customerName: b.customer_name,
      courtName: b.venue_name || venue.name,
      date: b.date,
      timeSlot: b.time_slot,
      paymentMethod: b.payment_method || 'Stripe',
      amount: Number(b.total_amount),
      status: 'Paid',
      createdAt: b.created_at
    }));

    return {
      currencySymbol: venue.currency === 'USD' ? '$' : 'Rp',
      currency: venue.currency || 'USD',
      grossRevenue,
      netRevenue,
      platformFee,
      pendingRevenue,
      averageOrderValue,
      totalSettlementCount: settlementBookings.length,
      courtBreakdown,
      recentTransactions
    };
  }

  /**
   * 7. Ambil Pengaturan Venue & Akun Pemilik (Settings)
   */
  static async getSettings(userId) {
    const { user, venue } = await this.getOwnerVenue(userId);

    return {
      owner: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+62 812 3456 7890',
        avatarUrl: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      },
      venue: {
        id: venue.id,
        name: venue.name,
        district: venue.district || 'Downtown Sports District',
        address: venue.address || 'Downtown Sports District, Central Blvd No. 1',
        phoneNumber: venue.phone_number || '+62 812 3456 7890',
        openingHours: venue.opening_hours || '06:00 - 24:00',
        currency: venue.currency || 'USD',
        earlyBirdPromoActive: Boolean(venue.early_bird_promo_active),
        earlyBirdDiscountPercent: venue.early_bird_discount_percent || 20,
        description: venue.description || 'Kompleks lapangan premium berstandar internasional.'
      }
    };
  }

  /**
   * 8. Perbarui Pengaturan Venue & Akun Pemilik ke PostgreSQL
   */
  static async updateSettings(userId, settingsData) {
    const { user, venue } = await this.getOwnerVenue(userId);

    // Update user jika ada data profil
    if (settingsData.ownerName && settingsData.ownerName.trim()) {
      user.name = settingsData.ownerName.trim();
    }
    if (settingsData.ownerPhone !== undefined) {
      user.phone = settingsData.ownerPhone;
    }
    await user.save();

    // Update venue
    if (settingsData.venueName && settingsData.venueName.trim()) {
      venue.name = settingsData.venueName.trim();
    }
    if (settingsData.district !== undefined) {
      venue.district = settingsData.district;
    }
    if (settingsData.address !== undefined) {
      venue.address = settingsData.address;
    }
    if (settingsData.phoneNumber !== undefined) {
      venue.phone_number = settingsData.phoneNumber;
    }
    if (settingsData.openingHours !== undefined) {
      venue.opening_hours = settingsData.openingHours;
    }
    if (settingsData.currency !== undefined) {
      venue.currency = settingsData.currency;
    }
    if (settingsData.earlyBirdPromoActive !== undefined) {
      venue.early_bird_promo_active = Boolean(settingsData.earlyBirdPromoActive);
    }
    if (settingsData.earlyBirdDiscountPercent !== undefined) {
      venue.early_bird_discount_percent = Number(settingsData.earlyBirdDiscountPercent);
    }
    if (settingsData.description !== undefined) {
      venue.description = settingsData.description;
    }

    await venue.save();

    return this.getSettings(userId);
  }

  /**
   * 9. Membuat lapangan baru untuk venue pemilik
   */
  static async createCourt(userId, data) {
    const { venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue untuk akun ini tidak ditemukan.');

    const newCourt = await Court.create({
      venue_id: venue.id,
      category_id: data.category_id || 'futsal',
      name: data.name || 'New Pitch Field',
      floor_type: data.floor_type || 'Turf Pro FIFA Standard',
      court_type: data.court_type || 'outdoor',
      match_format: data.match_format || '5-a-side',
      surface_spec: data.surface_spec || 'Outdoor Pro',
      price_hourly: Number(data.price_hourly || 85),
      main_image: data.main_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      images: [data.main_image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'],
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      monitoring_status: 'LIVE',
      occupancy_rate: 70,
      active_players_count: 10
    });

    return newCourt;
  }

  /**
   * 10. Memperbarui informasi lapangan
   */
  static async updateCourt(userId, courtId, updateData) {
    const court = await Court.findByPk(courtId);
    if (!court) throw new Error('Lapangan tidak ditemukan.');

    const allowedFields = ['name', 'price_hourly', 'is_active', 'match_format', 'surface_spec', 'main_image'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        court[field] = updateData[field];
      }
    }

    await court.save();
    return court;
  }

  /**
   * 11. Mengaktifkan/menonaktifkan promo early bird pada venue
   */
  static async toggleEarlyBirdPromo(userId, promoActive) {
    const { venue } = await this.getOwnerVenue(userId);
    if (!venue) throw new Error('Venue tidak ditemukan.');

    venue.early_bird_promo_active = Boolean(promoActive);
    await venue.save();

    return {
      earlyBirdPromoActive: venue.early_bird_promo_active,
      discountPercent: venue.early_bird_discount_percent
    };
  }

  /**
   * 12. Ekspor laporan reservasi & pendapatan pemilik ke format CSV
   */
  static async exportReport(userId) {
    const overview = await this.getOverview(userId);
    const { owner, venue, stats, fields, recentBookings } = overview;

    let csv = '=== PITCH GALLERY - OWNER MANAGEMENT REPORT ===\n';
    csv += `Owner: ${owner.name}\n`;
    csv += `Venue: ${venue.name} (${venue.district})\n`;
    csv += `Export Date: ${new Date().toISOString()}\n\n`;

    csv += '--- SUMMARY METRICS ---\n';
    csv += `Total Revenue,${stats.revenueFormatted},Growth,${stats.revenueGrowth}\n`;
    csv += `Active Bookings,${stats.activeBookings},Demand,${stats.bookingDemandBadge}\n`;
    csv += `Average Rating,${stats.avgRatingScore} (${stats.avgRatingBadge})\n`;
    csv += `Unique Visitors,${stats.uniqueVisitors}\n\n`;

    csv += '--- FIELD ASSETS ---\n';
    csv += 'Field Name,Status,Format,Surface,Price Hourly\n';
    for (const f of fields) {
      csv += `"${f.name}","${f.status}","${f.matchFormat}","${f.surfaceSpec}","${f.currencySymbol}${f.priceHourly}/hr"\n`;
    }
    csv += '\n';

    csv += '--- RECENT BOOKINGS ---\n';
    csv += 'Booking Code,Customer,Field,Time,Date,Status,Amount\n';
    for (const b of recentBookings) {
      csv += `"${b.bookingCode}","${b.customerName}","${b.courtName}","${b.timeSlot}","${b.date}","${b.status}","${b.currencySymbol}${b.amount.toFixed(2)}"\n`;
    }

    return csv;
  }
}
