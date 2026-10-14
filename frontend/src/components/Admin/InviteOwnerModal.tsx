'use client';

import React, { useState } from 'react';
import { X, Mail, Building, User, MapPin, Trophy, Send, CheckCircle2 } from 'lucide-react';

interface InviteOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: {
    name: string;
    email: string;
    facilityName: string;
    sportType: string;
    location: string;
    courtsCount: number;
  }) => void;
}

export const InviteOwnerModal: React.FC<InviteOwnerModalProps> = ({
  isOpen,
  onClose,
  onInvite
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [sportType, setSportType] = useState('Futsal & Mini Soccer');
  const [location, setLocation] = useState('');
  const [courtsCount, setCourtsCount] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !facilityName) {
      alert('Nama, email, dan nama fasilitas wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onInvite({
        name,
        email,
        facilityName,
        sportType,
        location: location || 'Jakarta, ID',
        courtsCount
      });
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setFacilityName('');
      setLocation('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Undang Pengelola Fasilitas
              </h3>
              <p className="text-xs text-slate-500">
                Kirim tautan pendaftaran dan verifikasi langsung ke pengelola venue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Lengkap Pengelola *
            </label>
            <div className="relative flex items-center bg-[#f4f5f3] rounded-xl px-3.5 py-2.5">
              <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Marco Arantes"
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Alamat Email Pengelola *
            </label>
            <div className="relative flex items-center bg-[#f4f5f3] rounded-xl px-3.5 py-2.5">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: marco.a@fieldhub.pt"
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nama Fasilitas / Gelanggang *
            </label>
            <div className="relative flex items-center bg-[#f4f5f3] rounded-xl px-3.5 py-2.5">
              <Building className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="Contoh: Arena Lisbon Pro"
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kategori Olahraga
              </label>
              <select
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                className="w-full bg-[#f4f5f3] rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none"
              >
                <option value="Futsal & Mini Soccer">Futsal &amp; Mini Soccer</option>
                <option value="Badminton">Bulu Tangkis (Badminton)</option>
                <option value="Basketball">Bola Basket</option>
                <option value="Padel & Tennis">Padel &amp; Tenis</option>
                <option value="Volleyball">Bola Voli</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jumlah Lapangan
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={courtsCount}
                onChange={(e) => setCourtsCount(Number(e.target.value))}
                className="w-full bg-[#f4f5f3] rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Kota / Lokasi
            </label>
            <div className="relative flex items-center bg-[#f4f5f3] rounded-xl px-3.5 py-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jakarta, ID atau Lisbon, Portugal"
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0e3813] hover:bg-[#14471b] text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirim Undangan...' : 'Kirim Undangan Resmi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
