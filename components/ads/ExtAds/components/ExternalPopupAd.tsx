// components/ads/ExtAds/components/ExternalPopupAd.tsx

'use client';

import type { ExternalAdResult } from '../types/external-ad';
import { ExternalAdFormat } from '../types/external-ad-format';
import { ExternalAd } from './ExternalAd';

interface ExternalPopupAdProps {
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

export function ExternalPopupAd({
  placement = 'popup',
  width,
  height,
  className,
  metadata,
  autoLoad = true,
  enabled,
  loadWhenAllowed = true,
  onLoaded,
  onError,
}: ExternalPopupAdProps) {
  return (
    <ExternalAd
      format={ExternalAdFormat.POPUP}
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