'use strict';
'use client';

import React from 'react';

export const OwnerFooter: React.FC = () => {
  return (
    <footer className="mt-12 pt-6 pb-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
      <div>
        <p className="font-extrabold text-slate-700">Lapang</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          © {new Date().getFullYear()} Lapang. Hak cipta dilindungi.
        </p>
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
        <a href="#" className="hover:text-slate-800 transition">
          Kontak
        </a>
        <a href="#" className="hover:text-slate-800 transition">
          Tentang Kami
        </a>
      </div>
    </footer>
  );
};
