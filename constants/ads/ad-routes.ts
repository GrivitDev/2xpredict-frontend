import type { AdPage } from '@/types/ads';

/**
 * Default URL for each legacy ad-page key. Older route names deliberately map
 * to the current consolidated public pages rather than missing/admin pages.
 */
export const AD_ROUTES: Record<AdPage, string> = {
  HOME: '/',
  DASHBOARD: '/profile',
  PRICING: '/pricing',
  PREDICTIONS: '/predictions',
  ABOUT: '/',
  PURCHASES: '/profile#account-billing',
  SUBSCRIPTIONS: '/profile#account-billing',
  REFERRALS: '/profile#referrals',
  BET_LAB: '/bet-lab',
  PICK_CENTER: '/predictions',
  SLIP_CENTER: '/predictions',
  ODDS_CENTER: '/matches',
  BONUSES: '/profile#rewards',
  PROMOS: '/promos',
  WALLET: '/profile#wallet',
  REGISTER: '/register',
  LOGIN: '/login',
};
