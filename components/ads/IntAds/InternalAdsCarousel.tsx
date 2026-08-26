'use client';

import {
  useEffect,
  useState,
} from 'react';

import { InternalAd } from '@/types/internal-ad';

import { InternalAdRenderer } from './InternalAdRenderer';

import { useWeightedAds } from './hooks/useWeightedAds';

type Variant =
  | 'hero'
  | 'banner'
  | 'inline'
  | 'bottom'
  | 'footer'
  | 'sidebar'
  | 'popup';

interface Props {
  ads: InternalAd[];
  variant: Variant;
  interval?: number;
}

export function InternalAdsCarousel({
  ads,
  variant,
  interval = 8000,
}: Props) {
  const weightedAds = useWeightedAds(ads);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((prev) =>
      weightedAds.length
        ? prev % weightedAds.length
        : 0,
    );
  }, [weightedAds.length]);

  useEffect(() => {
    if (weightedAds.length <= 1) {
      return;
    }

    const id = setInterval(() => {
      setIndex((prev) =>
        (prev + 1) % weightedAds.length,
      );
    }, interval);

    return () => {
      clearInterval(id);
    };
  }, [
    weightedAds.length,
    interval,
  ]);

  if (!weightedAds.length) {
    return null;
  }

  const ad = weightedAds[index];

  return (
    <InternalAdRenderer
      ad={ad}
      variant={variant}
    />
  );
}