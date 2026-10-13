import express from 'express';
import { VenueController } from '../controllers/venueController.js';
import { BookingController, MediaController } from '../controllers/bookingAndMediaController.js';
import { AuthController } from '../controllers/authController.js';
import { AdminController } from '../controllers/adminController.js';
import { upload, authenticate, optionalAuth, authorize } from '../middlewares/index.js';
import { USER_ROLES } from '../constants/index.js';

const router = express.Router();

// 1. Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LapangID API'
  });
});

// 2. Autentikasi & RBAC
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticate, AuthController.getMe);

// 3. Master Wilayah & Kategori
router.get('/categories', VenueController.getCategories);
router.get('/regions/cities', VenueController.getCities);

// 4. Katalog & Detail Venue
router.get('/venues', VenueController.listVenues);
router.get('/venues/:idOrSlug', VenueController.getVenueDetail);

// 5. Ulasan Lapangan & Balasan Pengelola (RBAC)
router.get('/venues/:idOrSlug/reviews', VenueController.getVenueReviews);
router.post('/venues/:idOrSlug/reviews', optionalAuth, VenueController.addReview);
router.post('/venues/reviews/:reviewId/reply', authenticate, authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN), VenueController.replyReview);

// 6. Jadwal Slot Waktu Real-Time (court_schedules)
router.get('/venues/:idOrSlug/schedules', VenueController.getVenueSchedules);

// 7. Transaksi Reservasi (ACID Row-Lock)
router.post('/bookings', BookingController.create);
router.get('/bookings/:code', BookingController.getByCode);

// 8. Media Upload ke MinIO (Magic bytes check & Sharp WebP)
router.post('/media/upload', upload.single('image'), MediaController.upload);

// 9. Admin Management Dashboard (Terlindungi RBAC Khusus Admin)
router.get('/admin/overview', authenticate, authorize(USER_ROLES.ADMIN), AdminController.getOverview);
router.put('/admin/verifications/:id/status', authenticate, authorize(USER_ROLES.ADMIN), AdminController.updateStatus);
router.post('/admin/invite-owner', authenticate, authorize(USER_ROLES.ADMIN), AdminController.inviteOwner);
router.get('/admin/export-csv', authenticate, authorize(USER_ROLES.ADMIN), AdminController.exportCsv);
router.post('/admin/reset', optionalAuth, AdminController.reset);

export default router;
