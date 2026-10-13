'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { OwnerSidebar } from '@/components/Owner/OwnerSidebar';
import { OwnerHeader } from '@/components/Owner/OwnerHeader';
import { OwnerStatCardsGrid } from '@/components/Owner/OwnerStatCardsGrid';
import { OwnerMyFieldsList } from '@/components/Owner/OwnerMyFieldsList';
import { OwnerRecentBookings } from '@/components/Owner/OwnerRecentBookings';
import { PeakHoursTipCard } from '@/components/Owner/PeakHoursTipCard';
import { OwnerFooter } from '@/components/Owner/OwnerFooter';
import { NewPitchModal } from '@/components/Owner/NewPitchModal';
import { ManagePitchModal } from '@/components/Owner/ManagePitchModal';
import { OwnerBookingsView } from '@/components/Owner/OwnerBookingsView';
import { OwnerScheduleView } from '@/components/Owner/OwnerScheduleView';
import { OwnerRevenueView } from '@/components/Owner/OwnerRevenueView';
import { OwnerSettingsView } from '@/components/Owner/OwnerSettingsView';
import {
  fetchOwnerOverview,
  toggleOwnerEarlyBirdPromoApi,
  downloadOwnerReportApi
} from '@/services/api';
import { OwnerOverviewResponse, OwnerFieldItem, AuthUser } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OwnerDashboardPage() {
  const router = useRouter();

  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('fields');

  // Overview Data from PostgreSQL
  const [overviewData, setOverviewData] = useState<OwnerOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals & Actions
  const [isNewPitchOpen, setIsNewPitchOpen] = useState(false);
  const [selectedFieldToManage, setSelectedFieldToManage] = useState<OwnerFieldItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState('');

  // 1. Auth Guard: Validasi apakah pengguna terotentikasi sebagai owner atau admin
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('lapang_token');
    const storedUserStr = localStorage.getItem('lapang_user');

    if (!token || !storedUserStr) {
      router.push('/login?returnUrl=/owner&error=unauthorized_owner');
      return;
    }

    try {
      const user: AuthUser = JSON.parse(storedUserStr);
      if (user.role !== 'owner' && user.role !== 'admin') {
        router.push('/login?returnUrl=/owner&error=unauthorized_owner');
        return;
      }
      setCurrentUser(user);
    } catch {
      router.push('/login?returnUrl=/owner&error=unauthorized_owner');
      return;
    } finally {
      setIsAuthChecking(false);
    }
  }, [router]);

  // 2. Load Overview Data langsung dari PostgreSQL
  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await fetchOwnerOverview();
      setOverviewData(data);
    } catch (err: any) {
      console.error('Gagal memuat owner overview dari database:', err);
      setErrorMessage(err.message || 'Gagal memuat data dari database PostgreSQL.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecking && currentUser) {
      loadOverview();
    }
  }, [isAuthChecking, currentUser, loadOverview]);

  // 3. Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lapang_token');
      localStorage.removeItem('lapang_user');
    }
    router.push('/login?message=logged_out');
  };

  // 4. Handle Export Report
  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      await downloadOwnerReportApi();
      showToast('Laporan owner berhasil diunduh dalam format CSV.');
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  // 5. Handle Apply Promotion
  const handleTogglePromotion = async () => {
    if (!overviewData) return;
    setIsPromoLoading(true);
    try {
      const currentActive = overviewData.peakHoursTip.isPromoApplied;
      const res = await toggleOwnerEarlyBirdPromoApi(!currentActive);
      setOverviewData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          venue: {
            ...prev.venue,
            earlyBirdPromoActive: res.earlyBirdPromoActive
          },
          peakHoursTip: {
            ...prev.peakHoursTip,
            isPromoApplied: res.earlyBirdPromoActive
          }
        };
      });
      showToast(
        res.earlyBirdPromoActive
          ? 'Early Bird Promotion (diskon 20%) berhasil diaktifkan di database!'
          : 'Early Bird Promotion dinonaktifkan.'
      );
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status promosi.');
    } finally {
      setIsPromoLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => {
      setActionSuccessToast('');
    }, 4000);
  };

  // Loading screen saat verifikasi auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FBFBF9] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#133E1E] animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-600">
          Memeriksa izin akses Owner Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex text-slate-900 font-sans">
      {/* 1. Sidebar Navigasi Kiri */}
      <OwnerSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        ownerName={overviewData?.owner.name || currentUser?.name || 'Marcus Silva'}
        roleTitle={overviewData?.owner.roleTitle || 'Premium Owner'}
        avatarUrl={overviewData?.owner.avatarUrl || currentUser?.avatar_url || undefined}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {actionSuccessToast && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs animate-in fade-in duration-200 flex items-center justify-between">
              <span>{actionSuccessToast}</span>
              <button
                onClick={() => setActionSuccessToast('')}
                className="text-emerald-600 hover:text-emerald-900 ml-3 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error Banner jika DB gagal dihubungi */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={loadOverview}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Content Switched by Active Tab */}
          {activeTab === 'fields' && (
            <>
              {/* Header Dashboard */}
              <OwnerHeader
                onExportReport={handleExportReport}
                onOpenNewPitch={() => setIsNewPitchOpen(true)}
                isExporting={isExporting}
              />

              {isLoading && !overviewData ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#133E1E] animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-500">
                    Memuat data lapangan dan reservasi langsung dari database...
                  </p>
                </div>
              ) : overviewData ? (
                <>
                  {/* Stat Cards 4 Metrik */}
                  <OwnerStatCardsGrid stats={overviewData.stats} />

                  {/* Split Content: My Fields (Kiri) & Recent Bookings + Peak Hours Tip (Kanan) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Kolom Kiri: My Fields */}
                    <div className="lg:col-span-7 xl:col-span-8">
                      <OwnerMyFieldsList
                        fields={overviewData.fields}
                        onManageField={(f) => setSelectedFieldToManage(f)}
                        onViewAll={() => setActiveTab('fields')}
                      />
                    </div>

                    {/* Kolom Kanan: Recent Bookings & Peak Hours Tip */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                      <OwnerRecentBookings
                        bookings={overviewData.recentBookings}
                        onViewFullSchedule={() => setActiveTab('schedule')}
                      />

                      <PeakHoursTipCard
                        isPromoApplied={overviewData.peakHoursTip.isPromoApplied}
                        onApplyPromotion={handleTogglePromotion}
                        isLoading={isPromoLoading}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}

          {activeTab === 'bookings' && (
            <OwnerBookingsView onShowToast={showToast} />
          )}

          {activeTab === 'schedule' && (
            <OwnerScheduleView onShowToast={showToast} />
          )}

          {activeTab === 'revenue' && (
            <OwnerRevenueView onShowToast={showToast} />
          )}

          {activeTab === 'settings' && (
            <OwnerSettingsView
              onShowToast={showToast}
              onSettingsUpdated={loadOverview}
            />
          )}

          {/* Footer */}
          <OwnerFooter />
        </div>
      </main>

      {/* Modal: Tambah Pitch Baru */}
      <NewPitchModal
        isOpen={isNewPitchOpen}
        onClose={() => setIsNewPitchOpen(false)}
        onSuccess={() => {
          showToast('Lapangan baru berhasil disimpan ke PostgreSQL!');
          loadOverview();
        }}
      />

      {/* Modal: Kelola Lapangan */}
      <ManagePitchModal
        field={selectedFieldToManage}
        isOpen={Boolean(selectedFieldToManage)}
        onClose={() => setSelectedFieldToManage(null)}
        onSuccess={() => {
          showToast('Data lapangan berhasil diperbarui di PostgreSQL!');
          loadOverview();
        }}
      />
    </div>
  );
}
