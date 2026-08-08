'use client';

import { motion } from 'framer-motion';

import { InternalAd } from '@/types/internal-ad';

import { cn } from '@/lib/utils';

interface Props {
  ad: InternalAd;
  light?: boolean;
}

export function AdDescription({
  ad,
  light = false,
}: Props) {
  if (!ad.description) {
    return null;
  }

  return (
    <motion.p
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.25,
        duration: 0.45,
      }}
      className={cn(
        `
          mx-auto
          max-w-3xl

          text-center

          text-[clamp(0.75rem,2.5vw,0.9375rem)]

          leading-relaxed

          font-medium

          text-pretty
        `,
        light
          ? 'text-white/90'
          : 'text-muted-foreground',
      )}
    >
      {ad.description}
    </motion.p>
  );
}