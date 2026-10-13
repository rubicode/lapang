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

