'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getReferralPromos,
  joinPromo,
  getMyPromoProgress,
  getMyRewards,
  getPromoStatus,
} from '@/services/promos.service';


// ============================================================
// ACTIVE REFERRAL PROMOS
// ============================================================

export function useReferralPromos() {

  return useQuery({

    queryKey: [
      'referral-promos',
    ],

    queryFn:
      getReferralPromos,

    staleTime:
      1000 * 60 * 5,

  });

}


// ============================================================
// JOIN PROMO
// ============================================================

export function useJoinPromo() {

  const queryClient =
    useQueryClient();

  return useMutation({

    mutationFn: (
      promoId: string,
    ) =>
      joinPromo(promoId),

    onSuccess: (
      _data,
      promoId,
    ) => {

      queryClient.invalidateQueries({
        queryKey: [
          'referral-promos',
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'promo-progress',
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'promo-status',
          promoId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'my-rewards',
        ],
      });

    },

  });

}


// ============================================================
// MY PROMO PROGRESS
// ============================================================

export function useMyPromoProgress() {

  return useQuery({

    queryKey: [
      'promo-progress',
    ],

    queryFn:
      getMyPromoProgress,

    staleTime:
      1000 * 60 * 5,

  });

}


// ============================================================
// MY REWARDS
// ============================================================

export function useMyRewards() {

  return useQuery({

    queryKey: [
      'my-rewards',
    ],

    queryFn:
      getMyRewards,

    staleTime:
      1000 * 60 * 5,

  });

}


// ============================================================
// PROMO STATUS
// ============================================================

export function usePromoStatus(
  promoId?: string,
) {

  return useQuery({

    queryKey: [
      'promo-status',
      promoId,
    ],

    queryFn: () =>
      getPromoStatus(
        promoId!,
      ),

    enabled:
      Boolean(promoId),

    staleTime:
      1000 * 60 * 5,

  });

}