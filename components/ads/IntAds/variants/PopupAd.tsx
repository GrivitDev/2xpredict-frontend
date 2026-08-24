'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

import { InternalAd } from '@/types/internal-ad';

import { AdWrapper } from '../shared/AdWrapper';
import { AdImage } from '../shared/AdImage';
import { AdContent } from '../shared/AdContent';
import { AdActions } from '../shared/AdActions';
import { AdBadge } from '../shared/AdBadge';

interface Props {
  ad: InternalAd;
  onClose?: () => void;
}

export function PopupAd({
  ad,
  onClose,
}: Props) {

  return (

    <motion.div
      initial={{
        opacity: 0,
        scale: .96,
        y: 10,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        duration: .3,
        ease: 'easeOut',
      }}
      className="
        mx-auto
        w-[calc(100vw-1.5rem)]
        max-w-[340px]

        sm:w-[calc(100vw-2rem)]
        sm:max-w-[380px]

        lg:max-w-[410px]
      "
    >

      <AdWrapper
        adId={ad._id}
        className="
          group
          relative

          flex
          max-h-[calc(100vh-2rem)]
          min-h-0
          flex-col

          overflow-hidden

          rounded-2xl
          border
          border-border/60

          bg-background/95

          shadow-2xl

          backdrop-blur-xl

          transition-shadow
          duration-300
        "
      >

        {/* Close */}

        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="Close advertisement"
          onClick={onClose}
          className="
            absolute
            right-2.5
            top-2.5
            z-[100]

            h-7
            w-7

            rounded-full

            border
            border-border/70

            bg-background/90

            text-muted-foreground

            shadow-md

            backdrop-blur-md

            transition-all
            duration-200

            hover:bg-background
            hover:text-foreground
            hover:shadow-lg

            active:scale-95
          "
        >

          <X className="h-3.5 w-3.5" />

        </Button>

        {/* Image */}

        {ad.image && (

          <div
            className="
              relative
              h-28
              shrink-0
              overflow-hidden

              sm:h-32
              lg:h-36
            "
          >

            <motion.div
              initial={{
                scale: 1,
              }}
              whileHover={{
                scale: 1.035,
              }}
              transition={{
                duration: .5,
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
                h-14

                bg-gradient-to-t
                from-background
                via-background/30
                to-transparent
              "
            />

          </div>

        )}

        {/* Content */}

        <div
          className="
            relative
            z-10

            min-h-0
            overflow-y-auto

            p-4
            sm:p-5
          "
        >

          <div
            className="
              space-y-3.5
            "
          >

            {/* Badge */}

            <AdBadge />

            {/* Main Content */}

            <AdContent
              ad={ad}
            />

            {/* Action */}

            {ad.actions.length > 0 && (

              <div
                className="
                  border-t
                  border-border/50
                  pt-3.5
                "
              >

                <AdActions
                  ad={ad}
                />

              </div>

            )}

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