'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useQuery,
} from '@tanstack/react-query';

import {
  getLeagues,
  getFixtures,
  getLiveMatches,
  getPastResults,
  getStandings,
  splitMatches,
  type CompetitionStandingsResponse,
  type League,
  type Match,
} from '@/services/sports.service';


// ============================================================
// CACHE / REFRESH SETTINGS
// ============================================================
//
// Keep these intentionally different.
//
// LEAGUES:
// Rarely changes.
//
// FIXTURES:
// Can change during the day.
//
// RESULTS:
// Changes whenever matches finish.
//
// STANDINGS:
// Changes whenever completed matches affect the table.
//
// LIVE:
// Must refresh frequently.
//

const LEAGUES_STALE_TIME =
  1000 *
  60 *
  60 *
  12;


const LEAGUES_GC_TIME =
  1000 *
  60 *
  60 *
  24;


const FIXTURES_STALE_TIME =
  1000 *
  60 *
  15;


const FIXTURES_GC_TIME =
  1000 *
  60 *
  60;


const RESULTS_STALE_TIME =
  1000 *
  60 *
  5;


const RESULTS_GC_TIME =
  1000 *
  60 *
  30;


const STANDINGS_STALE_TIME =
  1000 *
  60 *
  5;


const STANDINGS_GC_TIME =
  1000 *
  60 *
  30;


const LIVE_STALE_TIME =
  1000 *
  20;


const LIVE_GC_TIME =
  1000 *
  60 *
  5;


// ============================================================
// QUERY KEYS
// ============================================================

export const livescoreKeys = {

  all: [
    'livescore',
  ] as const,


  leagues: () => [
    ...livescoreKeys.all,
    'leagues',
  ] as const,


  live: () => [
    ...livescoreKeys.all,
    'live',
  ] as const,


  fixtures: (
    leagueCode: string,
  ) => [
    ...livescoreKeys.all,
    'fixtures',
    leagueCode,
  ] as const,


  results: (
    leagueCode: string,
  ) => [
    ...livescoreKeys.all,
    'results',
    leagueCode,
  ] as const,


  standings: (
    leagueCode: string,
  ) => [
    ...livescoreKeys.all,
    'standings',
    leagueCode,
  ] as const,

};


// ============================================================
// RANDOM COMPETITION
// ============================================================

function getRandomLeague(
  leagues: League[],
): League | null {

  if (
    !leagues.length
  ) {

    return null;

  }


  const index =
    Math.floor(
      Math.random() *
      leagues.length,
    );


  return (
    leagues[index] ??
    null
  );

}


// ============================================================
// HOOK
// ============================================================

