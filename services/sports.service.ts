import api from '@/lib/axios';


// ============================================================
// TYPES
// ============================================================

export type CompetitionType =
  | 'LEAGUE'
  | 'CUP'
  | 'PLAYOFFS'
  | 'LEAGUE_CUP'
  | string;


export type CompetitionStage =
  | 'REGULAR_SEASON'
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'LAST_16'
  | 'ROUND_OF_16'
  | 'QUARTER_FINALS'
  | 'SEMI_FINALS'
  | 'THIRD_PLACE'
  | 'FINAL'
  | string;


export type MatchDuration =
  | 'REGULAR'
  | 'EXTRA_TIME'
  | 'PENALTIES'
  | string;


// ============================================================
// LEAGUE
// ============================================================

export interface League {

  code: string;

  name: string;

  country: string;

  type?: CompetitionType;

  emblem?: string;

}


// ============================================================
// GOAL EVENT
// ============================================================

export interface GoalEvent {

  minute: number;

  injuryTime?: number | null;

  type?: string;


  team?: {

    id?: number;

    name?: string;

  };


  scorer?: {

    id?: number;

    name?: string;

  };


  assist?: {

    id?: number;

    name?: string;

  };


  score?: {

    home?: number;

    away?: number;

  };

}


// ============================================================
// MATCH
// ============================================================

export interface Match {

  id: string;

  leagueCode: string;


  league?: {

    code: string;

    name: string;

    country: string;

    emblem?: string;

    type?: CompetitionType;

  };


  // ==========================================================
  // TEAMS
  // ==========================================================

  homeTeam: string;

  awayTeam: string;


  homeTeamId?: number;

  awayTeamId?: number;


  homeTeamBadge?: string;

  awayTeamBadge?: string;


  // ==========================================================
  // DATE / TIME / VENUE
  // ==========================================================

  /**
   * Original UTC timestamp.
   *
   * Example:
   * 2026-08-22T18:35:10Z
   */
  date: string;


  /**
   * UTC kickoff time.
   *
   * Example:
   * 18:35:10
   */
  time?: string;


  venue?: string;


  /**
   * Absolute UTC timestamp.
   */
  kickoffTimestamp: number;


  // ==========================================================
  // STATUS
  // ==========================================================

  status?: string;

  matchday?: number;


  // ==========================================================
  // COMPETITION
  // ==========================================================

  stage?: CompetitionStage;

  group?: string | null;


  // ==========================================================
  // LIVE INFORMATION
  // ==========================================================

  /**
   * Provider-reported match minute.
   *
   * This is authoritative.
   */
  minute?: number | null;

  injuryTime?: number | null;


  // ==========================================================
  // SCORE
  // ==========================================================

  homeScore?: number | null;

  awayScore?: number | null;


  scoreDuration?: MatchDuration;


  halfTimeHomeScore?: number | null;

  halfTimeAwayScore?: number | null;


  extraTimeHomeScore?: number | null;

  extraTimeAwayScore?: number | null;


  // ==========================================================
  // EVENTS
  // ==========================================================

  goals: GoalEvent[];

}


// ============================================================
// STANDING
// ============================================================

export interface Standing {

  position: number;

  teamId?: number;

  team: string;

  shortName?: string;

  tla?: string;

  crest?: string;


  points: number;

  playedGames: number;

  won: number;

  draw: number;

  lost: number;


  goalsFor: number;

  goalsAgainst: number;

  goalDifference: number;


  form?: string | null;

}


// ============================================================
// STANDING GROUP
// ============================================================

export interface StandingGroup {

  stage: CompetitionStage;

  group: string;

  table: Standing[];

}


// ============================================================
// KNOCKOUT MATCH
// ============================================================

export interface KnockoutMatch {

  id: string;

  homeTeam: string;

  awayTeam: string;


  homeTeamBadge?: string;

  awayTeamBadge?: string;


  date: string;

  time?: string;

  venue?: string;


  status?: string;


  minute?: number | null;

  injuryTime?: number | null;


  homeScore?: number | null;

  awayScore?: number | null;


  stage: CompetitionStage;


  goals: GoalEvent[];


  kickoffTimestamp: number;

}


// ============================================================
// KNOCKOUT STAGE
// ============================================================

export interface KnockoutStage {

  stage: CompetitionStage;

  label: string;

  matches: KnockoutMatch[];

}


// ============================================================
// COMPETITION STANDINGS
// ============================================================

export interface CompetitionStandingsResponse {

  type: CompetitionType;


  competition: {

    code: string;

    name: string;

    country: string;

    emblem?: string;

  };


  season?: {

    id?: number;

    startDate?: string;

    endDate?: string;

    currentMatchday?: number;

    stages?: CompetitionStage[];

    winner?: unknown;

  };


  table?: Standing[];

  groups?: StandingGroup[];

  knockout?: KnockoutStage[];

}


// ============================================================
// API
// ============================================================

export const getLeagues =
  async (): Promise<League[]> => {

    const res =
      await api.get(
        '/sports/leagues',
      );

    return res.data;

  };


