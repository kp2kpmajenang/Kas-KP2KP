'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Username atau password salah.');
        setLoading(false);
        return;
      }

      // Login berhasil -> redirect ke dashboard
      router.push('/dashboard');
      router.refresh();
    } catch {
      setErrorMessage('Terjadi gangguan jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100">
        {/* Brand */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-blue-900 text-amber-400 font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
            KP
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-blue-950">
              KAS KP2KP MAJENANG
            </h1>
            <p className="text-[11px] text-slate-500">
              Layanan Pembukuan Kas Internal
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">Masuk Sistem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gunakan akun NIP Pendek untuk mengakses sistem kas.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Username (NIP Pendek)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan NIP Pendek"
                required
                autoComplete="username"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-900 text-xs text-slate-900 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-900 text-xs text-slate-900 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-md"
                aria-label="Tampilkan password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-xs tracking-wide shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Memeriksa Kredensial...' : 'Masuk ke Dashboard'}
          </button>
        </form>

        {/* Security badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Koneksi Terverifikasi & Terenkripsi</span>
        </div>

        <div className="mt-4 text-center text-[10px] text-slate-400">
          KP2KP Majenang · Internal Financial System
        </div>
      </div>
    </div>
  );
}
