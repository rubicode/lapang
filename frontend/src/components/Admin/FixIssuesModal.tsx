'use client';

import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Mail, ShieldAlert, Send } from 'lucide-react';
import { VerificationApplicant } from '@/types';

interface FixIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: VerificationApplicant | null;
  onResolveAndVerify: (id: string) => void;
}

export const FixIssuesModal: React.FC<FixIssuesModalProps> = ({
  isOpen,
  onClose,
  applicant,
  onResolveAndVerify
}) => {
  const [adminNote, setAdminNote] = useState('');
  const [isResolvedChecked, setIsResolvedChecked] = useState(false);

  if (!isOpen || !applicant) return null;

  const defaultIssues = [
    'Sertifikat asuransi kewajiban komersial telah kedaluwarsa pada 15 Okt 2023.',
    'Dimensi tiang gawang lapangan 2 belum menyertakan surat kalibrasi standar FIFA.'
  ];

  const currentIssues = applicant.issues && applicant.issues.length > 0
    ? applicant.issues
    : defaultIssues;

  const handleResolve = () => {
    onResolveAndVerify(applicant.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Action Required Checklist
              </h3>
              <p className="text-xs text-slate-500">
                {applicant.facilityName} • {applicant.user.name}
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-red-50 rounded-2xl border border-red-100 text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Daftar Kendala Kepatuhan Fasilitas:</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs text-red-800">
              {currentIssues.map((issue, idx) => (
                <li key={idx} className="leading-relaxed">
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Kirim Pesan Pengingat ke Pemilik ({applicant.user.email}):
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Tuliskan catatan tindak lanjut untuk pengelola..."
              rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Email pengingat berhasil dikirimkan ke ${applicant.user.email}`);
                  setAdminNote('');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Email Pengingat</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="resolve-check"
              checked={isResolvedChecked}
              onChange={(e) => setIsResolvedChecked(e.target.checked)}
              className="w-4 h-4 accent-[#0e3813] rounded cursor-pointer"
            />
            <label htmlFor="resolve-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Saya telah memeriksa dokumen revisi dan mengonfirmasi bahwa kendala telah diperbaiki.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={handleResolve}
            disabled={!isResolvedChecked}
            className="px-4 py-2.5 bg-[#0e3813] hover:bg-[#14471b] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesaikan &amp; Verifikasi Fasilitas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
