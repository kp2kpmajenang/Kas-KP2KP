'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /transaksi → redirect ke /dashboard dengan tab transaksi aktif.
 * Deep-link support melalui localStorage flag.
 */
export default function TransaksiPage() {
  const router = useRouter();

  useEffect(() => {
    // Set active tab via sessionStorage agar dashboard langsung buka tab transaksi
    sessionStorage.setItem('dashboard_tab', 'transaksi');
    router.replace('/dashboard');
  }, [router]);

  return null;
}
