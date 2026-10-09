'use client';

import React from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { SportFilter, CityOption } from '@/types';

interface FilterBarProps {
  categories?: SportFilter[];
  cities?: CityOption[];
  activeSport: string;
  onSelectSport: (sportId: string) => void;
  activeCity: string;
  onSelectCity: (cityId: string) => void;
  onOpenSpecModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories = [{ id: 'all', name: 'Semua Cabang', icon: '⚡' }],
  cities = [{ id: 'all', name: '📍 Seluruh Indonesia (38 Provinsi)' }],
  activeSport,
  onSelectSport,
  activeCity,
  onSelectCity,
  onOpenSpecModal
}) => {
  return (
    <div className="bg-white border-t border-gray-100 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar shrink-0 z-20">
      {/* Sport Category Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {categories.map((cat) => {
          const isActive = activeSport === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectSport(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isActive
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'bg-gray-100 text-slate-700 hover:bg-brand-50 hover:text-brand-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Trigger & City Selector */}
      <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-gray-200">
        {/* City Selector */}
        <div className="relative inline-block text-left">
          <select
            value={activeCity}
            onChange={(e) => onSelectCity(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-brand-800 appearance-none cursor-pointer hover:bg-gray-200 transition"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Filter Modal Trigger */}
        <button
          onClick={onOpenSpecModal}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-gray-200 hover:border-brand-800 px-3 py-1.5 rounded-lg transition hover:bg-brand-50 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-800" />
          <span>Filter Spesifikasi</span>
          <span className="w-2 h-2 rounded-full bg-brand-500"></span>
        </button>
      </div>
    </div>
  );
};
