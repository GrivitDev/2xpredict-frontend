export type FormResult = 'W' | 'D' | 'L' | '—';

export type RecentGame = {
  id: string;
  date: string | null;
  opponent: string;
  opponentLogo: string | string[] | null;
  score: string;
  result: FormResult;
  goalsFor: number | null;
  goalsAgainst: number | null;
  competition: string;
};

export type SeasonStats = {
  position: number | null;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  points: number | null;
  goalsFor: number | null;
  goalsAgainst: number | null;
  goalDifference: number | null;
  pointsPerGame: number | null;
  goalsForPerGame: number | null;
  goalsAgainstPerGame: number | null;
  form: FormResult[];
};

export type StrengthComponents = {
  season: number | null;
  form: number | null;
  attack: number | null;
  defence: number | null;
};

export type TeamStatsProfile = {
  id: string;
  name: string;
  logo: string | string[] | null;
  recentGames: RecentGame[];
  recentForm: FormResult[];
  recentPoints: number | null;
  recentGoalsFor: number | null;
  recentGoalsAgainst: number | null;
  cleanSheets: number | null;
  season: SeasonStats;
  strength: StrengthComponents;
  overallStrength: number | null;
};

export type HeadToHeadMatch = {
  id: string;
  date: string | null;
  competition: string;
  /** Scores in the order of the teams as they played in the historical fixture. */
  homeScore: number | null;
  awayScore: number | null;
  /** Result from the perspective of the current fixture's home team. */
  homeResult: FormResult;
  matchHomeName: string;
  matchAwayName: string;
  matchHomeLogo: string | string[] | null;
  matchAwayLogo: string | string[] | null;
};

export type ComparisonStat = {
  key: string;
  label: string;
  home: string;
  away: string;
  homeNumber: number | null;
  awayNumber: number | null;
  category: 'attack' | 'possession' | 'defence' | 'discipline' | 'other';
};

export type FixtureStatsModel = {
  home: TeamStatsProfile;
  away: TeamStatsProfile;
  headToHead: HeadToHeadMatch[];
  headToHeadSummary: {
    homeWins: number;
    draws: number;
    awayWins: number;
  };
  liveStats: ComparisonStat[];
  liveStatsAvailable: boolean;
  standingsAvailable: boolean;
  recentFormAvailable: boolean;
  headToHeadAvailable: boolean;
  updatedAt: string | null;
};

export type FixtureStatsTab = 'overview' | 'form' | 'season' | 'h2h' | 'live';


