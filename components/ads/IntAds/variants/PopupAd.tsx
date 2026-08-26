'use client';

import { X } from 'lucide-react';

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

    <div
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
        "
      >

        {/* CLOSE */}

        {onClose && (

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
              hover:bg-background
              hover:text-foreground
              hover:shadow-lg
              active:scale-95
            "
          >

            <X className="h-3.5 w-3.5" />

          </Button>

        )}

        {/* IMAGE */}

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

            <div
              className="
                h-full
                w-full
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.03]
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

            </div>

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

        {/* CONTENT */}

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

          <div className="space-y-3.5">

            <AdBadge />

            <AdContent
              ad={ad}
            />

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

    </div>

  );

}