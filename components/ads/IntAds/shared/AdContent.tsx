'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

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

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [contentScale, setContentScale] =
    useState(1);

  useEffect(() => {

    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateScale = () => {

      const height =
        element.scrollHeight;

      const width =
        element.clientWidth;

      if (!height || !width) {
        return;
      }

      /*
       * Compact responsive scaling.
       *
       * Short content stays slightly larger.
       * Long content scales down gracefully.
       */

      const idealHeight =
        width < 640
          ? 280
          : 330;

      const calculatedScale =
        idealHeight / height;

      const scale = Math.min(
        1.08,
        Math.max(
          0.82,
          calculatedScale,
        ),
      );

      setContentScale(scale);

    };

    updateScale();

    const observer =
      new ResizeObserver(updateScale);

    observer.observe(element);

    return () => observer.disconnect();

  }, [
    ad.title,
    ad.subTitle,
    ad.description,
    ad.instructions,
  ]);

  return (

    <div
      ref={containerRef}
      style={{
        '--ad-content-scale': contentScale,
      } as React.CSSProperties}
      className={[
        'relative',
        'space-y-2.5',
        'transition-all',
        'duration-300',
        centered
          ? 'text-center'
          : 'text-left',
      ].join(' ')}
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