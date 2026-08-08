'use client';

import {
  Wallet,
  Crown,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

import {
  StatusBadge,
} from '@/components/dashboard/shared/StatusBadge';

import {
  EmptyState,
} from '@/components/dashboard/shared/EmptyState';


interface Props {
  loading: boolean;
  payments: any[];
}



export default function TransactionTable({
  loading,
  payments,
}: Props) {


  if (loading) {

    return null;

  }



  if (!payments.length) {

    return (

      <EmptyState
        icon={Wallet}
        title="No transactions yet"
        description="
          Your payments will appear here after submission.
        "
      />

    );

  }



  function getType(
    payment: any,
  ) {

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



  function getItem(
    payment: any,
  ) {

    switch (payment.type) {

      case 'subscription':

        return `${
          payment.target?.toUpperCase()
        } Plan`;


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



  function formatAmount(
    amount:number,
  ) {

    return new Intl.NumberFormat(
      'en-GB',
      {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      },
    ).format(amount);

  }



  function formatDate(
    date:string,
  ) {

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



  function getIcon(
    type:string,
  ) {

    if (
      type === 'VIP Upgrade'
    ) {

      return Crown;

    }


    if (
      type === 'Prediction Purchase'
    ) {

      return ShoppingBag;

    }


    return CreditCard;

  }



  return (

    <div
      className="
        space-y-5
      "
    >


      {/* DESKTOP */}

      <div
        className="
          hidden
          overflow-hidden
          rounded-3xl
          border
          border-border/60
          bg-card/50
          backdrop-blur-xl
          md:block
        "
      >

        <table
          className="
            w-full
            text-sm
          "
        >

          <thead>

            <tr
              className="
                border-b
                bg-muted/30
                text-muted-foreground
              "
            >

              {
                [
                  'Type',
                  'Item',
                  'Amount',
                  'Status',
                  'Date',
                ].map(
                  (header) => (

                    <th
                      key={header}
                      className="
                        px-6
                        py-5
                        text-left
                        font-medium
                      "
                    >

                      {header}

                    </th>

                  ),
                )
              }

            </tr>

          </thead>


          <tbody>

            {
              payments.map(
                (payment) => (

                  <tr
                    key={payment._id}
                    className="
                      border-b
                      transition-all
                      hover:bg-muted/20
                    "
                  >

                    <td
                      className="
                        px-6
                        py-5
                        font-semibold
                      "
                    >

                      {getType(payment)}

                    </td>


                    <td
                      className="
                        px-6
                        py-5
                        text-muted-foreground
                      "
                    >

                      {getItem(payment)}

                    </td>


                    <td
                      className="
                        px-6
                        py-5
                        font-bold
                      "
                    >

                      {
                        formatAmount(
                          payment.amount || 0,
                        )
                      }

                    </td>


                    <td
                      className="
                        px-6
                        py-5
                      "
                    >

                      <StatusBadge
                        status={
                          payment.status
                        }
                      />

                    </td>


                    <td
                      className="
                        px-6
                        py-5
                        text-muted-foreground
                      "
                    >

                      {
                        formatDate(
                          payment.createdAt,
                        )
                      }

                    </td>


                  </tr>

                ),
              )
            }

          </tbody>


        </table>

      </div>





      {/* MOBILE */}

      <div
        className="
          space-y-4
          md:hidden
        "
      >

        {
          payments.map(
            (payment) => {

              const Icon =
                getIcon(
                  getType(payment),
                );


              return (

                <div
                  key={payment._id}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-border/60
                    bg-gradient-to-br
                    from-primary/10
                    via-background
                    to-background
                    p-5
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    mb-8
                  "
                >

                  <div
                    className="
                      absolute
                      -right-10
                      -top-10
                      h-32
                      w-32
                      rounded-full
                      bg-primary/20
                      blur-3xl
                    "
                  />


                  <div
                    className="
                      relative
                      space-y-5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

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
                            items-center
                            justify-center
                            rounded-xl
                            bg-primary/10
                            text-primary
                          "
                        >

                          <Icon
                            className="
                              h-5
                              w-5
                            "
                          />

                        </div>


                        <div>

                          <p
                            className="
                              font-bold
                            "
                          >

                            {getType(payment)}

                          </p>

                          <p
                            className="
                              text-xs
                              text-muted-foreground
                            "
                          >

                            {getItem(payment)}

                          </p>

                        </div>

                      </div>


                      <StatusBadge
                        status={
                          payment.status
                        }
                      />


                    </div>



                    <div
                      className="
                        flex
                        items-end
                        justify-between
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            text-muted-foreground
                          "
                        >

                          Amount

                        </p>


                        <p
                          className="
                            mt-1
                            text-2xl
                            font-black
                          "
                        >

                          {
                            formatAmount(
                              payment.amount || 0,
                            )
                          }

                        </p>

                      </div>


                      <div
                        className="
                          text-right
                        "
                      >

                        <p
                          className="
                            text-xs
                            text-muted-foreground
                          "
                        >

                          Date

                        </p>


                        <p
                          className="
                            mt-1
                            font-medium
                          "
                        >

                          {
                            formatDate(
                              payment.createdAt,
                            )
                          }

                        </p>

                      </div>


                    </div>


                  </div>


                </div>

              );

            },
          )
        }

      </div>


    </div>

  );

}