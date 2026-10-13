'use strict';
'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface PeakHoursTipCardProps {
  isPromoApplied: boolean;
  onApplyPromotion: () => void;
  isLoading?: boolean;
}

export const PeakHoursTipCard: React.FC<PeakHoursTipCardProps> = ({
  isPromoApplied,
  onApplyPromotion,
  isLoading = false
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#164925] to-[#0F351B] text-white rounded-2xl p-5 shadow-xs">
      {/* Decorative background watermark graphic */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-emerald-500/10 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <h3 className="text-sm font-extrabold tracking-tight text-white">
            Peak Hours Tip
          </h3>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed font-normal mb-5">
          Most bookings are happening between 18:00 and 21:00. Consider offering an &quot;Early Bird&quot; discount to fill morning slots.
        </p>

        <button
          onClick={onApplyPromotion}
          disabled={isLoading}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 ${
            isPromoApplied
              ? 'bg-emerald-400 text-[#0E301B] hover:bg-emerald-300'
              : 'bg-[#0E301B] text-white hover:bg-[#092213] border border-emerald-900/40'
          }`}
        >
          {isPromoApplied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0E301B]" />
              <span>Promotion Active (-20%)</span>
            </>
          ) : (
            <span>{isLoading ? 'Applying...' : 'Apply Promotion'}</span>
          )}
        </button>
      </div>
    </div>
  );
};
