'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, ShieldCheck, X } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import RoleBadge from '@/components/RoleBadge';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { AuditLogEntry } from '@/lib/audit/audit-log';

interface UserRecord {
  username: string;
  nama: string;
  roles?: string[];
  status?: string;
}

interface KelolaTabProps {
  usersList: UserRecord[];
  auditLogs: AuditLogEntry[];
  adminLoading: boolean;
  onOpenUserModal: () => void;
}

export default function KelolaTab({
  usersList,
  auditLogs,
  adminLoading,
  onOpenUserModal,
}: KelolaTabProps) {
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterAksi, setAuditFilterAksi] = useState('SEMUA');
  const [visibleLogs, setVisibleLogs] = useState(15);

  const uniqueAksi = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((log) => {
      if (log.aksi) set.add(log.aksi);
    });
    return Array.from(set);
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const kw = auditSearch.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchAksi =
        auditFilterAksi === 'SEMUA' || log.aksi === auditFilterAksi;
      const matchKw =
        !kw ||
        (log.detail || '').toLowerCase().includes(kw) ||
        (log.aksi || '').toLowerCase().includes(kw) ||
        (log.nama || '').toLowerCase().includes(kw) ||
        (log.username || '').toLowerCase().includes(kw);
      return matchAksi && matchKw;
    });
  }, [auditLogs, auditSearch, auditFilterAksi]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-[19px] font-bold leading-tight text-[#143632]">
            Kelola Sistem
          </h1>
          <p className="mt-0.5 text-[11.5px] text-[#4E6661]">
            Manajemen pengguna & catatan audit aktivitas
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenUserModal}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#134E4A] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(19,78,74,0.34)] transition-all hover:bg-[#0F766E] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah User</span>
        </button>
      </div>

      {/* 1. MANAJEMEN PENGGUNA (.kas-glass-soft) */}
      <section className="kas-glass-soft rounded-[22px] p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-[13.5px] font-bold text-[#143632]">
              Daftar Pengguna
            </h2>
            <p className="text-[11px] text-[#4E6661]">
              {usersList.length} akun terdaftar
            </p>
          </div>
          <div className="kas-glass-orb flex h-8 w-8 items-center justify-center rounded-full text-[#0F766E]">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>

        {adminLoading ? (
          <Loading message="Memuat data pengguna..." />
        ) : usersList.length === 0 ? (
          <EmptyState
            title="Belum ada pengguna"
            description="Tambahkan pengguna baru untuk mulai mengelola akses."
          />
        ) : (
          <div className="divide-y divide-[#143632]/8">
            {usersList.map((u) => (
              <div
                key={u.username}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar name={u.nama || u.username} size="sm" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[#143632]">
                      {u.nama}
                    </div>
                    <div className="truncate text-[11px] text-[#4E6661]">
                      {u.username}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <RoleBadge roles={u.roles || []} />
                  <span
                    className={`text-[10.5px] font-semibold ${
                      u.status === 'AKTIF'
                        ? 'text-[#0F766E]'
                        : 'text-[#4E6661]'
                    }`}
                  >
                    {u.status || 'AKTIF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. AUDIT TRAIL AKTIVITAS (.kas-glass-soft) */}
      <section className="kas-glass-soft rounded-[22px] p-4 space-y-3">
        <div>
          <h2 className="text-[13.5px] font-bold text-[#143632]">
            Audit Trail Aktivitas
          </h2>
          <p className="text-[11px] text-[#4E6661]">
            Menampilkan {Math.min(visibleLogs, filteredLogs.length)} dari{' '}
            {filteredLogs.length} catatan sistem
          </p>
        </div>

        {/* Filter Audit */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="kas-glass-clear relative flex flex-1 items-center rounded-[14px] px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#4E6661]" />
            <input
              type="text"
              placeholder="Cari aktivitas atau nama..."
              value={auditSearch}
              onChange={(e) => {
                setAuditSearch(e.target.value);
                setVisibleLogs(15);
              }}
              className="h-9 w-full bg-transparent px-2 text-[12.5px] text-[#143632] outline-none placeholder:text-[#4E6661]/60"
            />
            {auditSearch && (
              <button
                type="button"
                onClick={() => setAuditSearch('')}
                className="p-0.5 text-[#4E6661] hover:text-[#143632]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <select
            value={auditFilterAksi}
            onChange={(e) => {
              setAuditFilterAksi(e.target.value);
              setVisibleLogs(15);
            }}
            aria-label="Filter aksi audit"
            className="kas-glass-clear h-9 rounded-[14px] px-3 text-[12px] font-semibold text-[#143632] outline-none"
          >
            <option value="SEMUA">Semua Aksi</option>
            {uniqueAksi.map((aksi) => (
              <option key={aksi} value={aksi}>
                {aksi}
              </option>
            ))}
          </select>
        </div>

        {adminLoading ? (
          <Loading message="Memuat audit log..." />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="Tidak ada catatan audit"
            description="Coba ubah filter atau kata kunci pencarian."
          />
        ) : (
          <>
            <div className="divide-y divide-[#143632]/8">
              {filteredLogs.slice(0, visibleLogs).map((log) => (
                <div key={log.idLog} className="py-2.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#4E6661]">{log.waktu}</span>
                    <span className="rounded-full bg-[#0F766E]/10 px-2 py-0.5 text-[10px] font-bold text-[#0F766E]">
                      {log.aksi}
                    </span>
                  </div>

                  <div className="mt-1 text-[12.5px] font-semibold text-[#143632]">
                    {log.detail}
                  </div>

                  <div className="mt-0.5 text-[11px] text-[#4E6661]">
                    Oleh: {log.nama || log.username || '-'}
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length > visibleLogs && (
              <button
                type="button"
                onClick={() => setVisibleLogs((prev) => prev + 15)}
                className="kas-glass-clear w-full rounded-[14px] py-2 text-[12px] font-semibold text-[#0F766E] transition-colors hover:bg-white/70"
              >
                Tampilkan lebih banyak ({filteredLogs.length - visibleLogs}{' '}
                tersisa)
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
