'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaRotate } from 'react-icons/fa6';
import { useMatchPresentation } from '@/hooks/use-match-presentation';
import { useOddsCenter, useOddsMonitor, useRefreshOddsMonitor } from '@/hooks/use-odds';
import type { OddsCenterFixture as Fixture, OddsCenterMarket as Market } from '@/types/odds-center';
import { displayScore, displayStatusLabel, displayStatusTone, getDisplayMatchStatus } from '@/lib/match-status';

type DateTab = { key: string; label: string; date: Date };


function CompactLogo({ src, alt, fallback, size = 14 }: { src?: string | null; alt: string; fallback: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span aria-label={`${alt} logo unavailable`} title={alt} className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted text-[8px] font-bold text-muted-foreground" style={{ width: size, height: size }}>{fallback.slice(0, 2).toUpperCase()}</span>;
  return <img src={src} alt={`${alt} logo`} width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}


type RecordValue = Record<string, unknown>;
type MonitorRow = { name: string; value: unknown };

function prettyKey(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function primitiveText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString('en-GB') : '—';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function flattenMonitor(value: unknown, prefix = '', depth = 0): MonitorRow[] {
  if (depth >= 6 || value === null || typeof value !== 'object') {
    return [{ name: prefix || 'Value', value }];
  }
  if (Array.isArray(value)) {
    if (!value.length) return [{ name: prefix || 'Items', value: '—' }];
    if (value.every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))) {
      return [{ name: prefix || 'Items', value: value.map(primitiveText).join(', ') }];
    }
    return value.flatMap((item, index) => flattenMonitor(item, `${prefix || 'Items'} ${index + 1}`, depth + 1));
  }
  const entries = Object.entries(value as RecordValue);
  if (!entries.length) return [{ name: prefix || 'Value', value: '—' }];
  return entries.flatMap(([key, item]) => {
    const name = prefix ? `${prefix} / ${prettyKey(key)}` : prettyKey(key);
    if (item !== null && typeof item === 'object') return flattenMonitor(item, name, depth + 1);
    return [{ name, value: item }];
  });
}

function MonitorMetric({ name, value }: { name: string; value: unknown }) {
  const text = primitiveText(value);
  const tone = /fail|error|warn|degrad|blocked/i.test(`${name} ${text}`)
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-foreground';
  return <div className="min-w-0 rounded-md border border-border/80 bg-background/70 px-2 py-1.5">
    <div className="whitespace-normal break-words text-[9px] font-medium text-muted-foreground">{prettyKey(name)}</div>
    <div className={`mt-0.5 whitespace-normal break-words text-sm font-semibold leading-tight tabular-nums ${tone}`}>{text}</div>
  </div>;
}

