import api from '@/lib/axios';

import {
  Promo,
  CreatePromoPayload,
  UpdatePromoPayload,
} from '@/types/promo';

import {
  PromoReward,
} from '@/types/promo';


// =====================================
// GET PROMO REWARDS
// =====================================

export async function getPromoRewards(
  promoId:string,
):Promise<PromoReward[]> {


  const response =
    await api.get(
      `/promos/${promoId}/rewards`,
    );


  return response.data;

}
// =====================================
// GET ALL PROMOS
// =====================================

export async function getPromos(): Promise<Promo[]> {

  const response = await api.get('/promos');

  return response.data;

}



// =====================================
// CREATE PROMO
// =====================================

export async function createPromo(
  payload:CreatePromoPayload,
): Promise<Promo> {

  const response = await api.post(
    '/promos',
    payload,
  );

  return response.data;

}



// =====================================
// UPDATE PROMO
// =====================================

export async function updatePromo(
  id:string,
  payload:UpdatePromoPayload,
): Promise<Promo> {

  const response = await api.patch(
    `/promos/${id}`,
    payload,
  );

  return response.data;

}



// =====================================
// DEACTIVATE PROMO
// =====================================

export async function deactivatePromo(
  id:string,
): Promise<Promo> {

  const response = await api.patch(
    `/promos/${id}/deactivate`,
  );

  return response.data;

}



// =====================================
// GET SINGLE PROMO
// =====================================

export async function getPromo(
  id:string,
): Promise<Promo> {

  const response = await api.get(
    `/promos/${id}`,
  );

  return response.data;

}