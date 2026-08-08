'use client';

import { useEffect, useRef, useState } from 'react';

import { InternalAd } from '@/types/internal-ad';

import { AdTitle } from './AdTitle';
import { AdDescription } from './AdDescription';
import { AdInstructions } from './AdInstructions';

interface Props {
  ad: InternalAd;
  centered?: boolean;
  light?: boolean;
}

export function AdContent({
  ad,
  centered = false,
  light = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [contentScale, setContentScale] = useState(1);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateScale = () => {
      const height = element.scrollHeight;
      const width = element.clientWidth;

      if (!height || !width) {
        return;
      }

      /*
       * Short content:
       *   larger typography
       *
       * Long content:
       *   progressively smaller typography
       *
       * The scale is intentionally bounded so text
       * never becomes too large or too small.
       */

      const idealHeight = width < 400 ? 300 : 340;

      const calculatedScale =
        idealHeight / height;

      const scale = Math.min(
        1.12,
        Math.max(
          0.78,
          calculatedScale,
        ),
      );

      setContentScale(scale);
    };

    updateScale();

    const observer = new ResizeObserver(
      updateScale,
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    ad.title,
    ad.subTitle,
    ad.description,
    ad.instructions,
  ]);

  return (
    <div
      ref={containerRef}
      className={
        centered
          ? 'space-y-3 text-center'
          : 'space-y-3'
      }
      style={{
        '--ad-content-scale': contentScale,
      } as React.CSSProperties}
    >
      <AdTitle
        ad={ad}
        centered={centered}
        light={light}
      />

      <AdDescription
        ad={ad}
        light={light}
      />

      <AdInstructions
        ad={ad}
        light={light}
      />
    </div>
  );
}