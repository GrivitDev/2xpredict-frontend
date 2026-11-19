import type { MatchPresentation } from '@/hooks/use-match-presentation';
import { asRecord, firstValue, type ApiRecord } from '@/lib/api-shapes';
import type {
  SportsCalculatedStanding,
  SportsFixture,
  SportsFixturePage,
  SportsHeadToHeadRecord,
  SportsMatchReadModel,
  SportsNormalizedStatistic,
  SportsTeam,
} from '@/types/sports-v2';
import { fixtureTeamLogoSources, fixtureTeamName } from '../bet-lab.utils';
import type {
  ComparisonStat,
  FixtureStatsModel,
  FormResult,
  HeadToHeadMatch,
  RecentGame,
  SeasonStats,
  StrengthComponents,
  TeamStatsProfile,
} from './stats.types';

const record = (value: unknown): ApiRecord => asRecord(value) ?? {};
const validNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
};
const idText = (value: unknown): string => String(value ?? '').trim();
const teamBySide = (fixture: SportsFixture | undefined, side: 'HOME' | 'AWAY') =>
  fixture?.competitors.find((competitor) => competitor.homeAway === side);

function logoFromRaw(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = logoFromRaw(item);
      if (found) return found;
    }
    return null;
  }
  const item = record(value);
  for (const key of ['href', 'url', 'src', 'logo', 'logos', 'image', 'images', 'crest']) {
    const found = logoFromRaw(item[key]);
    if (found) return found;
  }
  return null;
}

function seasonFromStanding(standing?: SportsCalculatedStanding): SeasonStats {
  const metrics = standing?.metrics;
  const played = metrics?.played ?? null;
  const wins = metrics?.won ?? null;
  const draws = metrics?.drawn ?? null;
  const losses = metrics?.lost ?? null;
  const goalsFor = metrics?.goalsFor ?? null;
  const goalsAgainst = metrics?.goalsAgainst ?? null;
  const points = metrics?.points ?? null;
  const goalDifference = metrics?.goalDifference ?? null;

  return {
    position: standing?.position ?? null,
    played,
    wins,
    draws,
    losses,
    points,
    goalsFor,
    goalsAgainst,
    goalDifference,
    pointsPerGame: metrics?.pointsPerMatch ?? (played ? (points ?? 0) / played : null),
    goalsForPerGame: played ? (goalsFor ?? 0) / played : null,
    goalsAgainstPerGame: played ? (goalsAgainst ?? 0) / played : null,
    form: [],
  };
}

function seasonEmpty(): SeasonStats {
  return {
    position: null,
    played: null,
    wins: null,
    draws: null,
    losses: null,
    points: null,
    goalsFor: null,
    goalsAgainst: null,
    goalDifference: null,
    pointsPerGame: null,
    goalsForPerGame: null,
    goalsAgainstPerGame: null,
    form: [],
  };
}

function recentGamesForTeam(
  teamId: string,
  page: SportsFixturePage | undefined,
  teamMap: Map<string, SportsTeam>,
  competitionName: string,
): RecentGame[] {
  if (!teamId || !page?.items?.length) return [];

  return [...page.items]
    .filter((fixture) => fixture.status.state === 'COMPLETED')
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
    .slice(0, 5)
    .map((fixture, index): RecentGame | null => {
      const own = fixture.competitors.find((competitor) => competitor.teamId === teamId);
      const opponent = fixture.competitors.find((competitor) => competitor.teamId !== teamId);
      if (!own || !opponent) return null;
      const ownScore = validNumber(own.score);
      const opponentScore = validNumber(opponent.score);
      if (ownScore === null || opponentScore === null) return null;

      const result: FormResult = ownScore > opponentScore ? 'W' : ownScore < opponentScore ? 'L' : 'D';
      const opponentTeam = teamMap.get(opponent.teamId);
      const rawOpponent = record(opponent.rawPayload);
      const nestedOpponent = record(rawOpponent.team ?? rawOpponent.competitor ?? rawOpponent);
      const opponentName = opponentTeam?.displayName ?? opponentTeam?.name
        ?? (idText(firstValue(nestedOpponent, ['displayName', 'fullName', 'name', 'shortName'])) || 'Opponent');
      const opponentLogo = opponentTeam?.logo ?? logoFromRaw(firstValue(nestedOpponent, ['logo', 'logos', 'crest', 'emblem']));

      return {
        id: fixture.id || `${teamId}-${index}`,
        date: fixture.kickoffAt || null,
        opponent: opponentName,
        opponentLogo: opponentLogo ? [opponentLogo] : null,
        score: `${ownScore}–${opponentScore}`,
        result,
        goalsFor: ownScore,
        goalsAgainst: opponentScore,
        competition: competitionName,
      };
    })
    .filter((game): game is RecentGame => Boolean(game))
    .reverse();
}

