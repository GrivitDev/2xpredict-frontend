'use client';

import {
  Wallet,
  Crown,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';


// ============================================================
// TYPES
// ============================================================

interface Props {
  loading: boolean;
  payments: any[];
}


// ============================================================
// CONSTANTS
// ============================================================

const TYPE_LABELS: Record<string, string> = {
  subscription: 'Subscription',
  vip_upgrade: 'VIP Upgrade',
  prediction: 'Prediction Purchase',
};

const TYPE_ICONS: Record<string, typeof CreditCard> = {
  vip_upgrade: Crown,
  prediction: ShoppingBag,
};

const STATUS_CLASSES: Record<string, string> = {
  approved: `
    border-emerald-500/20
    bg-emerald-500/10
    text-emerald-600
    dark:text-emerald-400
  `,
  pending: `
    border-amber-500/20
    bg-amber-500/10
    text-amber-600
    dark:text-amber-400
  `,
  rejected: `
    border-red-500/20
    bg-red-500/10
    text-red-600
    dark:text-red-400
  `,
};

const DEFAULT_STATUS_CLASS = `
  border-border/50
  bg-muted/50
  text-muted-foreground
`;

const TABLE_HEADERS = [
  'Type',
  'Item',
  'Amount',
  'Status',
  'Date',
];


// ============================================================
// FORMATTERS
// ============================================================

const amountFormatter = new Intl.NumberFormat(
  'en-GB',
  {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  },
);

const dateFormatter = new Intl.DateTimeFormat(
  'en-GB',
  {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
);


// ============================================================
// HELPERS
// ============================================================

function getType(payment: any): string {
  return TYPE_LABELS[payment.type] ?? payment.type;
}


function getItem(payment: any): string {
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


function getStatusClass(status: string): string {
  return STATUS_CLASSES[status] ?? DEFAULT_STATUS_CLASS;
}


function getIcon(type: string) {
  return TYPE_ICONS[type] ?? CreditCard;
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyTransactions() {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        rounded-xl border border-dashed
        border-border/60 bg-card
        px-4 py-10 text-center
      "
    >
      <div
        className="
          mb-2 flex h-9 w-9
          items-center justify-center
          rounded-lg bg-primary/10
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


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <Badge
      variant="outline"
      className={`
        rounded-full
        px-2
        py-0.5
        text-[9px]
        font-medium
        capitalize
        ${getStatusClass(status)}
      `}
    >
      {status}
    </Badge>
  );
}


// ============================================================
// DESKTOP TABLE
// ============================================================

function DesktopTransactions({
  payments,
}: {
  payments: any[];
}) {
  return (
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
      <table className="w-full text-xs">
        <thead>
          <tr
            className="
              border-b
              border-border/60
              bg-muted/30
            "
          >
            {TABLE_HEADERS.map((header) => (
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
          {payments.map((payment) => {
            const type = getType(payment);
            const item = getItem(payment);

            return (
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
                <td className="px-4 py-3 font-semibold">
                  {type}
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
                  {item}
                </td>

                <td
                  className="
                    px-4
                    py-3
                    font-bold
                    tabular-nums
                  "
                >
                  {amountFormatter.format(
                    Number(payment.amount || 0),
                  )}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge
                    status={payment.status}
                  />
                </td>

                <td
                  className="
                    px-4
                    py-3
                    text-muted-foreground
                  "
                >
                  {dateFormatter.format(
                    new Date(payment.createdAt),
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


// ============================================================
// MOBILE TRANSACTIONS
// ============================================================

function MobileTransactions({
  payments,
}: {
  payments: any[];
}) {
  return (
    <div className="space-y-2 md:hidden">
      {payments.map((payment) => {
        const type = getType(payment);
        const item = getItem(payment);
        const Icon = getIcon(payment.type);

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
                      {type}
                    </p>

                    <p
                      className="
                        truncate
                        text-[10px]
                        text-muted-foreground
                      "
                    >
                      {item}
                    </p>
                  </div>
                </div>

                <StatusBadge
                  status={payment.status}
                />
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
                    {amountFormatter.format(
                      Number(payment.amount || 0),
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
                    {dateFormatter.format(
                      new Date(payment.createdAt),
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
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
    return <EmptyTransactions />;
  }

  return (
    <div className="space-y-3">
      <DesktopTransactions payments={payments} />

      <MobileTransactions payments={payments} />
    </div>
  );
}