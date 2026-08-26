'use client';

import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Trophy,
} from 'lucide-react';

import type { PlanConfig } from '@/types/plan-config';
import type { UpgradePriceResponse } from '@/services/subscription.service';
import type { PaymentCurrency } from '@/services/payment-gateway.service';

type CurrentPlan = 'free' | 'regular' | 'vip';
type UpgradeTarget = 'regular' | 'vip';

interface UpgradeCardProps {
  currentPlan: CurrentPlan;
  config: PlanConfig;
  currency: PaymentCurrency;
  upgradePrice?: UpgradePriceResponse | null;
  upgradeLoading?: boolean;
  onUpgrade: (target: UpgradeTarget) => void;
}

interface PlanCard {
  id: UpgradeTarget;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLAN_ICONS = {
  regular: Trophy,
  vip: Crown,
} as const;

const PLAN_FEATURES = {
  regular: [
    'Regular Predictions',
    'Reduced advertisements',
    'Priority prediction releases',
  ],
  vip: [
    'Unlimited VIP Predictions',
    'Zero advertisements',
    'Early access to premium tips',
  ],
} as const;

const PLAN_DESCRIPTIONS = {
  regular: 'More winning opportunities every day.',
  vip: 'The complete premium prediction experience.',
} as const;

const PLAN_NAMES = {
  free: 'Free',
  regular: 'Regular',
  vip: 'VIP',
} as const;

export default function UpgradeCard({
  currentPlan,
  config,
  currency,
  upgradePrice,
  upgradeLoading = false,
  onUpgrade,
}: UpgradeCardProps) {
  const currencySymbol = currency === 'USD' ? '$' : '₦';
  const locale = currency === 'USD' ? 'en-US' : 'en-NG';

  const formatMoney = (
    value: number,
    fractionDigits = currency === 'USD' ? 2 : 0,
  ) =>
    `${currencySymbol}${Number(value || 0).toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;

  const regularPlan: PlanCard = {
    id: 'regular',
    name: config.planLabels.regular,
    price:
      currency === 'USD'
        ? config.regularPriceUSD
        : config.regularPrice,
    description: PLAN_DESCRIPTIONS.regular,
    popular: true,
    features: [...PLAN_FEATURES.regular],
  };

  const vipPlan: PlanCard = {
    id: 'vip',
    name: config.planLabels.vip,
    price:
      currentPlan === 'regular' && upgradePrice
        ? upgradePrice.amount
        : currency === 'USD'
          ? config.vipPriceUSD
          : config.vipPrice,
    description: PLAN_DESCRIPTIONS.vip,
    features: [...PLAN_FEATURES.vip],
  };

  if (currentPlan === 'vip') {
    return (
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-amber-500/20
          bg-gradient-to-br
          from-amber-500/[0.08]
          via-card
          to-card
          shadow-sm
        "
      >
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-amber-500/70
            to-transparent
          "
        />

        <div
          className="
            flex
            flex-col
            items-center
            px-5
            py-8
            text-center
            sm:px-8
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              border
              border-amber-500/20
              bg-amber-500/10
              text-amber-500
            "
          >
            <Crown className="h-6 w-6" />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                Already a VIP Member
              </h2>

              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-relaxed
                text-muted-foreground
              "
            >
              You already have access to every premium
              feature. There are no higher membership
              plans available.
            </p>
          </div>

          <div
            className="
              mt-5
              rounded-lg
              border
              border-amber-500/20
              bg-amber-500/5
              px-4
              py-2
              text-xs
              font-semibold
              text-amber-600
              dark:text-amber-400
            "
          >
            Current Membership
          </div>
        </div>
      </div>
    );
  }

  const plans: PlanCard[] =
    currentPlan === 'free'
      ? [regularPlan, vipPlan]
      : [vipPlan];

  return (
    <div
      className={`
        grid
        gap-3
        ${plans.length === 1 ? 'mx-auto max-w-lg' : 'sm:grid-cols-2'}
      `}
    >
      {plans.map((plan) => {
        const Icon = PLAN_ICONS[plan.id];
        const isVip = plan.id === 'vip';
        const isUpgrade =
          currentPlan === 'regular' && isVip;

        return (
          <div
            key={plan.id}
            className={`
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              p-5
              shadow-sm
              ${
                isVip
                  ? `
                    border-amber-500/25
                    bg-gradient-to-br
                    from-amber-500/[0.08]
                    via-card
                    to-card
                    hover:border-amber-500/40
                  `
                  : `
                    border-primary/20
                    bg-gradient-to-br
                    from-primary/[0.04]
                    via-card
                    to-card
                    hover:border-primary/35
                  `
              }
            `}
          >
            <div
              className={`
                pointer-events-none
                absolute
                -right-12
                -top-12
                h-24
                w-24
                rounded-full
                blur-3xl
                ${isVip ? 'bg-amber-500/15' : 'bg-primary/10'}
              `}
            />

            {plan.popular && (
              <div
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-primary/15
                  bg-primary/10
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-primary
                "
              >
                <Sparkles className="h-3 w-3" />
                Popular
              </div>
            )}

            <div className="relative flex items-center gap-3">
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
                  ${
                    isVip
                      ? `
                        border-amber-500/20
                        bg-amber-500/10
                        text-amber-500
                      `
                      : `
                        border-primary/15
                        bg-primary/10
                        text-primary
                      `
                  }
                `}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 pr-16">
                <h2 className="truncate text-base font-semibold tracking-tight">
                  {plan.name}
                </h2>

