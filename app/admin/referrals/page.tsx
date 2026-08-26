'use client';

import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/skeleton';

import ReferralStats from '@/components/admin/referrals/ReferralStats';
import ReferralTable from '@/components/admin/referrals/ReferralTable';
import ReferralFilters, {
  type ReferralFilter,
} from '@/components/admin/referrals/ReferralFilters';

import {
  getAdminReferrals,
  getAdminReferralStats,
} from '@/services/admin-referrals.service';

export default function AdminReferralsPage() {
  const [filter, setFilter] =
    useState<ReferralFilter>('all');

  const {
    data: referrals = [],
    isLoading: loadingReferrals,
  } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: getAdminReferrals,
  });

  const {
    data: stats,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ['admin-referral-stats'],
    queryFn: getAdminReferralStats,
  });

  const filteredReferrals = useMemo(() => {
    if (filter === 'all') {
      return referrals;
    }

    const filters: Record<
      Exclude<ReferralFilter, 'all'>,
      (referral: (typeof referrals)[number]) => boolean
    > = {
      registered: (referral) => referral.registered,
      regular: (referral) => referral.regularSubscription,
      vip: (referral) => referral.vipSubscription,
      prediction: (referral) => referral.predictionPurchased,
      reward: (referral) => referral.rewardClaimed,
    };

    return referrals.filter(filters[filter]);
  }, [referrals, filter]);

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Referral Management
        </h1>

        <p className="mt-1 text-muted-foreground">
          Monitor referral performance, conversions, and rewards.
        </p>
      </div>

      {/* Statistics */}

      {loadingStats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-32 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        stats && <ReferralStats stats={stats} />
      )}

      {/* Referrals */}

      <div className="space-y-4">
        <ReferralFilters
          activeFilter={filter}
          onChange={setFilter}
        />

        {loadingReferrals ? (
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        ) : (
          <ReferralTable
            referrals={filteredReferrals}
          />
        )}
      </div>
    </div>
  );
}