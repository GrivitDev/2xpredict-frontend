'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaRotate } from 'react-icons/fa6';
import {
  useBuildSlipMutation,
  useGetSlipQuery,
  useListAdminPickCenterQuery,
  useListAdminSlipsCollectionQuery,
  useListAdminSlipsQuery,
  usePublishSlipMutation,
  useRefreshSlipsMutation,
  useUpdateSlipLegsMutation,
  useUpdateSportyBetMutation,
} from '@/hooks/use-prediction-engine';
import type { ActiveSlipProductType, PickCenterRecord, PredictionSlip, PredictionSlipLeg, SureOddsProduct, UpdatePredictionSlipLegsPayload } from '@/types/predictions';
import type { BuildSlipArgs } from '@/types/endpoint-args/prediction-engine';
import { resolveTeamDisplayName, useMatchPresentation } from '@/hooks/use-match-presentation';
import { displayScore, displayStatusLabel, displayStatusTone, getDisplayMatchStatus } from '@/lib/match-status';

type Slip = PredictionSlip;
type SlipLeg = PredictionSlipLeg;
type AdminPick = PickCenterRecord;
type EditableLeg = UpdatePredictionSlipLegsPayload['legs'][number];
type DateTab = { key: string; label: string; date: Date };
type SlipTypeOption = { id: string; label: string; count: number };



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
function errorText(error: unknown) { const value = error as { response?: { data?: { message?: string } }; message?: string }; return value?.response?.data?.message ?? value?.message ?? 'Could not load Slip Center. Check the backend and try again.'; }
function pct(value?: number) { const n = Number(value); return Number.isFinite(n) ? (n <= 1 ? n * 100 : n) : null; }
function formatTime(value?: string) { return value ? new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'; }
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'; }
function probabilityTone(value?: number | null) { if (value == null) return 'text-muted-foreground'; const n = Number(value); if (!Number.isFinite(n)) return 'text-muted-foreground'; if (n <= 25) return 'text-red-600 dark:text-red-400'; if (n < 40) return 'text-orange-600 dark:text-orange-400'; if (n < 51) return 'text-lime-600 dark:text-lime-400'; return 'text-green-600 dark:text-green-400'; }
function confidenceTone(value?: number) { const n = Number(value); if (!Number.isFinite(n)) return 'text-muted-foreground'; if (n <= 35) return 'text-red-600 dark:text-red-400'; if (n < 60) return 'text-orange-600 dark:text-orange-400'; if (n < 78) return 'text-lime-600 dark:text-lime-400'; return 'text-green-600 dark:text-green-400'; }
function marketAbbreviation(name?: string, key?: string) {
  const source = `${name ?? ''} ${key ?? ''}`.trim();
  const normalized = source.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  const rules: Array<[RegExp, string]> = [
    [/DOUBLE CHANCE|\bDC\b/, 'DC'],
    [/BOTH TEAMS TO SCORE|\bBTTS\b/, 'BTTS'],
    [/MATCH WINNER|MATCH RESULT|FULL TIME RESULT|\b1X2\b/, '1X2'],
    [/TOTAL GOALS|GOALS OVER UNDER|OVER UNDER GOALS/, 'Goals O/U'],
    [/TOTAL CORNERS|CORNERS OVER UNDER/, 'Corners O/U'],
    [/TOTAL CARDS|CARDS OVER UNDER/, 'Cards O/U'],
    [/TOTAL FOULS|FOULS OVER UNDER/, 'Fouls O/U'],
    [/TOTAL SHOTS ON TARGET|SHOTS ON TARGET OVER UNDER/, 'SOT O/U'],
    [/TOTAL SHOTS|SHOTS OVER UNDER/, 'Shots O/U'],
    [/TEAM TOTAL|TEAM GOALS|HOME TEAM GOALS|AWAY TEAM GOALS/, 'Team Goals'],
    [/FIRST HALF|1ST HALF|HALF TIME/, '1H'],
    [/CORRECT SCORE/, 'Score'],
    [/DRAW NO BET/, 'DNB'],
  ];
  for (const [pattern, label] of rules) if (pattern.test(normalized)) return label;
  const cleanName = String(name ?? key ?? 'Market').replace(/[_-]+/g, ' ').trim();
  return cleanName.length > 13 ? `${cleanName.slice(0, 12).trim()}…` : cleanName;
}
function oddsTone(value?: number | null) { const n = Number(value); if (!Number.isFinite(n)) return 'text-muted-foreground'; if (n < 2) return 'text-green-700 dark:text-green-400'; if (n < 3) return 'text-lime-700 dark:text-lime-400'; if (n < 4) return 'text-orange-600 dark:text-orange-400'; return 'text-red-600 dark:text-red-400'; }
function statusTone(value?: string) { const status = String(value ?? '').toUpperCase(); if (status === 'PUBLISHED') return 'bg-green-500/10 text-green-700 dark:text-green-300'; if (status === 'READY') return 'bg-sky-500/10 text-sky-700 dark:text-sky-300'; if (status === 'SETTLED') return 'bg-muted text-muted-foreground'; return 'bg-muted text-muted-foreground'; }
function settlementTone(value?: string) { const status = String(value ?? 'PENDING').toUpperCase(); if (status === 'WON' || status === 'HALF_WON') return 'bg-green-500/10 text-green-700 dark:text-green-300'; if (status === 'LOST' || status === 'HALF_LOST') return 'bg-red-500/10 text-red-700 dark:text-red-300'; if (status === 'VOID' || status === 'PUSH') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300'; return 'bg-muted text-muted-foreground'; }
function aggregateSettlementStatus(outcomes: Array<string | undefined>) { const values = outcomes.map((value) => String(value ?? 'PENDING').toUpperCase()); if (values.includes('LOST')) return 'LOST'; if (values.some((value) => !['WON', 'VOID', 'PUSH', 'HALF_WON', 'HALF_LOST'].includes(value))) return 'PENDING'; if (values.includes('HALF_LOST')) return 'HALF_LOST'; if (values.includes('HALF_WON')) return 'HALF_WON'; if (values.length && values.every((value) => value === 'VOID')) return 'VOID'; if (values.length && values.every((value) => value === 'VOID' || value === 'PUSH')) return 'PUSH'; return values.length ? 'WON' : 'PENDING'; }
function selectionIdentity(leg: { eventId: string; marketPredictionId?: string; marketKey?: string; selectionKey?: string }) { return `${leg.eventId}::${leg.marketPredictionId ?? ''}::${leg.marketKey ?? ''}::${leg.selectionKey ?? ''}`; }
function slipTypeKey(slip: Slip) { if (slip.sureOdds || slip.productType?.toUpperCase() === 'SURE_ODDS') return String(slip.sureOddsProduct || `SURE_${slip.sureOddsTier || 'ODDS'}`).toUpperCase(); return String(slip.productType || 'STANDARD').toUpperCase(); }
function productLabel(slip: Slip) { if (slip.sureOdds || slip.productType?.toUpperCase() === 'SURE_ODDS') return (slip.sureOddsProduct || `Sure Odds ${slip.sureOddsTier ?? ''}`).replace(/_/g, ' ').trim(); const labels: Record<string, string> = { ODDS_10: '10 Odds', ODDS_25: '25 Odds', ODDS_50: '50 Odds' }; const type = String(slip.productType || 'STANDARD').toUpperCase(); return labels[type] ?? type.replace(/_/g, ' '); }
function CompactLogo({ src, alt, size = 14, fallback = alt }: { src?: string | null; alt: string; size?: number; fallback?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span aria-label={`${alt} logo unavailable`} title={alt} className="inline-flex shrink-0 items-center justify-center rounded-sm bg-muted text-[7px] font-bold text-muted-foreground" style={{ width: size, height: size }}>{fallback.trim().slice(0, 2).toUpperCase() || '—'}</span>;
  return <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    onError={() => setFailed(true)}
    className="inline-block shrink-0 object-contain"
    style={{ width: size, height: size }}
  />;
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


type SlipStatsPeriod = 'ALL_TIME' | 'LAST_24_HOURS' | 'LAST_48_HOURS' | 'LAST_3_DAYS' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'CUSTOM';
type SlipOutcomeKey = 'won' | 'lost' | 'pending' | 'void' | 'push';
type SlipOutcomeCounts = Record<SlipOutcomeKey, number> & { total: number };
type SlipTypeStatsRow = SlipOutcomeCounts & { typeKey: string; label: string };
type SlipMarketStatsRow = SlipOutcomeCounts & { marketKey: string; label: string };
const EMPTY_SLIP_COUNTS = (): SlipOutcomeCounts => ({ total: 0, won: 0, lost: 0, pending: 0, void: 0, push: 0 });
const SLIP_STATS_PERIODS: { value: SlipStatsPeriod; label: string }[] = [
  { value: 'ALL_TIME', label: 'All Time' },
  { value: 'LAST_24_HOURS', label: 'Last 24 Hours' },
  { value: 'LAST_48_HOURS', label: 'Last 48 Hours' },
  { value: 'LAST_3_DAYS', label: 'Last 3 Days' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'CUSTOM', label: 'Custom Range' },
];
function slipOutcomeKey(value?: string | null): SlipOutcomeKey {
  const status = String(value ?? 'PENDING').trim().toUpperCase().replace(/[ -]+/g, '_');
  if (status === 'WON' || status === 'HALF_WON') return 'won';
  if (status === 'LOST' || status === 'HALF_LOST') return 'lost';
  if (status === 'VOID' || status === 'CANCELLED' || status === 'CANCELED' || status === 'ABANDONED') return 'void';
  if (status === 'PUSH' || status === 'DRAW') return 'push';
  return 'pending';
}
function addSlipOutcome(counts: SlipOutcomeCounts, outcome: SlipOutcomeKey) {
  counts.total += 1;
  counts[outcome] += 1;
}
function slipStatsRange(period: SlipStatsPeriod, customFrom: string, customTo: string): { from?: string; to?: string; label: string } {
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
  const hours: Record<Exclude<SlipStatsPeriod, 'ALL_TIME' | 'CUSTOM'>, number> = {
    LAST_24_HOURS: 24, LAST_48_HOURS: 48, LAST_3_DAYS: 72, LAST_7_DAYS: 168, LAST_30_DAYS: 720,
  };
  const to = new Date();
  const from = new Date(to.getTime() - hours[period] * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString(), label: `${SLIP_STATS_PERIODS.find((item) => item.value === period)?.label ?? 'Selected period'} · ${from.toLocaleDateString('en-GB')} – ${to.toLocaleDateString('en-GB')}` };
}
function SlipStatsCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return <div className="min-w-0 rounded-md border border-border/80 bg-background/70 px-2 py-1.5">
    <div className="whitespace-normal break-words text-[9px] font-medium text-muted-foreground">{label}</div>
    <div className={`mt-0.5 text-base font-semibold leading-none tabular-nums ${tone ?? 'text-foreground'}`}>{value.toLocaleString('en-GB')}</div>
  </div>;
}
function SlipOutcomeTable({ title, rows, nameHeader }: { title: string; rows: Array<SlipOutcomeCounts & { label: string; typeKey?: string; marketKey?: string }>; nameHeader: string }) {
  return <section className="space-y-1">
    <div className="flex items-center justify-between gap-2"><h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3><span className="text-[9px] text-muted-foreground">{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span></div>
    <div className="overflow-x-auto rounded-md border border-border/80">
      <table className="w-full min-w-[540px] border-collapse text-left text-[10px]">
        <thead className="bg-muted/60 text-[9px] uppercase tracking-wide text-muted-foreground"><tr>
          <th className="px-2 py-2 font-semibold">{nameHeader}</th><th className="px-2 py-2 text-right font-semibold">Total</th><th className="px-2 py-2 text-right font-semibold text-green-600 dark:text-green-400">Won</th><th className="px-2 py-2 text-right font-semibold text-red-600 dark:text-red-400">Lost</th><th className="px-2 py-2 text-right font-semibold text-sky-600 dark:text-sky-400">Pending</th><th className="px-2 py-2 text-right font-semibold text-orange-600 dark:text-orange-400">Void</th><th className="px-2 py-2 text-right font-semibold text-amber-600 dark:text-amber-400">Push</th>
        </tr></thead>
        <tbody>{rows.length ? rows.map((row) => <tr key={row.typeKey ?? row.marketKey ?? row.label} className="border-t border-border/70 hover:bg-muted/20">
          <td className="max-w-[260px] whitespace-normal break-words px-2 py-1.5 font-medium" title={row.label}>{row.label}</td>
          <td className="px-2 py-1.5 text-right font-semibold tabular-nums">{row.total.toLocaleString('en-GB')}</td>
          <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-green-600 dark:text-green-400">{row.won.toLocaleString('en-GB')}</td>
          <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-red-600 dark:text-red-400">{row.lost.toLocaleString('en-GB')}</td>
          <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-sky-600 dark:text-sky-400">{row.pending.toLocaleString('en-GB')}</td>
          <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-orange-600 dark:text-orange-400">{row.void.toLocaleString('en-GB')}</td>
          <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-amber-600 dark:text-amber-400">{row.push.toLocaleString('en-GB')}</td>
        </tr>) : <tr><td colSpan={7} className="px-2 py-5 text-center text-[10px] text-muted-foreground">No statistics for this selection.</td></tr>}</tbody>
      </table>
    </div>
  </section>;
}

export default function SlipCenter() {
  const dateTabs = useMemo(() => makeDateTabs(), []);
  const [selectedDate, setSelectedDate] = useState(dateTabs[1].key);
  const [slips, setSlips] = useState<Slip[]>([]);
  const matchPresentation = useMatchPresentation(slips.flatMap((slip) => (slip.legs ?? []).map((leg) => ({
    eventId: leg.eventId, fixtureDate: leg.fixtureDate, leagueId: leg.leagueId, leagueName: leg.leagueName,
    leagueCountry: leg.country ?? leg.leagueCountry, homeTeamId: leg.homeTeamId, awayTeamId: leg.awayTeamId,
    homeTeamName: leg.homeTeamName, awayTeamName: leg.awayTeamName, homeTeamLogo: leg.homeTeamLogo, awayTeamLogo: leg.awayTeamLogo,
    fixtureRecord: leg, summaryRecord: leg.summary,
  }))));
  const [error, setError] = useState('');
  const [activeSlipType, setActiveSlipType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [automaticFilter, setAutomaticFilter] = useState('ALL');
  const [publishingSlip, setPublishingSlip] = useState('');
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [buildProductType, setBuildProductType] = useState<ActiveSlipProductType>('ODDS_10');
  const [buildSelectionCount, setBuildSelectionCount] = useState('5');
  const [buildMinimumProbability, setBuildMinimumProbability] = useState('0.6');
  const [buildMinimumConfidence, setBuildMinimumConfidence] = useState('70');
  const [buildPublishImmediately, setBuildPublishImmediately] = useState(false);
  const [buildSureOddsProduct, setBuildSureOddsProduct] = useState<SureOddsProduct>('SURE_2');
  const [expandedSlip, setExpandedSlip] = useState('');
  const [expandedMatchKey, setExpandedMatchKey] = useState('');
  const [availablePicks, setAvailablePicks] = useState<AdminPick[]>([]);
  const [editingSlip, setEditingSlip] = useState('');
  const [draftLegs, setDraftLegs] = useState<EditableLeg[]>([]);
  const [addEventId, setAddEventId] = useState('');
  const [addSelectionId, setAddSelectionId] = useState('');
  const [sportyCode, setSportyCode] = useState('');
  const [sportyLink, setSportyLink] = useState('');
  const [savingSlip, setSavingSlip] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [slipStatsPeriod, setSlipStatsPeriod] = useState<SlipStatsPeriod>('ALL_TIME');
  const [slipStatsCustomFrom, setSlipStatsCustomFrom] = useState(() => {
    const date = new Date(); date.setDate(date.getDate() - 7);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [slipStatsCustomTo, setSlipStatsCustomTo] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const [slipStatsType, setSlipStatsType] = useState('ALL');
  const [slipStatsTypeSearch, setSlipStatsTypeSearch] = useState('');
  const [slipStatsMarketSearch, setSlipStatsMarketSearch] = useState('');


  const selectedTab = dateTabs.find((item) => item.key === selectedDate) ?? dateTabs[1];
  const slipQueryArgs = useMemo(() => ({
    query: {
      from: startOfDay(selectedTab.date).toISOString(),
      to: endOfDay(selectedTab.date).toISOString(),
      page: 1,
      pageSize: 500,
      ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      ...(automaticFilter !== 'ALL' ? { automatic: automaticFilter === 'true' } : {}),
    },
  }), [selectedTab.date, statusFilter, automaticFilter]);
  const pickQueryArgs = useMemo(() => ({
    query: {
      from: startOfDay(selectedTab.date).toISOString(),
      to: endOfDay(selectedTab.date).toISOString(),
      includePast: true,
      page: 1,
      pageSize: 500,
    },
  }), [selectedTab.date]);

  const slipsQuery = useListAdminSlipsQuery(slipQueryArgs, { staleTime: 15_000 });
  const picksQuery = useListAdminPickCenterQuery(pickQueryArgs, { staleTime: 15_000 });
  const slipStatsRangeValue = useMemo(
    () => slipStatsRange(slipStatsPeriod, slipStatsCustomFrom, slipStatsCustomTo),
    [slipStatsPeriod, slipStatsCustomFrom, slipStatsCustomTo],
  );
  const validCustomSlipStatsRange = slipStatsPeriod !== 'CUSTOM' || Boolean(
    slipStatsCustomFrom && slipStatsCustomTo && slipStatsCustomFrom <= slipStatsCustomTo,
  );
  const slipStatsQuery = useListAdminSlipsCollectionQuery({
    query: {
      ...(slipStatsRangeValue.from ? { from: slipStatsRangeValue.from } : {}),
      ...(slipStatsRangeValue.to ? { to: slipStatsRangeValue.to } : {}),
    },
    pageSize: 500,
    maxPages: 10_000,
  }, { enabled: validCustomSlipStatsRange, staleTime: 60_000 });
  const slipStatsRecords = slipStatsQuery.data?.items ?? [];
  const slipStatsTypeOptions = useMemo<SlipTypeOption[]>(() => {
    const counts = new Map<string, SlipTypeOption>();
    for (const slip of slipStatsRecords) {
      const id = slipTypeKey(slip);
      const current = counts.get(id) ?? { id, label: productLabel(slip), count: 0 };
      current.count += 1;
      counts.set(id, current);
    }
    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [slipStatsRecords]);
  const searchableSlipStatsTypeOptions = useMemo(() => {
    const search = slipStatsTypeSearch.trim().toLowerCase();
    return slipStatsTypeOptions.filter((item) => !search || item.label.toLowerCase().includes(search) || item.id.toLowerCase().includes(search));
  }, [slipStatsTypeOptions, slipStatsTypeSearch]);
  const filteredSlipStatsRecords = useMemo(() => slipStatsRecords.filter((slip) => {
    if (slipStatsType !== 'ALL' && slipTypeKey(slip) !== slipStatsType) return false;
    if (slipStatsTypeSearch.trim()) {
      const query = slipStatsTypeSearch.trim().toLowerCase();
      const type = slipTypeKey(slip);
      if (!type.toLowerCase().includes(query) && !productLabel(slip).toLowerCase().includes(query)) return false;
    }
    return true;
  }), [slipStatsRecords, slipStatsType, slipStatsTypeSearch]);
  const slipStatsSummary = useMemo(() => {
    const slips = EMPTY_SLIP_COUNTS();
    const typeCounts = new Map<string, SlipTypeStatsRow>();
    const marketCounts = new Map<string, SlipMarketStatsRow>();
    let totalMatches = 0;
    let wonMatches = 0;

    for (const slip of filteredSlipStatsRecords) {
      const outcome = slipOutcomeKey(slip.settlementStatus);
      addSlipOutcome(slips, outcome);

      const typeKey = slipTypeKey(slip);
      const typeRow = typeCounts.get(typeKey) ?? {
        ...EMPTY_SLIP_COUNTS(), typeKey, label: productLabel(slip),
      };
      addSlipOutcome(typeRow, outcome);
      typeCounts.set(typeKey, typeRow);

      const legsByEvent = new Map<string, SlipLeg[]>();
      for (const leg of slip.legs ?? []) {
        const eventLegs = legsByEvent.get(leg.eventId) ?? [];
        eventLegs.push(leg);
        legsByEvent.set(leg.eventId, eventLegs);

        const marketKey = String(leg.marketKey || 'UNKNOWN');
        const marketRow = marketCounts.get(marketKey) ?? {
          ...EMPTY_SLIP_COUNTS(), marketKey,
          label: String(leg.marketName || leg.marketKey || 'Unknown market'),
        };
        addSlipOutcome(marketRow, slipOutcomeKey(leg.settlementOutcome));
        marketCounts.set(marketKey, marketRow);
      }

      for (const eventLegs of legsByEvent.values()) {
        totalMatches += 1;
        const matchOutcome = slipOutcomeKey(aggregateSettlementStatus(eventLegs.map((leg) => leg.settlementOutcome)));
        if (matchOutcome === 'won') wonMatches += 1;
      }
    }

    const marketSearch = slipStatsMarketSearch.trim().toLowerCase();
    const marketRows = [...marketCounts.values()]
      .filter((row) => !marketSearch || row.label.toLowerCase().includes(marketSearch) || row.marketKey.toLowerCase().includes(marketSearch))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

    return {
      slips,
      totalMatches,
      wonMatches,
      typeRows: [...typeCounts.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
      marketRows,
    };
  }, [filteredSlipStatsRecords, slipStatsMarketSearch]);
  const slipTypes = useMemo<SlipTypeOption[]>(() => {
    const counts = new Map<string, SlipTypeOption>();
    for (const slip of slips) {
      const id = slipTypeKey(slip);
      const current = counts.get(id) ?? { id, label: productLabel(slip), count: 0 };
      current.count += 1;
      counts.set(id, current);
    }
    return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [slips]);
  const slipStatsLoading = validCustomSlipStatsRange && slipStatsQuery.isFetching;
  const slipStatsError = !validCustomSlipStatsRange
    ? 'Choose a valid custom date range.'
    : slipStatsQuery.error ? errorText(slipStatsQuery.error) : '';
  const slipDetailsQuery = useGetSlipQuery(
    { path: { slipId: expandedSlip } },
    { enabled: Boolean(expandedSlip), staleTime: 0 },
  );
  const loading = slipsQuery.isFetching || picksQuery.isFetching;
  const loadingSlipDetails = slipDetailsQuery.isFetching ? expandedSlip : '';
  const errorMessage = error || (slipsQuery.error ? errorText(slipsQuery.error) : '')
    || (picksQuery.error ? errorText(picksQuery.error) : '');
  const slipStatsRangeLabel = slipStatsRangeValue.label;

  const buildSlipMutation = useBuildSlipMutation();
  const publishSlipMutation = usePublishSlipMutation();
  const refreshSlipsMutation = useRefreshSlipsMutation();
  const updateSlipLegsMutation = useUpdateSlipLegsMutation();
  const updateSportyBetMutation = useUpdateSportyBetMutation();

  useEffect(() => {
    setSlips(slipsQuery.data?.items ?? []);
  }, [slipsQuery.data]);
  useEffect(() => {
    setAvailablePicks(picksQuery.data?.items ?? []);
  }, [picksQuery.data]);
  useEffect(() => {
    setError('');
    setExpandedSlip('');
    setExpandedMatchKey('');
  }, [selectedDate, statusFilter, automaticFilter]);
  useEffect(() => {
    if (!expandedSlip || !slipDetailsQuery.data) return;
    setSlips((current) => current.map((item) => item._id === expandedSlip
      ? { ...item, ...slipDetailsQuery.data }
      : item));
  }, [expandedSlip, slipDetailsQuery.data]);
  useEffect(() => {
    if (expandedSlip && slipDetailsQuery.error) {
      setActionMessage(`Could not refresh slip details: ${errorText(slipDetailsQuery.error)}`);
    }
  }, [expandedSlip, slipDetailsQuery.error]);

  async function load() {
    setError('');
    setExpandedSlip('');
    setExpandedMatchKey('');
    await Promise.all([slipsQuery.refetch(), picksQuery.refetch()]);
  }

  async function loadSlipStatistics() {
    if (validCustomSlipStatsRange) await slipStatsQuery.refetch();
  }
  const shownSlips = useMemo(() => slips
    .filter((slip) => activeSlipType === 'ALL' || slipTypeKey(slip) === activeSlipType)
    .sort((a, b) => new Date(a.fixtureDateFrom ?? a.createdAt ?? 0).getTime() - new Date(b.fixtureDateFrom ?? b.createdAt ?? 0).getTime()), [slips, activeSlipType]);

  async function toggleSlipDetails(slip: Slip) {
    if (expandedSlip === slip._id) {
      setExpandedSlip('');
      setExpandedMatchKey('');
      return;
    }
    setExpandedSlip(slip._id);
    setExpandedMatchKey('');
  }

  function beginEdit(slip: Slip) {
    setEditingSlip(slip._id);
    setDraftLegs((slip.legs ?? []).map((leg) => ({ eventId: leg.eventId, marketPredictionId: String(leg.marketPredictionId ?? ''), marketKey: String(leg.marketKey ?? ''), selectionKey: String(leg.selectionKey ?? '') })));
    setSportyCode(slip.sportyBetSlipCode ?? '');
    setSportyLink(slip.sportyBetSlipLink ?? '');
    setAddEventId(''); setAddSelectionId(''); setActionMessage('');
  }

  const availableAddPicks = availablePicks;
  const selectedAddPick = availablePicks.find((pick) => pick.eventId === addEventId);
  const selectedAddOptions = (selectedAddPick?.selectedMarkets ?? []).map((selection) => {
    const identity = selectionIdentity({ eventId: selectedAddPick!.eventId, marketPredictionId: selection.marketPredictionId, marketKey: selection.marketKey, selectionKey: selection.selectionKey });
    return {
      id: `${selection.marketPredictionId}::${selection.marketKey}::${selection.selectionKey}`,
      label: `${selection.marketName} · ${selection.selectionName}${Number.isFinite(Number(selection.decimalOdds ?? selection.bookmakerOdds)) ? ` · ${Number(selection.decimalOdds ?? selection.bookmakerOdds).toFixed(2)} odds` : ' · no valid stored price'}`,
      priceAvailable: Number.isFinite(Number(selection.decimalOdds ?? selection.bookmakerOdds)) && Number(selection.decimalOdds ?? selection.bookmakerOdds) >= 1.01,
      alreadyAdded: draftLegs.some((leg) => selectionIdentity(leg) === identity),
    };
  });

  async function saveSlipEdits(slip: Slip) {
    if (!draftLegs.length) { setActionMessage('A slip must contain at least one selection.'); return; }
    const duplicateSelections = draftLegs.length !== new Set(draftLegs.map(selectionIdentity)).size;
    if (duplicateSelections) { setActionMessage('The same market selection cannot be added to a slip twice.'); return; }
    setSavingSlip(true); setActionMessage('');
    try {
      const updated = await updateSlipLegsMutation.mutateAsync({ path: { slipId: slip._id }, body: { legs: draftLegs } });
      setSlips((current) => current.map((item) => item._id === slip._id ? { ...item, ...updated } : item));
    } catch (requestError) {
      setActionMessage(errorText(requestError));
      setSavingSlip(false);
      return;
    }
    try {
      await updateSportyBetMutation.mutateAsync({
        path: { slipId: slip._id },
        body: { sportyBetSlipCode: sportyCode.trim() || null, sportyBetSlipLink: sportyLink.trim() || null },
      });
      setActionMessage('Slip selections and SportyBet details saved.');
      setEditingSlip('');
      await load();
    } catch (requestError) {
      setActionMessage(`Selections were saved, but SportyBet details failed: ${errorText(requestError)}`);
      await load();
    } finally { setSavingSlip(false); }
  }

  function addDraftLeg() {
    if (!selectedAddPick || !addSelectionId) return;
    const parts = addSelectionId.split('::');
    if (parts.length !== 3) return;
    const selection = selectedAddPick.selectedMarkets.find((item) => `${item.marketPredictionId}::${item.marketKey}::${item.selectionKey}` === addSelectionId);
    const storedOdds = Number(selection?.decimalOdds ?? selection?.bookmakerOdds);
    if (!selection || !Number.isFinite(storedOdds) || storedOdds < 1.01) {
      setActionMessage('This selection has no valid stored decimal/bookmaker price. Fair odds cannot be used as a substitute.');
      return;
    }
    setDraftLegs((current) => {
      const next = { eventId: selectedAddPick.eventId, marketPredictionId: parts[0], marketKey: parts[1], selectionKey: parts[2] };
      if (current.some((leg) => selectionIdentity(leg) === selectionIdentity(next))) {
        setActionMessage('That exact market selection is already in this slip.');
        return current;
      }
      setActionMessage('');
      return [...current, next];
    });
    setAddEventId(''); setAddSelectionId('');
  }

  async function publishSlip(slip: Slip) {
    setPublishingSlip(slip._id); setActionMessage('');
    try {
      await publishSlipMutation.mutateAsync({ path: { slipId: slip._id } });
      setActionMessage(`Slip ${slip.slipCode} published.`);
      await load();
    } catch (requestError) { setActionMessage(errorText(requestError)); }
    finally { setPublishingSlip(''); }
  }

  async function createSlipFromPickCenter() {
    const tab = dateTabs.find((item) => item.key === selectedDate) ?? dateTabs[1];
    const selectionCount = Number(buildSelectionCount);
    const minimumProbability = Number(buildMinimumProbability);
    const minimumConfidence = Number(buildMinimumConfidence);
    if (!Number.isInteger(selectionCount) || selectionCount < 1) {
      setActionMessage('Selection count must be a positive whole number.');
      return;
    }
    if (!Number.isFinite(minimumProbability) || minimumProbability < 0 || minimumProbability > 1) {
      setActionMessage('Minimum probability must be between 0 and 1 (for example, 0.60).');
      return;
    }
    if (!Number.isFinite(minimumConfidence) || minimumConfidence < 0 || minimumConfidence > 100) {
      setActionMessage('Minimum confidence must be between 0 and 100.');
      return;
    }
    setActionMessage('');
    try {
      const body: BuildSlipArgs['body'] = {
        name: buildName.trim() || undefined,
        selectionCount,
        minimumProbability,
        minimumConfidence,
        fixtureFrom: startOfDay(tab.date).toISOString(),
        fixtureTo: endOfDay(tab.date).toISOString(),
        publish: buildPublishImmediately,
        productType: buildProductType,
      };
      if (buildProductType === 'SURE_ODDS') {
        body.sureOddsProduct = buildSureOddsProduct;
        body.sureOddsTier = buildSureOddsProduct === 'SURE_2' ? 'VIP' : 'PREMIUM';
      }
      const result = await buildSlipMutation.mutateAsync({ body });
      const createdSlip = result.slipCode ? ` (${result.slipCode})` : '';
      setActionMessage(`Slip generation request completed${createdSlip}.`);
      setShowBuildForm(false);
      await load();
    } catch (requestError) {
      setActionMessage(errorText(requestError));
    }
  }

  async function refreshAutomaticSlips() {
    setActionMessage('');
    try {
      const result = await refreshSlipsMutation.mutateAsync();
      setActionMessage(`Automatic slip refresh completed: ${result.createdOrUpdated} created/updated, ${result.skipped} combinations skipped.`);
      await load();
    } catch (requestError) { setActionMessage(errorText(requestError)); }
  }

  function SlipCard({ slip }: { slip: Slip }) {
    const expanded = expandedSlip === slip._id;
    const odds = Number(slip.odds ?? slip.combinedOdds);
    const probability = pct(slip.combinedProbability);
    const confidence = Number(slip.generalConfidence ?? slip.averageConfidence);
    const eventCount = new Set((slip.legs ?? []).map((leg) => leg.eventId)).size;
    const marketCount = new Set((slip.legs ?? []).map((leg) => leg.marketKey).filter(Boolean)).size;
    const visibleLegs = (slip.legs ?? []).filter((leg) => editingSlip !== slip._id || draftLegs.some((draft) => selectionIdentity(draft) === selectionIdentity(leg)));
    const visibleMatchGroups = [...visibleLegs.reduce((groups, leg) => {
      const current = groups.get(leg.eventId) ?? [];
      current.push(leg);
      groups.set(leg.eventId, current);
      return groups;
    }, new Map<string, SlipLeg[]>()).entries()].map(([eventId, legs]) => ({ eventId, legs: legs.sort((a, b) => String(a.marketName ?? a.marketKey).localeCompare(String(b.marketName ?? b.marketKey))) })).sort((a, b) => new Date(a.legs[0]?.fixtureDate ?? 0).getTime() - new Date(b.legs[0]?.fixtureDate ?? 0).getTime());
    return <article style={expanded ? { gridColumn: '1 / -1' } : undefined} className={`min-w-0 overflow-hidden rounded-md border bg-card ${expanded ? 'border-primary/50 shadow-sm' : 'border-border hover:border-primary/30'}`}>
      <button type="button" onClick={() => void toggleSlipDetails(slip)} aria-expanded={expanded} className="block w-full p-2 text-left">
        <div className="mb-1.5 flex items-start justify-between gap-2"><div className="min-w-0"><p className="whitespace-normal break-words text-[11px] font-semibold leading-tight" title={slip.name}>{slip.name || productLabel(slip)}</p><p className="mt-0.5 whitespace-normal break-words text-[9px] text-muted-foreground">{slip.slipCode} · {formatDate(slip.fixtureDateFrom)}{slip.fixtureDateTo && slip.fixtureDateTo !== slip.fixtureDateFrom ? `–${formatDate(slip.fixtureDateTo)}` : ''}</p></div><FaChevronDown className={`mt-0.5 h-2.5 w-2.5 shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} /></div>
        <div className="mb-1.5 flex flex-wrap items-center gap-1"><span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${statusTone(slip.status)}`}>{slip.status}</span><span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${settlementTone(slip.settlementStatus)}`}>SETTLEMENT: {slip.settlementStatus ?? 'PENDING'}</span><span className="rounded bg-muted px-1.5 py-0.5 text-[8px] font-semibold text-muted-foreground">{productLabel(slip)}</span><span className="rounded bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">{slip.automatic ? 'AUTO' : 'MANUAL'}</span></div>
        <div className="grid grid-cols-3 gap-x-2 gap-y-1.5 border-t border-border/70 pt-1.5">
          <div><p className="text-[8px] uppercase tracking-wide text-muted-foreground">Total odds</p><p className={`text-[13px] font-bold tabular-nums leading-tight ${oddsTone(Number.isFinite(odds) ? odds : undefined)}`}>{Number.isFinite(odds) ? odds.toFixed(2) : '—'}</p></div>
          <div><p className="text-[8px] uppercase tracking-wide text-muted-foreground">Probability</p><p className={`text-[11px] font-semibold tabular-nums leading-tight ${probabilityTone(probability)}`}>{probability === null ? '—' : `${probability.toFixed(2)}%`}</p></div>
          <div><p className="text-[8px] uppercase tracking-wide text-muted-foreground">Confidence</p><p className={`text-[11px] font-semibold tabular-nums leading-tight ${confidenceTone(confidence)}`}>{Number.isFinite(confidence) ? `${confidence}%` : '—'}</p></div>
          <div><p className="text-[8px] uppercase tracking-wide text-muted-foreground">Events</p><p className="text-[10px] font-semibold tabular-nums">{eventCount}</p></div>
          <div><p className="text-[8px] uppercase tracking-wide text-muted-foreground">Selections</p><p className="text-[10px] font-semibold tabular-nums">{slip.legCount ?? (slip.legs ?? []).length}</p></div>
          <div><p className="text-[8px] uppercase tracking-wide text-muted-foreground">Markets</p><p className="text-[10px] font-semibold tabular-nums">{marketCount}</p></div>
        </div>
      </button>
      {expanded ? <div className="border-t border-border bg-muted/15 p-2">{loadingSlipDetails === slip._id ? <p className="mb-1 text-[9px] text-muted-foreground">Refreshing slip details…</p> : null}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-semibold">Matches in slip <span className="font-normal text-muted-foreground">({eventCount})</span></p><div className="flex flex-wrap items-center gap-1"><span className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">Fair odds {Number.isFinite(Number(slip.combinedFairOdds)) ? Number(slip.combinedFairOdds).toFixed(2) : '—'}</span><span className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">{String(slip.oddsBasis || (slip.legs?.some((leg) => leg.priceType === 'ESTIMATED') ? 'ESTIMATED' : 'PROVIDER'))}</span><span className="rounded border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">Created {formatDate(slip.createdAt)}</span><button type="button" onClick={() => editingSlip === slip._id ? setEditingSlip('') : beginEdit(slip)} className="rounded border border-primary/40 px-2 py-1 text-[9px] font-semibold text-primary hover:bg-primary/5">{editingSlip === slip._id ? 'Close editor' : 'Edit slip'}</button>{slip.status?.toUpperCase() !== 'PUBLISHED' ? <button type="button" onClick={() => void publishSlip(slip)} disabled={publishingSlip === slip._id} className="rounded border border-green-600/40 px-2 py-1 text-[9px] font-semibold text-status-success hover:bg-green-600/5 disabled:opacity-50">{publishingSlip === slip._id ? 'Publishing…' : 'Publish'}</button> : null}</div></div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleMatchGroups.map(({ eventId, legs }) => {
            const match = legs[0];
            const matchStatus = match.matchSettlementStatus && match.matchSettlementStatus !== 'PENDING'
              ? match.matchSettlementStatus
              : aggregateSettlementStatus(legs.map((leg) => leg.settlementOutcome));
            const matchKey = `${slip._id}::${eventId}`;
            const matchExpanded = expandedMatchKey === matchKey || editingSlip === slip._id;
            return <article key={eventId} className={`min-w-0 overflow-hidden rounded-md border bg-card ${matchExpanded ? 'border-primary/40' : 'border-border hover:border-primary/30'}`}>
              <button type="button" aria-expanded={matchExpanded} onClick={() => setExpandedMatchKey((current) => current === matchKey ? '' : matchKey)} className="block w-full p-1.5 text-left">
                {(() => {
                  const presentation = matchPresentation.get(eventId);
                  const status = getDisplayMatchStatus(presentation, undefined, match.fixtureDate ?? presentation?.fixtureDate ?? undefined);
                  const homeScore = displayScore(presentation?.homeScore, status);
                  const awayScore = displayScore(presentation?.awayScore, status);
                  const homeName = resolveTeamDisplayName(presentation?.homeTeamName, match.homeTeamName);
                  const awayName = resolveTeamDisplayName(presentation?.awayTeamName, match.awayTeamName);
                  const leagueName = leagueLabel(presentation?.leagueName ?? match.leagueName, presentation?.leagueId ?? match.leagueId);
                  return <div className="space-y-1.5">
                    <div className="flex min-w-0 items-center gap-1">
                      <CompactLogo src={presentation?.leagueLogo ?? match.leagueLogo} alt={leagueName} fallback={leagueName} size={12} />
                      <span className="min-w-0 flex-1 whitespace-normal break-words text-[8px] text-muted-foreground">{leagueName}{presentation?.leagueCountry ? <span className="ml-1 opacity-70">· {presentation.leagueCountry}</span> : null}</span>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-[7px] font-bold leading-none ${displayStatusTone(status)}`}>
                        {displayStatusLabel(status, presentation)}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center justify-center gap-1.5">
                      <CompactLogo src={presentation?.homeTeamLogo ?? match.homeTeamLogo} alt={homeName ?? ''} fallback={homeName ?? ''} size={16} />
                      <span className="min-w-0 max-w-[34%] whitespace-normal break-words text-[10px] font-semibold" title={homeName ?? ''}>{homeName}</span>
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                        {homeScore}<span className="mx-1 text-muted-foreground">:</span>{awayScore}
                      </span>
                      <span className="min-w-0 max-w-[34%] whitespace-normal break-words text-[10px] font-semibold" title={awayName ?? ''}>{awayName}</span>
                      <CompactLogo src={presentation?.awayTeamLogo ?? match.awayTeamLogo} alt={awayName ?? ''} fallback={awayName ?? ''} size={16} />
                    </div>
                    <p className="text-right text-[8px] tabular-nums text-muted-foreground">{formatDate(presentation?.fixtureDate ?? match.fixtureDate)} {formatTime(presentation?.fixtureDate ?? match.fixtureDate)}</p>
                  </div>;
                })()}
                <div className="mt-1 flex items-center justify-between gap-1"><span className="text-[8px] text-muted-foreground">{legs.length} selection{legs.length === 1 ? '' : 's'} · click to {matchExpanded ? 'hide' : 'view'}</span><span className={`shrink-0 rounded px-1 py-0.5 text-[7px] font-bold ${settlementTone(matchStatus)}`}>SETTLEMENT {matchStatus}</span></div>
                <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-1"><span className="text-[8px] text-muted-foreground">Selected market odds</span><span className="text-[9px] font-bold tabular-nums">{legs.reduce((product, leg) => { const price = Number(leg.decimalOdds ?? leg.bookmakerOdds); return Number.isFinite(price) && price >= 1 ? product * price : product; }, 1).toFixed(2)}</span></div>
              </button>
              {matchExpanded ? <div className="space-y-1 border-t border-border/70 bg-muted/10 p-1.5">
                {legs.map((leg) => {
                  const legOdds = Number(leg.decimalOdds ?? leg.bookmakerOdds);
                  const legProbability = pct(leg.probability);
                  const outcome = String(leg.settlementOutcome ?? 'PENDING').toUpperCase();
                  const isEditing = editingSlip === slip._id;
                  return <div key={selectionIdentity(leg)} className="rounded border border-border/70 bg-card px-1.5 py-1.5">
                    <div className="flex min-w-0 items-start justify-between gap-1">
                      <div className="min-w-0 flex-1"><p className="text-[8px] font-semibold uppercase leading-tight text-muted-foreground">{leg.marketName || marketAbbreviation(leg.marketKey, leg.marketKey)}</p><p className="break-words text-[9px] font-semibold leading-tight text-foreground">{leg.selectionName || leg.selectionKey}</p></div>
                      <div className="flex shrink-0 flex-col items-end gap-1"><span className={`rounded px-1 py-0.5 text-[7px] font-bold ${settlementTone(outcome)}`}>{outcome}</span>{isEditing ? <button type="button" onClick={() => setDraftLegs((current) => current.filter((item) => selectionIdentity(item) !== selectionIdentity(leg)))} className="text-[8px] font-bold text-status-danger hover:underline">Remove</button> : null}</div>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-x-1 border-t border-border/50 pt-1">
                      <div><p className="text-[7px] uppercase text-muted-foreground">Probability</p><p className={`text-[9px] font-semibold tabular-nums ${probabilityTone(legProbability)}`}>{legProbability === null ? '—' : `${legProbability.toFixed(1)}%`}</p></div>
                      <div><p className="text-[7px] uppercase text-muted-foreground">Confidence</p><p className={`text-[9px] font-semibold tabular-nums ${confidenceTone(leg.confidence)}`}>{Number.isFinite(Number(leg.confidence)) ? `${Number(leg.confidence)}%` : '—'}</p></div>
                      <div><p className="text-[7px] uppercase text-muted-foreground">Odds</p><p className={`text-[9px] font-bold tabular-nums ${oddsTone(legOdds)}`}>{Number.isFinite(legOdds) ? `${leg.priceType === 'ESTIMATED' ? '~' : ''}${legOdds.toFixed(2)}` : '—'}</p></div>
                    </div>
                    <p className="mt-0.5 text-[7px] text-muted-foreground">Price source: {leg.priceType ?? '—'}</p>
                  </div>;
                })}
              </div> : null}
            </article>;
          })}
        </div>
        {editingSlip === slip._id ? <div className="mt-2 space-y-2 rounded-md border border-primary/25 bg-card p-2">
          <p className="text-[10px] font-semibold">Edit slip markets <span className="font-normal text-muted-foreground">· {draftLegs.length} selected</span></p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(130px,1fr)_minmax(180px,2fr)_auto]">
            <select value={addEventId} onChange={(event) => { setAddEventId(event.target.value); setAddSelectionId(''); }} className="h-8 min-w-0 rounded border border-border bg-background px-2 text-[10px]" aria-label="Choose match to add">
              <option value="">Choose match…</option>
              {availableAddPicks.map((pick) => <option key={pick.eventId} value={pick.eventId}>{pick.homeTeamName} vs {pick.awayTeamName} · {formatTime(pick.fixtureDate)}</option>)}
            </select>
            <select value={addSelectionId} onChange={(event) => setAddSelectionId(event.target.value)} disabled={!selectedAddPick} className="h-8 min-w-0 rounded border border-border bg-background px-2 text-[10px]" aria-label="Choose market selection to add">
              <option value="">Choose approved market selection…</option>
              {selectedAddOptions.map((option) => <option key={option.id} value={option.id} disabled={!option.priceAvailable || option.alreadyAdded}>{option.label}{option.alreadyAdded ? ' · already added' : ''}</option>)}
            </select>
            <button type="button" onClick={addDraftLeg} disabled={!addEventId || !addSelectionId || !selectedAddOptions.some((option) => option.id === addSelectionId && option.priceAvailable && !option.alreadyAdded)} className="h-8 rounded border border-border px-3 text-[10px] font-semibold hover:bg-muted disabled:opacity-40">Add market</button>
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <label className="space-y-1 text-[9px] text-muted-foreground">SportyBet code<input value={sportyCode} onChange={(event) => setSportyCode(event.target.value)} placeholder="Enter slip code" className="h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
            <label className="space-y-1 text-[9px] text-muted-foreground">SportyBet link<input value={sportyLink} onChange={(event) => setSportyLink(event.target.value)} placeholder="https://…" className="h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground" /></label>
          </div>
          {actionMessage ? <p role="status" className={`text-[10px] ${actionMessage.toLowerCase().includes('saved') ? 'text-status-success' : 'text-destructive'}`}>{actionMessage}</p> : null}
          <div className="flex justify-end gap-1.5"><button type="button" onClick={() => setEditingSlip('')} className="h-7 rounded border border-border px-2.5 text-[10px] hover:bg-muted">Cancel</button><button type="button" onClick={() => void saveSlipEdits(slip)} disabled={savingSlip || draftLegs.length === 0} className="h-7 rounded bg-primary px-3 text-[10px] font-semibold text-primary-foreground disabled:opacity-50">{savingSlip ? 'Saving…' : 'Save slip'}</button></div>
        </div> : null}
      </div> : null}
    </article>;
  }

  return <main className="mx-auto w-full max-w-[1800px] space-y-2">
    <header className="flex min-h-8 flex-wrap items-center justify-between gap-2"><h1 className="text-sm font-semibold tracking-tight">Slip Center</h1><div className="flex flex-wrap items-center gap-1.5"><button type="button" onClick={() => setShowBuildForm((current) => !current)} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-primary/40 bg-card px-2.5 text-[10px] font-semibold text-primary hover:bg-primary/5">{showBuildForm ? 'Close build form' : 'Build slip'}</button><button type="button" onClick={() => void refreshAutomaticSlips()} disabled={refreshSlipsMutation.isPending || loading} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${refreshSlipsMutation.isPending ? 'animate-spin' : ''}`} /> {refreshSlipsMutation.isPending ? 'Refreshing auto slips…' : 'Refresh auto slips'}</button><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button></div></header>

    <section className="space-y-2 rounded-md border border-border bg-card p-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><h2 className="text-[11px] font-semibold">Slip Statistics</h2><p className="text-[9px] text-muted-foreground">{slipStatsRangeLabel}</p></div>
        <button type="button" onClick={() => void loadSlipStatistics()} disabled={slipStatsLoading} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-[10px] font-semibold hover:bg-muted disabled:opacity-50"><FaRotate className={`h-2.5 w-2.5 ${slipStatsLoading ? 'animate-spin' : ''}`} /> Refresh stats</button>
      </div>
      <div className="flex flex-wrap items-end gap-2 border-b border-border/70 pb-2" aria-label="Slip statistics filters">
        <label className="flex flex-col gap-1 text-[9px] text-muted-foreground">Period
          <select value={slipStatsPeriod} onChange={(event) => setSlipStatsPeriod(event.target.value as SlipStatsPeriod)} className="h-7 min-w-32 rounded border border-border bg-background px-1.5 text-[10px] text-foreground">
            {SLIP_STATS_PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {slipStatsPeriod === 'CUSTOM' ? <>
          <label className="flex flex-col gap-1 text-[9px] text-muted-foreground">From<input type="date" value={slipStatsCustomFrom} onChange={(event) => setSlipStatsCustomFrom(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
          <label className="flex flex-col gap-1 text-[9px] text-muted-foreground">To<input type="date" value={slipStatsCustomTo} onChange={(event) => setSlipStatsCustomTo(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground" /></label>
        </> : null}
        <label className="flex flex-col gap-1 text-[9px] text-muted-foreground">Slip type
          <select value={slipStatsType} onChange={(event) => setSlipStatsType(event.target.value)} className="h-7 min-w-36 rounded border border-border bg-background px-1.5 text-[10px] text-foreground">
            <option value="ALL">All slip types</option>
            {searchableSlipStatsTypeOptions.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[9px] text-muted-foreground">Find slip type
          <input value={slipStatsTypeSearch} onChange={(event) => setSlipStatsTypeSearch(event.target.value)} placeholder="Search types…" className="h-7 w-36 rounded border border-border bg-background px-2 text-[10px] text-foreground" />
        </label>
        <label className="flex flex-col gap-1 text-[9px] text-muted-foreground">Find market
          <input value={slipStatsMarketSearch} onChange={(event) => setSlipStatsMarketSearch(event.target.value)} placeholder="Search markets…" className="h-7 w-36 rounded border border-border bg-background px-2 text-[10px] text-foreground" />
        </label>
      </div>
      {slipStatsError ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[10px] text-destructive"><span>{slipStatsError}</span><button type="button" onClick={() => void loadSlipStatistics()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
      <section className="space-y-1">
        <div className="flex items-center justify-between gap-2"><h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Aggregate performance</h3><span className="text-[9px] text-muted-foreground">{slipStatsLoading ? 'Updating…' : `${filteredSlipStatsRecords.length.toLocaleString('en-GB')} slips included`}</span></div>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          <SlipStatsCard label="Total Slips" value={slipStatsSummary.slips.total} />
          <SlipStatsCard label="Won" value={slipStatsSummary.slips.won} tone="text-green-600 dark:text-green-400" />
          <SlipStatsCard label="Lost" value={slipStatsSummary.slips.lost} tone="text-red-600 dark:text-red-400" />
          <SlipStatsCard label="Pending" value={slipStatsSummary.slips.pending} tone="text-sky-600 dark:text-sky-400" />
          <SlipStatsCard label="Void" value={slipStatsSummary.slips.void} tone="text-orange-600 dark:text-orange-400" />
          <SlipStatsCard label="Push" value={slipStatsSummary.slips.push} tone="text-amber-600 dark:text-amber-400" />
          <SlipStatsCard label="Total Matches" value={slipStatsSummary.totalMatches} />
          <SlipStatsCard label="Matches Won" value={slipStatsSummary.wonMatches} tone="text-green-600 dark:text-green-400" />
        </div>
      </section>
      <SlipOutcomeTable title="Slip Type Breakdown" nameHeader="Slip Type" rows={slipStatsSummary.typeRows} />
      <div className="space-y-1">
        <SlipOutcomeTable title="Market Outcomes" nameHeader="Market" rows={slipStatsSummary.marketRows} />
      </div>
      <p className="text-[9px] text-muted-foreground">Slip totals count each slip once. Match totals count each match once per slip; market totals count each market selection leg within each slip. Half outcomes are included under Won or Lost.</p>
    </section>

        <section className="space-y-1 rounded-lg border border-border bg-card p-1.5">
      <div className="flex flex-wrap items-center justify-center gap-0.5" aria-label="Slip date selector">{dateTabs.map((tab) => <button key={tab.key} type="button" onClick={() => setSelectedDate(tab.key)} className={`min-w-[54px] rounded-md px-2 py-1.5 text-[10px] ${selectedDate === tab.key ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{tab.label}</button>)}</div>
      <div className="flex flex-wrap items-center justify-center gap-1 border-t border-border/70 pt-1.5" aria-label="Slip filters">
        <label className="flex items-center gap-1 text-[9px] text-muted-foreground">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground"><option value="ALL">All statuses</option><option value="READY">Ready</option><option value="PUBLISHED">Published</option><option value="SETTLED">Settled</option><option value="CANCELLED">Cancelled</option></select></label>
        <label className="flex items-center gap-1 text-[9px] text-muted-foreground">Creation<select value={automaticFilter} onChange={(event) => setAutomaticFilter(event.target.value)} className="h-7 rounded border border-border bg-background px-1.5 text-[10px] text-foreground"><option value="ALL">Automatic + manual</option><option value="true">Automatic only</option><option value="false">Manual only</option></select></label>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-0.5 border-t border-border/70 pt-1" aria-label="Slip type selector">
        <button type="button" onClick={() => setActiveSlipType('ALL')} className={`rounded-md px-2 py-1.5 text-[10px] ${activeSlipType === 'ALL' ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>All slip types <span className="ml-1 opacity-60">{slips.length}</span></button>
        {slipTypes.map((type) => <button key={type.id} type="button" onClick={() => setActiveSlipType(type.id)} title={type.label} className={`rounded-md px-2 py-1.5 text-[10px] ${activeSlipType === type.id ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>{type.label} <span className="ml-1 opacity-60">{type.count}</span></button>)}
        {!slipTypes.length && !loading ? <span className="px-2 text-[10px] text-muted-foreground">No slip types for this date.</span> : null}
      </div>
    </section>
    
    {showBuildForm ? <section className="space-y-2 rounded-md border border-primary/30 bg-card p-2.5">
      <div><h2 className="text-[11px] font-semibold">Build slip from Pick Center</h2></div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-[9px] text-muted-foreground">Slip name<input value={buildName} onChange={(event) => setBuildName(event.target.value)} placeholder="Optional slip name" className="h-8 w-full rounded border border-border bg-background px-2 text-[10px] text-foreground" /></label>
        <label className="space-y-1 text-[9px] text-muted-foreground">Product type<select value={buildProductType} onChange={(event) => setBuildProductType(event.target.value as ActiveSlipProductType)} className="h-8 w-full rounded border border-border bg-background px-2 text-[10px] text-foreground"><option value="ODDS_10">10 Odds</option><option value="ODDS_25">25 Odds</option><option value="ODDS_50">50 Odds</option><option value="SURE_ODDS">Sure Odds</option></select></label>
        <label className="space-y-1 text-[9px] text-muted-foreground">Selection count<input type="number" min="1" step="1" value={buildSelectionCount} onChange={(event) => setBuildSelectionCount(event.target.value)} className="h-8 w-full rounded border border-border bg-background px-2 text-[10px] text-foreground" /></label>
        <label className="space-y-1 text-[9px] text-muted-foreground">Minimum probability (0–1)<input type="number" min="0" max="1" step="0.01" value={buildMinimumProbability} onChange={(event) => setBuildMinimumProbability(event.target.value)} className="h-8 w-full rounded border border-border bg-background px-2 text-[10px] text-foreground" /></label>
        <label className="space-y-1 text-[9px] text-muted-foreground">Minimum confidence (0–100)<input type="number" min="0" max="100" step="1" value={buildMinimumConfidence} onChange={(event) => setBuildMinimumConfidence(event.target.value)} className="h-8 w-full rounded border border-border bg-background px-2 text-[10px] text-foreground" /></label>
        {buildProductType === 'SURE_ODDS' ? <label className="space-y-1 text-[9px] text-muted-foreground">Sure Odds product<select value={buildSureOddsProduct} onChange={(event) => setBuildSureOddsProduct(event.target.value as SureOddsProduct)} className="h-8 w-full rounded border border-border bg-background px-2 text-[10px] text-foreground"><option value="SURE_2">Sure 2 (Regular access)</option><option value="SURE_5">Sure 5 (VIP access)</option><option value="SURE_7">Sure 7 (VIP access)</option></select></label> : null}
        <label className="flex items-center gap-2 self-end pb-2 text-[10px] text-foreground"><input type="checkbox" checked={buildPublishImmediately} onChange={(event) => setBuildPublishImmediately(event.target.checked)} /> Publish immediately (if eligible)</label>
      </div>
      <div className="flex justify-end"><button type="button" onClick={() => void createSlipFromPickCenter()} disabled={buildSlipMutation.isPending} className="h-8 rounded bg-primary px-3 text-[10px] font-semibold text-primary-foreground disabled:opacity-50">{buildSlipMutation.isPending ? 'Building slip…' : 'Build slip'}</button></div>
    </section> : null}
    {errorMessage ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[10px] text-destructive"><span>{errorMessage}</span><button type="button" onClick={() => void load()} className="rounded border border-destructive/30 px-2 py-1 font-semibold">Retry</button></div> : null}
    {actionMessage && !editingSlip ? <div role="status" className={`rounded-md border px-2.5 py-2 text-[10px] ${actionMessage.toLowerCase().includes('failed') || actionMessage.toLowerCase().includes('could not') ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-green-600/25 bg-green-600/5 text-status-success'}`}>{actionMessage}</div> : null}
    <section><div className="mb-1 flex items-center justify-between gap-2"><p className="text-[10px] font-medium text-muted-foreground">{loading ? 'Loading slips…' : `${shownSlips.length} slip${shownSlips.length === 1 ? '' : 's'}`}</p></div>
      {loading ? <div className="rounded-md border border-border bg-card px-2 py-10 text-center text-[10px] text-muted-foreground">Loading Slip Center…</div> : shownSlips.length ? <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">{shownSlips.map((slip) => <SlipCard key={slip._id} slip={slip} />)}</div> : <div className="rounded-md border border-border bg-card px-2 py-10 text-center text-[10px] text-muted-foreground">No slips found for this date and slip type.</div>}
    </section>
  </main>;
}



