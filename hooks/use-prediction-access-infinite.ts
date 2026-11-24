'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { predictionAccessService } from '@/services/prediction-access.service';
import type {
  ListCuratedPredictionsArgs,
  ListPickCenterArgs,
  ListSlipsArgs,
  ListSureOddsArgs,
} from '@/types/endpoint-args/prediction-access';
import type {
  CuratedPrediction,
  PickCenterRecord,
  PredictionPage,
  PredictionSlipListItem,
} from '@/types/predictions';

export interface PredictionInfiniteQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  refetchOnWindowFocus?: boolean;
}

type PageControls = {
  pageSize?: number;
  cacheScope?: string;
};

export type ListPickCenterInfiniteArgs = PageControls & {
  query?: Omit<NonNullable<ListPickCenterArgs['query']>, 'page' | 'pageSize'>;
};

export type ListCuratedPredictionsInfiniteArgs = PageControls & {
  query?: Omit<NonNullable<ListCuratedPredictionsArgs['query']>, 'page' | 'pageSize'>;
};

export type ListSlipsInfiniteArgs = PageControls & {
  query?: Omit<NonNullable<ListSlipsArgs['query']>, 'page' | 'pageSize'>;
};

export type ListSureOddsInfiniteArgs = PageControls & {
  query?: Omit<NonNullable<ListSureOddsArgs['query']>, 'page' | 'pageSize'>;
};

const PICK_CENTER_PAGE_SIZE = 25;
const CURATED_PAGE_SIZE = 20;
const SLIPS_PAGE_SIZE = 20;

function nextPage<T>(lastPage: PredictionPage<T>): number | undefined {
  const { page, pages } = lastPage.pagination;
  return page < pages ? page + 1 : undefined;
}

/** Fetch one Pick Center page initially; later pages load only on user action. */
export function useListPickCenterInfiniteQuery(
  args: ListPickCenterInfiniteArgs,
  options?: PredictionInfiniteQueryOptions,
) {
  const pageSize = args.pageSize ?? PICK_CENTER_PAGE_SIZE;
  return useInfiniteQuery<PredictionPage<PickCenterRecord>, Error>({
    queryKey: [
      'prediction-access',
      'pick-center',
      'infinite',
      args.query ?? null,
      pageSize,
      args.cacheScope ?? null,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      predictionAccessService.listPickCenter({
        query: { ...args.query, page: Number(pageParam), pageSize },
      }),
    getNextPageParam: nextPage,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/** Curated Predictions uses the backend's 20-item default page size. */
export function useListCuratedPredictionsInfiniteQuery(
  args: ListCuratedPredictionsInfiniteArgs,
  options?: PredictionInfiniteQueryOptions,
) {
  const pageSize = args.pageSize ?? CURATED_PAGE_SIZE;
  return useInfiniteQuery<PredictionPage<CuratedPrediction>, Error>({
    queryKey: [
      'prediction-access',
      'curated-predictions',
      'infinite',
      args.query ?? null,
      pageSize,
      args.cacheScope ?? null,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      predictionAccessService.listCuratedPredictions({
        query: { ...args.query, page: Number(pageParam), pageSize },
      }),
    getNextPageParam: nextPage,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/** Standard published slips are fetched a page at a time, not in bulk. */
export function useListSlipsInfiniteQuery(
  args: ListSlipsInfiniteArgs,
  options?: PredictionInfiniteQueryOptions,
) {
  const pageSize = args.pageSize ?? SLIPS_PAGE_SIZE;
  return useInfiniteQuery<PredictionPage<PredictionSlipListItem>, Error>({
    queryKey: [
      'prediction-access',
      'slips',
      'infinite',
      args.query ?? null,
      pageSize,
      args.cacheScope ?? null,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      predictionAccessService.listSlips({
        query: { ...args.query, page: Number(pageParam), pageSize },
      }),
    getNextPageParam: nextPage,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/** Sure Odds keeps its own access/quota response and page stream. */
export function useListSureOddsInfiniteQuery(
  args: ListSureOddsInfiniteArgs,
  options?: PredictionInfiniteQueryOptions,
) {
  const pageSize = args.pageSize ?? SLIPS_PAGE_SIZE;
  return useInfiniteQuery<PredictionPage<PredictionSlipListItem>, Error>({
    queryKey: [
      'prediction-access',
      'sure-odds',
      'infinite',
      args.query ?? null,
      pageSize,
      args.cacheScope ?? null,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      predictionAccessService.listSureOdds({
        query: { ...args.query, page: Number(pageParam), pageSize },
      }),
    getNextPageParam: nextPage,
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
