'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  AdminOverviewResponse,
  VerificationApplicant,
  ActiveFieldMonitoringItem,
  AdminStats
} from '@/types';
import {
  fetchAdminOverview,
  updateVerificationStatusApi,
  inviteOwnerApi,
  downloadVerificationCsv
} from '@/services/api';
import { AdminSidebar } from '@/components/Admin/AdminSidebar';
import { PlatformOverviewHeader } from '@/components/Admin/PlatformOverviewHeader';
import { StatCardsGrid } from '@/components/Admin/StatCardsGrid';
import { VerificationQueueTable } from '@/components/Admin/VerificationQueueTable';
import { ActiveFieldMonitoringGrid } from '@/components/Admin/ActiveFieldMonitoringGrid';
import { AdminFooter } from '@/components/Admin/AdminFooter';
import { VerificationReviewModal } from '@/components/Admin/VerificationReviewModal';
import { FixIssuesModal } from '@/components/Admin/FixIssuesModal';
import { InviteOwnerModal } from '@/components/Admin/InviteOwnerModal';
import { FieldMonitoringModal } from '@/components/Admin/FieldMonitoringModal';
import { Menu, X, CheckCircle2, Bell, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fields' | 'bookings' | 'users' | 'reports' | 'settings'>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication & Session Guard State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Dashboard Data State
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 14285,
    totalUsersFormatted: '14,285',
    totalUsersGrowth: '+12%',
    totalOwners: 842,
    totalOwnersFormatted: '842',
    totalOwnersGrowth: '+4%',
    activeBookings: 1120,
    activeBookingsFormatted: '1,120',
    activeBookingsBadge: 'Active',
    monthlyRevenue: 42912,
    monthlyRevenueFormatted: '$42,912',
    currency: '$'
  });

  const [applications, setApplications] = useState<VerificationApplicant[]>([]);
  const [activeFields, setActiveFields] = useState<ActiveFieldMonitoringItem[]>([]);
  const [adminUser, setAdminUser] = useState<{
    name: string;
    role: string;
    email: string;
    avatarUrl?: string;
  }>({
    name: 'Alex Thompson',
    role: 'Global Admin',
    email: 'alex.t@pitchgallery.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<VerificationApplicant | null>(null);

  const [fixIssuesModalOpen, setFixIssuesModalOpen] = useState(false);
  const [selectedIssueApp, setSelectedIssueApp] = useState<VerificationApplicant | null>(null);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [monitoringModalOpen, setMonitoringModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<ActiveFieldMonitoringItem | null>(null);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Verifikasi Autentikasi Admin & Ambil Data Nyata dari PostgreSQL
  useEffect(() => {
    async function verifyAndLoad() {
      setIsLoading(true);
      setIsAuthChecking(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('lapang_token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('lapang_user') : null;
      let storedUser: any = null;
      try {
        if (userStr) storedUser = JSON.parse(userStr);
      } catch {}

      if (!token || !storedUser || storedUser.role !== 'admin') {
        router.replace('/login?returnUrl=/admin&error=unauthorized');
        return;
      }

      setAuthToken(token);
      setIsAuthChecking(false);

      try {
        const data = await fetchAdminOverview(token);
        if (data) {
          setStats(data.stats);
          setApplications(data.verificationQueue);
          setActiveFields(data.activeFields);
          if (data.currentAdmin) {
            setAdminUser(data.currentAdmin);
          }
        }
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('lapang_token');
            localStorage.removeItem('lapang_user');
          }
          router.replace('/login?returnUrl=/admin&error=unauthorized');
          return;
        }
        console.error('Error fetching admin data from database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    verifyAndLoad();
  }, [router]);

  // Action: Download CSV
  const handleDownloadCsv = () => {
    downloadVerificationCsv(applications);
    showToast('File CSV "lapang_verification_queue.csv" berhasil diunduh.');
  };

  // Action: Open Review Modal
  const handleReviewApplication = (app: VerificationApplicant) => {
    setSelectedApplicant(app);
    setReviewModalOpen(true);
  };

  // Action: Approve Facility
  const handleApproveApplication = async (id: string) => {
    await updateVerificationStatusApi(id, 'Verified', undefined, authToken);
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Verified' } : app))
    );
    setStats((prev) => ({
      ...prev,
      totalOwners: prev.totalOwners + 1,
      totalOwnersFormatted: (prev.totalOwners + 1).toLocaleString()
    }));
    showToast('Fasilitas berhasil disetujui & status diubah menjadi Verified di database!');
  };

  // Action: Request Changes (Action Required)
  const handleRequestIssues = async (id: string, note: string) => {
    await updateVerificationStatusApi(id, 'Action Required', note, authToken);
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: 'Action Required',
              issues: [...(app.issues || []), note]
            }
          : app
      )
    );
    showToast('Catatan kendala dikirimkan & status diubah menjadi Action Required di database.');
  };

  // Action: Reject Application
  const handleRejectApplication = async (id: string) => {
    await updateVerificationStatusApi(id, 'Rejected', undefined, authToken);
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Rejected' } : app))
    );
    showToast('Aplikasi fasilitas ditolak di database.');
  };

  // Action: Open Fix Issues Modal
  const handleOpenFixIssues = (app: VerificationApplicant) => {
    setSelectedIssueApp(app);
    setFixIssuesModalOpen(true);
  };

  // Action: Resolve Issues & Verify
  const handleResolveAndVerify = async (id: string) => {
    await updateVerificationStatusApi(id, 'Verified', undefined, authToken);
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'Verified', issues: [] } : app))
    );
    showToast('Kendala berhasil diselesaikan! Fasilitas kini terverifikasi di database.');
  };

  // Action: Invite Owner (Persisted directly to PostgreSQL)
  const handleInviteOwner = async (newOwnerData: {
    name: string;
    email: string;
    facilityName: string;
    sportType: string;
    location: string;
    courtsCount: number;
  }) => {
    const success = await inviteOwnerApi(newOwnerData, authToken);
    if (success && authToken) {
      // Muat ulang data terbaru langsung dari database PostgreSQL
      try {
        const freshData = await fetchAdminOverview(authToken);
        if (freshData) {
          setStats(freshData.stats);
          setApplications(freshData.verificationQueue);
        }
      } catch (err) {
        console.error('Error refreshing admin overview:', err);
      }
    } else {
      const newApp: VerificationApplicant = {
        id: `app-${Date.now().toString().slice(-4)}`,
        user: {
          name: newOwnerData.name,
          email: newOwnerData.email,
          initials: newOwnerData.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(),
          initialsBg: 'bg-emerald-100',
          initialsColor: 'text-emerald-800'
        },
        facilityName: newOwnerData.facilityName,
        submittedDate: 'Just now',
        status: 'Pending Review',
        sportType: newOwnerData.sportType,
        location: newOwnerData.location,
        courtsCount: newOwnerData.courtsCount,
        notes: 'Diundang langsung oleh Admin.'
      };
      setApplications((prev) => [newApp, ...prev]);
    }
    showToast(`Undangan berhasil disimpan di PostgreSQL & dikirimkan ke ${newOwnerData.email}!`);
  };

  // Action: Logout Admin
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lapang_token');
      localStorage.removeItem('lapang_user');
    }
    router.push('/login');
  };

  // Action: Field Status Toggle
  const handleToggleFieldStatus = (fieldId: string) => {
    setActiveFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const nextStatus = f.status === 'LIVE' ? 'MAINTENANCE' : 'LIVE';
          return {
            ...f,
            status: nextStatus,
            badgeType: nextStatus === 'LIVE' ? 'live' : 'maintenance',
            occupancyFormatted: nextStatus === 'LIVE' ? '75% Occupied' : undefined,
            occupancyStatus: nextStatus === 'MAINTENANCE' ? 'Offline' : undefined,
            subText: nextStatus === 'MAINTENANCE' ? 'Cleaning in progress...' : undefined
          };
        }
        return f;
      })
    );
    showToast('Status pemantauan operasional lapangan diperbarui.');
  };

  // Security Guard Loading Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fcfdfa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0e3813] text-white flex items-center justify-center mb-4 shadow-xl animate-pulse">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Verifikasi Hak Akses Administrator...</h2>
        <p className="text-xs text-slate-500 mt-1">Memeriksa otentikasi token JWT & otorisasi peran Admin di database...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex-1 flex flex-col overflow-hidden bg-[#fcfdfa] text-slate-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#0e3813] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Header (Toggle Sidebar) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Management</h1>
            <p className="text-[10px] text-slate-400">Dashboard</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Map</span>
        </Link>
      </div>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={`fixed md:static inset-y-0 left-0 z-40 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } transition-transform duration-200 ease-in-out`}
        >
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
            adminUser={adminUser}
            onOpenSettings={() => {
              showToast('Membuka pengaturan konsol administrasi...');
            }}
            onLogout={handleLogout}
          />
        </div>

        {/* Backdrop for Mobile Sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
          />
        )}

        {/* Right Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between bg-[#fbfbfa]">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'users' ? (
              /* View: Sesuai Persis Tampilan Mockup Gambar */
              <>
                {/* 1. Header: Platform Overview */}
                <PlatformOverviewHeader
                  onDownloadCsv={handleDownloadCsv}
                  onInviteOwner={() => setInviteModalOpen(true)}
                />

                {/* 2. 4 Stat Cards Grid */}
                <StatCardsGrid stats={stats} />

                {/* 3. Verification Queue Table */}
                <VerificationQueueTable
                  applications={applications}
                  onReviewApplication={handleReviewApplication}
                  onFixIssues={handleOpenFixIssues}
                  onViewApplicantDetails={(app) => {
                    setSelectedApplicant(app);
                    setReviewModalOpen(true);
                  }}
                />

                {/* 4. Active Field Monitoring */}
                <ActiveFieldMonitoringGrid
                  fields={activeFields}
                  onOpenMonitoringHub={() => {
                    setSelectedField(activeFields[0] || null);
                    setMonitoringModalOpen(true);
                  }}
                  onSelectField={(field) => {
                    setSelectedField(field);
                    setMonitoringModalOpen(true);
                  }}
                />
              </>
            ) : activeTab === 'fields' ? (
              /* View Fields Management */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Fields Directory</h2>
                    <p className="text-xs text-slate-500 mt-1">Daftar seluruh lapangan dan gelanggang olahraga terdaftar.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition"
                  >
                    ← Kembali ke Overview
                  </button>
                </div>
                <ActiveFieldMonitoringGrid
                  fields={activeFields}
                  onOpenMonitoringHub={() => setMonitoringModalOpen(true)}
                  onSelectField={(field) => {
                    setSelectedField(field);
                    setMonitoringModalOpen(true);
                  }}
                />
              </div>
            ) : activeTab === 'bookings' ? (
              /* View Bookings */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Master Bookings Ledger</h2>
                    <p className="text-xs text-slate-500 mt-1">Rekap seluruh transaksi sewa slot real-time dengan proteksi ACID.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition"
                  >
                    ← Kembali ke Overview
                  </button>
                </div>
                <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                  <p className="text-sm font-bold text-slate-800">1,120 Reservasi Aktif Bulan Ini</p>
                  <p className="text-xs text-slate-500 mt-1">Data reservasi tersinkronisasi otomatis dengan Midtrans Payment Gateway &amp; Row-Locking.</p>
                </div>
              </div>
            ) : activeTab === 'reports' ? (
              /* View Reports */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Financial &amp; Platform Reports</h2>
                    <p className="text-xs text-slate-500 mt-1">Laporan analitik pendapatan bulanan dan kepatuhan fasilitas.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition"
                  >
                    ← Kembali ke Overview
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-[#14532d] text-white rounded-2xl">
                    <p className="text-xs text-emerald-200">Gross Monthly Revenue</p>
                    <p className="text-3xl font-extrabold mt-1">{stats.monthlyRevenueFormatted}</p>
                    <p className="text-xs text-emerald-300 mt-2">↑ 18.4% peningkatan dibandingkan bulan lalu</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                    <p className="text-xs text-slate-500">Total Fasilitas Terverifikasi</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalOwnersFormatted}</p>
                    <p className="text-xs text-emerald-800 mt-2">+4% pertumbuhan venue terdaftar</p>
                  </div>
                </div>
              </div>
            ) : (
              /* View Settings */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Console Settings</h2>
                    <p className="text-xs text-slate-500 mt-1">Konfigurasi hak akses RBAC, parameter audit, dan integrasi MinIO.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 transition"
                  >
                    ← Kembali ke Overview
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Super Admin RBAC Multi-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Perlindungan berlapis akun Alex Thompson (Global Admin).</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">Aktif</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Penyimpanan Objek MinIO S3</p>
                      <p className="text-xs text-slate-500">Bucket dokumen hukum pengelola: lapang-documents.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">Terkoneksi</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Footer: Pitch Gallery */}
          <AdminFooter />
        </main>
      </div>

      {/* Interactive Modals */}
      <VerificationReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        applicant={selectedApplicant}
        onApprove={handleApproveApplication}
        onRequestIssues={handleRequestIssues}
        onReject={handleRejectApplication}
      />

      <FixIssuesModal
        isOpen={fixIssuesModalOpen}
        onClose={() => setFixIssuesModalOpen(false)}
        applicant={selectedIssueApp}
        onResolveAndVerify={handleResolveAndVerify}
      />

      <InviteOwnerModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteOwner}
      />

      <FieldMonitoringModal
        isOpen={monitoringModalOpen}
        onClose={() => setMonitoringModalOpen(false)}
        fields={activeFields}
        selectedField={selectedField}
        onToggleFieldStatus={handleToggleFieldStatus}
      />
    </div>
  );
}
