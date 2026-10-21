#!/bin/sh
set -e

echo "🚀 [LapangID Backend Entrypoint] Memeriksa koneksi database..."

node -e "
import('./config/database.js').then(async (m) => {
  for (let i = 0; i < 30; i++) {
    try {
      await m.sequelize.authenticate();
      console.log('✅ [Entrypoint] PostgreSQL siap menerima koneksi.');
      process.exit(0);
    } catch (err) {
      console.log('⏳ [Entrypoint] Menunggu database siap (' + (i + 1) + '/30)...');
      await new Promise(res => setTimeout(res, 1500));
    }
  }
  console.error('❌ [Entrypoint] Timeout menunggu PostgreSQL.');
  process.exit(1);
}).catch(err => {
  console.error('❌ [Entrypoint] Gagal inisialisasi:', err);
  process.exit(1);
});
"

echo "🔄 [Entrypoint] Menjalankan migrasi database Sequelize..."
npx sequelize-cli db:migrate || {
  echo "⚠️ [Entrypoint] Migrasi gagal atau sudah terpasang."
}

echo "✨ [Entrypoint] Menjalankan aplikasi utama..."
exec "$@"
