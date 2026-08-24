'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  userService,
  type UpdateProfileDto,
} from '@/services/user.service';

import type { User } from '@/types/user';


// ============================================================
// HOOK
// ============================================================

export function useProfile() {

  const queryClient =
    useQueryClient();


  // ==========================================================
  // GET PROFILE
  // ==========================================================

  const {
    data: user,
    isLoading: loading,
    refetch,
  } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: userService.getMe,
  });


  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const updateMutation =
    useMutation({

      mutationFn: (
        data: UpdateProfileDto,
      ) =>
        userService.updateProfile(data),

      onSuccess: (
        updatedUser,
      ) => {

        queryClient.setQueryData<User>(
          ['profile'],
          updatedUser,
        );

        toast.success(
          'Profile updated successfully.',
        );

      },

      onError: (error: any) => {

        toast.error(
          error?.response?.data?.message ??
            'Failed to update profile.',
        );

      },

    });


  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const deleteMutation =
    useMutation({

      mutationFn:
        userService.deleteAccount,

      onSuccess: () => {

        queryClient.removeQueries({
          queryKey: ['profile'],
        });

        toast.success(
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


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    user,

    loading,

    updating:
      updateMutation.isPending,

    deleting:
      deleteMutation.isPending,

    updateProfile:
      updateMutation.mutateAsync,

    deleteAccount:
      deleteMutation.mutateAsync,

    refetch,

  };

}