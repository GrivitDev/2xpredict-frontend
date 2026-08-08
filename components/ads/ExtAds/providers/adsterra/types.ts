export interface AdsterraConfig {
  publisherId: string;

  enabled?: boolean;

  priority?: number;

  zoneId?: string;

  scriptUrl?: string;

  options?: Record<string, unknown>;
}

export interface AdsterraAdRequestOptions {
  zoneId?: string;

  format?: string;

  placement?: string;

  width?: number;

  height?: number;

  metadata?: Record<string, unknown>;
}