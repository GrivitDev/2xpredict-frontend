'use client';

import { useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import {
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TriangleAlert,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';

import api from '@/lib/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!emailValid) {
      setError(
        'Please enter a valid email address.',
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        '/auth/request-password-reset',
        {
          email,
        },
      );

      setSuccess(
        res.data.message ||
          'Password reset link sent successfully.',
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to send reset link. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-background
        text-foreground
      "
    >
      {/* ======================================== */}
      {/* BACKGROUND */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
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

      {/* ======================================== */}
      {/* MAIN */}
      {/* ======================================== */}

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
            gap-6
            lg:grid-cols-[1fr_420px]
            lg:gap-10
          "
        >
          {/* ======================================== */}
          {/* LEFT SIDE */}
          {/* ======================================== */}

          <div className="hidden lg:block">
            <div className="relative max-w-lg">

              {/* LABEL */}

              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    h-px
                    w-10
                    bg-primary
                  "
                />

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

              <div className="mb-2">
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
                  text-4xl
                  font-black
                  leading-[0.95]
                  tracking-tight
                "
              >
                Recover
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-primary
                    via-primary
                    to-cyan-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  Your Account.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-md
                  text-s
                  leading-6
                  text-muted-foreground
                "
              >
                Forgot your password? Securely restore
                access to your 2xPredict account and get
                back to your football intelligence dashboard.
              </p>

              {/* ======================================== */}
              {/* RECOVERY FEATURES */}
              {/* ======================================== */}

              <div
                className="
                  mt-6
                  grid
                  max-w-md
                  grid-cols-3
                  gap-2
                "
              >
                <StatCard
                  icon={<ShieldCheck />}
                  value="100%"
                  label="Secure"
                />

                <StatCard
                  icon={<Mail />}
                  value="Fast"
                  label="Delivery"
                />

                <StatCard
                  icon={<LockKeyhole />}
                  value="Safe"
                  label="Recovery"
                />
              </div>
            </div>
          </div>

          {/* ======================================== */}
          {/* FORM CARD */}
          {/* ======================================== */}

          <div className="flex justify-center">
            <form
              onSubmit={handleSubmit}
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
              {/* ======================================== */}
              {/* HEADER */}
              {/* ======================================== */}

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
                    alt="2xPredict"
                    width={52}
                    height={52}
                    className="
                      h-45
                      w-45
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
                  <Sparkles className="h-3 w-3" />
                  Account Recovery
                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  Forgot Password?
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Enter your email and we&apos;ll send you
                  a secure reset link.
                </p>
              </div>

              {/* ======================================== */}
              {/* EMAIL */}
              {/* ======================================== */}

              <div className="mb-3">

                <div className="relative">

                  <Mail
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
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                      setSuccess('');
                    }}
                    className={`
                      h-12
                      w-full
                      rounded-xl
                      border
                      bg-background/70
                      pl-10
                      pr-4
                      text-s
                      text-foreground
                      outline-none
                      transition
                      placeholder:text-muted-foreground
                      focus:ring-2
                      ${
                        error
                          ? 'border-destructive focus:ring-destructive/20'
                          : emailValid
                            ? 'border-green-500 focus:ring-green-500/20'
                            : 'border-input focus:border-primary/50 focus:ring-primary/10'
                      }
                    `}
                    required
                  />
                </div>

                {/* EMAIL STATUS */}

                {email && !error && !success && (
                  <div className="mt-1.5">
                    {emailValid ? (
                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-green-500
                        "
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Valid email address
                      </div>
                    ) : (
                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-muted-foreground
                        "
                      >
                        <TriangleAlert className="h-3.5 w-3.5" />
                        Enter a valid email address
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ======================================== */}
              {/* ERROR */}
              {/* ======================================== */}

              {error && (
                <div
                  className="
                    mb-4
                    flex
                    items-start
                    gap-2.5
                    rounded-xl
                    border
                    border-destructive/30
                    bg-destructive/10
                    p-3
                    text-destructive
                  "
                >
                  <TriangleAlert
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                    "
                  />

                  <div>
                    <p className="text-xs font-semibold">
                      Request Failed
                    </p>

                    <p className="mt-0.5 text-xs leading-5">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* ======================================== */}
              {/* SUCCESS */}
              {/* ======================================== */}

              {success && (
                <div
                  className="
                    mb-4
                    flex
                    items-start
                    gap-2.5
                    rounded-xl
                    border
                    border-green-500/30
                    bg-green-500/10
                    p-3
                    text-green-500
                  "
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
                      Reset Link Sent
                    </p>

                    <p className="mt-0.5 text-xs leading-5">
                      {success}
                    </p>

                    <p className="mt-1.5 text-[11px] leading-5 opacity-80">
                      Check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              )}

              {/* ======================================== */}
              {/* SUBMIT */}
              {/* ======================================== */}

              <button
                type="submit"
                disabled={
                  loading ||
                  !emailValid ||
                  !!success
                }
                className="
                  group
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  text-s
                  font-bold
                  text-primary-foreground
                  shadow-lg
                  shadow-primary/20
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  hover:shadow-primary/25
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

                    Sending Secure Link...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Email Sent
                  </>
                ) : (
                  <>
                    Send Reset Link

                    <ArrowRight
                      className="
                        h-4
                        w-4
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </>
                )}
              </button>

              {/* ======================================== */}
              {/* SECURITY NOTICE */}
              {/* ======================================== */}

              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-border/70
                  bg-muted/20
                  p-3
                "
              >
                <h3
                  className="
                    mb-2
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-semibold
                  "
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />

                  Security Notice
                </h3>

                <div
                  className="
                    grid
                    gap-1
                    text-[11px]
                    leading-5
                    text-muted-foreground
                  "
                >
                  <p>
                    • Reset links expire automatically.
                  </p>

                  <p>
                    • Never share password reset links.
                  </p>

                  <p>
                    • Check spam if the email does not arrive.
                  </p>
                </div>
              </div>

              {/* ======================================== */}
              {/* FOOTER */}
              {/* ======================================== */}

              <p
                className="
                  mt-4
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
                    hover:underline
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

/* ======================================== */
/* STAT CARD */
/* ======================================== */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
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
      <div className="mb-2 text-primary">
        {icon}
      </div>

      <p className="text-lg font-black">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}