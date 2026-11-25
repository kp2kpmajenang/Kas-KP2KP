'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import KasLogo from '@/components/KasLogo';
import ProfileAvatar from '@/components/ProfileAvatar';
import SilkBackground from '@/components/SilkBackground';

type LoginUser = {
  username: string;
  nama: string;
  roles: string[];
};

export default function LoginPage() {
  const router = useRouter();

  const [users, setUsers] = useState<LoginUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        setErrorMessage('');

        const res = await fetch('/api/auth/users', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = await res.json();
        if (!mounted) return;

        if (!res.ok || !data.success) {
          setErrorMessage(data.message || 'Daftar akun tidak dapat dimuat.');
          return;
        }

        const loadedUsers: LoginUser[] = Array.isArray(data.data)
          ? data.data
              .filter(
                (user: any) =>
                  user &&
                  typeof user.username === 'string' &&
                  typeof user.nama === 'string' &&
                  Array.isArray(user.roles)
              )
              .map((user: any) => ({
                username: user.username,
                nama: user.nama,
                roles: user.roles,
              }))
          : [];

        setUsers(loadedUsers);
      } catch (error) {
        console.error('Load login users error:', error);
        if (mounted) {
          setErrorMessage('Terjadi gangguan jaringan. Silakan coba lagi.');
        }
      } finally {
        if (mounted) {
          setLoadingUsers(false);
        }
      }
    }

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const regularUsers = useMemo(
    () => users.filter((user) => !user.roles.includes('SUPER ADMIN')),
    [users]
  );

  const superAdmins = useMemo(
    () => users.filter((user) => user.roles.includes('SUPER ADMIN')),
    [users]
  );

  function getPrimaryRole(user: LoginUser) {
    if (user.roles.includes('SUPER ADMIN')) return 'Super Admin';
    if (user.roles.includes('BENDAHARA')) return 'Bendahara';
    if (user.roles.includes('USER')) return 'Pengguna';
    return user.roles[0] || 'Pengguna';
  }

  function selectUser(user: LoginUser) {
    setSelectedUser(user);
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
  }

  function backToUsers() {
    if (loading) return;
    setSelectedUser(null);
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedUser) {
      setErrorMessage('Silakan pilih akun terlebih dahulu.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedUser.username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Kata sandi salah.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Terjadi gangguan jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  }

  return (
    <main className="kas-silk-canvas kas-safe-top relative min-h-screen overflow-x-clip text-[#143632]">
      <SilkBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[960px]">
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            {/* BRAND SIDE (DESKTOP) */}
            <div className="hidden lg:block">
              <div className="max-w-sm">
                <KasLogo size="lg" />

                <div className="mt-6">
                  <div className="kas-glass-gold mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                    <span className="text-[11px] font-bold text-[#5E4706]">
                      Sistem Keuangan Internal
                    </span>
                  </div>

                  <h1 className="text-[38px] font-bold leading-[1.08] text-[#134E4A]">
                    KAS{' '}
                    <span className="bg-gradient-to-r from-[#0F766E] via-[#134E4A] to-[#C9A227] bg-clip-text text-transparent">
                      KP2KP
                    </span>
                  </h1>

                  <p className="mt-3 text-[14px] leading-relaxed text-[#4E6661]">
                    Pengelolaan kas kantor yang sederhana, tertib, transparan,
                    dan mudah dipantau kapan saja.
                  </p>
                </div>

                <div className="mt-7 flex items-center gap-3 text-[12px] font-medium text-[#4E6661]">
                  <div className="h-0.5 w-8 rounded-full bg-[#C9A227]" />
                  <span>KP2KP Majenang</span>
                </div>
              </div>
            </div>

            {/* LOGIN AREA */}
            <div>
              {/* Mobile Brand */}
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <KasLogo size="sm" />
                <div>
                  <div className="text-[17px] font-bold leading-tight text-[#134E4A]">
                    KAS KP2KP
                  </div>
                  <div className="text-[11.5px] font-medium text-[#4E6661]">
                    KP2KP Majenang
                  </div>
                </div>
              </div>

              {/* LOGIN GLASS CARD (.kas-glass-soft) */}
              <section className="kas-glass-soft relative overflow-hidden rounded-[26px] p-5 sm:p-7">
                {/* Top emerald-gold accent */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#C9A227] via-[#0F766E] to-[#134E4A]"
                />

                {/* STEP 1 — PILIH AKUN */}
                {!selectedUser && (
                  <div key="account-selection" className="kas-animate-fade">
                    <div className="mb-5">
                      <p className="text-[11px] font-bold uppercase text-[#0F766E]">
                        Akses Akun
                      </p>
                      <h2 className="mt-1 text-[20px] font-bold leading-tight text-[#143632]">
                        Selamat datang
                      </h2>
                      <p className="mt-1 text-[12.5px] text-[#4E6661]">
                        Pilih akun pegawai untuk melanjutkan.
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="mb-4 rounded-[16px] border border-[#9F3542]/20 bg-[#9F3542]/8 px-3.5 py-2.5 text-[12px] font-semibold text-[#9F3542]">
                        {errorMessage}
                      </div>
                    )}

                    {loadingUsers ? (
                      <div className="space-y-2.5">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-[64px] animate-pulse rounded-[18px] bg-white/60"
                          />
                        ))}
                      </div>
                    ) : regularUsers.length > 0 ? (
                      <div className="space-y-2.5">
                        {regularUsers.map((user) => (
                          <button
                            key={user.username}
                            type="button"
                            onClick={() => selectUser(user)}
                            className="kas-glass-clear group flex w-full items-center gap-3 rounded-[18px] p-3 text-left transition-all duration-200 hover:bg-white/75 active:scale-[0.99]"
                          >
                            <ProfileAvatar name={user.nama} size="md" />

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13.5px] font-semibold text-[#143632]">
                                {user.nama}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-medium text-[#4E6661]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
                                <span>{getPrimaryRole(user)}</span>
                              </div>
                            </div>

                            <div className="kas-glass-orb flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#4E6661] transition-all group-hover:bg-[#134E4A] group-hover:text-white">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="kas-glass-clear rounded-[18px] px-4 py-6 text-center">
                        <p className="text-[13px] font-semibold text-[#143632]">
                          Belum ada akun yang tersedia.
                        </p>
                        <p className="mt-1 text-[11.5px] text-[#4E6661]">
                          Pastikan terdapat pengguna aktif pada data USER.
                        </p>
                      </div>
                    )}

                    {/* SUPER ADMIN */}
                    {superAdmins.length > 0 && (
                      <div className="mt-6">
                        <div className="mb-2.5 flex items-center gap-3">
                          <div className="h-px flex-1 bg-[#143632]/10" />
                          <span className="text-[10.5px] font-semibold uppercase text-[#4E6661]/80">
                            Akses Khusus
                          </span>
                          <div className="h-px flex-1 bg-[#143632]/10" />
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                          {superAdmins.map((user) => (
                            <button
                              key={user.username}
                              type="button"
                              onClick={() => selectUser(user)}
                              className="kas-glass-gold group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-[#5E4706] transition-all hover:brightness-[0.98]"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              <span>{getPrimaryRole(user)}</span>
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2 — KATA SANDI */}
                {selectedUser && (
                  <div key="password" className="kas-animate-fade">
                    <button
                      type="button"
                      onClick={backToUsers}
                      disabled={loading}
                      className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#143632]/6 px-3 py-1 text-[12px] font-semibold text-[#4E6661] transition-colors hover:bg-[#143632]/10 hover:text-[#143632] disabled:opacity-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Kembali</span>
                    </button>

                    <div className="mb-6 flex items-center gap-3.5">
                      <ProfileAvatar name={selectedUser.nama} size="lg" />

                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#0F766E]">
                          Masuk sebagai
                        </p>
                        <h2 className="truncate text-[18px] font-bold leading-tight text-[#143632]">
                          {selectedUser.nama}
                        </h2>
                        <p className="mt-0.5 text-[12px] font-medium text-[#4E6661]">
                          {getPrimaryRole(selectedUser)}
                        </p>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="mb-4 rounded-[16px] border border-[#9F3542]/20 bg-[#9F3542]/8 px-3.5 py-2.5 text-[12px] font-semibold text-[#9F3542]">
                        {errorMessage}
                      </div>
                    )}

                    <form onSubmit={handleLogin}>
                      <label
                        htmlFor="password"
                        className="mb-1.5 block text-[12px] font-semibold text-[#143632]"
                      >
                        Kata Sandi
                      </label>

                      <div className="relative">
                        <Lock
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4E6661]/70"
                        />

                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errorMessage) setErrorMessage('');
                          }}
                          placeholder="Masukkan kata sandi"
                          required
                          autoFocus
                          autoComplete="current-password"
                          disabled={loading}
                          className="h-12 w-full rounded-[16px] border border-[#143632]/12 bg-white/80 pl-10 pr-11 text-[13.5px] font-medium text-[#143632] outline-none transition-all placeholder:text-[#4E6661]/55 focus:border-[#0F766E] focus:bg-white focus:ring-3 focus:ring-[#0F766E]/12 disabled:opacity-60"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? 'Sembunyikan kata sandi'
                              : 'Tampilkan kata sandi'
                          }
                          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-[#4E6661] transition-colors hover:bg-[#0F766E]/10 hover:text-[#0F766E]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !password.trim()}
                        className="mt-4 h-12 w-full rounded-[16px] bg-gradient-to-r from-[#134E4A] via-[#0F766E] to-[#168278] text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-6px_rgba(19,78,74,0.34)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? 'Memeriksa...' : 'Masuk'}
                      </button>
                    </form>

                    <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium text-[#4E6661]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
                      <span>Akses aman dan terenkripsi</span>
                    </div>
                  </div>
                )}
              </section>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-medium text-[#4E6661]">
                <span>KP2KP Majenang</span>
                <span className="h-1 w-1 rounded-full bg-[#C9A227]" />
                <span>KAS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
