'use client';
import { useOddsMonitor, monitoringQueryKeys } from './use-monitoring';
import { useQuery } from '@tanstack/react-query';
import { oddsCenterService } from '../services/odds-center.service';
import type { OddsCenterDateRange } from '../types/odds-center';

export const oddsCenterQueryKeys = {
  all: ['odds-center'] as const,
  monitor: monitoringQueryKeys.odds(),
  fixtures: (range: OddsCenterDateRange) => ['odds-center', 'fixtures', range] as const,
};
export function useOddsCenterMonitor() { return useOddsMonitor(); }
export function useOddsCenter(range: OddsCenterDateRange, enabled = true) {
  return useQuery({ queryKey: oddsCenterQueryKeys.fixtures(range), queryFn: () => oddsCenterService.getOddsCenter({ query: range }), enabled: enabled && Boolean(range.from) && Boolean(range.to), staleTime: 15_000 });
}




