'use client';

import {
  ReferralLinkCard,
} from '@/components/dashboard/referrals/ReferralLinkCard';

import {
  ReferralStatsCards,
} from '@/components/dashboard/referrals/ReferralStatsCards';

import {
  AvailableCampaigns,
} from '@/components/dashboard/referrals/AvailableCampaigns';

import {
  ActiveCampaigns,
} from '@/components/dashboard/referrals/ActiveCampaigns';

import {
  ReferralActivity,
} from '@/components/dashboard/referrals/ReferralActivity';

import {
  RewardHistory,
} from '@/components/dashboard/referrals/RewardHistory';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage, AdPosition } from '@/types/ad';


export default function ReferralDashboardPage() {

  return (

    <main
      className="
        relative
        min-w-0
        max-w-full
        space-y-5
        overflow-x-hidden
      "
    >

        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />
      {/* Referral Link */}

      <ReferralLinkCard />


      {/* Referral Stats */}

      <ReferralStatsCards />


      {/* Campaigns */}

 

        <AvailableCampaigns />

        <ActiveCampaigns />


      {/* Activity + Rewards */}


        <ReferralActivity />

        <RewardHistory />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.BOTTOM}
      />

      <InternalAds
        page={AdPage.HOME}
        position={AdPosition.POPUP}
      />
    </main>

  );

}