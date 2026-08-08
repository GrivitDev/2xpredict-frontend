import {
  AdPage,
} from './ad-page';


export const AD_ROUTES = {

  [AdPage.HOME]: '/',

  [AdPage.DASHBOARD]: '/dashboard',

  [AdPage.LIVE_SCORES]: '/livescores',

  [AdPage.PREDICTIONS]: '/predictions',

  [AdPage.ARTICLES]: '/articles',

  [AdPage.ABOUT]: '/about',

  [AdPage.PAYMENTS]: '/payments',

} as const;