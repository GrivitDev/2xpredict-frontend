'use client';

import {
  motion,
  useReducedMotion,
} from 'framer-motion';

import type {
  ReactNode,
} from 'react';

interface StadiumBackgroundProps {
  children: ReactNode;
}

export default function StadiumBackground({
  children,
}: StadiumBackgroundProps) {
  const shouldReduceMotion =
    useReducedMotion();

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
      {/* Ambient background decoration */}
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
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [
                    0.2,
                    0.35,
                    0.2,
                  ],
                  scale: [
                    1,
                    1.04,
                    1,
                  ],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            -top-48
            left-1/2
            h-[28rem]
            w-[28rem]
            -translate-x-1/2
            rounded-full
            bg-primary/10
            blur-3xl
            sm:h-[36rem]
            sm:w-[36rem]
          "
        />

        {/* Soft page vignette */}
        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(
              circle_at_50%_0%,
              transparent_0%,
              transparent_35%,
              var(--background)_85%
            )]
            opacity-80
          "
        />

        {/* Subtle lower ambient glow */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-48
            bg-gradient-to-t
            from-primary/5
            to-transparent
          "
        />
      </div>

      {children}
    </section>
  );
}