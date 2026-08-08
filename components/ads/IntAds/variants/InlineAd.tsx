'use client';

import { motion } from 'framer-motion';

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
        shadow-lg
        transition-all
        duration-500
        hover:border-primary/40
        hover:shadow-2xl
      "
    >

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: .3,
        }}
        transition={{
          duration: .45,
        }}
        className="
          grid
          md:grid-cols-[40%_60%]
        "
      >

        {/* LEFT IMAGE */}

        {
          ad.image && (
<div
  className="
    relative
    flex
    overflow-hidden
    min-h-[320px]
  "
>

  <motion.div
    whileHover={{
      scale: 1.05,
    }}
    transition={{
      duration: .6,
    }}
    className="
      absolute
      inset-0
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

  </motion.div>

</div>

          )
        }

        {/* RIGHT CONTENT */}

        <div
          className="
            relative
            overflow-hidden
          "
        >

          {/* Same image as background */}

          {
            ad.image && (

              <div
                className="
                  absolute
                  inset-0
                "
              >

<AdImage
  ad={ad}
  fill
  className="
    object-cover
    object-center
    scale-110
    opacity-45
  "
/>

              </div>

            )
          }

          {/* Dark overlay */}

<div
  className="
    absolute
    inset-0
    bg-black/70
    backdrop-blur-[2px]
  "
/>

          {/* Soft glow */}

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.08),transparent_35%)]
            "
          />

          {/* Content */}

          <div
            className="
              relative
              z-10
              flex
              h-full
              flex-col
              p-6
              lg:p-8
            "
          >

            {/* Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-6
              "
            >

              <div className="flex-1">

                <AdTitle
                  ad={ad}
                  light
                />

              </div>

              <AdBadge />

            </div>

            {/* Description */}

            <div
              className="
                flex-1
                flex
                items-center
                justify-center
                py-6
              "
            >

              <div
                className="
                  max-w-xl
                "
              >

                <AdDescription
                  ad={ad}
                  light
                />

              </div>

            </div>

            {/* Bottom */}

            <div
              className="
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

              <AdActions
                ad={ad}
              />

            </div>

          </div>

        </div>

      </motion.div>

    </AdWrapper>

  );

}