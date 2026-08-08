'use client';

import { PredictionMarketOptions } from '@/lib/prediction-market-config';
import {
  Target,
  ChartNoAxesColumnIncreasing,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';


interface Props {

  prediction?:
    | 'HOME'
    | 'DRAW'
    | 'AWAY';

    homeTeam: string;
    awayTeam: string;

    homeTeamBadge?: string;
    awayTeamBadge?: string;

  probabilities?: {

    home:number;

    draw:number;

    away:number;

  } | null;



  markets?:
    | {
        market:string;
        selection?:string;
      }[]
    | null;

}



function getSelectionLabel(
  marketType: string,
  selection?: string,
) {
  if (!selection) {
    return '-';
  }

  const market = PredictionMarketOptions.find(
    option => option.value === marketType,
  );

  if (!market) {
    return selection;
  }

  const found = market.selections.find(
    option => option.value === selection,
  );

  return found?.label ?? selection;
}

function getPredictionLabel(
  prediction: Props['prediction'],
  homeTeam: string,
  awayTeam: string,
) {
  switch (prediction) {
    case 'HOME':
      return `${homeTeam} TO WIN`;

    case 'AWAY':
      return `${awayTeam} TO WIN`;

    case 'DRAW':
      return 'Match To End In A DRAW';

    default:
      return '-';
  }
}

function ProbabilityRow({

  label,

  value,

}:{

  label:string;

  value:number;

}){


  const strength =
    value >= 40
      ? 'High'
      : value >=25
      ? 'Medium'
      : 'Low';



  return (

    <div
      className="
        space-y-3
      "
    >


      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-sm
            text-muted-foreground
          "
        >

          {label}

        </span>



        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className={`
              text-xs
              ${
                value >= 40
                ? 'text-emerald-400'
                : 'text-muted-foreground'
              }
            `}
          >

            {strength}

          </span>


          <span
            className="
              font-bold
            "
          >

            {value}%

          </span>


        </div>


      </div>





      <div
        className="
          h-3
          rounded-full
          bg-muted
          overflow-hidden
        "
      >

        <div

          className={`
            h-full
            rounded-full
            transition-all

            ${
              value >= 40
              ? 'bg-emerald-500'
              :
              value >= 25
              ? 'bg-yellow-500'
              :
              'bg-red-500'
            }
          `}

          style={{
            width:`${value}%`,
          }}

        />


      </div>


    </div>

  );

}







export default function PredictionContent({

  prediction,

  homeTeam,

  awayTeam,

  homeTeamBadge,

  awayTeamBadge,

  probabilities,

  markets,

}: Props) {

const predictionBadge =
  prediction === 'HOME'
    ? homeTeamBadge
    : prediction === 'AWAY'
    ? awayTeamBadge
    : undefined;

  return (

    <div
      className="
        space-y-6
      "
    >







      {/* MAIN PREDICTION */}



      <div

        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-emerald-500/30
          bg-emerald-500/10
          p-6
        "

      >



        <div

          className="
            absolute
            right-0
            top-0
            h-32
            w-32
            rounded-full
            bg-emerald-500/20
            blur-3xl
          "

        />




<div
  className="
    relative
    flex
    items-center
    gap-5
  "
>

  <div
    className="
      flex
      items-center
      justify-center
      overflow-hidden
      -m-3
    "
  >

    {
      prediction === 'DRAW'
        ? (

          <div
            className="
              flex
              -space-x-3
            "
          >

            {
              homeTeamBadge && (

                <Image
                  src={homeTeamBadge}
                  alt={homeTeam}
                  width={84}
                  height={84}
                />

              )
            }

            {
              awayTeamBadge && (

                <Image
                  src={awayTeamBadge}
                  alt={awayTeam}
                  width={84}
                  height={84}
                />

              )
            }

          </div>

        )
        : (

          predictionBadge && (

            <Image
              src={predictionBadge}
              alt={
                prediction === 'HOME'
                  ? homeTeam
                  : awayTeam
              }
              width={84}
              height={84}
              className="object-contain"
            />

          )

        )
    }

  </div>



  <div
    className="
      flex-1
    "
  >




    <h2
      className="
        text-2xl
        font-black
        text-emerald-400
      "
    >

      {
        getPredictionLabel(
          prediction,
          homeTeam,
          awayTeam,
        )
      }

    </h2>

  </div>


</div>


      </div>









      {/* PROBABILITY */}



      {
        probabilities && (

          <section

            className="
              rounded-3xl
              border
              border-border
              bg-card/70
              p-6
              space-y-6
            "

          >


            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <ChartNoAxesColumnIncreasing
                size={20}
              />


              <h3
                className="
                  font-bold
                "
              >

                Probability Analysis

              </h3>


            </div>





<ProbabilityRow

  label={`${homeTeam}`}

  value={
    probabilities.home
  }

/>

<ProbabilityRow

  label="Draw"

  value={
    probabilities.draw
  }

/>

<ProbabilityRow

  label={`${awayTeam}`}

  value={
    probabilities.away
  }

/>



          </section>

        )
      }









      {/* MARKETS */}



      {
        !!markets?.length && (


          <section

            className="
              rounded-3xl
              border
              border-border
              bg-card/70
              p-6
              space-y-5
            "

          >



            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <ShieldCheck
                size={20}
              />


              <h3
                className="
                  font-bold
                "
              >

                Available Markets

              </h3>


            </div>







            <div
              className="
                space-y-3
              "
            >

              {
                markets.map(
                  (market,index)=>(


                    <div

                      key={index}

                      className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        border-border
                        bg-muted/30
                        p-4
                        transition
                        hover:bg-muted/50
                      "

                    >


                      <span
                        className="
                          text-sm
                          text-muted-foreground
                        "
                      >

                        {market.market}

                      </span>



                      <span

                        className="
                          rounded-full
                          bg-emerald-500/10
                          px-3
                          py-1
                          text-sm
                          font-bold
                          text-emerald-400
                        "

                      >

                        {
                          getSelectionLabel(
                            market.market,
                            market.selection,
                          )
                        }

                      </span>



                    </div>


                  )
                )
              }


            </div>



          </section>


        )
      }






    </div>

  );

}