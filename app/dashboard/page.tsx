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
  LogOut,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  WalletCards,
  BarChart3,
  CalendarDays,
} from 'lucide-react';

/* ============================================================
   LOGO KAS KP2KP
   ============================================================ */

function KasLogo({
  size = 'md',
}: {
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm'
      ? 'w-10 h-10'
      : size === 'lg'
        ? 'w-20 h-20'
        : 'w-14 h-14';

  return (
    <div className={`relative shrink-0 ${sizeClass}`}>
      <div className="absolute inset-0 rounded-[22px] bg-[#D9B83F]/20 blur-xl" />

      <svg
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full"
        aria-label="Logo KAS KP2KP"
      >
        <defs>
          <linearGradient
            id="kasDashboardGradient"
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
            id="kasDashboardGold"
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

        <rect
          x="3"
          y="3"
          width="66"
          height="66"
          rx="22"
          fill="url(#kasDashboardGradient)"
        />

        <path
          d="M18 13C24 9 32 8 39 10C50 13 59 21 62 31"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="2"
          strokeLinecap="round"
        />

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

        <path
          d="M43 47V38"
          stroke="url(#kasDashboardGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M51 47V32"
          stroke="url(#kasDashboardGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <path
          d="M59 47V27"
          stroke="url(#kasDashboardGold)"
          strokeWidth="4"
          strokeLinecap="round"
        />

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

/* ============================================================
   DATA GRAFIK
   ============================================================ */

interface MonthlyCashData {
  bulan: string;
  periode: string;
  masuk: number;
  keluar: number;
}

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

/* ============================================================
   DASHBOARD
   ============================================================ */

export default function DashboardPage() {
  const router = useRouter();

  /* ============================================================
     AUTH STATE
  ============================================================ */

  const [currentUser, setCurrentUser] = useState<{
    username: string;
    nama: string;
    roles: string[];
  } | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  /* ============================================================
     TAB STATE
  ============================================================ */

  const [activeTab, setActiveTab] =
    useState<NavTab>('beranda');

  /* ============================================================
     PERIOD STATE
  ============================================================ */

  const [periods, setPeriods] = useState<
    { periode: string; label: string }[]
  >([]);

  const [selectedPeriod, setSelectedPeriod] =
    useState<string>('');

  /* ============================================================
     FINANCE STATE
  ============================================================ */

  const [dashboardData, setDashboardData] =
    useState<DashboardKasResult | null>(null);

  const [transactions, setTransactions] =
    useState<TransaksiItem[]>([]);

  const [dataLoading, setDataLoading] =
    useState(false);

  /* ============================================================
     ANNUAL ANALYSIS STATE
  ============================================================ */

  const [annualCashData, setAnnualCashData] =
    useState<MonthlyCashData[]>([]);

  const [annualLoading, setAnnualLoading] =
    useState(false);

  /* ============================================================
     FILTER STATE
  ============================================================ */

  const [searchTx, setSearchTx] = useState('');

  const [filterJenisTx, setFilterJenisTx] =
    useState<'SEMUA' | 'MASUK' | 'KELUAR'>(
      'SEMUA'
    );

  /* ============================================================
     ADMIN STATE
  ============================================================ */

  const [usersList, setUsersList] =
    useState<any[]>([]);

  const [auditLogs, setAuditLogs] =
    useState<AuditLogEntry[]>([]);

  const [adminLoading, setAdminLoading] =
    useState(false);

  /* ============================================================
     AUDIT FILTER
  ============================================================ */

  const [auditSearch, setAuditSearch] =
    useState('');

  const [auditFilterAksi, setAuditFilterAksi] =
    useState('SEMUA');

  /* ============================================================
     MODAL STATE
  ============================================================ */

  const [modalTxOpen, setModalTxOpen] =
    useState(false);

  const [txForm, setTxForm] = useState({
    tanggal: '',
    jenis: 'MASUK' as 'MASUK' | 'KELUAR',
    uraian: '',
    nominal: '',
    keterangan: '',
  });

  const [modalSaldoOpen, setModalSaldoOpen] =
    useState(false);

  const [saldoForm, setSaldoForm] = useState({
    periode: '',
    saldoAwal: '',
    keterangan: '',
  });

  const [modalUserOpen, setModalUserOpen] =
    useState(false);

  const [userForm, setUserForm] = useState({
    nama: '',
    username: '',
    password: '',
    role: 'BENDAHARA',
    status: 'AKTIF',
  });

  const [submitting, setSubmitting] =
    useState(false);

  /* ============================================================
     TOAST
  ============================================================ */

  const [toast, setToast] =
    useState<ToastData | null>(null);

  function showToast(
    type: 'success' | 'error' | 'info',
    message: string,
    title?: string
  ) {
    setToast({
      type,
      message,
      title,
    });

    setTimeout(
      () => setToast(null),
      3500
    );
  }

  /* ============================================================
     AUTH
  ============================================================ */

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(
          '/api/auth/me',
          {
            cache: 'no-store',
          }
        );

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

    const pendingTab =
      sessionStorage.getItem(
        'dashboard_tab'
      ) as NavTab | null;

    if (pendingTab) {
      setActiveTab(pendingTab);

      sessionStorage.removeItem(
        'dashboard_tab'
      );
    }
  }, [router]);

  /* ============================================================
     PERIOD
  ============================================================ */

 useEffect(() => {
  if (!currentUser) return;

  async function loadPeriods() {
    try {
      const res = await fetch('/api/periods', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (
        data.success &&
        Array.isArray(data.data) &&
        data.data.length > 0
      ) {
        setPeriods(data.data);

        // Bulan berjalan
        const now = new Date();

        const currentPeriod =
          `${now.getFullYear()}-${String(
            now.getMonth() + 1
          ).padStart(2, '0')}`;

        // Cari apakah bulan berjalan tersedia
        const currentPeriodExists = data.data.some(
          (item: any) => item.periode === currentPeriod
        );

        if (currentPeriodExists) {
          // Otomatis buka bulan berjalan
          setSelectedPeriod(currentPeriod);
        } else {
          // Jika belum tersedia, gunakan periode terbaru/pertama
          setSelectedPeriod(data.data[0].periode);
        }
      }
    } catch (err) {
      console.error('Error loading periods:', err);
    }
  }

  loadPeriods();
}, [currentUser]);

  /* ============================================================
     CURRENT PERIOD DATA
  ============================================================ */

  const loadPeriodData = useCallback(
    async (period: string) => {
      if (!period) return;

      setDataLoading(true);

      try {
        const [
          dashRes,
          txRes,
        ] = await Promise.all([
          fetch(
            `/api/dashboard?periode=${encodeURIComponent(
              period
            )}`,
            {
              cache: 'no-store',
            }
          ),

          fetch(
            `/api/transactions?periode=${encodeURIComponent(
              period
            )}`,
            {
              cache: 'no-store',
            }
          ),
        ]);

        const dashData =
          await dashRes.json();

        const txData =
          await txRes.json();

        if (dashData.success) {
          setDashboardData(
            dashData.data
          );
        }

        if (txData.success) {
          setTransactions(
            txData.data || []
          );
        }
      } catch (err) {
        console.error(
          'Error loading period data:',
          err
        );
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedPeriod) {
      loadPeriodData(
        selectedPeriod
      );
    }
  }, [
    selectedPeriod,
    loadPeriodData,
  ]);

  /* ============================================================
     ANNUAL ANALYSIS
  ============================================================ */

  /*
   * PENTING:
   *
   * Sebelumnya:
   *
   * const selectedYear =
   *   selectedPeriod
   *     ? Number(selectedPeriod.slice(0, 4))
   *     : new Date().getFullYear();
   *
   * Kita hilangkan new Date() dari render.
   *
   * Karena aplikasi mulai pada periode 2026,
   * fallback yang aman adalah 2026.
   */

  const selectedYear = (() => {
    if (!selectedPeriod) {
      return 2026;
    }

    const year = Number(
      selectedPeriod.slice(0, 4)
    );

    if (
      Number.isFinite(year) &&
      year >= 2000 &&
      year <= 2100
    ) {
      return year;
    }

    return 2026;
  })();

  const loadAnnualCashData =
    useCallback(
      async (year: number) => {
        setAnnualLoading(true);

        try {
          const monthRequests =
            Array.from(
              {
                length: 12,
              },
              (_, index) => {
                const month =
                  String(
                    index + 1
                  ).padStart(
                    2,
                    '0'
                  );

                const periode =
                  `${year}-${month}`;

                return fetch(
                  `/api/transactions?periode=${encodeURIComponent(
                    periode
                  )}`,
                  {
                    cache: 'no-store',
                  }
                )
                  .then(
                    async (res) => {
                      if (!res.ok) {
                        return {
                          periode,
                          transactions: [],
                        };
                      }

                      const result =
                        await res.json();

                      return {
                        periode,
                        transactions:
                          result.success &&
                          Array.isArray(
                            result.data
                          )
                            ? result.data
                            : [],
                      };
                    }
                  )
                  .catch(
                    () => ({
                      periode,
                      transactions: [],
                    })
                  );
              }
            );

          const monthlyResults =
            await Promise.all(
              monthRequests
            );

          const result: MonthlyCashData[] =
            monthlyResults.map(
              (
                monthResult,
                index
              ) => {
                let masuk = 0;
                let keluar = 0;

                monthResult.transactions.forEach(
                  (tx: any) => {
                    const nominal =
                      Number(
                        tx?.nominal
                      ) || 0;

                    if (
                      tx?.jenis ===
                      'MASUK'
                    ) {
                      masuk +=
                        nominal;
                    }

                    if (
                      tx?.jenis ===
                      'KELUAR'
                    ) {
                      keluar +=
                        nominal;
                    }
                  }
                );

                return {
                  bulan:
                    NAMA_BULAN[
                      index
                    ],
                  periode:
                    monthResult.periode,
                  masuk,
                  keluar,
                };
              }
            );

          setAnnualCashData(
            result
          );
        } catch (error) {
          console.error(
            'Error loading annual cash data:',
            error
          );

          setAnnualCashData([]);
        } finally {
          setAnnualLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    if (
      activeTab !== 'analisis' ||
      !currentUser
    ) {
      return;
    }

    loadAnnualCashData(
      selectedYear
    );
  }, [
    activeTab,
    currentUser,
    selectedYear,
    loadAnnualCashData,
  ]);

  /* ============================================================
     ADMIN DATA
  ============================================================ */

  const isSuperAdmin =
    currentUser?.roles?.includes(
      'SUPER ADMIN'
    ) || false;

  const isBendahara =
    currentUser?.roles?.includes(
      'BENDAHARA'
    ) || false;

  useEffect(() => {
    if (
      activeTab === 'kelola' &&
      isSuperAdmin
    ) {
      setAdminLoading(true);

      Promise.all([
        fetch(
          '/api/users',
          {
            cache: 'no-store',
          }
        ),

        fetch(
          '/api/audit-log',
          {
            cache: 'no-store',
          }
        ),
      ])
        .then(
          async ([
            userRes,
            auditRes,
          ]) => {
            const uData =
              await userRes.json();

            const aData =
              await auditRes.json();

            if (uData.success) {
              setUsersList(
                uData.data || []
              );
            }

            if (aData.success) {
              setAuditLogs(
                aData.data || []
              );
            }
          }
        )
        .catch(console.error)
        .finally(() =>
          setAdminLoading(
            false
          )
        );
    }
  }, [
    activeTab,
    isSuperAdmin,
  ]);

  /* ============================================================
     TRANSACTION HANDLERS
  ============================================================ */

  function handleOpenTxModal(
    type: 'MASUK' | 'KELUAR'
  ) {
    setTxForm({
      tanggal:
        formatTanggalLokal(
          new Date()
        ),
      jenis: type,
      uraian: '',
      nominal: '',
      keterangan: '',
    });

    setModalTxOpen(true);
  }

  async function handleSaveTransaction(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !txForm.uraian ||
      !txForm.nominal ||
      Number(
        txForm.nominal
      ) <= 0
    ) {
      showToast(
        'error',
        'Lengkapi uraian dan nominal lebih dari 0.'
      );

      return;
    }

    setSubmitting(true);

    try {
      const res =
        await fetch(
          '/api/transactions',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              tanggal:
                txForm.tanggal,

              jenis:
                txForm.jenis,

              uraian:
                txForm.uraian,

              nominal:
                Number(
                  txForm.nominal
                ),

              keterangan:
                txForm.keterangan,
            }),
          }
        );

      const result =
        await res.json();

      if (
        !res.ok ||
        !result.success
      ) {
        showToast(
          'error',
          result.message ||
            'Gagal menyimpan transaksi.'
        );

        return;
      }

      showToast(
        'success',
        'Transaksi kas berhasil dicatat.'
      );

      setModalTxOpen(false);

      loadPeriodData(
        selectedPeriod
      );

      if (
        activeTab ===
        'analisis'
      ) {
        loadAnnualCashData(
          selectedYear
        );
      }
    } catch {
      showToast(
        'error',
        'Terjadi kesalahan sistem.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelTransaction(
    id: string
  ) {
    if (
      !confirm(
        'Apakah Anda yakin ingin membatalkan transaksi ini?'
      )
    ) {
      return;
    }

    try {
      const res =
        await fetch(
          `/api/transactions/${encodeURIComponent(
            id
          )}/cancel`,
          {
            method: 'POST',
          }
        );

      const result =
        await res.json();

      if (
        !res.ok ||
        !result.success
      ) {
        showToast(
          'error',
          result.message ||
            'Gagal membatalkan transaksi.'
        );

        return;
      }

      showToast(
        'success',
        'Transaksi berhasil dibatalkan.'
      );

      loadPeriodData(
        selectedPeriod
      );

      if (
        activeTab ===
        'analisis'
      ) {
        loadAnnualCashData(
          selectedYear
        );
      }
    } catch {
      showToast(
        'error',
        'Terjadi kesalahan sistem.'
      );
    }
  }

  /* ============================================================
     SALDO AWAL
  ============================================================ */

  async function handleOpenSaldoModal() {
    if (!selectedPeriod) return;

    try {
      const res =
        await fetch(
          `/api/balance/opening?periode=${encodeURIComponent(
            selectedPeriod
          )}`,
          {
            cache: 'no-store',
          }
        );

      const data =
        await res.json();

      if (data.success) {
        setSaldoForm({
          periode:
            selectedPeriod,

          saldoAwal:
            String(
              data.data
                .saldoAwal ||
                0
            ),

          keterangan:
            data.data
              .keterangan ||
            '',
        });

        setModalSaldoOpen(
          true
        );
      }
    } catch {
      showToast(
        'error',
        'Gagal memuat saldo awal.'
      );
    }
  }

  async function handleSaveSaldoAwal(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSubmitting(true);

    try {
      const res =
        await fetch(
          '/api/balance/opening',
          {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              periode:
                saldoForm.periode,

              saldoAwal:
                Number(
                  saldoForm.saldoAwal
                ),

              keterangan:
                saldoForm.keterangan,
            }),
          }
        );

      const result =
        await res.json();

      if (
        !res.ok ||
        !result.success
      ) {
        showToast(
          'error',
          result.message ||
            'Gagal mengubah saldo awal.'
        );

        return;
      }

      showToast(
        'success',
        'Saldo awal berhasil diperbarui.'
      );

      setModalSaldoOpen(
        false
      );

      loadPeriodData(
        selectedPeriod
      );
    } catch {
      showToast(
        'error',
        'Terjadi kesalahan sistem.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     USER HANDLER
  ============================================================ */

  async function handleSaveUser(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setSubmitting(true);

    try {
      const res =
        await fetch(
          '/api/users',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              nama:
                userForm.nama,

              username:
                userForm.username,

              password:
                userForm.password,

              roles: [
                userForm.role,
              ],

              status:
                userForm.status,
            }),
          }
        );

      const result =
        await res.json();

      if (
        !res.ok ||
        !result.success
      ) {
        showToast(
          'error',
          result.message ||
            'Gagal menambahkan user.'
        );

        return;
      }

      showToast(
        'success',
        'User berhasil ditambahkan.'
      );

      setModalUserOpen(
        false
      );

      const refreshUsers =
        await fetch(
          '/api/users',
          {
            cache: 'no-store',
          }
        ).then((r) =>
          r.json()
        );

      if (
        refreshUsers.success
      ) {
        setUsersList(
          refreshUsers.data ||
            []
        );
      }
    } catch {
      showToast(
        'error',
        'Terjadi kesalahan sistem.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     LOGOUT
  ============================================================ */

  async function handleLogout() {
    if (loggingOut) return;

    const confirmed =
      confirm(
        'Keluar dari aplikasi kas?'
      );

    if (!confirmed) return;

    setLoggingOut(true);

    try {
      const res =
        await fetch(
          '/api/auth/logout',
          {
            method: 'POST',
            cache: 'no-store',
          }
        );

      if (!res.ok) {
        throw new Error(
          'Logout gagal.'
        );
      }
    } catch (error) {
      console.error(
        'Logout error:',
        error
      );
    } finally {
      window.location.replace(
        '/login'
      );
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (authLoading) {
    return (
      <Loading
        message="Menyiapkan akun Anda..."
        className="min-h-screen"
      />
    );
  }

  /* ============================================================
     FILTER TRANSACTIONS
  ============================================================ */

  const filteredTransactions =
    transactions.filter(
      (tx) => {
        const kw =
          searchTx.toLowerCase();

        const matchKw =
          !kw ||
          tx.uraian
            .toLowerCase()
            .includes(kw) ||
          tx.idTransaksi
            .toLowerCase()
            .includes(kw);

        const matchJenis =
          filterJenisTx ===
            'SEMUA' ||
          tx.jenis ===
            filterJenisTx;

        return (
          matchKw &&
          matchJenis
        );
      }
    );

  const selectedPeriodLabel =
    periods.find(
      (p) =>
        p.periode ===
        selectedPeriod
    )?.label ||
    selectedPeriod ||
    'Bulan Aktif';

  const totalMasuk =
    dashboardData?.totalMasuk ||
    0;

  const totalKeluar =
    dashboardData?.totalKeluar ||
    0;

  const netFlow =
    totalMasuk -
    totalKeluar;

  const totalArus =
    totalMasuk +
    totalKeluar;

  const persenMasuk =
    totalArus > 0
      ? (
          (totalMasuk /
            totalArus) *
          100
        ).toFixed(1)
      : '0';

  const persenKeluar =
    totalArus > 0
      ? (
          (totalKeluar /
            totalArus) *
          100
        ).toFixed(1)
      : '0';

  /* ============================================================
     ANNUAL GRAPH CALCULATIONS
  ============================================================ */

  const annualTotalMasuk =
    annualCashData.reduce(
      (sum, item) =>
        sum + item.masuk,
      0
    );

  const annualTotalKeluar =
    annualCashData.reduce(
      (sum, item) =>
        sum + item.keluar,
      0
    );

  const annualNetFlow =
    annualTotalMasuk -
    annualTotalKeluar;

  const chartMax =
    Math.max(
      ...annualCashData.flatMap(
        (item) => [
          item.masuk,
          item.keluar,
        ]
      ),
      1
    );

  const highestMonth =
    annualCashData.length > 0
      ? annualCashData.reduce(
          (
            highest,
            current
          ) =>
            current.masuk +
              current.keluar >
            highest.masuk +
              highest.keluar
              ? current
              : highest,
          annualCashData[0]
        )
      : null;

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-[#FFF9E8]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Header
        userName={
          currentUser?.nama || ''
        }
        roles={
          currentUser?.roles || []
        }
        periods={periods}
        selectedPeriod={
          selectedPeriod
        }
        onPeriodChange={
          setSelectedPeriod
        }
      />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-5">

        {/* ====================================================
            TAB 1 — BERANDA
        ==================================================== */}

        {activeTab ===
          'beranda' && (
          <div className="space-y-4">

            <FinanceCard
              saldoAkhir={
                dashboardData?.saldoAkhir ||
                0
              }
              periodeLabel={
                selectedPeriodLabel
              }
              isBendahara={
                isBendahara
              }
              onTambahMasuk={() =>
                handleOpenTxModal(
                  'MASUK'
                )
              }
              onTambahKeluar={() =>
                handleOpenTxModal(
                  'KELUAR'
                )
              }
              onEditSaldoAwal={
                handleOpenSaldoModal
              }
            />

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-white p-3.5 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)]">

                <div className="flex items-center gap-1.5 text-[#7B817D] mb-1">

                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />

                  <span className="text-[11px] font-bold">
                    Pemasukan
                  </span>

                </div>

                <div className="text-base sm:text-lg font-black text-[#0F766E] tabular-nums">
                  {formatRupiah(
                    totalMasuk
                  )}
                </div>

                <div className="text-[10px] text-[#7B817D] mt-0.5">
                  {persenMasuk}% arus kas
                </div>

              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)]">

                <div className="flex items-center gap-1.5 text-[#7B817D] mb-1">

                  <span className="w-2 h-2 rounded-full bg-[#DC2626]" />

                  <span className="text-[11px] font-bold">
                    Pengeluaran
                  </span>

                </div>

                <div className="text-base sm:text-lg font-black text-[#DC2626] tabular-nums">
                  {formatRupiah(
                    totalKeluar
                  )}
                </div>

                <div className="text-[10px] text-[#7B817D] mt-0.5">
                  {persenKeluar}% arus kas
                </div>

              </div>

            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)] space-y-3">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#183B38]">
                    Mutasi Kas Terakhir
                  </h3>

                  <p className="text-[10px] text-[#7B817D]">
                    {
                      filteredTransactions.length
                    }{' '}
                    transaksi pada{' '}
                    {
                      selectedPeriodLabel
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      'transaksi'
                    )
                  }
                  className="text-xs font-bold text-[#0F766E] hover:text-[#134E4A]"
                >
                  Lihat Semua
                </button>

              </div>

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

                    {filteredTransactions
                      .slice(0, 5)
                      .map(
                        (tx) => (
                          <TransactionCard
                            key={
                              tx.idTransaksi
                            }
                            transaction={
                              tx
                            }
                            isBendahara={
                              isBendahara
                            }
                            onCancel={
                              handleCancelTransaction
                            }
                          />
                        )
                      )}

                  </div>

                  <div className="hidden sm:block">

                    <TransactionTable
                      transactions={filteredTransactions.slice(
                        0,
                        5
                      )}
                      isBendahara={
                        isBendahara
                      }
                      onCancel={
                        handleCancelTransaction
                      }
                    />

                  </div>
                </>
              )}

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 2 — TRANSAKSI
        ==================================================== */}

        {activeTab ===
          'transaksi' && (
          <div className="space-y-4">

            <div className="bg-white p-4 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)] space-y-3">

              <div className="flex items-center justify-between flex-wrap gap-2">

                <div>

                  <h3 className="text-sm font-black text-[#183B38]">
                    Semua Mutasi Kas
                  </h3>

                  <p className="text-[11px] text-[#7B817D]">
                    Periode{' '}
                    {
                      selectedPeriodLabel
                    } (
                    {
                      filteredTransactions.length
                    }{' '}
                    data)
                  </p>

                </div>

                {isBendahara && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenTxModal(
                        'MASUK'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#134E4A] text-white text-xs font-bold hover:bg-[#0F766E] shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />

                    <span>
                      Catat Transaksi
                    </span>

                  </button>
                )}

              </div>

              <div className="flex items-center gap-2">

                <input
                  type="text"
                  placeholder="Cari uraian atau ID..."
                  value={searchTx}
                  onChange={(e) =>
                    setSearchTx(
                      e.target.value
                    )
                  }
                  className="flex-1 h-9 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
                />

                <select
                  value={
                    filterJenisTx
                  }
                  onChange={(
                    e
                  ) =>
                    setFilterJenisTx(
                      e.target.value as
                        | 'SEMUA'
                        | 'MASUK'
                        | 'KELUAR'
                    )
                  }
                  className="h-9 px-2.5 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs font-bold text-[#183B38] outline-none"
                >
                  <option value="SEMUA">
                    Semua Arus
                  </option>

                  <option value="MASUK">
                    Masuk
                  </option>

                  <option value="KELUAR">
                    Keluar
                  </option>
                </select>

              </div>

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

                    {filteredTransactions.map(
                      (tx) => (
                        <TransactionCard
                          key={
                            tx.idTransaksi
                          }
                          transaction={
                            tx
                          }
                          isBendahara={
                            isBendahara
                          }
                          onCancel={
                            handleCancelTransaction
                          }
                        />
                      )
                    )}

                  </div>

                  <div className="hidden sm:block">

                    <TransactionTable
                      transactions={
                        filteredTransactions
                      }
                      isBendahara={
                        isBendahara
                      }
                      onCancel={
                        handleCancelTransaction
                      }
                    />

                  </div>
                </>
              )}

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 3 — ANALISIS
        ==================================================== */}

        {activeTab ===
          'analisis' && (
          <div className="space-y-4">

            {/* NET CASH FLOW */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#134E4A] via-[#0F766E] to-[#166E68] p-5 sm:p-6 rounded-3xl shadow-[0_12px_30px_rgba(19,78,74,0.16)] text-white">

              <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-[#D9B83F]/15 blur-2xl" />

              <div className="relative">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                      Arus Kas Bersih
                    </div>

                    <div className="text-[9px] font-medium text-white/55 mt-0.5">
                      {
                        selectedPeriodLabel
                      }
                    </div>

                  </div>

                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">

                    {netFlow >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-[#F7E7A8]" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-[#F7E7A8]" />
                    )}

                  </div>

                </div>

                <div className="text-2xl sm:text-3xl font-black tabular-nums mt-3">
                  {formatRupiah(
                    netFlow
                  )}
                </div>

                <div className="text-xs text-white/70 font-medium mt-1">
                  {netFlow >= 0
                    ? 'Surplus kas periode berjalan'
                    : 'Defisit kas periode berjalan'}
                </div>

              </div>

            </div>

            {/* SALDO */}

            <div className="grid grid-cols-2 gap-3">

              <div className="bg-white p-4 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)]">

                <div className="flex items-center gap-1.5 text-[#7B817D]">

                  <WalletCards className="w-3.5 h-3.5 text-[#D9B83F]" />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Saldo Awal
                  </span>

                </div>

                <div className="text-sm font-black text-[#183B38] mt-2 tabular-nums">
                  {formatRupiah(
                    dashboardData?.saldoAwal ||
                      0
                  )}
                </div>

              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)]">

                <div className="flex items-center gap-1.5 text-[#7B817D]">

                  <WalletCards className="w-3.5 h-3.5 text-[#0F766E]" />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Saldo Akhir
                  </span>

                </div>

                <div className="text-sm font-black text-[#0F766E] mt-2 tabular-nums">
                  {formatRupiah(
                    dashboardData?.saldoAkhir ||
                      0
                  )}
                </div>

              </div>

            </div>

            {/* =================================================
                GRAFIK TAHUNAN
            ================================================= */}

            <div className="bg-white rounded-3xl border border-[#E9E4CF] shadow-[0_4px_20px_rgba(19,78,74,0.05)] overflow-hidden">

              <div className="p-4 sm:p-5 border-b border-[#E9E4CF]">

                <div className="flex items-start justify-between gap-3">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-xl bg-[#F7E7A8]/45 flex items-center justify-center">

                        <BarChart3 className="w-4 h-4 text-[#A97800]" />

                      </div>

                      <div>

                        <h3 className="text-sm font-black text-[#183B38]">
                          Arus Kas Tahunan
                        </h3>

                        <p className="text-[10px] text-[#7B817D] mt-0.5">
                          Pemasukan dan pengeluaran{' '}
                          {selectedYear}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">

                    <div className="flex items-center gap-3 text-[9px] font-bold text-[#7B817D]">

                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                        Masuk
                      </span>

                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#D9B83F]" />
                        Keluar
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {annualLoading ? (
                <div className="p-8">
                  <Loading
                    message={`Memuat analisis ${selectedYear}...`}
                  />
                </div>
              ) : (
                <>

                  {/* RINGKASAN TAHUN */}

                  <div className="grid grid-cols-3 gap-px bg-[#E9E4CF] border-b border-[#E9E4CF]">

                    <div className="bg-white p-3 text-center">

                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#7B817D]">
                        Total Masuk
                      </div>

                      <div className="text-xs sm:text-sm font-black text-[#0F766E] mt-1 tabular-nums">
                        {formatRupiah(
                          annualTotalMasuk
                        )}
                      </div>

                    </div>

                    <div className="bg-white p-3 text-center">

                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#7B817D]">
                        Total Keluar
                      </div>

                      <div className="text-xs sm:text-sm font-black text-[#A97800] mt-1 tabular-nums">
                        {formatRupiah(
                          annualTotalKeluar
                        )}
                      </div>

                    </div>

                    <div className="bg-white p-3 text-center">

                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#7B817D]">
                        Net Flow
                      </div>

                      <div
                        className={`text-xs sm:text-sm font-black mt-1 tabular-nums ${
                          annualNetFlow >=
                          0
                            ? 'text-[#0F766E]'
                            : 'text-rose-600'
                        }`}
                      >
                        {formatRupiah(
                          annualNetFlow
                        )}
                      </div>

                    </div>

                  </div>

                  {/* BAR CHART */}

                  <div className="p-4 sm:p-5">

                    <div className="overflow-x-auto pb-1">

                      <div className="min-w-[680px]">

                        <div className="relative h-64">

                          {/* GRID */}

                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">

                            <div className="border-t border-dashed border-[#E9E4CF]" />
                            <div className="border-t border-dashed border-[#E9E4CF]" />
                            <div className="border-t border-dashed border-[#E9E4CF]" />
                            <div className="border-t border-dashed border-[#E9E4CF]" />
                            <div className="border-t border-[#E9E4CF]" />

                          </div>

                          {/* BARS */}

                          <div className="absolute inset-0 flex items-end justify-between gap-2 px-1">

                            {annualCashData.map(
                              (
                                item
                              ) => {

                                const masukHeight =
                                  item.masuk >
                                  0
                                    ? Math.max(
                                        4,
                                        (item.masuk /
                                          chartMax) *
                                          100
                                      )
                                    : 0;

                                const keluarHeight =
                                  item.keluar >
                                  0
                                    ? Math.max(
                                        4,
                                        (item.keluar /
                                          chartMax) *
                                          100
                                      )
                                    : 0;

                                return (
                                  <div
                                    key={
                                      item.periode
                                    }
                                    className="flex-1 h-full flex flex-col justify-end items-center"
                                  >

                                    <div className="flex-1 w-full flex items-end justify-center gap-1.5">

                                      {/* MASUK */}

                                      <div
                                        className="group relative w-3.5 sm:w-5 rounded-t-md bg-[#0F766E] transition-all duration-500 hover:bg-[#134E4A]"
                                        style={{
                                          height: `${masukHeight}%`,
                                        }}
                                        title={`${item.bulan} · Masuk: ${formatRupiah(
                                          item.masuk
                                        )}`}
                                      >
                                        {item.masuk >
                                          0 && (
                                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap">

                                            <div className="bg-[#183B38] text-white text-[9px] font-bold rounded-lg px-2 py-1.5 shadow-lg">

                                              Masuk
                                              <br />

                                              {formatRupiah(
                                                item.masuk
                                              )}

                                            </div>

                                          </div>
                                        )}
                                      </div>

                                      {/* KELUAR */}

                                      <div
                                        className="group relative w-3.5 sm:w-5 rounded-t-md bg-[#D9B83F] transition-all duration-500 hover:bg-[#B99724]"
                                        style={{
                                          height: `${keluarHeight}%`,
                                        }}
                                        title={`${item.bulan} · Keluar: ${formatRupiah(
                                          item.keluar
                                        )}`}
                                      >
                                        {item.keluar >
                                          0 && (
                                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap">

                                            <div className="bg-[#183B38] text-white text-[9px] font-bold rounded-lg px-2 py-1.5 shadow-lg">

                                              Keluar
                                              <br />

                                              {formatRupiah(
                                                item.keluar
                                              )}

                                            </div>

                                          </div>
                                        )}
                                      </div>

                                    </div>

                                    <div className="h-7 flex items-center justify-center mt-1">

                                      <span
                                        className={`text-[9px] font-bold ${
                                          item.periode ===
                                          selectedPeriod
                                            ? 'text-[#0F766E]'
                                            : 'text-[#7B817D]'
                                        }`}
                                      >
                                        {
                                          item.bulan
                                        }
                                      </span>

                                    </div>

                                  </div>
                                );
                              }
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                    {highestMonth && (
                      <div className="mt-3 flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#FFF9E8] border border-[#E9E4CF]">

                        <div className="flex items-center gap-2 min-w-0">

                          <CalendarDays className="w-3.5 h-3.5 text-[#A97800] shrink-0" />

                          <div className="min-w-0">

                            <div className="text-[9px] font-bold uppercase tracking-wider text-[#7B817D]">
                              Aktivitas tertinggi
                            </div>

                            <div className="text-[10px] font-extrabold text-[#183B38] truncate">
                              {
                                highestMonth.bulan
                              }{' '}
                              {selectedYear}
                            </div>

                          </div>

                        </div>

                        <div className="text-[10px] font-black text-[#0F766E] tabular-nums shrink-0">
                          {formatRupiah(
                            highestMonth.masuk +
                              highestMonth.keluar
                          )}
                        </div>

                      </div>
                    )}

                  </div>

                </>
              )}

            </div>

            {/* =================================================
                PROPORSI
            ================================================= */}

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)] space-y-4">

              <div>

                <h3 className="text-xs font-black text-[#183B38] uppercase tracking-wider">
                  Proporsi Arus Kas
                </h3>

                <p className="text-[10px] text-[#7B817D] mt-1">
                  Komposisi arus kas pada{' '}
                  {
                    selectedPeriodLabel
                  }
                </p>

              </div>

              <div className="space-y-3">

                <div>

                  <div className="flex justify-between text-xs font-bold text-[#183B38] mb-1.5">

                    <span>
                      Pemasukan (
                      {persenMasuk}%)
                    </span>

                    <span className="text-[#0F766E]">
                      {formatRupiah(
                        totalMasuk
                      )}
                    </span>

                  </div>

                  <div className="w-full h-2 rounded-full bg-[#E9E4CF] overflow-hidden">

                    <div
                      className="h-full bg-[#0F766E] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            persenMasuk
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                <div>

                  <div className="flex justify-between text-xs font-bold text-[#183B38] mb-1.5">

                    <span>
                      Pengeluaran (
                      {persenKeluar}%)
                    </span>

                    <span className="text-[#A97800]">
                      {formatRupiah(
                        totalKeluar
                      )}
                    </span>

                  </div>

                  <div className="w-full h-2 rounded-full bg-[#E9E4CF] overflow-hidden">

                    <div
                      className="h-full bg-[#D9B83F] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            persenKeluar
                          )
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 4 — KELOLA
        ==================================================== */}

        {activeTab ===
          'kelola' &&
          isSuperAdmin && (
            <div className="space-y-4">

              <div className="bg-white p-4 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)] space-y-3">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-sm font-black text-[#183B38]">
                      Manajemen Pengguna
                    </h3>

                    <p className="text-[11px] text-[#7B817D]">
                      Kelola akses & staf kantor
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModalUserOpen(
                        true
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#134E4A] text-white text-xs font-bold hover:bg-[#0F766E]"
                  >
                    + Tambah User
                  </button>

                </div>

                {adminLoading ? (
                  <Loading message="Memuat data pengguna..." />
                ) : (
                  <div className="divide-y divide-[#E9E4CF]">

                    {usersList.map(
                      (u) => (
                        <div
                          key={
                            u.username
                          }
                          className="py-2.5 flex items-center justify-between text-xs"
                        >

                          <div>

                            <div className="font-bold text-[#183B38]">
                              {u.nama}
                            </div>

                            <div className="text-[11px] text-[#7B817D]">
                              {u.username}
                            </div>

                          </div>

                          <div className="text-right">

                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-[#F7E7A8]/45 text-[#806300] border border-[#E9D88C]">
                              {u.roles?.join(
                                ', '
                              )}
                            </span>

                            <div className="text-[10px] text-[#7B817D] mt-0.5">
                              {u.status}
                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)] space-y-3">

                <div>

                  <h3 className="text-sm font-black text-[#183B38]">
                    Audit Trail Aktivitas
                  </h3>

                  <p className="text-[11px] text-[#7B817D]">
                    Catatan riwayat sistem kas
                  </p>

                </div>

                <div className="divide-y divide-[#E9E4CF]">

                  {auditLogs
                    .slice(0, 15)
                    .map(
                      (log) => (
                        <div
                          key={
                            log.idLog
                          }
                          className="py-2.5 text-xs"
                        >

                          <div className="flex items-center justify-between text-[10px] text-[#7B817D] mb-0.5">

                            <span>
                              {log.waktu}
                            </span>

                            <span className="font-bold text-[#0F766E]">
                              {log.aksi}
                            </span>

                          </div>

                          <div className="font-semibold text-[#183B38]">
                            {log.detail}
                          </div>

                          <div className="text-[10px] text-[#7B817D]">
                            Oleh:{' '}
                            {log.nama ||
                              log.username ||
                              '-'}
                          </div>

                        </div>
                      )
                    )}

                </div>

              </div>

            </div>
          )}

        {/* ====================================================
            TAB 5 — AKUN
        ==================================================== */}

        {activeTab ===
          'akun' && (
          <div className="space-y-4">

            {/* PROFILE CARD */}

            <div className="relative overflow-hidden bg-gradient-to-br from-[#134E4A] via-[#0F766E] to-[#166E68] rounded-3xl p-5 sm:p-6 text-white shadow-[0_12px_30px_rgba(19,78,74,0.14)]">

              <div className="absolute -right-10 -top-12 w-36 h-36 rounded-full bg-[#D9B83F]/15 blur-2xl" />

              <div className="absolute -left-8 -bottom-14 w-28 h-28 rounded-full bg-white/5 blur-2xl" />

              <div className="relative flex items-center gap-4">

                <KasLogo size="md" />

                <div className="flex-1 min-w-0">

                  <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 mb-1">
                    Akun Pengguna
                  </div>

                  <div className="text-base sm:text-lg font-black truncate">
                    {currentUser?.nama ||
                      '-'}
                  </div>

                  <div className="text-xs text-white/65 truncate mt-0.5">
                    {currentUser?.username ||
                      '-'}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">

                    {currentUser?.roles?.map(
                      (role) => (
                        <span
                          key={role}
                          className="text-[9px] font-extrabold uppercase px-2 py-1 rounded-full bg-white/10 border border-white/15 text-white"
                        >
                          {role}
                        </span>
                      )
                    )}

                  </div>

                </div>

              </div>

              <div className="relative mt-5 pt-3 border-t border-white/10 flex items-center justify-between">

                <div className="text-[9px] text-white/55">
                  Sistem Pengelolaan Keuangan
                  Internal
                </div>

                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#F7E7A8]">

                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9B83F]" />

                  Aktif

                </div>

              </div>

            </div>

            {/* ACCOUNT ACTIONS */}

            <div className="bg-white rounded-2xl border border-[#E9E4CF] shadow-[0_4px_18px_rgba(19,78,74,0.04)] overflow-hidden divide-y divide-[#E9E4CF]">

              <button
                type="button"
                onClick={() => {
                  alert(
                    "Untuk memasang aplikasi di layar HP:\nTekan menu browser (Bagikan/Share), lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen)."
                  );
                }}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#183B38] hover:bg-[#FFF9E8] transition-colors"
              >

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-xl bg-[#F7E7A8]/40 flex items-center justify-center">

                    <Download className="w-4 h-4 text-[#A97800]" />

                  </div>

                  <div>

                    <div>
                      Pasang Aplikasi
                    </div>

                    <div className="text-[9px] text-[#7B817D] font-medium mt-0.5">
                      Tambahkan KAS KP2KP ke layar utama
                    </div>

                  </div>

                </div>

                <span className="text-[#7B817D] text-lg">
                  ›
                </span>

              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={
                  handleLogout
                }
                disabled={
                  loggingOut
                }
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-60 disabled:cursor-wait"
              >

                <div className="flex items-center gap-2.5">

                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">

                    <LogOut className="w-4 h-4 text-rose-600" />

                  </div>

                  <div>

                    <div>
                      {loggingOut
                        ? 'Keluar dari aplikasi...'
                        : 'Keluar Akun'}
                    </div>

                    <div className="text-[9px] text-rose-400 font-medium mt-0.5">
                      Akhiri sesi akun saat ini
                    </div>

                  </div>

                </div>

                <span className="text-rose-400 text-lg">
                  {loggingOut
                    ? '...'
                    : '›'}
                </span>

              </button>

            </div>

            {/* COPYRIGHT */}

            <div className="text-center pt-3 pb-1">

              <div className="text-[10px] font-bold tracking-wide text-[#183B38]">
                © 2026 · KAS KP2KP Majenang
              </div>

              <div className="text-[9px] text-[#7B817D] mt-1">
                Internal Finance System
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ======================================================
          BOTTOM NAVIGATION
      ====================================================== */}

      <BottomNavigation
        activeTab={
          activeTab
        }
        onChangeTab={
          setActiveTab
        }
        isBendahara={
          isBendahara
        }
        isSuperAdmin={
          isSuperAdmin
        }
        onQuickAdd={() =>
          handleOpenTxModal(
            'MASUK'
          )
        }
      />

      {/* ======================================================
          MODAL TRANSAKSI
      ====================================================== */}

      <Modal
        isOpen={
          modalTxOpen
        }
        onClose={() =>
          setModalTxOpen(
            false
          )
        }
        title="Catat Transaksi Kas"
        footer={
          <>
            <button
              type="button"
              onClick={() =>
                setModalTxOpen(
                  false
                )
              }
              className="px-4 py-2 text-xs font-bold text-[#183B38] hover:bg-[#FFF9E8] rounded-xl"
            >
              Batal
            </button>

            <button
              type="submit"
              form="formTransaksi"
              disabled={
                submitting
              }
              className="px-4 py-2 text-xs font-bold text-white bg-[#134E4A] hover:bg-[#0F766E] rounded-xl shadow-sm disabled:opacity-60"
            >
              {submitting
                ? 'Menyimpan...'
                : 'Simpan Transaksi'}
            </button>
          </>
        }
      >

        <form
          id="formTransaksi"
          onSubmit={
            handleSaveTransaction
          }
          className="space-y-3.5"
        >

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Tanggal Transaksi
            </label>

            <input
              type="date"
              value={
                txForm.tanggal
              }
              onChange={(e) =>
                setTxForm({
                  ...txForm,
                  tanggal:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Jenis Arus Kas
            </label>

            <select
              value={
                txForm.jenis
              }
              onChange={(
                e
              ) =>
                setTxForm({
                  ...txForm,
                  jenis:
                    e.target
                      .value as
                      | 'MASUK'
                      | 'KELUAR',
                })
              }
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs font-bold text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            >

              <option value="MASUK">
                ↙ Uang Masuk (Penerimaan)
              </option>

              <option value="KELUAR">
                ↗ Uang Keluar (Pengeluaran)
              </option>

            </select>

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Uraian Transaksi
            </label>

            <input
              type="text"
              placeholder="Contoh: Belanja ATK Kantor"
              value={
                txForm.uraian
              }
              onChange={(e) =>
                setTxForm({
                  ...txForm,
                  uraian:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Nominal (Rp)
            </label>

            <input
              type="number"
              placeholder="0"
              min="1"
              value={
                txForm.nominal
              }
              onChange={(e) =>
                setTxForm({
                  ...txForm,
                  nominal:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs font-bold text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Keterangan Tambahan
            </label>

            <textarea
              placeholder="Catatan nomor nota / kuitansi (opsional)..."
              value={
                txForm.keterangan
              }
              onChange={(e) =>
                setTxForm({
                  ...txForm,
                  keterangan:
                    e.target
                      .value,
                })
              }
              className="w-full h-20 p-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none resize-none"
            />

          </div>

        </form>

      </Modal>

      {/* ======================================================
          MODAL SALDO AWAL
      ====================================================== */}

      <Modal
        isOpen={
          modalSaldoOpen
        }
        onClose={() =>
          setModalSaldoOpen(
            false
          )
        }
        title="Kelola Saldo Awal"
        footer={
          <>
            <button
              type="button"
              onClick={() =>
                setModalSaldoOpen(
                  false
                )
              }
              className="px-4 py-2 text-xs font-bold text-[#183B38] hover:bg-[#FFF9E8] rounded-xl"
            >
              Batal
            </button>

            <button
              type="submit"
              form="formSaldo"
              disabled={
                submitting
              }
              className="px-4 py-2 text-xs font-bold text-white bg-[#134E4A] hover:bg-[#0F766E] rounded-xl shadow-sm disabled:opacity-60"
            >
              {submitting
                ? 'Menyimpan...'
                : 'Simpan Perubahan'}
            </button>
          </>
        }
      >

        <form
          id="formSaldo"
          onSubmit={
            handleSaveSaldoAwal
          }
          className="space-y-3.5"
        >

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Periode
            </label>

            <input
              type="text"
              value={
                saldoForm.periode
              }
              readOnly
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#F5F1DF] text-xs font-bold text-[#7B817D] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Saldo Awal (Rp)
            </label>

            <input
              type="number"
              min="0"
              value={
                saldoForm.saldoAwal
              }
              onChange={(e) =>
                setSaldoForm({
                  ...saldoForm,
                  saldoAwal:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs font-bold text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Keterangan
            </label>

            <textarea
              placeholder="Dasar penetapan saldo awal..."
              value={
                saldoForm.keterangan
              }
              onChange={(e) =>
                setSaldoForm({
                  ...saldoForm,
                  keterangan:
                    e.target
                      .value,
                })
              }
              className="w-full h-20 p-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none resize-none"
            />

          </div>

        </form>

      </Modal>

      {/* ======================================================
          MODAL TAMBAH USER
      ====================================================== */}

      <Modal
        isOpen={
          modalUserOpen
        }
        onClose={() =>
          setModalUserOpen(
            false
          )
        }
        title="Tambah Pengguna Baru"
        footer={
          <>
            <button
              type="button"
              onClick={() =>
                setModalUserOpen(
                  false
                )
              }
              className="px-4 py-2 text-xs font-bold text-[#183B38] hover:bg-[#FFF9E8] rounded-xl"
            >
              Batal
            </button>

            <button
              type="submit"
              form="formUser"
              disabled={
                submitting
              }
              className="px-4 py-2 text-xs font-bold text-white bg-[#134E4A] hover:bg-[#0F766E] rounded-xl shadow-sm disabled:opacity-60"
            >
              {submitting
                ? 'Menyimpan...'
                : 'Simpan User'}
            </button>
          </>
        }
      >

        <form
          id="formUser"
          onSubmit={
            handleSaveUser
          }
          className="space-y-3.5"
        >

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Nama Lengkap
            </label>

            <input
              type="text"
              placeholder="Nama pegawai"
              value={
                userForm.nama
              }
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  nama:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Username (NIP Pendek)
            </label>

            <input
              type="text"
              placeholder="NIP Pendek"
              value={
                userForm.username
              }
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  username:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Kata Sandi
            </label>

            <input
              type="password"
              placeholder="Kata sandi"
              value={
                userForm.password
              }
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  password:
                    e.target
                      .value,
                })
              }
              required
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            />

          </div>

          <div>

            <label className="block text-[11px] font-bold text-[#183B38] uppercase mb-1">
              Peran Akses
            </label>

            <select
              value={
                userForm.role
              }
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  role:
                    e.target
                      .value,
                })
              }
              className="w-full h-10 px-3 rounded-xl border border-[#E9E4CF] bg-[#FFFDF4] text-xs font-bold text-[#183B38] focus:bg-white focus:border-[#0F766E] outline-none"
            >

              <option value="BENDAHARA">
                BENDAHARA
              </option>

              <option value="USER">
                USER
              </option>

              <option value="SUPER ADMIN">
                SUPER ADMIN
              </option>

            </select>

          </div>

        </form>

      </Modal>

      {/* ======================================================
          TOAST
      ====================================================== */}

      <Toast
        toast={toast}
        onClose={() =>
          setToast(null)
        }
      />

    </div>
  );
}
