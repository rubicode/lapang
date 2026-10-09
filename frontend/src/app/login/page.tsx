'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';
import { loginUser } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      alert(`Selamat datang kembali, ${result.user.name}!`);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPreset = async (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await loginUser(presetEmail, 'Password123!');
      alert(`Login berhasil sebagai: ${result.user.name} (${result.user.role.toUpperCase()})`);
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px] relative">
        {/* Tombol Kembali ke Beranda */}
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
              Lapangan Siap <br />
              <span className="text-emerald-400">Menunggumu.</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal max-w-sm">
              Akses venue olahraga terfavorit di seluruh Indonesia dengan pengalaman reservasi instan &amp; jadwal terverifikasi.
            </p>

            <div className="mt-6 pt-4 border-t border-white/10 text-[11px]">
              <span className="text-emerald-200/90 font-semibold block mb-2">Akses Cepat Uji Coba (Demo RBAC):</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('rian@lapang.id')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-emerald-200 text-[10px] font-bold transition"
                >
                  Pemain (User)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('owner@lapang.id')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 rounded-lg text-amber-200 text-[10px] font-bold transition"
                >
                  Pengelola (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('admin@lapang.id')}
                  className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-200 text-[10px] font-bold transition"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: Form Login */}
        <div className="w-full md:w-1/2 p-7 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Selamat Datang
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Masukkan detail akun Anda untuk masuk ke sistem.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Alamat Email
                </label>
                <div className="relative flex items-center bg-[#f0f2ee] rounded-xl px-3.5 py-3 focus-within:ring-2 focus-within:ring-brand-800 transition">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Silakan hubungi admin di admin@lapang.id untuk mereset kata sandi Anda.")}
                    className="text-xs font-bold text-brand-800 hover:underline cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative flex items-center bg-[#f0f2ee] rounded-xl px-3.5 py-3 focus-within:ring-2 focus-within:ring-brand-800 transition">
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
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-brand-800 rounded text-brand-800 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Ingat saya selama 30 hari
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#1B5E20] hover:bg-[#144718] active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </div>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Atau Lanjutkan Dengan
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => alert("Fitur Google Sign-In akan segera hadir!")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f0f2ee] hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Fitur Facebook Login akan segera hadir!")}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f0f2ee] hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <div className="text-center text-xs text-slate-600">
              <p>
                Belum punya akun?{' '}
                <Link href="/register" className="font-bold text-brand-800 hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
