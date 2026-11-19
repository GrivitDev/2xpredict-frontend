'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FaLock } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import {
  useGetFixturesQuery,
  useGetMarketCatalogQuery,
  usePlaceAccumulatorMutation,
  usePlaceSingleTicketMutation,
} from '@/hooks/use-bet-lab';
import { useGetWalletQuery } from '@/hooks/use-bet-lab-wallet';
import {
  useGetV2CompetitionsQuery,
  useGetV2FixturesInfiniteQuery,
} from '@/hooks/use-sports';
import { sportsV2CompetitionToApiRecord, sportsV2FixtureToApiRecord } from '@/lib/sports-v2-adapter';
import { useMatchPresentation } from '@/hooks/use-match-presentation';
import {
  asRecord,
  errorMessage,
  firstValue,
  makeIdempotencyKey,
  numeric,
  text,
  unwrapRecord,
  type ApiRecord,
} from '@/lib/api-shapes';
import type { BetLabMarketCode } from '@/types/bet-lab';
import BetLabAccessModal from './BetLabAccessModal';
import useBetLabScrollLock from './use-bet-lab-scroll-lock';
import BetLabDateBar from './BetLabDateBar';
import BetSlipPanel from './BetSlipPanel';
import { findBetLabSelectionCompatibilityError } from './bet-lab-selection-compatibility';
import { calculateBetLabCombinedOdds } from './bet-lab-pricing';
import CountryLeaguePanel from './CountryLeaguePanel';
import FixturesMarketPanel from './FixturesMarketPanel';
import {
  arrayFrom,
  competitionKeys,
  countryNameOf,
  eventIdOf,
  fixtureDateOf,
  fixtureLeagueIdOf,
  isCompetitionOpen,
  isVisibleFixture,
  localDateKey,
  localDayRange,
  logoUrlOf,
  fixtureLeagueLogoSources,
  type CountryGroup,
  type LeagueGroup,
  type TicketPick,
} from './bet-lab.utils';

function usableLeagueName(value: unknown, ids: string[]): string | null {
  const name = text(value);
  if (!name) return null;
  const normalized = name.toLowerCase().replace(/[_-]+/g, ' ').trim();
  if (['other', 'other competition', 'other competitions', 'unknown', 'unknown competition', 'football competition'].includes(normalized)) return null;
  if (ids.some((id) => id.toLowerCase() === normalized)) return null;
  if (/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(name)) return null;
  return name;
}

const COUNTRY_METADATA_KEYS = [
  'leagueCountry', 'leagueCountryName', 'country', 'countryName', 'country_name', 'countryCode', 'country_code', 'nation', 'nationName',
  'area', 'areaName', 'countryInfo', 'countryMetadata', 'nationalAssociation',
];

function metadataCountryCandidates(source: ApiRecord): unknown[] {
  return COUNTRY_METADATA_KEYS.map((key) => source[key]).filter((value) => value !== undefined && value !== null && value !== '');
}

function isInternationalCompetition(
  competition: ApiRecord,
  league: ApiRecord,
  fixture: ApiRecord,
  leagueName: string,
  countryValues: unknown[],
  leagueLogoUrl?: string | null,
): boolean {
  const internationalFlags = [
    competition.isInternational, competition.international, competition.isGlobal,
    league.isInternational, league.international, fixture.isInternational,
  ];
  if (internationalFlags.some((value) => value === true || String(value).toLowerCase() === 'true')) return true;

  const payloadMarkers = [
    ...['confederation', 'confederationName', 'federation', 'federationName', 'scope', 'competitionScope', 'competitionType', 'level', 'type', 'category']
      .flatMap((key) => [competition[key], league[key], fixture[key]]),
    ...countryValues,
    leagueName,
    leagueLogoUrl,
  ].map((value) => {
    if (value && typeof value === 'object') {
      const record = asRecord(value) ?? {};
      return text(firstValue(record, ['name', 'displayName', 'code', 'value']));
    }
    return text(value);
  }).join(' ').toUpperCase();

  return /\b(UEFA|CAF|CONMEBOL|CONCACAF|AFC|OFC|FIFA|INTERNATIONAL|GLOBAL|WORLD)\b/.test(payloadMarkers)
    || /(?:uefa|caf|conmebol|concacaf|\bafc\b|\bofc\b|fifa)/i.test(leagueLogoUrl ?? '');
}

