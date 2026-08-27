import type {
  Match,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

export interface MatchScore {
  home: number | null;
  away: number | null;
}


// ============================================================
// SCORE
// ============================================================

export function getResultScore(
  match: Match | undefined,
): MatchScore {

  if (!match) {

    return {
      home: null,
      away: null,
    };

  }


  const home =
    match.homeScore;

  const away =
    match.awayScore;


  return {

    home:
      typeof home === 'number'
        ? home
        : Number.isFinite(
            Number(home),
          )
          ? Number(home)
          : null,

    away:
      typeof away === 'number'
        ? away
        : Number.isFinite(
            Number(away),
          )
          ? Number(away)
          : null,

  };

}


// ============================================================
// RESULT MAP
// ============================================================

export function createResultMap(
  results: Match[],
): Map<string, MatchScore> {

  const map =
    new Map<
      string,
      MatchScore
    >();


  for (
    const result of results
  ) {

    if (!result?.id) {
      continue;
    }


    map.set(
      String(result.id),
      getResultScore(result),
    );

  }


  return map;
}


// ============================================================
// FIND SCORE
// ============================================================

export function findMatchScore(
  results: Match[],
  matchId?: string | number | null,
): MatchScore {

  if (
    matchId === undefined ||
    matchId === null
  ) {

    return {
      home: null,
      away: null,
    };

  }


  const result =
    results.find(
      match =>
        String(match.id) ===
        String(matchId),
    );


  return getResultScore(
    result,
  );

}