import {
  CalendarDays,
  BadgeCheck,
  Crown,
  CircleDollarSign,
  UserRound,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { fmtDate } from './dashboard.utils';


// ============================================================
// TYPES
// ============================================================

type Currency = 'NGN' | 'USD';


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(
  amount: number,
  currency: Currency,
) {
  return new Intl.NumberFormat(
    currency === 'NGN' ? 'en-NG' : 'en-US',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(amount);
}


// ============================================================
// COUNTDOWN
// ============================================================

function useCountdown(
  expiryDate?: string | Date | null,
) {
  const calculate = () => {
    if (!expiryDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const difference =
      new Date(expiryDate).getTime() -
      Date.now();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(
        difference / 86400000,
      ),

      hours: Math.floor(
        (difference / 3600000) % 24,
      ),

      minutes: Math.floor(
        (difference / 60000) % 60,
      ),

      seconds: Math.floor(
        (difference / 1000) % 60,
      ),
    };
  };

  const [time, setTime] =
    useState(calculate);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  return time;
}


// ============================================================
// PLAN THEME
// ============================================================

function getPlanTheme(
  plan?: string | null,
) {
  const current = plan?.toLowerCase();

  if (current === 'vip') {
    return {
      title: 'VIP Membership',
      icon: Crown,
      label: 'VIP',
      iconClass: 'text-amber-500',
      borderClass: 'border-amber-500/25',
      iconWrapper:
        'border-amber-500/25 bg-amber-500/10',
      labelClass:
        'text-amber-600 dark:text-amber-400',
      headerClass: 'bg-amber-500/[0.035]',
    };
  }

  if (current === 'regular') {
    return {
      title: 'Regular Membership',
      icon: BadgeCheck,
      label: 'Regular',
      iconClass: 'text-primary',
      borderClass: 'border-primary/25',
      iconWrapper:
        'border-primary/25 bg-primary/10',
      labelClass: 'text-primary',
      headerClass: 'bg-primary/[0.035]',
    };
  }

  return {
    title: 'Free Membership',
    icon: UserRound,
    label: 'Free',
    iconClass: 'text-muted-foreground',
    borderClass: 'border-border/60',
    iconWrapper:
      'border-border/60 bg-muted/30',
    labelClass: 'text-muted-foreground',
    headerClass: 'bg-muted/[0.025]',
  };
}


// ============================================================
// COMPONENT
// ============================================================

export function PlanCard({
  plan,
  startDate,
  expiresAt,
  revenue,
  currency = 'NGN',
}: {
  plan?: string | null;
  startDate?: string | Date | null;
  expiresAt?: string | Date | null;
  revenue?: number | null;
  currency?: Currency;
}) {
  const countdown =
    useCountdown(expiresAt);

  const theme =
    getPlanTheme(plan);

  const PlanIcon =
    theme.icon;

  const formattedRevenue =
    formatCurrency(
      revenue ?? 0,
      currency,
    );

  const countdownItems = [
    {
      value: countdown.days,
      label: 'Days',
    },
    {
      value: countdown.hours,
      label: 'Hours',
    },
    {
      value: countdown.minutes,
      label: 'Minutes',
    },
    {
      value: countdown.seconds,
      label: 'Seconds',
    },
  ];

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-sm
      "
    >
      {/* HEADER */}

      <div
        className={`
          flex
          items-center
          gap-3
          border-b
          px-4
          py-3
          ${theme.borderClass}
          ${theme.headerClass}
        `}
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            ${theme.iconWrapper}
          `}
        >
          <PlanIcon
            className={`
              h-5
              w-5
              ${theme.iconClass}
            `}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                ${theme.labelClass}
              `}
            >
              {theme.label}
            </span>

            <span
              className="
                h-1
                w-1
                rounded-full
                bg-muted-foreground/40
              "
            />

            <span
              className="
                text-xs
                text-muted-foreground
              "
            >
              Active
            </span>
          </div>

          <h3
            className="
              mt-0.5
              truncate
              text-sm
              font-semibold
              tracking-tight
            "
          >
            {theme.title}
          </h3>
        </div>

        <div
          className="
            hidden
            shrink-0
            text-right
            sm:block
          "
        >
          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            Started
          </p>

          <p
            className="
              mt-0.5
              text-xs
              font-semibold
            "
          >
            {fmtDate(startDate)}
          </p>
        </div>
      </div>

      {/* EXPIRY */}

      <div className="px-4 py-3">
        <div
          className="
            mb-2
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <CalendarDays
              className="
                h-4
                w-4
                shrink-0
                text-primary
              "
            />

            <div
              className="
                flex
                min-w-0
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  text-xs
                  text-muted-foreground
                "
              >
                Expires
              </span>

              <span
                className="
                  truncate
                  text-xs
                  font-semibold
                "
              >
                {fmtDate(expiresAt)}
              </span>
            </div>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-2
              py-0.5
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-emerald-600
              dark:text-emerald-400
            "
          >
            Active
          </span>
        </div>

        <div
          className="
            grid
            grid-cols-4
            overflow-hidden
            rounded-xl
            border
            border-border/50
            bg-muted/20
          "
        >
          {countdownItems.map(
            (item, index) => (
              <div
                key={item.label}
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-0.5
                  px-2
                  py-2
                  ${
                    index !== 0
                      ? 'border-l border-border/50'
                      : ''
                  }
                `}
              >
                <span
                  className="
                    text-base
                    font-bold
                    leading-none
                    tabular-nums
                  "
                >
                  {String(
                    item.value,
                  ).padStart(2, '0')}
                </span>

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-muted-foreground
                  "
                >
                  {item.label}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          grid-cols-2
          border-t
          border-border/50
          bg-muted/[0.025]
        "
      >
        <StatItem
          icon={
            <CircleDollarSign className="h-4 w-4" />
          }
          label="Value"
          value={formattedRevenue}
        />

        <StatItem
          icon={
            <BadgeCheck className="h-4 w-4" />
          }
          label="Status"
          value="Active"
          bordered
          valueClass="
            text-emerald-600
            dark:text-emerald-400
          "
        />
      </div>
    </div>
  );
}


// ============================================================
// STAT ITEM
// ============================================================

function StatItem({
  icon,
  label,
  value,
  bordered = false,
  valueClass = '',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bordered?: boolean;
  valueClass?: string;
}) {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-2.5
        px-4
        py-3
        ${bordered ? 'border-l border-border/50' : ''}
      `}
    >
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-primary/10
          bg-primary/10
          text-primary
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[10px]
            font-medium
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          {label}
        </p>

        <p
          className={`
            mt-0.5
            truncate
            text-sm
            font-semibold
            ${valueClass}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
}