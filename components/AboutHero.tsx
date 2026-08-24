'use client';

import Image from 'next/image';

import {
  Trophy,
  TrendingUp,
  ShieldCheck,
  Target,
  Sparkles,
} from 'lucide-react';

export default function AboutHero() {
  return (
    <section
      className="
        relative
        isolate
        mx-auto
        max-w-7xl
        overflow-hidden
        rounded-2xl
        border
        border-border
        px-4
        py-5
        shadow-xl
        sm:px-6
        sm:py-6

      "
    >
      {/* ======================================== */}
      {/* TEAM BACKGROUND */}
      {/* ======================================== */}

      <div className="pointer-events-none absolute inset-0 -z-20">
        <Image
          src="/images/team.png"
          alt=""
          fill
          priority
          className="
            object-contain
            object-center
          "
        />
      </div>

      {/* ======================================== */}
      {/* THEME OVERLAY */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-background/10
        "
      />

      {/* ======================================== */}
      {/* COLOUR / READABILITY OVERLAY */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          bg-gradient-to-r
          from-background
          via-background/35
          to-primary/10
        "
      />

      {/* ======================================== */}
      {/* TEAM CUP HIGHLIGHT */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          bottom-[-15px]
          -z-5
          h-[230px]
          w-[300px]
          opacity-95
          sm:right-4
          sm:h-[280px]
          sm:w-[360px]
          sm:opacity-95
          lg:right-2
          lg:h-[320px]
          lg:w-[420px]
        "
      >
        <Image
          src="/images/teamcup.png"
          alt=""
          fill
          className="
            object-contain
            object-bottom
          "
        />
      </div>

      {/* ======================================== */}
      {/* HERO CONTENT */}
      {/* ======================================== */}

      <div
        className="
          relative
          z-10
          grid
          min-h-[320px]
          items-center
          gap-2
          md:min-h-[340px]
          md:grid-cols-[1.15fr_0.85fr]
          lg:min-h-[355px]
          lg:grid-cols-[1.2fr_0.8fr]
        "
      >
        {/* ======================================== */}
        {/* LEFT CONTENT */}
        {/* ======================================== */}

        <div
          className="
            relative
            z-30
            -mt-2
            max-w-2xl
            md:ml-4
            md:-mt-8
            lg:ml-8
            lg:-mt-10
          "
        >
          {/* CONTENT GLASS */}

          <div
            className="
              relative
              max-w-2xl
              rounded-2xl
              border
              border-border/60
              bg-background/55
              p-4
              shadow-xl
              backdrop-blur-md
              sm:p-5
              lg:p-6
            "
          >
            {/* SUBTLE INNER GLOW */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-2xl
                bg-gradient-to-br
                from-primary/10
                via-transparent
                to-transparent
              "
            />

            <div className="relative">
              {/* EYEBROW */}

              <div
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-primary/20
                  bg-primary/10
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-primary
                "
              >
                <Sparkles className="h-3.5 w-3.5" />

                Football Intelligence
              </div>

              {/* TITLE */}

              <h1
                className="
                  mt-2
                  text-3xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-foreground
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                <span
                  className="
                    bg-gradient-to-r
                    from-foreground
                    via-primary
                    to-primary/60
                    bg-clip-text
                    text-transparent
                  "
                >
                  About 2xpredict
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-2
                  max-w-xl
                  text-s
                  leading-6
                  text-muted-foreground
                  sm:text-base
                  sm:leading-7
                "
              >
                A modern football intelligence platform combining match
                analysis, statistical insights and carefully researched
                predictions to help fans understand the game beyond the
                scoreboard.
              </p>

              {/* FEATURE CARDS */}

              <div
                className="
                  mt-4
                  grid
                  grid-cols-3
                  gap-2
                  max-w-xl
                "
              >
                <FeatureCard
                  icon={<TrendingUp />}
                  value="Smart"
                  label="Analysis"
                />

                <FeatureCard
                  icon={<ShieldCheck />}
                  value="Trusted"
                  label="Insights"
                />

                <FeatureCard
                  icon={<Target />}
                  value="Focused"
                  label="Predictions"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================== */}
        {/* PLAYER IMAGE */}
        {/* ======================================== */}

 {/* PLAYER IMAGE */}

<div
  className="
    relative
    z-20
    hidden
    min-h-[340px]
    items-end
    justify-end
    md:flex
  "
>
  {/* PLAYER GLOW */}

  <div
    className="
      pointer-events-none
      absolute
      bottom-0
      right-1/4
      h-48
      w-48
      rounded-full
      bg-primary/25
      blur-3xl
      md:right-4
      lg:right-0
    "
  />

  {/* PLAYER */}

  <div
    className="
      relative
      h-[390px]
      w-[390px]
      translate-x-8
      translate-y-8
      lg:h-[450px]
      lg:w-[450px]
      lg:translate-x-12
      lg:translate-y-10
      md:right-142
      lg:right-232
    "
  >
    <Image
      src="/images/goal.png"
      alt="Football player celebrating"
      fill
      priority
      className="
        object-contain
        object-bottom
        drop-shadow-2xl
      "
    />
  </div>
</div>
      </div>
    </section>
  );
}

/* ======================================== */
/* FEATURE CARD */
/* ======================================== */

function FeatureCard({
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
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-border/70
        bg-background/65
        px-2.5
        py-2
        shadow-sm
        backdrop-blur-md
        transition-colors
        hover:border-primary/40
      "
    >
      {/* TOP ACCENT */}

      <div
        className="
          absolute
          left-0
          top-0
          h-[2px]
          w-full
          bg-gradient-to-r
          from-primary
          to-transparent
          opacity-70
        "
      />

      <div className="flex items-center gap-2">
        <div
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-primary/10
            text-primary
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-foreground">
            {value}
          </p>

          <p className="truncate text-[10px] text-muted-foreground">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}