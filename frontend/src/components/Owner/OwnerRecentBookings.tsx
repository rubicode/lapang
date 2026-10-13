'use strict';
'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { OwnerRecentBookingItem } from '@/types';

interface OwnerRecentBookingsProps {
  bookings: OwnerRecentBookingItem[];
  onViewFullSchedule?: () => void;
}

export const OwnerRecentBookings: React.FC<OwnerRecentBookingsProps> = ({
  bookings,
  onViewFullSchedule
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-[#DCF5D8] text-[#1B5C22]';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Recent Bookings
        </h2>
        <button
          title="Opsi Tambahan"
          className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Booking Items List */}
      <div className="space-y-3.5">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between gap-3 py-1"
          >
            {/* Left: Initials Avatar + Name & Court Time */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#EBF0E6] text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                {booking.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {booking.customerName}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  {booking.courtName} • {booking.timeSlot}
                </p>
              </div>
            </div>

            {/* Right: Status Badge & Amount */}
            <div className="text-right shrink-0">
              <span
                className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md ${getStatusBadge(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                {booking.currencySymbol}{booking.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Full Schedule Link */}
      <div className="mt-5 pt-3 border-t border-slate-100 text-center">
        <button
          onClick={onViewFullSchedule}
          className="text-[11px] font-black tracking-wider text-[#144723] hover:text-[#0C2B15] uppercase transition cursor-pointer"
        >
          FULL SCHEDULE
        </button>
      </div>
    </div>
  );
};
