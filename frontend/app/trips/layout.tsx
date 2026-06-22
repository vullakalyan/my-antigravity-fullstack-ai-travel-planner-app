'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Map, ArrowLeft } from 'lucide-react';
import { tokenStorage } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    tokenStorage.remove();
    router.replace('/login');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-space-950/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10">
                  <Map className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="font-display font-semibold text-white hidden sm:block">AI Travel</span>
              </Link>
              
              <div className="h-6 w-px bg-white/10" />
              
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="btn-ghost"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
