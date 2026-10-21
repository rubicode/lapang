import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Venue, Court } from '../models/index.js';
import { ENV } from '../config/environment.js';
import { USER_ROLES } from '../constants/index.js';

export class AuthService {
  /**
   * Enkripsi kata sandi menggunakan bcrypt salt rounds 10
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verifikasi kecocokan kata sandi
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token yang memuat ID, role, dan email
   */
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      is_verified_player: user.is_verified_player
    };
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
  }

  /**
   * Verifikasi token JWT
   */
  static verifyToken(token) {
    return jwt.verify(token, ENV.JWT_SECRET);
  }

  /**
   * Pendaftaran akun baru
   */
  static async register({ name, email, password, phone = null, role = USER_ROLES.USER }) {
    if (!name || !email || !password) {
      throw new Error('Nama, email, dan kata sandi wajib diisi.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Periksa apakah email sudah terdaftar
    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
    }

    // Validasi role
    const allowedRoles = Object.values(USER_ROLES);
    const userRole = allowedRoles.includes(role) ? role : USER_ROLES.USER;

    const passwordHash = await this.hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone,
      password_hash: passwordHash,
      role: userRole,
      is_verified_player: userRole === USER_ROLES.USER
    });

    // Jika mendaftar sebagai Owner, buatkan Venue dan Lapangan khusus untuk akun tersebut
    if (userRole === USER_ROLES.OWNER) {
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSuffix = newUser.id.slice(0, 8);
      const venueSlug = `${slugBase}-arena-${uniqueSuffix}`;

      const newVenue = await Venue.create({
        owner_id: newUser.id,
        city_id: 1,
        city_name: 'Jakarta Selatan',
        province_name: 'DKI Jakarta',
        name: `Arena Olahraga ${name.trim()}`,
        slug: venueSlug,
        address: 'Jl. Pemuda Olahraga No. 1, Jakarta Selatan',
        latitude: -6.2615,
        longitude: 106.8106,
        phone_number: phone || '081234567890',
        opening_hours: '08:00 - 23:00 WIB',
        floor_type: 'Vinyl Approved',
        court_type: 'Indoor',
        base_price_hourly: 150000,
        main_image_url: 'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
        gallery_images: [
          'https://images.unsplash.com/photo-1529900245534-47fbf8221565?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
        ],
        description: `Fasilitas venue olahraga resmi dikelola oleh ${name.trim()}. Menyediakan fasilitas olahraga terawat dengan standar kompetisi.`,
        rating_avg: 5.0,
        review_count: 0,
        is_verified: true,
        verification_status: 'Approved',
        sport_type: 'Futsal & Mini Soccer'
      });

      await Court.create({
        venue_id: newVenue.id,
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

    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        is_verified_player: newUser.is_verified_player
      }
    };
  }

  /**
   * Otentikasi login
   */
  static async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email dan kata sandi wajib diisi.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      throw new Error('Kredensial tidak valid. Email atau kata sandi salah.');
    }

    const isMatch = await this.comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Kredensial tidak valid. Email atau kata sandi salah.');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified_player: user.is_verified_player
      }
    };
  }

  /**
   * Mengambil profil pengguna aktif
   */
  static async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'role', 'avatar_url', 'is_verified_player', 'createdAt']
    });

    if (!user) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    return user;
  }
}
