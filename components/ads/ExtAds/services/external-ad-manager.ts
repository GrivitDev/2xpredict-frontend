import type {
  ExternalAd,
  ExternalAdInstance,
  ExternalAdMountContext,
  ExternalAdRequest,
  ExternalAdResult,
} from '../types/external-ad';

import type {
  ExternalAdPolicy,
} from '../types/external-ad-policy';

import {
  ExternalAdEventType,
  type ExternalAdEvent,
} from '../types/external-ad-event';

import type {
  ExternalAdProvider,
} from '../providers/ExternalAdProvider';

import {
  ExternalAdFormat,
} from '../types/external-ad-format';

import {
  externalAdRegistry,
} from '../providers/ExternalAdRegistry';

import {
  initializeExternalAdProviders,
} from '../providers/initializeExternalAdProviders';

import {
  externalAdService,
} from './external-ad.service';

import {
  getExternalAdDailyImpressionCount,
  getExternalAdSessionImpressionCount,
  recordExternalAdImpression,
} from '../utils/storage';

export interface ExternalAdManagerOptions {
  policy?: ExternalAdPolicy | null;

  onEvent?: (
    event: ExternalAdEvent,
  ) => void;
}

export class ExternalAdManager {
  private policy:
    ExternalAdPolicy | null;

  private readonly onEvent?:
    (
      event: ExternalAdEvent,
    ) => void;

  private readonly activeInstances =
    new Map<
      string,
      ExternalAdInstance
    >();

  private initializedProviders =
    new Set<string>();

  private lastRequestAt = 0;

  constructor(
    options: ExternalAdManagerOptions = {},
  ) {
    this.policy =
      options.policy ?? null;

    this.onEvent =
      options.onEvent;
  }

  setPolicy(
    policy: ExternalAdPolicy | null,
  ): void {
    this.policy = policy;

    if (!policy) {
      return;
    }

    this.emit({
      type:
        ExternalAdEventType.POLICY_LOADED,
      timestamp: Date.now(),
    });
  }

  getPolicy():
    | ExternalAdPolicy
    | null {
    return this.policy;
  }

  isEnabled(): boolean {
    return (
      this.policy?.enabled === true
    );
  }

  isFormatAllowed(request: ExternalAdRequest): boolean {
    const policy = this.policy;
    if (!policy?.enabled) return false;

    switch (request.format) {
      case ExternalAdFormat.BANNER: return policy.allowedTypes?.BANNER ?? policy.allowBanner;
      case ExternalAdFormat.NATIVE: return policy.allowedTypes?.NATIVE ?? policy.allowNative;
      case ExternalAdFormat.VIDEO: return policy.allowedTypes?.VIDEO ?? policy.allowVideo;
      case ExternalAdFormat.POPUP: return policy.allowedTypes?.POPUP ?? policy.allowPopup;
      case ExternalAdFormat.INTERSTITIAL: return policy.allowedTypes?.INTERSTITIAL ?? policy.allowInterstitial;
      case ExternalAdFormat.REWARDED: return policy.allowedTypes?.REWARDED ?? policy.allowRewarded;
      case ExternalAdFormat.STICKY: return policy.allowedTypes?.STICKY ?? policy.allowSticky;
      default: return false;
    }
  }

  canRequest(): boolean {
    if (!this.policy?.enabled) {
      return false;
    }

    if (this.policy.frequency === 'NONE') return false;

    const sessionCap = this.policy.maxImpressionsPerSession;
    const dailyCap = this.policy.maxImpressionsPerDay;
    if (typeof sessionCap === 'number' && sessionCap > 0 && getExternalAdSessionImpressionCount() >= sessionCap) return false;
    if (typeof dailyCap === 'number' && dailyCap > 0 && getExternalAdDailyImpressionCount() >= dailyCap) return false;

    const configuredRefreshSeconds = Math.max(
      0,
      this.policy.refreshIntervalSeconds ?? this.policy.refreshInterval,
    );
    // LOW uses a wider gap than NORMAL; NONE is rejected above.
    const frequencyMultiplier = this.policy.frequency === 'LOW' ? 3 : 1;
    const refreshInterval = configuredRefreshSeconds * frequencyMultiplier * 1000;

    if (refreshInterval === 0) {
      return true;
    }

    if (this.lastRequestAt === 0) {
      return true;
    }

    return (
      Date.now() -
        this.lastRequestAt >=
      refreshInterval
    );
  }

