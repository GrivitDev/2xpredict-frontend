'use client';

import { motion } from 'framer-motion';

import { CheckCircle2 } from 'lucide-react';

import { InternalAd } from '@/types/internal-ad';

import { cn } from '@/lib/utils';

interface Props {
  ad: InternalAd;
  light?: boolean;
}

export function AdInstructions({
  ad,
  light = false,
}: Props) {

  if (!ad.instructions.length) {
    return null;
  }

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: .35,
        delay: .25,
      }}
      className="space-y-3"
    >

      <h4
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-primary
        "
      >
        Instructions
      </h4>

      <ul className="space-y-2">

        {ad.instructions.map((
          instruction,
          index,
        ) => (

          <motion.li
            key={instruction}
            initial={{
              opacity: 0,
              x: -8,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: .05 * index,
            }}
            className="
              flex
              items-start
              gap-2.5
            "
          >

            <div
              className="
                mt-0.5
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary/10
                ring-1
                ring-primary/15
              "
            >

              <CheckCircle2
                className="
                  h-3
                  w-3
                  text-primary
                "
              />

            </div>

            <span
              className={cn(
                `
                  text-sm
                  leading-6
                  text-pretty
                `,
                light
                  ? 'text-white/90'
                  : 'text-muted-foreground',
              )}
            >

              {instruction}

            </span>

          </motion.li>

        ))}

      </ul>

    </motion.div>

  );

}