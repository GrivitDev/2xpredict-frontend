import type { CreatePromoPayload, PromoClaimPayload, UpdatePromoPayload } from '../promos';
export interface CreateArgs { body: CreatePromoPayload }
export interface FindOneArgs { path: { id: string } }
export interface UpdateArgs { path: { id: string }; body: UpdatePromoPayload }
export interface DeactivateArgs { path: { id: string } }
export interface GetJoinStatusArgs { path: { promoId: string } }
export interface JoinReferralCampaignArgs { path: { promoId: string } }
export interface GetPromoRewardsArgs { path: { promoId: string } }
export interface ClaimPromoArgs { body: PromoClaimPayload }
export interface GetPromotionAnalyticsArgs { query?: { promoId?: string } }
export interface ClaimPromoArgs { body: import('../promos').PromoClaimPayload }
export interface GetPromotionAnalyticsArgs { query?: { promoId?: string } }
