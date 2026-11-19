import { apiRequest } from '../lib/axios';
import type { GetMyBonusesArgs } from '../types/endpoint-args/bonuses';
import type {
  GetBulkGrantJobArgs, GrantPointsArgs, GrantPointsToAllArgs,
  GrantSubscriptionArgs, GrantSubscriptionToAllArgs, ListArgs,
  ListBonusRecipientsArgs, ListBulkGrantJobsArgs, RevokeArgs,
} from '../types/endpoint-args/bonuses';

/** Single client for public and admin endpoints in the Bonuses NestJS module. */
export const bonusesService = {
  getMyBonuses: <TResponse = unknown>(args?: GetMyBonusesArgs) =>
    apiRequest<TResponse>({ method: 'GET', path: '/bonuses/my', query: args?.query }),
  listRecipients: <TResponse = unknown>(args?: ListBonusRecipientsArgs) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/bonuses/recipients', query: args?.query }),
  grantPoints: <TResponse = unknown>(args: GrantPointsArgs) =>
    apiRequest<TResponse>({ method: 'POST', path: '/admin/bonuses/points', body: args.body }),
  grantSubscription: <TResponse = unknown>(args: GrantSubscriptionArgs) =>
    apiRequest<TResponse>({ method: 'POST', path: '/admin/bonuses/subscription', body: args.body }),
  grantPointsToAll: <TResponse = unknown>(args: GrantPointsToAllArgs) =>
    apiRequest<TResponse>({ method: 'POST', path: '/admin/bonuses/points/all', body: args.body }),
  grantSubscriptionToAll: <TResponse = unknown>(args: GrantSubscriptionToAllArgs) =>
    apiRequest<TResponse>({ method: 'POST', path: '/admin/bonuses/subscription/all', body: args.body }),
  listBulkGrantJobs: <TResponse = unknown>(args?: ListBulkGrantJobsArgs) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/bonuses/bulk-jobs', query: args?.query }),
  getBulkGrantJob: <TResponse = unknown>(args: GetBulkGrantJobArgs) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/bonuses/bulk-jobs/:id', pathParams: args.path }),
  list: <TResponse = unknown>(args?: ListArgs) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/bonuses', query: args?.query }),
  revoke: <TResponse = unknown>(args: RevokeArgs) =>
    apiRequest<TResponse>({ method: 'PATCH', path: '/admin/bonuses/:id/revoke', pathParams: args.path, body: args.body }),
} as const;

/** Temporary alias retained until Stage 1E migrates the admin hook imports. */
export const bonusesAdminService = bonusesService;
