'use client';

import { motion } from 'framer-motion';

import { AdWrapper } from '../shared/AdWrapper';
import { AdImage } from '../shared/AdImage';
import { AdBadge } from '../shared/AdBadge';
import { AdTitle } from '../shared/AdTitle';
import { AdDescription } from '../shared/AdDescription';
import { AdInstructions } from '../shared/AdInstructions';
import { AdActions } from '../shared/AdActions';

import { InternalAd } from '@/types/internal-ad';

interface Props {
  ad: InternalAd;
}

export function HeroAd({
  ad,
}: Props) {

  return (

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
        shadow-lg
        transition-all
        duration-300
        hover:shadow-2xl

        min-h-[230px]
        sm:min-h-[280px]
        lg:min-h-[320px]
      "
    >

      {ad.image && (

        <>

          {/* Background */}

          <motion.div
            initial={{
              scale: 1,
            }}
            animate={{
              scale: 1.04,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
            className="
              absolute
              inset-0
              overflow-hidden
            "
          >

            <AdImage
              ad={ad}
              fill
              priority
            />

          </motion.div>

          {/* Main Overlay */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-black/85
              via-black/60
              to-black/35
            "
          />

          {/* Bottom Contrast */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/65
              via-transparent
              to-black/10
            "
          />

          {/* Soft Highlight */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,.09),transparent_42%)]
            "
          />

        </>

      )}

      <div
        className="
          relative
          z-10

          flex
          min-h-[230px]
          sm:min-h-[280px]
          lg:min-h-[320px]

          flex-col
          justify-between

          p-4
          sm:p-5
          lg:p-6
        "
      >

        {/* Sponsored */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: .3,
          }}
        >

          <AdBadge />

        </motion.div>

        {/* Main Content */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: .4,
            delay: .05,
          }}
          className="
            mx-auto
            flex
            w-full
            max-w-4xl
            flex-col
            items-center
            justify-center
            gap-2
            text-center
          "
        >

          <AdTitle
            ad={ad}
            centered
            light
          />

          <AdDescription
            ad={ad}
            light
          />

        </motion.div>

        {/* Footer */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: .4,
            delay: .2,
          }}
          className="
            mt-4

            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          {/* Instructions */}

          <div
            className="
              w-full
              max-w-lg
            "
          >

            <AdInstructions
              ad={ad}
              light
            />

          </div>

          {/* Action */}

          <div
            className="
              flex
              w-full
              justify-center

              sm:w-auto
              sm:justify-end
            "
          >

            <AdActions
              ad={ad}
            />

          </div>

        </motion.div>

      </div>

      {/* Ambient Glow */}

      <motion.div
        animate={{
          y: [
            0,
            -12,
            0,
          ],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-72
          w-72
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

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

  );

}