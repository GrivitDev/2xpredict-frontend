// components/ads/ExtAds/components/ExternalVideoAd.tsx

'use client';

import type { ExternalAdResult } from '../types/external-ad';
import { ExternalAdFormat } from '../types/external-ad-format';
import { ExternalAd } from './ExternalAd';

interface ExternalVideoAdProps {
  placement?: string;
  width?: number;
  height?: number;
  className?: string;
  metadata?: Record<string, unknown>;
  autoLoad?: boolean;
  enabled?: boolean;
  loadWhenAllowed?: boolean;
  onLoaded?: (result: ExternalAdResult) => void;
  onError?: (error: Error) => void;
}

export function ExternalVideoAd({
  placement = 'video',
  width,
  height,
  className,
  metadata,
  autoLoad = true,
  enabled,
  loadWhenAllowed = true,
  onLoaded,
  onError,
}: ExternalVideoAdProps) {
  return (
    <ExternalAd
      format={ExternalAdFormat.VIDEO}
      placement={placement}
      width={width}
      height={height}
      metadata={metadata}
      className={className}
      autoLoad={autoLoad}
      enabled={enabled}
      loadWhenAllowed={loadWhenAllowed}
      onLoaded={onLoaded}
      onError={onError}
    />
  );
}