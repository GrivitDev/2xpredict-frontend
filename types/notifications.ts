import type { Pagination } from './common';

export type NotificationCategory =
  | 'ACCOUNT' | 'REFERRALS' | 'BONUSES' | 'PAYMENTS' | 'SUBSCRIPTIONS'
  | 'BET_LAB' | 'WALLET' | 'PROMOTIONS' | 'CUSTOMER_CARE' | 'SYSTEM';

export type NotificationType =
  | 'ACCOUNT_WELCOME' | 'ACCOUNT_EMAIL_VERIFIED' | 'ACCOUNT_EMAIL_CHANGED'
  | 'ACCOUNT_PASSWORD_CHANGED' | 'ACCOUNT_SECURITY_ALERT' | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_RESTORED' | 'REFERRAL_REGISTERED' | 'REFERRAL_SUBSCRIPTION'
  | 'REFERRAL_REWARD_RECEIVED' | 'REFERRAL_MILESTONE' | 'BONUS_POINTS_GRANTED'
  | 'BONUS_SUBSCRIPTION_GRANTED' | 'BONUS_REVOKED' | 'BONUS_EXPIRED'
  | 'PAYMENT_SUBMITTED' | 'PAYMENT_SUCCESSFUL' | 'PAYMENT_REJECTED'
  | 'SUBSCRIPTION_ACTIVATED' | 'SUBSCRIPTION_SCHEDULED' | 'SUBSCRIPTION_RENEWED'
  | 'SUBSCRIPTION_UPGRADED' | 'SUBSCRIPTION_EXPIRING' | 'SUBSCRIPTION_EXPIRED'
  | 'BET_LAB_TICKET_PLACED' | 'BET_LAB_TICKET_WON' | 'BET_LAB_TICKET_LOST'
  | 'BET_LAB_TICKET_VOIDED' | 'BET_LAB_TICKET_PARTIALLY_WON'
  | 'BET_LAB_TICKET_PARTIALLY_LOST' | 'BET_LAB_TICKET_SETTLED'
  | 'WALLET_CREDITED' | 'WALLET_DEBITED' | 'WALLET_ALLOWANCE_EXPIRED'
  | 'PROMOTION_JOINED' | 'PROMOTION_MILESTONE' | 'PROMOTION_REWARD_UNLOCKED'
  | 'PROMOTION_REWARD_GRANTED' | 'PROMOTION_COMPLETED' | 'SUPPORT_REPLY'
  | 'SUPPORT_TICKET_UPDATED' | 'SUPPORT_TICKET_RESOLVED' | 'SYSTEM_ANNOUNCEMENT';

export type NotificationVariant =
  | 'default' | 'info' | 'success' | 'warning' | 'danger' | 'promotion';

export type NotificationIcon =
  | 'user' | 'shield' | 'users' | 'gift' | 'wallet'
  | 'ticket' | 'trophy' | 'headset' | 'megaphone' | 'bell';

/** Stable display metadata shared by the inbox, bell and realtime payload. */
export interface NotificationPresentation {
  variant: NotificationVariant;
  icon: NotificationIcon;
  imageUrl: string | null;
  actionLabel: string | null;
}

export interface UserNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  presentation?: NotificationPresentation;
  data: Record<string, unknown>;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface UserNotificationsPage {
  items: UserNotification[];
  unreadCount: number;
  pagination: Pagination & { limit: number; pages: number };
}

export interface NotificationUnreadCountResponse { unreadCount: number }
export interface MarkAllNotificationsReadResponse { modifiedCount: number; readAt: string }

export type NotificationEmailCategories = Record<NotificationCategory, boolean>;
export interface NotificationPreferences {
  emailEnabled: boolean;
  emailCategories: NotificationEmailCategories;
  essentialCategoriesLocked: Array<'ACCOUNT' | 'PAYMENTS' | 'SUBSCRIPTIONS'>;
  note: string;
}
export interface UpdateNotificationPreferencesPayload {
  emailEnabled?: boolean;
  categories?: Partial<NotificationEmailCategories>;
}
export interface NotificationMonitorResponse {
  inApp: Record<string, unknown>;
  email: Record<string, unknown>;
  providerWebhooks: Record<string, unknown>;
  checkedAt: string;
}

/** Authenticated Socket.IO events emitted by the /user-notifications namespace. */
export interface NotificationSocketReadyEvent {
  connected: true;
  connectedAt: string;
}

export interface NotificationSocketReadEvent {
  notificationId: string;
  readAt: string;
}

export interface NotificationSocketReadAllEvent {
  readAt: string;
}

export interface NotificationSocketEvents {
  'notification:ready': NotificationSocketReadyEvent;
  'notification:new': UserNotification;
  'notification:read': NotificationSocketReadEvent;
  'notification:read-all': NotificationSocketReadAllEvent;
}

export type NotificationSocketEventName = keyof NotificationSocketEvents;
