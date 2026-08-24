'use client';

import Image from 'next/image';

import { motion } from 'framer-motion';

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

      <motion.div
        initial={{
          opacity: 0,
          scale: 1.02,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: .45,
        }}
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
              transition-transform
              duration-700
              ease-out
              group-hover:scale-[1.04]
            `,
            className,
          )}
        />

        {/* Premium cinematic overlay */}

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

        {/* Soft vignette */}

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

      </motion.div>

    );

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
        duration: .4,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-border/60
        bg-muted/20
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
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
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.04]
          `,
          className,
        )}
      />

      {/* Premium overlay */}

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

      {/* Soft border highlight */}

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

    </motion.div>

  );

}