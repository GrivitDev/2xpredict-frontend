'use client';

import { motion } from 'framer-motion';

import { InternalAd } from '@/types/internal-ad';

import { AdWrapper } from '../shared/AdWrapper';
import { AdImage } from '../shared/AdImage';
import { AdContent } from '../shared/AdContent';
import { AdActions } from '../shared/AdActions';
import { AdBadge } from '../shared/AdBadge';

interface Props {
  ad: InternalAd;
}

export function SidebarAd({
  ad,
}: Props) {

  return (

    <motion.div
      initial={{
        opacity: 0,
        x: 12,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: .4,
        ease: 'easeOut',
      }}
    >

      <AdWrapper
        adId={ad._id}
        className="
          group
          relative
          overflow-hidden

          rounded-2xl

          border
          border-border/60

          bg-card

          shadow-md

          transition-all
          duration-300

          hover:-translate-y-0.5
          hover:border-primary/25
          hover:shadow-xl
        "
      >

        {/* Ambient Glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-44
            w-44
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        {/* Image */}

        {ad.image && (

          <div
            className="
              relative
              aspect-[4/3]
              overflow-hidden
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
                duration: .6,
                ease: 'easeOut',
              }}
              className="
                h-full
                w-full
              "
            >

              <AdImage
                ad={ad}
                className="
                  h-full
                  w-full
                  rounded-none
                  border-0
                  object-cover
                "
              />

            </motion.div>

            {/* Image Fade */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-16
                bg-gradient-to-t
                from-card
                via-card/30
                to-transparent
              "
            />

            {/* Image Highlight */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                ring-1
                ring-inset
                ring-white/10
              "
            />

          </div>

        )}

        {/* Content */}

        <div
          className="
            relative
            z-10

            space-y-3.5

            p-4
            sm:p-5
          "
        >

          {/* Badge */}

          <AdBadge />

          {/* Content */}

          <AdContent
            ad={ad}
          />

          {/* Action */}

          <div
            className="
              border-t
              border-border/50
              pt-3
            "
          >

            <AdActions
              ad={ad}
            />

          </div>

        </div>

        {/* Inner Highlight */}

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

    </motion.div>

  );

}