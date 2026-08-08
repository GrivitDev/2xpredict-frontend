import api from '@/lib/axios';


import {
  AdminAd,
} from '@/types/ad';


import { AdPage, } from '@/constants/ads/ad-page';
import { AdDevice, } from '@/constants/ads/ad-device';





// ======================================
// EXTERNAL ADS POLICY RESPONSE
// ======================================

export interface ExternalAdPolicy {


  enabled:boolean;


  showInternalAds:boolean;


  frequency:string;


  aggressive:boolean;


  refreshInterval:number;


  allowPopup:boolean;


  allowInterstitial:boolean;


  allowRewarded:boolean;


}







// ======================================
// GET ADS FOR PAGE
// ======================================

export async function getPageAds(

  page:AdPage,

  device:AdDevice,

):Promise<AdminAd[]>{


  const response =
    await api.get(

      '/ads',

      {
        params:{
          page,

          device,
        },
      },

    );


  return response.data;

}








// ======================================
// GET EXTERNAL ADS POLICY
// ======================================

export async function getExternalAdPolicy()
:Promise<ExternalAdPolicy>{


  const response =
    await api.get(

      '/ads/policy',

    );


  return response.data;

}









// ======================================
// RECORD IMPRESSION
// ======================================

export async function recordAdImpression(

  id:string,

):Promise<{
  success:boolean;
}>{


  const response =
    await api.post(

      `/ads/${id}/impression`,

    );


  return response.data;

}









// ======================================
// RECORD CLICK
// ======================================

export async function recordAdClick(

  id:string,

):Promise<{
  success:boolean;
}>{


  const response =
    await api.post(

      `/ads/${id}/click`,

    );


  return response.data;

}