import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Court = sequelize.define('Court', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  category_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  floor_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  court_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'indoor'
  },
  price_hourly: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'courts'
});

export const Amenity = sequelize.define('Amenity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'check'
  }
}, {
  tableName: 'amenities',
  timestamps: false
});

export const VenueAmenity = sequelize.define('VenueAmenity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amenity_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'venue_amenities',
  timestamps: false
});
