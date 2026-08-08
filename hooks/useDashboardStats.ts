'use client';

import { useEffect, useState } from 'react';

import { userService } from '@/services/user.service';
import { subscriptionService } from '@/services/subscription.service';
import { paymentService } from '@/services/payment.service';
import { purchaseService } from '@/services/purchase.service';
import { getPredictions } from '@/services/prediction.service';
import { getReferralPromos } from '@/services/promos.service';



function getTopPredictions(
  predictions:any[],
){

  if(!predictions.length)
    return [];



  const today =
    new Date();


  today.setHours(
    0,
    0,
    0,
    0
  );



  let filtered =
    predictions.filter(
      (prediction)=>{

        const date =
          new Date(
            prediction.matchDate
          );


        date.setHours(
          0,
          0,
          0,
          0
        );


        return (
          date.getTime() ===
          today.getTime()
        );

      }
    );




  // If no matches today,
  // pick nearest upcoming matches

  if(!filtered.length){

    filtered =
      predictions
        .filter(
          (prediction)=>{

            const date =
              new Date(
                prediction.matchDate
              );


            return (
              date >= today
            );

          }
        )
        .sort(
          (a,b)=>
            new Date(
              a.matchDate
            ).getTime()
            -
            new Date(
              b.matchDate
            ).getTime()
        );

  }




  return filtered
    .sort(
      (a,b)=>
        Number(
          b.confidence || 0
        )
        -
        Number(
          a.confidence || 0
        )
    )
    .slice(0,3);

}





export function useDashboardStats() {


  const [loading,setLoading] =
    useState(true);



  const [user,setUser] =
    useState<any>(null);



  const [subscription,setSubscription] =
    useState<any>(null);



  const [payments,setPayments] =
    useState<any[]>([]);



  const [purchases,setPurchases] =
    useState<any[]>([]);



  const [predictions,setPredictions] =
    useState<any[]>([]);



  const [topPredictions,setTopPredictions] =
    useState<any[]>([]);



  const [availablePromos,setAvailablePromos] =
    useState<any[]>([]);



  const [error,setError] =
    useState<string | null>(null);




  useEffect(()=>{


    const fetchAll = async()=>{


      try{


        setLoading(true);



        const [
          userRes,
          subRes,
          payRes,
          purRes,
          predictionRes,
          promoRes,
        ] = await Promise.all([


          userService.getMe(),


          subscriptionService.getStatus(),


          paymentService.getMyPayments(),


          purchaseService.getMyPurchases(),


          getPredictions(),


          getReferralPromos(),


        ]);




        setUser(
          userRes
        );



        setSubscription(
          subRes.subscription
        );



        setPayments(
          payRes || []
        );



        setPurchases(
          purRes || []
        );



        setPredictions(
          predictionRes || []
        );



        setTopPredictions(
          getTopPredictions(
            predictionRes || []
          )
        );



        setAvailablePromos(
          promoRes || []
        );




      }catch(err:any){


        setError(
          err?.message ||
          'Failed to load dashboard'
        );


      }finally{


        setLoading(false);


      }


    };



    fetchAll();



  },[]);




  return {


    loading,


    error,


    user,


    subscription,


    payments,


    purchases,


    predictions,


    topPredictions,


    availablePromos,


  };


}