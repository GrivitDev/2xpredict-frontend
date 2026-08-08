import api from '@/lib/axios';


import {
  Referral,
  ReferralAdminStats,
} from '@/types/referral';



// =====================================
// GET ALL REFERRALS
// =====================================

export async function getAdminReferrals(){

  const response =
    await api.get<Referral[]>(
      '/referrals/admin/all',
    );


  return response.data;

}



// =====================================
// GET REFERRAL STATS
// =====================================

export async function getAdminReferralStats(){

  const response =
    await api.get<ReferralAdminStats>(
      '/referrals/admin/stats',
    );


  return response.data;

}