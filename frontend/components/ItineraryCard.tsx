'use client';
import { useState } from 'react';
import { Clock, DollarSign, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { DayItinerary, Activity } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import clsx from 'clsx';

interface ItineraryCardProps {
  day: DayItinerary;
  isEditable?: boolean;
  onAddActivity?: (dayNumber: number) => void;
  onRemoveActivity?: (dayNumber: number, activityId: string) => void;
}

export default function ItineraryCard({
  day,
  isEditable = false,
  onAddActivity,
  onRemoveActivity,
}: ItineraryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const dayTotal = day.activities.reduce(
    (sum, act) => sum + (act.estimatedCost ?? 0),
    0
  );

  return (
    <div className="glass-card-cyan overflow-hidden">
      {/* Day Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`day-${day.day}-content`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10">
            <span className="font-display text-sm font-bold text-cyan-400">{day.day}</span>
          </div>
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Day {day.day}
            </p>
            <h3 className="text-base font-semibold text-white">{day.title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1">
            <DollarSign className="h-3 w-3 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">{formatCurrency(dayTotal)}</span>
          </div>
          <span className="text-slate-500">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </div>
      </button>

      {/* Activities List */}
      {isExpanded && (
        <div
          id={`day-${day.day}-content`}
          className="border-t border-white/5 divide-y divide-white/5"
        >
          {day.activities.map((activity, index) => (
            <ActivityRow
              key={activity._id ?? index}
              activity={activity}
              index={index}
              isEditable={isEditable}
              onRemove={
                onRemoveActivity
                  ? () => onRemoveActivity(day.day, activity._id ?? String(index))
                  : undefined
              }
            />
          ))}

          {isEditable && onAddActivity && (
            <div className="px-6 py-3">
              <button
                type="button"
                onClick={() => onAddActivity(day.day)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-cyan-400/20 py-2.5 text-sm text-slate-500 transition-colors hover:border-cyan-400/40 hover:text-cyan-400"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Activity Row ───────────────────────────────────────────────────────────────

interface ActivityRowProps {
  activity: Activity;
  index: number;
  isEditable: boolean;
  onRemove?: () => void;
}

function ActivityRow({ activity, index, isEditable, onRemove }: ActivityRowProps) {
  return (
    <div
      className={clsx(
        'group flex gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]',
        index === 0 && 'pt-4'
      )}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/5">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-cyan-400/20 to-transparent min-h-[16px]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-cyan-400/70 mb-0.5">{activity.time}</p>
            <h4 className="text-sm font-semibold text-white">{activity.title}</h4>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {formatCurrency(activity.estimatedCost)}
            </span>
            {isEditable && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400"
                aria-label={`Remove ${activity.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{activity.description}</p>
      </div>
    </div>
  );
}
