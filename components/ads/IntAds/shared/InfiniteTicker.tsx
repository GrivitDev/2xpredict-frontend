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
          w-full
          overflow-hidden
          whitespace-nowrap
          select-none
        `,
        className,
      )}
    >

      {/* Left Fade */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-20
          w-10
          bg-gradient-to-r
          from-background
          via-background/80
          to-transparent
        "
      />

      {/* Right Fade */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          z-20
          w-10
          bg-gradient-to-l
          from-background
          via-background/80
          to-transparent
        "
      />

      <div
        className="
          flex
          w-max
          items-center
          animate-ticker
          will-change-transform
          [transform:translate3d(0,0,0)]
          group-hover:[animation-play-state:paused]
          motion-reduce:animate-none
        "
        style={{
          animationDuration: `${speed}s`,
        }}
      >

        <div
          className="
            flex
            items-center
            gap-8
            sm:gap-10
            lg:gap-12
            pr-8
            sm:pr-10
            lg:pr-12
          "
        >

          {children}

        </div>

        <div
          aria-hidden="true"
          className="
            flex
            items-center
            gap-8
            sm:gap-10
            lg:gap-12
          "
        >

          {children}

        </div>

      </div>

    </div>

  );

}