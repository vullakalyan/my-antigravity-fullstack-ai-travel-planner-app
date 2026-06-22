'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Wallet, Heart, Trash2, BedDouble, AlertCircle, Edit, MapPin } from 'lucide-react';
import { tripsApi, ApiError } from '@/lib/api';
import type { Trip } from '@/lib/types';
import { formatCurrency, getBudgetColor } from '@/lib/utils';
import ItineraryCard from '@/components/ItineraryCard';
import HotelCard from '@/components/HotelCard';

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        if (typeof id === 'string') {
          const data = await tripsApi.getById(id);
          setTrip(data);
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load trip details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  const handleDelete = async () => {
    if (!trip) return;
    if (!window.confirm('Are you sure you want to delete this trip permanently?')) return;

    try {
      await tripsApi.delete(trip._id);
      router.replace('/dashboard');
    } catch (err: unknown) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete trip');
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityId: string) => {
    if (!trip) return;
    
    // Optimistic update
    const updatedItinerary = trip.itinerary.map(day => {
      if (day.day === dayNumber) {
        return { ...day, activities: day.activities.filter(a => a._id !== activityId && a.title !== activityId) };
      }
      return day;
    });

    setTrip({ ...trip, itinerary: updatedItinerary });

    try {
      await tripsApi.update(trip._id, { itinerary: updatedItinerary });
    } catch (err) {
      alert('Failed to remove activity. Refreshing data...');
      // Revert on fail (could refetch here)
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-32 skeleton" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500/50" />
        <h3 className="mb-2 text-lg font-semibold text-white">Oops! Something went wrong</h3>
        <p className="mb-6 text-slate-400">{error || 'Trip not found.'}</p>
        <button onClick={() => router.push('/dashboard')} className="btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* ── Header Section ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-space-950 p-8 sm:p-10 shadow-glass">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-400/10 border border-cyan-400/30">
                <MapPin className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {trip.destination}
                </h1>
                <p className="text-cyan-400 font-medium tracking-wide mt-1">
                  {trip.numberOfDays} Days Adventure
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-slate-500" />
                <span className={`font-semibold capitalize ${getBudgetColor(trip.budget)}`}>
                  {trip.budget} Budget
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-slate-500" />
                <span className="capitalize">{trip.interests.join(' • ')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditable(!isEditable)}
              className="btn-secondary"
            >
              <Edit className="h-4 w-4" />
              {isEditable ? 'Done Editing' : 'Edit Trip'}
            </button>
            <button onClick={handleDelete} className="btn-danger">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* ── Budget & Overview Grid ── */}
      {trip.estimatedBudget && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-emerald-400 rounded-full" />
            <h2 className="text-2xl font-bold text-white">Estimated Budget</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card md:col-span-1 p-6 border-emerald-400/20 flex flex-col justify-center text-center">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">Total Estimate</p>
              <p className="text-4xl font-display font-bold text-emerald-400 glow-emerald">
                {formatCurrency(trip.estimatedBudget.total)}
              </p>
            </div>
            
            <div className="glass-card md:col-span-2 p-6">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">Breakdown</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Object.entries(trip.estimatedBudget.breakdown).map(([category, amount]) => (
                  <div key={category} className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-500 capitalize mb-1">{category}</p>
                    <p className="font-semibold text-white">{formatCurrency(amount as number)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Hotel Suggestions ── */}
      {trip.suggestedHotels && trip.suggestedHotels.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gold-400 rounded-full" />
            <h2 className="text-2xl font-bold text-white">Suggested Stays</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trip.suggestedHotels.map((hotel, idx) => (
              <HotelCard key={hotel._id || idx} hotel={hotel} rank={idx + 1} />
            ))}
          </div>
        </section>
      )}

      {/* ── Day-by-Day Itinerary ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-cyan-400 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Day-by-Day Itinerary</h2>
        </div>
        <div className="space-y-6">
          {trip.itinerary.map((day) => (
            <ItineraryCard
              key={day._id || day.day}
              day={day}
              isEditable={isEditable}
              onRemoveActivity={handleRemoveActivity}
              onAddActivity={() => alert('Add activity modal would open here')}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
