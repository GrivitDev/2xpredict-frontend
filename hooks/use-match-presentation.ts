'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGetV2CompetitionsQuery } from '@/hooks/use-sports';
import { sportsService } from '@/services/sports.service';
import type {
  SportsCompetition,
  SportsFixture,
  SportsFixturePage,
  SportsMatchReadModel,
  SportsTeam,
} from '@/types/sports-v2';

export type MatchPresentation = {
  eventId: string;
  leagueId?: string | null;
  leagueName?: string | null;
  leagueCountry?: string | null;
  homeTeamCountry?: string | null;
  awayTeamCountry?: string | null;
  leagueRegion?: string | null;
  status: 'LIVE' | 'IN_PLAY' | 'UPCOMING' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'SUSPENDED' | 'UNKNOWN';
  statusLabel: string;
  fixtureDate?: string | null;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  leagueLogo?: string | null;
  displayClock?: string | null;
};

/**
 * Display metadata supplied by a page is retained as a last-resort fallback.
 * Sports v2 fixtures expose only an allowlisted competitor.teamIdentity
 * projection; raw ESPN competitor payloads remain private to the backend.
 */
export type MatchPresentationFixtureRef = {
  eventId?: string | null;
  fixtureDate?: string | null;
  fixtureId?: string | null;
  leagueId?: string | null;
  leagueName?: string | null;
  leagueCountry?: string | null;
  homeTeamCountry?: string | null;
  awayTeamCountry?: string | null;
  leagueRegion?: string | null;
  leagueLogo?: string | null;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeTeamLogo?: string | null;
  awayTeamLogo?: string | null;
  /** Preserve the complete page fixture/leg record so nested provider and summary metadata remain available. */
  fixtureRecord?: unknown;
  /** Optional summary object supplied by the owning page/API contract. */
  summaryRecord?: unknown;
};

export interface MatchPresentationQueryOptions {
  /** Set false for historical views that do not need status polling. */
  refetchInterval?: number | false;
}

const PRESENTATION_FIXTURE_PAGE_SIZE = 500;
const PRESENTATION_MAX_FIXTURE_PAGES = 16;
const MAX_EXACT_FIXTURE_FALLBACKS = 250;
const TEAM_LOOKUP_BATCH_SIZE = 500;
const LOOKUP_CONCURRENCY = 8;

type PresentationFixturePageQuery = {
  from: string;
  to: string;
  limit: number;
  cursor?: string;
};
type PresentationFixturePageFetcher = (query: PresentationFixturePageQuery) => Promise<SportsFixturePage>;

function cleanId(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function normalizeId(value: unknown): string {
  return cleanId(value).toLowerCase();
}

function normalizedTeamId(value: unknown): string {
  return normalizeId(value).replace(/^team:/, '');
}

function usableEntityName(values: unknown[], identifiers: unknown[], kind: 'team' | 'league'): string | undefined {
  const ids = new Set(identifiers.map(normalizeId).filter(Boolean));
  const normalizedIds = new Set(identifiers.map(normalizedTeamId).filter(Boolean));
  const generic = kind === 'team'
    ? new Set(['home', 'away', 'home team', 'away team', 'team', 'team name unavailable', 'unknown', 'tbd', 'n/a'])
    : new Set(['league', 'competition', 'league name unavailable', 'unknown', 'tbd', 'n/a']);

  for (const candidate of values) {
    if (typeof candidate !== 'string') continue;
    const value = candidate.trim();
    if (!value) continue;
    const normalized = normalizeId(value);
    if (generic.has(normalized) || ids.has(normalized)) continue;
    if (kind === 'team') {
      if (/^team[:/_-]/i.test(value) || /^\d+$/.test(value) || /(?:^|~)t:[^~]+(?:~|$)/i.test(value)) continue;
      if (normalizedIds.has(normalizedTeamId(value))) continue;
    } else {
      if (/^competition[:/_-]/i.test(value)) continue;
      // ESPN competition slugs such as eng.1 are identifiers, not display names.
      if (/^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value)) continue;
    }
    return value;
  }
  return undefined;
}

const ALPHA3_COUNTRIES: Record<string, string> = {
  ENG: 'England', SCO: 'Scotland', WAL: 'Wales', NIR: 'Northern Ireland',
  NGA: 'Nigeria', GHA: 'Ghana', ZAF: 'South Africa', EGY: 'Egypt', MAR: 'Morocco', SEN: 'Senegal', CIV: 'Ivory Coast', CMR: 'Cameroon',
  USA: 'United States', MEX: 'Mexico', CAN: 'Canada', BRA: 'Brazil', ARG: 'Argentina', CHI: 'Chile', COL: 'Colombia', URU: 'Uruguay',
  ESP: 'Spain', GER: 'Germany', DEU: 'Germany', FRA: 'France', ITA: 'Italy', NED: 'Netherlands', NLD: 'Netherlands', POR: 'Portugal', BEL: 'Belgium',
  SUI: 'Switzerland', CHE: 'Switzerland', AUT: 'Austria', TUR: 'Türkiye', UKR: 'Ukraine', POL: 'Poland', CZE: 'Czechia', CRO: 'Croatia', SRB: 'Serbia',
  DEN: 'Denmark', DNK: 'Denmark', SWE: 'Sweden', NOR: 'Norway', FIN: 'Finland', IRL: 'Ireland', ISL: 'Iceland', GRE: 'Greece', ROU: 'Romania', HUN: 'Hungary',
  JPN: 'Japan', KOR: 'South Korea', AUS: 'Australia', KSA: 'Saudi Arabia', UAE: 'United Arab Emirates', QAT: 'Qatar', IRN: 'Iran', CHN: 'China',
};

/** Shared sanitizers for user-facing labels when a presentation lookup is still pending. */
export function resolveTeamDisplayName(...values: unknown[]): string {
  return usableEntityName(values, [], 'team') ?? 'Team name unavailable';
}

export function resolveLeagueDisplayName(...values: unknown[]): string {
  return usableEntityName(values, [], 'league') ?? 'League name unavailable';
}

