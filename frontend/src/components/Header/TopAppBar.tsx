'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Search, Crosshair, ShieldCheck, Calendar, KeyRound, LogOut } from 'lucide-react';
import { AuthUser } from '@/types';
import { AuthModal } from '@/components/Auth/AuthModal';

interface TopAppBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onGeolocation: () => void;
  onOpenBookingHistory?: () => void;
  currentUser?: AuthUser | null;
  onUserChange?: (user: AuthUser | null) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  searchQuery,
  onSearchChange,
  onGeolocation,
  onOpenBookingHistory,
  currentUser: initialUser,
  onUserChange
}) => {
  const [user, setUser] = useState<AuthUser | null>(
    initialUser || {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Rian Pratama',
      email: 'rian@lapang.id',
      role: 'user',
      is_verified_player: true
    }
  );

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
    }
  }, [initialUser]);

  const handleUserSuccess = (newUser: AuthUser) => {
    setUser(newUser);
    if (onUserChange) onUserChange(newUser);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUser(null);
    if (onUserChange) onUserChange(null);
    alert('Anda telah logout dari akun.');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Super Admin 🛡️', bg: 'bg-purple-100 text-purple-800' };
      case 'owner':
        return { text: 'Venue Owner 🏢', bg: 'bg-amber-100 text-amber-800' };
      default:
        return { text: 'Verified Player 🏅', bg: 'bg-brand-100 text-brand-800' };
    }
  };

  const roleInfo = user ? getRoleBadge(user.role) : null;

  return (
    <>
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
              onClick={() => {
                if (user?.role === 'owner' || user?.role === 'admin') {
                  alert(`Dashboard Pengelola Venue aktif untuk ${user.name}`);
                } else {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }
              }}
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

            {user ? (
              <div
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-2 pl-1 cursor-pointer select-none group"
                title="Klik untuk beralih akun atau melihat info RBAC"
              >
                <div className="w-9 h-9 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center text-xs ring-2 ring-brand-300 group-hover:ring-brand-500 transition shadow-xs">
                  {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <p className="font-bold text-slate-800 group-hover:text-brand-800 transition">{user.name}</p>
                  <p className={`text-[10px] font-semibold ${roleInfo?.bg} px-1.5 py-0.2 rounded inline-block mt-0.5`}>
                    {roleInfo?.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:block p-1 text-slate-400 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-brand-800 hover:bg-brand-700 px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal (Sesuai Referensi Mockup Layar Belah & Bahasa Indonesia) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={handleUserSuccess}
      />
    </>
  );
};
