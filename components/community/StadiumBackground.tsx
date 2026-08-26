'use client';

import type { ReactNode } from 'react';

interface StadiumBackgroundProps {
  children: ReactNode;
}

export default function StadiumBackground({
  children,
}: StadiumBackgroundProps) {
  return (
    <section
      className="
        relative
        isolate
        min-h-screen
        overflow-hidden
        bg-background
      "
    >
      {/* Lightweight ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -top-40
            left-1/2
            size-[22rem]
            -translate-x-1/2
            rounded-full
            bg-primary/8
            blur-3xl
            sm:size-[30rem]
          "
        />

        {/* Subtle vignette */}
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(
              circle_at_50%_0%,
              transparent_0%,
              transparent_40%,
              var(--background)_90%
            )]
            opacity-70
          "
        />

        {/* Lower ambient glow */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-32
            bg-gradient-to-t
            from-primary/4
            to-transparent
          "
        />
      </div>

      {children}
    </section>
  );
}