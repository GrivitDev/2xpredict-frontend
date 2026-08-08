'use client';

import { memo } from 'react';

import {InternalAds} from '@/components/ads/IntAds/InternalAds';
// import ExternalAds from '@/components/ads/ExternalAds';

import {
  getCommunityBottomAd,
} from './CommunityAdEngine';

export default memo(
  function CommunityBottomAd() {

    const ad =
      getCommunityBottomAd();

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