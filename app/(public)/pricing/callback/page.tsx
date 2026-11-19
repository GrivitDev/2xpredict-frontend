'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FaArrowRight,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaHouse,
  FaRotateRight,
  FaShieldHalved,
  FaSpinner,
} from 'react-icons/fa6';

import { useAnalytics } from '@/hooks/use-analytics';
import { useGetMyPaymentsQuery } from '@/hooks/use-payments';
import { useGetStatusQuery } from '@/hooks/use-subscriptions';
import { useVerifyPaymentMutation } from '@/hooks/use-payment-gateways';
import { useAuth } from '@/providers/auth-provider';
import type { PaymentGateway } from '@/types/payment-gateways';

type VerificationState = 'verifying' | 'success' | 'processing' | 'pending' | 'failed' | 'unavailable';

type PaymentVerificationError = {
  response?: {
    status?: number;
    data?: {
      message?: unknown;
    };
  };
};

function getErrorMessage(error: unknown): string {
  const typed = error as PaymentVerificationError | null;
  const message = typed?.response?.data?.message;
  if (Array.isArray(message)) return String(message[0]);
  if (typeof message === 'string' && message.trim()) return message;
  return 'We could not reach the payment verification service. Your payment has not been marked as failed.';
}

function getHttpStatus(error: unknown): number | undefined {
  const status = (error as PaymentVerificationError | null)?.response?.status;
  return typeof status === 'number' ? status : undefined;
}

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<VerificationState>('verifying');
  const [message, setMessage] = useState('Please wait while we confirm your payment.');
  const [reference, setReference] = useState<string | null>(null);
  const [gateway, setGateway] = useState<PaymentGateway | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [processingTimedOut, setProcessingTimedOut] = useState(false);
  const analytics = useAnalytics();
  const { user, token, loading: authLoading } = useAuth();
  const authenticated = Boolean(user || token);
  const verifyMutation = useVerifyPaymentMutation();
  const accountQueriesEnabled = authenticated && (status === 'success' || status === 'processing');
  const paymentsQuery = useGetMyPaymentsQuery({
    enabled: accountQueriesEnabled,
    refetchInterval: status === 'processing' && !processingTimedOut ? 5_000 : false,
  });
  const subscriptionQuery = useGetStatusQuery({
    enabled: accountQueriesEnabled,
    refetchInterval: status === 'processing' && !processingTimedOut ? 5_000 : false,
  });
  const parsedUrlRef = useRef(false);
  const autoVerifiedReferenceRef = useRef<string | null>(null);
  const verificationSequenceRef = useRef(0);

  const verifyPayment = useCallback(async (paymentReference: string) => {
    const sequence = ++verificationSequenceRef.current;
    setStatus('verifying');
    setMessage('Please wait while we confirm your payment.');
    setTransactionId(null);

    try {
      const result = await verifyMutation.mutateAsync({ query: { reference: paymentReference } });
      if (sequence !== verificationSequenceRef.current) return;

      setTransactionId(result.transactionId ?? null);
      if (result.status === 'approved' && result.success === true) {
        setStatus('success');
        setMessage(result.message || 'Your payment has been confirmed successfully.');
        analytics.track({
          eventType: 'custom',
          eventName: 'payment_success',
          properties: {
            gateway: 'paystack',
            reference: paymentReference,
            transactionId: result.transactionId ?? null,
            status: result.status,
          },
        });
        return;
      }

      if (result.status === 'processing') {
        setProcessingTimedOut(false);
        setStatus('processing');
        setMessage(result.message || 'Your payment is confirmed. Your subscription access is still being activated.');
        return;
      }

      if (result.status === 'pending') {
        setStatus('pending');
        setMessage(result.message || 'Paystack has not returned a final result. Your payment remains open; check again shortly.');
        return;
      }

      setStatus('failed');
      setMessage(result.message || 'We could not confirm this payment. Contact support with the reference below if your account was charged.');
    } catch (error: unknown) {
      if (sequence !== verificationSequenceRef.current) return;
      const httpStatus = getHttpStatus(error);
      setMessage(getErrorMessage(error));
      if (httpStatus === 401 || httpStatus === 403) {
        setStatus('unavailable');
        setMessage('Your session is no longer available. Sign in with the account used for this payment, then check the reference from your account billing page.');
      } else if (httpStatus === 400 || httpStatus === 404) {
        setStatus('failed');
      } else {
        // A network or server error is not proof that the provider declined the payment.
        setStatus('pending');
      }
    }
  }, [analytics, verifyMutation.mutateAsync]);

  useEffect(() => {
    if (parsedUrlRef.current) return;
    parsedUrlRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const gatewayParam = params.get('gateway');
    const paymentReference = (params.get('reference') ?? params.get('trxref'))?.trim();

    if (gatewayParam && gatewayParam.toLowerCase() !== 'paystack') {
      setStatus('failed');
      setMessage('This payment return URL uses an unsupported gateway.');
      return;
    }

    if (!paymentReference || paymentReference.length > 120) {
      setStatus('failed');
      setMessage('A valid payment reference could not be found in the return URL.');
      return;
    }

    setGateway('paystack');
    setReference(paymentReference);
  }, []);

  useEffect(() => {
    if (!reference || gateway !== 'paystack' || authLoading) return;
    if (!authenticated) {
      setStatus('unavailable');
      setMessage('Sign in with the account used for this payment to verify its status.');
      return;
    }
    if (autoVerifiedReferenceRef.current === reference) return;
    autoVerifiedReferenceRef.current = reference;
    void verifyPayment(reference);
  }, [authLoading, authenticated, gateway, reference, verifyPayment]);

  useEffect(() => {
    if (status !== 'processing') {
      setProcessingTimedOut(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setProcessingTimedOut(true);
      setMessage('Payment is confirmed, but account activation is taking longer than usual. Your payment remains recorded; refresh your account status or contact support with this reference.');
    }, 60_000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    if (!reference || status !== 'processing') return;
    const payment = paymentsQuery.data?.find((item) => item.reference === reference);
    if (payment?.status === 'approved') {
      setStatus('success');
      setMessage('Your payment has been approved and your account status has been refreshed.');
    } else if (payment?.status === 'rejected') {
      setStatus('failed');
      setMessage('This payment was rejected. Contact support with the reference below if you believe this is incorrect.');
    }
  }, [paymentsQuery.data, reference, status]);

  const retryVerification = () => {
    if (!reference || !gateway || authLoading || !authenticated) return;
    void verifyPayment(reference);
  };

  const refreshAccountState = async () => {
    const [paymentsResult] = await Promise.all([
      paymentsQuery.refetch(),
      subscriptionQuery.refetch(),
    ]);
    const payment = paymentsResult.data?.find((item) => item.reference === reference);
    if (payment?.status === 'approved') {
      setStatus('success');
      setMessage('Your payment is approved and your account has been refreshed.');
    } else if (payment?.status === 'rejected') {
      setStatus('failed');
      setMessage('This payment was rejected. Contact support with the reference below if you believe this is incorrect.');
    } else if (payment?.status === 'processing') {
      setMessage('Payment is verified. Account activation is still processing; no additional payment is required.');
    } else {
      setMessage('Your payment is still being processed. No additional payment is required while this reference remains open.');
    }
  };

  const statusPresentation = {
    verifying: {
      title: 'Verifying your payment',
      icon: FaSpinner,
      iconClass: 'animate-spin text-brand-burgundy',
      iconWrap: 'bg-brand-burgundy/10',
    },
    success: {
      title: 'Payment successful',
      icon: FaCircleCheck,
      iconClass: 'text-emerald-600',
      iconWrap: 'bg-emerald-500/10',
    },
    processing: {
      title: 'Activating your account',
      icon: FaClock,
      iconClass: 'text-sky-600',
      iconWrap: 'bg-sky-500/10',
    },
    pending: {
      title: 'Payment still processing',
      icon: FaClock,
      iconClass: 'text-amber-600',
      iconWrap: 'bg-amber-500/10',
    },
    failed: {
      title: 'Payment not confirmed',
      icon: FaCircleExclamation,
      iconClass: 'text-destructive',
      iconWrap: 'bg-destructive/10',
    },
    unavailable: {
      title: 'Sign-in required',
      icon: FaCircleExclamation,
      iconClass: 'text-amber-600',
      iconWrap: 'bg-amber-500/10',
    },
  } satisfies Record<VerificationState, {
    title: string;
    icon: typeof FaSpinner;
    iconClass: string;
    iconWrap: string;
  }>;

  const presentation = statusPresentation[status];
  const StatusIcon = presentation.icon;
  const canRetry = Boolean(reference && gateway && authenticated && !authLoading);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-xl shadow-brand-burgundy/[0.04] backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-brand-burgundy via-brand-champagne to-brand-burgundy" />
        <div className="p-6 sm:p-8">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${presentation.iconWrap}`}>
            <StatusIcon aria-hidden="true" className={`h-7 w-7 ${presentation.iconClass}`} />
          </div>

          <div className="mt-5 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-burgundy">
              2xPredict Payments
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {presentation.title}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              {authLoading ? 'Restoring your secure session…' : message}
            </p>
          </div>

          {status === 'verifying' && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3.5 text-xs leading-5 text-muted-foreground">
              <FaShieldHalved aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-burgundy" />
              <p>Payment confirmation is checked securely with the payment provider. Do not make another payment while this check is running.</p>
            </div>
          )}

          {(status === 'pending' || status === 'processing') && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs leading-5 text-muted-foreground">
              <FaShieldHalved aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>Do not make another payment for this purchase. Keep this reference and check its status again.</p>
            </div>
          )}

          {(reference || transactionId) && (
            <div className="mt-6 space-y-2 rounded-xl border border-border/70 bg-muted/25 p-3.5">
              {reference && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment reference</p>
                  <p className="mt-1 break-all font-mono text-xs font-semibold text-foreground">{reference}</p>
                </div>
              )}
              {transactionId && (
                <div className={reference ? 'border-t border-border/70 pt-2' : ''}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Transaction ID</p>
                  <p className="mt-1 break-all font-mono text-xs font-semibold text-foreground">{transactionId}</p>
                </div>
              )}
            </div>
          )}

          {status === 'success' ? (
            <Link
              href="/profile"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-burgundy px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus-visible:ring-offset-2"
            >
              View account <FaArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          ) : status === 'verifying' ? (
            <div className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-burgundy/10 px-5 py-3 text-sm font-semibold text-brand-burgundy">
              <FaSpinner aria-hidden="true" className="h-4 w-4 animate-spin" />
              Checking payment…
            </div>
          ) : (
            <div className="mt-6 space-y-2.5">
              {status === 'processing' ? (
                <button
                  type="button"
                  onClick={() => void refreshAccountState()}
                  disabled={!authenticated || paymentsQuery.isFetching || subscriptionQuery.isFetching}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-burgundy px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaRotateRight aria-hidden="true" className="h-3.5 w-3.5" />
                  {paymentsQuery.isFetching || subscriptionQuery.isFetching ? 'Refreshing account…' : 'Refresh account status'}
                </button>
              ) : status === 'unavailable' && !authenticated ? (
                <Link
                  href="/login"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-burgundy px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                >
                  Sign in to verify payment <FaArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={retryVerification}
                  disabled={!canRetry || verifyMutation.isPending}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-burgundy px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaRotateRight aria-hidden="true" className="h-3.5 w-3.5" />
                  {verifyMutation.isPending ? 'Checking…' : 'Check payment again'}
                </button>
              )}
              <Link
                href="/profile"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
              >
                <FaHouse aria-hidden="true" className="h-3.5 w-3.5" />
                View account billing
              </Link>
              <Link
                href="/Contact"
                className="flex min-h-10 w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                If you were charged, contact support and include your payment reference.
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
