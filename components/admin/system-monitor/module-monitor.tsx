/* Compact shared UI for operational module monitors. */
'use client';

import { Fragment, useMemo, useState } from 'react';
import { useAdsMonitor, useOddsMonitor, usePromosMonitor, useReferralsMonitor, useSubscriptionsMonitor } from '@/hooks/use-monitoring';
import { useOddsCenter } from '@/hooks/use-odds';

type ModuleKey = 'ads' | 'odds' | 'promos' | 'referrals' | 'subscriptions';
type Row = Record<string, unknown>;
type TabId = 'overview' | 'checks' | 'payload' | 'center';

function record(value: unknown): Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}
function rows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.filter((item): item is Row => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  const source = record(value);
  for (const key of ['items', 'results', 'data', 'checks', 'events', 'fixtures']) {
    if (Array.isArray(source[key])) return rows(source[key]);
  }
  return [];
}
function label(value: unknown): string {
  return String(value ?? '—').replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');
}
function display(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} items` : 'Object';
  return String(value);
}
function flatten(value: unknown, prefix = '', output: { key: string; value: unknown }[] = [], depth = 0) {
  if (depth > 5 || value === null || value === undefined) return output;
  if (Array.isArray(value)) return output;
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value as Row)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (item && typeof item === 'object' && !Array.isArray(item)) flatten(item, path, output, depth + 1);
      else if (!Array.isArray(item)) output.push({ key: path, value: item });
    }
  } else {
    output.push({ key: prefix || 'Value', value });
  }
  return output;
}
function dateInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
function statusClass(value: unknown): string {
  const text = String(value ?? '').toUpperCase();
  if (['OK', 'HEALTHY', 'ONLINE', 'SUCCESS', 'READY', 'COMPLETED', 'TRUE'].some((v) => text.includes(v))) return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-300';
  if (['FAILED', 'ERROR', 'CRITICAL', 'DOWN'].some((v) => text.includes(v))) return 'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-300';
  if (['WARN', 'DEGRADED', 'PENDING', 'RETRY', 'UNKNOWN'].some((v) => text.includes(v))) return 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-300';
  return 'border-border bg-muted/30 text-muted-foreground';
}

function Tabs({ active, values, onChange }: { active: TabId; values: { id: TabId; label: string }[]; onChange: (id: TabId) => void }) {
  return <nav className="flex gap-0.5 overflow-x-auto border-b border-border/70 px-1 py-1">
    {values.map((tab) => <button key={tab.id} type="button" onClick={() => onChange(tab.id)} aria-pressed={active === tab.id} className={`h-7 shrink-0 rounded-md px-2 text-[11px] font-medium ${active === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{tab.label}</button>)}
  </nav>;
}

function PayloadTree({ value, name = 'Payload', depth = 0 }: { value: unknown; name?: string; depth?: number }) {
  if (value === null || value === undefined || typeof value !== 'object') {
    return <div className="grid grid-cols-[minmax(100px,0.8fr)_minmax(0,2fr)] gap-2 border-b border-border/50 px-2 py-1 text-[10px]"><span className="break-words text-muted-foreground">{name}</span><span className="break-words font-medium">{display(value)}</span></div>;
  }
  if (Array.isArray(value)) {
    return <details className="border-b border-border/50" open={depth === 0 && value.length <= 8}>
      <summary className="cursor-pointer px-2 py-1.5 text-[10px] font-semibold">{name} <span className="font-normal text-muted-foreground">({value.length})</span></summary>
      <div className={depth > 1 ? 'pl-2' : 'pl-3'}>
        {value.map((item, index) => <PayloadTree key={`${name}-${index}`} name={`[${index}]`} value={item} depth={depth + 1} />)}
      </div>
    </details>;
  }
  const entries = Object.entries(value as Row);
  return <details className="border-b border-border/50" open={depth === 0}>
    <summary className="cursor-pointer px-2 py-1.5 text-[10px] font-semibold">{name} <span className="font-normal text-muted-foreground">({entries.length})</span></summary>
    <div className={depth > 1 ? 'pl-2' : 'pl-3'}>
      {entries.map(([key, item]) => <PayloadTree key={`${name}.${key}`} name={key} value={item} depth={depth + 1} />)}
    </div>
  </details>;
}

