'use client';


import {
  useMemo,
  useState,
} from 'react';


import {
  useQuery,
} from '@tanstack/react-query';


import {
  getAdminReferrals,
  getAdminReferralStats,
} from '@/services/admin-referrals.service';


import ReferralStats from '@/components/admin/referrals/ReferralStats';

import ReferralTable from '@/components/admin/referrals/ReferralTable';

import ReferralFilters, {
  ReferralFilter,
} from '@/components/admin/referrals/ReferralFilters';


import {
  Skeleton,
} from '@/components/ui/skeleton';



export default function AdminReferralsPage(){


  const [
    filter,
    setFilter,
  ] = useState<ReferralFilter>('all');




  const {
    data:referrals = [],
    isLoading:loadingReferrals,

  } = useQuery({

    queryKey:[
      'admin-referrals',
    ],

    queryFn:getAdminReferrals,

  });





  const {
    data:stats,

    isLoading:loadingStats,

  } = useQuery({

    queryKey:[
      'admin-referral-stats',
    ],

    queryFn:getAdminReferralStats,

  });





  const filteredReferrals =
    useMemo(()=>{


      switch(filter){


        case 'registered':

          return referrals.filter(
            referral =>
              referral.registered,
          );



        case 'regular':

          return referrals.filter(
            referral =>
              referral.regularSubscription,
          );



        case 'vip':

          return referrals.filter(
            referral =>
              referral.vipSubscription,
          );



        case 'prediction':

          return referrals.filter(
            referral =>
              referral.predictionPurchased,
          );



        case 'reward':

          return referrals.filter(
            referral =>
              referral.rewardClaimed,
          );



        default:

          return referrals;


      }


    },[
      referrals,
      filter,
    ]);







  return (

    <div className="space-y-8">


      <div>


        <h1 className="text-3xl font-bold">

          Referral Management

        </h1>


        <p className="text-muted-foreground">

          Monitor referral performance, conversions, and rewards.

        </p>


      </div>





      {
        loadingStats
        ?

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

          {
            Array.from({
              length:7,
            }).map((_,index)=>(

              <Skeleton

                key={index}

                className="h-32"

              />

            ))
          }

        </div>


        :

        stats && (

          <ReferralStats

            stats={stats}

          />

        )

      }





      <div className="space-y-4">


        <ReferralFilters

          activeFilter={filter}

          onChange={setFilter}

        />



        {
          loadingReferrals

          ?

          <Skeleton className="h-[500px] w-full"/>


          :

          <ReferralTable

            referrals={filteredReferrals}

          />

        }



      </div>


    </div>

  );

}