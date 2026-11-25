'use client';

import { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import DonutRing from '@/components/DonutRing';
import Loading from '@/components/Loading';
import { formatRupiah } from '@/lib/utils/format';
import { DashboardKasResult } from '@/lib/finance/dashboard';

export interface MonthlyCashData {
  bulan: string;
  periode: string;
  masuk: number;
  keluar: number;
}

interface AnalisisTabProps {
  dashboardData: DashboardKasResult | null;
  selectedPeriod: string;
  selectedPeriodLabel: string;
  selectedYear: number;
  annualCashData: MonthlyCashData[];
  annualLoading: boolean;
}

function formatCompactRp(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')} jt`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)} rb`;
  }
  return String(Math.round(value));
}

export default function AnalisisTab({
  dashboardData,
  selectedPeriod,
  selectedPeriodLabel,
  selectedYear,
  annualCashData,
  annualLoading,
}: AnalisisTabProps) {
  const [selectedMonthPeriode, setSelectedMonthPeriode] = useState<
    string | null
  >(null);

  const totalMasuk = dashboardData?.totalMasuk || 0;
  const totalKeluar = dashboardData?.totalKeluar || 0;
  const saldoAwal = dashboardData?.saldoAwal || 0;
  const saldoAkhir = dashboardData?.saldoAkhir || 0;
  const netFlow = totalMasuk - totalKeluar;
  const totalArus = totalMasuk + totalKeluar;

  const persenMasuk = totalArus > 0 ? (totalMasuk / totalArus) * 100 : 0;
  const persenKeluar = totalArus > 0 ? (totalKeluar / totalArus) * 100 : 0;

  const annualTotalMasuk = annualCashData.reduce(
    (sum, item) => sum + item.masuk,
    0
  );
  const annualTotalKeluar = annualCashData.reduce(
    (sum, item) => sum + item.keluar,
    0
  );
  const annualNetFlow = annualTotalMasuk - annualTotalKeluar;

  const chartMax = Math.max(
    ...annualCashData.flatMap((item) => [item.masuk, item.keluar]),
    1
  );

  const highestMonth =
    annualCashData.length > 0
      ? annualCashData.reduce((highest, current) =>
          current.masuk + current.keluar > highest.masuk + highest.keluar
            ? current
            : highest
        )
      : null;

  const activeMonthDetail =
    annualCashData.find(
      (item) => item.periode === (selectedMonthPeriode || selectedPeriod)
    ) || highestMonth;

  return (
    <div className="space-y-4">
      <div className="px-0.5">
        <h1 className="text-[19px] font-bold leading-tight text-[#143632]">
          Analisis Kas
        </h1>
        <p className="mt-0.5 text-[11.5px] text-[#4E6661]">
          Ringkasan arus kas {selectedPeriodLabel} & tren tahun {selectedYear}
        </p>
      </div>

      {/* 1. HERO ARUS KAS BERSIH TERPADU (.kas-glass-hero) */}
      <section className="kas-glass-hero relative overflow-hidden rounded-[24px] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-medium text-white/75">
              Arus Kas Bersih · {selectedPeriodLabel}
            </div>
            <div className="kas-num mt-1 text-[25px] font-bold leading-tight text-white">
              {netFlow >= 0 ? '+' : ''}
              {formatRupiah(netFlow)}
            </div>
            <div className="mt-1 text-[11.5px] font-medium text-[#FFF0A8]">
              {netFlow >= 0
                ? 'Surplus kas periode berjalan'
                : 'Defisit kas periode berjalan'}
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/12">
            {netFlow >= 0 ? (
              <TrendingUp className="h-5 w-5 text-[#8EF0C0]" />
            ) : (
              <TrendingDown className="h-5 w-5 text-[#FFB8C4]" />
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 divide-x divide-white/20 border-t border-white/20 pt-3.5">
          <div className="pr-3">
            <div className="text-[11px] font-medium text-white/75">
              Saldo Awal
            </div>
            <div className="kas-num mt-0.5 text-[13.5px] font-semibold text-[#FFF0A8]">
              {formatRupiah(saldoAwal)}
            </div>
          </div>
          <div className="pl-3.5">
            <div className="text-[11px] font-medium text-white/75">
              Saldo Akhir
            </div>
            <div className="kas-num mt-0.5 text-[13.5px] font-semibold text-white">
              {formatRupiah(saldoAkhir)}
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROPORSI ARUS KAS + DONUT RING (.kas-glass-clear) */}
      <section className="kas-glass-clear rounded-[22px] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[13.5px] font-bold text-[#143632]">
              Proporsi Arus Kas
            </h2>
            <p className="text-[11px] text-[#4E6661]">
              Perbandingan masuk vs keluar ({selectedPeriodLabel})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DonutRing percentage={persenKeluar} label="Keluar" size={82} />

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#143632]">
                  Pemasukan ({persenMasuk.toFixed(1)}%)
                </span>
                <span className="kas-num font-medium text-[#0F766E]">
                  {formatRupiah(totalMasuk)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#143632]/10">
                <div
                  className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                  style={{ width: `${Math.min(100, persenMasuk)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#143632]">
                  Pengeluaran ({persenKeluar.toFixed(1)}%)
                </span>
                <span className="kas-num font-medium text-[#9F3542]">
                  {formatRupiah(totalKeluar)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#143632]/10">
                <div
                  className="h-full rounded-full bg-[#9F3542] transition-all duration-500"
                  style={{ width: `${Math.min(100, persenKeluar)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GRAFIK ARUS KAS TAHUNAN INTERAKTIF (.kas-glass-soft) */}
      <section className="kas-glass-soft overflow-hidden rounded-[22px]">
        <div className="flex items-center justify-between gap-3 border-b border-[#143632]/8 p-4">
          <div className="flex items-center gap-2.5">
            <div className="kas-glass-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#9A7B1C]">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[13.5px] font-bold text-[#143632]">
                Arus Kas Tahunan {selectedYear}
              </h2>
              <p className="text-[11px] text-[#4E6661]">
                Ketuk bulan pada grafik untuk lihat detail
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 text-[11px] font-semibold text-[#4E6661]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#0F766E]" />
              Masuk
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#9F3542]" />
              Keluar
            </span>
          </div>
        </div>

        {annualLoading ? (
          <Loading message={`Memuat analisis ${selectedYear}...`} />
        ) : (
          <>
            {/* Ringkasan Tahunan */}
            <div className="grid grid-cols-3 divide-x divide-[#143632]/8 border-b border-[#143632]/8 bg-white/40">
              <div className="p-3 text-center">
                <div className="text-[10.5px] font-medium text-[#4E6661]">
                  Total Masuk
                </div>
                <div className="kas-num mt-0.5 truncate text-[12.5px] font-semibold text-[#0F766E]">
                  {formatRupiah(annualTotalMasuk)}
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[10.5px] font-medium text-[#4E6661]">
                  Total Keluar
                </div>
                <div className="kas-num mt-0.5 truncate text-[12.5px] font-semibold text-[#9F3542]">
                  {formatRupiah(annualTotalKeluar)}
                </div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[10.5px] font-medium text-[#4E6661]">
                  Net {selectedYear}
                </div>
                <div
                  className={`kas-num mt-0.5 truncate text-[12.5px] font-semibold ${
                    annualNetFlow >= 0 ? 'text-[#0F766E]' : 'text-[#9F3542]'
                  }`}
                >
                  {formatRupiah(annualNetFlow)}
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-4">
              <div className="flex gap-2">
                {/* Sumbu Y */}
                <div className="flex h-48 flex-col justify-between pb-6 text-right text-[10px] font-medium text-[#4E6661]/80 kas-num shrink-0">
                  <span>{formatCompactRp(chartMax)}</span>
                  <span>{formatCompactRp(chartMax / 2)}</span>
                  <span>0</span>
                </div>

                {/* Scrollable Bars */}
                <div className="no-scrollbar flex-1 overflow-x-auto pb-1">
                  <div className="min-w-[460px]">
                    <div className="relative h-48">
                      {/* Grid Lines */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between">
                        <div className="border-t border-dashed border-[#143632]/12" />
                        <div className="border-t border-dashed border-[#143632]/12" />
                        <div className="border-t border-[#143632]/15" />
                      </div>

                      {/* Bars */}
                      <div className="absolute inset-0 flex items-end justify-between gap-1.5">
                        {annualCashData.map((item) => {
                          const masukHeight =
                            item.masuk > 0
                              ? Math.max(5, (item.masuk / chartMax) * 100)
                              : 0;
                          const keluarHeight =
                            item.keluar > 0
                              ? Math.max(5, (item.keluar / chartMax) * 100)
                              : 0;
                          const isSelected =
                            activeMonthDetail?.periode === item.periode;

                          return (
                            <button
                              key={item.periode}
                              type="button"
                              onClick={() =>
                                setSelectedMonthPeriode(item.periode)
                              }
                              className={`flex h-full flex-1 flex-col items-center justify-end rounded-xl px-0.5 transition-colors ${
                                isSelected
                                  ? 'bg-[#C9A227]/12'
                                  : 'hover:bg-[#143632]/5'
                              }`}
                            >
                              <div className="flex w-full flex-1 items-end justify-center gap-1 pt-1">
                                <div
                                  className="w-2.5 rounded-t-[5px] bg-[#0F766E] transition-all duration-500 sm:w-3.5"
                                  style={{ height: `${masukHeight}%` }}
                                />
                                <div
                                  className="w-2.5 rounded-t-[5px] bg-[#9F3542] transition-all duration-500 sm:w-3.5"
                                  style={{ height: `${keluarHeight}%` }}
                                />
                              </div>

                              <div className="flex h-6 items-center justify-center">
                                <span
                                  className={`text-[10.5px] ${
                                    isSelected
                                      ? 'font-bold text-[#134E4A]'
                                      : 'font-medium text-[#4E6661]'
                                  }`}
                                >
                                  {item.bulan}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Bulan Terpilih (ramah sentuh iPhone) */}
              {activeMonthDetail && (
                <div className="kas-glass-gold mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[16px] px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-[#7A5E0A]" />
                    <div>
                      <div className="text-[11px] font-bold text-[#5E4706]">
                        Detail {activeMonthDetail.bulan} {selectedYear}
                      </div>
                      <div className="text-[10.5px] text-[#5E4706]/80">
                        {highestMonth?.periode === activeMonthDetail.periode
                          ? 'Bulan dengan aktivitas tertinggi'
                          : 'Ketuk bulan lain untuk membandingkan'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11.5px] kas-num">
                    <span className="font-semibold text-[#0F766E]">
                      +{formatRupiah(activeMonthDetail.masuk)}
                    </span>
                    <span className="font-semibold text-[#9F3542]">
                      -{formatRupiah(activeMonthDetail.keluar)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
