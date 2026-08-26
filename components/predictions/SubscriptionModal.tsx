'use client';

import {
  useEffect,
  useMemo,
} from 'react';

import {
  Check,
  Crown,
  Lock,
  X,
} from 'lucide-react';

import {
  usePlanConfig,
} from '@/hooks/usePlanConfig';

interface Props {
  open: boolean;
  onClose: () => void;

  userPlan?:
    | 'free'
    | 'regular'
    | 'vip'
    | string;

  predictionPlan?:
    | 'free'
    | 'regular'
    | 'vip'
    | string;

  currency?: 'NGN' | 'USD';

  requiredPlan?:
    | 'regular'
    | 'vip'
    | string;

  feature?:
    | 'prediction'
    | 'markets'
    | string;

  released?: boolean;

  releaseAt?: number | null;

  accessState?: string;

  accessMessage?: string | null;

  onSubscribe?: () => void;
}

type Plan =
  | 'free'
  | 'regular'
  | 'vip';

type PaidPlan =
  | 'regular'
  | 'vip';

type Currency =
  | 'NGN'
  | 'USD';

interface PlanConfig {
  planLabels?: Partial<
    Record<PaidPlan, string>
  >;

  subscriptionDurationDays?: number;

  regularPrice?: number;
  regularPriceUSD?: number;

  vipPrice?: number;
  vipPriceUSD?: number;
}

