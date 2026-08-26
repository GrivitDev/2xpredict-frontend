'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Image from 'next/image';

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Wallet,
  XCircle,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  approvePayment,
  getPendingPayments,
  rejectPayment,
} from '@/services/admin-payments.service';

import { useAdminRealtime } from '@/hooks/useAdminRealtime';

interface Payment {
  _id: string;
  type: string;
  amount: number;
  email: string;
  proofImageUrl?: string;
}

interface PaymentsReviewPanelProps {
  token: string;
}

export default function PaymentsReviewPanel({
  token,
}: PaymentsReviewPanelProps) {
  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);

  const [processing, setProcessing] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getPendingPayments(token);

      setPayments(data);
    } catch {
      toast.error(
        'Unable to load pending payments',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useAdminRealtime((event, data: Payment) => {
    if (event === 'payment:new') {
      setPayments((prev) => [
        data,
        ...prev.filter(
          (payment) => payment._id !== data._id,
        ),
      ]);

      toast.success('New payment received');

      return;
    }

    if (event === 'payment:update') {
      setPayments((prev) =>
        prev.filter(
          (payment) =>
            payment._id !== data._id,
        ),
      );
    }
  });

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id);

      await approvePayment(token, id);

      setPayments((prev) =>
        prev.filter((payment) => payment._id !== id),
      );

      toast.success('Payment approved');
    } catch {
      toast.error('Failed to approve payment');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessing(id);

      await rejectPayment(token, id);

      setPayments((prev) =>
        prev.filter((payment) => payment._id !== id),
      );

      toast.success('Payment rejected');
    } catch {
      toast.error('Failed to reject payment');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <PaymentsSkeleton />;
  }

  return (
    <section
      aria-labelledby="payment-review-title"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      <header
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-border/60
          px-4
          py-3.5
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
            <Wallet
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          <div className="min-w-0">
            <h3
              id="payment-review-title"
              className="
                text-sm
                font-semibold
                tracking-tight
              "
            >
              Payment Verification
            </h3>

            <p
              className="
                mt-0.5
                truncate
                text-[11px]
                text-muted-foreground
              "
            >
              Review and approve subscription payments.
            </p>
          </div>
        </div>

        <span
          role="status"
          className="
            inline-flex
            shrink-0
            items-center
            gap-1.5
            rounded-md
            border
            border-orange-500/20
            bg-orange-500/5
            px-2
            py-1
            text-[11px]
            font-medium
            text-orange-600
          "
        >
          <Clock3
            aria-hidden="true"
            className="h-3 w-3"
          />

          {payments.length} Pending
        </span>
      </header>

      {payments.length === 0 ? (
        <EmptyPayments />
      ) : (
        <div
          className="
            divide-y
            divide-border/50
          "
        >
          {payments.map((payment) => (
            <PaymentItem
              key={payment._id}
              payment={payment}
              processing={
                processing === payment._id
              }
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PaymentItem({
  payment,
  processing,
  onApprove,
  onReject,
}: {
  payment: Payment;
  processing: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <article
      className="
        p-3.5
        transition-colors
        hover:bg-muted/10
      "
    >
      <div
        className="
          flex
          flex-col
          gap-3
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-md
                border
                border-orange-500/20
                bg-orange-500/5
                px-1.5
                py-0.5
                text-[10px]
                font-medium
                text-orange-600
              "
            >
              <AlertTriangle
                aria-hidden="true"
                className="h-3 w-3"
              />

              Awaiting Approval
            </span>
          </div>

          <dl
            className="
              mt-3
              grid
              gap-x-6
              gap-y-1.5
              text-xs
              sm:grid-cols-2
            "
          >
            <PaymentDetail
              label="Type"
              value={payment.type}
            />

            <PaymentDetail
              label="Amount"
              value={`₦${payment.amount.toLocaleString()}`}
            />

            <PaymentDetail
              label="User"
              value={payment.email}
            />
          </dl>
        </div>

        {payment.proofImageUrl && (
          <a
            href={payment.proofImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open payment proof"
            className="
              group
              relative
              block
              h-24
              w-full
              shrink-0
              overflow-hidden
              rounded-md
              border
              border-border/60
              bg-muted
              sm:w-36
              lg:h-20
              lg:w-32
            "
          >
            <Image
              src={payment.proofImageUrl}
              alt="Payment proof"
              fill
              sizes="128px"
              className="
                object-cover
                transition-transform
                group-hover:scale-[1.02]
              "
            />

            <span
              className="
                absolute
                right-1.5
                top-1.5
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-md
                bg-background/90
                text-foreground
                shadow-sm
              "
            >
              <ExternalLink
                aria-hidden="true"
                className="h-3 w-3"
              />
            </span>
          </a>
        )}
      </div>

      <div
        className="
          mt-3
          flex
          items-center
          gap-2
        "
      >
        <button
          type="button"
          disabled={processing}
          onClick={() =>
            onApprove(payment._id)
          }
          className="
            inline-flex
            h-8
            items-center
            gap-1.5
            rounded-md
            bg-emerald-600
            px-3
            text-xs
            font-medium
            text-white
            transition-opacity
            hover:opacity-90
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-emerald-600
            focus-visible:ring-offset-2
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          {processing ? (
            <Loader2
              aria-hidden="true"
              className="
                h-3.5
                w-3.5
                animate-spin
              "
            />
          ) : (
            <CheckCircle2
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
          )}

          {processing
            ? 'Processing...'
            : 'Approve'}
        </button>

        <button
          type="button"
          disabled={processing}
          onClick={() =>
            onReject(payment._id)
          }
          className="
            inline-flex
            h-8
            items-center
            gap-1.5
            rounded-md
            border
            border-destructive/30
            bg-destructive/5
            px-3
            text-xs
            font-medium
            text-destructive
            transition-colors
            hover:bg-destructive/10
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-destructive
            focus-visible:ring-offset-2
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          <XCircle
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />

          Reject
        </button>
      </div>
    </article>
  );
}

function PaymentDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="inline text-muted-foreground">
        {label}:{' '}
      </dt>

      <dd className="inline font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function EmptyPayments() {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        px-4
        py-10
        text-center
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-emerald-500/10
          text-emerald-600
        "
      >
        <CheckCircle2
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <h4
        className="
          mt-2.5
          text-xs
          font-semibold
        "
      >
        Everything is clear
      </h4>

      <p
        className="
          mt-1
          text-[11px]
          text-muted-foreground
        "
      >
        No pending payments require attention.
      </p>
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading payment verification"
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      <div
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-border/60
          px-4
          py-3.5
        "
      >
        <div
          className="
            h-8
            w-8
            animate-pulse
            rounded-md
            bg-muted
          "
        />

        <div className="space-y-1.5">
          <div
            className="
              h-3.5
              w-40
              animate-pulse
              rounded
              bg-muted
            "
          />

          <div
            className="
              h-2.5
              w-56
              animate-pulse
              rounded
              bg-muted
            "
          />
        </div>
      </div>

      <div className="space-y-3 p-3.5">
        <div
          className="
            h-28
            animate-pulse
            rounded-lg
            bg-muted/60
          "
        />

        <div
          className="
            h-28
            animate-pulse
            rounded-lg
            bg-muted/60
          "
        />
      </div>
    </section>
  );
}