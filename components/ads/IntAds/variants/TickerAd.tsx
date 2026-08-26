'use client';

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
        rounded-xl
        border
        border-border/60
        bg-card
        shadow-sm
        transition-shadow
        duration-300
        hover:shadow-md
      "
    >

      <InfiniteTicker
        className="
          py-2
          sm:py-2.5
        "
        speed={30}
      >

        {ads.map((ad) => (

          <div
            key={ad._id}
            className="
              mx-5
              inline-flex
              items-center
              gap-2.5
              sm:mx-7
            "
          >

            {/* Sponsored */}

            <span
              className="
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-primary/20
                bg-primary/10
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >

              <Megaphone className="h-3 w-3" />

              Sponsored

            </span>

            {/* Title */}

            <span
              className="
                max-w-[220px]
                truncate
                text-sm
                font-semibold
                tracking-tight
                text-foreground
              "
            >

              {ad.title}

            </span>

            {/* Subtitle */}

            {ad.subTitle && (

              <>

                <Sparkles
                  className="
                    h-3.5
                    w-3.5
                    shrink-0
                    text-primary/80
                  "
                />

                <span
                  className="
                    max-w-[240px]
                    truncate
                    text-sm
                    text-muted-foreground
                  "
                >

                  {ad.subTitle}

                </span>

              </>

            )}

            {/* Description */}

            {ad.description && (

              <>

                <span
                  className="
                    h-1
                    w-1
                    shrink-0
                    rounded-full
                    bg-primary/50
                  "
                />

                <span
                  className="
                    max-w-[280px]
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

      {/* Edge Fades */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-20
          w-8
          bg-gradient-to-r
          from-card
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          z-20
          w-8
          bg-gradient-to-l
          from-card
          to-transparent
        "
      />

    </div>

  );

}