function profileFrom(
  identity: { id: string; name: string; logo: string | string[] | null },
  recentGames: RecentGame[],
  season: SeasonStats,
): TeamStatsProfile {
  const recentForm = recentGames.map((game) => game.result);
  const recentPoints = recentForm.length
    ? recentForm.reduce((total, result) => total + (result === 'W' ? 3 : result === 'D' ? 1 : 0), 0)
    : null;
  const recentGoalsFor = recentGames.length ? recentGames.reduce((sum, game) => sum + (game.goalsFor ?? 0), 0) : null;
  const recentGoalsAgainst = recentGames.length ? recentGames.reduce((sum, game) => sum + (game.goalsAgainst ?? 0), 0) : null;
  const cleanSheets = recentGames.length ? recentGames.filter((game) => game.goalsAgainst === 0).length : null;

  return {
    ...identity,
    recentGames,
    recentForm,
    recentPoints,
    recentGoalsFor,
    recentGoalsAgainst,
    cleanSheets,
    season,
    strength: { season: null, form: null, attack: null, defence: null },
    overallStrength: null,
  };
}

function pairedStrength(left: number | null, right: number | null, higherIsBetter = true): [number | null, number | null] {
  if (left === null || right === null) return [null, null];
  const a = higherIsBetter ? left : -left;
  const b = higherIsBetter ? right : -right;
  if (a === b) return [50, 50];
  const leftScore = Math.max(0, Math.min(100, 50 + ((a - b) / (Math.abs(a) + Math.abs(b) + 1)) * 50));
  return [leftScore, 100 - leftScore];
}

function applyStrength(home: TeamStatsProfile, away: TeamStatsProfile) {
  const formScore = (profile: TeamStatsProfile) => profile.recentPoints !== null && profile.recentForm.length
    ? (profile.recentPoints / (profile.recentForm.length * 3)) * 100
    : null;
  const [seasonHome, seasonAway] = pairedStrength(home.season.pointsPerGame, away.season.pointsPerGame);
  const [formHome, formAway] = pairedStrength(formScore(home), formScore(away));
  const [attackHome, attackAway] = pairedStrength(home.season.goalsForPerGame, away.season.goalsForPerGame);
  const [defenceHome, defenceAway] = pairedStrength(home.season.goalsAgainstPerGame, away.season.goalsAgainstPerGame, false);
  home.strength = { season: seasonHome, form: formHome, attack: attackHome, defence: defenceHome };
  away.strength = { season: seasonAway, form: formAway, attack: attackAway, defence: defenceAway };

  const keys: Array<keyof StrengthComponents> = ['season', 'form', 'attack', 'defence'];
  const score = (profile: TeamStatsProfile) => {
    const available = keys.map((key) => profile.strength[key]).filter((value): value is number => value !== null);
    return available.length ? Math.round(available.reduce((sum, value) => sum + value, 0) / available.length) : null;
  };
  home.overallStrength = score(home);
  away.overallStrength = score(away);
}

