'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getPromos,
  createPromo,
  updatePromo,
  deactivatePromo,
} from '@/services/admin-promos.service';


// ============================================================
// ALL PROMOS
// ============================================================

export function usePromos() {
  return useQuery({
    queryKey: ['admin-promos'],

    queryFn: getPromos,
  });
}


// ============================================================
// CREATE PROMO
// ============================================================

export function useCreatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromo,

    onSuccess() {

      queryClient.invalidateQueries({
        queryKey: ['admin-promos'],
      });

      queryClient.invalidateQueries({
        queryKey: ['referral-promos'],
      });
    },
  });
}


// ============================================================
// UPDATE PROMO
// ============================================================

export function useUpdatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: any;
    }) =>
      updatePromo(id, dto),

    onSuccess() {

      queryClient.invalidateQueries({
        queryKey: ['admin-promos'],
      });

      queryClient.invalidateQueries({
        queryKey: ['referral-promos'],
      });
    },
  });
}


// ============================================================
// DEACTIVATE PROMO
// ============================================================

export function useDeactivatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePromo,

    onSuccess() {

      queryClient.invalidateQueries({
        queryKey: ['admin-promos'],
      });

      queryClient.invalidateQueries({
        queryKey: ['referral-promos'],
      });
    },
  });
}