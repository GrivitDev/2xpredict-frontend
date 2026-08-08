export interface GoogleAdSenseConfig {
  clientId: string;

  enabled?: boolean;

  priority?: number;

  autoAds?: boolean;

  options?: Record<string, unknown>;
}

export interface GoogleAdRequestOptions {
  slot?: string;

  format?: string;

  responsive?: boolean;

  fullWidthResponsive?: boolean;

  layout?: string;

  layoutKey?: string;

  testMode?: boolean;

  metadata?: Record<string, unknown>;
}