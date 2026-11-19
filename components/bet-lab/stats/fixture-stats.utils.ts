import { asRecord, firstValue, rowsFrom, text, type ApiRecord } from '@/lib/api-shapes';
import { fixtureTeamLogoSources, fixtureTeamName, logoUrlsOf } from '../bet-lab.utils';
import type { MatchPresentation } from '@/hooks/use-match-presentation';
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

function record(value: unknown): ApiRecord {
  return asRecord(value) ?? {};
}

function array(value: unknown): ApiRecord[] {
  if (Array.isArray(value)) return value.map(record).filter((item) => Object.keys(item).length > 0);
  return [];
}

function list(value: unknown, keys: string[] = []): ApiRecord[] {
  const direct = rowsFrom(value, keys);
  return direct.map(record).filter((item) => Object.keys(item).length > 0);
}

function unwrap(value: unknown): unknown {
  let current = value;
  for (let depth = 0; depth < 6; depth += 1) {
    const item = asRecord(current);
    if (!item) break;
    const next = item.data ?? item.result ?? item.response;
    if (next === undefined || next === current) break;
    current = next;
  }
  return current;
}

function normalise(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function numeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value.replace(/,/g, '').replace(/%/g, '').replace(/^\+/, '').trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function statNumber(rows: ApiRecord[], aliases: string[]): number | null {
  const aliasSet = new Set(aliases.map(normalise));
  for (const row of rows) {
    const keys = [row.name, row.displayName, row.shortDisplayName, row.abbreviation, row.type]
      .map(normalise)
      .filter(Boolean);
    if (!keys.some((key) => aliasSet.has(key))) continue;
    const value = numeric(row.value ?? row.displayValue ?? row.summary);
    if (value !== null) return value;
  }
  return null;
}

function directNumber(source: ApiRecord, keys: string[]): number | null {
  for (const key of keys) {
    const parsed = numeric(source[key]);
    if (parsed !== null) return parsed;
  }
  return null;
}

function logoOf(value: unknown): string[] | null {
  const urls = logoUrlsOf(value);
  return urls.length ? urls : null;
}

function teamIdentifier(value: unknown): string {
  const item = record(value);
  const team = record(item.team ?? item.competitor);
  const candidate = firstValue(team, ['id', 'teamId', 'teamID'])
    ?? firstValue(item, ['teamId', 'teamID', 'id']);
  if (candidate !== undefined && candidate !== null && String(candidate).trim()) return String(candidate).trim();
  const uid = text(firstValue(team, ['uid']) ?? firstValue(item, ['uid']));
  const match = uid.match(/(?:^|~)t:([^~]+)/i);
  return match?.[1] ?? '';
}

function teamNameOf(value: unknown, fallback = 'Team'): string {
  const item = record(value);
  const team = record(item.team ?? item.competitor);
  const direct = firstValue(team, ['displayName', 'shortDisplayName', 'name', 'fullName', 'location'])
    ?? firstValue(item, ['displayName', 'shortDisplayName', 'name', 'fullName', 'team']);
  return text(direct, fallback);
}

function teamIdentity(fixture: ApiRecord, presentation: MatchPresentation | undefined, side: 'home' | 'away') {
  const nested = record(firstValue(fixture, [side === 'home' ? 'homeTeam' : 'awayTeam', side]));
  const id = text(
    firstValue(fixture, side === 'home' ? ['homeTeamId', 'homeId', 'homeTeamID'] : ['awayTeamId', 'awayId', 'awayTeamID']),
    teamIdentifier(nested),
  );
  const name = side === 'home'
    ? presentation?.homeTeamName ?? fixtureTeamName(fixture, 'home')
    : presentation?.awayTeamName ?? fixtureTeamName(fixture, 'away');
  const logo = fixtureTeamLogoSources(fixture, side, presentation);
  return { id, name, logo };
}

function parseFormResult(value: unknown): FormResult {
  const label = String(value ?? '').trim().toUpperCase();
  if (/^(W|WIN|WON)$/.test(label) || /\bWIN\b/.test(label)) return 'W';
  if (/^(D|DRAW|TIE|TIED)$/.test(label) || /\bDRAW\b|\bTIE\b/.test(label)) return 'D';
  if (/^(L|LOSS|LOST)$/.test(label) || /\bLOSS\b/.test(label)) return 'L';
  return '—';
}

function formPoints(result: FormResult): number {
  return result === 'W' ? 3 : result === 'D' ? 1 : 0;
}

function parseFormString(value: unknown): FormResult[] {
  if (Array.isArray(value)) return value.map(parseFormResult).filter((item) => item !== '—').slice(-5);
  if (typeof value !== 'string') return [];
  return value.toUpperCase().split('').map(parseFormResult).filter((item) => item !== '—').slice(-5);
}

function recentGameGroups(raw: unknown): ApiRecord[] {
  const root = unwrap(raw);
  if (Array.isArray(root)) return array(root);
  const item = record(root);
  return list(item, ['lastFiveGames', 'teams', 'items', 'events', 'data']);
}

function parseRecentGames(raw: unknown, teamId: string, teamName: string): RecentGame[] {
  const groups = recentGameGroups(raw);
  const group = groups.find((item) => {
    const id = teamIdentifier(item);
    const name = teamNameOf(item, '');
    return (teamId && id === teamId) || (!teamId && name && normalise(name) === normalise(teamName));
  }) ?? groups.find((item) => Array.isArray(item.events));
  if (!group) return [];

  const groupedTeamId = teamIdentifier(group);
  const events = list(group, ['events', 'games', 'matches']);
  const parsed = events.map((event, index): RecentGame => {
    const homeId = text(firstValue(event, ['homeTeamId', 'homeId']));
    const awayId = text(firstValue(event, ['awayTeamId', 'awayId']));
    const homeScore = numeric(event.homeTeamScore ?? event.homeScore);
    const awayScore = numeric(event.awayTeamScore ?? event.awayScore);
    const isHome = Boolean((teamId || groupedTeamId) && homeId === (teamId || groupedTeamId));
    const isAway = Boolean((teamId || groupedTeamId) && awayId === (teamId || groupedTeamId));
    const goalsFor = homeScore !== null && awayScore !== null && (isHome || isAway)
      ? (isHome ? homeScore : awayScore)
      : null;
    const goalsAgainst = homeScore !== null && awayScore !== null && (isHome || isAway)
      ? (isHome ? awayScore : homeScore)
      : null;
    let result = parseFormResult(event.gameResult ?? event.result ?? event.outcome);
    if (goalsFor !== null && goalsAgainst !== null) {
      result = goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';
    }
    const opponent = record(event.opponent);
    const opponentName = typeof event.opponent === 'string'
      ? event.opponent
      : teamNameOf(opponent, 'Opponent');
    const score = goalsFor !== null && goalsAgainst !== null
      ? `${goalsFor}–${goalsAgainst}`
      : text(firstValue(event, ['score', 'summary']), '—');
    return {
      id: text(firstValue(event, ['id', 'uid']), `${teamId || teamName}-${index}`),
      date: text(firstValue(event, ['gameDate', 'date'])) || null,
      opponent: opponentName,
      opponentLogo: logoOf([
        opponent,
        firstValue(event, ['opponentLogo', 'opponentLogos', 'teamLogo', 'logo']),
      ]),
      score,
      result,
      goalsFor,
      goalsAgainst,
      competition: text(firstValue(event, ['competitionName', 'leagueName', 'competition']), ''),
    };
  }).filter((game) => game.result !== '—' || game.goalsFor !== null);

  parsed.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  return parsed.slice(0, 5).reverse();
}

type StandingProfile = { id: string; name: string; logo: string | string[] | null; season: SeasonStats };

function standingEntries(raw: unknown): ApiRecord[] {
  const root = unwrap(raw);
  const found: ApiRecord[] = [];
  const seen = new Set<object>();
  const visit = (value: unknown, depth: number) => {
    if (depth > 10 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    const item = asRecord(value);
    if (!item || seen.has(item)) return;
    seen.add(item);

    const hasTeam = item.team !== undefined || item.teamId !== undefined || item.id !== undefined;
    const hasStats = Array.isArray(item.stats) || Array.isArray(item.statistics);
    if (hasTeam && hasStats) found.push(item);

    for (const key of ['children', 'groups', 'standings', 'entries', 'tables', 'stages', 'data', 'payload']) {
      if (item[key] !== undefined) visit(item[key], depth + 1);
    }
  };
  visit(root, 0);
  return found;
}

function seasonFromEntry(entry: ApiRecord): SeasonStats {
  const stats = list(entry, ['stats', 'statistics']);
  const position = directNumber(entry, ['position', 'rank'])
    ?? statNumber(stats, ['rank', 'position', 'leaguePosition']);
  const played = directNumber(entry, ['played', 'playedGames', 'gamesPlayed'])
    ?? statNumber(stats, ['played', 'playedGames', 'gamesPlayed', 'appearances', 'games']);
  const wins = directNumber(entry, ['wins', 'won']) ?? statNumber(stats, ['wins', 'won']);
  const draws = directNumber(entry, ['draws', 'draw', 'ties']) ?? statNumber(stats, ['draws', 'draw', 'ties']);
  const losses = directNumber(entry, ['losses', 'lost']) ?? statNumber(stats, ['losses', 'lost']);
  const points = directNumber(entry, ['points']) ?? statNumber(stats, ['points', 'pts']);
  const goalsFor = directNumber(entry, ['goalsFor', 'goalsScored'])
    ?? statNumber(stats, ['goalsFor', 'goalsScored', 'goals', 'gf', 'pointsFor']);
  const goalsAgainst = directNumber(entry, ['goalsAgainst', 'goalsConceded'])
    ?? statNumber(stats, ['goalsAgainst', 'goalsConceded', 'ga', 'pointsAgainst']);
  const goalDifference = directNumber(entry, ['goalDifference', 'goalDiff'])
    ?? statNumber(stats, ['goalDifference', 'goalDiff', 'gd', 'pointDifferential']);
  const resolvedGoalsFor = goalsFor ?? (goalsAgainst !== null && goalDifference !== null ? goalsAgainst + goalDifference : null);
  const form = parseFormString(firstValue(entry, ['form']) ?? statNumber(stats, ['form', 'lastFive', 'last5']));
  const resolvedLosses = losses ?? (played !== null && wins !== null && draws !== null
    ? Math.max(0, played - wins - draws)
    : null);
  const ppg = points !== null && played !== null && played > 0 ? points / played
    : wins !== null && draws !== null && played !== null && played > 0
      ? (wins * 3 + draws) / played
      : null;

  return {
    position,
    played,
    wins,
    draws,
    losses: resolvedLosses,
    points,
    goalsFor: resolvedGoalsFor,
    goalsAgainst,
    goalDifference: goalDifference ?? (resolvedGoalsFor !== null && goalsAgainst !== null ? resolvedGoalsFor - goalsAgainst : null),
    pointsPerGame: ppg,
    goalsForPerGame: resolvedGoalsFor !== null && played !== null && played > 0 ? resolvedGoalsFor / played : null,
    goalsAgainstPerGame: goalsAgainst !== null && played !== null && played > 0 ? goalsAgainst / played : null,
    form,
  };
}

function standingsProfiles(raw: unknown): StandingProfile[] {
  return standingEntries(raw).map((entry) => {
    const team = record(entry.team);
    const id = text(firstValue(team, ['id', 'teamId', 'uid']) ?? firstValue(entry, ['teamId', 'id', 'uid']));
    const name = typeof entry.team === 'string'
      ? entry.team
      : teamNameOf(entry, text(firstValue(entry, ['teamName', 'name']), ''));
    return {
      id,
      name,
      logo: logoOf(firstValue(team, ['logo', 'logos']) ?? firstValue(entry, ['logo', 'logos', 'crest'])),
      season: seasonFromEntry(entry),
    };
  }).filter((entry) => Boolean(entry.id || entry.name));
}

function percentile(value: number | null, values: Array<number | null>, higherIsBetter = true): number | null {
  if (value === null) return null;
  const valid = values.filter((item): item is number => item !== null && Number.isFinite(item));
  if (valid.length < 2) return null;
  const adjusted = higherIsBetter ? valid : valid.map((item) => -item);
  const target = higherIsBetter ? value : -value;
  const lower = adjusted.filter((item) => item < target).length;
  const equal = adjusted.filter((item) => item === target).length;
  if (adjusted.every((item) => item === adjusted[0])) return 50;
  return Math.max(0, Math.min(100, ((lower + Math.max(0, equal - 1) / 2) / (adjusted.length - 1)) * 100));
}

function pairScore(value: number | null, opponent: number | null, higherIsBetter = true): number | null {
  if (value === null || opponent === null) return null;
  if (value === opponent) return 50;
  const current = higherIsBetter ? value : -value;
  const other = higherIsBetter ? opponent : -opponent;
  return Math.max(0, Math.min(100, 50 + ((current - other) / (Math.abs(current) + Math.abs(other) + 1)) * 50));
}

function makeBaseProfile(identity: { id: string; name: string; logo: string | string[] | null }, recentGames: RecentGame[], season: SeasonStats): TeamStatsProfile {
  const form = recentGames.map((game) => game.result).filter((item) => item !== '—');
  const recentPoints = form.length ? form.reduce((total, result) => total + formPoints(result), 0) : null;
  const scored = recentGames.map((game) => game.goalsFor).filter((item): item is number => item !== null);
  const conceded = recentGames.map((game) => game.goalsAgainst).filter((item): item is number => item !== null);
  const recentGoalsFor = scored.length ? scored.reduce((sum, item) => sum + item, 0) : null;
  const recentGoalsAgainst = conceded.length ? conceded.reduce((sum, item) => sum + item, 0) : null;
  const cleanSheets = conceded.length ? conceded.filter((item) => item === 0).length : null;
  return {
    ...identity,
    recentGames,
    recentForm: form,
    recentPoints,
    recentGoalsFor,
    recentGoalsAgainst,
    cleanSheets,
    season,
    strength: { season: null, form: null, attack: null, defence: null },
    overallStrength: null,
  };
}

function addStrength(home: TeamStatsProfile, away: TeamStatsProfile, league: StandingProfile[]) {
  const seasonValues = league.map((item) => item.season.pointsPerGame);
  const attackValues = league.map((item) => item.season.goalsForPerGame);
  const defenceValues = league.map((item) => item.season.goalsAgainstPerGame);

  const formValue = (profile: TeamStatsProfile) => profile.recentPoints !== null && profile.recentForm.length
    ? (profile.recentPoints / (profile.recentForm.length * 3)) * 100
    : null;
  const attackPerGame = (profile: TeamStatsProfile) => {
    if (profile.season.goalsForPerGame !== null) return profile.season.goalsForPerGame;
    const scoredMatches = profile.recentGames.filter((game) => game.goalsFor !== null).length;
    return profile.recentGoalsFor !== null && scoredMatches ? profile.recentGoalsFor / scoredMatches : null;
  };
  const defencePerGame = (profile: TeamStatsProfile) => {
    if (profile.season.goalsAgainstPerGame !== null) return profile.season.goalsAgainstPerGame;
    const concededMatches = profile.recentGames.filter((game) => game.goalsAgainst !== null).length;
    return profile.recentGoalsAgainst !== null && concededMatches ? profile.recentGoalsAgainst / concededMatches : null;
  };

  const homeAttack = attackPerGame(home);
  const awayAttack = attackPerGame(away);
  const homeDefence = defencePerGame(home);
  const awayDefence = defencePerGame(away);
  const metricScore = (value: number | null, opponent: number | null, distribution: Array<number | null>, higherIsBetter = true) => {
    const available = distribution.filter((item): item is number => item !== null && Number.isFinite(item));
    return available.length >= 5 ? percentile(value, available, higherIsBetter) : pairScore(value, opponent, higherIsBetter);
  };

  home.strength = {
    season: metricScore(home.season.pointsPerGame, away.season.pointsPerGame, seasonValues),
    form: formValue(home),
    attack: metricScore(homeAttack, awayAttack, attackValues),
    defence: metricScore(homeDefence, awayDefence, defenceValues, false),
  };
  away.strength = {
    season: metricScore(away.season.pointsPerGame, home.season.pointsPerGame, seasonValues),
    form: formValue(away),
    attack: metricScore(awayAttack, homeAttack, attackValues),
    defence: metricScore(awayDefence, homeDefence, defenceValues, false),
  };

  const components: Array<keyof StrengthComponents> = ['season', 'form', 'attack', 'defence'];
  const weights: Record<keyof StrengthComponents, number> = { season: 30, form: 30, attack: 20, defence: 20 };
  const shared = components.filter((key) => home.strength[key] !== null && away.strength[key] !== null);
  const totalWeight = shared.reduce((sum, key) => sum + weights[key], 0);
  if (!totalWeight) return;
  const overall = (profile: TeamStatsProfile) => Math.round(
    shared.reduce((sum, key) => sum + (profile.strength[key] ?? 0) * weights[key], 0) / totalWeight,
  );
  home.overallStrength = overall(home);
  away.overallStrength = overall(away);
}

function competitorsOf(event: ApiRecord): ApiRecord[] {
  const direct = array(event.competitors);
  if (direct.length >= 2) return direct;
  const competitions = array(event.competitions);
  for (const competition of competitions) {
    const competitors = array(competition.competitors);
    if (competitors.length >= 2) return competitors;
  }
  const competition = record(event.competition);
  return array(competition.competitors);
}

function eventCandidates(raw: unknown): ApiRecord[] {
  const root = unwrap(raw);
  const output: ApiRecord[] = [];
  const seen = new Set<object>();
  const visit = (value: unknown, depth: number) => {
    if (depth > 9 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    const item = asRecord(value);
    if (!item || seen.has(item)) return;
    seen.add(item);
    if (competitorsOf(item).length >= 2) output.push(item);
    for (const key of ['events', 'series', 'seasonseries', 'items', 'matches', 'data', 'payload']) {
      if (item[key] !== undefined) visit(item[key], depth + 1);
    }
  };
  visit(root, 0);
  return output;
}

function completedEvent(event: ApiRecord): boolean {
  const status = record(event.status);
  const type = record(status.type);
  if (event.completed === false || type.completed === false || status.completed === false) return false;
  const state = text(type.state ?? status.state).toLowerCase();
  return type.completed === true || status.completed === true || state === 'post' || state === 'finished'
    || type.state === undefined || type.state === null;
}

function eventDateOf(event: ApiRecord): string | null {
  const competitions = array(event.competitions);
  return text(firstValue(event, ['date', 'gameDate', 'startDate']) ?? firstValue(competitions[0] ?? {}, ['date', 'startDate'])) || null;
}

function parseHeadToHead(raw: unknown, homeId: string, awayId: string, homeName: string, awayName: string): HeadToHeadMatch[] {
  return eventCandidates(raw).map((event, index): HeadToHeadMatch | null => {
    const competitors = competitorsOf(event);
    if (competitors.length < 2) return null;
    const byId = (id: string, name: string) => competitors.find((candidate) => {
      const candidateId = teamIdentifier(candidate);
      const candidateName = teamNameOf(candidate, '');
      return (id && candidateId === id) || (!id && candidateName && normalise(candidateName) === normalise(name));
    });
    const selectedHome = byId(homeId, homeName);
    const selectedAway = byId(awayId, awayName);
    if (!selectedHome || !selectedAway || selectedHome === selectedAway) return null;

    const pastHome = competitors.find((candidate) => text(candidate.homeAway).toLowerCase() === 'home')
      ?? competitors[0];
    const pastAway = competitors.find((candidate) => text(candidate.homeAway).toLowerCase() === 'away')
      ?? competitors.find((candidate) => candidate !== pastHome);
    if (!pastHome || !pastAway) return null;

    const selectedHomeScore = numeric(selectedHome.score);
    const selectedAwayScore = numeric(selectedAway.score);
    let homeResult: FormResult = '—';
    if (selectedHomeScore !== null && selectedAwayScore !== null) {
      homeResult = selectedHomeScore > selectedAwayScore ? 'W' : selectedHomeScore < selectedAwayScore ? 'L' : 'D';
    } else if (selectedHome.winner === true) homeResult = 'W';
    else if (selectedAway.winner === true) homeResult = 'L';
    if (homeResult === '—' || !completedEvent(event)) return null;

    return {
      id: text(firstValue(event, ['id', 'uid']), `h2h-${index}`),
      date: eventDateOf(event),
      competition: text(firstValue(event, ['competitionName', 'roundName', 'leagueName'])
        ?? firstValue(array(event.competitions)[0] ?? {}, ['name', 'shortName']), ''),
      homeScore: numeric(pastHome.score),
      awayScore: numeric(pastAway.score),
      homeResult,
      matchHomeName: teamNameOf(pastHome, homeName),
      matchAwayName: teamNameOf(pastAway, awayName),
      matchHomeLogo: logoOf(firstValue(record(pastHome.team), ['logo', 'logos']) ?? firstValue(pastHome, ['logo', 'logos'])),
      matchAwayLogo: logoOf(firstValue(record(pastAway.team), ['logo', 'logos']) ?? firstValue(pastAway, ['logo', 'logos'])),
    };
  }).filter((item): item is HeadToHeadMatch => Boolean(item));
}

function parseH2hFromLastFive(raw: unknown, homeId: string, awayId: string, homeName: string, awayName: string, homeLogo: string | string[] | null, awayLogo: string | string[] | null): HeadToHeadMatch[] {
  if (!homeId || !awayId) return [];
  const matches: HeadToHeadMatch[] = [];
  const groups = recentGameGroups(raw);
  groups.forEach((group) => {
    const groupTeamId = teamIdentifier(group);
    if (groupTeamId !== homeId && groupTeamId !== awayId) return;

    for (const [index, event] of list(group, ['events', 'games', 'matches']).entries()) {
      const pastHomeId = text(firstValue(event, ['homeTeamId', 'homeId']));
      const pastAwayId = text(firstValue(event, ['awayTeamId', 'awayId']));
      const teamsMatch = (pastHomeId === homeId && pastAwayId === awayId)
        || (pastHomeId === awayId && pastAwayId === homeId);
      if (!teamsMatch) continue;
      const rawHomeScore = numeric(event.homeTeamScore ?? event.homeScore);
      const rawAwayScore = numeric(event.awayTeamScore ?? event.awayScore);
      if (rawHomeScore === null || rawAwayScore === null) continue;

      const currentHomeScore = pastHomeId === homeId ? rawHomeScore : rawAwayScore;
      const currentAwayScore = pastHomeId === homeId ? rawAwayScore : rawHomeScore;
      const homeResult: FormResult = currentHomeScore > currentAwayScore ? 'W' : currentHomeScore < currentAwayScore ? 'L' : 'D';
      const pastHomeIsCurrentHome = pastHomeId === homeId;

      matches.push({
        id: text(firstValue(event, ['id', 'uid']), `${groupTeamId}-${index}-${event.gameDate ?? ''}`),
        date: text(firstValue(event, ['gameDate', 'date'])) || null,
        competition: text(firstValue(event, ['competitionName', 'roundName', 'leagueName']), ''),
        homeScore: rawHomeScore,
        awayScore: rawAwayScore,
        homeResult,
        matchHomeName: pastHomeIsCurrentHome ? homeName : awayName,
        matchAwayName: pastHomeIsCurrentHome ? awayName : homeName,
        matchHomeLogo: pastHomeIsCurrentHome ? homeLogo : awayLogo,
        matchAwayLogo: pastHomeIsCurrentHome ? awayLogo : homeLogo,
      });
    }
  });
  return matches;
}

function displayStatLabel(key: string, row?: ApiRecord): string {
  const aliases: Record<string, string> = {
    possessionpct: 'Possession', possession: 'Possession', shotsontarget: 'Shots on target',
    totalshots: 'Total shots', woncorners: 'Corners', cornerkicks: 'Corners', foulscommitted: 'Fouls',
    yellowcards: 'Yellow cards', redcards: 'Red cards', saves: 'Saves', offsides: 'Offsides',
    accuratepasses: 'Accurate passes', totalpasses: 'Passes', passpct: 'Pass completion',
    accuratecrosses: 'Accurate crosses', totalcrosses: 'Crosses', crosspct: 'Cross accuracy',
    effectivelongballs: 'Accurate long balls', accuratelongballs: 'Accurate long balls', longballpct: 'Long-ball accuracy',
    effectiveclearance: 'Clearances', totalclearance: 'Clearances', effectivetackles: 'Tackles',
    tacklepct: 'Tackle success', totaltackles: 'Tackles', interceptions: 'Interceptions', blockedshots: 'Blocked shots',
    penaltykickgoals: 'Penalty goals', penaltykickshots: 'Penalties taken',
  };
  const normal = normalise(key);
  const explicit = text(firstValue(row ?? {}, ['label', 'displayName', 'shortDisplayName']));
  const neatExplicit = explicit ? explicit.replace(/\s+/g, ' ').trim().replace(/^[A-Z ]+$/, (value) => value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())) : '';
  return (aliases[normal] ?? neatExplicit) || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function statCategory(key: string, label: string): ComparisonStat['category'] {
  const value = normalise(`${key} ${label}`);
  if (/possession|pass|longball/.test(value)) return 'possession';
  if (/shot|goal|penalty|corner|scor|cross/.test(value)) return 'attack';
  if (/save|tackle|interception|clearance|block/.test(value)) return 'defence';
  if (/foul|card|offside/.test(value)) return 'discipline';
  return 'other';
}

function formattedBoxscoreValue(raw: unknown, key: string, label: string): { display: string; number: number | null } {
  if (raw === null || raw === undefined || raw === '') return { display: '—', number: null };
  const number = numeric(raw);
  if (number === null) return { display: String(raw), number: null };
  const percentLike = /pct|percent|%/.test(normalise(`${key} ${label}`));
  if (percentLike && number >= 0 && number <= 1) {
    const value = Number((number * 100).toFixed(1));
    return { display: `${value}%`, number: value };
  }
  if (percentLike && !String(raw).includes('%')) return { display: `${number}%`, number };
  return { display: String(raw), number };
}

function boxscoreStats(raw: unknown, homeId: string, awayId: string): ComparisonStat[] {
  const root = record(unwrap(raw));
  const boxscore = record(root.boxscore ?? record(root.summary).boxscore ?? root);
  const teams = list(boxscore, ['teams', 'teamStats']);
  if (teams.length < 2) return [];

  const findSide = (side: 'home' | 'away', id: string) => teams.find((team) => {
    const nested = record(team.team);
    const teamId = text(firstValue(nested, ['id', 'teamId']) ?? firstValue(team, ['teamId', 'id']));
    return text(team.homeAway).toLowerCase() === side || Boolean(id && teamId === id);
  });
  const home = findSide('home', homeId) ?? teams[0];
  const away = findSide('away', awayId) ?? teams.find((item) => item !== home);
  if (!home || !away) return [];

  const collect = (team: ApiRecord) => list(team, ['statistics', 'stats', 'teamStats']);
  const homeStats = collect(home);
  const awayStats = collect(away);
  const keyFor = (row: ApiRecord) => text(firstValue(row, ['name', 'abbreviation', 'type', 'displayName', 'label']));
  const allKeys = [...new Set([...homeStats, ...awayStats].map(keyFor).filter(Boolean))];

  return allKeys.map((key): ComparisonStat | null => {
    const match = (rows: ApiRecord[]) => rows.find((row) => normalise(keyFor(row)) === normalise(key));
    const homeRow = match(homeStats);
    const awayRow = match(awayStats);
    const label = displayStatLabel(key, homeRow ?? awayRow);
    const homeRaw = homeRow ? firstValue(homeRow, ['displayValue', 'value', 'summary']) : undefined;
    const awayRaw = awayRow ? firstValue(awayRow, ['displayValue', 'value', 'summary']) : undefined;
    if (homeRaw === undefined && awayRaw === undefined) return null;
    const homeValue = formattedBoxscoreValue(homeRaw, key, label);
    const awayValue = formattedBoxscoreValue(awayRaw, key, label);
    return {
      key: normalise(key),
      label,
      home: homeValue.display,
      away: awayValue.display,
      homeNumber: homeValue.number,
      awayNumber: awayValue.number,
      category: statCategory(key, label),
    };
  }).filter((item): item is ComparisonStat => Boolean(item));
}

function emptySeason(): SeasonStats {
  return {
    position: null, played: null, wins: null, draws: null, losses: null, points: null,
    goalsFor: null, goalsAgainst: null, goalDifference: null, pointsPerGame: null,
    goalsForPerGame: null, goalsAgainstPerGame: null, form: [],
  };
}

export function buildFixtureStatsModel(input: {
  fixture: ApiRecord;
  presentation?: MatchPresentation;
  lastFive: unknown;
  standings: unknown;
  headToHead: unknown;
  boxscore: unknown;
}): FixtureStatsModel {
  const { fixture, presentation } = input;
  const payload = record(fixture.payload);
  const summary = record(payload.summary);
  const homeIdentity = teamIdentity(fixture, presentation, 'home');
  const awayIdentity = teamIdentity(fixture, presentation, 'away');

  // Prefer the dedicated read endpoints; fall back to the same raw summary fields embedded in a fixture row.
  const standingsRaw = input.standings ?? summary.standings;
  const lastFiveRaw = input.lastFive ?? summary.lastFiveGames;
  const headToHeadRaw = input.headToHead ?? summary.seasonseries;
  const boxscoreRaw = input.boxscore ?? summary.boxscore;

  const standings = standingsProfiles(standingsRaw);
  const findStanding = (id: string, name: string) => standings.find((item) =>
    (id && item.id === id) || (!id && item.name && normalise(item.name) === normalise(name))
    || (item.name && normalise(item.name) === normalise(name)),
  );
  const homeStanding = findStanding(homeIdentity.id, homeIdentity.name);
  const awayStanding = findStanding(awayIdentity.id, awayIdentity.name);
  const homeRecent = parseRecentGames(lastFiveRaw, homeIdentity.id, homeIdentity.name);
  const awayRecent = parseRecentGames(lastFiveRaw, awayIdentity.id, awayIdentity.name);
  const home = makeBaseProfile(homeIdentity, homeRecent, homeStanding?.season ?? emptySeason());
  const away = makeBaseProfile(awayIdentity, awayRecent, awayStanding?.season ?? emptySeason());
  addStrength(home, away, standings);

  const fixtureDate = presentation?.fixtureDate ?? text(firstValue(fixture, ['fixtureDate', 'date', 'kickoffTime', 'matchDate']));
  const currentEventId = text(firstValue(fixture, ['eventId', 'fixtureId', 'id', '_id', 'uid']));
  const directH2h = parseHeadToHead(headToHeadRaw, homeIdentity.id, awayIdentity.id, homeIdentity.name, awayIdentity.name);
  const fallbackH2h = parseH2hFromLastFive(lastFiveRaw, homeIdentity.id, awayIdentity.id, homeIdentity.name, awayIdentity.name, homeIdentity.logo, awayIdentity.logo);
  const cutoff = fixtureDate ? new Date(fixtureDate).getTime() : Date.now();
  const allH2h = [...directH2h, ...fallbackH2h]
    .filter((match) => match.id !== currentEventId)
    .filter((match) => !match.date || !Number.isFinite(cutoff) || new Date(match.date).getTime() <= cutoff)
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  const seenH2h = new Set<string>();
  const headToHead = allH2h.filter((match) => {
    const unique = match.id || `${match.date}-${match.homeScore}-${match.awayScore}`;
    if (seenH2h.has(unique)) return false;
    seenH2h.add(unique);
    return true;
  }).slice(0, 5);
  const headToHeadSummary = headToHead.reduce((result, match) => {
    if (match.homeResult === 'W') result.homeWins += 1;
    else if (match.homeResult === 'L') result.awayWins += 1;
    else if (match.homeResult === 'D') result.draws += 1;
    return result;
  }, { homeWins: 0, draws: 0, awayWins: 0 });

  const liveStats = boxscoreStats(boxscoreRaw, homeIdentity.id, awayIdentity.id);
  const updatedAt = text(firstValue(record(boxscoreRaw), ['collectedAt', 'updatedAt', 'fetchedAt', 'lastUpdatedAt'])
    ?? firstValue(record(summary.meta), ['lastUpdatedAt']));

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
    updatedAt: updatedAt || null,
  };
}

export function resultTone(result: FormResult): string {
  if (result === 'W') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  if (result === 'D') return 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400';
  if (result === 'L') return 'border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400';
  return 'border-border bg-muted text-muted-foreground';
}

export function formatStat(value: number | null, suffix = '', decimals = 1): string {
  if (value === null || !Number.isFinite(value)) return '—';
  const rounded = Number(value.toFixed(decimals));
  return `${rounded}${suffix}`;
}

export function shortDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: '2-digit' }).format(date);
}


