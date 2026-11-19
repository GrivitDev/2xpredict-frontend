'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiQueryHookOptions } from '../types/common';
import { oddsService } from '../services/odds.service';
import type { OddsCenterDateRange, OddsCenterResponse, OddsMonitorResponse } from '../types/odds-center';

export const oddsQueryKeys = {
  all: ['odds'] as const,
  center: (range: OddsCenterDateRange) => ['odds', 'center', range] as const,
  monitor: () => ['odds', 'admin', 'monitor'] as const,
};

export function useOddsCenter(
  range: OddsCenterDateRange,
  enabled = true,
  options?: ApiQueryHookOptions<OddsCenterResponse>,
) {
  return useQuery<OddsCenterResponse>({
    ...options,
    queryKey: oddsQueryKeys.center(range),
    queryFn: () => oddsService.getOddsCenter({ query: range }),
    enabled: enabled && Boolean(range.from && range.to),
    staleTime: options?.staleTime ?? 15_000,
  });
}

export function useOddsMonitor(options?: ApiQueryHookOptions<OddsMonitorResponse>) {
  return useQuery<OddsMonitorResponse>({
    ...options,
    queryKey: oddsQueryKeys.monitor(),
    queryFn: () => oddsService.getOddsMonitor(),
    staleTime: options?.staleTime ?? 10_000,
    refetchInterval: options?.refetchInterval ?? 30_000,
  });
}

/** Forces the backend Odds monitor to bypass its short server-side cache. */
export function useRefreshOddsMonitor() {
  const queryClient = useQueryClient();
  return useMutation<OddsMonitorResponse, Error, void>({
    mutationFn: () => oddsService.getOddsMonitor({ query: { refresh: true } }),
    onSuccess: (data) => {
      queryClient.setQueryData(oddsQueryKeys.monitor(), data);
    },
  });
}

