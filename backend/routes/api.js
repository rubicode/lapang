import express from 'express';
import { VenueController } from '../controllers/venueController.js';
import { BookingController, MediaController } from '../controllers/bookingAndMediaController.js';
import { upload } from '../middlewares/index.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LapangID API'
  });
});

// Master Wilayah & Kategori
router.get('/categories', VenueController.getCategories);
router.get('/regions/cities', VenueController.getCities);

// Venues
router.get('/venues', VenueController.listVenues);
router.get('/venues/:idOrSlug', VenueController.getVenueDetail);

// Bookings
router.post('/bookings', BookingController.create);
router.get('/bookings/:code', BookingController.getByCode);

// Media Upload ke MinIO
router.post('/media/upload', upload.single('image'), MediaController.upload);

export default router;
