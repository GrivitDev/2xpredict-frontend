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
        scale: 0.97,
        y: 12,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        duration: 0.28,
        ease: 'easeOut',
      }}
      className="
        mx-auto
        w-[calc(100vw-2rem)]
        max-w-[320px]
        sm:max-w-[350px]
        lg:max-w-[390px]
        xl:max-w-[410px]
      "
    >
<AdWrapper
  adId={ad._id}
  className="
    group
    relative
    flex
    max-h-[calc(100vh-4rem)]
    min-h-0
    flex-col
    overflow-hidden
    rounded-2xl
    border
    border-border/60
    bg-background
    shadow-2xl
  "
>
  <Button
    type="button"
    size="icon"
    variant="secondary"
    aria-label="Close advertisement"
    onClick={onClose}
    className="
      absolute
      right-2
      top-2
      z-[100]

      h-8
      w-8

      rounded-full

      border
      border-border

      bg-background
      text-foreground

      shadow-lg

      hover:bg-muted
    "
  >
    <X className="h-4 w-4" />
  </Button>

        {ad.image && (
          <div
            className="
              relative
              z-10
              h-28
              shrink-0
              overflow-hidden
              sm:h-32
              lg:h-36
            "
          >
            <motion.div
              whileHover={{
                scale: 1.025,
              }}
              transition={{
                duration: 0.35,
              }}
              className="h-full"
            >
              <AdImage
                ad={ad}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </motion.div>

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-12
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
            z-10
            min-h-0
            p-4
            sm:p-4.5
            lg:p-5
          "
        >
          <div className="space-y-3">
            <AdBadge />

            <AdContent
              ad={ad}
            />

            {ad.actions.length > 0 && (
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
            )}
          </div>
        </div>
      </AdWrapper>
    </motion.div>
  );
}