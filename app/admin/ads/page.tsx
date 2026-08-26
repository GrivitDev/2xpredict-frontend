'use client';

import Link from 'next/link';

import {
  Plus,
  Megaphone,
  CheckCircle,
  Eye,
  MousePointerClick,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  useAdminAds,
  useAdminAdAnalytics,
  useDeleteAd,
  useToggleAd,
} from '@/hooks/useAdminAds';

import { AdTable } from '@/components/admin/ads/AdTable';

import {
  AdAnalyticsCard,
} from '@/components/admin/ads/AdAnalyticsCard';

export default function AdsPage() {
  const {
    data: ads = [],
    isLoading: adsLoading,
  } = useAdminAds();

  const {
    data: analytics,
    isLoading: analyticsLoading,
  } = useAdminAdAnalytics();

  const deleteMutation = useDeleteAd();
  const toggleMutation = useToggleAd();

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this advertisement?')) {
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  if (adsLoading || analyticsLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <p className="text-s text-muted-foreground">
          Loading advertisements...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Advertisements
          </h1>

          <p className="mt-1 text-s text-muted-foreground">
            Manage internal advertisements displayed across
            the platform.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/ads/create">
            <Plus className="mr-2 size-4" />
            Create Ad
          </Link>
        </Button>
      </div>

      {/* ANALYTICS */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <AdAnalyticsCard
          title="Total Ads"
          value={analytics?.totalAds ?? 0}
          icon={Megaphone}
        />

        <AdAnalyticsCard
          title="Active Ads"
          value={analytics?.activeAds ?? 0}
          icon={CheckCircle}
        />

        <AdAnalyticsCard
          title="Impressions"
          value={analytics?.impressions ?? 0}
          icon={Eye}
        />

        <AdAnalyticsCard
          title="Clicks"
          value={analytics?.clicks ?? 0}
          icon={MousePointerClick}
        />
      </div>

      {/* ADS */}

      {ads.length > 0 ? (
        <AdTable
          ads={ads}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ) : (
        <div
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
            rounded-2xl
            border
            bg-card/60
            p-6
            text-center
            text-s
            text-muted-foreground
          "
        >
          No advertisements found.
        </div>
      )}
    </div>
  );
}