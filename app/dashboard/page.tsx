'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FinanceCard from '@/components/FinanceCard';
import TransactionCard from '@/components/TransactionCard';
import TransactionTable from '@/components/TransactionTable';
import BottomNavigation, { NavTab } from '@/components/BottomNavigation';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import Toast, { ToastData } from '@/components/Toast';
import { formatRupiah } from '@/lib/utils/format';
import { formatTanggalLokal } from '@/lib/utils/date';
import { TransaksiItem } from '@/lib/finance/transactions';
import { DashboardKasResult } from '@/lib/finance/dashboard';
import { AuditLogEntry } from '@/lib/audit/audit-log';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Shield,
  User as UserIcon,
  LogOut,
  Download,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Auth State
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    nama: string;
    roles: string[];
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');

  // Period State
  const [periods, setPeriods] = useState<{ periode: string; label: string }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Finance State
  const [dashboardData, setDashboardData] = useState<DashboardKasResult | null>(null);
  const [transactions, setTransactions] = useState<TransaksiItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Filter State
  const [searchTx, setSearchTx] = useState('');
  const [filterJenisTx, setFilterJenisTx] = useState<'SEMUA' | 'MASUK' | 'KELUAR'>('SEMUA');

  // Admin Data State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterAksi, setAuditFilterAksi] = useState('SEMUA');

  // Modal States
  const [modalTxOpen, setModalTxOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    tanggal: '', // diisi saat modal dibuka (di event handler, bukan prerender)
    jenis: 'MASUK' as 'MASUK' | 'KELUAR',
    uraian: '',
    nominal: '',
    keterangan: '',
  });

  const [modalSaldoOpen, setModalSaldoOpen] = useState(false);
  const [saldoForm, setSaldoForm] = useState({
    periode: '',
    saldoAwal: '',
    keterangan: '',
  });

  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    nama: '',
    username: '',
    password: '',
    role: 'BENDAHARA',
    status: 'AKTIF',
  });

  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<ToastData | null>(null);
  function showToast(type: 'success' | 'error' | 'info', message: string, title?: string) {
    setToast({ type, message, title });
    setTimeout(() => setToast(null), 3500);
  }

  // 1. Check Authentication on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!res.ok || !data.success) {
          router.push('/login');
          return;
        }
        setCurrentUser(data.data);
      } catch {
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();

    // Restore tab dari deep-link (e.g. /transaksi -> /dashboard)
    const pendingTab = sessionStorage.getItem('dashboard_tab') as NavTab | null;
    if (pendingTab) {
      setActiveTab(pendingTab);
      sessionStorage.removeItem('dashboard_tab');
    }
  }, [router]);

  // 2. Load Periods Dropdown
  useEffect(() => {
    if (!currentUser) return;
    async function loadPeriods() {
      try {
        const res = await fetch('/api/periods');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPeriods(data.data);
          const now = new Date();
          const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const found = data.data.some((item: any) => item.periode === thisMonth);
          setSelectedPeriod(found ? thisMonth : data.data[0].periode);
        }
      } catch (err) {
        console.error('Error loading periods:', err);
      }
    }
    loadPeriods();
  }, [currentUser]);

  // 3. Load Dashboard & Transactions Data
  const loadPeriodData = useCallback(async (period: string) => {
    if (!period) return;
    setDataLoading(true);
    try {
      const [dashRes, txRes] = await Promise.all([
        fetch(`/api/dashboard?periode=${encodeURIComponent(period)}`),
        fetch(`/api/transactions?periode=${encodeURIComponent(period)}`),
      ]);

      const dashData = await dashRes.json();
      const txData = await txRes.json();

      if (dashData.success) {
        setDashboardData(dashData.data);
      }
      if (txData.success) {
        setTransactions(txData.data || []);
      }
    } catch (err) {
      console.error('Error loading period data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadPeriodData(selectedPeriod);
    }
  }, [selectedPeriod, loadPeriodData]);

  // 4. Load Admin Data (If Super Admin and Kelola Tab)
  const isSuperAdmin = currentUser?.roles?.includes('SUPER ADMIN') || false;
  const isBendahara = currentUser?.roles?.includes('BENDAHARA') || false;

  useEffect(() => {
    if (activeTab === 'kelola' && isSuperAdmin) {
      setAdminLoading(true);
      Promise.all([fetch('/api/users'), fetch('/api/audit-log')])
        .then(async ([userRes, auditRes]) => {
          const uData = await userRes.json();
          const aData = await auditRes.json();
          if (uData.success) setUsersList(uData.data || []);
          if (aData.success) setAuditLogs(aData.data || []);
        })
        .catch(console.error)
        .finally(() => setAdminLoading(false));
    }
  }, [activeTab, isSuperAdmin]);

  // Handlers for Transactions
  function handleOpenTxModal(type: 'MASUK' | 'KELUAR') {
    setTxForm({
      tanggal: formatTanggalLokal(new Date()),
      jenis: type,
      uraian: '',
      nominal: '',
      keterangan: '',
    });
    setModalTxOpen(true);
  }

  async function handleSaveTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!txForm.uraian || !txForm.nominal || Number(txForm.nominal) <= 0) {
      showToast('error', 'Lengkapi uraian dan nominal lebih dari 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: txForm.tanggal,
          jenis: txForm.jenis,
          uraian: txForm.uraian,
          nominal: Number(txForm.nominal),
          keterangan: txForm.keterangan,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast('error', result.message || 'Gagal menyimpan transaksi.');
        return;
      }

      showToast('success', 'Transaksi kas berhasil dicatat.');
      setModalTxOpen(false);
      loadPeriodData(selectedPeriod);
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelTransaction(id: string) {
    if (!confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) return;
    try {
      const res = await fetch(`/api/transactions/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast('error', result.message || 'Gagal membatalkan transaksi.');
        return;
      }
      showToast('success', 'Transaksi berhasil dibatalkan.');
      loadPeriodData(selectedPeriod);
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    }
  }

  // Handlers for Saldo Awal
  async function handleOpenSaldoModal() {
    if (!selectedPeriod) return;
    try {
      const res = await fetch(`/api/balance/opening?periode=${encodeURIComponent(selectedPeriod)}`);
      const data = await res.json();
      if (data.success) {
        setSaldoForm({
          periode: selectedPeriod,
          saldoAwal: String(data.data.saldoAwal || 0),
          keterangan: data.data.keterangan || '',
        });
        setModalSaldoOpen(true);
      }
    } catch {
      showToast('error', 'Gagal memuat saldo awal.');
    }
  }

  async function handleSaveSaldoAwal(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/balance/opening', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periode: saldoForm.periode,
          saldoAwal: Number(saldoForm.saldoAwal),
          keterangan: saldoForm.keterangan,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast('error', result.message || 'Gagal mengubah saldo awal.');
        return;
      }
      showToast('success', 'Saldo awal berhasil diperbarui.');
      setModalSaldoOpen(false);
      loadPeriodData(selectedPeriod);
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  }

  // Handlers for Add User
  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: userForm.nama,
          username: userForm.username,
          password: userForm.password,
          roles: [userForm.role],
          status: userForm.status,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        showToast('error', result.message || 'Gagal menambahkan user.');
        return;
      }
      showToast('success', 'User berhasil ditambahkan.');
      setModalUserOpen(false);
      // Reload users
      const refreshUsers = await fetch('/api/users').then((r) => r.json());
      if (refreshUsers.success) setUsersList(refreshUsers.data || []);
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  }

  // Logout handler
  async function handleLogout() {
    if (!confirm('Keluar dari aplikasi kas?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  }

  if (authLoading) {
    return <Loading message="Menyiapkan akun Anda..." className="min-h-screen" />;
  }

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    const kw = searchTx.toLowerCase();
    const matchKw =
      !kw || tx.uraian.toLowerCase().includes(kw) || tx.idTransaksi.toLowerCase().includes(kw);
    const matchJenis = filterJenisTx === 'SEMUA' || tx.jenis === filterJenisTx;
    return matchKw && matchJenis;
  });

  const selectedPeriodLabel =
    periods.find((p) => p.periode === selectedPeriod)?.label || selectedPeriod || 'Bulan Aktif';

  const totalMasuk = dashboardData?.totalMasuk || 0;
  const totalKeluar = dashboardData?.totalKeluar || 0;
  const netFlow = totalMasuk - totalKeluar;
  const totalArus = totalMasuk + totalKeluar;
  const persenMasuk = totalArus > 0 ? ((totalMasuk / totalArus) * 100).toFixed(1) : '0';
  const persenKeluar = totalArus > 0 ? ((totalKeluar / totalArus) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <Header
        userName={currentUser?.nama || ''}
        roles={currentUser?.roles || []}
        periods={periods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-5">
        {/* ================= TAB 1: BERANDA ================= */}
        {activeTab === 'beranda' && (
          <div className="space-y-4">
            {/* Virtual Finance Card */}
            <FinanceCard
              saldoAkhir={dashboardData?.saldoAkhir || 0}
              periodeLabel={selectedPeriodLabel}
              isBendahara={isBendahara}
              onTambahMasuk={() => handleOpenTxModal('MASUK')}
              onTambahKeluar={() => handleOpenTxModal('KELUAR')}
              onEditSaldoAwal={handleOpenSaldoModal}
            />

            {/* Income & Expense Twin Widgets */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold">Pemasukan</span>
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-600 tabular-nums">
                  {formatRupiah(totalMasuk)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {persenMasuk}% arus kas
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-bold">Pengeluaran</span>
                </div>
                <div className="text-base sm:text-lg font-black text-rose-600 tabular-nums">
                  {formatRupiah(totalKeluar)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {persenKeluar}% arus kas
                </div>
              </div>
            </div>

            {/* Mutasi Terakhir Header & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Mutasi Kas Terakhir
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {filteredTransactions.length} transaksi pada {selectedPeriodLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('transaksi')}
                  className="text-xs font-bold text-blue-900 hover:text-blue-700"
                >
                  Lihat Semua
                </button>
              </div>

              {/* Transactions Mobile Feed & Desktop Table */}
              {dataLoading ? (
                <Loading message="Memuat mutasi kas..." />
              ) : filteredTransactions.length === 0 ? (
                <EmptyState
                  title="Belum ada transaksi"
                  description="Tidak ada catatan mutasi kas pada periode ini."
                />
              ) : (
                <>
                  <div className="space-y-2.5 sm:hidden">
                    {filteredTransactions.slice(0, 5).map((tx) => (
                      <TransactionCard
                        key={tx.idTransaksi}
                        transaction={tx}
                        isBendahara={isBendahara}
                        onCancel={handleCancelTransaction}
                      />
                    ))}
                  </div>

                  <div className="hidden sm:block">
                    <TransactionTable
                      transactions={filteredTransactions.slice(0, 5)}
                      isBendahara={isBendahara}
                      onCancel={handleCancelTransaction}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: TRANSAKSI (MUTASI LENGKAP) ================= */}
        {activeTab === 'transaksi' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Semua Mutasi Kas</h3>
                  <p className="text-[11px] text-slate-400">
                    Periode {selectedPeriodLabel} ({filteredTransactions.length} data)
                  </p>
                </div>

                {isBendahara && (
                  <button
                    type="button"
                    onClick={() => handleOpenTxModal('MASUK')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Transaksi</span>
                  </button>
                )}
              </div>

              {/* Search & Filter Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari uraian atau ID..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
                />

                <select
                  value={filterJenisTx}
                  onChange={(e: any) => setFilterJenisTx(e.target.value)}
                  className="h-9 px-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="SEMUA">Semua Arus</option>
                  <option value="MASUK">Masuk (↙)</option>
                  <option value="KELUAR">Keluar (↗)</option>
                </select>
              </div>

              {/* Feed & Table */}
              {dataLoading ? (
                <Loading message="Memuat seluruh mutasi..." />
              ) : filteredTransactions.length === 0 ? (
                <EmptyState
                  title="Tidak ada transaksi yang cocok"
                  description="Coba ubah kata kunci pencarian atau filter arus kas."
                />
              ) : (
                <>
                  <div className="space-y-2.5 sm:hidden">
                    {filteredTransactions.map((tx) => (
                      <TransactionCard
                        key={tx.idTransaksi}
                        transaction={tx}
                        isBendahara={isBendahara}
                        onCancel={handleCancelTransaction}
                      />
                    ))}
                  </div>

                  <div className="hidden sm:block">
                    <TransactionTable
                      transactions={filteredTransactions}
                      isBendahara={isBendahara}
                      onCancel={handleCancelTransaction}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: ANALISIS / LAPORAN ================= */}
        {activeTab === 'analisis' && (
          <div className="space-y-4">
            {/* Net Cash Flow Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs text-center">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Arus Kas Bersih (Net Cash Flow)
              </div>
              <div
                className={`text-2xl sm:text-3xl font-black tabular-nums my-1 ${
                  netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatRupiah(netFlow)}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {netFlow >= 0 ? 'Surplus kas periode berjalan' : 'Defisit kas periode berjalan'}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Saldo Awal</div>
                <div className="text-sm font-black text-slate-900 mt-1 tabular-nums">
                  {formatRupiah(dashboardData?.saldoAwal || 0)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Saldo Akhir</div>
                <div className="text-sm font-black text-blue-900 mt-1 tabular-nums">
                  {formatRupiah(dashboardData?.saldoAkhir || 0)}
                </div>
              </div>
            </div>

            {/* Ratio Analytics Box */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Proporsi Arus Kas
              </h3>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Pemasukan ({persenMasuk}%)</span>
                    <span className="text-emerald-600">{formatRupiah(totalMasuk)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(persenMasuk))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Pengeluaran ({persenKeluar}%)</span>
                    <span className="text-rose-600">{formatRupiah(totalKeluar)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Number(persenKeluar))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: KELOLA (SUPER ADMIN ONLY) ================= */}
        {activeTab === 'kelola' && isSuperAdmin && (
          <div className="space-y-4">
            {/* User Management Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Manajemen Pengguna</h3>
                  <p className="text-[11px] text-slate-400">Kelola akses & staf kantor</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalUserOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-800"
                >
                  + Tambah User
                </button>
              </div>

              {adminLoading ? (
                <Loading message="Memuat data pengguna..." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <div key={u.username} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{u.nama}</div>
                        <div className="text-[11px] text-slate-400">{u.username}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-900 border border-blue-200">
                          {u.roles?.join(', ')}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audit Log Section */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Audit Trail Aktivitas</h3>
                <p className="text-[11px] text-slate-400">Catatan riwayat sistem kas</p>
              </div>

              <div className="divide-y divide-slate-100">
                {auditLogs.slice(0, 15).map((log) => (
                  <div key={log.idLog} className="py-2.5 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>{log.waktu}</span>
                      <span className="font-bold text-slate-600">{log.aksi}</span>
                    </div>
                    <div className="font-semibold text-slate-800">{log.detail}</div>
                    <div className="text-[10px] text-slate-400">Oleh: {log.nama || log.username || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: AKUN ================= */}
        {activeTab === 'akun' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center font-black text-sm">
                KP
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-slate-900 truncate">
                  {currentUser?.nama || '-'}
                </div>
                <div className="text-xs text-slate-500">{currentUser?.username || '-'}</div>
                <div className="mt-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {currentUser?.roles?.join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden divide-y divide-slate-100">
              <button
                type="button"
                onClick={() => {
                  alert(
                    "Untuk memasang aplikasi di layar HP:\nTekan menu browser (Bagikan/Share), lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen)."
                  );
                }}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-blue-900" />
                  <span>Pasang Aplikasi di Layar Utama (PWA)</span>
                </div>
                <span className="text-slate-400">›</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar Akun (Logout)</span>
                </div>
                <span className="text-rose-400">›</span>
              </button>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 leading-relaxed">
              KAS KP2KP MAJENANG · Next.js v16 PWA<br />
              Sistem Pengelolaan Keuangan Internal
            </div>
          </div>
        )}
      </main>

      {/* ================= BOTTOM NAVIGATION ================= */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isBendahara={isBendahara}
        isSuperAdmin={isSuperAdmin}
        onQuickAdd={() => handleOpenTxModal('MASUK')}
      />

      {/* ================= MODAL TRANSAKSI ================= */}
      <Modal
        isOpen={modalTxOpen}
        onClose={() => setModalTxOpen(false)}
        title="Catat Transaksi Kas"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalTxOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              form="formTransaksi"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </>
        }
      >
        <form id="formTransaksi" onSubmit={handleSaveTransaction} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={txForm.tanggal}
              onChange={(e) => setTxForm({ ...txForm, tanggal: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Jenis Arus Kas
            </label>
            <select
              value={txForm.jenis}
              onChange={(e: any) => setTxForm({ ...txForm, jenis: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            >
              <option value="MASUK">↙ Uang Masuk (Penerimaan)</option>
              <option value="KELUAR">↗ Uang Keluar (Pengeluaran)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Uraian Transaksi
            </label>
            <input
              type="text"
              placeholder="Contoh: Belanja ATK Kantor"
              value={txForm.uraian}
              onChange={(e) => setTxForm({ ...txForm, uraian: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              placeholder="0"
              min="1"
              value={txForm.nominal}
              onChange={(e) => setTxForm({ ...txForm, nominal: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Keterangan Tambahan
            </label>
            <textarea
              placeholder="Catatan nomor nota / kuitansi (opsional)..."
              value={txForm.keterangan}
              onChange={(e) => setTxForm({ ...txForm, keterangan: e.target.value })}
              className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* ================= MODAL SALDO AWAL ================= */}
      <Modal
        isOpen={modalSaldoOpen}
        onClose={() => setModalSaldoOpen(false)}
        title="Kelola Saldo Awal"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalSaldoOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              form="formSaldo"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </>
        }
      >
        <form id="formSaldo" onSubmit={handleSaveSaldoAwal} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Periode
            </label>
            <input
              type="text"
              value={saldoForm.periode}
              readOnly
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Saldo Awal (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={saldoForm.saldoAwal}
              onChange={(e) => setSaldoForm({ ...saldoForm, saldoAwal: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Keterangan
            </label>
            <textarea
              placeholder="Dasar penetapan saldo awal..."
              value={saldoForm.keterangan}
              onChange={(e) => setSaldoForm({ ...saldoForm, keterangan: e.target.value })}
              className="w-full h-20 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* ================= MODAL TAMBAH USER ================= */}
      <Modal
        isOpen={modalUserOpen}
        onClose={() => setModalUserOpen(false)}
        title="Tambah Pengguna Baru"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalUserOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              form="formUser"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </>
        }
      >
        <form id="formUser" onSubmit={handleSaveUser} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Nama pegawai"
              value={userForm.nama}
              onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Username (NIP Pendek)
            </label>
            <input
              type="text"
              placeholder="NIP Pendek"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              placeholder="Kata sandi"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Peran Akses
            </label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-900 outline-none"
            >
              <option value="BENDAHARA">BENDAHARA</option>
              <option value="USER">USER</option>
              <option value="SUPER ADMIN">SUPER ADMIN</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
