'use client';

import {
  CheckCircle2,
  Clock3,
  Wallet,
} from 'lucide-react';


// ============================================================
// TYPES
// ============================================================

interface Props {
  payments: any[];
  currency: 'NGN' | 'USD';
}


// ============================================================
// COMPONENT
// ============================================================

export default function TransactionSummary({
  payments = [],
  currency = 'NGN',
}: Props) {


  // ----------------------------------------------------------
  // TOTAL
  // ----------------------------------------------------------

  const total = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0,
  );


  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  const approved = payments.filter(
    (payment) =>
      payment.status === 'approved',
  ).length;


  const pending = payments.filter(
    (payment) =>
      payment.status === 'pending',
  ).length;


  // ----------------------------------------------------------
  // CURRENCY FORMATTER
  // ----------------------------------------------------------

  const formattedTotal =
    new Intl.NumberFormat(
      currency === 'NGN'
        ? 'en-NG'
        : 'en-US',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      },
    ).format(total);


  // ----------------------------------------------------------
  // CARDS
  // ----------------------------------------------------------

  const cards = [

    {
      title: 'Total Spent',

      value: formattedTotal,

      description: 'Lifetime payments',

      icon: Wallet,

      iconClass:
        'bg-primary/10 text-primary',

      accent:
        'bg-primary',
    },


    {
      title: 'Approved',

      value: approved.toLocaleString(),

      description: 'Successful payments',

      icon: CheckCircle2,

      iconClass:
        'bg-emerald-500/10 text-emerald-500',

      accent:
        'bg-emerald-500',
    },


    {
      title: 'Pending',

      value: pending.toLocaleString(),

      description: 'Awaiting approval',

      icon: Clock3,

      iconClass:
        'bg-amber-500/10 text-amber-500',

      accent:
        'bg-amber-500',
    },

  ];


  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (

    <div
      className="
        grid
        gap-2.5
        sm:grid-cols-3
      "
    >

      {cards.map((card) => {

        const Icon = card.icon;


        return (

          <div
            key={card.title}
            className="
              relative
              overflow-hidden
              rounded-xl
              border
              border-border/60
              bg-card
              px-3.5
              py-3
              transition-colors
              hover:bg-muted/10
            "
          >

            {/* Accent */}

            <div
              className={`
                absolute
                bottom-0
                left-0
                top-0
                w-0.5
                ${card.accent}
              `}
            />


            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              {/* Text */}

              <div
                className="
                  min-w-0
                "
              >

                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-wide
                    text-muted-foreground
                  "
                >
                  {card.title}
                </p>


                <p
                  className="
                    mt-0.5
                    truncate
                    text-lg
                    font-bold
                    tracking-tight
                  "
                >
                  {card.value}
                </p>


                <p
                  className="
                    mt-0.5
                    truncate
                    text-[9px]
                    text-muted-foreground
                  "
                >
                  {card.description}
                </p>

              </div>


              {/* Icon */}

              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  ${card.iconClass}
                `}
              >

                <Icon
                  className="
                    h-4
                    w-4
                  "
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>

  );

}