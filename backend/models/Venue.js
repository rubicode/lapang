import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(250),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  province_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  opening_hours: {
    type: DataTypes.STRING(100),
    defaultValue: '07:00 - 24:00 WIB'
  },
  floor_type: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  court_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'Indoor'
  },
  base_price_hourly: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100000
  },
  main_image_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  gallery_images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  rating_avg: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'venues'
});
