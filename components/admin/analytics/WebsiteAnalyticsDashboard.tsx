'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FaArrowTrendUp,
  FaBolt,
  FaChartLine,
  FaClock,
  FaGlobe,
  FaRotate,
  FaUsers,
  FaWindowMaximize,
} from 'react-icons/fa6';
import type {
  WebsiteAnalyticsDashboardResponse,
  WebsiteAnalyticsRealtime,
  WebsiteAnalyticsVisitorTypes,
  WebsiteAnalyticsConversions,
  WebsiteAnalyticsVisitorBreakdown,
  WebsiteAnalyticsDailyRow,
  WebsiteAnalyticsHourlyTrend,
} from '@/types/website-analytics.types';
import {
  useGetDashboardQuery,
  useGetRealtimeQuery,
  useGetPageEngagementQuery,
  useGetVisitorTypesQuery,
  useGetConversionsQuery,
  useGetEntryPagesQuery,
  useGetExitPagesQuery,
  useGetVisitorsQuery,
  useGetDailyTrendQuery,
  useGetHourlyTrendQuery,
} from '@/hooks/use-website-analytics';

type RecordValue = Record<string, unknown>;
type ChartDatum = { name: string; count: number };

const PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b', '#84cc16'];

function unwrap(value: unknown): unknown {
  let current = value;
  for (let i = 0; i < 3; i++) {
    if (current && typeof current === 'object' && !Array.isArray(current) && 'data' in current) {
      current = (current as RecordValue).data;
    } else break;
  }
  return current;
}
function record(value: unknown): RecordValue {
  const v = unwrap(value);
  return v && typeof v === 'object' && !Array.isArray(v) ? v as RecordValue : {};
}
function array(value: unknown, keys: string[] = []): RecordValue[] {
  const v = unwrap(value);
  if (Array.isArray(v)) return v.filter((x): x is RecordValue => !!x && typeof x === 'object');
  if (v && typeof v === 'object') {
    const r = v as RecordValue;
    for (const key of keys) if (Array.isArray(r[key])) return (r[key] as unknown[]).filter((x): x is RecordValue => !!x && typeof x === 'object');
  }
  return [];
}
function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
function str(value: unknown, fallback = 'Unknown'): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}
function pick(row: RecordValue, keys: string[], fallback?: unknown): unknown {
  for (const key of keys) if (row[key] !== undefined && row[key] !== null) return row[key];
  return fallback;
}
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value);
}
function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0m';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function rangeFor(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: dateKey(from), to: dateKey(to) };
}
function queryArgs(range: { from: string; to: string }) {
  return { query: range };
}

