import { Sequelize } from 'sequelize';
import { ENV } from './environment.js';

export const sequelize = new Sequelize(ENV.DB_NAME, ENV.DB_USER, ENV.DB_PASS, {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  dialect: 'postgres',
  logging: ENV.NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

export async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ [Database] Koneksi PostgreSQL berhasil terhubung.');
    return true;
  } catch (error) {
    console.warn(`⚠️ [Database] Koneksi PostgreSQL belum aktif (${error.message}). Sistem berjalan dalam mode development.`);
    return false;
  }
}
