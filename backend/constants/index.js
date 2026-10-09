/**
 * Konstanta Terpusat Aplikasi (STANDARD_CODE.md Compliance)
 * Mencegah magic strings dan magic numbers
 */

export const USER_ROLES = Object.freeze({
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin'
});

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
});

export const SCHEDULE_STATUS = Object.freeze({
  AVAILABLE: 'available',
  BOOKED: 'booked',
  BLOCKED: 'blocked',
  MAINTENANCE: 'maintenance'
});

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'unpaid',
  SETTLEMENT: 'settlement',
  EXPIRE: 'expire',
  CANCEL: 'cancel'
});

export const COURT_TYPES = Object.freeze({
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  SEMI_INDOOR: 'semi_indoor'
});

export const MINIO_BUCKETS = Object.freeze({
  VENUES: 'lapang-venues',
  REVIEWS: 'lapang-reviews',
  DOCUMENTS: 'lapang-documents'
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
});
