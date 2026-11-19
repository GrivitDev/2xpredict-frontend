'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';

import api from '@/lib/axios';
import type { PlanConfig } from '@/types/plan-config';
import type { PaymentCurrency } from '@/services/payment-gateway.service';
import PaymentProofUpload from './PaymentProofUpload';

interface PaymentModalProps {
  type: 'subscription' | 'vip_upgrade';
  target: string;
  amount: number;
  currency: PaymentCurrency;
  config: PlanConfig;
  title?: string;
  description?: string;
  onClose: () => void;
}

export default function PaymentModal({
  type,
  target,
  amount,
  currency,
  config,
  title,
  description,
  onClose,
}: PaymentModalProps) {
  const [transferReference, setTransferReference] = useState('');
  const [proofMessage, setProofMessage] = useState('');
  const [proof, setProof] = useState<{
    url: string;
    publicId: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  const bankDetails =
    currency === 'USD' ? config.bankDetailsUSD : config.bankDetails;

  const paymentLabel =
    target === 'premium'
      ? config.planLabels.premium
      : target === 'vip'
        ? config.planLabels.vip
        : config.planLabels.regular;

  const duration = `${config.subscriptionDurationDays} days`;

  async function submitPayment() {
    setError('');

    if (!transferReference.trim()) {
      setError('Please enter your payment reference or sender name.');
      return;
    }

    if (!proof) {
      setError('Please upload your payment screenshot before submitting.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/payments', {
        type,
        target,
        currency,
        transferReference: transferReference.trim(),
        proofMessage: proofMessage.trim(),
        proofImageUrl: proof.url,
        proofPublicId: proof.publicId,
      });

      setSuccess(true);
    } catch (error: any) {
      const message =
        error.response?.data?.message ??
        'Unable to submit payment. Please try again.';

      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex h-[100dvh] items-stretch justify-center overflow-hidden bg-black/65 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-payment-title"
        className="relative flex h-full min-h-0 w-full max-w-lg flex-col overflow-hidden border bg-background shadow-2xl sm:h-auto sm:max-h-[min(92dvh,52rem)] sm:rounded-2xl sm:border"
      >
        <header className="relative shrink-0 border-b bg-background px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5 sm:pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close payment form"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border bg-background transition hover:bg-muted disabled:opacity-50"
          >
            <X size={15} />
          </button>
          <p className="pr-10 text-[11px] font-semibold uppercase tracking-wide text-primary">
            {paymentLabel}
          </p>
          <h2
            id="manual-payment-title"
            className="mt-1 pr-10 text-base font-bold leading-snug sm:text-lg"
          >
            {title || 'Complete Payment'}
          </h2>
          <p className="mt-1 pr-8 text-xs leading-5 text-muted-foreground">
            {description ||
              'Transfer the amount below and upload your payment proof.'}
          </p>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-4">
          {success ? (
            <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 size={30} className="text-green-500" />
              </div>
              <h3 className="mt-3 text-lg font-bold">Payment Submitted</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Your payment is waiting for admin approval. Your account will
                update after approval.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 min-h-11 w-full max-w-xs rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border bg-primary/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      Amount to pay ({currency})
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Valid for {duration}
                    </p>
                  </div>
                  <p className="shrink-0 text-xl font-black tracking-tight sm:text-2xl">
                    {currency === 'USD' ? '$' : '₦'}
                    {amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Bank Transfer</p>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    Manual
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-[5.25rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs leading-5">
                  <dt className="text-muted-foreground">Bank</dt>
                  <dd className="break-words font-medium">
                    {bankDetails.bankName}
                  </dd>
                  <dt className="text-muted-foreground">Account</dt>
                  <dd className="break-words font-medium">
                    {bankDetails.accountName}
                  </dd>
                  <dt className="text-muted-foreground">Number</dt>
                  <dd className="break-all font-semibold">
                    {bankDetails.accountNumber}
                  </dd>
                </dl>
                {bankDetails.instructions && (
                  <p className="mt-2 border-t pt-2 text-xs leading-5 text-muted-foreground">
                    {bankDetails.instructions}
                  </p>
                )}
              </div>

              <PaymentProofUpload
                onUpload={(data) => {
                  setProof(data);
                  setError('');
                }}
                onClear={() => setProof(null)}
              />

              <input
                value={transferReference}
                onChange={(event) => {
                  setTransferReference(event.target.value);
                  setError('');
                }}
                placeholder="Transfer reference / sender name"
                autoComplete="off"
                className="min-h-11 w-full rounded-lg border bg-muted/30 px-3 py-2.5 text-base outline-none transition placeholder:text-sm focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />

              <textarea
                value={proofMessage}
                onChange={(event) => setProofMessage(event.target.value)}
                placeholder="Additional information (optional)"
                rows={2}
                className="min-h-20 w-full resize-y rounded-lg border bg-muted/30 px-3 py-2.5 text-base outline-none transition placeholder:text-sm focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 sm:text-sm"
              />

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </div>
              )}
            </div>
          )}
        </main>

        {!success && (
          <footer className="shrink-0 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            <button
              type="button"
              disabled={loading}
              onClick={submitPayment}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  Submit Payment
                </>
              )}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

