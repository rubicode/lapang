import { sequelize } from '../config/database.js';
import { User } from './User.js';
import { Province, City } from './Region.js';
import { SportsCategory } from './SportsCategory.js';
import { Venue } from './Venue.js';
import { Court, Amenity, VenueAmenity } from './Court.js';
import { Review, CourtSchedule, Booking } from './BookingAndReview.js';

// Relasi Wilayah
Province.hasMany(City, { foreignKey: 'province_id', as: 'cities' });
City.belongsTo(Province, { foreignKey: 'province_id', as: 'province' });

// Relasi Venue & User
User.hasMany(Venue, { foreignKey: 'owner_id', as: 'venues' });
Venue.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Relasi Venue & Courts
Venue.hasMany(Court, { foreignKey: 'venue_id', as: 'courts', onDelete: 'CASCADE' });
Court.belongsTo(Venue, { foreignKey: 'venue_id', as: 'venue' });

// Relasi Court & SportsCategory
SportsCategory.hasMany(Court, { foreignKey: 'category_id', as: 'courts' });
Court.belongsTo(SportsCategory, { foreignKey: 'category_id', as: 'category' });

// Relasi Venue & Amenities
Venue.hasMany(VenueAmenity, { foreignKey: 'venue_id', as: 'amenities', onDelete: 'CASCADE' });
VenueAmenity.belongsTo(Venue, { foreignKey: 'venue_id' });

// Relasi Venue & Reviews
Venue.hasMany(Review, { foreignKey: 'venue_id', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Venue, { foreignKey: 'venue_id' });

// Relasi Court & Schedules
Court.hasMany(CourtSchedule, { foreignKey: 'court_id', as: 'schedules', onDelete: 'CASCADE' });
CourtSchedule.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });

// Relasi Booking
Venue.hasMany(Booking, { foreignKey: 'venue_id', as: 'bookings' });
Booking.belongsTo(Venue, { foreignKey: 'venue_id' });

Court.hasMany(Booking, { foreignKey: 'court_id', as: 'bookings' });
Booking.belongsTo(Court, { foreignKey: 'court_id' });

export {
  sequelize,
  User,
  Province,
  City,
  SportsCategory,
  Venue,
  Court,
  Amenity,
  VenueAmenity,
  Review,
  CourtSchedule,
  Booking
};
