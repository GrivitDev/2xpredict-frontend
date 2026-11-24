'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaCalendarDays, FaChevronDown, FaMagnifyingGlass, FaRotate } from 'react-icons/fa6';
import { useGenerateFixtureMutation, useListAdminPickCenterCollectionQuery, useListAdminPickCenterQuery } from '@/hooks/use-prediction-engine';
import type { PickCenterRecord } from '@/types/predictions';
import { resolveTeamDisplayName, useMatchPresentation } from '@/hooks/use-match-presentation';
import { displayScore, displayStatusLabel, displayStatusTone, getDisplayMatchStatus } from '@/lib/match-status';

type PickFixture = PickCenterRecord;
type DateTab = { key: string; label: string; date: Date };
type League = { id: string; name: string; logo?: string | null; priority: string; count: number };



const PRIORITY: Record<string, number> = { ELITE: 0, HIGH: 1, REGIONAL: 2, SELECTIVE: 3 };
const MARKET_LABELS: Record<string, string> = {
  MATCH_RESULT: 'Match Result',
  DOUBLE_CHANCE: 'Double Chance',
  DRAW_NO_BET: 'Draw No Bet',
  TOTAL_GOALS_OVER_UNDER: 'Total Goals Over/Under',
  HOME_TEAM_GOALS_OVER_UNDER: 'Home Team Goals Over/Under',
  AWAY_TEAM_GOALS_OVER_UNDER: 'Away Team Goals Over/Under',
  ASIAN_HANDICAP: 'Asian Handicap',
  BOTH_TEAMS_TO_SCORE: 'Both Teams to Score',
  FIRST_HALF_GOALS_OVER_UNDER: 'First Half Goals Over/Under',
  HALF_TIME_RESULT: 'Half-Time Result',
  TOTAL_CORNERS_OVER_UNDER: 'Total Corners Over/Under',
  HOME_TEAM_CORNERS_OVER_UNDER: 'Home Team Corners Over/Under',
  AWAY_TEAM_CORNERS_OVER_UNDER: 'Away Team Corners Over/Under',
  TOTAL_SHOTS_OVER_UNDER: 'Total Shots Over/Under',
  TOTAL_SHOTS_ON_TARGET_OVER_UNDER: 'Total Shots on Target Over/Under',
  TOTAL_CARDS_OVER_UNDER: 'Total Cards Over/Under',
  TOTAL_FOULS_OVER_UNDER: 'Total Fouls Over/Under',
  TOTAL_OFFSIDES_OVER_UNDER: 'Total Offsides Over/Under',
};

const MARKET_ORDER = Object.keys(MARKET_LABELS);

