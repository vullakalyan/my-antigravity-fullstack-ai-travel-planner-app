'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/lib/utils';
import { authApi, tokenStorage, ApiError } from '@/lib/api';
import clsx from 'clsx';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      setSessionExpired(true);
    }
    // If already logged in, go to dashboard
    const token = tokenStorage.get();
    if (token) {
      router.replace('/dashboard');
    }
  }, [router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const data = await authApi.login(values);
      tokenStorage.set(data.token);
      tokenStorage.setUser(data.user);
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      router.replace(redirect);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-space-950 p-4">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to continue planning your adventures</p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
            <p className="text-sm text-yellow-300">Your session has expired. Please sign in again.</p>
          </div>
        )}

        {/* Card */}
        <div className="glass-card-cyan p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-fade-in">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{serverError}</p>
              </div>
            )}

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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={clsx('form-input pr-11', errors.password && 'error')}
                  {...register('password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error"><AlertCircle className="h-3 w-3" />{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
              ) : (
                <><LogIn className="h-4 w-4" />Sign In</>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
            Create one free
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
