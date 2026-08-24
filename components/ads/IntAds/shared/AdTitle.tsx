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
    useState(30);

  useEffect(() => {

    const container =
      containerRef.current;

    const text =
      textRef.current;

    if (!container || !text) {
      return;
    }

    const calculateFontSize = () => {

      const width =
        container.clientWidth;

      if (!width) {
        return;
      }

      let size = 30;

      text.style.fontSize = `${size}px`;

      while (
        text.scrollHeight >
          size * 2.6 &&
        size > 20
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

    return () =>
      observer.disconnect();

  }, [
    ad.title,
  ]);

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
        duration: .35,
      }}
      className={cn(
        'w-full space-y-2',
        centered && 'text-center',
      )}
    >

      <motion.h2
        ref={textRef}
        style={{
          fontSize,
        }}
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: .05,
        }}
        className={cn(
          `
            font-display

            font-bold

            uppercase

            leading-[1.05]

            tracking-[0.02em]

            text-balance

            break-words

            transition-all

            duration-300
          `,
          light
            ? 'text-white'
            : 'text-foreground',
        )}
      >

        {ad.title}

      </motion.h2>

      {ad.subTitle && (

        <motion.p
          initial={{
            opacity: 0,
            y: 4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: .12,
          }}
          className={cn(
            `
              mx-auto
              max-w-2xl

              text-sm
              sm:text-[15px]

              leading-6

              font-medium

              text-pretty
            `,
            light
              ? 'text-white/85'
              : 'text-muted-foreground',
          )}
        >

          {ad.subTitle}

        </motion.p>

      )}

    </motion.div>

  );

}