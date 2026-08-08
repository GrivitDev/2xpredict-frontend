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

type CurrentPlan =
  | 'free'
  | 'regular'
  | 'vip';

type UpgradeTarget =
  | 'regular'
  | 'vip';

interface UpgradeCardProps {
  currentPlan: CurrentPlan;
  config: PlanConfig;
  upgradePrice?: UpgradePriceResponse | null;
  upgradeLoading?: boolean;
  onUpgrade: (
    target: UpgradeTarget,
  ) => void;
}

interface PlanCard {
  id: UpgradeTarget;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export default function UpgradeCard({
  currentPlan,
  config,
  upgradePrice,
  upgradeLoading = false,
  onUpgrade,
}: UpgradeCardProps) {
  // ==========================================
  // AVAILABLE PLANS
  // ==========================================

  const regularPlan: PlanCard = {
    id: 'regular',
    name: config.planLabels.regular,
    price: config.regularPrice,
    description:
      'For users who want more winning opportunities every day.',
    popular: true,
    features: [
      'Access to Regular Predictions',
      'Reduced advertisements',
      'Priority prediction releases',
    ],
  };

  const vipPlan: PlanCard = {
    id: 'vip',
    name: config.planLabels.vip,

    // Regular users see the calculated upgrade price.
    // Free users see the normal VIP subscription price.
    price:
      currentPlan === 'regular' &&
      upgradePrice
        ? upgradePrice.amount
        : config.vipPrice,

    description:
      'The complete Honest Predict experience with every premium benefit.',

    features: [
      'Unlimited VIP Predictions',
      'Zero advertisements',
      'Early access to premium tips',
    ],
  };

  let plans: PlanCard[] = [];

  if (currentPlan === 'free') {
    plans = [
      regularPlan,
      vipPlan,
    ];
  } else if (
    currentPlan === 'regular'
  ) {
    plans = [vipPlan];
  }

  // ==========================================
  // STYLES
  // ==========================================

  const icons = {
    regular: Trophy,
    vip: Crown,
  };

  const iconStyles = {
    regular:
      'bg-blue-500/15 text-blue-500 ring-2 ring-blue-500/20',

    vip:
      'bg-yellow-500/15 text-yellow-500',
  };

  const cardStyles = {
    regular:
      'border-blue-500 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background shadow-xl shadow-blue-500/20',

    vip:
      'border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-background to-background shadow-xl shadow-yellow-500/15',
  };

  const buttonText = {
    regular: 'Subscribe Now',
    vip: 'Upgrade to VIP',
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="space-y-4 mt-4">

      {/* ========================================== */}
      {/* VIP USER */}
      {/* ========================================== */}

      {currentPlan === 'vip' ? (
        <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500">
            <Crown className="h-8 w-8" />
          </div>

          <h2 className="mt-6 text-2xl font-black">
            You&apos;re Already a VIP Member
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            You already have access to every premium feature available on
            Honest Predict. There are currently no higher membership plans.
          </p>

          <div className="mt-8 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black">
            Current Membership
          </div>

        </div>
      ) : (

        <div
          className={`grid gap-6 ${
            plans.length === 1
              ? 'mx-auto max-w-xl'
              : 'md:grid-cols-2'
          }`}
        >

          {plans.map((plan) => {
            const Icon = icons[plan.id];

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-8 transition hover:-translate-y-1 hover:shadow-2xl ${cardStyles[plan.id]}`}
              >

                {/* ==========================================
                    POPULAR BADGE
                ========================================== */}

                {plan.popular && (
                  <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold tracking-wider text-white">
                    <Sparkles className="h-4 w-4" />
                    MOST POPULAR
                  </div>
                )}

                {/* ==========================================
                    PLAN HEADER
                ========================================== */}

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${iconStyles[plan.id]}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-black">
                      {plan.name}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                </div>

                {/* ==========================================
                    PRICE
                ========================================== */}

                <div className="mt-8 space-y-4">

                  <div className="flex items-end gap-2">

                    <span className="text-3xl font-black">
                      ₦
                      {plan.price.toLocaleString(
                        'en-GB',
                      )}
                    </span>

                    <span className="mb-1 text-sm text-muted-foreground">
                      {currentPlan === 'regular'
                        ? 'Upgrade Price'
                        : '/30 Days'}
                    </span>

                  </div>

                  {/* ==========================================
                      REGULAR → VIP UPGRADE ANALYSIS
                  ========================================== */}

                  {currentPlan === 'regular' &&
                    upgradePrice && (

                    <div className="rounded-2xl border bg-muted/40 p-4">

                      <h3 className="mb-4 font-semibold">
                        Upgrade Summary
                      </h3>

                      <div className="space-y-3 text-sm">

                        {/* CURRENT PLAN */}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Current Plan
                          </span>

                          <span className="font-medium">
                            {config.planLabels.regular}
                          </span>
                        </div>

                        {/* REGULAR PRICE */}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Regular Price
                          </span>

                          <span className="font-medium">
                            ₦
                            {upgradePrice.regularPrice.toLocaleString(
                              'en-GB',
                            )}
                          </span>
                        </div>

                        {/* VIP PRICE */}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            VIP Price
                          </span>

                          <span className="font-medium">
                            ₦
                            {upgradePrice.vipPrice.toLocaleString(
                              'en-GB',
                            )}
                          </span>
                        </div>

                        {/* DAYS REMAINING */}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Days Remaining
                          </span>

                          <span className="font-medium">
                            {upgradePrice.daysRemaining}{' '}
                            {upgradePrice.daysRemaining === 1
                              ? 'day'
                              : 'days'}
                          </span>
                        </div>

                        {/* UPGRADE DAILY RATE */}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Upgrade Rate
                          </span>

                          <span className="font-medium">
                            ₦
                            {upgradePrice.upgradeDailyPrice.toLocaleString(
                              'en-GB',
                              {
                                maximumFractionDigits: 2,
                              },
                            )}
                            /day
                          </span>
                        </div>

                        {/* UPGRADE COST */}

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Upgrade Cost
                          </span>

                          <span className="font-medium">
                            ₦
                            {upgradePrice.upgradeCost.toLocaleString(
                              'en-GB',
                            )}
                          </span>
                        </div>

                        {/* FINAL AMOUNT */}

                        <div className="border-t pt-3">

                          <div className="flex items-center justify-between gap-4">

                            <span className="font-semibold">
                              Amount to Pay
                            </span>

                            <span className="text-xl font-black text-primary">
                              ₦
                              {upgradePrice.amount.toLocaleString(
                                'en-GB',
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ==========================================
                          UPGRADE INFORMATION
                      ========================================== */}

                      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">

                        <p className="text-xs leading-5 text-muted-foreground">
                          Your upgrade amount is calculated based on the
                          remaining days of your current Regular membership.
                          After a successful upgrade, your VIP membership
                          will begin with a new full subscription period.
                        </p>

                      </div>

                    </div>
                  )}

                </div>

                {/* ==========================================
                    FEATURES
                ========================================== */}

                <ul className="mt-4 space-y-2">

                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3"
                    >

                      <div className="mt-0.5 rounded-full bg-green-500/10 p-1">
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </div>

                      <span className="text-sm leading-6">
                        {feature}
                      </span>

                    </li>
                  ))}

                </ul>

                {/* ==========================================
                    ACTION BUTTON
                ========================================== */}

                <button
                  type="button"
                  disabled={upgradeLoading}
                  onClick={() => onUpgrade(plan.id)}
                  className={`mt-10 flex w-full items-center justify-center rounded-xl py-3.5 font-semibold transition ${
                    plan.id === 'vip'
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >

                  {upgradeLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    buttonText[plan.id]
                  )}

                </button>

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}