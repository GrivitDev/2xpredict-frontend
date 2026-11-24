'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { predictionEngineService } from '../services/prediction-engine.service';
import type {
  BuildSlipArgs, GenerateFixtureArgs, GetEventMarketsArgs, GetEventsArgs,
  GetMarketCoverageArgs, GetMarketCoverageInventoryArgs,
  GetPickCenterArgs, GetQueueArgs, GetRunsArgs, GetSlipArgs,
  GetFixtureMarketsArgs, ListAdminCuratedPredictionsArgs, ListAdminPickCenterArgs,
  ListAdminSlipsArgs, ListMarketsArgs, ListPickCenterArgs, ListSlipsArgs,
  PublishSlipArgs, RebuildCalibrationArgs, SetCuratedPredictionPublicationArgs,
  SyncQueueArgs, UpdateSlipLegsArgs, UpdateSportyBetArgs,
} from '../types/endpoint-args/prediction-engine';
import type {
  AdminCuratedPredictionResponse, AdminPickCenterResponse, AdminSlipListResponse,
  AdminPredictionCollection, AdminPredictionPage, CuratedPrediction,
  CuratedPredictionRefreshResult, MarketPrediction, PickCenterRecord,
  PredictionPage, PredictionSlip, PredictionSlipListItem,
} from '../types/predictions';
import type {
  AutomaticSlipRefreshResult,
  MarketCalibrationRecord,
  MarketCatalogDefinition,
  PredictionEngineDashboard,
  PredictionEngineEventRecord,
  PredictionEngineQueueRecord,
  PredictionEngineRunRecord,
  PredictionQueueRecoveryResult,
  PredictionQueueRunNextResult,
  PredictionQueueSyncResult,
  RebuildCalibrationResult,
} from '../types/prediction-engine-monitor';

export const predictionEngineQueryKeys = {
  all: ['predictions'] as const,
  catalog: () => ['predictions', 'engine', 'catalog'] as const,
  dashboard: () => ['predictions', 'engine', 'dashboard'] as const,
  runs: (args?: GetRunsArgs) => ['predictions', 'engine', 'runs', args ?? null] as const,
  queue: (args?: GetQueueArgs) => ['predictions', 'engine', 'queue', args ?? null] as const,
  events: (args?: GetEventsArgs) => ['predictions', 'engine', 'events', args ?? null] as const,
  eventMarkets: (id: string) => ['predictions', 'engine', 'event-markets', id] as const,
  marketCoverage: (eventId: string) => ['predictions', 'engine', 'market-coverage', eventId] as const,
  marketCoverageInventory: (query?: GetMarketCoverageInventoryArgs['query']) => ['predictions', 'engine', 'market-coverage-inventory', query ?? null] as const,
  markets: (args?: ListMarketsArgs) => ['predictions', 'markets', args ?? null] as const,
  fixtureMarkets: (id: string) => ['predictions', 'fixture-markets', id] as const,
  pickCenter: (args?: ListPickCenterArgs) => ['predictions', 'pick-center', args ?? null] as const,
  pickCenterItem: (id: string) => ['predictions', 'pick-center-item', id] as const,
  slips: (args?: ListSlipsArgs) => ['predictions', 'slips', args ?? null] as const,
  slip: (id: string) => ['predictions', 'slip', id] as const,
  adminSlips: (args?: ListAdminSlipsArgs) => ['predictions', 'admin', 'slips', args ?? null] as const,
  adminSlipsCollection: (args: ListAdminSlipsCollectionHookArgs) => ['predictions', 'admin', 'slips', 'collection', args] as const,
  adminPickCenter: (args?: ListAdminPickCenterArgs) => ['predictions', 'admin', 'pick-center', args ?? null] as const,
  adminCurated: (args?: ListAdminCuratedPredictionsArgs) => ['predictions', 'admin', 'curated', args ?? null] as const,
  adminPickCenterCollection: (args: ListAdminPickCenterCollectionHookArgs) => ['predictions', 'admin', 'pick-center', 'collection', args] as const,
  adminCuratedCollection: (args: ListAdminCuratedPredictionsCollectionHookArgs) => ['predictions', 'admin', 'curated', 'collection', args] as const,
  calibration: () => ['predictions', 'engine', 'calibration'] as const,
};

