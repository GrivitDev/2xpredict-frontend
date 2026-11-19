/** Admin-only client for backend/src/admin-users/admin-users.controller.ts. */
import { apiRequest } from '../lib/axios';
import type {
  AdminUserQueryDto,
  SuspendUserDto,
} from '../types/endpoint-args/admin-users';
import type { LimitPageResult } from '../types/common';
import type { Payment } from '../types/payments';
import type { Subscription } from '../types/subscriptions';

export const adminUsersService = {
  getUsers: <TResponse = unknown>(query: AdminUserQueryDto = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users', query }),

  getUserDetails: <TResponse = unknown>(id: string) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/details', pathParams: { id } }),

  getPaymentHistory: (id: string, query: Pick<AdminUserQueryDto, 'page' | 'limit'> = {}) =>
    apiRequest<LimitPageResult<Payment>>({ method: 'GET', path: '/admin/users/:id/payments', pathParams: { id }, query }),

  getSubscriptionHistory: (id: string, query: Pick<AdminUserQueryDto, 'page' | 'limit'> = {}) =>
    apiRequest<LimitPageResult<Subscription>>({ method: 'GET', path: '/admin/users/:id/subscriptions', pathParams: { id }, query }),

  getBetLabTickets: <TResponse = unknown>(id: string, query: { page?: number; limit?: number; status?: string } = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/bet-lab/tickets', pathParams: { id }, query }),

  getBetLabLedger: <TResponse = unknown>(id: string, query: { page?: number; limit?: number } = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/bet-lab/ledger', pathParams: { id }, query }),

  getReferrals: <TResponse = unknown>(id: string, query: { page?: number; limit?: number } = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/referrals', pathParams: { id }, query }),

  getPromotionRewards: <TResponse = unknown>(id: string, query: { page?: number; limit?: number } = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/promotions/rewards', pathParams: { id }, query }),

  getBonuses: <TResponse = unknown>(id: string, query: { page?: number; limit?: number } = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/bonuses', pathParams: { id }, query }),

  getAuditHistory: <TResponse = unknown>(id: string, query: { page?: number; limit?: number } = {}) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/audit', pathParams: { id }, query }),

  suspend: <TResponse = unknown>(id: string, body: SuspendUserDto) =>
    apiRequest<TResponse>({ method: 'PATCH', path: '/admin/users/:id/suspend', pathParams: { id }, body }),

  activate: <TResponse = unknown>(id: string) =>
    apiRequest<TResponse>({ method: 'PATCH', path: '/admin/users/:id/activate', pathParams: { id } }),

  remove: <TResponse = unknown>(id: string) =>
    apiRequest<TResponse>({ method: 'PATCH', path: '/admin/users/:id/delete', pathParams: { id } }),

  logoutAll: <TResponse = unknown>(id: string) =>
    apiRequest<TResponse>({ method: 'PATCH', path: '/admin/users/:id/logout-all', pathParams: { id } }),

  getUserSessions: <TResponse = unknown>(id: string) =>
    apiRequest<TResponse>({ method: 'GET', path: '/admin/users/:id/sessions', pathParams: { id } }),

  revokeSession: <TResponse = unknown>(id: string, sessionId: string) =>
    apiRequest<TResponse>({ method: 'PATCH', path: '/admin/users/:id/sessions/:sessionId/revoke', pathParams: { id, sessionId } }),
} as const;
