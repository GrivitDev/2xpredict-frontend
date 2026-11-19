'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adsService } from '../services/ads.service';
import type { GetAdsArgs, RecordClickArgs, RecordImpressionArgs, TrackEventArgs } from '../types/endpoint-args/ads';
export function useGetPolicyQuery() { return useQuery({ queryKey: ['ads', 'policy'], queryFn: () => adsService.getPolicy() }); }
export function useGetAdsQuery(args: GetAdsArgs, enabled = true) { return useQuery({ queryKey: ['ads', 'delivery', args.query], queryFn: () => adsService.getAds(args), enabled }); }
export function useTrackAdEventMutation() { return useMutation({ mutationFn: (args: TrackEventArgs) => adsService.trackEvent(args) }); }
export function useRecordImpressionMutation() { return useMutation({ mutationFn: (args: RecordImpressionArgs) => adsService.recordImpression(args) }); }
export function useRecordClickMutation() { return useMutation({ mutationFn: (args: RecordClickArgs) => adsService.recordClick(args) }); }

