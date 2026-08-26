import Link from 'next/link';

import {
  Plus,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import PromoTable from '@/components/admin/promos/PromoTable';

import {
  getPromos,
} from '@/services/admin-promos.service';

import AdminClaimedRewardsTable from '@/components/admin/promos/AdminClaimedRewardsTable';
import PendingCashRewardsTable from '@/components/admin/promos/PendingCashRewardsTable';

import type {
  Promo,
} from '@/types/promo';

export default async function AdminPromosPage() {
  const promos: Promo[] = await getPromos();

  const total = promos.length;

  const active = promos.filter(
    (promo) => promo.isActive,
  ).length;

  const referral = promos.filter(
    (promo) => promo.campaignType === 'referral',
  ).length;

  const direct = promos.filter(
    (promo) => promo.campaignType === 'direct',
  ).length;

  return (
    <div
      className="
        space-y-6
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-500
        sm:space-y-8
      "
    >
      {/* Header */}

      <header
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
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
            "
          >
            Promotions
          </h1>

          <p
            className="
              mt-1
              text-s
              text-muted-foreground
              sm:text-base
            "
          >
            Create and manage promotional campaigns.
          </p>
        </div>

        <Button
          asChild
          className="w-full sm:w-auto"
        >
          <Link href="/admin/promos/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Promo
          </Link>
        </Button>
      </header>

      {/* Stats */}

      <div
        className="
          grid
          gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <PromoStat
          label="Total Promos"
          value={total}
        />

        <PromoStat
          label="Active"
          value={active}
        />

        <PromoStat
          label="Referral Campaigns"
          value={referral}
        />

        <PromoStat
          label="Direct Campaigns"
          value={direct}
        />
      </div>

      {/* Promos */}

      <PromoTable
        promos={promos}
      />

      {/* Rewards */}

      <AdminClaimedRewardsTable />

      <PendingCashRewardsTable />
    </div>
  );
}

function PromoStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <Card
      className="
        overflow-hidden
        border-border
        bg-card/70
        shadow-sm
        backdrop-blur
      "
    >
      <CardContent
        className="
          p-4
          sm:p-5
        "
      >
        <p
          className="
            text-xs
            font-medium
            text-muted-foreground
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            sm:text-3xl
          "
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}