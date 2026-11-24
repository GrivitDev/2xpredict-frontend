'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { FaGlobe, FaLock, FaTicketSimple } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import { useGetV2CompetitionsQuery } from '@/hooks/use-sports';
import { useGetPolicyQuery } from '@/hooks/use-prediction-access';
import {
  useListPickCenterInfiniteQuery,
  useListCuratedPredictionsInfiniteQuery,
  useListSlipsInfiniteQuery,
  useListSureOddsInfiniteQuery,
} from '@/hooks/use-prediction-access-infinite';
import { useGetEntitlementsQuery } from '@/hooks/use-subscriptions';
import { getSlipProductRequiredPlan, getVisiblePredictionMarketKeys } from '@/lib/prediction-access.utils';
import { useMatchPresentation, type MatchPresentation } from '@/hooks/use-match-presentation';
import {
  asRecord,
  firstValue,
  numeric,
  rowsFrom,
  text,
  unwrapRecord,
  type ApiRecord,
} from '@/lib/api-shapes';
import {
  countryOf,
  competitionKeys,
  marketCodeOf,
  marketNameOf,
  localDateKey,
  localDayRange,
} from '@/components/bet-lab/bet-lab.utils';
import MarketSelector from '@/components/bet-lab/MarketSelector';
import PredictionsDateBar, { type PredictionMode } from './PredictionsDateBar';
import PredictionCountryLeaguePanel, {
  type PredictionCountryItem,
  type PredictionLeagueItem,
} from './PredictionCountryLeaguePanel';
import PredictionSlipSelector, {
  type PredictionSlipCategoryId,
} from './PredictionSlipSelector';
import PredictionMatchCard from './PredictionMatchCard';
import PredictionMarketDetailsPanel from './PredictionMarketDetailsPanel';
const FixtureStatsDialog = dynamic(
  () => import('@/components/bet-lab/stats/FixtureStatsDialog'),
  { ssr: false },
);

type AccessPlan = 'anonymous' | 'free' | 'regular' | 'vip' | 'premium';
const EMPTY_ROWS: ApiRecord[] = [];

/** Use canonical prediction keys returned by the shared backend Odds catalogue. */
function predictionMarketKeysForCatalogCode(code: string, catalog: ApiRecord[]): string[] {
  const market = catalog.find((item) => marketCodeOf(item).toUpperCase() === code.trim().toUpperCase());
  const key = text(firstValue(market ?? {}, ['predictionMarketKey'])).trim().toUpperCase();
  return key ? [key] : [];
}

function normalizedPlan(value: unknown): AccessPlan {
  const key = text(value).toLowerCase().replace(/[_ -]/g, '');
  if (key.includes('premium')) return 'premium';
  if (key.includes('vip')) return 'vip';
  if (key.includes('regular')) return 'regular';
  if (key.includes('free')) return 'free';
  return 'anonymous';
}

function resolveAccessPlan(entitlementPlan: unknown, signedIn: boolean): AccessPlan {
  if (typeof entitlementPlan === 'string' && entitlementPlan.trim()) {
    return normalizedPlan(entitlementPlan);
  }
  // Until the entitlement endpoint resolves, use the least-privileged plan.
  return signedIn ? 'free' : 'anonymous';
}

function priorityOf(item: ApiRecord): string {
  return text(firstValue(item, ['priority', 'competitionPriority', 'bettingPriority', 'type'])).toUpperCase().replace(/\s+/g, '_');
}

function canAccessLeague(competition: ApiRecord, plan: AccessPlan, policyData: unknown): boolean {
  if (plan === 'regular' || plan === 'vip' || plan === 'premium') return true;
  const priority = priorityOf(competition);
  const root = unwrapRecord(policyData);
  const rules = asRecord(root.rules) ?? {};
  const planRules = asRecord(rules[plan]) ?? {};
  const active = asRecord(planRules.activePickCenter) ?? {};
  const fallback = plan === 'anonymous' ? ['SELECTIVE', 'HIGH'] : ['ELITE', 'HIGH', 'SELECTIVE'];
  const configured = firstValue(active, ['priorities'], fallback);
  return Array.isArray(configured) && configured.some((item) => text(item).toUpperCase() === priority);
}

function eventIdOf(item: ApiRecord): string {
  return text(firstValue(item, ['eventId', 'fixtureId', 'event_id', 'id', '_id']));
}

function fixtureDateOf(item: ApiRecord): string {
  return text(firstValue(item, ['fixtureDate', 'matchDate', 'startTime', 'kickoff', 'fixtureDateFrom']));
}

function oneSelectionPerMarket(rows: ApiRecord[]): ApiRecord[] {
  const bestByMarket = new Map<string, ApiRecord>();
  rows.forEach((row, index) => {
    const marketKey = marketKeyOf(row);
    const identity = marketKey || text(firstValue(row, ['selectionKey', 'key']), `row-${index}`);
    const current = bestByMarket.get(identity);
    if (!current) {
      bestByMarket.set(identity, row);
      return;
    }
    const score = numeric(firstValue(row, ['rankingScore']), Number.NEGATIVE_INFINITY);
    const currentScore = numeric(firstValue(current, ['rankingScore']), Number.NEGATIVE_INFINITY);
    const probability = numeric(firstValue(row, ['probability']), 0);
    const currentProbability = numeric(firstValue(current, ['probability']), 0);
    if (score > currentScore || (score === currentScore && probability > currentProbability)) {
      bestByMarket.set(identity, row);
    }
  });
  return [...bestByMarket.values()].sort((a, b) => {
    const rankA = numeric(firstValue(a, ['rank']), Number.MAX_SAFE_INTEGER);
    const rankB = numeric(firstValue(b, ['rank']), Number.MAX_SAFE_INTEGER);
    return rankA - rankB || marketKeyOf(a).localeCompare(marketKeyOf(b));
  });
}

function selectionRows(item: ApiRecord, mode: PredictionMode): ApiRecord[] {
  const rows = mode === 'general' || mode === 'settled'
    ? rowsFrom(
        firstValue(item, ['selectedMarkets', 'markets', 'selections']),
        ['items', 'selectedMarkets', 'markets', 'selections'],
      )
    : rowsFrom(firstValue(item, ['curatedSelections', 'selections']), ['items', 'curatedSelections', 'selections']);
  return oneSelectionPerMarket(rows);
}

function marketKeyOf(item: ApiRecord): string {
  return text(firstValue(item, ['marketKey', 'marketCode', 'market'])).toUpperCase();
}

function visibleMarketKeysForMode(
  policyData: unknown,
  plan: AccessPlan,
  mode: PredictionMode,
): Set<string> | null {
  if (mode !== 'special') return getVisiblePredictionMarketKeys(policyData, plan);

  // Curated Predictions has its own market allowlist, distinct from Pick Center.
  const rules = asRecord(unwrapRecord(policyData).rules) ?? {};
  const planRules = asRecord(rules[plan]) ?? {};
  const curated = asRecord(planRules.curatedPredictionCenter) ?? {};
  const marketAccess = asRecord(curated.marketAccess) ?? {};
  const configured = firstValue(marketAccess, ['visibleMarketKeys']);
  if (!Array.isArray(configured)) return null;

  return new Set(
    configured
      .filter((key): key is string => typeof key === 'string')
      .map((key) => key.trim().toUpperCase())
      .filter(Boolean),
  );
}

/**
 * Build the public Predictions market selector from the backend's public plan
 * policy. Labels are enriched from already-loaded, entitlement-filtered
 * prediction rows; no protected Bet Lab catalogue request is needed.
 */
