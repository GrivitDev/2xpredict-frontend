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

export function getCommunityFeedAd():

  CommunityAdDecision {

  const roll =
    Math.random() * 100;

  // External Inline

  if (roll < 55) {

    return {

      internal: false,

      page: AdPage.HOME,

      position: AdPosition.INLINE,

    };

  }

  // External Hero

  if (roll < 75) {

    return {

      internal: false,

      page: AdPage.HOME,

      position: AdPosition.HERO,

    };

  }

  // Internal Inline

  if (roll < 95) {

    return {

      internal: true,

      page: AdPage.HOME,

      position: AdPosition.INLINE,

    };

  }

  // Internal Hero

  return {

    internal: true,

    page: AdPage.HOME,

    position: AdPosition.HERO,

  };

}

export function getCommunityBottomAd():

  CommunityAdDecision {

  const roll =
    Math.random() * 100;

  // 90% External Bottom

  if (roll < 90) {

    return {

      internal: false,

      page: AdPage.HOME,

      position: AdPosition.BOTTOM,

    };

  }

  // 10% Internal Bottom

  return {

    internal: true,

    page: AdPage.HOME,

    position: AdPosition.BOTTOM,

  };

}