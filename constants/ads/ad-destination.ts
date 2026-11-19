import type { AdContentSource } from '@/types/ads';

/**
 * Safe public destinations shared by ad previews and automatically generated
 * ad actions. These are real public routes; admin-only URLs are never used.
 */
export function adDestinationFor(source: AdContentSource, sourceId?: string): string {
  const id = sourceId ? encodeURIComponent(sourceId) : undefined;

  switch (source) {
    case 'PREDICTION':
      return '/predictions';
    case 'SLIP':
    case 'SURE_ODDS':
      // There is no separate public slip-centre page in the current route tree.
      return '/predictions';
    case 'PROMO':
      return id ? `/promos?promoId=${id}` : '/promos';
    case 'BONUS':
      return '/profile#rewards';
    case 'REFERRAL':
      return '/profile#referrals';
    case 'SUBSCRIPTION':
      return '/pricing';
    case 'BET_LAB':
      return '/bet-lab';
    case 'CUSTOM':
    default:
      return '/';
  }
}

export function adDefaultActionLabel(source: AdContentSource): string {
  switch (source) {
    case 'PREDICTION': return 'View Predictions';
    case 'SLIP': return 'View Predictions';
    case 'SURE_ODDS': return 'View Predictions';
    case 'PROMO': return 'View Promotion';
    case 'BONUS': return 'View Rewards';
    case 'REFERRAL': return 'View Referrals';
    case 'SUBSCRIPTION': return 'View Plans';
    case 'BET_LAB': return 'Explore Bet Lab';
    case 'CUSTOM':
    default: return 'Learn More';
  }
}
