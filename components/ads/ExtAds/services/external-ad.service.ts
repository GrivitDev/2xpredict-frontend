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

  private validatePolicy(value: unknown): ExternalAdPolicy {
    if (!value || typeof value !== 'object') throw new Error('Invalid external ad policy response');
    const root = value as Record<string, unknown>;
    const policy = (root.external && typeof root.external === 'object' ? root.external : root) as Record<string, unknown>;
    const rawTypes = (policy.allowedTypes && typeof policy.allowedTypes === 'object' ? policy.allowedTypes : {}) as Record<string, unknown>;
    const rawAudiences = (policy.audiences && typeof policy.audiences === 'object' ? policy.audiences : {}) as Record<string, unknown>;
    const bool = (value: unknown, fallback = false) => typeof value === 'boolean' ? value : fallback;
    const number = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
    const frequency = policy.frequency === 'NONE' || policy.frequency === 'LOW' || policy.frequency === 'NORMAL' ? policy.frequency : 'NONE';
    const enabled = bool(policy.enabledForCurrentAudience, bool(policy.enabled, bool(policy.configuredEnabled, false)));
    const allowBanner = bool(rawTypes.BANNER, bool(policy.allowBanner, true));
    const allowNative = bool(rawTypes.NATIVE, bool(policy.allowNative, true));
    const allowInterstitial = bool(rawTypes.INTERSTITIAL, bool(policy.allowInterstitial, true));
    const allowPopup = bool(rawTypes.POPUP, bool(policy.allowPopup, false));
    const allowRewarded = bool(rawTypes.REWARDED, bool(policy.allowRewarded, false));
    const allowSticky = bool(rawTypes.STICKY, bool(policy.allowSticky, true));
    const allowVideo = bool(rawTypes.VIDEO, bool(policy.allowVideo, false));
    return {
      enabled,
      audiences: { GUEST:bool(rawAudiences.GUEST,true), FREE:bool(rawAudiences.FREE,true), REGULAR:bool(rawAudiences.REGULAR,true), VIP:bool(rawAudiences.VIP,false), PREMIUM:bool(rawAudiences.PREMIUM,false) },
      frequency,
      refreshIntervalSeconds:number(policy.refreshIntervalSeconds, number(policy.refreshInterval,60)),
      maxImpressionsPerSession:number(policy.maxImpressionsPerSession,3),
      maxImpressionsPerDay:number(policy.maxImpressionsPerDay,20),
      allowedTypes:{ BANNER:allowBanner, INTERSTITIAL:allowInterstitial, NATIVE:allowNative, REWARDED:allowRewarded, POPUP:allowPopup, STICKY:allowSticky, VIDEO:allowVideo },
      allowBanner, allowNative, allowInterstitial, allowPopup, allowRewarded, allowSticky, allowVideo,
      // External policy must never switch off in-app campaign/InternalAds delivery.
      showInternalAds:true,
      aggressive:frequency==='NORMAL',
      refreshInterval:number(policy.refreshIntervalSeconds,number(policy.refreshInterval,60)),
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
