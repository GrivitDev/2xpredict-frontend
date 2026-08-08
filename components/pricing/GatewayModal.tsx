'use client';

import Image from 'next/image';

import { useState } from 'react';

import { motion } from 'framer-motion';

import {
  AlertCircle,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';

import paymentGatewayService, {
  type PaymentGateway,
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

  config: PlanConfig;

  title?: string;

  description?: string;

  onClose: () => void;
}

export default function GatewayModal({
  type,
  target,
  amount,
  config,
  title,
  description,
  onClose,
}: GatewayModalProps) {
  const [loadingGateway, setLoadingGateway] =
    useState<PaymentGateway | null>(null);

  const [error, setError] =
    useState('');

  const [manualPayment, setManualPayment] =
    useState(false);

  // =====================================================
  // INITIALIZE GATEWAY PAYMENT
  // =====================================================

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
        });

      // Redirect user to Paystack or OPay.
      // The gateway will redirect the user back
      // to the callback page after payment.
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

  // =====================================================
  // MANUAL PAYMENT
  // =====================================================

  if (manualPayment) {
    return (
      <PaymentModal
        type={type}
        target={target}
        amount={amount}
        config={config}
        title={title}
        description={description}
        onClose={() => {
          setManualPayment(false);
          onClose();
        }}
      />
    );
  }

  // =====================================================
  // GATEWAY MODAL
  // =====================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        overflow-y-auto
        bg-black/60
        p-4
        backdrop-blur-md
        sm:flex
        sm:items-center
        sm:justify-center
      "
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        transition={{
          duration: 0.25,
        }}
        className="
          relative
          mx-auto
          w-full
          max-w-2xl
          overflow-hidden
          rounded-3xl
          border
          bg-background
          shadow-2xl
        "
      >
        {/* =====================================================
            CLOSE BUTTON
        ===================================================== */}

        <button
          onClick={onClose}
          disabled={loadingGateway !== null}
          aria-label="Close payment gateway modal"
          className="
            absolute
            right-5
            top-5
            z-10
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            bg-background
            transition
            hover:bg-muted
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={18} />
        </button>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            border-b
            bg-gradient-to-b
            from-primary/10
            via-primary/5
            to-transparent
            px-6
            py-8
            sm:px-8
          "
        >
          <p
            className="
              text-sm
              font-semibold
              text-primary
            "
          >
            Payment Gateway
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-black
              sm:text-3xl
            "
          >
            {title ??
              'Choose Payment Method'}
          </h2>

          <p
            className="
              mt-3
              text-sm
              text-muted-foreground
              sm:text-base
            "
          >
            {description ??
              'Select your preferred payment gateway to complete your payment securely.'}
          </p>

          {/* =====================================================
              AMOUNT
          ===================================================== */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-primary/20
              bg-primary/5
              p-5
            "
          >
            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              Amount
            </p>

            <h3
              className="
                mt-2
                text-4xl
                font-black
                sm:text-5xl
              "
            >
              ₦{amount.toLocaleString()}
            </h3>

            {type !== 'prediction' && (
              <p
                className="
                  mt-2
                  text-sm
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

        {/* =====================================================
            BODY
        ===================================================== */}

        <div className="p-6 sm:p-8">
          <h3
            className="
              mb-5
              text-lg
              font-bold
            "
          >
            Select Gateway
          </h3>

          {/* =====================================================
              PAYSTACK
          ===================================================== */}

          <button
            type="button"
            disabled={loadingGateway !== null}
            onClick={() =>
              initializePayment('paystack')
            }
            className="
              group
              mb-5
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              bg-card
              p-5
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
                gap-5
              "
            >
              {/* Paystack Logo */}

                    <div
                    className="
                        relative
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                    "
                    >
                    <Image
                        src="/gateway/paystack.png"
                        alt="Paystack"
                        width={96}
                        height={96}
                        className="
                        h-24
                        w-24
                        max-w-none
                        scale-150
                        object-contain
                        "
                        priority
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
                      rounded-2xl
                      bg-background/80
                      backdrop-blur-sm
                    "
                  >
                    <Loader2
                      size={24}
                      className="
                        animate-spin
                        text-primary
                      "
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4
                  className="
                    text-lg
                    font-bold
                  "
                >
                  Paystack
                </h4>

                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  Debit Card, Bank Transfer,
                  USSD and more.
                </p>
              </div>
            </div>

            <ArrowRight
              size={20}
              className="
                ml-4
                shrink-0
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>

          {/* =====================================================
              OPAY
          ===================================================== */}

          <button
            type="button"
            disabled={loadingGateway !== null}
            onClick={() =>
              initializePayment('opay')
            }
            className="
              group
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              bg-card
              p-5
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
              {/* OPay Logo */}

                    <div
                    className="
                        relative
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                    "
                    >
                    <Image
                        src="/gateway/opay.png"
                        alt="OPay"
                        width={96}
                        height={96}
                        className="
                        h-24
                        w-24
                        max-w-none
                        scale-150
                        object-contain
                        "
                        priority
                    />

                {loadingGateway ===
                  'opay' && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      rounded-2xl
                      bg-background/80
                      backdrop-blur-sm
                    "
                  >
                    <Loader2
                      size={24}
                      className="
                        animate-spin
                        text-primary
                      "
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4
                  className="
                    text-lg
                    font-bold
                  "
                >
                  OPay
                </h4>

                <p
                  className="
                    mt-1
                    text-sm
                    text-muted-foreground
                  "
                >
                  Pay directly using your
                  OPay account.
                </p>
              </div>
            </div>

            <ArrowRight
              size={20}
              className="
                ml-4
                shrink-0
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-destructive/20
                bg-destructive/10
                p-4
                text-destructive
              "
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span
                className="
                  text-sm
                "
              >
                {error}
              </span>
            </div>
          )}

          {/* =====================================================
              MANUAL PAYMENT
          ===================================================== */}

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/5
              p-5
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
                size={20}
                className="
                  mt-0.5
                  shrink-0
                  text-amber-500
                "
              />

              <div>
                <h4
                  className="
                    font-semibold
                  "
                >
                  Having trouble paying?
                </h4>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  If Paystack or OPay is
                  temporarily unavailable,
                  you can complete your
                  payment manually using
                  a bank transfer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setManualPayment(true)
              }
              disabled={
                loadingGateway !== null
              }
              className="
                mt-5
                w-full
                rounded-xl
                border
                border-primary
                bg-background
                py-3
                font-semibold
                text-primary
                transition-all
                hover:bg-primary
                hover:text-primary-foreground
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Make Manual Payment
            </button>
          </div>

          {/* =====================================================
              CANCEL
          ===================================================== */}

          <div
            className="
              mt-8
              flex
              items-center
              justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={
                loadingGateway !== null
              }
              className="
                rounded-xl
                border
                px-6
                py-3
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
      </motion.div>
    </div>
  );
}