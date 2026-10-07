```tsx
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
  // LOAD USER UNTUK LAYER 1
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
    if (user.roles.includes('BENDAHARA')) {
      return 'Bendahara';
    }

    if (user.roles.includes('SUPER ADMIN')) {
      return 'Super Admin';
    }

    if (user.roles.includes('USER')) {
      return 'Pengguna';
    }

    return user.roles[0] || 'Pengguna';
  }

  // ============================================================
  // PILIH USER
  // ============================================================

  function selectUser(user: LoginUser) {
    setSelectedUser(user);
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
  }

  // ============================================================
  // KEMBALI KE LAYER 1
  // ============================================================

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

      // Login berhasil
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
  // RENDER
  // ============================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFF9E8] text-[#183B38]">

      {/* ========================================================
          BACKGROUND AMBIENCE
          ======================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-40
          -right-40
          h-96
          w-96
          rounded-full
          bg-[#F7E7A8]/45
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-48
          -left-48
          h-[28rem]
          w-[28rem]
          rounded-full
          bg-[#D9B83F]/10
          blur-3xl
        "
      />

      {/* ========================================================
          MAIN CONTAINER
          ======================================================== */}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">

        <div className="w-full max-w-md">

          {/* ======================================================
              BRAND
              ====================================================== */}

          <div className="mb-7 text-center sm:mb-8">

            <div className="mb-4 inline-flex items-center justify-center">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#134E4A]
                  text-sm
                  font-black
                  text-[#F7E7A8]
                  shadow-lg
                  shadow-[#134E4A]/10
                "
              >
                KP
              </div>
            </div>

            <h1
              className="
                text-xl
                font-black
                tracking-[-0.02em]
                text-[#134E4A]
              "
            >
              KAS KP2KP
            </h1>

            <p className="mt-0.5 text-sm font-medium text-[#7B817D]">
              Majenang
            </p>
          </div>

          {/* ======================================================
              LOGIN CARD
              ====================================================== */}

          <section
            className="
              rounded-[28px]
              border
              border-[#E9E4CF]
              bg-white
              p-5
              shadow-[0_20px_60px_rgba(19,78,74,0.08)]
              sm:p-7
            "
          >

            {/* ====================================================
                LAYER 1 — PILIH AKUN
                ==================================================== */}

            {!selectedUser && (
              <div
                key="account-selection"
                className="animate-login-in"
              >

                <div className="mb-6">
                  <h2
                    className="
                      text-xl
                      font-black
                      tracking-[-0.02em]
                      text-[#183B38]
                    "
                  >
                    Selamat datang
                  </h2>

                  <p className="mt-1 text-sm text-[#7B817D]">
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
                      bg-rose-50
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

                {/* LOADING USER */}

                {loadingUsers ? (
                  <div className="space-y-3">

                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="
                          h-[72px]
                          animate-pulse
                          rounded-2xl
                          bg-[#F8F8F5]
                        "
                      />
                    ))}

                  </div>
                ) : regularUsers.length > 0 ? (

                  /* USER LIST */

                  <div className="space-y-3">

                    {regularUsers.map((user) => (
                      <button
                        key={user.username}
                        type="button"
                        onClick={() => selectUser(user)}
                        className="
                          group
                          flex
                          w-full
                          items-center
                          gap-3.5
                          rounded-2xl
                          border
                          border-[#E9E4CF]
                          bg-white
                          p-3
                          text-left
                          transition-all
                          duration-200
                          hover:-translate-y-[1px]
                          hover:border-[#0F766E]
                          hover:bg-[#F0FDFA]
                          hover:shadow-md
                          active:scale-[0.99]
                        "
                      >

                        {/* AVATAR */}

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#F7E7A8]
                            text-xs
                            font-black
                            text-[#134E4A]
                          "
                        >
                          {getInitials(user.nama)}
                        </div>

                        {/* USER INFO */}

                        <div className="min-w-0 flex-1">

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
                              mt-0.5
                              text-xs
                              font-medium
                              text-[#7B817D]
                            "
                          >
                            {getPrimaryRole(user)}
                          </div>

                        </div>

                        {/* ARROW */}

                        <ArrowRight
                          className="
                            h-4
                            w-4
                            shrink-0
                            text-[#B8BCB7]
                            transition-all
                            duration-200
                            group-hover:translate-x-1
                            group-hover:text-[#0F766E]
                          "
                        />

                      </button>
                    ))}

                  </div>

                ) : (

                  /* EMPTY STATE */

                  <div
                    className="
                      rounded-2xl
                      border
                      border-[#E9E4CF]
                      bg-[#FCFCF9]
                      px-4
                      py-6
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

                {/* ==================================================
                    SUPER ADMIN
                    ================================================== */}

                {superAdmins.length > 0 && (
                  <div className="pt-6">

                    <div className="mb-3 flex items-center gap-3">

                      <div className="h-px flex-1 bg-[#E9E4CF]" />

                      <span
                        className="
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.16em]
                          text-[#A1A6A2]
                        "
                      >
                        Akses khusus
                      </span>

                      <div className="h-px flex-1 bg-[#E9E4CF]" />

                    </div>

                    <div className="space-y-1">

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
                            gap-1.5
                            rounded-xl
                            px-3
                            py-2
                            text-xs
                            font-bold
                            text-[#0F766E]
                            transition-colors
                            hover:bg-[#F0FDFA]
                            hover:text-[#134E4A]
                          "
                        >
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
                  </div>
                )}

              </div>
            )}

            {/* ======================================================
                LAYER 2 — PASSWORD
                ====================================================== */}

            {selectedUser && (
              <div
                key="password"
                className="animate-login-in"
              >

                {/* BACK */}

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

                {/* SELECTED USER */}

                <div className="mb-7 text-center">

                  <div
                    className="
                      mx-auto
                      mb-3
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#F7E7A8]
                      text-sm
                      font-black
                      text-[#134E4A]
                    "
                  >
                    {getInitials(selectedUser.nama)}
                  </div>

                  <h2
                    className="
                      text-lg
                      font-black
                      tracking-[-0.01em]
                      text-[#183B38]
                    "
                  >
                    {selectedUser.nama}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-[#7B817D]">
                    {getPrimaryRole(selectedUser)}
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
                      bg-rose-50
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

                {/* PASSWORD FORM */}

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
                    Masukkan kata sandi
                  </label>

                  <div className="relative">

                    <Lock
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        left-3.5
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
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        if (errorMessage) {
                          setErrorMessage('');
                        }
                      }}
                      placeholder="Kata sandi"
                      required
                      autoFocus
                      autoComplete="current-password"
                      disabled={loading}
                      className="
                        h-12
                        w-full
                        rounded-2xl
                        border
                        border-[#E9E4CF]
                        bg-[#FCFCF9]
                        pl-10
                        pr-11
                        text-sm
                        text-[#183B38]
                        outline-none
                        transition-all
                        placeholder:text-[#A5AAA7]
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
                        right-2
                        top-1/2
                        flex
                        h-8
                        w-8
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

                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    disabled={loading || !password.trim()}
                    className="
                      mt-4
                      h-12
                      w-full
                      rounded-2xl
                      bg-[#0F766E]
                      text-sm
                      font-bold
                      tracking-wide
                      text-white
                      shadow-lg
                      shadow-[#0F766E]/15
                      transition-all
                      duration-200
                      hover:bg-[#0B625C]
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {loading ? 'Memeriksa...' : 'Masuk'}
                  </button>

                </form>

                {/* SECURITY */}

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    text-[10px]
                    font-medium
                    text-[#9AA29E]
                  "
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>Akses aman dan terenkripsi</span>
                </div>

              </div>
            )}

          </section>

          {/* FOOTER */}

          <div className="mt-5 text-center text-[10px] font-medium text-[#9AA29E]">
            KAS KP2KP · Majenang
          </div>

        </div>
      </div>

      {/* ==========================================================
          ANIMATION
          ========================================================== */}

      <style jsx global>{`
        @keyframes loginFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-login-in {
          animation: loginFadeIn 220ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-login-in {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
```
