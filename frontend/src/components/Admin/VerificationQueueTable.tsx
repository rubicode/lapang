'use client';

import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { VerificationApplicant, AdminApplicationStatus } from '@/types';

interface VerificationQueueTableProps {
  applications: VerificationApplicant[];
  onReviewApplication: (app: VerificationApplicant) => void;
  onFixIssues: (app: VerificationApplicant) => void;
  onViewApplicantDetails?: (app: VerificationApplicant) => void;
}

export const VerificationQueueTable: React.FC<VerificationQueueTableProps> = ({
  applications,
  onReviewApplication,
  onFixIssues,
  onViewApplicantDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminApplicationStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.facilityName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ? true : app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Pagination calculation
  const totalItems = filteredApps.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(start, start + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);

  const getStatusBadge = (status: AdminApplicationStatus) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e]">
            Menunggu Peninjauan
          </span>
        );
      case 'Verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#166534]">
            Terverifikasi
          </span>
        );
      case 'Action Required':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fee2e2] text-[#991b1b]">
            Perlu Tindakan
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs mb-8 overflow-hidden">
      {/* Table Header Section */}
      <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Antrean Verifikasi
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tinjau dan verifikasi pemilik fasilitas baru
          </p>
        </div>

        {/* Search Bar matching the screenshot pill input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama fasilitas atau email..."
              className="w-full pl-11 pr-4 py-2 bg-[#f4f5f3] hover:bg-[#eceee9] focus:bg-white text-xs sm:text-sm rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all border border-transparent focus:border-gray-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                DETAIL PENGGUNA
              </th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NAMA FASILITAS
              </th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                TANGGAL PENGAJUAN
              </th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                STATUS
              </th>
              <th className="py-3 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                AKSI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {paginatedApps.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-medium">
                  Tidak ada pemilik fasilitas yang cocok dengan pencarian &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              paginatedApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* User Details */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {app.user.avatarUrl ? (
                        <img
                          referrerPolicy="no-referrer"
                          src={app.user.avatarUrl}
                          alt={app.user.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            app.user.initialsBg || 'bg-[#dcfce7]'
                          } ${app.user.initialsColor || 'text-[#166534]'}`}
                        >
                          {app.user.initials || app.user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 leading-tight">
                          {app.user.name}
                        </p>
                        <p className="text-xs text-slate-500 font-normal mt-0.5 truncate">
                          {app.user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Facility Name */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900">
                      {app.facilityName}
                    </span>
                  </td>

                  {/* Submitted Date */}
                  <td className="py-4 px-6 text-slate-600 text-xs sm:text-sm">
                    {app.submittedDate}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {getStatusBadge(app.status)}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-6 text-right relative">
                    {app.status === 'Pending Review' ? (
                      <button
                        onClick={() => onReviewApplication(app)}
                        className="font-bold text-slate-900 hover:text-emerald-800 hover:underline transition-colors cursor-pointer text-sm"
                      >
                        Tinjau
                      </button>
                    ) : app.status === 'Action Required' ? (
                      <button
                        onClick={() => onFixIssues(app)}
                        className="font-bold text-[#b91c1c] hover:text-red-800 hover:underline transition-colors cursor-pointer text-sm"
                      >
                        Perbaiki Masalah
                      </button>
                    ) : (
                      <div className="inline-block relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === app.id ? null : app.id)
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === app.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 text-left"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (onViewApplicantDetails) onViewApplicantDetails(app);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
                            >
                              Lihat Detail Venue
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                alert(`Mengirim pesan ke ${app.user.email}`);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium text-left"
                            >
                              Hubungi Pengelola
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onFixIssues(app);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-semibold text-left"
                            >
                              Tinjau Ulang Kepatuhan
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      <div className="p-4 sm:p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <p className="text-xs text-slate-500 font-medium">
          Menampilkan 1 hingga {paginatedApps.length} dari {applications.length >= 28 ? 28 : applications.length} pengajuan antrean
        </p>

        {/* Pagination buttons: < 1 2 3 > */}
        <div className="flex items-center gap-1.5 select-none">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-[#0e3813] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            disabled={currentPage === 3}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
