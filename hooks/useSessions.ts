'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { sessionService } from '@/services/session.service';
import { logoutUser } from '@/services/auth.service';

export function useSessions() {
  const router = useRouter();

  const logoutCurrentMutation = useMutation({
    mutationFn: sessionService.logoutCurrent,

    onSuccess: (response) => {
      logoutUser();

      toast.success(
        response?.message ??
          'Logged out successfully.',
      );

      router.replace('/login');
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          'Failed to logout.',
      );
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: sessionService.logoutAll,

    onSuccess: (response) => {
      logoutUser();

      toast.success(
        response?.message ??
          'Logged out from all devices.',
      );

      router.replace('/login');
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          'Failed to logout from all devices.',
      );
    },
  });

  return {
    logoutCurrent:
      logoutCurrentMutation.mutateAsync,

    logoutAll:
      logoutAllMutation.mutateAsync,

    loggingOut:
      logoutCurrentMutation.isPending,

    loggingOutAll:
      logoutAllMutation.isPending,
  };
}