'use client';

import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  Share,
  Smartphone,
} from 'lucide-react';
import Modal from '@/components/Modal';
import RupiahInput from '@/components/RupiahInput';
import { formatRupiah } from '@/lib/utils/format';
import { TransaksiItem } from '@/lib/finance/transactions';

export interface TxFormState {
  tanggal: string;
  jenis: 'MASUK' | 'KELUAR';
  uraian: string;
  nominal: string;
  keterangan: string;
}

export interface SaldoFormState {
  periode: string;
  saldoAwal: string;
  keterangan: string;
}

export interface UserFormState {
  nama: string;
  username: string;
  password: string;
  role: string;
  status: string;
}

interface DashboardModalsProps {
  submitting: boolean;

  // Modal Transaksi
  modalTxOpen: boolean;
  onCloseTxModal: () => void;
  txForm: TxFormState;
  onTxFormChange: (next: TxFormState) => void;
  onSaveTransaction: (e: React.FormEvent) => void;

  // Modal Saldo Awal
  modalSaldoOpen: boolean;
  onCloseSaldoModal: () => void;
  saldoForm: SaldoFormState;
  onSaldoFormChange: (next: SaldoFormState) => void;
  onSaveSaldoAwal: (e: React.FormEvent) => void;

  // Modal Tambah User
  modalUserOpen: boolean;
  onCloseUserModal: () => void;
  userForm: UserFormState;
  onUserFormChange: (next: UserFormState) => void;
  onSaveUser: (e: React.FormEvent) => void;

  // Modal Konfirmasi Batal Transaksi
  cancelTarget: TransaksiItem | null;
  onCloseCancelModal: () => void;
  onConfirmCancel: () => void;

  // Modal Konfirmasi Logout
  logoutModalOpen: boolean;
  loggingOut: boolean;
  onCloseLogoutModal: () => void;
  onConfirmLogout: () => void;

  // Modal Panduan Install PWA
  installModalOpen: boolean;
  onCloseInstallModal: () => void;
}

const inputBaseClass =
  'h-11 w-full rounded-[15px] border border-[#143632]/12 bg-white/75 px-3.5 text-[13px] text-[#143632] outline-none transition-all placeholder:text-[#4E6661]/55 focus:border-[#0F766E] focus:bg-white focus:ring-3 focus:ring-[#0F766E]/12';

const labelBaseClass =
  'mb-1.5 block text-[11.5px] font-semibold text-[#143632]';

