import type {
  ExternalAdPolicy,
} from '../types/external-ad-policy';

import type {
  ExternalAd,
  ExternalAdRequest,
} from '../types/external-ad';

import type {
  ExternalAdFormat,
} from '../types/external-ad-format';

export class ExternalAdService {
  private readonly baseUrl: string;

  constructor(
    baseUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      '',
  ) {
    this.baseUrl =
      baseUrl.replace(/\/+$/, '');
  }

  async getPolicy(
    signal?: AbortSignal,
  ): Promise<ExternalAdPolicy> {
    const response =
      await fetch(
        `${this.baseUrl}/ads/policy`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          signal,
          headers: {
            Accept:
              'application/json',
          },
        },
      );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch external ad policy (${response.status})`,
      );
    }

    const data: unknown =
      await response.json();

    return this.validatePolicy(
      data,
    );
  }

  private validatePolicy(
    value: unknown,
  ): ExternalAdPolicy {
    if (
      !value ||
      typeof value !== 'object'
    ) {
      throw new Error(
        'Invalid external ad policy response',
      );
    }

    const policy =
      value as Record<
        string,
        unknown
      >;

    const validFrequency =
      policy.frequency ===
        'NONE' ||
      policy.frequency ===
        'LOW' ||
      policy.frequency ===
        'NORMAL';

    if (
      typeof policy.enabled !==
        'boolean' ||
      typeof policy.showInternalAds !==
        'boolean' ||
      !validFrequency ||
      typeof policy.aggressive !==
        'boolean' ||
      typeof policy.refreshInterval !==
        'number' ||
      !Number.isFinite(
        policy.refreshInterval,
      ) ||
      policy.refreshInterval < 0 ||
      typeof policy.allowPopup !==
        'boolean' ||
      typeof policy.allowInterstitial !==
        'boolean' ||
      typeof policy.allowRewarded !==
        'boolean'
    ) {
      throw new Error(
        'Invalid external ad policy response',
      );
    }

    return {
      enabled:
        policy.enabled,

      showInternalAds:
        policy.showInternalAds,

      frequency:
        policy.frequency as ExternalAdPolicy['frequency'],

      aggressive:
        policy.aggressive,

      refreshInterval:
        Math.max(
          0,
          policy.refreshInterval,
        ),

      allowPopup:
        policy.allowPopup,

      allowInterstitial:
        policy.allowInterstitial,

      allowRewarded:
        policy.allowRewarded,
    };
  }

  createRequest(
    format: ExternalAdFormat,
    options?: {
      placement?: string;
      width?: number;
      height?: number;
      metadata?: Record<
        string,
        unknown
      >;
    },
  ): ExternalAdRequest {
    return {
      format,

      placement:
        options?.placement,

      width:
        options?.width,

      height:
        options?.height,

      metadata:
        options?.metadata,
    };
  }

  validateAd(
    value: unknown,
  ): ExternalAd {
    if (
      !value ||
      typeof value !== 'object'
    ) {
      throw new Error(
        'Invalid external advertisement',
      );
    }

    const ad =
      value as Record<
        string,
        unknown
      >;

    if (
      typeof ad.id !== 'string' ||
      ad.id.length === 0 ||
      typeof ad.providerId !==
        'string' ||
      ad.providerId.length === 0 ||
      typeof ad.format !== 'string'
    ) {
      throw new Error(
        'Invalid external advertisement',
      );
    }

    return value as ExternalAd;
  }
}

export const externalAdService =
  new ExternalAdService();