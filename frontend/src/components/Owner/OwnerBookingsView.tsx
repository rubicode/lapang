'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchOwnerBookingsApi,
  updateOwnerBookingStatusApi
} from '@/services/api';
import { OwnerBookingsResponse, OwnerBookingItem } from '@/types';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  Loader2,
  RefreshCw,
  Phone,
  Check,
  X
} from 'lucide-react';

interface OwnerBookingsViewProps {
  onShowToast: (msg: string) => void;
}

export const OwnerBookingsView: React.FC<OwnerBookingsViewProps> = ({ onShowToast }) => {
  const [data, setData] = useState<OwnerBookingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courtFilter, setCourtFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchOwnerBookingsApi({
        search,
        status: statusFilter,
        courtId: courtFilter,
        page,
        limit: 15
      });
      setData(res);
    } catch (err: any) {
      console.error('Error fetching owner bookings:', err);
      setError(err.message || 'Gagal memuat daftar pesanan.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, courtFilter, page]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await updateOwnerBookingStatusApi(bookingId, newStatus);
      onShowToast(`Status pesanan berhasil diubah menjadi ${newStatus}.`);
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#DCF5D8] text-[#133E1E] border border-[#BCE8B6]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#133E1E]" />
          Confirmed
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
        <Check className="w-3.5 h-3.5 text-blue-500" />
        Completed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#132A17] tracking-tight">
            Reservations & Bookings
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Daftar lengkap pemesanan lapangan langsung dari basis data PostgreSQL.
          </p>
        </div>
        <button
          onClick={loadBookings}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#133E1E] bg-[#EEF2EA] hover:bg-[#E3EBE0] transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Reservasi</p>
            <p className="text-2xl font-black text-[#132A17] mt-1">{data.summary.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{data.summary.confirmed}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-800 mt-1">{data.summary.pending}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Cancelled</p>
            <p className="text-2xl font-black text-rose-800 mt-1">{data.summary.cancelled}</p>
          </div>
          <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-[#123E24] text-white shadow-xs">
            <p className="text-[11px] font-bold text-[#DCF5D8] uppercase tracking-wider">Pendapatan Settled</p>
            <p className="text-2xl font-black text-white mt-1">
              {data.currencySymbol}{data.summary.totalRevenue.toLocaleString('en-US')}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode booking, nama pemesan, atau nomor telepon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133E1E] transition"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Filter Status */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Filter Court */}
          {data?.courts && data.courts.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <select
                value={courtFilter}
                onChange={(e) => {
                  setCourtFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Lapangan</option>
                {data.courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-[#E5E9DF] rounded-2xl shadow-2xs overflow-hidden">
        {isLoading && !data ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#133E1E] animate-spin mb-2" />
            <p className="text-xs font-bold text-slate-500">Memuat data pesanan...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-600 font-bold">{error}</div>
        ) : data && data.bookings.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-extrabold text-slate-800">Tidak ada pemesanan ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9F5] border-b border-[#E5E9DF] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Booking Code</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Lapangan</th>
                  <th className="py-3.5 px-4">Jadwal & Waktu</th>
                  <th className="py-3.5 px-4">Jumlah</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9DF]">
                {data?.bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      {b.bookingCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E3EBE0] text-[#133E1E] font-black text-[11px] flex items-center justify-center shrink-0">
                          {b.initials}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 leading-tight">{b.customerName}</p>
                          {b.customerPhone && (
                            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              {b.customerPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {b.courtName}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{b.date}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{b.timeSlot}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      {b.currencySymbol}{b.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(b.bookingStatusRaw)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {updatingId === b.id ? (
                        <Loader2 className="w-4 h-4 text-[#133E1E] animate-spin inline-block" />
                      ) : (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {b.bookingStatusRaw === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                              title="Konfirmasi Pesanan"
                              className="px-2.5 py-1 rounded-lg bg-[#DCF5D8] hover:bg-[#c9eec3] text-[#133E1E] font-bold text-[11px] transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {b.bookingStatusRaw === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, 'completed')}
                              title="Tandai Selesai"
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {b.bookingStatusRaw !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin membatalkan booking ${b.bookingCode}?`)) {
                                  handleUpdateStatus(b.id, 'cancelled');
                                }
                              }}
                              title="Batalkan Booking"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#E5E9DF] flex items-center justify-between text-xs text-slate-500 font-semibold bg-[#F8F9F5]">
            <span>
              Menampilkan halaman {data.pagination.page} dari {data.pagination.totalPages} ({data.pagination.total} total pemesanan)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 hover:bg-slate-100 transition cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