function countryLabel(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const candidate = value.trim();
  if (!candidate) return undefined;
  const upper = candidate.toUpperCase();
  if (ALPHA3_COUNTRIES[upper]) return ALPHA3_COUNTRIES[upper];
  if (/^[A-Z]{2}$/.test(upper)) {
    try {
      const display = new Intl.DisplayNames(['en'], { type: 'region' }).of(upper);
      if (display && display.toUpperCase() !== upper) return display;
    } catch { /* Fall through to the supplied value. */ }
  }
  // Region buckets are not countries and must never be presented as countries.
  const regionKey = upper.replace(/[\s-]+/g, '_');
  if (['AFRICA', 'EUROPE', 'ASIA', 'OCEANIA', 'WORLD', 'NORTH_AMERICA', 'SOUTH_AMERICA', 'NIGERIA_REGION', 'REGIONAL', 'INTERNATIONAL'].includes(regionKey)) return undefined;
  return candidate;
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function score(value: unknown): number | null {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function logo(value: unknown, depth = 0): string | null {
  if (depth > 4 || value === null || value === undefined) return null;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/^http:\/\//i, 'https://');
    if (normalized.startsWith('//')) return `https:${normalized}`;
    return /^(https?:\/\/|\/|data:image\/)/i.test(normalized) ? normalized : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logo(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  const record = object(value);
  for (const key of ['href', 'url', 'src', 'logo', 'logos', 'image', 'images', 'crest', 'emblem']) {
    const found = logo(record[key], depth + 1);
    if (found) return found;
  }
  return null;
}

async function mapWithConcurrency<T, R>(items: readonly T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Fetches the requested fixture rows from the bounded date range using the
 * backend's actual cursor contract. The list endpoint does not support an
 * eventIds filter. A hard page ceiling prevents a wide historical range from
 * scanning an unbounded fixture catalogue; the hook uses exact fixture reads
 * for a small number of still-missing references afterwards.
 */
export async function fetchPresentationFixtures(input: {
  from: string;
  to: string;
  eventIds: readonly string[];
  fetchPage?: PresentationFixturePageFetcher;
  maxPages?: number;
}): Promise<SportsFixture[]> {
  const targetIds = new Set(input.eventIds.map((id) => id.trim()).filter(Boolean));
  if (!targetIds.size || !input.from || !input.to) return [];

  const fetchPage: PresentationFixturePageFetcher = input.fetchPage
    ?? ((query) => sportsService.getV2Fixtures({ query }));
  const resolvedIds = new Set<string>();
  const matchedFixtures = new Map<string, SportsFixture>();
  const visitedCursors = new Set<string>();
  const maxPages = Math.max(1, input.maxPages ?? PRESENTATION_MAX_FIXTURE_PAGES);
  let cursor: string | undefined;

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    const page = await fetchPage({
      from: input.from,
      to: input.to,
      limit: PRESENTATION_FIXTURE_PAGE_SIZE,
      ...(cursor ? { cursor } : {}),
    });

    for (const fixture of page.items ?? []) {
      const matchesRequestedId = targetIds.has(fixture.id) || targetIds.has(fixture.espnEventId);
      if (!matchesRequestedId) continue;
      matchedFixtures.set(fixture.id, fixture);
      resolvedIds.add(fixture.id);
      resolvedIds.add(fixture.espnEventId);
    }

    if ([...targetIds].every((id) => resolvedIds.has(id))) break;
    const nextCursor = page.nextCursor?.trim();
    if (!nextCursor) break;
    if (visitedCursors.has(nextCursor)) throw new Error('Sports fixture pagination returned a repeated cursor.');
    visitedCursors.add(nextCursor);
    cursor = nextCursor;
  }

  return [...matchedFixtures.values()];
}

function mapStatus(fixture: SportsFixture): MatchPresentation['status'] {
  const providerState = String(fixture.status.providerState ?? '').toUpperCase();
  if (/SUSPEND|INTERRUPT/.test(providerState)) return 'SUSPENDED';
  switch (fixture.status.state) {
    case 'LIVE':
    case 'HALFTIME':
    case 'EXTRA_TIME':
    case 'PENALTIES': return 'LIVE';
    case 'SCHEDULED': return 'UPCOMING';
    case 'COMPLETED': return 'FINISHED';
    case 'POSTPONED': return 'POSTPONED';
    case 'CANCELLED':
    case 'ABANDONED': return 'CANCELLED';
    default: return 'UNKNOWN';
  }
}

function statusLabel(status: MatchPresentation['status'], fixture?: SportsFixture): string {
  if (status === 'LIVE') {
    if (fixture?.status.state === 'HALFTIME') return 'Half-time';
    if (fixture?.status.state === 'EXTRA_TIME') return 'Extra time';
    if (fixture?.status.state === 'PENALTIES') return 'Penalties';
    return 'Live';
  }
  switch (status) {
    case 'UPCOMING': return 'Upcoming';
    case 'FINISHED': return 'Finished';
    case 'POSTPONED': return 'Postponed';
    case 'CANCELLED': return 'Canceled';
    case 'SUSPENDED': return 'Suspended';
    default: return 'Status unavailable';
  }
}

function teamRawName(competitor: SportsFixture['competitors'][number] | undefined): unknown[] {
  const identity = object(competitor?.teamIdentity);
  const raw = object(competitor?.rawPayload);
  const team = object(raw.team ?? raw.competitor ?? raw.participant ?? raw);
  return [
    identity.displayName, identity.name, identity.shortName, identity.abbreviation,
    team.displayName, team.fullName, team.name, team.shortDisplayName, team.shortName, team.nickname,
  ];
}

function teamRawLogo(competitor: SportsFixture['competitors'][number] | undefined): unknown {
  const identity = object(competitor?.teamIdentity);
  const raw = object(competitor?.rawPayload);
  const team = object(raw.team ?? raw.competitor ?? raw.participant ?? raw);
  return identity.logo ?? team.logo ?? team.logos ?? team.crest ?? team.emblem ?? team.badge ?? team.image;
}

function countryFromEntity(value: unknown): string | undefined {
  if (typeof value === 'string') return countryLabel(value);
  const record = object(value);
  return countryLabel(firstText(
    record.name,
    record.displayName,
    record.abbreviation,
    record.code,
    record.alpha3Code,
    record.alpha2Code,
  ));
}

function teamRawCountry(competitor: SportsFixture['competitors'][number] | undefined): unknown {
  const identity = object(competitor?.teamIdentity);
  const raw = object(competitor?.rawPayload);
  const team = object(raw.team ?? raw.competitor ?? raw.participant ?? raw);
  return identity.country ?? team.country ?? team.countryName;
}

function recordObjects(value: unknown, depth = 0, seen = new Set<unknown>()): Record<string, unknown>[] {
  if (depth > 3 || value === null || typeof value !== 'object' || seen.has(value)) return [];
  seen.add(value);
  if (Array.isArray(value)) return value.flatMap((item) => recordObjects(item, depth + 1, seen));
  const current = object(value);
  const result = [current];
  for (const key of ['fixture', 'event', 'match', 'summary', 'summaryData', 'summaryPayload', 'fixtureSummary', 'matchSummary', 'matchSummaryData', 'payload', 'rawPayload', 'data', 'eventData', 'result', 'header']) {
    if (current[key] !== undefined) result.push(...recordObjects(current[key], depth + 1, seen));
  }
  return result;
}

function sideTeamObjects(value: unknown, side: 'HOME' | 'AWAY'): Record<string, unknown>[] {
  const output: Record<string, unknown>[] = [];
  for (const record of recordObjects(value)) {
    for (const key of side === 'HOME'
      ? ['homeTeam', 'home', 'homeCompetitor', 'homeParticipant', 'home_team', 'homeTeamInfo']
      : ['awayTeam', 'away', 'awayCompetitor', 'awayParticipant', 'away_team', 'awayTeamInfo']) {
      const direct = record[key];
      if (typeof direct === 'string' && direct.trim()) output.push({ name: direct.trim() });
      else if (direct && typeof direct === 'object') {
        const nested = object(direct);
        output.push(nested);
        for (const child of ['team', 'competitor', 'participant', 'teamIdentity']) {
          if (nested[child] && typeof nested[child] === 'object') output.push(object(nested[child]));
        }
      }
    }

    const competitions = Array.isArray(record.competitions) ? record.competitions : [];
    for (const competitionValue of competitions) {
      const competition = object(competitionValue);
      const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
      for (const competitorValue of competitors) {
        const competitor = object(competitorValue);
        const homeAway = firstText(competitor.homeAway, competitor.side, competitor.teamSide, competitor.designation)?.toUpperCase();
        const isSide = homeAway === side || homeAway === (side === 'HOME' ? 'H' : 'A')
          || (side === 'HOME' ? competitor.isHome === true || competitor.home === true : competitor.isAway === true || competitor.away === true);
        if (!isSide) continue;
        output.push(competitor);
        for (const child of ['team', 'competitor', 'participant', 'teamIdentity']) {
          if (competitor[child] && typeof competitor[child] === 'object') output.push(object(competitor[child]));
        }
      }
    }

    const competitors = Array.isArray(record.competitors) ? record.competitors : [];
    for (const competitorValue of competitors) {
      const competitor = object(competitorValue);
      const homeAway = firstText(competitor.homeAway, competitor.side, competitor.teamSide, competitor.designation)?.toUpperCase();
      const isSide = homeAway === side || homeAway === (side === 'HOME' ? 'H' : 'A')
        || (side === 'HOME' ? competitor.isHome === true || competitor.home === true : competitor.isAway === true || competitor.away === true);
      if (!isSide) continue;
      output.push(competitor);
      for (const child of ['team', 'competitor', 'participant', 'teamIdentity']) {
        if (competitor[child] && typeof competitor[child] === 'object') output.push(object(competitor[child]));
      }
    }
  }
  return output;
}

function fixtureRecordTeamName(value: unknown, side: 'HOME' | 'AWAY'): string | undefined {
  const candidates = sideTeamObjects(value, side);
  const directNames = recordObjects(value).flatMap((record) => side === 'HOME'
    ? [record.homeTeamName, record.homeTeamDisplayName, record.homeName, record.homeShortName, record.home_team_name]
    : [record.awayTeamName, record.awayTeamDisplayName, record.awayName, record.awayShortName, record.away_team_name]);
  const nestedNames = candidates.flatMap((team) => [team.displayName, team.fullName, team.name, team.shortDisplayName, team.shortName, team.nickname, team.abbreviation]);
  return firstText(...directNames, ...nestedNames);
}

function fixtureRecordTeamLogo(value: unknown, side: 'HOME' | 'AWAY'): string | null {
  const candidates = sideTeamObjects(value, side);
  const directLogos = recordObjects(value).flatMap((record) => side === 'HOME'
    ? [record.homeTeamLogo, record.homeTeamLogoUrl, record.homeLogo, record.homeLogoUrl, record.homeTeamLogos, record.homeBadge, record.homeImage]
    : [record.awayTeamLogo, record.awayTeamLogoUrl, record.awayLogo, record.awayLogoUrl, record.awayTeamLogos, record.awayBadge, record.awayImage]);
  const nestedLogos = candidates.flatMap((team) => [team.logo, team.logoUrl, team.logos, team.crest, team.crestUrl, team.emblem, team.badge, team.badgeUrl, team.image, team.imageUrl, team.images, team.teamLogo, team.teamLogos]);
  return logo([...directLogos, ...nestedLogos]);
}

function fixtureRecordTeamCountry(value: unknown, side: 'HOME' | 'AWAY'): string | undefined {
  return sideTeamObjects(value, side)
    .map((team) => countryFromEntity(team.country ?? team.countryName))
    .find((country): country is string => Boolean(country));
}

function fixtureRecordTeamId(value: unknown, side: 'HOME' | 'AWAY'): string | undefined {
  return firstText(...sideTeamObjects(value, side).flatMap((team) => [team.teamId, team.id, team.espnId]));
}

function fixtureRecordStatus(value: unknown): MatchPresentation['status'] {
  const records = recordObjects(value);
  const statusText = records.flatMap((record) => {
    const nested = object(record.status ?? record.matchStatus ?? record.fixtureStatus);
    return [record.presentationStatus, typeof record.status === 'string' ? record.status : undefined,
      record.state, nested.state, nested.providerState, nested.name, nested.description, nested.shortDescription];
  }).map((item) => String(item ?? '').toUpperCase()).join(' ');
  if (/SUSPEND|INTERRUPT/.test(statusText)) return 'SUSPENDED';
  if (/POSTPON/.test(statusText)) return 'POSTPONED';
  if (/CANCEL|ABANDON/.test(statusText)) return 'CANCELLED';
  if (/LIVE|IN.?PLAY|HALFTIME|HALF.?TIME|EXTRA.?TIME|PENALT/.test(statusText)) return 'LIVE';
  if (/FINISHED|COMPLETED|FULL.?TIME|(^|\s)FT(\s|$)/.test(statusText)) return 'FINISHED';
  if (/SCHEDULED|UPCOMING|NOT.?STARTED/.test(statusText)) return 'UPCOMING';
  return 'UNKNOWN';
}

function fixtureRecordScore(value: unknown, side: 'HOME' | 'AWAY'): number | null {
  const records = recordObjects(value);
  const keys = side === 'HOME'
    ? ['homeScore', 'homeTeamScore', 'home_score', 'homeGoals']
    : ['awayScore', 'awayTeamScore', 'away_score', 'awayGoals'];
  const direct = records.flatMap((record) => [
    ...keys.map((key) => record[key]),
    object(record[side === 'HOME' ? 'homeTeam' : 'awayTeam']).score,
    object(record[side === 'HOME' ? 'home' : 'away']).score,
  ]);
  const competitorScore = sideTeamObjects(value, side).map((team) => team.score ?? team.scoreValue ?? team.displayScore);
  for (const candidate of [...direct, ...competitorScore]) {
    const value = score(candidate);
    if (value !== null) return value;
  }
  return null;
}

function fixtureRecordClock(value: unknown): string | undefined {
  for (const record of recordObjects(value)) {
    const status = object(record.status);
    const clock = firstText(record.displayClock, record.clock, status.displayClock, status.clock);
    if (clock) return clock;
  }
  return undefined;
}

function hasFallbackName(ref: MatchPresentationFixtureRef, side: 'HOME' | 'AWAY'): boolean {
  const id = side === 'HOME' ? ref.homeTeamId : ref.awayTeamId;
  const explicit = side === 'HOME' ? ref.homeTeamName : ref.awayTeamName;
  return Boolean(usableEntityName([explicit, fixtureRecordTeamName(ref.fixtureRecord, side), fixtureRecordTeamName(ref.summaryRecord, side)], [id], 'team'));
}

function competitionLookup(competitions: readonly SportsCompetition[]): Map<string, SportsCompetition> {
  const result = new Map<string, SportsCompetition>();
  for (const competition of competitions) {
    for (const alias of [competition.id, competition.espnId, competition.slug]) {
      const key = normalizeId(alias);
      if (key) result.set(key, competition);
    }
  }
  return result;
}

function getTeamByIdentifier(
  teamsById: Map<string, SportsTeam>,
  identifier: unknown,
): SportsTeam | undefined {
  const normalized = normalizeId(identifier);
  if (!normalized) return undefined;
  const sourceId = normalized.replace(/^team:/i, '');
  return teamsById.get(normalized)
    ?? teamsById.get(sourceId)
    ?? teamsById.get(`team:${sourceId}`);
}

function buildPresentation(
  fixture: SportsFixture,
  teamsById: Map<string, SportsTeam>,
  competitionsById: Map<string, SportsCompetition>,
  eventId: string,
  fallback?: MatchPresentationFixtureRef,
): MatchPresentation {
  const home = fixture.competitors.find((competitor) => competitor.homeAway === 'HOME');
  const away = fixture.competitors.find((competitor) => competitor.homeAway === 'AWAY');
  const homeTeam = home ? getTeamByIdentifier(teamsById, home.teamId) : undefined;
  const awayTeam = away ? getTeamByIdentifier(teamsById, away.teamId) : undefined;
  const competition = competitionsById.get(normalizeId(fixture.competitionId))
    ?? competitionsById.get(normalizeId(fixture.espnCompetitionId))
    ?? competitionsById.get(normalizeId(fallback?.leagueId));
  const status = mapStatus(fixture);
  const homeId = home?.teamId ?? fallback?.homeTeamId ?? null;
  const awayId = away?.teamId ?? fallback?.awayTeamId ?? null;
  const homeName = usableEntityName([
    homeTeam?.displayName, homeTeam?.name, homeTeam?.shortName,
    ...teamRawName(home),
    fixtureRecordTeamName(fallback?.fixtureRecord, 'HOME'),
    fixtureRecordTeamName(fallback?.summaryRecord, 'HOME'),
    fallback?.homeTeamName,
  ], [homeId, homeTeam?.id, homeTeam?.espnId], 'team');
  const awayName = usableEntityName([
    awayTeam?.displayName, awayTeam?.name, awayTeam?.shortName,
    ...teamRawName(away),
    fixtureRecordTeamName(fallback?.fixtureRecord, 'AWAY'),
    fixtureRecordTeamName(fallback?.summaryRecord, 'AWAY'),
    fallback?.awayTeamName,
  ], [awayId, awayTeam?.id, awayTeam?.espnId], 'team');
  const leagueId = fixture.competitionId || fixture.espnCompetitionId || fallback?.leagueId || null;
  const leagueName = usableEntityName([
    competition?.displayName, competition?.name, fallback?.leagueName,
  ], [leagueId, competition?.id, competition?.espnId, competition?.slug], 'league');
  const leagueCountry = countryLabel(competition?.country) ?? countryLabel(fallback?.leagueCountry)
    ?? (competition?.type === 'INTERNATIONAL' ? 'International competitions' : undefined);
  const homeCountry = countryLabel(homeTeam?.country)
    ?? countryFromEntity(teamRawCountry(home))
    ?? fixtureRecordTeamCountry(fallback?.fixtureRecord, 'HOME')
    ?? fixtureRecordTeamCountry(fallback?.summaryRecord, 'HOME')
    ?? countryLabel(fallback?.homeTeamCountry);
  const awayCountry = countryLabel(awayTeam?.country)
    ?? countryFromEntity(teamRawCountry(away))
    ?? fixtureRecordTeamCountry(fallback?.fixtureRecord, 'AWAY')
    ?? fixtureRecordTeamCountry(fallback?.summaryRecord, 'AWAY')
    ?? countryLabel(fallback?.awayTeamCountry);
  const showScore = status === 'LIVE' || status === 'FINISHED';

  return {
    eventId,
    leagueId,
    leagueName: leagueName ?? null,
    leagueCountry: leagueCountry ?? null,
    homeTeamCountry: homeCountry ?? null,
    awayTeamCountry: awayCountry ?? null,
    leagueRegion: competition?.region ?? fallback?.leagueRegion ?? null,
    status,
    statusLabel: statusLabel(status, fixture),
    fixtureDate: fixture.kickoffAt ?? fallback?.fixtureDate ?? null,
    homeTeamId: homeId,
    awayTeamId: awayId,
    homeTeamName: homeName ?? null,
    awayTeamName: awayName ?? null,
    homeScore: showScore ? score(home?.score) : null,
    awayScore: showScore ? score(away?.score) : null,
    homeTeamLogo: logo(homeTeam?.logo)
      ?? logo(teamRawLogo(home))
      ?? fixtureRecordTeamLogo(fallback?.fixtureRecord, 'HOME')
      ?? fixtureRecordTeamLogo(fallback?.summaryRecord, 'HOME')
      ?? logo(fallback?.homeTeamLogo),
    awayTeamLogo: logo(awayTeam?.logo)
      ?? logo(teamRawLogo(away))
      ?? fixtureRecordTeamLogo(fallback?.fixtureRecord, 'AWAY')
      ?? fixtureRecordTeamLogo(fallback?.summaryRecord, 'AWAY')
      ?? logo(fallback?.awayTeamLogo),
    leagueLogo: logo(competition?.logo)
      ?? logo(fallback?.leagueLogo)
      ?? logo(recordObjects(fallback?.fixtureRecord).flatMap((record) => [record.leagueLogo, record.competitionLogo, object(record.league ?? record.competition).logo, object(record.league ?? record.competition).logos]))
      ?? null,
    displayClock: fixture.status.displayClock ?? fixture.status.clock ?? null,
  };
}

function buildFallbackPresentation(
  ref: MatchPresentationFixtureRef,
  teamsById: Map<string, SportsTeam>,
  competitionsById: Map<string, SportsCompetition>,
): MatchPresentation | null {
  const records = recordObjects(ref.fixtureRecord);
  const leagueRecord = records.find((record) => record.league || record.competition || record.competitionInfo || record.leagueInfo) ?? {};
  const leagueObject = object(leagueRecord.league ?? leagueRecord.competition ?? leagueRecord.competitionInfo ?? leagueRecord.leagueInfo);
  const homeId = ref.homeTeamId ?? fixtureRecordTeamId(ref.fixtureRecord, 'HOME') ?? fixtureRecordTeamId(ref.summaryRecord, 'HOME') ?? null;
  const awayId = ref.awayTeamId ?? fixtureRecordTeamId(ref.fixtureRecord, 'AWAY') ?? fixtureRecordTeamId(ref.summaryRecord, 'AWAY') ?? null;
  const homeTeam = getTeamByIdentifier(teamsById, homeId);
  const awayTeam = getTeamByIdentifier(teamsById, awayId);
  const competition = competitionsById.get(normalizeId(ref.leagueId))
    ?? competitionsById.get(normalizeId(leagueObject.id))
    ?? competitionsById.get(normalizeId(leagueObject.slug));

  const homeName = usableEntityName([
    homeTeam?.displayName, homeTeam?.name, homeTeam?.shortName,
    fixtureRecordTeamName(ref.fixtureRecord, 'HOME'),
    fixtureRecordTeamName(ref.summaryRecord, 'HOME'),
    ref.homeTeamName,
  ], [homeId, homeTeam?.id, homeTeam?.espnId], 'team');
  const awayName = usableEntityName([
    awayTeam?.displayName, awayTeam?.name, awayTeam?.shortName,
    fixtureRecordTeamName(ref.fixtureRecord, 'AWAY'),
    fixtureRecordTeamName(ref.summaryRecord, 'AWAY'),
    ref.awayTeamName,
  ], [awayId, awayTeam?.id, awayTeam?.espnId], 'team');
  const leagueName = usableEntityName([
    competition?.displayName, competition?.name,
    leagueObject.displayName, leagueObject.name, leagueObject.shortName,
    ...records.flatMap((record) => [record.leagueName, record.competitionName]),
    ref.leagueName,
  ], [ref.leagueId, leagueObject.id, leagueObject.slug, competition?.id, competition?.slug], 'league');
  const leagueCountry = countryLabel(competition?.country)
    ?? countryLabel(ref.leagueCountry)
    ?? countryLabel(firstText(leagueObject.country, object(leagueObject.country).name))
    ?? countryLabel(firstText(...records.flatMap((record) => [record.country, record.countryName])));
  const homeCountry = countryLabel(homeTeam?.country)
    ?? fixtureRecordTeamCountry(ref.fixtureRecord, 'HOME')
    ?? fixtureRecordTeamCountry(ref.summaryRecord, 'HOME')
    ?? countryLabel(ref.homeTeamCountry);
  const awayCountry = countryLabel(awayTeam?.country)
    ?? fixtureRecordTeamCountry(ref.fixtureRecord, 'AWAY')
    ?? fixtureRecordTeamCountry(ref.summaryRecord, 'AWAY')
    ?? countryLabel(ref.awayTeamCountry);
  const homeLogo = logo(homeTeam?.logo)
    ?? fixtureRecordTeamLogo(ref.fixtureRecord, 'HOME')
    ?? fixtureRecordTeamLogo(ref.summaryRecord, 'HOME')
    ?? logo(ref.homeTeamLogo);
  const awayLogo = logo(awayTeam?.logo)
    ?? fixtureRecordTeamLogo(ref.fixtureRecord, 'AWAY')
    ?? fixtureRecordTeamLogo(ref.summaryRecord, 'AWAY')
    ?? logo(ref.awayTeamLogo);
  const leagueLogo = logo(competition?.logo)
    ?? logo(ref.leagueLogo ?? leagueObject.logo ?? leagueObject.logos ?? leagueObject.crest);
  if (!homeName && !awayName && !leagueName && !leagueCountry && !leagueLogo && !homeLogo && !awayLogo && !homeCountry && !awayCountry) return null;

  const status = fixtureRecordStatus(ref.fixtureRecord) !== 'UNKNOWN'
    ? fixtureRecordStatus(ref.fixtureRecord)
    : fixtureRecordStatus(ref.summaryRecord);
  const fixtureStatus = status === 'UNKNOWN' ? 'Status unavailable' : statusLabel(status);
  const showScore = status === 'LIVE' || status === 'FINISHED';
  const recordDate = records.flatMap((record) => [record.kickoffAt, record.fixtureDate, record.matchDate, record.date]).find((value) => typeof value === 'string' && value.trim());
  const summaryStatus = fixtureRecordStatus(ref.summaryRecord);

  return {
    eventId: cleanId(ref.eventId),
    leagueId: ref.leagueId ?? firstText(leagueObject.id, leagueObject.slug) ?? null,
    leagueName: leagueName ?? null,
    leagueCountry: leagueCountry ?? (competition?.type === 'INTERNATIONAL' ? 'International competitions' : null),
    homeTeamCountry: homeCountry ?? null,
    awayTeamCountry: awayCountry ?? null,
    leagueRegion: ref.leagueRegion ?? competition?.region ?? firstText(leagueObject.region) ?? null,
    status: status === 'UNKNOWN' ? summaryStatus : status,
    statusLabel: status === 'UNKNOWN' ? (summaryStatus === 'UNKNOWN' ? fixtureStatus : statusLabel(summaryStatus)) : fixtureStatus,
    fixtureDate: ref.fixtureDate ?? (typeof recordDate === 'string' ? recordDate : null),
    homeTeamId: homeId,
    awayTeamId: awayId,
    homeTeamName: homeName ?? null,
    awayTeamName: awayName ?? null,
    homeScore: showScore ? (fixtureRecordScore(ref.fixtureRecord, 'HOME') ?? fixtureRecordScore(ref.summaryRecord, 'HOME')) : null,
    awayScore: showScore ? (fixtureRecordScore(ref.fixtureRecord, 'AWAY') ?? fixtureRecordScore(ref.summaryRecord, 'AWAY')) : null,
    homeTeamLogo: homeLogo,
    awayTeamLogo: awayLogo,
    leagueLogo,
    displayClock: fixtureRecordClock(ref.fixtureRecord) ?? fixtureRecordClock(ref.summaryRecord) ?? null,
  };
}

function mergeTeamIdentity(preferred: SportsTeam, fallback: SportsTeam): SportsTeam {
  return {
    ...fallback,
    ...preferred,
    id: firstText(preferred.id, fallback.id) ?? preferred.id,
    espnId: firstText(preferred.espnId, fallback.espnId) ?? preferred.espnId,
    leagueIds: [...new Set([...(fallback.leagueIds ?? []), ...(preferred.leagueIds ?? [])])],
    name: firstText(preferred.name, preferred.displayName, preferred.shortName,
      fallback.name, fallback.displayName, fallback.shortName) ?? '',
    displayName: firstText(preferred.displayName, preferred.name, fallback.displayName, fallback.name),
    shortName: firstText(preferred.shortName, preferred.name, fallback.shortName, fallback.name),
    abbreviation: firstText(preferred.abbreviation, fallback.abbreviation),
    slug: firstText(preferred.slug, fallback.slug),
    logo: logo(preferred.logo) ?? logo(fallback.logo) ?? undefined,
    country: firstText(preferred.country, fallback.country),
    location: firstText(preferred.location, fallback.location),
    primaryColor: firstText(preferred.primaryColor, fallback.primaryColor),
    alternateColor: firstText(preferred.alternateColor, fallback.alternateColor),
  };
}

/** Build lightweight in-memory fallback records from snapshots already on fixtures. */
function fixtureSnapshotTeams(
  fixtures: readonly SportsFixture[],
  refs: readonly MatchPresentationFixtureRef[] = [],
): SportsTeam[] {
  const snapshots = new Map<string, SportsTeam>();
  const candidates: SportsFixture[] = [...fixtures];
  const knownFixtureIds = new Set(
    candidates.flatMap((fixture) => [fixture.id, fixture.espnEventId].map(normalizeId)).filter(Boolean),
  );
  for (const ref of refs) {
    const record = object(ref.fixtureRecord);
    if (!Array.isArray(record.competitors)) continue;
    const fixtureId = firstText(record.id, record.fixtureId, ref.fixtureId, ref.eventId);
    const aliases = [fixtureId, firstText(record.espnEventId, ref.eventId)]
      .map(normalizeId)
      .filter(Boolean);
    if (aliases.some((alias) => knownFixtureIds.has(alias))) continue;
    aliases.forEach((alias) => knownFixtureIds.add(alias));
    const collectedAt = firstText(object(record.source).collectedAt, record.updatedAt, ref.fixtureDate)
      ?? new Date().toISOString();
    const source = object(record.source).provider && object(record.source).endpoint
      ? record.source as SportsFixture['source']
      : {
          provider: 'ESPN' as const,
          endpoint: '/fixture-reference-snapshot',
          collectedAt,
        };
    candidates.push({
      id: fixtureId ?? `fixture-ref:${normalizeId(ref.eventId)}`,
      espnEventId: firstText(record.espnEventId, record.eventId, ref.eventId) ?? '',
      competitionId: firstText(record.competitionId, ref.leagueId) ?? '',
      espnCompetitionId: firstText(record.espnCompetitionId),
      kickoffAt: firstText(record.kickoffAt, ref.fixtureDate) ?? collectedAt,
      status: object(record.status) as unknown as SportsFixture['status'],
      competitors: record.competitors as SportsFixture['competitors'],
      periodScores: Array.isArray(record.periodScores)
        ? record.periodScores as SportsFixture['periodScores']
        : [],
      source,
      createdAt: firstText(record.createdAt) ?? collectedAt,
      updatedAt: firstText(record.updatedAt) ?? collectedAt,
    } as SportsFixture);
  }

  const orderedFixtures = candidates.sort((left, right) =>
    Date.parse(left.source?.collectedAt ?? '') - Date.parse(right.source?.collectedAt ?? ''),
  );

  for (const fixture of orderedFixtures) {
    const competitionId = firstText(fixture.competitionId, fixture.espnCompetitionId)
      ?.replace(/^competition:/i, '').trim().toLowerCase();
    for (const competitor of fixture.competitors ?? []) {
      const identity = object(competitor.teamIdentity);
      const rawName = teamRawName(competitor);
      const name = usableEntityName(
        rawName,
        [competitor.teamId, identity.id, identity.espnId],
        'team',
      );
      const idValue = cleanId(competitor.teamId) || firstText(identity.id);
      if (!idValue) continue;
      const id = idValue.startsWith('team:') ? idValue : `team:${idValue}`;
      const canonicalEspnId = id.replace(/^team:/i, '');
      const snapshotId = firstText(identity.id);
      const snapshotEspnId = firstText(identity.espnId)?.replace(/^team:/i, '');
      if (
        (snapshotId && normalizeId(snapshotId.replace(/^team:/i, '')) !== normalizeId(canonicalEspnId)) ||
        (snapshotEspnId && normalizeId(snapshotEspnId) !== normalizeId(canonicalEspnId))
      ) continue;
      const espnId = canonicalEspnId;
      const snapshot: SportsTeam = {
        id,
        espnId,
        leagueIds: competitionId ? [competitionId] : [],
        name: name ?? '',
        displayName: firstText(identity.displayName, identity.name, identity.shortName),
        shortName: firstText(identity.shortName, identity.name),
        abbreviation: firstText(identity.abbreviation),
        slug: firstText(identity.slug),
        logo: logo(teamRawLogo(competitor)) ?? undefined,
        country: countryFromEntity(teamRawCountry(competitor)),
        location: firstText(identity.location),
        primaryColor: firstText(identity.primaryColor),
        alternateColor: firstText(identity.alternateColor),
        source: fixture.source,
        createdAt: fixture.createdAt,
        updatedAt: fixture.updatedAt,
      };
      const existing = snapshots.get(id);
      snapshots.set(id, existing ? mergeTeamIdentity(snapshot, existing) : snapshot);
    }
  }
  return [...snapshots.values()];
}

function indexTeams(
  teams: readonly SportsTeam[],
  fallbackTeams: readonly SportsTeam[] = [],
): Map<string, SportsTeam> {
  const byCanonicalId = new Map<string, SportsTeam>();
  const hasConsistentIdentity = (team: SportsTeam): boolean => {
    const canonicalSuffix = /^team:(.+)$/i.exec(cleanId(team.id))?.[1];
    const espnId = cleanId(team.espnId).replace(/^team:/i, '');
    return !canonicalSuffix || !espnId || normalizeId(canonicalSuffix) === normalizeId(espnId);
  };
  for (const team of fallbackTeams) {
    const key = normalizeId(team.id);
    if (key && hasConsistentIdentity(team)) byCanonicalId.set(key, team);
  }
  for (const team of teams) {
    const key = normalizeId(team.id);
    if (!key || !hasConsistentIdentity(team)) continue;
    const existing = byCanonicalId.get(key);
    byCanonicalId.set(key, existing ? mergeTeamIdentity(team, existing) : team);
  }

  const result = new Map<string, SportsTeam>();
  for (const team of byCanonicalId.values()) {
    for (const alias of [team.id, team.espnId]) {
      const key = normalizeId(alias);
      if (!key) continue;
      const sourceId = key.replace(/^team:/i, '');
      result.set(key, team);
      result.set(sourceId, team);
      result.set(`team:${sourceId}`, team);
    }
  }
  return result;
}

async function resolveTeamsForIdentifiers(teamIds: readonly string[]): Promise<SportsTeam[]> {
  const identifiers = [...new Set(teamIds.map(cleanId).filter(Boolean))];
  if (!identifiers.length) return [];

  const batches: string[][] = [];
  for (let index = 0; index < identifiers.length; index += TEAM_LOOKUP_BATCH_SIZE) {
    batches.push(identifiers.slice(index, index + TEAM_LOOKUP_BATCH_SIZE));
  }

  try {
    const results = await Promise.all(batches.map((ids) =>
      sportsService.getV2TeamsByIdentifiers({ body: { ids } }),
    ));
    return results.flat();
  } catch (error) {
    console.error('[sports] Failed to resolve team identities from /sports/v2/teams/lookup.', {
      requestedCount: identifiers.length,
      sampleTeamIds: identifiers.slice(0, 12),
      error,
    });
    throw error;
  }
}

export function useMatchPresentation(
  fixtures: MatchPresentationFixtureRef[],
  source?: { fixtures?: SportsFixture[]; competitions?: SportsCompetition[]; teams?: SportsTeam[] },
  options: MatchPresentationQueryOptions = {},
) {
  const sourceFixtures = source?.fixtures ?? [];
  const sourceFixturesByEvent = useMemo(() => {
    const index = new Map<string, SportsFixture>();
    for (const fixture of sourceFixtures) {
      for (const alias of [fixture.id, fixture.espnEventId]) {
        const key = normalizeId(alias);
        if (key) index.set(key, fixture);
      }
    }
    return index;
  }, [sourceFixtures]);

  const fixtureRefs = useMemo(() => {
    const unique = new Map<string, MatchPresentationFixtureRef>();
    for (const fixture of fixtures) {
      const eventId = cleanId(fixture.eventId);
      if (!eventId) continue;
      const existing = unique.get(normalizeId(eventId)) ?? { eventId };
      const fixtureRecord = sourceFixturesByEvent.get(normalizeId(eventId))
        ?? fixture.fixtureRecord
        ?? fixture;
      const fixtureRecordObject = object(fixtureRecord);
      const merged: MatchPresentationFixtureRef = {
        ...existing,
        ...fixture,
        eventId,
        fixtureRecord,
        summaryRecord: fixture.summaryRecord
          ?? fixtureRecordObject.summary
          ?? fixtureRecordObject.matchSummary
          ?? fixtureRecordObject.summaryPayload,
      };
      for (const key of Object.keys(merged) as Array<keyof MatchPresentationFixtureRef>) {
        if (merged[key] === '' || merged[key] === undefined) delete merged[key];
      }
      unique.set(normalizeId(eventId), merged);
    }
    return [...unique.values()];
  }, [fixtures, sourceFixturesByEvent]);

  const hasRefs = fixtureRefs.length > 0;
  const refsNeedingFixtureDetails = useMemo(() => fixtureRefs.filter((ref) => {
    const hasHomeId = Boolean(cleanId(ref.homeTeamId) || fixtureRecordTeamId(ref.fixtureRecord, 'HOME') || fixtureRecordTeamId(ref.summaryRecord, 'HOME'));
    const hasAwayId = Boolean(cleanId(ref.awayTeamId) || fixtureRecordTeamId(ref.fixtureRecord, 'AWAY') || fixtureRecordTeamId(ref.summaryRecord, 'AWAY'));
    const hasBothNameFallbacks = (['HOME', 'AWAY'] as const).every((side) =>
      hasFallbackName(ref, side),
    );
    return !(hasHomeId && hasAwayId) && !hasBothNameFallbacks;
  }), [fixtureRefs]);
  const requestedEventIds = useMemo(() => fixtureRefs.map((fixture) => String(fixture.eventId)).sort(), [fixtureRefs]);

  // Historical competition metadata is required for finished fixtures too.
  const competitionsQuery = useGetV2CompetitionsQuery(
    { query: { activeOnly: false, limit: 1000 } },
    {
      enabled: hasRefs && (source?.competitions === undefined || source.competitions.length === 0),
      staleTime: 30 * 60_000,
      gcTime: 60 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  // The canonical team lookup remains the first choice. Exact fixture reads
  // are reserved for matches whose team name is still missing after lookup.
  const fixtureTeamIds = useMemo(() => [...new Set([
    ...sourceFixtures.flatMap((fixture) =>
      fixture.competitors.map((competitor) => cleanId(competitor.teamId)).filter(Boolean),
    ),
    ...fixtureRefs.flatMap((ref) => [
      cleanId(ref.homeTeamId) || cleanId(fixtureRecordTeamId(ref.fixtureRecord, 'HOME')) || cleanId(fixtureRecordTeamId(ref.summaryRecord, 'HOME')),
      cleanId(ref.awayTeamId) || cleanId(fixtureRecordTeamId(ref.fixtureRecord, 'AWAY')) || cleanId(fixtureRecordTeamId(ref.summaryRecord, 'AWAY')),
    ].filter(Boolean)),
  ])].sort(), [sourceFixtures, fixtureRefs]);

  const fixtureSnapshotTeamRecords = useMemo(
    () => fixtureSnapshotTeams(sourceFixtures, fixtureRefs),
    [sourceFixtures, fixtureRefs],
  );
  const suppliedTeamIndex = useMemo(
    () => indexTeams(source?.teams ?? [], fixtureSnapshotTeamRecords),
    [source?.teams, fixtureSnapshotTeamRecords],
  );
  const unresolvedTeamIds = useMemo(() => fixtureTeamIds.filter((identifier) => {
    const team = getTeamByIdentifier(suppliedTeamIndex, identifier);
    if (!team) return true;
    const hasName = Boolean(usableEntityName(
      [team.displayName, team.name, team.shortName],
      [identifier, team.id, team.espnId],
      'team',
    ));
    const hasLogo = Boolean(logo(team.logo));
    return !hasName || !hasLogo;
  }), [fixtureTeamIds, suppliedTeamIndex]);

  const teamsQuery = useQuery({
    queryKey: ['sports', 'v2', 'match-presentation-team-index', unresolvedTeamIds],
    queryFn: () => resolveTeamsForIdentifiers(unresolvedTeamIds),
    enabled: hasRefs && unresolvedTeamIds.length > 0,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const lookupTeamIndex = useMemo(
    () => indexTeams(teamsQuery.data ?? []),
    [teamsQuery.data],
  );
  const teamLookupMisses = useMemo(() => unresolvedTeamIds.filter((identifier) => {
    const team = getTeamByIdentifier(lookupTeamIndex, identifier);
    if (!team) return true;
    const hasName = Boolean(usableEntityName(
      [team.displayName, team.name, team.shortName],
      [identifier, team.id, team.espnId],
      'team',
    ));
    return !hasName || !logo(team.logo);
  }), [unresolvedTeamIds, lookupTeamIndex]);

  const fixtureFallbackRefs = useMemo(() => {
    const missing = new Set(teamLookupMisses.map(normalizeId));
    return fixtureRefs.filter((ref) => {
      const lookupMissesThisFixture = (['HOME', 'AWAY'] as const).some((side) => {
        const id = side === 'HOME'
          ? cleanId(ref.homeTeamId) || cleanId(fixtureRecordTeamId(ref.fixtureRecord, side)) || cleanId(fixtureRecordTeamId(ref.summaryRecord, side))
          : cleanId(ref.awayTeamId) || cleanId(fixtureRecordTeamId(ref.fixtureRecord, side)) || cleanId(fixtureRecordTeamId(ref.summaryRecord, side));
        return Boolean(id && missing.has(normalizeId(id)) && !hasFallbackName(ref, side));
      });
      return refsNeedingFixtureDetails.includes(ref) || lookupMissesThisFixture;
    });
  }, [fixtureRefs, refsNeedingFixtureDetails, teamLookupMisses]);

  const fixturesQuery = useQuery({
    queryKey: ['sports', 'v2', 'match-presentation-details', requestedEventIds],
    queryFn: async () => {
      // Read the fixture only for IDs the team index could not resolve, plus
      // references that do not contain enough identifiers to perform lookup.
      const details: SportsMatchReadModel[] = (await mapWithConcurrency(
        fixtureFallbackRefs.slice(0, MAX_EXACT_FIXTURE_FALLBACKS),
        LOOKUP_CONCURRENCY,
        async (ref) => {
          try {
            return await sportsService.getV2Fixture({
              path: { fixtureId: String(ref.eventId).replace(/^fixture:/i, '') },
            });
          } catch (error) {
            console.warn('[sports] Match presentation could not retrieve fixture details.', {
              eventId: ref.eventId,
              error,
            });
            return null;
          }
        },
      )).filter((value): value is SportsMatchReadModel => Boolean(value?.fixture));
      return {
        fixtures: details.map((detail) => detail.fixture),
        teams: details.flatMap((detail) => [detail.homeTeam, detail.awayTeam].filter((team): team is SportsTeam => Boolean(team))),
        competitions: details.map((detail) => detail.competition).filter((competition): competition is SportsCompetition => Boolean(competition)),
      };
    },
    enabled: hasRefs && fixtureFallbackRefs.length > 0
      && (unresolvedTeamIds.length === 0 || teamsQuery.isSuccess || teamsQuery.isError),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    refetchInterval: options.refetchInterval ?? false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  const competitions = source?.competitions?.length
    ? source.competitions
    : competitionsQuery.data ?? source?.competitions ?? [];

  const normalizedRows = useMemo(() => {
    const allCompetitions = [...competitions, ...(fixturesQuery.data?.competitions ?? [])];
    const suppliedTeams = [...(source?.teams ?? []), ...(teamsQuery.data ?? [])];
    const allTeams = [...suppliedTeams, ...(fixturesQuery.data?.teams ?? [])];
    const teamsById = indexTeams(allTeams, fixtureSnapshotTeamRecords);
    const competitionsById = competitionLookup(allCompetitions);
    const output = new Map<string, MatchPresentation>();
    const refByAlias = new Map<string, MatchPresentationFixtureRef>();
    for (const ref of fixtureRefs) {
      refByAlias.set(normalizeId(ref.eventId), ref);
      if (ref.fixtureId) refByAlias.set(normalizeId(ref.fixtureId), ref);
    }
    const fixturesById = new Map<string, SportsFixture>();
    for (const fixture of [...sourceFixtures, ...(fixturesQuery.data?.fixtures ?? [])]) {
      const key = normalizeId(fixture.espnEventId || fixture.id);
      if (key) fixturesById.set(key, { ...fixturesById.get(key), ...fixture });
    }
    const allFixtures = [...fixturesById.values()];

    for (const fixture of allFixtures) {
      const aliases = [fixture.id, fixture.espnEventId].filter(Boolean);
      for (const alias of aliases) {
        const fallback = refByAlias.get(normalizeId(alias))
          ?? fixtureRefs.find((ref) => normalizeId(ref.eventId) === normalizeId(fixture.id)
            || normalizeId(ref.eventId) === normalizeId(fixture.espnEventId));
        output.set(normalizeId(alias), buildPresentation(fixture, teamsById, competitionsById, alias, fallback));
      }
    }
    for (const ref of fixtureRefs) {
      const key = normalizeId(ref.eventId);
      if (output.has(key)) continue;
      const fallback = buildFallbackPresentation(ref, teamsById, competitionsById);
      if (fallback) output.set(key, fallback);
    }
    return output;
  }, [sourceFixtures, source?.teams, fixturesQuery.data, teamsQuery.data, competitions, fixtureRefs, fixtureSnapshotTeamRecords]);

  return useMemo(() => {
    const result = new Map<string, MatchPresentation>();
    for (const fixture of fixtureRefs) {
      const presentation = normalizedRows.get(normalizeId(fixture.eventId));
      if (presentation) result.set(String(fixture.eventId), presentation);
    }
    return result;
  }, [fixtureRefs, normalizedRows]);
}

