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

type LoginUser = {
  username: string;
  nama: string;
  roles: string[];
};

/**
 * Logo KAS KP2KP
 * Dibuat sebagai SVG inline supaya:
 * - tidak perlu file gambar tambahan
 * - tajam di semua ukuran
 * - mudah diubah
 */
function KasLogo() {
  return (
    <div className="relative h-[72px] w-[72px]">
      {/* soft glow */}
      <div className="absolute inset-0 rounded-[26px] bg-[#D9B83F]/30 blur-xl" />

      <svg
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
        aria-label="Logo KAS KP2KP"
      >
        <defs>
          <linearGradient
            id="kasLogoGradient"
            x1="8"
            y1="8"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#134E4A" />
            <stop offset="0.55" stopColor="#0F766E" />
            <stop offset="1" stopColor="#D9B83F" />
          </linearGradient>

          <linearGradient
            id="kasGoldGradient"
            x1="18"
            y1="10"
            x2="58"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F7E7A8" />
            <stop offset="1" stopColor="#D9B83F" />
          </linearGradient>
        </defs>

        {/* Main rounded shape */}
        <rect
          x="3"
          y="3"
          width="66"
          height="66"
          rx="23"
          fill="url(#kasLogoGradient)"
        />

        {/* Inner glass */}
        <path
          d="M18 13C24 9 32 8 39 10C50 13 59 21 62 31"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* stylized K */}
        <path
          d="M20 22V50"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <path
          d="M23 36L38 22"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M28 36L39 50"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* stylized ledger / financial bars */}
        <path
          d="M43 47V38"
          stroke="url(#kasGoldGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M51 47V32"
          stroke="url(#kasGoldGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M59 47V27"
          stroke="url(#kasGoldGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* bottom line */}
        <path
          d="M17 53H59"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [users, setUsers] = useState<LoginUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LoginUser | null>(null);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================
  // LOAD USER
  // ============================================================

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
          setErrorMessage(
            data.message || 'Daftar akun tidak dapat dimuat.'
          );
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
          setErrorMessage(
            'Terjadi gangguan jaringan. Silakan coba lagi.'
          );
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

  // ============================================================
  // USER GROUP
  // ============================================================

  const regularUsers = useMemo(() => {
    return users.filter(
      (user) => !user.roles.includes('SUPER ADMIN')
    );
  }, [users]);

  const superAdmins = useMemo(() => {
    return users.filter(
      (user) => user.roles.includes('SUPER ADMIN')
    );
  }, [users]);

  // ============================================================
  // HELPERS
  // ============================================================

  function getInitials(nama: string) {
    const cleanName = nama.trim();

    if (!cleanName) {
      return 'KP';
    }

    const parts = cleanName.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  function getPrimaryRole(user: LoginUser) {
    if (user.roles.includes('SUPER ADMIN')) {
      return 'Super Admin';
    }

    if (user.roles.includes('BENDAHARA')) {
      return 'Bendahara';
    }

    if (user.roles.includes('USER')) {
      return 'Pengguna';
    }

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

  // ============================================================
  // LOGIN
  // ============================================================

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: selectedUser.username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.message || 'Kata sandi salah.'
        );
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);

      setErrorMessage(
        'Terjadi gangguan jaringan. Silakan coba lagi.'
      );

      setLoading(false);
    }
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF9E8] text-[#183B38]">

      {/* ========================================================
          BACKGROUND GRADIENT
          ======================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_15%_10%,rgba(217,184,63,0.20),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(15,118,110,0.18),transparent_34%),linear-gradient(135deg,#FFF9E8_0%,#FFFDF4_48%,#F2F8F4_100%)]
        "
      />

      {/* large teal glow */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-32
          top-10
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#0F766E]/10
          blur-[90px]
        "
      />

      {/* gold glow */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-32
          bottom-0
          h-[380px]
          w-[380px]
          rounded-full
          bg-[#D9B83F]/15
          blur-[90px]
        "
      />

      {/* decorative arc */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[-120px]
          top-[-120px]
          h-[360px]
          w-[360px]
          rounded-full
          border
          border-white/60
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[-80px]
          top-[-80px]
          h-[280px]
          w-[280px]
          rounded-full
          border
          border-[#D9B83F]/15
        "
      />

      {/* ========================================================
          MAIN
          ======================================================== */}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">

        <div className="w-full max-w-[1080px]">

          {/* ====================================================
              DESKTOP COMPOSITION
              ==================================================== */}

          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-[0.9fr_1.1fr]
              lg:gap-16
            "
          >

            {/* ==================================================
                BRAND SIDE
                ================================================== */}

            <div className="hidden lg:block">

              <div className="max-w-md">

                <KasLogo />

                <div className="mt-7">

                  <div
                    className="
                      mb-3
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[#D9B83F]/25
                      bg-white/55
                      px-3
                      py-1.5
                      backdrop-blur-md
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E]" />

                    <span
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-[#0F766E]
                      "
                    >
                      Sistem Keuangan
                    </span>
                  </div>

                  <h1
                    className="
                      text-5xl
                      font-black
                      leading-[1.05]
                      tracking-[-0.04em]
                      text-[#134E4A]
                    "
                  >
                    KAS
                    <br />
                    <span className="bg-gradient-to-r from-[#0F766E] via-[#134E4A] to-[#D9B83F] bg-clip-text text-transparent">
                      KP2KP
                    </span>
                  </h1>

                  <p
                    className="
                      mt-5
                      max-w-sm
                      text-base
                      leading-7
                      text-[#68736F]
                    "
                  >
                    Pengelolaan kas yang sederhana,
                    tertib, dan mudah dipantau.
                  </p>

                </div>

                {/* small information */}

                <div
                  className="
                    mt-9
                    flex
                    items-center
                    gap-3
                    text-xs
                    font-medium
                    text-[#7B817D]
                  "
                >

                  <div className="h-px w-10 bg-[#D9B83F]" />

                  <span>KP2KP Majenang</span>

                </div>

              </div>

            </div>

            {/* ==================================================
                LOGIN AREA
                ================================================== */}

            <div>

              {/* mobile brand */}

              <div className="mb-6 flex items-center gap-3 lg:hidden">

                <KasLogo />

                <div>

                  <div
                    className="
                      text-lg
                      font-black
                      tracking-tight
                      text-[#134E4A]
                    "
                  >
                    KAS KP2KP
                  </div>

                  <div className="text-xs font-medium text-[#7B817D]">
                    Majenang
                  </div>

                </div>

              </div>

              {/* =================================================
                  LOGIN CARD
                  ================================================= */}

              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-white/70
                  bg-white/75
                  p-5
                  shadow-[0_30px_100px_rgba(19,78,74,0.12)]
                  backdrop-blur-xl
                  sm:p-7
                  md:p-8
                "
              >

                {/* top gradient line */}

                <div
                  aria-hidden="true"
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-[3px]
                    bg-gradient-to-r
                    from-[#D9B83F]
                    via-[#0F766E]
                    to-[#134E4A]
                  "
                />

                {/* subtle card glow */}

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    right-[-100px]
                    top-[-100px]
                    h-56
                    w-56
                    rounded-full
                    bg-[#D9B83F]/10
                    blur-3xl
                  "
                />

                <div className="relative">

                  {/* =================================================
                      LAYER 1
                      ================================================= */}

                  {!selectedUser && (
                    <div
                      key="account-selection"
                      className="transition-all duration-200"
                    >

                      <div className="mb-7">

                        <p
                          className="
                            mb-2
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-[#0F766E]
                          "
                        >
                          Akses akun
                        </p>

                        <h2
                          className="
                            text-[26px]
                            font-black
                            leading-tight
                            tracking-[-0.03em]
                            text-[#183B38]
                          "
                        >
                          Selamat datang.
                        </h2>

                        <p
                          className="
                            mt-1.5
                            text-sm
                            leading-6
                            text-[#7B817D]
                          "
                        >
                          Pilih akun untuk melanjutkan.
                        </p>

                      </div>

                      {/* ERROR */}

                      {errorMessage && (
                        <div
                          className="
                            mb-4
                            rounded-2xl
                            border
                            border-rose-200
                            bg-rose-50/80
                            px-4
                            py-3
                            text-xs
                            font-semibold
                            leading-relaxed
                            text-rose-700
                          "
                        >
                          {errorMessage}
                        </div>
                      )}

                      {/* LOADING */}

                      {loadingUsers ? (

                        <div className="space-y-3">

                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="
                                h-[76px]
                                animate-pulse
                                rounded-[22px]
                                bg-[#F3F5F1]
                              "
                            />
                          ))}

                        </div>

                      ) : regularUsers.length > 0 ? (

                        <div className="space-y-2.5">

                          {regularUsers.map((user, index) => (
                            <button
                              key={user.username}
                              type="button"
                              onClick={() => selectUser(user)}
                              className="
                                group
                                relative
                                flex
                                w-full
                                items-center
                                gap-3.5
                                overflow-hidden
                                rounded-[22px]
                                border
                                border-[#E7E9E2]
                                bg-white/80
                                p-3.5
                                text-left
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:border-[#B7D8D3]
                                hover:bg-white
                                hover:shadow-[0_12px_30px_rgba(15,118,110,0.09)]
                                active:scale-[0.99]
                              "
                            >

                              {/* hover gradient */}

                              <div
                                aria-hidden="true"
                                className="
                                  pointer-events-none
                                  absolute
                                  inset-0
                                  bg-gradient-to-r
                                  from-[#F0FDFA]
                                  via-transparent
                                  to-[#FFF9E8]
                                  opacity-0
                                  transition-opacity
                                  duration-200
                                  group-hover:opacity-100
                                "
                              />

                              {/* avatar */}

                              <div
                                className="
                                  relative
                                  flex
                                  h-12
                                  w-12
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[17px]
                                  bg-gradient-to-br
                                  from-[#F7E7A8]
                                  via-[#F3E4A1]
                                  to-[#D9B83F]
                                  text-xs
                                  font-black
                                  text-[#134E4A]
                                  shadow-sm
                                "
                              >
                                {getInitials(user.nama)}
                              </div>

                              {/* information */}

                              <div className="relative min-w-0 flex-1">

                                <div
                                  className="
                                    truncate
                                    text-sm
                                    font-bold
                                    text-[#183B38]
                                  "
                                >
                                  {user.nama}
                                </div>

                                <div
                                  className="
                                    mt-1
                                    flex
                                    items-center
                                    gap-1.5
                                    text-[11px]
                                    font-semibold
                                    text-[#89928E]
                                  "
                                >
                                  <span
                                    className="
                                      h-1.5
                                      w-1.5
                                      rounded-full
                                      bg-[#0F766E]
                                    "
                                  />

                                  {getPrimaryRole(user)}
                                </div>

                              </div>

                              {/* arrow */}

                              <div
                                className="
                                  relative
                                  flex
                                  h-8
                                  w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-[#F5F7F4]
                                  text-[#9BA39F]
                                  transition-all
                                  duration-200
                                  group-hover:bg-[#0F766E]
                                  group-hover:text-white
                                "
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </div>

                            </button>
                          ))}

                        </div>

                      ) : (

                        <div
                          className="
                            rounded-[22px]
                            border
                            border-[#E9E4CF]
                            bg-[#FCFCF9]
                            px-4
                            py-7
                            text-center
                          "
                        >
                          <p className="text-sm font-semibold text-[#183B38]">
                            Belum ada akun yang tersedia.
                          </p>

                          <p className="mt-1 text-xs text-[#7B817D]">
                            Pastikan terdapat pengguna aktif pada data USER.
                          </p>
                        </div>
                      )}

                      {/* =================================================
                          SUPER ADMIN
                          ================================================= */}

                      {superAdmins.length > 0 && (
                        <div className="mt-7">

                          <div className="mb-3 flex items-center gap-3">

                            <div className="h-px flex-1 bg-[#E8E7DD]" />

                            <span
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-[#A1A6A2]
                              "
                            >
                              Akses khusus
                            </span>

                            <div className="h-px flex-1 bg-[#E8E7DD]" />

                          </div>

                          {superAdmins.map((user) => (
                            <button
                              key={user.username}
                              type="button"
                              onClick={() => selectUser(user)}
                              className="
                                group
                                mx-auto
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                px-4
                                py-2
                                text-xs
                                font-bold
                                text-[#0F766E]
                                transition-all
                                duration-200
                                hover:bg-[#F0FDFA]
                                hover:text-[#134E4A]
                              "
                            >
                              <Lock className="h-3 w-3" />

                              <span>
                                {getPrimaryRole(user)}
                              </span>

                              <ArrowRight
                                className="
                                  h-3.5
                                  w-3.5
                                  transition-transform
                                  duration-200
                                  group-hover:translate-x-1
                                "
                              />
                            </button>
                          ))}

                        </div>
                      )}

                    </div>
                  )}

                  {/* =================================================
                      LAYER 2
                      ================================================= */}

                  {selectedUser && (
                    <div
                      key="password"
                      className="transition-all duration-200"
                    >

                      {/* back */}

                      <button
                        type="button"
                        onClick={backToUsers}
                        disabled={loading}
                        className="
                          mb-7
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          text-xs
                          font-bold
                          text-[#7B817D]
                          transition-colors
                          hover:text-[#0F766E]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali
                      </button>

                      {/* selected user */}

                      <div className="mb-7">

                        <div className="flex items-center gap-4">

                          <div
                            className="
                              flex
                              h-16
                              w-16
                              shrink-0
                              items-center
                              justify-center
                              rounded-[21px]
                              bg-gradient-to-br
                              from-[#F7E7A8]
                              via-[#EEDB78]
                              to-[#D9B83F]
                              text-sm
                              font-black
                              text-[#134E4A]
                              shadow-[0_10px_25px_rgba(217,184,63,0.18)]
                            "
                          >
                            {getInitials(selectedUser.nama)}
                          </div>

                          <div className="min-w-0">

                            <p
                              className="
                                mb-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.16em]
                                text-[#0F766E]
                              "
                            >
                              Masuk sebagai
                            </p>

                            <h2
                              className="
                                truncate
                                text-xl
                                font-black
                                tracking-[-0.025em]
                                text-[#183B38]
                              "
                            >
                              {selectedUser.nama}
                            </h2>

                            <p
                              className="
                                mt-1
                                text-xs
                                font-semibold
                                text-[#7B817D]
                              "
                            >
                              {getPrimaryRole(selectedUser)}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* error */}

                      {errorMessage && (
                        <div
                          className="
                            mb-4
                            rounded-2xl
                            border
                            border-rose-200
                            bg-rose-50/80
                            px-4
                            py-3
                            text-xs
                            font-semibold
                            leading-relaxed
                            text-rose-700
                          "
                        >
                          {errorMessage}
                        </div>
                      )}

                      {/* form */}

                      <form onSubmit={handleLogin}>

                        <label
                          htmlFor="password"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-[#183B38]
                          "
                        >
                          Kata sandi
                        </label>

                        <div className="relative">

                          <Lock
                            aria-hidden="true"
                            className="
                              pointer-events-none
                              absolute
                              left-4
                              top-1/2
                              h-4
                              w-4
                              -translate-y-1/2
                              text-[#9AA29E]
                            "
                          />

                          <input
                            id="password"
                            name="password"
                            type={
                              showPassword
                                ? 'text'
                                : 'password'
                            }
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);

                              if (errorMessage) {
                                setErrorMessage('');
                              }
                            }}
                            placeholder="Masukkan kata sandi"
                            required
                            autoFocus
                            autoComplete="current-password"
                            disabled={loading}
                            className="
                              h-13
                              w-full
                              rounded-[18px]
                              border
                              border-[#E4E7E1]
                              bg-[#F8FAF7]/80
                              pl-11
                              pr-12
                              text-sm
                              font-medium
                              text-[#183B38]
                              outline-none
                              transition-all
                              placeholder:text-[#A7AEAA]
                              focus:border-[#0F766E]
                              focus:bg-white
                              focus:ring-4
                              focus:ring-[#0F766E]/10
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((value) => !value)
                            }
                            disabled={loading}
                            aria-label={
                              showPassword
                                ? 'Sembunyikan kata sandi'
                                : 'Tampilkan kata sandi'
                            }
                            className="
                              absolute
                              right-2.5
                              top-1/2
                              flex
                              h-9
                              w-9
                              -translate-y-1/2
                              items-center
                              justify-center
                              rounded-xl
                              text-[#9AA29E]
                              transition-colors
                              hover:bg-[#F0FDFA]
                              hover:text-[#0F766E]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>

                        </div>

                        {/* button */}

                        <button
                          type="submit"
                          disabled={
                            loading ||
                            !password.trim()
                          }
                          className="
                            group
                            relative
                            mt-4
                            h-13
                            w-full
                            overflow-hidden
                            rounded-[18px]
                            bg-gradient-to-r
                            from-[#134E4A]
                            via-[#0F766E]
                            to-[#16857C]
                            text-sm
                            font-bold
                            text-white
                            shadow-[0_12px_30px_rgba(15,118,110,0.20)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-[0_16px_35px_rgba(15,118,110,0.25)]
                            active:scale-[0.985]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            disabled:hover:translate-y-0
                          "
                        >

                          {/* shine */}

                          <span
                            aria-hidden="true"
                            className="
                              absolute
                              inset-y-0
                              -left-20
                              w-20
                              skew-x-[-20deg]
                              bg-white/15
                              transition-all
                              duration-700
                              group-hover:left-[120%]
                            "
                          />

                          <span className="relative">
                            {loading
                              ? 'Memeriksa...'
                              : 'Masuk'}
                          </span>

                        </button>

                      </form>

                      {/* security */}

                      <div
                        className="
                          mt-6
                          flex
                          items-center
                          justify-center
                          gap-2
                          text-[10px]
                          font-medium
                          text-[#9AA29E]
                        "
                      >
                        <div
                          className="
                            flex
                            h-5
                            w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-[#E9F6F3]
                          "
                        >
                          <ShieldCheck
                            className="
                              h-3
                              w-3
                              text-[#0F766E]
                            "
                          />
                        </div>

                        <span>
                          Akses aman dan terenkripsi
                        </span>
                      </div>

                    </div>
                  )}

                </div>
              </section>

              {/* footer */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[10px]
                  font-medium
                  text-[#9AA29E]
                "
              >
                <span>KP2KP Majenang</span>

                <span className="h-1 w-1 rounded-full bg-[#D9B83F]" />

                <span>KAS</span>
              </div>

            </div>

          </div>

        </div>
      </div>

    </main>
  );
}
