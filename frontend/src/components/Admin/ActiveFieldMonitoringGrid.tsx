'use client';

import React from 'react';
import { MapPin, ArrowRight, Activity, Wrench } from 'lucide-react';
import { ActiveFieldMonitoringItem } from '@/types';

interface ActiveFieldMonitoringGridProps {
  fields: ActiveFieldMonitoringItem[];
  onOpenMonitoringHub: () => void;
  onSelectField: (field: ActiveFieldMonitoringItem) => void;
}

export const ActiveFieldMonitoringGrid: React.FC<ActiveFieldMonitoringGridProps> = ({
  fields,
  onOpenMonitoringHub,
  onSelectField
}) => {
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Pemantauan Lapangan Aktif
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantauan langsung okupansi fasilitas
          </p>
        </div>

        <button
          onClick={onOpenMonitoringHub}
          className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group transition cursor-pointer"
        >
          <span>Buka Pusat Pemantauan</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {fields.map((field) => {
          const isLive = field.status === 'LIVE';

          return (
            <div
              key={field.id}
              onClick={() => onSelectField(field)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Image with overlay badge */}
              <div className="relative h-44 w-full overflow-hidden bg-emerald-950/20">
                <img
                  referrerPolicy="no-referrer"
                  src={field.image}
                  alt={field.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Badge Overlay: LIVE or MAINTENANCE */}
                <div className="absolute top-3.5 left-3.5">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-[#0e3813] text-white shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>LANGSUNG</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-[#0e3813] text-white shadow-sm">
                      <Wrench className="w-3 h-3 text-amber-300" />
                      <span>PERAWATAN</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {field.name}
                  </h4>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{field.location}</span>
                  </div>
                </div>

                {/* Card Footer: Avatars stack or Subtext + Occupancy */}
                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                  {isLive ? (
                    <>
                      {/* Avatar stack */}
                      <div className="flex items-center -space-x-2">
                        {field.avatars?.map((av, idx) => (
                          <img
                            key={idx}
                            referrerPolicy="no-referrer"
                            src={av}
                            alt="Player"
                            className="w-6 h-6 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          +{field.extraAvatarsCount || 8}
                        </div>
                      </div>

                      {/* Occupancy rate */}
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                        {field.occupancyFormatted || '60% Terisi'}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* SubText for Maintenance */}
                      <span className="text-xs italic text-slate-400 font-medium">
                        {field.subText || 'Pembersihan sedang berlangsung...'}
                      </span>

                      {/* Offline status */}
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-800">
                        {field.occupancyStatus || 'Nonaktif'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
