import {
  externalAdRegistry,
} from './ExternalAdRegistry';

import {
  googleProvider,
} from './google/GoogleProvider';

import {
  monetagProvider,
} from './monetag/MonetagProvider';

import {
  adsterraProvider,
} from './adsterra/AdsterraProvider';

let providersRegistered =
  false;

export function registerExternalAdProviders(): void {
  if (providersRegistered) {
    return;
  }

  if (!externalAdRegistry.has('google')) {
    externalAdRegistry.register(
      googleProvider,
    );
  }

  if (!externalAdRegistry.has('monetag')) {
    externalAdRegistry.register(
      monetagProvider,
    );
  }

  if (!externalAdRegistry.has('adsterra')) {
    externalAdRegistry.register(
      adsterraProvider,
    );
  }

  providersRegistered = true;
}

export {
  externalAdRegistry,
  googleProvider,
  monetagProvider,
  adsterraProvider,
};