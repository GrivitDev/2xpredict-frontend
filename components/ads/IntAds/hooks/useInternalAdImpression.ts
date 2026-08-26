'use client';

import {
  useEffect,
  useRef,
} from 'react';

import { useRecordAdImpression } from '@/hooks/useAds';

// Tracks ads that have already had an impression
// recorded during the current page session.
const recordedImpressions =
  new Set<string>();

export function useInternalAdImpression(
  adId: string,
) {
  const ref =
    useRef<HTMLDivElement>(null);

  const mutation =
    useRecordAdImpression();

  useEffect(() => {
    const element =
      ref.current;

    if (!element) {
      return;
    }

    if (
      recordedImpressions.has(adId)
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            !entry.isIntersecting
          ) {
            return;
          }

          if (
            recordedImpressions.has(adId)
          ) {
            observer.disconnect();
            return;
          }

          recordedImpressions.add(adId);

          mutation.mutate(adId, {
            onError: () => {
              recordedImpressions.delete(
                adId,
              );
            },
          });

          observer.disconnect();
        },
        {
          rootMargin: '-15% 0px -15% 0px',
          threshold: 0,
        },
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, [
    adId,
    mutation,
  ]);

  return ref;
}