// Admin collection hooks retain the existing complete-history statistics behavior.
// The query is bounded by a defensive page ceiling and fetches known pages in small batches.
const ADMIN_COLLECTION_PAGE_SIZE = 100;
const ADMIN_COLLECTION_MAX_PAGES = 10_000;
const ADMIN_COLLECTION_BATCH_SIZE = 5;

type AdminPickCenterCollectionQuery = Omit<NonNullable<ListAdminPickCenterArgs['query']>, 'page' | 'pageSize'>;
type AdminCuratedCollectionQuery = Omit<NonNullable<ListAdminCuratedPredictionsArgs['query']>, 'page' | 'pageSize'>;

export interface ListAdminPickCenterCollectionHookArgs {
  query?: AdminPickCenterCollectionQuery;
  pageSize?: number;
  maxPages?: number;
}

export interface ListAdminCuratedPredictionsCollectionHookArgs {
  query?: AdminCuratedCollectionQuery;
  pageSize?: number;
  maxPages?: number;
}

export interface ListAdminSlipsCollectionHookArgs {
  query?: Omit<NonNullable<ListAdminSlipsArgs['query']>, 'page' | 'pageSize'>;
  pageSize?: number;
  maxPages?: number;
}


async function collectAdminPredictionPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<AdminPredictionPage<T>>,
  requestedPageSize = ADMIN_COLLECTION_PAGE_SIZE,
  requestedMaxPages = ADMIN_COLLECTION_MAX_PAGES,
): Promise<AdminPredictionCollection<T>> {
  const pageSize = Math.min(500, Math.max(1, Math.floor(requestedPageSize)));
  const maxPages = Math.max(1, Math.floor(requestedMaxPages));
  const firstPage = await fetchPage(1, pageSize);
  const items = [...(firstPage.items ?? [])];
  const reportedPages = firstPage.pagination?.pages;
  let fetchedPages = 1;
  let truncated = false;

  if (typeof reportedPages === 'number' && Number.isFinite(reportedPages)) {
    const totalPages = Math.max(1, Math.floor(reportedPages));
    const pagesToFetch = Math.min(totalPages, maxPages);

    for (let start = 2; start <= pagesToFetch; start += ADMIN_COLLECTION_BATCH_SIZE) {
      const pageNumbers = Array.from(
        { length: Math.min(ADMIN_COLLECTION_BATCH_SIZE, pagesToFetch - start + 1) },
        (_, index) => start + index,
      );
      const nextPages = await Promise.all(pageNumbers.map((page) => fetchPage(page, pageSize)));
      for (const page of nextPages) items.push(...(page.items ?? []));
      fetchedPages = pageNumbers[pageNumbers.length - 1] ?? fetchedPages;
    }

    truncated = totalPages > maxPages;
  } else {
    let page = 2;
    let previousLength = firstPage.items?.length ?? 0;
    while (previousLength === pageSize && page <= maxPages) {
      const next = await fetchPage(page, pageSize);
      const nextItems = next.items ?? [];
      items.push(...nextItems);
      previousLength = nextItems.length;
      fetchedPages = page;
      page += 1;
    }
    truncated = previousLength === pageSize && fetchedPages >= maxPages;
  }

  const total = firstPage.pagination?.total ?? items.length;
  const pages = typeof reportedPages === 'number' && Number.isFinite(reportedPages)
    ? Math.max(1, Math.floor(reportedPages))
    : fetchedPages;

  return {
    ...firstPage,
    items,
    pagination: {
      page: firstPage.pagination?.page ?? 1,
      pageSize: firstPage.pagination?.pageSize ?? pageSize,
      total,
      pages,
    },
    total,
    pages,
    truncated,
  };
}

