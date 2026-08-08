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
        rounded-3xl
        border
        shadow-xl
        min-h-[220px]
        sm:min-h-[270px]
        lg:min-h-[320px]
      "
    >

      {
        ad.image && (

          <>

            {/* Background */}

            <motion.div
              initial={{
                scale: 1,
              }}
              animate={{
                scale: 1.08,
              }}
              transition={{
                duration: 18,
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

            {/* Overlay */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/90
                via-black/65
                to-black/45
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/70
                via-black/15
                to-black/30
              "
            />

            {/* Glow */}

            <div
              className="
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.08),transparent_40%)]
              "
            />

          </>

        )
      }

      <div
        className="
          relative
          z-10
          flex
          min-h-[220px]
          sm:min-h-[270px]
          lg:min-h-[320px]
          flex-col
          justify-between
          px-3
          py-3
          sm:px-4
          sm:py-3
          lg:px-5
        "
      >

        {/* Sponsored */}

        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <AdBadge />

        </motion.div>

        {/* Center Content */}

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: .45,
          }}
          className="
            mx-auto
            flex
            w-full
            max-w-5xl
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <AdTitle
            ad={ad}
            centered
            light
          />

          <div className="mt-1 max-w-3xl">

            <AdDescription
              ad={ad}
              light
            />

          </div>

        </motion.div>

        {/* Bottom */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: .25,
          }}
          className="
            mt-2
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          <div
            className="
              max-w-md
              px-8
            "
          >

            <AdInstructions
              ad={ad}
              light
            />

          </div>

          <div
            className="
              self-start
              sm:self-end
            "
          >

            <AdActions
              ad={ad}
            />

          </div>

        </motion.div>

      </div>

      {/* Decorative Glow */}

      <motion.div
        animate={{
          y: [
            0,
            -15,
            0,
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
        }}
        className="
          absolute
          -right-28
          -top-28
          h-80
          w-80
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />

    </AdWrapper>

  );

}