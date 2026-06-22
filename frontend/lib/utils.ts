import { z } from 'zod';
import type { Interest, Budget } from './types';

export const VALID_INTERESTS: { value: Interest; label: string; icon: string }[] = [
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'food', label: 'Food & Dining', icon: '🍜' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'relaxation', label: 'Relaxation', icon: '🧘' },
  { value: 'nightlife', label: 'Nightlife', icon: '🎶' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'history', label: 'History', icon: '📜' },
  { value: 'art', label: 'Art', icon: '🎨' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧' },
];

export const VALID_BUDGETS: { value: Budget; label: string; description: string }[] = [
  { value: 'budget', label: 'Budget', description: 'Under $100/day' },
  { value: 'moderate', label: 'Moderate', description: '$100–$250/day' },
  { value: 'luxury', label: 'Luxury', description: '$250+/day' },
];

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const tripFormSchema = z.object({
  destination: z
    .string()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination cannot exceed 100 characters')
    .trim(),
  numberOfDays: z
    .number()
    .int('Number of days must be a whole number')
    .min(1, 'Trip must be at least 1 day')
    .max(30, 'Trip cannot exceed 30 days'),
  budget: z.enum(['budget', 'moderate', 'luxury'] as const, {
    errorMap: () => ({ message: 'Please select a budget level' }),
  }),
  interests: z
    .array(z.enum(['culture', 'food', 'nature', 'adventure', 'relaxation', 'nightlife', 'shopping', 'history', 'art', 'family'] as const))
    .min(1, 'Please select at least one interest')
    .max(10, 'Maximum 10 interests allowed'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type TripFormValues = z.infer<typeof tripFormSchema>;

// ─── Utility Helpers ──────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getBudgetColor(budget: Budget): string {
  const map: Record<Budget, string> = {
    budget: 'text-emerald-400',
    moderate: 'text-cyan-400',
    luxury: 'text-gold-400',
  };
  return map[budget];
}

export function getStarRating(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
