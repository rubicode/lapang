'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchOwnerRevenueApi, downloadOwnerReportApi } from '@/services/api';
import { OwnerRevenueResponse } from '@/types';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  Download,
  Loader2,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface OwnerRevenueViewProps {
  onShowToast: (msg: string) => void;
}

export const OwnerRevenueView: React.FC<OwnerRevenueViewProps> = ({ onShowToast }) => {
  const [data, setData] = useState<OwnerRevenueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('month');
  const [isExporting, setIsExporting] = useState(false);

  const loadRevenue = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchOwnerRevenueApi(period);
      setData(res);
    } catch (err: any) {
      console.error('Error fetching owner revenue:', err);
      setError(err.message || 'Gagal memuat data pendapatan.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadRevenue();
  }, [loadRevenue]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadOwnerReportApi();
      onShowToast('Laporan finansial & pendapatan berhasil diunduh.');
    } catch (err: any) {
      alert(err.message || 'Gagal mengunduh laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#132A17] tracking-tight">
            Financial & Revenue
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ringkasan pendapatan kotor, penerimaan bersih, dan settlement pembayaran langsung dari PostgreSQL.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadRevenue}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#133E1E] bg-[#EEF2EA] hover:bg-[#E3EBE0] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#123E24] hover:bg-[#132A17] transition shadow-xs cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E5E9DF]">
          <Loader2 className="w-8 h-8 text-[#133E1E] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Menghitung analitik finansial dari database...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
          {error}
        </div>
      ) : data ? (
        <>
          {/* Main 5 Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Gross Revenue */}
            <div className="p-5 rounded-2xl bg-[#123E24] text-white shadow-xs relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[11px] font-bold text-[#DCF5D8] uppercase tracking-wider block">
                  Gross Revenue
                </span>
                <p className="text-2xl font-black text-white mt-1.5 font-mono">
                  {data.currencySymbol}{data.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 mt-2">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+12.5% vs bulan lalu</span>
                </div>
              </div>
            </div>

            {/* Net Earnings */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Net Earnings
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
                {data.currencySymbol}{data.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-2">
                Setelah potongan fee platform
              </p>
            </div>

            {/* Platform Fee 5% */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Platform Fee (5%)
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
                {data.currencySymbol}{data.platformFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Tier Premium Partner</span>
              </p>
            </div>

            {/* Pending Receivables */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pending Bookings
              </span>
              <p className="text-2xl font-black text-amber-800 mt-1.5 font-mono">
                {data.currencySymbol}{data.pendingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] font-semibold text-amber-600 mt-2">
                Menunggu konfirmasi bayar
              </p>
            </div>

            {/* Average Order Value (AOV) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Avg. Order Value
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono">
                {data.currencySymbol}{data.averageOrderValue.toFixed(2)}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-2">
                {data.totalSettlementCount} transaksi settled
              </p>
            </div>
          </div>

          {/* Revenue Breakdown by Court */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs">
            <h3 className="text-base font-black text-[#132A17] tracking-tight mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#133E1E]" />
              <span>Breakdown Pendapatan per Lapangan</span>
            </h3>

            <div className="space-y-4">
              {data.courtBreakdown.map((court) => (
                <div key={court.courtId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{court.courtName}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {court.matchFormat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-semibold">{court.totalBookings} booking</span>
                      <span className="font-mono font-black text-slate-900">
                        {data.currencySymbol}{court.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({court.percentage}%)
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#123E24] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(court.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Settlement Transactions Table */}
          <div className="bg-white border border-[#E5E9DF] rounded-2xl shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-[#E5E9DF] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#132A17] tracking-tight">
                  Riwayat Pembayaran Terbaru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  15 transaksi pembayaran lunas (settlement) terakhir.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8F9F5] border-b border-[#E5E9DF] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Invoice / Code</th>
                    <th className="py-3.5 px-4">Nama Pelanggan</th>
                    <th className="py-3.5 px-4">Lapangan</th>
                    <th className="py-3.5 px-4">Jadwal Main</th>
                    <th className="py-3.5 px-4">Metode</th>
                    <th className="py-3.5 px-4">Nominal</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E9DF]">
                  {data.recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {tx.invoiceCode}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {tx.customerName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {tx.courtName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span>{tx.date}</span> <span className="text-slate-400 text-[10px]">({tx.timeSlot})</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#123E24]">
                        {data.currencySymbol}{tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#DCF5D8] text-[#133E1E] border border-[#BCE8B6]">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
