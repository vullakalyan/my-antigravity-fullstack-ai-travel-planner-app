'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/lib/api';

// Root page: redirect to dashboard if logged in, else to landing page
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/landing');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-space-700 border-t-cyan-400" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
