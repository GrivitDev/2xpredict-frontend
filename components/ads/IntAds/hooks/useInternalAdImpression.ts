'use client';

import { useRef } from 'react';

/**
 * InternalAds currently has no backend impression-tracking route.
 * Keep the renderer ref API stable without sending internal-ad IDs to the
 * separate campaign-ad impression endpoint.
 */
export function useInternalAdImpression(_adId: string) {
  return useRef<HTMLDivElement>(null);
}
