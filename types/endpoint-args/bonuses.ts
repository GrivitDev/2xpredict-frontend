import type { BonusQueryDto, BulkGrantPointsBonusDto, BulkGrantSubscriptionBonusDto, GrantPointsBonusDto, GrantSubscriptionBonusDto, RevokeBonusDto } from '../requests';
export type BonusRecipientPlan = 'free' | 'regular' | 'vip' | 'premium';
export type BulkPointsRequest = BulkGrantPointsBonusDto & { userIds?: string[]; recipientPlan?: BonusRecipientPlan };
export type BulkSubscriptionRequest = BulkGrantSubscriptionBonusDto & { userIds?: string[]; recipientPlan?: BonusRecipientPlan };
export interface GetMyBonusesQuery { page?: string; limit?: string }
export interface GetMyBonusesArgs { query?: GetMyBonusesQuery }
export interface ListBulkGrantJobsQuery { limit?: string }
export interface ListBonusRecipientsQuery { page?: number; limit?: number; search?: string; plan?: BonusRecipientPlan }
export interface GrantPointsArgs { body: GrantPointsBonusDto }
export interface GrantSubscriptionArgs { body: GrantSubscriptionBonusDto }
export interface GrantPointsToAllArgs { body: BulkPointsRequest }
export interface GrantSubscriptionToAllArgs { body: BulkSubscriptionRequest }
export interface ListBulkGrantJobsArgs { query?: ListBulkGrantJobsQuery }
export interface GetBulkGrantJobArgs { path: { id: string } }
export interface ListBonusRecipientsArgs { query?: ListBonusRecipientsQuery }
export interface ListArgs { query?: BonusQueryDto }
export interface RevokeArgs { path: { id: string }; body: RevokeBonusDto }