type StatsPeriod = 'ALL_TIME' | 'LAST_24_HOURS' | 'LAST_48_HOURS' | 'LAST_3_DAYS' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM';
type OutcomeKey = 'won' | 'lost' | 'push' | 'void' | 'pending';
type OutcomeCounts = Record<OutcomeKey, number> & { total: number };
type MarketStatsRow = OutcomeCounts & { marketKey: string; label: string };
const EMPTY_COUNTS = (): OutcomeCounts => ({ total: 0, won: 0, lost: 0, push: 0, void: 0, pending: 0 });
const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'ALL_TIME', label: 'All Time' },
  { value: 'LAST_24_HOURS', label: 'Last 24 Hours' },
  { value: 'LAST_48_HOURS', label: 'Last 48 Hours' },
  { value: 'LAST_3_DAYS', label: 'Last 3 Days' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'CUSTOM', label: 'Custom Range' },
];
function normalizedOutcome(value?: string | null): OutcomeKey {
  const status = String(value ?? 'PENDING').trim().toUpperCase().replace(/[ -]+/g, '_');
  if (status === 'WON' || status === 'HALF_WON') return 'won';
  if (status === 'LOST' || status === 'HALF_LOST') return 'lost';
  if (status === 'PUSH' || status === 'DRAW') return 'push';
  if (status === 'VOID' || status === 'CANCELLED' || status === 'CANCELED' || status === 'ABANDONED') return 'void';
  return 'pending';
}
function addOutcome(counts: OutcomeCounts, outcome: OutcomeKey) {
  counts.total += 1;
  counts[outcome] += 1;
}
function rangeForPeriod(period: StatsPeriod, customFrom: string, customTo: string): { from?: string; to?: string; label: string } {
  if (period === 'ALL_TIME') return { label: 'All available history' };
  if (period === 'CUSTOM') {
    const fromDate = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
    const toDate = customTo ? new Date(`${customTo}T23:59:59.999`) : null;
    return {
      ...(fromDate && Number.isFinite(fromDate.getTime()) ? { from: fromDate.toISOString() } : {}),
      ...(toDate && Number.isFinite(toDate.getTime()) ? { to: toDate.toISOString() } : {}),
      label: customFrom && customTo ? `${customFrom} – ${customTo}` : 'Choose a start and end date',
    };
  }
  const hours: Record<Exclude<StatsPeriod, 'ALL_TIME' | 'CUSTOM'>, number> = {
    LAST_24_HOURS: 24, LAST_48_HOURS: 48, LAST_3_DAYS: 72, LAST_7_DAYS: 168, LAST_30_DAYS: 720,
  };
  const to = new Date();
  const from = new Date(to.getTime() - hours[period] * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString(), label: `${PERIOD_OPTIONS.find((item) => item.value === period)?.label ?? 'Selected period'} · ${from.toLocaleDateString('en-GB')} ${from.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${to.toLocaleDateString('en-GB')} ${to.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` };
}
function summarizeStats(records: PickFixture[]): { matches: OutcomeCounts; markets: OutcomeCounts; breakdown: MarketStatsRow[] } {
  const matches = EMPTY_COUNTS();
  const markets = EMPTY_COUNTS();
  const perMarket = new Map<string, MarketStatsRow>();
  const uniqueMatches = new Map<string, PickFixture>();
  for (const fixture of records) uniqueMatches.set(`${fixture.eventId}:${fixture.leagueId}`, fixture);
  for (const fixture of uniqueMatches.values()) {
    // Match outcome is taken only from the explicit match-result selection; never inferred from other markets.
    const matchResult = (fixture.selectedMarkets ?? []).find((selection) => selection.isMatchResult);
    addOutcome(matches, normalizedOutcome(matchResult?.settlementStatus ?? matchResult?.actualOutcome ?? 'PENDING'));
    for (const selection of fixture.selectedMarkets ?? []) {
      const key = selection.marketKey || 'UNKNOWN_MARKET';
      let row = perMarket.get(key);
      if (!row) {
        row = { marketKey: key, label: MARKET_LABELS[key] ?? selection.marketName ?? key.replace(/[_-]+/g, ' '), ...EMPTY_COUNTS() };
        perMarket.set(key, row);
      }
      const outcome = normalizedOutcome(selection.settlementStatus ?? selection.actualOutcome ?? 'PENDING');
      addOutcome(markets, outcome);
      addOutcome(row, outcome);
    }
  }
  const breakdown = [...perMarket.values()].sort((a, b) => {
    const ai = MARKET_ORDER.indexOf(a.marketKey); const bi = MARKET_ORDER.indexOf(b.marketKey);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    return a.label.localeCompare(b.label);
  });
  return { matches, markets, breakdown };
}
function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return <div className="min-w-0 rounded-md border border-border/80 bg-background/70 px-2 py-1.5">
    <div className="whitespace-normal break-words text-[9px] font-medium text-muted-foreground">{label}</div>
    <div className={`mt-0.5 text-base font-semibold leading-none tabular-nums ${tone ?? 'text-foreground'}`}>{value.toLocaleString('en-GB')}</div>
  </div>;
}
function OutcomeCards({ title, counts }: { title: string; counts: OutcomeCounts }) {
  return <section className="space-y-1">
    <div className="flex items-center justify-between gap-2"><h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3><span className="text-[9px] text-muted-foreground">{counts.total.toLocaleString('en-GB')} total</span></div>
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
      <StatCard label="Total" value={counts.total} />
      <StatCard label="Won" value={counts.won} tone="text-green-600 dark:text-green-400" />
      <StatCard label="Lost" value={counts.lost} tone="text-red-600 dark:text-red-400" />
      <StatCard label="Push" value={counts.push} tone="text-amber-600 dark:text-amber-400" />
      <StatCard label="Void" value={counts.void} tone="text-orange-600 dark:text-orange-400" />
      <StatCard label="Pending" value={counts.pending} tone="text-muted-foreground" />
    </div>
  </section>;
}


