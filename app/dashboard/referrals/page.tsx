'use client';


import {
  PageHero,
} from '@/components/dashboard/shared/PageHero';


import {
  DashboardSection,
} from '@/components/dashboard/shared/DashboardSection';


import {
  SectionTitle,
} from '@/components/dashboard/shared/SectionTitle';


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



export default function ReferralDashboardPage() {


  return (

<div
  className="
    relative
    min-w-0
    max-w-full
    space-y-8
    overflow-x-hidden
    sm:space-y-10
  "
>


      {/* Ambient Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-80
          w-80
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />





      {/* HERO */}

      <PageHero

        title="Referral Center"

        description="
          Invite friends, grow the community,
          and earn rewards through successful referrals.
        "

      />








      {/* REFERRAL LINK */}

      <DashboardSection>


        <SectionTitle

          title="Your Referral Link"

          description="
            Share your unique link and start earning rewards.
          "

        />


        <ReferralLinkCard />


      </DashboardSection>










      {/* REFERRAL STATS */}

      <DashboardSection>


        <SectionTitle

          title="Referral Overview"

          description="
            Track your growth, conversions and rewards.
          "

        />


        <ReferralStatsCards />


      </DashboardSection>









      {/* CAMPAIGNS */}

        <div
          className="
            grid
            min-w-0
            gap-6
            xl:grid-cols-2
          "
        >


        <DashboardSection>


          <SectionTitle

            title="Available Campaigns"

            description="
              Join active reward campaigns.
            "

          />


          <AvailableCampaigns />


        </DashboardSection>








        <DashboardSection>


          <SectionTitle

            title="Active Campaigns"

            description="
              Monitor your ongoing campaigns.
            "

          />


          <ActiveCampaigns />


        </DashboardSection>


      </div>









      {/* ACTIVITY + REWARDS */}

        <div
          className="
            grid
            min-w-0
            gap-6
            xl:grid-cols-2
          "
        >


        <DashboardSection>


          <SectionTitle

            title="Referral Activity"

            description="
              Recent referral progress and milestones.
            "

          />


          <ReferralActivity />


        </DashboardSection>









        <DashboardSection>


          <SectionTitle

            title="Reward History"

            description="
              Rewards earned from your referrals.
            "

          />


          <RewardHistory />


        </DashboardSection>


      </div>




    </div>

  );

}