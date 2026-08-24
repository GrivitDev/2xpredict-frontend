'use client';

import { motion } from 'framer-motion';

import { InternalAd } from '@/types/internal-ad';

import { AdWrapper } from '../shared/AdWrapper';
import { AdImage } from '../shared/AdImage';
import { AdTitle } from '../shared/AdTitle';
import { AdDescription } from '../shared/AdDescription';
import { AdInstructions } from '../shared/AdInstructions';
import { AdActions } from '../shared/AdActions';
import { AdBadge } from '../shared/AdBadge';

interface Props {
  ad: InternalAd;
}

export function InlineAd({
  ad,
}: Props) {

  return (

    <AdWrapper
      adId={ad._id}
      className="
        group
        relative
        mx-auto
        max-w-7xl
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-lg
        transition-all
        duration-300
        hover:border-primary/30
        hover:shadow-xl
      "
    >

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: .2,
        }}
        transition={{
          duration: .4,
          ease: 'easeOut',
        }}
        className="
          grid
          md:grid-cols-[42%_58%]
        "
      >

        {/* IMAGE */}

        {ad.image && (

          <div
            className="
              group/image
              relative
              min-h-[220px]
              overflow-hidden

              sm:min-h-[280px]
              md:min-h-[340px]
            "
          >

            <motion.div
              initial={{
                scale: 1,
              }}
              whileHover={{
                scale: 1.04,
              }}
              transition={{
                duration: .7,
                ease: 'easeOut',
              }}
              className="
                absolute
                inset-0
              "
            >

              <AdImage
                ad={ad}
                fill
                className="
                  object-cover
                  object-center
                "
              />

            </motion.div>

            {/* Image edge fade */}

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                right-0
                hidden
                w-24
                bg-gradient-to-l
                from-black/20
                to-transparent
                md:block
              "
            />

          </div>

        )}

        {/* CONTENT */}

        <div
          className="
            relative
            min-h-[340px]
            overflow-hidden
            bg-black
          "
        >

          {/* Background Image */}

          {ad.image && (

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                overflow-hidden
              "
            >

              <AdImage
                ad={ad}
                fill
                className="
                  scale-105
                  object-cover
                  object-center
                  opacity-30
                "
              />

            </div>

          )}

          {/* Content Overlay */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-black/80
              via-black/75
              to-black/60
            "
          />

          {/* Ambient Highlight */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.08),transparent_38%)]
            "
          />

          {/* Content */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              flex-col
              p-4

              sm:p-5
              lg:p-6
            "
          >

            {/* Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <AdTitle
                  ad={ad}
                  light
                />

              </div>

              <div className="shrink-0">

                <AdBadge />

              </div>

            </div>

            {/* Description */}

            <div
              className="
                flex
                flex-1
                items-center
                py-5
                sm:py-6
              "
            >

              <div
                className="
                  w-full
                  max-w-xl
                "
              >

                <AdDescription
                  ad={ad}
                  light
                />

              </div>

            </div>

            {/* Footer */}

            <div
              className="
                flex
                flex-col
                gap-4

                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >

              <div
                className="
                  min-w-0
                  max-w-lg
                "
              >

                <AdInstructions
                  ad={ad}
                  light
                />

              </div>

              <div
                className="
                  shrink-0
                  self-start
                  sm:self-end
                "
              >

                <AdActions
                  ad={ad}
                />

              </div>

            </div>

          </div>

        </div>

      </motion.div>

      {/* Inner highlight */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl
          ring-1
          ring-inset
          ring-white/10
        "
      />

    </AdWrapper>

  );

}