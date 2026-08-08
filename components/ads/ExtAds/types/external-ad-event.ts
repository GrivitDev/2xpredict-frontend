 // external-ads/types/external-ad-event.ts

import { ExternalAdFormat } from './external-ad-format';

export enum ExternalAdEventType {
  POLICY_LOADED = 'policy_loaded',

  PROVIDER_INITIALIZED = 'provider_initialized',

  AD_REQUESTED = 'ad_requested',

  AD_LOADED = 'ad_loaded',

  AD_RENDERED = 'ad_rendered',

  AD_CLICKED = 'ad_clicked',

  AD_CLOSED = 'ad_closed',

  AD_SKIPPED = 'ad_skipped',

  AD_FAILED = 'ad_failed',
}

export interface ExternalAdEvent {
  type: ExternalAdEventType;

  adId?: string;

  providerId?: string;

  format?: ExternalAdFormat;

  timestamp: number;

  metadata?: Record<string, unknown>;
}