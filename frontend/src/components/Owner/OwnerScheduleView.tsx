'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchOwnerSchedulesApi,
  toggleOwnerScheduleBlockApi
} from '@/services/api';
import { OwnerScheduleResponse, OwnerScheduleSlot } from '@/types';
import {
  Clock,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  User,
  ShieldAlert
} from 'lucide-react';

interface OwnerScheduleViewProps {
  onShowToast: (msg: string) => void;
}

export const OwnerScheduleView: React.FC<OwnerScheduleViewProps> = ({ onShowToast }) => {
  const [data, setData] = useState<OwnerScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected state
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [processingSlot, setProcessingSlot] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchOwnerSchedulesApi(selectedCourtId || undefined, selectedDate);
      setData(res);
      if (!selectedCourtId && res.selectedCourt) {
        setSelectedCourtId(res.selectedCourt.id);
      }
    } catch (err: any) {
      console.error('Error fetching schedules:', err);
      setError(err.message || 'Gagal memuat jadwal court.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourtId, selectedDate]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleToggleBlock = async (slot: OwnerScheduleSlot) => {
    if (!data?.selectedCourt) return;
    const targetStatus = slot.isBlocked ? 'available' : 'blocked';
    setProcessingSlot(slot.timeSlot);

    try {
      await toggleOwnerScheduleBlockApi({
        courtId: data.selectedCourt.id,
        date: selectedDate,
        timeSlot: slot.timeSlot,
        status: targetStatus
      });
      onShowToast(
        targetStatus === 'blocked'
          ? `Slot ${slot.timeSlot} berhasil diblokir di database PostgreSQL.`
          : `Slot ${slot.timeSlot} berhasil dibuka kembali untuk reservasi.`
      );
      await loadSchedules();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status blokir slot.');
    } finally {
      setProcessingSlot(null);
    }
  };

  const setDateOffset = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#132A17] tracking-tight">
            Jadwal & Slot Waktu
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manajemen ketersediaan slot waktu operasional langsung ke tabel court_schedules PostgreSQL.
          </p>
        </div>
        <button
          onClick={loadSchedules}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#133E1E] bg-[#EEF2EA] hover:bg-[#E3EBE0] transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Segarkan Jadwal</span>
        </button>
      </div>

      {/* Court Selection Tabs */}
      {data?.courts && data.courts.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {data.courts.map((court) => {
            const isSelected = court.id === (data.selectedCourt?.id || selectedCourtId);
            return (
              <button
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-extrabold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#123E24] text-white border-[#123E24] shadow-sm'
                    : 'bg-white text-slate-700 border-[#E5E9DF] hover:border-slate-300'
                }`}
              >
                <span>{court.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-[#DCF5D8]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {court.matchFormat}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Date Filter & Legend Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Date Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => setDateOffset(0)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-[#DCF5D8] text-[#133E1E] border border-[#BCE8B6]'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDateOffset(1)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Besok
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#123E24]"></span>
            <span>Terisi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Ditutup</span>
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      {isLoading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E5E9DF]">
          <Loader2 className="w-8 h-8 text-[#133E1E] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Mengambil slot jadwal dari database...</p>
        </div>
      ) : error ? (
        <div className="py-12 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
          {error}
        </div>
      ) : data?.slots ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {data.slots.map((slot) => {
            const isBooked = slot.status === 'booked';
            const isBlocked = slot.isBlocked;
            const isAvailable = !isBooked && !isBlocked;

            return (
              <div
                key={slot.timeSlot}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  isBooked
                    ? 'bg-[#123E24] text-white border-[#123E24] shadow-xs'
                    : isBlocked
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-white border-[#E5E9DF] hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-base font-mono font-black ${
                        isBooked ? 'text-white' : isBlocked ? 'text-rose-900' : 'text-slate-900'
                      }`}
                    >
                      {slot.timeSlot}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isBooked
                          ? 'bg-[#DCF5D8] text-[#133E1E]'
                          : isBlocked
                          ? 'bg-rose-200 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {slot.status === 'booked' ? 'TERISI' : slot.status === 'blocked' ? 'DITUTUP' : 'TERSEDIA'}
                    </span>
                  </div>

                  {isBooked ? (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                        <User className="w-3.5 h-3.5 text-[#DCF5D8]" />
                        <span className="truncate">{slot.bookerName || 'Pelanggan Terdaftar'}</span>
                      </div>
                      <p className="text-[10px] font-mono text-white/70">
                        Kode: {slot.bookingCode || 'PITCH-RESERV'}
                      </p>
                    </div>
                  ) : isBlocked ? (
                    <div className="mt-2 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Slot Dinonaktifkan</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs font-bold text-slate-500">
                      Tarif: <span className="font-mono text-slate-800">{slot.currencySymbol}{slot.price}/jam</span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-slate-100/20">
                  {isBooked ? (
                    <span className="text-[11px] font-semibold text-white/60 italic block text-center">
                      Reservasi Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleBlock(slot)}
                      disabled={processingSlot === slot.timeSlot}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isBlocked
                          ? 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-100/50'
                          : 'bg-[#F8F9F5] border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {processingSlot === slot.timeSlot ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isBlocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-rose-600" />
                          <span>Buka Slot</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Blokir Slot</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
