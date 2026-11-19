'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiQueryHookOptions } from '../types/common';
import { predictionAccessService } from '../services/prediction-access.service';
import type {
  GetFixtureMarketsArgs,
  GetManualPredictionArgs,
  GetPickCenterArgs,
  GetSlipArgs,
  ListCuratedPredictionsArgs,
  ListManualPredictionsArgs,
  ListMarketsArgs,
  ListPickCenterArgs,
  ListSettledArgs,
  ListSlipsArgs,
  ListSureOddsArgs,
} from '../types/endpoint-args/prediction-access';
import type {
  CuratedPrediction,
  MarketPrediction,
  PickCenterRecord,
  PredictionAccessPolicy,
  PredictionCollection,
  PredictionPage,
  PredictionSlip,
} from '../types/predictions';

const DEFAULT_PAGE_SIZE = 100;
const MAX_COLLECTION_PAGES = 10;
const PAGE_BATCH_SIZE = 3;

export const predictionAccessQueryKeys = {
  all: ['prediction-access'] as const,
  policy: () => ['prediction-access', 'policy'] as const,
  manualPredictions: (args?: ListManualPredictionsArgs) => ['prediction-access', 'manual-predictions', args ?? null] as const,
  manualPrediction: (id: string) => ['prediction-access', 'manual-prediction', id] as const,
  curatedPredictions: (args?: ListCuratedPredictionsArgs) => ['prediction-access', 'curated-predictions', args ?? null] as const,
  settled: (args?: ListSettledArgs) => ['prediction-access', 'settled', args ?? null] as const,
  markets: (args?: ListMarketsArgs) => ['prediction-access', 'markets', args ?? null] as const,
  fixtureMarkets: (eventId: string) => ['prediction-access', 'fixture-markets', eventId] as const,
  pickCenter: (args?: ListPickCenterArgs) => ['prediction-access', 'pick-center', args ?? null] as const,
  pickCenterItem: (eventId: string) => ['prediction-access', 'pick-center-item', eventId] as const,
  slips: (args?: ListSlipsArgs) => ['prediction-access', 'slips', args ?? null] as const,
  slip: (slipId: string) => ['prediction-access', 'slip', slipId] as const,
  sureOdds: (args?: ListSureOddsArgs) => ['prediction-access', 'sure-odds', args ?? null] as const,
};

export function useGetPolicyQuery(
  options?: ApiQueryHookOptions<PredictionAccessPolicy>,
) {
  return useQuery<PredictionAccessPolicy>({
    queryKey: predictionAccessQueryKeys.policy(),
    queryFn: () => predictionAccessService.getPolicy(),
    staleTime: 120_000,
    ...options,
  });
}

export function useListManualPredictionsQuery(
  args?: ListManualPredictionsArgs,
  options?: ApiQueryHookOptions<PredictionPage<CuratedPrediction>>,
) {
  return useQuery<PredictionPage<CuratedPrediction>>({
    queryKey: predictionAccessQueryKeys.manualPredictions(args),
    queryFn: () => predictionAccessService.listManualPredictions(args),
    ...options,
  });
}

export function useListCuratedPredictionsQuery(
  args?: ListCuratedPredictionsArgs,
  options?: ApiQueryHookOptions<PredictionPage<CuratedPrediction>>,
) {
  return useQuery<PredictionPage<CuratedPrediction>>({
    queryKey: predictionAccessQueryKeys.curatedPredictions(args),
    queryFn: () => predictionAccessService.listCuratedPredictions(args),
    ...options,
  });
}

export function useGetManualPredictionQuery(
  args: GetManualPredictionArgs,
  options?: ApiQueryHookOptions<CuratedPrediction>,
) {
  return useQuery<CuratedPrediction>({
    queryKey: predictionAccessQueryKeys.manualPrediction(args.path.id),
    queryFn: () => predictionAccessService.getManualPrediction(args),
    enabled: Boolean(args.path.id) && options?.enabled !== false,
    ...options,
  });
}

export function useListSettledQuery(
  args?: ListSettledArgs,
  options?: ApiQueryHookOptions<PredictionPage<MarketPrediction>>,
) {
  return useQuery<PredictionPage<MarketPrediction>>({
    queryKey: predictionAccessQueryKeys.settled(args),
    queryFn: () => predictionAccessService.listSettled(args),
    ...options,
  });
}

