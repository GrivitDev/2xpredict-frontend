'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FaArrowUpRightFromSquare,
  FaArrowsRotate,
  FaCalendarCheck,
  FaClock,
  FaCreditCard,
  FaCrown,
  FaReceipt,
  FaShieldHalved,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import { useGetMyPaymentsQuery } from '@/hooks/use-payments';
import { usePaymentInitializationQuery, useVerifyPaymentMutation } from '@/hooks/use-payment-gateways';
import { useGetStatusQuery } from '@/hooks/use-subscriptions';
import type { Payment, PaymentStatus } from '@/types/payments';
import { getPaymentStatusColor } from '@/lib/payment-status';

interface AccountBillingPanelProps {
  enabled: boolean;
}

const paidPlans = new Set(['regular', 'vip', 'premium']);

function money(amount: number, currency: Payment['currency']): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'NGN' ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function titleCase(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPaymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
}

function isActivePayment(payment: Payment): boolean {
  return payment.status === 'pending' || payment.status === 'processing';
}

function isSafePaystackUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'paystack.com' || url.hostname.endsWith('.paystack.com'));
  } catch {
    return false;
  }
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${getPaymentStatusColor(status)}`}>
      {getPaymentStatusLabel(status)}
    </span>
  );
}

export default function AccountBillingPanel({ enabled }: AccountBillingPanelProps) {
  useEffect(() => {
    if (window.location.hash !== '#account-billing') return;
    const timer = window.setTimeout(() => {
      document.getElementById('account-billing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, []);

  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const subscriptionQuery = useGetStatusQuery({ enabled });
  const paymentsQuery = useGetMyPaymentsQuery({ enabled, refetchInterval: enabled ? 30_000 : false });
  const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);
  const activePaystackPayment = useMemo(
    () => payments.find((payment) => payment.gateway === 'paystack' && payment.status === 'pending') ?? null,
    [payments],
  );
  const initializationQuery = usePaymentInitializationQuery(
    { path: { reference: activePaystackPayment?.reference ?? '' } },
    {
      enabled: Boolean(activePaystackPayment?.reference),
      refetchInterval: activePaystackPayment ? 15_000 : false,
    },
  );
  const verifyPayment = useVerifyPaymentMutation();

  const subscription = subscriptionQuery.data?.subscription ?? null;
  const plan = subscriptionQuery.data?.plan ?? null;
  const entitlements = subscriptionQuery.data?.entitlements;
  const expiryTime = subscription?.expiryDate ? new Date(subscription.expiryDate).getTime() : NaN;
  const daysRemaining = useMemo(
    () => (Number.isFinite(expiryTime) ? Math.max(0, Math.ceil((expiryTime - now) / 86_400_000)) : null),
    [expiryTime, now],
  );
  const activePayment = payments.find(isActivePayment) ?? null;
  const authorizationUrl = initializationQuery.data
    ? initializationQuery.data.authorizationUrl
    : activePaystackPayment?.gatewayAuthorizationUrl ?? null;
  const canResumePaystack = Boolean(
    activePaystackPayment &&
    initializationQuery.data?.initializationStatus === 'initialized' &&
    authorizationUrl &&
    isSafePaystackUrl(authorizationUrl),
  );

  const approvedCount = payments.filter((payment) => payment.status === 'approved').length;
  const pendingCount = payments.filter((payment) => payment.status === 'pending' || payment.status === 'processing').length;
  const rejectedCount = payments.filter((payment) => payment.status === 'rejected').length;

  const handleVerify = async (payment: Payment) => {
    try {
      const result = await verifyPayment.mutateAsync({ query: { reference: payment.reference } });
      if (result.status === 'approved') toast.success('Payment confirmed. Your subscription status has been refreshed.');
      else if (result.status === 'processing') toast('Payment confirmed. Your subscription is still being activated.');
      else if (result.status === 'pending') toast('Paystack has not returned a final result yet. Your payment remains open.');
      else toast.error(result.message || 'This payment could not be confirmed.');
      await Promise.all([paymentsQuery.refetch(), subscriptionQuery.refetch(), initializationQuery.refetch()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment verification failed. Try again later.';
      toast.error(message);
    }
  };

  return (
    <section id="account-billing" className="mt-5 space-y-3 scroll-mt-24" px-12 aria-labelledby="account-billing-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent">Account</p>
          <h2 id="account-billing-title" className="mt-1 text-lg font-bold tracking-tight">Subscription & payments</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Your current access, payment status and transaction history.</p>
        </div>
        <Button size="sm" variant="outline" disabled={paymentsQuery.isFetching || subscriptionQuery.isFetching} onClick={() => void Promise.all([paymentsQuery.refetch(), subscriptionQuery.refetch()])}>
          <FaArrowsRotate className={`mr-1.5 h-3 w-3 ${paymentsQuery.isFetching || subscriptionQuery.isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {subscriptionQuery.isError ? (
        <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          Your subscription status could not be verified. Payment records remain available below; refresh to retry.
          <Button size="sm" variant="outline" className="ml-2 h-7" onClick={() => void subscriptionQuery.refetch()}>Retry</Button>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <article className="rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-brand-accent"><FaCrown className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground">Current plan</p>
                <p className="truncate text-sm font-bold capitalize">{subscriptionQuery.isLoading ? 'Checking…' : plan ?? '—'}</p>
              </div>
              {plan && paidPlans.has(plan) ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-status-success">ACTIVE ACCESS</span>
              ) : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/45 px-2.5 py-2">
                <p className="text-[9px] text-muted-foreground">Starts</p>
                <p className="mt-0.5 text-[11px] font-semibold">{formatDate(subscription?.startDate)}</p>
              </div>
              <div className="rounded-lg bg-muted/45 px-2.5 py-2">
                <p className="text-[9px] text-muted-foreground">Expires</p>
                <p className="mt-0.5 text-[11px] font-semibold">{formatDate(subscription?.expiryDate)}</p>
              </div>
            </div>
            {subscription ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><FaCalendarCheck className="text-brand-accent" /> {daysRemaining === null ? 'Expiry date unavailable' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`}</p>
            ) : (
              <p className="mt-2 text-[10px] text-muted-foreground">No active paid subscription is currently returned by the subscription service.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" className="h-8 text-[11px]"><Link href="/pricing">{plan && plan !== 'free' ? 'Manage plan' : 'View plans'}</Link></Button>
            </div>
          </article>

          <article className="rounded-xl border border-border/70 bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500/10 text-status-info"><FaShieldHalved className="h-4 w-4" /></span>
              <div>
                <p className="text-[10px] text-muted-foreground">Backend entitlements</p>
                <p className="text-sm font-bold capitalize">{entitlements?.plan ?? plan ?? '—'}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Advertising</span><span className="font-semibold">{entitlements ? (entitlements.advertising.adsEnabled ? 'Enabled' : 'Disabled') : '—'}</span></div>
              <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Ad-free access</span><span className="font-semibold">{entitlements ? (entitlements.advertising.adFree ? 'Included' : 'Not included') : '—'}</span></div>
              <div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Ad removal entitlement</span><span className="font-semibold">{entitlements ? (entitlements.advertising.adRemovalIncluded ? 'Included' : 'Not included') : '—'}</span></div>
            </div>
            <p className="mt-3 border-t border-border/60 pt-2 text-[9px] leading-relaxed text-muted-foreground">Feature access and advertising are determined by the backend subscription response.</p>
          </article>
        </div>
      )}

      {activePayment ? (
        <article className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-status-warning">
              {activePayment.status === 'processing' ? <FaClock className="h-3.5 w-3.5" /> : <FaTriangleExclamation className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold">Payment needs attention</p><StatusBadge status={activePayment.status} /></div>
              <p className="mt-1 text-[11px] text-muted-foreground">{titleCase(activePayment.target)} · {money(activePayment.amount, activePayment.currency)} · {activePayment.gateway === 'paystack' ? 'Paystack' : 'Bank transfer'}</p>
              {activePayment.gateway === 'manual' ? (
                <p className="mt-1 text-[10px] text-muted-foreground">Your transfer submission is waiting for administrator review. You do not need to submit it again.</p>
              ) : activePayment.status === 'processing' ? (
                <p className="mt-1 text-[10px] text-muted-foreground">Paystack confirmation is complete and the backend is processing the subscription. The status will refresh automatically.</p>
              ) : (
                <p className="mt-1 text-[10px] text-muted-foreground">Continue the existing checkout or verify its reference. Do not start another payment while this request is open.</p>
              )}
              {activePayment.gateway === 'paystack' && activePayment.status === 'pending' ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {canResumePaystack ? (
                    <Button size="sm" className="h-8 text-[10px]" onClick={() => window.location.assign(authorizationUrl!)}>
                      Continue Paystack <FaArrowUpRightFromSquare className="ml-1.5 h-3 w-3" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-8 text-[10px]" disabled={verifyPayment.isPending || initializationQuery.isFetching} onClick={() => void handleVerify(activePayment)}>
                      {verifyPayment.isPending ? 'Checking…' : 'Verify payment'}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 text-[10px]" disabled={initializationQuery.isFetching} onClick={() => void initializationQuery.refetch()}>
                    Refresh checkout status
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ) : null}

      <article className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
          <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-brand-accent"><FaReceipt className="h-3.5 w-3.5" /></span><div><h3 className="text-xs font-bold">Payment history</h3><p className="text-[10px] text-muted-foreground">Subscription purchases, renewals and upgrades</p></div></div>
          <span className="text-[10px] text-muted-foreground">{payments.length} record{payments.length === 1 ? '' : 's'}</span>
        </div>
        <div className="grid grid-cols-3 gap-px border-b border-border/60 bg-border/60">
          <Metric label="Approved" value={approvedCount} tone="success" />
          <Metric label="Pending" value={pendingCount} tone="warning" />
          <Metric label="Rejected" value={rejectedCount} tone="danger" />
        </div>
        {paymentsQuery.isLoading ? (
          <div className="space-y-2 p-3">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : paymentsQuery.isError ? (
          <div className="p-4 text-center"><p className="text-xs font-semibold">Payment history could not be loaded.</p><Button size="sm" variant="outline" className="mt-2 h-8" onClick={() => void paymentsQuery.refetch()}>Retry</Button></div>
        ) : payments.length ? (
          <div className="divide-y divide-border/60">
            {payments.map((payment) => (
              <div key={payment._id} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><FaCreditCard className="h-3.5 w-3.5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5"><p className="truncate text-[11px] font-semibold">{titleCase(payment.target || payment.type)}</p><StatusBadge status={payment.status} /></div>
                  <p className="mt-0.5 truncate text-[9px] text-muted-foreground">{titleCase(payment.type)} · {payment.gateway === 'paystack' ? 'Paystack' : 'Bank transfer'} · {formatDate(payment.createdAt)}</p>
                  <p className="mt-0.5 truncate font-mono text-[9px] text-muted-foreground">{payment.reference}</p>
                </div>
                <div className="ml-auto text-right"><p className="text-xs font-bold tabular-nums">{money(payment.amount, payment.currency)}</p>{payment.processedAt ? <p className="mt-0.5 text-[9px] text-muted-foreground">Processed {formatDate(payment.processedAt)}</p> : null}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 py-9 text-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground"><FaReceipt className="h-4 w-4" /></span><p className="mt-2 text-xs font-semibold">No payment records yet</p><p className="mt-1 max-w-xs text-[10px] text-muted-foreground">Your subscription payments, renewals and upgrades will appear here.</p><Button asChild size="sm" variant="outline" className="mt-3 h-8 text-[10px]"><Link href="/pricing">View plans</Link></Button></div>
        )}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3 py-2 text-[9px] text-muted-foreground"><span>History is supplied by your account payment records.</span><span>{paymentsQuery.isFetching ? 'Updating…' : 'Auto-refresh 30s'}</span></div>
      </article>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'success' | 'warning' | 'danger' }) {
  const toneClass = tone === 'success' ? 'text-status-success' : tone === 'warning' ? 'text-status-warning' : 'text-destructive';
  return <div className="bg-card px-3 py-2"><p className="text-[9px] text-muted-foreground">{label}</p><p className={`mt-0.5 text-sm font-bold ${toneClass}`}>{value}</p></div>;
}

