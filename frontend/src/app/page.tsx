'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TopAppBar } from '@/components/Header/TopAppBar';
import { FilterBar } from '@/components/Filters/FilterBar';
import { VenueCatalogList } from '@/components/Catalog/VenueCatalogList';
import { VenueDetailDrawer } from '@/components/Drawer/VenueDetailDrawer';
import { SpecificationFilterModal } from '@/components/Modals/SpecificationFilterModal';
import { CheckoutModal } from '@/components/Modals/CheckoutModal';
import { Venue, SpecificationFilterState } from '@/types';
import { INITIAL_VENUES, CITY_OPTIONS } from '@/data/mockVenues';
import { fetchVenues, createBookingApi } from '@/services/api';

// Dynamic import LeafletMap with ssr: false to prevent Next.js SSR window errors
const LeafletMap = dynamic(
  () => import('@/components/Map/LeafletMap').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-800 border-t-transparent rounded-full animate-spin"></div>
          <span>Memuat Peta Seluruh Indonesia...</span>
        </div>
      </div>
    )
  }
);

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSport, setActiveSport] = useState('all');
  const [activeCity, setActiveCity] = useState('Jakarta');
  const [activeRadius, setActiveRadius] = useState<number | 'all'>(10);
  const [sortBy, setSortBy] = useState('recommended');

  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [specFilters, setSpecFilters] = useState<SpecificationFilterState>({
    courtTypes: { indoor: true, outdoor: true, semiIndoor: true },
    floorTypes: { syntheticGrass: true, vinyl: true, interlock: true, parquet: true },
    amenities: { warmShower: true, musholla: true, carParking: true, canteen: true }
  });

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    venue: Venue | null;
    slot: string | null;
    dateTab: string;
    bookingCode: string;
  }>({
    venue: null,
    slot: null,
    dateTab: 'today',
    bookingCode: ''
  });

  // Fetch / Filter venues
  useEffect(() => {
    let isCancelled = false;
    fetchVenues({
      sport: activeSport,
      city: activeCity,
      radius: activeRadius,
      search: searchQuery,
      sort: sortBy
    }).then((res) => {
      if (!isCancelled) {
        setVenues(res);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeSport, activeCity, activeRadius, searchQuery, sortBy]);

  // Nama kota aktif untuk subtext
  const activeCityName = useMemo(() => {
    if (activeCity === 'all') return 'Seluruh Indonesia (38 Provinsi)';
    const found = CITY_OPTIONS.find((c) => c.id === activeCity);
    return found ? found.name : activeCity;
  }, [activeCity]);

  // Geolocation Handler
  const handleGeolocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          alert(`Lokasi GPS terdeteksi: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]. Menampilkan lapangan terdekat.`);
          fetchVenues({
            sport: activeSport,
            lat: latitude,
            lng: longitude,
            radius: 10,
            sort: 'distance'
          }).then((res) => setVenues(res));
        },
        () => {
          alert('Akses lokasi GPS ditolak atau tidak didukung browser.');
        }
      );
    }
  };

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setActiveSport('all');
    setActiveCity('all');
    setActiveRadius('all');
    setSearchQuery('');
  };

  const handleProceedToCheckout = async (venue: Venue, selectedSlot: string, dateTab: string) => {
    const bookingRes = await createBookingApi({
      venueId: venue.id,
      customerName: 'Rian Pratama',
      customerPhone: '081234567890',
      date: dateTab === 'today' ? new Date().toISOString().split('T')[0] : 'Tomorrow',
      timeSlot: selectedSlot,
      totalAmount: venue.priceHourly
    });

    setCheckoutData({
      venue,
      slot: selectedSlot,
      dateTab,
      bookingCode: bookingRes.bookingCode
    });

    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 text-slate-800">
      {/* 1. TOP APP BAR */}
      <TopAppBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGeolocation={handleGeolocation}
      />

      {/* 2. FILTER & CATEGORY CHIPS BAR */}
      <FilterBar
        activeSport={activeSport}
        onSelectSport={setActiveSport}
        activeCity={activeCity}
        onSelectCity={setActiveCity}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
      />

      {/* 3. MAIN SPLIT VIEW (CATALOG LIST & LEAFLET MAP) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Sisi Kiri: Katalog Lapangan */}
        <VenueCatalogList
          venues={venues}
          activeRadius={activeRadius}
          onSelectRadius={setActiveRadius}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeCityName={activeCityName}
          onSelectVenue={handleSelectVenue}
          onResetFilters={handleResetFilters}
        />

        {/* Sisi Kanan: Peta Interaktif Leaflet */}
        <LeafletMap
          venues={venues}
          activeVenueId={selectedVenue?.id}
          onSelectVenue={handleSelectVenue}
          onResetToIndonesia={() => setActiveCity('all')}
        />
      </main>

      {/* 4. VENUE DETAIL DRAWER (SLIDE-IN DARI KANAN) */}
      <VenueDetailDrawer
        venue={selectedVenue}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 5. FILTER SPECIFICATION MODAL */}
      <SpecificationFilterModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        filters={specFilters}
        onFilterChange={setSpecFilters}
        onApply={() => alert('Filter spesifikasi berhasil diterapkan!')}
      />

      {/* 6. MIDTRANS QRIS CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setIsDrawerOpen(false);
          alert('Terima kasih! Tiket dan barcode booking telah dikirimkan ke WhatsApp & Akun Anda.');
        }}
        venue={checkoutData.venue}
        selectedSlot={checkoutData.slot}
        dateTab={checkoutData.dateTab}
        bookingCode={checkoutData.bookingCode}
      />
    </div>
  );
}
