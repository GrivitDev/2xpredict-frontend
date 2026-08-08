export interface League {
  code: string;
  name: string;
  country?: string;
  emblem?: string;

  isActive?: boolean;
  isTracked?: boolean;
  priority?: number;
}

export interface Fixture {

  fixtureId: string;

  leagueCode: string;

  leagueName: string;

  homeTeam: string;

  awayTeam: string;

  homeTeamBadge?: string;

  awayTeamBadge?: string;

  date: string;

  time?: string;

  kickoffTimestamp: number;

  status: string;

  homeScore?: number;

  awayScore?: number;

  matchday?: number;
}


export interface Standing {

  position: number;

  team: string;

  crest?: string;

  played: number;

  won: number;

  draw: number;

  lost: number;

  goalsFor: number;

  goalsAgainst: number;

  goalDifference: number;

  points: number;

  form?: string;
}


export interface LeaguePage {

  leagueCode: string;

  todayMatches: Fixture[];
    liveMatches: Fixture[];

  table: Standing[];

  fixtures: Fixture[];

  results: Fixture[];

}