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

        <p className="text-s text-muted-foreground">
          Referral growth and reward tracking
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <AnalyticsCard
          title="Total Referrals"
          icon={UserPlus}
          highlight
        >
          <p className="text-3xl font-bold">
            {referrals.totalReferrals.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Rewarded"
          icon={Gift}
        >
          <p className="text-3xl font-bold">
            {referrals.rewardedReferrals.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Pending Rewards"
          icon={Clock}
        >
          <p className="text-3xl font-bold">
            {referrals.pendingRewards.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}