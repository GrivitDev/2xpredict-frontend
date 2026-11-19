import { apiRequest } from '../lib/axios';
import type { ListNotificationsArgs, MarkNotificationReadArgs, UpdateNotificationPreferencesArgs } from '../types/endpoint-args/notifications';
import type { MarkAllNotificationsReadResponse, NotificationMonitorResponse, NotificationPreferences, NotificationUnreadCountResponse, UpdateNotificationPreferencesPayload, UserNotification, UserNotificationsPage } from '../types/notifications';

/** All browser-facing and admin-monitor routes in the Notifications NestJS module. */
export const notificationsService = {
  list: (args: ListNotificationsArgs = {}) => apiRequest<UserNotificationsPage>({ method: 'GET', path: '/notifications', query: args.query }),
  getUnreadCount: () => apiRequest<NotificationUnreadCountResponse>({ method: 'GET', path: '/notifications/unread-count' }),
  markAllAsRead: () => apiRequest<MarkAllNotificationsReadResponse>({ method: 'PATCH', path: '/notifications/read-all' }),
  markAsRead: (args: MarkNotificationReadArgs) => apiRequest<UserNotification>({ method: 'PATCH', path: '/notifications/:id/read', pathParams: args.path }),
  getPreferences: () => apiRequest<NotificationPreferences>({ method: 'GET', path: '/notifications/preferences' }),
  updatePreferences: (args: UpdateNotificationPreferencesArgs) => apiRequest<NotificationPreferences>({ method: 'PATCH', path: '/notifications/preferences', body: args.body }),
  getMonitor: () => apiRequest<NotificationMonitorResponse>({ method: 'GET', path: '/admin/notifications/monitor' }),
} as const;