export function useListAdminPickCenterCollectionQuery(
  args: ListAdminPickCenterCollectionHookArgs = {},
  options?: ApiQueryHookOptions<AdminPredictionCollection<PickCenterRecord>>,
) {
  const pageSize = args.pageSize ?? ADMIN_COLLECTION_PAGE_SIZE;
  const maxPages = args.maxPages ?? ADMIN_COLLECTION_MAX_PAGES;
  return useQuery<AdminPredictionCollection<PickCenterRecord>>({
    queryKey: predictionEngineQueryKeys.adminPickCenterCollection({ ...args, pageSize, maxPages }),
    queryFn: () => collectAdminPredictionPages(
      (page, size) => predictionEngineService.listAdminPickCenter({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    staleTime: 60_000,
    ...options,
  });
}

export function useListAdminSlipsCollectionQuery(
  args: ListAdminSlipsCollectionHookArgs = {},
  options?: ApiQueryHookOptions<AdminPredictionCollection<PredictionSlip>>,
) {
  const pageSize = args.pageSize ?? ADMIN_COLLECTION_PAGE_SIZE;
  const maxPages = args.maxPages ?? ADMIN_COLLECTION_MAX_PAGES;
  return useQuery<AdminPredictionCollection<PredictionSlip>>({
    queryKey: predictionEngineQueryKeys.adminSlipsCollection({ ...args, pageSize, maxPages }),
    queryFn: () => collectAdminPredictionPages(
      (page, size) => predictionEngineService.listAdminSlips({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    staleTime: 60_000,
    ...options,
  });
}

export function useListAdminCuratedPredictionsCollectionQuery(
  args: ListAdminCuratedPredictionsCollectionHookArgs = {},
  options?: ApiQueryHookOptions<AdminPredictionCollection<CuratedPrediction>>,
) {
  const pageSize = args.pageSize ?? ADMIN_COLLECTION_PAGE_SIZE;
  const maxPages = args.maxPages ?? ADMIN_COLLECTION_MAX_PAGES;
  return useQuery<AdminPredictionCollection<CuratedPrediction>>({
    queryKey: predictionEngineQueryKeys.adminCuratedCollection({ ...args, pageSize, maxPages }),
    queryFn: () => collectAdminPredictionPages(
      (page, size) => predictionEngineService.listAdminCuratedPredictions({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    staleTime: 60_000,
    ...options,
  });
}

// Prediction read endpoints owned by the Prediction Engine module.
export function useListMarketsQuery(args?: ListMarketsArgs, options?: ApiQueryHookOptions<PredictionPage<MarketPrediction>>) {
  return useQuery({ queryKey: predictionEngineQueryKeys.markets(args), queryFn: () => predictionEngineService.listMarkets(args), ...options });
}
export function useGetFixtureMarketsQuery(args: GetFixtureMarketsArgs, options?: ApiQueryHookOptions<MarketPrediction[]>) {
  return useQuery({ queryKey: predictionEngineQueryKeys.fixtureMarkets(args.path.eventId), queryFn: () => predictionEngineService.getFixtureMarkets(args), enabled: Boolean(args.path.eventId) && options?.enabled !== false, ...options });
}
export function useListPickCenterQuery(args?: ListPickCenterArgs, options?: ApiQueryHookOptions<PredictionPage<PickCenterRecord>>) {
  return useQuery({ queryKey: predictionEngineQueryKeys.pickCenter(args), queryFn: () => predictionEngineService.listPickCenter(args), ...options });
}
export function useGetPickCenterQuery(args: GetPickCenterArgs, options?: ApiQueryHookOptions<PickCenterRecord>) {
  return useQuery({ queryKey: predictionEngineQueryKeys.pickCenterItem(args.path.eventId), queryFn: () => predictionEngineService.getPickCenter(args), enabled: Boolean(args.path.eventId) && options?.enabled !== false, ...options });
}
export function useListSlipsQuery(args?: ListSlipsArgs, options?: ApiQueryHookOptions<PredictionPage<PredictionSlipListItem>>) {
  return useQuery<PredictionPage<PredictionSlipListItem>>({ queryKey: predictionEngineQueryKeys.slips(args), queryFn: () => predictionEngineService.listSlips(args), ...options });
}
export function useGetPublishedSlipQuery(args: GetSlipArgs, options?: ApiQueryHookOptions<PredictionSlip>) {
  return useQuery({ queryKey: predictionEngineQueryKeys.slip(args.path.slipId), queryFn: () => predictionEngineService.getPublishedSlip(args), enabled: Boolean(args.path.slipId) && options?.enabled !== false, ...options });
}

/** Admin detail endpoint (/predictions-engine/slips/:slipId). */
export function useGetSlipQuery(args: GetSlipArgs, options?: ApiQueryHookOptions<PredictionSlip>) {
  return useQuery<PredictionSlip>({ queryKey: ['predictions', 'engine', 'slip', args.path.slipId], queryFn: () => predictionEngineService.getEngineSlip(args), enabled: Boolean(args.path.slipId) && options?.enabled !== false, ...options });
}

// Engine monitoring reads.
export function useGetCatalogQuery(options?: ApiQueryHookOptions<MarketCatalogDefinition[]>) {
  return useQuery<MarketCatalogDefinition[]>({ queryKey: predictionEngineQueryKeys.catalog(), queryFn: () => predictionEngineService.getCatalog(), ...options });
}
export function useGetDashboardQuery(options?: ApiQueryHookOptions<PredictionEngineDashboard>) {
  return useQuery<PredictionEngineDashboard>({ queryKey: predictionEngineQueryKeys.dashboard(), queryFn: () => predictionEngineService.getDashboard(), staleTime: 10_000, refetchInterval: 15_000, ...options });
}
export function useGetRunsQuery(args?: GetRunsArgs, options?: ApiQueryHookOptions<PredictionEngineRunRecord[]>) {
  return useQuery<PredictionEngineRunRecord[]>({ queryKey: predictionEngineQueryKeys.runs(args), queryFn: () => predictionEngineService.getRuns(args), staleTime: 10_000, refetchInterval: 30_000, ...options });
}
export function useGetQueueQuery(args?: GetQueueArgs, options?: ApiQueryHookOptions<PredictionEngineQueueRecord[]>) {
  return useQuery<PredictionEngineQueueRecord[]>({ queryKey: predictionEngineQueryKeys.queue(args), queryFn: () => predictionEngineService.getQueue(args), staleTime: 5_000, refetchInterval: 10_000, ...options });
}
export function useGetEventsQuery(args?: GetEventsArgs, options?: ApiQueryHookOptions<PredictionEngineEventRecord[]>) {
  return useQuery<PredictionEngineEventRecord[]>({ queryKey: predictionEngineQueryKeys.events(args), queryFn: () => predictionEngineService.getEvents(args), staleTime: 10_000, refetchInterval: 30_000, ...options });
}
export function useGetEventMarketsMonitorQuery(args: GetEventMarketsArgs, options?: ApiQueryHookOptions<MarketPrediction[]>) {
  return useQuery<MarketPrediction[]>({ queryKey: predictionEngineQueryKeys.eventMarkets(args.path.eventId), queryFn: () => predictionEngineService.getEventMarkets(args), enabled: Boolean(args.path.eventId) && options?.enabled !== false, staleTime: 10_000, ...options });
}
export function useGetMarketCoverageAuditQuery(args: GetMarketCoverageArgs, options?: ApiQueryHookOptions<Record<string, unknown>>) {
  const eventId = args.path.eventId;
  return useQuery({
    queryKey: predictionEngineQueryKeys.marketCoverage(eventId),
    queryFn: () => predictionEngineService.getMarketCoverage({ path: { eventId } }),
    enabled: Boolean(eventId) && options?.enabled !== false,
    ...options,
  });
}
export function useGetMarketCoverageInventoryQuery(args?: GetMarketCoverageInventoryArgs, options?: ApiQueryHookOptions<Record<string, unknown>>) {
  return useQuery({
    queryKey: predictionEngineQueryKeys.marketCoverageInventory(args?.query),
    queryFn: () => predictionEngineService.getMarketCoverageInventory(args),
    ...options,
  });
}
export const useGetEventMarketsQuery = useGetEventMarketsMonitorQuery;
export function useListCalibrationQuery(options?: ApiQueryHookOptions<MarketCalibrationRecord[]>) {
  return useQuery<MarketCalibrationRecord[]>({ queryKey: predictionEngineQueryKeys.calibration(), queryFn: () => predictionEngineService.listCalibration(), ...options });
}
export function useListAdminSlipsQuery(args?: ListAdminSlipsArgs, options?: ApiQueryHookOptions<AdminSlipListResponse>) {
  return useQuery<AdminSlipListResponse>({ queryKey: predictionEngineQueryKeys.adminSlips(args), queryFn: () => predictionEngineService.listAdminSlips(args), ...options });
}
export function useListAdminPickCenterQuery(args?: ListAdminPickCenterArgs, options?: ApiQueryHookOptions<AdminPickCenterResponse>) {
  return useQuery<AdminPickCenterResponse>({ queryKey: predictionEngineQueryKeys.adminPickCenter(args), queryFn: () => predictionEngineService.listAdminPickCenter(args), ...options });
}
export function useListAdminCuratedPredictionsQuery(args?: ListAdminCuratedPredictionsArgs, options?: ApiQueryHookOptions<AdminCuratedPredictionResponse>) {
  return useQuery<AdminCuratedPredictionResponse>({ queryKey: predictionEngineQueryKeys.adminCurated(args), queryFn: () => predictionEngineService.listAdminCuratedPredictions(args), ...options });
}

function useInvalidatePredictionEngine() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: predictionEngineQueryKeys.all });
}
export function useSyncQueueMutation(options?: ApiMutationHookOptions<PredictionQueueSyncResult, SyncQueueArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionQueueSyncResult, Error, SyncQueueArgs>({ mutationFn: (args) => predictionEngineService.syncQueue(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useRecoverStaleQueueMutation(options?: ApiMutationHookOptions<PredictionQueueRecoveryResult, void>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionQueueRecoveryResult, Error, void>({ mutationFn: () => predictionEngineService.recoverStaleQueue(), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useRunNextQueueItemMutation(options?: ApiMutationHookOptions<PredictionQueueRunNextResult, void>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionQueueRunNextResult, Error, void>({ mutationFn: () => predictionEngineService.runNextQueueItem(), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useGenerateFixtureMutation(options?: ApiMutationHookOptions<unknown, GenerateFixtureArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<unknown, Error, GenerateFixtureArgs>({ mutationFn: (args) => predictionEngineService.generateFixture(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useBuildSlipMutation(options?: ApiMutationHookOptions<PredictionSlip, BuildSlipArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionSlip, Error, BuildSlipArgs>({ mutationFn: (args) => predictionEngineService.buildSlip(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function usePublishSlipMutation(options?: ApiMutationHookOptions<PredictionSlip, PublishSlipArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionSlip, Error, PublishSlipArgs>({ mutationFn: (args) => predictionEngineService.publishSlip(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useRefreshSlipsMutation(options?: ApiMutationHookOptions<AutomaticSlipRefreshResult, void>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<AutomaticSlipRefreshResult, Error, void>({ mutationFn: () => predictionEngineService.refreshSlips(), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useRebuildCalibrationMutation(options?: ApiMutationHookOptions<RebuildCalibrationResult, RebuildCalibrationArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<RebuildCalibrationResult, Error, RebuildCalibrationArgs>({ mutationFn: (args) => predictionEngineService.rebuildCalibration(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function usePublishCuratedPredictionMutation(options?: ApiMutationHookOptions<CuratedPrediction, SetCuratedPredictionPublicationArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<CuratedPrediction, Error, SetCuratedPredictionPublicationArgs>({ mutationFn: (args) => predictionEngineService.publishCuratedPrediction(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useUnpublishCuratedPredictionMutation(options?: ApiMutationHookOptions<CuratedPrediction, SetCuratedPredictionPublicationArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<CuratedPrediction, Error, SetCuratedPredictionPublicationArgs>({ mutationFn: (args) => predictionEngineService.unpublishCuratedPrediction(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useUpdateSlipLegsMutation(options?: ApiMutationHookOptions<PredictionSlip, UpdateSlipLegsArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionSlip, Error, UpdateSlipLegsArgs>({ mutationFn: (args) => predictionEngineService.updateSlipLegs(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useUpdateSportyBetMutation(options?: ApiMutationHookOptions<PredictionSlip, UpdateSportyBetArgs>) {
  const invalidate = useInvalidatePredictionEngine();
  return useMutation<PredictionSlip, Error, UpdateSportyBetArgs>({ mutationFn: (args) => predictionEngineService.updateSportyBet(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await invalidate(); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useRefreshCuratedPredictionsMutation(options?: ApiMutationHookOptions<CuratedPredictionRefreshResult, void>) {
  const client = useQueryClient();
  return useMutation<CuratedPredictionRefreshResult, Error, void>({ mutationFn: () => predictionEngineService.refreshCuratedPredictions(), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await client.invalidateQueries({ queryKey: predictionEngineQueryKeys.all }); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}

