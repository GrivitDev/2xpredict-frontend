'use client';

import {
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';

import type { PaymentCurrency } from '@/services/payment-gateway.service';

interface PricingPlan {
  id:
    | 'free'
    | 'regular'
    | 'vip';

  name: string;

  price: number;

  description: string;

  features: string[];

  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;

  currency: PaymentCurrency;

  subscriptionDurationDays: number;

  onSelect: (
    id:
      | 'free'
      | 'regular'
      | 'vip',
  ) => void;
}

const icons = {
  free: ShieldCheck,
  regular: Trophy,
  vip: Crown,
};

const buttonText = {
  free: 'Get Started',
  regular: 'Subscribe',
  vip: 'Become VIP',
};

const cardStyles = {
  free: `
    border-border/70
    bg-card/60
    hover:border-primary/30
  `,

  regular: `
    border-blue-500/40
    bg-gradient-to-b
    from-blue-500/[0.07]
    via-card/70
    to-card/50
    shadow-lg
    shadow-blue-500/10
    lg:scale-[1.02]
  `,

  vip: `
    border-gold/30
    bg-gradient-to-b
    from-gold/[0.08]
    via-card/70
    to-card/50
    shadow-lg
    shadow-gold/10
  `,
};

const iconStyles = {
  free: `
    bg-muted
    text-muted-foreground
  `,

  regular: `
    bg-blue-500/10
    text-blue-500
  `,

  vip: `
    bg-gold/10
    text-gold
  `,
};

export default function PricingCard({
  plan,
  currency,
  subscriptionDurationDays,
  onSelect,
}: PricingCardProps) {

  const Icon = icons[plan.id];

  const currencySymbol =
    currency === 'USD'
      ? '$'
      : '₦';


  const handleSelectPlan = () => {
    if (plan.id === 'free') {
      window.location.href =
        '/register';

      return;
    }

    onSelect(plan.id);
  };


  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-5
        ${cardStyles[plan.id]}
      `}
    >

      {/* VIP GLOW */}

      {plan.id === 'vip' && (
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-40
            w-40
            rounded-full
            bg-gold/10
            blur-3xl
          "
        />
      )}


      {/* POPULAR */}

      {plan.popular && (
        <div
          className="
            absolute
            right-4
            top-4
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-blue-500/20
            bg-blue-500/10
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-wider
            text-blue-500
          "
        >
          <Sparkles className="h-3 w-3" />

          Popular
        </div>
      )}


      <div className="relative">

        {/* HEADER */}

        <div className="flex items-center gap-3">

          <div
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${iconStyles[plan.id]}
            `}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">

            <h2
              className="
                text-lg
                font-black
                tracking-tight
              "
            >
              {plan.name}
            </h2>

            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-muted-foreground
              "
            >
              {plan.description}
            </p>

          </div>

        </div>


        {/* PRICE */}

        <div className="mt-5">

          {plan.price === 0 ? (
            <div
              className="
                text-3xl
                font-black
                tracking-tight
              "
            >
              Free
            </div>
          ) : (
            <div
              className="
                flex
                items-baseline
                gap-1.5
              "
            >
              <span
                className="
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                "
              >
                {currencySymbol}
                {plan.price.toLocaleString()}
              </span>

              <span
                className="
                  text-[10px]
                  font-medium
                  text-muted-foreground
                "
              >
                / {subscriptionDurationDays} days
              </span>
            </div>
          )}

        </div>


        {/* FEATURES */}

        <div className="mt-5">

          <ul className="space-y-2.5">

            {plan.features.map(
              (feature) => (
                <li
                  key={feature}
                  className="
                    flex
                    items-start
                    gap-2
                  "
                >
                  <span
                    className="
                      mt-0.5
                      flex
                      h-4
                      w-4
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-green-500/10
                    "
                  >
                    <Check
                      className="
                        h-2.5
                        w-2.5
                        text-green-500
                      "
                    />
                  </span>

                  <span
                    className="
                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    {feature}
                  </span>
                </li>
              ),
            )}

          </ul>

        </div>


        {/* ACTION */}

        <button
          type="button"
          onClick={handleSelectPlan}
          className={`
            mt-6
            flex
            w-full
            items-center
            justify-center
            rounded-xl
            px-4
            py-2.5
            text-xs
            font-bold
            ${
              plan.id === 'vip'
                ? `
                  bg-gold
                  text-background
                  shadow-md
                  shadow-gold/10
                  hover:bg-gold/90
                `
                : `
                  bg-primary
                  text-primary-foreground
                  shadow-md
                  shadow-primary/10
                  hover:opacity-90
                `
            }
          `}
        >
          {buttonText[plan.id]}
        </button>

      </div>
    </div>
  );
}