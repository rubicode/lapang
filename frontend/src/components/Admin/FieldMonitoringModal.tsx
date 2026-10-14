'use client';

import React, { useState } from 'react';
import { X, Activity, Wrench, ShieldCheck, Video, Sun, Droplets, Thermometer, Clock, Users } from 'lucide-react';
import { ActiveFieldMonitoringItem } from '@/types';

interface FieldMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: ActiveFieldMonitoringItem[];
  selectedField: ActiveFieldMonitoringItem | null;
  onToggleFieldStatus: (fieldId: string) => void;
}

export const FieldMonitoringModal: React.FC<FieldMonitoringModalProps> = ({
  isOpen,
  onClose,
  fields,
  selectedField: initialField,
  onToggleFieldStatus
}) => {
  const [activeFieldId, setActiveFieldId] = useState<string>(
    initialField?.id || fields[0]?.id || ''
  );

  if (!isOpen) return null;

  const currentField = fields.find((f) => f.id === activeFieldId) || fields[0];
  if (!currentField) return null;

  const isLive = currentField.status === 'LIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  Pusat Pemantauan Lapangan Langsung
                </h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sinkronisasi Telemetri Langsung
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pusat pemantauan sensor IoT &amp; okupansi lapangan real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector for fields */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          {fields.map((field) => (
            <button
              key={field.id}
              onClick={() => setActiveFieldId(field.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFieldId === field.id
                  ? 'bg-[#0e3813] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-gray-200 hover:bg-slate-100'
              }`}
            >
              {field.name}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Visual & Status Overview */}
          <div className="relative rounded-2xl overflow-hidden h-52 bg-slate-900 border border-gray-100">
            <img
              referrerPolicy="no-referrer"
              src={currentField.image}
              alt={currentField.name}
              className="w-full h-full object-cover opacity-85"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Status badge in visual */}
            <div className="absolute top-4 left-4">
              {isLive ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#0e3813] text-white shadow-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>SIARAN LANGSUNG • {currentField.occupancyFormatted || '60% Terisi'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-900/90 text-amber-200 shadow-md">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>MODE PERAWATAN • NONAKTIF</span>
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h4 className="text-xl font-extrabold">{currentField.name}</h4>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span>{currentField.location}</span>
                <span>•</span>
                <span>{isLive ? currentField.currentMatch || 'Pertandingan Aktif' : currentField.maintenanceTask || 'Perawatan Lapangan'}</span>
              </p>
            </div>
          </div>

          {/* Telemetry Sensor Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Pencahayaan</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {currentField.lighting || '1000 Lux LED'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Thermometer className="w-3.5 h-3.5 text-red-500" />
                <span>Suhu Lapangan</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {currentField.temperature || '22°C'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Kelembaban Rumput</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {currentField.pitchHealth || 'Optimal (24%)'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sisa Durasi Slot</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {currentField.timeRemaining || (isLive ? '34 menit' : 'Est. 14:00 WIB')}
              </p>
            </div>
          </div>

          {/* Additional details */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isLive ? `Pemain di Lapangan: ${currentField.activePlayersCount || 8} Orang Aktif` : 'Staf Pemeliharaan Lapangan Sedang Bekerja'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isLive ? 'Sensor AI mengidentifikasi pemain tanpa pelanggaran overkapasitas.' : currentField.subText || 'Sedang dilakukan pembersihan dan penyisiran rumput sintetis.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onToggleFieldStatus(currentField.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                isLive
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  : 'bg-emerald-800 text-white hover:bg-emerald-900'
              }`}
            >
              {isLive ? 'Ubah ke Perawatan' : 'Aktifkan Lapangan'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Node ID: PITCH-IOT-092 • Ping Terakhir: 3 detik lalu
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
