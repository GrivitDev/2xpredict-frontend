'use client';

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
        min-h-[220px]
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-lg
        transition-shadow
        duration-300
        hover:shadow-xl
        sm:min-h-[250px]
        lg:min-h-[280px]
      "
    >

      {ad.image && (

        <>

          <div className="absolute inset-0">

            <AdImage
              ad={ad}
              fill
              priority
            />

          </div>

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-black/85
              via-black/60
              to-black/35
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/65
              via-black/10
              to-transparent
            "
          />

          <div
            className="
              pointer-events-none
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
          flex-col
          justify-between
          p-4
          sm:min-h-[250px]
          sm:p-5
          lg:min-h-[280px]
          lg:p-6
        "
      >

        <div>

          <AdBadge />

        </div>

        <div
          className="
            mx-auto
            flex
            w-full
            max-w-4xl
            flex-col
            items-center
            gap-2
            py-4
            text-center
            sm:py-5
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

        </div>

        <div
          className="
            mt-3
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <div className="max-w-lg">

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