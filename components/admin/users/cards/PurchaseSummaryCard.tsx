'use client';

import {
  ShoppingBag,
  TrendingUp,
  Trophy,
} from 'lucide-react';

type Props = {
  summary: {
    totalPurchases: number;
    totalSpent: number;
  };
};

const money = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

export default function PurchaseSummaryCard({
  summary,
}: Props) {
  const averageSpend =
    summary.totalPurchases > 0
      ? Math.round(
          summary.totalSpent /
            summary.totalPurchases,
        )
      : 0;

  return (
    <section
      aria-labelledby="purchase-summary-title"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      {/* Header */}

      <header
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-border/60
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-md
            bg-emerald-500/10
            text-emerald-600
            dark:text-emerald-400
          "
        >
          <Trophy
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>

        <div>
          <h2
            id="purchase-summary-title"
            className="
              text-sm
              font-semibold
              tracking-tight
            "
          >
            Prediction Purchases
          </h2>

          <p className="text-[10px] text-muted-foreground">
            User prediction activity
          </p>
        </div>
      </header>

      <div className="p-3">
        {/* Main statistic */}

        <div
          className="
            rounded-md
            border
            border-border/50
            bg-background/40
            px-3
            py-2.5
          "
        >
          <p className="text-[10px] text-muted-foreground">
            Purchased Predictions
          </p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="text-xl font-bold tracking-tight">
              {summary.totalPurchases}
            </p>

            <ShoppingBag
              aria-hidden="true"
              className="h-3.5 w-3.5 text-emerald-500"
            />
          </div>
        </div>

        {/* Financial stats */}

        <div
          className="
            mt-2
            grid
            grid-cols-2
            gap-px
            overflow-hidden
            rounded-md
            border
            border-border/50
            bg-border/50
          "
        >
          <Stat
            label="Total Spent"
            value={money(summary.totalSpent)}
          />

          <Stat
            label="Average Purchase"
            value={money(averageSpend)}
          />
        </div>

        {/* Status */}

        <div
          className="
            mt-2
            flex
            items-center
            gap-1.5
            rounded-md
            bg-emerald-500/10
            px-2.5
            py-2
            text-[10px]
            font-medium
            text-emerald-600
            dark:text-emerald-400
          "
        >
          <TrendingUp
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />

          Prediction engagement
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-card px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}