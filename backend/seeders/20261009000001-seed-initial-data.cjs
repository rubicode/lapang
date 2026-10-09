'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Seed Sports Categories
    await queryInterface.bulkInsert('sports_categories', [
      { id: 'futsal', name: 'Futsal & Mini Soccer', icon: '⚽', color_hex: '#1B5E20' },
      { id: 'badminton', name: 'Badminton', icon: '🏸', color_hex: '#f59e0b' },
      { id: 'basketball', name: 'Basket (Full/3x3)', icon: '🏀', color_hex: '#ea580c' },
      { id: 'padel', name: 'Tenis & Padel', icon: '🎾', color_hex: '#2563eb' },
      { id: 'volleyball', name: 'Bola Voli', icon: '🏐', color_hex: '#059669' }
    ]);

    // 2. Seed Provinces & Cities
    await queryInterface.bulkInsert('provinces', [
      { id: 1, name: 'DKI Jakarta' },
      { id: 2, name: 'Jawa Barat' },
      { id: 3, name: 'Jawa Timur' },
      { id: 4, name: 'Bali' },
      { id: 5, name: 'Sumatera Utara' },
      { id: 6, name: 'Sulawesi Selatan' }
    ]);

    await queryInterface.bulkInsert('cities', [
      { id: 1, province_id: 1, name: 'Jakarta Selatan', latitude: -6.2615, longitude: 106.8106 },
      { id: 2, province_id: 2, name: 'Bandung', latitude: -6.9175, longitude: 107.6191 },
      { id: 3, province_id: 3, name: 'Surabaya', latitude: -7.2575, longitude: 112.7521 },
      { id: 4, province_id: 4, name: 'Denpasar', latitude: -8.6705, longitude: 115.2126 },
      { id: 5, province_id: 5, name: 'Medan', latitude: 3.5952, longitude: 98.6722 },
      { id: 6, province_id: 6, name: 'Makassar', latitude: -5.1477, longitude: 119.4327 }
    ]);

    // 3. Seed Venues
    const venues = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'The Emerald Arena Jakarta',
        slug: 'the-emerald-arena-jakarta',
        city_id: 1,
        city_name: 'Jakarta',
        province_name: 'DKI Jakarta',
        address: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan',
        latitude: -6.2941,
        longitude: 106.8044,
        base_price_hourly: 175000,
        rating_avg: 4.9,
        review_count: 142,
        floor_type: 'Rumput Sintetis Monofilament FIFA Standard',
        court_type: 'Semi-Indoor',
        opening_hours: '06:00 - 24:00 WIB',
        description: 'Venue mini soccer dan futsal premium dengan rumput sintetis standar internasional. Dilengkapi lampu floodlight 500 lux untuk pertandingan malam hari, ruang ganti ber-AC, dan shower air panas.',
        main_image_url: 'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
        gallery_images: JSON.stringify([
          'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
          'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=500&q=80'
        ]),
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'GOR Badminton Bintang Dago',
        slug: 'gor-badminton-bintang-dago',
        city_id: 2,
        city_name: 'Bandung',
        province_name: 'Jawa Barat',
        address: 'Jl. Ir. H. Juanda No. 84, Dago, Kota Bandung',
        latitude: -6.8850,
        longitude: 107.6136,
        base_price_hourly: 85000,
        rating_avg: 4.8,
        review_count: 96,
        floor_type: 'Karpet Vinyl BWF Approved 5mm',
        court_type: 'Indoor Hall',
        opening_hours: '07:00 - 23:00 WIB',
        description: 'Pusat bulu tangkis terlengkap di Bandung dengan 6 lapangan karpet vinyl standar kejuaraan BWF. Sirkulasi udara sejuk pegunungan.',
        main_image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        gallery_images: JSON.stringify([
          'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-161391808466-292b78a8ef95?auto=format&fit=crop&w=500&q=80'
        ]),
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Sanur Padel & Tennis Club',
        slug: 'sanur-padel-tennis-club',
        city_id: 4,
        city_name: 'Bali',
        province_name: 'Bali',
        address: 'Jl. Danau Tamblingan No. 102, Sanur, Denpasar Selatan',
        latitude: -8.6981,
        longitude: 115.2625,
        base_price_hourly: 220000,
        rating_avg: 4.95,
        review_count: 210,
        floor_type: 'Panoramic Glass & Textured Silica Turf',
        court_type: 'Outdoor Coastal Court',
        opening_hours: '06:00 - 22:00 WITA',
        description: 'Fasilitas Padel Tennis standar turnamen di pinggir pantai Sanur.',
        main_image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
        gallery_images: JSON.stringify([
          'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80'
        ]),
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('venues', venues);

    // 4. Seed Courts
    await queryInterface.bulkInsert('courts', [
      {
        id: 'aaaa1111-1111-1111-1111-111111111111',
        venue_id: '11111111-1111-1111-1111-111111111111',
        category_id: 'futsal',
        name: 'Lapangan Mini Soccer 1 (Sintetis)',
        floor_type: 'Rumput Sintetis',
        court_type: 'semi_indoor',
        price_hourly: 175000,
        images: JSON.stringify(['https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80']),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'bbbb2222-2222-2222-2222-222222222222',
        venue_id: '22222222-2222-2222-2222-222222222222',
        category_id: 'badminton',
        name: 'Lapangan Badminton 1 (Vinyl BWF)',
        floor_type: 'Vinyl BWF',
        court_type: 'indoor',
        price_hourly: 85000,
        images: JSON.stringify(['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80']),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 5. Seed Venue Amenities
    await queryInterface.bulkInsert('venue_amenities', [
      { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Parkir Luas Mobil/Motor' },
      { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Shower Air Hangat' },
      { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Kantin & Coffee Shop' },
      { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Musholla AC' },
      { venue_id: '22222222-2222-2222-2222-222222222222', amenity_name: 'Karpet Vinyl BWF' },
      { venue_id: '22222222-2222-2222-2222-222222222222', amenity_name: 'Shower Air Bersih' }
    ]);

    // 6. Seed Sample Reviews
    await queryInterface.bulkInsert('reviews', [
      {
        id: 'cccc1111-1111-1111-1111-111111111111',
        venue_id: '11111111-1111-1111-1111-111111111111',
        user_name: 'Bagus Hendrawan',
        user_role: 'Verified Booker',
        rating_overall: 5.0,
        rating_floor: 5,
        rating_lighting: 5,
        rating_cleanliness: 5,
        rating_hospitality: 5,
        comment: 'Rumput sintetis empuk banget dan gak bikin lecet saat tackling. Lampu malamnya terang merata tanpa silau. Staf lapangan ramah sekali!',
        owner_reply: 'Terima kasih Mas Bagus! Senang tim Anda puas bermain di lapangan kami. Sampai jumpa di jadwal sparring berikutnya!',
        photos: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('reviews', null, {});
    await queryInterface.bulkDelete('venue_amenities', null, {});
    await queryInterface.bulkDelete('courts', null, {});
    await queryInterface.bulkDelete('venues', null, {});
    await queryInterface.bulkDelete('cities', null, {});
    await queryInterface.bulkDelete('provinces', null, {});
    await queryInterface.bulkDelete('sports_categories', null, {});
  }
};
