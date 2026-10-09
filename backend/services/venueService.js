import { Venue, Court, SportsCategory, Review, VenueAmenity } from '../models/index.js';

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
   * Mengambil daftar venue dengan filter cabang olahraga, kota, radius & keyword
   */
  static async getVenues({
    sport = 'all',
    city = 'all',
    radius = null,
    userLat = null,
    userLng = null,
    search = '',
    sort = 'recommended'
  }) {
    let venues = [];

    try {
      venues = await Venue.findAll({
        include: [
          {
            model: Court,
            as: 'courts',
            include: [{ model: SportsCategory, as: 'category' }]
          },
          { model: VenueAmenity, as: 'amenities' }
        ]
      });
    } catch (dbError) {
      console.warn(`[VenueService] Query database gagal (${dbError.message}). Menggunakan in-memory data store.`);
    }

    // Jika DB kosong atau offline, sediakan mock venues berbasis spesifikasi
    if (!venues || venues.length === 0) {
      venues = VenueService.getSeedVenues();
    } else {
      venues = venues.map(v => v.toJSON());
    }

    // Hitung jarak jika koordinat pengguna diberikan
    venues = venues.map(v => {
      let distanceKm = null;
      if (userLat !== null && userLng !== null && v.latitude && v.longitude) {
        distanceKm = calculateDistance(parseFloat(userLat), parseFloat(userLng), parseFloat(v.latitude), parseFloat(v.longitude));
      }
      return {
        ...v,
        lat: parseFloat(v.latitude ?? v.lat),
        lng: parseFloat(v.longitude ?? v.lng),
        distanceKm: distanceKm !== null ? distanceKm : (v.distanceKm || 2.5),
        distanceText: distanceKm !== null ? `${distanceKm} km` : (v.distanceText || '2.5 km')
      };
    });

    // 1. Filter Sport
    if (sport && sport !== 'all') {
      venues = venues.filter(v => {
        if (v.sport === sport) return true;
        if (v.courts && v.courts.some(c => c.category_id === sport)) return true;
        return false;
      });
    }

    // 2. Filter Kota
    if (city && city !== 'all') {
      venues = venues.filter(v => 
        (v.city_name && v.city_name.toLowerCase().includes(city.toLowerCase())) ||
        (v.address && v.address.toLowerCase().includes(city.toLowerCase()))
      );
    }

    // 3. Filter Radius (km)
    if (radius && radius !== 'all' && !isNaN(parseFloat(radius))) {
      const maxR = parseFloat(radius);
      venues = venues.filter(v => v.distanceKm <= maxR);
    }

    // 4. Filter Keyword Search
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      venues = venues.filter(v =>
        v.name.toLowerCase().includes(q) ||
        (v.city_name && v.city_name.toLowerCase().includes(q)) ||
        (v.address && v.address.toLowerCase().includes(q)) ||
        (v.sportName && v.sportName.toLowerCase().includes(q))
      );
    }

    // 5. Sorting
    if (sort === 'price_low') {
      venues.sort((a, b) => a.base_price_hourly - b.base_price_hourly);
    } else if (sort === 'rating_high') {
      venues.sort((a, b) => b.rating_avg - a.rating_avg);
    } else if (sort === 'distance') {
      venues.sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      // recommended: sort rating & review count
      venues.sort((a, b) => (b.rating_avg * b.review_count) - (a.rating_avg * a.review_count));
    }

    return venues;
  }

  /**
   * Detail venue berdasarkan ID atau Slug
   */
  static async getVenueById(idOrSlug) {
    try {
      const venue = await Venue.findOne({
        where: isNaN(idOrSlug) && idOrSlug.length > 30 ? { id: idOrSlug } : { slug: idOrSlug },
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

      if (venue) return venue.toJSON();
    } catch (err) {
      console.warn(`[VenueService] Detail query fallback: ${err.message}`);
    }

    const fallbackList = VenueService.getSeedVenues();
    return fallbackList.find(v => v.id === idOrSlug || v.slug === idOrSlug) || fallbackList[0];
  }

  /**
   * Data venue dasar berbasis spesifikasi & mockup/code.html
   */
  static getSeedVenues() {
    return [
      {
        id: "v-1",
        slug: "the-emerald-arena-jakarta",
        name: "The Emerald Arena Jakarta",
        sport: "futsal",
        sportName: "Futsal & Mini Soccer",
        sportIcon: "⚽",
        city_name: "Jakarta",
        province_name: "DKI Jakarta",
        address: "Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan",
        latitude: -6.2941,
        longitude: 106.8044,
        distanceKm: 1.8,
        distanceText: "1.8 km",
        base_price_hourly: 175000,
        priceFormatted: "Rp 175.000",
        rating_avg: 4.9,
        review_count: 142,
        floor_type: "Rumput Sintetis Monofilament FIFA Standard",
        court_type: "Semi-Indoor",
        opening_hours: "06:00 - 24:00 WIB",
        description: "Venue mini soccer dan futsal premium dengan rumput sintetis standar internasional. Dilengkapi lampu floodlight 500 lux untuk pertandingan malam hari, ruang ganti ber-AC, dan shower air panas.",
        main_image_url: "https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80",
        gallery_images: [
          "https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=500&q=80"
        ],
        amenities: ["Parkir Luas Mobil/Motor", "Shower Air Hangat", "Kantin & Coffee Shop", "Musholla AC", "Loker & Ruang Ganti", "Sewa Rompi & Bola"],
        slots: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"],
        bookedSlots: ["08:00", "15:00", "19:00"]
      },
      {
        id: "v-2",
        slug: "gor-badminton-bintang-dago",
        name: "GOR Badminton Bintang Dago",
        sport: "badminton",
        sportName: "Badminton",
        sportIcon: "🏸",
        city_name: "Bandung",
        province_name: "Jawa Barat",
        address: "Jl. Ir. H. Juanda No. 84, Dago, Kota Bandung",
        latitude: -6.8850,
        longitude: 107.6136,
        distanceKm: 2.4,
        distanceText: "2.4 km",
        base_price_hourly: 85000,
        priceFormatted: "Rp 85.000",
        rating_avg: 4.8,
        review_count: 96,
        floor_type: "Karpet Vinyl BWF Approved 5mm",
        court_type: "Indoor Hall",
        opening_hours: "07:00 - 23:00 WIB",
        description: "Pusat bulu tangkis terlengkap di Bandung dengan 6 lapangan karpet vinyl standar kejuaraan BWF. Sirkulasi udara sejuk pegunungan tanpa hembusan angin yang mengganggu jalannya shuttlecock.",
        main_image_url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
        gallery_images: [
          "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-161391808466-292b78a8ef95?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1544919982-b61976f0ba43?auto=format&fit=crop&w=500&q=80"
        ],
        amenities: ["Karpet Vinyl BWF", "Parkir Mobil", "Musholla", "Kantin Minuman", "Penyewaan Raket", "Shower Air Bersih"],
        slots: ["07:00", "08:00", "10:00", "11:00", "16:00", "17:00", "19:00", "20:00"],
        bookedSlots: ["10:00", "19:00"]
      },
      {
        id: "v-3",
        slug: "sanur-padel-tennis-club",
        name: "Sanur Padel & Tennis Club",
        sport: "padel",
        sportName: "Tenis & Padel",
        sportIcon: "🎾",
        city_name: "Bali",
        province_name: "Bali",
        address: "Jl. Danau Tamblingan No. 102, Sanur, Denpasar Selatan",
        latitude: -8.6981,
        longitude: 115.2625,
        distanceKm: 3.1,
        distanceText: "3.1 km",
        base_price_hourly: 220000,
        priceFormatted: "Rp 220.000",
        rating_avg: 4.95,
        review_count: 210,
        floor_type: "Panoramic Glass & Textured Silica Turf",
        court_type: "Outdoor Coastal Court",
        opening_hours: "06:00 - 22:00 WITA",
        description: "Fasilitas Padel Tennis standar turnamen di pinggir pantai Sanur. Nikmati match seru dengan angin pantai sejuk, kafe hidangan sehat organik, dan pro shop peralatan tenis terkini.",
        main_image_url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
        gallery_images: [
          "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=500&q=80",
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80"
        ],
        amenities: ["Panoramic Glass Court", "Lounge & Juice Bar", "Shower Air Hangat", "Instruktur Profesional", "Parkir Luas", "Free Wi-Fi"],
        slots: ["07:00", "08:30", "10:00", "15:00", "16:30", "18:00", "19:30"],
        bookedSlots: ["08:30", "18:00"]
      },
      {
        id: "v-4",
        slug: "surabaya-pro-basketball-center",
        name: "Surabaya Pro Basketball Center",
        sport: "basketball",
        sportName: "Bola Basket",
        sportIcon: "🏀",
        city_name: "Surabaya",
        province_name: "Jawa Timur",
        address: "Jl. Mayjen Sungkono No. 55, Sawahan, Surabaya",
        latitude: -7.2917,
        longitude: 112.7239,
        distanceKm: 4.2,
        distanceText: "4.2 km",
        base_price_hourly: 190000,
        priceFormatted: "Rp 190.000",
        rating_avg: 4.75,
        review_count: 88,
        floor_type: "FIBA Certified Maple Hardwood Floor",
        court_type: "Indoor Stadium",
        opening_hours: "08:00 - 23:00 WIB",
        description: "Lapangan basket kayu maple bersertifikasi FIBA dengan ring pegas hidrolik profesional. Cocok untuk sparring turnamen resmi maupun latihan rutin komunitas basket Jawa Timur.",
        main_image_url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
        gallery_images: [
          "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=500&q=80"
        ],
        amenities: ["FIBA Wooden Court", "Tribun 200 Penonton", "Scoreboard Digital LED", "Kamar Ganti + Loker", "Parkir Mobil"],
        slots: ["08:00", "10:00", "13:00", "15:00", "17:00", "19:00", "21:00"],
        bookedSlots: ["17:00", "19:00"]
      },
      {
        id: "v-5",
        slug: "grand-futsal-interlock-kuningan",
        name: "Grand Futsal Interlock Kuningan",
        sport: "futsal",
        sportName: "Futsal",
        sportIcon: "⚽",
        city_name: "Jakarta",
        province_name: "DKI Jakarta",
        address: "Jl. Rasuna Said Kav. 8, Setiabudi, Jakarta Selatan",
        latitude: -6.2215,
        longitude: 106.8315,
        distanceKm: 3.5,
        distanceText: "3.5 km",
        base_price_hourly: 160000,
        priceFormatted: "Rp 160.000",
        rating_avg: 4.85,
        review_count: 164,
        floor_type: "Interlocking Polypropylene Floor",
        court_type: "Indoor Air Conditioned",
        opening_hours: "07:00 - 24:00 WIB",
        description: "Lokasi strategis di pusat perkantoran Kuningan. Lapangan interlock berkualitas empuk meredam benturan lutut, penerangan LED daylight merata, dan kafetaria lengkap.",
        main_image_url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80",
        gallery_images: [
          "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=500&q=80"
        ],
        amenities: ["Lantai Interlock Safe", "Shower Hangat", "Musholla", "Kantin & Minuman Dingin", "Sewa Rompi & Bola"],
        slots: ["09:00", "11:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
        bookedSlots: ["18:00", "20:00"]
      },
      {
        id: "v-6",
        slug: "voli-pantai-taraflex-indoor-medan",
        name: "Voli Pantai & Taraflex Indoor Medan",
        sport: "volleyball",
        sportName: "Bola Voli",
        sportIcon: "🏐",
        city_name: "Medan",
        province_name: "Sumatera Utara",
        address: "Jl. Ringroad No. 12, Medan Sunggal, Kota Medan",
        latitude: 3.5852,
        longitude: 98.6256,
        distanceKm: 5.8,
        distanceText: "5.8 km",
        base_price_hourly: 120000,
        priceFormatted: "Rp 120.000",
        rating_avg: 4.7,
        review_count: 52,
        floor_type: "Gerflor Taraflex Sport M Plus 7mm",
        court_type: "Indoor Hall",
        opening_hours: "08:00 - 22:00 WIB",
        description: "Satu-satunya gelanggang voli indoor di Sumatera Utara dengan karpet Taraflex empuk berstandar FIVB. Mencegah cedera engkel dan lutut bagi atlet dan pecinta bola voli.",
        main_image_url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
        gallery_images: [
          "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80"
        ],
        amenities: ["Lantai Taraflex FIVB", "Ruang Ganti Nyaman", "Parkir Mobil/Motor", "Musholla", "First Aid Kit"],
        slots: ["08:00", "10:00", "14:00", "16:00", "18:00", "20:00"],
        bookedSlots: ["16:00"]
      }
    ];
  }
}
