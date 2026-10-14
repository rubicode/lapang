'use strict';
'use client';

import React from 'react';
import {
  LayoutGrid,
  Calendar,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface OwnerSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  ownerName: string;
  roleTitle: string;
  avatarUrl?: string;
  onLogout: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  activeTab,
  onSelectTab,
  ownerName,
  roleTitle,
  avatarUrl,
  onLogout
}) => {
  const menuItems = [
    { id: 'fields', label: 'Lapangan', icon: LayoutGrid },
    { id: 'bookings', label: 'Reservasi', icon: Calendar },
    { id: 'schedule', label: 'Jadwal', icon: Clock },
    { id: 'revenue', label: 'Pendapatan', icon: DollarSign },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#F8F9F5] border-r border-[#E5E9DF] flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans z-20">
      {/* Top Header & Logo */}
      <div>
        <div className="p-6 pb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#132A17] tracking-tight">
              Pitch Gallery
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dasbor Manajemen
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#E3EBE0] text-[#133E1E] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#EEF2EA]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#133E1E]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Card */}
      <div className="p-4 border-t border-[#E5E9DF]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-slate-200/60 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={ownerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-900 truncate">
                {ownerName || 'Marcus Silva'}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 truncate">
                {roleTitle === 'Premium Owner' ? 'Pemilik Premium' : roleTitle || 'Pemilik Lapangan'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar Akun"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick link back to catalog */}
        <Link
          href="/"
          className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#133E1E] transition py-1 text-center"
        >
          <span>Kembali ke Lapang.id</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
};
