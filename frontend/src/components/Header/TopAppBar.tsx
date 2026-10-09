'use client';

import React from 'react';
import { Compass, Search, Crosshair, ShieldCheck, Calendar } from 'lucide-react';

interface TopAppBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onGeolocation: () => void;
  onOpenBookingHistory?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  searchQuery,
  onSearchChange,
  onGeolocation,
  onOpenBookingHistory
}) => {
  return (
    <header className="bg-white border-b border-gray-200 z-30 shrink-0">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & National Badge */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-800/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Lapang<span className="text-brand-800">.id</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 uppercase tracking-wider">
                  Nasional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Peta &amp; Booking Lapangan Olahraga Seluruh Indonesia
              </p>
            </div>
          </a>
        </div>

        {/* Quick Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-2 bg-gray-100/80 hover:bg-gray-100 transition rounded-full p-1.5 border border-gray-200 focus-within:border-brand-800 focus-within:ring-2 focus-within:ring-brand-300">
          <div className="flex items-center pl-3 pr-2 text-slate-400">
            <Search className="w-4 h-4 text-brand-800" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari lapangan, nama GOR, kota (Jakarta, Surabaya, Bandung...)"
            className="w-full bg-transparent text-xs lg:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onGeolocation}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white text-brand-800 rounded-full shadow-sm hover:bg-brand-50 transition border border-gray-200 whitespace-nowrap cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-brand-800" />
            <span>Dekat Saya</span>
          </button>
        </div>

        {/* User Nav Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => alert("Portal Pendaftaran Mitra Venue dibuka!")}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-brand-800 px-3 py-2 rounded-lg hover:bg-brand-50 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Daftarkan Venue</span>
          </button>

          <button
            onClick={onOpenBookingHistory || (() => alert("Membuka riwayat booking terverifikasi Anda"))}
            className="p-2 text-slate-600 hover:text-brand-800 hover:bg-gray-100 rounded-full transition relative cursor-pointer"
            title="Riwayat Booking"
          >
            <Calendar className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full"></span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <div
            onClick={() => alert("Profil Pemain: Rian Pratama\nStatus: Verified Booker 🏅\nWilayah: DKI Jakarta")}
            className="flex items-center gap-2 pl-1 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center text-xs ring-2 ring-brand-300">
              RP
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <p className="font-bold text-slate-800">Rian Pratama</p>
              <p className="text-[10px] text-brand-700 font-semibold">Verified Player 🏅</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
