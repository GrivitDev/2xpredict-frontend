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
        x: 20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: .45,
      }}
    >

      <AdWrapper
        adId={ad._id}
        className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          bg-gradient-to-br
          from-background
          via-background
          to-primary/5

          shadow-md

          transition-all
          duration-500

          hover:-translate-y-1
          hover:shadow-xl
        "
      >

        {/* Decorative Glow */}

        <div
          className="
            absolute
            -right-16
            -top-16
            h-40
            w-40
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        {ad.image && (

          <div
            className="
              relative
              aspect-[4/3]
              overflow-hidden
            "
          >

            <motion.div
              whileHover={{
                scale: 1.05,
              }}
              transition={{
                duration: .4,
              }}
              className="h-full"
            >

              <AdImage
                ad={ad}
                className="h-full object-cover"
              />

            </motion.div>

            {/* Bottom Fade */}

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                h-16
                bg-gradient-to-t
                from-background
                to-transparent
              "
            />

          </div>

        )}

        <div
          className="
            relative
            space-y-3
            p-4
          "
        >

          <AdBadge />

          <AdContent
            ad={ad}
          />

          <div className="pt-1">

            <AdActions
              ad={ad}
            />

          </div>

        </div>

      </AdWrapper>

    </motion.div>

  );

}