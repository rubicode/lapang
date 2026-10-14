'use strict';
'use client';

import React from 'react';
import { Download, Plus } from 'lucide-react';

interface OwnerHeaderProps {
  onExportReport: () => void;
  onOpenNewPitch: () => void;
  isExporting?: boolean;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  onExportReport,
  onOpenNewPitch,
  isExporting = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Ringkasan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Kelola aset lapangan olahraga dan reservasi aktif Anda.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onExportReport}
          disabled={isExporting}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-full shadow-2xs hover:shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>{isExporting ? 'Mengekspor...' : 'Ekspor Laporan'}</span>
        </button>

        <button
          onClick={onOpenNewPitch}
          className="px-4 py-2 bg-[#123E24] hover:bg-[#0E321D] text-white text-xs sm:text-sm font-bold rounded-full shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Lapangan Baru</span>
        </button>
      </div>
    </div>
  );
};
