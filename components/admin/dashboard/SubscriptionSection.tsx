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
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          Subscription Analytics
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        <AnalyticsCard
          title="Active Subscriptions"
          description="Currently active plans"
          icon={CheckCircle}
          highlight
        >
          <p className="text-3xl font-bold">
            {subscriptions.activeSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="VIP Members"
          description="Active VIP users"
          icon={Crown}
          highlight
        >
          <p className="text-3xl font-bold">
            {subscriptions.activeVipSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="Regular Members"
          description="Active regular users"
          icon={Users}
        >
          <p className="text-3xl font-bold">
            {subscriptions.activeRegularSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>

        <AnalyticsCard
          title="All Subscriptions"
          description="Lifetime subscriptions"
          icon={CreditCard}
        >
          <p className="text-3xl font-bold">
            {subscriptions.totalSubscriptions.toLocaleString()}
          </p>
        </AnalyticsCard>
      </div>
    </section>
  );
}