export type BetLabCompatibilityPick = {
  eventId: string;
  eventName?: string;
  marketCode: string;
  selectionCode: string;
  selectionName?: string;
  marketName?: string;
};

type SelectionOutcome = 'WIN' | 'PUSH' | 'LOSE';

const SCORE_MARKETS = new Set([
  'MATCH_RESULT',
  'DOUBLE_CHANCE',
  'DRAW_NO_BET',
  'TOTAL_GOALS_OVER_UNDER',
  'HOME_TEAM_GOALS_OVER_UNDER',
  'AWAY_TEAM_GOALS_OVER_UNDER',
  'ASIAN_HANDICAP',
  'BOTH_TEAMS_TO_SCORE',
  'FIRST_HALF_TOTAL_GOALS',
  'HALF_TIME_RESULT',
]);

const STAT_MARKETS = new Set([
  'TOTAL_CORNERS_OVER_UNDER',
  'TOTAL_SHOTS_OVER_UNDER',
  'TOTAL_SHOTS_ON_TARGET_OVER_UNDER',
  'TOTAL_CARDS_OVER_UNDER',
  'TOTAL_FOULS_OVER_UNDER',
  'TOTAL_OFFSIDES_OVER_UNDER',
]);

const EPSILON = 1e-8;
const SCORE_SEARCH_CEILING = 12;
const STAT_SEARCH_CEILING = 60;

/**
 * Validates the active 16-market Bet Lab catalogue against shared match and
 * statistic outcomes. A fixture can contribute only one selection per market.
 *
 * The Home-or-Away (12) double-chance option is intentionally not combinable
 * with a full-time 1X2 selection. Although the two can overlap on a home or
 * away win, 12 is treated as a separate no-draw proposition and is not offered
 * as a redundant companion to a specific match-result selection.
 */
export function findBetLabSelectionCompatibilityError(
  selections: readonly BetLabCompatibilityPick[],
): string | null {
  const byFixture = new Map<string, BetLabCompatibilityPick[]>();
  const marketByFixture = new Map<string, Set<string>>();
  const seen = new Set<string>();

  for (const selection of selections) {
    const eventId = String(selection.eventId);
    const marketCode = selection.marketCode.toUpperCase();
    const selectionCode = selection.selectionCode.toUpperCase();
    const identity = `${eventId}::${marketCode}::${selectionCode}`;
    if (seen.has(identity)) {
      return `"${selection.selectionName ?? selection.selectionCode}" is already on your slip.`;
    }
    seen.add(identity);

    const usedMarkets = marketByFixture.get(eventId) ?? new Set<string>();
    if (usedMarkets.has(marketCode)) {
      const marketName = selection.marketName || marketCode.replace(/_/g, ' ').toLowerCase();
      return `Only one selection is allowed from ${marketName} for the same match. Remove the current selection before choosing another.`;
    }
    usedMarkets.add(marketCode);
    marketByFixture.set(eventId, usedMarkets);

    const group = byFixture.get(eventId) ?? [];
    group.push(selection);
    byFixture.set(eventId, group);
  }

  for (const fixtureSelections of byFixture.values()) {
    const fixtureName = fixtureSelections[0].eventName ?? 'This fixture';
    const matchResult = fixtureSelections.find((item) => item.marketCode.toUpperCase() === 'MATCH_RESULT');
    const doubleChance = fixtureSelections.find((item) => item.marketCode.toUpperCase() === 'DOUBLE_CHANCE');

    if (
      matchResult &&
      doubleChance &&
      doubleChance.selectionCode.toUpperCase() === 'HOME_OR_AWAY'
    ) {
      return `${fixtureName}: Home-or-Away (12) cannot be combined with a full-time match-result selection.`;
    }

    const scoreSelections = fixtureSelections.filter((item) =>
      SCORE_MARKETS.has(item.marketCode.toUpperCase()),
    );
    if (scoreSelections.length && !hasPossibleScoreline(scoreSelections)) {
      return `${fixtureName} already has selections that contradict this choice.`;
    }

    const shotSelections = fixtureSelections.filter((item) =>
      ['TOTAL_SHOTS_OVER_UNDER', 'TOTAL_SHOTS_ON_TARGET_OVER_UNDER'].includes(
        item.marketCode.toUpperCase(),
      ),
    );
    if (shotSelections.length && !hasPossibleShotCounts(shotSelections)) {
      return `${fixtureName} already has incompatible shots and shots-on-target selections.`;
    }
    if (
      scoreSelections.length &&
      shotSelections.length &&
      !hasPossibleSharedScoreAndShotOutcomes(scoreSelections, shotSelections)
    ) {
      return `${fixtureName}: selected goals cannot be supported by the selected shots-on-target outcome.`;
    }

    // Corners, cards, fouls and offsides are separate count outcomes. They do
    // not have a deterministic relationship with the scoreline or each other.
    // Duplicate picks within any one of these markets have already been
    // rejected by the one-selection-per-market rule above.
    for (const item of fixtureSelections) {
      const marketCode = item.marketCode.toUpperCase();
      if (STAT_MARKETS.has(marketCode) && !isValidOverUnderSelection(item.selectionCode)) {
        return `${fixtureName}: ${item.selectionCode} is not a valid ${marketCode.replace(/_/g, ' ').toLowerCase()} selection.`;
      }
    }
  }

  return null;
}

