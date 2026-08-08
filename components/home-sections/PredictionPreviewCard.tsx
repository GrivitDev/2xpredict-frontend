'use client';

import Image from 'next/image';

import {
  ChevronRight,
} from 'lucide-react';

import {
  formatMatchTime,
} from '@/lib/formatMatchTime';

import ConfidenceBadge from '../predictions/ConfidenceBadge';

import AccessBadge from '../predictions/AccessBadge';

import {
  PredictionDetails,
} from '@/services/prediction.service';



interface Props {

  prediction: PredictionDetails;

  onClick: () => void;

}



export default function PredictionPreviewCard({

  prediction,

  onClick,

}: Props) {


  return (

    <article

      onClick={onClick}

      role="button"

      tabIndex={0}

      onKeyDown={(event) => {

        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {

          event.preventDefault();

          onClick();

        }

      }}

      className="
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card
        p-5
        text-card-foreground
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-xl
        focus:outline-none
        focus:ring-2
        focus:ring-primary/40
      "
    >


      {/* ======================================== */}
      {/* SUBTLE HOVER GLOW */}
      {/* ======================================== */}


      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-40
          w-40
          rounded-full
          bg-primary/5
          blur-3xl
          transition-all
          duration-500
          group-hover:bg-primary/10
        "
      />



      <div
        className="
          relative
          space-y-5
        "
      >


        {/* ======================================== */}
        {/* LEAGUE HEADER */}
        {/* ======================================== */}


        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >


          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >


            {/* LEAGUE LOGO */}


            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-border
                bg-muted/50
                p-1.5
              "
            >

              {
                prediction.league?.emblem ? (

                  <Image
                    src={
                      prediction.league.emblem
                    }
                    alt={
                      prediction.league.name
                    }
                    width={32}
                    height={32}
                    className="
                      h-full
                      w-full
                      object-contain
                    "
                  />

                ) : (

                  <span
                    className="
                      text-xs
                      font-bold
                      text-muted-foreground
                    "
                  >

                    {prediction.leagueCode}

                  </span>

                )
              }

            </div>



            {/* LEAGUE INFO */}


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-foreground
                "
              >

                {
                  prediction.league?.name ??
                  prediction.leagueCode
                }

              </p>


              {
                prediction.league?.country && (

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-muted-foreground
                    "
                  >

                    {
                      prediction.league.country
                    }

                  </p>

                )
              }

            </div>


          </div>



          {/* ACCESS */}


          <AccessBadge
            accessType={
              prediction.accessType
            }
          />


        </div>



        {/* ======================================== */}
        {/* MATCH TEAMS */}
        {/* ======================================== */}


        <div
          className="
            rounded-2xl
            border
            border-border/60
            bg-muted/30
            p-5
            transition-colors
            duration-300
            group-hover:bg-muted/50
          "
        >


          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >


            {/* HOME TEAM */}


            <div
              className="
                flex
                min-w-0
                flex-1
                flex-col
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                "
              >

                {
                  prediction.homeTeamBadge ? (

                    <Image
                      src={
                        prediction.homeTeamBadge
                      }
                      alt={
                        prediction.homeTeam
                      }
                      width={56}
                      height={56}
                      className="
                        h-14
                        w-14
                        object-contain
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    />

                  ) : (

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-muted
                        text-xs
                        font-bold
                        text-muted-foreground
                      "
                    >

                      ?

                    </div>

                  )
                }

              </div>


              <p
                className="
                  line-clamp-2
                  min-h-[40px]
                  text-center
                  text-sm
                  font-semibold
                  leading-5
                  text-foreground
                "
              >

                {
                  prediction.homeTeam
                }

              </p>

            </div>



            {/* VS */}


            <div
              className="
                flex
                shrink-0
                flex-col
                items-center
                gap-1
              "
            >

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-muted-foreground
                "
              >

                VS

              </span>


              <div
                className="
                  h-px
                  w-6
                  bg-border
                "
              />

            </div>



            {/* AWAY TEAM */}


            <div
              className="
                flex
                min-w-0
                flex-1
                flex-col
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                "
              >

                {
                  prediction.awayTeamBadge ? (

                    <Image
                      src={
                        prediction.awayTeamBadge
                      }
                      alt={
                        prediction.awayTeam
                      }
                      width={56}
                      height={56}
                      className="
                        h-14
                        w-14
                        object-contain
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    />

                  ) : (

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-muted
                        text-xs
                        font-bold
                        text-muted-foreground
                      "
                    >

                      ?

                    </div>

                  )
                }

              </div>


              <p
                className="
                  line-clamp-2
                  min-h-[40px]
                  text-center
                  text-sm
                  font-semibold
                  leading-5
                  text-foreground
                "
              >

                {
                  prediction.awayTeam
                }

              </p>

            </div>


          </div>


        </div>



        {/* ======================================== */}
        {/* DATE + CONFIDENCE */}
        {/* ======================================== */}


        <div
          className="
            space-y-4
          "
        >


          {/* DATE */}


          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >

            <span
              className="
                text-xs
                font-medium
                text-muted-foreground
              "
            >

              Match Date

            </span>


            <span
              className="
                text-xs
                font-semibold
                text-foreground
              "
            >

              {
                formatMatchTime(
                  prediction.matchDate,
                )
              }

            </span>

          </div>



          {/* CONFIDENCE */}


          <ConfidenceBadge
            confidence={
              prediction.confidence
            }
          />


        </div>



        {/* ======================================== */}
        {/* VIEW INDICATOR */}
        {/* ======================================== */}


        <div
          className="
            flex
            items-center
            justify-end
            gap-1
            border-t
            border-border
            pt-4
            text-xs
            font-medium
            text-muted-foreground
            transition-colors
            duration-300
            group-hover:text-primary
          "
        >

          View prediction

          <ChevronRight
            className="
              h-3.5
              w-3.5
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />

        </div>


      </div>


    </article>

  );

}