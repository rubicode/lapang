import { AuthService } from '../services/authService.js';
import { errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Middleware Autentikasi JWT
 * Memastikan request memiliki token valid di header Authorization
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses tidak diizinkan. Token otentikasi tidak ditemukan.', null, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Token tidak valid atau telah kedaluwarsa.', null, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Middleware Autentikasi Opsional
 * Membaca token jika ada, namun tetap mengizinkan request jika tidak ada token
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Abaikan jika token invalid pada mode opsional
  }
  next();
}

/**
 * Middleware Otorisasi Berbasis Peran (Role-Based Access Control / RBAC)
 * @param  {...string} roles Peran yang diizinkan (misal: 'owner', 'admin')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Silakan login terlebih dahulu.', null, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Akses ditolak. Fitur ini hanya dapat diakses oleh peran: ${roles.join(', ')}.`,
        null,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
}
