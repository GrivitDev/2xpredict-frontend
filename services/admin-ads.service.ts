import api from '@/lib/axios';


import {
  AdminAd,
  CreateAdPayload,
  UpdateAdPayload,
  AdAnalytics,
} from '@/types/ad';





// ======================================
// GET ALL ADS
// ======================================

export async function getAds():Promise<AdminAd[]>{

  const response =
    await api.get(
      '/admin/ads',
    );


  return response.data;

}






// ======================================
// GET SINGLE AD
// ======================================

export async function getAd(
  id:string,
):Promise<AdminAd>{


  const response =
    await api.get(
      `/admin/ads/${id}`,
    );


  return response.data;

}






// ======================================
// CREATE AD
// ======================================

export async function createAd(
  data:CreateAdPayload,
):Promise<AdminAd>{


  const response =
    await api.post(
      '/admin/ads',
      data,
    );


  return response.data;

}







// ======================================
// UPDATE AD
// ======================================

export async function updateAd(
  id:string,

  data:UpdateAdPayload,
):Promise<AdminAd>{


  const response =
    await api.patch(
      `/admin/ads/${id}`,

      data,
    );


  return response.data;

}







// ======================================
// DELETE AD
// ======================================

export async function deleteAd(
  id:string,
):Promise<{
  message:string;
}>{

  const response =
    await api.delete(
      `/admin/ads/${id}`,
    );


  return response.data;

}








// ======================================
// TOGGLE ACTIVE STATUS
// ======================================

export async function toggleAd(
  id:string,
):Promise<{
  message:string;
  isActive:boolean;
}>{

  const response =
    await api.patch(
      `/admin/ads/${id}/status`,
    );


  return response.data;

}








// ======================================
// ANALYTICS
// ======================================

export async function getAdAnalytics()
:Promise<AdAnalytics>{


  const response =
    await api.get(
      '/admin/ads/analytics/overview',
    );


  return response.data;

}