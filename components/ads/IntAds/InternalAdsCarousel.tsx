'use client';

import {
  useEffect,
  useState,
} from 'react';

import { AnimatePresence } from 'framer-motion';

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

  interval = 1000,

}: Props) {

  const weightedAds =
    useWeightedAds(ads);

  const [index, setIndex] =
    useState(0);

  useEffect(() => {

    if (
      weightedAds.length <= 1
    ) {
      return;
    }

    const id =
      setInterval(() => {

        setIndex((prev) =>
          (prev + 1) %
          weightedAds.length,
        );

      }, interval);

    return () =>
      clearInterval(id);

  }, [
    weightedAds,
    interval,
  ]);

  if (!weightedAds.length) {
    return null;
  }

  const ad =
    weightedAds[index];

  return (

    <AnimatePresence
      mode="wait"
    >

      <InternalAdRenderer
        key={`${ad._id}-${index}`}
        ad={ad}
        variant={variant}
      />

    </AnimatePresence>

  );

}