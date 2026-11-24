import type { ApiRecord } from '@/lib/api-shapes';
import type { SportsCompetition, SportsFixture } from '@/types/sports-v2';

const LIVE_STATES = new Set(['LIVE', 'HALFTIME', 'EXTRA_TIME', 'PENALTIES']);

function teamFor(fixture: SportsFixture, side: 'HOME' | 'AWAY') {
  return fixture.competitors.find((competitor) => competitor.homeAway === side);
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function logoFrom(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const url = value.trim().replace(/^http:\/\//i, 'https://');
    return url.startsWith('//') ? `https:${url}` : url || undefined;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logoFrom(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }
  const row = object(value);
  for (const key of ['href', 'url', 'src', 'logo', 'logos', 'crest', 'emblem', 'badge', 'image', 'images']) {
    const found = logoFrom(row[key], depth + 1);
    if (found) return found;
  }
  return undefined;
}

function fixtureIdentity(fixture: SportsFixture, side: 'HOME' | 'AWAY') {
  // Some callers pass a plain fixture, while others retain a richer fixture
  // or summary envelope. Read all supported forms without assuming that the
  // Sports v2 fixture-list endpoint includes rawPayload.
  const row = fixture as unknown as Record<string, unknown>;
  const sideName = side === 'HOME' ? 'home' : 'away';
  const directNameKeys = side === 'HOME'
    ? ['homeTeamName', 'homeTeamDisplayName', 'homeName', 'homeShortName']
    : ['awayTeamName', 'awayTeamDisplayName', 'awayName', 'awayShortName'];
  const directLogoKeys = side === 'HOME'
    ? ['homeTeamLogo', 'homeTeamLogoUrl', 'homeLogo', 'homeLogoUrl']
    : ['awayTeamLogo', 'awayTeamLogoUrl', 'awayLogo', 'awayLogoUrl'];
  const nestedKeys = [`${sideName}Team`, sideName, `${sideName}Competitor`, `${sideName}_team`];
  const fixtureRoots = [row, object(row.fixture)];
  const summary = object(row.summary ?? row.matchSummary ?? row.summaryPayload);
  const summaryPayload = object(summary.rawPayload ?? summary.payload ?? summary.data);
  const summaryRoots = [
    summary,
    summaryPayload,
    object(summary.header),
    object(summaryPayload.header),
    object(summary.event),
    object(summaryPayload.event),
  ];
  const findSide = (roots: Record<string, unknown>[]) => {
    for (const root of roots) {
      for (const key of nestedKeys) {
        const value = root[key];
        if (typeof value === 'string' && value.trim()) return { name: value.trim() };
        if (value && typeof value === 'object') return object(value);
      }
    }
    return {};
  };
  const nested = findSide(fixtureRoots);
  const summarySide = findSide(summaryRoots);
  const competitor = teamFor(fixture, side) as unknown as Record<string, unknown> | undefined;
  const raw = object(competitor?.rawPayload);
  const rawTeam = object(raw.team ?? raw.competitor ?? raw.participant ?? raw);
  const directCompetitorTeam = object(competitor?.team ?? competitor?.competitor ?? competitor?.participant ?? competitor);
  const competitions = [...fixtureRoots, ...summaryRoots]
    .flatMap((item) => Array.isArray(item.competitions) ? item.competitions : []);
  const summaryCompetitor = competitions
    .flatMap((item) => Array.isArray(object(item).competitors) ? object(item).competitors as unknown[] : [])
    .map(object)
    .find((item) => String(item.homeAway ?? item.side ?? '').toUpperCase() === side);
  const summaryTeam = object(summaryCompetitor?.team ?? summaryCompetitor?.competitor ?? summaryCompetitor?.participant);
  const name = textFrom(
    ...fixtureRoots.flatMap((root) => directNameKeys.map((key) => root[key])),
    nested.displayName, nested.fullName, nested.name, nested.shortDisplayName, nested.shortName,
    ...summaryRoots.flatMap((root) => directNameKeys.map((key) => root[key])),
    summarySide.displayName, summarySide.fullName, summarySide.name, summarySide.shortDisplayName, summarySide.shortName,
    directCompetitorTeam.displayName, directCompetitorTeam.fullName, directCompetitorTeam.name,
    rawTeam.displayName, rawTeam.fullName, rawTeam.name, rawTeam.shortDisplayName,
    summaryTeam.displayName, summaryTeam.fullName, summaryTeam.name,
    summaryCompetitor?.displayName, summaryCompetitor?.name,
  );
  const logo = logoFrom([
    ...fixtureRoots.flatMap((root) => directLogoKeys.map((key) => root[key])),
    nested.logo, nested.logoUrl, nested.logos, nested.crest, nested.emblem, nested.badge, nested.image,
    ...summaryRoots.flatMap((root) => directLogoKeys.map((key) => root[key])),
    summarySide.logo, summarySide.logoUrl, summarySide.logos, summarySide.crest, summarySide.emblem, summarySide.badge, summarySide.image,
    directCompetitorTeam.logo, directCompetitorTeam.logos, directCompetitorTeam.crest,
    rawTeam.logo, rawTeam.logos, rawTeam.crest, rawTeam.emblem, rawTeam.badge, rawTeam.image,
    summaryTeam.logo, summaryTeam.logos, summaryTeam.crest, summaryCompetitor?.logo,
  ]);
  return { name, logo };
}

function textFrom(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

/**
 * Maps normalized competition records into the flexible read shape already
 * consumed by Bet Lab's country/league grouping. The Sports v2 competition
 * contract does not define a business-priority field, so only an explicit value
 * retained in the provider payload is passed through; no priority is inferred.
 */
export function sportsV2CompetitionToApiRecord(competition: SportsCompetition): ApiRecord {
  const raw = competition.rawPayload ?? {};
  const priority = textFrom(raw.leaguePriority, raw.priority);

  return {
    ...competition,
    competitionId: competition.id,
    leagueId: competition.id,
    espnLeagueId: competition.espnId,
    country: competition.country,
    countryName: competition.country,
    displayName: competition.displayName ?? competition.name,
    name: competition.name,
    logo: competition.logo,
    region: competition.region,
    competitionType: competition.type,
    ...(priority ? { leaguePriority: priority, priority } : {}),
  };
}

/**
 * Adapts a normalized Sports v2 fixture to the existing Bet Lab presentation
 * record. ESPN event IDs are retained as eventId because ticket APIs use that
 * provider event identifier; the canonical database ID is kept as fixtureId.
 */
export function sportsV2FixtureToApiRecord(
  fixture: SportsFixture,
  competition?: SportsCompetition | null,
): ApiRecord {
  const home = teamFor(fixture, 'HOME');
  const away = teamFor(fixture, 'AWAY');
  const homeIdentity = fixtureIdentity(fixture, 'HOME');
  const awayIdentity = fixtureIdentity(fixture, 'AWAY');
  const state = fixture.status.state;
  const raw = fixture.rawPayload ?? {};
  const priority = textFrom(
    (raw as Record<string, unknown>).leaguePriority,
    (raw as Record<string, unknown>).priority,
  );

  return {
    id: fixture.espnEventId || fixture.id,
    eventId: fixture.espnEventId || fixture.id,
    fixtureId: fixture.id,
    espnEventId: fixture.espnEventId,
    leagueId: fixture.competitionId,
    competitionId: fixture.competitionId,
    espnCompetitionId: fixture.espnCompetitionId,
    seasonId: fixture.seasonId,
    season: fixture.seasonYear,
    fixtureDate: fixture.kickoffAt,
    kickoffAt: fixture.kickoffAt,
    date: fixture.kickoffAt,
    status: state,
    presentationStatus: state,
    statusDetail: fixture.status.description ?? fixture.status.shortDescription,
    live: LIVE_STATES.has(state),
    completed: state === 'COMPLETED' || fixture.status.isFinal,
    homeTeamId: home?.teamId,
    awayTeamId: away?.teamId,
    homeScore: home?.score ?? null,
    awayScore: away?.score ?? null,
    homeTeamName: homeIdentity.name,
    awayTeamName: awayIdentity.name,
    homeTeamLogo: homeIdentity.logo,
    awayTeamLogo: awayIdentity.logo,
    competitors: fixture.competitors,
    ...(priority ? { leaguePriority: priority, priority } : {}),
    league: competition ? sportsV2CompetitionToApiRecord(competition) : undefined,
    competition: competition ? sportsV2CompetitionToApiRecord(competition) : undefined,
    payload: raw,
    rawPayload: raw,
  };
}