function Panel({ title, action, children, className = '' }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-xl border border-border bg-card ${className}`}>
      <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border px-3 py-2">
        <h2 className="text-[12px] font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
function Metric({ label, value, detail, icon: Icon, tone = 'blue' }: {
  label: string; value: string; detail?: string; icon: React.ComponentType<{ className?: string }>; tone?: 'blue' | 'green' | 'amber' | 'violet';
}) {
  const tones = {
    blue: 'bg-blue-500/10 text-status-info',
    green: 'bg-emerald-500/10 text-status-success',
    amber: 'bg-amber-500/10 text-status-warning',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-3.5 w-3.5" /></span>
      </div>
      <div className="mt-1 text-xl font-semibold leading-6 tracking-tight tabular-nums">{value}</div>
      {detail ? <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{detail}</div> : null}
    </div>
  );
}
function Donut({ data, emptyLabel = 'No data' }: { data: ChartDatum[]; emptyLabel?: string }) {
  const valid = data.filter(x => x.count > 0).slice(0, 8);
  const total = valid.reduce((sum, x) => sum + x.count, 0);
  let offset = 0;
  const gradient = valid.map((item, index) => {
    const start = offset;
    offset += (item.count / Math.max(total, 1)) * 100;
    return `${PALETTE[index % PALETTE.length]} ${start}% ${offset}%`;
  }).join(', ');
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3">
      <div className="relative mx-auto h-28 w-28 rounded-full" style={{ background: total ? `conic-gradient(${gradient})` : 'var(--muted)' }}>
        <div className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full bg-card">
          <span className="text-lg font-semibold tabular-nums">{formatNumber(total)}</span>
          <span className="text-[9px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="min-w-0 space-y-2">
        {valid.length ? valid.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
            <span className="min-w-0 flex-1 truncate text-[11px]">{item.name}</span>
            <span className="text-[10px] tabular-nums text-muted-foreground">{formatNumber(item.count)}</span>
            <span className="w-9 text-right text-[10px] tabular-nums text-muted-foreground">{Math.round(item.count / Math.max(total, 1) * 100)}%</span>
          </div>
        )) : <p className="text-[11px] text-muted-foreground">{emptyLabel}</p>}
      </div>
    </div>
  );
}
function Bars({ data, labelKey = 'name', valueKey = 'count', maxRows = 7 }: { data: RecordValue[]; labelKey?: string; valueKey?: string; maxRows?: number }) {
  const rows = data.slice(0, maxRows).map(row => ({ label: str(pick(row, [labelKey, 'path', 'date', 'eventType', 'name'])), value: num(pick(row, [valueKey, 'views', 'pageViews', 'events', 'sessions'])) }));
  const max = Math.max(1, ...rows.map(x => x.value));
  if (!rows.length) return <p className="py-3 text-[11px] text-muted-foreground">No data for this period.</p>;
  return <div className="space-y-3">{rows.map((row, i) => (
    <div key={`${row.label}-${i}`} className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-[11px]">{row.label}</span>
        <span className="shrink-0 text-[10px] font-semibold tabular-nums">{formatNumber(row.value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${Math.max(row.value > 0 ? 2 : 0, row.value / max * 100)}%`, backgroundColor: PALETTE[i % PALETTE.length] }} /></div>
    </div>
  ))}</div>;
}
function TrendChart({ data }: { data: RecordValue[] }) {
  const rows = data.map(row => ({
    date: str(pick(row, ['date', 'day', 'dayKey']), ''),
    views: num(pick(row, ['pageViews'])),
    sessions: num(pick(row, ['sessions'])),
    visitors: num(pick(row, ['uniqueVisitors'])),
  }));
  if (!rows.length) return <div className="flex h-44 items-center justify-center text-[11px] text-muted-foreground">No trend data for this period.</div>;
  const width = 600, height = 175, padX = 10, padY = 12;
  const max = Math.max(1, ...rows.flatMap(r => [r.views, r.sessions, r.visitors]));
  const points = (key: 'views' | 'sessions' | 'visitors') => rows.map((r, i) => {
    const x = rows.length === 1 ? width / 2 : padX + i * (width - padX * 2) / (rows.length - 1);
    const y = height - padY - (r[key] / max) * (height - padY * 2);
    return `${x},${y}`;
  }).join(' ');
  const series = [{ key: 'views' as const, label: 'Page views', color: '#2563eb' }, { key: 'sessions' as const, label: 'Sessions', color: '#10b981' }, { key: 'visitors' as const, label: 'Unique visitor-days', color: '#f59e0b' }];
  return <div>
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img" aria-label="Daily website analytics trend">
      {[0, 1, 2, 3].map(i => <line key={i} x1="0" x2={width} y1={padY + i * (height - padY * 2) / 3} y2={padY + i * (height - padY * 2) / 3} stroke="currentColor" opacity=".1" />)}
      {series.map(s => <polyline key={s.key} points={points(s.key)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />)}
    </svg>
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">{series.map(s => <span key={s.key} className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label}</span>)}</div>
    <div className="mt-2 flex justify-between text-[9px] text-muted-foreground"><span>{rows[0]?.date}</span><span>{rows[Math.floor(rows.length / 2)]?.date}</span><span>{rows[rows.length - 1]?.date}</span></div>
  </div>;
}
function TableList({ rows, labelKeys, valueKeys, loading, empty = 'No data for this period.', valueFormat = 'number' }: { rows: RecordValue[]; labelKeys: string[]; valueKeys: string[]; loading: boolean; empty?: string; valueFormat?: 'number' | 'duration-ms' }) {
  if (loading && !rows.length) return <p className="py-5 text-center text-[11px] text-muted-foreground">Loading…</p>;
  if (!rows.length) return <p className="py-5 text-center text-[11px] text-muted-foreground">{empty}</p>;
  return <div className="divide-y divide-border">{rows.slice(0, 7).map((row, i) => <div key={`${str(pick(row, labelKeys), String(i))}-${i}`} className="flex items-center justify-between gap-3 py-2">
    <span className="min-w-0 truncate text-[11px]">{str(pick(row, labelKeys))}</span>
    <span className="shrink-0 text-[11px] font-semibold tabular-nums">{valueFormat === 'duration-ms' ? formatDuration(num(pick(row, valueKeys))) : formatNumber(num(pick(row, valueKeys)))}</span>
  </div>)}</div>;
}

export default function WebsiteAnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [detailPanelsReady, setDetailPanelsReady] = useState(false);
  const detailPanelsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const range = useMemo(() => rangeFor(days), [days]);
  const args = useMemo(() => queryArgs(range), [range]);

  useEffect(() => {
    const target = detailPanelsRef.current;
    if (!target) return;
    if (typeof IntersectionObserver === 'undefined') {
      setDetailPanelsReady(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setDetailPanelsReady(true);
        observer.disconnect();
      }
    }, { rootMargin: '500px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const dashboardQ = useGetDashboardQuery<WebsiteAnalyticsDashboardResponse>(args, { staleTime: 60_000 });
  const realtimeQ = useGetRealtimeQuery<WebsiteAnalyticsRealtime>({ refetchInterval: 30_000, staleTime: 15_000 });
  const engagementQ = useGetPageEngagementQuery({ query: { ...range, limit: '10' } }, { enabled: detailPanelsReady, staleTime: 60_000 });
  const visitorTypesQ = useGetVisitorTypesQuery<WebsiteAnalyticsVisitorTypes>(args, { staleTime: 60_000 });
  const conversionsQ = useGetConversionsQuery<WebsiteAnalyticsConversions>(args, { staleTime: 60_000 });
  const entryQ = useGetEntryPagesQuery({ query: { ...range, limit: '7' } }, { enabled: detailPanelsReady, staleTime: 60_000 });
  const exitQ = useGetExitPagesQuery({ query: { ...range, limit: '7' } }, { enabled: detailPanelsReady, staleTime: 60_000 });
  const visitorsQ = useGetVisitorsQuery<WebsiteAnalyticsVisitorBreakdown[]>(args, { staleTime: 60_000 });
  const dailyQ = useGetDailyTrendQuery<WebsiteAnalyticsDailyRow[]>(args, { staleTime: 60_000 });
  const hourlyQ = useGetHourlyTrendQuery<WebsiteAnalyticsHourlyTrend[]>(args, { enabled: detailPanelsReady, staleTime: 60_000 });

  const dashboard = record(dashboardQ.data);
  const overview = record(dashboard.overview);
  const technology = record(dashboard.technology);
  const geography = record(dashboard.geography);
  const traffic = record(dashboard.traffic);
  const realtime = record(realtimeQ.data);
  const conversions = record(conversionsQ.data);
  const visitorTypes = record(visitorTypesQ.data);
  const visitors = array(visitorsQ.data, ['visitors', 'items', 'results']);
  const pages = array(dashboard.pages, ['pages', 'items', 'results']);
  const sources = array(traffic.sources, ['sources', 'items', 'results']);
  const countries = array(geography.countries, ['countries', 'items', 'results']);
  const devices = array(technology.devices, ['devices', 'items', 'results']);
  const browsers = array(technology.browsers, ['browsers', 'items', 'results']);
  const events = array(dashboard.events, ['events', 'items', 'results']);
  const engagement = array(engagementQ.data, ['pages', 'items', 'results']);
  const entryPages = array(entryQ.data, ['pages', 'items', 'results']);
  const exitPages = array(exitQ.data, ['pages', 'items', 'results']);
  const daily = array(dailyQ.data, ['items', 'results', 'rows']);
  const hourly = array(hourlyQ.data, ['items', 'results', 'rows']);

  const active = num(pick(realtime, ['activeVisitors']));
  const totalVisitors = num(pick(overview, ['visitors']));
  const uniqueVisitorDays = num(pick(overview, ['uniqueVisitorDays']));
  const sessions = num(pick(overview, ['sessions']));
  const pageViews = num(pick(overview, ['pageViews']));
  const eventsCount = num(pick(overview, ['events']));
  const conversionsCount = num(pick(conversions, ['conversions'], pick(overview, ['conversions'])));
  const conversionRate = num(pick(conversions, ['conversionRate']));
  const bounceRate = num(pick(overview, ['bounceRate']));
  const avgSession = num(pick(overview, ['averageSessionDurationMs']));
  const registered = num(pick(visitors.find(v => pick(v, ['visitorType']) === 'registered') ?? {}, ['visitors']));
  const anonymous = num(pick(visitors.find(v => pick(v, ['visitorType']) === 'anonymous') ?? {}, ['visitors']));
  const visitorPie = [
    { name: 'Registered', count: registered },
    { name: 'Anonymous', count: anonymous },
  ];
  const newReturningPie = [
    { name: 'New', count: num(pick(visitorTypes, ['newVisitors'])) },
    { name: 'Returning', count: num(pick(visitorTypes, ['returningVisitors'])) },
  ];
  const devicePie = devices.map(row => ({ name: str(pick(row, ['name', 'device', 'type'])), count: num(pick(row, ['count', 'sessions', 'visitors'])) }));
  const sourcePie = sources.map(row => ({ name: str(pick(row, ['name', 'source'])), count: num(pick(row, ['count', 'sessions', 'visitors'])) }));
  const trendError = dashboardQ.isError && dailyQ.isError;
  const refresh = () => {
    // Invalidate the page's query family. Active datasets refresh immediately;
    // deferred datasets remain idle until their panels approach the viewport.
    void queryClient.invalidateQueries({ queryKey: ['website-analytics'] });
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-3 p-1 sm:p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><FaChartLine className="h-4 w-4" /></span>
          <h1 className="text-base font-semibold tracking-tight">Website analytics</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-status-success"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · {formatNumber(active)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <select aria-label="Analytics date range" value={days} onChange={e => setDays(Number(e.target.value))} className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] outline-none focus:ring-2 focus:ring-primary/30">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={180}>Last 180 days</option>
          </select>
          <button type="button" onClick={refresh} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-medium hover:bg-muted"><FaRotate className={`h-3 w-3 ${dashboardQ.isFetching ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>
      </div>

      {dashboardQ.isError && !dashboardQ.data ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-4 text-[12px] text-status-danger">Could not load website analytics. Check the admin API connection and retry.</div> : null}

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
        <Metric label="Active visitors" value={formatNumber(active)} detail="Last 5 minutes" icon={FaUsers} tone="green" />
        <Metric label="Visitors" value={formatNumber(totalVisitors)} detail="Visitor profiles in range" icon={FaGlobe} />
        <Metric label="Unique visitor-days" value={formatNumber(uniqueVisitorDays)} detail="Daily unique identities" icon={FaUsers} tone="violet" />
        <Metric label="Sessions" value={formatNumber(sessions)} detail={`${formatNumber(pageViews)} page views`} icon={FaWindowMaximize} tone="blue" />
        <Metric label="Conversions" value={formatNumber(conversionsCount)} detail={`${conversionRate.toFixed(2)}% conversion rate`} icon={FaArrowTrendUp} tone="green" />
        <Metric label="Bounce rate" value={`${bounceRate.toFixed(1)}%`} detail={`${formatDuration(avgSession)} avg session`} icon={FaBolt} tone="amber" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <Panel title="Traffic trend" action={<span className="text-[10px] text-muted-foreground">{range.from} — {range.to}</span>}>
          {dailyQ.isLoading ? <div className="flex h-44 items-center justify-center text-[11px] text-muted-foreground">Loading trend…</div> : trendError ? <p className="py-10 text-center text-[11px] text-muted-foreground">Trend data unavailable.</p> : <TrendChart data={daily} />}
        </Panel>
        <Panel title="Visitor composition">
          <div className="space-y-4">
            <div><div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Registered vs anonymous</div><Donut data={visitorPie} /></div>
            <div className="border-t border-border pt-3"><div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">New vs returning</div><Donut data={newReturningPie} /></div>
          </div>
        </Panel>
      </div>

      <div ref={detailPanelsRef} className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        <Panel title="Top pages"><TableList rows={pages} labelKeys={['path']} valueKeys={['views']} loading={dashboardQ.isLoading} /></Panel>
        <Panel title="Traffic sources"><Donut data={sourcePie} /></Panel>
        <Panel title="Devices"><Donut data={devicePie} /></Panel>
        <Panel title="Countries"><TableList rows={countries} labelKeys={['name', 'country']} valueKeys={['count']} loading={dashboardQ.isLoading} /></Panel>
        <Panel title="Page engagement"><TableList rows={engagement} labelKeys={['path']} valueKeys={['averageTimeMs']} loading={!detailPanelsReady || engagementQ.isLoading} valueFormat="duration-ms" /></Panel>
        <Panel title="Event types"><Bars data={events} labelKey="name" valueKey="count" /></Panel>
        <Panel title="Entry pages"><TableList rows={entryPages} labelKeys={['path']} valueKeys={['count']} loading={!detailPanelsReady || entryQ.isLoading} /></Panel>
        <Panel title="Exit pages"><TableList rows={exitPages} labelKeys={['path']} valueKeys={['count']} loading={!detailPanelsReady || exitQ.isLoading} /></Panel>
        <Panel title="Browsers"><TableList rows={browsers} labelKeys={['name']} valueKeys={['count']} loading={dashboardQ.isLoading} /></Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Hourly activity">
          {!detailPanelsReady || hourlyQ.isLoading ? <p className="py-5 text-center text-[11px] text-muted-foreground">Loading hourly activity…</p> : <Bars data={hourly.map(row => ({ ...row, name: `${String(num(row.hour)).padStart(2, '0')}:00`, count: num(row.events) })).sort((a, b) => num(b.count) - num(a.count))} />}
        </Panel>
        <Panel title="Realtime activity" action={<span className="text-[10px] text-muted-foreground">Auto refresh · 30s</span>}>
          {realtimeQ.isLoading ? <p className="py-5 text-center text-[11px] text-muted-foreground">Loading…</p> : array(realtime.recentEvents, ['recentEvents']).length ? (
            <div className="divide-y divide-border">{array(realtime.recentEvents, ['recentEvents']).slice(0, 7).map((event, i) => (
              <div key={`${str(pick(event, ['eventId', 'eventName']), String(i))}-${i}`} className="flex items-center gap-2 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-medium">{str(pick(event, ['eventName', 'eventType']))}</div><div className="truncate text-[10px] text-muted-foreground">{str(pick(event, ['path']), '/')} · {str(pick(event, ['visitorType']), 'visitor')}</div></div>
                <span className="shrink-0 text-[9px] text-muted-foreground">{pick(event, ['occurredAt']) ? new Date(String(pick(event, ['occurredAt']))).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </div>
            ))}</div>
          ) : <p className="py-5 text-center text-[11px] text-muted-foreground">No recent activity.</p>}
        </Panel>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-muted-foreground">
        <span>{formatNumber(eventsCount)} tracked events · {formatNumber(num(pick(overview, ['registeredEvents'])))} registered · {formatNumber(num(pick(overview, ['anonymousEvents'])))} anonymous</span>
        <span className="inline-flex items-center gap-1"><FaClock className="h-2.5 w-2.5" /> Updated {dashboardQ.dataUpdatedAt ? new Date(dashboardQ.dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
      </div>
    </main>
  );
}


