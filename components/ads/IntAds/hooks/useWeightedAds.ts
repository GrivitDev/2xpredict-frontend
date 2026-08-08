'use client';

import { useMemo } from 'react';

import { InternalAd } from '@/types/internal-ad';

export function useWeightedAds(
  ads: InternalAd[],
) {
  return useMemo(() => {

    if (!ads.length) {
      return [];
    }

    const weighted: InternalAd[] = [];

    ads.forEach((ad) => {

      const weight = Math.max(
        1,
        ad.priority,
      );

      for (
        let i = 0;
        i < weight;
        i++
      ) {
        weighted.push(ad);
      }

    });

    return weighted;

  }, [ads]);
}