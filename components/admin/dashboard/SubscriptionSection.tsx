import {
  CreditCard,
  Crown,
  Users,
  CheckCircle,
} from 'lucide-react';

import AnalyticsCard from './AnalyticsCard';

import {
  AnalyticsSubscriptions,
} from '@/types/analytics.types';

interface Props {
  subscriptions: AnalyticsSubscriptions;
}

export default function SubscriptionSection({
  subscriptions,
}: Props) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Subscription Analytics
        </h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Current and lifetime subscription activity.
        </p>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-4
        "
      >
        <AnalyticsCard
          title="Active Subscriptions"
          description="Currently active"
          icon={CheckCircle}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {subscriptions.activeSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="VIP Members"
          description="Active VIP users"
          icon={Crown}
          highlight
        >
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {subscriptions.activeVipSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Regular Members"
          description="Active regular users"
          icon={Users}
        >
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {subscriptions.activeRegularSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="All Subscriptions"
          description="Lifetime subscriptions"
          icon={CreditCard}
        >
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {subscriptions.totalSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}