'use client';

import { InternalAd } from '@/types/internal-ad';

import { AdWrapper } from '../shared/AdWrapper';
import { AdImage } from '../shared/AdImage';
import { AdTitle } from '../shared/AdTitle';
import { AdDescription } from '../shared/AdDescription';
import { AdInstructions } from '../shared/AdInstructions';
import { AdActions } from '../shared/AdActions';
import { AdBadge } from '../shared/AdBadge';

interface Props {
  ad: InternalAd;
}

export function InlineAd({
  ad,
}: Props) {

  return (

    <AdWrapper
      adId={ad._id}
      className="
        group
        relative
        mx-auto
        max-w-7xl
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-lg
        transition-shadow
        duration-300
        hover:shadow-xl
      "
    >

      <div
        className="
          grid
          md:grid-cols-[42%_58%]
        "
      >

        {/* IMAGE */}

        {ad.image && (

          <div
            className="
              relative
              min-h-[210px]
              overflow-hidden
              sm:min-h-[260px]
              md:min-h-[320px]
            "
          >

            <div
              className="
                absolute
                inset-0
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.03]
              "
            >

              <AdImage
                ad={ad}
                fill
                className="
                  object-cover
                  object-center
                "
              />

            </div>

            <div
              className="
                pointer-events-none
                absolute
                inset-y-0
                right-0
                hidden
                w-24
                bg-gradient-to-l
                from-black/20
                to-transparent
                md:block
              "
            />

          </div>

        )}

        {/* CONTENT */}

        <div
          className="
            relative
            min-h-[320px]
            overflow-hidden
            bg-black
          "
        >

          {ad.image && (

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                overflow-hidden
              "
            >

              <AdImage
                ad={ad}
                fill
                className="
                  scale-105
                  object-cover
                  object-center
                  opacity-25
                "
              />

            </div>

          )}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-br
              from-black/85
              via-black/75
              to-black/60
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.08),transparent_38%)]
            "
          />

          <div
            className="
              relative
              z-10
              flex
              h-full
              flex-col
              p-4
              sm:p-5
              lg:p-6
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <AdTitle
                  ad={ad}
                  light
                />

              </div>

              <div className="shrink-0">

                <AdBadge />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div
              className="
                flex
                flex-1
                items-center
                py-5
                sm:py-6
              "
            >

              <div
                className="
                  w-full
                  max-w-xl
                "
              >

                <AdDescription
                  ad={ad}
                  light
                />

              </div>

            </div>

            {/* FOOTER */}

            <div
              className="
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
                  min-w-0
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
                  shrink-0
                  self-start
                  sm:self-end
                "
              >

                <AdActions
                  ad={ad}
                />

              </div>

            </div>

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