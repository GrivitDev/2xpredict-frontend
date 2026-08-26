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

export function HeroAd({
  ad,
}: Props) {

  return (

    <AdWrapper
      adId={ad._id}
      className="
        group
        relative
        min-h-[230px]
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-lg
        transition-shadow
        duration-300
        hover:shadow-xl
        sm:min-h-[270px]
        lg:min-h-[300px]
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
          flex-col
          justify-between
          p-4
          sm:min-h-[270px]
          sm:p-5
          lg:min-h-[300px]
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
            justify-center
            gap-2
            py-4
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

        </div>

        <div
          className="
            mt-3
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

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