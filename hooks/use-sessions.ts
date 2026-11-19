'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionsService } from '@/services/sessions.service';

export const sessionQueryKey = ['sessions', 'mine'] as const;
export function useMySessions() {
  return useQuery({ queryKey: sessionQueryKey, queryFn: sessionsService.getMySessions, staleTime: 15_000 });
}
export function useSessionActions() {
  const client = useQueryClient();
  const finish = async () => {
    await client.invalidateQueries({ queryKey: sessionQueryKey });
  };
  return {
    logoutCurrent: useMutation({ mutationFn: sessionsService.logoutCurrent, onSuccess: finish }),
    logoutAll: useMutation({ mutationFn: sessionsService.logoutAll, onSuccess: finish }),
  };
}
