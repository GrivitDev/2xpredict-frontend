'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import Image from 'next/image';
import api from '@/lib/axios';

import PredictionModal from '@/components/predictions/PredictionModal';

import PredictionCard from '@/components/predictions/PredictionCard';

import PredictionTable from '@/components/predictions/PredictionTable';

import PredictionPagination from '@/components/predictions/PredictionPagination';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { PredictionsAds } from '@/components/ads/ExtAds/positions/PredictionsAds';



export default function PredictionsPage(){


  const [
    predictions,
    setPredictions,
  ] = useState<any[]>([]);



  const [
    selected,
    setSelected,
  ] = useState<any | null>(null);




  const [
    loading,
    setLoading,
  ] = useState(true);




  // FILTERS


  const [
    search,
    setSearch,
  ] = useState('');



  const [
    league,
    setLeague,
  ] = useState('all');



  const [
    minConfidence,
    setMinConfidence,
  ] = useState(0);



  const [
    dateFilter,
    setDateFilter,
  ] = useState('all');





  // PAGINATION


  const [
    page,
    setPage,
  ] = useState(1);



  const ITEMS_PER_PAGE = 10;





  useEffect(()=>{


    const fetchPredictions = async()=>{


      try{


        const res =
          await api.get('/predictions');


        setPredictions(
          res.data
        );


      }

      finally{

        setLoading(false);

      }


    };



    fetchPredictions();



  },[]);









  const filtered =
    useMemo(()=>{


      const now =
        Date.now();



      return predictions

        .filter((prediction)=>{


          const matchTime =
            new Date(
              prediction.matchDate
            ).getTime();




          if(
            league !== 'all' &&
            prediction.leagueCode !== league
          ){

            return false;

          }




          if(
            search &&
            !(
              prediction.homeTeam
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
              ||

              prediction.awayTeam
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            )
          ){

            return false;

          }





          if(
            prediction.confidence <
            minConfidence
          ){

            return false;

          }






          if(
            dateFilter === 'upcoming' &&
            matchTime < now
          ){

            return false;

          }





          if(
            dateFilter === 'past' &&
            matchTime > now
          ){

            return false;

          }





          return true;


        })


        .sort((a,b)=>{


          const aTime =
            new Date(
              a.matchDate
            ).getTime();



          const bTime =
            new Date(
              b.matchDate
            ).getTime();



          const aPast =
            aTime < now;



          const bPast =
            bTime < now;




          if(
            aPast !== bPast
          ){

            return aPast ? 1 : -1;

          }



          return aTime - bTime;


        });



    },[
      predictions,
      search,
      league,
      minConfidence,
      dateFilter,
    ]);







  useEffect(()=>{

    const timeout = setTimeout(()=>{
      setPage(1);
    }, 0);

    return () => clearTimeout(timeout);

  },[
    search,
    league,
    minConfidence,
    dateFilter,
  ]);







  const leagues =
    useMemo(()=>{


      return Array.from(
        new Set(
          predictions.map(
            (p)=>
              p.leagueCode
          )
        )
      );


    },[
      predictions
    ]);







  const totalPages =
    Math.ceil(
      filtered.length /
      ITEMS_PER_PAGE
    );






  const paginated =
    filtered.slice(

      (page - 1) *
      ITEMS_PER_PAGE,

      page *
      ITEMS_PER_PAGE

    );









  return (

    <div
      className="
        space-y-8
      "
    >






      {/* HEADER */}

<div
  className="
    relative
    overflow-hidden
    rounded-3xl
    border
    border-border
    bg-card
    p-3
    sm:p-4
  "
>

<div
  className="
    relative
    space-y-5
  "
>

  <div
    className="
      flex
      items-center
      gap-1
      -mb-3
    "
  >

    <Image

      src="/logo.png"

      alt="HonestPredict"

      width={64}

      height={64}

      className="
        h-14
        w-14
        object-contain
        shrink-0
      "

    />



    <span
      className="
        text-lg
        font-black
        uppercase
        tracking-[0.3em]
        text-primary
      "
    >

      HonestPredict

    </span>

  </div>



  <div>

    <h1
      className="
        text-2xl
        font-black
        tracking-tight
      "
    >

      Prediction Hub

    </h1>



    <p
      className="
        max-w-3xl
        text-sm
        leading-7
        text-muted-foreground
        sm:text-base
      "
    >

      Professional football predictions with detailed match analysis & confidence ratings.

    </p>

  </div>

</div>

</div>









      {/* FILTERS */}



      <div

        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-3
          rounded-3xl
          border
          border-border
          bg-card/70
          backdrop-blur-xl
          p-4
        "

      >



        <input

          value={search}

          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }

          placeholder="
            Search teams...
          "

          className="
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            outline-none
          "

        />







        <select

          value={league}

          onChange={(e)=>
            setLeague(
              e.target.value
            )
          }

          className="
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
          "

        >

          <option value="all">
            All Leagues
          </option>


          {
            leagues.map((item)=>(

              <option
                key={item}
                value={item}
              >

                {item}

              </option>

            ))
          }


        </select>








        <select

          value={minConfidence}

          onChange={(e)=>
            setMinConfidence(
              Number(
                e.target.value
              )
            )
          }

          className="
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
          "

        >

          <option value={0}>
            All Confidence
          </option>

          <option value={50}>
            50%+
          </option>

          <option value={70}>
            70%+
          </option>

          <option value={80}>
            80%+
          </option>


        </select>








        <select

          value={dateFilter}

          onChange={(e)=>
            setDateFilter(
              e.target.value
            )
          }

          className="
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
          "

        >

          <option value="all">
            All Matches
          </option>

          <option value="upcoming">
            Upcoming
          </option>

          <option value="past">
            Past
          </option>


        </select>




      </div>









      {
        loading && (

          <div
            className="
              rounded-3xl
              border
              p-10
              text-center
              text-muted-foreground
            "
          >

            Loading predictions...

          </div>

        )
      }









      {
        !loading &&
        paginated.length === 0 && (

          <div
            className="
              rounded-3xl
              border
              p-10
              text-center
            "
          >

            <h3
              className="
                font-semibold
              "
            >

              No predictions found

            </h3>


            <p
              className="
                text-sm
                text-muted-foreground
                mt-2
              "
            >

              Try changing your filters.

            </p>


          </div>

        )
      }









      {
        !loading &&
        paginated.length > 0 && (

          <>

            {/* DESKTOP */}

            <PredictionTable

              predictions={
                paginated
              }

              onSelect={
                setSelected
              }

            />





            {/* MOBILE */}

            <div
              className="
                lg:hidden
                space-y-4
              "
            >

              {
                paginated.map(
                  (prediction)=>(

                    <PredictionCard

                      key={
                        prediction._id
                      }

                      prediction={
                        prediction
                      }

                      onClick={()=>
                        setSelected(
                          prediction
                        )
                      }

                    />

                  )
                )
              }

            </div>


          </>

        )
      }









      <PredictionPagination

        page={
          page
        }

        totalPages={
          totalPages
        }

        onChange={
          setPage
        }

      />








      {
        selected && (

          <PredictionModal

            prediction={
              selected
            }

            onClose={()=>
              setSelected(null)
            }

          />

        )
      }
<PredictionsAds />

      <InternalAds
  page={AdPage.HOME}
  position={AdPosition.BOTTOM}
/>

<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>
    </div>
    

  );

}