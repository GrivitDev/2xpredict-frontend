import api from '@/lib/axios';

import {
  Referral,
  ReferralAdminStats,
  ReferralStats,
  MyReferralLink,
} from '@/types/referral';


// ============================================================
// MY REFERRAL LINK
// ============================================================

export async function getMyReferralLink(): Promise<
  MyReferralLink
> {

  const response =
    await api.get<MyReferralLink>(
      '/referrals/my-link',
    );

  return response.data;
}


// ============================================================
// MY REFERRALS
// ============================================================

export async function getMyReferrals(): Promise<
  Referral[]
> {

  const response =
    await api.get<Referral[]>(
      '/referrals/my-referrals',
    );

  return response.data;
}


// ============================================================
// MY REFERRAL STATS
// ============================================================

export async function getReferralStats(): Promise<
  ReferralStats
> {

  const response =
    await api.get<ReferralStats>(
      '/referrals/stats',
    );

  return response.data;
}


// ============================================================
// ADMIN - ALL REFERRALS
// ============================================================

export async function getAdminReferrals(): Promise<
  Referral[]
> {

  const response =
    await api.get<Referral[]>(
      '/referrals/admin/all',
    );

  return response.data;
}


// ============================================================
// ADMIN - REFERRAL STATS
// ============================================================

export async function getAdminReferralStats(): Promise<
  ReferralAdminStats
> {

  const response =
    await api.get<ReferralAdminStats>(
      '/referrals/admin/stats',
    );

  return response.data;
}