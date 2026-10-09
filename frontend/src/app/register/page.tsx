'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, Eye, EyeOff, User, Phone, X } from 'lucide-react';
import Link from 'next/link';
import { registerUser } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Harap setujui syarat dan ketentuan penggunaan platform.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await registerUser({
        name,
        email,
        password,
        phone: phone || undefined,
        role
      });
      alert(`Pendaftaran berhasil! Selamat datang, ${result.user.name}.`);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Pendaftaran gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px] relative">
        <Link
          href="/"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          title="Kembali ke Beranda"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* SISI KIRI: Visual Stadium Banner */}
        <div className="w-full md:w-1/2 relative bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2910] via-[#0b2910]/40 to-black/60 pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
              <Compass className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">
                Lapang<span className="text-emerald-400">.id</span>
              </span>
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Nasional
              </span>
            </div>
          </div>

          {/* Bottom Hero Typography */}
          <div className="relative z-10 pt-28 md:pt-36">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              Bergabung di <br />
              <span className="text-emerald-400">Komunitas Olahraga.</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal max-w-sm">
              Mulai pesan lapangan futsal, badminton, basket, padel, dan voli di seluruh Indonesia dalam hitungan detik.
            </p>
          </div>
        </div>

        {/* SISI KANAN: Form Register */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 flex flex-col justify-center bg-white overflow-y-auto max-h-[90vh]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Buat Akun Baru
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Daftar sekarang untuk mulai memesan lapangan olahraga terbaik.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center bg-[#f0f2ee] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-800 transition">
                  <User className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Daftar Sebagai (Peran)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'user'
                        ? 'bg-brand-50 border-brand-800 text-brand-800 ring-1 ring-brand-800'
                        : 'bg-[#f0f2ee] border-transparent text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Pemain Olahraga</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === 'owner'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600'
                        : 'bg-[#f0f2ee] border-transparent text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>Pengelola Venue</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alamat Email
                </label>
                <div className="relative flex items-center bg-[#f0f2ee] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-800 transition">
                  <Mail className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nomor WhatsApp / Telepon
                </label>
                <div className="relative flex items-center bg-[#f0f2ee] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-800 transition">
                  <Phone className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kata Sandi
                </label>
                <div className="relative flex items-center bg-[#f0f2ee] rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-brand-800 transition">
                  <Lock className="w-4 h-4 text-slate-500 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-800 transition ml-2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 accent-brand-800 rounded text-brand-800 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Saya menyetujui Ketentuan Layanan &amp; Kebijakan Privasi
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#1B5E20] hover:bg-[#144718] active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>

            <div className="text-center text-xs text-slate-600 mt-5 pt-3 border-t border-gray-100">
              <p>
                Sudah punya akun?{' '}
                <Link href="/login" className="font-bold text-brand-800 hover:underline">
                  Masuk ke akun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
