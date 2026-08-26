'use client';

import { useState } from 'react';

import LeaderboardTable from './LeaderboardTable';

import {
  AnalyticsLeaderboards,
} from '@/types/analytics.types';

interface Props {
  leaderboards: AnalyticsLeaderboards;
}

type LeaderboardType =
  | 'subscribers'
  | 'vip'
  | 'regular'
  | 'buyers'
  | 'referrals';

const tabs = [
  {
    label: 'Subscribers',
    value: 'subscribers',
  },
  {
    label: 'VIP',
    value: 'vip',
  },
  {
    label: 'Regular',
    value: 'regular',
  },
  {
    label: 'Buyers',
    value: 'buyers',
  },
  {
    label: 'Referrals',
    value: 'referrals',
  },
] as const;

export default function LeaderboardSection({
  leaderboards,
}: Props) {
  const [activeLeaderboard, setActiveLeaderboard] =
    useState<LeaderboardType>('subscribers');

  let table;

  switch (activeLeaderboard) {
    case 'vip':
      table = {
        title: 'Top VIP Subscribers',
        users: leaderboards.topVipSubscribers,
        metric: 'totalVipSubscriptions' as const,
      };
      break;

    case 'regular':
      table = {
        title: 'Top Regular Subscribers',
        users: leaderboards.topRegularSubscribers,
        metric: 'totalRegularSubscriptions' as const,
      };
      break;

    case 'buyers':
      table = {
        title: 'Top Prediction Buyers',
        users: leaderboards.topPredictionBuyers,
        metric: 'totalPurchases' as const,
      };
      break;

    case 'referrals':
      table = {
        title: 'Top Referrers',
        users: leaderboards.topReferrers,
        metric: 'successfulReferrals' as const,
      };
      break;

    default:
      table = {
        title: 'Top Subscribers',
        users: leaderboards.topSubscribers,
        metric: 'totalSubscriptions' as const,
      };
  }

  return (
    <section className="space-y-2">
      <div
        className="
          flex
          gap-0.5
          overflow-x-auto
          rounded-lg
          border
          bg-muted/40
          p-0.5
          scrollbar-none
        "
      >
        {tabs.map((tab) => {
          const active =
            activeLeaderboard === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                setActiveLeaderboard(tab.value)
              }
              className={`
                h-7
                shrink-0
                rounded-md
                px-3
                text-[11px]
                font-medium
                transition-colors
                ${
                  active
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <LeaderboardTable
        title={table.title}
        users={table.users}
        metric={table.metric}
      />
    </section>
  );
}