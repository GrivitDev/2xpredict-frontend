'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaRotate, FaBullhorn, FaBan, FaChevronDown, FaCalendarDays, FaMagnifyingGlass } from 'react-icons/fa6';
import {
  useListAdminCuratedPredictionsCollectionQuery,
  useListAdminCuratedPredictionsQuery,
  useListAdminPickCenterQuery,
  usePublishCuratedPredictionMutation,
  useRefreshCuratedPredictionsMutation,
  useUnpublishCuratedPredictionMutation,
} from '@/hooks/use-prediction-engine';
import type { CuratedPrediction, CuratedPredictionSelection, PickCenterRecord } from '@/types/predictions';
import { resolveTeamDisplayName, useMatchPresentation } from '@/hooks/use-match-presentation';
import { displayScore, displayStatusLabel, displayStatusTone, getDisplayMatchStatus } from '@/lib/match-status';

type PredictionRow = {
  rowKey: string;
  prediction: CuratedPrediction;
  eventId: string;
  fixtureDate: string;
  leagueId: string;
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueLogo?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  selections: CuratedPredictionSelection[];
};
type MarketColumn = { id: string; label: string };
type DateTab = { key: string; label: string; date: Date };
type LeagueOption = { id: string; name: string; logo?: string | null; count: number };



function startOfDay(date: Date) { const value = new Date(date); value.setHours(0, 0, 0, 0); return value; }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function makeDateTabs(): DateTab[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date(today); date.setDate(today.getDate() + index - 1);
    const label = index === 0 ? 'Yesterday' : index === 1 ? 'Today' : index === 2 ? 'Tomorrow' : date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
    return { key: dateKey(date), label, date };
  });
}

const MARKET_LABELS: Record<string, string> = {
  MATCH_RESULT: 'Match Result',
  DOUBLE_CHANCE: 'Double Chance',
  DRAW_NO_BET: 'Draw No Bet',
  GOALS_OVER_UNDER: 'Goals Over/Under',
  TOTAL_GOALS_OVER_UNDER: 'Total Goals Over/Under',
  HOME_TEAM_GOALS_OVER_UNDER: 'Home Team Goals',
  AWAY_TEAM_GOALS_OVER_UNDER: 'Away Team Goals',
  ASIAN_HANDICAP: 'Asian Handicap',
  EUROPEAN_HANDICAP: 'European Handicap',
  BOTH_TEAMS_TO_SCORE: 'Both Teams to Score',
  FIRST_HALF_GOALS_OVER_UNDER: 'First-Half Goals',
  HALF_TIME_RESULT: 'Half-Time Result',
  SECOND_HALF_RESULT: 'Second-Half Result',
  TOTAL_CORNERS_OVER_UNDER: 'Total Corners',
  HOME_CORNERS_OVER_UNDER: 'Home Corners',
  AWAY_CORNERS_OVER_UNDER: 'Away Corners',
  TOTAL_SHOTS_OVER_UNDER: 'Total Shots',
  TOTAL_SHOTS_ON_TARGET_OVER_UNDER: 'Shots on Target',
  TOTAL_CARDS_OVER_UNDER: 'Total Cards',
  TOTAL_FOULS_OVER_UNDER: 'Total Fouls',
  TOTAL_OFFSIDES_OVER_UNDER: 'Total Offsides',
};

function unwrap<T>(response: unknown): T {
  if (!response || typeof response !== 'object') return response as T;
  const record = response as Record<string, unknown>;
  const data = record.data;
  if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
    return (((data as { data?: T }).data ?? data) as T);
  }
  return (data ?? record) as T;
}

function errorText(error: unknown) {
  const value = error as { response?: { data?: { message?: string | string[] } }; message?: string };
  const message = value?.response?.data?.message ?? value?.message;
  return Array.isArray(message) ? message.join(', ') : message ?? 'Could not load Predictions Center.';
}

function probabilityPercent(value?: number | null): number | null {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return number <= 1 ? number * 100 : number;
}

// Probability: red at 25%, orange between 25–40%, lemon green between 40–60%, green at 60%+.
function probabilityTone(value?: number | null) {
  const number = probabilityPercent(value);
  if (number === null) return 'text-muted-foreground';
  if (number <= 25) return 'text-red-600 dark:text-red-400';
  if (number < 40) return 'text-orange-600 dark:text-orange-400';
  if (number < 60) return 'text-lime-600 dark:text-lime-300';
  return 'text-green-700 dark:text-green-400';
}

// Confidence: red at 35, orange below 50, orange-green/lime below 75, green at 75+.
function confidenceTone(value?: number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'text-muted-foreground';
  if (number <= 35) return 'text-red-600 dark:text-red-400';
  if (number < 50) return 'text-orange-600 dark:text-orange-400';
  if (number < 75) return 'text-lime-600 dark:text-lime-300';
  return 'text-green-700 dark:text-green-400';
}

function probabilityBadgeTone(value?: number | null) {
  const number = probabilityPercent(value);
  if (number === null) return 'bg-muted text-muted-foreground';
  if (number <= 25) return 'bg-red-500/10 text-red-700 dark:text-red-300';
  if (number < 40) return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
  if (number < 60) return 'bg-lime-500/10 text-lime-700 dark:text-lime-300';
  return 'bg-green-500/10 text-green-700 dark:text-green-300';
}

function confidenceBadgeTone(value?: number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'bg-muted text-muted-foreground';
  if (number <= 35) return 'bg-red-500/10 text-red-700 dark:text-red-300';
  if (number < 50) return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
  if (number < 75) return 'bg-lime-500/10 text-lime-700 dark:text-lime-300';
  return 'bg-green-500/10 text-green-700 dark:text-green-300';
}

