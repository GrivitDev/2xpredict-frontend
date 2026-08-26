'use client';

import Image from 'next/image';
import { useState } from 'react';

import {
  AlertCircle,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';

import paymentGatewayService, {
  type PaymentGateway,
  type PaymentCurrency,
} from '@/services/payment-gateway.service';

import type { PlanConfig } from '@/types/plan-config';

import PaymentModal from './PaymentModal';

interface GatewayModalProps {
  type:
    | 'subscription'
    | 'prediction'
    | 'vip_upgrade';

  target: string;
  amount: number;
  currency: PaymentCurrency;
  config: PlanConfig;

  title?: string;
  description?: string;

  onClose: () => void;
}

export default function GatewayModal({
  type,
  target,
  amount,
  currency,
  config,
  title,
  description,
  onClose,
}: GatewayModalProps) {
  const [loadingGateway, setLoadingGateway] =
    useState<PaymentGateway | null>(null);

  const [error, setError] = useState('');
  const [manualPayment, setManualPayment] =
    useState(false);

  async function initializePayment(
    gateway: PaymentGateway,
  ) {
    try {
      setError('');
      setLoadingGateway(gateway);

      const data =
        await paymentGatewayService.initializePayment({
          gateway,
          type,
          target,
          currency,
        });

      window.location.href =
        data.authorizationUrl;
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        'Unable to initialize payment. Please try again.';

      setError(
        Array.isArray(message)
          ? message[0]
          : message,
      );
    } finally {
      setLoadingGateway(null);
    }
  }

  if (manualPayment) {
    return (
      <PaymentModal
        type={type}
        target={target}
        amount={amount}
        currency={currency}
        config={config}
        title={title}
        description={description}
        onClose={() => setManualPayment(false)}
      />
    );
  }

  const isLoading =
    loadingGateway !== null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-start
        justify-center
        overflow-y-auto
        bg-black/60
        p-3
        backdrop-blur-md
        sm:items-center
        sm:p-4
      "
    >
      <div
        className="
          relative
          my-2
          flex
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-2xl
          border
          bg-background
          shadow-2xl
          sm:my-0
          max-h-[calc(100vh-1.5rem)]
          sm:max-h-[calc(100vh-2rem)]
        "
      >

        {/* CLOSE */}

        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close payment gateway modal"
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            bg-background/90
            shadow-sm
            transition
            hover:bg-muted
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={16} />
        </button>


        {/* HEADER */}

        <div
          className="
            shrink-0
            border-b
            bg-gradient-to-b
            from-primary/10
            via-primary/5
            to-transparent
            px-5
            py-5
            sm:px-6
            sm:py-6
          "
        >
          <p className="text-xs font-semibold text-primary">
            Payment Gateway
          </p>

          <h2
            className="
              mt-1.5
              pr-10
              text-xl
              font-black
              sm:text-2xl
            "
          >
            {title ?? 'Choose Payment Method'}
          </h2>

          <p
            className="
              mt-2
              max-w-xl
              text-xs
              leading-5
              text-muted-foreground
              sm:text-s
            "
          >
            {description ??
              'Select your preferred payment gateway to complete your payment securely.'}
          </p>


          {/* AMOUNT */}

          <div
            className="
              mt-4
              rounded-xl
              border
              border-primary/20
              bg-primary/5
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <p className="text-xs text-muted-foreground">
                Amount
              </p>

              <h3
                className="
                  text-2xl
                  font-black
                  sm:text-3xl
                "
              >
                {currency === 'NGN'
                  ? '₦'
                  : '$'}
                {amount.toLocaleString()}
              </h3>
            </div>

            {type !== 'prediction' && (
              <p
                className="
                  mt-1
                  text-xs
                  text-muted-foreground
                "
              >
                Valid for{' '}
                {config.subscriptionDurationDays}{' '}
                days
              </p>
            )}
          </div>
        </div>


        {/* BODY */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-5
            sm:p-6
          "
        >
          <h3 className="mb-3 text-base font-bold">
            Select Gateway
          </h3>


          {/* PAYSTACK */}

          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              initializePayment('paystack')
            }
            className="
              group
              flex
              w-full
              items-center
              justify-between
              rounded-xl
              border
              bg-card
              p-4
              text-left
              transition-all
              hover:border-primary
              hover:bg-primary/5
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-4
              "
            >
              <div
                className="
                  relative
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                "
              >
                <Image
                  src="/gateway/paystack.png"
                  alt="Paystack"
                  width={80}
                  height={80}
                  priority
                  className="
                    h-20
                    w-20
                    max-w-none
                    scale-150
                    object-contain
                  "
                />

                {loadingGateway ===
                  'paystack' && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      bg-background/80
                      backdrop-blur-sm
                    "
                  >
                    <Loader2
                      size={20}
                      className="
                        animate-spin
                        text-primary
                      "
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-base font-bold">
                  Paystack
                </h4>

                <p
                  className="
                    mt-0.5
                    text-xs
                    leading-5
                    text-muted-foreground
                    sm:text-s
                  "
                >
                  Debit Card, Bank Transfer,
                  USSD and more.
                </p>
              </div>
            </div>

            <ArrowRight
              size={18}
              className="
                ml-3
                shrink-0
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>


          {/* ERROR */}

          {error && (
            <div
              className="
                mt-4
                flex
                items-start
                gap-2.5
                rounded-xl
                border
                border-destructive/20
                bg-destructive/10
                p-3
                text-destructive
              "
            >
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
              />

              <span className="text-xs leading-5">
                {error}
              </span>
            </div>
          )}


          {/* MANUAL PAYMENT */}

          <div
            className="
              mt-5
              rounded-xl
              border
              border-amber-500/20
              bg-amber-500/5
              p-4
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <AlertCircle
                size={18}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-500
                "
              />

              <div className="min-w-0">
                <h4 className="text-s font-semibold">
                  Having trouble with Paystack?
                </h4>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Manual payment is only available
                  as a fallback if Paystack is
                  temporarily unavailable or your
                  payment has failed several times.
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    font-medium
                    leading-5
                    text-foreground
                  "
                >
                  Please contact an admin before
                  making any manual payment. Do not
                  transfer money without first
                  receiving confirmation from the
                  admin.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setManualPayment(true)}
              disabled={isLoading}
              className="
                mt-4
                w-full
                rounded-lg
                border
                border-amber-500/40
                bg-background
                px-4
                py-2.5
                text-s
                font-semibold
                text-amber-600
                transition-all
                hover:border-amber-500
                hover:bg-amber-500/10
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:text-amber-400
              "
            >
              Proceed to Manual Payment
            </button>
          </div>


          {/* CANCEL */}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="
                rounded-lg
                border
                px-5
                py-2
                text-s
                font-medium
                transition
                hover:bg-muted
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}