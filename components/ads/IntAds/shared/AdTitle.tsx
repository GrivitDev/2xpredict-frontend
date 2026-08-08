'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { motion } from 'framer-motion';

import { InternalAd } from '@/types/internal-ad';

import { cn } from '@/lib/utils';

interface Props {
  ad: InternalAd;
  centered?: boolean;
  light?: boolean;
}

export function AdTitle({
  ad,
  centered = false,
  light = false,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const textRef =
    useRef<HTMLHeadingElement>(null);

  const [fontSize, setFontSize] =
    useState(32);

  useEffect(() => {
    const container =
      containerRef.current;

    const text =
      textRef.current;

    if (!container || !text) {
      return;
    }

    const calculateFontSize = () => {
      const availableWidth =
        container.clientWidth;

      if (!availableWidth) {
        return;
      }

      let size = 32;

      text.style.fontSize = `${size}px`;

      while (
        text.scrollWidth > availableWidth &&
        size > 16
      ) {
        size -= 1;

        text.style.fontSize =
          `${size}px`;
      }

      setFontSize(size);
    };

    calculateFontSize();

    const observer =
      new ResizeObserver(
        calculateFontSize,
      );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [ad.title]);

  return (
    <motion.div
      ref={containerRef}
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className={cn(
        'w-full space-y-2',
        centered && 'text-center',
      )}
    >
      <motion.h2
        ref={textRef}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
          duration: 0.4,
        }}
        style={{
          fontSize: `${fontSize}px`,
        }}
        className={cn(
          `
            w-full

            whitespace-nowrap

            font-display
            uppercase

            leading-none
            tracking-[0.04em]
          `,
          light
            ? 'text-white'
            : 'text-foreground',
        )}
      >
        {ad.title.toUpperCase()}
      </motion.h2>

      {ad.subTitle && (
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.15,
          }}
          className={cn(
            `
              mx-auto
              max-w-2xl

              text-[clamp(0.75rem,2.5vw,0.95rem)]

              font-semibold
              leading-snug
              tracking-tight
            `,
            light
              ? 'text-white/90'
              : 'text-muted-foreground',
          )}
        >
          {ad.subTitle}
        </motion.p>
      )}
    </motion.div>
  );
}