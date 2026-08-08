'use client';


import {
  useState,
} from 'react';


import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';


import toast from 'react-hot-toast';



import {
  getPredictions,
  deletePrediction,
  updatePrediction,
  settlePrediction,
} from '@/services/prediction.service';



import PredictionDetailsModal from '@/components/admin/predictions/PredictionDetailsModal';

import PredictionsFilters from '@/components/admin/predictions/PredictionsFilters';

import PredictionsTable from '@/components/admin/predictions/PredictionsTable';



import {
  getMatchStatus,
} from '@/utils/prediction.utils';



import type {
  AdminPrediction,
} from '@/types/prediction.types';





export default function AdminPredictionsPage(){



  const queryClient =
    useQueryClient();




  const {
    data = [],
    isLoading,
  } = useQuery({

    queryKey:[
      'predictions',
    ],

    queryFn:
      getPredictions,

  });




  const predictions =
    data as AdminPrediction[];





  const [
    selectedPrediction,
    setSelectedPrediction,
  ] =
    useState<AdminPrediction | null>(
      null,
    );




  const [
    settlementResult,
    setSettlementResult,
  ] =
    useState<
      'HOME'
      |
      'DRAW'
      |
      'AWAY'
      |
      'VOID'
      |
      ''
    >('');





  /*
  |--------------------------------------------------------------------------
  | FILTER STATES
  |--------------------------------------------------------------------------
  */


  const [
    search,
    setSearch,
  ] =
    useState('');



  const [
    status,
    setStatus,
  ] =
    useState('all');



  const [
    access,
    setAccess,
  ] =
    useState('all');



  const [
    league,
    setLeague,
  ] =
    useState('all');





  /*
  |--------------------------------------------------------------------------
  | LEAGUE OPTIONS
  |--------------------------------------------------------------------------
  */


  const leagueOptions =
    Array.from(

      new Map(

        predictions.map(
          (prediction)=>[

            prediction.leagueCode,

            {

              code:
                prediction.leagueCode,


              name:
                prediction.league?.name
                ||
                prediction.leagueCode,

            },

          ],
        ),

      ).values(),

    );






  /*
  |--------------------------------------------------------------------------
  | FILTERED PREDICTIONS
  |--------------------------------------------------------------------------
  */


  const filteredPredictions =
    predictions.filter(
      (prediction)=>{


        const searchMatch =
          `${prediction.homeTeam}
          ${prediction.awayTeam}
          ${prediction.league?.name}`
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          );



        const statusMatch =
          status === 'all'
          ||
          getMatchStatus(
            prediction,
          ) === status;




        const accessMatch =
          access === 'all'
          ||
          prediction.accessType === access;




        const leagueMatch =
          league === 'all'
          ||
          prediction.leagueCode === league;




        return (

          searchMatch

          &&

          statusMatch

          &&

          accessMatch

          &&

          leagueMatch

        );


      },
    );







  /*
  |--------------------------------------------------------------------------
  | OPEN MODAL
  |--------------------------------------------------------------------------
  */


  const openPrediction =
    (
      prediction:AdminPrediction,
    )=>{


      setSelectedPrediction(
        prediction,
      );


      setSettlementResult('');

    };








  /*
  |--------------------------------------------------------------------------
  | UPDATE PROBABILITIES
  |--------------------------------------------------------------------------
  */


  const updateProbability =
    (
      field:
        | 'home'
        | 'draw'
        | 'away',

      value:number,

    )=>{


      setSelectedPrediction(
        (previous)=>{


          if(!previous)
            return previous;



          return {

            ...previous,


            probabilities:{

              ...previous.probabilities,


              [field]:
                value,

            },

          };


        },
      );


    };









  /*
  |--------------------------------------------------------------------------
  | UPDATE MARKET
  |--------------------------------------------------------------------------
  */


  const updateMarketSelection =
    (
      index:number,

      value:string,

    )=>{


      setSelectedPrediction(
        (previous)=>{


          if(!previous)
            return previous;



          const markets =
            [
              ...previous.markets,
            ];



          markets[index] = {

            ...markets[index],

            selection:
              value,

          };



          return {

            ...previous,

            markets,

          };


        },
      );


    };









  const probabilityTotal =

    Number(
      selectedPrediction?.probabilities.home || 0,
    )

    +

    Number(
      selectedPrediction?.probabilities.draw || 0,
    )

    +

    Number(
      selectedPrediction?.probabilities.away || 0,
    );











  /*
  |--------------------------------------------------------------------------
  | SAVE EDIT / SETTLE
  |--------------------------------------------------------------------------
  */


  const saveEdit =
    async()=>{


      if(!selectedPrediction)
        return;




      if(
        !settlementResult
        &&
        probabilityTotal !== 100
      ){

        toast.error(
          'Probabilities must equal 100%',
        );


        return;

      }





      try{


        if(settlementResult){


          await settlePrediction(

            selectedPrediction._id,

            settlementResult,

          );


          toast.success(
            'Prediction settled successfully',
          );



        }else{


          await updatePrediction(

            selectedPrediction._id,

            {

              probabilities:
                selectedPrediction.probabilities,


              markets:
                selectedPrediction.markets,

            },

          );



          toast.success(
            'Prediction updated successfully',
          );


        }





        setSelectedPrediction(null);



        queryClient.invalidateQueries({

          queryKey:[
            'predictions',
          ],

        });



      }catch(error){


        console.error(error);


        toast.error(
          'Failed to update prediction',
        );


      }


    };









  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */


  const deleteItem =
    async()=>{


      if(!selectedPrediction)
        return;



      const confirmed =
        window.confirm(
          'Delete this prediction?',
        );



      if(!confirmed)
        return;





      try{


        await deletePrediction(

          selectedPrediction._id,

        );



        toast.success(
          'Prediction deleted',
        );



        setSelectedPrediction(null);



        queryClient.invalidateQueries({

          queryKey:[
            'predictions',
          ],

        });



      }catch(error){


        console.error(error);


        toast.error(
          'Failed to delete prediction',
        );


      }


    };








  if(isLoading){


    return (

      <div
        className="
          space-y-6
          animate-pulse
        "
      >

        <div
          className="
            h-10
            w-48
            rounded-lg
            bg-muted
          "
        />


        <div
          className="
            h-96
            rounded-2xl
            bg-muted
          "
        />


      </div>

    );


  }



  return (

    <div
      className="
        space-y-6
        animate-in
        fade-in
        slide-in-from-bottom-4
        duration-500
      "
    >


      <div
        className="
          space-y-2
        "
      >

        <h1
          className="
            text-4xl
            font-bold
            tracking-tight
          "
        >
          Predictions
        </h1>


        <p
          className="
            text-muted-foreground
          "
        >
          Manage, edit and settle football predictions.
        </p>


      </div>






      <PredictionsFilters

        search={search}

        setSearch={setSearch}


        status={status}

        setStatus={setStatus}


        access={access}

        setAccess={setAccess}


        league={league}

        setLeague={setLeague}


        leagues={
          leagueOptions
        }

      />







      <PredictionsTable

        predictions={
          filteredPredictions
        }

        onSelect={
          openPrediction
        }

      />







      {
        selectedPrediction && (

          <PredictionDetailsModal


            prediction={
              selectedPrediction
            }


            onClose={
              ()=>setSelectedPrediction(null)
            }


            settlementResult={
              settlementResult
            }


            setSettlementResult={
              setSettlementResult
            }


            probabilityTotal={
              probabilityTotal
            }


            updateProbability={
              updateProbability
            }


            updateMarketSelection={
              updateMarketSelection
            }


            saveEdit={
              saveEdit
            }


            deleteItem={
              deleteItem
            }


          />

        )
      }




    </div>

  );


}