export const getLiveMatches =
  async (): Promise<Match[]> => {

    const res =
      await api.get(
        '/sports/live',
      );

    return res.data;

  };


export const getFixtures =
  async (
    leagueCode: string,
  ): Promise<Match[]> => {

    const res =
      await api.get(
        '/sports/fixtures',
        {
          params: {
            leagueCode,
          },
        },
      );

    return res.data;

  };


export const getMatchDetails =
  async (
    matchId: string,
  ): Promise<Match> => {

    const res =
      await api.get(
        `/sports/match/${matchId}`,
      );

    return res.data;

  };


export const getPastResults =
  async (
    leagueCode: string,
  ): Promise<Match[]> => {

    const res =
      await api.get(
        '/sports/results',
        {
          params: {
            leagueCode,
          },
        },
      );

    return res.data;

  };


export const getStandings =
  async (
    leagueCode: string,
  ): Promise<CompetitionStandingsResponse> => {

    const res =
      await api.get(
        '/sports/standings',
        {
          params: {
            leagueCode,
          },
        },
      );

    return res.data;

  };


// ============================================================
// UTC FORMATTING
// ============================================================

export const formatMatchTime = (
  dateString: string,
): string => {

  const date =
    new Date(
      dateString,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return 'Date unavailable';

  }


  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'UTC',

      weekday: 'short',

      month: 'short',

      day: '2-digit',

      year: 'numeric',

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      hour12: false,
    },
  ).format(
    date,
  ) + ' UTC';

};


// ============================================================
// LIVE DATE HEADER
// ============================================================

export const formatLiveDate = (
  dateString: string,
): string => {

  const date =
    new Date(
      dateString,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return 'DATE UNAVAILABLE';

  }


  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'UTC',

      weekday: 'short',

      month: 'short',

      day: '2-digit',

      year: 'numeric',
    },
  ).format(
    date,
  ).toUpperCase() + ' UTC';

};


// ============================================================
// UTC KICKOFF TIME
// ============================================================

export const formatKickoffTime = (
  dateString: string,
): string => {

  const date =
    new Date(
      dateString,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return '--:--:-- UTC';

  }


  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'UTC',

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      hour12: false,
    },
  ).format(
    date,
  ) + ' UTC';

};


// ============================================================
// STATUS
// ============================================================

export const isLiveMatch = (
  status?: string,
): boolean => {

  return (
    status === 'IN_PLAY' ||
    status === 'PAUSED' ||
    status === 'LIVE'
  );

};


export const isActiveLiveMatch = (
  status?: string,
): boolean => {

  return (
    status === 'IN_PLAY' ||
    status === 'LIVE'
  );

};


export const isUpcomingMatch = (
  status?: string,
): boolean => {

  return status === 'SCHEDULED';

};


export const isFinishedMatch = (
  status?: string,
): boolean => {

  return status === 'FINISHED';

};


// ============================================================
// SPLIT MATCHES
// ============================================================

export const splitMatches = (
  matches: Match[],
) => {

  return {

    liveMatches:
      matches.filter(
        match =>
          isLiveMatch(
            match.status,
          ),
      ),

    upcomingMatches:
      matches.filter(
        match =>
          isUpcomingMatch(
            match.status,
          ),
      ),

    finishedMatches:
      matches.filter(
        match =>
          isFinishedMatch(
            match.status,
          ),
      ),

  };

};


// ============================================================
// STAGE LABEL
// ============================================================

export const getStageLabel = (
  stage?: string,
): string => {

  switch (stage) {

    case 'REGULAR_SEASON':
      return 'League';

    case 'GROUP_STAGE':
      return 'Group Stage';

    case 'LAST_16':
    case 'ROUND_OF_16':
      return 'Round of 16';

    case 'QUARTER_FINALS':
      return 'Quarter-finals';

    case 'SEMI_FINALS':
      return 'Semi-finals';

    case 'THIRD_PLACE':
      return 'Third-place Playoff';

    case 'FINAL':
      return 'Final';

    default:

      return (
        stage
          ?.replaceAll(
            '_',
            ' ',
          )
          .toLowerCase()
          .replace(
            /\b\w/g,
            char =>
              char.toUpperCase(),
          ) ||
        'Stage'
      );

  }

};


// ============================================================
// GOAL TIME
// ============================================================

export const getGoalTimeLabel = (
  goal: GoalEvent,
): string => {

  if (
    goal.injuryTime &&
    goal.injuryTime > 0
  ) {

    return (
      `${goal.minute}'+${goal.injuryTime}`
    );

  }


  return `${goal.minute}'`;

};


// ============================================================
// PROVIDER MATCH TIME LABEL
// ============================================================

export const getMatchTimeLabel = (
  match: Match,
): string => {

  if (
    !isLiveMatch(
      match.status,
    )
  ) {

    return '';

  }


  if (
    match.minute == null
  ) {

    return 'LIVE';

  }


  if (
    match.injuryTime &&
    match.injuryTime > 0
  ) {

    return (
      `${match.minute}'+${match.injuryTime}`
    );

  }


  return `${match.minute}'`;

};


