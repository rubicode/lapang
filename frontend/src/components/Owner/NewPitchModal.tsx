'use strict';
'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { createOwnerCourtApi } from '@/services/api';

interface NewPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewPitchModal: React.FC<NewPitchModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [matchFormat, setMatchFormat] = useState('5-a-side');
  const [surfaceSpec, setSurfaceSpec] = useState('Outdoor Pro');
  const [priceHourly, setPriceHourly] = useState('85');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama pitch / lapangan wajib diisi.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const ok = await createOwnerCourtApi({
        name: name.trim(),
        match_format: matchFormat,
        surface_spec: surfaceSpec,
        price_hourly: Number(priceHourly) || 85,
        court_type: surfaceSpec.toLowerCase().includes('indoor') ? 'indoor' : 'outdoor',
        main_image: imageUrl.trim()
      });

      if (ok) {
        setName('');
        onSuccess();
        onClose();
      } else {
        setError('Gagal menyimpan lapangan ke database.');
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
              Tambah Lapangan Baru
            </h3>
            <p className="text-xs text-slate-500">
              Daftarkan aset lapangan baru ke sistem Lapang.
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
              placeholder="Contoh: Arena X Pro Turf B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E] focus:ring-1 focus:ring-[#133E1E]"
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
                placeholder="85"
                value={priceHourly}
                onChange={(e) => setPriceHourly(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#133E1E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Awal
              </label>
              <div className="h-[38px] flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#1C5D23]">
                AKTIF
              </div>
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#123E24] hover:bg-[#0E321D] text-white shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan ke Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
