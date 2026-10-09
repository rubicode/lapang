'use client';

import React from 'react';
import { Navigation, MapPin, ChevronRight, MapPinOff } from 'lucide-react';
import { Venue } from '@/types';

interface VenueCatalogListProps {
  venues: Venue[];
  activeRadius: number | 'all';
  onSelectRadius: (r: number | 'all') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  activeCityName: string;
  onSelectVenue: (venue: Venue) => void;
  onResetFilters: () => void;
}

export const VenueCatalogList: React.FC<VenueCatalogListProps> = ({
  venues,
  activeRadius,
  onSelectRadius,
  sortBy,
  onSortChange,
  activeCityName,
  onSelectVenue,
  onResetFilters
}) => {
  return (
    <section className="w-full md:w-[48%] lg:w-[42%] xl:w-[38%] h-full flex flex-col bg-white border-r border-gray-200 z-10 shrink-0">
      {/* List Header with Stats & Sort */}
      <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm md:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Lapangan Tersedia</span>
            <span className="bg-brand-100 text-brand-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {venues.length} Venue
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Menampilkan hasil di <span className="font-semibold text-slate-700">{activeCityName}</span>
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="recommended">Rekomendasi</option>
            <option value="price_low">Harga Terendah</option>
            <option value="rating_high">Rating Tertinggi</option>
            <option value="distance">Jarak Terdekat</option>
          </select>
        </div>
      </div>

      {/* Quick Radius Bar */}
      <div className="px-4 py-2 bg-brand-50/70 border-b border-brand-100 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1.5 text-brand-900 font-semibold">
          <Navigation className="w-3.5 h-3.5 text-brand-800" />
          <span>Radius Jangkauan:</span>
        </div>
        <div className="flex items-center gap-1">
          {[5, 10, 25, 'all'].map((rad) => {
            const isActive = activeRadius === rad;
            const label = rad === 'all' ? 'Semua' : `${rad} km`;
            return (
              <button
                key={rad}
                onClick={() => onSelectRadius(rad as number | 'all')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-gray-200 hover:bg-brand-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Venue Cards Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/60">
        {venues.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center mx-auto mb-3">
              <MapPinOff className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Tidak ada lapangan yang cocok</p>
            <p className="text-xs text-slate-500 mt-1">
              Coba ganti filter cabang olahraga atau perbesar radius pencarian Anda.
            </p>
            <button
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 bg-brand-800 text-white text-xs font-bold rounded-xl hover:bg-brand-900 transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          venues.map((venue) => (
            <div
              key={venue.id}
              id={`card-${venue.id}`}
              onClick={() => onSelectVenue(venue)}
              className="venue-card bg-white rounded-2xl p-3 border border-gray-200/90 hover:border-brand-600 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex gap-3">
                {/* Thumbnail Image */}
                <div className="w-28 sm:w-32 h-32 rounded-xl overflow-hidden shrink-0 relative bg-slate-100">
                  <img
                    src={venue.mainImage}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                    ★ {venue.rating}
                  </span>
                </div>

                {/* Content Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span>{venue.sportIcon}</span>
                        <span>{venue.sportName}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {venue.distance || `${venue.distanceKm} km`}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 mt-1.5 line-clamp-1 group-hover:text-brand-800 transition">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{venue.address}</p>

                    {/* Spec badges */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] font-medium bg-gray-100 text-slate-600 px-2 py-0.5 rounded">
                        {venue.courtType}
                      </span>
                      <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                        Tersedia Hari Ini
                      </span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Mulai dari</span>
                      <span className="text-sm font-extrabold text-brand-800">
                        {venue.priceFormatted}
                        <span className="text-[11px] font-normal text-slate-500">/jam</span>
                      </span>
                    </div>
                    <button className="px-3.5 py-1.5 bg-brand-800 text-white text-xs font-bold rounded-xl shadow-xs group-hover:bg-brand-900 transition flex items-center gap-1">
                      <span>Lihat Jadwal</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
