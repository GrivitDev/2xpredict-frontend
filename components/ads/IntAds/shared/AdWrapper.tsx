'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { useInternalAdImpression } from '../hooks/useInternalAdImpression';

interface Props {
  adId: string;
  children: ReactNode;
  className?: string;
}

export function AdWrapper({
  adId,
  children,
  className,
}: Props) {

  const ref =
    useInternalAdImpression(adId);

  return (

    <article
      ref={ref}
      className={cn(
        `
          group
          relative
          isolate
          overflow-hidden

          rounded-xl

          transition-all
          duration-300

          will-change-transform
        `,
        className,
      )}
    >

      {children}

    </article>

  );

}