export default function SubscriptionModal({
  open,
  onClose,

  userPlan = 'free',
  predictionPlan = 'regular',

  currency = 'NGN',

  requiredPlan,
  feature = 'prediction',

  released = true,
  releaseAt = null,
  accessState = '',
  accessMessage = null,

  onSubscribe,
}: Props) {
  const {
    config,
    loading: configLoading,
  } = usePlanConfig();

  const normalizedUserPlan =
    normalizePlan(userPlan);

  const normalizedPredictionPlan =
    normalizePlan(
      predictionPlan,
    );

  const normalizedCurrency: Currency =
    currency === 'USD'
      ? 'USD'
      : 'NGN';

  const effectiveRequiredPlan =
    useMemo<PaidPlan>(() => {
      if (requiredPlan) {
        return normalizeRequiredPlan(
          requiredPlan,
        );
      }

      if (
        normalizedPredictionPlan ===
        'vip'
      ) {
        return 'vip';
      }

      if (
        normalizedUserPlan ===
        'regular'
      ) {
        return 'vip';
      }

      return 'regular';
    }, [
      requiredPlan,
      normalizedPredictionPlan,
      normalizedUserPlan,
    ]);

  const isVip =
    effectiveRequiredPlan === 'vip';

  const planLabel =
    config?.planLabels?.[
      effectiveRequiredPlan
    ] ??
    (isVip ? 'VIP' : 'Regular');

  const price = getPlanPrice({
    config,
    plan: effectiveRequiredPlan,
    currency: normalizedCurrency,
  });

  const featureName =
    String(feature)
      .trim()
      .toLowerCase() === 'markets'
      ? 'markets'
      : 'prediction';

  const regularWaitingForRelease =
    normalizedUserPlan === 'regular' &&
    normalizedPredictionPlan === 'regular' &&
    accessState === 'locked' &&
    !released;

  const title = isVip
    ? regularWaitingForRelease
      ? 'Get VIP Early Access'
      : 'VIP Access Required'
    : 'Regular Access Required';

  const description = isVip
    ? regularWaitingForRelease
      ? `Your Regular plan gives you access after release. Upgrade to VIP to access this ${featureName} earlier.`
      : `This ${featureName} requires VIP access. Upgrade to VIP to unlock it.`
    : `This ${featureName} requires a Regular subscription. Upgrade to Regular or VIP to unlock it.`;

  const benefits = isVip
    ? [
        'Access every prediction',
        'Unlock VIP predictions',
        'Get predictions earlier',
        'View all available markets',
        'Access premium picks',
      ]
    : [
        'Access Regular predictions',
        'View prediction details',
        'Unlock available markets',
        'Access premium picks',
      ];

  const releaseText = releaseAt
    ? formatReleaseDate(releaseAt)
    : null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const formattedPrice =
    price !== null
      ? formatPrice(
          price,
          normalizedCurrency,
        )
      : null;

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe();
      return;
    }

    window.location.href =
      '/dashboard/subscriptions';
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-background/40
        p-3
        backdrop-blur-[6px]
        sm:p-4
      "
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="
          relative
          my-auto
          w-full
          max-w-sm
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          shadow-2xl
        "
      >
        {/* TOP ACCENT */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-20
            bg-gradient-to-b
            from-primary/15
            to-transparent
          "
        />

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close subscription dialog"
          className="
            absolute
            right-3
            top-3
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-border
            bg-background/80
            text-muted-foreground
            backdrop-blur
            transition
            hover:bg-muted
            hover:text-foreground
          "
        >
          <X size={15} />
        </button>

        <div
          className="
            relative
            space-y-4
            p-4
            sm:p-5
          "
        >
          {/* HEADER */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary/10
                text-primary
              "
            >
              {isVip ? (
                <Crown size={21} />
              ) : (
                <Lock size={20} />
              )}
            </div>

            <div
              className="
                min-w-0
                pr-8
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-primary
                "
              >
                {regularWaitingForRelease
                  ? 'VIP Early Access'
                  : `${planLabel} Access`}
              </p>

              <h2
                id="subscription-modal-title"
                className="
                  mt-0.5
                  text-lg
                  font-black
                  leading-tight
                  tracking-tight
                  sm:text-xl
                "
              >
                {title}
              </h2>
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="space-y-1.5">
            <p
              className="
                text-xs
                leading-5
                text-muted-foreground
                sm:text-sm
              "
            >
              {description}
            </p>

            {accessMessage &&
              accessState !== 'locked' && (
                <p
                  className="
                    text-[11px]
                    text-muted-foreground
                  "
                >
                  {accessMessage}
                </p>
              )}

            {releaseText &&
              regularWaitingForRelease && (
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-muted-foreground
                  "
                >
                  Regular access begins{' '}
                  {releaseText}.
                </p>
              )}
          </div>

          {/* PRICE */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              rounded-xl
              border
              border-border
              bg-muted/25
              px-3
              py-2.5
            "
          >
            <div className="min-w-0">
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-muted-foreground
                "
              >
                {planLabel} Plan
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-muted-foreground
                "
              >
                {config?.subscriptionDurationDays
                  ? `${config.subscriptionDurationDays} days`
                  : 'Subscription'}
              </p>
            </div>

            <div className="shrink-0 text-right">
              {configLoading ? (
                <div
                  className="
                    h-5
                    w-16
                    animate-pulse
                    rounded
                    bg-muted
                  "
                />
              ) : formattedPrice ? (
                <p
                  className="
                    text-base
                    font-black
                    tabular-nums
                    sm:text-lg
                  "
                >
                  {formattedPrice}
                </p>
              ) : (
                <p
                  className="
                    text-[10px]
                    text-muted-foreground
                  "
                >
                  Contact for price
                </p>
              )}
            </div>
          </div>

          {/* BENEFITS */}

          <div
            className="
              rounded-xl
              border
              border-border
              bg-muted/20
              p-3
            "
          >
            <div
              className="
                grid
                grid-cols-1
                gap-2
                sm:grid-cols-2
              "
            >
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      flex
                      h-4
                      w-4
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-primary/10
                      text-primary
                    "
                  >
                    <Check size={10} />
                  </span>

                  <span
                    className="
                      text-[11px]
                      leading-4
                      text-foreground
                      sm:text-xs
                    "
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSubscribe}
              className="
                flex
                min-h-10
                w-full
                items-center
                justify-center
                rounded-xl
                bg-primary
                px-4
                py-2.5
                text-xs
                font-bold
                text-primary-foreground
                transition
                hover:opacity-90
                active:scale-[0.99]
                sm:text-sm
              "
            >
              {isVip
                ? 'Upgrade to VIP'
                : 'Subscribe to Regular'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                min-h-9
                w-full
                items-center
                justify-center
                rounded-xl
                px-4
                py-2
                text-xs
                font-medium
                text-muted-foreground
                transition
                hover:bg-muted
                hover:text-foreground
                sm:text-sm
              "
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   PLAN NORMALIZATION
========================================================= */

function normalizePlan(
  value?: string,
): Plan {
  const normalized =
    String(value ?? '')
      .trim()
      .toLowerCase();

  if (normalized === 'vip') {
    return 'vip';
  }

  if (normalized === 'regular') {
    return 'regular';
  }

  return 'free';
}


function normalizeRequiredPlan(
  value: string,
): PaidPlan {
  return value
    .trim()
    .toLowerCase() === 'vip'
    ? 'vip'
    : 'regular';
}


/* =========================================================
   PRICE
========================================================= */

function getPlanPrice({
  config,
  plan,
  currency,
}: {
  config: PlanConfig | null | undefined;
  plan: PaidPlan;
  currency: Currency;
}): number | null {
  if (!config) {
    return null;
  }

  const amount =
    plan === 'vip'
      ? currency === 'USD'
        ? config.vipPriceUSD
        : config.vipPrice
      : currency === 'USD'
        ? config.regularPriceUSD
        : config.regularPrice;

  const price = Number(amount);

  return Number.isFinite(price)
    ? price
    : null;
}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(
  amount: number,
  currency: Currency,
) {
  if (!Number.isFinite(amount)) {
    return null;
  }

  return new Intl.NumberFormat(
    currency === 'USD'
      ? 'en-US'
      : 'en-NG',
    {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    },
  ).format(amount);
}


/* =========================================================
   RELEASE DATE
========================================================= */

function formatReleaseDate(
  timestamp: number,
) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'later';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );
}