function hasPossibleScoreline(selections: readonly BetLabCompatibilityPick[]): boolean {
  for (let homeGoals = 0; homeGoals <= SCORE_SEARCH_CEILING; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= SCORE_SEARCH_CEILING; awayGoals += 1) {
      for (let halfHome = 0; halfHome <= homeGoals; halfHome += 1) {
        for (let halfAway = 0; halfAway <= awayGoals; halfAway += 1) {
          let hasWin = false;
          let possible = true;
          for (const item of selections) {
            const outcome = scoreOutcome(item, homeGoals, awayGoals, halfHome, halfAway);
            if (outcome === 'LOSE') {
              possible = false;
              break;
            }
            if (outcome === 'WIN') hasWin = true;
          }
          if (possible && hasWin) return true;
        }
      }
    }
  }
  return false;
}

function scoreOutcome(
  item: BetLabCompatibilityPick,
  homeGoals: number,
  awayGoals: number,
  halfHome: number,
  halfAway: number,
): SelectionOutcome {
  const market = item.marketCode.toUpperCase();
  const code = item.selectionCode.toUpperCase();
  const line = parseSelectionLine(code);

  switch (market) {
    case 'MATCH_RESULT':
      return resultOutcome(homeGoals, awayGoals, code);
    case 'HALF_TIME_RESULT':
      return resultOutcome(halfHome, halfAway, code);
    case 'DOUBLE_CHANCE': {
      const outcomes = doubleChanceOutcomes(code);
      return outcomes?.has(matchResult(homeGoals, awayGoals)) ? 'WIN' : 'LOSE';
    }
    case 'DRAW_NO_BET':
      if (homeGoals === awayGoals) return 'PUSH';
      if (code === 'HOME_DNB') return homeGoals > awayGoals ? 'WIN' : 'LOSE';
      if (code === 'AWAY_DNB') return awayGoals > homeGoals ? 'WIN' : 'LOSE';
      return 'LOSE';
    case 'BOTH_TEAMS_TO_SCORE': {
      const bothScored = homeGoals > 0 && awayGoals > 0;
      if (code === 'YES') return bothScored ? 'WIN' : 'LOSE';
      if (code === 'NO') return bothScored ? 'LOSE' : 'WIN';
      return 'LOSE';
    }
    case 'TOTAL_GOALS_OVER_UNDER':
      return overUnderOutcome(code, line, homeGoals + awayGoals);
    case 'HOME_TEAM_GOALS_OVER_UNDER':
      return overUnderOutcome(code, line, homeGoals);
    case 'AWAY_TEAM_GOALS_OVER_UNDER':
      return overUnderOutcome(code, line, awayGoals);
    case 'FIRST_HALF_TOTAL_GOALS':
      return overUnderOutcome(code, line, halfHome + halfAway);
    case 'ASIAN_HANDICAP':
      if (line === null) return 'LOSE';
      if (code.startsWith('HOME_')) return compareWithPush(homeGoals + line, awayGoals);
      if (code.startsWith('AWAY_')) return compareWithPush(awayGoals + line, homeGoals);
      return 'LOSE';
    default:
      return 'LOSE';
  }
}

