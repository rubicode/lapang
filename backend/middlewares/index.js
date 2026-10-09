import multer from 'multer';
import { errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';
import { ENV } from '../config/environment.js';
export { authenticate, optionalAuth, authorize } from './auth.js';

// Multer memory storage untuk validasi buffer di service
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
});

/**
 * Global Error Handler Middleware (STANDARD_CODE.md Compliance)
 * Mencegah kebocoran stack trace database pada mode produksi
 */
export function globalErrorHandler(err, req, res, next) {
  console.error(`❌ [Error Catch] [${req.method}] ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  // Jangan bocorkan stack trace di production
  const errors = ENV.NODE_ENV === 'development' ? err.stack : null;

  return errorResponse(res, message, errors, statusCode);
}
