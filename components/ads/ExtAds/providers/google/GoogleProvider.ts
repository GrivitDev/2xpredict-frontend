// components/ads/ExtAds/providers/google/GoogleProvider.ts

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
  GoogleAdapter,
} from './GoogleAdapter';

import type {
  GoogleAdSenseConfig,
} from './types';

export class GoogleProvider
  implements ExternalAdProvider
{
  readonly id = 'google';

  readonly name =
    'Google AdSense';

  readonly version =
    '1.0.0';

  readonly priority =
    100;

  readonly supportedFormats =
    [
      ExternalAdFormat.BANNER,
      ExternalAdFormat.NATIVE,
    ] as const;

  private readonly adapter =
    new GoogleAdapter();

  private config:
    GoogleAdSenseConfig | null =
    null;

  async initialize(
    config?: ExternalAdProviderConfig,
    context?: ExternalAdProviderContext,
  ): Promise<void> {
    const options =
      config?.options ?? {};

const clientId =
  typeof options.clientId === 'string'
    ? options.clientId.trim()
    : '';

if (!clientId) {
  throw new Error(
    'Google AdSense clientId is required.',
  );
}

this.config = {
  clientId,
  enabled: config?.enabled ?? true,
  priority: config?.priority ?? this.priority,
  autoAds:
    typeof options.autoAds === 'boolean'
      ? options.autoAds
      : false,
  options,
};

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

    return this.supportedFormats.includes(
      request.format as
        (typeof this.supportedFormats)[number],
    );
  }

  async load(
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<ExternalAdResult | null> {
    if (!this.isAvailable(request)) {
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
    container.dataset.externalAdInstance =
      instance.id;

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

export const googleProvider =
  new GoogleProvider();