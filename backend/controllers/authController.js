import { AuthService } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, phone, role } = req.body;
      const result = await AuthService.register({ name, email, password, phone, role });
      return successResponse(res, 'Registrasi akun berhasil', result, HTTP_STATUS.CREATED);
    } catch (error) {
      if (error.message.includes('sudah terdaftar') || error.message.includes('wajib diisi')) {
        return errorResponse(res, error.message, null, HTTP_STATUS.BAD_REQUEST);
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return successResponse(res, 'Login berhasil', result, HTTP_STATUS.OK);
    } catch (error) {
      if (error.message.includes('Kredensial tidak valid') || error.message.includes('wajib diisi')) {
        return errorResponse(res, error.message, null, HTTP_STATUS.UNAUTHORIZED);
      }
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await AuthService.getProfile(userId);
      return successResponse(res, 'Profil pengguna aktif', profile, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}
