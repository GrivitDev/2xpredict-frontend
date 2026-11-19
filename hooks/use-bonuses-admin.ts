'use client';
/* React Query hooks for every bonuses-admin controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { bonusesService } from '../services/bonuses.service';
import type { GetBulkGrantJobArgs, GrantPointsArgs, GrantPointsToAllArgs, GrantSubscriptionArgs, GrantSubscriptionToAllArgs, ListArgs, ListBonusRecipientsArgs, ListBulkGrantJobsArgs, RevokeArgs } from '../types/endpoint-args/bonuses';

export function useListBonusRecipientsQuery<TData = any>(args?: ListBonusRecipientsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['bonuses-admin', 'recipients', args ?? null],
    queryFn: () => bonusesService.listRecipients<TData>(args),
    ...options,
  });
}

export function useGrantPointsMutation<TData = any>(options?: ApiMutationHookOptions<TData, GrantPointsArgs>) {
  return useMutation<TData, Error, GrantPointsArgs>({
    mutationFn: (args: GrantPointsArgs) => bonusesService.grantPoints<TData>(args),
    ...options,
  });
}

export function useGrantSubscriptionMutation<TData = any>(options?: ApiMutationHookOptions<TData, GrantSubscriptionArgs>) {
  return useMutation<TData, Error, GrantSubscriptionArgs>({
    mutationFn: (args: GrantSubscriptionArgs) => bonusesService.grantSubscription<TData>(args),
    ...options,
  });
}

export function useGrantPointsToAllMutation<TData = any>(options?: ApiMutationHookOptions<TData, GrantPointsToAllArgs>) {
  return useMutation<TData, Error, GrantPointsToAllArgs>({
    mutationFn: (args: GrantPointsToAllArgs) => bonusesService.grantPointsToAll<TData>(args),
    ...options,
  });
}

export function useGrantSubscriptionToAllMutation<TData = any>(options?: ApiMutationHookOptions<TData, GrantSubscriptionToAllArgs>) {
  return useMutation<TData, Error, GrantSubscriptionToAllArgs>({
    mutationFn: (args: GrantSubscriptionToAllArgs) => bonusesService.grantSubscriptionToAll<TData>(args),
    ...options,
  });
}

export function useListBulkGrantJobsQuery<TData = any>(args?: ListBulkGrantJobsArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['bonuses-admin', 'listBulkGrantJobs', args ?? null],
    queryFn: () => bonusesService.listBulkGrantJobs<TData>(args),
    ...options,
  });
}

export function useGetBulkGrantJobQuery<TData = any>(args: GetBulkGrantJobArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['bonuses-admin', 'getBulkGrantJob', args ?? null],
    queryFn: () => bonusesService.getBulkGrantJob<TData>(args),
    ...options,
  });
}

export function useListQuery<TData = any>(args?: ListArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['bonuses-admin', 'list', args ?? null],
    queryFn: () => bonusesService.list<TData>(args),
    ...options,
  });
}

export function useRevokeMutation<TData = any>(options?: ApiMutationHookOptions<TData, RevokeArgs>) {
  return useMutation<TData, Error, RevokeArgs>({
    mutationFn: (args: RevokeArgs) => bonusesService.revoke<TData>(args),
    ...options,
  });
}
