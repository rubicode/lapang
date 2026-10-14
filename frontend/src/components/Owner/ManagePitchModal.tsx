'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { OwnerFieldItem } from '@/types';
import { updateOwnerCourtApi } from '@/services/api';

interface ManagePitchModalProps {
  field: OwnerFieldItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManagePitchModal: React.FC<ManagePitchModalProps> = ({
  field,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [matchFormat, setMatchFormat] = useState('5-a-side');
  const [surfaceSpec, setSurfaceSpec] = useState('Outdoor Pro');
  const [priceHourly, setPriceHourly] = useState('85');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (field) {
      setName(field.name || '');
      setMatchFormat(field.matchFormat || '5-a-side');
      setSurfaceSpec(field.surfaceSpec || 'Outdoor Pro');
      setPriceHourly(String(field.priceHourly || 85));
      setIsActive(field.isActive !== false);
      setImageUrl(field.image || '');
      setError('');
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const ok = await updateOwnerCourtApi(field.id, {
        name: name.trim(),
        match_format: matchFormat,
        surface_spec: surfaceSpec,
        price_hourly: Number(priceHourly) || 85,
        is_active: isActive,
        main_image: imageUrl.trim()
      });

      if (ok) {
        onSuccess();
        onClose();
      } else {
        setError('Gagal memperbarui data lapangan di database.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Kelola Lapangan
            </h3>
            <p className="text-xs text-slate-500">
              Update tarif, status ketersediaan, dan detail {field.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lapangan
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Format Pertandingan
              </label>
              <select
                value={matchFormat}
                onChange={(e) => setMatchFormat(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E] bg-white cursor-pointer"
              >
                <option value="5-a-side">5-a-side</option>
                <option value="7-a-side">7-a-side</option>
                <option value="11-a-side">11-a-side</option>
                <option value="3x3">3x3</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Permukaan
              </label>
              <select
                value={surfaceSpec}
                onChange={(e) => setSurfaceSpec(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E] bg-white cursor-pointer"
              >
                <option value="Outdoor Pro">Outdoor Pro</option>
                <option value="Indoor">Indoor</option>
                <option value="Turf Pro">Turf Pro</option>
                <option value="Hybrid Grass">Hybrid Grass</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarif per Jam ($)
              </label>
              <input
                type="number"
                required
                min="1"
                value={priceHourly}
                onChange={(e) => setPriceHourly(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Lapangan
              </label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E] bg-white cursor-pointer"
              >
                <option value="true">AKTIF</option>
                <option value="false">PERAWATAN</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL Foto Lapangan
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#123E24] hover:bg-[#0E321D] text-white shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Menyimpan...' : 'Perbarui di Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
