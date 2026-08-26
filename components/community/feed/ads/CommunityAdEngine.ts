import {
  AdPage,
  AdPosition,
} from '@/types/ad';

export interface CommunityAdDecision {
  internal: boolean;
  page: AdPage;
  position: AdPosition;
}

/**
 * Feed Ad Distribution
 *
 * External Inline  -> 55%
 * External Hero    -> 20%
 * Internal Inline  -> 20%
 * Internal Hero    -> 5%
 */
export function getCommunityFeedAd(): CommunityAdDecision {
  const roll = Math.random() * 100;

  if (roll < 55) {
    return {
      internal: false,
      page: AdPage.HOME,
      position: AdPosition.INLINE,
    };
  }

  if (roll < 75) {
    return {
      internal: false,
      page: AdPage.HOME,
      position: AdPosition.HERO,
    };
  }

  if (roll < 95) {
    return {
      internal: true,
      page: AdPage.HOME,
      position: AdPosition.INLINE,
    };
  }

  return {
    internal: true,
    page: AdPage.HOME,
    position: AdPosition.HERO,
  };
}

export function getCommunityBottomAd(): CommunityAdDecision {
  return Math.random() < 0.9
    ? {
        internal: false,
        page: AdPage.HOME,
        position: AdPosition.BOTTOM,
      }
    : {
        internal: true,
        page: AdPage.HOME,
        position: AdPosition.BOTTOM,
      };
}