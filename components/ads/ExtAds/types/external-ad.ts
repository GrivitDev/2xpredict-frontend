import type { ExternalAdFormat } from './external-ad-format';

export interface ExternalAdRequest {
  format: ExternalAdFormat;

  placement?: string;

  width?: number;

  height?: number;

  metadata?: Record<string, unknown>;
}

export interface ExternalAd {
  id: string;

  providerId: string;

  format: ExternalAdFormat;

  title?: string;

  description?: string;

  imageUrl?: string;

  videoUrl?: string;

  clickUrl?: string;

  width?: number;

  height?: number;

  /**
   * Provider-specific HTML payload.
   *
   * This is data only. The core renderer must not
   * blindly execute arbitrary HTML.
   */
  html?: string;

  /**
   * Provider-specific script payload.
   *
   * This is data only. Scripts must only be executed
   * by a trusted provider implementation.
   */
  script?: string;

  metadata?: Record<string, unknown>;
}

export interface ExternalAdMountContext {
  container: HTMLElement;

  ad: ExternalAd;

  request: ExternalAdRequest;
}

export interface ExternalAdInstance {
  id: string;

  ad: ExternalAd;

  providerId: string;

  /**
   * Mount the provider advertisement into a DOM container.
   *
   * Providers that do not require DOM mounting may
   * implement this as a no-op.
   */
  mount?: (
    context: ExternalAdMountContext,
  ) => void | Promise<void>;

  /**
   * Destroy everything created by the provider instance.
   */
  destroy?: () => void | Promise<void>;
}

export interface ExternalAdResult {
  ad: ExternalAd;

  instance?: ExternalAdInstance;
}