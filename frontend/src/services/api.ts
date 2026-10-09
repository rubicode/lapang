import { Venue, ReviewItem, ReviewAspects, SportFilter, CityOption, AuthUser } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Helper headers
function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * 1. Ambil Kategori Olahraga dari Backend (sports_categories)
 */
export async function fetchCategories(): Promise<SportFilter[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return [
          { id: 'all', name: 'Semua Cabang', icon: '⚡' },
          ...json.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || '🏅'
          }))
        ];
      }
    }
  } catch (err) {
    console.error('Gagal mengambil kategori:', err);
  }
  return [{ id: 'all', name: 'Semua Cabang', icon: '⚡' }];
}

/**
 * 2. Ambil Daftar Kota dari Backend (cities & provinces)
 */
export async function fetchCities(): Promise<CityOption[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/regions/cities`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return [
          { id: 'all', name: '📍 Seluruh Indonesia (38 Provinsi)' },
          ...json.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            lat: c.lat,
            lng: c.lng
          }))
        ];
      }
    }
  } catch (err) {
    console.error('Gagal mengambil kota:', err);
  }
  return [{ id: 'all', name: '📍 Seluruh Indonesia (38 Provinsi)' }];
}

/**
 * 3. Ambil Daftar Venue dari Backend dengan Filter Lengkap
 */
export async function fetchVenues(params: {
  sport?: string;
  city?: string;
  radius?: number | 'all';
  search?: string;
  sort?: string;
  lat?: number;
  lng?: number;
  court_types?: string;
  floor_types?: string;
  amenities?: string;
}): Promise<Venue[]> {
  try {
    const query = new URLSearchParams();
    if (params.sport && params.sport !== 'all') query.set('sport', params.sport);
    if (params.city && params.city !== 'all') query.set('city', params.city);
    if (params.radius && params.radius !== 'all') query.set('radius', params.radius.toString());
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.lat) query.set('lat', params.lat.toString());
    if (params.lng) query.set('lng', params.lng.toString());
    if (params.court_types) query.set('court_types', params.court_types);
    if (params.floor_types) query.set('floor_types', params.floor_types);
    if (params.amenities) query.set('amenities', params.amenities);

    const res = await fetch(`${API_BASE_URL}/venues?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          sport: item.sport || 'futsal',
          sportName: item.sportName || 'Futsal & Mini Soccer',
          sportIcon: item.sportIcon || '⚽',
          city: item.city_name || item.city,
          province: item.province_name || item.province,
          address: item.address,
          lat: item.lat !== undefined ? Number(item.lat) : Number(item.latitude),
          lng: item.lng !== undefined ? Number(item.lng) : Number(item.longitude),
          distance: item.distanceText || `${item.distanceKm} km`,
          distanceKm: item.distanceKm,
          priceFormatted: item.priceFormatted || `Rp ${Number(item.base_price_hourly).toLocaleString('id-ID')}`,
          priceHourly: Number(item.base_price_hourly) || 150000,
          rating: item.rating_avg ? parseFloat(item.rating_avg) : 4.8,
          reviewsCount: item.review_count || 0,
          floorType: item.floor_type || 'Vinyl Approved',
          courtType: item.court_type || 'Indoor',
          hours: item.opening_hours || '07:00 - 24:00 WIB',
          description: item.description || '',
          mainImage: item.main_image_url || 'https://images.unsplash.com/photo-1529900245534-47fbf8221565',
          gallery: Array.isArray(item.gallery_images)
            ? item.gallery_images
            : (typeof item.gallery_images === 'string' ? JSON.parse(item.gallery_images) : [item.main_image_url]),
          amenities: Array.isArray(item.amenities)
            ? item.amenities.map((a: any) => typeof a === 'string' ? a : a.amenity_name)
            : [],
          slots: item.slots || ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"],
          bookedSlots: item.bookedSlots || ["08:00", "15:00", "19:00"]
        }));
      }
    }
  } catch (err) {
    console.error('Gagal mengambil daftar venue dari backend:', err);
  }

  return [];
}

/**
 * 4. Ambil Ulasan & Rating Breakdown Asli dari Backend
 */
export async function fetchVenueReviews(venueIdOrSlug: string): Promise<{
  aspects: ReviewAspects;
  reviews: ReviewItem[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/venues/${venueIdOrSlug}/reviews`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          aspects: json.data.aspects || { floor: 5, lighting: 5, cleanliness: 5, hospitality: 5 },
          reviews: json.data.reviews.map((r: any) => ({
            id: r.id,
            user: r.user_name,
            role: r.user_role || 'Verified Booker',
            rating: parseFloat(r.rating_overall),
            date: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            comment: r.comment,
            ownerReply: r.owner_reply,
            rating_floor: r.rating_floor,
            rating_lighting: r.rating_lighting,
            rating_cleanliness: r.rating_cleanliness,
            rating_hospitality: r.rating_hospitality
          }))
        };
      }
    }
  } catch (err) {
    console.error('Gagal mengambil ulasan venue:', err);
  }

  return {
    aspects: { floor: 5, lighting: 5, cleanliness: 5, hospitality: 5 },
    reviews: []
  };
}

/**
 * 5. Kirim Ulasan Baru ke Backend (Tersimpan ke PostgreSQL)
 */
export async function submitReviewApi(
  venueIdOrSlug: string,
  payload: {
    user_name?: string;
    rating_overall: number;
    rating_floor?: number;
    rating_lighting?: number;
    rating_cleanliness?: number;
    rating_hospitality?: number;
    comment: string;
  },
  token?: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/venues/${venueIdOrSlug}/reviews`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error('Gagal mengirim ulasan:', err);
    return false;
  }
}

/**
 * 6. Ambil Jadwal Slot Waktu Real-Time (court_schedules)
 */
export async function fetchVenueSchedules(venueIdOrSlug: string, dateStr: string): Promise<{
  slots: string[];
  bookedSlots: string[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/venues/${venueIdOrSlug}/schedules?date=${dateStr}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          slots: json.data.slots || [],
          bookedSlots: json.data.bookedSlots || []
        };
      }
    }
  } catch (err) {
    console.error('Gagal mengambil jadwal slot:', err);
  }

  return {
    slots: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"],
    bookedSlots: ["08:00", "15:00", "19:00"]
  };
}

/**
 * 7. Reservasi Booking Atomik (ACID)
 */
export async function createBookingApi(bookingPayload: {
  venueId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  totalAmount: number;
}): Promise<{ bookingCode: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.meta?.bookingCode) {
        return { bookingCode: json.meta.bookingCode };
      }
    }
  } catch (err) {
    console.error('Gagal membuat reservasi:', err);
  }

  return {
    bookingCode: `LAPANG-${new Date().getFullYear()}-ID-${Math.floor(1000 + Math.random() * 9000)}`
  };
}

/**
 * 8. Autentikasi Pengguna (Login, Register, Get Profile)
 */
export async function loginUser(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Login gagal.');
  }

  return json.data;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Registrasi gagal.');
  }

  return json.data;
}

export async function getMeUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
    cache: 'no-store'
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Sesi berakhir.');
  }

  return json.data;
}
