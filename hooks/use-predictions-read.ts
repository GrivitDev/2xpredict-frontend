'use client';

/* React Query hooks for the public predictions read endpoints. */
import { useQuery } from '@tanstack/react-query';
import type { ApiQueryHookOptions } from '../types/common';
import { predictionsReadService } from '../services/predictions-read.service';
import type {
  MarketPrediction,
  PickCenterRecord,
  PredictionPage,
  PredictionSlip,
} from '../types/predictions';
import type {
  GetFixtureMarketsArgs,
  GetPickCenterArgs,
  GetSlipArgs,
  ListMarketsArgs,
  ListPickCenterArgs,
  ListSlipsArgs,
} from '../types/endpoint-args/predictions-read';

export function useListMarketsQuery<TData = PredictionPage<MarketPrediction>>(
  args?: ListMarketsArgs,
  options?: ApiQueryHookOptions<PredictionPage<MarketPrediction>, TData>,
) {
  return useQuery<PredictionPage<MarketPrediction>, Error, TData>({
    queryKey: ['predictions-read', 'listMarkets', args ?? null],
    queryFn: () => predictionsReadService.listMarkets(args),
    ...options,
  });
}

export function useGetFixtureMarketsQuery<TData = MarketPrediction[]>(
  args: GetFixtureMarketsArgs,
  options?: ApiQueryHookOptions<MarketPrediction[], TData>,
) {
  return useQuery<MarketPrediction[], Error, TData>({
    queryKey: ['predictions-read', 'getFixtureMarkets', args],
    queryFn: () => predictionsReadService.getFixtureMarkets(args),
    ...options,
  });
}

export function useListPickCenterQuery<TData = PredictionPage<PickCenterRecord>>(
  args?: ListPickCenterArgs,
  options?: ApiQueryHookOptions<PredictionPage<PickCenterRecord>, TData>,
) {
  return useQuery<PredictionPage<PickCenterRecord>, Error, TData>({
    queryKey: ['predictions-read', 'listPickCenter', args ?? null],
    queryFn: () => predictionsReadService.listPickCenter(args),
    ...options,
  });
}

export function useGetPickCenterQuery<TData = PickCenterRecord>(
  args: GetPickCenterArgs,
  options?: ApiQueryHookOptions<PickCenterRecord, TData>,
) {
  return useQuery<PickCenterRecord, Error, TData>({
    queryKey: ['predictions-read', 'getPickCenter', args],
    queryFn: () => predictionsReadService.getPickCenter(args),
    ...options,
  });
}

export function useListSlipsQuery<TData = PredictionPage<PredictionSlip>>(
  args?: ListSlipsArgs,
  options?: ApiQueryHookOptions<PredictionPage<PredictionSlip>, TData>,
) {
  return useQuery<PredictionPage<PredictionSlip>, Error, TData>({
    queryKey: ['predictions-read', 'listSlips', args ?? null],
    queryFn: () => predictionsReadService.listSlips(args),
    ...options,
  });
}

export function useGetSlipQuery<TData = PredictionSlip>(
  args: GetSlipArgs,
  options?: ApiQueryHookOptions<PredictionSlip, TData>,
) {
  return useQuery<PredictionSlip, Error, TData>({
    queryKey: ['predictions-read', 'getSlip', args],
    queryFn: () => predictionsReadService.getPublishedSlip(args),
    ...options,
  });
}
