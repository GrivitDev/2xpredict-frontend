'use client';
/* React Query hooks for every bet-lab controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
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
