'use client';

import { memo } from 'react';

// import { ExternalAds } from '@/components/ads/ExtAds/ExternalAds';
import {InternalAds} from '@/components/ads/IntAds/InternalAds';

import {
  getCommunityFeedAd,
} from './CommunityAdEngine';

export default memo(
  function CommunityFeedAd() {

    const ad =
      getCommunityFeedAd();

    if (ad.internal) {

      return (

        <InternalAds
          page={ad.page}
          position={ad.position}
        />

      );

    }

    // return (

    //   <ExternalAds
    //     page={ad.page}
    //     position={ad.position}
    //   />

    // );

  },
);