function CompactTable({ value: input, empty = 'No records.' }: { value: unknown; empty?: string }) {
  const items = rows(input);
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!items.length) return <p className="px-3 py-3 text-center text-[11px] text-muted-foreground">{empty}</p>;
  const keys = Array.from(new Set(items.flatMap((item) => Object.keys(item)))).slice(0, 7);
  return <div className="max-h-[65vh] overflow-auto">
    <table className="w-full min-w-[540px] text-left text-[10px]">
      <thead className="sticky top-0 z-10 bg-muted/90 text-muted-foreground"><tr>{keys.map((key) => <th key={key} className="whitespace-nowrap px-2 py-1.5 font-semibold">{label(key)}</th>)}<th className="px-2 py-1.5" /></tr></thead>
      <tbody>{items.map((item, index) => {
        const id = String(item._id ?? item.id ?? item.key ?? item.name ?? index);
        return <Fragment key={id}>
          <tr className="border-t border-border/60 align-top hover:bg-muted/20">
            {keys.map((key) => <td key={key} className="max-w-[240px] px-2 py-1.5"><span title={display(item[key])} className={['status', 'level', 'state', 'outcome'].includes(key.toLowerCase()) ? `inline-flex rounded border px-1.5 py-0.5 ${statusClass(item[key])}` : 'block truncate'}>{display(item[key])}</span></td>)}
            <td className="whitespace-nowrap px-2 py-1"><button type="button" onClick={() => setExpanded(expanded === id ? null : id)} className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:bg-muted">{expanded === id ? 'Hide' : 'View'}</button></td>
          </tr>
          {expanded === id ? <tr><td colSpan={keys.length + 1} className="p-0"><div className="max-h-80 overflow-auto border-y border-border/60 bg-muted/10"><PayloadTree name="Record" value={item} /></div></td></tr> : null}
        </Fragment>;
      })}</tbody>
    </table>
  </div>;
}

