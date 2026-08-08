import type {
  ExternalAdInstance,
  ExternalAdRequest,
  ExternalAdResult,
} from '../../types/external-ad';

import type {
  ExternalAdProviderContext,
} from '../ExternalAdProvider';

import type {
  AdsterraConfig,
  AdsterraAdRequestOptions,
} from './types';

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

function createAdId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `adsterra-${crypto.randomUUID()}`;
  }

  return `adsterra-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class AdsterraAdapter {
  private config:
    | AdsterraConfig
    | null = null;

  private initialized = false;

  private scriptPromise:
    | Promise<void>
    | null = null;

  async initialize(
    config: AdsterraConfig,
    _context?: ExternalAdProviderContext,
  ): Promise<void> {
    this.config = config;

    if (!config.publisherId) {
      throw new Error(
        'Adsterra publisherId is required.',
      );
    }

    if (!isBrowser()) {
      this.initialized = true;
      return;
    }

    if (config.scriptUrl) {
      await this.loadScript(
        config.scriptUrl,
      );
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig():
    | AdsterraConfig
    | null {
    return this.config;
  }

  buildRequestOptions(
    request: ExternalAdRequest,
  ): AdsterraAdRequestOptions {
    const metadata =
      request.metadata ?? {};

    return {
      zoneId:
        typeof metadata.zoneId === 'string'
          ? metadata.zoneId
          : this.config?.zoneId,

      format:
        typeof metadata.format === 'string'
          ? metadata.format
          : undefined,

      placement:
        request.placement,

      width:
        request.width,

      height:
        request.height,

      metadata,
    };
  }

  async load(
    request: ExternalAdRequest,
    _context?: ExternalAdProviderContext,
  ): Promise<ExternalAdResult | null> {
    if (!this.initialized) {
      throw new Error(
        'Adsterra adapter has not been initialized.',
      );
    }

    if (!isBrowser()) {
      return null;
    }

    const options =
      this.buildRequestOptions(
        request,
      );

    if (!options.zoneId) {
      return null;
    }

    const adId = createAdId();

    const ad = {
      id: adId,
      providerId: 'adsterra',
      format: request.format,
      width: request.width,
      height: request.height,
      metadata: {
        ...request.metadata,
        zoneId:
          options.zoneId,
      },
    };

    const instance:
      ExternalAdInstance = {
      id: adId,
      ad,
      providerId: 'adsterra',

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
        // Provider-created DOM is owned
        // by the external ad container.
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
    _context?: ExternalAdProviderContext,
  ): Promise<void> {
    const options =
      this.buildRequestOptions(
        request,
      );

    await this.mountAd(
      container,
      request,
      options,
    );
  }

  async destroy(
    _instance: ExternalAdInstance,
  ): Promise<void> {
    // Provider DOM is cleaned by the
    // owning ExternalAd container.
  }

  async destroyAll(): Promise<void> {
    this.initialized = false;
    this.config = null;
    this.scriptPromise = null;
  }

  private async loadScript(
    scriptUrl: string,
  ): Promise<void> {
    if (!isBrowser()) {
      return;
    }

    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise =
      new Promise<void>(
        (resolve, reject) => {
          const scripts =
            Array.from(
              document.scripts,
            );

          const existing =
            scripts.find(
              (script) =>
                script.src ===
                scriptUrl,
            );

          if (existing) {
            resolve();
            return;
          }

          const script =
            document.createElement(
              'script',
            );

          script.async = true;
          script.src =
            scriptUrl;

          script.onload = () =>
            resolve();

          script.onerror = () =>
            reject(
              new Error(
                'Failed to load Adsterra script.',
              ),
            );

          document.head.appendChild(
            script,
          );
        },
      );

    try {
      await this.scriptPromise;
    } catch (error) {
      this.scriptPromise = null;
      throw error;
    }
  }

  private async mountAd(
    container: HTMLElement,
    request: ExternalAdRequest,
    options: AdsterraAdRequestOptions,
  ): Promise<void> {
    if (!options.zoneId) {
      throw new Error(
        'Adsterra zoneId is required.',
      );
    }

    container.replaceChildren();

    const wrapper =
      document.createElement(
        'div',
      );

    wrapper.dataset.externalAdProvider =
      'adsterra';

    wrapper.dataset.externalAdZone =
      options.zoneId;

    wrapper.dataset.externalAdFormat =
      request.format;

    wrapper.style.width =
      request.width
        ? `${request.width}px`
        : '100%';

    if (request.height) {
      wrapper.style.height =
        `${request.height}px`;
    }

    container.appendChild(
      wrapper,
    );

    /*
     * Adsterra publisher-generated code
     * should be connected here through
     * config.scriptUrl / provider-specific
     * integration once the actual publisher
     * tag is available.
     *
     * Arbitrary metadata HTML/JavaScript is
     * intentionally never executed.
     */
  }
}