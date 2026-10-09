import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import {
  User,
  Province,
  City,
  SportsCategory,
  Venue,
  Court,
  VenueAmenity,
  Review,
  CourtSchedule
} from '../models/index.js';
import { USER_ROLES, SCHEDULE_STATUS } from '../constants/index.js';

export async function runFullSeed() {
  console.log('🌱 [Seeder] Memulai seeding data nyata ke PostgreSQL (lapang_db)...');

  // Bersihkan data lama dengan cascade
  await sequelize.query('TRUNCATE TABLE court_schedules, reviews, bookings, venue_amenities, courts, venues, cities, provinces, sports_categories, users RESTART IDENTITY CASCADE;');

  // 1. Seed Users (RBAC: User, Owner, Admin)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [playerUser, ownerUser, adminUser] = await Promise.all([
    User.create({
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Rian Pratama',
      email: 'rian@lapang.id',
      phone: '081234567890',
      password_hash: passwordHash,
      role: USER_ROLES.USER,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      is_verified_player: true
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Hendra Wijaya (Owner Arena)',
      email: 'owner@lapang.id',
      phone: '081987654321',
      password_hash: passwordHash,
      role: USER_ROLES.OWNER,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      is_verified_player: true
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Super Admin Lapang.id',
      email: 'admin@lapang.id',
      phone: '08111222333',
      password_hash: passwordHash,
      role: USER_ROLES.ADMIN,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      is_verified_player: true
    })
  ]);

  console.log('✅ Users seeded (3 akun: user, owner, admin)');

  // 2. Seed Sports Categories
  const categories = await SportsCategory.bulkCreate([
    { id: 'futsal', name: 'Futsal & Mini Soccer', icon: '⚽', color_hex: '#1B5E20' },
    { id: 'badminton', name: 'Badminton', icon: '🏸', color_hex: '#f59e0b' },
    { id: 'basketball', name: 'Basket (Full/3x3)', icon: '🏀', color_hex: '#ea580c' },
    { id: 'padel', name: 'Tenis & Padel', icon: '🎾', color_hex: '#2563eb' },
    { id: 'volleyball', name: 'Bola Voli', icon: '🏐', color_hex: '#059669' }
  ]);
  console.log('✅ Sports Categories seeded (5 kategori)');

  // 3. Seed Provinces & Cities
  await Province.bulkCreate([
    { id: 1, name: 'DKI Jakarta' },
    { id: 2, name: 'Jawa Barat' },
    { id: 3, name: 'Jawa Timur' },
    { id: 4, name: 'Bali' },
    { id: 5, name: 'Sumatera Utara' },
    { id: 6, name: 'Sulawesi Selatan' }
  ]);

  await City.bulkCreate([
    { id: 1, province_id: 1, name: 'Jakarta Selatan', latitude: -6.2615, longitude: 106.8106 },
    { id: 2, province_id: 2, name: 'Bandung', latitude: -6.9175, longitude: 107.6191 },
    { id: 3, province_id: 3, name: 'Surabaya', latitude: -7.2575, longitude: 112.7521 },
    { id: 4, province_id: 4, name: 'Denpasar', latitude: -8.6705, longitude: 115.2126 },
    { id: 5, province_id: 5, name: 'Medan', latitude: 3.5952, longitude: 98.6722 },
    { id: 6, province_id: 6, name: 'Makassar', latitude: -5.1477, longitude: 119.4327 }
  ]);
  console.log('✅ Provinces & Cities seeded');

  // 4. Seed 6 Venues (Persis dengan mockup/code.html)
  const venuesData = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      owner_id: ownerUser.id,
      city_id: 1,
      name: 'The Emerald Arena Jakarta',
      slug: 'the-emerald-arena-jakarta',
      city_name: 'Jakarta',
      province_name: 'DKI Jakarta',
      address: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan',
      latitude: -6.2941,
      longitude: 106.8044,
      phone_number: '0812-9988-7711',
      opening_hours: '06:00 - 24:00 WIB',
      floor_type: 'Rumput Sintetis Monofilament FIFA Standard',
      court_type: 'Semi-Indoor',
      base_price_hourly: 175000,
      main_image_url: 'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=500&q=80'
      ],
      description: 'Venue mini soccer dan futsal premium dengan rumput sintetis standar internasional. Dilengkapi lampu floodlight 500 lux untuk pertandingan malam hari, ruang ganti ber-AC, dan shower air panas.',
      rating_avg: 4.9,
      review_count: 142,
      is_verified: true
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      owner_id: ownerUser.id,
      city_id: 2,
      name: 'GOR Badminton Bintang Dago',
      slug: 'gor-badminton-bintang-dago',
      city_name: 'Bandung',
      province_name: 'Jawa Barat',
      address: 'Jl. Ir. H. Juanda No. 84, Dago, Kota Bandung',
      latitude: -6.8850,
      longitude: 107.6136,
      phone_number: '0822-4455-6677',
      opening_hours: '07:00 - 23:00 WIB',
      floor_type: 'Karpet Vinyl BWF Approved 5mm',
      court_type: 'Indoor Hall',
      base_price_hourly: 85000,
      main_image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-161391808466-292b78a8ef95?auto=format&fit=crop&w=500&q=80'
      ],
      description: 'Pusat bulu tangkis terlengkap di Bandung dengan 6 lapangan karpet vinyl standar kejuaraan BWF. Sirkulasi udara sejuk pegunungan dan kantin dengan menu sehat.',
      rating_avg: 4.8,
      review_count: 96,
      is_verified: true
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      owner_id: ownerUser.id,
      city_id: 4,
      name: 'Sanur Padel & Tennis Club',
      slug: 'sanur-padel-tennis-club',
      city_name: 'Bali',
      province_name: 'Bali',
      address: 'Jl. Danau Tamblingan No. 102, Sanur, Denpasar Selatan',
      latitude: -8.6981,
      longitude: 115.2625,
      phone_number: '0813-1122-3344',
      opening_hours: '06:00 - 22:00 WITA',
      floor_type: 'Panoramic Glass & Textured Silica Turf',
      court_type: 'Outdoor Coastal Court',
      base_price_hourly: 220000,
      main_image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=500&q=80'
      ],
      description: 'Fasilitas Padel Tennis standar turnamen di pinggir pantai Sanur. Nikmati semilir angin laut dan kafe sehat setelah sesi latihan atau sparring.',
      rating_avg: 4.9,
      review_count: 210,
      is_verified: true
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      owner_id: ownerUser.id,
      city_id: 3,
      name: 'Pakuwon Rooftop Basketball Arena',
      slug: 'pakuwon-rooftop-basketball-arena',
      city_name: 'Surabaya',
      province_name: 'Jawa Timur',
      address: 'Pakuwon Mall Lt. 5, Jl. Mayjen Yono Suwoyo No. 2, Surabaya Barat',
      latitude: -7.2892,
      longitude: 112.6756,
      phone_number: '0831-7788-9900',
      opening_hours: '09:00 - 22:00 WIB',
      floor_type: 'Interlocking Polypropylene FIBA 3x3',
      court_type: 'Rooftop Outdoor',
      base_price_hourly: 150000,
      main_image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=500&q=80'
      ],
      description: 'Lapangan basket rooftop dengan pemandangan cakrawala kota Surabaya barat. Lantai interlock empuk anti-selip dan ring hidrolik bersertifikasi FIBA.',
      rating_avg: 4.7,
      review_count: 78,
      is_verified: true
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      owner_id: ownerUser.id,
      city_id: 1,
      name: 'Cilandak Sport Centre Futsal & Badminton',
      slug: 'cilandak-sport-centre',
      city_name: 'Jakarta',
      province_name: 'DKI Jakarta',
      address: 'Jl. Cilandak Tengah No. 45, Pasar Minggu, Jakarta Selatan',
      latitude: -6.2891,
      longitude: 106.8122,
      phone_number: '0812-3344-5566',
      opening_hours: '07:00 - 23:00 WIB',
      floor_type: 'Vinyl Interlock & Parquet Kayu Jati',
      court_type: 'Indoor Sports Hall',
      base_price_hourly: 130000,
      main_image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Pusat olahraga keluarga di Jakarta Selatan dengan 4 lapangan futsal vinyl dan 3 lapangan bulu tangkis berlantai parket kayu jati.',
      rating_avg: 4.85,
      review_count: 114,
      is_verified: true
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      owner_id: ownerUser.id,
      city_id: 2,
      name: 'Surapati Volley & Mini Soccer Hub',
      slug: 'surapati-volley-mini-soccer',
      city_name: 'Bandung',
      province_name: 'Jawa Barat',
      address: 'Jl. Surapati No. 120, Cibeunying Kaler, Kota Bandung',
      latitude: -6.8995,
      longitude: 107.6255,
      phone_number: '0857-1122-8899',
      opening_hours: '06:00 - 24:00 WIB',
      floor_type: 'Taraflex Floor & Synthetic Turf',
      court_type: 'Indoor Multi-Sport Arena',
      base_price_hourly: 110000,
      main_image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Hub olahraga populer di pusat kota Bandung untuk bola voli dan mini soccer. Dilengkapi sound system untuk turnamen dan tribun penonton nyaman.',
      rating_avg: 4.65,
      review_count: 62,
      is_verified: true
    }
  ];

  for (const v of venuesData) {
    await Venue.create(v);
  }
  console.log('✅ 6 Venues seeded ke PostgreSQL');

  // 5. Seed Sub-Courts
  const courtsData = [
    {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      venue_id: '11111111-1111-1111-1111-111111111111',
      category_id: 'futsal',
      name: 'Lapangan Mini Soccer Utama (Sintetis)',
      floor_type: 'Rumput Sintetis FIFA',
      court_type: 'semi_indoor',
      price_hourly: 175000,
      images: ['https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80'],
      is_active: true
    },
    {
      id: 'bbbb2222-2222-2222-2222-222222222222',
      venue_id: '22222222-2222-2222-2222-222222222222',
      category_id: 'badminton',
      name: 'Court 1 - Karpet Vinyl BWF',
      floor_type: 'Vinyl BWF Approved',
      court_type: 'indoor',
      price_hourly: 85000,
      images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'],
      is_active: true
    },
    {
      id: 'cccc3333-3333-3333-3333-333333333333',
      venue_id: '33333333-3333-3333-3333-333333333333',
      category_id: 'padel',
      name: 'Court Sanur Padel A',
      floor_type: 'Textured Silica Turf',
      court_type: 'outdoor',
      price_hourly: 220000,
      images: ['https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80'],
      is_active: true
    },
    {
      id: 'dddd4444-4444-4444-4444-444444444444',
      venue_id: '44444444-4444-4444-4444-444444444444',
      category_id: 'basketball',
      name: 'Rooftop FIBA 3x3 Court',
      floor_type: 'Interlocking Polypropylene',
      court_type: 'outdoor',
      price_hourly: 150000,
      images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'],
      is_active: true
    },
    {
      id: 'eeee5555-5555-5555-5555-555555555555',
      venue_id: '55555555-5555-5555-5555-555555555555',
      category_id: 'futsal',
      name: 'Hall Futsal Vinyl B',
      floor_type: 'Vinyl Interlock',
      court_type: 'indoor',
      price_hourly: 130000,
      images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'],
      is_active: true
    },
    {
      id: 'ffff6666-6666-6666-6666-666666666666',
      venue_id: '66666666-6666-6666-6666-666666666666',
      category_id: 'volleyball',
      name: 'Arena Voli Taraflex Pro',
      floor_type: 'Taraflex Floor',
      court_type: 'indoor',
      price_hourly: 110000,
      images: ['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80'],
      is_active: true
    }
  ];

  await Court.bulkCreate(courtsData);
  console.log('✅ Courts seeded untuk semua venue');

  // 6. Seed Amenities
  const amenitiesList = [
    { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Parkir Luas Mobil/Motor' },
    { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Shower Air Hangat' },
    { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Kantin & Coffee Shop' },
    { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Musholla AC' },
    { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Loker & Ruang Ganti' },
    { venue_id: '11111111-1111-1111-1111-111111111111', amenity_name: 'Sewa Rompi & Bola' },
    { venue_id: '22222222-2222-2222-2222-222222222222', amenity_name: 'Karpet Vinyl BWF' },
    { venue_id: '22222222-2222-2222-2222-222222222222', amenity_name: 'Shower Air Bersih' },
    { venue_id: '22222222-2222-2222-2222-222222222222', amenity_name: 'Kantin Sehat' },
    { venue_id: '22222222-2222-2222-2222-222222222222', amenity_name: 'Musholla' },
    { venue_id: '33333333-3333-3333-3333-333333333333', amenity_name: 'Rental Raket Padel' },
    { venue_id: '33333333-3333-3333-3333-333333333333', amenity_name: 'Kafe Tepi Pantai' },
    { venue_id: '33333333-3333-3333-3333-333333333333', amenity_name: 'Shower Handuk Bersih' },
    { venue_id: '44444444-4444-4444-4444-444444444444', amenity_name: 'Parkir Mall Gratis 2 Jam' },
    { venue_id: '44444444-4444-4444-4444-444444444444', amenity_name: 'Lampu Malam LED 800 Lux' },
    { venue_id: '55555555-5555-5555-5555-555555555555', amenity_name: 'Ruang Tunggu Ber-AC' },
    { venue_id: '55555555-5555-5555-5555-555555555555', amenity_name: 'Toilet Bersih & Shower' },
    { venue_id: '66666666-6666-6666-6666-666666666666', amenity_name: 'Tribun Penonton 150 Kursi' },
    { venue_id: '66666666-6666-6666-6666-666666666666', amenity_name: 'Sound System Wireless' }
  ];

  await VenueAmenity.bulkCreate(amenitiesList);
  console.log('✅ Venue Amenities seeded');

  // 7. Seed Reviews dengan Rincian 4 Aspek & Balasan Pengelola
  const reviewsData = [
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
      photos: [],
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'cccc2222-2222-2222-2222-222222222222',
      venue_id: '11111111-1111-1111-1111-111111111111',
      user_name: 'Reza Fahlevi',
      user_role: 'Verified Booker',
      rating_overall: 4.8,
      rating_floor: 5,
      rating_lighting: 4,
      rating_cleanliness: 5,
      rating_hospitality: 5,
      comment: 'Fasilitas shower air hangatnya berfungsi sempurna setelah main malam. Parkir mobil sangat lega dan aman dijaga satpam.',
      owner_reply: 'Siap Mas Reza, kami terus jaga kebersihan fasilitas mandi dan keamanan area parkir kami.',
      photos: [],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'cccc3333-3333-3333-3333-333333333333',
      venue_id: '22222222-2222-2222-2222-222222222222',
      user_name: 'Dinda Kirana',
      user_role: 'Verified Booker',
      rating_overall: 4.9,
      rating_floor: 5,
      rating_lighting: 5,
      rating_cleanliness: 5,
      rating_hospitality: 4,
      comment: 'Karpet vinyl BWF di GOR ini benar-benar premium, cengkeraman sepatu sangat pas dan tidak licin sama sekali. Sirkulasi udaranya sejuk!',
      owner_reply: 'Hatur nuhun Teh Dinda! Ditunggu latihan rutin berikutnya di GOR Bintang Dago.',
      photos: [],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'cccc4444-4444-4444-4444-444444444444',
      venue_id: '33333333-3333-3333-3333-333333333333',
      user_name: 'Michael Tan',
      user_role: 'Verified Booker',
      rating_overall: 5.0,
      rating_floor: 5,
      rating_lighting: 5,
      rating_cleanliness: 5,
      rating_hospitality: 5,
      comment: 'Best padel courts in Bali! Lapangan sangat terawat, kaca tebal standar internasional, dan pelayanan kafe sangat memuaskan.',
      owner_reply: 'Thank you Michael! Glad you had a great match with your mates!',
      photos: [],
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];

  await Review.bulkCreate(reviewsData);
  console.log('✅ Reviews seeded');

  // 8. Seed Court Schedules (Hari Ini & Besok untuk semua sub-court)
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const schedulesToInsert = [];
  for (const c of courtsData) {
    for (const d of [todayStr, tomorrowStr]) {
      for (const slot of timeSlots) {
        // Buat beberapa slot sudah terisi (booked) agar realistis
        const isBooked = (slot === '08:00' || slot === '15:00' || slot === '19:00');
        schedulesToInsert.push({
          court_id: c.id,
          date: d,
          time_slot: slot,
          status: isBooked ? SCHEDULE_STATUS.BOOKED : SCHEDULE_STATUS.AVAILABLE,
          price: c.price_hourly
        });
      }
    }
  }

  await CourtSchedule.bulkCreate(schedulesToInsert);
  console.log(`✅ Court Schedules seeded (${schedulesToInsert.length} slot waktu untuk hari ini dan besok)`);

  console.log('🎉 [Seeder Selesai] Seluruh data master, lapangan, ulasan, dan jadwal telah terisi nyata di PostgreSQL!');
}

// Eksekusi langsung jika dipanggil via node seeders/seed.js
if (process.argv[1].endsWith('seed.js')) {
  runFullSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Gagal menjalankan seeder:', err);
      process.exit(1);
    });
}
