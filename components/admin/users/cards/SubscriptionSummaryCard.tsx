'use client';

import {
  AlertTriangle,
  CalendarDays,
  Crown,
  ShieldCheck,
} from 'lucide-react';

type Props = {
  summary: {
    hasSubscription: boolean;
    currentPlan: string;
    status: string;
    daysRemaining: number;
    expired: boolean;
  };
};

export default function SubscriptionSummaryCard({
  summary,
}: Props) {
  const isVip =
    summary.currentPlan.toLowerCase() === 'vip';

  const statusClass = summary.expired
    ? `
      border-red-500/20
      bg-red-500/10
      text-red-600
      dark:text-red-400
    `
    : `
      border-emerald-500/20
      bg-emerald-500/10
      text-emerald-600
      dark:text-emerald-400
    `;

  return (
    <section
      aria-labelledby="subscription-summary-title"
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
          justify-between
          gap-3
          border-b
          border-border/60
          px-4
          py-3
        "
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              bg-amber-500/10
              text-amber-600
              dark:text-amber-400
            "
          >
            <Crown
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0">
            <h2
              id="subscription-summary-title"
              className="
                text-sm
                font-semibold
                tracking-tight
              "
            >
              Subscription
            </h2>

            <p className="text-[10px] text-muted-foreground">
              Membership status
            </p>
          </div>
        </div>

        {isVip && (
          <span
            className="
              shrink-0
              rounded-md
              border
              border-amber-500/20
              bg-amber-500/10
              px-1.5
              py-0.5
              text-[10px]
              font-semibold
              text-amber-600
              dark:text-amber-400
            "
          >
            VIP
          </span>
        )}
      </header>

      <div className="p-3">
        {/* Current plan */}

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
            Current Plan
          </p>

          <p className="mt-0.5 text-lg font-bold tracking-tight">
            {summary.currentPlan.toUpperCase()}
          </p>
        </div>

        {/* Details */}

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
            icon={
              <ShieldCheck
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Status"
            value={summary.status}
          />

          <Stat
            icon={
              <CalendarDays
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            }
            label="Days Left"
            value={summary.daysRemaining}
          />
        </div>

        {/* Subscription state */}

        <div
          role="status"
          className={`
            mt-2
            flex
            items-center
            gap-1.5
            rounded-md
            border
            px-2.5
            py-2
            text-[10px]
            font-medium
            ${statusClass}
          `}
        >
          {summary.expired ? (
            <>
              <AlertTriangle
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />

              Subscription expired
            </>
          ) : (
            <>
              <ShieldCheck
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />

              Subscription active
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-card px-3 py-2.5">
      <div
        className="
          flex
          items-center
          gap-1.5
          text-[10px]
          text-muted-foreground
        "
      >
        {icon}

        <span>{label}</span>
      </div>

      <p className="mt-0.5 truncate text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}