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
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-5
      "
    >
      <AnalyticsCard
        title="Total Users"
        icon={Users}
      >
        <p className="text-3xl font-bold">
          {users.totalUsers.toLocaleString()}
        </p>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Active: {users.activeUsers}</span>
          <span>Verified: {users.verifiedUsers}</span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Revenue"
        icon={TrendingUp}
        highlight
      >
        <p className="text-3xl font-bold">
          ₦{revenue.totalRevenue.NGN.toLocaleString()}
        </p>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${revenue.totalRevenue.USD.toLocaleString()}</span>
          <span>{revenue.totalPayments} payments</span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Subscriptions"
        icon={CreditCard}
      >
        <p className="text-3xl font-bold">
          {subscriptions.totalSubscriptions.toLocaleString()}
        </p>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>VIP: {subscriptions.vipSubscriptions}</span>
          <span>Regular: {subscriptions.regularSubscriptions}</span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Predictions"
        icon={Target}
      >
        <p className="text-3xl font-bold">
          {predictions.totalPredictions.toLocaleString()}
        </p>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Won: {predictions.wonPredictions}</span>
          <span>Pending: {predictions.pendingPredictions}</span>
        </div>
      </AnalyticsCard>
    </div>
  );
}