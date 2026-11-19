'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6';
import toast from 'react-hot-toast';

import AuthShell, { AuthFeedback, authButtonClassName, authInputClassName } from '@/components/auth/AuthShell';
import { loginUser } from '@/services/auth.service';
import { useAuth } from '@/providers/auth-provider';

function getErrorMessage(error: unknown): string {
  const value = error as { response?: { data?: { message?: unknown } }; message?: string };
  const message = value?.response?.data?.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  if (typeof message === 'string' && message.trim()) return message;
  return value?.message || 'Unable to sign in right now. Please try again.';
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') {
      toast.success('Your email is verified. You can sign in.');
      params.delete('verified');
      const query = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Enter your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({ email: normalizedEmail, password });
      if (!response?.token) {
        throw new Error('The server did not return a valid sign-in session. Please try again.');
      }

      // Keep the backend's verification state immediately available to the UI.
      login(response.token, response.user);

      if (response.user?.isVerified !== true) {
        toast('You are signed in. Verify your email to unlock restricted account actions.', { duration: 6500 });
      } else {
        toast.success('Signed in successfully.');
      }

      router.replace(response.user?.role === 'admin' ? '/admin' : '/');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to 2xPredict"
      description="Access your account, predictions and football insights."
      footer={<>New to 2xPredict? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold">Email address</label>
          <div className="relative">
            <FaEnvelope aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError(''); }}
              placeholder="you@example.com"
              className={`${authInputClassName} pl-10`}
              required
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-xs font-semibold">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <FaLock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); setError(''); }}
              placeholder="Your password"
              className={`${authInputClassName} pl-10 pr-11`}
              required
            />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
              {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {error ? <div role="alert"><AuthFeedback kind="error">{error}</AuthFeedback></div> : null}

        <button type="submit" className={authButtonClassName} disabled={loading}>
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading ? <FaArrowRight className="h-3.5 w-3.5" /> : null}
        </button>

        <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          You can use the platform before verifying your email. Some account actions remain locked until your email is verified.
          <div className="mt-1.5">
            <Link href={`/verify-email${email.trim() ? `?email=${encodeURIComponent(email.trim().toLowerCase())}` : ''}`} className="font-semibold text-primary hover:underline">Verify your email</Link>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
