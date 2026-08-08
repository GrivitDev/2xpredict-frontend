'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import api from '@/lib/axios';

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Trophy,
  TrendingUp,
  TriangleAlert,
  XCircle,
} from 'lucide-react';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [redirect, setRedirect] = useState(3);

  const validations = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const passwordStrength = useMemo(() => {
    const score = Object.values(validations).filter(Boolean).length;

    if (score <= 2)
      return {
        text: 'Weak',
        width: '35%',
        color: 'bg-red-500',
      };

    if (score <= 4)
      return {
        text: 'Medium',
        width: '70%',
        color: 'bg-yellow-500',
      };

    return {
      text: 'Strong',
      width: '100%',
      color: 'bg-green-500',
    };
  }, [validations]);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const formValid =
    Object.values(validations).every(Boolean) &&
    passwordsMatch;

  useEffect(() => {
    if (!success) return;

    if (redirect === 0) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      setRedirect((v) => v - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [success, redirect, router]);

  const handleReset = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!Object.values(validations).every(Boolean)) {
      setError(
        'Please satisfy all password requirements.',
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        '/auth/reset-password',
        {
          email,
          token,
          newPassword: password,
        },
      );

      setSuccess(res.data.message);
      setRedirect(3);

    } catch (err: any) {

      const message =
        err?.response?.data?.message;

      switch (message) {

        case 'Invalid token':
          setError(
            'This reset link is invalid.'
          );
          break;

        case 'Token expired':
          setError(
            'Your reset link has expired. Please request another one.'
          );
          break;

        case 'User not found':
          setError(
            'No account was found.'
          );
          break;

        default:
          setError(
            message ||
              'Unable to reset password. Please try again.'
          );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-12 pb-12 text-foreground">

      {/* Background */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[180px]" />

        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[180px]" />

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/5 blur-[220px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6">

        {/* LEFT */}

        <div className="hidden flex-1 lg:block">

          <div className="max-w-xl">

            <div className="mb-4 flex justify-center">

              <Image
                src="/images/ball5.png"
                alt="Football Predictions"
                width={560}
                height={170}
                className="max-w-full object-contain"
                priority
              />

            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight">

              Secure

              <br />

              <span className="bg-gradient-to-r from-primary via-primary to-cyan-500 bg-clip-text text-6xl text-transparent">

                Your Account.

              </span>

            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">

              Create a new secure password to
              continue accessing your football
              prediction account.

            </p>

            <div className="mt-12 grid grid-cols-3 gap-5">

              <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur-xl">

                <ShieldCheck className="mb-3 h-7 w-7 text-primary" />

                <h3 className="text-2xl font-bold">

                  100%

                </h3>

                <p className="text-sm text-muted-foreground">

                  Secure

                </p>

              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur-xl">

                <TrendingUp className="mb-3 h-7 w-7 text-cyan-500" />

                <h3 className="text-2xl font-bold">

                  Fast

                </h3>

                <p className="text-sm text-muted-foreground">

                  Recovery

                </p>

              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur-xl">

                <Trophy className="mb-3 h-7 w-7 text-yellow-500" />

                <h3 className="text-2xl font-bold">

                  Safe

                </h3>

                <p className="text-sm text-muted-foreground">

                  Access

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* FORM */}

        <div className="flex flex-1 justify-center lg:justify-end">

          <form
            onSubmit={handleReset}
            className="w-full max-w-md rounded-3xl border border-border bg-card/70 p-10 shadow-2xl backdrop-blur-2xl"
          >

            <div className="mb-8 text-center">

              <div className="mb-5 flex justify-center">

                <Image
                  src="/logo1.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                  priority
                />

              </div>

              <h2 className="text-4xl font-black">

                Reset Password

              </h2>

              <p className="mt-2 text-muted-foreground">

                Create a new secure password.

              </p>

            </div>

                        {/* PASSWORD */}

            <div className="relative mb-5">

              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
                className={`h-14 w-full rounded-xl border bg-background/80 pl-12 pr-14 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 focus-visible:ring-2 ${
                  error
                    ? 'border-destructive focus-visible:ring-destructive/30'
                    : 'border-input focus-visible:border-ring focus-visible:ring-ring/30'
                }`}
              />

              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="relative mb-6">

              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!error}
                className={`h-14 w-full rounded-xl border bg-background/80 pl-12 pr-14 text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 focus-visible:ring-2 ${
                  error
                    ? 'border-destructive focus-visible:ring-destructive/30'
                    : 'border-input focus-visible:border-ring focus-visible:ring-ring/30'
                }`}
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

            {/* PASSWORD STRENGTH */}

            {password && (

              <div className="mb-6">

                <div className="mb-2 flex items-center justify-between text-sm">

                  <span className="text-muted-foreground">
                    Password Strength
                  </span>

                  <span
                    className={`font-semibold ${
                      passwordStrength.text === 'Strong'
                        ? 'text-green-500'
                        : passwordStrength.text === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {passwordStrength.text}
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">

                  <div
                    className={`h-full rounded-full transition-all duration-500 ${passwordStrength.color}`}
                    style={{
                      width: passwordStrength.width,
                    }}
                  />

                </div>

              </div>

            )}

            {/* PASSWORD REQUIREMENTS */}

            <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-5">

              <h3 className="mb-4 font-semibold">
                Password Requirements
              </h3>

              <div className="space-y-3">

                <div className="flex items-center gap-3">

                  {validations.length ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}

                  <span
                    className={
                      validations.length
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }
                  >
                    At least 8 characters
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  {validations.uppercase ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}

                  <span
                    className={
                      validations.uppercase
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }
                  >
                    One uppercase letter
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  {validations.lowercase ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}

                  <span
                    className={
                      validations.lowercase
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }
                  >
                    One lowercase letter
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  {validations.number ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}

                  <span
                    className={
                      validations.number
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }
                  >
                    One number
                  </span>

                </div>

                <div className="flex items-center gap-3">

                  {validations.special ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}

                  <span
                    className={
                      validations.special
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }
                  >
                    One special character
                  </span>

                </div>

              </div>

            </div>

            {/* PASSWORD MATCH */}

            {confirmPassword && (

              passwordsMatch ? (

                <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-500">

                  <CheckCircle2 className="h-5 w-5" />

                  <span className="font-medium">
                    Passwords match.
                  </span>

                </div>

              ) : (

                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">

                  <XCircle className="h-5 w-5" />

                  <span className="font-medium">
                    Passwords do not match.
                  </span>

                </div>

              )

            )}

                        {/* ERROR MESSAGE */}

            {error && (
              <div
                className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive animate-in slide-in-from-top-2 duration-300"
                role="alert"
                aria-live="assertive"
              >
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />

                <div>

                  <p className="font-semibold">
                    Unable to reset password
                  </p>

                  <p className="mt-1 text-sm">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {success && (
              <div
                className="mb-6 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-500 animate-in slide-in-from-top-2 duration-300"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div>

                  <p className="font-semibold">
                    Password Updated Successfully
                  </p>

                  <p className="mt-1 text-sm">
                    {success}
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    Redirecting to login in {redirect}...
                  </p>

                </div>

              </div>
            )}

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              disabled={loading || !formValid}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary text-lg font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Resetting Password...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={20} />
                  Password Updated
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* PASSWORD TIPS */}

            <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">

              <h3 className="mb-3 flex items-center gap-2 font-semibold">

                <ShieldCheck className="h-5 w-5 text-primary" />

                Security Tips

              </h3>

              <ul className="space-y-2 text-sm text-muted-foreground">

                <li>
                  • Don't reuse passwords from other websites.
                </li>

                <li>
                  • Make your password unique and difficult to guess.
                </li>

                <li>
                  • Consider using a password manager.
                </li>

              </ul>

            </div>

            {/* FOOTER */}

            <p className="mt-8 text-center text-sm text-muted-foreground">

              Remember your password?{' '}

              <Link
                href="/login"
                className="font-semibold text-primary transition hover:opacity-80"
              >
                Back to Login
              </Link>

            </p>

          </form>

        </div>

      </div>

    </main>
  );
}