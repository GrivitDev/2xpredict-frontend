'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

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
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

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
      Object.values(validations).filter(Boolean)
        .length;

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

    if (!email || !token) {
      setError(
        'This password reset link is incomplete or invalid.',
      );
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (
      !Object.values(validations).every(Boolean)
    ) {
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
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-32
            -top-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-primary/15
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            -bottom-32
            -right-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-500/10
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-transparent
            via-background/20
            to-background
          "
        />
      </div>

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-6xl
          items-center
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            grid
            w-full
            items-center
            gap-8
            lg:grid-cols-[1fr_420px]
            lg:gap-12
          "
        >
          {/* LEFT BRANDING */}

          <div className="hidden lg:block">
            <div className="max-w-lg">
              {/* LABEL */}

              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-primary" />

                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-primary
                  "
                >
                  Secure Account Recovery
                </span>
              </div>

              {/* IMAGE */}

              <div className="mb-3">
                <Image
                  src="/images/keeper.png"
                  alt="Football Predictions"
                  width={160}
                  height={70}
                  className="
                    h-auto
                    max-w-[150px]
                    object-contain
                  "
                  priority
                />
              </div>

              {/* TITLE */}

              <h1
                className="
                  text-3xl
                  font-black
                  leading-tight
                  tracking-tight
                "
              >
                Create
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-primary
                    via-primary
                    to-cyan-500
                    bg-clip-text
                    text-4xl
                    text-transparent
                  "
                >
                  A New Password.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Choose a strong, unique password to
                secure your 2xPredict account and
                continue accessing your football
                intelligence dashboard.
              </p>

              {/* FEATURES */}

              <div
                className="
                  mt-6
                  grid
                  max-w-md
                  grid-cols-3
                  gap-2
                "
              >
                <FeatureCard
                  icon={
                    <ShieldCheck className="h-5 w-5" />
                  }
                  title="Secure"
                  description="Account"
                />

                <FeatureCard
                  icon={
                    <Lock className="h-5 w-5" />
                  }
                  title="Private"
                  description="Password"
                />

                <FeatureCard
                  icon={
                    <CheckCircle2 className="h-5 w-5" />
                  }
                  title="Ready"
                  description="To Continue"
                />
              </div>
            </div>
          </div>

          {/* FORM */}

          <div className="flex justify-center">
            <form
              onSubmit={handleReset}
              className="
                w-full
                max-w-[420px]
                rounded-2xl
                border
                border-border/70
                bg-card/75
                p-5
                shadow-2xl
                backdrop-blur-2xl
                sm:p-6
              "
            >
              {/* HEADER */}

              <div className="mb-5 text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                  "
                >
                  <Image
                    src="/logo.png"
                    alt="2xPredict"
                    width={56}
                    height={56}
                    className="
                      h-20
                      w-20
                      object-contain
                    "
                    priority
                  />
                </div>

                <div
                  className="
                    mb-1
                    inline-flex
                    items-center
                    gap-1.5
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-primary
                  "
                >
                  <ShieldCheck className="h-3 w-3" />
                  Secure Password Recovery
                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  Reset Password
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Create a strong new password to
                  secure your account.
                </p>
              </div>

              {/* ACCOUNT */}

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
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />

                  <span className="truncate">
                    Securing {email}
                  </span>
                </div>
              )}

              {/* PASSWORD FIELDS */}

              <div className="space-y-3">
                {/* NEW PASSWORD */}

                <div className="relative">
                  <Lock
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      h-4
                      w-4
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
                    autoComplete="new-password"
                    aria-label="New password"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-input
                      bg-background/60
                      pl-10
                      pr-12
                      text-sm
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
                        (value) => !value,
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
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
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
                      h-4
                      w-4
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
                      setSuccess('');
                    }}
                    autoComplete="new-password"
                    aria-label="Confirm new password"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-input
                      bg-background/60
                      pl-10
                      pr-12
                      text-sm
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
                        (value) => !value,
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
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* STRENGTH */}

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

              {/* REQUIREMENTS */}

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
                  <ShieldCheck className="h-4 w-4 text-primary" />

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
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
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

              {/* MATCH */}

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

              {/* ERROR */}

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
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />

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

              {/* SUCCESS */}

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
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                  <div>
                    <p className="text-xs font-semibold">
                      Password updated successfully
                    </p>

                    <p className="mt-0.5 text-xs leading-5">
                      {success}
                    </p>

                    <p className="mt-1 text-xs font-medium">
                      Redirecting to login in{' '}
                      {redirect}...
                    </p>
                  </div>
                </div>
              )}

              {/* SUBMIT */}

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
                  text-sm
                  font-bold
                  text-primary-foreground
                  shadow-lg
                  shadow-primary/10
                  transition
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
                    <CheckCircle2 className="h-[18px] w-[18px]" />
                    Password Updated
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-[18px] w-[18px]" />
                  </>
                )}
              </button>

              {/* SECURITY */}

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
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                <span>
                  Use a unique password that you do not
                  use on other websites.
                </span>
              </div>

              {/* FOOTER */}

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
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border/70
        bg-card/60
        p-3
        shadow-sm
        backdrop-blur-xl
      "
    >
      <div className="mb-1.5 text-primary">
        {icon}
      </div>

      <h3 className="text-xs font-bold sm:text-sm">
        {title}
      </h3>

      <p className="text-[10px] text-muted-foreground sm:text-xs">
        {description}
      </p>
    </div>
  );
}