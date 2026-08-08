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

type VerificationState =
  | 'verifying'
  | 'success'
  | 'pending'
  | 'failed';

export default function PaymentCallbackPage() {
  const [status, setStatus] =
    useState<VerificationState>('verifying');

  const [message, setMessage] =
    useState(
      'Please wait while we confirm your payment.',
    );

  const [reference, setReference] =
    useState<string | null>(null);

  const [gateway, setGateway] =
    useState<PaymentGateway | null>(null);

  const [transactionId, setTransactionId] =
    useState<string | null>(null);

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

          setMessage(
            result.message ??
              'Your payment has been successfully confirmed.',
          );

          return;
        }

        // =================================================
        // PENDING
        // =================================================

        if (
          result.status === 'pending'
        ) {
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
          error.response?.data?.message ??
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
    const controller =
      new AbortController();

    const processCallback =
      async () => {
        // ===============================================
        // READ CALLBACK PARAMETERS
        // ===============================================

        const searchParams =
          new URLSearchParams(
            window.location.search,
          );

        const gatewayParam =
          searchParams.get('gateway');

        const referenceParam =
          searchParams.get('reference');

        // ===============================================
        // VALIDATE GATEWAY
        // ===============================================

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

        // ===============================================
        // VALIDATE REFERENCE
        // ===============================================

        if (!referenceParam) {
          setStatus('failed');

          setMessage(
            'We could not find a payment reference for this transaction.',
          );

          return;
        }

        // ===============================================
        // VALID CALLBACK
        // ===============================================

        const selectedGateway:
          PaymentGateway =
          gatewayParam;

        setGateway(
          selectedGateway,
        );

        setReference(
          referenceParam,
        );

        // ===============================================
        // VERIFY PAYMENT
        // ===============================================

        await verifyPayment(
          selectedGateway,
          referenceParam,
          controller.signal,
        );
      };

      // Start asynchronously so the effect itself
      // does not synchronously call setState().
      void processCallback();

      return () => {
        controller.abort();
      };
  }, [verifyPayment]);

  // =====================================================
  // MANUAL RETRY
  // =====================================================

  function handleRetry() {
    if (
      !gateway ||
      !reference
    ) {
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
  }

  // =====================================================
  // VERIFYING
  // =====================================================

  if (status === 'verifying') {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          px-6
          py-16
        "
      >
        <div
          className="
            w-full
            max-w-lg
            rounded-3xl
            border
            bg-card
            p-8
            text-center
            shadow-xl
            sm:p-10
          "
        >
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-primary/10
            "
          >
            <Loader2
              size={38}
              className="
                animate-spin
                text-primary
              "
            />
          </div>

          <h1
            className="
              mt-6
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            Verifying Your Payment
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-md
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
            "
          >
            {message}
          </p>

          <div
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-2
              text-sm
              text-muted-foreground
            "
          >
            <ShieldCheck
              size={18}
              className="text-primary"
            />

            <span>
              Your payment is being securely
              verified.
            </span>
          </div>

          <p
            className="
              mt-6
              text-xs
              text-muted-foreground
            "
          >
            Please do not close or refresh
            this page.
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
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          px-6
          py-16
        "
      >
        <div
          className="
            w-full
            max-w-lg
            rounded-3xl
            border
            bg-card
            p-8
            text-center
            shadow-xl
            sm:p-10
          "
        >
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-primary/10
            "
          >
            <CheckCircle2
              size={42}
              className="text-primary"
            />
          </div>

          <h1
            className="
              mt-6
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            Payment Successful
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-md
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
            "
          >
            {message}
          </p>

          {reference && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                bg-muted/40
                p-4
                text-left
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-muted-foreground
                "
              >
                Payment Reference
              </p>

              <p
                className="
                  mt-1
                  break-all
                  font-mono
                  text-sm
                  font-semibold
                "
              >
                {reference}
              </p>
            </div>
          )}

          {transactionId && (
            <div
              className="
                mt-3
                rounded-2xl
                border
                bg-muted/40
                p-4
                text-left
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-muted-foreground
                "
              >
                Transaction ID
              </p>

              <p
                className="
                  mt-1
                  break-all
                  font-mono
                  text-sm
                  font-semibold
                "
              >
                {transactionId}
              </p>
            </div>
          )}

          <Link
            href="/dashboard"
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-6
              py-3
              font-semibold
              text-primary-foreground
              transition
              hover:bg-primary/90
            "
          >
            Go to Dashboard

            <ArrowRight size={18} />
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
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          px-6
          py-16
        "
      >
        <div
          className="
            w-full
            max-w-lg
            rounded-3xl
            border
            bg-card
            p-8
            text-center
            shadow-xl
            sm:p-10
          "
        >
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-amber-500/10
            "
          >
            <Clock3
              size={40}
              className="text-amber-500"
            />
          </div>

          <h1
            className="
              mt-6
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            Payment Still Processing
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-md
              text-sm
              leading-6
              text-muted-foreground
              sm:text-base
            "
          >
            {message}
          </p>

          {reference && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                bg-muted/40
                p-4
                text-left
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-muted-foreground
                "
              >
                Payment Reference
              </p>

              <p
                className="
                  mt-1
                  break-all
                  font-mono
                  text-sm
                  font-semibold
                "
              >
                {reference}
              </p>
            </div>
          )}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleRetry}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-6
                py-3
                font-semibold
                text-primary-foreground
                transition
                hover:bg-primary/90
              "
            >
              <RefreshCw size={18} />

              Check Payment Again
            </button>

            <Link
              href="/dashboard"
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-6
                py-3
                font-semibold
                transition
                hover:bg-muted
              "
            >
              Go to Dashboard

              <ArrowRight size={18} />
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
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-background
        px-6
        py-16
      "
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-3xl
          border
          bg-card
          p-8
          text-center
          shadow-xl
          sm:p-10
        "
      >
        <div
          className="
            mx-auto
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-destructive/10
          "
        >
          <AlertCircle
            size={42}
            className="text-destructive"
          />
        </div>

        <h1
          className="
            mt-6
            text-2xl
            font-black
            sm:text-3xl
          "
        >
          Payment Not Successful
        </h1>

        <p
          className="
            mx-auto
            mt-4
            max-w-md
            text-sm
            leading-6
            text-muted-foreground
            sm:text-base
          "
        >
          {message}
        </p>

        {reference && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              bg-muted/40
              p-4
              text-left
            "
          >
            <p
              className="
                text-xs
                font-medium
                text-muted-foreground
              "
            >
              Payment Reference
            </p>

            <p
              className="
                mt-1
                break-all
                font-mono
                text-sm
                font-semibold
              "
            >
              {reference}
            </p>
          </div>
        )}

        <div
          className="
            mt-8
            flex
            flex-col
            gap-3
          "
        >
          <button
            type="button"
            onClick={handleRetry}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-6
              py-3
              font-semibold
              text-primary-foreground
              transition
              hover:bg-primary/90
            "
          >
            <RefreshCw size={18} />

            Try Verification Again
          </button>

          <Link
            href="/pricing"
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-6
              py-3
              font-semibold
              transition
              hover:bg-muted
            "
          >
            <Home size={18} />

            Return to Pricing
          </Link>

          <Link
            href="/Contact"
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              px-6
              py-3
              text-sm
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