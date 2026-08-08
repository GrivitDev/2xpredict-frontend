export interface MonetagConfig {
  publisherId: string;

  enabled?: boolean;

  priority?: number;

  zoneId?: string;

  scriptUrl?: string;

  options?: Record<string, unknown>;
}

export interface MonetagAdRequestOptions {
  zoneId?: string;

  format?: string;

  placement?: string;

  width?: number;

  height?: number;

  metadata?: Record<string, unknown>;
}