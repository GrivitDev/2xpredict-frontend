'use client';

import { useEffect, useState } from 'react';

import { paymentService } from '@/services/payment.service';
import { subscriptionService } from '@/services/subscription.service';
import api from '@/lib/axios';


export function usePurchases(){

  const [loading,setLoading] =
    useState(true);


  const [payments,setPayments] =
    useState<any[]>([]);


  const [subscription,setSubscription] =
    useState<any>(null);


  const [plan,setPlan] =
    useState<'free' | 'regular' | 'vip'>('free');



  async function fetchData(){

    try{

      setLoading(true);


      const [
        paymentsRes,
        subscriptionRes,
      ] =
        await Promise.all([

          paymentService.getMyPayments(),

          subscriptionService.getStatus(),

        ]);



      setPayments(
        paymentsRes || [],
      );


      setSubscription(
        subscriptionRes.subscription,
      );


      setPlan(
        subscriptionRes.plan,
      );


    }finally{

      setLoading(false);

    }

  }

const initializePurchase = async (predictionId: string) => {
  try {
    setLoading(true);

    const response = await api.post(
      `/prediction-purchases/${predictionId}`,
    );

    return response.data;
  } finally {
    setLoading(false);
  }
};

  useEffect(()=>{

    fetchData();

  },[]);



  return {

    loading,

    payments,

    subscription,

    plan,

    refetch:fetchData,

    initializePurchase,

  };

}