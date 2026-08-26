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
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Referral Program
        </h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Referral growth and reward tracking.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-3
        "
      >
        <AnalyticsCard
          title="Total Referrals"
          icon={UserPlus}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight">
            {referrals.totalReferrals.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Rewarded"
          icon={Gift}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {referrals.rewardedReferrals.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Pending Rewards"
          icon={Clock}
        >
          <p className="text-2xl font-semibold tracking-tight">
            {referrals.pendingRewards.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}