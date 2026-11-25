'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNavigation, { NavTab } from '@/components/BottomNavigation';
import Loading from '@/components/Loading';
import Toast, { ToastData } from '@/components/Toast';
import SilkBackground from '@/components/SilkBackground';
import BerandaTab from '@/components/dashboard/BerandaTab';
import TransaksiTab from '@/components/dashboard/TransaksiTab';
import AnalisisTab, { MonthlyCashData } from '@/components/dashboard/AnalisisTab';
import KelolaTab from '@/components/dashboard/KelolaTab';
import AkunTab from '@/components/dashboard/AkunTab';
import DashboardModals, {
  SaldoFormState,
  TxFormState,
  UserFormState,
} from '@/components/dashboard/DashboardModals';
import { formatTanggalLokal } from '@/lib/utils/date';
import { TransaksiItem } from '@/lib/finance/transactions';
import { DashboardKasResult } from '@/lib/finance/dashboard';
import { AuditLogEntry } from '@/lib/audit/audit-log';

const NAMA_BULAN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export default function DashboardPage() {
  const router = useRouter();

  // Auth State
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    nama: string;
    roles: string[];
  } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');

  // Period State
  const [periods, setPeriods] = useState<{ periode: string; label: string }[]>(
    []
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Finance State
  const [dashboardData, setDashboardData] =
    useState<DashboardKasResult | null>(null);
  const [transactions, setTransactions] = useState<TransaksiItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Annual Analysis State
  const [annualCashData, setAnnualCashData] = useState<MonthlyCashData[]>([]);
  const [annualLoading, setAnnualLoading] = useState(false);

  // Filter State (khusus Tab Mutasi)
  const [searchTx, setSearchTx] = useState('');
  const [filterJenisTx, setFilterJenisTx] = useState<
    'SEMUA' | 'MASUK' | 'KELUAR'
  >('SEMUA');

  // Admin State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Modal States
  const [modalTxOpen, setModalTxOpen] = useState(false);
  const [txForm, setTxForm] = useState<TxFormState>({
    tanggal: '',
    jenis: 'MASUK',
    uraian: '',
    nominal: '',
    keterangan: '',
  });

  const [modalSaldoOpen, setModalSaldoOpen] = useState(false);
  const [saldoForm, setSaldoForm] = useState<SaldoFormState>({
    periode: '',
    saldoAwal: '',
    keterangan: '',
  });

  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>({
    nama: '',
    username: '',
    password: '',
    role: 'BENDAHARA',
    status: 'AKTIF',
  });

  const [cancelTarget, setCancelTarget] = useState<TransaksiItem | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState<ToastData | null>(null);

  function showToast(
    type: 'success' | 'error' | 'info',
    message: string,
    title?: string
  ) {
    setToast({ type, message, title });
    setTimeout(() => setToast(null), 3500);
  }

  // Auth Check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
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

    const pendingTab = sessionStorage.getItem('dashboard_tab') as NavTab | null;
    if (pendingTab) {
      setActiveTab(pendingTab);
      sessionStorage.removeItem('dashboard_tab');
    }
  }, [router]);

  // Load Periods
  useEffect(() => {
    if (!currentUser) return;

    async function loadPeriods() {
      try {
        const res = await fetch('/api/periods', { cache: 'no-store' });
        const data = await res.json();

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPeriods(data.data);

          const now = new Date();
          const currentPeriod = `${now.getFullYear()}-${String(
            now.getMonth() + 1
          ).padStart(2, '0')}`;

          const currentPeriodExists = data.data.some(
            (item: any) => item.periode === currentPeriod
          );

          setSelectedPeriod(
            currentPeriodExists ? currentPeriod : data.data[0].periode
          );
        }
      } catch (err) {
        console.error('Error loading periods:', err);
      }
    }

    loadPeriods();
  }, [currentUser]);

  // Load Current Period Data
  const loadPeriodData = useCallback(async (period: string) => {
    if (!period) return;
    setDataLoading(true);

    try {
      const [dashRes, txRes] = await Promise.all([
        fetch(`/api/dashboard?periode=${encodeURIComponent(period)}`, {
          cache: 'no-store',
        }),
        fetch(`/api/transactions?periode=${encodeURIComponent(period)}`, {
          cache: 'no-store',
        }),
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

  // Annual Analysis
  const selectedYear = (() => {
    const fallbackYear = new Date().getFullYear();
    if (!selectedPeriod) return fallbackYear;
    const year = Number(selectedPeriod.slice(0, 4));
    return Number.isFinite(year) && year >= 2000 && year <= 2100
      ? year
      : fallbackYear;
  })();

  const loadAnnualCashData = useCallback(async (year: number) => {
    setAnnualLoading(true);

    try {
      const monthRequests = Array.from({ length: 12 }, (_, index) => {
        const month = String(index + 1).padStart(2, '0');
        const periode = `${year}-${month}`;

        return fetch(`/api/transactions?periode=${encodeURIComponent(periode)}`, {
          cache: 'no-store',
        })
          .then(async (res) => {
            if (!res.ok) return { periode, transactions: [] };
            const result = await res.json();
            return {
              periode,
              transactions:
                result.success && Array.isArray(result.data) ? result.data : [],
            };
          })
          .catch(() => ({ periode, transactions: [] }));
      });

      const monthlyResults = await Promise.all(monthRequests);

      const result: MonthlyCashData[] = monthlyResults.map(
        (monthResult, index) => {
          let masuk = 0;
          let keluar = 0;

          monthResult.transactions.forEach((tx: any) => {
            if (tx?.status === 'BATAL') return;
            const nominal = Number(tx?.nominal) || 0;
            if (tx?.jenis === 'MASUK') masuk += nominal;
            if (tx?.jenis === 'KELUAR') keluar += nominal;
          });

          return {
            bulan: NAMA_BULAN[index],
            periode: monthResult.periode,
            masuk,
            keluar,
          };
        }
      );

      setAnnualCashData(result);
    } catch (error) {
      console.error('Error loading annual cash data:', error);
      setAnnualCashData([]);
    } finally {
      setAnnualLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'analisis' || !currentUser) return;
    loadAnnualCashData(selectedYear);
  }, [activeTab, currentUser, selectedYear, loadAnnualCashData]);

  // Roles
  const isSuperAdmin = currentUser?.roles?.includes('SUPER ADMIN') || false;
  const isBendahara = currentUser?.roles?.includes('BENDAHARA') || false;

  // Admin Data
  useEffect(() => {
    if (activeTab === 'kelola' && isSuperAdmin) {
      setAdminLoading(true);
      Promise.all([
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/audit-log', { cache: 'no-store' }),
      ])
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

  // Handlers
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

    if (!txForm.uraian.trim() || !txForm.nominal || Number(txForm.nominal) <= 0) {
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
          uraian: txForm.uraian.trim(),
          nominal: Number(txForm.nominal),
          keterangan: txForm.keterangan.trim(),
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
      if (activeTab === 'analisis') loadAnnualCashData(selectedYear);
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmCancelTransaction() {
    if (!cancelTarget) return;
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/transactions/${encodeURIComponent(cancelTarget.idTransaksi)}/cancel`,
        { method: 'POST' }
      );
      const result = await res.json();

      if (!res.ok || !result.success) {
        showToast('error', result.message || 'Gagal membatalkan transaksi.');
        return;
      }

      showToast('success', 'Transaksi berhasil dibatalkan.');
      setCancelTarget(null);
      loadPeriodData(selectedPeriod);
      if (activeTab === 'analisis') loadAnnualCashData(selectedYear);
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOpenSaldoModal() {
    if (!selectedPeriod) return;
    try {
      const res = await fetch(
        `/api/balance/opening?periode=${encodeURIComponent(selectedPeriod)}`,
        { cache: 'no-store' }
      );
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
          saldoAwal: Number(saldoForm.saldoAwal || 0),
          keterangan: saldoForm.keterangan.trim(),
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

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: userForm.nama.trim(),
          username: userForm.username.trim(),
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
      setUserForm({
        nama: '',
        username: '',
        password: '',
        role: 'BENDAHARA',
        status: 'AKTIF',
      });

      const refreshUsers = await fetch('/api/users', {
        cache: 'no-store',
      }).then((r) => r.json());
      if (refreshUsers.success) {
        setUsersList(refreshUsers.data || []);
      }
    } catch {
      showToast('error', 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.replace('/login');
    }
  }

  if (authLoading) {
    return (
      <div className="kas-silk-canvas relative flex min-h-screen items-center justify-center overflow-x-clip">
        <SilkBackground />
        <div className="relative z-10">
          <Loading message="Menyiapkan akun Anda..." />
        </div>
      </div>
    );
  }

  const selectedPeriodLabel =
    periods.find((p) => p.periode === selectedPeriod)?.label ||
    selectedPeriod ||
    'Bulan Aktif';

  return (
    <div className="kas-silk-canvas relative flex min-h-screen flex-col overflow-x-clip">
      <SilkBackground />

      {/* HEADER (z-40) */}
      <Header
        userName={currentUser?.nama || ''}
        roles={currentUser?.roles || []}
        periods={periods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* MAIN CONTENT (z-10) */}
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-5">
        {activeTab === 'beranda' && (
          <BerandaTab
            dashboardData={dashboardData}
            transactions={transactions}
            dataLoading={dataLoading}
            selectedPeriodLabel={selectedPeriodLabel}
            isBendahara={isBendahara}
            onOpenTxModal={handleOpenTxModal}
            onOpenSaldoModal={handleOpenSaldoModal}
            onCancelTransaction={setCancelTarget}
            onChangeTab={setActiveTab}
          />
        )}

        {activeTab === 'transaksi' && (
          <TransaksiTab
            transactions={transactions}
            dataLoading={dataLoading}
            selectedPeriodLabel={selectedPeriodLabel}
            searchTx={searchTx}
            onSearchChange={setSearchTx}
            filterJenisTx={filterJenisTx}
            onFilterJenisChange={setFilterJenisTx}
            isBendahara={isBendahara}
            onOpenTxModal={handleOpenTxModal}
            onCancelTransaction={setCancelTarget}
          />
        )}

        {activeTab === 'analisis' && (
          <AnalisisTab
            dashboardData={dashboardData}
            selectedPeriod={selectedPeriod}
            selectedPeriodLabel={selectedPeriodLabel}
            selectedYear={selectedYear}
            annualCashData={annualCashData}
            annualLoading={annualLoading}
          />
        )}

        {activeTab === 'kelola' && isSuperAdmin && (
          <KelolaTab
            usersList={usersList}
            auditLogs={auditLogs}
            adminLoading={adminLoading}
            onOpenUserModal={() => setModalUserOpen(true)}
          />
        )}

        {activeTab === 'akun' && (
          <AkunTab
            currentUser={currentUser}
            loggingOut={loggingOut}
            onOpenInstallGuide={() => setInstallModalOpen(true)}
            onRequestLogout={() => setLogoutModalOpen(true)}
          />
        )}
      </main>

      {/* FLOATING GLASS BOTTOM NAVIGATION (z-[90]) */}
      <BottomNavigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isBendahara={isBendahara}
        isSuperAdmin={isSuperAdmin}
        onQuickAdd={() => handleOpenTxModal('MASUK')}
      />

      {/* MODALS & BOTTOM SHEETS VIA PORTAL (z-[300]) */}
      <DashboardModals
        submitting={submitting}
        modalTxOpen={modalTxOpen}
        onCloseTxModal={() => setModalTxOpen(false)}
        txForm={txForm}
        onTxFormChange={setTxForm}
        onSaveTransaction={handleSaveTransaction}
        modalSaldoOpen={modalSaldoOpen}
        onCloseSaldoModal={() => setModalSaldoOpen(false)}
        saldoForm={saldoForm}
        onSaldoFormChange={setSaldoForm}
        onSaveSaldoAwal={handleSaveSaldoAwal}
        modalUserOpen={modalUserOpen}
        onCloseUserModal={() => setModalUserOpen(false)}
        userForm={userForm}
        onUserFormChange={setUserForm}
        onSaveUser={handleSaveUser}
        cancelTarget={cancelTarget}
        onCloseCancelModal={() => setCancelTarget(null)}
        onConfirmCancel={handleConfirmCancelTransaction}
        logoutModalOpen={logoutModalOpen}
        loggingOut={loggingOut}
        onCloseLogoutModal={() => setLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        installModalOpen={installModalOpen}
        onCloseInstallModal={() => setInstallModalOpen(false)}
      />

      {/* TOAST VIA PORTAL (z-[320]) */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
