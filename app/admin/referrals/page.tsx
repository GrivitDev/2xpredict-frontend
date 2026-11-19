'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralsService } from '@/services/referrals.service';
import { AdminError, AdminMetrics, AdminPageFrame, AdminPanel, AdminTable, AdminTabs, adminButton, compactDate, compactStatus, displayValue } from '@/components/admin/AdminWorkspace';
import type { Referral, ReferralStats } from '@/types/referrals';

const unwrap = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of ['items', 'referrals', 'data', 'results']) if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
};
const nameOf = (value: unknown) => {
  if (!value || typeof value !== 'object') return displayValue(value);
  const user = value as Record<string, unknown>;
  return String(user.fullName ?? user.username ?? user.email ?? user._id ?? 'Unknown user');
};

type Tab = 'all' | 'registered' | 'regular' | 'vip' | 'premium' | 'paid' | 'rewarded' | 'unclaimed';
const tabs: Array<{ value: Tab; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'registered', label: 'Registered' }, { value: 'regular', label: 'Regular' },
  { value: 'vip', label: 'VIP' }, { value: 'premium', label: 'Premium' }, { value: 'paid', label: 'Paid conversion' },
  { value: 'rewarded', label: 'Rewarded' }, { value: 'unclaimed', label: 'Unclaimed' },
];

export default function AdminReferralsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const listQuery = useQuery({ queryKey: ['referrals', 'admin-list'], queryFn: () => referralsService.getAdminReferrals<unknown>(), staleTime: 15_000, refetchInterval: 60_000 });
  const statsQuery = useQuery({ queryKey: ['referrals', 'admin-stats'], queryFn: () => referralsService.getAdminReferralStats<ReferralStats & { totalReferrers: number; paidSubscribers: number }>(), staleTime: 30_000, refetchInterval: 60_000 });
  const monitorQuery = useQuery({ queryKey: ['referrals', 'admin-monitor'], queryFn: () => referralsService.getModuleMonitor(), staleTime: 15_000, refetchInterval: 60_000 });
  const referrals = useMemo(() => unwrap<Referral>(listQuery.data), [listQuery.data]);
  const stats = statsQuery.data;
  const filtered = useMemo(() => referrals.filter((row) => {
    switch (tab) {
      case 'registered': return row.registered;
      case 'regular': return row.regularSubscription;
      case 'vip': return row.vipSubscription;
      case 'premium': return row.premiumSubscription;
      case 'paid': return row.regularSubscription || row.vipSubscription || Boolean(row.premiumSubscription);
      case 'rewarded': return row.rewardClaimed;
      case 'unclaimed': return !row.rewardClaimed;
      default: return true;
    }
  }), [referrals, tab]);
  const refresh = () => { void listQuery.refetch(); void statsQuery.refetch(); void monitorQuery.refetch(); };
  const anyError = listQuery.error ?? statsQuery.error;
  const metrics = stats ? [
    { label: 'Total referrals', value: stats.total }, { label: 'Referrers', value: stats.totalReferrers ?? 0 },
    { label: 'Registered', value: stats.registered }, { label: 'Paid subscribers', value: stats.paidSubscribers ?? 0, tone: 'good' as const },
    { label: 'Regular', value: stats.regularSubscribers }, { label: 'VIP', value: stats.vipSubscribers },
    { label: 'Premium', value: stats.premiumSubscribers ?? 0 }, { label: 'Conversion', value: `${Number(stats.conversionRate ?? 0)}%` },
  ] : [];

  return <AdminPageFrame title="Referrals" description="Track persisted referral registration, subscription conversions and reward claims." actions={<button className={adminButton} type="button" onClick={refresh} disabled={listQuery.isFetching || statsQuery.isFetching || monitorQuery.isFetching}>{listQuery.isFetching || statsQuery.isFetching ? 'Refreshing…' : 'Refresh'}</button>}>
    {anyError && <AdminError error={anyError} retry={refresh} />}
    {stats && <AdminMetrics columns={4} items={metrics} />}
    <AdminPanel title="Module health" meta={monitorQuery.dataUpdatedAt ? `Updated ${new Date(monitorQuery.dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Referral monitor'}>
      {monitorQuery.isError ? <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px] text-muted-foreground">Monitoring data is unavailable.<button className={adminButton} onClick={() => void monitorQuery.refetch()}>Retry</button></div> : <div className="flex flex-wrap items-center gap-2 px-2.5 py-2">{monitorQuery.data && typeof monitorQuery.data === 'object' ? Object.entries(monitorQuery.data as Record<string, unknown>).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value)).slice(0, 8).map(([key, value]) => <span key={key} className="inline-flex max-w-full items-center gap-1.5 rounded border border-border/70 px-2 py-1 text-[10px]"><span className="text-muted-foreground">{key.replaceAll('_', ' ')}</span><strong className="max-w-40 truncate">{displayValue(value)}</strong></span>) : <span className="text-[10px] text-muted-foreground">No monitor summary returned.</span>}</div>}
    </AdminPanel>
    <AdminPanel title="Referral records" meta={`${filtered.length.toLocaleString()} shown / ${referrals.length.toLocaleString()} total`}>
      <AdminTabs value={tab} onChange={setTab} tabs={tabs.map((item) => ({ ...item, count: item.value === 'all' ? referrals.length : undefined }))} />
      {listQuery.isLoading ? <div className="px-3 py-8 text-center text-[11px] text-muted-foreground">Loading referrals…</div> : <AdminTable rows={filtered as unknown as Record<string, unknown>[]} limit={250} columns={[
        { key: 'referrerId', label: 'Referrer', render: (row) => <div className="max-w-52"><div className="truncate font-semibold">{nameOf(row.referrerId)}</div><div className="truncate text-[9px] text-muted-foreground">{String((row.referrerId as any)?.email ?? '')}</div></div> },
        { key: 'referredUserId', label: 'Referred user', render: (row) => <div className="max-w-52"><div className="truncate font-medium">{nameOf(row.referredUserId)}</div><div className="truncate text-[9px] text-muted-foreground">{String((row.referredUserId as any)?.email ?? '')}</div></div> },
        { key: 'registered', label: 'Registered', render: (row) => compactStatus(row.registered ? 'REGISTERED' : 'NOT REGISTERED') },
        { key: 'regularSubscription', label: 'Regular', render: (row) => compactStatus(row.regularSubscription ? 'YES' : 'NO') },
        { key: 'vipSubscription', label: 'VIP', render: (row) => compactStatus(row.vipSubscription ? 'YES' : 'NO') },
        { key: 'premiumSubscription', label: 'Premium', render: (row) => compactStatus(row.premiumSubscription ? 'YES' : 'NO') },
        { key: 'rewardClaimed', label: 'Reward', render: (row) => compactStatus(row.rewardClaimed ? 'CLAIMED' : 'UNCLAIMED') },
        { key: 'createdAt', label: 'Created', render: (row) => compactDate(row.createdAt) },
      ]} empty="No referral records match this filter." />}
    </AdminPanel>
    <p className="px-1 text-[9px] text-muted-foreground">Prediction-purchase metrics are intentionally omitted because the backend referral schema does not store that field.</p>
  </AdminPageFrame>;
}

