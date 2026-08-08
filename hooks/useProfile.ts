'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  userService,
  type UpdateProfileDto,
} from '@/services/user.service';

import type { User } from '@/types/user';

export function useProfile() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: loading,
    refetch,
  } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: userService.getMe,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) =>
      userService.updateProfile(data),

    onSuccess: (response) => {
      toast.success(
        response?.message ??
          'Profile updated successfully.',
      );

      queryClient.invalidateQueries({
        queryKey: ['profile'],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          'Failed to update profile.',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteAccount,

    onSuccess: (response) => {
      toast.success(
        response?.message ??
          'Account deleted successfully.',
      );
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          'Failed to delete account.',
      );
    },
  });

  return {
    user,

    loading,

    updating: updateMutation.isPending,

    deleting: deleteMutation.isPending,

    updateProfile: updateMutation.mutateAsync,

    deleteAccount: deleteMutation.mutateAsync,

    refetch,
  };
}