function marketCatalogFromVisibleRows(
  rows: ApiRecord[],
  mode: PredictionMode,
  policyData: unknown,
  plan: AccessPlan,
): ApiRecord[] {
  const visibleMarketKeys = visibleMarketKeysForMode(policyData, plan, mode);
  if (!visibleMarketKeys) return [];

  const metadataByKey = new Map<string, ApiRecord>();
  for (const row of rows) {
    for (const selection of selectionRows(row, mode)) {
      const key = marketKeyOf(selection);
      if (!key || !visibleMarketKeys.has(key)) continue;

      const existing = metadataByKey.get(key) ?? {};
      const name = text(firstValue(selection, ['marketName', 'fullName', 'name']));
      const abbreviation = text(
        firstValue(selection, ['marketAbbreviation', 'abbreviation', 'shortName', 'shortLabel']),
      );
      metadataByKey.set(key, {
        ...existing,
        ...(name && !existing.marketName ? { marketName: name, fullName: name } : {}),
        ...(abbreviation && !existing.abbreviation ? { abbreviation } : {}),
      });
    }
  }

  // The public policy contains the complete ordered allowlist for this plan.
  // Keep all allowed filters available, even when a market has no selections
  // in the currently loaded page; the prediction rows still determine results.
  return [...visibleMarketKeys].map((key) => {
    const metadata = metadataByKey.get(key) ?? {};
    const fallbackName = key
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const name = text(firstValue(metadata, ['fullName', 'marketName']), fallbackName);

    return {
      ...metadata,
      code: key,
      marketCode: key,
      predictionMarketKey: key,
      fullName: name,
      marketName: name,
    };
  });
}

function leagueMeta(item: ApiRecord, competitions: ApiRecord[], presentation?: MatchPresentation) {
  const selections = rowsFrom(item.selections, ['items', 'selections']);
  const firstSelection = selections[0] ?? {};
  const leagueId = text(firstValue(item, ['leagueId', 'competitionId']), text(firstValue(firstSelection, ['leagueId', 'competitionId'])));
  const competition = competitions.find((candidate) =>
    competitionKeys(candidate).some((key) => key.toLowerCase() === leagueId.toLowerCase()),
  );
  const nameCandidates = [
    firstValue(item, ['leagueDisplayName', 'competitionDisplayName']),
    firstValue(firstSelection, ['leagueDisplayName', 'competitionDisplayName']),
    firstValue(item, ['leagueName', 'competitionName']),
    firstValue(firstSelection, ['leagueName', 'competitionName']),
    firstValue(competition ?? {}, ['displayName', 'fullName', 'name', 'leagueName', 'shortName']),
    presentation?.leagueName,
  ].map((value) => text(value, '').trim()).filter(Boolean);
  const name = nameCandidates.find((value) =>
    value.toLowerCase() !== leagueId.toLowerCase() &&
    !/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value),
  ) ?? 'Football competition';
  const id = leagueId || text(firstValue(competition ?? {}, ['leagueId', 'competitionId', 'espnLeagueSlug', 'id', '_id'])) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const storedCountry = text(
    firstValue(item, ['predictionCountryGroup', 'countryGroup', 'country', 'countryName']),
    text(firstValue(firstSelection, ['predictionCountryGroup', 'countryGroup', 'country', 'countryName']), ''),
  );
  const storedCountryIsPlaceholder = !storedCountry || /^(other competitions|country unavailable|unknown|regional)$/i.test(storedCountry);
  const country = storedCountryIsPlaceholder
    ? (presentation?.leagueCountry ?? (competition ? countryOf(competition) : 'Other competitions'))
    : storedCountry;
  const logo = text(
    firstValue(item, ['leagueLogo', 'competitionLogo']),
    text(firstValue(firstSelection, ['leagueLogo']), text(firstValue(competition ?? {}, ['leagueLogo', 'logo', 'logos', 'emblem', 'crest']))),
  ) || null;
  return { id, name, country, logo, competition };
}

