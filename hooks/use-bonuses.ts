'use client';
/* React Query hooks for every bonuses controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { bonusesService } from '../services/bonuses.service';
import type { GetMyBonusesArgs } from '../types/endpoint-args/bonuses';
import { useAuth } from '../providers/auth-provider';

export function useGetMyBonusesQuery<TData = any>(args?: GetMyBonusesArgs, options?: ApiQueryHookOptions<TData>) {
  const { user, token, loading } = useAuth();
  const principal = String(user?.userId ?? (token ? 'authenticated' : 'anonymous'));

  return useQuery<TData>({
    queryKey: ['bonuses', 'mine', principal, args ?? null],
    queryFn: () => bonusesService.getMyBonuses<TData>(args),
    staleTime: 15_000,
    ...options,
    enabled: !loading && Boolean(user || token) && options?.enabled !== false,
  });
}