export function useListMarketsQuery(
  args?: ListMarketsArgs,
  options?: ApiQueryHookOptions<PredictionPage<MarketPrediction>>,
) {
  return useQuery<PredictionPage<MarketPrediction>>({
    queryKey: predictionAccessQueryKeys.markets(args),
    queryFn: () => predictionAccessService.listMarkets(args),
    ...options,
  });
}

export function useGetFixtureMarketsQuery(
  args: GetFixtureMarketsArgs,
  options?: ApiQueryHookOptions<MarketPrediction[]>,
) {
  return useQuery<MarketPrediction[]>({
    queryKey: predictionAccessQueryKeys.fixtureMarkets(args.path.eventId),
    queryFn: () => predictionAccessService.getFixtureMarkets(args),
    enabled: Boolean(args.path.eventId) && options?.enabled !== false,
    ...options,
  });
}

export function useListPickCenterQuery(
  args?: ListPickCenterArgs,
  options?: ApiQueryHookOptions<PredictionPage<PickCenterRecord>>,
) {
  return useQuery<PredictionPage<PickCenterRecord>>({
    queryKey: predictionAccessQueryKeys.pickCenter(args),
    queryFn: () => predictionAccessService.listPickCenter(args),
    ...options,
  });
}

export function useGetPickCenterQuery(
  args: GetPickCenterArgs,
  options?: ApiQueryHookOptions<PickCenterRecord>,
) {
  return useQuery<PickCenterRecord>({
    queryKey: predictionAccessQueryKeys.pickCenterItem(args.path.eventId),
    queryFn: () => predictionAccessService.getPickCenter(args),
    enabled: Boolean(args.path.eventId) && options?.enabled !== false,
    ...options,
  });
}

export function useListSlipsQuery(
  args?: ListSlipsArgs,
  options?: ApiQueryHookOptions<PredictionPage<PredictionSlip>>,
) {
  return useQuery<PredictionPage<PredictionSlip>>({
    queryKey: predictionAccessQueryKeys.slips(args),
    queryFn: () => predictionAccessService.listSlips(args),
    ...options,
  });
}

export function useGetSlipQuery(
  args: GetSlipArgs,
  options?: ApiQueryHookOptions<PredictionSlip>,
) {
  return useQuery<PredictionSlip>({
    queryKey: predictionAccessQueryKeys.slip(args.path.slipId),
    queryFn: () => predictionAccessService.getSlip(args),
    enabled: Boolean(args.path.slipId) && options?.enabled !== false,
    ...options,
  });
}

export function useListSureOddsQuery(
  args?: ListSureOddsArgs,
  options?: ApiQueryHookOptions<PredictionPage<PredictionSlip>>,
) {
  return useQuery<PredictionPage<PredictionSlip>>({
    queryKey: predictionAccessQueryKeys.sureOdds(args),
    queryFn: () => predictionAccessService.listSureOdds(args),
    ...options,
  });
}

export interface PredictionCollectionOptions {
  /** Maximum supported page size for the backend access endpoints is 100. */
  pageSize?: number;
  /** Maximum page count fetched by one query to keep public reads bounded. */
  maxPages?: number;
  /** Include auth/plan scope where the visible response can vary by access. */
  cacheScope?: string;
}

export type ListPickCenterCollectionArgs = PredictionCollectionOptions & {
  query?: Omit<NonNullable<ListPickCenterArgs['query']>, 'page' | 'pageSize'>;
};
export type ListCuratedPredictionsCollectionArgs = PredictionCollectionOptions & {
  query?: Omit<NonNullable<ListCuratedPredictionsArgs['query']>, 'page' | 'pageSize'>;
};
export type ListSlipsCollectionArgs = PredictionCollectionOptions & {
  query?: Omit<NonNullable<ListSlipsArgs['query']>, 'page' | 'pageSize'>;
};
export type ListSureOddsCollectionArgs = PredictionCollectionOptions & {
  query?: Omit<NonNullable<ListSureOddsArgs['query']>, 'page' | 'pageSize'>;
};

