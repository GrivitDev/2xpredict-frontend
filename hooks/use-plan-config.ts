'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { planConfigService } from '../services/plan-config.service';
import type { UpdateArgs } from '../types/endpoint-args/plan-config';
import type { PlanConfig } from '../types/plan-config';

export const planConfigQueryKey = ['plan-config'] as const;
export function usePlanConfigQuery(options?: ApiQueryHookOptions<PlanConfig>) {
  return useQuery({ queryKey: planConfigQueryKey, queryFn: planConfigService.get, staleTime: 60_000, ...options });
}
export function useUpdatePlanConfigMutation(options?: ApiMutationHookOptions<PlanConfig, UpdateArgs>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (args: UpdateArgs) => planConfigService.update(args),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      client.setQueryData(planConfigQueryKey, data);
      await client.invalidateQueries({ queryKey: planConfigQueryKey });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export const useGetQuery = usePlanConfigQuery;
export const useUpdateMutation = useUpdatePlanConfigMutation;
export const usePlanConfig = usePlanConfigQuery;
export const useUpdatePlanConfig = useUpdatePlanConfigMutation;
