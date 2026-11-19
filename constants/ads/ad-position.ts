import type { AdPosition as AdPositionValue } from '@/types/ads';
export const AdPosition = { POPUP:'POPUP', HERO:'HERO', TOP_BANNER:'TOP_BANNER', INLINE:'INLINE', SIDEBAR_LEFT:'SIDEBAR_LEFT', SIDEBAR_RIGHT:'SIDEBAR_RIGHT', BOTTOM:'BOTTOM', FOOTER:'FOOTER', INTERSTITIAL:'INTERSTITIAL', STICKY_BOTTOM:'STICKY_BOTTOM', STICKY_TOP:'STICKY_TOP', FEED:'FEED' } as const satisfies Record<string, AdPositionValue>;
export type { AdPosition as AdPositionType } from '@/types/ads';

