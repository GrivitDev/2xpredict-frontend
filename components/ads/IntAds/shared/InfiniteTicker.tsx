'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function InfiniteTicker({
  children,
  className,
  speed = 35,
}: Props) {

  return (

    <div
      className={cn(
        `
          group
          relative
          overflow-hidden
          whitespace-nowrap
        `,
        className,
      )}
    >

      {/* Left Fade */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          z-10
          h-full
          w-8
          bg-gradient-to-r
          from-background
          to-transparent
        "
      />

      {/* Right Fade */}

      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          z-10
          h-full
          w-8
          bg-gradient-to-l
          from-background
          to-transparent
        "
      />

      <div
        className="
          flex
          w-max
          items-center
          will-change-transform
          group-hover:[animation-play-state:paused]
          motion-reduce:animate-none
          animate-ticker
        "
        style={{
          animationDuration: `${speed}s`,
        }}
      >
              <div
          className="
            flex
            items-center
            gap-12
          "
        >

          {children}

        </div>

        <div
          aria-hidden="true"
          className="
            flex
            items-center
            gap-12
            pl-12
          "
        >

          {children}

        </div>

      </div>

    </div>

  );

}