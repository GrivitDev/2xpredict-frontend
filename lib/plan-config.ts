import api from '@/lib/axios';

import type {
  PlanConfig,
} from '@/types/plan-config';



export async function getPlanConfig(): Promise<PlanConfig> {

  const response = await api.get<PlanConfig>(
    '/plan-config',
  );


  return response.data;

}