function startOfDay(date: Date) { const value = new Date(date); value.setHours(0, 0, 0, 0); return value; }
function endOfDay(date: Date) { const value = startOfDay(date); value.setDate(value.getDate() + 1); return value; }
function makeDateTabs(): DateTab[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(today); date.setDate(today.getDate() + index - 1);
    const label = index === 0 ? 'Yesterday' : index === 1 ? 'Today' : index === 2 ? 'Tomorrow' : date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, label, date };
  });
}
function leagueLabel(name?: string | null, id?: string | null) {
  const cleanName = String(name ?? '').trim();
  const cleanId = String(id ?? '').trim();
  const isIdentifier = (value: string) =>
    !value || /^\s*(?:competition|league|team|fixture):/i.test(value) ||
    /^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value);
  if (cleanName && cleanName.toLowerCase() !== cleanId.toLowerCase() && !isIdentifier(cleanName)) return cleanName;
  return 'League name unavailable';
}
function formatTime(value: string) { return new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
function errorText(error: unknown) { const value = error as { response?: { data?: { message?: string } }; message?: string }; return value?.response?.data?.message ?? value?.message ?? 'Could not load admin Pick Center. Check the backend and try again.'; }
function unwrap<T = Record<string, unknown>>(response: unknown): T {
  if (!response || typeof response !== 'object') return response as T;
  const record = response as Record<string, unknown>;
  const data = record.data;
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    const nested = (data as { data?: T }).data;
    return (nested ?? data) as T;
  }
  return (data ?? record) as T;
}
function pct(value?: number, fallback?: number) { const n = Number(value ?? fallback); return Number.isFinite(n) ? (n <= 1 ? n * 100 : n) : null; }
function probabilityTone(value?: number, fallback?: number) {
  const n = pct(value, fallback);
  if (n === null) return 'text-muted-foreground';
  if (n < 60) return 'text-red-600 dark:text-red-400';
  if (n < 70) return 'text-orange-600 dark:text-orange-400';
  if (n < 80) return 'text-yellow-700 dark:text-yellow-300';
  if (n < 90) return 'text-lime-700 dark:text-lime-300';
  return 'text-green-700 dark:text-green-300';
}
function oddsTone(value: number | undefined) {
  if (!Number.isFinite(Number(value))) return 'text-muted-foreground';
  const n = Number(value);
  if (n < 2) return 'text-green-700 dark:text-green-400';
  if (n < 3) return 'text-lime-700 dark:text-lime-400';
  if (n < 4) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}
