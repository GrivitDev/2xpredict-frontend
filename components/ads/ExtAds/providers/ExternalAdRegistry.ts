import type {
  ExternalAdRequest,
} from '../types/external-ad';

import type {
  ExternalAdFormat,
} from '../types/external-ad-format';

import type {
  ExternalAdProvider,
} from './ExternalAdProvider';

class ExternalAdRegistry {
  private readonly providers =
    new Map<string, ExternalAdProvider>();

  private initialized = false;

  register(
    provider: ExternalAdProvider,
  ): void {
    if (!provider?.id) {
      throw new Error(
        'External ad provider must have a valid id.',
      );
    }

    if (this.providers.has(provider.id)) {
      throw new Error(
        `External ad provider "${provider.id}" is already registered.`,
      );
    }

    this.providers.set(
      provider.id,
      provider,
    );
  }

  registerOrReplace(
    provider: ExternalAdProvider,
  ): void {
    if (!provider?.id) {
      throw new Error(
        'External ad provider must have a valid id.',
      );
    }

    this.providers.set(
      provider.id,
      provider,
    );
  }

  unregister(
    providerId: string,
  ): boolean {
    return this.providers.delete(
      providerId,
    );
  }

  get(
    providerId: string,
  ): ExternalAdProvider | undefined {
    return this.providers.get(
      providerId,
    );
  }

  require(
    providerId: string,
  ): ExternalAdProvider {
    const provider =
      this.get(providerId);

    if (!provider) {
      throw new Error(
        `External ad provider "${providerId}" is not registered.`,
      );
    }

    return provider;
  }

  has(
    providerId: string,
  ): boolean {
    return this.providers.has(
      providerId,
    );
  }

  getAll(): ExternalAdProvider[] {
    return Array.from(
      this.providers.values(),
    );
  }

  getForFormat(
    format: ExternalAdFormat,
  ): ExternalAdProvider[] {
    return this.getAll()
      .filter((provider) =>
        provider.supportedFormats.includes(
          format,
        ),
      )
      .sort(
        (a, b) =>
          (b.priority ?? 0) -
          (a.priority ?? 0),
      );
  }

  async getForRequest(
    request: ExternalAdRequest,
  ): Promise<ExternalAdProvider[]> {
    const candidates =
      this.getForFormat(
        request.format,
      );

    const available: ExternalAdProvider[] =
      [];

    for (const provider of candidates) {
      try {
        const result =
          await provider.isAvailable(
            request,
          );

        if (result) {
          available.push(provider);
        }
      } catch {
        continue;
      }
    }

    return available;
  }

  getBestForFormat(
    format: ExternalAdFormat,
  ): ExternalAdProvider | undefined {
    return this.getForFormat(
      format,
    )[0];
  }

  async getBestForRequest(
    request: ExternalAdRequest,
  ): Promise<ExternalAdProvider | undefined> {
    const providers =
      await this.getForRequest(
        request,
      );

    return providers[0];
  }

  clear(): void {
    this.providers.clear();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  markInitialized(): void {
    this.initialized = true;
  }
}

export const externalAdRegistry =
  new ExternalAdRegistry();

export {
  ExternalAdRegistry,
};