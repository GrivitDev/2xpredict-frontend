'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '../services/admin-users.service';
import type { AdminUserQueryDto } from '../types/endpoint-args/admin-users';
import type { LimitPageResult } from '../types/common';
import type { Payment } from '../types/payments';
import type { Subscription } from '../types/subscriptions';

export function useAdminUsers(query: AdminUserQueryDto) {
  const result = useQuery({
    queryKey: ['admin-users', query],
    queryFn: () => adminUsersService.getUsers<any>(query),
    placeholderData: (previous) => previous,
  });
  const payload: any = result.data ?? {};
  return {
    ...result,
    users: Array.isArray(payload.users) ? payload.users : [],
    total: Number(payload.total ?? 0),
    totalPages: Math.max(1, Number(payload.totalPages ?? 1)),
    loading: result.isLoading,
  };
}

export function useUserDetails(id: string) {
  const result = useQuery({
    queryKey: ['admin-user-details', id],
    queryFn: () => adminUsersService.getUserDetails<any>(id),
    enabled: Boolean(id),
  });
  return {
    ...result,
    user: result.data ?? null,
    loading: result.isLoading,
    refetch: result.refetch,
  };
}

export function useUserActions(id: string, onSuccess?: () => unknown) {
  const client = useQueryClient();
  const run = (fn: () => Promise<any>) => fn().then((result) => {
    void client.invalidateQueries({ queryKey: ['admin-user-details', id] });
    void client.invalidateQueries({ queryKey: ['admin-users'] });
    onSuccess?.();
    return result;
  });
  return {
    suspend: (reason = 'Manual suspension') => run(() => adminUsersService.suspend(id, { reason })),
    activate: () => run(() => adminUsersService.activate(id)),
    remove: () => run(() => adminUsersService.remove(id)),
    forceLogoutAllDevices: () => run(() => adminUsersService.logoutAll(id)),
    revokeSession: (sessionId: string) => run(() => adminUsersService.revokeSession(id, sessionId)),
  };
}


/** Additional read endpoints exposed by AdminUsersController. */
export function useAdminUserPayments(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery<LimitPageResult<Payment>>({ queryKey: ['admin-user-payments', id, query], queryFn: () => adminUsersService.getPaymentHistory(id, query), enabled: Boolean(id), placeholderData: (previous) => previous });
}
export function useAdminUserSubscriptions(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery<LimitPageResult<Subscription>>({ queryKey: ['admin-user-subscriptions', id, query], queryFn: () => adminUsersService.getSubscriptionHistory(id, query), enabled: Boolean(id), placeholderData: (previous) => previous });
}
export function useAdminUserBetLabTickets(id: string, query: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({ queryKey: ['admin-user-bet-lab-tickets', id, query], queryFn: () => adminUsersService.getBetLabTickets(id, query), enabled: Boolean(id) });
}
export function useAdminUserBetLabLedger(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ['admin-user-bet-lab-ledger', id, query], queryFn: () => adminUsersService.getBetLabLedger(id, query), enabled: Boolean(id) });
}
export function useAdminUserReferrals(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ['admin-user-referrals', id, query], queryFn: () => adminUsersService.getReferrals(id, query), enabled: Boolean(id) });
}
export function useAdminUserPromotionRewards(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ['admin-user-promotion-rewards', id, query], queryFn: () => adminUsersService.getPromotionRewards(id, query), enabled: Boolean(id) });
}
export function useAdminUserBonuses(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ['admin-user-bonuses', id, query], queryFn: () => adminUsersService.getBonuses(id, query), enabled: Boolean(id) });
}
export function useAdminUserAuditHistory(id: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: ['admin-user-audit', id, query], queryFn: () => adminUsersService.getAuditHistory(id, query), enabled: Boolean(id) });
}
export function useAdminUserSessions(id: string) {
  return useQuery({ queryKey: ['admin-user-sessions', id], queryFn: () => adminUsersService.getUserSessions(id), enabled: Boolean(id) });
}
