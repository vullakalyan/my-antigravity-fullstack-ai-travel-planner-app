'use client';
import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Calendar, Wallet, Heart, Loader2, Sparkles } from 'lucide-react';
import { tripFormSchema, VALID_INTERESTS, VALID_BUDGETS, type TripFormValues } from '@/lib/utils';
import type { TripInput } from '@/lib/types';
import clsx from 'clsx';

interface TripFormProps {
  onGenerate: (data: TripInput) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<TripFormValues>;
}

export default function TripForm({ onGenerate, isLoading, defaultValues }: TripFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: defaultValues?.destination ?? '',
      numberOfDays: defaultValues?.numberOfDays ?? 7,
      budget: defaultValues?.budget ?? 'moderate',
      interests: defaultValues?.interests ?? [],
    },
  });

  const numberOfDays = watch('numberOfDays');
  const selectedBudget = watch('budget');

  const onSubmit = useCallback(
    async (values: TripFormValues) => {
      await onGenerate(values as TripInput);
    },
    [onGenerate]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Destination */}
      <div>
        <label htmlFor="destination" className="form-label flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          Destination
        </label>
        <input
          id="destination"
          type="text"
          placeholder="e.g. Tokyo, Japan"
          autoComplete="off"
          className={clsx('form-input', errors.destination && 'error')}
          {...register('destination')}
          disabled={isLoading}
        />
        {errors.destination && (
          <p className="form-error">
            <span>⚠</span> {errors.destination.message}
          </p>
        )}
      </div>

      {/* Number of Days Slider */}
      <div>
        <label htmlFor="numberOfDays" className="form-label flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-cyan-400" />
            Duration
          </span>
          <span className="text-base font-bold text-cyan-400">
            {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}
          </span>
        </label>
        <div className="relative mt-3">
          <input
            id="numberOfDays"
            type="range"
            min={1}
            max={30}
            step={1}
            className="w-full accent-cyan-400 cursor-pointer"
            style={{ height: '4px' }}
            {...register('numberOfDays', { valueAsNumber: true })}
            disabled={isLoading}
          />
          <div className="mt-1.5 flex justify-between text-xs text-slate-600">
            <span>1 day</span>
            <span>15 days</span>
            <span>30 days</span>
          </div>
        </div>
        {errors.numberOfDays && (
          <p className="form-error">
            <span>⚠</span> {errors.numberOfDays.message}
          </p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-cyan-400" />
          Budget Level
        </label>
        <Controller
          name="budget"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-3 mt-2">
              {VALID_BUDGETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => field.onChange(b.value)}
                  className={clsx(
                    'relative flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-200 focus-visible:outline-none',
                    field.value === b.value
                      ? 'border-cyan-400/60 bg-cyan-400/10 shadow-cyan-glow-sm'
                      : 'border-white/10 bg-white/[0.02] hover:border-cyan-400/30 hover:bg-white/5'
                  )}
                >
                  {field.value === b.value && (
                    <div className="absolute inset-0 rounded-xl bg-cyan-400/5" />
                  )}
                  <span
                    className={clsx(
                      'text-sm font-semibold',
                      field.value === b.value ? 'text-cyan-400' : 'text-slate-300'
                    )}
                  >
                    {b.label}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">{b.description}</span>
                </button>
              ))}
            </div>
          )}
        />
        {errors.budget && (
          <p className="form-error mt-2">
            <span>⚠</span> {errors.budget.message}
          </p>
        )}
      </div>

      {/* Interests */}
      <div>
        <label className="form-label flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-cyan-400" />
          Interests
          <span className="ml-auto font-normal normal-case tracking-normal text-slate-500">
            Select 1–10
          </span>
        </label>
        <Controller
          name="interests"
          control={control}
          render={({ field }) => (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {VALID_INTERESTS.map((interest) => {
                const isSelected = field.value.includes(interest.value);
                return (
                  <button
                    key={interest.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      const current = field.value;
                      if (isSelected) {
                        field.onChange(current.filter((v) => v !== interest.value));
                      } else if (current.length < 10) {
                        field.onChange([...current, interest.value]);
                      }
                    }}
                    className={clsx(
                      'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150 focus-visible:outline-none',
                      isSelected
                        ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-slate-300'
                    )}
                  >
                    <span className="text-base leading-none">{interest.icon}</span>
                    <span className="font-medium">{interest.label}</span>
                    {isSelected && (
                      <span className="ml-auto text-cyan-400">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.interests && (
          <p className="form-error mt-2">
            <span>⚠</span> {errors.interests.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-4 text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Itinerary…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate Itinerary with AI
          </>
        )}
      </button>
    </form>
  );
}