function buildCountryGroups(
  rows: ApiRecord[],
  mode: PredictionMode,
  competitions: ApiRecord[],
  plan: AccessPlan,
  policyData: unknown,
  presentations?: ReadonlyMap<string, MatchPresentation>,
): PredictionCountryItem[] {
  type LeagueAccumulator = PredictionLeagueItem & { eventIds: Set<string> };
  const countries = new Map<string, Map<string, LeagueAccumulator>>();

  for (const row of rows) {
    const eventId = eventIdOf(row);
    const predictions = selectionRows(row, mode);
    if (!eventId || !predictions.length) continue;

    const meta = leagueMeta(row, competitions, presentations?.get(eventId));
    const countryName = meta.country || 'Other competitions';
    if (!countries.has(countryName)) countries.set(countryName, new Map());
    const leagueMap = countries.get(countryName)!;
    const access = asRecord(firstValue(row, ['access', 'predictionAccess'])) ?? {};
    const accessMode = text(firstValue(access, ['mode']), '').toUpperCase();
    const hasExplicitAccess = Object.keys(access).length > 0;
    const locked = mode === 'settled'
      ? false
      : access.allowed === false || accessMode.includes('LOCKED') ||
        (meta.competition
          ? !canAccessLeague(meta.competition, plan, policyData)
          : !hasExplicitAccess && accessMode.includes('RESTRICTED'));
    const existing = leagueMap.get(meta.id);
    if (existing) {
      existing.eventIds.add(eventId);
      existing.locked = existing.locked || locked;
      if (!existing.logo && meta.logo) existing.logo = meta.logo;
    } else {
      leagueMap.set(meta.id, {
        id: meta.id,
        name: meta.name,
        count: 1,
        locked,
        logo: meta.logo,
        priority: priorityOf(meta.competition ?? {}),
        eventIds: new Set([eventId]),
      });
    }
  }

  return [...countries.entries()]
    .map(([name, leagueMap]) => {
      const leagues = [...leagueMap.values()]
        .filter((league) => league.eventIds.size > 0)
        .map((league) => ({
          id: league.id,
          name: league.name,
          count: league.eventIds.size,
          locked: league.locked,
          logo: league.logo,
          priority: league.priority,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      const lockedLeagueCount = leagues.filter((league) => league.locked).length;
      return {
        name,
        count: leagues.reduce((sum, league) => sum + league.count, 0),
        predictionLeagueCount: leagues.length,
        locked: leagues.length > 0 && lockedLeagueCount === leagues.length,
        lockedLeagueCount,
        leagues,
      };
    })
    .filter((country) => country.leagues.length > 0)
    .sort((a, b) => {
      const rank = (name: string) => name === 'International' ? 0 : name === 'Regional' ? 1 : 2;
      return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
    });
}

function countryGroupsFromSummary(summary: unknown): PredictionCountryItem[] {
  const summaryRecord = asRecord(summary) ?? {};
  const rows = rowsFrom(firstValue(summaryRecord, ['countries']), ['countries', 'items']);
  return rows.map((country) => {
    const leagues = rowsFrom(firstValue(country, ['leagues']), ['leagues']).map((league) => ({
      id: text(firstValue(league, ['id', 'leagueId'])),
      name: text(firstValue(league, ['name', 'leagueName']), 'Football league'),
      count: Math.max(0, numeric(firstValue(league, ['count', 'predictionCount']), 0)),
      locked: firstValue(league, ['locked', 'accessLocked']) === true,
      lockedCount: Math.max(0, numeric(firstValue(league, ['lockedCount']), firstValue(league, ['locked', 'accessLocked']) === true ? numeric(firstValue(league, ['count']), 0) : 0)),
      requiredPlan: text(firstValue(league, ['requiredPlan'])) || null,
      logo: text(firstValue(league, ['logo', 'leagueLogo'])) || null,
      priority: text(firstValue(league, ['priority']), 'SELECTIVE'),
    })).filter((league) => league.id && league.count > 0);
    const lockedLeagueCount = Math.max(
      0,
      numeric(firstValue(country, ['lockedLeagueCount']), leagues.filter((league) => league.locked).length),
    );
    return {
      name: text(firstValue(country, ['name', 'country']), 'Other competitions'),
      count: Math.max(0, numeric(firstValue(country, ['count', 'predictionCount']), leagues.reduce((sum, league) => sum + league.count, 0))),
      predictionLeagueCount: Math.max(0, numeric(firstValue(country, ['predictionLeagueCount', 'leagueCount']), leagues.length)),
      locked: firstValue(country, ['locked']) === true,
      lockedLeagueCount,
      requiredPlan: text(firstValue(country, ['requiredPlan'])) || null,
      leagues,
    };
  }).filter((country) => country.leagues.length > 0)
    .sort((a, b) => {
      const rank = (name: string) => name === 'International' ? 0 : name === 'Regional' ? 1 : 2;
      return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
    });
}

function isSettledOutcome(value: unknown): boolean {
  return ['WON', 'LOST', 'VOID', 'PUSH', 'HALF_WON', 'HALF_LOST'].includes(
    text(value, '').toUpperCase(),
  );
}

function isCuratedRecordSettled(record: ApiRecord): boolean {
  if (text(firstValue(record, ['status']), '').toUpperCase() === 'SETTLED') return true;
  if (isSettledOutcome(firstValue(record, ['settlementStatus']))) return true;
  const selections = rowsFrom(record.selections, ['items', 'selections']);
  return selections.length > 0 && selections.every((selection) =>
    isSettledOutcome(firstValue(selection, ['settlementOutcome', 'actualOutcome'])),
  );
}

function curateFixtureRows(records: ApiRecord[]): ApiRecord[] {
  const fixtures = new Map<string, ApiRecord>();

  for (const record of records) {
    if (isCuratedRecordSettled(record)) continue;
    const selections = rowsFrom(record.selections, ['items', 'selections']);
    const selectionsByEvent = new Map<string, ApiRecord[]>();

    for (const selection of selections) {
      const eventId = eventIdOf(selection);
      if (!eventId) continue;
      const group = selectionsByEvent.get(eventId) ?? [];
      group.push(selection);
      selectionsByEvent.set(eventId, group);
    }

    for (const [eventId, rawEventSelections] of selectionsByEvent) {
      const eventSelections = oneSelectionPerMarket(rawEventSelections);
      const firstSelection = eventSelections[0] ?? {};
      const fixtureKey = `${text(firstValue(record, ['_id', 'predictionCode']))}:${eventId}`;
      fixtures.set(fixtureKey, {
        ...record,
        eventId,
        leagueId: text(firstValue(firstSelection, ['leagueId']), text(firstValue(record, ['leagueId']))),
        leagueName: text(firstValue(firstSelection, ['leagueName']), text(firstValue(record, ['leagueName']))),
        fixtureDate: text(firstValue(firstSelection, ['fixtureDate']), text(firstValue(record, ['fixtureDateFrom', 'fixtureDate']))),
        homeTeamName: text(firstValue(firstSelection, ['homeTeamName']), text(firstValue(record, ['homeTeamName']))),
        awayTeamName: text(firstValue(firstSelection, ['awayTeamName']), text(firstValue(record, ['awayTeamName']))),
        selections: eventSelections,
        curatedSelections: eventSelections,
        curatedPredictionId: text(firstValue(record, ['_id', 'predictionCode'])),
      });
    }
  }

  return [...fixtures.values()];
}

function curateSlipLegRows(slip: ApiRecord | null): ApiRecord[] {
  return rowsFrom(slip?.legs, ['items', 'legs']).map((leg) => ({
    ...leg,
    eventId: eventIdOf(leg),
    fixtureDate: fixtureDateOf(leg),
  }));
}

function makePresentationFixtures(rows: ApiRecord[]): ApiRecord[] {
  const unique = new Map<string, ApiRecord>();
  for (const row of rows) {
    const eventId = eventIdOf(row);
    if (!eventId || unique.has(eventId)) continue;
    unique.set(eventId, {
      ...row,
      eventId,
      fixtureDate: fixtureDateOf(row),
      homeTeamName: text(firstValue(row, ['homeTeamName', 'homeName']), ''),
      awayTeamName: text(firstValue(row, ['awayTeamName', 'awayName']), ''),
    });
  }
  return [...unique.values()];
}

function lockMessage(
  plan: AccessPlan,
  feature: string,
  requiredPlan?: string | null,
) {
  const currentAccess = plan === 'anonymous' ? 'visitor access' : `${plan} access`;
  const targetPlan = text(requiredPlan, '').toLowerCase();
  const upgradeInstruction = targetPlan
    ? `The ${targetPlan.toUpperCase()} plan is required. Subscribe or upgrade to that plan to view the selections.`
    : 'Subscribe or upgrade your plan to view the selections.';
  return `${feature} is available, but it is not included in your current ${currentAccess}. ${upgradeInstruction}`;
}

function predictionValueTone(value: number, type: 'probability' | 'confidence') {
  const thresholds = type === 'probability'
    ? { good: 80, strong: 65, middle: 50, low: 40 }
    : { good: 85, strong: 75, middle: 65, low: 55 };
  if (value >= thresholds.good) return 'text-emerald-700 dark:text-emerald-300';
  if (value >= thresholds.strong) return 'text-lime-700 dark:text-lime-300';
  if (value >= thresholds.middle) return 'text-amber-700 dark:text-amber-300';
  if (value >= thresholds.low) return 'text-orange-700 dark:text-orange-300';
  return 'text-rose-700 dark:text-rose-300';
}

function settlementValueTone(value: unknown) {
  const status = text(value, 'PENDING').toUpperCase();
  if (status === 'WON' || status === 'HALF_WON') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  if (status === 'LOST' || status === 'HALF_LOST') return 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300';
  if (status === 'VOID' || status === 'PUSH') return 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  return 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300';
}

function LockedPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-card p-3 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
        <FaLock className="h-3 w-3" />
      </div>
      <h2 className="mt-2 text-[11px] font-bold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-[9px] leading-4 text-muted-foreground">{message}</p>
      <a href="/pricing" className="mt-2 inline-flex h-7 items-center justify-center rounded-md bg-primary px-3 text-[9px] font-bold text-primary-foreground">View subscription plans</a>
    </div>
  );
}

export default function PredictionsHub() {
  const { user, token } = useAuth();
  const signedIn = Boolean(token || user);
  const [mode, setMode] = useState<PredictionMode>('general');
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [selectedMarketCode, setSelectedMarketCode] = useState('MATCH_RESULT');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedSlipCategory, setSelectedSlipCategory] = useState<PredictionSlipCategoryId>('ODDS_10');
  const [selectedSlipId, setSelectedSlipId] = useState('');
  const [countryPanelOpen, setCountryPanelOpen] = useState(false);
  const [slipPanelOpen, setSlipPanelOpen] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  const [statsEventId, setStatsEventId] = useState('');

  const dateRange = useMemo(() => localDayRange(selectedDate), [selectedDate]);

  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: false, limit: 1000 } },
    {
      enabled: mode !== 'slips',
      staleTime: 10 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
  const policyQuery = useGetPolicyQuery({
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const entitlementsQuery = useGetEntitlementsQuery({
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const plan = resolveAccessPlan(entitlementsQuery.data?.plan, signedIn);
  const predictionCacheScope = `${plan}:${signedIn}`;
  const pickCenterQuery = useListPickCenterInfiniteQuery(
    { query: { from: dateRange.from, to: dateRange.to }, pageSize: 25, cacheScope: predictionCacheScope },
    {
      enabled: mode === 'general',
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const curatedQuery = useListCuratedPredictionsInfiniteQuery(
    { query: { from: dateRange.from, to: dateRange.to }, pageSize: 20, cacheScope: predictionCacheScope },
    {
      enabled: mode === 'special',
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const settledPickCenterQuery = useListPickCenterInfiniteQuery(
    {
      query: {
        from: dateRange.from,
        to: dateRange.to,
        includePast: true,
        settledOnly: true,
      },
      pageSize: 25,
      cacheScope: predictionCacheScope,
    },
    {
      enabled: mode === 'settled',
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const regularSlipsQuery = useListSlipsInfiniteQuery(
    { query: { from: dateRange.from, to: dateRange.to }, pageSize: 20, cacheScope: predictionCacheScope },
    {
      enabled: mode === 'slips',
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const sureSlipsQuery = useListSureOddsInfiniteQuery(
    { query: { from: dateRange.from, to: dateRange.to }, pageSize: 20, cacheScope: predictionCacheScope },
    {
      enabled: mode === 'slips',
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  const competitions = useMemo(
    () => (competitionsQuery.data ?? []) as unknown as ApiRecord[],
    [competitionsQuery.data],
  );
  const pickCenterRows = useMemo(
    () => (pickCenterQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY_ROWS) as unknown as ApiRecord[],
    [pickCenterQuery.data?.pages],
  );
  const curatedRawRows = useMemo(
    () => (curatedQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY_ROWS) as unknown as ApiRecord[],
    [curatedQuery.data?.pages],
  );
  const curatedFixtures = useMemo(() => curateFixtureRows(curatedRawRows), [curatedRawRows]);
  const settledPickCenterRows = useMemo(
    () => (settledPickCenterQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY_ROWS) as unknown as ApiRecord[],
    [settledPickCenterQuery.data?.pages],
  );
  const regularSlips = useMemo(
    () => (regularSlipsQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY_ROWS) as unknown as ApiRecord[],
    [regularSlipsQuery.data?.pages],
  );
  const sureSlips = useMemo(
    () => (sureSlipsQuery.data?.pages.flatMap((page) => page.items) ?? EMPTY_ROWS) as unknown as ApiRecord[],
    [sureSlipsQuery.data?.pages],
  );
  const allSlips = useMemo(() => {
    const byId = new Map<string, ApiRecord>();
    for (const slip of [...regularSlips, ...sureSlips]) {
      const id = text(firstValue(slip, ['_id', 'id', 'slipCode']));
      if (id) byId.set(id, slip);
    }
    return [...byId.values()].sort((a, b) =>
      new Date(text(firstValue(b, ['fixtureDateFrom', 'createdAt']))).getTime() -
      new Date(text(firstValue(a, ['fixtureDateFrom', 'createdAt']))).getTime(),
    );
  }, [regularSlips, sureSlips]);

  const currentRows = useMemo(() => mode === 'general'
    ? pickCenterRows
    : mode === 'special'
      ? curatedFixtures
      : mode === 'settled'
        ? settledPickCenterRows
        : [], [mode, pickCenterRows, curatedFixtures, settledPickCenterRows]);
  const rowPresentationRefs = useMemo(() => makePresentationFixtures(currentRows).map((row) => ({
    eventId: eventIdOf(row), fixtureDate: fixtureDateOf(row),
    leagueId: text(firstValue(row, ['leagueId', 'competitionId']), '') || undefined,
    leagueName: text(firstValue(row, ['leagueName', 'competitionName']), '') || undefined,
    leagueCountry: text(firstValue(row, ['leagueCountry', 'country', 'countryName']), '') || undefined,
    homeTeamId: text(firstValue(row, ['homeTeamId', 'homeId']), '') || undefined,
    awayTeamId: text(firstValue(row, ['awayTeamId', 'awayId']), '') || undefined,
    homeTeamName: text(firstValue(row, ['homeTeamName', 'homeTeam']), '') || undefined,
    awayTeamName: text(firstValue(row, ['awayTeamName', 'awayTeam']), '') || undefined,
    homeTeamLogo: text(firstValue(row, ['homeTeamLogo']), '') || undefined,
    awayTeamLogo: text(firstValue(row, ['awayTeamLogo']), '') || undefined,
    fixtureRecord: row,
  })), [currentRows]);
  const rowPresentations = useMatchPresentation(rowPresentationRefs, undefined, {
    refetchInterval: mode !== 'settled' && selectedDate === localDateKey(new Date()) ? 3 * 60_000 : false,
  });

  const marketCatalog = useMemo(
    () => marketCatalogFromVisibleRows(currentRows, mode, policyQuery.data, plan),
    [currentRows, mode, policyQuery.data, plan],
  );
  const selectedMarket = marketCatalog.find(
    (market) => marketCodeOf(market).toUpperCase() === selectedMarketCode,
  ) ?? marketCatalog.find((market) => {
    const code = marketCodeOf(market);
    const name = marketNameOf(market).toLowerCase();
    return code.toUpperCase() === 'MATCH_RESULT' || /match result|full time result|match winner/.test(name);
  }) ?? marketCatalog[0];
  const activeMarketCode = marketCodeOf(selectedMarket ?? {}).toUpperCase() || selectedMarketCode;
  const currentMarketName = selectedMarket
    ? marketNameOf(selectedMarket)
    : activeMarketCode === 'MATCH_RESULT'
      ? 'Match Result'
      : activeMarketCode || 'Market';

  const countryGroups = useMemo(() => {
    const summary = mode === 'general'
      ? pickCenterQuery.data?.pages[0]?.leagueSummary
      : mode === 'special'
        ? curatedQuery.data?.pages[0]?.leagueSummary
        : mode === 'settled'
          ? settledPickCenterQuery.data?.pages[0]?.leagueSummary
          : null;
    if (summary) {
      const summaryGroups = countryGroupsFromSummary(summary);
      const unresolvedSummaryCountry = summaryGroups.some((country) =>
        /^(other competitions|country unavailable|unknown|regional)$/i.test(country.name),
      );
      if (summaryGroups.length && !unresolvedSummaryCountry) return summaryGroups;
    }
    return buildCountryGroups(currentRows, mode, competitions, plan, policyQuery.data, rowPresentations);
  }, [currentRows, mode, competitions, plan, policyQuery.data, rowPresentations, pickCenterQuery.data?.pages[0]?.leagueSummary, curatedQuery.data?.pages[0]?.leagueSummary, settledPickCenterQuery.data?.pages[0]?.leagueSummary]);

  const visibleRows = useMemo(() => {
    const filtered = currentRows.filter((row) => {
      const presentation = rowPresentations.get(eventIdOf(row));
      if (selectedLeagueId) return leagueMeta(row, competitions, presentation).id === selectedLeagueId;
      if (selectedCountry) return leagueMeta(row, competitions, presentation).country === selectedCountry;
      return true;
    });
    return [...filtered].sort((a, b) => {
      const aTime = new Date(fixtureDateOf(a)).getTime();
      const bTime = new Date(fixtureDateOf(b)).getTime();
      if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0;
      if (!Number.isFinite(aTime)) return 1;
      if (!Number.isFinite(bTime)) return -1;
      return aTime - bTime;
    });
  }, [currentRows, selectedLeagueId, selectedCountry, competitions, rowPresentations]);

  const selectedLeagueMeta = countryGroups.flatMap((country) => country.leagues)
    .find((league) => league.id === selectedLeagueId) ?? null;
  const selectedCountryMeta = countryGroups.find((country) => country.name === selectedCountry) ?? null;
  const selectedCompetition = competitions.find((competition) =>
    competitionKeys(competition).some((key) => key.toLowerCase() === selectedLeagueId.toLowerCase()) ||
    text(firstValue(competition, ['leagueId', 'competitionId', 'id', '_id'])) === selectedLeagueId,
  ) ?? null;
  const selectedLeagueLocked = mode !== 'settled' && (
    selectedLeagueMeta?.locked === true ||
    (selectedLeagueMeta ? false : selectedCompetition ? !canAccessLeague(selectedCompetition, plan, policyQuery.data) : false)
  );
  const selectedCountryLocked = mode !== 'settled' && selectedCountryMeta?.locked === true;

  const selectedCategorySlips = useMemo(() => allSlips.filter((slip) => {
    const type = text(firstValue(slip, ['productType']), '').toUpperCase();
    if (selectedSlipCategory === 'ODDS_10' || selectedSlipCategory === 'ODDS_25' || selectedSlipCategory === 'ODDS_50') {
      return type === selectedSlipCategory;
    }
    if (type !== 'SURE_ODDS' && firstValue(slip, ['sureOdds']) !== true) return false;
    const product = text(firstValue(slip, ['sureOddsProduct']), '').toUpperCase();
    if (product) return product === selectedSlipCategory;
    const tier = text(firstValue(slip, ['sureOddsTier']), '').toUpperCase();
    return selectedSlipCategory === 'SURE_2' ? tier === 'VIP' : selectedSlipCategory === 'SURE_5' && tier === 'PREMIUM';
  }), [allSlips, selectedSlipCategory]);
  const activeSelectedSlipId = selectedCategorySlips.some(
    (slip) => text(firstValue(slip, ['_id', 'id', 'slipCode'])) === selectedSlipId,
  )
    ? selectedSlipId
    : text(firstValue(selectedCategorySlips[0] ?? {}, ['_id', 'id', 'slipCode']));
  const currentSlip = allSlips.find((slip) =>
    text(firstValue(slip, ['_id', 'id', 'slipCode'])) === activeSelectedSlipId,
  ) ?? null;
  const slipLegFixtures = useMemo(() => curateSlipLegRows(currentSlip), [currentSlip]);
  const slipHasEstimatedOdds = slipLegFixtures.some((leg) =>
    text(firstValue(leg, ['priceType']), '').toUpperCase() === 'ESTIMATED',
  );

  const selectableEventRows = mode === 'slips' ? slipLegFixtures : visibleRows;
  const activeSelectedEventId = selectableEventRows.some((row) => eventIdOf(row) === selectedEventId)
    ? selectedEventId
    : eventIdOf(selectableEventRows[0] ?? {});

  const slipPresentationRefs = useMemo(() => mode === 'slips'
    ? makePresentationFixtures(slipLegFixtures).map((row) => ({
        eventId: eventIdOf(row), fixtureDate: fixtureDateOf(row),
        leagueId: text(firstValue(row, ['leagueId', 'competitionId']), '') || undefined,
        leagueName: text(firstValue(row, ['leagueName', 'competitionName']), '') || undefined,
        leagueCountry: text(firstValue(row, ['leagueCountry', 'country', 'countryName']), '') || undefined,
        homeTeamId: text(firstValue(row, ['homeTeamId', 'homeId']), '') || undefined,
        awayTeamId: text(firstValue(row, ['awayTeamId', 'awayId']), '') || undefined,
        homeTeamName: text(firstValue(row, ['homeTeamName', 'homeTeam']), '') || undefined,
        awayTeamName: text(firstValue(row, ['awayTeamName', 'awayTeam']), '') || undefined,
        homeTeamLogo: text(firstValue(row, ['homeTeamLogo']), '') || undefined,
        awayTeamLogo: text(firstValue(row, ['awayTeamLogo']), '') || undefined,
        fixtureRecord: row,
        summaryRecord: firstValue(row, ['summary', 'matchSummary']),
      }))
    : [], [mode, slipLegFixtures]);
  const slipPresentations = useMatchPresentation(slipPresentationRefs, undefined, {
    refetchInterval: mode === 'slips' && selectedDate === localDateKey(new Date()) ? 3 * 60_000 : false,
  });
  const presentations = mode === 'slips' ? slipPresentations : rowPresentations;

  const selectedSlipCategoryPlan = getSlipProductRequiredPlan(
    policyQuery.data,
    selectedSlipCategory,
  ) ?? 'premium';
  const selectedSlipCategoryLabel = selectedSlipCategory === 'ODDS_10'
    ? '10 Odds Slips'
    : selectedSlipCategory === 'ODDS_25'
      ? '25 Odds Slips'
      : selectedSlipCategory === 'ODDS_50'
        ? '50 Odds Slips'
        : selectedSlipCategory === 'SURE_2'
          ? '2 Odds Slips'
          : selectedSlipCategory === 'SURE_5'
            ? '5 Odds Slips'
            : '7 Odds Slips';
  const PLAN_RANK: Record<AccessPlan, number> = { anonymous: 0, free: 1, regular: 2, vip: 3, premium: 4 };
  const selectedSlipCategoryLocked = !getSlipProductRequiredPlan(policyQuery.data, selectedSlipCategory) || PLAN_RANK[plan] < PLAN_RANK[selectedSlipCategoryPlan];
  const currentSlipAccess = asRecord(firstValue(currentSlip ?? {}, ['access'])) ?? {};
  const currentSlipLockReason = text(firstValue(currentSlipAccess, ['reason']), '');
  const currentSlipRequiredPlan = text(
    firstValue(currentSlip ?? {}, ['requiredPlan'], firstValue(currentSlipAccess, ['requiredPlan'], selectedSlipCategoryPlan)),
    selectedSlipCategoryPlan,
  ).toLowerCase();
  const currentSlipLockMessage = currentSlipLockReason === 'DAILY_LIMIT'
    ? 'The daily allocation for this slip type has been reached. Choose another available slip or check again later.'
    : currentSlipLockReason === 'PRODUCT_UNAVAILABLE'
      ? 'This slip is not currently available under the published product rules.'
      : lockMessage(plan, selectedSlipCategoryLabel, currentSlipRequiredPlan);
  const currentSlipLocked = Boolean(currentSlip) && (
    currentSlip?.locked === true ||
    firstValue(currentSlip ?? {}, ['accessAllowed']) === false ||
    currentSlipAccess.allowed === false
  );
  const selectedSlipLocked = selectedSlipCategoryLocked || currentSlipLocked;

  const predictionSummary = mode === 'special'
    ? curatedQuery.data?.pages[0]?.leagueSummary
    : mode === 'general'
      ? pickCenterQuery.data?.pages[0]?.leagueSummary
      : null;
  const availableItemCount = mode === 'slips'
    ? selectedCategorySlips.length
    : mode === 'special' || mode === 'general'
      ? selectedLeagueId
        ? selectedLeagueMeta?.count ?? visibleRows.length
        : selectedCountry
          ? selectedCountryMeta?.count ?? visibleRows.length
          : numeric(firstValue(predictionSummary ?? {}, ['totalPredictions']), visibleRows.length)
      : visibleRows.length;
  const hiddenRestrictedCount = mode === 'special'
    ? selectedLeagueId
      ? selectedLeagueMeta?.lockedCount ?? (selectedLeagueMeta?.locked ? selectedLeagueMeta.count : 0)
      : selectedCountry
        ? (selectedCountryMeta?.leagues ?? []).reduce((sum, league) => sum + (league.lockedCount ?? (league.locked ? league.count : 0)), 0)
        : countryGroups.reduce((sum, country) => sum + country.leagues.reduce((leagueSum, league) => leagueSum + (league.lockedCount ?? (league.locked ? league.count : 0)), 0), 0)
    : mode === 'general'
      ? (selectedLeagueId
          ? selectedLeagueMeta?.locked ? selectedLeagueMeta.count : 0
          : selectedCountry
            ? (selectedCountryMeta?.leagues ?? []).reduce((sum, league) => sum + (league.locked ? league.count : 0), 0)
            : countryGroups.reduce((sum, country) => sum + country.leagues.reduce((leagueSum, league) => leagueSum + (league.locked ? league.count : 0), 0), 0))
      : 0;
  const hiddenRequiredPlan = selectedLeagueId
    ? selectedLeagueMeta?.requiredPlan ?? null
    : selectedCountry
      ? selectedCountryMeta?.requiredPlan ?? null
      : null;

  const selectedFixture = useMemo(() => {
    if (!activeSelectedEventId) return null;
    if (mode === 'slips') {
      return slipLegFixtures.find((leg) => eventIdOf(leg) === activeSelectedEventId) ?? null;
    }
    return visibleRows.find((row) => eventIdOf(row) === activeSelectedEventId) ?? null;
  }, [mode, activeSelectedEventId, slipLegFixtures, visibleRows]);
  const selectedPresentation = selectedFixture ? presentations.get(eventIdOf(selectedFixture)) : undefined;
  const statsFixture = mode === 'slips'
    ? slipLegFixtures.find((row) => eventIdOf(row) === statsEventId) ?? null
    : visibleRows.find((row) => eventIdOf(row) === statsEventId) ?? null;
  const statsPresentation = statsFixture ? presentations.get(eventIdOf(statsFixture)) : undefined;

  const isLoading = mode === 'general'
    ? pickCenterQuery.isLoading
    : mode === 'special'
      ? curatedQuery.isLoading
      : mode === 'settled'
        ? settledPickCenterQuery.isLoading
        : regularSlipsQuery.isLoading || sureSlipsQuery.isLoading;
  const isError = mode === 'general'
    ? pickCenterQuery.isError
    : mode === 'special'
      ? curatedQuery.isError
      : mode === 'settled'
        ? settledPickCenterQuery.isError
        : regularSlipsQuery.isError || sureSlipsQuery.isError;
  const retry = () => {
    if (mode === 'general') void pickCenterQuery.refetch();
    else if (mode === 'special') void curatedQuery.refetch();
    else if (mode === 'settled') void settledPickCenterQuery.refetch();
    else void Promise.all([regularSlipsQuery.refetch(), sureSlipsQuery.refetch()]);
  };

  const hasMoreResults = mode === 'general'
    ? Boolean(pickCenterQuery.hasNextPage)
    : mode === 'special'
      ? Boolean(curatedQuery.hasNextPage)
      : mode === 'settled'
        ? Boolean(settledPickCenterQuery.hasNextPage)
        : Boolean(regularSlipsQuery.hasNextPage || sureSlipsQuery.hasNextPage);
  const isLoadingMore = mode === 'general'
    ? pickCenterQuery.isFetchingNextPage
    : mode === 'special'
      ? curatedQuery.isFetchingNextPage
      : mode === 'settled'
        ? settledPickCenterQuery.isFetchingNextPage
        : regularSlipsQuery.isFetchingNextPage || sureSlipsQuery.isFetchingNextPage;

  async function loadMoreResults() {
    if (mode === 'general' && pickCenterQuery.hasNextPage) {
      await pickCenterQuery.fetchNextPage();
    } else if (mode === 'special' && curatedQuery.hasNextPage) {
      await curatedQuery.fetchNextPage();
    } else if (mode === 'settled' && settledPickCenterQuery.hasNextPage) {
      await settledPickCenterQuery.fetchNextPage();
    } else if (mode === 'slips') {
      const pending: Promise<unknown>[] = [];
      if (regularSlipsQuery.hasNextPage) pending.push(regularSlipsQuery.fetchNextPage());
      if (sureSlipsQuery.hasNextPage) pending.push(sureSlipsQuery.fetchNextPage());
      await Promise.all(pending);
    }
  }

  const modeTitle = mode === 'general'
    ? 'General Picks · Pick Center'
    : mode === 'special'
      ? 'Special Picks · Curated Predictions'
      : mode === 'settled'
        ? 'Settled Predictions'
        : 'Published Prediction Slips';
  const selectedLeagueName = selectedLeagueId
    ? countryGroups.flatMap((country) => country.leagues).find((league) => league.id === selectedLeagueId)?.name ?? 'Selected league'
    : selectedCountry || 'All countries and leagues';

  function changeDate(nextDate: string) {
    if (!nextDate || nextDate === selectedDate) return;
    setSelectedDate(nextDate);
    setSelectedCountry('');
    setSelectedLeagueId('');
    setSelectedEventId('');
    setSelectedSlipId('');
    setDetailsPanelOpen(false);
    setStatsEventId('');
    setCountryPanelOpen(false);
    setSlipPanelOpen(false);
  }

  function changeMode(nextMode: PredictionMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setSelectedCountry('');
    setSelectedLeagueId('');
    setSelectedEventId('');
    setSelectedSlipId('');
    setDetailsPanelOpen(false);
    setStatsEventId('');
    setCountryPanelOpen(false);
    setSlipPanelOpen(false);
  }

  function chooseCountry(country: string) {
    setSelectedCountry(country);
    setSelectedLeagueId('');
    setSelectedEventId('');
    setStatsEventId('');
  }

  function chooseLeague(country: string, league: PredictionLeagueItem) {
    setSelectedCountry(country);
    setSelectedLeagueId(league.id);
    setSelectedEventId('');
    setStatsEventId('');
  }

  function chooseAllLeagues() {
    setSelectedCountry('');
    setSelectedLeagueId('');
    setSelectedEventId('');
    setStatsEventId('');
  }

  function selectSlip(slip: ApiRecord) {
    const id = text(firstValue(slip, ['_id', 'id', 'slipCode']));
    setSelectedSlipId(id);
    const firstLeg = rowsFrom(slip.legs, ['items', 'legs'])[0];
    setSelectedEventId(firstLeg ? eventIdOf(firstLeg) : '');
  }

  const selectedFixtureSelections = selectedFixture
    ? mode === 'slips'
      ? slipLegFixtures
          .filter((leg) => eventIdOf(leg) === selectedEventId)
          .map((leg) => ({
            ...leg,
            settlementStatus: firstValue(leg, ['settlementOutcome', 'settlementStatus'], 'PENDING'),
          }))
      : selectionRows(selectedFixture, mode)
    : [];

  return (
    <>
    <main className="mx-auto w-full max-w-[1800px] px-2.5 pb-20 sm:px-4 xl:pb-4 2xl:px-5">
      <PredictionsDateBar
        selectedDate={selectedDate}
        onDateChange={changeDate}
        mode={mode}
        onModeChange={changeMode}
      />

      <div className="grid min-w-0 items-start gap-0.5 xl:grid-cols-[208px_minmax(0,1fr)_278px] 2xl:grid-cols-[218px_minmax(0,1fr)_298px]">
        {mode === 'slips' ? (
          <PredictionSlipSelector
            slips={allSlips}
            plan={plan}
            policy={policyQuery.data}
            selectedCategory={selectedSlipCategory}
            selectedSlipId={activeSelectedSlipId}
            mobileOpen={slipPanelOpen}
            hasMore={hasMoreResults}
            loadingMore={isLoadingMore}
            onLoadMore={() => void loadMoreResults()}
            onSelectCategory={(category) => {
              setSelectedSlipCategory(category);
              setSelectedSlipId('');
              setSelectedEventId('');
            }}
            onSelectSlip={selectSlip}
            onCloseMobile={() => setSlipPanelOpen(false)}
          />
        ) : (
          <PredictionCountryLeaguePanel
            countries={countryGroups}
            selectedCountry={selectedCountry}
            selectedLeagueId={selectedLeagueId}
            mobileOpen={countryPanelOpen}
            onSelectCountry={chooseCountry}
            onSelectAll={chooseAllLeagues}
            onSelectLeague={chooseLeague}
            onCloseMobile={() => setCountryPanelOpen(false)}
          />
        )}

        <section className="flex min-w-0 flex-col rounded-lg border border-border/75 bg-card/85 shadow-[0_5px_18px_rgba(0,0,0,0.055)] backdrop-blur-xl">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-2 py-1.5 xl:hidden">
            <div className="flex min-w-0 items-center gap-1.5">
              {mode === 'slips' ? (
                <button
                  type="button"
                  onClick={() => setSlipPanelOpen(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background/70 px-2.5 text-[10px] font-semibold"
                >
                  <FaTicketSimple className="h-3 w-3 text-primary" /> Slip types
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCountryPanelOpen(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background/70 px-2.5 text-[10px] font-semibold"
                  >
                    <FaGlobe className="h-3 w-3 text-primary" /> Countries
                  </button>
                  <button
                    type="button"
                    aria-pressed={false}
                    onClick={() => changeMode('slips')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background/70 px-2.5 text-[10px] font-semibold transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <FaTicketSimple className="h-3 w-3 text-primary" /> Slips
                  </button>
                </>
              )}
            </div>
            <span className="max-w-[42%] truncate text-[9px] font-medium text-muted-foreground">
              {mode === 'slips' ? currentSlip ? (selectedSlipLocked ? 'Locked slip' : text(firstValue(currentSlip, ['name', 'slipCode']), 'Selected slip')) : 'Choose a slip' : selectedLeagueName}
            </span>
          </div>

          {mode === 'general' || mode === 'special' || mode === 'settled' ? (
            <div className="sticky top-[58px] z-20 shrink-0 border-b border-border/60 bg-card/95 shadow-[0_4px_12px_rgba(0,0,0,0.035)] backdrop-blur-xl">
              <MarketSelector
                markets={marketCatalog}
                activeMarketCode={activeMarketCode}
                loading={isLoading || policyQuery.isLoading}
                emptyMessage={policyQuery.isError
                  ? 'Prediction access rules are unavailable. Try again shortly.'
                  : isError
                    ? 'Prediction markets are unavailable. Try again shortly.'
                    : 'No markets are available under this plan.'}
                onSelect={(code) => setSelectedMarketCode(code.toUpperCase())}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 border-b border-border/55 px-2 py-0.5">
            <div className="min-w-0">
              <h1 className="truncate text-[10px] font-extrabold tracking-tight sm:text-[11px]">{modeTitle}</h1>
              <p className="mt-0.5 truncate text-[7px] text-muted-foreground">
                {mode === 'slips'
                  ? currentSlip ? (selectedSlipLocked ? 'Locked slip' : text(firstValue(currentSlip, ['name', 'slipCode']), 'Selected slip')) : 'Browse published slips by product type'
                  : mode === 'settled'
                    ? `${selectedLeagueName} · settled ${currentMarketName}`
                    : `${selectedLeagueName} · ${currentMarketName}`}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[8px] font-semibold tabular-nums text-muted-foreground">
              {availableItemCount} {mode === 'slips' ? 'slips' : mode === 'special' ? 'available picks' : 'matches'}
            </span>
          </div>

          <div className="min-h-[160px]">
            {isLoading ? (
              <div className="space-y-1 p-1">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-lg bg-muted/60" />
                ))}
              </div>
            ) : isError ? (
              <div className="m-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3 text-center">
                <p className="text-[10px] font-bold">Predictions could not be loaded</p>
                <p className="mt-1 text-[8px] leading-4 text-muted-foreground">The prediction service did not return this date&apos;s data.</p>
                <button type="button" onClick={retry} className="mt-2 h-7 rounded-md bg-primary px-3 text-[8px] font-bold text-primary-foreground">Retry</button>
              </div>
            ) : mode === 'slips' ? (
              selectedCategorySlips.length > 0 && selectedSlipLocked ? (
                <div className="space-y-2 p-3">
                  <div className="rounded-md border border-border/70 bg-background/60 px-2.5 py-2">
                    <p className="text-[9px] font-bold">{selectedSlipCategoryLabel} are available</p>
                    <p className="mt-0.5 text-[8px] text-muted-foreground">{selectedCategorySlips.length} published {selectedCategorySlips.length === 1 ? 'slip' : 'slips'} in this category. The selections remain hidden until your plan has access.</p>
                  </div>
                  <LockedPanel
                    title="This slip is locked"
                    message={currentSlipLockMessage}
                  />
                </div>
              ) : !currentSlip ? (
                <div className="px-3 py-7 text-center">
                  <FaTicketSimple className="mx-auto h-5 w-5 text-muted-foreground/50" />
                  <p className="mt-1 text-[10px] font-bold">No published slips for this date</p>
                  <p className="mt-1 text-[9px] leading-4 text-muted-foreground">Choose another slip type or date to view published predictions.</p>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  <div className="rounded-lg border border-primary/20 bg-primary/[0.045] p-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-primary">
                          {selectedSlipCategory.replace('ODDS_', '').replace('SURE_', '')} Odds Slip
                        </p>
                        <h2 className="mt-0.5 text-[11px] font-extrabold">{text(firstValue(currentSlip, ['name', 'slipCode']), 'Published slip')}</h2>
                        <p className="mt-0.5 text-[8px] text-muted-foreground">{text(firstValue(currentSlip, ['slipCode']), '')} · {numeric(firstValue(currentSlip, ['legCount']), slipLegFixtures.length)} selections</p>
                      </div>
                      <div className="rounded-md border border-primary/15 bg-card px-2 py-1.5 text-right">
                        <span className="block text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">{slipHasEstimatedOdds ? 'Estimated combined odds' : 'Combined odds'}</span>
                        <strong title={slipHasEstimatedOdds ? 'At least one slip leg uses a Grivit estimate, not a bookmaker offer.' : 'Product of the stored slip-leg decimal prices.'} className="text-sm font-black tabular-nums text-sky-700 dark:text-sky-300">
                          {numeric(firstValue(currentSlip, ['combinedOdds', 'odds']), 0) > 0 ? `${slipHasEstimatedOdds ? '~' : ''}${numeric(firstValue(currentSlip, ['combinedOdds', 'odds']), 0).toFixed(2)}` : '—'}
                        </strong>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-primary/10 pt-2">
                      <div>
                        <span className="block text-[8px] text-muted-foreground">Probability</span>
                        <strong className={`text-[10px] font-extrabold ${predictionValueTone(numeric(firstValue(currentSlip, ['combinedProbability']), 0) * 100, 'probability')}`}>
                          {numeric(firstValue(currentSlip, ['combinedProbability']), 0) > 0 ? `${Math.round(numeric(firstValue(currentSlip, ['combinedProbability']), 0) * 100)}%` : '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-muted-foreground">Confidence</span>
                        <strong className={`text-[10px] font-extrabold ${predictionValueTone(numeric(firstValue(currentSlip, ['generalConfidence', 'averageConfidence']), 0), 'confidence')}`}>
                          {numeric(firstValue(currentSlip, ['generalConfidence', 'averageConfidence']), 0) > 0 ? `${Math.round(numeric(firstValue(currentSlip, ['generalConfidence', 'averageConfidence']), 0))}%` : '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-muted-foreground">Settlement</span>
                        <strong className={`inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold ${settlementValueTone(firstValue(currentSlip, ['settlementStatus'], 'PENDING'))}`}>
                          {text(firstValue(currentSlip, ['settlementStatus']), 'PENDING').replaceAll('_', ' ')}
                        </strong>
                      </div>
                    </div>
                  </div>
                  {slipLegFixtures.map((leg, index) => {
                    const eventId = eventIdOf(leg);
                    const selection = {
                      selectionKey: firstValue(leg, ['selectionKey']),
                      selectionName: firstValue(leg, ['selectionName']),
                      decimalOdds: firstValue(leg, ['decimalOdds']),
                      bookmakerOdds: firstValue(leg, ['bookmakerOdds']),
                      priceType: firstValue(leg, ['priceType']),
                      probability: firstValue(leg, ['probability']),
                      confidence: firstValue(leg, ['confidence']),
                      actualOutcome: firstValue(leg, ['settlementOutcome']),
                    } as ApiRecord;
                    return (
                      <PredictionMatchCard
                        key={`${eventId}-${index}`}
                        fixture={leg}
                        selections={[selection]}
                        selectedMarketName={text(firstValue(leg, ['marketName']), 'Slip selection')}
                        presentation={presentations.get(eventId)}
                        selected={activeSelectedEventId === eventId}
                        onSelect={setSelectedEventId}
                        onOpenStats={setStatsEventId}
                        onInspectMarkets={(id) => {
                          setSelectedEventId(id);
                          setDetailsPanelOpen(true);
                        }}
                      />
                    );
                  })}
                  {hasMoreResults ? (
                    <button
                      type="button"
                      onClick={() => void loadMoreResults()}
                      disabled={isLoadingMore}
                      className="mx-auto flex h-8 min-w-40 items-center justify-center rounded-md border border-border bg-background px-3 text-[9px] font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60"
                    >
                      {isLoadingMore ? 'Loading more slips…' : 'Load more published slips'}
                    </button>
                  ) : null}
                </div>
              )
            ) : (selectedLeagueLocked || selectedCountryLocked) && !visibleRows.length ? (
              <div className="p-3">
                <LockedPanel
                  title={selectedLeagueId ? 'This competition is locked' : 'These competitions are locked'}
                  message={lockMessage(
                    plan,
                    selectedLeagueId
                      ? text(firstValue(selectedCompetition ?? {}, ['name', 'leagueName']), selectedLeagueName)
                      : selectedCountry || 'The selected group',
                    selectedLeagueMeta?.requiredPlan ?? selectedCountryMeta?.requiredPlan,
                  )}
                />
              </div>
            ) : visibleRows.length ? (
              <div className="space-y-1 p-1">
                {(mode === 'special' || mode === 'general') && hiddenRestrictedCount > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-2 py-1.5 text-[8px] font-semibold text-amber-700 dark:text-amber-300">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <FaLock className="h-2.5 w-2.5 shrink-0" />
                      {hiddenRestrictedCount} available {hiddenRestrictedCount === 1 ? 'pick is' : 'picks are'} locked on your current plan. Their selections are hidden.
                    </span>
                    <a href="/pricing" className="shrink-0 font-extrabold underline underline-offset-2">
                      {hiddenRequiredPlan ? `Upgrade to ${hiddenRequiredPlan.toUpperCase()}` : 'Upgrade to unlock'}
                    </a>
                  </div>
                ) : null}
                {visibleRows.map((fixture, index) => {
                  const eventId = eventIdOf(fixture);
                  const allFixtureSelections = selectionRows(fixture, mode);
                  const selectedEngineMarketKeys = predictionMarketKeysForCatalogCode(activeMarketCode, marketCatalog);
                  const selections = allFixtureSelections.filter((selection) =>
                    selectedEngineMarketKeys.includes(marketKeyOf(selection)),
                  );
                  return (
                    <PredictionMatchCard
                      key={eventId || String(index)}
                      fixture={fixture}
                      selections={selections}
                      selectedMarketName={currentMarketName}
                      presentation={presentations.get(eventId)}
                      selected={activeSelectedEventId === eventId}
                      onSelect={setSelectedEventId}
                      onOpenStats={setStatsEventId}
                      onInspectMarkets={(id) => {
                        setSelectedEventId(id);
                        setDetailsPanelOpen(true);
                      }}
                    />
                  );
                })}
                {hasMoreResults ? (
                  <button
                    type="button"
                    onClick={() => void loadMoreResults()}
                    disabled={isLoadingMore}
                    className="mx-auto flex h-8 min-w-40 items-center justify-center rounded-md border border-border bg-background px-3 text-[9px] font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoadingMore ? 'Loading more predictions…' : 'Load more predictions'}
                  </button>
                ) : null}
              </div>
            ) : (mode === 'special' || mode === 'general') && availableItemCount > 0 ? (
              <div className="space-y-2 p-3">
                <p className="text-center text-[9px] font-semibold text-muted-foreground">
                  {availableItemCount} predictions are published for this date, but their selections are restricted by your current plan.
                </p>
                <LockedPanel
                  title={mode === 'special' ? 'Special Picks are locked' : 'Pick Center access is restricted'}
                  message={lockMessage(plan, mode === 'special' ? 'Special Picks' : 'Some Pick Center competitions')}
                />
              </div>
            ) : (
              <div className="px-3 py-7 text-center">
                <FaGlobe className="mx-auto h-5 w-5 text-muted-foreground/45" />
                <p className="mt-1 text-[10px] font-bold">No predictions available</p>
                <p className="mx-auto mt-0.5 max-w-xs text-[9px] leading-4 text-muted-foreground">
                  {mode === 'general'
                    ? 'There are no Pick Center matches published for this date and competition.'
                    : mode === 'special'
                      ? 'There are no curated predictions published for this date and competition.'
                      : 'There are no settled predictions for this date and competition.'}
                </p>
              </div>
            )}
          </div>
        </section>

        <PredictionMarketDetailsPanel
          fixture={selectedFixture}
          selections={selectedFixtureSelections}
          presentation={selectedPresentation}
          mobileOpen={detailsPanelOpen}
          onCloseMobile={() => setDetailsPanelOpen(false)}
        />
      </div>
    </main>
    {statsFixture ? (
      <FixtureStatsDialog
        key={statsEventId}
        open
        fixture={statsFixture}
        presentation={statsPresentation}
        onClose={() => setStatsEventId('')}
      />
    ) : null}
    </>
  );
}






