'use client';

import { useEffect, useState } from 'react';

import type { PlanConfig } from '@/types/plan-config';

import { getPlanConfig } from '@/lib/plan-config';



export function usePlanConfig(){

  const [config,setConfig] =
    useState<PlanConfig | null>(null);


  const [loading,setLoading] =
    useState(true);



  useEffect(()=>{

    async function fetchConfig(){

      try{

        const data =
          await getPlanConfig();

        setConfig(data);

      }finally{

        setLoading(false);

      }

    }


    fetchConfig();

  },[]);



  return {

    config,

    loading,

  };

}