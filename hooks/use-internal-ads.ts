'use client';
/* React Query hooks mapped to the actual internal-ads service contracts. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { internalAdsService } from '../services/internal-ads.service';
import type { CreateArgs, FindOneArgs, RemoveArgs, UpdateArgs } from '../types/endpoint-args/internal-ads';

export function useGetActiveAdsQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({ queryKey: ['internal-ads', 'active'], queryFn: () => internalAdsService.getActiveAds<TData>(), ...options });
}
export function useFindAllQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({ queryKey: ['internal-ads', 'admin-list'], queryFn: () => internalAdsService.findAll<TData>(), ...options });
}
export function useFindOneQuery<TData = any>(args: FindOneArgs, options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({ queryKey: ['internal-ads', 'detail', args.path.id], queryFn: () => internalAdsService.findOne<TData>(args.path.id), enabled: Boolean(args.path.id) && options?.enabled !== false, ...options });
}
export function useCreateMutation<TData = any>(options?: ApiMutationHookOptions<TData, CreateArgs>) {
  const client = useQueryClient();
  return useMutation<TData, Error, CreateArgs>({
    mutationFn: (args) => internalAdsService.create<TData>(args.body),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await client.invalidateQueries({ queryKey: ['internal-ads'] });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useUpdateMutation<TData = any>(options?: ApiMutationHookOptions<TData, UpdateArgs>) {
  const client = useQueryClient();
  return useMutation<TData, Error, UpdateArgs>({
    mutationFn: (args) => internalAdsService.update<TData>(args.path.id, args.body),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await client.invalidateQueries({ queryKey: ['internal-ads'] });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
export function useRemoveMutation<TData = any>(options?: ApiMutationHookOptions<TData, RemoveArgs>) {
  const client = useQueryClient();
  return useMutation<TData, Error, RemoveArgs>({
    mutationFn: (args) => internalAdsService.remove<TData>(args.path.id),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await client.invalidateQueries({ queryKey: ['internal-ads'] });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
