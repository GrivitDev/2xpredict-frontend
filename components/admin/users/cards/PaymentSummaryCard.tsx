'use client';

import {
  CheckCircle,
  CreditCard,
  TrendingUp,
  Clock,
  XCircle,
} from 'lucide-react';

type Props = {
  summary: {
    totalRevenue: number;
    subscriptionRevenue: number;
    predictionRevenue: number;
    totalPayments: number;
    approvedPayments: number;
    pendingPayments: number;
    rejectedPayments: number;
  };
};

const money = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

export default function PaymentSummaryCard({
  summary,
}: Props) {
  const approvalRate = summary.totalPayments
    ? Math.round(
        (summary.approvedPayments /
          summary.totalPayments) *
          100,
      )
    : 0;

  return (
    <section
      aria-labelledby="payment-summary-title"
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
            bg-primary/10
            text-primary
          "
        >
          <CreditCard
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>

        <div>
          <h2
            id="payment-summary-title"
            className="
              text-sm
              font-semibold
              tracking-tight
            "
          >
            Payments
          </h2>

          <p className="text-[10px] text-muted-foreground">
            Financial overview
          </p>
        </div>
      </header>

      <div className="p-3">
        {/* Revenue */}

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
            Total Revenue
          </p>

          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="text-lg font-bold tracking-tight">
              {money(summary.totalRevenue)}
            </p>

            <TrendingUp
              aria-hidden="true"
              className="h-3.5 w-3.5 text-emerald-500"
            />
          </div>
        </div>

        {/* Revenue / payment stats */}

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
            sm:grid-cols-4
          "
        >
          <Stat
            label="Subscriptions"
            value={money(
              summary.subscriptionRevenue,
            )}
          />

          <Stat
            label="Predictions"
            value={money(
              summary.predictionRevenue,
            )}
          />

          <Stat
            label="Payments"
            value={summary.totalPayments}
          />

          <Stat
            label="Approval"
            value={`${approvalRate}%`}
          />
        </div>

        {/* Status */}

        <div
          className="
            mt-2
            grid
            grid-cols-3
            gap-2
          "
        >
          <Status
            icon={
              <CheckCircle
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Approved"
            value={summary.approvedPayments}
            className="
              text-emerald-600
              dark:text-emerald-400
              bg-emerald-500/10
            "
          />

          <Status
            icon={
              <Clock
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Pending"
            value={summary.pendingPayments}
            className="
              text-amber-600
              dark:text-amber-400
              bg-amber-500/10
            "
          />

          <Status
            icon={
              <XCircle
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Rejected"
            value={summary.rejectedPayments}
            className="
              text-red-600
              dark:text-red-400
              bg-red-500/10
            "
          />
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

function Status({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`
        rounded-md
        px-2.5
        py-2
        ${className}
      `}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium">
        {icon}
        <span>{label}</span>
      </div>

      <p className="mt-0.5 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}