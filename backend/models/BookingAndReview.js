import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { BOOKING_STATUS, PAYMENT_STATUS, SCHEDULE_STATUS } from '../constants/index.js';

export const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  user_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  user_role: {
    type: DataTypes.STRING(50),
    defaultValue: 'Verified Booker'
  },
  rating_overall: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false
  },
  rating_floor: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  rating_lighting: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  rating_cleanliness: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  rating_hospitality: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  photos: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  owner_reply: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  owner_replied_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'reviews'
});

export const CourtSchedule = sequelize.define('CourtSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  court_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time_slot: {
    type: DataTypes.STRING(10), // e.g. "08:00", "09:00", "19:00"
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      SCHEDULE_STATUS.AVAILABLE,
      SCHEDULE_STATUS.BOOKED,
      SCHEDULE_STATUS.BLOCKED,
      SCHEDULE_STATUS.MAINTENANCE
    ),
    defaultValue: SCHEDULE_STATUS.AVAILABLE
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'court_schedules'
});

export const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true // e.g. LAPANG-2024-ID-8849
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  venue_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  court_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  venue_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  customer_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  customer_phone: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time_slot: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'QRIS'
  },
  payment_status: {
    type: DataTypes.ENUM(
      PAYMENT_STATUS.UNPAID,
      PAYMENT_STATUS.SETTLEMENT,
      PAYMENT_STATUS.EXPIRE,
      PAYMENT_STATUS.CANCEL
    ),
    defaultValue: PAYMENT_STATUS.SETTLEMENT
  },
  booking_status: {
    type: DataTypes.ENUM(
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.COMPLETED
    ),
    defaultValue: BOOKING_STATUS.CONFIRMED
  },
  midtrans_snap_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'bookings'
});