  async load(
    request: ExternalAdRequest,
  ): Promise<ExternalAdResult | null> {
    if (
      !this.isFormatAllowed(
        request,
      )
    ) {
      return null;
    }

    if (!this.canRequest()) {
      return null;
    }

    await initializeExternalAdProviders();

    const providers =
      await externalAdRegistry.getForRequest(
        request,
      );

    if (!providers.length) {
      this.emit({
        type:
          ExternalAdEventType.AD_FAILED,
        format:
          request.format,
        timestamp: Date.now(),
        metadata: {
          reason:
            'No registered provider supports this format.',
        },
      });

      return null;
    }

    this.lastRequestAt =
      Date.now();

    this.emit({
      type:
        ExternalAdEventType.AD_REQUESTED,
      format:
        request.format,
      timestamp: Date.now(),
    });

    for (const provider of providers) {
      try {
        await this.initializeProvider(
          provider,
        );

        const result =
          await provider.load(
            request,
            {
              emitEvent:
                (event) =>
                  this.emit(
                    event as ExternalAdEvent,
                  ),
              logger: {
                debug: console.debug,
                info: console.info,
                warn: console.warn,
                error: console.error,
              },
            },
          );

        if (!result) {
          continue;
        }

        const ad =
          externalAdService.validateAd(
            result.ad,
          );

        const normalizedResult:
          ExternalAdResult = {
          ...result,
          ad,
        };

        if (
          normalizedResult.instance
        ) {
          this.activeInstances.set(
            normalizedResult.instance
              .id,
            normalizedResult.instance,
          );
        }

        recordExternalAdImpression();
        this.emit({
          type:
            ExternalAdEventType.AD_LOADED,
          adId:
            ad.id,
          providerId:
            provider.id,
          format:
            ad.format,
          timestamp: Date.now(),
        });

        return normalizedResult;
      } catch (error) {
        this.emit({
          type:
            ExternalAdEventType.AD_FAILED,
          providerId:
            provider.id,
          format:
            request.format,
          timestamp: Date.now(),
          metadata: {
            error:
              error instanceof Error
                ? error.message
                : String(error),
          },
        });
      }
    }

    return null;
  }

  async mount(
    instance: ExternalAdInstance,
    container: HTMLElement,
    request: ExternalAdRequest,
  ): Promise<void> {
    if (!instance.mount) {
      return;
    }

    const context:
      ExternalAdMountContext = {
      container,
      ad: instance.ad,
      request,
    };

    try {
      await instance.mount(
        context,
      );

      this.emit({
        type:
          ExternalAdEventType.AD_RENDERED,
        adId:
          instance.ad.id,
        providerId:
          instance.providerId,
        format:
          instance.ad.format,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.emit({
        type:
          ExternalAdEventType.AD_FAILED,
        adId:
          instance.ad.id,
        providerId:
          instance.providerId,
        format:
          instance.ad.format,
        timestamp: Date.now(),
        metadata: {
          stage: 'mount',
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
      });

      throw error;
    }
  }

  async destroy(
    instanceId: string,
  ): Promise<void> {
    const instance =
      this.activeInstances.get(
        instanceId,
      );

    if (!instance) {
      return;
    }

    const provider =
      externalAdRegistry.get(
        instance.providerId,
      );

    try {
      if (
        provider?.destroy
      ) {
        await provider.destroy(
          instance,
        );
      } else if (
        instance.destroy
      ) {
        await instance.destroy();
      }
    } finally {
      this.activeInstances.delete(
        instanceId,
      );
    }
  }

  async destroyAll(): Promise<void> {
    const instances =
      Array.from(
        this.activeInstances.values(),
      );

    await Promise.all(
      instances.map(
        (instance) =>
          this.destroy(
            instance.id,
          ),
      ),
    );
  }

  resetFrequency(): void {
    this.lastRequestAt = 0;
  }

  private async initializeProvider(
    provider: ExternalAdProvider,
  ): Promise<void> {
    if (
      this.initializedProviders.has(
        provider.id,
      )
    ) {
      return;
    }

    /*
     * Provider configuration is handled by
     * initializeExternalAdProviders().
     *
     * Do not initialize the provider again here
     * without its configuration.
     */

    this.initializedProviders.add(
      provider.id,
    );

    this.emit({
      type:
        ExternalAdEventType.PROVIDER_INITIALIZED,
      providerId:
        provider.id,
      timestamp: Date.now(),
    });
  }

  private emit(
    event: ExternalAdEvent,
  ): void {
    try {
      this.onEvent?.(event);
    } catch {
      // Event consumers must never
      // break advertising.
    }
  }
}

export const externalAdManager =
  new ExternalAdManager();
