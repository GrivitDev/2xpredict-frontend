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
        cursor-pointer
        rounded-xl
        border
        border-border
        bg-card
        p-3
        text-card-foreground
        hover:border-primary/30
        focus:outline-none
        focus:ring-2
        focus:ring-primary/30
        sm:rounded-2xl
        sm:p-4
      "
    >

      {/* ====================================================
          LEAGUE + DATE
      ==================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-2
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >

          <div
            className="
              flex
              h-7
              w-7
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
                src={prediction.league.emblem}
                alt=""
                width={20}
                height={20}
                className="
                  h-full
                  w-full
                  object-contain
                "
              />

            ) : (

              <span
                className="
                  text-[8px]
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
              text-[11px]
              font-semibold
              text-foreground
              sm:text-xs
            "
          >
            {leagueName}
          </p>

        </div>


        <span
          className="
            shrink-0
            text-[9px]
            font-medium
            text-muted-foreground
            sm:text-[10px]
          "
        >
          {matchDate
            ? formatMatchTime(matchDate)
            : '—'}
        </span>

      </div>


      {/* ====================================================
          TEAMS
      ==================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-[1fr_auto_1fr]
          items-center
          gap-2
          sm:mt-5
          sm:gap-3
        "
      >

        {/* HOME */}

        <Team
          name={prediction.homeTeam}
          badge={prediction.homeTeamBadge}
        />


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
              text-[8px]
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
              w-4
              bg-border
            "
          />

        </div>


        {/* AWAY */}

        <Team
          name={prediction.awayTeam}
          badge={prediction.awayTeamBadge}
        />

      </div>


      {/* ====================================================
          CONFIDENCE
      ==================================================== */}

      <div
        className="
          mt-4
          border-t
          border-border
          pt-2.5
        "
      >

        <ConfidenceBadge
          confidence={prediction.confidence}
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
        gap-1.5
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          sm:h-11
          sm:w-11
        "
      >

        {badge ? (

          <Image
            src={badge}
            alt=""
            width={44}
            height={44}
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
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-muted
              text-[9px]
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
          min-h-[28px]
          w-full
          text-center
          text-[10px]
          font-semibold
          leading-3.5
          text-foreground
          sm:text-xs
          sm:leading-4
        "
      >
        {name}
      </p>

    </div>

  );
}