'use client';
/* React Query hooks for every users controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { usersService } from '../services/users.service';
import type { UpdateProfileArgs } from '../types/endpoint-args/users';

export function useGetProfileQuery<TData = any>(options?: ApiQueryHookOptions<TData>) {
  return useQuery<TData>({
    queryKey: ['users', 'getProfile'],
    queryFn: () => usersService.getProfile<TData>(),
    ...options,
  });
}

export function useUpdateProfileMutation<TData = any>(options?: ApiMutationHookOptions<TData, UpdateProfileArgs>) {
  return useMutation<TData, Error, UpdateProfileArgs>({
    mutationFn: (args: UpdateProfileArgs) => usersService.updateProfile<TData>(args),
    ...options,
  });
}

export function useDeleteAccountMutation<TData = any>(options?: ApiMutationHookOptions<TData, void>) {
  return useMutation<TData, Error, void>({
    mutationFn: () => usersService.deleteAccount<TData>(),
    ...options,
  });
}
