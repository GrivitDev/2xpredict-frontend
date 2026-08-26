'use client';

import {
  CalendarDays,
  Trophy,
  Wallet,
} from 'lucide-react';

type Purchase = {
  _id: string;
  createdAt: string;
  amount: number;
  predictionId?: {
    title?: string;
    league?: string;
  } | null;
};

type Props = {
  purchases: Purchase[];
};

const moneyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const money = (amount: number) =>
  moneyFormatter.format(Number(amount || 0));

export default function PurchaseHistoryTable({
  purchases,
}: Props) {
  return (
    <section
      aria-labelledby="purchase-history-title"
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
          gap-2.5
          border-b
          border-border/60
          px-4
          py-3
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
            rounded-md
            bg-emerald-500/10
            text-emerald-600
            dark:text-emerald-400
          "
        >
          <Trophy
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>

        <div className="min-w-0">
          <h2
            id="purchase-history-title"
            className="
              text-sm
              font-semibold
              tracking-tight
            "
          >
            Prediction Purchases
          </h2>

          <p className="text-[10px] text-muted-foreground">
            Purchased premium predictions
          </p>
        </div>
      </header>

      {purchases.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border/60 bg-muted/30">
              <tr>
                <TableHeader>Date</TableHeader>
                <TableHeader>Prediction</TableHeader>
                <TableHeader>Amount</TableHeader>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => {
                const prediction =
                  purchase.predictionId;

                return (
                  <tr
                    key={purchase._id}
                    className="
                      border-b
                      border-border/50
                      last:border-0
                      hover:bg-muted/20
                    "
                  >
                    {/* Date */}

                    <td className="whitespace-nowrap px-4 py-3">
                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          text-muted-foreground
                        "
                      >
                        <CalendarDays
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0"
                        />

                        {new Date(
                          purchase.createdAt,
                        ).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Prediction */}

                    <td className="px-4 py-3">
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
                            bg-emerald-500/10
                            text-emerald-600
                            dark:text-emerald-400
                          "
                        >
                          <Trophy
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold">
                            {prediction?.title ??
                              'Deleted Prediction'}
                          </p>

                          {prediction?.league && (
                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                              {prediction.league}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-md
                          bg-emerald-500/10
                          px-2
                          py-1
                          text-xs
                          font-semibold
                          text-emerald-600
                          dark:text-emerald-400
                        "
                      >
                        <Wallet
                          aria-hidden="true"
                          className="h-3 w-3"
                        />

                        {money(purchase.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div
      className="
        flex
        min-h-40
        flex-col
        items-center
        justify-center
        px-4
        py-8
        text-center
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-md
          bg-muted
          text-muted-foreground
        "
      >
        <Trophy
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <p className="mt-3 text-xs font-semibold">
        No purchases found
      </p>

      <p className="mt-1 max-w-xs text-[10px] text-muted-foreground">
        This user has not purchased any predictions.
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className="
        px-4
        py-2.5
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        text-muted-foreground
      "
    >
      {children}
    </th>
  );
}