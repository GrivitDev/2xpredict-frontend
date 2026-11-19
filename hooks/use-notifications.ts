'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiMutationHookOptions, ApiQueryHookOptions } from '../types/common';
import { notificationsService } from '../services/notifications.service';
import type { ListNotificationsArgs, MarkNotificationReadArgs } from '../types/endpoint-args/notifications';
import type {
  MarkAllNotificationsReadResponse, NotificationMonitorResponse, NotificationPreferences,
  NotificationUnreadCountResponse, UserNotification, UserNotificationsPage,
  UpdateNotificationPreferencesPayload,
} from '../types/notifications';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  list: (args?: ListNotificationsArgs) => args
    ? ['notifications', 'list', args] as const
    : ['notifications', 'list'] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
  preferences: () => ['notifications', 'preferences'] as const,
  monitor: () => ['notifications', 'admin', 'monitor'] as const,
};
export function useNotificationsQuery(args?: ListNotificationsArgs, options?: ApiQueryHookOptions<UserNotificationsPage>) {
  return useQuery({ queryKey: notificationQueryKeys.list(args), queryFn: () => notificationsService.list(args), ...options });
}
export function useUnreadNotificationCountQuery(options?: ApiQueryHookOptions<NotificationUnreadCountResponse>) {
  return useQuery({ queryKey: notificationQueryKeys.unreadCount(), queryFn: notificationsService.getUnreadCount, refetchInterval: 60_000, ...options });
}
export function useNotificationPreferencesQuery(options?: ApiQueryHookOptions<NotificationPreferences>) {
  return useQuery({ queryKey: notificationQueryKeys.preferences(), queryFn: notificationsService.getPreferences, ...options });
}
export function useNotificationsMonitorQuery(options?: ApiQueryHookOptions<NotificationMonitorResponse>) {
  return useQuery({ queryKey: notificationQueryKeys.monitor(), queryFn: notificationsService.getMonitor, staleTime: 15_000, refetchInterval: 30_000, ...options });
}
export function useMarkNotificationReadMutation(options?: ApiMutationHookOptions<UserNotification, MarkNotificationReadArgs>) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (args: MarkNotificationReadArgs) => notificationsService.markAsRead(args), ...options, onSuccess: async (data, vars, onMutateResult, context) => { await Promise.all([client.invalidateQueries({ queryKey: notificationQueryKeys.list() }), client.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() })]); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useMarkAllNotificationsReadMutation(options?: ApiMutationHookOptions<MarkAllNotificationsReadResponse, void>) {
  const client = useQueryClient();
  return useMutation({ mutationFn: notificationsService.markAllAsRead, ...options, onSuccess: async (data, vars, onMutateResult, context) => { await Promise.all([client.invalidateQueries({ queryKey: notificationQueryKeys.list() }), client.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() })]); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
export function useUpdateNotificationPreferencesMutation(options?: ApiMutationHookOptions<NotificationPreferences, UpdateNotificationPreferencesPayload>) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: UpdateNotificationPreferencesPayload) => notificationsService.updatePreferences({ body }), ...options, onSuccess: async (data, vars, onMutateResult, context) => { client.setQueryData(notificationQueryKeys.preferences(), data); await options?.onSuccess?.(data, vars, onMutateResult, context); } });
}
