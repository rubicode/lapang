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
  CourtSchedule,
  Booking
} from '../models/index.js';
import { USER_ROLES, SCHEDULE_STATUS, BOOKING_STATUS, PAYMENT_STATUS } from '../constants/index.js';

export async function runFullSeed() {
  console.log('🌱 [Seeder] Memulai seeding data nyata ke PostgreSQL (lapang_db)...');

  // Bersihkan data lama dengan cascade
  await sequelize.query('TRUNCATE TABLE court_schedules, reviews, bookings, venue_amenities, courts, venues, cities, provinces, sports_categories, users RESTART IDENTITY CASCADE;');

  // 1. Seed Users (RBAC: User, Owner, Admin)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [
    playerUser,
    ownerUser,
    adminUser,
    marcoUser,
    sarahUser,
    robertUser,
    davidUser,
    marcusUser
  ] = await Promise.all([
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
      name: 'Alex Thompson',
      email: 'admin@lapang.id',
      phone: '08111222333',
      password_hash: passwordHash,
      role: USER_ROLES.ADMIN,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      is_verified_player: true
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000004',
      name: 'Marco Arantes',
      email: 'marco.a@fieldhub.pt',
      phone: '+351 912 345 678',
      password_hash: passwordHash,
      role: USER_ROLES.OWNER,
      avatar_url: null,
      is_verified_player: false
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000005',
      name: 'Sarah Jenkins',
      email: 's.jenkins@sportslink.com',
      phone: '+44 20 7946 0912',
      password_hash: passwordHash,
      role: USER_ROLES.OWNER,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      is_verified_player: true
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000006',
      name: 'Robert Kagawa',
      email: 'r.kagawa@kyotosoccer.jp',
      phone: '+81 75 321 8844',
      password_hash: passwordHash,
      role: USER_ROLES.OWNER,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      is_verified_player: false
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000007',
      name: 'David Chen',
      email: 'd.chen@shanghaisports.cn',
      phone: '+86 21 6234 5678',
      password_hash: passwordHash,
      role: USER_ROLES.OWNER,
      avatar_url: null,
      is_verified_player: true
    }),
    User.create({
      id: '10000000-0000-0000-0000-000000000008',
      name: 'Marcus Silva',
      email: 'marcus@lapang.id',
      phone: '+62 812 3456 7890',
      password_hash: passwordHash,
      role: USER_ROLES.OWNER,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      is_verified_player: true
    })
  ]);

  console.log('✅ Users seeded (Pemain, Pemilik Fasilitas, & Global Admin Alex Thompson)');

  // 2. Seed Sports Categories
  await SportsCategory.bulkCreate([
    { id: 'futsal', name: 'Futsal & Mini Soccer', icon: '⚽', color_hex: '#1B5E20' },
    { id: 'badminton', name: 'Badminton', icon: '🏸', color_hex: '#f59e0b' },
    { id: 'basketball', name: 'Basket (Full/3x3)', icon: '🏀', color_hex: '#ea580c' },
    { id: 'padel', name: 'Tenis & Padel', icon: '🎾', color_hex: '#2563eb' },
    { id: 'volleyball', name: 'Bola Voli', icon: '🏐', color_hex: '#059669' }
  ]);
  console.log('✅ Sports Categories seeded (5 kategori)');

  // 3. Seed Provinces & Cities (Hanya Provinsi & Kota di Indonesia)
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
  console.log('✅ Provinces & Cities seeded (Semua di Indonesia)');

  // 4. Seed Venues
  const venuesData = [
    // --- Mockup Verification Queue Applications (Berlokasi di Indonesia) ---
    {
      id: '11110000-0000-0000-0000-000000000001',
      owner_id: marcoUser.id,
      city_id: 5,
      name: 'Arena Lisbon Pro',
      slug: 'arena-lisbon-pro',
      city_name: 'Medan',
      province_name: 'Sumatera Utara',
      address: 'Jl. Balai Kota No. 12, Kesawan, Medan Barat, Medan',
      latitude: 3.5952,
      longitude: 98.6722,
      phone_number: '0812-3456-7890',
      opening_hours: '08:00 - 23:00 WIB',
      floor_type: 'Futsal & Padel Interlock',
      court_type: 'Indoor Hall',
      base_price_hourly: 180000,
      main_image_url: 'https://images.unsplash.com/photo-1529900245534-47fbf5de828a?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1529900245534-47fbf5de828a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Aplikasi baru fasilitas olahraga futsal & padel indoor dengan 4 lapangan.',
      rating_avg: 5.0,
      review_count: 0,
      is_verified: false,
      verification_status: 'Pending Review',
      verification_submitted_at: new Date('2023-10-24T10:00:00Z'),
      sport_type: 'Futsal & Padel',
      verification_documents: [
        { name: 'Commercial_Registration_Lisbon.pdf', size: '2.4 MB', type: 'PDF' },
        { name: 'Safety_Inspection_Certificate.pdf', size: '1.1 MB', type: 'PDF' }
      ],
      verification_notes: 'Aplikasi baru fasilitas olahraga futsal & padel indoor dengan 4 lapangan.'
    },
    {
      id: '11110000-0000-0000-0000-000000000002',
      owner_id: sarahUser.id,
      city_id: 6,
      name: 'Jenkins Multisport',
      slug: 'jenkins-multisport',
      city_name: 'Makassar',
      province_name: 'Sulawesi Selatan',
      address: 'Jl. Penghibur No. 42, Losari, Ujung Pandang, Makassar',
      latitude: -5.1477,
      longitude: 119.4327,
      phone_number: '0813-4567-8901',
      opening_hours: '06:30 - 22:30 WITA',
      floor_type: 'Badminton & Squash Hardwood',
      court_type: 'Indoor Hall',
      base_price_hourly: 150000,
      main_image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Pusat olahraga bulu tangkis dan squash modern di pusat kota Makassar.',
      rating_avg: 4.9,
      review_count: 32,
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-10-22T09:30:00Z'),
      sport_type: 'Badminton & Squash',
      verification_documents: [
        { name: 'UK_Sports_Council_Approval.pdf', size: '3.1 MB', type: 'PDF' }
      ],
      verification_notes: 'Terverifikasi penuh oleh tim audit kepatuhan fasilitas.'
    },
    {
      id: '11110000-0000-0000-0000-000000000003',
      owner_id: robertUser.id,
      city_id: 2,
      name: 'Kyoto Soccer Park',
      slug: 'kyoto-soccer-park',
      city_name: 'Bandung',
      province_name: 'Jawa Barat',
      address: 'Jl. Dago Asri No. 15, Dago, Coblong, Bandung',
      latitude: -6.8780,
      longitude: 107.6180,
      phone_number: '0814-5678-9012',
      opening_hours: '07:00 - 23:00 WIB',
      floor_type: 'Synthetic Turf 5G',
      court_type: 'Outdoor Arena',
      base_price_hourly: 190000,
      main_image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Arena mini soccer outdoor di kawasan Dago Bandung dengan pemandangan pegunungan.',
      rating_avg: 4.8,
      review_count: 14,
      is_verified: false,
      verification_status: 'Action Required',
      verification_submitted_at: new Date('2023-10-20T14:15:00Z'),
      sport_type: 'Futsal Turf',
      verification_documents: [
        { name: 'Kyoto_Municipal_Application.pdf', size: '1.8 MB', type: 'PDF' }
      ],
      verification_issue_note: 'Perpanjangan Sertifikat Kelaikan Pemadam Kebakaran & Bukti IMB Olahraga Komersial belum lengkap.',
      verification_notes: 'Menunggu kelengkapan berkas izin keselamatan pemadam kebakaran.'
    },
    {
      id: '11110000-0000-0000-0000-000000000004',
      owner_id: davidUser.id,
      city_id: 3,
      name: 'Victory Stadium Shanghai',
      slug: 'victory-stadium-shanghai',
      city_name: 'Surabaya',
      province_name: 'Jawa Timur',
      address: 'Jl. Mayjen Sungkono No. 50, Sawahan, Surabaya',
      latitude: -7.2850,
      longitude: 112.7200,
      phone_number: '0815-6789-0123',
      opening_hours: '06:00 - 24:00 WIB',
      floor_type: 'Hardwood FIBA & Acrylic Tennis',
      court_type: 'Multi-Level Complex',
      base_price_hourly: 250000,
      main_image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Kompleks olahraga multifungsi elit di kawasan Surabaya.',
      rating_avg: 4.95,
      review_count: 65,
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-10-19T11:00:00Z'),
      sport_type: 'Basketball & Tennis',
      verification_documents: [
        { name: 'Shanghai_Sports_Bureau_Permit.pdf', size: '4.0 MB', type: 'PDF' }
      ],
      verification_notes: 'Dokumen lengkap dan fasilitas telah disurvei langsung oleh tim pengawas.'
    },

    // --- Indonesian Venues ---
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
      main_image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=80',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=500&q=80'
      ],
      description: 'Venue mini soccer dan futsal premium dengan rumput sintetis standar internasional. Dilengkapi lampu floodlight 500 lux untuk pertandingan malam hari, ruang ganti ber-AC, dan shower air panas.',
      rating_avg: 4.9,
      review_count: 142,
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-09-15T08:00:00Z'),
      sport_type: 'Futsal & Mini Soccer'
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
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-09-20T10:00:00Z'),
      sport_type: 'Badminton'
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
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-09-25T11:30:00Z'),
      sport_type: 'Tenis & Padel'
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
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-10-01T15:00:00Z'),
      sport_type: 'Basket (Full/3x3)'
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
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-10-05T12:00:00Z'),
      sport_type: 'Futsal & Mini Soccer'
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
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-10-10T16:00:00Z'),
      sport_type: 'Bola Voli'
    },
    {
      id: '11110000-0000-0000-0000-000000000009',
      owner_id: marcusUser.id,
      city_id: 1,
      name: 'Pitch Gallery Sports Complex',
      slug: 'pitch-gallery-sports-complex',
      city_name: 'Jakarta',
      province_name: 'DKI Jakarta',
      address: 'Downtown Sports District, Central Blvd No. 1',
      district: 'Downtown Sports District',
      unique_visitors_count: 3842,
      currency: 'USD',
      early_bird_promo_active: false,
      early_bird_discount_percent: 20,
      latitude: -6.2088,
      longitude: 106.8456,
      phone_number: '+62 812 3456 7890',
      opening_hours: '06:00 - 24:00',
      floor_type: 'FIFA Standard Turf & Premium Rubber',
      court_type: 'Outdoor & Indoor Turf',
      base_price_hourly: 85,
      main_image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      gallery_images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Kompleks lapangan premium berstandar internasional yang dikelola oleh Marcus Silva.',
      rating_avg: 4.90,
      review_count: 142,
      is_verified: true,
      verification_status: 'Verified',
      verification_submitted_at: new Date('2023-08-10T10:00:00Z'),
      sport_type: 'Sepak Bola / Mini Soccer'
    }
  ];

  for (const v of venuesData) {
    await Venue.create(v);
  }
  console.log(`✅ ${venuesData.length} Venues seeded ke PostgreSQL (termasuk antrean verifikasi & arena nasional)`);

  // 5. Seed Sub-Courts (Dengan Data IoT Field Monitoring Sesuai Mockup)
  const courtsData = [
    {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      venue_id: '11111111-1111-1111-1111-111111111111',
      category_id: 'futsal',
      name: 'Stamford Bridge Turf A',
      floor_type: 'Rumput Sintetis Monofilament FIFA',
      court_type: 'semi_indoor',
      price_hourly: 175000,
      images: [
        'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80'
      ],
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 60,
      active_players_count: 8,
      current_match: 'Chelsea Academy Youth vs Fulham U19',
      lighting_telemetry: 'Active (1000 Lux)',
      temperature_telemetry: '18°C',
      pitch_health_telemetry: 'Optimal (Moisture 24%)',
      time_remaining: '38 mins remaining'
    },
    {
      id: 'bbbb2222-2222-2222-2222-222222222222',
      venue_id: '22222222-2222-2222-2222-222222222222',
      category_id: 'badminton',
      name: 'The Indoor Hub - Field 2',
      floor_type: 'Vinyl BWF Approved 5mm',
      court_type: 'indoor',
      price_hourly: 85000,
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
      ],
      is_active: false,
      monitoring_status: 'MAINTENANCE',
      occupancy_rate: 0,
      active_players_count: 0,
      maintenance_task: 'Deep Turf Grooming & Infill Replacement',
      expected_online: 'Today, 14:00 CET',
      temperature_telemetry: '21°C Indoor',
      lighting_telemetry: 'Service Mode (400 Lux)'
    },
    {
      id: 'cccc3333-3333-3333-3333-333333333333',
      venue_id: '33333333-3333-3333-3333-333333333333',
      category_id: 'padel',
      name: 'Sunshine Coast Arena',
      floor_type: 'Textured Silica Turf',
      court_type: 'outdoor',
      price_hourly: 220000,
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80'
      ],
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 95,
      active_players_count: 12,
      current_match: 'Queensland Premier League 7-a-side Tournament',
      lighting_telemetry: 'Natural Sunlight',
      temperature_telemetry: '26°C',
      pitch_health_telemetry: '98% Quality Rating',
      time_remaining: '14 mins remaining'
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
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 80,
      active_players_count: 6,
      lighting_telemetry: 'LED 800 Lux',
      temperature_telemetry: '28°C'
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
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 70,
      active_players_count: 10,
      lighting_telemetry: 'Indoor 600 Lux',
      temperature_telemetry: '25°C'
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
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 50,
      active_players_count: 12,
      lighting_telemetry: 'Indoor 750 Lux',
      temperature_telemetry: '24°C'
    },
    // --- Marcus Silva Courts (Pitch Gallery Dashboard Assets) ---
    {
      id: 'aaaa9999-1111-1111-1111-111111111111',
      venue_id: '11110000-0000-0000-0000-000000000009',
      category_id: 'futsal',
      name: 'Arena X Elite',
      floor_type: 'Turf Pro FIFA Standard',
      court_type: 'outdoor',
      match_format: '5-a-side',
      surface_spec: 'Outdoor Pro',
      price_hourly: 85,
      main_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1529900245534-47fbf5de828a?auto=format&fit=crop&w=800&q=80'
      ],
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 85,
      active_players_count: 10,
      current_match: 'Downtown League 5v5',
      lighting_telemetry: 'Active (1000 Lux)',
      temperature_telemetry: '22°C',
      pitch_health_telemetry: 'Optimal (Moisture 20%)',
      time_remaining: '25 mins remaining'
    },
    {
      id: 'aaaa9999-2222-2222-2222-222222222222',
      venue_id: '11110000-0000-0000-0000-000000000009',
      category_id: 'futsal',
      name: 'The Forest Turf',
      floor_type: 'Synthetic Grass Monofilament',
      court_type: 'indoor',
      match_format: '7-a-side',
      surface_spec: 'Indoor',
      price_hourly: 110,
      main_image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80'
      ],
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 90,
      active_players_count: 14,
      current_match: 'Corporate Cup Semifinal',
      lighting_telemetry: 'Active (800 Lux)',
      temperature_telemetry: '21°C Indoor',
      pitch_health_telemetry: 'Excellent (Moisture 18%)',
      time_remaining: '40 mins remaining'
    },
    {
      id: 'aaaa9999-3333-3333-3333-333333333333',
      venue_id: '11110000-0000-0000-0000-000000000009',
      category_id: 'futsal',
      name: 'Suburban Green Pitch',
      floor_type: 'Natural Hybrid Turf',
      court_type: 'outdoor',
      match_format: '5-a-side',
      surface_spec: 'Turf Pro',
      price_hourly: 95,
      main_image: 'https://images.unsplash.com/photo-1529900245534-47fbf5de828a?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1529900245534-47fbf5de828a?auto=format&fit=crop&w=800&q=80'
      ],
      is_active: true,
      monitoring_status: 'LIVE',
      occupancy_rate: 65,
      active_players_count: 10,
      lighting_telemetry: 'Active (900 Lux)',
      temperature_telemetry: '23°C'
    }
  ];

  await Court.bulkCreate(courtsData);
  console.log('✅ Courts seeded lengkap dengan metrik IoT Monitoring');

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

  // 7. Seed Reviews
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

  // 8. Seed Bookings (Untuk Menghasilkan Total Revenue & Active Bookings Riil di Database)
  const bookingsData = [
    {
      id: 'b1111111-1111-1111-1111-111111111111',
      booking_code: 'LAPANG-2024-ID-8849',
      user_id: playerUser.id,
      venue_id: '11111111-1111-1111-1111-111111111111',
      court_id: 'aaaa1111-1111-1111-1111-111111111111',
      venue_name: 'The Emerald Arena Jakarta',
      customer_name: 'Bagus Hendrawan',
      customer_phone: '081234567890',
      date: new Date().toISOString().split('T')[0],
      time_slot: '19:00 - 21:00',
      total_amount: 350000,
      payment_method: 'QRIS',
      payment_status: PAYMENT_STATUS.SETTLEMENT,
      booking_status: BOOKING_STATUS.CONFIRMED,
      midtrans_snap_token: 'SNAP-demo-token-001'
    },
    {
      id: 'b2222222-2222-2222-2222-222222222222',
      booking_code: 'LAPANG-2024-ID-8850',
      user_id: playerUser.id,
      venue_id: '22222222-2222-2222-2222-222222222222',
      court_id: 'bbbb2222-2222-2222-2222-222222222222',
      venue_name: 'GOR Badminton Bintang Dago',
      customer_name: 'Dinda Kirana',
      customer_phone: '081298765432',
      date: new Date().toISOString().split('T')[0],
      time_slot: '16:00 - 18:00',
      total_amount: 170000,
      payment_method: 'QRIS',
      payment_status: PAYMENT_STATUS.SETTLEMENT,
      booking_status: BOOKING_STATUS.CONFIRMED,
      midtrans_snap_token: 'SNAP-demo-token-002'
    },
    {
      id: 'b3333333-3333-3333-3333-333333333333',
      booking_code: 'LAPANG-2024-ID-8851',
      user_id: playerUser.id,
      venue_id: '33333333-3333-3333-3333-333333333333',
      court_id: 'cccc3333-3333-3333-3333-333333333333',
      venue_name: 'Sanur Padel & Tennis Club',
      customer_name: 'Michael Tan',
      customer_phone: '081377889900',
      date: new Date().toISOString().split('T')[0],
      time_slot: '08:00 - 10:00',
      total_amount: 440000,
      payment_method: 'QRIS',
      payment_status: PAYMENT_STATUS.SETTLEMENT,
      booking_status: BOOKING_STATUS.CONFIRMED,
      midtrans_snap_token: 'SNAP-demo-token-003'
    },
    // --- Marcus Silva Bookings (Pitch Gallery Overview Dashboard) ---
    {
      id: 'b9999999-1111-1111-1111-111111111111',
      booking_code: 'PITCH-2024-001',
      user_id: playerUser.id,
      venue_id: '11110000-0000-0000-0000-000000000009',
      court_id: 'aaaa9999-1111-1111-1111-111111111111',
      venue_name: 'Arena X Elite',
      customer_name: 'Julian Draxler',
      customer_phone: '+62 811 2233 4455',
      date: new Date().toISOString().split('T')[0],
      time_slot: '18:00 - 19:00',
      total_amount: 85,
      payment_method: 'Stripe',
      payment_status: PAYMENT_STATUS.SETTLEMENT,
      booking_status: BOOKING_STATUS.CONFIRMED,
      created_at: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: 'b9999999-2222-2222-2222-222222222222',
      booking_code: 'PITCH-2024-002',
      user_id: playerUser.id,
      venue_id: '11110000-0000-0000-0000-000000000009',
      court_id: 'aaaa9999-2222-2222-2222-222222222222',
      venue_name: 'The Forest Turf',
      customer_name: 'Marta Lima',
      customer_phone: '+62 811 2233 4466',
      date: new Date().toISOString().split('T')[0],
      time_slot: '20:00 - 21:00',
      total_amount: 110,
      payment_method: 'Stripe',
      payment_status: PAYMENT_STATUS.UNPAID,
      booking_status: BOOKING_STATUS.PENDING,
      created_at: new Date(Date.now() - 35 * 60 * 1000)
    },
    {
      id: 'b9999999-3333-3333-3333-333333333333',
      booking_code: 'PITCH-2024-003',
      user_id: playerUser.id,
      venue_id: '11110000-0000-0000-0000-000000000009',
      court_id: 'aaaa9999-1111-1111-1111-111111111111',
      venue_name: 'Arena X Elite',
      customer_name: 'Robert K.',
      customer_phone: '+62 811 2233 4477',
      date: new Date().toISOString().split('T')[0],
      time_slot: '16:00 - 17:00',
      total_amount: 85,
      payment_method: 'Stripe',
      payment_status: PAYMENT_STATUS.SETTLEMENT,
      booking_status: BOOKING_STATUS.CONFIRMED,
      created_at: new Date(Date.now() - 90 * 60 * 1000)
    },
    {
      id: 'b9999999-4444-4444-4444-444444444444',
      booking_code: 'PITCH-2024-004',
      user_id: playerUser.id,
      venue_id: '11110000-0000-0000-0000-000000000009',
      court_id: 'aaaa9999-2222-2222-2222-222222222222',
      venue_name: 'The Forest Turf',
      customer_name: 'Sarah Hughes',
      customer_phone: '+62 811 2233 4488',
      date: new Date().toISOString().split('T')[0],
      time_slot: '09:00 - 10:00',
      total_amount: 0,
      payment_method: 'Stripe',
      payment_status: PAYMENT_STATUS.CANCEL,
      booking_status: BOOKING_STATUS.CANCELLED,
      created_at: new Date(Date.now() - 150 * 60 * 1000)
    }
  ];

  // Tambahkan booking riil historis untuk Marcus Silva agar total revenue tepat $24,580 dan active bookings tepat 142
  for (let i = 1; i <= 139; i++) {
    const amount = (i === 139) ? 260 : 175;
    const courtId = (i % 2 === 0) ? 'aaaa9999-1111-1111-1111-111111111111' : 'aaaa9999-2222-2222-2222-222222222222';
    const courtName = (i % 2 === 0) ? 'Arena X Elite' : 'The Forest Turf';
    bookingsData.push({
      id: `b8880000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      booking_code: `PITCH-HIST-${1000 + i}`,
      user_id: playerUser.id,
      venue_id: '11110000-0000-0000-0000-000000000009',
      court_id: courtId,
      venue_name: courtName,
      customer_name: `Member Player ${i}`,
      customer_phone: `+62 812 0000 ${String(i).padStart(4, '0')}`,
      date: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time_slot: `${10 + (i % 10)}:00 - ${11 + (i % 10)}:00`,
      total_amount: amount,
      payment_method: 'Stripe',
      payment_status: PAYMENT_STATUS.SETTLEMENT,
      booking_status: BOOKING_STATUS.CONFIRMED,
      created_at: new Date(Date.now() - (i * 2 + 5) * 60 * 60 * 1000)
    });
  }

  await Booking.bulkCreate(bookingsData);
  console.log('✅ Bookings terverifikasi berhasil disimpan di PostgreSQL');

  // 9. Seed Court Schedules
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const schedulesToInsert = [];
  for (const c of courtsData) {
    for (const d of [todayStr, tomorrowStr]) {
      for (const slot of timeSlots) {
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
  console.log(`✅ Court Schedules seeded (${schedulesToInsert.length} slot waktu)`);

  console.log('🎉 [Seeder Selesai] Seluruh data master, lapangan, admin, dan jadwal telah terisi nyata di PostgreSQL!');
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
