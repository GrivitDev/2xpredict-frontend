'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import {
  FaBullhorn,
  FaChartLine,
  FaCircleCheck,
  FaCreditCard,
  FaGift,
  FaLayerGroup,
  FaRotate,
  FaTrophy,
  FaUserGroup,
  FaUsers,
} from 'react-icons/fa6';
import { useGetDashboardQuery } from '@/hooks/use-analytics';
import type { AnalyticsDashboardResponse, AnalyticsLeaderboardUser, RevenueBreakdown } from '@/types/analytics';
import { useAdminRealtimeState } from '@/components/admin/realtime/AdminRealtimeProvider';
import AdminRealtimeMonitor from '../realtime/AdminRealtimeMonitor';

type TabId = 'overview' | 'revenue' | 'predictions' | 'subscriptions' | 'growth' | 'leaderboards';
type LeaderboardId = 'all' | 'vip' | 'regular' | 'premium' | 'referrers';

const tabs: Array<{ id: TabId; label: string; icon: IconType }> = [
  { id: 'overview', label: 'Overview', icon: FaChartLine },
  { id: 'revenue', label: 'Revenue', icon: FaCreditCard },
  { id: 'predictions', label: 'Predictions', icon: FaLayerGroup },
  { id: 'subscriptions', label: 'Plans', icon: FaUsers },
  { id: 'growth', label: 'Growth', icon: FaBullhorn },
  { id: 'leaderboards', label: 'Leaderboards', icon: FaTrophy },
];

const leaderboardTabs: Array<{ id: LeaderboardId; label: string; key: keyof AnalyticsDashboardResponse['leaderboards']; countKey?: keyof AnalyticsLeaderboardUser }> = [
  { id: 'all', label: 'All subscribers', key: 'topSubscribers', countKey: 'totalSubscriptions' },
  { id: 'vip', label: 'VIP', key: 'topVipSubscribers', countKey: 'totalVipSubscriptions' },
  { id: 'regular', label: 'Regular', key: 'topRegularSubscribers', countKey: 'totalRegularSubscriptions' },
  { id: 'premium', label: 'Premium', key: 'topPremiumSubscribers', countKey: 'totalPremiumSubscriptions' },
  { id: 'referrers', label: 'Referrers', key: 'topReferrers', countKey: 'successfulReferrals' },
];

