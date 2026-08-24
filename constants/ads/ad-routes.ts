import {
  AdPage,
} from './ad-page';


// ============================================================
// AD ROUTES
// ============================================================

export const AD_ROUTES = {

  [AdPage.HOME]:
    '/',

  [AdPage.DASHBOARD]:
    '/dashboard',

  [AdPage.PRICING]:
    '/pricing',

  [AdPage.PREDICTIONS]:
    '/predictions',

  [AdPage.COMMUNITY]:
    '/community',

  [AdPage.ABOUT]:
    '/about',

  [AdPage.PURCHASES]:
    '/dashboard/purchases',

  [AdPage.SUBSCRIPTIONS]:
    '/dashboard/subscriptions',

  [AdPage.REFFERALS]:
    '/dashboard/referrals',

} as const;