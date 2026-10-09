import app from './app.js';
import { ENV } from './config/environment.js';
import { testDatabaseConnection } from './config/database.js';
import { initMinioBuckets } from './config/minio.js';

const PORT = ENV.PORT || 5001;

async function bootstrap() {
  console.log('🚀 [Bootstrap] Memulai Server Backend LapangID...');

  // Cek koneksi database PostgreSQL
  await testDatabaseConnection();

  // Inisialisasi bucket MinIO
  await initMinioBuckets();

  const server = app.listen(PORT, () => {
    console.log(`🎉 [LapangID Backend] Server aktif di port ${PORT}`);
    console.log(`🌐 Base API: http://localhost:${PORT}/api/v1`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/v1/health`);
  });

  // Graceful Shutdown
  const handleShutdown = (signal) => {
    console.log(`\n🛑 Menerima sinyal ${signal}. Menutup server secara aman...`);
    server.close(() => {
      console.log('✅ Server HTTP ditutup.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('❌ Gagal menjalankan server:', err);
  process.exit(1);
});
