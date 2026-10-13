'use client';

import React from 'react';
import { Users, ShieldCheck, Trophy, Banknote, TrendingUp } from 'lucide-react';
import { AdminStats } from '@/types';

interface StatCardsGridProps {
  stats: AdminStats;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-6">
      {/* 1. Total Users Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#eaf3ea] text-[#166534] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eaf3ea] text-[#166534]">
            {stats.totalUsersGrowth || '+12%'}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 mb-1">Total Users</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {stats.totalUsersFormatted}
        </p>
      </div>

      {/* 2. Total Owners Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#eaf3ea] text-[#166534] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eaf3ea] text-[#166534]">
            {stats.totalOwnersGrowth || '+4%'}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 mb-1">Total Owners</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {stats.totalOwnersFormatted}
        </p>
      </div>

      {/* 3. Active Bookings Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#eaf3ea] text-[#166534] flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#eaf3ea] text-[#166534]">
            {stats.activeBookingsBadge || 'Active'}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 mb-1">Active Bookings</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {stats.activeBookingsFormatted}
        </p>
      </div>

      {/* 4. Monthly Revenue Card (Solid Deep Emerald Green) */}
      <div className="bg-[#14532d] rounded-2xl p-5 border border-emerald-900 text-white shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center border border-emerald-800/40">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-emerald-200/90 mb-1">Monthly Revenue</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {stats.monthlyRevenueFormatted}
        </p>
      </div>
    </div>
  );
};
