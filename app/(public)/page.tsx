'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import LeagueSelector from '@/components/home-sections/features/LeagueSelector';
import LiveMatches from '@/components/home-sections/features/LiveMatches';
import TodayMatches from '@/components/home-sections/features/TodayMatches';
import UpcomingFixtures from '@/components/home-sections/features/UpcomingFixtures';
import Results from '@/components/home-sections/features/Results';
import CompetitionDisplay from '@/components/home-sections/features/CompetitionDisplay';
import LivescoreFilters from '@/components/home-sections/features/LivescoreFilters';

import { InternalAds } from '@/components/ads/IntAds/InternalAds';

import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';

import { LiveScoreAds } from '@/components/ads/ExtAds/positions/LiveScoreAds';

import PredictionPreview from '@/components/home-sections/PredictionsPreview';

import SettledWins from '@/components/home-sections/SettledWins';

import {
  useLivescore,
} from '@/hooks/useLivescore';


// ============================================================
// LOADING MESSAGES
// ============================================================

const loadingMessages = [
  'This will only take a few seconds...',
  'Almost there...',
  'Fetching the latest football data...',
];


// ============================================================
// PAGE
// ============================================================

export default function HomePage() {

  // ==========================================================
  // LOADING MESSAGE
  // ==========================================================

  const [
    messageIndex,
    setMessageIndex,
  ] = useState(0);


  useEffect(() => {

    const interval =
      setInterval(() => {

        setMessageIndex(
          previous =>
            (
              previous + 1
            ) %
            loadingMessages.length,
        );

      }, 4000);


    return () =>
      clearInterval(interval);

  }, []);


  // ==========================================================
  // LIVESCORE
  // ==========================================================

  const {
    leagues,
    selectedLeagueCode,
    selectLeague,

    matches,
    liveMatches,
    results,
    standings,

    isLoading,
  } = useLivescore();


  // ==========================================================
  // SELECTED COMPETITION
  // ==========================================================

  const selectedLeague =
    useMemo(() => {

      return leagues.find(
        league =>
          league.code ===
          selectedLeagueCode,
      );

    }, [
      leagues,
      selectedLeagueCode,
    ]);


  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState('');


  const [
    selectedDate,
    setSelectedDate,
  ] = useState('');


  const [
    goalFilter,
    setGoalFilter,
  ] = useState('');


  const [
    pointsFilter,
    setPointsFilter,
  ] = useState('');


  const [
    resultFilter,
    setResultFilter,
  ] = useState<
    'all' | 'home' | 'away' | 'draw'
  >('all');


  // ==========================================================
  // SECTION VIEW
  // ==========================================================

  type SectionView =
    | 'all'
    | 'predictions'
    | 'live'
    | 'today'
    | 'results'
    | 'upcoming'
    | 'table';


  const [
    sectionView,
    setSectionView,
  ] = useState<SectionView>('all');


  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters =
    useCallback(() => {

      setSearch('');

      setSelectedDate('');

      setGoalFilter('');

      setPointsFilter('');

      setResultFilter('all');

    }, []);


  // ==========================================================
  // COMPETITION CHANGE
  // ==========================================================

  const handleLeagueChange =
    useCallback(
      (
        leagueCode: string,
      ) => {

        resetFilters();

        setSectionView('all');

        selectLeague(
          leagueCode,
        );

      },
      [
        resetFilters,
        selectLeague,
      ],
    );


  // ==========================================================
  // FILTER MATCHES
  // ==========================================================

  const filteredMatches =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return matches.filter(
        match => {

          // --------------------------------------------------
          // SEARCH
          // --------------------------------------------------

          if (query) {

            const found =
              match.homeTeam
                .toLowerCase()
                .includes(query) ||

              match.awayTeam
                .toLowerCase()
                .includes(query) ||

              (
                match.venue ??
                ''
              )
                .toLowerCase()
                .includes(query);


            if (!found) {
              return false;
            }

          }


          // --------------------------------------------------
          // DATE
          // --------------------------------------------------

          if (selectedDate) {

            const matchDate =
              new Date(
                match.date,
              )
                .toISOString()
                .split('T')[0];


            if (
              matchDate !==
              selectedDate
            ) {

              return false;

            }

          }


          return true;

        },
      );

    }, [
      matches,
      search,
      selectedDate,
    ]);


  // ==========================================================
  // FILTER RESULTS
  // ==========================================================

  const filteredResults =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return results.filter(
        match => {

          // --------------------------------------------------
          // SEARCH
          // --------------------------------------------------

          if (query) {

            const found =
              match.homeTeam
                .toLowerCase()
                .includes(query) ||

              match.awayTeam
                .toLowerCase()
                .includes(query) ||

              (
                match.venue ??
                ''
              )
                .toLowerCase()
                .includes(query);


            if (!found) {
              return false;
            }

          }


          // --------------------------------------------------
          // DATE
          // --------------------------------------------------

          if (selectedDate) {

            const matchDate =
              new Date(
                match.date,
              )
                .toISOString()
                .split('T')[0];


            if (
              matchDate !==
              selectedDate
            ) {

              return false;

            }

          }


          // --------------------------------------------------
          // GOALS
          // --------------------------------------------------

          if (goalFilter) {

            const goals =
              (
                match.homeScore ??
                0
              ) +
              (
                match.awayScore ??
                0
              );


            if (
              goals <
              Number(
                goalFilter,
              )
            ) {

              return false;

            }

          }


          // --------------------------------------------------
          // HOME WIN
          // --------------------------------------------------

          if (
            resultFilter ===
            'home'
          ) {

            if (
              (
                match.homeScore ??
                0
              ) <=
              (
                match.awayScore ??
                0
              )
            ) {

              return false;

            }

          }


          // --------------------------------------------------
          // AWAY WIN
          // --------------------------------------------------

          if (
            resultFilter ===
            'away'
          ) {

            if (
              (
                match.awayScore ??
                0
              ) <=
              (
                match.homeScore ??
                0
              )
            ) {

              return false;

            }

          }


          // --------------------------------------------------
          // DRAW
          // --------------------------------------------------

          if (
            resultFilter ===
            'draw'
          ) {

            if (
              (
                match.homeScore ??
                0
              ) !==
              (
                match.awayScore ??
                0
              )
            ) {

              return false;

            }

          }


          return true;

        },
      );

    }, [
      results,
      search,
      selectedDate,
      goalFilter,
      resultFilter,
    ]);


  // ==========================================================
  // FILTER LIVE MATCHES
  // ==========================================================

  const filteredLiveMatches =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {
        return liveMatches;
      }


      return liveMatches.filter(
        match => {

          return (
            match.homeTeam
              .toLowerCase()
              .includes(query) ||

            match.awayTeam
              .toLowerCase()
              .includes(query) ||

            (
              match.venue ??
              ''
            )
              .toLowerCase()
              .includes(query)
          );

        },
      );

    }, [
      liveMatches,
      search,
    ]);


  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (isLoading) {

    return (

      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          px-3
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            gap-14
          "
        >

          {/* ==================================================
              PREMIUM LOADER
          ================================================== */}

          <div
            className="
              relative
              flex
              h-48
              w-48
              items-center
              justify-center
            "
          >

            {/* Ambient glow */}

            <div
              className="
                absolute
                inset-[-24px]
                animate-pulse
                rounded-full
                bg-primary/10
                blur-3xl
              "
            />


            {/* Outer ring */}

            <div
              className="
                absolute
                inset-0
                rounded-full
                border-[3px]
                border-primary/10
              "
            />


            {/* Main rotating ring */}

            <div
              className="
                absolute
                inset-1
                animate-spin
                rounded-full
                border-[5px]
                border-transparent
                border-b-primary/20
                border-r-primary/70
                border-t-primary
              "
              style={{
                animationDuration:
                  '1.8s',
              }}
            />


            {/* Secondary ring */}

            <div
              className="
                absolute
                inset-4
                animate-spin
                rounded-full
                border-[2px]
                border-b-primary/30
                border-l-primary/40
                border-transparent
              "
              style={{
                animationDuration:
                  '2.8s',
                animationDirection:
                  'reverse',
              }}
            />


            {/* Inner ring */}

            <div
              className="
                absolute
                inset-8
                rounded-full
                border
                border-primary/20
                bg-primary/[0.03]
              "
            />


            {/* Logo */}

            <div
              className="
                relative
                z-10
                flex
                h-28
                w-28
                items-center
                justify-center
                rounded-full
                border
                border-border/60
                bg-background/90
                shadow-[0_0_40px_rgba(7,87,213,0.18)]
                backdrop-blur-xl
              "
            >

              <div
                className="
                  absolute
                  inset-2
                  rounded-full
                  bg-primary/5
                  blur-md
                "
              />


              <Image
                src="/logo.png"
                alt="2xPredict"
                width={110}
                height={110}
                priority
                className="
                  relative
                  z-10
                  h-34
                  w-34
                  animate-pulse
                  object-contain
                "
              />

            </div>


            {/* Center pulse */}

            <div
              className="
                absolute
                h-3
                w-3
                animate-pulse
                rounded-full
                bg-primary
                shadow-[0_0_18px_rgba(7,87,213,0.7)]
              "
            />


            {/* Rotating highlight */}

            <div
              className="
                absolute
                inset-[-5px]
                animate-spin
                rounded-full
                border
                border-primary/10
              "
              style={{
                animationDuration:
                  '5s',
              }}
            />

          </div>


          {/* ==================================================
              MESSAGE
          ================================================== */}

          <div
            className="
              h-8
              overflow-hidden
            "
          >

            <p
              key={messageIndex}
              className="
                animate-loader-message
                text-center
                text-sm
                font-medium
                tracking-wide
                text-muted-foreground
              "
            >
              {
                loadingMessages[
                  messageIndex
                ]
              }
            </p>

          </div>

        </div>

      </main>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <main
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-background
        py-4
        sm:py-5
      "
    >

      {/* ====================================================
          HERO
      ==================================================== */}

      <section
        className="
          relative
          mx-auto
          -mt-3
          h-40
          w-full
          max-w-7xl
          overflow-hidden
          rounded-2xl
          sm:h-40
          sm:rounded-3xl
          lg:h-[28rem]
        "
      >

        <Image
          src="/images/banner.png"
          alt="Live Scores"
          fill
          priority
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 100vw,
            1152px
          "
          className="
            object-cover
          "
        />


        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/50
            via-black/20
            to-transparent
          "
        />

      </section>


      {/* ====================================================
          EXTERNAL ADS
      ==================================================== */}

      <LiveScoreAds />


      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <div
        className="
          mx-auto
          mt-4
          w-full
          max-w-6xl
          space-y-3
          px-3
          sm:px-4
        "
      >

        {/* ==================================================
            TOP BANNER AD
        ================================================== */}

        <InternalAds
          page={AdPage.HOME}
          position={
            AdPosition.TOP_BANNER
          }
        />





        {/* ==================================================
            FILTERS
        ================================================== */}

        {selectedLeagueCode && (

             <LivescoreFilters
            search={search}
            selectedDate={selectedDate}
            goalFilter={goalFilter}
            pointsFilter={pointsFilter}
            resultFilter={resultFilter}
            sectionView={sectionView}
            onSearchChange={setSearch}
            onDateChange={setSelectedDate}
            onGoalFilterChange={setGoalFilter}
            onPointsFilterChange={setPointsFilter}
            onResultFilterChange={setResultFilter}
            onSectionViewChange={setSectionView}
            onReset={resetFilters}
          />

        )}


            {/* ==============================================
                LIVE MATCHES
            ============================================== */}

            {(
              sectionView === 'all' ||
              sectionView === 'live'
            ) && (

              <LiveMatches
                matches={
                  filteredLiveMatches
                }
              />

            )}

        {/* ==================================================
            HERO AD
        ================================================== */}

        <InternalAds
          page={AdPage.HOME}
          position={
            AdPosition.HERO
          }
        />


        {selectedLeagueCode && (

          <>

            {/* ==============================================
                PREDICTIONS
            ============================================== */}

            {(
              sectionView === 'all' ||
              sectionView === 'predictions'
            ) && (

              <PredictionPreview
                search={search}
                selectedDate={
                  selectedDate
                }
                goalFilter={
                  goalFilter
                }
                resultFilter={
                  resultFilter
                }
              />

            )}



        {/* ==================================================
            COMPETITION SELECTOR
        ================================================== */}
        
        <LeagueSelector
          leagues={leagues}
          selectedLeague={
            selectedLeagueCode
          }
          onLeagueChange={
            handleLeagueChange
          }
        />

            {/* ==============================================
                TODAY
            ============================================== */}

            {(
              sectionView === 'all' ||
              sectionView === 'today'
            ) && (

              <TodayMatches
                matches={
                  filteredMatches
                }
              />

            )}


            {/* ==============================================
                RESULTS
            ============================================== */}

            {(
              sectionView === 'all' ||
              sectionView === 'results'
            ) && (

              <Results
                results={
                  filteredResults
                }
              />

            )}


            {/* ==================================================
                INLINE AD
            ================================================== */}

            <InternalAds
              page={AdPage.HOME}
              position={
                AdPosition.INLINE
              }
            />


            {/* ==============================================
                UPCOMING
            ============================================== */}

            {(
              sectionView === 'all' ||
              sectionView === 'upcoming'
            ) && (

              <UpcomingFixtures
                fixtures={
                  filteredMatches
                }
              />

            )}


            {/* ==============================================
                COMPETITION TABLE / CUP
            ============================================== */}

            {(
              sectionView === 'all' ||
              sectionView === 'table'
            ) && selectedLeague && standings && (

              <CompetitionDisplay

                league={
                  selectedLeague
                }

                competition={
                  standings
                }

                search={
                  search
                }

                pointsFilter={
                  pointsFilter
                }

              />

            )}


            {/* ==============================================
                SETTLED WINS
            ============================================== */}

            <SettledWins />


            {/* ==============================================
                BOTTOM AD
            ============================================== */}

            <InternalAds
              page={AdPage.HOME}
              position={
                AdPosition.BOTTOM
              }
            />


            {/* ==============================================
                POPUP AD
            ============================================== */}

            <InternalAds
              page={AdPage.HOME}
              position={
                AdPosition.POPUP
              }
            />

          </>

        )}

      </div>

    </main>

  );

}