function settlementTone(value?: string) {
  const status = String(value ?? 'PENDING').toUpperCase();
  if (status === 'WON') return 'bg-green-500/10 text-green-700 dark:text-green-300';
  if (status === 'LOST') return 'bg-red-500/10 text-red-700 dark:text-red-300';
  if (status === 'VOID' || status === 'PUSH') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300';
  if (status === 'HALF_WON') return 'bg-lime-500/10 text-lime-700 dark:text-lime-300';
  if (status === 'HALF_LOST') return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
  return 'bg-muted text-muted-foreground';
}
function outcomeLabel(value?: string) {
  const status = String(value ?? 'PENDING').toUpperCase();

  return (
    {
      HALF_WON: 'Half Won',
      HALF_LOST: 'Half Lost',
      PENDING: 'Pending',
    } as Record<string, string>
  )[status] ?? status;
}
function CompactLogo({ src, alt, fallback, size = 14 }: { src?: string | null; alt: string; fallback: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span aria-label={`${alt} logo unavailable`} title={alt} className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted text-[8px] font-bold text-muted-foreground" style={{ width: size, height: size }}>{fallback.slice(0, 2).toUpperCase()}</span>;
  return <img src={src} alt={alt} width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

export default function PickCenter() {
  const dateTabs = useMemo(makeDateTabs, []);
  const [selectedDate, setSelectedDate] = useState(dateTabs[1].key);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [generatingEvent, setGeneratingEvent] = useState('');
  const [activeLeague, setActiveLeague] = useState('ALL');
  const [moreOpen, setMoreOpen] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('LAST_24_HOURS');
  const [statsLeague, setStatsLeague] = useState('ALL');
  const [statsSearch, setStatsSearch] = useState('');
  const [statsLeagueSearch, setStatsLeagueSearch] = useState('');
  const [statsCustomFrom, setStatsCustomFrom] = useState(() => {
    const date = new Date(); date.setDate(date.getDate() - 7); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [statsCustomTo, setStatsCustomTo] = useState(() => {
    const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });

  const selectedTab = dateTabs.find((item) => item.key === selectedDate) ?? dateTabs[1];
  const fixturesQuery = useListAdminPickCenterQuery({
    query: {
      from: startOfDay(selectedTab.date).toISOString(),
      to: endOfDay(selectedTab.date).toISOString(),
      includePast: true,
      page: 1,
      pageSize: 100,
    },
  }, { staleTime: 15_000 });
  const fixtures = fixturesQuery.data?.items ?? [];
  const loading = fixturesQuery.isFetching;
  const error = actionError || (fixturesQuery.error ? errorText(fixturesQuery.error) : '');
  const generateFixtureMutation = useGenerateFixtureMutation();

  const statsRange = useMemo(
    () => rangeForPeriod(statsPeriod, statsCustomFrom, statsCustomTo),
    [statsPeriod, statsCustomFrom, statsCustomTo],
  );
  const validCustomStatsRange = statsPeriod !== 'CUSTOM' || Boolean(
    statsCustomFrom && statsCustomTo && statsCustomFrom <= statsCustomTo,
  );
  const statsQuery = useListAdminPickCenterCollectionQuery({
    query: {
      ...(statsRange.from ? { from: statsRange.from } : {}),
      ...(statsRange.to ? { to: statsRange.to } : {}),
      includePast: true,
    },
    pageSize: 100,
    maxPages: 10_000,
  }, { enabled: validCustomStatsRange, staleTime: 60_000 });
  const statsRecords = useMemo(() => {
    if (!validCustomStatsRange) return [];
    const unique = new Map<string, PickFixture>();
    for (const record of statsQuery.data?.items ?? []) {
      unique.set(`${record.eventId}:${record.leagueId}`, record);
    }
    return [...unique.values()];
  }, [statsQuery.data?.items, validCustomStatsRange]);
  const statsLoading = validCustomStatsRange && statsQuery.isFetching;
  const statsError = !validCustomStatsRange
    ? 'Choose a valid custom date range.'
    : statsQuery.error ? errorText(statsQuery.error) : '';
  const matchPresentation = useMatchPresentation(fixtures);

  useEffect(() => {
    setActiveLeague('ALL');
    setActionError('');
  }, [selectedDate]);

  async function load() {
    setActionError('');
    setActiveLeague('ALL');
    await fixturesQuery.refetch();
  }

  async function loadStatistics() {
    if (validCustomStatsRange) await statsQuery.refetch();
  }

  async function generateFixture(fixture: PickFixture) {
    setGeneratingEvent(fixture.eventId);
    setActionMessage('');
    setActionError('');
    try {
      const response = await generateFixtureMutation.mutateAsync({ path: { eventId: fixture.eventId } });
      const result = unwrap<Record<string, unknown>>(response);
      setActionMessage(typeof result?.message === 'string' && result.message.trim() ? result.message : `Generation requested for ${fixture.homeTeamName} vs ${fixture.awayTeamName}.`);
      setActiveLeague('ALL');
    } catch (requestError) {
      setActionError(errorText(requestError));
    } finally {
      setGeneratingEvent('');
    }
  }

  const leagues = useMemo(() => {
    const unique = new Map<string, League>();
    for (const fixture of fixtures) {
      const id = fixture.leagueId || 'unknown';
      const current = unique.get(id);
      if (current) current.count += 1;
      else { const presentation = matchPresentation.get(fixture.eventId); unique.set(id, { id, name: leagueLabel(presentation?.leagueName ?? fixture.leagueName, presentation?.leagueId ?? id), logo: presentation?.leagueLogo ?? fixture.leagueLogo, priority: fixture.leaguePriority || 'SELECTIVE', count: 1 }); }
    }
    return [...unique.values()].sort((a, b) => (PRIORITY[a.priority.toUpperCase()] ?? 4) - (PRIORITY[b.priority.toUpperCase()] ?? 4) || a.name.localeCompare(b.name));
  }, [fixtures, matchPresentation]);
  const statisticsLeagues = useMemo(() => {
    const unique = new Map<string, League>();
    for (const fixture of [...statsRecords, ...fixtures]) {
      const id = fixture.leagueId || 'unknown';
      const current = unique.get(id);
      if (current) current.count += 1;
      else { const presentation = matchPresentation.get(fixture.eventId); unique.set(id, { id, name: leagueLabel(presentation?.leagueName ?? fixture.leagueName, presentation?.leagueId ?? id), logo: presentation?.leagueLogo ?? fixture.leagueLogo, priority: fixture.leaguePriority || 'SELECTIVE', count: 1 }); }
    }
    return [...unique.values()].sort((a, b) => (PRIORITY[a.priority.toUpperCase()] ?? 4) - (PRIORITY[b.priority.toUpperCase()] ?? 4) || a.name.localeCompare(b.name));
  }, [statsRecords, fixtures]);
  const filteredStatsRecords = useMemo(() => statsRecords.filter((fixture) => statsLeague === 'ALL' || fixture.leagueId === statsLeague), [statsRecords, statsLeague]);
  const statsSummary = useMemo(() => summarizeStats(filteredStatsRecords), [filteredStatsRecords]);
  const visibleMarketStats = useMemo(() => statsSummary.breakdown.filter((row) => row.label.toLowerCase().includes(statsSearch.trim().toLowerCase()) || row.marketKey.toLowerCase().includes(statsSearch.trim().toLowerCase())), [statsSummary.breakdown, statsSearch]);
  const selectedStatsLeague = statisticsLeagues.find((league) => league.id === statsLeague);
  const searchableStatsLeagues = statisticsLeagues.filter((league) => league.name.toLowerCase().includes(statsLeagueSearch.trim().toLowerCase()));
  const statsRangeLabel = rangeForPeriod(statsPeriod, statsCustomFrom, statsCustomTo).label;
  const shownLeagues = leagues.slice(0, 5);
  const extraLeagues = leagues.slice(5);
  const shownFixtures = useMemo(() => fixtures.filter((fixture) => activeLeague === 'ALL' || fixture.leagueId === activeLeague).sort((a, b) => new Date(a.fixtureDate).getTime() - new Date(b.fixtureDate).getTime()), [fixtures, activeLeague]);
  const marketColumns = useMemo(() => {
    const found = new Map<string, string>();
    for (const fixture of shownFixtures) for (const selection of fixture.selectedMarkets ?? []) 
      if (!found.has(selection.marketKey)) {
          found.set(
            selection.marketKey,
            MARKET_LABELS[selection.marketKey] ??
              selection.marketName ??
              selection.marketKey,
          );
        }
    return [...found.entries()].sort(([a], [b]) => { const ai = MARKET_ORDER.indexOf(a); const bi = MARKET_ORDER.indexOf(b); if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi); return a.localeCompare(b); }).map(([id, label]) => ({ id, label }));
  }, [shownFixtures]);

  function MarketCell({ fixture, marketKey }: { fixture: PickFixture; marketKey: string }) {
    const selections = (fixture.selectedMarkets ?? []).filter((selection) => selection.marketKey === marketKey);
    if (!selections.length) return <td className="min-w-[126px] px-1.5 py-1.5 text-center text-[11px] text-muted-foreground">—</td>;
    return <td className="min-w-[126px] max-w-[172px] px-1.5 py-1 align-middle">
      <div className="space-y-1">
        {selections.map((selection) => {
          const odds = Number(selection.decimalOdds ?? selection.bookmakerOdds ?? selection.fairOdds);
          const probability = pct(selection.probabilityPercent, selection.probability);
          const confidence = Number(selection.confidence);
          const settlement = selection.settlementStatus ?? selection.actualOutcome ?? 'PENDING';
          const selectionName = selection.selectionName;
          return <div key={`${selection.marketPredictionId}:${selection.selectionKey}`} className="border-b border-border/60 pb-1 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 whitespace-nowrap text-[10px] font-semibold leading-tight tabular-nums">
              <span className={oddsTone(odds)}>{Number.isFinite(odds) ? `${selection.priceType === 'ESTIMATED' ? '~' : ''}${odds.toFixed(2)}` : '—'}</span>
              <span className="text-muted-foreground">odds</span>
              <span className={probabilityTone(probability ?? undefined)}>{probability === null ? '—' : `${probability.toFixed(0)}%`}</span>
              <span className="text-muted-foreground">prob</span>
              <span className={probabilityTone(confidence)}>{Number.isFinite(confidence) ? `${confidence.toFixed(0)}%` : '—'}</span>
            </div>
            <div className="mt-0.5 flex min-w-0 items-baseline gap-1 whitespace-normal text-[11px] leading-tight">
              <span title={selectionName} className="min-w-0 break-words font-medium text-foreground">{selectionName}</span>
              <span className="shrink-0 text-muted-foreground">·</span>
              <span title={settlement} className={`shrink-0 font-bold ${settlementTone(settlement)}`}>{outcomeLabel(settlement)}</span>
            </div>
          </div>;
        })}
      </div>
    </td>;
  }

  return <main className="mx-auto w-full max-w-[1900px] space-y-2">
    <header className="flex min-h-8 items-center justify-between gap-2"><h1 className="text-sm font-semibold tracking-tight">Pick Center</h1><button type="button" onClick={() => { void load(); void loadStatistics(); }} disabled={loading || statsLoading} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></header>
    <section className="space-y-2 rounded-lg border border-border bg-card p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-xs font-semibold tracking-tight">Pick Center Statistics</h2>
        </div>
        <button type="button" onClick={() => void loadStatistics()} disabled={statsLoading} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${statsLoading ? 'animate-spin' : ''}`} /> Refresh stats</button>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-[minmax(150px,0.8fr)_minmax(120px,1fr)]">
        <label className="space-y-1"> 
          <select value={statsPeriod} onChange={(event) => setStatsPeriod(event.target.value as StatsPeriod)} className="h-8 w-full rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:ring-1 focus:ring-primary">{PERIOD_OPTIONS.map((option) => 
            <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <div className="space-y-1">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-1">
          <div className="relative">
            <input value={statsLeagueSearch} onChange={(event) => setStatsLeagueSearch(event.target.value)} placeholder="Search league…" aria-label="Search statistics leagues" className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[10px] outline-none focus:ring-1 focus:ring-primary" /></div><select value={statsLeague} onChange={(event) => setStatsLeague(event.target.value)} aria-label="Statistics league filter" className="h-8 min-w-0 w-full rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:ring-1 focus:ring-primary"><option value="ALL">All Leagues</option>{searchableStatsLeagues.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}</select></div></div>
      </div>
      {statsPeriod === 'CUSTOM' ? 
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="block text-[9px] text-muted-foreground">From</span>
          <div className="relative">
            <FaCalendarDays className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" /><input type="date" value={statsCustomFrom} max={statsCustomTo || undefined} onChange={(event) => setStatsCustomFrom(event.target.value)} className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[10px]" /></div></label><label className="space-y-1"><span className="block text-[9px] text-muted-foreground">To</span><div className="relative"><FaCalendarDays className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" /><input type="date" value={statsCustomTo} min={statsCustomFrom || undefined} onChange={(event) => setStatsCustomTo(event.target.value)} className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[10px]" /></div></label></div> : null}
      <div className="flex flex-wrap items-center justify-between gap-1 border-t border-border/70 pt-1.5"><span className="text-[9px] text-muted-foreground">{statsRangeLabel}{selectedStatsLeague ? ` · ${selectedStatsLeague.name}` : ' · All leagues'}</span><span className="text-[9px] text-muted-foreground">{statsLoading ? 'Calculating from all pages…' : `${filteredStatsRecords.length.toLocaleString('en-GB')} matches loaded`}</span></div>
      {statsError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-[10px] text-destructive"><span>{statsError}</span><button type="button" onClick={() => void loadStatistics()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
      <div className="space-y-2">
        <OutcomeCards title="Match Performance" counts={statsSummary.matches} />
        <OutcomeCards title="Market Performance" counts={statsSummary.markets} />
      </div>
      <section className="overflow-hidden rounded-md border border-border/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-2 py-1.5"><div> 
          <h3 className="text-[10px] font-semibold uppercase tracking-wide">Individual Market Performance</h3>
          </div>
            </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[660px] border-collapse text-left text-[10px] tabular-nums"><thead className="bg-muted/40 text-[9px] uppercase tracking-wide text-muted-foreground"><tr><th className="px-2 py-1.5 font-semibold">Market</th><th className="px-2 py-1.5 text-right font-semibold">Total</th><th className="px-2 py-1.5 text-right font-semibold">Won</th><th className="px-2 py-1.5 text-right font-semibold">Lost</th><th className="px-2 py-1.5 text-right font-semibold">Push</th><th className="px-2 py-1.5 text-right font-semibold">Void</th><th className="px-2 py-1.5 text-right font-semibold">Pending</th></tr></thead><tbody>{statsLoading ? <tr><td colSpan={7} className="px-2 py-5 text-center text-muted-foreground">Loading market statistics…</td></tr> : visibleMarketStats.length === 0 ? <tr><td colSpan={7} className="px-2 py-5 text-center text-muted-foreground">No market statistics for these filters.</td></tr> : visibleMarketStats.map((row) => <tr key={row.marketKey} className="border-t border-border/70 hover:bg-muted/20"><td className="max-w-[260px] px-2 py-1.5 font-medium">{row.label}<span className="ml-1 text-[8px] text-muted-foreground">{row.marketKey}</span></td><td className="px-2 py-1.5 text-right font-semibold">{row.total.toLocaleString('en-GB')}</td><td className="px-2 py-1.5 text-right text-green-600 dark:text-green-400">{row.won.toLocaleString('en-GB')}</td><td className="px-2 py-1.5 text-right text-red-600 dark:text-red-400">{row.lost.toLocaleString('en-GB')}</td><td className="px-2 py-1.5 text-right text-amber-600 dark:text-amber-400">{row.push.toLocaleString('en-GB')}</td><td className="px-2 py-1.5 text-right text-orange-600 dark:text-orange-400">{row.void.toLocaleString('en-GB')}</td><td className="px-2 py-1.5 text-right text-muted-foreground">{row.pending.toLocaleString('en-GB')}</td></tr>)}</tbody></table></div>
      </section>
    </section>
    <section className="space-y-1 rounded-lg border border-border bg-card p-1.5">
      <div className="flex flex-wrap items-center justify-center gap-0.5" aria-label="Pick date selector">{dateTabs.map((tab) => <button key={tab.key} type="button" onClick={() => setSelectedDate(tab.key)} className={`min-w-[54px] rounded-md px-2 py-1.5 text-[10px] ${selectedDate === tab.key ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{tab.label}</button>)}</div>
      <div className="flex flex-wrap items-center justify-center gap-0.5 border-t border-border/70 pt-1" aria-label="Pick league selector">
        <button type="button" onClick={() => setActiveLeague('ALL')} className={`rounded-md px-2 py-1.5 text-[10px] ${activeLeague === 'ALL' ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>All leagues <span className="ml-1 opacity-60">{fixtures.length}</span></button>
        {shownLeagues.map((league) => <button key={league.id} type="button" onClick={() => setActiveLeague(league.id)} title={league.name} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] ${activeLeague === league.id ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}><CompactLogo src={league.logo} alt={league.name} fallback={league.name} size={13} /><span className="max-w-28 whitespace-normal break-words">{league.name}</span><span className="opacity-60">{league.count}</span></button>)}
        {extraLeagues.length ? <div className="relative shrink-0"><button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] ${moreOpen || extraLeagues.some((league) => league.id === activeLeague) ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>More <span className="opacity-60">{extraLeagues.length}</span><FaChevronDown className="h-2 w-2" /></button>{moreOpen ? <div className="absolute right-0 top-full z-40 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-xl">{extraLeagues.map((league) => <button key={league.id} type="button" onClick={() => { setActiveLeague(league.id); setMoreOpen(false); }} className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[10px] ${activeLeague === league.id ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}><span className="flex min-w-0 items-center gap-1.5"><CompactLogo src={league.logo} alt={league.name} fallback={league.name} size={14} /><span className="whitespace-normal break-words">{league.name}</span></span><span className="text-[9px] text-muted-foreground">{league.count}</span></button>)}</div> : null}</div> : null}
        {!leagues.length && !loading ? <span className="px-2 text-[10px] text-muted-foreground">No picks for this date.</span> : null}
      </div>
    </section>
    {error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[10px] text-destructive"><span>{error}</span><button type="button" onClick={() => void load()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
    {actionMessage ? <div role="status" className="rounded-md border border-green-600/25 bg-green-600/5 px-2 py-1.5 text-[10px] text-green-700 dark:text-green-300">{actionMessage}</div> : null}
    <section className="overflow-hidden rounded-md border border-border bg-card"><div className="overflow-x-auto"><table className="w-full min-w-max table-auto border-collapse text-left text-[11px] leading-tight">
      <thead className="bg-muted/60 text-[9px] uppercase tracking-wide text-muted-foreground"><tr><th className="sticky left-0 z-20 w-12 min-w-12 bg-muted/95 px-1.5 py-1.5 font-semibold">Time</th><th className="sticky left-12 z-20 min-w-[190px] bg-muted/95 px-1.5 py-1.5 font-semibold">Match</th>{marketColumns.map((column) => <th key={column.id} title={column.id} className="min-w-[126px] whitespace-nowrap px-1.5 py-1.5 text-center font-semibold">{column.label}</th>)}<th className="min-w-[76px] px-1.5 py-1.5 text-center font-semibold">Action</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan={marketColumns.length + 3} className="px-2 py-8 text-center text-[10px] text-muted-foreground">Loading picks…</td></tr> : shownFixtures.length === 0 ? <tr><td colSpan={marketColumns.length + 3} className="px-2 py-8 text-center text-[10px] text-muted-foreground">No Pick Center records found.</td></tr> : shownFixtures.map((fixture) => <tr key={fixture.eventId} className="border-t border-border/70 hover:bg-muted/20">
        <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-1.5 py-1.5 align-middle text-[9px] font-medium tabular-nums">{formatTime(fixture.fixtureDate)}</td>
        <td className="sticky left-12 z-10 bg-card px-1.5 py-1 align-middle">
          {(() => {
            const presentation = matchPresentation.get(fixture.eventId);
            const status = getDisplayMatchStatus(presentation, undefined, fixture.fixtureDate);
            const rawFixture = fixture as PickFixture & { homeScore?: number | null; awayScore?: number | null };
            const homeName = resolveTeamDisplayName(presentation?.homeTeamName, fixture.homeTeamName);
            const awayName = resolveTeamDisplayName(presentation?.awayTeamName, fixture.awayTeamName);
            const leagueName = leagueLabel(presentation?.leagueName ?? fixture.leagueName, presentation?.leagueId ?? fixture.leagueId);
            const homeScore = displayScore(presentation?.homeScore ?? rawFixture.homeScore, status);
            const awayScore = displayScore(presentation?.awayScore ?? rawFixture.awayScore, status);
            return <div className="flex max-w-[260px] flex-col gap-1">
              <div className="flex min-w-0 items-start gap-1"><CompactLogo src={presentation?.leagueLogo ?? fixture.leagueLogo} alt={leagueName} fallback={leagueName} size={12} /><span className="min-w-0 flex-1 whitespace-normal break-words text-[8px] text-muted-foreground">{leagueName}{presentation?.leagueCountry ? <span className="ml-1 opacity-70">· {presentation.leagueCountry}</span> : null}</span><span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[7px] font-bold leading-none ${displayStatusTone(status)}`}>{displayStatusLabel(status, presentation)}</span></div>
              <div className="flex min-w-0 items-start gap-1.5 text-[10px] font-bold leading-tight" title={homeName}><CompactLogo src={presentation?.homeTeamLogo ?? fixture.homeTeamLogo} alt={homeName} fallback={homeName} size={13} /><span className="min-w-0 flex-1 whitespace-normal break-words">{homeName}</span><span className="shrink-0 min-w-[12px] text-right font-bold tabular-nums">{homeScore}</span></div>
              <div className="flex min-w-0 items-start gap-1.5 text-[10px] font-bold leading-tight" title={awayName}><CompactLogo src={presentation?.awayTeamLogo ?? fixture.awayTeamLogo} alt={awayName} fallback={awayName} size={13} /><span className="min-w-0 flex-1 whitespace-normal break-words">{awayName}</span><span className="shrink-0 min-w-[12px] text-right font-bold tabular-nums">{awayScore}</span></div>
            </div>;
          })()}
        </td>
        {marketColumns.map((column) => <MarketCell key={column.id} fixture={fixture} marketKey={column.id} />)}
        <td className="px-1 py-1.5 text-center align-middle"><button type="button" onClick={() => void generateFixture(fixture)} disabled={Boolean(generatingEvent)} title={`Generate predictions for ${fixture.homeTeamName} vs ${fixture.awayTeamName}`} className="inline-flex min-h-7 items-center justify-center rounded border border-primary/35 px-2 text-[9px] font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50">{generatingEvent === fixture.eventId ? <FaRotate className="mr-1 h-2.5 w-2.5 animate-spin" /> : null}{generatingEvent === fixture.eventId ? 'Working' : 'Generate'}</button></td>
      </tr>)}</tbody>
    </table></div></section>
  </main>;
}

