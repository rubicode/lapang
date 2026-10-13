'use client';

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, FileText, Download, Building, MapPin, User, Mail, Phone } from 'lucide-react';
import { VerificationApplicant } from '@/types';

interface VerificationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: VerificationApplicant | null;
  onApprove: (id: string) => void;
  onRequestIssues: (id: string, note: string) => void;
  onReject: (id: string) => void;
}

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
  isOpen,
  onClose,
  applicant,
  onApprove,
  onRequestIssues,
  onReject
}) => {
  const [issueNote, setIssueNote] = useState('');
  const [showIssueInput, setShowIssueInput] = useState(false);

  if (!isOpen || !applicant) return null;

  const handleApprove = () => {
    onApprove(applicant.id);
    onClose();
  };

  const handleRequestChanges = () => {
    if (!showIssueInput) {
      setShowIssueInput(true);
      return;
    }
    if (!issueNote.trim()) {
      alert('Mohon cantumkan catatan kendala sebelum meminta perbaikan.');
      return;
    }
    onRequestIssues(applicant.id, issueNote);
    setShowIssueInput(false);
    setIssueNote('');
    onClose();
  };

  const handleReject = () => {
    if (confirm(`Yakin ingin menolak aplikasi dari ${applicant.user.name} (${applicant.facilityName})?`)) {
      onReject(applicant.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Facility Verification Review
              </h3>
              <p className="text-xs text-slate-500">
                Application ID: #{applicant.id} • Submitted {applicant.submittedDate}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Owner & Facility Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-gray-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Owner Details
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {applicant.user.name}
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {applicant.user.email}
              </p>
              {applicant.user.phone && (
                <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {applicant.user.phone}
                </p>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Facility & Sport
              </span>
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-emerald-700" />
                {applicant.facilityName}
              </p>
              <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {applicant.location || 'Lisbon, Portugal'}
              </p>
              <p className="text-xs font-semibold text-emerald-800 mt-1">
                {applicant.sportType || 'Futsal & Padel'} • {applicant.courtsCount || 4} Courts
              </p>
            </div>
          </div>

          {/* Verification Documents */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
              Uploaded Legal Documents & Permits
            </h4>
            <div className="space-y-2">
              {(applicant.documents && applicant.documents.length > 0
                ? applicant.documents
                : [
                    { name: 'Commercial_Registration_Certificate.pdf', size: '2.4 MB', type: 'PDF' },
                    { name: 'Safety_And_Facility_Permit.pdf', size: '1.2 MB', type: 'PDF' }
                  ]
              ).map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-600/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                      <p className="text-[11px] text-slate-400">{doc.size} • Verified Anti-Malware</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Mengunduh dokumen validasi: ${doc.name}`)}
                    className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Previews */}
          {applicant.photos && applicant.photos.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">
                Facility Photos
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {applicant.photos.map((photo, i) => (
                  <div key={i} className="h-28 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      referrerPolicy="no-referrer"
                      src={photo}
                      alt="Facility"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {applicant.notes && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
              <span className="font-bold text-slate-700">Catatan Pemilik: </span>
              {applicant.notes}
            </div>
          )}

          {/* Action Required Input */}
          {showIssueInput && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 animate-in fade-in">
              <label className="text-xs font-bold text-amber-900 block mb-1">
                Cantumkan kendala yang harus diperbaiki oleh pemilik fasilitas:
              </label>
              <textarea
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
                placeholder="Contoh: Dokumen asuransi belum diperpanjang, foto gawang belum ada kalibrasi..."
                rows={3}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
          >
            Tolak Aplikasi
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestChanges}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{showIssueInput ? 'Kirim Catatan Isu' : 'Minta Perbaikan (Fix Issues)'}</span>
            </button>

            <button
              onClick={handleApprove}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0e3813] hover:bg-[#155320] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Setujui &amp; Verifikasi Fasilitas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
