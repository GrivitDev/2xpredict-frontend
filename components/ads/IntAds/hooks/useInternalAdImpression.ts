'use client';

import { useEffect, useRef } from 'react';

import { useInView } from 'framer-motion';

import { useRecordAdImpression } from '@/hooks/useAds';

// Tracks ads that have already had an impression recorded
// during the current page session.
const recordedImpressions = new Set<string>();

export function useInternalAdImpression(
  adId: string,
) {
  const ref =
    useRef<HTMLDivElement>(null);

  const inView =
    useInView(
      ref,
      {
        once: true,
        margin: '-15%',
      },
    );

  const mutation =
    useRecordAdImpression();

  useEffect(() => {

    if (!inView) {
      return;
    }

    if (recordedImpressions.has(adId)) {
      return;
    }

    recordedImpressions.add(adId);

    mutation.mutate(adId, {
      onError: () => {
        // Allow retry if the request failed.
        recordedImpressions.delete(adId);
      },
    });

  }, [
    inView,
    adId,
    mutation,
  ]);

  return ref;
}