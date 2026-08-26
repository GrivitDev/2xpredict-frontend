import AnalyticsCard from './AnalyticsCard';

import {
  Users,
  CreditCard,
  Target,
  TrendingUp,
} from 'lucide-react';

import {
  AnalyticsUsers,
  AnalyticsRevenue,
  AnalyticsSubscriptions,
  AnalyticsPredictions,
} from '@/types/analytics.types';

interface Props {
  users: AnalyticsUsers;
  revenue: AnalyticsRevenue;
  subscriptions: AnalyticsSubscriptions;
  predictions: AnalyticsPredictions;
}

export default function AnalyticsOverview({
  users,
  revenue,
  subscriptions,
  predictions,
}: Props) {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-2
        lg:grid-cols-4
      "
    >
      <AnalyticsCard
        title="Total Users"
        icon={Users}
      >
        <p className="text-2xl font-semibold tracking-tight">
          {users.totalUsers.toLocaleString()}
        </p>

        <div
          className="
            mt-1
            flex
            flex-wrap
            gap-x-3
            gap-y-0.5
            text-[11px]
            text-muted-foreground
          "
        >
          <span>
            Active {users.activeUsers.toLocaleString()}
          </span>

          <span>
            Verified {users.verifiedUsers.toLocaleString()}
          </span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Revenue"
        icon={TrendingUp}
        highlight
      >
        <p className="text-2xl font-semibold tracking-tight">
          ₦{revenue.totalRevenue.NGN.toLocaleString()}
        </p>

        <div
          className="
            mt-1
            flex
            flex-wrap
            gap-x-3
            gap-y-0.5
            text-[11px]
            text-muted-foreground
          "
        >
          <span>
            ${revenue.totalRevenue.USD.toLocaleString()}
          </span>

          <span>
            {revenue.totalPayments.toLocaleString()} payments
          </span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Subscriptions"
        icon={CreditCard}
      >
        <p className="text-2xl font-semibold tracking-tight">
          {subscriptions.totalSubscriptions.toLocaleString()}
        </p>

        <div
          className="
            mt-1
            flex
            flex-wrap
            gap-x-3
            gap-y-0.5
            text-[11px]
            text-muted-foreground
          "
        >
          <span>
            VIP {subscriptions.vipSubscriptions.toLocaleString()}
          </span>

          <span>
            Regular {subscriptions.regularSubscriptions.toLocaleString()}
          </span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Predictions"
        icon={Target}
      >
        <p className="text-2xl font-semibold tracking-tight">
          {predictions.totalPredictions.toLocaleString()}
        </p>

        <div
          className="
            mt-1
            flex
            flex-wrap
            gap-x-3
            gap-y-0.5
            text-[11px]
            text-muted-foreground
          "
        >
          <span>
            Won {predictions.wonPredictions.toLocaleString()}
          </span>

          <span>
            Pending {predictions.pendingPredictions.toLocaleString()}
          </span>
        </div>
      </AnalyticsCard>
    </div>
  );
}