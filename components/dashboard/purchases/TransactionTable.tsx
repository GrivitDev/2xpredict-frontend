'use client';

import {
  Wallet,
  Crown,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

import {
  Badge,
} from '@/components/ui/badge';


// ============================================================
// TYPES
// ============================================================

interface Props {
  loading: boolean;
  payments: any[];
}


// ============================================================
// COMPONENT
// ============================================================

export default function TransactionTable({
  loading,
  payments,
}: Props) {

  if (loading) {
    return null;
  }


  if (!payments.length) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-xl
          border
          border-dashed
          border-border/60
          bg-card
          px-4
          py-10
          text-center
        "
      >
        <div
          className="
            mb-2
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            bg-primary/10
            text-primary
          "
        >
          <Wallet className="h-4 w-4" />
        </div>

        <p className="text-s font-semibold">
          No transactions yet
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Your payments will appear here after submission.
        </p>
      </div>
    );
  }


  function getType(payment: any) {

    switch (payment.type) {

      case 'subscription':
        return 'Subscription';

      case 'vip_upgrade':
        return 'VIP Upgrade';

      case 'prediction':
        return 'Prediction Purchase';

      default:
        return payment.type;

    }

  }


  function getItem(payment: any) {

    switch (payment.type) {

      case 'subscription':
        return `${payment.target?.toUpperCase()} Plan`;

      case 'prediction':
        return (
          payment.prediction?.match ||
          payment.target ||
          'Prediction'
        );

      default:
        return '-';

    }

  }


  function formatAmount(amount: number) {

    return new Intl.NumberFormat(
      'en-GB',
      {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      },
    ).format(amount);

  }


  function formatDate(date: string) {

    return new Date(
      date,
    ).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );

  }


  function getIcon(type: string) {

    if (type === 'VIP Upgrade') {
      return Crown;
    }

    if (type === 'Prediction Purchase') {
      return ShoppingBag;
    }

    return CreditCard;

  }


  function getStatusClass(status: string) {

    switch (status) {

      case 'approved':
        return `
          border-emerald-500/20
          bg-emerald-500/10
          text-emerald-600
          dark:text-emerald-400
        `;

      case 'pending':
        return `
          border-amber-500/20
          bg-amber-500/10
          text-amber-600
          dark:text-amber-400
        `;

      case 'rejected':
        return `
          border-red-500/20
          bg-red-500/10
          text-red-600
          dark:text-red-400
        `;

      default:
        return `
          border-border/50
          bg-muted/50
          text-muted-foreground
        `;

    }

  }


  return (

    <div className="space-y-3">


      {/* DESKTOP */}

      <div
        className="
          hidden
          overflow-hidden
          rounded-xl
          border
          border-border/60
          bg-card
          md:block
        "
      >

        <table
          className="
            w-full
            text-xs
          "
        >

          <thead>

            <tr
              className="
                border-b
                border-border/60
                bg-muted/30
              "
            >

              {[
                'Type',
                'Item',
                'Amount',
                'Status',
                'Date',
              ].map((header) => (

                <th
                  key={header}
                  className="
                    px-4
                    py-2.5
                    text-left
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted-foreground
                  "
                >
                  {header}
                </th>

              ))}

            </tr>

          </thead>


          <tbody>

            {payments.map((payment) => (

              <tr
                key={payment._id}
                className="
                  border-b
                  border-border/40
                  last:border-0
                  transition-colors
                  hover:bg-muted/20
                "
              >

                <td
                  className="
                    px-4
                    py-3
                    font-semibold
                  "
                >
                  {getType(payment)}
                </td>


                <td
                  className="
                    max-w-[240px]
                    truncate
                    px-4
                    py-3
                    text-muted-foreground
                  "
                >
                  {getItem(payment)}
                </td>


                <td
                  className="
                    px-4
                    py-3
                    font-bold
                    tabular-nums
                  "
                >
                  {formatAmount(
                    payment.amount || 0,
                  )}
                </td>


                <td className="px-4 py-3">

                  <Badge
                    variant="outline"
                    className={`
                      rounded-full
                      px-2
                      py-0.5
                      text-[9px]
                      font-medium
                      capitalize
                      ${getStatusClass(
                        payment.status,
                      )}
                    `}
                  >
                    {payment.status}
                  </Badge>

                </td>


                <td
                  className="
                    px-4
                    py-3
                    text-muted-foreground
                  "
                >
                  {formatDate(
                    payment.createdAt,
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>



      {/* MOBILE */}

      <div
        className="
          space-y-2
          md:hidden
        "
      >

        {payments.map((payment) => {

          const Icon =
            getIcon(
              getType(payment),
            );


          return (

            <div
              key={payment._id}
              className="
                relative
                overflow-hidden
                rounded-xl
                border
                border-border/60
                bg-card
                p-3
                transition-colors
                hover:bg-muted/20
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-24
                  w-24
                  rounded-full
                  bg-primary/10
                  blur-2xl
                "
              />


              <div className="relative">


                {/* Top */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2.5
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
                        rounded-lg
                        bg-primary/10
                        text-primary
                      "
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>


                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-xs
                          font-semibold
                        "
                      >
                        {getType(payment)}
                      </p>

                      <p
                        className="
                          truncate
                          text-[10px]
                          text-muted-foreground
                        "
                      >
                        {getItem(payment)}
                      </p>

                    </div>

                  </div>


                  <Badge
                    variant="outline"
                    className={`
                      shrink-0
                      rounded-full
                      px-2
                      py-0.5
                      text-[9px]
                      capitalize
                      ${getStatusClass(
                        payment.status,
                      )}
                    `}
                  >
                    {payment.status}
                  </Badge>

                </div>



                {/* Bottom */}

                <div
                  className="
                    mt-3
                    flex
                    items-end
                    justify-between
                    border-t
                    border-border/40
                    pt-2.5
                  "
                >

                  <div>

                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-wide
                        text-muted-foreground
                      "
                    >
                      Amount
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-base
                        font-bold
                        tabular-nums
                      "
                    >
                      {formatAmount(
                        payment.amount || 0,
                      )}
                    </p>

                  </div>


                  <div className="text-right">

                    <p
                      className="
                        text-[9px]
                        uppercase
                        tracking-wide
                        text-muted-foreground
                      "
                    >
                      Date
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        font-medium
                      "
                    >
                      {formatDate(
                        payment.createdAt,
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}