export function useLivescore() {

  // ==========================================================
  // LEAGUES
  // ==========================================================

  const leaguesQuery =
    useQuery<League[]>({

      queryKey:
        livescoreKeys.leagues(),

      queryFn:
        getLeagues,

      staleTime:
        LEAGUES_STALE_TIME,

      gcTime:
        LEAGUES_GC_TIME,

      refetchOnMount:
        false,

      refetchOnWindowFocus:
        false,

      refetchOnReconnect:
        false,

    });


  // ==========================================================
  // SELECTED COMPETITION
  // ==========================================================

  const [
    selectedLeagueCode,
    setSelectedLeagueCode,
  ] = useState('');


  // ==========================================================
  // SELECTED COUNTRY
  // ==========================================================

  const selectedCountry =
    useMemo(() => {

      if (
        !selectedLeagueCode ||
        !leaguesQuery.data?.length
      ) {

        return '';

      }


      return (
        leaguesQuery.data.find(
          league =>
            league.code ===
            selectedLeagueCode,
        )?.country ??
        ''
      );

    }, [
      leaguesQuery.data,
      selectedLeagueCode,
    ]);


  // ==========================================================
  // INITIAL RANDOM COMPETITION
  // ==========================================================

  useEffect(() => {

    if (
      selectedLeagueCode ||
      !leaguesQuery.data?.length
    ) {

      return;

    }


    const randomLeague =
      getRandomLeague(
        leaguesQuery.data,
      );


    if (!randomLeague) {

      return;

    }


    setSelectedLeagueCode(
      randomLeague.code,
    );

  }, [
    leaguesQuery.data,
    selectedLeagueCode,
  ]);


  // ==========================================================
  // ACTIVE COMPETITION
  // ==========================================================

  const selectedLeague =
    useMemo(
      () => {

        return (
          leaguesQuery.data?.find(
            league =>
              league.code ===
              selectedLeagueCode,
          ) ??
          null
        );

      },
      [
        leaguesQuery.data,
        selectedLeagueCode,
      ],
    );


  // ==========================================================
  // SELECT COMPETITION
  // ==========================================================

  const selectLeague =
    useCallback(
      (
        leagueCode: string,
      ) => {

        setSelectedLeagueCode(
          leagueCode,
        );

      },
      [],
    );


  // ==========================================================
  // SELECT COUNTRY
  // ==========================================================

  const selectCountry =
    useCallback(
      (
        country: string,
      ) => {

        const countryLeagues =
          leaguesQuery.data?.filter(
            league =>
              league.country ===
              country,
          ) ?? [];


        const firstLeague =
          countryLeagues[0];


        setSelectedLeagueCode(
          firstLeague?.code ??
          '',
        );

      },
      [
        leaguesQuery.data,
      ],
    );


  // ==========================================================
  // CLEAR COMPETITION
  // ==========================================================

  const clearLeague =
    useCallback(() => {

      setSelectedLeagueCode('');

    }, []);


  // ==========================================================
  // LIVE MATCHES
  //
  // Live data is always allowed to refresh.
  // ==========================================================

  const liveQuery =
    useQuery<Match[]>({

      queryKey:
        livescoreKeys.live(),

      queryFn:
        getLiveMatches,

      staleTime:
        LIVE_STALE_TIME,

      gcTime:
        LIVE_GC_TIME,

      refetchInterval:
        60 * 1000,

      refetchIntervalInBackground:
        true,

      refetchOnMount:
        true,

      refetchOnWindowFocus:
        false,

      refetchOnReconnect:
        true,

    });


  const liveMatches =
    liveQuery.data ?? [];


  // ==========================================================
  // FIXTURES
  // ==========================================================

  const fixturesQuery =
    useQuery<Match[]>({

      queryKey:
        livescoreKeys.fixtures(
          selectedLeagueCode,
        ),

      queryFn:
        () =>
          getFixtures(
            selectedLeagueCode,
          ),

      enabled:
        Boolean(
          selectedLeagueCode,
        ),

      staleTime:
        FIXTURES_STALE_TIME,

      gcTime:
        FIXTURES_GC_TIME,

      refetchOnMount:
        true,

      refetchOnWindowFocus:
        false,

      refetchOnReconnect:
        true,

    });


  // ==========================================================
  // RESULTS
  // ==========================================================

  const resultsQuery =
    useQuery<Match[]>({

      queryKey:
        livescoreKeys.results(
          selectedLeagueCode,
        ),

      queryFn:
        () =>
          getPastResults(
            selectedLeagueCode,
          ),

      enabled:
        Boolean(
          selectedLeagueCode,
        ),

      staleTime:
        RESULTS_STALE_TIME,

      gcTime:
        RESULTS_GC_TIME,

      refetchOnMount:
        true,

      refetchOnWindowFocus:
        false,

      refetchOnReconnect:
        true,

    });


  // ==========================================================
  // STANDINGS
  // ==========================================================

  const standingsQuery =
    useQuery<CompetitionStandingsResponse>({

      queryKey:
        livescoreKeys.standings(
          selectedLeagueCode,
        ),

      queryFn:
        () =>
          getStandings(
            selectedLeagueCode,
          ),

      enabled:
        Boolean(
          selectedLeagueCode,
        ),

      staleTime:
        STANDINGS_STALE_TIME,

      gcTime:
        STANDINGS_GC_TIME,

      refetchOnMount:
        true,

      refetchOnWindowFocus:
        false,

      refetchOnReconnect:
        true,

    });


  // ==========================================================
  // DATA
  // ==========================================================

  const matches =
    fixturesQuery.data ?? [];


  const results =
    resultsQuery.data ?? [];


  const standings =
    standingsQuery.data ??
    null;


  // ==========================================================
  // SELECTED COMPETITION MATCH SPLIT
  // ==========================================================

  const {
    upcomingMatches,
  } =
    useMemo(
      () =>
        splitMatches(
          matches,
        ),
      [
        matches,
      ],
    );


  // ==========================================================
  // LOADING
  // ==========================================================

  const isLoading =
    leaguesQuery.isLoading ||
    (
      Boolean(
        selectedLeagueCode,
      ) &&
      (
        fixturesQuery.isLoading ||
        resultsQuery.isLoading ||
        standingsQuery.isLoading
      )
    );


  // ==========================================================
  // FETCHING
  // ==========================================================

  const isFetching =
    leaguesQuery.isFetching ||
    liveQuery.isFetching ||
    fixturesQuery.isFetching ||
    resultsQuery.isFetching ||
    standingsQuery.isFetching;


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    // --------------------------------------------------------
    // LEAGUES
    // --------------------------------------------------------

    leagues:
      leaguesQuery.data ?? [],

    selectedLeague,

    selectedLeagueCode,

    selectedCountry,

    selectLeague,

    selectCountry,

    clearLeague,


    // --------------------------------------------------------
    // MATCHES
    // --------------------------------------------------------

    matches,

    fixtures:
      matches,

    liveMatches,

    upcomingMatches,


    // --------------------------------------------------------
    // RESULTS
    // --------------------------------------------------------

    results,


    // --------------------------------------------------------
    // STANDINGS
    // --------------------------------------------------------

    standings,


    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    isLoading,

    isFetching,


    isLoadingLeagues:
      leaguesQuery.isLoading,

    isLoadingLive:
      liveQuery.isLoading,

    isLoadingFixtures:
      fixturesQuery.isLoading,

    isLoadingResults:
      resultsQuery.isLoading,

    isLoadingStandings:
      standingsQuery.isLoading,


    isFetchingLeagues:
      leaguesQuery.isFetching,

    isFetchingLive:
      liveQuery.isFetching,

    isFetchingFixtures:
      fixturesQuery.isFetching,

    isFetchingResults:
      resultsQuery.isFetching,

    isFetchingStandings:
      standingsQuery.isFetching,


    // --------------------------------------------------------
    // ERRORS
    // --------------------------------------------------------

    leaguesError:
      leaguesQuery.error,

    liveError:
      liveQuery.error,

    fixturesError:
      fixturesQuery.error,

    resultsError:
      resultsQuery.error,

    standingsError:
      standingsQuery.error,

  };

}