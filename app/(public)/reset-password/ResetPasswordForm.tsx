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
    const score =
      Object.values(validations).filter(Boolean).length;

    if (score <= 2) {
      return {
        text: 'Weak',
        width: '35%',
        color: 'bg-red-500',
      };
    }

    if (score <= 4) {
      return {
        text: 'Medium',
        width: '70%',
        color: 'bg-yellow-500',
      };
    }

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
      setRedirect((value) => value - 1);
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

      setSuccess(
        res.data.message ||
          'Your password has been updated successfully.',
      );

      setRedirect(3);
    } catch (err: any) {
      const message =
        err?.response?.data?.message;

      switch (message) {
        case 'Invalid token':
          setError(
            'This reset link is invalid.',
          );
          break;

        case 'Token expired':
          setError(
            'Your reset link has expired. Please request another one.',
          );
          break;

        case 'User not found':
          setError(
            'No account was found.',
          );
          break;

        default:
          setError(
            message ||
              'Unable to reset password. Please try again.',
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

      {/* =====================================================
          DRAMATIC BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            -left-40
            -top-40
            h-[420px]
            w-[420px]
            rounded-full
            bg-primary/20
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-40
            h-[480px]
            w-[480px]
            rounded-full
            bg-cyan-500/15
            blur-[160px]
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[600px]
            w-[600px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-primary/[0.03]
            blur-[180px]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-background/20
            via-background/60
            to-background
          "
        />

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
        "
      >

        {/* =================================================
            FORM
        ================================================= */}

        <div className="w-full max-w-[430px]">

          {/* BRAND */}

          <div className="mb-5 text-center">

            <div
              className="
                mx-auto
                flex
                h-24
                w-24
                items-center
                justify-center
              "
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={56}
                height={56}
                className="h-45 w-45 object-contain"
                priority
              />
            </div>

            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                sm:text-3xl
              "
            >
              Reset Password
            </h1>

            <p
              className="
                mx-auto
                mt-1.5
                max-w-sm
                text-s
                leading-6
                text-muted-foreground
              "
            >
              Create a strong new password to
              secure your account.
            </p>

          </div>


          {/* =================================================
              CARD
          ================================================= */}

          <form
            onSubmit={handleReset}
            className="
              rounded-2xl
              border
              border-border/60
              bg-card/65
              p-5
              shadow-2xl
              backdrop-blur-2xl
              sm:p-6
            "
          >

            {/* ACCOUNT INDICATOR */}

            {email && (
              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-border/60
                  bg-background/40
                  px-3
                  py-2.5
                  text-xs
                  text-muted-foreground
                "
              >
                <ShieldCheck
                  className="h-4 w-4 shrink-0 text-primary"
                />

                <span className="truncate">
                  Securing {email}
                </span>
              </div>
            )}


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="space-y-3">

              {/* NEW PASSWORD */}

              <div className="relative">

                <Lock
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    h-4.5
                    w-4.5
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  aria-invalid={!!error}
                  autoComplete="new-password"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-input
                    bg-background/60
                    pl-10
                    pr-12
                    text-s
                    text-foreground
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                    focus:border-primary/50
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  onClick={() =>
                    setShowPassword(
                      !showPassword,
                    )
                  }
                  className="
                    absolute
                    right-3.5
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                    transition
                    hover:text-foreground
                  "
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="relative">

                <Lock
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    h-4.5
                    w-4.5
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value,
                    );
                    setError('');
                  }}
                  aria-invalid={!!error}
                  autoComplete="new-password"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-input
                    bg-background/60
                    pl-10
                    pr-12
                    text-s
                    text-foreground
                    outline-none
                    transition
                    placeholder:text-muted-foreground
                    focus:border-primary/50
                    focus:ring-2
                    focus:ring-primary/20
                  "
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword,
                    )
                  }
                  className="
                    absolute
                    right-3.5
                    top-1/2
                    -translate-y-1/2
                    text-muted-foreground
                    transition
                    hover:text-foreground
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>


            {/* =================================================
                STRENGTH
            ================================================= */}

            {password && (
              <div className="mt-3">

                <div
                  className="
                    mb-1.5
                    flex
                    items-center
                    justify-between
                    text-xs
                  "
                >
                  <span className="text-muted-foreground">
                    Password strength
                  </span>

                  <span
                    className={`
                      font-semibold
                      ${
                        passwordStrength.text ===
                        'Strong'
                          ? 'text-green-500'
                          : passwordStrength.text ===
                            'Medium'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }
                    `}
                  >
                    {passwordStrength.text}
                  </span>
                </div>

                <div
                  className="
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-muted
                  "
                >
                  <div
                    className={`
                      h-full
                      rounded-full
                      transition-all
                      duration-500
                      ${passwordStrength.color}
                    `}
                    style={{
                      width:
                        passwordStrength.width,
                    }}
                  />
                </div>

              </div>
            )}


            {/* =================================================
                REQUIREMENTS
            ================================================= */}

            <div
              className="
                mt-4
                rounded-xl
                border
                border-border/60
                bg-background/30
                p-3.5
              "
            >

              <div className="mb-2.5 flex items-center gap-2">

                <ShieldCheck
                  className="h-4 w-4 text-primary"
                />

                <span className="text-xs font-semibold">
                  Password requirements
                </span>

              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2">

                {[
                  {
                    valid: validations.length,
                    label: '8+ characters',
                  },
                  {
                    valid: validations.uppercase,
                    label: 'Uppercase letter',
                  },
                  {
                    valid: validations.lowercase,
                    label: 'Lowercase letter',
                  },
                  {
                    valid: validations.number,
                    label: 'One number',
                  },
                  {
                    valid: validations.special,
                    label: 'Special character',
                  },
                ].map((item) => (

                  <div
                    key={item.label}
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-1.5
                      text-xs
                    "
                  >

                    {item.valid ? (
                      <CheckCircle2
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-green-500
                        "
                      />
                    ) : (
                      <XCircle
                        className="
                          h-3.5
                          w-3.5
                          shrink-0
                          text-muted-foreground
                        "
                      />
                    )}

                    <span
                      className={
                        item.valid
                          ? 'text-green-500'
                          : 'text-muted-foreground'
                      }
                    >
                      {item.label}
                    </span>

                  </div>

                ))}

              </div>

            </div>


            {/* =================================================
                MATCH STATUS
            ================================================= */}

            {confirmPassword && (
              <div
                className={`
                  mt-3
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  text-xs
                  ${
                    passwordsMatch
                      ? 'border-green-500/20 bg-green-500/10 text-green-500'
                      : 'border-red-500/20 bg-red-500/10 text-red-500'
                  }
                `}
              >

                {passwordsMatch ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}

                <span>
                  {passwordsMatch
                    ? 'Passwords match.'
                    : 'Passwords do not match.'}
                </span>

              </div>
            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  mt-3
                  flex
                  items-start
                  gap-2.5
                  rounded-xl
                  border
                  border-destructive/20
                  bg-destructive/10
                  p-3
                  text-destructive
                "
                role="alert"
                aria-live="assertive"
              >

                <TriangleAlert
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                />

                <div className="min-w-0">

                  <p className="text-xs font-semibold">
                    Unable to reset password
                  </p>

                  <p className="mt-0.5 text-xs leading-5">
                    {error}
                  </p>

                </div>

              </div>
            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                className="
                  mt-3
                  flex
                  items-start
                  gap-2.5
                  rounded-xl
                  border
                  border-green-500/20
                  bg-green-500/10
                  p-3
                  text-green-500
                "
                role="status"
                aria-live="polite"
              >

                <CheckCircle2
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                  "
                />

                <div>

                  <p className="text-xs font-semibold">
                    Password updated successfully
                  </p>

                  <p className="mt-0.5 text-xs leading-5">
                    {success}
                  </p>

                  <p className="mt-1 text-xs font-medium">
                    Redirecting to login in {redirect}...
                  </p>

                </div>

              </div>
            )}


            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              disabled={
                loading ||
                !formValid ||
                !!success
              }
              className="
                mt-4
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2.5
                rounded-xl
                bg-primary
                text-s
                font-bold
                text-primary-foreground
                shadow-lg
                shadow-primary/10
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-xl
                hover:shadow-primary/20
                active:translate-y-0
                disabled:pointer-events-none
                disabled:opacity-50
              "
            >

              {loading ? (
                <>
                  <div
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-current
                      border-t-transparent
                    "
                  />

                  Resetting Password...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} />
                  Password Updated
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight size={18} />
                </>
              )}

            </button>


            {/* =================================================
                SECURITY NOTE
            ================================================= */}

            <div
              className="
                mt-4
                flex
                items-start
                gap-2
                rounded-xl
                border
                border-border/50
                bg-muted/20
                px-3
                py-2.5
                text-xs
                leading-5
                text-muted-foreground
              "
            >

              <ShieldCheck
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-primary
                "
              />

              <span>
                Use a unique password that you do
                not use on other websites.
              </span>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <p
              className="
                mt-5
                text-center
                text-xs
                text-muted-foreground
              "
            >
              Remember your password?{' '}

              <Link
                href="/login"
                className="
                  font-semibold
                  text-primary
                  transition
                  hover:opacity-80
                "
              >
                Back to Login
              </Link>
            </p>

          </form>


          {/* SMALL TRUST INDICATOR */}

          <div
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              text-[11px]
              text-muted-foreground/70
            "
          >
            <Lock className="h-3 w-3" />
            Secure account recovery
          </div>

        </div>

      </div>

    </main>
  );
}