'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminError, AdminPanel, AdminTable, AdminTabs, adminButton, compactDate, compactStatus, displayValue } from '@/components/admin/AdminWorkspace';
import { usePromos, usePromoAnalytics, usePromoRedemptions, usePromosModuleMonitor, useAllAwardedRewards, useAllClaimedRewards } from '@/hooks/use-promos';
import PromoTable from '@/components/admin/promos/PromoTable';
import PromoRedemptionsTable from '@/components/admin/promos/PromoRedemptionsTable';
import type { Promo, PromoAnalytics, PromoRedemption, PromoReward } from '@/types/promos';

const arr = <T,>(value: unknown): T[] => { if (Array.isArray(value)) return value as T[]; const record = value as any; for (const key of ['items', 'data', 'results', 'rewards', 'claimedRewards', 'redemptions']) if (Array.isArray(record?.[key])) return record[key] as T[]; return []; };
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
export default function AdminPromosPage() {
  const promosQuery = usePromos({ staleTime: 20_000, refetchOnWindowFocus: false });
  const redemptionQuery = usePromoRedemptions({ staleTime: 15_000, refetchInterval: 60_000 });
  const analyticsQuery = usePromoAnalytics(undefined, { staleTime: 30_000, refetchInterval: 60_000 });
  const monitorQuery = usePromosModuleMonitor({ staleTime: 30_000, refetchInterval: 60_000 });
  const awardedQuery = useAllAwardedRewards({ staleTime: 20_000, refetchInterval: 60_000 });
  const claimedQuery = useAllClaimedRewards({ staleTime: 20_000, refetchInterval: 60_000 });
  const [recordsTab, setRecordsTab] = useState<'redemptions' | 'awarded' | 'claimed'>('redemptions');
  const promos = arr<Promo>(promosQuery.data);
  const redemptions = arr<PromoRedemption>(redemptionQuery.data);
  const awarded = arr<PromoReward>(awardedQuery.data);
  const claimed = arr<PromoReward>(claimedQuery.data);
  const analytics = (analyticsQuery.data ?? {}) as PromoAnalytics;
  const stats = useMemo(() => ({
    total: promos.length,
    active: promos.filter((p) => p.isActive && (!p.startDate || new Date(p.startDate).getTime() <= Date.now()) && (!p.endDate || new Date(p.endDate).getTime() >= Date.now())).length,
    discounts: promos.filter((p) => p.promotionKind === 'discount').length,
    bundles: promos.filter((p) => p.promotionKind === 'bundle').length,
    redeemed: number(analytics.redeemed ?? analytics.redeemedCount) || redemptions.filter((r) => r.status === 'redeemed').length,
    reserved: number(analytics.reserved ?? analytics.reservedCount) || redemptions.filter((r) => r.status === 'reserved').length,
  }), [promos, analytics, redemptions]);
  const refresh = () => { void promosQuery.refetch(); void redemptionQuery.refetch(); void analyticsQuery.refetch(); void monitorQuery.refetch(); void awardedQuery.refetch(); void claimedQuery.refetch(); };
  if (promosQuery.isLoading) return <main className="space-y-3 p-3"><div className="h-7 w-40 animate-pulse rounded bg-muted"/><div className="h-24 animate-pulse rounded-lg bg-muted"/><div className="h-64 animate-pulse rounded-lg bg-muted"/></main>;
  if (promosQuery.isError) return <main className="p-3"><section className="flex items-center justify-between rounded-lg border border-destructive/30 p-3"><p className="text-xs text-destructive">Unable to load campaigns. Check the admin session and API connection.</p><button onClick={() => void promosQuery.refetch()} className="h-7 rounded-md border px-3 text-xs">Retry</button></section></main>;
  return <main className="mx-auto w-full max-w-[1600px] space-y-3 p-2 pb-5 sm:p-3">
    <header className="flex flex-wrap items-center justify-between gap-2"><div><h1 className="text-lg font-semibold tracking-tight">Promotions</h1><p className="mt-0.5 text-xs text-muted-foreground">Discount campaigns, eligibility, non-cash rewards and redemption activity.</p></div><div className="flex gap-1.5"><button onClick={refresh} disabled={promosQuery.isFetching || redemptionQuery.isFetching} className="h-8 rounded-md border px-3 text-xs disabled:opacity-50">{promosQuery.isFetching ? 'Refreshing…' : 'Refresh'}</button><Link href="/admin/promos/create" className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">Create campaign</Link></div></header>
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">{[
      ['Campaigns', stats.total], ['Active', stats.active], ['Discounts', stats.discounts], ['Bundles', stats.bundles], ['Redeemed', stats.redeemed], ['Reserved', stats.reserved],
    ].map(([label, value]) => <div key={String(label)} className="rounded-lg border bg-card px-3 py-2"><p className="text-[10px] font-medium text-muted-foreground">{label}</p><p className="mt-0.5 text-lg font-semibold tabular-nums">{number(value).toLocaleString()}</p></div>)}</section>
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex h-10 items-center justify-between border-b px-3"><h2 className="text-sm font-semibold">Discount cost by currency</h2><span className="text-[11px] text-muted-foreground">Approved redemptions</span></div>
      {analyticsQuery.isLoading ? <p className="p-3 text-xs text-muted-foreground">Loading analytics…</p> : (() => {
        const byCurrency = analytics.byCurrency;
        const currencyRows = Array.isArray(byCurrency) ? byCurrency : byCurrency && typeof byCurrency === 'object' ? Object.entries(byCurrency).map(([currency, values]) => ({ currency, ...(values as object) })) : [];
        return <div className="grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">{currencyRows.map((row: any) => <div key={row.currency} className="rounded-md border px-3 py-2"><p className="text-[10px] font-semibold text-muted-foreground">{row.currency}</p><div className="mt-2 grid grid-cols-3 gap-2"><div><p className="text-[10px] text-muted-foreground">Gross</p><p className="text-xs font-semibold tabular-nums">{new Intl.NumberFormat(row.currency === 'USD' ? 'en-US' : 'en-NG', { style: 'currency', currency: row.currency === 'USD' ? 'USD' : 'NGN', maximumFractionDigits: 2 }).format(number(row.grossValue ?? row.baseAmount))}</p></div><div><p className="text-[10px] text-muted-foreground">Discount cost</p><p className="text-xs font-semibold tabular-nums">{new Intl.NumberFormat(row.currency === 'USD' ? 'en-US' : 'en-NG', { style: 'currency', currency: row.currency === 'USD' ? 'USD' : 'NGN', maximumFractionDigits: 2 }).format(number(row.discountCost ?? row.discountAmount))}</p></div><div><p className="text-[10px] text-muted-foreground">Net</p><p className="text-xs font-semibold tabular-nums">{new Intl.NumberFormat(row.currency === 'USD' ? 'en-US' : 'en-NG', { style: 'currency', currency: row.currency === 'USD' ? 'USD' : 'NGN', maximumFractionDigits: 2 }).format(number(row.netSubscriptionValue ?? row.finalAmount))}</p></div></div></div>)}{!currencyRows.length && <p className="px-2 py-3 text-xs text-muted-foreground">No approved discounted payments to report yet.</p>}<div className="rounded-md border px-3 py-2"><p className="text-[10px] text-muted-foreground">Bet Lab points awarded</p><p className="mt-1 text-lg font-semibold tabular-nums">{number(analytics.pointsAwarded).toLocaleString()}</p></div></div>;
      })()}
    </section>
    <AdminPanel title="Promotion module health" meta={monitorQuery.dataUpdatedAt ? `Updated ${new Date(monitorQuery.dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Backend monitor'} actions={<button type="button" className="h-7 rounded-md border px-2.5 text-[10px] font-semibold" disabled={monitorQuery.isFetching} onClick={() => void monitorQuery.refetch()}>{monitorQuery.isFetching ? 'Refreshing…' : 'Refresh'}</button>}>
      {monitorQuery.isError ? <div className="p-2.5"><AdminError error={monitorQuery.error} retry={() => void monitorQuery.refetch()} /></div> : <div className="space-y-2 p-2.5"><div className="flex flex-wrap gap-1.5">{monitorQuery.data && typeof monitorQuery.data === 'object' ? Object.entries(monitorQuery.data as Record<string, unknown>).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value)).slice(0, 16).map(([key, value]) => <span key={key} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/70 px-2 py-1 text-[10px]"><span className="text-muted-foreground">{key.replaceAll('_', ' ')}</span><strong className="max-w-44 truncate" title={String(value)}>{displayValue(value)}</strong></span>) : <span className="text-[10px] text-muted-foreground">No monitor summary returned.</span>}</div><details className="rounded-md border border-border/60"><summary className="cursor-pointer px-2.5 py-1.5 text-[10px] font-semibold">Inspect complete monitor response</summary><pre className="max-h-[320px] overflow-auto border-t p-2 text-[9px] leading-4">{JSON.stringify(monitorQuery.data ?? null, null, 2)}</pre></details></div>}
    </AdminPanel>
    <PromoTable promos={promos} onRefresh={refresh}/>
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b p-2"><AdminTabs value={recordsTab} onChange={setRecordsTab} tabs={[{ value: 'redemptions', label: 'Redemptions', count: redemptions.length }, { value: 'awarded', label: 'Awarded rewards', count: awarded.length }, { value: 'claimed', label: 'Claimed rewards', count: claimed.length }]} /></div>
      {recordsTab === 'redemptions' ? redemptionQuery.isError ? <div className="p-2.5 text-[10px] text-destructive">Redemption records could not be loaded. <button onClick={() => void redemptionQuery.refetch()} className="underline">Retry</button></div> : <PromoRedemptionsTable rows={redemptions.slice(0, 100)}/> : recordsTab === 'awarded' ? awardedQuery.isError ? <div className="p-2.5 text-[10px] text-destructive">Awarded rewards could not be loaded. <button onClick={() => void awardedQuery.refetch()} className="underline">Retry</button></div> : <AdminTable rows={awarded as unknown as Record<string, unknown>[]} limit={200} columns={[
        { key: 'userName', label: 'User', render: (row) => <div className="max-w-44"><div className="truncate font-medium">{displayValue(row.userName ?? (row.userId as any)?.fullName ?? (row.userId as any)?.username ?? row.userId)}</div><div className="truncate text-[9px] text-muted-foreground">{displayValue(row.email ?? (row.userId as any)?.email)}</div></div> }, { key: 'rewardTitle', label: 'Reward', render: (row) => displayValue(row.rewardTitle ?? row.type) }, { key: 'points', label: 'Points', render: (row) => row.points == null ? '—' : number(row.points).toLocaleString() }, { key: 'plan', label: 'Plan', render: (row) => displayValue(row.plan ?? (row.promoId as any)?.rewardPlan) }, { key: 'activity', label: 'Activity', render: (row) => displayValue(row.activity ?? (row.promoId as any)?.name) }, { key: 'status', label: 'Status', render: (row) => compactStatus(row.status) }, { key: 'dateReceived', label: 'Date', render: (row) => compactDate(row.dateReceived ?? row.createdAt) },
      ]} empty="No awarded rewards found."/> : claimedQuery.isError ? <div className="p-2.5 text-[10px] text-destructive">Claimed rewards could not be loaded. <button onClick={() => void claimedQuery.refetch()} className="underline">Retry</button></div> : <AdminTable rows={claimed as unknown as Record<string, unknown>[]} limit={200} columns={[
        { key: 'userId', label: 'User', render: (row) => <div className="max-w-44"><div className="truncate font-medium">{displayValue((row.userId as any)?.fullName ?? (row.userId as any)?.username ?? row.userId)}</div><div className="truncate text-[9px] text-muted-foreground">{displayValue((row.userId as any)?.email)}</div></div> }, { key: 'promoId', label: 'Campaign', render: (row) => displayValue((row.promoId as any)?.name ?? row.promoId) }, { key: 'type', label: 'Reward', render: (row) => displayValue(row.type) }, { key: 'points', label: 'Points', render: (row) => row.points == null ? '—' : number(row.points).toLocaleString() }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status', render: (row) => compactStatus(row.status ?? 'PENDING') }, { key: 'claimedAt', label: 'Claimed', render: (row) => compactDate(row.claimedAt ?? row.updatedAt ?? row.createdAt) },
      ]} empty="No claimed rewards found."/>}
    </section>
    {analyticsQuery.isError && <p className="text-[11px] text-muted-foreground">Campaign analytics are currently unavailable.</p>}
  </main>;
}

