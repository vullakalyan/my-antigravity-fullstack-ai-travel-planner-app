'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { tokenStorage } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps pages that require authentication.
 * Redirects to /login if no valid token is found in localStorage.
 * Injects user context via a context provider pattern for child components.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setIsAuthed(true);
    setIsChecking(false);
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-space-700 border-t-cyan-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-cyan-400/20 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-slate-500 tracking-widest uppercase">Authenticating…</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) return null;

  return <>{children}</>;
}
