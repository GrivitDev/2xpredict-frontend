'use client';

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hash,
  ReceiptText,
  XCircle,
} from 'lucide-react';

type Payment = {
  _id: string;
  createdAt: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
};

type Props = {
  payments: Payment[];
};

const moneyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const money = (amount: number) =>
  moneyFormatter.format(Number(amount || 0));

function formatPaymentType(type?: string) {
  if (!type) return 'Payment';

  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPaymentDate(date: string) {
  const paymentDate = new Date(date);

  return {
    date: paymentDate.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: paymentDate.toLocaleTimeString('en-NG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        icon: CheckCircle2,
        classes:
          'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      };

    case 'rejected':
      return {
        icon: XCircle,
        classes:
          'border-destructive/20 bg-destructive/10 text-destructive',
      };

    case 'pending':
    default:
      return {
        icon: Clock3,
        classes:
          'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      };
  }
}

export default function PaymentHistoryTable({
  payments,
}: Props) {
  return (
    <section
      aria-labelledby="payment-history-title"
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
          justify-between
          gap-3
          border-b
          border-border/60
          px-4
          py-3
        "
      >
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
              bg-primary/10
              text-primary
            "
          >
            <CreditCard
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0">
            <h2
              id="payment-history-title"
              className="
                text-sm
                font-semibold
                tracking-tight
              "
            >
              Payment History
            </h2>

            <p className="truncate text-[10px] text-muted-foreground">
              Financial transactions and payment records
            </p>
          </div>
        </div>

        <span
          className="
            shrink-0
            rounded-md
            bg-primary/10
            px-2
            py-1
            text-[10px]
            font-semibold
            text-primary
          "
        >
          {payments.length}{' '}
          {payments.length === 1 ? 'payment' : 'payments'}
        </span>
      </header>

      {!payments.length ? (
        <EmptyState />
      ) : (
        <>
          {/* Mobile */}

          <div className="space-y-2 p-2 lg:hidden">
            {payments.map((payment) => {
              const date = formatPaymentDate(
                payment.createdAt,
              );

              return (
                <article
                  key={payment._id}
                  className="
                    rounded-md
                    border
                    border-border/50
                    bg-background
                    p-3
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          bg-primary/10
                          text-primary
                        "
                      >
                        <ReceiptText
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {formatPaymentType(payment.type)}
                        </p>

                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {date.date} · {date.time}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-xs font-bold text-primary">
                      {money(payment.amount)}
                    </p>
                  </div>

                  <div
                    className="
                      mt-2.5
                      flex
                      min-w-0
                      items-center
                      justify-between
                      gap-2
                      border-t
                      border-border/50
                      pt-2.5
                    "
                  >
                    <PaymentStatus status={payment.status} />

                    {payment.reference && (
                      <span
                        title={payment.reference}
                        className="
                          max-w-[55%]
                          truncate
                          rounded-md
                          bg-muted
                          px-2
                          py-1
                          font-mono
                          text-[9px]
                          text-muted-foreground
                        "
                      >
                        {payment.reference}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Reference</TableHeader>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => {
                  const date = formatPaymentDate(
                    payment.createdAt,
                  );

                  return (
                    <tr
                      key={payment._id}
                      className="
                        border-b
                        border-border/50
                        last:border-0
                        hover:bg-muted/20
                      "
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0 text-primary"
                          />

                          <div>
                            <p className="text-xs font-medium">
                              {date.date}
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {date.time}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className="
                            inline-flex
                            max-w-full
                            truncate
                            rounded-md
                            bg-primary/10
                            px-2
                            py-1
                            text-[10px]
                            font-medium
                            text-primary
                          "
                        >
                          {formatPaymentType(payment.type)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-primary">
                          {money(payment.amount)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <PaymentStatus status={payment.status} />
                      </td>

                      <td className="max-w-[220px] px-4 py-3">
                        {payment.reference ? (
                          <span
                            title={payment.reference}
                            className="
                              inline-flex
                              max-w-full
                              items-center
                              gap-1.5
                              truncate
                              rounded-md
                              bg-muted
                              px-2
                              py-1
                              font-mono
                              text-[10px]
                              text-muted-foreground
                            "
                          >
                            <Hash
                              aria-hidden="true"
                              className="h-3 w-3 shrink-0"
                            />

                            <span className="truncate">
                              {payment.reference}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function PaymentStatus({
  status,
}: {
  status: string;
}) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-md
        border
        px-2
        py-1
        text-[10px]
        font-medium
        capitalize
        ${config.classes}
      `}
    >
      <Icon
        aria-hidden="true"
        className="h-3 w-3"
      />

      {status || 'Pending'}
    </span>
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
        <CreditCard
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <h3 className="mt-3 text-xs font-semibold">
        No payment history
      </h3>

      <p className="mt-1 max-w-xs text-[10px] text-muted-foreground">
        This user has not made any payments yet.
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