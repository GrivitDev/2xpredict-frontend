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
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
        py-4
        text-foreground
        sm:py-6
      "
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-28
            -top-28
            h-64
            w-64
            rounded-full
            bg-primary/20
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            -bottom-28
            -right-28
            h-64
            w-64
            rounded-full
            bg-cyan-500/15
            blur-[110px]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-transparent
            via-background/30
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
          flex-col
          items-center
          justify-center
          gap-6
          px-4
          sm:px-6
          lg:flex-row
          lg:gap-10
        "
      >
        {/* LEFT BRAND AREA */}

        <div
          className="
            order-2
            w-full
            flex-1
            lg:order-1
          "
        >
          <div
            className="
              mx-auto
              max-w-lg
              text-center
              lg:mx-0
              lg:text-left
            "
          >
            {/* LOGO */}

            <div
              className="
                mb-3
                flex
                justify-center
                lg:justify-start
              "
            >
              <Image
                src="/images/teamcup.png"
                alt="Football Predictions"
                width={560}
                height={170}
                className="
                  h-auto
                  w-full
                  max-w-[240px]
                  object-contain
                  sm:max-w-[300px]
                  lg:max-w-[380px]
                "
                priority
              />
            </div>

            {/* HEADING */}

            <h1
              className="
                text-3xl
                font-black
                leading-tight
                sm:text-4xl
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
                  sm:text-5xl
                "
              >
                Your Account.
              </span>
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                mt-3
                max-w-md
                text-s
                leading-5
                text-muted-foreground
                sm:text-base
              "
            >
              Confirm your email address to activate
              your 2xpredict account and access
              football predictions and statistics.
            </p>

            {/* FEATURES */}

            <div
              className="
                mt-5
                grid
                grid-cols-3
                gap-2
              "
            >
              {/* SECURE */}

              <div
                className="
                  rounded-xl
                  border
                  border-border
                  bg-card/60
                  p-2.5
                  backdrop-blur-xl
                  sm:p-3
                "
              >
                <ShieldCheck
                  className="
                    mb-1.5
                    h-5
                    w-5
                    text-primary
                  "
                />

                <h3
                  className="
                    text-xs
                    font-bold
                    sm:text-s
                  "
                >
                  Secure
                </h3>

                <p
                  className="
                    text-[10px]
                    text-muted-foreground
                    sm:text-xs
                  "
                >
                  Verification
                </p>
              </div>

              {/* FAST */}

              <div
                className="
                  rounded-xl
                  border
                  border-border
                  bg-card/60
                  p-2.5
                  backdrop-blur-xl
                  sm:p-3
                "
              >
                <TrendingUp
                  className="
                    mb-1.5
                    h-5
                    w-5
                    text-cyan-500
                  "
                />

                <h3
                  className="
                    text-xs
                    font-bold
                    sm:text-s
                  "
                >
                  Fast
                </h3>

                <p
                  className="
                    text-[10px]
                    text-muted-foreground
                    sm:text-xs
                  "
                >
                  Activation
                </p>
              </div>

              {/* READY */}

              <div
                className="
                  rounded-xl
                  border
                  border-border
                  bg-card/60
                  p-2.5
                  backdrop-blur-xl
                  sm:p-3
                "
              >
                <Trophy
                  className="
                    mb-1.5
                    h-5
                    w-5
                    text-yellow-500
                  "
                />

                <h3
                  className="
                    text-xs
                    font-bold
                    sm:text-s
                  "
                >
                  Ready
                </h3>

                <p
                  className="
                    text-[10px]
                    text-muted-foreground
                    sm:text-xs
                  "
                >
                  Predict
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OTP */}

        <div
          className="
            order-1
            flex
            w-full
            flex-1
            justify-center
            lg:order-2
            lg:justify-end
          "
        >
          <VerifyOtpModal
            email={email}
            onClose={() => {}}
          />
        </div>
      </div>
    </main>
  );
}