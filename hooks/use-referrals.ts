'use client';

import {
  useQuery,
} from '@tanstack/react-query';

import {
  getMyReferralLink,
  getMyReferrals,
  getReferralStats,
} from '@/services/referrals.service';


// ============================================================
// MY REFERRAL LINK
// ============================================================

export function useMyReferralLink() {

  return useQuery({

    queryKey: [
      'my-referral-link',
    ],

    queryFn:
      getMyReferralLink,

    staleTime:
      1000 * 60 * 5,

  });

}


// ============================================================
// MY REFERRALS
// ============================================================

export function useMyReferrals() {

  return useQuery({

    queryKey: [
      'my-referrals',
    ],

    queryFn:
      getMyReferrals,

    staleTime:
      1000 * 60 * 5,

  });

}


// ============================================================
// MY REFERRAL STATS
// ============================================================

export function useReferralStats() {

  return useQuery({

    queryKey: [
      'referral-stats',
    ],

    queryFn:
      getReferralStats,

    staleTime:
      1000 * 60 * 5,

  });

}