import type {
  ExternalAd,
  ExternalAdInstance,
  ExternalAdRequest,
  ExternalAdResult,
} from '../types/external-ad';

import type { ExternalAdFormat } from '../types/external-ad-format';

export interface ExternalAdProviderConfig {
  enabled?: boolean;
  priority?: number;
  options?: Record<string, unknown>;
}

export interface ExternalAdProviderContext {
  signal?: AbortSignal;

  logger?: {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };

  emitEvent?: (event: {
    type: string;
    adId?: string;
    providerId?: string;
    format?: ExternalAdFormat;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }) => void;
}

export interface ExternalAdProvider {
  readonly id: string;

  readonly name: string;

  readonly version?: string;

  readonly priority?: number;

  readonly supportedFormats: readonly ExternalAdFormat[];

  initialize?(
    config?: ExternalAdProviderConfig,
    context?: ExternalAdProviderContext,
  ): Promise<void>;

  isAvailable(
    request: ExternalAdRequest,
  ): boolean | Promise<boolean>;

  load(
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<ExternalAdResult | null>;

  mount?(
    instance: ExternalAdInstance,
    container: HTMLElement,
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<void>;

  refresh?(
    instance: ExternalAdInstance,
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<ExternalAdResult | null>;

  destroy?(
    instance: ExternalAdInstance,
  ): Promise<void> | void;

  getAd?(
    instance: ExternalAdInstance,
  ): ExternalAd | null;

  destroyAll?(): Promise<void> | void;
}