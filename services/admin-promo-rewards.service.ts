import api from '@/lib/axios';


export const getAllClaimedRewards = async()=>{

  const res = await api.get(
    '/promos/admin/claimed-rewards',
  );

  return res.data;

};



export const getPendingCashRewards = async()=>{

  const res = await api.get(
    '/promos/admin/pending-cash',
  );

  return res.data;

};



// ==========================
// MARK CASH REWARD AS PAID
// ==========================

export const markCashRewardPaid = async(
  rewardId:string,
)=>{

  const res = await api.patch(
    `/promos/rewards/${rewardId}/pay`,
  );

  return res.data;

};