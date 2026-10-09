'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { SpecificationFilterState } from '@/types';

interface SpecificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SpecificationFilterState;
  onFilterChange: (filters: SpecificationFilterState) => void;
  onApply: () => void;
}

export const SpecificationFilterModal: React.FC<SpecificationFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-brand-800" />
            <span>Filter Spesifikasi Lapangan</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tipe Ruangan */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Tipe Ruangan</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.courtTypes.indoor}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    courtTypes: { ...filters.courtTypes, indoor: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Indoor (AC)</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.courtTypes.outdoor}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    courtTypes: { ...filters.courtTypes, outdoor: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Outdoor</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.courtTypes.semiIndoor}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    courtTypes: { ...filters.courtTypes, semiIndoor: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Semi-Indoor</span>
            </label>
          </div>
        </div>

        {/* Jenis Permukaan / Lantai */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Jenis Permukaan Lantai</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.floorTypes.syntheticGrass}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    floorTypes: { ...filters.floorTypes, syntheticGrass: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Rumput Sintetis (FIFA)</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.floorTypes.vinyl}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    floorTypes: { ...filters.floorTypes, vinyl: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Vinyl Matras (BWF)</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.floorTypes.interlock}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    floorTypes: { ...filters.floorTypes, interlock: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Interlocking Flooring</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.floorTypes.parquet}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    floorTypes: { ...filters.floorTypes, parquet: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Parquet / Kayu Parket</span>
            </label>
          </div>
        </div>

        {/* Fasilitas Wajib */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Fasilitas Wajib</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.amenities.warmShower}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    amenities: { ...filters.amenities, warmShower: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Shower Air Hangat</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.amenities.musholla}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    amenities: { ...filters.amenities, musholla: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Musholla Bersih</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.amenities.carParking}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    amenities: { ...filters.amenities, carParking: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Parkir Mobil Luas</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                checked={filters.amenities.canteen}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    amenities: { ...filters.amenities, canteen: e.target.checked }
                  })
                }
                className="text-brand-800 rounded"
              />
              <span>Kantin &amp; Cafe</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold bg-brand-800 text-white rounded-lg hover:bg-brand-900 shadow cursor-pointer"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
};
