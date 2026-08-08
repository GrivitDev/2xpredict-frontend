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

const money = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

function formatPaymentType(type?: string) {
  if (!type) {
    return 'Payment';
  }

  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
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
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === 'approved') {
    return {
      icon: <CheckCircle2 className="h-4 w-4" />,
      classes:
        'border-emerald-500/20 bg-emerald-500/10 text-emerald-600',
    };
  }

  if (normalizedStatus === 'pending') {
    return {
      icon: <Clock3 className="h-4 w-4" />,
      classes:
        'border-amber-500/20 bg-amber-500/10 text-amber-600',
    };
  }

  if (normalizedStatus === 'rejected') {
    return {
      icon: <XCircle className="h-4 w-4" />,
      classes:
        'border-destructive/20 bg-destructive/10 text-destructive',
    };
  }

  return {
    icon: <Clock3 className="h-4 w-4" />,
    classes:
      'border-border bg-muted text-muted-foreground',
  };
}

export default function PaymentHistoryTable({
  payments,
}: Props) {
  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card
        shadow-sm
      "
    >
      {/* Header */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-border
          px-4
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
              text-primary
            "
          >
            <CreditCard className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              User financial transactions and payment records.
            </p>
          </div>
        </div>

        <span
          className="
            w-fit
            rounded-full
            bg-primary/10
            px-3
            py-1.5
            text-xs
            font-semibold
            text-primary
          "
        >
          {payments.length} payment
          {payments.length === 1 ? '' : 's'}
        </span>
      </div>

      {!payments.length ? (
        <div
          className="
            flex
            min-h-[260px]
            flex-col
            items-center
            justify-center
            p-6
            text-center
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-muted
              text-muted-foreground
            "
          >
            <CreditCard className="h-8 w-8" />
          </div>

          <h3 className="mt-5 font-bold">
            No payment history
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            This user has not made any payments yet.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}

          <div className="space-y-3 p-3 lg:hidden">
            {payments.map((payment) => {
              const date = formatPaymentDate(
                payment.createdAt,
              );

              return (
                <article
                  key={payment._id}
                  className="
                    rounded-2xl
                    border
                    border-border
                    bg-background
                    p-4
                    shadow-sm
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-primary/10
                          text-primary
                        "
                      >
                        <ReceiptText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {formatPaymentType(payment.type)}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {date.date} · {date.time}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-black text-primary">
                      {money(payment.amount)}
                    </p>
                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-3
                      border-t
                      border-border
                      pt-3
                    "
                  >
                    <PaymentStatus
                      status={payment.status}
                    />

                    {payment.reference && (
                      <span
                        className="
                          max-w-full
                          truncate
                          rounded-lg
                          bg-muted
                          px-2.5
                          py-1
                          font-mono
                          text-[11px]
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

          {/* Desktop table */}

          <div className="hidden overflow-hidden lg:block">
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[24%]" />
                <col className="w-[18%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>

              <thead
                className="
                  border-b
                  border-border
                  bg-muted/40
                "
              >
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Payment Type</TableHeader>
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
                        border-border/70
                        transition-colors
                        last:border-0
                        hover:bg-primary/[0.04]
                      "
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                          <div>
                            <p className="text-sm font-semibold">
                              {date.date}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {date.time}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="
                            inline-flex
                            max-w-full
                            truncate
                            rounded-full
                            bg-primary/10
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-primary
                          "
                        >
                          {formatPaymentType(payment.type)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm font-black text-primary">
                          {money(payment.amount)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <PaymentStatus
                          status={payment.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        {payment.reference ? (
                          <span
                            className="
                              inline-flex
                              max-w-full
                              items-center
                              gap-2
                              truncate
                              rounded-lg
                              bg-muted
                              px-2.5
                              py-1.5
                              font-mono
                              text-xs
                              text-muted-foreground
                            "
                          >
                            <Hash className="h-3.5 w-3.5 shrink-0" />

                            <span className="truncate">
                              {payment.reference}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
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

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1.5
        text-xs
        font-semibold
        capitalize
        ${config.classes}
      `}
    >
      {config.icon}

      {status}
    </span>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      className="
        px-4
        py-4
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-muted-foreground
        first:px-5
        last:px-5
      "
    >
      {children}
    </th>
  );
}