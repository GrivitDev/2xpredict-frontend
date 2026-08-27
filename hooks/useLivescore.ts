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
// HOME PAGE API REQUESTS
//
// 1. Leagues
// 2. Live matches
// 3. Fixtures
// 4. Standings
//
// Past results are intentionally NOT fetched here.
// SettledWins handles settled-match results separately.
//
// ============================================================


// ------------------------------------------------------------
// LEAGUES
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// FIXTURES
// ------------------------------------------------------------

const FIXTURES_STALE_TIME =
  1000 *
  60 *
  15;

const FIXTURES_GC_TIME =
  1000 *
  60 *
  60;


// ------------------------------------------------------------
// STANDINGS
// ------------------------------------------------------------

const STANDINGS_STALE_TIME =
  1000 *
  60 *
  5;

const STANDINGS_GC_TIME =
  1000 *
  60 *
  30;


// ------------------------------------------------------------
// LIVE
// ------------------------------------------------------------

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

  if (!leagues.length) {
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
          (league) =>
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
            (league) =>
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
            (league) =>
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
  // This is the only continuously refreshing request.
  //
  // It refreshes once every 60 seconds.
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
  // INITIAL LOADING
  // ==========================================================
  //
  // The HomePage should remain on its loading screen until
  // ALL required HomePage data has been loaded:
  //
  // 1. Leagues
  // 2. Live matches
  // 3. Fixtures
  // 4. Standings
  //
  // SettledWins is deliberately NOT included here because
  // its results request is independent of useLivescore.
  //
  // ==========================================================

  const hasSelectedLeague =
    Boolean(
      selectedLeagueCode,
    );


  const isLoading =
    leaguesQuery.isLoading ||
    liveQuery.isLoading ||
    (
      hasSelectedLeague &&
      (
        fixturesQuery.isLoading ||
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

    isLoadingStandings:
      standingsQuery.isLoading,


    isFetchingLeagues:
      leaguesQuery.isFetching,

    isFetchingLive:
      liveQuery.isFetching,

    isFetchingFixtures:
      fixturesQuery.isFetching,

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

    standingsError:
      standingsQuery.error,

  };

}