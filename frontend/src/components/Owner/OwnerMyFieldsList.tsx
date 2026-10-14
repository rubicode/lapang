'use strict';
'use client';

import React from 'react';
import { Users, Sun, Trees, Sparkles } from 'lucide-react';
import { OwnerFieldItem } from '@/types';

interface OwnerMyFieldsListProps {
  fields: OwnerFieldItem[];
  onManageField: (field: OwnerFieldItem) => void;
  onViewAll?: () => void;
}

export const OwnerMyFieldsList: React.FC<OwnerMyFieldsListProps> = ({
  fields,
  onManageField,
  onViewAll
}) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Lapangan Saya
          </h2>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
            {fields.length} Total
          </span>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-extrabold text-[#154624] hover:text-[#0C2A15] transition cursor-pointer"
        >
          Lihat Semua
        </button>
      </div>

      {/* Field Cards */}
      <div className="space-y-4">
        {fields.map((field) => {
          const isIndoor = field.surfaceSpec.toLowerCase().includes('indoor');

          return (
            <div
              key={field.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Left Thumbnail Image */}
                <div className="w-full sm:w-48 md:w-52 h-44 sm:h-48 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                  <img
                    src={field.image}
                    alt={field.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>

                {/* Right Details */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    {/* Header: Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {field.name}
                      </h3>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md tracking-wider uppercase ${
                          field.status === 'ACTIVE'
                            ? 'bg-[#E3F6DF] text-[#1B5C22]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {field.status === 'ACTIVE' ? 'AKTIF' : 'PERAWATAN'}
                      </span>
                    </div>

                    {/* District Location */}
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {field.district}
                    </p>

                    {/* Format & Surface Specs */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{field.matchFormat}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isIndoor ? (
                          <Trees className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span>{field.surfaceSpec}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Price & Manage Button */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                    <div>
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        {field.currencySymbol}{field.priceHourly}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        /jam
                      </span>
                    </div>

                    <button
                      onClick={() => onManageField(field)}
                      className="px-4 py-1.5 rounded-full bg-[#EBF0E6] hover:bg-[#DEE5D7] text-slate-800 text-xs font-extrabold transition shadow-2xs cursor-pointer"
                    >
                      Kelola
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