export default function BetLabApp() {
  const { token, user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const globalEventId = searchParams.get('eventId') ?? '';
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(globalEventId);
  const [activeMarketCode, setActiveMarketCode] = useState('');
  const [stake, setStake] = useState('100');
  const [picks, setPicks] = useState<TicketPick[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [showAccessPrompt, setShowAccessPrompt] = useState(false);
  const [mobileCountryOpen, setMobileCountryOpen] = useState(false);
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);

  useBetLabScrollLock(showVerificationPrompt);

  const authenticated = Boolean(token || user);
  const today = localDateKey(new Date());
  const dateRange = useMemo(() => localDayRange(selectedDate), [selectedDate]);
  const userContext = asRecord(user) ?? {};
  const subscriptionContext = asRecord(firstValue(userContext, ['subscription', 'currentSubscription'])) ?? {};

  // Account verification and plan access come from the already-hydrated auth session.
  // There is no /auth/me or subscription-status request on the Bet Lab landing page.
  const verified = firstValue(
    userContext,
    ['isVerified', 'emailVerified', 'isEmailVerified'],
    false,
  ) === true;
  const plan = text(
    firstValue(
      userContext,
      ['subscriptionPlan', 'plan', 'membershipPlan', 'currentPlan'],
      firstValue(subscriptionContext, ['plan', 'name', 'type'], 'free'),
    ),
    'free',
  ).toLowerCase();
  const normalizedPlan = ['regular', 'vip', 'premium'].includes(plan) ? plan : 'free';

  // Sports fixture reads are shared by visitors and signed-in users. In addition
  // to the guest fixture list, authenticated Bet Lab rows use these records to
  // resolve team/league logos and ESPN presentation metadata.
  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: true, limit: 1000 } },
    {
      staleTime: 30 * 60_000,
      gcTime: 60 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
  const authenticatedFixturesQuery = useGetFixturesQuery<unknown>(
    { query: { from: dateRange.from, to: dateRange.to, page: 1, limit: 100 } },
    {
      enabled: !authLoading && authenticated,
      staleTime: 60_000,
      gcTime: 15 * 60_000,
      refetchInterval: 90_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
  // Guests use one normalized Sports v2 fixture read for the selected day.
  // The response includes scheduled/live/final states; the existing visibility
  // adapter keeps the same public Bet Lab display rules without legacy feeds.
  const publicFixturesQuery = useGetV2FixturesInfiniteQuery(
    { query: { from: dateRange.from, to: dateRange.to, limit: 500 } },
    {
      enabled: !authLoading && !authenticated,
      staleTime: selectedDate === today ? 20_000 : 90_000,
      gcTime: 15 * 60_000,
      refetchInterval: selectedDate === today ? 30_000 : 120_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  // The protected catalogue is loaded only for signed-in sessions. Visitors see
  // a display-only market preview; no protected odds or betting endpoints are called.
  const marketCatalogQuery = useGetMarketCatalogQuery<unknown>({
    enabled: !authLoading && authenticated,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Wallet data is fetched only after the signed-in user starts building a ticket.
  const walletQuery = useGetWalletQuery<unknown>({
    enabled: !authLoading && authenticated && picks.length > 0,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const singleTicket = usePlaceSingleTicketMutation();
  const accumulator = usePlaceAccumulatorMutation();

  const rawBetLabFixtures = useMemo(
    () => arrayFrom(authenticatedFixturesQuery.data, ['items', 'fixtures', 'results', 'data']),
    [authenticatedFixturesQuery.data],
  );
  const competitionRows = useMemo(
    () => (competitionsQuery.data ?? []).map(sportsV2CompetitionToApiRecord),
    [competitionsQuery.data],
  );
  const competitionByLeagueId = useMemo(() => {
    const map = new Map<string, ApiRecord>();
    for (const competition of competitionRows) {
      for (const key of competitionKeys(competition)) {
        if (!map.has(key.toLowerCase())) map.set(key.toLowerCase(), competition);
      }
    }
    return map;
  }, [competitionRows]);
  // The backend cursor contract returns fixtures newest-first and the current
  // controller does not expose sortOrder. Sort the accumulated pages locally so
  // Bet Lab presents kickoff times chronologically without changing cursor order.
  const normalizedPublicFixtureRows = useMemo(() => {
    const rows = publicFixturesQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return [...rows].sort((left, right) => {
      const leftTime = Date.parse(left.kickoffAt);
      const rightTime = Date.parse(right.kickoffAt);
      const leftValid = Number.isFinite(leftTime);
      const rightValid = Number.isFinite(rightTime);
      if (leftValid && rightValid && leftTime !== rightTime) return leftTime - rightTime;
      if (leftValid !== rightValid) return leftValid ? -1 : 1;
      return left.id.localeCompare(right.id);
    });
  }, [publicFixturesQuery.data?.pages]);
  const rawPublicFixtures = useMemo(
    () => normalizedPublicFixtureRows.map((fixture) => {
      const competition = [fixture.competitionId, fixture.espnCompetitionId]
        .map((id) => id ? competitionByLeagueId.get(id.toLowerCase()) : undefined)
        .find((item): item is ApiRecord => Boolean(item));
      const normalizedCompetition = competition
        ? (competitionsQuery.data ?? []).find((item) =>
            item.id.toLowerCase() === String(competition.id ?? '').toLowerCase()
            || item.espnId.toLowerCase() === String(competition.espnId ?? '').toLowerCase(),
          )
        : undefined;
      return sportsV2FixtureToApiRecord(fixture, normalizedCompetition);
    }),
    [normalizedPublicFixtureRows, competitionByLeagueId, competitionsQuery.data],
  );
  const rawFixtures = authenticated ? rawBetLabFixtures : rawPublicFixtures;

  const presentationRefs = useMemo(
    () => rawFixtures.map((item) => ({ eventId: eventIdOf(item), fixtureDate: fixtureDateOf(item) })),
    [rawFixtures],
  );
  // Bet Lab keeps its own fixture contract for eligibility and ticket placement;
  // presentation metadata is now resolved through normalized Sports v2 reads.
  const presentations = useMatchPresentation(
    presentationRefs,
    !authenticated
      ? { fixtures: normalizedPublicFixtureRows, competitions: competitionsQuery.data ?? [] }
      : undefined,
  );

  const visibleFixtures = useMemo(
    () => rawFixtures.filter((item) => isVisibleFixture(item, presentations.get(eventIdOf(item)))),
    [rawFixtures, presentations],
  );

  const countryGroups = useMemo<CountryGroup[]>(() => {
    const groups = new Map<string, {
      group: CountryGroup;
      leagues: Map<string, LeagueGroup>;
    }>();

    for (const fixture of visibleFixtures) {
      const eventId = eventIdOf(fixture);
      const presentation = presentations.get(eventId);
      const fixtureLeague = asRecord(firstValue(fixture, ['league', 'competition', 'competitionInfo', 'leagueInfo'])) ?? {};
      const ids = [
        fixtureLeagueIdOf(fixture, presentation),
        text(presentation?.leagueId),
        text(firstValue(fixture, ['leagueId', 'competitionId', 'league_id', 'competition_id'])),
        text(firstValue(fixtureLeague, ['leagueId', 'competitionId', 'id', 'uid', 'slug', 'code'])),
      ].filter(Boolean);

      const competition = ids
        .map((id) => competitionByLeagueId.get(id.toLowerCase()))
        .find((item): item is ApiRecord => Boolean(item));
      const competitionRecord = competition ?? {};

      // Prefer the name extracted from the fixture's ESPN/provider payload.
      // Generic placeholders are discarded so they never mask a real league title.
      const payload = asRecord(firstValue(fixture, ['payload', 'espnPayload', 'espn', 'fixturePayload'])) ?? {};
      const summary = asRecord(firstValue(payload, ['summary'])) ?? {};
      const header = asRecord(firstValue(payload, ['header'])) ?? asRecord(firstValue(summary, ['header'])) ?? {};
      const headerCompetitions = arrayFrom(firstValue(header, ['competitions']), ['items', 'competitions']);
      const payloadCompetitions = arrayFrom(firstValue(payload, ['competitions']), ['items', 'competitions']);
      const payloadCompetition = payloadCompetitions[0] ?? headerCompetitions[0] ?? {};

      const nameCandidates = [
        presentation?.leagueName,
        firstValue(competitionRecord, ['displayName', 'leagueName', 'fullName', 'name', 'shortDisplayName', 'shortName', 'title', 'competitionName']),
        firstValue(fixtureLeague, ['displayName', 'leagueName', 'fullName', 'name', 'shortDisplayName', 'shortName', 'title', 'competitionName']),
        firstValue(payloadCompetition, ['displayName', 'leagueName', 'fullName', 'name', 'shortDisplayName', 'shortName', 'title', 'competitionName']),
        firstValue(fixture, ['leagueDisplayName', 'competitionDisplayName', 'leagueName', 'competitionName', 'displayCompetitionName', 'leagueTitle']),
      ];
      const leagueName = nameCandidates
        .map((value) => usableLeagueName(value, ids))
        .find((value): value is string => Boolean(value));

      const leagueId = ids[0] || (leagueName
        ? leagueName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : `event-${eventId}`);
      const displayLeagueName = leagueName ?? `Competition ${leagueId}`;
      const priority = text(firstValue(competitionRecord, ['priority']), text(fixture.priority, 'UNKNOWN')).toUpperCase();

      // Resolve the real country from explicit competition/provider payload fields.
      // The region enum is deliberately not used as a country/category fallback.
      const leagueLogo = logoUrlOf([
        fixtureLeagueLogoSources(fixture, presentation),
        firstValue(competitionRecord, ['leagueLogo', 'logo', 'logos', 'emblem', 'crest', 'badge']),
        firstValue(fixtureLeague, ['leagueLogo', 'logo', 'logos', 'emblem', 'crest', 'badge']),
        firstValue(payloadCompetition, ['leagueLogo', 'logo', 'logos', 'emblem', 'crest', 'badge']),
        firstValue(fixture, ['leagueLogo', 'competitionLogo', 'leagueBadge']),
      ]);

      const countryValues = [
        presentation?.leagueCountry,
        ...metadataCountryCandidates(competitionRecord),
        ...metadataCountryCandidates(fixtureLeague),
        ...metadataCountryCandidates(fixture),
        ...metadataCountryCandidates(asRecord(firstValue(payload, ['league'])) ?? {}),
        ...metadataCountryCandidates(asRecord(firstValue(payload, ['competition'])) ?? {}),
        ...metadataCountryCandidates(asRecord(firstValue(header, ['league'])) ?? {}),
        ...metadataCountryCandidates(asRecord(firstValue(header, ['competition'])) ?? {}),
        ...metadataCountryCandidates(payloadCompetition),
        ...metadataCountryCandidates(asRecord(firstValue(summary, ['league'])) ?? {}),
      ];
      const actualCountry = countryValues
        .map((value) => countryNameOf(value))
        .find((value): value is string => Boolean(value));
      const international = !actualCountry && isInternationalCompetition(
        competitionRecord,
        fixtureLeague,
        fixture,
        displayLeagueName,
        countryValues,
        leagueLogo,
      );
      const countryName = actualCountry ?? (international ? 'International competitions' : 'Country unavailable');
      const countryKey = `country:${countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}`;

      let entry = groups.get(countryKey);
      if (!entry) {
        entry = {
          group: {
            key: countryKey,
            name: countryName,
            leagues: [],
            matchCount: 0,
          },
          leagues: new Map<string, LeagueGroup>(),
        };
        groups.set(countryKey, entry);
      }

      const leagueKey = leagueId.toLowerCase();
      const existingLeague = entry.leagues.get(leagueKey);
      if (existingLeague) {
        existingLeague.fixtures.push(fixture);
        if (!existingLeague.logo && leagueLogo) existingLeague.logo = leagueLogo;
        if (existingLeague.name.startsWith('Competition ') && leagueName) existingLeague.name = leagueName;
      } else {
        entry.leagues.set(leagueKey, {
          id: leagueId,
          name: displayLeagueName,
          priority,
          country: countryName,
          logo: leagueLogo,
          isOpen: authenticated && isCompetitionOpen(priority, normalizedPlan),
          fixtures: [fixture],
        });
      }

      entry.group.matchCount += 1;
    }

    return [...groups.values()]
      .map(({ group, leagues }) => ({
        ...group,
        leagues: [...leagues.values()].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => {
        const rank = (name: string) => name === 'International competitions' ? 0 : name === 'Country unavailable' ? 2 : 1;
        return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
      });
  }, [visibleFixtures, competitionByLeagueId, presentations, normalizedPlan, authenticated]);

  const displayFixtures = useMemo(() => {
    let filteredFixtures: ApiRecord[];
    const allLeagues = countryGroups.flatMap((country) => country.leagues);

    if (selectedLeagueId) {
      filteredFixtures = allLeagues.find((league) => league.id === selectedLeagueId)?.fixtures ?? [];
    } else if (selectedCountryName) {
      const selectedCountry = countryGroups.find((country) => country.key === selectedCountryName);
      filteredFixtures = selectedCountry?.leagues.flatMap((league) => league.fixtures) ?? [];
    } else {
      filteredFixtures = visibleFixtures;
    }

    return [...filteredFixtures].sort((first, second) => {
      const firstKickoff = new Date(fixtureDateOf(first)).getTime();
      const secondKickoff = new Date(fixtureDateOf(second)).getTime();
      if (!Number.isFinite(firstKickoff) && !Number.isFinite(secondKickoff)) return 0;
      if (!Number.isFinite(firstKickoff)) return 1;
      if (!Number.isFinite(secondKickoff)) return -1;
      return firstKickoff - secondKickoff;
    });
  }, [countryGroups, selectedLeagueId, selectedCountryName, visibleFixtures]);

  const authenticatedMarketRows = useMemo(
    () => arrayFrom(marketCatalogQuery.data, ['items', 'markets', 'catalog', 'data']),
    [marketCatalogQuery.data],
  );
  const marketCatalogRows = authenticatedMarketRows;

  const combinedOdds = useMemo(
    () => calculateBetLabCombinedOdds(picks),
    [picks],
  );
  const stakeAmount = Math.floor(Number(stake));
  const potentialReturn = picks.length && Number.isSafeInteger(stakeAmount) && stakeAmount > 0
    ? Math.round(stakeAmount * combinedOdds)
    : 0;
  const isPlacing = singleTicket.isPending || accumulator.isPending;
  const selectedCountryLabel = selectedLeagueId
    ? countryGroups.flatMap((country) => country.leagues)
        .find((league) => league.id === selectedLeagueId)?.name ?? 'Selected league'
    : countryGroups.find((country) => country.key === selectedCountryName)?.name
      ?? 'All countries and leagues';

  const fixturesLoadingForDate = () => authenticated
    ? authenticatedFixturesQuery.isLoading
    : publicFixturesQuery.isLoading;

  useEffect(() => {
    if (globalEventId) setSelectedEventId(globalEventId);
  }, [globalEventId]);

  useEffect(() => {
    if (fixturesLoadingForDate()) return;
    if (!displayFixtures.length) {
      setSelectedEventId('');
      return;
    }
    const selectedStillVisible = displayFixtures.some((fixture) => eventIdOf(fixture) === selectedEventId);
    if (!selectedEventId || !selectedStillVisible) setSelectedEventId(eventIdOf(displayFixtures[0]));
  }, [displayFixtures, selectedEventId, authenticatedFixturesQuery.isLoading, publicFixturesQuery.isLoading, authenticated, selectedDate, today]);

  useEffect(() => {
    if (!marketCatalogRows.length) return;
    const hasActiveMarket = marketCatalogRows.some((market) => text(firstValue(market, ['code', 'marketCode'])) === activeMarketCode);
    if (hasActiveMarket) return;
    const defaultMarket = marketCatalogRows.find((market) => {
      const identity = `${text(firstValue(market, ['code', 'marketCode']))} ${text(firstValue(market, ['fullName', 'marketName', 'name']))}`.toLowerCase();
      return /1x2|match result|full time result|three way|match winner/.test(identity);
    }) ?? marketCatalogRows[0];
    setActiveMarketCode(text(firstValue(defaultMarket, ['code', 'marketCode'])));
  }, [marketCatalogRows, activeMarketCode]);

  function changeDate(nextDate: string) {
    if (!nextDate || nextDate === selectedDate) return;
    setSelectedDate(nextDate);
    setSelectedCountryName('');
    setSelectedLeagueId('');
    setSelectedEventId('');
    setNotice('');
    setError('');
  }

  function chooseCountry(countryName: string) {
    setSelectedCountryName(countryName);
    setSelectedLeagueId('');
    setSelectedEventId('');
    setNotice('');
  }

  function chooseAllLeagues() {
    setSelectedCountryName('');
    setSelectedLeagueId('');
    setSelectedEventId('');
    setNotice('');
  }

  function chooseLeague(countryName: string, league: LeagueGroup) {
    setNotice('');
    if (!authenticated) {
      setShowAccessPrompt(true);
      return;
    }
    if (!league.isOpen) {
      setNotice(`${league.name} is locked on the Free plan. Regular, VIP and Premium plans unlock every available league.`);
      return;
    }
    setSelectedCountryName(countryName);
    setSelectedLeagueId(league.id);
    setSelectedEventId('');
  }

  function addPick(pick: TicketPick) {
    if (!authenticated) {
      setShowAccessPrompt(true);
      return;
    }
    setError('');
    setSuccess('');

    const existing = picks.some((item) =>
      item.eventId === pick.eventId
      && item.marketCode === pick.marketCode
      && item.selectionCode === pick.selectionCode,
    );

    if (existing) {
      setPicks((current) => current.filter((item) => !(
        item.eventId === pick.eventId
        && item.marketCode === pick.marketCode
        && item.selectionCode === pick.selectionCode
      )));
      setNotice(`${pick.selectionName} removed from your slip.`);
      return;
    }

    const fixturePicks = picks.filter((item) => item.eventId === pick.eventId);
    const compatibilityError = findBetLabSelectionCompatibilityError([
      ...fixturePicks,
      pick,
    ]);
    if (compatibilityError) {
      setNotice(compatibilityError);
      return;
    }

    setPicks((current) => [...current, pick]);
    setNotice(`${pick.selectionName} added to your slip.`);
  }

  function removePick(pick: TicketPick) {
    setPicks((current) => current.filter((item) => !(item.eventId === pick.eventId && item.marketCode === pick.marketCode && item.selectionCode === pick.selectionCode)));
    setNotice(`${pick.selectionName} removed from your slip.`);
  }

  async function placeTicket() {
    setError('');
    setSuccess('');
    if (!authenticated) {
      setShowAccessPrompt(true);
      return;
    }
    if (!picks.length) {
      setError('Choose at least one available selection first.');
      return;
    }
    if (!verified) {
      setShowVerificationPrompt(true);
      return;
    }
    if (!Number.isSafeInteger(stakeAmount) || stakeAmount <= 0) {
      setError('Enter a valid positive stake.');
      return;
    }
    if (!Number.isFinite(stakeAmount * combinedOdds) || stakeAmount * combinedOdds > Number.MAX_SAFE_INTEGER) {
      setError('The potential return is too large for a valid ticket. Reduce your stake or selections.');
      return;
    }

    try {
      // The wallet is deliberately lazy-loaded when the first selection is made.
      // Await the in-flight request here if the user submits immediately.
      const walletResponse = walletQuery.data ?? (await walletQuery.refetch()).data;
      const currentWallet = unwrapRecord(walletResponse);
      const currentBalance = numeric(firstValue(currentWallet, ['availablePoints', 'balance', 'currentBalance', 'points', 'walletBalance']), 0);
      if (walletQuery.isError && !walletResponse) {
        setError('Your virtual wallet could not be loaded. Please retry before placing a ticket.');
        return;
      }
      if (stakeAmount > currentBalance) {
        setError('Your available virtual wallet balance is not sufficient for this stake.');
        return;
      }

      if (picks.length === 1) {
        const pick = picks[0];
        await singleTicket.mutateAsync({
          body: {
            eventId: pick.eventId,
            marketCode: pick.marketCode as BetLabMarketCode,
            selectionCode: pick.selectionCode,
            stake: stakeAmount,
            idempotencyKey: makeIdempotencyKey('betlab'),
          },
        });
      } else {
        await accumulator.mutateAsync({
          body: {
            legs: picks.map((pick) => ({
              eventId: pick.eventId,
              marketCode: pick.marketCode as BetLabMarketCode,
              selectionCode: pick.selectionCode,
            })),
            stake: stakeAmount,
            idempotencyKey: makeIdempotencyKey('betlab'),
          },
        });
      }

      setSuccess('Ticket placed successfully. You can follow its progress in My Tickets.');
      setPicks([]);
      setMobileSlipOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bet-lab-wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['bet-lab', 'getTickets'] }),
      ]);
    } catch (requestError) {
      setError(errorMessage(requestError, 'Unable to place this ticket. Check the selections and try again.'));
    }
  }

  if (authLoading) {
    return (
      <main className="mx-auto w-full max-w-[1800px] px-3 py-3 sm:px-5">
        <div className="h-11 animate-pulse rounded-xl bg-muted/70" />
        <div className="mt-2 grid gap-1.5 xl:grid-cols-[210px_minmax(0,1fr)_250px]">
          <div className="hidden h-[52vh] animate-pulse rounded-2xl bg-muted/50 xl:block" />
          <div className="h-[52vh] animate-pulse rounded-2xl bg-muted/50" />
          <div className="hidden h-[52vh] animate-pulse rounded-2xl bg-muted/50 xl:block" />
        </div>
      </main>
    );
  }

  const accessAction = () => setShowAccessPrompt(true);
  const fixturesLoading = authenticated
    ? authenticatedFixturesQuery.isLoading
    : publicFixturesQuery.isLoading;

  return (
    <main className="mx-auto w-full max-w-[1800px] px-2 pb-20 sm:px-3 xl:pb-4 2xl:px-4">
      <BetLabDateBar selectedDate={selectedDate} onChange={changeDate} />

      {success ? <div role="status" className="mb-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[9px] text-emerald-700 dark:text-emerald-400">{success}</div> : null}
      {error ? <div role="alert" className="mb-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-[9px] text-destructive">{error}</div> : null}
      {notice ? <div role="status" className="mb-1.5 flex items-start justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[9px] text-amber-800 dark:text-amber-300"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice" className="text-sm">×</button></div> : null}

      <div className="grid min-w-0 items-start gap-1.5 xl:grid-cols-[210px_minmax(0,1fr)_250px] 2xl:grid-cols-[230px_minmax(0,1fr)_270px]">
        <CountryLeaguePanel
          countries={countryGroups}
          selectedCountry={selectedCountryName}
          selectedLeagueId={selectedLeagueId}
          mobileOpen={mobileCountryOpen}
          guestMode={!authenticated}
          onSelectCountry={chooseCountry}
          onSelectAll={chooseAllLeagues}
          onSelectLeague={chooseLeague}
          onRequestAccess={accessAction}
          onCloseMobile={() => setMobileCountryOpen(false)}
        />

        <FixturesMarketPanel
          fixtures={displayFixtures}
          presentations={presentations}
          selectedEventId={selectedEventId}
          marketCatalog={marketCatalogRows}
          fixturesLoading={fixturesLoading}
          fixturesHasMore={!authenticated && Boolean(publicFixturesQuery.hasNextPage)}
          fixturesLoadingMore={!authenticated && publicFixturesQuery.isFetchingNextPage}
          onLoadMoreFixtures={!authenticated ? () => void publicFixturesQuery.fetchNextPage() : undefined}
          marketCatalogLoading={authenticated && marketCatalogQuery.isLoading}
          marketCatalogMessage={!authenticated
            ? 'Sign in to view the supported markets.'
            : marketCatalogQuery.isError
              ? 'Market catalogue unavailable. Try again shortly.'
              : 'No supported markets are available.'}
          activeMarketCode={activeMarketCode}
          picks={picks}
          selectedCountryLabel={selectedCountryLabel}
          guestMode={!authenticated}
          onSelectEvent={setSelectedEventId}
          onChangeMarket={setActiveMarketCode}
          onAddPick={addPick}
          onOpenCountrySelector={() => setMobileCountryOpen(true)}
          onOpenSlip={() => setMobileSlipOpen(true)}
          onRequestAccess={accessAction}
        />

        <BetSlipPanel
          picks={picks}
          stake={stake}
          combinedOdds={combinedOdds}
          potentialReturn={potentialReturn}
          isPlacing={isPlacing}
          mobileOpen={mobileSlipOpen}
          locked={!authenticated}
          onStakeChange={setStake}
          onRemovePick={removePick}
          onPlaceTicket={placeTicket}
          onRequestAccess={accessAction}
          onCloseMobile={() => setMobileSlipOpen(false)}
        />
      </div>

      {showAccessPrompt ? <BetLabAccessModal open onClose={() => setShowAccessPrompt(false)} /> : null}

      {showVerificationPrompt && typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-y-contain bg-slate-950/65 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowVerificationPrompt(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="betlab-verification-title" className="my-auto w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-2xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FaLock className="h-3.5 w-3.5" /></div>
            <h2 id="betlab-verification-title" className="mt-2.5 text-sm font-extrabold">Email verification required</h2>
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Your selections are ready. Verify your email address to place tickets on Bet Lab.</p>
            <div className="mt-3 flex flex-col-reverse gap-1.5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowVerificationPrompt(false)} className="h-8 rounded-md border border-border px-3 text-[9px] font-bold transition hover:bg-muted">Continue browsing</button>
              <Link href="/verify-email" className="flex h-8 items-center justify-center rounded-md bg-primary px-3 text-[9px] font-extrabold text-primary-foreground transition hover:brightness-110">Verify email</Link>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </main>
  );
}

