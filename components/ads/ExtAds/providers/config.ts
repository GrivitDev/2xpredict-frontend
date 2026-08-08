import type {
  ExternalAdProviderConfig,
} from './ExternalAdProvider';

export interface ExternalAdsProviderConfiguration {
  google?: ExternalAdProviderConfig;

  monetag?: ExternalAdProviderConfig;

  adsterra?: ExternalAdProviderConfig;
}

export function createExternalAdsProviderConfiguration(): ExternalAdsProviderConfiguration {
  return {
    google: {
      enabled: true,
      priority: 100,
      options: {
        clientId:
          process.env
            .NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID ??
          '',
      },
    },

    monetag: {
      enabled: true,
      priority: 80,
      options: {
        publisherId:
          process.env
            .NEXT_PUBLIC_MONETAG_PUBLISHER_ID ??
          '',

        zoneId:
          process.env
            .NEXT_PUBLIC_MONETAG_ZONE_ID ??
          '',
      },
    },

    adsterra: {
      enabled: true,
      priority: 60,
      options: {
        publisherId:
          process.env
            .NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID ??
          '',

        zoneId:
          process.env
            .NEXT_PUBLIC_ADSTERRA_ZONE_ID ??
          '',
      },
    },
  };
}