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

  const email =
    searchParams.get('email') || '';

  useEffect(() => {
    if (!email) {
      router.replace('/register');
    }
  }, [
    email,
    router,
  ]);

  if (!email) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          text-foreground
        "
      >
        <div
          className="
            h-10
            w-10
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
        py-8
        sm:py-10
        lg:py-12
        text-foreground
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-28
            -top-28
            h-[280px]
            w-[280px]
            rounded-full
            bg-primary/20
            blur-[120px]
            sm:-left-40
            sm:-top-40
            sm:h-[420px]
            sm:w-[420px]
            lg:h-[500px]
            lg:w-[500px]
            lg:blur-[180px]
          "
        />

        <div
          className="
            absolute
            -bottom-28
            -right-28
            h-[320px]
            w-[320px]
            rounded-full
            bg-cyan-500/15
            blur-[120px]
            sm:-bottom-40
            sm:-right-40
            sm:h-[480px]
            sm:w-[480px]
            lg:h-[600px]
            lg:w-[600px]
            lg:blur-[180px]
          "
        />

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[420px]
            w-[420px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-foreground/5
            blur-[140px]
            sm:h-[550px]
            sm:w-[550px]
            lg:h-[700px]
            lg:w-[700px]
            lg:blur-[220px]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-transparent
            via-background/40
            to-background
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-7xl
          flex-col
          items-center
          justify-center
          gap-10
          px-4
          sm:px-6
          lg:flex-row
          lg:items-center
          lg:gap-16
        "
      >
        {/* LEFT BRAND AREA */}
        <div
          className="
            order-2
            w-full
            flex-1
            lg:order-1
            lg:block
          "
        >
          <div
            className="
              mx-auto
              max-w-xl
              text-center
              lg:mx-0
              lg:text-left
            "
          >
            <div
              className="
                mb-5
                flex
                justify-center
                lg:justify-start
              "
            >
              <Image
                src="/images/ball5.png"
                alt="Football Predictions"
                width={560}
                height={170}
                className="
                  h-auto
                  w-full
                  max-w-[320px]
                  object-contain
                  sm:max-w-[420px]
                  lg:max-w-full
                "
                priority
              />
            </div>

            <h1
              className="
                mt-6
                text-3xl
                font-black
                leading-tight
                sm:text-4xl
                lg:mt-8
                lg:text-5xl
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
                  lg:text-6xl
                "
              >
                Your Account.
              </span>
            </h1>

            <p
              className="
                mt-6
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              Confirm your email address to
              activate your PredictPro account
              and start accessing football
              predictions, statistics, and features.
            </p>

            <div
              className="
                mt-10
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-3
                sm:gap-5
                lg:mt-12
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-card/70
                  p-5
                  shadow-lg
                  backdrop-blur-xl
                "
              >
                <ShieldCheck
                  className="
                    mb-3
                    h-7
                    w-7
                    text-primary
                  "
                />

                <h3
                  className="
                    text-lg
                    font-bold
                    sm:text-xl
                  "
                >
                  Secure
                </h3>

                <p
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >
                  Verification
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-card/70
                  p-5
                  shadow-lg
                  backdrop-blur-xl
                "
              >
                <TrendingUp
                  className="
                    mb-3
                    h-7
                    w-7
                    text-cyan-500
                  "
                />

                <h3
                  className="
                    text-lg
                    font-bold
                    sm:text-xl
                  "
                >
                  Fast
                </h3>

                <p
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >
                  Activation
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-card/70
                  p-5
                  shadow-lg
                  backdrop-blur-xl
                "
              >
                <Trophy
                  className="
                    mb-3
                    h-7
                    w-7
                    text-yellow-500
                  "
                />

                <h3
                  className="
                    text-lg
                    font-bold
                    sm:text-xl
                  "
                >
                  Ready
                </h3>

                <p
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >
                  Predict
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OTP MODAL */}
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
          <div className="w-full max-w-md">
            <VerifyOtpModal
              email={email}
              onClose={() => {}}
            />
          </div>
        </div>
      </div>
    </main>
  );
}