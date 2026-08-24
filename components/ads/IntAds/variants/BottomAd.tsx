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

export function BottomAd({
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

        min-h-[220px]
        sm:min-h-[260px]
        lg:min-h-[300px]
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
            className="absolute inset-0"
          >

            <AdImage
              ad={ad}
              fill
              priority
            />

          </motion.div>

          {/* Premium overlays */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-black/85
              via-black/60
              to-black/40
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/60
              via-transparent
              to-black/10
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.08),transparent_45%)]
            "
          />

        </>

      )}

      <div
        className="
          relative
          z-10

          flex
          min-h-[220px]
          sm:min-h-[260px]
          lg:min-h-[300px]

          flex-col
          justify-between

          p-4
          sm:p-5
          lg:p-6
        "
      >

        {/* Badge */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
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
          }}
          className="
            mx-auto
            flex
            w-full
            max-w-4xl
            flex-col
            items-center
            text-center
            gap-2
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
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: .2,
          }}
          className="
            mt-4

            flex
            flex-col
            gap-4

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <div
            className="
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
              flex
              justify-center
              lg:justify-end
            "
          >

            <AdActions
              ad={ad}
            />

          </div>

        </motion.div>

      </div>

      {/* Decorative Ambient Glow */}

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

    </AdWrapper>

  );

}