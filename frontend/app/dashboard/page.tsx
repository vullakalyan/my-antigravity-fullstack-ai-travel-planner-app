'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Trash2, Edit3, ArrowRight, Save, X, Plus } from 'lucide-react';
import { tripsApi, tokenStorage, ApiError } from '@/lib/api';
import type { Trip, GeneratedItinerary, TripInput } from '@/lib/types';
import TripForm from '@/components/TripForm';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'trips' | 'create'>('trips');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<GeneratedItinerary | null>(null);
  const [currentInput, setCurrentInput] = useState<TripInput | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const user = tokenStorage.getUser<{ name: string }>();

  const fetchTrips = async () => {
    setIsLoadingTrips(true);
    setError(null);
    try {
      const data = await tripsApi.list(1, 50); // Get up to 50 trips
      setTrips(data.trips);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load trips.');
      }
    } finally {
      setIsLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleGenerate = async (input: TripInput) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedPreview(null);
    try {
      const itinerary = await tripsApi.generate(input);
      setGeneratedPreview(itinerary);
      setCurrentInput(input);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during generation.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedPreview || !currentInput) return;
    setIsSaving(true);
    setError(null);
    try {
      const newTrip = await tripsApi.create({
        ...currentInput,
        ...generatedPreview,
      });
      // Redirect to the trip detail page
      router.push(`/trips/${newTrip._id}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to save trip.');
      }
      setIsSaving(false);
    }
  };

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await tripsApi.delete(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err: unknown) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete trip');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-slate-400">Manage your trips or create a new adventure.</p>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setActiveTab('trips')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'trips' ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            )}
          >
            My Trips
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              setGeneratedPreview(null);
            }}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2',
              activeTab === 'create' ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            )}
          >
            <Plus className="h-4 w-4" />
            New Trip
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Tabs Content */}
      {activeTab === 'trips' ? (
        <div className="space-y-6">
          {isLoadingTrips ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 skeleton" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <MapPin className="mb-4 h-12 w-12 text-cyan-400/50" />
              <h3 className="mb-2 text-lg font-semibold text-white">No trips yet</h3>
              <p className="mb-6 text-slate-400">You haven't planned any trips. Create your first itinerary!</p>
              <button onClick={() => setActiveTab('create')} className="btn-primary">
                Create First Trip
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Link key={trip._id} href={`/trips/${trip._id}`} className="block group">
                  <div className="glass-card-cyan h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-cyan-glow">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {trip.destination}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleDeleteTrip(trip._id, e)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Calendar className="h-4 w-4 text-cyan-400" />
                          {trip.numberOfDays} Days
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {trip.interests.slice(0, 3).map(interest => (
                            <span key={interest} className="px-2 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-slate-300 capitalize">
                              {interest}
                            </span>
                          ))}
                          {trip.interests.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-md bg-white/5 border border-white/10 text-slate-300">
                              +{trip.interests.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-slate-400">Budget: </span>
                          <span className="font-semibold text-white capitalize">{trip.budget}</span>
                        </div>
                        {trip.estimatedBudget && (
                          <div className="font-bold text-emerald-400">
                            {formatCurrency(trip.estimatedBudget.total)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8">
          {!generatedPreview ? (
            <div className="glass-card-cyan p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Create New Trip</h2>
              <TripForm onGenerate={handleGenerate} isLoading={isGenerating} defaultValues={currentInput || undefined} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-card-cyan p-6 sm:p-8 border-cyan-400/40 shadow-cyan-glow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Your Itinerary is Ready!</h2>
                    <p className="text-slate-400 mt-1">
                      {currentInput?.numberOfDays} days in {currentInput?.destination}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setGeneratedPreview(null)}
                      className="btn-secondary flex-1 sm:flex-none"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                      Discard
                    </button>
                    <button
                      onClick={handleSaveTrip}
                      className="btn-primary flex-1 sm:flex-none"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Trip</>}
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-space-950/50 border border-white/5">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Estimated Total</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {formatCurrency(generatedPreview.estimatedBudget.total)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Activities</div>
                    <div className="text-lg font-bold text-white">
                      {generatedPreview.itinerary.reduce((acc, day) => acc + day.activities.length, 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Suggested Hotels</div>
                    <div className="text-lg font-bold text-white">
                      {generatedPreview.suggestedHotels.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Day Preview (First day only) */}
              {generatedPreview.itinerary[0] && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Preview: Day 1 - {generatedPreview.itinerary[0].title}</h3>
                  <div className="space-y-4">
                    {generatedPreview.itinerary[0].activities.slice(0, 3).map((act, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="text-sm text-cyan-400 font-medium w-20 shrink-0">{act.time}</div>
                        <div>
                          <div className="font-semibold text-white text-sm">{act.title}</div>
                          <div className="text-sm text-slate-400 mt-1 line-clamp-2">{act.description}</div>
                        </div>
                      </div>
                    ))}
                    {generatedPreview.itinerary[0].activities.length > 3 && (
                      <div className="text-sm text-slate-500 pl-24 italic">
                        + {generatedPreview.itinerary[0].activities.length - 3} more activities
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-cyan-400 mb-2">Save trip to see the full {currentInput?.numberOfDays}-day itinerary!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
