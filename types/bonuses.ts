import type { IdRecord } from '@/types/common';
export type BonusType = 'BET_LAB_POINTS' | 'SUBSCRIPTION';
export type BonusStatus = 'PENDING' | 'GRANTED' | 'REVOKED' | 'EXPIRED';
export type BonusPlan = 'regular' | 'vip' | 'premium';
export type BonusRecipientPlan = 'free' | 'regular' | 'vip' | 'premium';
export interface BonusGrant extends IdRecord {
  userId: string; grantedBy: string; type: BonusType; status: BonusStatus; reason: string;
  points?: number; plan?: BonusPlan; durationDays?: number; startsAt: string; expiresAt?: string | null;
  idempotencyKey?: string; revokedAt?: string | null; revokedBy?: string; revocationReason?: string;
}
export interface GrantPointsBonusPayload { userId: string; points: number; reason: string; idempotencyKey: string }
export interface GrantSubscriptionBonusPayload { userId: string; plan: BonusPlan; durationDays: number; reason: string; idempotencyKey: string; startsAt?: string }
export interface BulkGrantPointsBonusPayload { points: number; reason: string; idempotencyKey: string; userIds?: string[]; recipientPlan?: BonusRecipientPlan }
export interface BulkGrantSubscriptionBonusPayload { plan: BonusPlan; durationDays: number; reason: string; idempotencyKey: string; startsAt?: string; userIds?: string[]; recipientPlan?: BonusRecipientPlan }
export interface BonusListQuery { userId?: string; type?: BonusType; status?: BonusStatus | 'EXPIRED'; page?: number; limit?: number }
export interface BonusBulkGrantJob extends IdRecord {
  type: BonusType;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | string;
  grantedBy: string;
  reason: string;
  points?: number;
  plan?: BonusPlan;
  durationDays?: number;
  startsAt: string;
  scheduledStart: boolean;
  expiresAt?: string | null;
  throughUserId?: string | null;
  recipientIds?: string[];
  recipientPlan?: BonusRecipientPlan | null;
  recipientCursor?: number;
  lastUserId?: string | null;
  totalUsers: number;
  processedUsers: number;
  grantedCount: number;
  failedCount: number;
  recentErrors: string[];
  startedAt?: string | null;
  completedAt?: string | null;
  progressPercent: number;
  [key: string]: unknown;
}
export interface BonusGrantPage {
  items: BonusGrant[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
