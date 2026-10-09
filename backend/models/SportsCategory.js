import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SportsCategory = sequelize.define('SportsCategory', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true // e.g. 'futsal', 'badminton', 'basketball', 'padel', 'volleyball'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(10), // e.g. '⚽', '🏸', '🏀', '🎾', '🏐'
    allowNull: false
  },
  color_hex: {
    type: DataTypes.STRING(10), // e.g. '#1B5E20', '#f59e0b'
    defaultValue: '#1B5E20'
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'sports_categories',
  timestamps: false
});