const nf = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });
const money = (amount: number, currency: 'NGN' | 'USD') => new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
  style: 'currency', currency, maximumFractionDigits: currency === 'NGN' ? 0 : 2,
}).format(Number.isFinite(amount) ? amount : 0);
const num = (value?: number | null) => nf.format(Number.isFinite(Number(value)) ? Number(value) : 0);
const pct = (value: number) => `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;
const ratio = (part: number, whole: number) => whole > 0 ? Math.min(100, Math.max(0, (part / whole) * 100)) : 0;

function Card({ title, icon: Icon, children, className = '' }: { title: string; icon?: IconType; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_10px_rgba(15,23,42,0.035)] dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
        {Icon ? <Icon className="text-emerald-600 dark:text-emerald-400" /> : null}
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

function BigMetric({ label, value, icon: Icon, footnote }: { label: string; value: string; icon: IconType; footnote?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"><Icon className="text-xs" /></span>
      </div>
      <p className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100" title={value}>{value}</p>
      {footnote ? <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">{footnote}</p> : null}
    </div>
  );
}

function StatRow({ label, value, valueClass = '' }: { label: string; value: string | number; valueClass?: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800/80">
    <span className="min-w-0 truncate text-xs text-slate-600 dark:text-slate-300">{label}</span>
    <span className={`shrink-0 text-xs font-semibold tabular-nums text-slate-900 dark:text-slate-100 ${valueClass}`}>{typeof value === 'number' ? num(value) : value}</span>
  </div>;
}

function ProgressRow({ label, value, total, color = 'bg-emerald-500' }: { label: string; value: number; total: number; color?: string }) {
  const width = ratio(value, total);
  return <div className="py-1.5">
    <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
      <span className="truncate text-slate-600 dark:text-slate-300">{label}</span>
      <span className="shrink-0 font-semibold tabular-nums text-slate-800 dark:text-slate-100">{num(value)} <span className="font-normal text-slate-400">· {pct(width)}</span></span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div>
  </div>;
}

function CurrencyPair({ value }: { value: RevenueBreakdown }) {
  return <div className="grid grid-cols-2 gap-2">
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-900"><p className="text-[10px] text-slate-500">NGN</p><p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={money(value?.NGN ?? 0, 'NGN')}>{money(value?.NGN ?? 0, 'NGN')}</p></div>
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-900"><p className="text-[10px] text-slate-500">USD</p><p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={money(value?.USD ?? 0, 'USD')}>{money(value?.USD ?? 0, 'USD')}</p></div>
  </div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">{label}</div>;
}

function Leaderboard({ data, countKey, countLabel }: { data: AnalyticsLeaderboardUser[]; countKey: keyof AnalyticsLeaderboardUser; countLabel: string }) {
  if (!data?.length) return <EmptyState label="No leaderboard data yet" />;
  return <div className="overflow-x-auto">
    <table className="w-full min-w-[420px] text-left text-xs">
      <thead className="text-[10px] uppercase tracking-wider text-slate-400"><tr>
        <th className="w-9 pb-2 pr-2 font-medium">#</th><th className="pb-2 pr-3 font-medium">User</th><th className="pb-2 pr-3 font-medium">Email</th><th className="pb-2 text-right font-medium">{countLabel}</th>
      </tr></thead>
      <tbody>{data.map((user, index) => (
        <tr key={user.userId || user.email || `${user.username}-${index}`} className="border-t border-slate-100 dark:border-slate-800/80">
          <td className="py-2 pr-2 text-slate-400">{index + 1}</td>
          <td className="max-w-44 py-2 pr-3"><div className="truncate font-medium text-slate-800 dark:text-slate-100" title={user.fullName || user.username}>{user.fullName || user.username || 'Unknown user'}</div><div className="truncate text-[10px] text-slate-400">@{user.username || '—'}</div></td>
          <td className="max-w-56 truncate py-2 pr-3 text-slate-500" title={user.email}>{user.email || '—'}</td>
          <td className="py-2 text-right font-semibold tabular-nums text-slate-800 dark:text-slate-100">{num(Number(user[countKey] ?? 0))}</td>
        </tr>
      ))}</tbody>
    </table>
  </div>;
}

export default function AnalyticsDashboard() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useGetDashboardQuery<AnalyticsDashboardResponse>();
  const { connectionStatus, lastEventAt } = useAdminRealtimeState();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardId>('all');

  const updatedLabel = useMemo(() => dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—', [dataUpdatedAt]);
  const users = data?.users;
  const revenue = data?.revenue;
  const subscriptions = data?.subscriptions;
  const predictions = data?.predictions;
  const ads = data?.ads;
  const promos = data?.promos;
  const referrals = data?.referrals;

  if (isLoading && !data) {
    return <main className="space-y-3 p-3 sm:p-4"><div className="h-7 w-44 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" /><div className="grid grid-cols-2 gap-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />)}</div><div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" /></main>;
  }

  if (error && !data) {
    return <main className="p-3 sm:p-4"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20"><p className="text-sm font-semibold text-rose-800 dark:text-rose-200">Business analytics could not be loaded.</p><p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">Check the connection and try again.</p><button onClick={() => void refetch()} className="mt-3 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-800">Retry</button></div></main>;
  }

  const selectedLeaderboard = leaderboardTabs.find((tab) => tab.id === leaderboardTab) ?? leaderboardTabs[0];
  const leaderboardData = data?.leaderboards?.[selectedLeaderboard.key] ?? [];

  return (
    <main className="space-y-3 p-3 text-slate-900 dark:text-slate-100 sm:p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 text-emerald-300 dark:bg-emerald-400/10"><FaChartLine /></span><div><h1 className="text-lg font-semibold tracking-tight">Business analytics</h1><p className="text-[11px] text-slate-500 dark:text-slate-400">Users, revenue, predictions and growth</p></div></div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`hidden items-center gap-1 text-[10px] font-semibold sm:inline-flex ${connectionStatus === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : connectionStatus === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            {connectionStatus === 'connected' ? 'Realtime active' : connectionStatus === 'connecting' ? 'Realtime connecting' : connectionStatus === 'error' ? 'Realtime unavailable' : 'Realtime offline'}
          </span>
          <span className="hidden text-[10px] text-slate-400 sm:inline">Updated {updatedLabel}</span>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"><FaRotate className={isFetching ? 'animate-spin' : ''} />{isFetching ? 'Refreshing' : 'Refresh'}</button>
        </div>
      </header>

      {error && data ? <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">Refresh failed. Showing the last successful snapshot.</div> : null}

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <BigMetric label="Total users" value={num(users?.totalUsers)} icon={FaUsers} footnote={`${num(users?.activeUsers)} active`} />
        <BigMetric label="Active subscriptions" value={num(subscriptions?.activeSubscriptions)} icon={FaCircleCheck} footnote={`${num(subscriptions?.totalSubscriptions)} total records`} />
        <BigMetric label="Revenue · NGN" value={money(revenue?.totalRevenue?.NGN ?? 0, 'NGN')} icon={FaCreditCard} footnote={`${money(revenue?.totalRevenue?.USD ?? 0, 'USD')} in USD`} />
        <BigMetric label="Market predictions" value={num(predictions?.totalPredictions)} icon={FaLayerGroup} footnote={`${num(predictions?.totalSelections)} selections`} />
      </div>

      <nav aria-label="Analytics sections" className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${activeTab === id ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}><Icon className="text-[10px]" />{label}</button>)}
      </nav>

      {activeTab === 'overview' ? <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 2xl:grid-cols-3">
        <Card title="User accounts" icon={FaUsers}>
          <div className="grid grid-cols-2 gap-x-4"><StatRow label="Active" value={users?.activeUsers ?? 0} /><StatRow label="Suspended" value={users?.suspendedUsers ?? 0} /><StatRow label="Verified" value={users?.verifiedUsers ?? 0} /><StatRow label="Unverified" value={users?.unverifiedUsers ?? 0} /><StatRow label="Deleted" value={users?.deletedUsers ?? 0} /></div>
          <ProgressRow label="Verification rate" value={users?.verifiedUsers ?? 0} total={users?.totalUsers ?? 0} />
        </Card>
        <Card title="Revenue & payments" icon={FaCreditCard}>
          <CurrencyPair value={revenue?.totalRevenue ?? { NGN: 0, USD: 0 }} />
          <div className="mt-2 grid grid-cols-3 gap-2"><MiniValue label="Approved" value={revenue?.approvedPayments ?? 0} /><MiniValue label="Pending" value={revenue?.pendingPayments ?? 0} /><MiniValue label="Rejected" value={revenue?.rejectedPayments ?? 0} /></div>
        </Card>
        <Card title="Subscription plans" icon={FaUsers}>
          <PlanRows subscriptions={subscriptions} />
        </Card>
        <Card title="Prediction pipeline" icon={FaLayerGroup}>
          <div className="grid grid-cols-2 gap-x-4"><StatRow label="Calculated markets" value={predictions?.calculatedMarketPredictions ?? 0} /><StatRow label="Partial markets" value={predictions?.partialMarketPredictions ?? 0} /><StatRow label="Unavailable" value={predictions?.unavailableMarketPredictions ?? 0} /><StatRow label="Failed" value={predictions?.failedMarketPredictions ?? 0} /><StatRow label="Curated records" value={predictions?.totalCuratedPredictions ?? 0} /></div>
          <ProgressRow label="Calculated share" value={predictions?.calculatedMarketPredictions ?? 0} total={predictions?.totalPredictions ?? 0} />
        </Card>
        <Card title="Ads & promotion" icon={FaBullhorn}>
          <div className="grid grid-cols-2 gap-2"><MiniValue label="Enabled ads" value={`${num(ads?.activeAds)} / ${num(ads?.totalAds)}`} /><MiniValue label="Click-through rate" value={pct(ads?.ctr ?? 0)} /><MiniValue label="Impressions" value={ads?.impressions ?? 0} /><MiniValue label="Clicks" value={ads?.clicks ?? 0} /></div>
          <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800"><div className="grid grid-cols-3 gap-2"><MiniValue label="Promos live" value={promos?.activePromos ?? 0} /><MiniValue label="All promos" value={promos?.totalPromos ?? 0} /><MiniValue label="Expired" value={promos?.expiredPromos ?? 0} /></div></div>
        </Card>
        <Card title="Referrals" icon={FaUserGroup}>
          <div className="grid grid-cols-2 gap-x-4"><StatRow label="Total referrals" value={referrals?.totalReferrals ?? 0} /><StatRow label="Registered" value={referrals?.registeredReferrals ?? 0} /><StatRow label="Paid conversions" value={referrals?.paidSubscribers ?? 0} /><StatRow label="Rewarded flags" value={referrals?.rewardedReferrals ?? 0} /><StatRow label="Unclaimed flags" value={referrals?.unclaimedReferrals ?? 0} /></div>
          <ProgressRow label="Paid conversion rate" value={referrals?.paidSubscribers ?? 0} total={referrals?.totalReferrals ?? 0} />
        </Card>
      </div> : null}

      {activeTab === 'revenue' ? <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2"><Card title="Total approved revenue" icon={FaCreditCard}><CurrencyPair value={revenue?.totalRevenue ?? { NGN: 0, USD: 0 }} /></Card><Card title="Payments" icon={FaCircleCheck}><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><MiniValue label="Total" value={revenue?.totalPayments ?? 0} /><MiniValue label="Approved" value={revenue?.approvedPayments ?? 0} /><MiniValue label="Pending" value={revenue?.pendingPayments ?? 0} /><MiniValue label="Rejected" value={revenue?.rejectedPayments ?? 0} /></div><ProgressRow label="Approval rate" value={revenue?.approvedPayments ?? 0} total={revenue?.totalPayments ?? 0} /></Card></div>
        <Card title="Revenue by plan" icon={FaCreditCard}><div className="grid grid-cols-1 gap-2 md:grid-cols-3"><RevenuePlan label="Regular" value={revenue?.regularRevenue} /><RevenuePlan label="VIP" value={revenue?.vipRevenue} /><RevenuePlan label="Premium" value={revenue?.premiumRevenue} /></div><p className="mt-2 text-[10px] text-slate-400">NGN and USD are kept separate; amounts are not combined across currencies.</p></Card>
      </div> : null}

      {activeTab === 'predictions' ? <div className="space-y-2">
        <Card title="Market prediction status" icon={FaLayerGroup}><div className="grid grid-cols-2 gap-2 xl:grid-cols-4"><MiniValue label="Total market records" value={predictions?.totalPredictions ?? 0} /><MiniValue label="Calculated" value={predictions?.calculatedMarketPredictions ?? 0} /><MiniValue label="Partial" value={predictions?.partialMarketPredictions ?? 0} /><MiniValue label="Unavailable" value={predictions?.unavailableMarketPredictions ?? 0} /><MiniValue label="Failed" value={predictions?.failedMarketPredictions ?? 0} /></div><ProgressRow label="Calculated share" value={predictions?.calculatedMarketPredictions ?? 0} total={predictions?.totalPredictions ?? 0} /><ProgressRow label="Partial share" value={predictions?.partialMarketPredictions ?? 0} total={predictions?.totalPredictions ?? 0} color="bg-sky-500" /></Card>
        <Card title="Selection settlement outcomes" icon={FaCircleCheck}><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7"><MiniValue label="All selections" value={predictions?.totalSelections ?? 0} /><MiniValue label="Pending" value={predictions?.pendingSelections ?? 0} /><MiniValue label="Won" value={predictions?.wonSelections ?? 0} /><MiniValue label="Lost" value={predictions?.lostSelections ?? 0} /><MiniValue label="Void" value={predictions?.voidSelections ?? 0} /><MiniValue label="Push" value={predictions?.pushSelections ?? 0} /><MiniValue label="Half win / loss" value={`${num(predictions?.halfWonSelections)} / ${num(predictions?.halfLostSelections)}`} /></div></Card>
        <Card title="Curated predictions" icon={FaLayerGroup}><div className="grid grid-cols-2 gap-2 sm:grid-cols-5"><MiniValue label="Total" value={predictions?.totalCuratedPredictions ?? 0} /><MiniValue label="Ready" value={predictions?.readyCuratedPredictions ?? 0} /><MiniValue label="Published" value={predictions?.publishedCuratedPredictions ?? 0} /><MiniValue label="Settled" value={predictions?.settledCuratedPredictions ?? 0} /><MiniValue label="Cancelled" value={predictions?.cancelledCuratedPredictions ?? 0} /></div></Card>
      </div> : null}

      {activeTab === 'subscriptions' ? <div className="grid grid-cols-1 gap-2 lg:grid-cols-2"><Card title="Plan activity" icon={FaUsers}><div className="grid grid-cols-2 gap-2"><MiniValue label="Total subscriptions" value={subscriptions?.totalSubscriptions ?? 0} /><MiniValue label="Active subscriptions" value={subscriptions?.activeSubscriptions ?? 0} /></div><ProgressRow label="Active share" value={subscriptions?.activeSubscriptions ?? 0} total={subscriptions?.totalSubscriptions ?? 0} /><PlanRows subscriptions={subscriptions} /></Card><Card title="Plan comparison" icon={FaLayerGroup}><div className="space-y-2"><PlanComparison label="Regular" total={subscriptions?.regularSubscriptions ?? 0} active={subscriptions?.activeRegularSubscriptions ?? 0} /><PlanComparison label="VIP" total={subscriptions?.vipSubscriptions ?? 0} active={subscriptions?.activeVipSubscriptions ?? 0} /><PlanComparison label="Premium" total={subscriptions?.premiumSubscriptions ?? 0} active={subscriptions?.activePremiumSubscriptions ?? 0} /></div></Card></div> : null}

      {activeTab === 'growth' ? <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        <Card title="Advertising" icon={FaBullhorn}><div className="grid grid-cols-2 gap-2"><MiniValue label="Total ads" value={ads?.totalAds ?? 0} /><MiniValue label="Enabled ads" value={ads?.activeAds ?? 0} /><MiniValue label="Impressions" value={ads?.impressions ?? 0} /><MiniValue label="Clicks" value={ads?.clicks ?? 0} /></div><div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-400/10"><p className="text-[10px] text-emerald-700 dark:text-emerald-300">Click-through rate</p><p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{pct(ads?.ctr ?? 0)}</p></div></Card>
        <Card title="Promotions" icon={FaGift}><div className="grid grid-cols-2 gap-2"><MiniValue label="All promotions" value={promos?.totalPromos ?? 0} /><MiniValue label="Active now" value={promos?.activePromos ?? 0} /><MiniValue label="Expired" value={promos?.expiredPromos ?? 0} /></div><ProgressRow label="Currently active" value={promos?.activePromos ?? 0} total={promos?.totalPromos ?? 0} /></Card>
        <Card title="Referral conversion" icon={FaUserGroup}><div className="grid grid-cols-2 gap-2"><MiniValue label="Referred users" value={referrals?.totalReferrals ?? 0} /><MiniValue label="Registered" value={referrals?.registeredReferrals ?? 0} /><MiniValue label="Paid conversion" value={referrals?.paidSubscribers ?? 0} /><MiniValue label="Rewarded flags" value={referrals?.rewardedReferrals ?? 0} /></div><ProgressRow label="Paid conversion rate" value={referrals?.paidSubscribers ?? 0} total={referrals?.totalReferrals ?? 0} /></Card>
      </div> : null}

      {activeTab === 'leaderboards' ? <Card title="Top accounts" icon={FaTrophy}>
        <div className="mb-3 flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-900">{leaderboardTabs.map((tab) => <button key={tab.id} type="button" onClick={() => setLeaderboardTab(tab.id)} className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium ${leaderboardTab === tab.id ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`}>{tab.label}</button>)}</div>
        <Leaderboard data={leaderboardData} countKey={selectedLeaderboard.countKey ?? 'totalSubscriptions'} countLabel={selectedLeaderboard.id === 'referrers' ? 'Referrals' : 'Subscriptions'} />
      </Card> : null}

                  <AdminRealtimeMonitor />

      <footer className="flex items-center justify-between gap-2 px-1 text-[10px] text-slate-400"><span>Admin business analytics</span><span className="inline-flex items-center gap-1"><FaCircleCheck className={connectionStatus === 'connected' ? 'text-emerald-500' : 'text-slate-400'} />{connectionStatus === 'connected' ? `Realtime refresh enabled${lastEventAt ? ` · event ${new Date(lastEventAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}` : 'Snapshot · refresh manually or reconnect realtime'}</span></footer>
    </main>
  );
}

function MiniValue({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-slate-900"><p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{label}</p><p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100" title={String(value)}>{typeof value === 'number' ? num(value) : value}</p></div>;
}

function PlanRows({ subscriptions }: { subscriptions?: AnalyticsDashboardResponse['subscriptions'] }) {
  const total = subscriptions?.totalSubscriptions ?? 0;
  return <div className="space-y-1.5">
    <ProgressRow label="Regular" value={subscriptions?.regularSubscriptions ?? 0} total={total} color="bg-sky-500" />
    <ProgressRow label="VIP" value={subscriptions?.vipSubscriptions ?? 0} total={total} color="bg-emerald-500" />
    <ProgressRow label="Premium" value={subscriptions?.premiumSubscriptions ?? 0} total={total} color="bg-violet-500" />
  </div>;
}

function PlanComparison({ label, total, active }: { label: string; total: number; active: number }) {
  return <div className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800"><div className="mb-1 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{label}</span><span className="text-[10px] text-slate-500">{num(active)} active / {num(total)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${ratio(active, total)}%` }} /></div></div>;
}

function RevenuePlan({ label, value }: { label: string; value?: RevenueBreakdown }) {
  return <div className="rounded-lg border border-slate-100 p-2.5 dark:border-slate-800"><p className="mb-2 text-xs font-semibold text-slate-800 dark:text-slate-100">{label}</p><CurrencyPair value={value ?? { NGN: 0, USD: 0 }} /></div>;
}