function MonitorDetail({ title, value, open = false }: { title: string; value: unknown; open?: boolean }) {
  const rows = flattenMonitor(value);
  return <details open={open} className="min-w-0 rounded-md border border-border/80 bg-card">
    <summary className="cursor-pointer select-none px-2 py-1.5 text-[10px] font-semibold">{title}<span className="ml-1 font-normal text-muted-foreground">{rows.length}</span></summary>
    <div className="overflow-x-auto border-t border-border/70">
      <table className="w-full min-w-[420px] border-collapse text-left text-[10px]">
        <thead className="bg-muted/40 text-[9px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-2 py-1.5 font-semibold">Field</th><th className="px-2 py-1.5 font-semibold">Value</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.name}-${index}`} className="border-t border-border/60 align-top"><td className="w-[40%] whitespace-normal break-words px-2 py-1.5 font-medium">{row.name}</td><td className="whitespace-normal break-words px-2 py-1.5">{primitiveText(row.value)}</td></tr>)}</tbody>
      </table>
    </div>
  </details>;
}

function OddsMonitorPanel({ query }: { query: ReturnType<typeof useOddsMonitor> }) {
  const data = query.data;
  const checks = data?.checks ?? [];
  const alerts = data?.alerts ?? [];
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'CRITICAL');
  const warningAlerts = alerts.filter((alert) => alert.severity === 'WARNING');
  const groups: Array<[string, unknown]> = [
    ['Worker', data?.worker],
    ['Inventory sweep', data?.inventorySweep],
    ['Pricing queue', data?.pricingQueue],
    ['Price inventory and quality', data?.inventory],
    ['Sports dependency', data?.sportsDependency],
    ['Pricing configuration', data?.configuration],
    ['Market catalogue', data?.catalogue],
    ['Database indexes', data?.indexes],
    ['Monitor metadata', data?.monitor],
  ];
  return <section className="space-y-1.5">
    {query.isError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-[10px] text-destructive"><span>{query.error instanceof Error ? query.error.message : 'Could not load Odds Monitor.'}</span><button type="button" onClick={() => void query.refetch()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-5">
      <MonitorMetric name="Status" value={data?.status ?? (query.isLoading ? 'Loading' : 'Unknown')} />
      <MonitorMetric name="Generated at" value={data?.generatedAt ? new Date(data.generatedAt).toLocaleString('en-GB') : '—'} />
      <MonitorMetric name="Stored selections" value={data?.inventory?.totalSelections} />
      <MonitorMetric name="Prediction-ready" value={data?.inventory?.predictionReadySelections} />
      <MonitorMetric name="Worker running" value={data?.worker?.running} />
      <MonitorMetric name="Due pricing jobs" value={data?.pricingQueue?.duePendingCount} />
      <MonitorMetric name="Critical alerts" value={criticalAlerts.length} />
      <MonitorMetric name="Warnings" value={warningAlerts.length} />
      <MonitorMetric name="External API calls" value={data?.externalApiCalls ?? 0} />
    </div>
    {data?.message ? <p className="rounded-md border border-border/80 bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">{data.message}</p> : null}
    <details open className="rounded-md border border-border/80 bg-card">
      <summary className="cursor-pointer select-none px-2 py-1.5 text-[10px] font-semibold">Health checks <span className="ml-1 font-normal text-muted-foreground">{checks.length}</span></summary>
      <div className="overflow-x-auto border-t border-border/70">
        <table className="w-full min-w-[640px] border-collapse text-left text-[10px]">
          <thead className="bg-muted/40 text-[9px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-2 py-1.5 font-semibold">Check</th><th className="px-2 py-1.5 font-semibold">Status</th><th className="px-2 py-1.5 font-semibold">Message</th><th className="px-2 py-1.5 font-semibold">Value</th></tr></thead>
          <tbody>{query.isLoading ? <tr><td colSpan={4} className="px-2 py-4 text-center text-muted-foreground">Loading checks…</td></tr> : checks.length ? checks.map((check, index) => <tr key={`${check.name}-${index}`} className="border-t border-border/60 align-top"><td className="whitespace-normal break-words px-2 py-1.5 font-medium">{check.name}</td><td className="whitespace-nowrap px-2 py-1.5"><span className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-semibold ${String(check.status).toUpperCase() === 'OK' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : String(check.status).toUpperCase() === 'FAIL' ? 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>{check.status}</span></td><td className="whitespace-normal break-words px-2 py-1.5">{check.message ?? '—'}</td><td className="whitespace-normal break-words px-2 py-1.5">{check.value === undefined ? '—' : primitiveText(check.value)}</td></tr>) : <tr><td colSpan={4} className="px-2 py-4 text-center text-muted-foreground">No checks returned.</td></tr>}</tbody>
        </table>
      </div>
    </details>
    {alerts.length ? <MonitorDetail title="Operational alerts" value={alerts} open /> : <p className="rounded-md border border-emerald-500/25 bg-emerald-500/5 px-2 py-2 text-[10px] text-emerald-700 dark:text-emerald-300">No active Odds alerts reported.</p>}
    {groups.map(([title, value]) => value !== undefined ? <MonitorDetail key={title} title={title} value={value} /> : null)}
    {data?.cached ? <p className="text-[9px] text-muted-foreground">Cached monitor snapshot{data.refreshInProgress ? ' · refresh in progress' : ''}.</p> : null}
  </section>;
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
function endOfDay(date: Date) {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  return value;
}
function makeDateTabs(): DateTab[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index - 1);
    let label: string;
    if (index === 0) label = 'Yesterday';
    else if (index === 1) label = 'Today';
    else if (index === 2) label = 'Tomorrow';
    else label = date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, label, date };
  });
}
function leagueLabel(name?: string | null, id?: string | null) {
  const cleanName = String(name ?? '').trim();
  const cleanId = String(id ?? '').trim();
  const looksLikeCode = (value: string) => /^[a-z0-9]+(?:[._][a-z0-9]+)+$/i.test(value);
  if (cleanName && cleanName.toLowerCase() !== cleanId.toLowerCase() && !looksLikeCode(cleanName)) return cleanName;
  if (cleanId && !looksLikeCode(cleanId)) return cleanId.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  return cleanName && !looksLikeCode(cleanName) ? cleanName : 'League name unavailable';
}
function marketFor(fixture: Fixture, ids: string[]) {
  return fixture.markets.find((market) => ids.includes(market.id));
}
function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message?: unknown }).message ?? '');
  return 'Could not load stored odds. Check the backend and try again.';
}

const EMPTY_FIXTURES: Fixture[] = [];

export default function OddsCenter() {
  const dateTabs = useMemo(makeDateTabs, []);
  const [selectedDate, setSelectedDate] = useState(dateTabs.find((tab) => tab.label === 'Today')?.key ?? dateTabs[1].key);
  const [activeLeague, setActiveLeague] = useState('ALL');
  const [moreOpen, setMoreOpen] = useState(false);
  const [openCell, setOpenCell] = useState('');
  const [activeView, setActiveView] = useState<'CENTER' | 'MONITOR'>('CENTER');

  const selectedTab = dateTabs.find((item) => item.key === selectedDate) ?? dateTabs[1];
  const range = useMemo(() => ({
    from: startOfDay(selectedTab.date).toISOString(),
    to: endOfDay(selectedTab.date).toISOString(),
  }), [selectedTab.date]);
  const oddsQuery = useOddsCenter(range);
  const monitorQuery = useOddsMonitor();
  const refreshMonitor = useRefreshOddsMonitor();
  const fixtures = oddsQuery.data?.items ?? EMPTY_FIXTURES;
  const loading = oddsQuery.isLoading;
  const error = oddsQuery.error ? errorText(oddsQuery.error) : '';
  const presentationRefs = useMemo(
    () => fixtures.map((fixture) => ({ eventId: fixture.eventId, fixtureDate: fixture.kickoffAt })),
    [fixtures],
  );
  const matchPresentation = useMatchPresentation(presentationRefs);

  useEffect(() => {
    setActiveLeague('ALL');
    setOpenCell('');
    setMoreOpen(false);
  }, [selectedDate]);

  function load() {
    setOpenCell('');
    void oddsQuery.refetch();
  }

  const leagues = useMemo(() => {
    const unique = new Map<string, { id: string; name: string; logo?: string | null; country?: string | null; count: number }>();
    for (const fixture of fixtures) {
      const presentation = matchPresentation.get(fixture.eventId);
      const current = unique.get(fixture.competitionId);
      if (current) current.count += 1;
      else unique.set(fixture.competitionId, {
        id: fixture.competitionId,
        name: leagueLabel(presentation?.leagueName ?? fixture.competitionName, fixture.competitionId),
        logo: presentation?.leagueLogo,
        country: fixture.competitionRegion,
        count: 1,
      });
    }
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [fixtures, matchPresentation]);

  const visibleLeagues = leagues.slice(0, 5);
  const extraLeagues = leagues.slice(5);
  const shownFixtures = useMemo(() => fixtures
    .filter((fixture) => activeLeague === 'ALL' || fixture.competitionId === activeLeague)
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()), [fixtures, activeLeague]);

  const marketColumns = useMemo(() => {
    const found = new Map<string, { id: string; label: string; family: string; name: string }>();
    for (const fixture of shownFixtures) {
      for (const market of fixture.markets) {
        if (!found.has(market.id)) {
          found.set(market.id, {
            id: market.id,
            label: market.abbreviation || market.name,
            family: market.family || '',
            name: market.name || market.id,
          });
        }
      }
    }
    return [...found.values()].sort((a, b) =>
      a.family.localeCompare(b.family) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
    );
  }, [shownFixtures]);

  function toggleCell(fixture: Fixture, market: Market) {
    const key = `${fixture.eventId}:${market.id}`;
    setOpenCell((current) => current === key ? '' : key);
  }

  function MarketCell({ fixture, market }: { fixture: Fixture; market?: Market }) {
    if (!market || market.selections.length === 0) return <td className="px-0.5 py-1 text-center text-[10px] text-muted-foreground">—</td>;
    const key = `${fixture.eventId}:${market.id}`;
    const isOpen = openCell === key;
    const best = market.selections.length === 1 ? market.selections[0] : null;
    return <td className="relative px-0.5 py-0.5 text-center align-middle">
      <button type="button" onClick={() => toggleCell(fixture, market)} aria-expanded={isOpen}
        title={`${market.name} · ${market.selections.length} selections`}
        className={`inline-flex min-w-[40px] max-w-[56px] items-center justify-center gap-0.5 rounded border px-1 py-1 text-[10px] font-semibold tabular-nums leading-none ${isOpen ? 'border-primary bg-primary/10 text-primary' : 'border-transparent hover:border-border hover:bg-muted'}`}>
        {best ? best.odds.toFixed(2) : `${market.selections.length}×`}<FaChevronDown className="h-1.5 w-1.5 shrink-0 opacity-50" />
      </button>
      {isOpen ? <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-md border border-border bg-popover text-left shadow-xl">
        <div className="border-b border-border px-2 py-1.5"><p className="text-[10px] font-semibold">{market.name}</p></div>
        <div className="max-h-56 overflow-y-auto p-1">
          {market.selections.map((selection) => <div key={`${selection.key}:${selection.line ?? ''}`} className="flex items-center justify-between gap-2 rounded px-1.5 py-1 hover:bg-muted/70">
            <div className="min-w-0"><p className="whitespace-normal break-words text-[10px]">{selection.name}</p><p className="text-[9px] text-muted-foreground">{selection.pricingSource === 'GRIVIT_MODEL' ? 'Grivit' : selection.source === 'PROVIDER' ? (selection.provider ?? selection.bookmaker ?? 'Provider') : 'Estimated'}</p></div>
            <span className="shrink-0 rounded border border-border bg-background px-1.5 py-1 text-[10px] font-bold tabular-nums">{selection.odds.toFixed(2)}</span>
          </div>)}
        </div>
      </div> : null}
    </td>;
  }

  return <main className="mx-auto w-full max-w-[1800px] space-y-2">
    <header className="flex min-h-8 items-center justify-between gap-2">
      <h1 className="text-sm font-semibold tracking-tight">Odds Center</h1>
      <button type="button" onClick={() => { if (activeView === 'MONITOR') refreshMonitor.mutate(); else load(); }} disabled={activeView === 'MONITOR' ? (monitorQuery.isFetching || refreshMonitor.isPending) : loading} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${(activeView === 'MONITOR' ? (monitorQuery.isFetching || refreshMonitor.isPending) : loading) ? 'animate-spin' : ''}`} /> Refresh</button>
    </header>
    <nav aria-label="Odds Center views" className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
      <button type="button" onClick={() => setActiveView('CENTER')} aria-current={activeView === 'CENTER' ? 'page' : undefined} className={`rounded px-2.5 py-1.5 text-[10px] font-semibold ${activeView === 'CENTER' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Odds</button>
      <button type="button" onClick={() => setActiveView('MONITOR')} aria-current={activeView === 'MONITOR' ? 'page' : undefined} className={`rounded px-2.5 py-1.5 text-[10px] font-semibold ${activeView === 'MONITOR' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>Monitor{(monitorQuery.data?.alerts?.filter((alert) => alert.severity === 'CRITICAL').length ?? 0) > 0 ? <span className="ml-1 rounded bg-destructive px-1 py-0.5 text-[8px] text-destructive-foreground">!</span> : null}</button>
    </nav>
    {activeView === 'CENTER' ? <>
    <section className="space-y-1 rounded-lg border border-border bg-card p-1.5">
      <div className="flex flex-wrap items-center justify-center gap-0.5" aria-label="Fixture date">
        {dateTabs.map((tab) => <button key={tab.key} type="button" onClick={() => setSelectedDate(tab.key)} className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] leading-tight ${selectedDate === tab.key ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
          <span className="block">{tab.label}</span><span className={`mt-0.5 block text-[9px] ${selectedDate === tab.key ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{tab.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        </button>)}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-0.5 border-t border-border/70 pt-1" aria-label="League selector">
        <button type="button" onClick={() => { setActiveLeague('ALL'); setMoreOpen(false); }} className={`max-w-36 shrink-0 whitespace-normal break-words rounded-md px-2 py-1.5 text-[10px] ${activeLeague === 'ALL' ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>All leagues <span className="opacity-60">{fixtures.length}</span></button>
        {visibleLeagues.map((league) => <button key={league.id} type="button" title={league.name} onClick={() => { setActiveLeague(league.id); setMoreOpen(false); }} className={`max-w-40 shrink-0 whitespace-normal break-words rounded-md px-2 py-1.5 text-[10px] ${activeLeague === league.id ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}><span className="inline-flex items-center gap-1.5 whitespace-normal break-words"><CompactLogo src={league.logo} alt={league.name} fallback={league.name} size={13} />{league.name}</span></button>)}
        {extraLeagues.length > 0 ? <div className="relative shrink-0">
          <button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] ${moreOpen || extraLeagues.some((league) => league.id === activeLeague) ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>More <span className="opacity-60">{extraLeagues.length}</span><FaChevronDown className="h-2 w-2" /></button>
          {moreOpen ? <div className="absolute right-0 top-full z-40 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-xl">
            {extraLeagues.map((league) => <button key={league.id} type="button" onClick={() => { setActiveLeague(league.id); setMoreOpen(false); }} className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[10px] ${activeLeague === league.id ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}><span className="flex min-w-0 items-center gap-1.5 whitespace-normal break-words"><CompactLogo src={league.logo} alt={league.name} fallback={league.name} size={13} />{league.name}</span><span className="shrink-0 text-[9px] text-muted-foreground">{league.count}</span></button>)}
          </div> : null}
        </div> : null}
        {leagues.length === 0 && !loading ? <span className="px-2 text-[10px] text-muted-foreground">No competitions with odds for this date.</span> : null}
      </div>
    </section>

    {error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[10px] text-destructive"><span>{error}</span><button type="button" onClick={() => void load()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
    {oddsQuery.data?.truncated ? <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-2 text-[10px] text-amber-700 dark:text-amber-300">This result reached the backend's 500-fixture response limit. Narrow the date range to inspect all priced fixtures.</div> : null}

    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto border-collapse text-left text-[10px] leading-tight">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wide text-muted-foreground"><tr>
            <th className="sticky left-0 z-20 w-12 min-w-12 bg-muted/95 px-1.5 py-1.5 font-semibold">Time</th>
            <th className="sticky left-12 z-20 min-w-[190px] bg-muted/95 px-1.5 py-1.5 font-semibold">Match</th>
            {marketColumns.map((column) => <th key={column.id} title={column.id} className="min-w-[48px] whitespace-nowrap px-1 py-1.5 text-center font-semibold">{column.label}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={marketColumns.length + 2} className="px-2 py-8 text-center text-[10px] text-muted-foreground">Loading odds…</td></tr> : shownFixtures.length === 0 ? <tr><td colSpan={marketColumns.length + 2} className="px-2 py-8 text-center text-[10px] text-muted-foreground">No priced fixtures found.</td></tr> : shownFixtures.map((fixture) => <tr key={fixture.eventId} className="border-t border-border/70 hover:bg-muted/20">
              <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-1.5 py-1.5 align-middle text-[9px] font-medium tabular-nums">{formatTime(fixture.kickoffAt)}</td>
              <td className="sticky left-12 z-10 bg-card px-1.5 py-1 align-middle">
                {(() => {
                  const presentation = matchPresentation.get(fixture.eventId);
                  const status = getDisplayMatchStatus(presentation, fixture.status.state, fixture.kickoffAt);
                  const homeName = presentation?.homeTeamName || fixture.homeTeam;
                  const awayName = presentation?.awayTeamName || fixture.awayTeam;
                  const resolvedLeagueName = leagueLabel(presentation?.leagueName ?? fixture.competitionName, fixture.competitionId);
                  const homeScore = displayScore(presentation?.homeScore, status);
                  const awayScore = displayScore(presentation?.awayScore, status);
                  return <div className="flex max-w-[260px] flex-col gap-1">
                    <div className="flex min-w-0 items-start gap-1"><CompactLogo src={presentation?.leagueLogo} alt={resolvedLeagueName} fallback={resolvedLeagueName} size={12} /><span className="min-w-0 flex-1 whitespace-normal break-words text-[8px] text-muted-foreground">{resolvedLeagueName}</span><span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[7px] font-bold leading-none ${displayStatusTone(status)}`}>{displayStatusLabel(status, presentation)}</span></div>
                    <div className="flex min-w-0 items-start gap-1 text-[10px] font-semibold leading-tight" title={homeName}>
                      <CompactLogo src={presentation?.homeTeamLogo} alt={homeName} fallback={homeName} size={14} />
                      <span className="min-w-0 flex-1 whitespace-normal break-words">{homeName}</span><span className="shrink-0 min-w-[12px] text-right font-bold tabular-nums">{homeScore}</span>
                    </div>
                    <div className="flex min-w-0 items-start gap-1 text-[10px] font-semibold leading-tight" title={awayName}>
                      <CompactLogo src={presentation?.awayTeamLogo} alt={awayName} fallback={awayName} size={14} />
                      <span className="min-w-0 flex-1 whitespace-normal break-words">{awayName}</span><span className="shrink-0 min-w-[12px] text-right font-bold tabular-nums">{awayScore}</span>
                    </div>
                  </div>;
                })()}
              </td>
              {marketColumns.map((column) => <MarketCell key={column.id} fixture={fixture} market={marketFor(fixture, [column.id])} />)}
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
    </> : <OddsMonitorPanel query={monitorQuery} />}
  </main>;
}
