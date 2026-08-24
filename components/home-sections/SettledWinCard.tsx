'use client';

import Image from 'next/image';

import {
  CheckCircle2,
  Trophy,
} from 'lucide-react';

import {
  formatMatchTime,
} from '@/lib/formatMatchTime';

import type {
  PredictionDetails,
} from '@/services/prediction.service';


// ============================================================
// TYPES
// ============================================================

interface SettledWinCardProps {
  prediction: PredictionDetails;
}


// ============================================================
// HELPERS
// ============================================================

function clampPercentage(
  value: number | undefined,
): number {
  if (
    typeof value !== 'number' ||
    Number.isNaN(value)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, value),
  );
}


function getPredictionLabel(
  prediction: PredictionDetails,
): string {

  switch (prediction.data?.prediction) {

    case 'HOME':
      return `${prediction.homeTeam} To Win`;

    case 'DRAW':
      return 'Draw';

    case 'AWAY':
      return `${prediction.awayTeam} To Win`;

    default:
      return 'Match Prediction';
  }
}


// ============================================================
// COMPONENT
// ============================================================

export default function SettledWinCard({
  prediction,
}: SettledWinCardProps) {

  const leagueName =
    prediction.league?.name ??
    prediction.leagueCode ??
    'Football';

  const matchDate =
    prediction.matchDate ??
    prediction.match?.utcDate ??
    prediction.date;

  const probabilities =
    prediction.data?.probabilities;

  const homeProbability =
    clampPercentage(
      probabilities?.home,
    );

  const drawProbability =
    clampPercentage(
      probabilities?.draw,
    );

  const awayProbability =
    clampPercentage(
      probabilities?.away,
    );

  const confidence =
    clampPercentage(
      prediction.confidence,
    );

  const predictionLabel =
    getPredictionLabel(
      prediction,
    );

  return (

    <article
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
        p-3
        text-card-foreground
        shadow-sm
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

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
              border
              border-border
              bg-muted/50
              p-1
            "
          >

            {prediction.league?.emblem ? (

              <Image
                src={prediction.league.emblem}
                alt={leagueName}
                width={20}
                height={20}
                className="
                  h-full
                  w-full
                  object-contain
                "
              />

            ) : (

              <Trophy
                className="
                  h-3.5
                  w-3.5
                  text-muted-foreground
                "
              />

            )}

          </div>

          <p
            className="
              min-w-0
              truncate
              text-[10px]
              font-semibold
            "
          >
            {leagueName}
          </p>

        </div>


        <div
          className="
            inline-flex
            shrink-0
            items-center
            gap-1
            rounded-full
            bg-emerald-500/10
            px-1.5
            py-0.5
            text-[8px]
            font-bold
            uppercase
            text-emerald-600
            dark:text-emerald-400
          "
        >

          <CheckCircle2
            className="
              h-2.5
              w-2.5
            "
          />

          WON

        </div>

      </div>


      {/* =====================================================
          TEAMS
      ===================================================== */}

      <div
        className="
          mt-3
          grid
          grid-cols-[1fr_auto_1fr]
          items-center
          gap-2
        "
      >

        {/* HOME */}

        <Team
          name={prediction.homeTeam}
          badge={prediction.homeTeamBadge}
        />


        {/* SCORE / VS */}

        <div
          className="
            flex
            flex-col
            items-center
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

        </div>


        {/* AWAY */}

        <Team
          name={prediction.awayTeam}
          badge={prediction.awayTeamBadge}
        />

      </div>


      {/* =====================================================
          DATE
      ===================================================== */}

      <p
        className="
          mt-2
          text-center
          text-[9px]
          font-medium
          text-muted-foreground
        "
      >
        {matchDate
          ? formatMatchTime(matchDate)
          : '—'}
      </p>


      {/* =====================================================
    PREDICTION
===================================================== */}

<div
  className="
    mt-3
    rounded-lg
    bg-muted/40
    px-2.5
    py-2
  "
>

  <p
    className="
      text-[9px]
      font-bold
      uppercase
      tracking-wide
      text-muted-foreground
    "
  >
    Prediction
  </p>

  <p
    className="
      mt-0.5
      truncate
      text-[11px]
      font-bold
      text-foreground
    "
  >
    {predictionLabel}
  </p>

</div>


{/* =====================================================
    CONFIDENCE
===================================================== */}

<div
  className="
    mt-3
  "
>

  <div
    className="
      flex
      items-center
      justify-between
      text-[11px]
      font-bold
      uppercase
      tracking-wide
      text-muted-foreground
    "
  >

    <span>
      Confidence
    </span>

    <span
      className="
        text-foreground
      "
    >
      {confidence}%
    </span>

  </div>


  <div
    className="
      mt-1
      h-1.5
      overflow-hidden
      rounded-full
      bg-muted
    "
  >

    <div
      className="
        h-full
        rounded-full
        bg-primary
      "
      style={{
        width: `${confidence}%`,
      }}
    />

  </div>

</div>

      {/* =====================================================
          PROBABILITIES
      ===================================================== */}

      <div
        className="
          mt-3
          space-y-1.5
        "
      >

        <ProbabilityBar
          label="1"
          value={homeProbability}
        />

        <ProbabilityBar
          label="X"
          value={drawProbability}
        />

        <ProbabilityBar
          label="2"
          value={awayProbability}
        />

      </div>

      {/* =====================================================
          SETTLED
      ===================================================== */}

      <div
        className="
          mt-2
          flex
          items-center
          justify-center
          gap-1.5
          border-t
          border-border
          pt-2
          text-[8px]
          font-bold
          uppercase
          tracking-wide
          text-emerald-600
          dark:text-emerald-400
        "
      >

        <CheckCircle2
          className="
            h-3
            w-3
          "
        />

        SETTLED WIN

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
  badge?: string;
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
          h-9
          w-9
          items-center
          justify-center
        "
      >

        {badge ? (

          <Image
            src={badge}
            alt={name}
            width={40}
            height={40}
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
              h-8
              w-8
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
          min-h-[24px]
          w-full
          text-center
          text-[9px]
          font-semibold
          leading-3
        "
      >
        {name}
      </p>

    </div>

  );
}


// ============================================================
// PROBABILITY BAR
// ============================================================

function ProbabilityBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (

    <div
      className="
        flex
        items-center
        gap-1.5
      "
    >

      <span
        className="
          w-2.5
          text-[10px]
          font-bold
          text-muted-foreground
        "
      >
        {label}
      </span>


      <div
        className="
          h-1
          flex-1
          overflow-hidden
          rounded-full
          bg-muted
        "
      >

        <div
          className="
            h-full
            rounded-full
            bg-primary/70
          "
          style={{
            width: `${value}%`,
          }}
        />

      </div>


      <span
        className="
          w-7
          text-right
          text-[10px]
          font-bold
        "
      >
        {value}%
      </span>

    </div>

  );
}