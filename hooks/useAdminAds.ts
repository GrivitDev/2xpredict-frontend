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
  CreateAdPayload,
  UpdateAdPayload,
} from '@/types/ad';


// ============================================================
// QUERY KEYS
// ============================================================

export const ADMIN_ADS_QUERY_KEY = [
  'admin',
  'ads',
] as const;

export const ADMIN_AD_ANALYTICS_QUERY_KEY = [
  'admin',
  'ads',
  'analytics',
] as const;


// ============================================================
// GET ALL ADMIN ADS
// ============================================================

export function useAdminAds() {

  return useQuery({

    queryKey: ADMIN_ADS_QUERY_KEY,

    queryFn: getAds,

  });

}


// ============================================================
// GET SINGLE ADMIN AD
// ============================================================

export function useAdminAd(
  id: string,
) {

  return useQuery({

    queryKey: [
      'admin-ad',
      id,
    ],

    queryFn: () => getAd(id),

    enabled: Boolean(id),

  });

}


// ============================================================
// CREATE ADMIN AD
// ============================================================

export function useCreateAd() {

  const queryClient =
    useQueryClient();


  return useMutation({

    mutationFn: (
      data: CreateAdPayload,
    ) => createAd(data),


    onSuccess: () => {

      queryClient.invalidateQueries({

        queryKey:
          ADMIN_ADS_QUERY_KEY,

      });


      queryClient.invalidateQueries({

        queryKey:
          ADMIN_AD_ANALYTICS_QUERY_KEY,

      });

    },

  });

}


// ============================================================
// UPDATE ADMIN AD
// ============================================================

export function useUpdateAd() {

  const queryClient =
    useQueryClient();


  return useMutation({

    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAdPayload;
    }) =>
      updateAd(
        id,
        data,
      ),


    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({

        queryKey:
          ADMIN_ADS_QUERY_KEY,

      });


      queryClient.invalidateQueries({

        queryKey: [
          'admin-ad',
          variables.id,
        ],

      });


      queryClient.invalidateQueries({

        queryKey:
          ADMIN_AD_ANALYTICS_QUERY_KEY,

      });

    },

  });

}


// ============================================================
// DELETE ADMIN AD
// ============================================================

export function useDeleteAd() {

  const queryClient =
    useQueryClient();


  return useMutation({

    mutationFn: deleteAd,


    onSuccess: () => {

      queryClient.invalidateQueries({

        queryKey:
          ADMIN_ADS_QUERY_KEY,

      });


      queryClient.invalidateQueries({

        queryKey:
          ADMIN_AD_ANALYTICS_QUERY_KEY,

      });

    },

  });

}


// ============================================================
// TOGGLE ADMIN AD
// ============================================================

export function useToggleAd() {

  const queryClient =
    useQueryClient();


  return useMutation({

    mutationFn: toggleAd,


    onSuccess: () => {

      queryClient.invalidateQueries({

        queryKey:
          ADMIN_ADS_QUERY_KEY,

      });


      queryClient.invalidateQueries({

        queryKey:
          ADMIN_AD_ANALYTICS_QUERY_KEY,

      });

    },

  });

}


// ============================================================
// ADMIN AD ANALYTICS
// ============================================================

export function useAdminAdAnalytics() {

  return useQuery({

    queryKey:
      ADMIN_AD_ANALYTICS_QUERY_KEY,

    queryFn:
      getAdAnalytics,

  });

}