'use client';

import {
  FaArrowRight,
  FaCheck,
  FaCrown,
  FaShieldHalved,
  FaStar,
  FaTrophy,
} from 'react-icons/fa6';

import type { Currency as PaymentCurrency } from '@/types/payments';

type PlanId = 'free' | 'regular' | 'vip' | 'premium';

export interface UpgradePriceBreakdown {
  currentPlan: PlanId;
  targetPlan: PlanId;
  currency: PaymentCurrency;
  subscriptionDurationDays: number;
  daysRemaining: number;
  currentDailyPrice: number;
  targetDailyPrice: number;
  upgradeDailyPrice: number;
  credit: number;
  upgradeCost: number;
  amount: number;
  canUpgrade: boolean;
}

export interface PricingPlanCardData {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlanCardData;
  currency: PaymentCurrency;
  subscriptionDurationDays: number;
  currentPlan: PlanId;
  displayPrice: number;
  priceLabel: string;
  upgradeQuote?: UpgradePriceBreakdown;
  quoteLoading?: boolean;
  quoteUnavailable?: boolean;
  actionLabel: string;
  actionDisabled?: boolean;
  onSelect: (id: PlanId) => void;
}

const icons = {
  free: FaShieldHalved,
  regular: FaTrophy,
  vip: FaCrown,
  premium: FaStar,
} satisfies Record<PlanId, typeof FaShieldHalved>;

const cardStyles: Record<PlanId, string> = {
  free: 'border-border/70 bg-card/70 hover:border-brand-burgundy/30',
  regular:
    'border-brand-burgundy/25 bg-gradient-to-b from-brand-burgundy/[0.06] via-card/80 to-card/60',
  vip:
    'border-brand-champagne/50 bg-gradient-to-b from-brand-champagne/[0.12] via-card/80 to-card/60 shadow-lg shadow-brand-champagne/10',
  premium:
    'border-brand-burgundy/40 bg-gradient-to-b from-brand-burgundy/[0.10] via-card/80 to-brand-champagne/[0.04] shadow-lg shadow-brand-burgundy/10',
};

const iconStyles: Record<PlanId, string> = {
  free: 'bg-muted text-muted-foreground',
  regular: 'bg-brand-burgundy/10 text-brand-burgundy',
  vip: 'bg-brand-champagne/25 text-foreground',
  premium: 'bg-brand-burgundy text-white',
};

function formatPrice(value: number, currency: PaymentCurrency): string {
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'NGN' ? 0 : 2,
  }).format(value);
}

export default function PricingCard({
  plan,
  currency,
  subscriptionDurationDays,
  currentPlan,
  displayPrice,
  priceLabel,
  upgradeQuote,
  quoteLoading = false,
  quoteUnavailable = false,
  actionLabel,
  actionDisabled = false,
  onSelect,
}: PricingCardProps) {
  const Icon = icons[plan.id];
  const isCurrent = currentPlan === plan.id;
  const isHigherThanCurrent =
    ({ free: 0, regular: 1, vip: 2, premium: 3 }[plan.id] >
      { free: 0, regular: 1, vip: 2, premium: 3 }[currentPlan]);
  const isUpgradeQuote = Boolean(
    upgradeQuote?.canUpgrade && isHigherThanCurrent,
  );

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${cardStyles[plan.id]} ${plan.popular ? 'md:-translate-y-1' : ''}`}
    >
      {plan.id === 'premium' && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-brand-burgundy/10 blur-3xl"
        />
      )}

      {plan.popular && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-brand-burgundy/15 bg-brand-burgundy/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-burgundy">
          <FaStar aria-hidden="true" className="h-2.5 w-2.5" />
          Popular
        </span>
      )}

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center gap-3 pr-12">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconStyles[plan.id]}`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold tracking-tight text-foreground">
              {plan.name}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {plan.description}
            </p>
          </div>
        </div>

        <div className="mt-5 min-h-[90px]">
          {quoteLoading && isHigherThanCurrent && currentPlan !== 'free' ? (
            <>
              <p className="text-xs font-semibold text-muted-foreground">
                Calculating your upgrade
              </p>
              <div className="mt-2 h-8 w-36 animate-pulse rounded-lg bg-muted" />
            </>
          ) : quoteUnavailable && isHigherThanCurrent && currentPlan !== 'free' ? (
            <>
              <p className="text-xs font-semibold text-muted-foreground">
                Upgrade price unavailable
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Refresh the page to load your personalized calculation.
              </p>
            </>
          ) : plan.id === 'free' ? (
            <>
              <p className="text-3xl font-black tracking-tight text-foreground">
                Free
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                No subscription payment
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {priceLabel}
              </p>
              <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-foreground">
                {formatPrice(displayPrice, currency)}
              </p>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                {isUpgradeQuote
                  ? `Upgrade now · ${upgradeQuote?.daysRemaining ?? 0} days remaining`
                  : `/${subscriptionDurationDays} days`}
              </p>
            </>
          )}
        </div>

        {isUpgradeQuote && upgradeQuote && (
          <div className="mt-3 rounded-xl border border-brand-burgundy/15 bg-background/70 p-3 text-xs">
            <p className="font-bold text-foreground">Upgrade calculation</p>
            <div className="mt-2 space-y-1.5 text-muted-foreground">
              <div className="flex items-start justify-between gap-3">
                <span>New plan price</span>
                <span className="shrink-0 font-medium text-foreground">
                  {formatPrice(
                    upgradeQuote.targetDailyPrice * upgradeQuote.subscriptionDurationDays,
                    currency,
                  )}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Remaining subscription credit</span>
                <span className="shrink-0 font-medium text-foreground">
                  −{formatPrice(upgradeQuote.credit, currency)}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-border/70 pt-2 font-bold text-foreground">
                <span>Pay now</span>
                <span className="shrink-0">
                  {formatPrice(upgradeQuote.amount, currency)}
                </span>
              </div>
            </div>
            <p className="mt-2 leading-5 text-muted-foreground">
              Your upgrade takes effect immediately. Unused value from your current plan is credited toward the new plan.
            </p>
          </div>
        )}

        <ul className="mt-5 flex-1 space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <FaCheck aria-hidden="true" className="h-2 w-2" />
              </span>
              <span className="text-xs leading-5 text-muted-foreground">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={actionDisabled}
          onClick={() => onSelect(plan.id)}
          className={`mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            plan.id === 'vip'
              ? 'bg-brand-champagne text-foreground hover:brightness-95'
              : plan.id === 'premium'
                ? 'bg-brand-burgundy text-white hover:brightness-110'
                : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          {actionLabel}
          {!actionDisabled && !isCurrent && (
            <FaArrowRight aria-hidden="true" className="h-3 w-3" />
          )}
        </button>
      </div>
    </article>
  );
}

