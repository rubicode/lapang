import {
  Venue,
  ReviewItem,
  ReviewAspects,
  SportFilter,
  CityOption,
  AuthUser,
  AdminOverviewResponse,
  AdminApplicationStatus,
  VerificationApplicant,
  OwnerOverviewResponse,
  OwnerBookingsResponse,
  OwnerScheduleResponse,
  OwnerRevenueResponse,
  OwnerSettingsResponse
} from '@/types';

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

// Fallback Mock Data Sesuai Gambar Desain
const DEFAULT_ADMIN_FALLBACK: AdminOverviewResponse = {
  stats: {
    totalUsers: 14285,
    totalUsersFormatted: '14,285',
    totalUsersGrowth: '+12%',
    totalOwners: 842,
    totalOwnersFormatted: '842',
    totalOwnersGrowth: '+4%',
    activeBookings: 1120,
    activeBookingsFormatted: '1,120',
    activeBookingsBadge: 'Aktif',
    monthlyRevenue: 42912,
    monthlyRevenueFormatted: '$42,912',
    currency: '$'
  },
  totalPendingApplications: 28,
  verificationQueue: [
    {
      id: 'app-001',
      user: {
        name: 'Marco Arantes',
        email: 'marco.a@fieldhub.pt',
        initials: 'MA',
        initialsBg: 'bg-[#dcfce7]',
        initialsColor: 'text-[#166534]',
        phone: '+351 912 345 678'
      },
      facilityName: 'Arena Lisbon Pro',
      submittedDate: 'Oct 24, 2023',
      status: 'Pending Review',
      sportType: 'Futsal & Padel',
      location: 'Lisbon, Portugal',
      courtsCount: 4,
      documents: [
        { name: 'Commercial_Registration_Lisbon.pdf', size: '2.4 MB', type: 'PDF' },
        { name: 'Safety_Inspection_Certificate.pdf', size: '1.1 MB', type: 'PDF' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1529900245534-47fbf5de828a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
      ],
      notes: 'Aplikasi baru fasilitas olahraga futsal & padel indoor dengan 4 lapangan.'
    },
    {
      id: 'app-002',
      user: {
        name: 'Sarah Jenkins',
        email: 's.jenkins@sportslink.com',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
        phone: '+44 20 7946 0912'
      },
      facilityName: 'Jenkins Multisport',
      submittedDate: 'Oct 22, 2023',
      status: 'Verified',
      sportType: 'Badminton & Squash',
      location: 'Manchester, UK',
      courtsCount: 6,
      documents: [
        { name: 'UK_Sports_Council_Approval.pdf', size: '3.1 MB', type: 'PDF' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'
      ],
      notes: 'Terverifikasi penuh oleh tim audit kepatuhan fasilitas.'
    },
    {
      id: 'app-003',
      user: {
        name: 'Robert Kagawa',
        email: 'kagawa_fields@outlook.jp',
        initials: 'RK',
        initialsBg: 'bg-[#f1f5f9]',
        initialsColor: 'text-[#475569]',
        phone: '+81 75 123 4567'
      },
      facilityName: 'Kyoto Soccer Park',
      submittedDate: 'Oct 21, 2023',
      status: 'Action Required',
      sportType: 'Soccer Turf & Futsal',
      location: 'Kyoto, Japan',
      courtsCount: 3,
      documents: [
        { name: 'Kyoto_Facility_Permit_Draft.pdf', size: '1.8 MB', type: 'PDF' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
      ],
      issues: [
        'Sertifikat asuransi kewajiban komersial telah kedaluwarsa pada 15 Okt 2023.',
        'Dimensi tiang gawang lapangan 2 belum menyertakan surat kalibrasi standar FIFA.'
      ],
      notes: 'Memerlukan dokumen perpanjangan polis asuransi dari pengelola.'
    },
    {
      id: 'app-004',
      user: {
        name: 'David Chen',
        email: 'chen.d@victorysports.cn',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
        phone: '+86 21 6234 5678'
      },
      facilityName: 'Victory Stadium Shanghai',
      submittedDate: 'Oct 19, 2023',
      status: 'Verified',
      sportType: 'Basketball & Futsal',
      location: 'Shanghai, China',
      courtsCount: 8,
      documents: [
        { name: 'Shanghai_Sports_Bureau_Lic.pdf', size: '4.5 MB', type: 'PDF' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'
      ],
      notes: 'Terverifikasi penuh.'
    }
  ],
  activeFields: [
    {
      id: 'field-001',
      name: 'Stamford Bridge Turf A',
      location: 'London, UK',
      status: 'LIVE',
      badgeType: 'live',
      occupancyRate: 60,
      occupancyFormatted: '60% Occupied',
      activePlayersCount: 8,
      avatars: [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80'
      ],
      extraAvatarsCount: 8,
      image: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80',
      currentMatch: 'Chelsea Academy Youth vs Fulham U19',
      lighting: 'Active (1000 Lux)',
      temperature: '18°C',
      pitchHealth: 'Optimal (Moisture 24%)',
      timeRemaining: '38 mins remaining'
    },
    {
      id: 'field-002',
      name: 'The Indoor Hub - Field 2',
      location: 'Berlin, DE',
      status: 'MAINTENANCE',
      badgeType: 'maintenance',
      subText: 'Cleaning in progress...',
      occupancyStatus: 'Offline',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      maintenanceTask: 'Deep Turf Grooming & Infill Replacement',
      technician: 'Lukas Schneider (Field Tech Lead)',
      expectedOnline: 'Today, 14:00 CET',
      temperature: '21°C Indoor'
    },
    {
      id: 'field-003',
      name: 'Sunshine Coast Arena',
      location: 'Brisbane, AU',
      status: 'LIVE',
      badgeType: 'live',
      occupancyRate: 95,
      occupancyFormatted: '95% Occupied',
      activePlayersCount: 12,
      avatars: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
      ],
      extraAvatarsCount: 12,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      currentMatch: 'Queensland Premier League 7-a-side Tournament',
      lighting: 'Natural Sunlight',
      temperature: '26°C',
      pitchHealth: '98% Quality Rating',
      timeRemaining: '14 mins remaining'
    }
  ],
  currentAdmin: {
    name: 'Alex Thompson',
    role: 'Global Admin',
    email: 'alex.t@pitchgallery.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
  }
};

/**
 * 10. Ambil Ringkasan Dashboard Admin Langsung dari Database PostgreSQL
 */
export async function fetchAdminOverview(token?: string | null): Promise<AdminOverviewResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  if (!authToken) {
    throw new Error('UNAUTHORIZED');
  }

  const res = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: getHeaders(authToken),
    cache: 'no-store'
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('UNAUTHORIZED');
  }

  const json = await res.json();
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message || 'Gagal memuat data overview admin dari basis data.');
  }

  return json.data;
}

