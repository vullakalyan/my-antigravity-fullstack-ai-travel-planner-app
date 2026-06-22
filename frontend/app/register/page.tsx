'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerSchema, type RegisterFormValues } from '@/lib/utils';
import { authApi, tokenStorage, ApiError } from '@/lib/api';
import clsx from 'clsx';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const token = tokenStorage.get();
    if (token) router.replace('/dashboard');
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const data = await authApi.register({
        email: values.email,
        password: values.password,
        name: values.name || undefined,
      });
      tokenStorage.set(data.token);
      tokenStorage.setUser(data.user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-space-950 p-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div
        className="absolute -top-40 right-1/4 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl border border-cyan-400/40 bg-cyan-400/10 flex items-center justify-center">
                <span className="font-display text-lg font-bold text-cyan-400">AI</span>
              </div>
              <div className="absolute -inset-1 rounded-xl bg-cyan-400/10 blur-sm animate-pulse" />
            </div>
            <span className="font-display text-lg font-semibold tracking-wider text-white">
              AI Travel Planner
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start planning incredible journeys powered by AI</p>
        </div>

        <div className="glass-card-cyan p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {serverError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-fade-in">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{serverError}</p>
              </div>
            )}

            {/* Name (optional) */}
            <div>
              <label htmlFor="name" className="form-label">
                Full name <span className="text-slate-600 normal-case font-normal tracking-normal">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className={clsx('form-input', errors.name && 'error')}
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="form-error"><AlertCircle className="h-3 w-3" />{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={clsx('form-input', errors.email && 'error')}
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="form-error"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={clsx('form-input pr-11', errors.password && 'error')}
                  {...register('password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength indicators */}
              {passwordValue.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {PASSWORD_REQUIREMENTS.map((req) => {
                    const met = req.test(passwordValue);
                    return (
                      <div key={req.label} className="flex items-center gap-1.5">
                        {met ? (
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                        ) : (
                          <div className="h-3 w-3 shrink-0 rounded-full border border-slate-600" />
                        )}
                        <span className={clsx('text-xs', met ? 'text-emerald-400' : 'text-slate-500')}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.password && (
                <p className="form-error mt-1"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={clsx('form-input pr-11', errors.confirmPassword && 'error')}
                  {...register('confirmPassword')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error"><AlertCircle className="h-3 w-3" />{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
              ) : (
                <><UserPlus className="h-4 w-4" />Create Account</>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/landing" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
