'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { predictionAccessService } from '@/services/prediction-access.service';
import { predictionEngineService } from '@/services/prediction-engine.service';
import type {
  GetEventsArgs,
  GetFixtureMarketsArgs,
  GetPickCenterArgs,
  GetQueueArgs,
  GetRunsArgs,
  GetSlipArgs,
  ListMarketsArgs,
  ListSlipsArgs,
  ListAdminCuratedPredictionsArgs,
  ListAdminPickCenterArgs,
  ListAdminSlipsArgs,
} from '@/types/endpoint-args/prediction-engine';
import type {
  ListCuratedPredictionsArgs,
  ListSettledArgs,
  ListSureOddsArgs,
} from '@/types/endpoint-args/prediction-access';
import type {
  AdminCuratedPredictionQuery,
  BuildPredictionSlipPayload,
  MarketListQuery,
  PickCenterQuery,
  SlipListQuery,
  SureOddsQuery,
} from '@/types/predictions';
import type {
  PredictionQueueSyncResult,
  PredictionEngineDashboard,
  PredictionEngineRunRecord,
  PredictionEngineQueueRecord,
  PredictionEngineEventRecord,
  PredictionQueueRecoveryResult,
  PredictionQueueRunNextResult,
  RebuildCalibrationResult,
  AutomaticSlipRefreshResult,
} from '@/types/prediction-engine-monitor';
import type {
  CuratedPrediction,
  CuratedPredictionRefreshResult,
  MarketPrediction,
  PickCenterRecord,
  PredictionAccessPolicy,
  PredictionPage,
  PredictionSlip,
  PredictionSlipListItem,
  AdminCuratedPredictionResponse,
  AdminPickCenterResponse,
  AdminSlipListResponse,
} from '@/types/predictions';

export const predictionQueryKeys = {
  all: ['predictions'] as const,
  policy: () => [...predictionQueryKeys.all, 'policy'] as const,
  pickCenter: (query: PickCenterQuery) => [...predictionQueryKeys.all, 'pick-center', query] as const,
  pickCenterEvent: (eventId: string) => [...predictionQueryKeys.all, 'pick-center-event', eventId] as const,
  adminPickCenter: (query: NonNullable<ListAdminPickCenterArgs['query']>) => [...predictionQueryKeys.all, 'admin-pick-center', query] as const,
  curatedPredictions: (query: NonNullable<ListCuratedPredictionsArgs['query']>) => [...predictionQueryKeys.all, 'curated-predictions', query] as const,
  adminCuratedPredictions: (query: NonNullable<ListAdminCuratedPredictionsArgs['query']>) => [...predictionQueryKeys.all, 'admin-curated-predictions', query] as const,
  adminSlips: (query: NonNullable<ListAdminSlipsArgs['query']>) => [...predictionQueryKeys.all, 'admin-slips', query] as const,
  markets: (query: MarketListQuery) => [...predictionQueryKeys.all, 'markets', query] as const,
  eventMarkets: (eventId: string) => [...predictionQueryKeys.all, 'event-markets', eventId] as const,
  slips: (query: SlipListQuery) => [...predictionQueryKeys.all, 'slips', query] as const,
  slip: (id: string) => [...predictionQueryKeys.all, 'slip', id] as const,
  sureOdds: (query: NonNullable<ListSureOddsArgs['query']>) => [...predictionQueryKeys.all, 'sure-odds', query] as const,
  engine: () => [...predictionQueryKeys.all, 'engine'] as const,
};

export function usePredictionAccessPolicy() {
  return useQuery<PredictionAccessPolicy>({
    queryKey: predictionQueryKeys.policy(),
    queryFn: predictionAccessService.getPolicy,
    staleTime: 30_000,
  });
}

export function usePickCenter(query: PickCenterQuery = {}) {
  return useQuery<PredictionPage<PickCenterRecord>>({
    queryKey: predictionQueryKeys.pickCenter(query),
    queryFn: () => predictionEngineService.listPickCenter({ query }),
  });
}

export function useAdminPickCenter(query: NonNullable<ListAdminPickCenterArgs['query']> = {}) {
  return useQuery<AdminPickCenterResponse>({
    queryKey: predictionQueryKeys.adminPickCenter(query),
    queryFn: () => predictionEngineService.listAdminPickCenter({ query }),
  });
}

export function useCuratedPredictions(query: NonNullable<ListCuratedPredictionsArgs['query']> = {}) {
  return useQuery<PredictionPage<CuratedPrediction>>({
    queryKey: predictionQueryKeys.curatedPredictions(query),
    queryFn: () => predictionAccessService.listCuratedPredictions({ query }),
  });
}

export function useAdminCuratedPredictions(query: AdminCuratedPredictionQuery = {}) {
  const args: NonNullable<ListAdminCuratedPredictionsArgs['query']> = query;
  return useQuery<AdminCuratedPredictionResponse>({
    queryKey: predictionQueryKeys.adminCuratedPredictions(args),
    queryFn: () => predictionEngineService.listAdminCuratedPredictions({ query: args }),
  });
}

export function useAdminPredictionSlips(query: NonNullable<ListAdminSlipsArgs['query']> = {}) {
  return useQuery<AdminSlipListResponse>({
    queryKey: predictionQueryKeys.adminSlips(query),
    queryFn: () => predictionEngineService.listAdminSlips({ query }),
  });
}

export function useRefreshCuratedPredictions() {
  const client = useQueryClient();
  return useMutation<CuratedPredictionRefreshResult, Error, void>({
    mutationFn: predictionEngineService.refreshCuratedPredictions,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: predictionQueryKeys.all });
    },
  });
}

