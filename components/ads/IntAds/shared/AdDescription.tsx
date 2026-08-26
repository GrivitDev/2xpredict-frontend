'use client';

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
    <p
      className={cn(
        `
          mx-auto
          max-w-2xl
          text-center
          text-sm
          leading-6
          font-normal
          tracking-normal
          text-pretty
        `,
        'sm:text-[15px]',
        light
          ? 'text-white/90'
          : 'text-muted-foreground',
      )}
    >
      {ad.description}
    </p>
  );
}