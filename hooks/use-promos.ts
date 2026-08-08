'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getMyPromoProgress,
} from '@/services/promos.service';


import {
  getPromos,
  createPromo,
  updatePromo,
  deactivatePromo,
} from '@/services/admin-promos.service';
import { PromoProgress } from '@/types/promo';

export function usePromos() {
  return useQuery({
    queryKey: ['promos'],
    queryFn: getPromos,
  });
}


export function useCreatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromo,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['promos'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-promos'],
      });
    },
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: any;
    }) => updatePromo(id, dto),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['promos'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-promos'],
      });
    },
  });
}

export function useDeactivatePromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePromo,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['promos'],
      });

      queryClient.invalidateQueries({
        queryKey: ['active-promos'],
      });
    },
  });
}

export function useMyPromoProgress() {

  return useQuery<PromoProgress[]>({

    queryKey:[
      'promo-progress',
    ],

    queryFn:getMyPromoProgress,

  });

}