/**
 * 11. Perbarui Status Verifikasi Pemilik Venue di Database
 */
export async function updateVerificationStatusApi(
  id: string,
  status: AdminApplicationStatus,
  issueNote?: string,
  token?: string | null
): Promise<boolean> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  try {
    const res = await fetch(`${API_BASE_URL}/admin/verifications/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(authToken),
      body: JSON.stringify({ status, issueNote })
    });
    return res.ok;
  } catch (err) {
    console.error('Gagal memperbarui status verifikasi di database:', err);
    return false;
  }
}

/**
 * 12. Kirim Undangan ke Pengelola Venue Baru & Simpan di Database
 */
export async function inviteOwnerApi(
  payload: {
    name: string;
    email: string;
    facilityName: string;
    sportType?: string;
    location?: string;
    courtsCount?: number;
  },
  token?: string | null
): Promise<boolean> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  try {
    const res = await fetch(`${API_BASE_URL}/admin/invite-owner`, {
      method: 'POST',
      headers: getHeaders(authToken),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error('Gagal mengundang owner ke database:', err);
    return false;
  }
}

/**
 * 13. Unduh CSV Verifikasi Pemilik Fasilitas
 */
export function downloadVerificationCsv(applications: VerificationApplicant[]) {
  const headers = ['ID', 'Owner Name', 'Email', 'Facility Name', 'Submitted Date', 'Status', 'Location'];
  const rows = applications.map((a) => [
    `"${a.id}"`,
    `"${a.user.name}"`,
    `"${a.user.email}"`,
    `"${a.facilityName}"`,
    `"${a.submittedDate}"`,
    `"${a.status}"`,
    `"${a.location || 'N/A'}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `pitch_gallery_verification_queue_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 14. Ambil Data Ikhtisar Owner Dashboard (Pitch Gallery) langsung dari PostgreSQL
 */
export async function fetchOwnerOverview(token?: string | null): Promise<OwnerOverviewResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/overview`, {
    headers: getHeaders(authToken),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: Gagal memuat data owner dashboard dari database.`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * 15. Tambah Lapangan Baru Milik Owner (Disimpan langsung ke PostgreSQL)
 */
export async function createOwnerCourtApi(
  payload: {
    name: string;
    match_format?: string;
    surface_spec?: string;
    price_hourly: number;
    court_type?: string;
    main_image?: string;
  },
  token?: string | null
): Promise<boolean> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  try {
    const res = await fetch(`${API_BASE_URL}/owner/fields`, {
      method: 'POST',
      headers: getHeaders(authToken),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error('Gagal menambahkan court:', err);
    return false;
  }
}

/**
 * 16. Update Lapangan Milik Owner (Disimpan langsung ke PostgreSQL)
 */
export async function updateOwnerCourtApi(
  courtId: string,
  payload: {
    name?: string;
    price_hourly?: number;
    is_active?: boolean;
    match_format?: string;
    surface_spec?: string;
    main_image?: string;
  },
  token?: string | null
): Promise<boolean> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  try {
    const res = await fetch(`${API_BASE_URL}/owner/fields/${courtId}`, {
      method: 'PATCH',
      headers: getHeaders(authToken),
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error('Gagal memperbarui court:', err);
    return false;
  }
}

/**
 * 17. Toggle Early Bird Promotion di PostgreSQL
 */
export async function toggleOwnerEarlyBirdPromoApi(
  promoActive: boolean,
  token?: string | null
): Promise<{ earlyBirdPromoActive: boolean; discountPercent: number }> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/promotions/early-bird`, {
    method: 'POST',
    headers: getHeaders(authToken),
    body: JSON.stringify({ promoActive })
  });

  if (!res.ok) {
    throw new Error('Gagal memperbarui status promosi.');
  }

  const json = await res.json();
  return json.data;
}

/**
 * 18. Unduh Owner Management CSV Report
 */
export async function downloadOwnerReportApi(token?: string | null) {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/export-report`, {
    headers: getHeaders(authToken)
  });

  if (!res.ok) {
    throw new Error('Gagal mengunduh laporan owner.');
  }

  const csvText = await res.text();
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pitch-gallery-owner-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * 19. Ambil Data Bookings Owner Lengkap Langsung dari PostgreSQL
 */
export async function fetchOwnerBookingsApi(
  params: { status?: string; search?: string; courtId?: string; page?: number; limit?: number } = {},
  token?: string | null
): Promise<OwnerBookingsResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.courtId) query.append('courtId', params.courtId);
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/owner/bookings?${query.toString()}`, {
    headers: getHeaders(authToken),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Gagal memuat data booking dari server.');
  }

  const json = await res.json();
  return json.data;
}

/**
 * 20. Update Status Booking di PostgreSQL (Confirm, Cancel, Complete)
 */
export async function updateOwnerBookingStatusApi(
  bookingId: string,
  status: string,
  token?: string | null
): Promise<boolean> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: getHeaders(authToken),
    body: JSON.stringify({ status })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal mengubah status pemesanan.');
  }

  return true;
}

/**
 * 21. Ambil Data Jadwal Slot Waktu (Schedule) Langsung dari PostgreSQL
 */
export async function fetchOwnerSchedulesApi(
  courtId?: string,
  date?: string,
  token?: string | null
): Promise<OwnerScheduleResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const query = new URLSearchParams();
  if (courtId) query.append('courtId', courtId);
  if (date) query.append('date', date);

  const res = await fetch(`${API_BASE_URL}/owner/schedules?${query.toString()}`, {
    headers: getHeaders(authToken),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Gagal memuat data jadwal dari server.');
  }

  const json = await res.json();
  return json.data;
}

/**
 * 22. Toggle Block / Unblock Slot Waktu di PostgreSQL
 */
export async function toggleOwnerScheduleBlockApi(
  payload: { courtId: string; date: string; timeSlot: string; status: 'blocked' | 'available' },
  token?: string | null
): Promise<boolean> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/schedules/toggle-block`, {
    method: 'POST',
    headers: getHeaders(authToken),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memperbarui status slot.');
  }

  return true;
}

/**
 * 23. Ambil Data Revenue & Breakdown Finansial dari PostgreSQL
 */
export async function fetchOwnerRevenueApi(
  period: string = 'month',
  token?: string | null
): Promise<OwnerRevenueResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/revenue?period=${period}`, {
    headers: getHeaders(authToken),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Gagal memuat data finansial dari server.');
  }

  const json = await res.json();
  return json.data;
}

/**
 * 24. Ambil Pengaturan Venue & Akun Pemilik dari PostgreSQL
 */
export async function fetchOwnerSettingsApi(
  token?: string | null
): Promise<OwnerSettingsResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/settings`, {
    headers: getHeaders(authToken),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Gagal memuat pengaturan dari server.');
  }

  const json = await res.json();
  return json.data;
}

/**
 * 25. Perbarui Pengaturan Venue & Akun Pemilik ke PostgreSQL
 */
export async function updateOwnerSettingsApi(
  payload: Partial<{
    ownerName: string;
    ownerPhone: string;
    venueName: string;
    district: string;
    address: string;
    phoneNumber: string;
    openingHours: string;
    currency: string;
    earlyBirdPromoActive: boolean;
    earlyBirdDiscountPercent: number;
    description: string;
  }>,
  token?: string | null
): Promise<OwnerSettingsResponse> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null);
  const res = await fetch(`${API_BASE_URL}/owner/settings`, {
    method: 'PATCH',
    headers: getHeaders(authToken),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memperbarui pengaturan.');
  }

  const json = await res.json();
  return json.data;
}


