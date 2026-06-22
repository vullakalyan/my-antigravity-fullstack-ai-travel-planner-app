'use client';
import { Star, DollarSign } from 'lucide-react';
import type { SuggestedHotel } from '@/lib/types';
import clsx from 'clsx';

interface HotelCardProps {
  hotel: SuggestedHotel;
  rank?: number;
}

export default function HotelCard({ hotel, rank }: HotelCardProps) {
  const fullStars = Math.floor(hotel.rating);
  const hasHalf = hotel.rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="glass-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="p-5">
        {/* Rank badge + hotel name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {rank !== undefined && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400/30 bg-gold-400/10 text-xs font-bold text-gold-400">
                {rank}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-cyan-100 transition-colors">
                {hotel.name}
              </h3>
              {/* Star Rating */}
              <div className="mt-1 flex items-center gap-1">
                {Array.from({ length: fullStars }).map((_, i) => (
                  <Star key={`full-${i}`} className="h-3 w-3 fill-gold-400 text-gold-400" />
                ))}
                {hasHalf && (
                  <Star className="h-3 w-3 fill-gold-400/50 text-gold-400" />
                )}
                {Array.from({ length: emptyStars }).map((_, i) => (
                  <Star key={`empty-${i}`} className="h-3 w-3 text-slate-600" />
                ))}
                <span className="ml-1 text-xs font-medium text-slate-400">
                  {hotel.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1.5">
            <DollarSign className="h-3 w-3 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">{hotel.priceRange}</span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-slate-400">{hotel.description}</p>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 60%)' }}
      />
    </div>
  );
}
