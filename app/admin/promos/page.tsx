import Link from 'next/link';

import {
  AlertCircle,
  Plus,
  RefreshCw,
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


/* =========================================================
   PAGE
========================================================= */

export default async function AdminPromosPage() {
  let promos: Promo[] = [];

  try {
    promos = await getPromos();

    if (!Array.isArray(promos)) {
      throw new Error(
        'The promotions service returned an invalid response.',
      );
    }
  } catch (error) {
    console.error(
      '[AdminPromosPage] Failed to load promotions:',
      error,
    );

    return (
      <PromoErrorState />
    );
  }


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
    <main
      className="
        min-w-0
        max-w-full
        space-y-6
        overflow-x-hidden
        pb-8
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

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
        <div className="min-w-0">
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
              text-sm
              text-muted-foreground
            "
          >
            Create and manage promotional campaigns.
          </p>
        </div>

        <Button
          asChild
          className="
            w-full
            shrink-0
            sm:w-auto
          "
        >
          <Link href="/admin/promos/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Promo
          </Link>
        </Button>
      </header>


      {/* =====================================================
          STATS
      ===================================================== */}

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


      {/* =====================================================
          PROMO CAMPAIGNS
      ===================================================== */}

      <PromoTable
        promos={promos}
      />


      {/* =====================================================
          REWARDS
      ===================================================== */}

      <AdminClaimedRewardsTable />

      <PendingCashRewardsTable />
    </main>
  );
}


/* =========================================================
   PROMO ERROR STATE
========================================================= */

function PromoErrorState() {
  return (
    <main
      className="
        min-w-0
        max-w-full
        pb-8
      "
    >
      <Card
        className="
          overflow-hidden
          border-destructive/20
        "
      >
        <CardContent
          className="
            flex
            min-h-72
            flex-col
            items-center
            justify-center
            px-6
            py-12
            text-center
          "
        >
          <div
            className="
              mb-4
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-destructive/10
              text-destructive
            "
          >
            <AlertCircle className="h-6 w-6" />
          </div>

          <h1
            className="
              text-xl
              font-semibold
              tracking-tight
            "
          >
            Unable to load promotions
          </h1>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            We could not retrieve the promotional
            campaigns from the server. Please try
            again. If the problem continues, check
            the API connection or server logs.
          </p>

          <div
            className="
              mt-6
              flex
              flex-col
              gap-2
              sm:flex-row
            "
          >
            <Button
              asChild
              variant="outline"
            >
              <Link href="/admin/promos">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>

            <Button asChild>
              <Link href="/admin">
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}


/* =========================================================
   PROMO STAT
========================================================= */

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