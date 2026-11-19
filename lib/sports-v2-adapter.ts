import type { ApiRecord } from '@/lib/api-shapes';
import type { SportsCompetition, SportsFixture } from '@/types/sports-v2';

const LIVE_STATES = new Set(['LIVE', 'HALFTIME', 'EXTRA_TIME', 'PENALTIES']);

function teamFor(fixture: SportsFixture, side: 'HOME' | 'AWAY') {
  return fixture.competitors.find((competitor) => competitor.homeAway === side);
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
    homeTeamName: textFrom(
      (home?.rawPayload as Record<string, unknown> | undefined)?.displayName,
      (home?.rawPayload as Record<string, unknown> | undefined)?.name,
    ),
    awayTeamName: textFrom(
      (away?.rawPayload as Record<string, unknown> | undefined)?.displayName,
      (away?.rawPayload as Record<string, unknown> | undefined)?.name,
    ),
    competitors: fixture.competitors,
    ...(priority ? { leaguePriority: priority, priority } : {}),
    league: competition ? sportsV2CompetitionToApiRecord(competition) : undefined,
    competition: competition ? sportsV2CompetitionToApiRecord(competition) : undefined,
    payload: raw,
    rawPayload: raw,
  };
}
