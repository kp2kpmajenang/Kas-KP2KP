/**
 * Database Spreadsheet Sheet Names & Application Constants
 * Source: Code.gs Kas KP2KP Majenang
 */

export const SHEET_MASTER = 'MASTER';
export const SHEET_SALDO_AWAL = 'SALDO_AWAL';
export const SHEET_TRANSAKSI = 'TRANSAKSI';
export const SHEET_USER = 'USER';
export const SHEET_AUDIT_LOG = 'AUDIT_LOG';

export const REQUIRED_SHEETS = [
  SHEET_MASTER,
  SHEET_SALDO_AWAL,
  SHEET_TRANSAKSI,
  SHEET_USER,
  SHEET_AUDIT_LOG,
] as const;

export const BULAN_AWAL_SISTEM = '2026-05';
export const APP_TIMEZONE = 'Asia/Jakarta';

export const COL_TRANSAKSI = {
  ID: 1,
  TANGGAL: 2,
  JENIS: 3,
  URAIAN: 4,
  NOMINAL: 5,
  KETERANGAN: 6,
  PERIODE: 7,
  CREATED_AT: 8,
  UPDATED_AT: 9,
  STATUS: 10,
} as const;

export const COL_USER = {
  USERNAME: 1,
  PASSWORD_HASH: 2,
  ROLE: 3,
  NAMA: 4,
  STATUS: 5,
} as const;

export const COL_SALDO_AWAL = {
  PERIODE: 1,
  SALDO_AWAL: 2,
  KETERANGAN: 3,
} as const;

export const COL_AUDIT_LOG = {
  ID_LOG: 1,
  WAKTU: 2,
  USERNAME: 3,
  NAMA: 4,
  AKSI: 5,
  TARGET: 6,
  DETAIL: 7,
  INFO: 8,
} as const;