// ============================================================
// CLOCK
// ============================================================

export type MatchClockPhase =
  | 'NOT_STARTED'
  | 'FIRST_HALF'
  | 'HALFTIME'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_HALFTIME'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES'
  | 'FULL_TIME';


export interface MatchClock {

  minute: number;

  seconds: number;

  display: string;

  phase: MatchClockPhase;

}


// ============================================================
// PROVIDER-ANCHORED CLOCK
//
// IMPORTANT:
// The API controls the minute.
//
// The frontend ONLY supplies seconds between
// provider updates.
//
// Example:
//
// API -> 62
// UI  -> 62:00
// UI  -> 62:01
// UI  -> 62:02
//
// Next API:
//
// API -> 63
// UI  -> 63:00
//
// We never calculate a new minute ourselves.
// ============================================================

export const getProviderMatchClock = (
  match: Match,
  elapsedSeconds = 0,
): MatchClock => {

  // ==========================================================
  // NOT STARTED
  // ==========================================================

  if (
    match.status === 'SCHEDULED'
  ) {

    return {

      minute: 0,

      seconds: 0,

      display: '00:00',

      phase:
        'NOT_STARTED',

    };

  }


  // ==========================================================
  // PENALTIES
  // ==========================================================

  if (
    match.scoreDuration === 'PENALTIES'
  ) {

    return {

      minute:
        match.minute ??
        120,

      seconds: 0,

      display: 'PEN',

      phase:
        'PENALTIES',

    };

  }


  // ==========================================================
  // FINISHED
  // ==========================================================

  if (
    match.status === 'FINISHED'
  ) {

    const minute =
      match.minute ??
      (
        match.scoreDuration === 'EXTRA_TIME'
          ? 120
          : 90
      );


    return {

      minute,

      seconds: 0,

      display:
        `${minute}'`,

      phase:
        'FULL_TIME',

    };

  }


  // ==========================================================
  // NO PROVIDER MINUTE
  // ==========================================================

  if (
    match.minute == null
  ) {

    return {

      minute: 0,

      seconds: 0,

      display: 'LIVE',

      phase:
        'SECOND_HALF',

    };

  }


  const minute =
    match.minute;


  // ==========================================================
  // HALFTIME
  // ==========================================================

  if (
    match.status === 'PAUSED' &&
    minute >= 45 &&
    minute < 46
  ) {

    return {

      minute,

      seconds: 0,

      display: 'HT',

      phase:
        'HALFTIME',

    };

  }


  // ==========================================================
  // EXTRA TIME HALF TIME
  // ==========================================================

  if (
    match.status === 'PAUSED' &&
    match.scoreDuration === 'EXTRA_TIME' &&
    minute >= 105 &&
    minute < 106
  ) {

    return {

      minute,

      seconds: 0,

      display: 'HT',

      phase:
        'EXTRA_TIME_HALFTIME',

    };

  }


  // ==========================================================
  // PAUSED / COOLING BREAK
  // ==========================================================

  if (
    match.status === 'PAUSED'
  ) {

    return {

      minute,

      seconds: 0,

      display:
        `${minute}:00`,

      phase:
        minute < 45
          ? 'FIRST_HALF'
          : (
              match.scoreDuration === 'EXTRA_TIME'
                ? 'EXTRA_TIME_SECOND_HALF'
                : 'SECOND_HALF'
            ),

    };

  }


  // ==========================================================
  // PROVIDER-ANCHORED SECONDS
  // ==========================================================

  const seconds =
    Math.min(
      59,
      Math.max(
        0,
        Math.floor(
          elapsedSeconds,
        ),
      ),
    );


  // ==========================================================
  // EXTRA TIME
  // ==========================================================

  if (
    match.scoreDuration === 'EXTRA_TIME'
  ) {

    return {

      minute,

      seconds,

      display:
        `${minute}:${String(
          seconds,
        ).padStart(
          2,
          '0',
        )}`,

      phase:
        minute < 105
          ? 'EXTRA_TIME_FIRST_HALF'
          : 'EXTRA_TIME_SECOND_HALF',

    };

  }


  // ==========================================================
  // NORMAL MATCH
  // ==========================================================

  return {

    minute,

    seconds,

    display:
      `${minute}:${String(
        seconds,
      ).padStart(
        2,
        '0',
      )}`,

    phase:
      minute < 45
        ? 'FIRST_HALF'
        : 'SECOND_HALF',

  };

};


// ============================================================
// COMPATIBILITY HELPERS
// ============================================================

export const getMatchClock = (
  match: Match,
): MatchClock => {

  return getProviderMatchClock(
    match,
    0,
  );

};


export const getEstimatedMatchClock = (
  match: Match,
): MatchClock => {

  return getProviderMatchClock(
    match,
    0,
  );

};


export const getMatchPhase = (
  match: Match,
): MatchClockPhase => {

  return getProviderMatchClock(
    match,
    0,
  ).phase;

};