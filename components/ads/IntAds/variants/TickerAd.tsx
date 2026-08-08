'use client';

import { motion } from 'framer-motion';

import {
  Megaphone,
  Sparkles,
} from 'lucide-react';

import { InternalAd } from '@/types/internal-ad';

import { InfiniteTicker } from '../shared/InfiniteTicker';

interface Props {
  ads: InternalAd[];
}

export function TickerAd({
  ads,
}: Props) {

  if (!ads.length) {
    return null;
  }

  return (

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-full
        border
        border-primary/15
        bg-gradient-to-r
        from-background
        via-primary/5
        to-background
        shadow-sm
      "
    >

      {/* Moving shine */}

      <motion.div
        animate={{
          x: ['-100%', '250%'],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="
          pointer-events-none
          absolute
          inset-y-0
          w-32
          bg-gradient-to-r
          from-transparent
          via-white/10
          to-transparent
        "
      />

      <InfiniteTicker
        className="
          py-2.5
          group-hover:[animation-play-state:paused]
        "
        speed={28}
      >

        {ads.map(ad => (

          <div
            key={ad._id}
            className="
              mx-8
              inline-flex
              items-center
              gap-3
            "
          >

            {/* Sponsored Pill */}

            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-primary
                px-3
                py-1

                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]

                text-primary-foreground
                shadow
              "
            >

              <motion.div
                animate={{
                  rotate: [0, -12, 12, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
              >

                <Megaphone className="h-3 w-3" />

              </motion.div>

              Sponsored

            </span>

            <span
              className="
                text-sm
                font-semibold
                tracking-tight
                text-foreground
              "
            >

              {ad.title}

            </span>

            {ad.subTitle && (

              <>

                <Sparkles
                  className="
                    h-3.5
                    w-3.5
                    text-primary
                  "
                />

                <span
                  className="
                    text-sm
                    text-muted-foreground
                  "
                >

                  {ad.subTitle}

                </span>

              </>

            )}

            {ad.description && (

              <>

                <span
                  className="
                    h-1
                    w-1
                    rounded-full
                    bg-primary/60
                  "
                />

                <span
                  className="
                    max-w-xl
                    truncate
                    text-sm
                    text-muted-foreground
                  "
                >

                  {ad.description}

                </span>

              </>

            )}

          </div>

        ))}

      </InfiniteTicker>

      {/* Edge Fade */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          w-10
          bg-gradient-to-r
          from-background
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          w-10
          bg-gradient-to-l
          from-background
          to-transparent
        "
      />

    </div>

  );

}