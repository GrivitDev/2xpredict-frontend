'use client';
import { useAdsMonitor } from './use-monitoring';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adsService } from '../services/ads.service';
import type { AdAnalyticsQuery, AdEventQuery, AdsListQuery, CreateAdPayload, ExternalAdPolicy, UpdateAdPayload, AdAudienceKey, AdContentSource } from '../types/ads';

export function useAdsListQuery(query: AdsListQuery = {}) {
  return useQuery({ queryKey: ['admin-ads', 'list', query], queryFn: () => adsService.findAll({ query }) });
}
export function useAdDetailsQuery(id: string, enabled = true) {
  return useQuery({ queryKey: ['admin-ads', 'detail', id], queryFn: () => adsService.findOne({ path: { id } }), enabled: enabled && Boolean(id) });
}
export function useAdAnalyticsQuery(query: AdAnalyticsQuery = {}) {
  return useQuery({ queryKey: ['admin-ads', 'analytics', query], queryFn: () => adsService.analytics({ query }) });
}
export function useSingleAdAnalyticsQuery(id: string, query: AdAnalyticsQuery = {}) {
  return useQuery({ queryKey: ['admin-ads', 'analytics', id, query], queryFn: () => adsService.adAnalytics({ path: { id }, query }), enabled: Boolean(id) });
}
export function useAdEventsQuery(query: AdEventQuery = {}) {
  return useQuery({ queryKey: ['admin-ads', 'events', query], queryFn: () => adsService.events({ query }) });
}
export function useAutomationOptionsQuery() {
  return useQuery({ queryKey: ['admin-ads', 'automation-options'], queryFn: () => adsService.automationOptions() });
}
export function useDiscoverAdContentQuery(kind?: AdContentSource, enabled = true) {
  return useQuery({ queryKey: ['admin-ads', 'discover', kind ?? 'ALL'], queryFn: () => adsService.discover({ query: kind ? { kind } : {} }), enabled });
}
export function useAdPreviewQuery(id: string, audience: AdAudienceKey, enabled = true) {
  return useQuery({ queryKey: ['admin-ads', 'preview', id, audience], queryFn: () => adsService.preview({ path: { id }, query: { audience } }), enabled: enabled && Boolean(id) });
}
export function useExternalAdPolicyQuery() {
  return useQuery({ queryKey: ['admin-ads', 'external-policy'], queryFn: () => adsService.externalPolicy() });
}
export function useCreateAdMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: CreateAdPayload) => adsService.create({ body }), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin-ads'] }); } });
}
export function useUpdateAdMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, body }: { id: string; body: UpdateAdPayload }) => adsService.update({ path: { id }, body }), onSuccess: async (_, variables) => { await Promise.all([client.invalidateQueries({ queryKey: ['admin-ads'] }), client.invalidateQueries({ queryKey: ['admin-ads', 'detail', variables.id] })]); } });
}
export function useDeleteAdMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => adsService.remove({ path: { id } }), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin-ads'] }); } });
}
export function useToggleAdStatusMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => adsService.toggleStatus({ path: { id } }), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin-ads'] }); } });
}
export function useUpdateExternalAdPolicyMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: Partial<ExternalAdPolicy>) => adsService.updateExternalPolicy({ body }), onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin-ads', 'external-policy'] }); } });
}

/* Legacy hook names preserved for any existing page components. */
export const useAdminAds = useAdsListQuery;
export const useAdminAd = (id: string) => useAdDetailsQuery(id);
export const useAdminAdAnalytics = useAdAnalyticsQuery;
export const useCreateAd = useCreateAdMutation;
export const useUpdateAd = useUpdateAdMutation;
export const useDeleteAd = useDeleteAdMutation;
export const useToggleAd = useToggleAdStatusMutation;


/** The controller exposes a distinct operational monitor in addition to analytics. */
export function useAdminAdsMonitorQuery() { return useAdsMonitor(); }


