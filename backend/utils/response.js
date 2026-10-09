import { HTTP_STATUS } from '../constants/index.js';

export function successResponse(res, message = 'Operasi berhasil', data = null, statusCode = HTTP_STATUS.OK, meta = null) {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

export function errorResponse(res, message = 'Terjadi kesalahan sistem', errors = null, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
  const payload = {
    success: false,
    message
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}
