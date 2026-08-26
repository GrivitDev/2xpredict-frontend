'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

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

      text.style.fontSize =
        `${size}px`;

      while (
        text.scrollHeight >
          size * 2.6 &&
        size > 20
      ) {
        size -= 1;

        text.style.fontSize =
          `${size}px`;
      }

      setFontSize(
        (current) =>
          current === size
            ? current
            : size,
      );
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
    <div
      ref={containerRef}
      className={cn(
        'w-full space-y-2',
        centered && 'text-center',
      )}
    >
      <h2
        ref={textRef}
        style={{
          fontSize,
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
          `,
          light
            ? 'text-white'
            : 'text-foreground',
        )}
      >
        {ad.title}
      </h2>

      {ad.subTitle && (
        <p
          className={cn(
            `
              mx-auto
              max-w-2xl
              text-sm
              leading-6
              font-medium
              text-pretty
            `,
            'sm:text-[15px]',
            light
              ? 'text-white/85'
              : 'text-muted-foreground',
          )}
        >
          {ad.subTitle}
        </p>
      )}
    </div>
  );
}