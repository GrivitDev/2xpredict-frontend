'use client';
import { useSettlementMonitor, useSettlementJobs, useSettlementRuns, useSettlementEvents, type MonitorHookOptions } from './use-monitoring';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { settlementService } from '../services/settlement.service';
import type {
  GetEventsArgs,
  GetJobsArgs,
  GetRunsArgs,
  RequeueFixtureArgs,
  GetOverdueBetLabLegsArgs,
  ManualSettleBetLabLegArgs,
  ManualSettlePredictionSelectionArgs,
} from '../types/endpoint-args/settlement';
import type {
  RequeueFixtureResponse,
  SettlementEventsResponse,
  SettlementJob,
  SettlementMonitorOverview,
  SettlementPage,
  SettlementRun,
  OverdueBetLabLegsResponse,
  ManualBetLabLegSettlementResponse,
  ManualPredictionSelectionSettlementResponse,
} from '../types/settlement-admin';

const ROOT_KEY = ['settlement-admin'] as const;

export function useGetMonitorQuery(options?: MonitorHookOptions) { return useSettlementMonitor(options); }

export function useGetJobsQuery(args?: GetJobsArgs, options?: MonitorHookOptions) { return useSettlementJobs(args?.query ?? {}, options); }

export function useGetRunsQuery(args?: GetRunsArgs, options?: MonitorHookOptions) { return useSettlementRuns(args?.query ?? {}, options); }

export function useGetEventsQuery(args?: GetEventsArgs, options?: MonitorHookOptions) { return useSettlementEvents(args?.query ?? {}, options); }

export function useRequeueFixtureMutation(
  options?: ApiMutationHookOptions<RequeueFixtureResponse, RequeueFixtureArgs>,
) {
  return useMutation<RequeueFixtureResponse, Error, RequeueFixtureArgs>({
    mutationFn: (args: RequeueFixtureArgs) => settlementService.requeueFixture(args),
    ...options,
  });
}


export function useGetOverdueBetLabLegsQuery(
  args?: GetOverdueBetLabLegsArgs,
  options?: ApiQueryHookOptions<OverdueBetLabLegsResponse>,
) {
  return useQuery<OverdueBetLabLegsResponse>({
    queryKey: [...ROOT_KEY, 'getOverdueBetLabLegs', args ?? null],
    queryFn: () => settlementService.getOverdueBetLabLegs(args),
    ...options,
  });
}

export function useManualSettleBetLabLegMutation(
  options?: ApiMutationHookOptions<ManualBetLabLegSettlementResponse, ManualSettleBetLabLegArgs>,
) {
  return useMutation<ManualBetLabLegSettlementResponse, Error, ManualSettleBetLabLegArgs>({
    mutationFn: (args: ManualSettleBetLabLegArgs) => settlementService.manuallySettleBetLabLeg(args),
    ...options,
  });
}

export function useManualSettlePredictionSelectionMutation(
  options?: ApiMutationHookOptions<ManualPredictionSelectionSettlementResponse, ManualSettlePredictionSelectionArgs>,
) {
  return useMutation<ManualPredictionSelectionSettlementResponse, Error, ManualSettlePredictionSelectionArgs>({
    mutationFn: (args: ManualSettlePredictionSelectionArgs) => settlementService.manuallySettlePredictionSelection(args),
    ...options,
  });
}
