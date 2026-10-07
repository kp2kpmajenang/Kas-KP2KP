'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /audit-log → redirect ke /dashboard dengan tab kelola aktif (Super Admin only).
 */
export default function AuditLogPage() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.setItem('dashboard_tab', 'kelola');
    router.replace('/dashboard');
  }, [router]);

  return null;
}
