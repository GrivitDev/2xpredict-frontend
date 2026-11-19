'use client';
/* React Query hooks for every user-session controller endpoint. */
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { userSessionService } from '../services/user-session.service';
import type { ApiMessage } from '../types/common';
import type { UserSession } from '../types/sessions';

export function useGetMySessionsQuery(
  options?: ApiQueryHookOptions<UserSession[]>,
) {
  return useQuery<UserSession[]>({
    queryKey: ['user-session', 'getMySessions'],
    queryFn: userSessionService.getMySessions,
    ...options,
  });
}

export function useLogoutCurrentMutation(
  options?: ApiMutationHookOptions<ApiMessage, void>,
) {
  return useMutation<ApiMessage, Error, void>({
    mutationFn: userSessionService.logoutCurrent,
    ...options,
  });
}

export function useLogoutAllMutation(
  options?: ApiMutationHookOptions<ApiMessage, void>,
) {
  return useMutation<ApiMessage, Error, void>({
    mutationFn: userSessionService.logoutAll,
    ...options,
  });
}
