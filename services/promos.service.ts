import api from '@/lib/axios';


// =================================
// ACTIVE REFERRAL PROMOS
// =================================

export async function getReferralPromos(){

  const response =
    await api.get(
      '/promos/active/referral',
    );


  return response.data;

}



// =================================
// JOIN PROMO
// =================================

export async function joinPromo(
  promoId:string,
){

  const response =
    await api.post(
      `/promos/${promoId}/join`,
    );


  return response.data;

}



// =================================
// MY PROMO PROGRESS
// =================================

export async function getMyPromoProgress(){

  const response =
    await api.get(
      '/promos/my-progress',
    );


  return response.data;

}

// =================================
// MY REWARDS
// =================================

export async function getMyRewards(){

  const response =
    await api.get(
      '/promos/my-rewards',
    );


  return response.data;

}

// =================================
// CHECK JOIN STATUS
// =================================

export async function getPromoStatus(
  promoId:string,
){

  const response =
    await api.get(
      `/promos/${promoId}/status`,
    );


  return response.data;

}