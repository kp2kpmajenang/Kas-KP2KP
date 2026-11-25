'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Download, LogOut, ShieldCheck } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';

interface AkunTabProps {
  currentUser: {
    username: string;
    nama: string;
    roles: string[];
  } | null;
  loggingOut: boolean;
  onOpenInstallGuide: () => void;
  onRequestLogout: () => void;
}

export default function AkunTab({
  currentUser,
  loggingOut,
  onOpenInstallGuide,
  onRequestLogout,
}: AkunTabProps) {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="space-y-4">
      <div className="px-0.5">
        <h1 className="text-[19px] font-bold leading-tight text-[#143632]">
          Akun Saya
        </h1>
        <p className="mt-0.5 text-[11.5px] text-[#4E6661]">
          Informasi profil dan pengaturan sesi aplikasi
        </p>
      </div>

      {/* PROFILE CARD (.kas-glass-hero) */}
      <section className="kas-glass-hero relative overflow-hidden rounded-[24px] p-5 text-white">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            name={currentUser?.nama || currentUser?.username || 'KP'}
            size="lg"
          />

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-white/75">
              Pegawai KP2KP Majenang
            </div>
            <div className="truncate text-[17px] font-bold leading-snug text-white">
              {currentUser?.nama || '-'}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-white/75">
              NIP / ID: {currentUser?.username || '-'}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {currentUser?.roles?.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-white/20 bg-white/12 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#FFF0A8]"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-white/75">
            <ShieldCheck className="h-3.5 w-3.5 text-[#8EF0C0]" />
            <span>Sesi terenkripsi & aman</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-[#8EF0C0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8EF0C0]" />
            Aktif
          </span>
        </div>
      </section>

      {/* MENU AKSI (.kas-glass-soft) */}
      <section className="kas-glass-soft overflow-hidden rounded-[22px] divide-y divide-[#143632]/8">
        <button
          type="button"
          onClick={onOpenInstallGuide}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/50"
        >
          <div className="flex items-center gap-3">
            <div className="kas-glass-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9A7B1C]">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#143632]">
                Pasang Aplikasi (PWA)
              </div>
              <div className="mt-0.5 text-[11px] text-[#4E6661]">
                Tambahkan Kas KP2KP ke layar utama HP
              </div>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-[#4E6661]" />
        </button>

        <button
          type="button"
          onClick={onRequestLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#9F3542]/5 disabled:cursor-wait disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div className="kas-glass-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9F3542]">
              <LogOut className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#9F3542]">
                {loggingOut ? 'Keluar dari aplikasi...' : 'Keluar Akun'}
              </div>
              <div className="mt-0.5 text-[11px] text-[#9F3542]/75">
                Akhiri sesi akun saat ini
              </div>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-[#9F3542]/70" />
        </button>
      </section>

      {/* COPYRIGHT */}
      <div className="pt-2 text-center">
        <div className="text-[11.5px] font-semibold text-[#143632]">
          © {currentYear} · KAS KP2KP Majenang
        </div>
        <div className="mt-0.5 text-[11px] text-[#4E6661]">
          Sistem Pengelolaan Keuangan Internal
        </div>
      </div>
    </div>
  );
}
