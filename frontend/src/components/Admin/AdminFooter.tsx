'use client';

import React from 'react';

export const AdminFooter: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#f0f2ee] border-t border-gray-200/80 px-6 sm:px-8 py-6 text-slate-600">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Information */}
        <div>
          <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
            Pitch Gallery
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Elite Sports Facility Management Console
          </p>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600 font-medium">
            <button
              onClick={() => alert("Contact support: support@pitchgallery.com")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              onClick={() => alert("Pitch Gallery & LapangID Platform")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => alert("Kebijakan Privasi Kepatuhan GDPR & Standar Keamanan Data")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => alert("Syarat & Ketentuan Pengelola Fasilitas")}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <p className="text-slate-400 font-normal">
            © 2024 Pitch Gallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