export default function DashboardModals({
  submitting,
  modalTxOpen,
  onCloseTxModal,
  txForm,
  onTxFormChange,
  onSaveTransaction,
  modalSaldoOpen,
  onCloseSaldoModal,
  saldoForm,
  onSaldoFormChange,
  onSaveSaldoAwal,
  modalUserOpen,
  onCloseUserModal,
  userForm,
  onUserFormChange,
  onSaveUser,
  cancelTarget,
  onCloseCancelModal,
  onConfirmCancel,
  logoutModalOpen,
  loggingOut,
  onCloseLogoutModal,
  onConfirmLogout,
  installModalOpen,
  onCloseInstallModal,
}: DashboardModalsProps) {
  return (
    <>
      {/* ======================================================
          1. MODAL CATAT TRANSAKSI
      ====================================================== */}
      <Modal
        isOpen={modalTxOpen}
        onClose={onCloseTxModal}
        title="Catat Transaksi Kas"
        subtitle="Pastikan jenis arus kas dan nominal sudah sesuai"
        footer={
          <>
            <button
              type="button"
              onClick={onCloseTxModal}
              className="rounded-[14px] px-4 py-2.5 text-[12.5px] font-semibold text-[#4E6661] transition-colors hover:bg-[#143632]/6 hover:text-[#143632]"
            >
              Batal
            </button>
            <button
              type="submit"
              form="formTransaksi"
              disabled={submitting}
              className="rounded-[14px] bg-[#134E4A] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(19,78,74,0.35)] transition-all hover:bg-[#0F766E] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </>
        }
      >
        <form
          id="formTransaksi"
          onSubmit={onSaveTransaction}
          className="space-y-4"
        >
          {/* Segmented Toggle Masuk / Keluar */}
          <div>
            <label className={labelBaseClass}>Jenis Arus Kas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  onTxFormChange({ ...txForm, jenis: 'MASUK' })
                }
                className={`flex items-center justify-center gap-2 rounded-[15px] border py-2.5 text-[12.5px] font-semibold transition-all ${
                  txForm.jenis === 'MASUK'
                    ? 'border-[#0F766E] bg-[#0F766E] text-white shadow-sm'
                    : 'border-[#143632]/12 bg-white/65 text-[#4E6661] hover:bg-white'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Uang Masuk</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onTxFormChange({ ...txForm, jenis: 'KELUAR' })
                }
                className={`flex items-center justify-center gap-2 rounded-[15px] border py-2.5 text-[12.5px] font-semibold transition-all ${
                  txForm.jenis === 'KELUAR'
                    ? 'border-[#9F3542] bg-[#9F3542] text-white shadow-sm'
                    : 'border-[#143632]/12 bg-white/65 text-[#4E6661] hover:bg-white'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Uang Keluar</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="tx-nominal" className={labelBaseClass}>
              Nominal
            </label>
            <RupiahInput
              id="tx-nominal"
              value={txForm.nominal}
              onChange={(raw) =>
                onTxFormChange({ ...txForm, nominal: raw })
              }
              placeholder="0"
              required
            />
          </div>

          <div>
            <label htmlFor="tx-uraian" className={labelBaseClass}>
              Uraian Transaksi
            </label>
            <input
              id="tx-uraian"
              type="text"
              placeholder="Contoh: Belanja ATK Kantor"
              value={txForm.uraian}
              onChange={(e) =>
                onTxFormChange({ ...txForm, uraian: e.target.value })
              }
              required
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="tx-tanggal" className={labelBaseClass}>
              Tanggal Transaksi
            </label>
            <input
              id="tx-tanggal"
              type="date"
              value={txForm.tanggal}
              onChange={(e) =>
                onTxFormChange({ ...txForm, tanggal: e.target.value })
              }
              required
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="tx-keterangan" className={labelBaseClass}>
              Keterangan Tambahan{' '}
              <span className="font-normal text-[#4E6661]">(opsional)</span>
            </label>
            <textarea
              id="tx-keterangan"
              placeholder="Catatan nomor nota / kuitansi..."
              value={txForm.keterangan}
              onChange={(e) =>
                onTxFormChange({ ...txForm, keterangan: e.target.value })
              }
              className="h-20 w-full resize-none rounded-[15px] border border-[#143632]/12 bg-white/75 p-3.5 text-[13px] text-[#143632] outline-none transition-all placeholder:text-[#4E6661]/55 focus:border-[#0F766E] focus:bg-white focus:ring-3 focus:ring-[#0F766E]/12"
            />
          </div>
        </form>
      </Modal>

      {/* ======================================================
          2. MODAL SALDO AWAL
      ====================================================== */}
      <Modal
        isOpen={modalSaldoOpen}
        onClose={onCloseSaldoModal}
        title="Kelola Saldo Awal"
        subtitle={`Penyesuaian saldo awal periode ${saldoForm.periode}`}
        footer={
          <>
            <button
              type="button"
              onClick={onCloseSaldoModal}
              className="rounded-[14px] px-4 py-2.5 text-[12.5px] font-semibold text-[#4E6661] transition-colors hover:bg-[#143632]/6 hover:text-[#143632]"
            >
              Batal
            </button>
            <button
              type="submit"
              form="formSaldo"
              disabled={submitting}
              className="rounded-[14px] bg-[#134E4A] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(19,78,74,0.35)] transition-all hover:bg-[#0F766E] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </>
        }
      >
        <form
          id="formSaldo"
          onSubmit={onSaveSaldoAwal}
          className="space-y-4"
        >
          <div>
            <label htmlFor="saldo-periode" className={labelBaseClass}>
              Periode
            </label>
            <input
              id="saldo-periode"
              type="text"
              value={saldoForm.periode}
              readOnly
              className="h-11 w-full rounded-[15px] border border-[#143632]/10 bg-[#143632]/6 px-3.5 text-[13px] font-semibold text-[#4E6661] outline-none"
            />
          </div>

          <div>
            <label htmlFor="saldo-nominal" className={labelBaseClass}>
              Saldo Awal
            </label>
            <RupiahInput
              id="saldo-nominal"
              value={saldoForm.saldoAwal}
              onChange={(raw) =>
                onSaldoFormChange({ ...saldoForm, saldoAwal: raw })
              }
              placeholder="0"
              required
            />
          </div>

          <div>
            <label htmlFor="saldo-keterangan" className={labelBaseClass}>
              Keterangan
            </label>
            <textarea
              id="saldo-keterangan"
              placeholder="Dasar penetapan saldo awal..."
              value={saldoForm.keterangan}
              onChange={(e) =>
                onSaldoFormChange({
                  ...saldoForm,
                  keterangan: e.target.value,
                })
              }
              className="h-20 w-full resize-none rounded-[15px] border border-[#143632]/12 bg-white/75 p-3.5 text-[13px] text-[#143632] outline-none transition-all placeholder:text-[#4E6661]/55 focus:border-[#0F766E] focus:bg-white focus:ring-3 focus:ring-[#0F766E]/12"
            />
          </div>
        </form>
      </Modal>

      {/* ======================================================
          3. MODAL TAMBAH USER
      ====================================================== */}
      <Modal
        isOpen={modalUserOpen}
        onClose={onCloseUserModal}
        title="Tambah Pengguna Baru"
        subtitle="Buat akun akses pegawai KP2KP Majenang"
        footer={
          <>
            <button
              type="button"
              onClick={onCloseUserModal}
              className="rounded-[14px] px-4 py-2.5 text-[12.5px] font-semibold text-[#4E6661] transition-colors hover:bg-[#143632]/6 hover:text-[#143632]"
            >
              Batal
            </button>
            <button
              type="submit"
              form="formUser"
              disabled={submitting}
              className="rounded-[14px] bg-[#134E4A] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_6px_16px_-4px_rgba(19,78,74,0.35)] transition-all hover:bg-[#0F766E] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </>
        }
      >
        <form id="formUser" onSubmit={onSaveUser} className="space-y-4">
          <div>
            <label htmlFor="user-nama" className={labelBaseClass}>
              Nama Lengkap
            </label>
            <input
              id="user-nama"
              type="text"
              placeholder="Nama pegawai"
              value={userForm.nama}
              onChange={(e) =>
                onUserFormChange({ ...userForm, nama: e.target.value })
              }
              required
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="user-username" className={labelBaseClass}>
              Username (NIP Pendek)
            </label>
            <input
              id="user-username"
              type="text"
              placeholder="NIP Pendek"
              value={userForm.username}
              onChange={(e) =>
                onUserFormChange({ ...userForm, username: e.target.value })
              }
              required
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="user-password" className={labelBaseClass}>
              Kata Sandi
            </label>
            <input
              id="user-password"
              type="password"
              placeholder="Kata sandi"
              value={userForm.password}
              onChange={(e) =>
                onUserFormChange({ ...userForm, password: e.target.value })
              }
              required
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="user-role" className={labelBaseClass}>
              Peran Akses
            </label>
            <select
              id="user-role"
              value={userForm.role}
              onChange={(e) =>
                onUserFormChange({ ...userForm, role: e.target.value })
              }
              className={`${inputBaseClass} font-semibold`}
            >
              <option value="BENDAHARA">BENDAHARA</option>
              <option value="USER">USER</option>
              <option value="SUPER ADMIN">SUPER ADMIN</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          4. MODAL KONFIRMASI BATAL TRANSAKSI
      ====================================================== */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={onCloseCancelModal}
        title="Batalkan Transaksi?"
        footer={
          <>
            <button
              type="button"
              onClick={onCloseCancelModal}
              disabled={submitting}
              className="rounded-[14px] px-4 py-2.5 text-[12.5px] font-semibold text-[#4E6661] transition-colors hover:bg-[#143632]/6"
            >
              Tidak
            </button>
            <button
              type="button"
              onClick={onConfirmCancel}
              disabled={submitting}
              className="rounded-[14px] bg-[#9F3542] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? 'Memproses...' : 'Ya, Batalkan'}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-[16px] bg-[#9F3542]/8 p-3.5 text-[#9F3542]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-[12.5px] leading-relaxed">
                Transaksi yang dibatalkan akan ditandai <strong>BATAL</strong>{' '}
                dan tidak dihitung dalam saldo kas.
              </div>
            </div>

            <div className="kas-glass-clear rounded-[16px] p-3.5 text-[12.5px] space-y-1">
              <div className="font-semibold text-[#143632]">
                {cancelTarget.uraian}
              </div>
              <div className="flex items-center justify-between text-[11.5px] text-[#4E6661]">
                <span>{cancelTarget.tanggal}</span>
                <span className="kas-num font-semibold text-[#143632]">
                  {formatRupiah(cancelTarget.nominal)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================
          5. MODAL KONFIRMASI LOGOUT
      ====================================================== */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={onCloseLogoutModal}
        title="Keluar dari Aplikasi?"
        footer={
          <>
            <button
              type="button"
              onClick={onCloseLogoutModal}
              disabled={loggingOut}
              className="rounded-[14px] px-4 py-2.5 text-[12.5px] font-semibold text-[#4E6661] transition-colors hover:bg-[#143632]/6"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirmLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#9F3542] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              <span>{loggingOut ? 'Keluar...' : 'Keluar Akun'}</span>
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-[#4E6661]">
          Sesi akun Anda saat ini akan diakhiri dan Anda akan diarahkan kembali
          ke halaman masuk.
        </p>
      </Modal>

      {/* ======================================================
          6. MODAL PANDUAN PASANG APLIKASI (PWA)
      ====================================================== */}
      <Modal
        isOpen={installModalOpen}
        onClose={onCloseInstallModal}
        title="Pasang di Layar Utama"
        subtitle="Gunakan Kas KP2KP seperti aplikasi bawaan HP"
        footer={
          <button
            type="button"
            onClick={onCloseInstallModal}
            className="rounded-[14px] bg-[#134E4A] px-5 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#0F766E]"
          >
            Mengerti
          </button>
        }
      >
        <div className="space-y-3 text-[12.5px] text-[#143632]">
          <div className="kas-glass-clear flex items-start gap-3 rounded-[16px] p-3.5">
            <div className="kas-glass-orb flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#0F766E]">
              <Share className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold">iPhone / iPad (Safari)</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#4E6661]">
                Ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah
                Safari, lalu pilih <strong>Tambahkan ke Layar Utama</strong>{' '}
                (<em>Add to Home Screen</em>).
              </p>
            </div>
          </div>

          <div className="kas-glass-clear flex items-start gap-3 rounded-[16px] p-3.5">
            <div className="kas-glass-orb flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9A7B1C]">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <div className="font-semibold">Android (Chrome)</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#4E6661]">
                Ketuk ikon menu <strong>⋮</strong> di kanan atas Chrome, lalu
                pilih <strong>Tambahkan ke layar utama</strong> atau{' '}
                <strong>Instal aplikasi</strong>.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