function hasPossibleSharedScoreAndShotOutcomes(
  scoreSelections: readonly BetLabCompatibilityPick[],
  shotSelections: readonly BetLabCompatibilityPick[],
): boolean {
  const scoreCanPass = new Array<boolean>(SCORE_SEARCH_CEILING * 2 + 1).fill(false);
  const scoreCanWin = new Array<boolean>(SCORE_SEARCH_CEILING * 2 + 1).fill(false);

  for (let home = 0; home <= SCORE_SEARCH_CEILING; home += 1) {
    for (let away = 0; away <= SCORE_SEARCH_CEILING; away += 1) {
      for (let halfHome = 0; halfHome <= home; halfHome += 1) {
        for (let halfAway = 0; halfAway <= away; halfAway += 1) {
          let hasWin = false;
          let hasLoss = false;
          for (const item of scoreSelections) {
            const outcome = scoreOutcome(item, home, away, halfHome, halfAway);
            if (outcome === 'LOSE') { hasLoss = true; break; }
            if (outcome === 'WIN') hasWin = true;
          }
          if (!hasLoss) {
            const totalGoals = home + away;
            scoreCanPass[totalGoals] = true;
            if (hasWin) scoreCanWin[totalGoals] = true;
          }
        }
      }
    }
  }

  const shotCanPass = new Array<boolean>(STAT_SEARCH_CEILING + 1).fill(false);
  const shotCanWin = new Array<boolean>(STAT_SEARCH_CEILING + 1).fill(false);
  for (let totalShots = 0; totalShots <= STAT_SEARCH_CEILING; totalShots += 1) {
    for (let onTarget = 0; onTarget <= totalShots; onTarget += 1) {
      let hasWin = false;
      let hasLoss = false;
      for (const item of shotSelections) {
        const isOnTarget = item.marketCode.toUpperCase() === 'TOTAL_SHOTS_ON_TARGET_OVER_UNDER';
        const value = isOnTarget ? onTarget : totalShots;
        const outcome = overUnderOutcome(
          item.selectionCode.toUpperCase(),
          parseSelectionLine(item.selectionCode),
          value,
        );
        if (outcome === 'LOSE') { hasLoss = true; break; }
        if (outcome === 'WIN') hasWin = true;
      }
      if (!hasLoss) {
        shotCanPass[onTarget] = true;
        if (hasWin) shotCanWin[onTarget] = true;
      }
    }
  }

  // A scored goal must be represented by a shot on target. Both count domains
  // are searched together so a compatible pair of markets shares one outcome.
  for (let goals = 0; goals < scoreCanPass.length; goals += 1) {
    if (!scoreCanPass[goals]) continue;
    for (let onTarget = goals; onTarget < shotCanPass.length; onTarget += 1) {
      if (
        shotCanPass[onTarget] &&
        (scoreCanWin[goals] || shotCanWin[onTarget])
      ) return true;
    }
  }
  return false;
}

function hasPossibleShotCounts(selections: readonly BetLabCompatibilityPick[]): boolean {
  // Shots on target are a subset of total shots.
  for (let totalShots = 0; totalShots <= STAT_SEARCH_CEILING; totalShots += 1) {
    for (let shotsOnTarget = 0; shotsOnTarget <= totalShots; shotsOnTarget += 1) {
      let hasWin = false;
      let possible = true;
      for (const item of selections) {
        const value = item.marketCode.toUpperCase() === 'TOTAL_SHOTS_ON_TARGET_OVER_UNDER'
          ? shotsOnTarget
          : totalShots;
        const outcome = overUnderOutcome(
          item.selectionCode.toUpperCase(),
          parseSelectionLine(item.selectionCode),
          value,
        );
        if (outcome === 'LOSE') {
          possible = false;
          break;
        }
        if (outcome === 'WIN') hasWin = true;
      }
      if (possible && hasWin) return true;
    }
  }
  return false;
}

function isValidOverUnderSelection(selectionCode: string): boolean {
  return parseSelectionLine(selectionCode) !== null && /^(OVER|UNDER)_/.test(selectionCode.toUpperCase());
}

function parseSelectionLine(selectionCode: string): number | null {
  const match = selectionCode.toUpperCase().match(/(?:OVER|UNDER)_((?:MINUS_)?\d+_\d+)|^(?:HOME|AWAY)_(MINUS_\d+_\d+|\d+_\d+)$/);
  const raw = match?.[1] ?? match?.[2];
  if (!raw) return null;
  const negative = raw.startsWith('MINUS_');
  const numeric = raw.replace(/^MINUS_/, '').replace('_', '.');
  const parsed = Number(numeric);
  return Number.isFinite(parsed) ? (negative ? -parsed : parsed) : null;
}

function overUnderOutcome(code: string, line: number | null, value: number): SelectionOutcome {
  if (line === null) return 'LOSE';
  if (code.startsWith('OVER_')) return compareWithPush(value, line);
  if (code.startsWith('UNDER_')) return compareWithPush(line, value);
  return 'LOSE';
}

function compareWithPush(left: number, right: number): SelectionOutcome {
  if (Math.abs(left - right) <= EPSILON) return 'PUSH';
  return left > right ? 'WIN' : 'LOSE';
}

function resultOutcome(home: number, away: number, code: string): SelectionOutcome {
  return matchResult(home, away) === code ? 'WIN' : 'LOSE';
}

function matchResult(home: number, away: number): 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' {
  if (home > away) return 'HOME_WIN';
  if (home < away) return 'AWAY_WIN';
  return 'DRAW';
}

function doubleChanceOutcomes(code: string): Set<string> | null {
  if (code === 'HOME_OR_DRAW') return new Set(['HOME_WIN', 'DRAW']);
  if (code === 'DRAW_OR_AWAY') return new Set(['DRAW', 'AWAY_WIN']);
  if (code === 'HOME_OR_AWAY') return new Set(['HOME_WIN', 'AWAY_WIN']);
  return null;
}
