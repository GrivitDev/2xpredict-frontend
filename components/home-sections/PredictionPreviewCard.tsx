'use client';

import Image from 'next/image';

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
        cursor-pointer
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
        p-2.5
        text-card-foreground
        transition
        hover:border-primary/30
        hover:shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-primary/30
        sm:rounded-2xl
        sm:p-3
      "
    >

      {/* ====================================================
          LEAGUE
      ==================================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-1.5
        "
      >

        <div
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-md
            bg-muted
            p-1
          "
        >

          {prediction.league?.emblem ? (

            <Image
              src={
                prediction.league.emblem
              }
              alt=""
              width={18}
              height={18}
              className="
                h-full
                w-full
                object-contain
              "
            />

          ) : (

            <span
              className="
                text-[7px]
                font-bold
                text-muted-foreground
              "
            >
              {prediction.leagueCode ?? '—'}
            </span>

          )}

        </div>


        <p
          className="
            min-w-0
            truncate
            text-[10px]
            font-semibold
            text-muted-foreground
            sm:text-[11px]
          "
          title={leagueName}
        >
          {leagueName}
        </p>

      </div>


      {/* ====================================================
          TEAMS
      ==================================================== */}

      <div
        className="
          mt-3
          grid
          grid-cols-[1fr_auto_1fr]
          items-center
          gap-1.5
          sm:mt-3.5
          sm:gap-2
        "
      >

        {/* HOME */}

        <Team
          name={
            prediction.homeTeam
          }
          badge={
            prediction.homeTeamBadge
          }
        />


        {/* VS */}

        <div
          className="
            flex
            flex-col
            items-center
            gap-0.5
          "
        >

          <span
            className="
              text-[7px]
              font-bold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            VS
          </span>

          <span
            className="
              h-px
              w-3
              bg-border
            "
          />

        </div>


        {/* AWAY */}

        <Team
          name={
            prediction.awayTeam
          }
          badge={
            prediction.awayTeamBadge
          }
        />

      </div>


      {/* ====================================================
          CONFIDENCE
      ==================================================== */}

      <div
        className="
          mt-2.5
          border-t
          border-border
          pt-2
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


// ============================================================
// TEAM
// ============================================================

function Team({
  name,
  badge,
}: {
  name: string;
  badge?: string | null;
}) {

  return (

    <div
      className="
        flex
        min-w-0
        flex-col
        items-center
        gap-1
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
          sm:h-9
          sm:w-9
        "
      >

        {badge ? (

          <Image
            src={badge}
            alt=""
            width={36}
            height={36}
            className="
              h-full
              w-full
              object-contain
            "
          />

        ) : (

          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-muted
              text-[8px]
              font-bold
              text-muted-foreground
            "
          >
            ?
          </div>

        )}

      </div>


      <p
        className="
          line-clamp-2
          min-h-[24px]
          w-full
          text-center
          text-[9px]
          font-semibold
          leading-3
          text-foreground
          sm:text-[10px]
          sm:leading-3.5
        "
        title={name}
      >
        {name}
      </p>

    </div>

  );
}