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
