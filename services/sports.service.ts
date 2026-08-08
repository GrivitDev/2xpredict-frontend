import api from '@/lib/axios';


// =========================
// TYPES
// =========================

export interface League {

  code:string;

  name:string;

  country:string;

  type?:string;

  emblem?:string;

}



export interface Match {


  id:string;


  leagueCode:string;


  league?:{

    code:string;

    name:string;

    country:string;

    emblem?:string;

  };


  homeTeam:string;

  awayTeam:string;


  homeTeamBadge?:string;

  awayTeamBadge?:string;


  date:string;


  time?:string;

 venue?:string;
 
  status?:string;


  matchday?:number;


  homeScore?:number | null;

  awayScore?:number | null;


  kickoffTimestamp:number;

}



export interface Standing {


  position:number;


  teamId?:number;


  team:string;


  shortName?:string;


  tla?:string;


  crest?:string;


  points:number;


  playedGames:number;


  won:number;


  draw:number;


  lost:number;


  goalsFor:number;


  goalsAgainst:number;


  goalDifference:number;


  form?:string | null;

}



// =========================
// LEAGUES
// =========================

export const getLeagues = async ():Promise<League[]> => {


  const res = await api.get(
    '/sports/leagues'
  );


  return res.data;

};




// =========================
// FIXTURES
// =========================

export const getFixtures = async (
  leagueCode:string,
):Promise<Match[]> => {


  const res = await api.get(
    '/sports/fixtures',
    {
      params:{
        leagueCode,
      },
    },
  );


  return res.data;

};




// =========================
// MATCH DETAILS
// =========================

export const getMatchDetails = async (
  matchId:string,
):Promise<Match> => {


  const res = await api.get(
    `/sports/match/${matchId}`,
  );


  return res.data;

};




// =========================
// RESULTS
// =========================

export const getPastResults = async (
  leagueCode:string,
):Promise<Match[]> => {


  const res = await api.get(
    '/sports/results',
    {
      params:{
        leagueCode,
      },
    },
  );


  return res.data;

};




// =========================
// STANDINGS
// =========================

export const getStandings = async (
  leagueCode:string,
):Promise<Standing[]> => {


  const res = await api.get(
    '/sports/standings',
    {
      params:{
        leagueCode,
      },
    },
  );


  return res.data;

};




// =========================
// HELPERS
// =========================


export const isLiveMatch = (
  status?:string,
) => {


  return (
    status === 'IN_PLAY' ||
    status === 'PAUSED'
  );

};



export const isUpcomingMatch = (
  status?:string,
) => {


  return (
    status === 'SCHEDULED'
  );

};



export const splitMatches = (
  matches:Match[],
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

  };

};