import {
  externalAdRegistry,
} from './ExternalAdRegistry';

import {
  registerExternalAdProviders,
} from './index';

import {
  createExternalAdsProviderConfiguration,
} from './config';

let initializationPromise:
  | Promise<void>
  | null = null;

export function initializeExternalAdProviders(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise =
    initialize();

  return initializationPromise;
}

async function initialize(): Promise<void> {
  registerExternalAdProviders();

  if (
    externalAdRegistry.isInitialized()
  ) {
    return;
  }

  const configuration =
    createExternalAdsProviderConfiguration();

  const providers =
    externalAdRegistry.getAll();

  await Promise.all(
    providers.map(
      async (provider) => {
        const providerConfig =
          configuration[
            provider.id as keyof typeof configuration
          ];

        if (!providerConfig) {
          return;
        }

        if (!provider.initialize) {
          return;
        }

        try {
          await provider.initialize(
            providerConfig,
            {
              logger: {
                debug: console.debug,
                info: console.info,
                warn: console.warn,
                error: console.error,
              },
            },
          );
        } catch (error) {
          console.error(
            `[ExternalAds] Failed to initialize provider "${provider.id}".`,
            error,
          );
        }
      },
    ),
  );

  externalAdRegistry.markInitialized();
}