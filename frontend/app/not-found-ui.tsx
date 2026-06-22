'use client';

import Link from 'next/link';

export default function NotFoundUI() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-space-950 px-6 py-12 md:px-12 lg:px-24 overflow-hidden">

      {/* ── Decorative Glows ──────────────────────────── */}
      <div className="absolute top-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-400/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-gold/5 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(0,212,255,0.04)_0%,transparent_80%)] pointer-events-none" />

      {/* ── Decorative tiny star dots ─────────────────── */}
      <div className="absolute top-12 left-12 h-1 w-1 rounded-full bg-white opacity-40 pointer-events-none" />
      <div className="absolute top-24 right-24 h-1.5 w-1.5 rounded-full bg-gold opacity-50 pointer-events-none" />
      <div className="absolute bottom-20 left-32 h-1 w-1 rounded-full bg-cyan-400 opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 right-12 h-1 w-1 rounded-full bg-white opacity-30 pointer-events-none" />
      <div className="absolute bottom-1/3 left-8 h-1.5 w-1.5 rounded-full bg-gold opacity-30 pointer-events-none" />

      {/* ── Main Two-Column Layout ────────────────────── */}
      <div className="relative z-10 flex max-w-6xl w-full flex-col-reverse md:flex-row items-center justify-between gap-10 lg:gap-20">

        {/* Left: Text Content */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-8 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">Page Not Found</span>
          </div>

          {/* 404 Heading */}
          <h1
            className="font-display font-black leading-none select-none"
            style={{
              fontSize: 'clamp(5rem, 12vw, 9rem)',
              background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.2))',
            }}
          >
            404
          </h1>

          {/* Sub heading */}
          <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide text-white">
            Lost in Space?
          </h2>

          {/* Description */}
          <p className="mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-slate-400 max-w-md">
            It looks like you&apos;ve wandered off the map. The itinerary for this
            destination doesn&apos;t exist, or the route has been moved.
          </p>

          {/* Divider line */}
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-gold/60 to-transparent md:mx-0 mx-auto" />

          {/* Golden Button */}
          <div className="mt-8 w-full sm:w-auto">
            <Link
              href="/landing"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl font-bold px-8 py-4 text-space-950 text-base md:text-lg
                         transition-all duration-300 hover:scale-105 active:scale-95
                         focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-space-950"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
                boxShadow: '0 0 24px rgba(255,215,0,0.35), 0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              ← Return to Landing Page
            </Link>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="animate-float"
            style={{
              width: 'clamp(220px, 35vw, 480px)',
              height: 'clamp(220px, 35vw, 480px)',
            }}
          >
            <img
              src="/not-found.svg"
              alt="not found"
              className="h-full w-full object-contain"
              style={{ filter: 'drop-shadow(0 12px 40px rgba(0,212,255,0.18)) drop-shadow(0 0 60px rgba(255,215,0,0.08))' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
