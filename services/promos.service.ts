import api from '@/lib/axios';

import {
  Promo,
  PromoProgress,
  PromoReward,
} from '@/types/promo';


// ============================================================
// ACTIVE REFERRAL PROMOS
// ============================================================

export async function getReferralPromos(): Promise<Promo[]> {

  const response = await api.get<Promo[]>(
    '/promos/active/referral',
  );

  return response.data;
}


// ============================================================
// JOIN PROMO
// ============================================================

export interface JoinPromoResponse {

  success?: boolean;

  message?: string;

  promoId?: string;

  joined?: boolean;

  [key: string]: unknown;
}


export async function joinPromo(
  promoId: string,
): Promise<JoinPromoResponse> {

  const response =
    await api.post<JoinPromoResponse>(
      `/promos/${promoId}/join`,
    );

  return response.data;
}


// ============================================================
// MY PROMO PROGRESS
// ============================================================

export async function getMyPromoProgress(): Promise<
  PromoProgress[]
> {

  const response =
    await api.get<PromoProgress[]>(
      '/promos/my-progress',
    );

  return response.data;
}


// ============================================================
// MY REWARDS
// ============================================================

export async function getMyRewards(): Promise<
  PromoReward[]
> {

  const response =
    await api.get<PromoReward[]>(
      '/promos/my-rewards',
    );

  return response.data;
}


// ============================================================
// CHECK JOIN STATUS
// ============================================================

export interface PromoStatus {

  promoId: string;

  joined: boolean;

  [key: string]: unknown;
}


export async function getPromoStatus(
  promoId: string,
): Promise<PromoStatus> {

  const response =
    await api.get<PromoStatus>(
      `/promos/${promoId}/status`,
    );

  return response.data;
}