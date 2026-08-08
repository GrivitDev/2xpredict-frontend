'use client';

import Image from 'next/image';
import { formatMatchTime } from '@/lib/formatMatchTime';

import ConfidenceBadge from './ConfidenceBadge';
import AccessBadge from './AccessBadge';



interface Props {

  prediction:any;

  onClick:()=>void;

}



export default function PredictionCard({
  prediction,
  onClick,
}:Props){


  return (

    <div

      onClick={onClick}

      className="
        group
        rounded-3xl
        border
        border-border
        bg-card/80
        backdrop-blur-xl
        p-5
        space-y-5
        cursor-pointer
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "

    >



      {/* HEADER */}


      <div
        className="
          flex
          items-center
          justify-between
        "
      >


        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {
            prediction.league?.emblem && (

              <Image

                src={
                  prediction.league.emblem
                }

                alt={
                  prediction.league.name
                }
                    width={40}

                  height={40}
                className="
                  h-10
                  w-10
                  object-contain
                  rounded-xl
                  bg-muted
                  p-1
                "

              />

            )
          }



          <div>

            <p
              className="
                text-sm
                font-semibold
              "
            >

              {
                prediction.league?.name ??
                prediction.leagueCode
              }

            </p>


            <p
              className="
                text-xs
                text-muted-foreground
              "
            >

              {
                prediction.league?.country
              }

            </p>


          </div>


        </div>



        <AccessBadge
          accessType={
            prediction.accessType
          }
        />


      </div>








      {/* MATCH */}



      <div
        className="
          rounded-2xl
          bg-muted/40
          p-4
        "
      >



        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >



          {/* HOME */}


          <div
            className="
              flex-1
              flex
              flex-col
              items-center
              gap-2
            "
          >


            {
              prediction.homeTeamBadge && (

                <Image

                  src={
                    prediction.homeTeamBadge
                  }

                  alt={
                    prediction.homeTeam
                  }
                  width={40}

                  height={40}
                  className="
                    h-12
                    w-12
                    object-contain
                  "

                />

              )
            }


            <span
              className="
                text-sm
                text-center
                font-medium
              "
            >

              {
                prediction.homeTeam
              }

            </span>


          </div>





          <span
            className="
              text-xs
              font-bold
              text-muted-foreground
            "
          >

            VS

          </span>






          {/* AWAY */}



          <div
            className="
              flex-1
              flex
              flex-col
              items-center
              gap-2
            "
          >


            {
              prediction.awayTeamBadge && (

                <Image

                  src={
                    prediction.awayTeamBadge
                  }

                  alt={
                    prediction.awayTeam
                  }

                    width={40}

                    height={40}

                  className="
                    h-12
                    w-12
                    object-contain
                  "

                />

              )
            }


            <span
              className="
                text-sm
                text-center
                font-medium
              "
            >

              {
                prediction.awayTeam
              }

            </span>


          </div>




        </div>



      </div>









      {/* DETAILS */}



      <div
        className="
          space-y-4
        "
      >


        <div
          className="
            flex
            items-center
            justify-between
            text-sm
          "
        >

          <span
            className="
              text-muted-foreground
            "
          >

            Match Date

          </span>


          <span
            className="
              font-medium
            "
          >

            {
              formatMatchTime(
                prediction.matchDate
              )
            }

          </span>


        </div>





        <ConfidenceBadge

          confidence={
            prediction.confidence
          }

        />



      </div>






    </div>

  );

}