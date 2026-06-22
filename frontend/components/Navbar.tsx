'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Map, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { tokenStorage } from '@/lib/api';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!tokenStorage.get());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-space-950/80 backdrop-blur-md border-b border-white/10 py-3 shadow-glass'
          : 'bg-transparent py-5'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 transition-transform group-hover:scale-105">
                <Map className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold tracking-wide text-white">
              AI Travel Planner
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              How it Works
            </a>
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Features
            </a>
            <div className="h-4 w-px bg-white/20" />
            
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary px-5 py-2 text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary px-5 py-2 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'absolute top-full left-0 right-0 border-b border-white/10 bg-space-950/95 backdrop-blur-xl transition-all duration-300 md:hidden',
          isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
        )}
      >
        <div className="flex flex-col p-4 space-y-4">
          <a
            href="#how-it-works"
            className="p-2 text-base font-medium text-slate-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How it Works
          </a>
          <a
            href="#features"
            className="p-2 text-base font-medium text-slate-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </a>
          <div className="h-px bg-white/10 my-2" />
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary justify-center w-full">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="btn-secondary justify-center w-full">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary justify-center w-full">
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
