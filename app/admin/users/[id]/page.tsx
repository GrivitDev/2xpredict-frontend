'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useAdminUserPayments, useAdminUserSubscriptions, useUserActions, useUserDetails } from '@/hooks/use-admin-users';
import { adminUsersService } from '@/services/admin-users.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type AnyRecord = Record<string, any>;
const money = (value: unknown, currency: 'NGN' | 'USD' = 'NGN') => typeof value === 'number' ? new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-NG', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value) : value == null ? '—' : String(value);
const currencySummary = (value: unknown) => { if (!value || typeof value !== 'object') return '—'; const row = value as Record<string, unknown>; return `₦${Number(row.NGN ?? 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })} · $${Number(row.USD ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`; };
const points = (value: unknown) => value == null || !Number.isFinite(Number(value)) ? '—' : `${Number(value).toLocaleString()} pts`;
const paymentAmount = (row: AnyRecord) => money(Number(row.amount ?? 0), row.currency === 'USD' ? 'USD' : 'NGN');
const date = (value: unknown) => value ? new Date(String(value)).toLocaleString() : '—';
const first = (value: any, keys: string[], fallback: any = undefined) => {
  for (const key of keys) if (value?.[key] !== undefined && value?.[key] !== null) return value[key];
  return fallback;
};
const rows = (value: any): any[] => { if (Array.isArray(value)) return value; for (const key of ['items', 'data', 'tickets', 'sessions', 'payments', 'ledger', 'events', 'recentActivity', 'recentSessions']) if (Array.isArray(value?.[key])) return value[key]; return []; };

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id ?? '');
  const queryClient = useQueryClient();
  const [paymentPage, setPaymentPage] = useState(1);
  const [subscriptionPage, setSubscriptionPage] = useState(1);
  const { user: result, loading, refetch } = useUserDetails(id);
  const paymentHistoryQuery = useAdminUserPayments(id, { page: paymentPage, limit: 10 });
  const subscriptionHistoryQuery = useAdminUserSubscriptions(id, { page: subscriptionPage, limit: 10 });
  const actions = useUserActions(id, refetch);
  const sessionsQuery = useQuery({ queryKey: ['admin-user-sessions', id], queryFn: () => adminUsersService.getUserSessions<any>(id), enabled: Boolean(id) });
  const auditQuery = useQuery({ queryKey: ['admin-user-audit', id], queryFn: () => adminUsersService.getAuditHistory<any>(id, { page: 1, limit: 10 }), enabled: Boolean(id) });
  const revokeSessionMutation = useMutation({ mutationFn: (sessionId: string) => adminUsersService.revokeSession(id, sessionId), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['admin-user-sessions', id] }); await refetch(); } });
  const detail = result as AnyRecord | null;
  const user = detail?.user as AnyRecord | undefined;

  const act = async (name: string, action: () => Promise<any>) => {
    if (name === 'Delete' && !window.confirm('Delete this user?')) return;
    if (name === 'Suspend' && !window.confirm('Suspend this user?')) return;
    try { await action(); await refetch(); }
    catch (error) { window.alert(error instanceof Error ? error.message : 'Action failed'); }
  };

  if (loading) return <main className="p-4 text-sm text-muted-foreground">Loading…</main>;
  if (!user) return <main className="space-y-3 p-4"><h1 className="text-lg font-semibold">User not found</h1><Link className="text-sm text-primary" href="/admin/users">← Users</Link></main>;

  const payments = detail?.payments ?? {};
  const subscription = detail?.subscription ?? {};
  const sessions = detail?.sessions ?? {};
  const wallet = detail?.betLab?.wallet ?? {};
  const tickets = detail?.betLab?.tickets;
  const ledger = detail?.betLab?.ledger;
  const referrals = detail?.referrals;
  const rewards = detail?.promotions?.rewards;
  const progress = detail?.promotions?.progress;
  const bonuses = detail?.bonuses;
  const analytics = detail?.websiteAnalytics;
  const access = detail?.predictionAccess?.plan ?? detail?.predictionAccess ?? {};

  return (
    <main className="mx-auto w-full max-w-[1680px] space-y-2.5 p-0">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/admin/users" className="grid h-8 w-8 shrink-0 place-items-center rounded-md border text-sm hover:bg-muted" aria-label="Back to users">←</Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{user.fullName || user.username || user.email || 'User'}</h1>
            <p className="truncate text-xs text-muted-foreground">{user.email || '—'}{user.username ? ` · @${user.username}` : ''}</p>
          </div>
          <span className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-700' : user.status === 'suspended' ? 'bg-amber-500/10 text-amber-700' : 'bg-muted text-muted-foreground'}`}>{String(user.status ?? 'unknown')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {user.status === 'suspended'
            ? <ActionButton onClick={() => act('Activate', () => actions.activate())}>Activate</ActionButton>
            : <ActionButton onClick={() => act('Suspend', () => actions.suspend('Manual suspension'))}>Suspend</ActionButton>}
          <ActionButton onClick={() => act('Logout', () => actions.forceLogoutAllDevices())}>Logout all</ActionButton>
          <ActionButton danger onClick={() => act('Delete', () => actions.remove())}>Delete</ActionButton>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Role" value={user.role ?? 'user'} />
        <Metric label="Verified" value={user.isVerified ? 'Yes' : 'No'} />
        <Metric label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
        <Metric label="Plan" value={first(subscription, ['plan', 'currentPlan'], first(access, ['plan', 'name'], 'Free'))} />
        <Metric label="Payments" value={first(payments, ['totalPayments', 'total', 'count'], '—')} />
        <Metric label="Revenue" value={currencySummary(payments.revenue?.total)} />
      </section>

      <section className="grid gap-2 lg:grid-cols-2">
        <DataSection title="Profile" data={{
          Email: user.email, Username: user.username, Phone: user.phoneNumber, Role: user.role,
          Status: user.status, Verified: user.isVerified ? 'Yes' : 'No', Registered: date(user.createdAt),
          'Last login': date(user.lastLoginAt),
        }} />
        <DataSection title="Subscription" data={{
          Plan: first(subscription, ['plan', 'currentPlan']),
          Status: subscription.status,
          'Active subscription': subscription.hasSubscription == null ? undefined : subscription.hasSubscription ? 'Yes' : 'No',
          'Start date': date(first(subscription.subscription, ['startDate'], first(subscription, ['startDate', 'startedAt']))),
          'End date': date(first(subscription.subscription, ['expiryDate'], first(subscription, ['expiryDate', 'endDate', 'expiresAt', 'currentPeriodEnd']))),
          'Days remaining': subscription.daysRemaining,
        }} />
        <DataSection title="Payments" data={{
          Total: first(payments, ['totalPayments', 'total']),
          Approved: payments.approvedPayments,
          Pending: payments.pendingPayments,
          Rejected: payments.rejectedPayments,
          'Revenue · NGN/USD': currencySummary(payments.revenue?.total),
          'Subscriptions · NGN/USD': currencySummary(payments.revenue?.subscriptions),
          'Regular plan · NGN/USD': currencySummary(payments.revenue?.plans?.regular),
          'VIP plan · NGN/USD': currencySummary(payments.revenue?.plans?.vip),
          'Premium plan · NGN/USD': currencySummary(payments.revenue?.plans?.premium),
        }} />
        <DataSection title="Bet Lab wallet" data={{
          Balance: points(wallet.balance),
          'Welcome balance': points(wallet.welcomeBalance),
          'Monthly balance': points(wallet.monthlyBalance),
          'Winnings balance': points(wallet.winningsBalance),
          'Bonus balance': points(wallet.bonusBalance),
          'Total staked': points(wallet.totalStaked),
          'Total returns': points(wallet.totalReturns),
        }} />
        <DataSection title="Sessions" data={{
          Total: first(sessions, ['totalSessions', 'total']),
          Active: sessions.activeSessions,
          'Last login': date(sessions.lastLogin),
          'Current session': sessions.currentSession ? 'Active' : 'None',
        }} />
        <DataSection title="Prediction access" data={{
          Plan: first(access, ['plan', 'name']),
          'Product type': first(access, ['productType', 'type']),
          'Access level': first(access, ['accessLevel', 'level']),
          Status: access.status,
        }} />
      </section>

      {detail?.partial && <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-[11px] text-amber-700">Some sections could not be loaded. {Array.isArray(detail.sectionErrors) ? detail.sectionErrors.map((item: AnyRecord) => `${item.section}: ${item.message}`).join(' · ') : ''}</div>}
      {revokeSessionMutation.isError && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-[11px] text-destructive">{revokeSessionMutation.error.message}</div>}
      {revokeSessionMutation.isSuccess && <div role="status" className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[11px] text-emerald-700">Session revoked.</div>}

      <section className="grid gap-2 xl:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          {paymentHistoryQuery.isError ? <HistoryQueryError message="Payment history could not be loaded." retry={() => void paymentHistoryQuery.refetch()} /> : null}
          <CompactTable title="Payment history" value={paymentHistoryQuery.data?.items} columns={[
            ['Date', (r) => date(r.createdAt)], ['Amount', (r) => paymentAmount(r)], ['Status', (r) => r.status ?? '—'], ['Type / plan', (r) => `${r.type ?? '—'} · ${r.target ?? '—'}`], ['Gateway', (r) => r.gateway ?? 'manual'], ['Reference', (r) => r.reference ?? '—'],
          ]} />
          <HistoryPagination page={paymentPage} pages={paymentHistoryQuery.data?.pagination?.pages ?? 1} total={paymentHistoryQuery.data?.pagination?.total ?? 0} loading={paymentHistoryQuery.isFetching} onPageChange={setPaymentPage} />
        </div>
        <div className="min-w-0 space-y-1.5">
          {subscriptionHistoryQuery.isError ? <HistoryQueryError message="Subscription history could not be loaded." retry={() => void subscriptionHistoryQuery.refetch()} /> : null}
          <CompactTable title="Subscription history" value={subscriptionHistoryQuery.data?.items} columns={[
            ['Plan', (r) => r.plan ?? '—'], ['Amount', (r) => r.amount == null ? '—' : Number(r.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })], ['Start', (r) => date(r.startDate)], ['Expiry', (r) => date(r.expiryDate)], ['State', (r) => r.isActive ? 'Active' : 'Queued / historical'], ['Payment ref', (r) => r.sourceReference ?? '—'],
          ]} />
          <HistoryPagination page={subscriptionPage} pages={subscriptionHistoryQuery.data?.pagination?.pages ?? 1} total={subscriptionHistoryQuery.data?.pagination?.total ?? 0} loading={subscriptionHistoryQuery.isFetching} onPageChange={setSubscriptionPage} />
        </div>
        <CompactTable title="Sessions" value={sessionsQuery.data ?? sessions.latestSessions} columns={[
          ['Device', (r) => r.device ?? r.userAgent ?? '—'], ['IP', (r) => r.ipAddress ?? '—'], ['Last active', (r) => date(r.lastActiveAt ?? r.updatedAt)], ['Status', (r) => r.isActive ? 'Active' : 'Inactive'], ['Action', (r) => { const sessionId = String(r._id ?? r.id ?? ''); return r.isActive && sessionId ? <button type="button" className="h-6 rounded border px-2 text-[10px] text-destructive disabled:opacity-40" disabled={revokeSessionMutation.isPending} onClick={() => { if (window.confirm('Revoke this user session?')) revokeSessionMutation.mutate(sessionId); }}>{revokeSessionMutation.isPending ? 'Working…' : 'Revoke'}</button> : '—'; }],
        ]} />
        <CompactTable title="Bet Lab tickets" value={tickets} columns={[
          ['Date', (r) => date(r.createdAt)], ['Stake', (r) => points(r.stake)], ['Potential return', (r) => points(r.potentialReturn)], ['Status', (r) => r.status ?? '—'],
        ]} />
        <CompactTable title="Wallet ledger" value={ledger} columns={[
          ['Date', (r) => date(r.createdAt)], ['Type', (r) => r.transactionType ?? r.type ?? '—'], ['Delta', (r) => points(r.delta)], ['Balance after', (r) => points(r.balanceAfter)],
        ]} />
        <CompactTable title="Referrals" value={referrals} columns={[
          ['Referred user ID', (r) => r.referredUserId ?? '—'], ['Registered', (r) => r.registered ? 'Yes' : 'No'], ['Paid plan', (r) => r.premiumSubscription ? 'Premium' : r.vipSubscription ? 'VIP' : r.regularSubscription ? 'Regular' : '—'], ['Reward', (r) => r.rewardClaimed ? 'Claimed' : 'Unclaimed'], ['Date', (r) => date(r.createdAt)],
        ]} />
        <CompactTable title="Promotion rewards" value={rewards} columns={[
          ['Reward', (r) => r.type ?? r.rewardType ?? r.title ?? '—'], ['Value', (r) => r.points != null ? points(r.points) : r.plan ? `${r.plan} · ${r.durationDays ?? '—'} days` : '—'], ['Status', (r) => r.status ?? '—'], ['Date', (r) => date(r.createdAt)],
        ]} />
        <CompactTable title="Bonuses" value={bonuses} columns={[
          ['Type', (r) => r.type ?? '—'], ['Value', (r) => r.points != null ? points(r.points) : r.plan ? `${r.plan} · ${r.durationDays ?? '—'} days` : '—'], ['Status', (r) => r.status ?? '—'], ['Date', (r) => date(r.createdAt)],
        ]} />
        <CompactTable title="Website analytics" value={analytics?.recentActivity} columns={[
          ['Event', (r) => r.eventType ?? r.type ?? r.eventName ?? '—'], ['Page', (r) => r.path ?? r.page ?? '—'], ['Date', (r) => date(r.createdAt ?? r.timestamp ?? r.occurredAt)],
        ]} />
      </section>

      <CompactTable title="Admin activity" value={auditQuery.data} columns={[
        ['Action', (r) => r.action ?? '—'], ['Admin', (r) => r.adminId?.fullName ?? r.adminId?.email ?? '—'], ['Reason', (r) => r.reason ?? '—'], ['Date', (r) => date(r.createdAt)],
      ]} />
      <DataSection title="Promotion progress" data={progress && typeof progress === 'object' ? progress : { Status: progress ?? '—' }} />
    </main>
  );
}

