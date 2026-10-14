'use strict';
'use client';

import React from 'react';
import { DollarSign, Calendar, Star, Users } from 'lucide-react';
import { OwnerStats } from '@/types';

interface OwnerStatCardsGridProps {
  stats: OwnerStats;
}

export const OwnerStatCardsGrid: React.FC<OwnerStatCardsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Revenue Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-full bg-[#EBF5EA] text-[#1C5D23] flex items-center justify-center">
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#DCF5D8] text-[#1D5E21]">
            {stats.revenueGrowth || '+12.5%'}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">
            Total Pendapatan
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.revenueFormatted || '$24,580.00'}
          </p>
        </div>
      </div>

      {/* 2. Active Bookings Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-full bg-[#EBF5EA] text-[#1C5D23] flex items-center justify-center">
            <Calendar className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCF5D8] text-[#1D5E21]">
            {stats.bookingDemandBadge === 'High' ? 'Tinggi' : stats.bookingDemandBadge || 'Tinggi'}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">
            Reservasi Aktif
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.activeBookings || 142}
          </p>
        </div>
      </div>

      {/* 3. Avg. Rating Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-full bg-[#EBF5EA] text-[#1C5D23] flex items-center justify-center">
            <Star className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {stats.avgRatingBadge || '4.9/5'}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">
            Rating Rata-rata
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.avgRatingScore || '98%'}
          </p>
        </div>
      </div>

      {/* 4. Unique Visitors Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-full bg-[#EBF5EA] text-[#1C5D23] flex items-center justify-center">
            <Users className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">
            Pengunjung Unik
          </p>
          <p className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.uniqueVisitors || '3,842'}
          </p>
        </div>
      </div>
    </div>
  );
};
