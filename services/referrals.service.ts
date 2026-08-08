import api from '@/lib/axios';


export async function getMyReferralLink(){

  const response = await api.get(
    '/referrals/my-link',
  );

  return response.data;

}



export async function getMyReferrals(){

  const response = await api.get(
    '/referrals/my-referrals',
  );

  return response.data;

}



export async function getReferralStats(){

  const response = await api.get(
    '/referrals/stats',
  );

  return response.data;

}