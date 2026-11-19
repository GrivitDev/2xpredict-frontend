import { apiRequest } from '../lib/axios';
import type { UpdateArgs } from '../types/endpoint-args/plan-config';
import type { PlanConfig } from '../types/plan-config';

/** Client for the public/admin Plan Config NestJS module. */
export const planConfigService = {
  get: () =>
    apiRequest<PlanConfig>({ method: 'GET', path: '/plan-config' }),
  update: (args: UpdateArgs) =>
    apiRequest<PlanConfig>({ method: 'PATCH', path: '/plan-config', body: args.body }),
} as const;