function CompactLogo({ src, alt, fallback, size = 14 }: { src?: string | null; alt: string; fallback: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span aria-label={`${alt} logo unavailable`} title={alt} className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted text-[8px] font-bold text-muted-foreground" style={{ width: size, height: size }}>{fallback.slice(0, 2).toUpperCase()}</span>;
  return <img src={src} alt={`${alt} logo`} width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

function oddsTone(value?: number | null) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'text-muted-foreground';
  if (number < 2) return 'text-green-700 dark:text-green-400';
  if (number < 3) return 'text-lime-700 dark:text-lime-400';
  if (number < 4) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function publicationTone(status?: string) {
  switch (String(status ?? '').toUpperCase()) {
    case 'PUBLISHED': return 'bg-green-500/10 text-green-700 dark:text-green-300';
    case 'READY': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300';
    case 'SETTLED': return 'bg-muted text-muted-foreground';
    case 'CANCELLED': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

function outcomeTone(value?: string) {
  const status = String(value ?? 'PENDING').toUpperCase();
  if (status === 'WON') return 'text-green-700 dark:text-green-300';
  if (status === 'LOST') return 'text-red-700 dark:text-red-300';
  if (status === 'PUSH') return 'text-amber-700 dark:text-amber-300';
  if (status === 'VOID' || status === 'CANCELLED') return 'text-slate-600 dark:text-slate-300';
  if (status === 'HALF_LOST') return 'text-orange-700 dark:text-orange-300';
  if (status === 'HALF_WON') return 'text-lime-700 dark:text-lime-300';
  return 'text-sky-700 dark:text-sky-300';
}

function outcomeBadgeTone(value?: string) {
  const status = String(value ?? 'PENDING').toUpperCase();
  if (status === 'WON') return 'border-green-600/25 bg-green-500/10 text-green-700 dark:text-green-300';
  if (status === 'LOST') return 'border-red-600/25 bg-red-500/10 text-red-700 dark:text-red-300';
  if (status === 'PUSH') return 'border-amber-600/25 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  if (status === 'VOID' || status === 'CANCELLED') return 'border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-300';
  if (status === 'HALF_WON') return 'border-lime-600/25 bg-lime-500/10 text-lime-700 dark:text-lime-300';
  if (status === 'HALF_LOST') return 'border-orange-600/25 bg-orange-500/10 text-orange-700 dark:text-orange-300';
  return 'border-sky-600/25 bg-sky-500/10 text-sky-700 dark:text-sky-300';
}

function outcomeCardTone(label: string) {
  const key = label.toLowerCase();
  if (key === 'won') return 'border-green-600/25 bg-green-500/[0.06]';
  if (key === 'lost') return 'border-red-600/25 bg-red-500/[0.06]';
  if (key === 'push') return 'border-amber-600/25 bg-amber-500/[0.06]';
  if (key === 'void') return 'border-slate-500/25 bg-slate-500/[0.06]';
  if (key === 'half won') return 'border-lime-600/25 bg-lime-500/[0.06]';
  if (key === 'half lost') return 'border-orange-600/25 bg-orange-500/[0.06]';
  if (key === 'pending') return 'border-sky-600/25 bg-sky-500/[0.06]';
  return 'border-border/70 bg-background/60';
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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


type StatsRange = '24h' | '48h' | '3d' | '7d' | '30d' | 'all' | 'custom';
type OutcomeKey = 'won' | 'lost' | 'push' | 'void' | 'pending';
type OutcomeCounts = Record<OutcomeKey, number> & { total: number };
type MarketStatsRow = OutcomeCounts & { marketKey: string; label: string };
const EMPTY_COUNTS = (): OutcomeCounts => ({ total: 0, won: 0, lost: 0, push: 0, void: 0, pending: 0 });
const STATS_PERIODS: { value: StatsRange; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '48h', label: 'Last 48 Hours' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];
function selectionOutcome(value?: string | null): OutcomeKey {
  const status = String(value ?? 'PENDING').trim().toUpperCase().replace(/[ -]+/g, '_');
  if (status === 'WON' || status === 'HALF_WON') return 'won';
  if (status === 'LOST' || status === 'HALF_LOST') return 'lost';
  if (status === 'PUSH' || status === 'DRAW') return 'push';
  if (status === 'VOID' || status === 'CANCELLED' || status === 'CANCELED' || status === 'ABANDONED') return 'void';
  return 'pending';
}
function matchOutcome(row: PredictionRow): OutcomeKey {
  const predictionOutcome = String(row.prediction.settlementStatus ?? '').toUpperCase();
  if (['WON', 'LOST', 'PUSH', 'VOID'].includes(predictionOutcome)) return selectionOutcome(predictionOutcome);
  const matchSelection = row.selections.find((selection) => {
    const value = selection as CuratedPredictionSelection & { isMatchResult?: boolean };
    return value.isMatchResult === true || ['MATCH_RESULT', 'MATCH_WIN_DRAW_WIN', 'FULL_TIME_RESULT'].includes(String(selection.marketKey).toUpperCase());
  });
  return selectionOutcome(matchSelection?.settlementOutcome);
}
function addOutcome(counts: OutcomeCounts, outcome: OutcomeKey) {
  counts.total += 1;
  counts[outcome] += 1;
}
function statsRangeForPeriod(range: StatsRange, customFrom: string, customTo: string) {
  if (range === 'all') return { from: undefined as string | undefined, to: undefined as string | undefined, label: 'All available history' };
  if (range === 'custom') {
    const fromDate = customFrom ? new Date(`${customFrom}T00:00:00`) : null;
    const toDate = customTo ? new Date(`${customTo}T23:59:59.999`) : null;
    return {
      from: fromDate && Number.isFinite(fromDate.getTime()) ? fromDate.toISOString() : undefined,
      to: toDate && Number.isFinite(toDate.getTime()) ? toDate.toISOString() : undefined,
      label: customFrom && customTo ? `${customFrom} – ${customTo}` : 'Choose a start and end date',
    };
  }
  const hours: Record<Exclude<StatsRange, 'all' | 'custom'>, number> = { '24h': 24, '48h': 48, '3d': 72, '7d': 168, '30d': 720 };
  const to = new Date();
  const from = new Date(to.getTime() - hours[range] * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString(), label: `${STATS_PERIODS.find((item) => item.value === range)?.label ?? 'Selected period'} · ${from.toLocaleDateString('en-GB')} ${from.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${to.toLocaleDateString('en-GB')} ${to.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` };
}
function getStatsRangeStart(range: StatsRange, now: Date): Date | null {
  const hours: Record<Exclude<StatsRange, 'all' | 'custom'>, number> = { '24h': 24, '48h': 48, '3d': 72, '7d': 168, '30d': 720 };
  if (range === 'all' || range === 'custom') return null;
  return new Date(now.getTime() - hours[range] * 60 * 60 * 1000);
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
export default function PredictionsCenter() {
  const dateTabs = useMemo(makeDateTabs, []);
  const [selectedDate, setSelectedDate] = useState(dateTabs[1].key);
  const [activeLeague, setActiveLeague] = useState('ALL');
  const [leagueSearch, setLeagueSearch] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionPrediction, setActionPrediction] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [statsRange, setStatsRange] = useState<StatsRange>('24h');
  const [statsCustomFrom, setStatsCustomFrom] = useState(() => {
    const date = new Date(); date.setDate(date.getDate() - 7);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [statsCustomTo, setStatsCustomTo] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [statsLeague, setStatsLeague] = useState('ALL');
  const [statsLeagueSearch, setStatsLeagueSearch] = useState('');
  const [statsMarketSearch, setStatsMarketSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const selectedTab = dateTabs.find((item) => item.key === selectedDate) ?? dateTabs[1];
  const from = startOfDay(selectedTab.date).toISOString();
  const toDate = new Date(startOfDay(selectedTab.date));
  toDate.setDate(toDate.getDate() + 1);
  toDate.setMilliseconds(toDate.getMilliseconds() - 1);

  const curatedQuery = useListAdminCuratedPredictionsQuery({
    query: { page: 1, pageSize: 200, ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}) },
  }, { staleTime: 15_000 });
  const pickCenterQuery = useListAdminPickCenterQuery({
    query: { from, to: toDate.toISOString(), includePast: true, page: 1, pageSize: 200 },
  }, { staleTime: 15_000 });
  const predictions = curatedQuery.data?.items ?? [];
  const pickCenterLogos = useMemo(() => {
    const logoMap = new Map<string, PickCenterRecord>();
    for (const item of pickCenterQuery.data?.items ?? []) {
      if (item?.eventId) logoMap.set(String(item.eventId), item);
    }
    return logoMap;
  }, [pickCenterQuery.data?.items]);
  const loading = curatedQuery.isFetching || pickCenterQuery.isFetching;
  const error = actionError || (curatedQuery.error ? errorText(curatedQuery.error) : '');

  const invalidCustomStatsRange = statsRange === 'custom' && (
    !statsCustomFrom || !statsCustomTo || statsCustomFrom > statsCustomTo
  );
  const statsCollectionQuery = useListAdminCuratedPredictionsCollectionQuery(
    { query: {}, pageSize: 100, maxPages: 10_000 },
    { enabled: !invalidCustomStatsRange, staleTime: 60_000 },
  );
  const statsPredictions = useMemo(() => {
    const unique = new Map<string, CuratedPrediction>();
    if (invalidCustomStatsRange) return [];
    for (const prediction of statsCollectionQuery.data?.items ?? []) {
      unique.set(String(prediction._id), prediction);
    }
    return [...unique.values()];
  }, [statsCollectionQuery.data?.items, invalidCustomStatsRange]);
  const statsLoading = !invalidCustomStatsRange && statsCollectionQuery.isFetching;
  const statsError = invalidCustomStatsRange
    ? 'Choose a valid custom date range.'
    : statsCollectionQuery.error ? errorText(statsCollectionQuery.error) : '';

  const refreshCuratedMutation = useRefreshCuratedPredictionsMutation();
  const publishCuratedMutation = usePublishCuratedPredictionMutation();
  const unpublishCuratedMutation = useUnpublishCuratedPredictionMutation();
  const refreshingCurated = refreshCuratedMutation.isPending;

  async function load() {
    setActionError('');
    await Promise.all([curatedQuery.refetch(), pickCenterQuery.refetch()]);
  }

  async function loadStatistics() {
    if (!invalidCustomStatsRange) await statsCollectionQuery.refetch();
  }

  const allRows = useMemo<PredictionRow[]>(() => {
    const result: PredictionRow[] = [];
    for (const prediction of predictions) {
      const byEvent = new Map<string, CuratedPredictionSelection[]>();
      for (const selection of prediction.selections ?? []) {
        const group = byEvent.get(selection.eventId) ?? [];
        group.push(selection);
        byEvent.set(selection.eventId, group);
      }
      for (const [eventId, selections] of byEvent) {
        const first = selections[0];
        result.push({
          rowKey: `${prediction._id}:${eventId}`,
          prediction,
          eventId,
          fixtureDate: first.fixtureDate,
          leagueId: first.leagueId,
          leagueName: leagueLabel(first.leagueName, first.leagueId),
          homeTeamName: first.homeTeamName,
          awayTeamName: first.awayTeamName,
          leagueLogo: pickCenterLogos.get(eventId)?.leagueLogo ?? (first as CuratedPredictionSelection & { leagueLogo?: string | null }).leagueLogo,
          homeTeamLogo: pickCenterLogos.get(eventId)?.homeTeamLogo ?? (first as CuratedPredictionSelection & { homeTeamLogo?: string | null }).homeTeamLogo,
          awayTeamLogo: pickCenterLogos.get(eventId)?.awayTeamLogo ?? (first as CuratedPredictionSelection & { awayTeamLogo?: string | null }).awayTeamLogo,
          selections,
        });
      }
    }
    return result.sort((a, b) => new Date(a.fixtureDate).getTime() - new Date(b.fixtureDate).getTime());
  }, [predictions, pickCenterLogos]);

  const matchPresentation = useMatchPresentation(allRows);
  const dateRows = useMemo(() => allRows.filter((row) => dateKey(new Date(row.fixtureDate)) === selectedDate), [allRows, selectedDate]);
  const leagues = useMemo<LeagueOption[]>(() => {
    const unique = new Map<string, LeagueOption>();
    for (const row of dateRows) {
      const presentation = matchPresentation.get(row.eventId);
      const resolvedName = leagueLabel(
        presentation?.leagueName ?? row.leagueName,
        presentation?.leagueId ?? row.leagueId,
      );
      const resolvedId = row.leagueId;
      const current = unique.get(resolvedId);
      if (current) {
        current.count += 1;
        if (resolvedName !== 'League name unavailable') current.name = resolvedName;
        current.logo ??= presentation?.leagueLogo ?? row.leagueLogo;
      } else {
        unique.set(resolvedId, {
          id: resolvedId,
          name: resolvedName,
          logo: presentation?.leagueLogo ?? row.leagueLogo,
          count: 1,
        });
      }
    }
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [dateRows, matchPresentation]);
  const searchedLeagues = useMemo(() => {
    const query = leagueSearch.trim().toLowerCase();
    return query ? leagues.filter((league) => league.name.toLowerCase().includes(query)) : leagues;
  }, [leagues, leagueSearch]);
  const shownLeagues = searchedLeagues.slice(0, 5);
  const extraLeagues = searchedLeagues.slice(5);
  const rows = useMemo(() => dateRows.filter((row) => activeLeague === 'ALL' || row.leagueId === activeLeague), [dateRows, activeLeague]);

  const overviewStatsRows = useMemo(() => {
    const now = new Date();
    const rangeStart = getStatsRangeStart(statsRange, now);
    const from = statsRange === 'custom' && statsCustomFrom ? new Date(`${statsCustomFrom}T00:00:00`) : rangeStart;
    const to = statsRange === 'custom' && statsCustomTo ? new Date(`${statsCustomTo}T23:59:59.999`) : statsRange === 'all' ? null : now;
    return allRows.filter((row) => {
      const timestamp = new Date(row.fixtureDate).getTime();
      if (!Number.isFinite(timestamp)) return false;
      if (from && timestamp < from.getTime()) return false;
      if (to && timestamp > to.getTime()) return false;
      return true;
    });
  }, [allRows, statsRange, statsCustomFrom, statsCustomTo]);

  const stats = useMemo(() => {
    const matchCounts = { total: overviewStatsRows.length, won: 0, lost: 0, push: 0, void: 0, pending: 0 };
    const marketCounts = { total: 0, won: 0, lost: 0, push: 0, void: 0, pending: 0, halfWon: 0, halfLost: 0 };
    const markets = new Map<string, { key: string; label: string; total: number; won: number; lost: number; push: number; void: number; pending: number; halfWon: number; halfLost: number }>();
    for (const row of overviewStatsRows) {
      const outcome = matchOutcome(row);
      if (outcome === 'won') matchCounts.won += 1;
      else if (outcome === 'lost') matchCounts.lost += 1;
      else if (outcome === 'push') matchCounts.push += 1;
      else if (outcome === 'void') matchCounts.void += 1;
      else matchCounts.pending += 1;
      for (const selection of row.selections) {
        const status = selectionOutcome(selection.settlementOutcome);
        marketCounts.total += 1;
        if (status === 'won') marketCounts.won += 1;
        else if (status === 'lost') marketCounts.lost += 1;
        else if (status === 'push') marketCounts.push += 1;
        else if (status === 'void') marketCounts.void += 1;
        else marketCounts.pending += 1;
        const key = selection.marketKey || 'UNKNOWN';
        const current = markets.get(key) ?? {
          key,
          label: MARKET_LABELS[key] ?? selection.marketName ?? key.replace(/[_-]+/g, ' '),
          total: 0, won: 0, lost: 0, push: 0, void: 0, pending: 0, halfWon: 0, halfLost: 0,
        };
        current.total += 1;
        if (status === 'won') current.won += 1;
        else if (status === 'lost') current.lost += 1;
        else if (status === 'push') current.push += 1;
        else if (status === 'void') current.void += 1;
        else current.pending += 1;
        markets.set(key, current);
      }
    }
    return { matchCounts, marketCounts, markets: [...markets.values()].sort((a, b) => a.label.localeCompare(b.label)) };
  }, [overviewStatsRows]);

  const filteredMarketStats = useMemo(() => {
    const query = statsMarketSearch.trim().toLowerCase();
    return query ? stats.markets.filter((market) => market.label.toLowerCase().includes(query) || market.key.toLowerCase().includes(query)) : stats.markets;
  }, [stats.markets, statsMarketSearch]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [rows, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [selectedDate, activeLeague, statusFilter]);

  const marketColumns = useMemo<MarketColumn[]>(() => {
    const markets = new Map<string, string>();
    for (const row of rows) {
      for (const selection of row.selections) {
        if (!markets.has(selection.marketKey)) {
          markets.set(selection.marketKey, MARKET_LABELS[selection.marketKey] ?? selection.marketName ?? selection.marketKey.replace(/[_-]+/g, ' '));
        }
      }
    }
    return [...markets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, label]) => ({ id, label }));
  }, [rows]);

  const statsRows = useMemo<PredictionRow[]>(() => {
    const range = statsRangeForPeriod(statsRange, statsCustomFrom, statsCustomTo);
    const from = range.from ? new Date(range.from).getTime() : Number.NEGATIVE_INFINITY;
    const to = range.to ? new Date(range.to).getTime() : Number.POSITIVE_INFINITY;
    const result: PredictionRow[] = [];
    for (const prediction of statsPredictions) {
      const byEvent = new Map<string, CuratedPredictionSelection[]>();
      for (const selection of prediction.selections ?? []) {
        const timestamp = new Date(selection.fixtureDate).getTime();
        if (!Number.isFinite(timestamp) || timestamp < from || timestamp > to) continue;
        if (statsLeague !== 'ALL' && selection.leagueId !== statsLeague) continue;
        const group = byEvent.get(selection.eventId) ?? [];
        group.push(selection);
        byEvent.set(selection.eventId, group);
      }
      for (const [eventId, selections] of byEvent) {
        const first = selections[0];
        result.push({
          rowKey: `${prediction._id}:${eventId}`,
          prediction,
          eventId,
          fixtureDate: first.fixtureDate,
          leagueId: first.leagueId,
          leagueName: leagueLabel(first.leagueName, first.leagueId),
          homeTeamName: first.homeTeamName,
          awayTeamName: first.awayTeamName,
          selections,
        });
      }
    }
    return result;
  }, [statsPredictions, statsRange, statsCustomFrom, statsCustomTo, statsLeague]);

  const statsLeagueFixtureRefs = useMemo(() => {
    const firstFixtureByLeague = new Map<string, {
      eventId: string;
      fixtureDate: string;
      homeTeamName?: string | null;
      awayTeamName?: string | null;
      homeTeamLogo?: string | null;
      awayTeamLogo?: string | null;
      fixtureRecord?: unknown;
      summaryRecord?: unknown;
    }>();
    for (const prediction of statsPredictions) {
      for (const selection of prediction.selections ?? []) {
        const leagueId = String(selection.leagueId ?? '').trim();
        const eventId = String(selection.eventId ?? '').trim();
        if (!leagueId || !eventId || firstFixtureByLeague.has(leagueId)) continue;
        firstFixtureByLeague.set(leagueId, {
          eventId,
          fixtureDate: String(selection.fixtureDate ?? ''),
          homeTeamName: selection.homeTeamName,
          awayTeamName: selection.awayTeamName,
          homeTeamLogo: (selection as CuratedPredictionSelection & { homeTeamLogo?: string | null }).homeTeamLogo,
          awayTeamLogo: (selection as CuratedPredictionSelection & { awayTeamLogo?: string | null }).awayTeamLogo,
          fixtureRecord: selection,
          summaryRecord: (selection as CuratedPredictionSelection & { summary?: unknown }).summary,
        });
      }
    }
    return [...firstFixtureByLeague.values()];
  }, [statsPredictions]);
  const statsMatchPresentation = useMatchPresentation(statsLeagueFixtureRefs);
  const statsLeagueOptions = useMemo(() => {
    const options = new Map<string, { id: string; name: string }>();
    for (const prediction of statsPredictions) {
      for (const selection of prediction.selections ?? []) {
        if (!selection.leagueId) continue;
        const id = String(selection.leagueId);
        const presentation = statsMatchPresentation.get(String(selection.eventId));
        const resolvedId = id;
        const resolvedName = leagueLabel(
          presentation?.leagueName ?? selection.leagueName,
          presentation?.leagueId ?? id,
        );
        const existing = options.get(resolvedId);
        if (!existing) {
          options.set(resolvedId, { id: resolvedId, name: resolvedName });
        } else if (existing.name === 'League name unavailable' && resolvedName !== 'League name unavailable') {
          options.set(resolvedId, { id: resolvedId, name: resolvedName });
        }
      }
    }
    return [...options.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [statsPredictions, statsMatchPresentation]);
  const visibleStatsLeagues = statsLeagueOptions.filter((league) => league.name.toLowerCase().includes(statsLeagueSearch.trim().toLowerCase()));
  const statsSummary = useMemo(() => {
    const matches = EMPTY_COUNTS();
    const markets = EMPTY_COUNTS();
    const marketMap = new Map<string, MarketStatsRow>();
    const uniqueMatches = new Map<string, PredictionRow>();
    for (const row of statsRows) uniqueMatches.set(`${row.eventId}:${row.leagueId}`, row);
    for (const row of uniqueMatches.values()) {
      const matchSelection = row.selections.find((selection) => {
        const value = selection as CuratedPredictionSelection & { isMatchResult?: boolean };
        return value.isMatchResult === true || ['MATCH_RESULT', 'MATCH_WIN_DRAW_WIN', 'FULL_TIME_RESULT'].includes(String(selection.marketKey).toUpperCase());
      });
      const predictionOutcome = String(row.prediction.settlementStatus ?? '').toUpperCase();
      const matchOutcome = ['WON', 'LOST', 'PUSH', 'VOID'].includes(predictionOutcome)
        ? selectionOutcome(predictionOutcome.toLowerCase())
        : selectionOutcome(matchSelection?.settlementOutcome);
      addOutcome(matches, matchOutcome);
      for (const selection of row.selections) {
        const key = selection.marketKey || 'UNKNOWN_MARKET';
        let market = marketMap.get(key);
        if (!market) {
          market = { marketKey: key, label: MARKET_LABELS[key] ?? selection.marketName ?? key.replace(/[_-]+/g, ' '), ...EMPTY_COUNTS() };
          marketMap.set(key, market);
        }
        const outcome = selectionOutcome(selection.settlementOutcome);
        addOutcome(markets, outcome);
        addOutcome(market, outcome);
      }
    }
    const breakdown = [...marketMap.values()].sort((a, b) => a.label.localeCompare(b.label));
    return { matches, markets, breakdown };
  }, [statsRows]);
  const visibleMarketStats = useMemo(() => statsSummary.breakdown.filter((row) =>
    row.label.toLowerCase().includes(statsMarketSearch.trim().toLowerCase()) ||
    row.marketKey.toLowerCase().includes(statsMarketSearch.trim().toLowerCase())
  ), [statsSummary.breakdown, statsMarketSearch]);
  const statsRangeLabel = statsRangeForPeriod(statsRange, statsCustomFrom, statsCustomTo).label;

  useEffect(() => { setActiveLeague('ALL'); setMoreOpen(false); }, [selectedDate]);
  useEffect(() => { setActionError(''); }, [selectedDate, statusFilter]);

  async function refreshCuratedPredictions() {
    setActionMessage('');
    setActionError('');
    try {
      const response = await refreshCuratedMutation.mutateAsync();
      const result = unwrap<Record<string, unknown>>(response);
      const reason = typeof result.reason === 'string' ? result.reason.trim() : '';
      setActionMessage(result.skipped === true
        ? `Curated refresh skipped${reason ? `: ${reason}` : ''}.`
        : typeof result.message === 'string' && result.message.trim()
          ? result.message
          : 'Curated predictions refreshed.');
    } catch (requestError) {
      setActionError(errorText(requestError));
    }
  }

  async function changePublication(prediction: CuratedPrediction, publish: boolean) {
    setActionPrediction(prediction._id);
    setActionMessage('');
    setActionError('');
    try {
      const args = { path: { predictionId: prediction._id } };
      if (publish) await publishCuratedMutation.mutateAsync(args);
      else await unpublishCuratedMutation.mutateAsync(args);
      setActionMessage(`${prediction.predictionCode} ${publish ? 'published' : 'unpublished'}.`);
    } catch (requestError) {
      setActionError(errorText(requestError));
    } finally {
      setActionPrediction('');
    }
  }

  function MarketCell({ row, marketKey }: { row: PredictionRow; marketKey: string }) {
    const selections = row.selections.filter((selection) => selection.marketKey === marketKey);
    if (!selections.length) return <td className="min-w-[150px] px-2 py-2 text-center text-[11px] text-muted-foreground">—</td>;
    return <td className="min-w-[150px] max-w-[210px] px-2 py-1.5 align-middle">
      <div className="space-y-1.5">
        {selections.map((selection) => {
          const probability = probabilityPercent(selection.probability);
          const odds = Number(selection.decimalOdds);
          const confidence = Number(selection.confidence);
          const outcome = selection.settlementOutcome ?? 'PENDING';
          return <div key={`${selection.marketPredictionId}:${selection.selectionKey}`} className="border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 whitespace-nowrap text-[10px] font-semibold tabular-nums">
              <span title={selection.priceType === 'ESTIMATED' ? 'Grivit model estimate; not a bookmaker offer.' : 'Stored Odds-module price.'} className={oddsTone(odds)}>{Number.isFinite(odds) && odds > 1 ? `${selection.priceType === 'ESTIMATED' ? '~' : ''}${odds.toFixed(2)}` : '—'} odds{selection.priceType === 'ESTIMATED' ? ' · est.' : ''}</span>
              <span className={`rounded px-1 py-0.5 ${probabilityBadgeTone(probability)}`}>{probability === null ? '—' : `${probability.toFixed(0)}%`} prob.</span>
              <span className={`rounded px-1 py-0.5 ${confidenceBadgeTone(confidence)}`}>{Number.isFinite(confidence) ? `${confidence.toFixed(0)}` : '—'} conf.</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-tight">
              <span title={selection.selectionName} className="break-words font-medium text-foreground">{selection.selectionName}</span>
              <span className={`inline-flex rounded border px-1.5 py-0.5 text-[9px] font-bold leading-none ${outcomeBadgeTone(outcome)}`}>{String(outcome).replace(/_/g, ' ')}</span>
            </div>
          </div>;
        })}
      </div>
    </td>;
  }

  return <main className="mx-auto w-full max-w-[1900px] space-y-2">
    <header className="flex min-h-8 items-center justify-between gap-2">
      <h1 className="text-sm font-semibold tracking-tight">Predictions Center</h1>
      <div className="flex items-center gap-1"><button type="button" onClick={() => void refreshCuratedPredictions()} disabled={refreshingCurated || loading} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-primary/35 bg-card px-2.5 text-[10px] font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${refreshingCurated ? 'animate-spin' : ''}`} />{refreshingCurated ? 'Refreshing' : 'Refresh curated'}</button><button type="button" onClick={() => { void load(); void loadStatistics(); }} disabled={loading || statsLoading || refreshingCurated} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></div>
    </header>

    <section className="space-y-2 rounded-lg border border-border bg-card p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-xs font-semibold tracking-tight">Predictions Center Statistics</h2>
          </div>
        <button type="button" onClick={() => void loadStatistics()} disabled={statsLoading} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${statsLoading ? 'animate-spin' : ''}`} /> Refresh stats</button>
      </div>
      <div className="overflow-x-auto pb-0.5">
        <div className="flex min-w-max flex-nowrap items-end gap-5">
          <label className="w-36 shrink-0 space-y-1">
            <select value={statsRange} onChange={(event) => setStatsRange(event.target.value as StatsRange)} className="h-8 w-full rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:ring-1 focus:ring-primary">
              {STATS_PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <div className="w-164 shrink-0 space-y-1">
            <div className="flex min-w-0 gap-6">
              <div className="relative min-w-0 flex-1">
                <input value={statsLeagueSearch} onChange={(event) => setStatsLeagueSearch(event.target.value)} placeholder="Search leagues…" aria-label="Search leagues" className="h-8 w-72 rounded-md border border-border bg-background pl-7 pr-3 text-[10px] outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <select value={statsLeague} onChange={(event) => setStatsLeague(event.target.value)} aria-label="Statistics league filter" className="h-8 w-32 shrink-0 rounded-md border border-border bg-background px-2 text-[10px] outline-none focus:ring-1 focus:ring-primary">
                <option value="ALL">All Leagues</option>
                {visibleStatsLeagues.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}
              </select>
            </div>
          </div>
          {statsRange === 'custom' ? <>
            <label className="w-36 shrink-0 space-y-1">
              <span className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">From</span>
              <div className="relative">
                <FaCalendarDays className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={statsCustomFrom} max={statsCustomTo || undefined} onChange={(event) => setStatsCustomFrom(event.target.value)} className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[10px]" />
              </div>
            </label>
            <label className="w-36 shrink-0 space-y-1">
              <span className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">To</span>
              <div className="relative">
                <FaCalendarDays className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <input type="date" value={statsCustomTo} min={statsCustomFrom || undefined} onChange={(event) => setStatsCustomTo(event.target.value)} className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2 text-[10px]" />
              </div>
            </label>
          </> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-1.5 text-[9px]"><span className="text-muted-foreground">Range: {statsRangeLabel}</span><span className="font-medium text-foreground">{statsRows.length.toLocaleString('en-GB')} matches · {statsSummary.markets.total.toLocaleString('en-GB')} selections</span></div>
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

    <section className="space-y-1 rounded-md border border-border bg-card p-1.5">
      <div className="flex flex-wrap items-center justify-center gap-0.5" aria-label="Prediction date selector">
        {dateTabs.map((item) => <button key={item.key} type="button" onClick={() => setSelectedDate(item.key)} className={`min-w-[54px] rounded-md px-2 py-1.5 text-[10px] ${selectedDate === item.key ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{item.label}</button>)}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 border-t border-border/70 pt-1.5" aria-label="Prediction status selector">
        <label className="flex items-center gap-1 text-[9px] text-muted-foreground">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground"><option value="ALL">All statuses</option><option value="READY">Ready</option><option value="PUBLISHED">Published</option><option value="SETTLED">Settled</option><option value="CANCELLED">Unpublished</option></select></label>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-0.5 border-t border-border/70 pt-1" aria-label="Prediction league selector">
        <input aria-label="Search leagues" value={leagueSearch} onChange={(event) => setLeagueSearch(event.target.value)} placeholder="Search leagues…" className="h-7 w-32 rounded border border-border bg-background px-2 text-[10px] outline-none focus:border-primary" />
        <button type="button" onClick={() => setActiveLeague('ALL')} className={`rounded-md px-2 py-1.5 text-[10px] ${activeLeague === 'ALL' ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>All leagues <span className="ml-1 opacity-60">{dateRows.length}</span></button>
        {shownLeagues.map((league) => <button key={league.id} type="button" onClick={() => setActiveLeague(league.id)} title={league.name} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] ${activeLeague === league.id ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}><CompactLogo src={league.logo} alt={league.name} fallback={league.name} size={13} /><span className="max-w-28 whitespace-normal break-words">{league.name}</span><span className="opacity-60">{league.count}</span></button>)}
        {extraLeagues.length ? <div className="relative shrink-0"><button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] ${moreOpen || extraLeagues.some((league) => league.id === activeLeague) ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>More <span className="opacity-60">{extraLeagues.length}</span><FaChevronDown className="h-2 w-2" /></button>{moreOpen ? <div className="absolute right-0 top-full z-40 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-xl">{extraLeagues.map((league) => <button key={league.id} type="button" onClick={() => { setActiveLeague(league.id); setMoreOpen(false); }} className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-[10px] ${activeLeague === league.id ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}><span className="whitespace-normal break-words">{league.name}</span><span className="text-[9px] text-muted-foreground">{league.count}</span></button>)}</div> : null}</div> : null}
        {!leagues.length && !loading ? <span className="px-2 text-[10px] text-muted-foreground">No curated selections for this date.</span> : null}
      </div>
    </section>


    {error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[10px] text-destructive"><span>{error}</span><button type="button" onClick={() => void load()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
    {actionMessage ? <div role="status" className="rounded-md border border-green-600/25 bg-green-600/5 px-2.5 py-2 text-[10px] text-green-700 dark:text-green-300">{actionMessage}</div> : null}

    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto border-collapse text-left text-[11px] leading-tight">
          <thead className="bg-muted/60 text-[9px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="sticky left-0 z-20 min-w-[66px] bg-muted/95 px-2 py-2 font-semibold">Time</th>
              <th className="sticky left-[66px] z-20 min-w-[190px] bg-muted/95 px-2 py-2 font-semibold">Match</th>
              <th className="min-w-[145px] px-2 py-2 text-center font-semibold">Publication</th>
              <th className="min-w-[170px] px-2 py-2 text-center font-semibold">Prediction</th>
              {marketColumns.map((column) => <th key={column.id} title={column.id} className="min-w-[150px] whitespace-nowrap px-2 py-2 text-center font-semibold">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={marketColumns.length + 4} className="px-2 py-8 text-center text-[10px] text-muted-foreground">Loading predictions…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={marketColumns.length + 4} className="px-2 py-8 text-center text-[10px] text-muted-foreground">No curated predictions found.</td></tr>
                : paginatedRows.map((row) => {
                  const prediction = row.prediction;
                  const published = prediction.status === 'PUBLISHED';
                  const settled = prediction.status === 'SETTLED' || Boolean(prediction.settlementStatus && prediction.settlementStatus !== 'PENDING');
                  const probability = probabilityPercent(prediction.combinedProbability);
                  const confidence = Number(prediction.confidence);
                  const canPublish = !published && !settled;
                  const canUnpublish = published && !settled;
                  return <tr key={row.rowKey} className="border-t border-border/70 hover:bg-muted/20">
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-2 align-middle text-[10px] font-medium tabular-nums">{formatTime(row.fixtureDate)}</td>
                    <td className="sticky left-[66px] z-10 bg-card px-2 py-2 align-middle">
                      {(() => {
                        const presentation = matchPresentation.get(row.eventId);
                        const status = getDisplayMatchStatus(presentation, undefined, row.fixtureDate);
                        const homeName = resolveTeamDisplayName(presentation?.homeTeamName, row.homeTeamName);
                        const awayName = resolveTeamDisplayName(presentation?.awayTeamName, row.awayTeamName);
                        const leagueName = leagueLabel(presentation?.leagueName ?? row.leagueName, presentation?.leagueId ?? row.leagueId);
                        const leagueLogo = presentation?.leagueLogo ?? row.leagueLogo;
                        const homeScore = displayScore(presentation?.homeScore, status);
                        const awayScore = displayScore(presentation?.awayScore, status);
                        return <div className="flex max-w-[300px] flex-col gap-1">
                          <div className="flex min-w-0 items-start gap-1"><CompactLogo src={leagueLogo} alt={leagueName} fallback={leagueName} size={12} /><span className="min-w-0 flex-1 whitespace-normal break-words text-[8px] text-muted-foreground">{leagueName}{presentation?.leagueCountry ? <span className="ml-1 opacity-70">· {presentation.leagueCountry}</span> : null}</span><span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[7px] font-bold leading-none ${displayStatusTone(status)}`}>{displayStatusLabel(status, presentation)}</span></div>
                          <span className="flex min-w-0 items-start gap-1.5 text-[10px] font-semibold leading-tight" title={homeName}><CompactLogo src={presentation?.homeTeamLogo ?? row.homeTeamLogo} alt={homeName} fallback={homeName} size={14} /><span className="min-w-0 flex-1 whitespace-normal break-words">{homeName}</span><span className="shrink-0 min-w-[12px] text-right font-bold tabular-nums">{homeScore}</span></span>
                          <span className="flex min-w-0 items-start gap-1.5 text-[10px] font-semibold leading-tight" title={awayName}><CompactLogo src={presentation?.awayTeamLogo ?? row.awayTeamLogo} alt={awayName} fallback={awayName} size={14} /><span className="min-w-0 flex-1 whitespace-normal break-words">{awayName}</span><span className="shrink-0 min-w-[12px] text-right font-bold tabular-nums">{awayScore}</span></span>
                        </div>;
                      })()}
                    </td>
                    <td className="px-2 py-2 align-middle text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`rounded px-1.5 py-1 text-[9px] font-bold ${publicationTone(prediction.status)}`}>{prediction.status === 'CANCELLED' ? 'UNPUBLISHED' : prediction.status}</span>
                        {canPublish ? <button type="button" onClick={() => void changePublication(prediction, true)} disabled={actionPrediction === prediction._id} className="inline-flex h-7 items-center gap-1 rounded border border-green-600/35 px-2 text-[9px] font-semibold text-green-700 hover:bg-green-600/5 disabled:opacity-50"><FaBullhorn className="h-2.5 w-2.5" />{actionPrediction === prediction._id ? 'Saving…' : 'Publish'}</button> : null}
                        {canUnpublish ? <button type="button" onClick={() => void changePublication(prediction, false)} disabled={actionPrediction === prediction._id} className="inline-flex h-7 items-center gap-1 rounded border border-destructive/35 px-2 text-[9px] font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50"><FaBan className="h-2.5 w-2.5" />{actionPrediction === prediction._id ? 'Saving…' : 'Unpublish'}</button> : null}
                        {settled ? <span className="text-[9px] text-muted-foreground">Settled</span> : null}
                      </div>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="space-y-1.5 text-center tabular-nums">
                        <div>
                          <span className="text-[9px] text-muted-foreground">Primary pick odds </span>
                          <span title={prediction.selections[0]?.priceType === 'ESTIMATED' ? 'Grivit model estimate; not a bookmaker offer.' : 'Price for the primary curated selection.'} className={`text-[12px] font-bold ${oddsTone(prediction.combinedOdds)}`}>
                            {Number.isFinite(Number(prediction.combinedOdds)) ? `${prediction.selections[0]?.priceType === 'ESTIMATED' ? '~' : ''}${Number(prediction.combinedOdds).toFixed(2)}${prediction.selections[0]?.priceType === 'ESTIMATED' ? ' · est.' : ''}` : '—'}
                          </span>
                        </div>
                        <div><span className="text-[9px] text-muted-foreground">Probability </span><span className={`text-[11px] font-semibold ${probabilityTone(probability)}`}>{probability === null ? '—' : `${probability.toFixed(1)}%`}</span></div>
                        <div><span className="text-[9px] text-muted-foreground">Confidence </span><span className={`text-[11px] font-semibold ${confidenceTone(confidence)}`}>{Number.isFinite(confidence) ? confidence.toFixed(0) : '—'}</span></div>
                      </div>
                    </td>
                    {marketColumns.map((column) => <MarketCell key={column.id} row={row} marketKey={column.id} />)}
                  </tr>;
                })}
          </tbody>
        </table>
      </div>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-2.5 py-2 text-[10px]">
      <span className="text-muted-foreground">Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, rows.length)} of {rows.length} matches</span>
      <div className="flex items-center gap-1">
        <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="h-7 rounded border border-border px-2 font-medium disabled:opacity-40">Previous</button>
        <span className="px-1 tabular-nums">Page {currentPage} / {pageCount}</span>
        <button type="button" disabled={currentPage >= pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} className="h-7 rounded border border-border px-2 font-medium disabled:opacity-40">Next</button>
      </div>
    </div>
  </main>;
}


