import { apiRequest } from '../lib/axios';
import type { CreateInternalAdPayload, InternalAd, UpdateInternalAdPayload } from '../types/ads';

/** Client for the separate InternalAds NestJS module. */
export const internalAdsService = {
  getActiveAds: <T = InternalAd[]>() => apiRequest<T>({ method: 'GET', path: '/internal-ads' }),
  findAll: <T = InternalAd[]>() => apiRequest<T>({ method: 'GET', path: '/internal-ads/admin' }),
  findOne: <T = InternalAd>(id: string) =>
    apiRequest<T>({ method: 'GET', path: '/internal-ads/admin/:id', pathParams: { id } }),
  create: <T = InternalAd>(body: CreateInternalAdPayload) =>
    apiRequest<T>({ method: 'POST', path: '/internal-ads', body }),
  update: <T = InternalAd>(id: string, body: UpdateInternalAdPayload) =>
    apiRequest<T>({ method: 'PATCH', path: '/internal-ads/:id', pathParams: { id }, body }),
  remove: <T = { message: string }>(id: string) =>
    apiRequest<T>({ method: 'DELETE', path: '/internal-ads/:id', pathParams: { id } }),
} as const;

type InternalAdsPayload = InternalAd[] | {
  items?: InternalAd[];
  ads?: InternalAd[];
  data?: InternalAd[];
};

/** Selects active internal ads for a page/device/placement. */
export async function getPageAds(page: string, device: string, position?: string): Promise<InternalAd[]> {
  const value = await internalAdsService.getActiveAds<InternalAdsPayload>();
  const rows = Array.isArray(value) ? value : value.items ?? value.ads ?? value.data ?? [];

  return rows.filter((ad) =>
    ad.isActive !== false &&
    (ad.displays ?? []).some((display) =>
      String(display.page).toUpperCase() === page.toUpperCase() &&
      (String(display.device).toUpperCase() === 'ALL' || String(display.device).toUpperCase() === device.toUpperCase()) &&
      (!position || String(display.position).toUpperCase() === position.toUpperCase()),
    ),
  );
}
