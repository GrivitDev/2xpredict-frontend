import type { NotificationCategory, UpdateNotificationPreferencesPayload } from '../notifications';
export interface ListNotificationsQuery { page?: number; limit?: number; category?: NotificationCategory; unreadOnly?: boolean }
export interface ListNotificationsArgs { query?: ListNotificationsQuery }
export interface MarkNotificationReadArgs { path: { id: string } }
export interface UpdateNotificationPreferencesArgs { body: UpdateNotificationPreferencesPayload }
