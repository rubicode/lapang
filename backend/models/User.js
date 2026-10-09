import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { USER_ROLES } from '../constants/index.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(USER_ROLES.USER, USER_ROLES.OWNER, USER_ROLES.ADMIN),
    defaultValue: USER_ROLES.USER
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_verified_player: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users'
});