                <p
                  className="
                    mt-1
                    line-clamp-2
                    text-xs
                    leading-relaxed
                    text-muted-foreground
                  "
                >
                  {plan.description}
                </p>
              </div>
            </div>

            <div
              className="
                relative
                mt-5
                flex
                items-baseline
                gap-2
              "
            >
              <span className="text-3xl font-bold tracking-tight">
                {formatMoney(plan.price)}
              </span>

              <span className="text-xs text-muted-foreground">
                {isUpgrade ? 'upgrade price' : '/ 30 days'}
              </span>
            </div>

            {isUpgrade && upgradePrice && (
              <UpgradeSummary
                config={config}
                upgradePrice={upgradePrice}
                formatMoney={formatMoney}
              />
            )}

            <div className="relative mt-5 space-y-2">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className={`
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      ${isVip ? 'bg-amber-500/10' : 'bg-emerald-500/10'}
                    `}
                  >
                    <Check
                      className={`
                        h-3
                        w-3
                        ${isVip ? 'text-amber-500' : 'text-emerald-500'}
                      `}
                    />
                  </span>

                  <span
                    className="
                      text-xs
                      leading-relaxed
                      text-muted-foreground
                    "
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={upgradeLoading}
              onClick={() => onUpgrade(plan.id)}
              className={`
                relative
                mt-5
                flex
                h-10
                w-full
                items-center
                justify-center
                rounded-xl
                text-sm
                font-semibold
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${
                  isVip
                    ? `
                      bg-amber-500
                      text-black
                      hover:bg-amber-400
                    `
                    : `
                      bg-primary
                      text-primary-foreground
                      hover:bg-primary/90
                    `
                }
              `}
            >
              {upgradeLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isUpgrade ? (
                'Upgrade to VIP'
              ) : isVip ? (
                'Subscribe to VIP'
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function UpgradeSummary({
  config,
  upgradePrice,
  formatMoney,
}: {
  config: PlanConfig;
  upgradePrice: UpgradePriceResponse;
  formatMoney: (value: number, fractionDigits?: number) => string;
}) {
  const {
    regularPrice,
    vipPrice,
    daysRemaining,
    upgradeDailyPrice,
    amount,
  } = upgradePrice;

  return (
    <div
      className="
        relative
        mt-4
        overflow-hidden
        rounded-xl
        border
        border-border/50
        bg-muted/20
      "
    >
      <div
        className="
          border-b
          border-border/50
          px-3.5
          py-2.5
        "
      >
        <p className="text-xs font-semibold">
          Upgrade Summary
        </p>
      </div>

      <div className="divide-y divide-border/40 px-3.5">
        <SummaryRow
          label="Current plan"
          value={config.planLabels.regular}
        />

        <SummaryRow
          label="Regular price"
          value={formatMoney(regularPrice)}
        />

        <SummaryRow
          label="VIP price"
          value={formatMoney(vipPrice)}
        />

        <SummaryRow
          label="Days remaining"
          value={`${daysRemaining} ${
            daysRemaining === 1 ? 'day' : 'days'
          }`}
        />

        <SummaryRow
          label="Upgrade rate"
          value={`${formatMoney(upgradeDailyPrice, 2)}/day`}
        />

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            py-2.5
          "
        >
          <span className="text-xs font-semibold">
            Amount to pay
          </span>

          <span className="text-base font-bold text-primary">
            {formatMoney(amount)}
          </span>
        </div>
      </div>

      <div
        className="
          border-t
          border-border/40
          bg-primary/[0.025]
          px-3.5
          py-2.5
        "
      >
        <p
          className="
            text-[10px]
            leading-relaxed
            text-muted-foreground
          "
        >
          The upgrade cost is based on the remaining
          days of your current Regular membership. VIP
          then starts a new full subscription period.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        py-2
      "
    >
      <span className="text-xs text-muted-foreground">
        {label}
      </span>

      <span className="text-right text-xs font-medium">
        {value}
      </span>
    </div>
  );
}