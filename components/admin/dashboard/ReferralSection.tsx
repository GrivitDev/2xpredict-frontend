import AnalyticsCard from './AnalyticsCard';

import {
  UserPlus,
  Gift,
  Clock,
} from 'lucide-react';

import {
  AnalyticsReferrals,
} from '@/types/analytics.types';

interface Props {
  referrals: AnalyticsReferrals;
}

export default function ReferralSection({
  referrals,
}: Props) {

  return (

    <section className="space-y-6">

      <div>

        <h2 className="text-xl font-semibold">
          Referral Program
        </h2>

        <p className="text-sm text-muted-foreground">
          Referral growth and reward tracking
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-3">

        <AnalyticsCard
          title="Total Referrals"
          value={referrals.totalReferrals}
          icon={UserPlus}
          highlight
        />

        <AnalyticsCard
          title="Rewarded"
          value={referrals.rewardedReferrals}
          icon={Gift}
        />

        <AnalyticsCard
          title="Pending Rewards"
          value={referrals.pendingRewards}
          icon={Clock}
        />

      </div>

    </section>

  );

}