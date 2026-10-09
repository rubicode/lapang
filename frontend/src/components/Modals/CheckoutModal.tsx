'use client';

import React from 'react';
import { CheckCheck } from 'lucide-react';
import { Venue } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue | null;
  selectedSlot: string | null;
  dateTab: string;
  bookingCode: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  venue,
  selectedSlot,
  dateTab,
  bookingCode
}) => {
  if (!isOpen || !venue) return null;

  const slotHour = selectedSlot ? parseInt(selectedSlot.split(':')[0], 10) : 19;
  const nextHour = `${slotHour + 1 < 10 ? `0${slotHour + 1}` : slotHour + 1}:00`;
  const scheduleText = `${dateTab === 'today' ? 'Hari ini' : 'Besok'}, ${selectedSlot} - ${nextHour} WIB`;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto shadow-inner">
          <CheckCheck className="w-8 h-8 text-brand-800" />
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900">Reservasi Lapangan Berhasil!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Kode Booking: <span className="font-mono font-bold text-brand-800">{bookingCode}</span>
          </p>
        </div>

        {/* Summary Details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Venue:</span>
            <span className="font-bold text-slate-800">{venue.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jadwal:</span>
            <span className="font-bold text-brand-800">{scheduleText}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Metode Bayar:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-black text-[10px]">
                QRIS
              </span>
              <span>Midtrans Instan Pay</span>
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between font-black text-sm text-slate-900">
            <span>Total Tagihan:</span>
            <span className="text-brand-800">{venue.priceFormatted}</span>
          </div>
        </div>

        {/* Dynamic QR Code */}
        <div className="p-3 bg-white border border-gray-200 rounded-xl inline-block shadow-xs">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              `MIDTRANS-PAY-${bookingCode}-${venue.priceHourly}`
            )}`}
            alt="Midtrans QRIS Barcode"
            className="w-32 h-32 mx-auto rounded"
          />
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            Scan via GoPay, OVO, BCA, Livin Mandiri, ShopeePay
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
          >
            Selesai &amp; Buka E-Tiket
          </button>
        </div>
      </div>
    </div>
  );
};
