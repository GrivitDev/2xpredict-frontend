'use client';

import Image from 'next/image';

import {
  formatMatchTime,
} from '@/lib/formatMatchTime';

import ConfidenceBadge from '../predictions/ConfidenceBadge';

import {
  PredictionDetails,
} from '@/services/prediction.service';


// ============================================================
// TYPES
// ============================================================

interface PredictionPreviewCardProps {

  prediction: PredictionDetails;

  onClick: () => void;

}


// ============================================================
// COMPONENT
// ============================================================

export default function PredictionPreviewCard({

  prediction,

  onClick,

}: PredictionPreviewCardProps) {

  const leagueName =
    prediction.league?.name ??
    prediction.leagueCode ??
    'Football';

  const matchDate =
    prediction.matchDate ??
    prediction.match?.utcDate;


  return (

    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
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
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        text-card-foreground
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-primary/30
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-primary/40
        sm:p-5
      "
    >

      {/* =====================================================
          LEAGUE + DATE
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >

        {/* LEAGUE */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-lg
              border
              border-border
              bg-muted/50
              p-1
            "
          >

            {
              prediction.league?.emblem ? (

                <Image
                  src={
                    prediction.league.emblem
                  }
                  alt={
                    leagueName
                  }
                  width={24}
                  height={24}
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                />

              ) : (

                <span
                  className="
                    text-[9px]
                    font-bold
                    text-muted-foreground
                  "
                >
                  {prediction.leagueCode ?? '—'}
                </span>

              )
            }

          </div>


          <p
            className="
              min-w-0
              truncate
              text-xs
              font-semibold
              text-foreground
              sm:text-s
            "
          >
            {leagueName}
          </p>

        </div>


        {/* DATE */}

        <span
          className="
            shrink-0
            text-[10px]
            font-semibold
            text-muted-foreground
            sm:text-xs
          "
        >
          {
            matchDate
              ? formatMatchTime(matchDate)
              : '—'
          }
        </span>

      </div>



      {/* =====================================================
          TEAMS
      ===================================================== */}

      <div
        className="
          mt-5
          grid
          grid-cols-[1fr_auto_1fr]
          items-center
          gap-3
        "
      >

        {/* HOME */}

        <div
          className="
            flex
            min-w-0
            flex-col
            items-center
            gap-2
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              sm:h-12
              sm:w-12
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
                  width={48}
                  height={48}
                  className="
                    h-full
                    w-full
                    object-contain
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                />

              ) : (

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-muted
                    text-[10px]
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
              min-h-[32px]
              w-full
              text-center
              text-xs
              font-semibold
              leading-4
              text-foreground
              sm:text-s
            "
          >
            {prediction.homeTeam}
          </p>

        </div>



        {/* VS */}

        <div
          className="
            flex
            flex-col
            items-center
            gap-1
          "
        >

          <span
            className="
              text-[9px]
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
              w-5
              bg-border
            "
          />

        </div>



        {/* AWAY */}

        <div
          className="
            flex
            min-w-0
            flex-col
            items-center
            gap-2
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              sm:h-12
              sm:w-12
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
                  width={48}
                  height={48}
                  className="
                    h-full
                    w-full
                    object-contain
                    transition-transform
                    duration-200
                    group-hover:scale-105
                  "
                />

              ) : (

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-muted
                    text-[10px]
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
              min-h-[32px]
              w-full
              text-center
              text-xs
              font-semibold
              leading-4
              text-foreground
              sm:text-s
            "
          >
            {prediction.awayTeam}
          </p>

        </div>

      </div>



      {/* =====================================================
          CONFIDENCE
      ===================================================== */}

      <div
        className="
          mt-5
          border-t
          border-border
          pt-3
        "
      >

        <ConfidenceBadge
          confidence={
            prediction.confidence
          }
        />

      </div>

    </article>

  );

}