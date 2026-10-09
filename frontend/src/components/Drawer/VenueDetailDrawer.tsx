'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  X,
  BadgeCheck,
  Info,
  CheckCircle,
  Clock,
  MessageSquare,
  ArrowRight,
  Check
} from 'lucide-react';
import { Venue, ReviewItem } from '@/types';
import { SAMPLE_REVIEWS } from '@/data/mockVenues';

interface VenueDetailDrawerProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (venue: Venue, selectedSlot: string, dateTab: string) => void;
}

export const VenueDetailDrawer: React.FC<VenueDetailDrawerProps> = ({
  venue,
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [dateTab, setDateTab] = useState<'today' | 'tomorrow'>('today');
  const [reviews, setReviews] = useState<ReviewItem[]>(SAMPLE_REVIEWS);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  if (!venue) return null;

  const slots = venue.slots && Array.isArray(venue.slots) ? venue.slots : ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00"];
  const bookedSlots = venue.bookedSlots && Array.isArray(venue.bookedSlots) ? venue.bookedSlots : ["08:00", "15:00", "19:00"];
  const gallery = venue.gallery && Array.isArray(venue.gallery) ? venue.gallery : [venue.mainImage];
  const amenities = venue.amenities && Array.isArray(venue.amenities) ? venue.amenities : ["Parkir Luas Mobil/Motor", "Shower Air Hangat", "Kantin & Coffee Shop", "Musholla AC"];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan lapangan disalin ke clipboard!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    alert(isBookmarked ? 'Dihapus dari favorit.' : 'Ditambahkan ke favorit!');
  };

  const handleAddReview = () => {
    const text = prompt('Tulis ulasan Anda untuk lapangan ini:');
    if (text && text.trim()) {
      const newReview: ReviewItem = {
        user: 'Rian Pratama',
        role: 'Verified Booker',
        rating: 5,
        date: 'Baru saja',
        comment: text.trim(),
        ownerReply: null
      };
      setReviews([newReview, ...reviews]);
    }
  };

  const handleCheckoutClick = () => {
    if (!selectedSlot) {
      alert('Silakan pilih jam main (slot waktu) terlebih dahulu!');
      return;
    }
    onProceedToCheckout(venue, selectedSlot, dateTab);
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-slate-500 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 line-clamp-1">{venue.name}</h2>
              <p className="text-xs text-slate-500">
                {venue.city}, {venue.province}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:bg-gray-100 rounded-full cursor-pointer"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 text-slate-600 hover:bg-gray-100 rounded-full cursor-pointer"
              title="Simpan"
            >
              <Heart
                className={`w-4 h-4 ${
                  isBookmarked ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* 1. Galeri Foto Multi-Bucket (Asset MinIO S3) */}
          <div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-60">
              <div className="col-span-2 relative group overflow-hidden cursor-pointer">
                <img
                  src={venue.mainImage}
                  alt="Foto Utama"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-brand-400" />
                  Verified MinIO S3 Storage
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-1/2 overflow-hidden rounded-r-lg group cursor-pointer">
                  <img
                    src={gallery[1] || venue.mainImage}
                    alt="Detail 1"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="h-1/2 relative overflow-hidden rounded-r-lg group cursor-pointer">
                  <img
                    src={gallery[2] || venue.mainImage}
                    alt="Detail 2"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-xs font-bold">
                    +4 Foto Lain
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Badges Ringkasan & Rating */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-brand-50/60 rounded-2xl border border-brand-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-brand-900">{venue.rating}</span>
                <div>
                  <div className="flex text-amber-500 text-xs">★★★★★</div>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    {venue.reviewsCount} ulasan terverifikasi
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white rounded-lg font-bold text-brand-800 shadow-xs border border-brand-200">
                ⚡ Konfirmasi Instan
              </span>
              <span className="px-2.5 py-1 bg-white rounded-lg font-bold text-slate-700 shadow-xs border border-gray-200">
                🛡️ Bebas Reschedule
              </span>
            </div>
          </div>

          {/* 3. Deskripsi & Detail Operasional */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-800" />
              <span>Tentang Venue &amp; Lapangan</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{venue.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Jam Operasional</span>
                <span className="font-bold text-slate-800">{venue.hours}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Jenis Lantai</span>
                <span className="font-bold text-slate-800">{venue.floorType}</span>
              </div>
            </div>
          </div>

          {/* 4. Daftar Fasilitas Lengkap */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-brand-800" />
              <span>Fasilitas Penunjang</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-slate-700">
                  <Check className="w-3.5 h-3.5 text-brand-800" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Interactive Time Slot Selector */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-800" />
                  <span>Pilih Slot Waktu Main</span>
                </h3>
                <p className="text-[11px] text-slate-500">Pilih tanggal dan klik jam untuk booking</p>
              </div>
              {/* Date Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setDateTab('today')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    dateTab === 'today'
                      ? 'bg-white text-brand-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setDateTab('tomorrow')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    dateTab === 'tomorrow'
                      ? 'bg-white text-brand-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Besok
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] mb-3 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-300"></span> Tersedia
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-800"></span> Dipilih
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-gray-200"></span> Penuh / Terisi
              </div>
            </div>

            {/* Grid Jam */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
              {slots.map((slot) => {
                const isBooked = dateTab === 'today' && bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;

                if (isBooked) {
                  return (
                    <button
                      key={slot}
                      disabled
                      className="py-2.5 px-2 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed text-center border border-gray-200 line-through"
                    >
                      {slot}
                    </button>
                  );
                }

                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 px-2 rounded-xl font-bold transition text-center border cursor-pointer ${
                      isSelected
                        ? 'bg-brand-800 text-white shadow-md border-brand-800'
                        : 'bg-brand-100/70 hover:bg-brand-200 text-brand-900 border-brand-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Ulasan Pemain Terverifikasi */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-brand-800" />
                <span>Ulasan Pemain Terverifikasi</span>
              </h3>
              <button
                onClick={handleAddReview}
                className="text-xs font-bold text-brand-800 hover:underline cursor-pointer"
              >
                + Tulis Ulasan
              </button>
            </div>

            {/* Rating Breakdown Progress Bars */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Kualitas Lantai</span>
                  <span className="font-bold text-slate-800">4.9 / 5</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Penerangan Lampu</span>
                  <span className="font-bold text-slate-800">4.8 / 5</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Kebersihan &amp; Toilet</span>
                  <span className="font-bold text-slate-800">4.7 / 5</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Pelayanan Staf</span>
                  <span className="font-bold text-slate-800">4.9 / 5</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>

            {/* Sample Reviews */}
            <div className="space-y-3">
              {reviews.map((r, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center text-[11px]">
                        {r.user.charAt(0)}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{r.user}</p>
                        <span className="text-[10px] text-brand-700 font-semibold flex items-center gap-0.5">
                          <BadgeCheck className="w-3 h-3 text-brand-600" /> {r.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-500 font-bold">★ {r.rating}.0</span>
                      <p className="text-[10px] text-slate-400">{r.date}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  {r.ownerReply && (
                    <div className="mt-2 pl-3 border-l-2 border-brand-500 bg-white p-2 rounded-r-lg text-[11px] text-slate-600">
                      <span className="font-bold text-brand-800 block mb-0.5">Tanggapan Pengelola:</span>
                      {r.ownerReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between shrink-0 shadow-lg">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Biaya Sewa</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-brand-800">{venue.priceFormatted}</span>
              <span className="text-xs text-slate-500 font-semibold">
                {selectedSlot ? `• Jam ${selectedSlot} WIB` : '/ 1 jam'}
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckoutClick}
            className="px-6 py-3 bg-brand-800 hover:bg-brand-900 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-brand-800/20 transition flex items-center gap-2 cursor-pointer"
          >
            <span>Pesan Sekarang (QRIS/VA)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
