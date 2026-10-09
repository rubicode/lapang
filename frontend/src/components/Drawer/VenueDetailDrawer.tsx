'use client';

import React, { useState, useEffect } from 'react';
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
  Check,
  Star
} from 'lucide-react';
import { Venue, ReviewItem, ReviewAspects } from '@/types';
import { fetchVenueReviews, submitReviewApi, fetchVenueSchedules } from '@/services/api';

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
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [aspects, setAspects] = useState<ReviewAspects>({
    floor: 4.9,
    lighting: 4.8,
    cleanliness: 4.7,
    hospitality: 4.9
  });
  const [slots, setSlots] = useState<string[]>(["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]);
  const [bookedSlots, setBookedSlots] = useState<string[]>(["08:00", "15:00", "19:00"]);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Ambil review & slot nyata saat venue dibuka
  useEffect(() => {
    if (!venue || !isOpen) return;

    const venueKey = venue.slug || venue.id;

    // 1. Ambil ulasan dari API
    fetchVenueReviews(venueKey).then((data) => {
      setReviews(data.reviews);
      if (data.aspects) setAspects(data.aspects);
    });

    // 2. Ambil jadwal slot dari API
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const targetDate = dateTab === 'today' ? today : tomorrowStr;
    fetchVenueSchedules(venueKey, targetDate).then((sch) => {
      if (sch.slots.length > 0) setSlots(sch.slots);
      setBookedSlots(sch.bookedSlots);
    });
  }, [venue, isOpen, dateTab]);

  if (!venue) return null;

  const gallery = venue.gallery && Array.isArray(venue.gallery) && venue.gallery.length > 0
    ? venue.gallery
    : [venue.mainImage];

  const amenities = venue.amenities && Array.isArray(venue.amenities) && venue.amenities.length > 0
    ? venue.amenities
    : ["Parkir Luas Mobil/Motor", "Shower Air Hangat", "Kantin & Coffee Shop", "Musholla AC"];

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      alert('Silakan tulis ulasan komentar Anda terlebih dahulu.');
      return;
    }

    setIsSubmittingReview(true);
    const success = await submitReviewApi(venue.slug || venue.id, {
      user_name: 'Pemain Terverifikasi',
      rating_overall: newReviewRating,
      rating_floor: 5,
      rating_lighting: 5,
      rating_cleanliness: 5,
      rating_hospitality: 5,
      comment: newReviewComment.trim()
    });

    setIsSubmittingReview(false);
    if (success) {
      alert('Ulasan Anda berhasil dikirim ke database!');
      setNewReviewComment('');
      setIsReviewModalOpen(false);
      // Refresh ulasan
      const data = await fetchVenueReviews(venue.slug || venue.id);
      setReviews(data.reviews);
      if (data.aspects) setAspects(data.aspects);
    } else {
      alert('Gagal mengirim ulasan. Silakan coba lagi.');
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
    <>
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
                    isBookmarked ? 'fill-red-500 text-red-500' : 'text-slate-600'
                  }`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {/* 1. Galeri MinIO S3 Multi-Grid */}
            <div>
              <div className="grid grid-cols-3 gap-2 h-56 rounded-2xl overflow-hidden shadow-xs">
                <div className="col-span-2 relative group overflow-hidden bg-slate-100">
                  <img
                    src={gallery[0]}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-brand-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5 text-brand-300" />
                    <span>Verified MinIO S3 Storage</span>
                  </div>
                </div>
                <div className="col-span-1 grid grid-rows-2 gap-2">
                  <div className="relative group overflow-hidden bg-slate-100">
                    <img
                      src={gallery[1] || gallery[0]}
                      alt={`${venue.name} detail`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="relative group overflow-hidden bg-slate-100">
                    <img
                      src={gallery[2] || gallery[0]}
                      alt={`${venue.name} suasan`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs hover:bg-black/50 transition">
                      +{gallery.length} Foto
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Rating & Badges */}
            <div className="flex items-center justify-between bg-brand-50/60 p-3.5 rounded-xl border border-brand-100">
              <div className="flex items-center gap-3">
                <div className="bg-brand-800 text-white font-extrabold text-base px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  <span>★</span>
                  <span>{venue.rating.toFixed(1)}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Sangat Direkomendasikan</p>
                  <p className="text-[11px] text-slate-500">{venue.reviewsCount} ulasan pemain terverifikasi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-white text-brand-800 border border-brand-200 rounded-md">
                  ⚡ Konfirmasi Instan
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-white text-slate-700 border border-gray-200 rounded-md">
                  🛡️ Bebas Reschedule
                </span>
              </div>
            </div>

            {/* 3. Deskripsi & Info Spesifikasi */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-800" />
                <span>Tentang Venue &amp; Lapangan</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{venue.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-slate-400 text-[11px] block">Jam Operasional</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-brand-700" /> {venue.hours}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-slate-400 text-[11px] block">Jenis Lantai</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate" title={venue.floorType}>
                    {venue.floorType}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Fasilitas Penunjang */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-800" />
                <span>Fasilitas Penunjang</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-slate-700 border border-gray-100"
                  >
                    <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Pemilih Slot Waktu Interaktif */}
            <div className="space-y-3 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Pilih Jadwal &amp; Jam Main</h3>
                  <p className="text-[11px] text-slate-500">Durasi sewa 60 menit per slot jam</p>
                </div>

                {/* Tab Hari Ini vs Besok */}
                <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-bold">
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
                  const isBooked = bookedSlots.includes(slot);
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

            {/* 6. Ulasan Pemain Terverifikasi dari Database */}
            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-800" />
                  <span>Ulasan Pemain Terverifikasi</span>
                </h3>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="text-xs font-bold text-brand-800 hover:underline cursor-pointer"
                >
                  + Tulis Ulasan
                </button>
              </div>

              {/* Rating Breakdown Progress Bars Dinamis dari PostgreSQL */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Kualitas Lantai</span>
                    <span className="font-bold text-slate-800">{aspects.floor} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(aspects.floor / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Penerangan Lampu</span>
                    <span className="font-bold text-slate-800">{aspects.lighting} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(aspects.lighting / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Kebersihan &amp; Toilet</span>
                    <span className="font-bold text-slate-800">{aspects.cleanliness} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(aspects.cleanliness / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Pelayanan Staf</span>
                    <span className="font-bold text-slate-800">{aspects.hospitality} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${(aspects.hospitality / 5) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Review Cards Dinamis dari PostgreSQL */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Belum ada ulasan untuk lapangan ini. Jadilah yang pertama memberikan ulasan!</p>
                ) : (
                  reviews.map((r, idx) => (
                    <div key={r.id || idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-brand-800 text-white font-bold flex items-center justify-center text-[11px]">
                            {r.user.charAt(0)}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{r.user}</p>
                            <span className="text-[10px] text-brand-700 font-semibold flex items-center gap-0.5">
                              <BadgeCheck className="w-3 h-3" /> {r.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex text-amber-500 text-xs">
                            {'★'.repeat(Math.round(r.rating))}
                          </div>
                          <span className="text-[10px] text-slate-400">{r.date}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 leading-relaxed">{r.comment}</p>

                      {/* Official Owner Reply Box */}
                      {r.ownerReply && (
                        <div className="mt-2.5 p-2.5 bg-brand-50/80 rounded-lg border-l-2 border-brand-800 text-[11px]">
                          <p className="font-bold text-brand-900 mb-0.5">Tanggapan Resmi Pengelola:</p>
                          <p className="text-slate-700 italic">"{r.ownerReply}"</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Sewa (1 Jam)</span>
              <span className="text-lg font-extrabold text-brand-800">{venue.priceFormatted}</span>
            </div>
            <button
              onClick={handleCheckoutClick}
              className="bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>Pesan Sekarang (QRIS/VA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tulis Ulasan Baru */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[11000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Tulis Ulasan untuk {venue.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Ulasan Anda membantu pemain lain menemukan lapangan terbaik.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Rating Bintang</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className={`text-2xl cursor-pointer transition ${
                        star <= newReviewRating ? 'text-amber-400 scale-110' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Komentar &amp; Pengalaman Main</label>
                <textarea
                  rows={4}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Ceritakan kondisi lantai, pencahayaan, atau kebersihan toilet..."
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:border-brand-800 focus:outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-800 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
