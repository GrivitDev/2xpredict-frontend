'use client';


import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import Image from 'next/image';

import {
  getLeagues,
  getFixtures,
  getPastResults,
  getStandings,
  type League,
  type Match,
} from '@/services/sports.service';

import { LoaderCircle } from 'lucide-react';

import LeagueSelector from '@/components/livescore/LeagueSelector';

import LiveMatches from '@/components/livescore/LiveMatches';

import TodayMatches from '@/components/livescore/TodayMatches';

import UpcomingFixtures from '@/components/livescore/UpcomingFixtures';

import Results from '@/components/livescore/Results';

import LeagueTable from '@/components/livescore/LeagueTable';

import LivescoreFilters
from '@/components/livescore/LivescoreFilters';
import LeagueHeader from '@/components/livescore/LeagueHeader';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { LiveScoreAds } from '@/components/ads/ExtAds/positions/LiveScoreAds';




export default function LivescorePage(){



  const [
    leagues,
    setLeagues,
  ] = useState<League[]>([]);



  const [
    selectedLeague,
    setSelectedLeague,
  ] = useState('');



  const [
    matches,
    setMatches,
  ] = useState<Match[]>([]);



  const [
    results,
    setResults,
  ] = useState<Match[]>([]);



  const [
    table,
    setTable,
  ] = useState<any[]>([]);



  const [
    loading,
    setLoading,
  ] = useState(true);


const [search, setSearch] = useState('');

const [selectedDate, setSelectedDate] = useState('');

const [goalFilter, setGoalFilter] = useState('');

const [pointsFilter, setPointsFilter] = useState('');

const [resultFilter, setResultFilter] = useState<
  'all' | 'home' | 'away' | 'draw'
>('all');

const resetFilters = () => {

  setSearch('');

  setSelectedDate('');

  setGoalFilter('');

  setPointsFilter('');

  setResultFilter('all');

};




  // =========================
  // LOAD LEAGUES
  // =========================

  useEffect(()=>{


    async function loadLeagues(){

      try{

        const data =
          await getLeagues();


        setLeagues(
          data,
        );


      }

      finally{

        setLoading(false);

      }


    }


    loadLeagues();


  },[]);









  // =========================
  // LOAD SELECTED LEAGUE DATA
  // =========================

  useEffect(()=>{


    if(!selectedLeague){

      return;

    }



    async function loadLeagueData(){


      const [
        fixtures,
        pastResults,
        standings,
      ] = await Promise.all([


        getFixtures(
          selectedLeague,
        ),


        getPastResults(
          selectedLeague,
        ),


        getStandings(
          selectedLeague,
        ),


      ]);



      setMatches(
        fixtures,
      );


      setResults(
        pastResults,
      );


      setTable(
        standings,
      );



    }



    loadLeagueData();



  },[
    selectedLeague,
  ]);








const activeLeague = useMemo(()=>{

  return leagues.find(
    league =>
      league.code === selectedLeague
  );

},[
  leagues,
  selectedLeague,
]);
 


const filteredMatches = useMemo(() => {

  return matches.filter(match => {

    // Search
    if (search) {

      const q = search.toLowerCase();

      const found =

        match.homeTeam.toLowerCase().includes(q) ||

        match.awayTeam.toLowerCase().includes(q) ||

        (match.venue ?? '')
          .toLowerCase()
          .includes(q);

      if (!found) {

        return false;

      }

    }

    // Date
    if (selectedDate) {

      const matchDate =
        new Date(match.date)
          .toISOString()
          .split('T')[0];

      if (matchDate !== selectedDate) {

        return false;

      }

    }

    return true;

  });

}, [
  matches,
  search,
  selectedDate,
]);


const filteredResults = useMemo(() => {

  return results.filter(match => {

    // Search
    if (search) {

      const q = search.toLowerCase();

      const found =

        match.homeTeam.toLowerCase().includes(q) ||

        match.awayTeam.toLowerCase().includes(q) ||

        (match.venue ?? '')
          .toLowerCase()
          .includes(q);

      if (!found) {

        return false;

      }

    }

    // Date
    if (selectedDate) {

      const matchDate =
        new Date(match.date)
          .toISOString()
          .split('T')[0];

      if (matchDate !== selectedDate) {

        return false;

      }

    }

    // Goals
    if (goalFilter) {

      const goals =

        (match.homeScore ?? 0) +

        (match.awayScore ?? 0);

      if (goals < Number(goalFilter)) {

        return false;

      }

    }

    // Result
    if (resultFilter === 'home') {

      if ((match.homeScore ?? 0) <= (match.awayScore ?? 0)) {

        return false;

      }

    }

    if (resultFilter === 'away') {

      if ((match.awayScore ?? 0) <= (match.homeScore ?? 0)) {

        return false;

      }

    }

    if (resultFilter === 'draw') {

      if ((match.homeScore ?? 0) !== (match.awayScore ?? 0)) {

        return false;

      }

    }

    return true;

  });

}, [
  results,
  search,
  selectedDate,
  goalFilter,
  resultFilter,
]);


const filteredTable = useMemo(() => {

  return table.filter(team => {

    if (search) {

      if (
        !team.team
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {

        return false;

      }

    }

    if (pointsFilter) {

      if (team.points < Number(pointsFilter)) {

        return false;

      }

    }

    return true;

  });

}, [
  table,
  search,
  pointsFilter,
]);





if(loading){


  return (

    <main
      className="
        min-h-screen
        bg-background
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          flex
          flex-col
          items-center
          gap-5
        "
      >

        <LoaderCircle
          className="
            h-12
            w-12
            animate-spin
            text-primary
          "
        />


        <div
          className="
            text-center
          "
        >

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Match Analysis
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            LiveScore
          </p>


          <p
            className="
              mt-2
              text-xs
              text-muted-foreground
            "
          >
            Stay ahead, get the results faster
          </p>

        </div>


      </div>


    </main>

  );


}









  return (

        <main
          className="
            min-h-screen
            w-full
            overflow-x-hidden
            bg-background
            py-5
          "
        >
<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>

<LiveScoreAds />

        <div
          className="
            mx-auto
            w-full
            max-w-5xl
            space-y-2
            px-3
            sm:px-4
          "
        >




<section
  className="
    flex
    items-center
    gap-4
    px-12
  "
>



  {/* TEXT */}

  <div>


    <h1
      className="
        text-2xl
        font-black
        leading-none
        tracking-tight
        sm:text-2xl
      "
    >
      Live Scores
    </h1>


    <p
      className="
        max-w-lg
        text-sm
        text-muted-foreground
        sm:text-base
      "
    >
      Stay ahead with real-time fixtures, results and
      league standings.
    </p>

  </div>

</section>









                <LeagueSelector

                  leagues={
                    leagues
                  }

                  selectedLeague={
                    selectedLeague
                  }

                  onSelect={
                    setSelectedLeague
                  }

                />




          {
            selectedLeague && (

              <LivescoreFilters

                search={search}

                selectedDate={selectedDate}

                goalFilter={goalFilter}

                pointsFilter={pointsFilter}

                resultFilter={resultFilter}

                onSearchChange={setSearch}

                onDateChange={setSelectedDate}

                onGoalFilterChange={setGoalFilter}

                onPointsFilterChange={setPointsFilter}

                onResultFilterChange={setResultFilter}

                onReset={resetFilters}

              />

            )
          }

                  {
                    activeLeague && (

                      <LeagueHeader
                        league={activeLeague}
                      />

                    )
                  }

        {
          selectedLeague && (

            <>


              <LiveMatches
                    matches={
                      filteredMatches.filter(
                        match =>
                          match.status === 'IN_PLAY' ||
                          match.status === 'PAUSED'
                      )
                    }
                  />
            <InternalAds
  page={AdPage.HOME}
  position={AdPosition.INLINE}
/>
                  <TodayMatches
                    matches={filteredMatches}
                  />

                  <UpcomingFixtures
                    fixtures={filteredMatches}
                  />

                  <Results
                    results={filteredResults}
                  />
        <InternalAds
          page={AdPage.HOME}
          position={AdPosition.HERO}
        />
                  <LeagueTable
                    table={filteredTable}
                  />

            </>

          )
        }





      </div>



    </main>

  );

}