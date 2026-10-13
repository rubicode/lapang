'use strict';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchOwnerSettingsApi,
  updateOwnerSettingsApi
} from '@/services/api';
import { OwnerSettingsResponse } from '@/types';
import {
  Building2,
  User,
  Tag,
  Clock,
  Phone,
  MapPin,
  Save,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface OwnerSettingsViewProps {
  onShowToast: (msg: string) => void;
  onSettingsUpdated?: () => void;
}

export const OwnerSettingsView: React.FC<OwnerSettingsViewProps> = ({
  onShowToast,
  onSettingsUpdated
}) => {
  const [data, setData] = useState<OwnerSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [venueName, setVenueName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [earlyBirdPromoActive, setEarlyBirdPromoActive] = useState(false);
  const [earlyBirdDiscountPercent, setEarlyBirdDiscountPercent] = useState(20);

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchOwnerSettingsApi();
      setData(res);
      // Initialize form fields
      setVenueName(res.venue.name);
      setDistrict(res.venue.district);
      setAddress(res.venue.address);
      setPhoneNumber(res.venue.phoneNumber);
      setOpeningHours(res.venue.openingHours);
      setCurrency(res.venue.currency);
      setDescription(res.venue.description);
      setEarlyBirdPromoActive(res.venue.earlyBirdPromoActive);
      setEarlyBirdDiscountPercent(res.venue.earlyBirdDiscountPercent);

      setOwnerName(res.owner.name);
      setOwnerPhone(res.owner.phone);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Gagal memuat pengaturan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateOwnerSettingsApi({
        venueName,
        district,
        address,
        phoneNumber,
        openingHours,
        currency,
        description,
        earlyBirdPromoActive,
        earlyBirdDiscountPercent,
        ownerName,
        ownerPhone
      });
      setData(updated);
      onShowToast('Pengaturan venue & akun berhasil disimpan ke database PostgreSQL!');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#132A17] tracking-tight">
            Venue & Account Settings
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola profil fasilitas lapangan, promo Early Bird, dan kontak pengelola Pitch Gallery.
          </p>
        </div>
        <button
          onClick={loadSettings}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#133E1E] bg-[#EEF2EA] hover:bg-[#E3EBE0] transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {isLoading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E5E9DF]">
          <Loader2 className="w-8 h-8 text-[#133E1E] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Memuat data pengaturan dari database...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
          {error}
        </div>
      ) : data ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Informasi Venue */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#E5E9DF] pb-4">
              <Building2 className="w-5 h-5 text-[#133E1E]" />
              <div>
                <h3 className="text-base font-black text-[#132A17]">Profil Fasilitas (Venue)</h3>
                <p className="text-xs text-slate-500">Informasi utama kompleks olahraga yang dilihat oleh pelanggan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Venue
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Distrik / Wilayah
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jam Operasional
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="06:00 - 24:00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Telepon Venue
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mata Uang (Currency)
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50 cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="IDR">IDR (Rp)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Deskripsi / Fasilitas Venue
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Pengaturan Early Bird Promo */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#E5E9DF] pb-4">
              <Tag className="w-5 h-5 text-[#133E1E]" />
              <div>
                <h3 className="text-base font-black text-[#132A17]">Promosi & Early Bird</h3>
                <p className="text-xs text-slate-500">Insentif otomatis untuk mengisi jam sepi pagi hari (07:00 - 12:00).</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-xs font-black text-slate-900">Aktifkan Early Bird Promo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Diskon otomatis diberikan pada reservasi slot pagi.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={earlyBirdPromoActive}
                  onChange={(e) => setEarlyBirdPromoActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#133E1E]"></div>
              </label>
            </div>

            <div className="max-w-xs">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Persentase Diskon (%)
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={earlyBirdDiscountPercent}
                onChange={(e) => setEarlyBirdDiscountPercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
              />
            </div>
          </div>

          {/* Card 3: Profil Pengelola (Owner) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E9DF] shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#E5E9DF] pb-4">
              <User className="w-5 h-5 text-[#133E1E]" />
              <div>
                <h3 className="text-base font-black text-[#132A17]">Profil Pemilik (Owner)</h3>
                <p className="text-xs text-slate-500">Informasi identitas akun pemilik fasilitas lapangan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Pemilik
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor HP Pemilik
                </label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#133E1E] bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email (Akun Login)
                </label>
                <input
                  type="email"
                  disabled
                  value={data.owner.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 font-semibold bg-slate-100 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Email digunakan untuk login autentikasi sistem.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#123E24] hover:bg-[#132A17] text-white text-xs font-black shadow-sm transition cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Simpan Perubahan ke Database</span>
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};