function categoryFor(key: string, label: string): ComparisonStat['category'] {
  const value = `${key} ${label}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/possession|pass|longball/.test(value)) return 'possession';
  if (/shot|goal|penalty|corner|score|cross/.test(value)) return 'attack';
  if (/save|tackle|interception|clearance|block/.test(value)) return 'defence';
  if (/foul|card|offside/.test(value)) return 'discipline';
  return 'other';
}

function formatNormalizedStatistic(stat?: SportsNormalizedStatistic): { display: string; number: number | null } {
  if (!stat) return { display: '—', number: null };
  if (stat.displayValue?.trim()) return { display: stat.displayValue, number: stat.value };
  if (stat.value === null) return { display: '—', number: null };
  return {
    display: stat.unit === 'PERCENT' ? `${stat.value}%` : String(stat.value),
    number: stat.value,
  };
}

function matchStatistics(match: SportsMatchReadModel | null): ComparisonStat[] {
  const rows = match?.matchFacts?.teamStatistics ?? [];
  if (rows.length < 2) return [];
  const homeId = teamBySide(match?.fixture, 'HOME')?.teamId;
  const awayId = teamBySide(match?.fixture, 'AWAY')?.teamId;
  const home = rows.find((row) => row.teamId === homeId || row.side === 'HOME');
  const away = rows.find((row) => row.teamId === awayId || row.side === 'AWAY');
  if (!home || !away) return [];

  const keyOf = (stat: SportsNormalizedStatistic) => stat.canonicalKey ?? stat.providerKey;
  const keys = [...new Set([...home.statistics, ...away.statistics].map(keyOf).filter(Boolean))];
  return keys.map((key): ComparisonStat | null => {
    const homeStat = home.statistics.find((stat) => keyOf(stat) === key);
    const awayStat = away.statistics.find((stat) => keyOf(stat) === key);
    const selected = homeStat ?? awayStat;
    if (!selected) return null;
    const label = selected.providerLabel ?? selected.providerKey.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
    const homeValue = formatNormalizedStatistic(homeStat);
    const awayValue = formatNormalizedStatistic(awayStat);
    if (homeValue.number === null && awayValue.number === null && homeValue.display === '—' && awayValue.display === '—') return null;
    return {
      key,
      label,
      home: homeValue.display,
      away: awayValue.display,
      homeNumber: homeValue.number,
      awayNumber: awayValue.number,
      category: categoryFor(key, label),
    };
  }).filter((row): row is ComparisonStat => Boolean(row));
}

function headToHeadMatches(
  source: SportsHeadToHeadRecord | null | undefined,
  homeId: string,
  awayId: string,
  homeName: string,
  awayName: string,
  homeLogo: string | string[] | null,
  awayLogo: string | string[] | null,
  competitionName: string,
  cutoff: number,
  currentFixtureId: string,
): HeadToHeadMatch[] {
  if (!source || !homeId || !awayId) return [];
  return source.matches
    .filter((match) => match.fixtureId !== currentFixtureId)
    .filter((match) => !Number.isFinite(cutoff) || new Date(match.kickoffAt).getTime() <= cutoff)
    .map((match): HeadToHeadMatch | null => {
      const homeIsListedHome = match.homeTeamId === homeId;
      const homeIsListedAway = match.awayTeamId === homeId;
      const awayIsListedHome = match.homeTeamId === awayId;
      const awayIsListedAway = match.awayTeamId === awayId;
      if (!(homeIsListedHome && awayIsListedAway) && !(homeIsListedAway && awayIsListedHome)) return null;
      const currentHomeScore = homeIsListedHome ? match.homeScore : match.awayScore;
      const currentAwayScore = homeIsListedHome ? match.awayScore : match.homeScore;
      const homeResult: FormResult = currentHomeScore > currentAwayScore ? 'W' : currentHomeScore < currentAwayScore ? 'L' : 'D';
      return {
        id: match.fixtureId,
        date: match.kickoffAt,
        competition: competitionName,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        homeResult,
        matchHomeName: homeIsListedHome ? homeName : awayName,
        matchAwayName: homeIsListedHome ? awayName : homeName,
        matchHomeLogo: homeIsListedHome ? homeLogo : awayLogo,
        matchAwayLogo: homeIsListedHome ? awayLogo : homeLogo,
      };
    })
    .filter((match): match is HeadToHeadMatch => Boolean(match))
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .slice(0, 5);
}

export function buildFixtureStatsModelFromV2(input: {
  fallbackFixture: ApiRecord;
  presentation?: MatchPresentation;
  match: SportsMatchReadModel | null;
  standings?: SportsCalculatedStanding[];
  homeHistory?: SportsFixturePage;
  awayHistory?: SportsFixturePage;
  headToHead?: SportsHeadToHeadRecord | null;
  teams?: SportsTeam[];
}): FixtureStatsModel {
  const { fallbackFixture, presentation, match } = input;
  const fixture = match?.fixture;
  const homeCompetitor = teamBySide(fixture, 'HOME');
  const awayCompetitor = teamBySide(fixture, 'AWAY');
  const fallbackHome = record(fallbackFixture.homeTeam ?? fallbackFixture.home);
  const fallbackAway = record(fallbackFixture.awayTeam ?? fallbackFixture.away);
  const homeId = idText(homeCompetitor?.teamId ?? firstValue(fallbackFixture, ['homeTeamId', 'homeId', 'homeTeamID']) ?? firstValue(fallbackHome, ['id', 'teamId']));
  const awayId = idText(awayCompetitor?.teamId ?? firstValue(fallbackFixture, ['awayTeamId', 'awayId', 'awayTeamID']) ?? firstValue(fallbackAway, ['id', 'teamId']));
  const homeTeam = match?.homeTeam;
  const awayTeam = match?.awayTeam;
  const homeName = homeTeam?.displayName ?? homeTeam?.name ?? presentation?.homeTeamName ?? fixtureTeamName(fallbackFixture, 'home');
  const awayName = awayTeam?.displayName ?? awayTeam?.name ?? presentation?.awayTeamName ?? fixtureTeamName(fallbackFixture, 'away');
  const homeLogo = homeTeam?.logo ?? presentation?.homeTeamLogo ?? fixtureTeamLogoSources(fallbackFixture, 'home', presentation);
  const awayLogo = awayTeam?.logo ?? presentation?.awayTeamLogo ?? fixtureTeamLogoSources(fallbackFixture, 'away', presentation);
  const homeIdentity = { id: homeId, name: homeName, logo: homeLogo };
  const awayIdentity = { id: awayId, name: awayName, logo: awayLogo };

  const teamsById = new Map<string, SportsTeam>();
  for (const team of input.teams ?? []) {
    teamsById.set(team.id, team);
    teamsById.set(team.espnId, team);
  }
  if (homeTeam) teamsById.set(homeTeam.id, homeTeam);
  if (awayTeam) teamsById.set(awayTeam.id, awayTeam);

  const standings = input.standings ?? [];
  const homeStanding = standings.find((row) => row.teamId === homeId);
  const awayStanding = standings.find((row) => row.teamId === awayId);
  const competitionName = match?.competition?.displayName ?? match?.competition?.name ?? 'Football competition';
  const homeRecent = recentGamesForTeam(homeId, input.homeHistory, teamsById, competitionName);
  const awayRecent = recentGamesForTeam(awayId, input.awayHistory, teamsById, competitionName);
  const home = profileFrom(homeIdentity, homeRecent, homeStanding ? seasonFromStanding(homeStanding) : seasonEmpty());
  const away = profileFrom(awayIdentity, awayRecent, awayStanding ? seasonFromStanding(awayStanding) : seasonEmpty());
  applyStrength(home, away);

  const kickoff = presentation?.fixtureDate ?? fixture?.kickoffAt ?? idText(firstValue(fallbackFixture, ['fixtureDate', 'date', 'kickoffTime', 'matchDate']));
  const cutoff = kickoff ? new Date(kickoff).getTime() : Date.now();
  const currentFixtureId = fixture?.id ?? idText(firstValue(fallbackFixture, ['fixtureId', 'eventId', 'id', '_id']));
  const headToHead = headToHeadMatches(
    input.headToHead,
    homeId,
    awayId,
    homeName,
    awayName,
    homeLogo,
    awayLogo,
    competitionName,
    cutoff,
    currentFixtureId,
  );
  const headToHeadSummary = headToHead.reduce((summary, item) => {
    if (item.homeResult === 'W') summary.homeWins += 1;
    else if (item.homeResult === 'L') summary.awayWins += 1;
    else if (item.homeResult === 'D') summary.draws += 1;
    return summary;
  }, { homeWins: 0, draws: 0, awayWins: 0 });

  const liveStats = matchStatistics(match);
  const updatedAt = match?.matchFacts?.normalizedAt ?? match?.matchFacts?.sourceCollectedAt ?? match?.latestOdds?.collectedAt ?? null;

  return {
    home,
    away,
    headToHead,
    headToHeadSummary,
    liveStats,
    liveStatsAvailable: liveStats.length > 0,
    standingsAvailable: Boolean(homeStanding || awayStanding),
    recentFormAvailable: Boolean(homeRecent.length || awayRecent.length),
    headToHeadAvailable: headToHead.length > 0,
    updatedAt,
  };
}
