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
          scale: 1.03,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="absolute inset-0 overflow-hidden"
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
              group-hover:scale-105
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
            from-black/35
            via-transparent
            to-transparent
          "
        />

      </motion.div>

    );

  }

  return (

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.45,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
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
            group-hover:scale-105
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
          from-black/10
          via-transparent
          to-transparent
        "
      />

    </motion.div>

  );

}