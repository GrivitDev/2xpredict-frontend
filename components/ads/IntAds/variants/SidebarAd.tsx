'use client';

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

      {/* IMAGE */}

      {ad.image && (

        <div
          className="
            relative
            aspect-[4/3]
            overflow-hidden
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
              h-16
              bg-gradient-to-t
              from-card
              via-card/30
              to-transparent
            "
          />

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

      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          space-y-3.5
          p-4
          sm:p-5
        "
      >

        <AdBadge />

        <AdContent
          ad={ad}
        />

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