function HistoryQueryError({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex items-center justify-between gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-2.5 py-1.5 text-[10px] text-destructive"><span>{message}</span><button type="button" className="shrink-0 underline" onClick={retry}>Retry</button></div>;
}

function HistoryPagination({ page, pages, total, loading, onPageChange }: { page: number; pages: number; total: number; loading: boolean; onPageChange: (page: number) => void }) {
  if (pages <= 1 && total === 0) return null;
  return <div className="flex items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground"><span>Page {page} of {Math.max(1, pages)} · {total} records</span><div className="flex gap-1"><button type="button" className="h-6 rounded border px-2 disabled:opacity-40" disabled={page <= 1 || loading} onClick={() => onPageChange(Math.max(1, page - 1))}>Previous</button><button type="button" className="h-6 rounded border px-2 disabled:opacity-40" disabled={page >= pages || loading} onClick={() => onPageChange(Math.min(pages, page + 1))}>Next</button></div></div>;
}

function ActionButton({ children, onClick, danger = false }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`h-7 rounded-md border px-2.5 text-[10px] font-medium transition hover:bg-muted ${danger ? 'border-red-500/30 text-red-600 hover:bg-red-500/5' : ''}`}>{children}</button>;
}

function Metric({ label, value }: { label: string; value: unknown }) {
  return <div className="min-w-0 rounded-lg border bg-card px-2.5 py-1.5"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-0.5 truncate text-[11px] font-semibold capitalize">{value == null || value === '' ? '—' : String(value)}</p></div>;
}

