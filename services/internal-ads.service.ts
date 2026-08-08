import api from '@/lib/axios';

import { AdPage } from '@/constants/ads/ad-page';
import { AdDevice } from '@/constants/ads/ad-device';

export async function getPageAds(
  page: AdPage,
  device: AdDevice,
) {
  const response = await api.get('/ads', {
    params: {
      page,
      device,
    },
  });

  return response.data;
}