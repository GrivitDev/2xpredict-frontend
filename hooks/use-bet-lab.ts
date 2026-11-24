'use client';
/* React Query hooks for every bet-lab controller endpoint. */
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { betLabService } from '../services/bet-lab.service';
import type { BetLabCatalog, BetLabFixtureMarketsResponse, BetLabFixtureOddsResponse, BetLabFixturesPage, BetLabPlacementResponse, BetLabStatisticsResponse, BetLabTicket, BetLabTicketPage } from '../types/bet-lab';
import type { GetFixturesArgs, GetMarketsArgs, GetOddsArgs, GetTicketArgs, GetTicketsArgs, PlaceAccumulatorArgs, PlaceSingleTicketArgs } from '../types/endpoint-args/bet-lab';

export function useGetMarketCatalogQuery<TData = BetLabCatalog>(options?: ApiQueryHookOptions<BetLabCatalog, TData>) {
  return useQuery<BetLabCatalog, Error, TData>({
    queryKey: ['bet-lab', 'getMarketCatalog'],
    queryFn: betLabService.getMarketCatalog,
    ...options,
  });
}

export function useGetFixturesQuery<TData = BetLabFixturesPage>(args?: GetFixturesArgs, options?: ApiQueryHookOptions<BetLabFixturesPage, TData>) {
  return useQuery<BetLabFixturesPage, Error, TData>({
    queryKey: ['bet-lab', 'getFixtures', args ?? null],
    queryFn: () => betLabService.getFixtures(args),
    ...options,
  });
}


export interface BetLabFixturesInfiniteQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number | false;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
}

/** Return the next numeric page only while the backend reports more pages. */
export function getNextBetLabFixturesPage(
  lastPage: BetLabFixturesPage,
): number | undefined {
  const currentPage = Math.max(1, Math.floor(Number(lastPage.pagination?.page) || 1));
  const totalPages = Math.max(0, Math.floor(Number(lastPage.pagination?.pages) || 0));
  return currentPage < totalPages ? currentPage + 1 : undefined;
}

/** Paginated Bet Lab fixture read; later pages are fetched only on demand. */
export function useGetFixturesInfiniteQuery(
  args?: GetFixturesArgs,
  options?: BetLabFixturesInfiniteQueryOptions,
) {
  const pageSize = Math.min(100, Math.max(1, Math.floor(args?.query?.limit ?? 50)));
  const initialPage = Math.max(1, Math.floor(args?.query?.page ?? 1));

  return useInfiniteQuery({
    queryKey: ['bet-lab', 'getFixtures', 'infinite', args?.query ?? null],
    initialPageParam: initialPage,
    queryFn: ({ pageParam }) => betLabService.getFixtures({
      query: {
        ...args?.query,
        page: pageParam,
        limit: pageSize,
      },
    }),
    getNextPageParam: getNextBetLabFixturesPage,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useGetMarketsQuery<TData = BetLabFixtureMarketsResponse>(args: GetMarketsArgs, options?: ApiQueryHookOptions<BetLabFixtureMarketsResponse, TData>) {
  return useQuery<BetLabFixtureMarketsResponse, Error, TData>({
    queryKey: ['bet-lab', 'getMarkets', args ?? null],
    queryFn: () => betLabService.getMarkets(args),
    ...options,
  });
}

export function useGetOddsQuery<TData = BetLabFixtureOddsResponse>(args: GetOddsArgs, options?: ApiQueryHookOptions<BetLabFixtureOddsResponse, TData>) {
  return useQuery<BetLabFixtureOddsResponse, Error, TData>({
    queryKey: ['bet-lab', 'getOdds', args ?? null],
    queryFn: () => betLabService.getOdds(args),
    ...options,
  });
}

export function usePlaceSingleTicketMutation(options?: ApiMutationHookOptions<BetLabPlacementResponse, PlaceSingleTicketArgs>) {
  return useMutation<BetLabPlacementResponse, Error, PlaceSingleTicketArgs>({
    mutationFn: (args: PlaceSingleTicketArgs) => betLabService.placeSingleTicket(args),
    ...options,
  });
}

export function usePlaceAccumulatorMutation(options?: ApiMutationHookOptions<BetLabPlacementResponse, PlaceAccumulatorArgs>) {
  return useMutation<BetLabPlacementResponse, Error, PlaceAccumulatorArgs>({
    mutationFn: (args: PlaceAccumulatorArgs) => betLabService.placeAccumulator(args),
    ...options,
  });
}

export function useGetTicketsQuery<TData = BetLabTicketPage>(args?: GetTicketsArgs, options?: ApiQueryHookOptions<BetLabTicketPage, TData>) {
  return useQuery<BetLabTicketPage, Error, TData>({
    queryKey: ['bet-lab', 'getTickets', args ?? null],
    queryFn: () => betLabService.getTickets(args),
    ...options,
  });
}

export function useGetTicketQuery<TData = BetLabTicket>(args: GetTicketArgs, options?: ApiQueryHookOptions<BetLabTicket, TData>) {
  return useQuery<BetLabTicket, Error, TData>({
    queryKey: ['bet-lab', 'getTicket', args ?? null],
    queryFn: () => betLabService.getTicket(args),
    ...options,
  });
}

export function useGetStatisticsQuery<TData = BetLabStatisticsResponse>(options?: ApiQueryHookOptions<BetLabStatisticsResponse, TData>) {
  return useQuery<BetLabStatisticsResponse, Error, TData>({
    queryKey: ['bet-lab', 'getStatistics'],
    queryFn: betLabService.getStatistics,
    ...options,
  });
}
