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
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.35,
      }}
      className="space-y-2.5"
    >
      <h4
        className="
          text-[clamp(0.65rem,2vw,0.75rem)]
          font-semibold
          uppercase
          tracking-[0.18em]
          text-primary
        "
      >
        Instructions
      </h4>

      <ul className="space-y-1.5">
        {ad.instructions.map((instruction) => (
          <motion.li
            key={instruction}
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="
              flex
              items-center
              gap-2
            "
          >
            <CheckCircle2
              className="
                h-3.5
                w-3.5
                shrink-0
                text-primary
              "
            />

            <span
              className={cn(
                `
                  text-[clamp(0.7rem,2.2vw,0.875rem)]
                  leading-relaxed
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