import api from '@/lib/axios';

import {
  ExternalAdPolicy,
} from '@/types/external-ads';

class ExternalAdsService {
  async getPolicy(): Promise<ExternalAdPolicy> {
    const response = await api.get<ExternalAdPolicy>(
      '/ads/policy',
    );

    return response.data;
  }
}

export const externalAdsService =
  new ExternalAdsService();