function DataSection({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return <section className="overflow-hidden rounded-lg border bg-card"><h2 className="border-b px-2.5 py-1.5 text-[11px] font-semibold">{title}</h2><dl className="grid grid-cols-2 gap-x-4 gap-y-0 px-3 sm:grid-cols-3">{entries.map(([key, value]) => <div key={key} className="min-w-0 border-b border-border/50 py-2 last:border-0"><dt className="text-[11px] text-muted-foreground">{key}</dt><dd className="mt-0.5 break-words text-xs font-medium">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl></section>;
}

function CompactTable({ title, value, columns }: { title: string; value: unknown; columns: [string, (row: AnyRecord) => unknown][] }) {
  const data = rows(value);
  return <section className="min-w-0 overflow-hidden rounded-lg border bg-card"><h2 className="border-b px-2.5 py-1.5 text-[11px] font-semibold">{title}</h2>{data.length ? <div className="overflow-x-auto"><table className="w-full min-w-[380px] text-left text-xs"><thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"><tr>{columns.map(([name]) => <th key={name} className="px-2.5 py-1.5 font-semibold">{name}</th>)}</tr></thead><tbody className="divide-y divide-border/60">{data.slice(0, 10).map((row: AnyRecord, index) => <tr key={row._id ?? row.id ?? index}>{columns.map(([name, render]) => { const rendered = render(row); return <td key={name} className="max-w-[220px] px-2.5 py-1.5 align-top">{rendered !== null && typeof rendered === 'object' ? rendered as ReactNode : String(rendered ?? '—')}</td>; })}</tr>)}</tbody></table></div> : <div className="px-3 py-4 text-xs text-muted-foreground">—</div>}</section>;
}