async function collectPredictionPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PredictionPage<T>>,
  requestedPageSize = DEFAULT_PAGE_SIZE,
  requestedMaxPages = MAX_COLLECTION_PAGES,
): Promise<PredictionCollection<T>> {
  const pageSize = Math.min(100, Math.max(1, Math.floor(requestedPageSize)));
  const maxPages = Math.max(1, Math.floor(requestedMaxPages));
  const firstPage = await fetchPage(1, pageSize);
  const reportedPages = Math.max(1, Math.floor(firstPage.pagination?.pages ?? 1));
  const pagesToFetch = Math.min(reportedPages, maxPages);
  const items = [...firstPage.items];

  for (let start = 2; start <= pagesToFetch; start += PAGE_BATCH_SIZE) {
    const pageNumbers = Array.from(
      { length: Math.min(PAGE_BATCH_SIZE, pagesToFetch - start + 1) },
      (_, index) => start + index,
    );
    const nextPages = await Promise.all(
      pageNumbers.map((page) => fetchPage(page, pageSize)),
    );
    for (const page of nextPages) items.push(...page.items);
  }

  const total = firstPage.pagination?.total ?? items.length;
  return {
    ...firstPage,
    items,
    pagination: {
      page: firstPage.pagination?.page ?? 1,
      pageSize: firstPage.pagination?.pageSize ?? pageSize,
      total,
      pages: reportedPages,
    },
    total,
    pages: reportedPages,
    truncated: reportedPages > maxPages,
  };
}

export function useListPickCenterCollectionQuery(
  args: ListPickCenterCollectionArgs,
  options?: ApiQueryHookOptions<PredictionCollection<PickCenterRecord>>,
) {
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = args.maxPages ?? MAX_COLLECTION_PAGES;
  return useQuery<PredictionCollection<PickCenterRecord>>({
    queryKey: [
      ...predictionAccessQueryKeys.pickCenter({ query: args.query }),
      'collection', pageSize, maxPages, args.cacheScope ?? null,
    ],
    queryFn: () => collectPredictionPages(
      (page, size) => predictionAccessService.listPickCenter({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    ...options,
  });
}

export function useListCuratedPredictionsCollectionQuery(
  args: ListCuratedPredictionsCollectionArgs,
  options?: ApiQueryHookOptions<PredictionCollection<CuratedPrediction>>,
) {
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = args.maxPages ?? MAX_COLLECTION_PAGES;
  return useQuery<PredictionCollection<CuratedPrediction>>({
    queryKey: [
      ...predictionAccessQueryKeys.curatedPredictions({ query: args.query }),
      'collection', pageSize, maxPages, args.cacheScope ?? null,
    ],
    queryFn: () => collectPredictionPages(
      (page, size) => predictionAccessService.listCuratedPredictions({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    ...options,
  });
}

export function useListSlipsCollectionQuery(
  args: ListSlipsCollectionArgs,
  options?: ApiQueryHookOptions<PredictionCollection<PredictionSlip>>,
) {
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = args.maxPages ?? MAX_COLLECTION_PAGES;
  return useQuery<PredictionCollection<PredictionSlip>>({
    queryKey: [
      ...predictionAccessQueryKeys.slips({ query: args.query }),
      'collection', pageSize, maxPages, args.cacheScope ?? null,
    ],
    queryFn: () => collectPredictionPages(
      (page, size) => predictionAccessService.listSlips({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    ...options,
  });
}

export function useListSureOddsCollectionQuery(
  args: ListSureOddsCollectionArgs,
  options?: ApiQueryHookOptions<PredictionCollection<PredictionSlip>>,
) {
  const pageSize = args.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = args.maxPages ?? MAX_COLLECTION_PAGES;
  return useQuery<PredictionCollection<PredictionSlip>>({
    queryKey: [
      ...predictionAccessQueryKeys.sureOdds({ query: args.query }),
      'collection', pageSize, maxPages, args.cacheScope ?? null,
    ],
    queryFn: () => collectPredictionPages(
      (page, size) => predictionAccessService.listSureOdds({
        query: { ...args.query, page, pageSize: size },
      }),
      pageSize,
      maxPages,
    ),
    ...options,
  });
}
