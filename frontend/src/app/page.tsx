'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TopAppBar } from '@/components/Header/TopAppBar';
import { FilterBar } from '@/components/Filters/FilterBar';
import { VenueCatalogList } from '@/components/Catalog/VenueCatalogList';
import { VenueDetailDrawer } from '@/components/Drawer/VenueDetailDrawer';
import { SpecificationFilterModal } from '@/components/Modals/SpecificationFilterModal';
import { CheckoutModal } from '@/components/Modals/CheckoutModal';
import { Venue, SpecificationFilterState, SportFilter, CityOption } from '@/types';
import { fetchVenues, fetchCategories, fetchCities, createBookingApi } from '@/services/api';

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
  const [activeCity, setActiveCity] = useState('all');
  const [activeRadius, setActiveRadius] = useState<number | 'all'>(10);
  const [sortBy, setSortBy] = useState('recommended');

  const [categories, setCategories] = useState<SportFilter[]>([
    { id: 'all', name: 'Semua Cabang', icon: '⚡' }
  ]);
  const [cities, setCities] = useState<CityOption[]>([
    { id: 'all', name: '📍 Seluruh Indonesia (38 Provinsi)' }
  ]);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // 1. Ambil Kategori & Kota dari Database saat awal buka
  useEffect(() => {
    fetchCategories().then((cats) => {
      if (cats.length > 0) setCategories(cats);
    });
    fetchCities().then((cts) => {
      if (cts.length > 0) setCities(cts);
    });
  }, []);

  // 2. Fetch / Filter venues dinamis dari PostgreSQL
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    // Filter spesifikasi jika ada yang di-uncheck
    const activeCourts = Object.entries(specFilters.courtTypes)
      .filter(([_, active]) => active)
      .map(([k]) => k === 'semiIndoor' ? 'semi_indoor' : k);

    const activeFloors = Object.entries(specFilters.floorTypes)
      .filter(([_, active]) => active)
      .map(([k]) => k === 'syntheticGrass' ? 'sintetis' : k);

    const activeAm = Object.entries(specFilters.amenities)
      .filter(([_, active]) => active)
      .map(([k]) => k === 'warmShower' ? 'Shower' : k === 'musholla' ? 'Musholla' : k === 'carParking' ? 'Parkir' : 'Kantin');

    fetchVenues({
      sport: activeSport,
      city: activeCity,
      radius: activeRadius,
      search: searchQuery,
      sort: sortBy,
      court_types: activeCourts.length < 3 ? activeCourts.join(',') : undefined,
      floor_types: activeFloors.length < 4 ? activeFloors.join(',') : undefined,
      amenities: activeAm.length < 4 && activeAm.length > 0 ? activeAm.join(',') : undefined
    }).then((res) => {
      if (!isCancelled) {
        setVenues(res);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [activeSport, activeCity, activeRadius, searchQuery, sortBy, specFilters]);

  // Nama kota aktif untuk subtext
  const activeCityName = useMemo(() => {
    if (activeCity === 'all') return 'Seluruh Indonesia (38 Provinsi)';
    const found = cities.find((c) => c.id === activeCity);
    return found ? found.name : activeCity;
  }, [activeCity, cities]);

  // Geolocation Handler
  const handleGeolocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          alert(`Lokasi GPS terdeteksi: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]. Menampilkan lapangan terdekat.`);
          setIsLoading(true);
          fetchVenues({
            sport: activeSport,
            lat: latitude,
            lng: longitude,
            radius: 10,
            sort: 'distance'
          }).then((res) => {
            setVenues(res);
            setIsLoading(false);
          });
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

  const handleProceedToCheckout = async (venue: Venue, selectedSlot: string, dateTab: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const chosenDate = dateTab === 'today' ? today : tomorrowStr;

    // Kirim reservasi ke backend API (ACID Transaction)
    const result = await createBookingApi({
      venueId: venue.id,
      customerName: 'Rian Pratama',
      customerPhone: '081234567890',
      date: chosenDate,
      timeSlot: selectedSlot,
      totalAmount: venue.priceHourly
    });

    setCheckoutData({
      venue,
      slot: selectedSlot,
      dateTab,
      bookingCode: result.bookingCode
    });

    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* 1. Header Navigation Bar */}
      <TopAppBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGeolocation={handleGeolocation}
      />

      {/* 2. Filter & Category Chips Bar */}
      <FilterBar
        categories={categories}
        cities={cities}
        activeSport={activeSport}
        onSelectSport={setActiveSport}
        activeCity={activeCity}
        onSelectCity={setActiveCity}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
      />

      {/* 3. Main Split Screen (Katalog Sisi Kiri & Peta Leaflet Sisi Kanan) */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Sisi Kiri: Katalog Venue */}
        <section className="w-full md:w-[48%] lg:w-[42%] xl:w-[38%] h-full flex flex-col bg-white border-r border-gray-200 z-10 shrink-0">
          <VenueCatalogList
            venues={venues}
            activeRadius={activeRadius}
            onSelectRadius={setActiveRadius}
            sortBy={sortBy}
            onSortChange={setSortBy}
            activeCityName={activeCityName}
            onSelectVenue={handleSelectVenue}
            onResetFilters={() => {
              setActiveSport('all');
              setActiveCity('all');
              setActiveRadius('all');
              setSearchQuery('');
            }}
          />
        </section>

        {/* Sisi Kanan: Peta Interaktif Leaflet */}
        <section className="hidden md:block flex-1 h-full relative z-0">
          <LeafletMap
            venues={venues}
            onSelectVenue={handleSelectVenue}
          />
        </section>
      </main>

      {/* 4. Venue Detail Drawer (Panel Geser Kanan) */}
      <VenueDetailDrawer
        venue={selectedVenue}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 5. Specification Filter Modal */}
      <SpecificationFilterModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        filters={specFilters}
        onFilterChange={setSpecFilters}
        onApply={() => setIsSpecModalOpen(false)}
      />

      {/* 6. Checkout QRIS / E-Tiket Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        venue={checkoutData.venue}
        selectedSlot={checkoutData.slot}
        dateTab={checkoutData.dateTab}
        bookingCode={checkoutData.bookingCode}
      />
    </div>
  );
}
