'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Calendar,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'fields' | 'bookings' | 'users' | 'reports' | 'settings';
  onTabChange: (tab: 'fields' | 'bookings' | 'users' | 'reports' | 'settings') => void;
  adminUser?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  adminUser = {
    name: 'Alex Thompson',
    role: 'Admin Global',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80'
  },
  onOpenSettings,
  onLogout
}) => {
  const navItems = [
    {
      id: 'fields' as const,
      label: 'Lapangan',
      icon: LayoutGrid
    },
    {
      id: 'bookings' as const,
      label: 'Reservasi',
      icon: Calendar
    },
    {
      id: 'users' as const,
      label: 'Pengguna',
      icon: Users
    },
    {
      id: 'reports' as const,
      label: 'Laporan',
      icon: BarChart3
    }
  ];

  return (
    <aside className="w-64 bg-[#fbfbfa] md:bg-white border-r border-gray-200/80 flex flex-col justify-between h-full shrink-0 select-none">
      {/* Top Section */}
      <div className="p-6">
        {/* Brand / Management Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
                Manajemen
              </h1>
              <p className="text-xs text-slate-400 font-medium">Dasbor</p>
            </div>
            <Link
              href="/"
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md transition"
              title="Kembali ke Peta Lapang.id"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Publik</span>
            </Link>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#e7eee7] text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-800' : 'text-slate-500'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings & Admin Profile */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={() => {
            onTabChange('settings');
            if (onOpenSettings) onOpenSettings();
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer text-left mb-4 ${
            activeTab === 'settings'
              ? 'bg-[#e7eee7] text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span className="tracking-tight">Pengaturan</span>
        </button>

        {/* Admin User Card (Alex Thompson - Global Admin) */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <img
                referrerPolicy="no-referrer"
                src={adminUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'}
                alt={adminUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/20 bg-slate-200"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80';
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {adminUser.name}
              </h4>
              <p className="text-xs text-slate-400 font-medium truncate">
                {adminUser.role}
              </p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Keluar dari Dasbor Admin"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
