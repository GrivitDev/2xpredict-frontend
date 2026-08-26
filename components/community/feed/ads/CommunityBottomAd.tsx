'use client';

import { memo } from 'react';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';

import {
  getCommunityBottomAd,
} from './CommunityAdEngine';

const CommunityBottomAd = memo(
  function CommunityBottomAd() {
    const ad =
      getCommunityBottomAd();

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

CommunityBottomAd.displayName =
  'CommunityBottomAd';

export default CommunityBottomAd;