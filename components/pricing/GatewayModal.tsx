'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  type: 'subscription' | 'vip_upgrade';
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
  const [manualPayment, setManualPayment] = useState(false);
  const [selectedCurrency, setSelectedCurrency] =
    useState<PaymentCurrency>(currency);

  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  const selectedAmount =
    type === 'subscription'
      ? target === 'regular'
        ? selectedCurrency === 'USD'
          ? config.regularPriceUSD
          : config.regularPrice
        : target === 'vip'
          ? selectedCurrency === 'USD'
            ? config.vipPriceUSD
            : config.vipPrice
          : target === 'premium'
            ? selectedCurrency === 'USD'
              ? config.premiumPriceUSD
              : config.premiumPrice
            : amount
      : amount;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && loadingGateway === null) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadingGateway, onClose]);

  const duration = `${config.subscriptionDurationDays} days`;

  async function initializePayment(gateway: PaymentGateway) {
    try {
      setError('');
      setLoadingGateway(gateway);

      const data = await paymentGatewayService.initializePayment({
        gateway,
        type,
        target,
      });

      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        'Unable to initialize payment. Please try again.';

      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoadingGateway(null);
    }
  }

  if (manualPayment) {
    return (
      <PaymentModal
        type={type}
        target={target}
        amount={selectedAmount}
        currency={selectedCurrency}
        config={config}
        title={title}
        description={description}
        onClose={() => setManualPayment(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex h-[100dvh] items-stretch justify-center overflow-hidden bg-black/65 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && loadingGateway === null) {
          onClose();
        }
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gateway-modal-title"
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative flex h-full min-h-0 w-full max-w-md flex-col overflow-hidden border bg-background shadow-2xl sm:h-auto sm:max-h-[min(88dvh,44rem)] sm:rounded-2xl sm:border"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loadingGateway !== null}
          aria-label="Close payment modal"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 transition hover:bg-muted disabled:opacity-50"
        >
          <X size={15} />
        </button>

        <header className="shrink-0 border-b bg-primary/5 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5 sm:pt-5">
          <p className="pr-10 text-[11px] font-semibold uppercase tracking-wide text-primary">
            Payment
          </p>
          <h2
            id="gateway-modal-title"
            className="mt-1 pr-10 text-base font-bold leading-snug sm:text-lg"
          >
            {title ?? 'Choose Payment Method'}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description ?? 'Select a payment method to continue.'}
          </p>

          {type === 'subscription' && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                Pay in
              </span>
              <div className="inline-flex rounded-lg border bg-muted/40 p-1" role="group" aria-label="Choose payment currency">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('NGN')}
                  disabled={loadingGateway !== null}
                  aria-pressed={selectedCurrency === 'NGN'}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedCurrency === 'NGN' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  ₦ NGN
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  disabled={loadingGateway !== null}
                  aria-pressed={selectedCurrency === 'USD'}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${selectedCurrency === 'USD' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  $ USD
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Amount</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {duration}
              </p>
            </div>
            <p className="shrink-0 text-xl font-black tracking-tight sm:text-2xl">
              {selectedCurrency === 'NGN' ? '₦' : '$'}
              {selectedAmount.toLocaleString()}
            </p>
          </div>
          {selectedCurrency === 'USD' && (
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Paystack checkout is processed in NGN. Your USD price is converted
              using the current exchange rate before payment.
            </p>
          )}
        </header>

        <main className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-4">
          <button
            type="button"
            disabled={loadingGateway !== null}
            onClick={() => initializePayment('paystack')}
            className="group flex w-full items-center justify-between gap-3 rounded-xl border bg-card p-3 text-left transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                <Image
                  src="/gateway/paystack.png"
                  alt="Paystack"
                  width={64}
                  height={64}
                  className="h-16 w-16 max-w-none scale-150 object-contain"
                  priority
                />
                {loadingGateway === 'paystack' && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                    <Loader2 size={17} className="animate-spin text-primary" />
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">Paystack</span>
                <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                  Card, bank transfer, USSD and more.
                </span>
              </span>
            </span>
            <ArrowRight
              size={17}
              className="shrink-0 transition-transform group-hover:translate-x-1"
            />
          </button>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-amber-500"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold">Manual payment</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Use this fallback only after contacting an admin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setManualPayment(true)}
              disabled={loadingGateway !== null}
              className="mt-2.5 min-h-9 w-full rounded-lg border border-amber-500/40 bg-background px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-500/10 disabled:opacity-50 dark:text-amber-400"
            >
              Proceed to Manual Payment
            </button>
          </div>
        </main>

        <footer className="shrink-0 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loadingGateway !== null}
            className="min-h-10 w-full rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
        </footer>
      </motion.div>
    </div>
  );
}