export default function ModuleMonitorAdmin({ module }: { module: ModuleKey }) {
  const [tab, setTab] = useState<TabId>('overview');
  const now = new Date();
  const initialFrom = dateInput(now);
  const threeDays = new Date(now);
  threeDays.setDate(threeDays.getDate() + 3);
  const initialTo = dateInput(threeDays);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const ads = useAdsMonitor({ enabled: module === 'ads' });
  const odds = useOddsMonitor({ enabled: module === 'odds' && tab !== 'center' });
  const promos = usePromosMonitor({ enabled: module === 'promos' });
  const referrals = useReferralsMonitor({ enabled: module === 'referrals' });
  const subscriptions = useSubscriptionsMonitor({ enabled: module === 'subscriptions' });

  const validRange = Boolean(from && to && new Date(to).getTime() >= new Date(from).getTime() && (new Date(to).getTime() - new Date(from).getTime()) <= 8 * 86_400_000);
  const center = useOddsCenter({
    from: from ? `${from}T00:00:00.000Z` : '',
    to: to ? `${to}T23:59:59.999Z` : '',
  }, module === 'odds' && tab === 'center' && validRange);

  const selected = module === 'ads' ? ads : module === 'odds' ? odds : module === 'promos' ? promos : module === 'referrals' ? referrals : subscriptions;
  const data = selected.data as unknown;
  const dataRecord = record(data);
  const leafs = useMemo(() => flatten(data).filter((entry) => !entry.key.toLowerCase().includes('password')), [data]);
  const tabs: { id: TabId; label: string }[] = module === 'odds'
    ? [{ id: 'overview', label: 'Overview' }, { id: 'center', label: 'Odds center' }, { id: 'checks', label: 'Checks' }, { id: 'payload', label: 'Payload' }]
    : [{ id: 'overview', label: 'Overview' }, { id: 'checks', label: 'Checks' }, { id: 'payload', label: 'Payload' }];
  const title = ({ ads: 'Ads Monitor', odds: 'Odds Monitor', promos: 'Promos Monitor', referrals: 'Referrals Monitor', subscriptions: 'Subscriptions Monitor' } as const)[module];

  return (
    <section className="overflow-hidden rounded-lg border border-border/80 bg-card">
      <header className="flex min-h-9 items-center justify-between gap-2 border-b border-border/70 px-2 py-1.5">
        <h2 className="text-xs font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <span className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${statusClass(dataRecord.status ?? record(dataRecord.health).status)}`}>{display(dataRecord.status ?? record(dataRecord.health).status ?? (selected.isLoading ? 'Loading' : 'Unknown'))}</span>
          <button type="button" onClick={() => void selected.refetch()} disabled={selected.isFetching} className="h-6 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">{selected.isFetching ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </header>

      <Tabs active={tab} values={tabs} onChange={setTab} />

      {selected.isError ? <div role="alert" className="m-2 rounded border border-rose-500/25 bg-rose-500/5 px-2 py-1.5 text-[11px] text-rose-700 dark:text-rose-300">Monitor request failed.</div> : null}

      {tab === 'overview' ? (
        <div className="p-2">
          {selected.isLoading ? <p className="py-3 text-center text-[11px] text-muted-foreground">Loading…</p> : null}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
            {leafs.slice(0, 40).map((entry) => <div key={entry.key} className="min-w-0 rounded border border-border/70 bg-muted/15 px-2 py-1.5">
              <div className="truncate text-[9px] font-medium text-muted-foreground" title={entry.key}>{label(entry.key.split('.').pop() ?? entry.key)}</div>
              <div className="truncate text-xs font-semibold tabular-nums" title={display(entry.value)}>{display(entry.value)}</div>
            </div>)}
          </div>
          {leafs.length > 40 ? <details className="mt-1.5 rounded border border-border/60"><summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">More metrics ({leafs.length - 40})</summary><div className="grid grid-cols-2 gap-1 p-1 sm:grid-cols-3">{leafs.slice(40).map((entry) => <div key={entry.key} className="min-w-0 rounded border border-border/60 px-2 py-1"><span className="block truncate text-[9px] text-muted-foreground">{entry.key}</span><span className="block truncate text-[10px] font-semibold">{display(entry.value)}</span></div>)}</div></details> : null}
          <details className="mt-1.5 rounded border border-border/60">
            <summary className="cursor-pointer px-2 py-1 text-[10px] font-medium">Complete response</summary>
            <div className="max-h-[55vh] overflow-auto"><PayloadTree value={data} /></div>
          </details>
        </div>
      ) : null}

      {tab === 'checks' ? (
        <div className="space-y-1 p-2">
          {Array.isArray(dataRecord.checks) ? <CompactTable value={dataRecord.checks} empty="No checks returned." /> : null}
          {Array.isArray(dataRecord.warnings) ? <CompactTable value={(dataRecord.warnings as unknown[]).map((value, index) => ({ warning: value, index }))} empty="No warnings." /> : null}
          {Array.isArray(dataRecord.errors) ? <CompactTable value={(dataRecord.errors as unknown[]).map((value, index) => ({ error: value, index }))} empty="No errors." /> : null}
          {!Array.isArray(dataRecord.checks) && !Array.isArray(dataRecord.warnings) && !Array.isArray(dataRecord.errors) ? <PayloadTree name="Checks and status" value={data} /> : null}
        </div>
      ) : null}

      {tab === 'payload' ? <div className="max-h-[70vh] overflow-auto p-2"><PayloadTree value={data} /></div> : null}

      {tab === 'center' ? (
        <div className="space-y-2 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
            <button type="button" onClick={() => void center.refetch()} disabled={!validRange || center.isFetching} className="h-7 rounded border border-border px-2 text-[10px] font-medium hover:bg-muted disabled:opacity-50">{center.isFetching ? 'Loading…' : 'Load odds'}</button>
            <span className="text-[10px] text-muted-foreground">{record(center.data).count === undefined ? '' : `${display(record(center.data).count)} fixtures`}</span>
          </div>
          {!validRange ? <p className="text-[10px] text-rose-600">Choose a valid date range of no more than eight days.</p> : null}
          {center.isError ? <p role="alert" className="text-[10px] text-rose-600">Could not load odds center data.</p> : null}
          <OddsCenterTable data={center.data} loading={center.isLoading || center.isFetching} />
        </div>
      ) : null}
    </section>
  );
}

function OddsCenterTable({ data, loading }: { data: unknown; loading: boolean }) {
  const result = record(data);
  const fixtures = Array.isArray(result.items) ? result.items.map(record) : [];
  const items = fixtures.flatMap((fixture) => {
    const markets = Array.isArray(fixture.markets) ? fixture.markets.map(record) : [];
    return markets.flatMap((market) => {
      const selections = Array.isArray(market.selections) ? market.selections.map(record) : [];
      return selections.map((selection) => ({
        eventId: fixture.eventId,
        fixtureDate: fixture.fixtureDate,
        league: fixture.leagueName ?? fixture.leagueId,
        fixture: `${display(fixture.homeTeam)} v ${display(fixture.awayTeam)}`,
        market: market.name ?? market.id,
        selection: selection.name ?? selection.key,
        odds: selection.odds,
        fairOdds: selection.fairOdds,
        valuePercent: selection.valuePercent,
        impliedProbability: selection.impliedProbability,
        source: selection.source,
        provider: selection.provider,
        bookmaker: selection.bookmaker,
        updatedAt: selection.updatedAt,
      }));
    });
  });
  if (loading) return <p className="py-3 text-center text-[11px] text-muted-foreground">Loading odds…</p>;
  if (!items.length) return <p className="py-3 text-center text-[11px] text-muted-foreground">No priced fixtures in this range.</p>;
  return <div className="max-h-[68vh] overflow-auto rounded border border-border/70">
    <table className="w-full min-w-[850px] text-left text-[10px]">
      <thead className="sticky top-0 bg-muted/90 text-muted-foreground"><tr>{['Fixture', 'Kickoff', 'League', 'Market', 'Selection', 'Odds', 'Fair', 'Value %', 'Source', 'Provider'].map((key) => <th key={key} className="whitespace-nowrap px-2 py-1.5 font-semibold">{key}</th>)}</tr></thead>
      <tbody>{items.map((item, index) => <tr key={`${item.eventId}-${item.market}-${item.selection}-${index}`} className="border-t border-border/60 hover:bg-muted/20">
        <td className="px-2 py-1.5" title={String(item.fixture)}>{String(item.fixture)}</td>
        <td className="whitespace-nowrap px-2 py-1.5">{display(item.fixtureDate)}</td>
        <td className="px-2 py-1.5">{display(item.league)}</td><td className="px-2 py-1.5">{display(item.market)}</td><td className="px-2 py-1.5">{display(item.selection)}</td>
        <td className="px-2 py-1.5 font-semibold tabular-nums">{display(item.odds)}</td><td className="px-2 py-1.5 tabular-nums">{display(item.fairOdds)}</td><td className="px-2 py-1.5 tabular-nums">{display(item.valuePercent)}</td><td className="px-2 py-1.5">{display(item.source)}</td><td className="px-2 py-1.5">{display(item.provider)}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
