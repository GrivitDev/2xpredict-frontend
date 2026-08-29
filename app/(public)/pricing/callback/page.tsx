'use client';

import { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Home,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

import paymentGatewayService, {
  type PaymentGateway,
  type VerifyPaymentResponse,
} from '@/services/payment-gateway.service';
import { useAnalytics } from '@/hooks/use-analytics';

type VerificationState =
  | 'verifying'
  | 'success'
  | 'pending'
  | 'failed';

export default function PaymentCallbackPage() {
  const [status, setStatus] =
    useState<VerificationState>('verifying');

  const [message, setMessage] = useState(
    'Please wait while we confirm your payment.',
  );

  const [reference, setReference] =
    useState<string | null>(null);

  const [gateway, setGateway] =
    useState<PaymentGateway | null>(null);

  const [transactionId, setTransactionId] =
    useState<string | null>(null);

    const analytics = useAnalytics();

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  const verifyPayment = useCallback(
    async (
      selectedGateway: PaymentGateway,
      paymentReference: string,
      signal?: AbortSignal,
    ) => {
      try {
        const result: VerifyPaymentResponse =
          await paymentGatewayService.verifyPayment(
            selectedGateway,
            paymentReference,
          );

        if (signal?.aborted) {
          return;
        }

        setTransactionId(
          result.transactionId ?? null,
        );

        // =================================================
        // SUCCESS
        // =================================================

        if (
          result.success === true ||
          result.status === 'approved' ||
          result.status === 'success'
        ) {
          setStatus('success');

          analytics.track({
            eventType: 'custom',
            eventName: 'payment_success',
            properties: {
              gateway: selectedGateway,
              reference: paymentReference,
              transactionId:
                result.transactionId ?? null,
              status:
                result.status ?? 'approved',
            },
          });

          setMessage(
            result.message ??
              'Your payment has been successfully confirmed.',
          );

          return;
        }

        // =================================================
        // PENDING
        // =================================================

        if (result.status === 'pending') {
          setStatus('pending');

          setMessage(
            result.message ??
              'Your payment is still being processed. Please check again shortly.',
          );

          return;
        }

        // =================================================
        // FAILED
        // =================================================

        setStatus('failed');

        setMessage(
          result.message ??
            'We could not confirm your payment. If you were charged, please contact support.',
        );
      } catch (error: any) {
        if (signal?.aborted) {
          return;
        }

        console.error(
          'Payment verification error:',
          error,
        );

        const errorMessage =
          error?.response?.data?.message ??
          'We were unable to verify your payment at this time. Please try again.';

        setStatus('failed');

        setMessage(
          Array.isArray(errorMessage)
            ? errorMessage[0]
            : errorMessage,
        );
      }
    },
    [],
  );

  // =====================================================
  // INITIAL CALLBACK VERIFICATION
  // =====================================================

  useEffect(() => {
    const controller = new AbortController();

    const processCallback = async () => {
      const searchParams =
        new URLSearchParams(
          window.location.search,
        );

      const gatewayParam =
        searchParams.get('gateway');

      const referenceParam =
        searchParams.get('reference');

      // =================================================
      // VALIDATE GATEWAY
      // =================================================

      if (
        gatewayParam !== 'paystack' &&
        gatewayParam !== 'opay'
      ) {
        setStatus('failed');

        setMessage(
          'We could not identify the payment gateway used for this transaction.',
        );

        return;
      }

      // =================================================
      // VALIDATE REFERENCE
      // =================================================

      if (!referenceParam) {
        setStatus('failed');

        setMessage(
          'We could not find a payment reference for this transaction.',
        );

        return;
      }

      const selectedGateway: PaymentGateway =
        gatewayParam;

      setGateway(selectedGateway);
      setReference(referenceParam);

      // =================================================
      // VERIFY
      // =================================================

      await verifyPayment(
        selectedGateway,
        referenceParam,
        controller.signal,
      );
    };

    void processCallback();

    return () => {
      controller.abort();
    };
  }, [verifyPayment]);

  // =====================================================
  // MANUAL RETRY
  // =====================================================

  const handleRetry = () => {
    if (!gateway || !reference) {
      return;
    }

    setStatus('verifying');

    setMessage(
      'Please wait while we confirm your payment.',
    );

    setTransactionId(null);

    void verifyPayment(
      gateway,
      reference,
    );
  };

  // =====================================================
  // SHARED CARD
  // =====================================================

  const cardClassName = `
    w-full
    max-w-lg
    rounded-2xl
    border
    border-border/70
    bg-card/80
    p-6
    shadow-xl
    backdrop-blur-xl
    sm:p-8
  `;

  const primaryButtonClassName = `
    flex
    w-full
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-primary
    px-5
    py-3
    text-s
    font-semibold
    text-primary-foreground
    transition
    hover:bg-primary/90
    disabled:pointer-events-none
    disabled:opacity-50
  `;

  const secondaryButtonClassName = `
    flex
    w-full
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-border
    px-5
    py-3
    text-s
    font-semibold
    transition
    hover:bg-muted
  `;

  // =====================================================
  // VERIFYING
  // =====================================================

  if (status === 'verifying') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
        <div className={cardClassName}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2
              className="animate-spin text-primary"
              size={32}
            />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black tracking-tight">
              Verifying Your Payment
            </h1>

            <p className="mx-auto mt-3 max-w-md text-s leading-6 text-muted-foreground">
              {message}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <ShieldCheck
              size={16}
              className="shrink-0 text-primary"
            />

            <span>
              Your payment is being securely
              verified.
            </span>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Please do not close or refresh this
            page.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  if (status === 'success') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
        <div className={cardClassName}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2
              size={34}
              className="text-green-500"
            />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black tracking-tight">
              Payment Successful
            </h1>

            <p className="mx-auto mt-3 max-w-md text-s leading-6 text-muted-foreground">
              {message}
            </p>
          </div>

          {reference && (
            <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Payment Reference
              </p>

              <p className="mt-1 break-all font-mono text-xs font-semibold">
                {reference}
              </p>
            </div>
          )}

          {transactionId && (
            <div className="mt-2.5 rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Transaction ID
              </p>

              <p className="mt-1 break-all font-mono text-xs font-semibold">
                {transactionId}
              </p>
            </div>
          )}

          <Link
            href="/dashboard"
            className={`${primaryButtonClassName} mt-6`}
          >
            Go to Dashboard
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // PENDING
  // =====================================================

  if (status === 'pending') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
        <div className={cardClassName}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock3
              size={34}
              className="text-amber-500"
            />
          </div>

          <div className="mt-5 text-center">
            <h1 className="text-2xl font-black tracking-tight">
              Payment Still Processing
            </h1>

            <p className="mx-auto mt-3 max-w-md text-s leading-6 text-muted-foreground">
              {message}
            </p>
          </div>

          {reference && (
            <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Payment Reference
              </p>

              <p className="mt-1 break-all font-mono text-xs font-semibold">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={handleRetry}
              className={primaryButtonClassName}
            >
              <RefreshCw size={17} />
              Check Payment Again
            </button>

            <Link
              href="/dashboard"
              className={secondaryButtonClassName}
            >
              Go to Dashboard
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // FAILED
  // =====================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <div className={cardClassName}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle
            size={34}
            className="text-destructive"
          />
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-2xl font-black tracking-tight">
            Payment Not Successful
          </h1>

          <p className="mx-auto mt-3 max-w-md text-s leading-6 text-muted-foreground">
            {message}
          </p>
        </div>

        {reference && (
          <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-left">
            <p className="text-[11px] font-medium text-muted-foreground">
              Payment Reference
            </p>

            <p className="mt-1 break-all font-mono text-xs font-semibold">
              {reference}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={handleRetry}
            className={primaryButtonClassName}
          >
            <RefreshCw size={17} />
            Try Verification Again
          </button>

          <Link
            href="/pricing"
            className={secondaryButtonClassName}
          >
            <Home size={17} />
            Return to Pricing
          </Link>

          <Link
            href="/Contact"
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              px-5
              py-2.5
              text-xs
              font-medium
              text-muted-foreground
              transition
              hover:text-foreground
            "
          >
            Having a problem? Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}