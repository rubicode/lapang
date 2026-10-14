'use client';

import React from 'react';
import { Plus, Download } from 'lucide-react';

interface PlatformOverviewHeaderProps {
  onDownloadCsv: () => void;
  onInviteOwner: () => void;
}

export const PlatformOverviewHeader: React.FC<PlatformOverviewHeaderProps> = ({
  onDownloadCsv,
  onInviteOwner
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ringkasan Platform
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Metrik performa dan manajemen langsung secara real-time.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDownloadCsv}
          className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 bg-[#e7ebe7] hover:bg-slate-200 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Unduh CSV</span>
        </button>

        <button
          onClick={onInviteOwner}
          className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#0e3813] hover:bg-[#14471b] active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Undang Pengelola</span>
        </button>
      </div>
    </div>
  );
};
