export interface Venue {
  id: string;
  slug?: string;
  name: string;
  sport: string;
  sportName: string;
  sportIcon: string;
  city: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  distance?: string;
  distanceKm?: number;
  priceHourly: number;
  priceFormatted: string;
  rating: number;
  reviewsCount: number;
  floorType: string;
  courtType: string;
  hours: string;
  description: string;
  mainImage: string;
  gallery: string[];
  amenities: string[];
  slots: string[];
  bookedSlots: string[];
}

export interface ReviewItem {
  id?: string;
  user: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  ownerReply?: string | null;
  rating_floor?: number;
  rating_lighting?: number;
  rating_cleanliness?: number;
  rating_hospitality?: number;
}

export interface ReviewAspects {
  floor: number;
  lighting: number;
  cleanliness: number;
  hospitality: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'owner' | 'admin';
  avatar_url?: string;
  is_verified_player?: boolean;
}

export interface SportFilter {
  id: string;
  name: string;
  icon: string;
}

export interface CityOption {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
}

export interface SpecificationFilterState {
  courtTypes: {
    indoor: boolean;
    outdoor: boolean;
    semiIndoor: boolean;
  };
  floorTypes: {
    syntheticGrass: boolean;
    vinyl: boolean;
    interlock: boolean;
    parquet: boolean;
  };
  amenities: {
    warmShower: boolean;
    musholla: boolean;
    carParking: boolean;
    canteen: boolean;
  };
}

export type AdminApplicationStatus = 'Pending Review' | 'Verified' | 'Action Required' | 'Rejected';

export interface VerificationDocument {
  name: string;
  size: string;
  type: string;
}

export interface VerificationApplicant {
  id: string;
  user: {
    name: string;
    email: string;
    initials?: string;
    initialsBg?: string;
    initialsColor?: string;
    phone?: string;
    avatarUrl?: string | null;
  };
  facilityName: string;
  submittedDate: string;
  status: AdminApplicationStatus;
  sportType?: string;
  location?: string;
  courtsCount?: number;
  documents?: VerificationDocument[];
  photos?: string[];
  issues?: string[];
  notes?: string;
}

export interface ActiveFieldMonitoringItem {
  id: string;
  name: string;
  location: string;
  status: 'LIVE' | 'MAINTENANCE';
  badgeType: 'live' | 'maintenance';
  occupancyRate?: number;
  occupancyFormatted?: string;
  subText?: string;
  occupancyStatus?: string;
  activePlayersCount?: number;
  avatars?: string[];
  extraAvatarsCount?: number;
  image: string;
  currentMatch?: string;
  lighting?: string;
  temperature?: string;
  pitchHealth?: string;
  timeRemaining?: string;
  maintenanceTask?: string;
  technician?: string;
  expectedOnline?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalUsersFormatted: string;
  totalUsersGrowth: string;
  totalOwners: number;
  totalOwnersFormatted: string;
  totalOwnersGrowth: string;
  activeBookings: number;
  activeBookingsFormatted: string;
  activeBookingsBadge: string;
  monthlyRevenue: number;
  monthlyRevenueFormatted: string;
  currency: string;
}

export interface AdminOverviewResponse {
  stats: AdminStats;
  verificationQueue: VerificationApplicant[];
  totalPendingApplications: number;
  activeFields: ActiveFieldMonitoringItem[];
  currentAdmin: {
    name: string;
    role: string;
    email: string;
    avatarUrl?: string;
  };
}

// --- Pitch Gallery Owner Dashboard Types ---
export interface OwnerFieldItem {
  id: string;
  name: string;
  venueName?: string;
  district: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  isActive: boolean;
  matchFormat: string;
  surfaceSpec: string;
  priceHourly: number;
  currencySymbol: string;
  image: string;
  occupancyRate?: number;
}

export interface OwnerRecentBookingItem {
  id: string;
  bookingCode: string;
  customerName: string;
  initials: string;
  courtName: string;
  timeSlot: string;
  fullTimeSlot?: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | string;
  statusRaw: string;
  amount: number;
  currencySymbol: string;
}

export interface OwnerStats {
  totalRevenue: number;
  revenueFormatted: string;
  revenueGrowth: string;
  activeBookings: number;
  bookingDemandBadge: string;
  avgRatingScore: string;
  avgRatingBadge: string;
  uniqueVisitors: string;
}

export interface OwnerOverviewResponse {
  owner: {
    id: string;
    name: string;
    email: string;
    roleTitle: string;
    avatarUrl: string;
  };
  venue: {
    id: string;
    name: string;
    district: string;
    currency: string;
    earlyBirdPromoActive: boolean;
    earlyBirdDiscountPercent: number;
  };
  stats: OwnerStats;
  fields: OwnerFieldItem[];
  recentBookings: OwnerRecentBookingItem[];
  peakHoursTip: {
    title: string;
    description: string;
    isPromoApplied: boolean;
  };
}

export interface OwnerBookingsSummary {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
  totalRevenue: number;
}

export interface OwnerBookingItem {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone?: string;
  initials: string;
  courtId: string;
  courtName: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
  currencySymbol: string;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  bookingStatusRaw: string;
  createdAt: string;
}

export interface OwnerBookingsResponse {
  summary: OwnerBookingsSummary;
  courts: Array<{ id: string; name: string }>;
  currencySymbol: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  bookings: OwnerBookingItem[];
}

export interface OwnerScheduleSlot {
  id: string | null;
  timeSlot: string;
  status: 'available' | 'booked' | 'blocked' | 'maintenance' | string;
  price: number;
  currencySymbol: string;
  bookerName: string | null;
  bookingCode: string | null;
  isBlocked: boolean;
}

export interface OwnerScheduleResponse {
  courts: Array<{
    id: string;
    name: string;
    priceHourly: number;
    matchFormat: string;
    surfaceSpec: string;
    isActive: boolean;
  }>;
  selectedCourt: {
    id: string;
    name: string;
    priceHourly: number;
    matchFormat: string;
    surfaceSpec: string;
    isActive: boolean;
  } | null;
  date: string;
  venueName: string;
  currencySymbol: string;
  slots: OwnerScheduleSlot[];
}

export interface OwnerCourtRevenueBreakdown {
  courtId: string;
  courtName: string;
  matchFormat: string;
  surfaceSpec: string;
  totalBookings: number;
  totalRevenue: number;
  percentage: number;
}

export interface OwnerRevenueTransaction {
  id: string;
  invoiceCode: string;
  customerName: string;
  courtName: string;
  date: string;
  timeSlot: string;
  paymentMethod: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface OwnerRevenueResponse {
  currencySymbol: string;
  currency: string;
  grossRevenue: number;
  netRevenue: number;
  platformFee: number;
  pendingRevenue: number;
  averageOrderValue: number;
  totalSettlementCount: number;
  courtBreakdown: OwnerCourtRevenueBreakdown[];
  recentTransactions: OwnerRevenueTransaction[];
}

export interface OwnerSettingsResponse {
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  venue: {
    id: string;
    name: string;
    district: string;
    address: string;
    phoneNumber: string;
    openingHours: string;
    currency: string;
    earlyBirdPromoActive: boolean;
    earlyBirdDiscountPercent: number;
    description: string;
  };
}


