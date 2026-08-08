// components/ads/ExtAds/providers/google/GoogleAdapter.ts

import type {
  ExternalAdInstance,
  ExternalAdRequest,
  ExternalAdResult,
} from '../../types/external-ad';

import type {
  ExternalAdProviderContext,
} from '../ExternalAdProvider';

import type {
  GoogleAdSenseConfig,
  GoogleAdRequestOptions,
} from './types';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export class GoogleAdapter {
  private config: GoogleAdSenseConfig | null = null;

  private initialized = false;

  private scriptPromise: Promise<void> | null = null;

  async initialize(
    config: GoogleAdSenseConfig,
    context?: ExternalAdProviderContext,
  ): Promise<void> {
    this.config = config;

    if (!config.clientId) {
      throw new Error(
        'Google AdSense clientId is required.',
      );
    }

    if (!this.isBrowser()) {
      return;
    }

    try {
      await this.loadScript(config.clientId);

      window.adsbygoogle =
        window.adsbygoogle || [];

      this.initialized = true;

      context?.logger?.info?.(
        '[ExternalAds] Google AdSense initialized.',
      );
    } catch (error) {
      this.initialized = false;

      context?.logger?.error?.(
        '[ExternalAds] Failed to initialize Google AdSense.',
        error,
      );

      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): GoogleAdSenseConfig | null {
    return this.config;
  }

  buildRequestOptions(
    request: ExternalAdRequest,
  ): GoogleAdRequestOptions {
    const metadata =
      request.metadata ?? {};

    return {
      slot:
        typeof metadata.slot === 'string'
          ? metadata.slot
          : undefined,

      format:
        typeof metadata.format === 'string'
          ? metadata.format
          : 'auto',

      responsive:
        typeof metadata.responsive === 'boolean'
          ? metadata.responsive
          : true,

      fullWidthResponsive:
        typeof metadata.fullWidthResponsive ===
        'boolean'
          ? metadata.fullWidthResponsive
          : true,

      layout:
        typeof metadata.layout === 'string'
          ? metadata.layout
          : undefined,

      layoutKey:
        typeof metadata.layoutKey === 'string'
          ? metadata.layoutKey
          : undefined,

      testMode:
        typeof metadata.testMode === 'boolean'
          ? metadata.testMode
          : false,

      metadata,
    };
  }

  async load(
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<ExternalAdResult | null> {
    if (!this.initialized) {
      throw new Error(
        'Google AdSense adapter has not been initialized.',
      );
    }

    const options =
      this.buildRequestOptions(request);

    if (!options.slot) {
      context?.logger?.warn?.(
        '[ExternalAds] Google AdSense slot is missing.',
      );

      return null;
    }

    const adId =
      `google-${request.format}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

    const instanceId =
      `google-instance-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

    const ad = {
      id: adId,
      providerId: 'google',
      format: request.format,
      width: request.width,
      height: request.height,
      metadata: {
        ...request.metadata,
        slot: options.slot,
      },
    };

    const instance: ExternalAdInstance = {
      id: instanceId,
      ad,
      providerId: 'google',

      mount: async ({
        container,
      }) => {
        await this.mountAd(
          container,
          request,
          options,
        );
      },

      destroy: async () => {
        this.destroyAd(
          instanceId,
        );
      },
    };

    return {
      ad,
      instance,
    };
  }

  async mount(
    instance: ExternalAdInstance,
    container: HTMLElement,
    request: ExternalAdRequest,
    context?: ExternalAdProviderContext,
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error(
        'Google AdSense adapter has not been initialized.',
      );
    }

    const options =
      this.buildRequestOptions(request);

    await this.mountAd(
      container,
      request,
      options,
    );

    context?.logger?.debug?.(
      '[ExternalAds] Google AdSense ad mounted.',
      {
        instanceId: instance.id,
        adId: instance.ad.id,
      },
    );
  }

  async destroy(
    instance: ExternalAdInstance,
  ): Promise<void> {
    this.destroyAd(instance.id);
  }

  async destroyAll(): Promise<void> {
    this.initialized = false;
    this.config = null;
    this.scriptPromise = null;
  }

 // Replace the beginning of mountAd with this

private async mountAd(
  container: HTMLElement,
  request: ExternalAdRequest,
  options: GoogleAdRequestOptions,
): Promise<void> {
  if (!this.isBrowser()) {
    return;
  }

  container.replaceChildren();

  const element =
    document.createElement('ins');

  element.className =
    'adsbygoogle';

  element.dataset.externalAdInstance =
    container.dataset.externalAdInstance ?? '';

  element.style.display =
    'block';

  if (request.width) {
    element.style.width =
      `${request.width}px`;
  }

  if (request.height) {
    element.style.height =
      `${request.height}px`;
  }

  element.setAttribute(
    'data-ad-client',
    this.config?.clientId ?? '',
  );

  element.setAttribute(
    'data-ad-slot',
    options.slot ?? '',
  );

  element.setAttribute(
    'data-ad-format',
    options.format ?? 'auto',
  );

  if (options.responsive !== false) {
    element.setAttribute(
      'data-full-width-responsive',
      options.fullWidthResponsive === false
        ? 'false'
        : 'true',
    );
  }

  if (options.layout) {
    element.setAttribute(
      'data-ad-layout',
      options.layout,
    );
  }

  if (options.layoutKey) {
    element.setAttribute(
      'data-ad-layout-key',
      options.layoutKey,
    );
  }

  container.appendChild(element);

  window.adsbygoogle =
    window.adsbygoogle || [];

  window.adsbygoogle.push({});

  await this.waitForRender();
}

  private destroyAd(
    instanceId: string,
  ): void {
    const element =
      document.querySelector(
        `[data-external-ad-instance="${instanceId}"]`,
      );

    element?.remove();
  }

  private loadScript(
    clientId: string,
  ): Promise<void> {
    if (!this.isBrowser()) {
      return Promise.resolve();
    }

    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    const existing =
      document.querySelector<HTMLScriptElement>(
        'script[data-external-adsense="true"]',
      );

    if (existing) {
      this.scriptPromise =
        Promise.resolve();

      return this.scriptPromise;
    }

    this.scriptPromise =
      new Promise<void>(
        (resolve, reject) => {
          const script =
            document.createElement(
              'script',
            );

          script.async = true;

          script.crossOrigin =
            'anonymous';

          script.src =
            `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
              clientId,
            )}`;

          script.dataset.externalAdsense =
            'true';

          script.onload = () => {
            resolve();
          };

          script.onerror = () => {
            this.scriptPromise = null;

            reject(
              new Error(
                'Failed to load Google AdSense script.',
              ),
            );
          };

          document.head.appendChild(
            script,
          );
        },
      );

    return this.scriptPromise;
  }

  private waitForRender(): Promise<void> {
    return new Promise(
      (resolve) => {
        window.setTimeout(
          resolve,
          0,
        );
      },
    );
  }

  private isBrowser(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }
}