'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

import { InternalAd } from '@/types/internal-ad';

interface Props {
  ad: InternalAd;
  fill?: boolean;
  priority?: boolean;
  className?: string;
}

export function AdImage({
  ad,
  fill = false,
  priority = false,
  className,
}: Props) {
  if (!ad.image) {
    return null;
  }

  if (fill) {
    return (
      <div
        className="
          absolute
          inset-0
          overflow-hidden
        "
      >
        <Image
          fill
          priority={priority}
          src={ad.image.url}
          alt={ad.title}
          sizes="100vw"
          className={cn(
            `
              object-cover
            `,
            className,
          )}
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/45
            via-black/10
            to-black/5
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            ring-1
            ring-inset
            ring-white/10
          "
        />
      </div>
    );
  }

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-border/60
        bg-muted/20
        shadow-sm
      "
    >
      <Image
        src={ad.image.url}
        alt={ad.title}
        width={900}
        height={650}
        priority={priority}
        sizes="
          (max-width:640px) 100vw,
          (max-width:1024px) 70vw,
          900px
        "
        className={cn(
          `
            h-full
            w-full
            object-cover
          `,
          className,
        )}
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black/20
          via-transparent
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-xl
          ring-1
          ring-inset
          ring-white/10
        "
      />
    </div>
  );
}