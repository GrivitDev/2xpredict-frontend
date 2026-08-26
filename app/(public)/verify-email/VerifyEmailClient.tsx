'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  ShieldCheck,
  TrendingUp,
  Trophy,
} from 'lucide-react';

import VerifyOtpModal from '@/components/VerifyOtpModal';

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.replace('/register');
    }
  }, [email, router]);

  if (!email) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
        "
      >
        <div
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-4
            border-primary
            border-t-transparent
          "
        />
      </main>
    );
  }

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
                  Account Verification
                </span>
              </div>

              {/* IMAGE */}

              <div className="mb-3">
                <Image
                  src="/images/teamcup.png"
                  alt="Football Predictions"
                  width={560}
                  height={170}
                  className="
                    h-auto
                    w-full
                    max-w-[300px]
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
                Verify
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
                  Your Account.
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
                Confirm your email address to activate
                your 2xPredict account and access
                football predictions and statistics.
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
                  description="Verification"
                />

                <FeatureCard
                  icon={
                    <TrendingUp className="h-5 w-5" />
                  }
                  title="Fast"
                  description="Activation"
                />

                <FeatureCard
                  icon={
                    <Trophy className="h-5 w-5" />
                  }
                  title="Ready"
                  description="Predict"
                />
              </div>
            </div>
          </div>

          {/* OTP CARD */}

          <div className="flex justify-center">
            <div
              className="
                w-full
                max-w-[420px]
                rounded-2xl
                border
                border-border/70
                bg-card/75
                p-1
                shadow-2xl
                backdrop-blur-2xl
              "
            >
              <VerifyOtpModal
                email={email}
                onClose={() => {}}
              />
            </div>
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