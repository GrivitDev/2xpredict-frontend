'use client';

import { memo } from 'react';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';

import {
  getCommunityFeedAd,
} from './CommunityAdEngine';

const CommunityFeedAd = memo(
  function CommunityFeedAd() {
    const ad =
      getCommunityFeedAd();

    if (!ad.internal) {
      return null;
    }

    return (
      <InternalAds
        page={ad.page}
        position={ad.position}
      />
    );
  },
);

CommunityFeedAd.displayName =
  'CommunityFeedAd';

export default CommunityFeedAd;