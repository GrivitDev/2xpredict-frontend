import {
  ExternalAdFormat,
} from '../../types/external-ad-format';

import type {
  ExternalAdInstance,
  ExternalAdRequest,
  ExternalAdResult,
} from '../../types/external-ad';

import type {
  ExternalAdProvider,
  ExternalAdProviderConfig,
  ExternalAdProviderContext,
} from '../ExternalAdProvider';

import {
  AdsterraAdapter,
} from './AdsterraAdapter';

import type {
  AdsterraConfig,
} from './types';

export class AdsterraProvider
  implements ExternalAdProvider
{
  readonly id = 'adsterra';

  readonly name =
    'Adsterra';

  readonly version =
    '1.0.0';

  readonly priority = 60;

  readonly supportedFormats =
    [
      ExternalAdFormat.BANNER,
      ExternalAdFormat.NATIVE,
      ExternalAdFormat.VIDEO,
      ExternalAdFormat.POPUP,
      ExternalAdFormat.INTERSTITIAL,
      ExternalAdFormat.REWARDED,
    ] as const;

  private readonly adapter =
    new AdsterraAdapter();

  private config:
    | AdsterraConfig
    | null = null;

  async initialize(
    config?: ExternalAdProviderConfig,
    context?: ExternalAdProviderContext,
  ): Promise<void> {
    const options =
      config?.options ?? {};

    const publisherId =
      typeof options.publisherId ===
      'string'
        ? options.publisherId
        : '';

    this.config = {
      publisherId,

      enabled:
        config?.enabled ?? true,

      priority:
        config?.priority ??
        this.priority,

      zoneId:
        typeof options.zoneId ===
        'string'
          ? options.zoneId
          : undefined,

      scriptUrl:
        typeof options.scriptUrl ===
        'string'
          ? options.scriptUrl
          : undefined,

      options,
    };

    if (
      !this.config.enabled
    ) {
      return;
    }

    await this.adapter.initialize(
      this.config,
      context,
    );
  }

  isAvailable(
    request: ExternalAdRequest,
  ): boolean {
    if (
      this.config?.enabled === false
    ) {
      return false;
    }

    if (
      !this.config?.publisherId
    ) {
      return false;
    }

    if (
      !this.supportedFormats.includes(
        request.format as
          (typeof this.supportedFormats)[number],
      )
    ) {
      return false;
    }

    const metadata =
      request.metadata ?? {};

    return Boolean(
      (
        typeof metadata.zoneId ===
        'string' &&
        metadata.zoneId
      ) ||
      this.config.zoneId,
    );
  }

  async load(
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<ExternalAdResult | null> {
    if (
      !this.isAvailable(request)
    ) {
      return null;
    }

    return this.adapter.load(
      request,
      context,
    );
  }

  async mount(
    instance: ExternalAdInstance,
    container: HTMLElement,
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<void> {
    await this.adapter.mount(
      instance,
      container,
      request,
      context,
    );
  }

  async destroy(
    instance: ExternalAdInstance,
  ): Promise<void> {
    await this.adapter.destroy(
      instance,
    );
  }

  async destroyAll(): Promise<void> {
    await this.adapter.destroyAll();
    this.config = null;
  }
}

export const adsterraProvider =
  new AdsterraProvider();