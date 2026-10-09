import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { globalErrorHandler } from './middlewares/index.js';
import { ENV } from './config/environment.js';
import { errorResponse } from './utils/response.js';
import { HTTP_STATUS } from './constants/index.js';

const app = express();

// 1. Security Headers via Helmet (STANDARD_CODE.md)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Handling
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan semua origin pada development atau cek whitelist
    if (!origin || ENV.NODE_ENV === 'development' || ENV.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Diblokir oleh kebijakan CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (OWASP Brute-Force & DoS Mitigation)
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 300, // max 300 request per menit per IP
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Silakan coba lagi beberapa saat lagi.'
  }
});
app.use('/api/', generalLimiter);

// 4. Request Body Parsers dengan limit aman (Anti Memory Exhaustion)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Logger
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 6. Mount REST API Routes
app.use('/api/v1', apiRoutes);

// 7. Route Root Info
app.get('/', (req, res) => {
  res.json({
    app: 'Lapang.id Backend Service',
    version: '1.0.0',
    documentation: '/api/v1/health'
  });
});

// 8. Handle 404 Not Found
app.use((req, res) => {
  return errorResponse(res, `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan.`, null, HTTP_STATUS.NOT_FOUND);
});

// 9. Centralized Error Handler
app.use(globalErrorHandler);

export default app;
