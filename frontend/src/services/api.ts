import { Venue } from '@/types';
import { INITIAL_VENUES } from '@/data/mockVenues';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export async function fetchVenues(params: {
  sport?: string;
  city?: string;
  radius?: number | 'all';
  search?: string;
  sort?: string;
  lat?: number;
  lng?: number;
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

    const res = await fetch(`${API_BASE_URL}/venues?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((item: any) => ({
          ...item,
          lat: item.lat !== undefined ? Number(item.lat) : Number(item.latitude),
          lng: item.lng !== undefined ? Number(item.lng) : Number(item.longitude),
          distance: item.distanceText || `${item.distanceKm} km`,
          priceFormatted: item.priceFormatted || `Rp ${item.base_price_hourly?.toLocaleString('id-ID')}`,
          priceHourly: item.base_price_hourly || item.priceHourly || 150000,
          mainImage: item.main_image_url || item.mainImage,
          gallery: Array.isArray(item.gallery_images) ? item.gallery_images : (typeof item.gallery_images === 'string' ? JSON.parse(item.gallery_images) : item.gallery || [item.main_image_url || item.mainImage]),
          amenities: Array.isArray(item.amenities) && item.amenities.length > 0 
            ? item.amenities.map((a: any) => typeof a === 'string' ? a : a.amenity_name)
            : ["Parkir Luas Mobil/Motor", "Shower Air Hangat", "Kantin & Coffee Shop", "Musholla AC", "Loker & Ruang Ganti", "Sewa Rompi & Bola"],
          slots: item.slots || ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"],
          bookedSlots: item.bookedSlots || ["08:00", "15:00", "19:00"],
          rating: item.rating_avg ? parseFloat(item.rating_avg) : item.rating || 4.8,
          reviewsCount: item.review_count || item.reviewsCount || 100,
          hours: item.opening_hours || item.hours || '07:00 - 24:00 WIB',
          floorType: item.floor_type || item.floorType || 'Vinyl Standar BWF',
          courtType: item.court_type || item.courtType || 'Indoor'
        }));
      }
    }
  } catch {
    // Fallback jika backend offline saat development
  }

  // Local fallback filtering matching mockup/code.html
  let filtered = [...INITIAL_VENUES];

  if (params.sport && params.sport !== 'all') {
    filtered = filtered.filter((v) => v.sport === params.sport);
  }

  if (params.city && params.city !== 'all') {
    filtered = filtered.filter(
      (v) =>
        v.city.toLowerCase().includes(params.city!.toLowerCase()) ||
        v.address.toLowerCase().includes(params.city!.toLowerCase())
    );
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q) ||
        v.sportName.toLowerCase().includes(q)
    );
  }

  if (params.sort === 'price_low') {
    filtered.sort((a, b) => a.priceHourly - b.priceHourly);
  } else if (params.sort === 'rating_high') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (params.sort === 'distance') {
    filtered.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  return filtered;
}

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
  } catch {
    // Fallback
  }

  return {
    bookingCode: `LAPANG-${new Date().getFullYear()}-ID-${Math.floor(1000 + Math.random() * 9000)}`
  };
}
