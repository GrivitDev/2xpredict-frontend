'use client';


import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';




import {
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  toggleAd,
  getAdAnalytics,
} from '@/services/admin-ads.service';




import {
  getPageAds,
  getExternalAdPolicy,
  recordAdImpression,
  recordAdClick,
} from '@/services/ads.service';




import {
  CreateAdPayload,
  UpdateAdPayload,
} from '@/types/ad';




import { AdPage } from '@/constants/ads/ad-page';
import { AdDevice } from '@/constants/ads/ad-device';









// ======================================
// ADMIN ADS
// ======================================



export function useAds(){


  return useQuery({

    queryKey:[
      'admin-ads',
    ],

    queryFn:getAds,

  });


}








export function useAd(
  id:string,
){


  return useQuery({

    queryKey:[
      'admin-ad',
      id,
    ],

    queryFn:()=>getAd(id),

    enabled:Boolean(id),

  });


}









export function useCreateAd(){


  const queryClient =
    useQueryClient();



  return useMutation({

    mutationFn:(
      data:CreateAdPayload,
    )=>createAd(data),



    onSuccess:()=>{


      queryClient.invalidateQueries({

        queryKey:[
          'admin-ads',
        ],

      });


      queryClient.invalidateQueries({

        queryKey:[
          'ad-analytics',
        ],

      });


    },

  });


}









export function useUpdateAd(){


  const queryClient =
    useQueryClient();



  return useMutation({

    mutationFn:({

      id,

      data,

    }:{
      id:string;

      data:UpdateAdPayload;

    })=>updateAd(
      id,
      data,
    ),





    onSuccess:(_,variables)=>{


      queryClient.invalidateQueries({

        queryKey:[
          'admin-ads',
        ],

      });



      queryClient.invalidateQueries({

        queryKey:[
          'admin-ad',
          variables.id,
        ],

      });


    },

  });


}









export function useDeleteAd(){


  const queryClient =
    useQueryClient();



  return useMutation({

    mutationFn:deleteAd,


    onSuccess:()=>{


      queryClient.invalidateQueries({

        queryKey:[
          'admin-ads',
        ],

      });


    },

  });


}









export function useToggleAd(){


  const queryClient =
    useQueryClient();



  return useMutation({

    mutationFn:toggleAd,


    onSuccess:()=>{


      queryClient.invalidateQueries({

        queryKey:[
          'admin-ads',
        ],

      });


    },

  });


}









export function useAdAnalytics(){


  return useQuery({

    queryKey:[
      'ad-analytics',
    ],


    queryFn:getAdAnalytics,


  });


}









// ======================================
// PUBLIC ADS
// ======================================



export function usePageAds(

  page:AdPage,

  device:AdDevice,

){


  return useQuery({

    queryKey:[
      'page-ads',
      page,
      device,
    ],



    queryFn:()=>getPageAds(

      page,

      device,

    ),


  });


}









export function useExternalAdPolicy(){


  return useQuery({

    queryKey:[
      'external-ad-policy',
    ],


    queryFn:getExternalAdPolicy,


  });


}









export function useRecordAdImpression(){


  return useMutation({

    mutationFn:recordAdImpression,

  });


}








export function useRecordAdClick(){


  return useMutation({

    mutationFn:recordAdClick,

  });


}