export function usePickCenterEvent(eventId: string) {
  const args: GetPickCenterArgs = { path: { eventId } };
  return useQuery<PickCenterRecord>({
    queryKey: predictionQueryKeys.pickCenterEvent(eventId),
    queryFn: () => predictionEngineService.getPickCenter(args),
    enabled: Boolean(eventId),
  });
}

export function useMarketPredictions(query: MarketListQuery = {}) {
  const args: ListMarketsArgs = { query };
  return useQuery<PredictionPage<MarketPrediction>>({
    queryKey: predictionQueryKeys.markets(query),
    queryFn: () => predictionEngineService.listMarkets(args),
  });
}

export function useFixtureMarkets(eventId: string) {
  const args: GetFixtureMarketsArgs = { path: { eventId } };
  return useQuery<MarketPrediction[]>({
    queryKey: predictionQueryKeys.eventMarkets(eventId),
    queryFn: () => predictionEngineService.getFixtureMarkets(args),
    enabled: Boolean(eventId),
  });
}

export function useSettledMarkets(query: NonNullable<ListSettledArgs['query']> = {}) {
  return useQuery<PredictionPage<MarketPrediction>>({
    queryKey: [...predictionQueryKeys.all, 'settled', query],
    queryFn: () => predictionAccessService.listSettled({ query }),
  });
}

export function usePredictionSlips(query: SlipListQuery = {}) {
  const args: ListSlipsArgs = { query };
  return useQuery<PredictionPage<PredictionSlipListItem>>({
    queryKey: predictionQueryKeys.slips(query),
    queryFn: () => predictionEngineService.listSlips(args),
  });
}

export function usePredictionSlip(id: string) {
  const args: GetSlipArgs = { path: { slipId: id } };
  return useQuery<PredictionSlip>({
    queryKey: predictionQueryKeys.slip(id),
    queryFn: () => predictionEngineService.getPublishedSlip(args),
    enabled: Boolean(id),
  });
}

export function useSureOdds(query: SureOddsQuery = {}) {
  const args: NonNullable<ListSureOddsArgs['query']> = query;
  return useQuery<PredictionPage<PredictionSlipListItem>>({
    queryKey: predictionQueryKeys.sureOdds(args),
    queryFn: () => predictionAccessService.listSureOdds({ query: args }),
  });
}

export function usePredictionEngineMonitor() {
  return useQuery<PredictionEngineDashboard>({
    queryKey: [...predictionQueryKeys.engine(), 'dashboard'],
    queryFn: predictionEngineService.getDashboard,
    refetchInterval: 30_000,
  });
}

export function usePredictionEngineRuns(limit = 50) {
  const args: GetRunsArgs = { query: { limit } };
  return useQuery<PredictionEngineRunRecord[]>({
    queryKey: [...predictionQueryKeys.engine(), 'runs', args],
    queryFn: () => predictionEngineService.getRuns(args),
  });
}

export function usePredictionEngineQueue(query: NonNullable<GetQueueArgs['query']> = {}) {
  const args: GetQueueArgs = { query };
  return useQuery<PredictionEngineQueueRecord[]>({
    queryKey: [...predictionQueryKeys.engine(), 'queue', args],
    queryFn: () => predictionEngineService.getQueue(args),
    refetchInterval: 15_000,
  });
}

export function usePredictionEngineEvents(query: NonNullable<GetEventsArgs['query']> = {}) {
  const args: GetEventsArgs = { query };
  return useQuery<PredictionEngineEventRecord[]>({
    queryKey: [...predictionQueryKeys.engine(), 'events', args],
    queryFn: () => predictionEngineService.getEvents(args),
  });
}

export function usePredictionEngineActions() {
  const client = useQueryClient();
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: predictionQueryKeys.all });
  };

  return {
    syncQueue: useMutation<PredictionQueueSyncResult, Error, boolean>({
      mutationFn: (force) => predictionEngineService.syncQueue({ body: { force } }),
      onSuccess: refresh,
    }),
    recoverStaleQueue: useMutation<PredictionQueueRecoveryResult, Error, void>({
      mutationFn: predictionEngineService.recoverStaleQueue,
      onSuccess: refresh,
    }),
    runNextQueueItem: useMutation<PredictionQueueRunNextResult, Error, void>({
      mutationFn: predictionEngineService.runNextQueueItem,
      onSuccess: refresh,
    }),
    generateFixture: useMutation<unknown, Error, string>({
      mutationFn: (eventId) => predictionEngineService.generateFixture({ path: { eventId } }),
      onSuccess: refresh,
    }),
    buildSlip: useMutation<PredictionSlip, Error, BuildPredictionSlipPayload>({
      mutationFn: (payload) => predictionEngineService.buildSlip({ body: payload }),
      onSuccess: refresh,
    }),
    publishSlip: useMutation<PredictionSlip, Error, string>({
      mutationFn: (slipId) => predictionEngineService.publishSlip({ path: { slipId } }),
      onSuccess: refresh,
    }),
    refreshAutomaticSlips: useMutation<AutomaticSlipRefreshResult, Error, void>({
      mutationFn: predictionEngineService.refreshSlips,
      onSuccess: refresh,
    }),
    rebuildCalibration: useMutation<RebuildCalibrationResult, Error, string | undefined>({
      mutationFn: (marketKey) => predictionEngineService.rebuildCalibration({ body: { marketKey } }),
      onSuccess: refresh,
    }),
  };
}

