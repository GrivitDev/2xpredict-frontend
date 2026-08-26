'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { loginUser } from '@/services/auth.service';
import { useAuth } from '@/providers/auth-provider';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const handleLogin = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setErrors({});

    if (!email) {
      setErrors({
        email: 'Email is required',
      });

      return;
    }

    if (!password) {
      setErrors({
        password: 'Password is required',
      });

      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      login(response.token);

      toast.success(
        'Login successful. Welcome back!',
        {
          duration: 3000,
        },
      );

      if (response.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';

      if (Array.isArray(message)) {
        message.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error(message);

        if (
          message
            .toLowerCase()
            .includes('email')
        ) {
          setErrors({
            email: message,
          });
        }

        if (
          message
            .toLowerCase()
            .includes('password')
        ) {
          setErrors({
            password: message,
          });
        }
      }
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
      {/* LIGHTWEIGHT BACKGROUND */}
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
            bg-primary/10
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
            bg-cyan-500/5
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
      {/* MAIN CONTENT */}
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
          {/* DESKTOP BRAND SIDE */}
          {/* ======================================== */}

          <div className="hidden lg:block">
            <div className="relative max-w-lg">

              {/* Decorative line */}

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
                  Football Intelligence
                </span>
              </div>

              {/* BALL */}

              <div className="mb-2">
                <Image
                  src="/images/goal1.png"
                  alt="Premium Football Predictions"
                  width={300}
                  height={100}
                  className="
                    h-auto
                    max-w-[260px]
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
                Welcome
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
                  Back.
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
                Your football intelligence hub for
                predictions, live fixtures, VIP tips
                and match analytics.
              </p>

              {/* ======================================== */}
              {/* STATS */}
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
                  icon={<Trophy />}
                  value="150+"
                  label="Analysed"
                />

                <StatCard
                  icon={<TrendingUp />}
                  value="89%"
                  label="Accuracy"
                />

                <StatCard
                  icon={<ShieldCheck />}
                  value="24/7"
                  label="Updates"
                />
              </div>
            </div>
          </div>

          {/* ======================================== */}
          {/* LOGIN CARD */}
          {/* ======================================== */}

          <div className="flex justify-center">
            <form
              onSubmit={handleLogin}
              className="
                w-full
                max-w-[420px]
                rounded-2xl
                border
                border-border/70
                bg-card
                p-5
                shadow-2xl
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
                    width={82}
                    height={82}
                    className="
                      h-[82px]
                      w-[82px]
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
                  Member Access
                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  Welcome back
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  Sign in to continue to your account
                </p>
              </div>

              {/* ======================================== */}
              {/* EMAIL */}
              {/* ======================================== */}

              <div className="mb-3.5">

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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-input
                      bg-background
                      pl-10
                      pr-4
                      text-sm
                      outline-none
                      placeholder:text-muted-foreground
                      focus:border-primary/50
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>

                {errors.email && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-destructive
                    "
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* ======================================== */}
              {/* PASSWORD */}
              {/* ======================================== */}

              <div className="mb-3">

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
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-input
                      bg-background
                      pl-10
                      pr-11
                      text-sm
                      outline-none
                      placeholder:text-muted-foreground
                      focus:border-primary/50
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />

                  <button
                    type="button"
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
                      hover:text-foreground
                    "
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-destructive
                    "
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* ======================================== */}
              {/* OPTIONS */}
              {/* ======================================== */}

              <div
                className="
                  mb-5
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    text-xs
                    text-muted-foreground
                  "
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked,
                      )
                    }
                    className="
                      h-3.5
                      w-3.5
                      accent-primary
                    "
                  />

                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="
                    text-xs
                    font-semibold
                    text-primary
                    hover:underline
                  "
                >
                  Forgot password?
                </Link>
              </div>

              {/* ======================================== */}
              {/* LOGIN BUTTON */}
              {/* ======================================== */}

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  text-sm
                  font-bold
                  text-primary-foreground
                  shadow-lg
                  shadow-primary/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    {/* Native CSS loader */}
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

                    Signing in...
                  </>
                ) : (
                  <>
                    Login

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* ======================================== */}
              {/* REGISTER */}
              {/* ======================================== */}

              <p
                className="
                  mt-5
                  text-center
                  text-xs
                  text-muted-foreground
                "
              >
                Don&apos;t have an account?{' '}

                <Link
                  href="/register"
                  className="
                    font-semibold
                    text-primary
                    hover:underline
                  "
                >
                  Create Account
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
        bg-card
        p-3
        shadow-sm
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