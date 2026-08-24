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
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: .35,
        delay: .18,
      }}
      className={cn(
        `
          mx-auto
          max-w-2xl

          text-center

          text-sm
          sm:text-[15px]

          leading-6

          font-normal

          tracking-normal

          text-pretty

          transition-colors
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
