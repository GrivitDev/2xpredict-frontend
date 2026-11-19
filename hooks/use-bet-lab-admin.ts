'use client';

import type { ApiQueryHookOptions } from '../types/common';
import { useBetLabMonitor, useBetLabMonitorEvents, type MonitorHookOptions } from './use-monitoring';
import type { BetLabAdminEvent, BetLabAdminMonitorResponse } from '../types/bet-lab';
import type { GetRecentEventsArgs } from '../types/endpoint-args/bet-lab';

/** Compatibility wrappers; fetching and cache behavior are owned by use-monitoring.ts. */
export function useGetMonitorQuery<TData = BetLabAdminMonitorResponse>(options?: ApiQueryHookOptions<TData>) {
  return useBetLabMonitor(options as MonitorHookOptions) as unknown as import('@tanstack/react-query').UseQueryResult<TData, Error>;
}

export function useGetRecentEventsQuery<TData = BetLabAdminEvent[]>(args?: GetRecentEventsArgs, options?: ApiQueryHookOptions<TData>) {
  return useBetLabMonitorEvents(Number(args?.query?.limit ?? 50), options as MonitorHookOptions) as unknown as import('@tanstack/react-query').UseQueryResult<TData, Error>;
}
