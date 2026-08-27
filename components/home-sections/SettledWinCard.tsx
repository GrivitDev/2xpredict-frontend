'use client';

import Image from 'next/image';

import {
  CheckCircle2,
  Trophy,
} from 'lucide-react';

import type {
  PredictionDetails,
} from '@/services/prediction.service';

import type {
  MatchScore,
} from './features/Results';


// ============================================================
// TYPES
// ============================================================

interface SettledWinCardProps {
  prediction: PredictionDetails;
  score: MatchScore;
}


// ============================================================
// HELPERS
// ============================================================

function clampPercentage(
  value: unknown,
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, number),
  );
}


// ============================================================
// PREDICTION LABEL
// ============================================================

function getPredictionLabel(
  prediction: PredictionDetails,
): string {
  switch (prediction.data?.prediction) {
    case 'HOME':
      return `${prediction.homeTeam} Win`;

    case 'DRAW':
      return 'Draw';

    case 'AWAY':
      return `${prediction.awayTeam} Win`;

    default:
      return 'Match Prediction';
  }
}


// ============================================================
// COMPONENT
// ============================================================

export default function SettledWinCard({
  prediction,
  score,
}: SettledWinCardProps) {
  const leagueName =
    prediction.league?.name ??
    prediction.leagueCode ??
    'Football';

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

  const hasScore =
    score.home !== null &&
    score.away !== null;

  return (
    <article
      className="
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-card
        text-card-foreground
        shadow-sm
        transition
        hover:border-primary/20
        hover:shadow-md
      "
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-2
          border-b
          border-border
          px-3
          py-2
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
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-md
              bg-muted/60
            "
          >
            {prediction.league?.emblem ? (
              <Image
                src={prediction.league.emblem}
                alt={leagueName}
                width={18}
                height={18}
                className="
                  h-4
                  w-4
                  object-contain
                "
              />
            ) : (
              <Trophy
                className="
                  h-3
                  w-3
                  text-muted-foreground
                "
              />
            )}
          </div>

          <span
            className="
              min-w-0
              truncate
              text-[11px]
              font-semibold
              text-muted-foreground
            "
            title={leagueName}
          >
            {leagueName}
          </span>
        </div>

        {/* WON */}

        <span
          className="
            inline-flex
            shrink-0
            items-center
            gap-1
            rounded-full
            bg-emerald-500/10
            px-2
            py-0.5
            text-[9px]
            font-bold
            uppercase
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

          WON
        </span>
      </div>


      {/* ====================================================
          MATCH
      ==================================================== */}

      <div
        className="
          px-3
          pt-3
        "
      >
        <div
          className="
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


          {/* SCORE */}

          <div
            className="
              flex
              min-w-[48px]
              flex-col
              items-center
            "
          >
            {hasScore ? (
              <div
                className="
                  rounded-lg
                  bg-muted
                  px-2.5
                  py-1
                  text-base
                  font-black
                  leading-none
                  tabular-nums
                "
              >
                {score.home}

                <span
                  className="
                    mx-1
                    text-muted-foreground
                  "
                >
                  -
                </span>

                {score.away}
              </div>
            ) : (
              <div
                className="
                  rounded-lg
                  bg-muted/60
                  px-2
                  py-1
                  text-[11px]
                  font-bold
                  text-muted-foreground
                "
              >
                —
              </div>
            )}

            <span
              className="
                mt-1
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              FT
            </span>
          </div>


          {/* AWAY */}

          <Team
            name={prediction.awayTeam}
            badge={prediction.awayTeamBadge}
          />
        </div>
      </div>


      {/* ====================================================
          PREDICTION
      ==================================================== */}

      <div
        className="
          mx-3
          mt-3
          rounded-lg
          bg-primary/5
          px-2.5
          py-2
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-2
          "
        >
          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-muted-foreground
            "
          >
            Prediction
          </span>

          <span
            className="
              text-[11px]
              font-bold
              text-primary
            "
          >
            {confidence}%
          </span>
        </div>

        <p
          className="
            mt-0.5
            truncate
            text-sm
            font-bold
            leading-tight
            text-foreground
          "
          title={predictionLabel}
        >
          {predictionLabel}
        </p>

        {/* CONFIDENCE */}

        <div
          className="
            mt-2
            h-1
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


      {/* ====================================================
          PROBABILITIES
      ==================================================== */}

      <div
        className="
          mx-3
          mt-3
          grid
          grid-cols-3
          gap-1.5
        "
      >
        <Probability
          label="1"
          value={homeProbability}
          active={
            prediction.data?.prediction ===
            'HOME'
          }
        />

        <Probability
          label="X"
          value={drawProbability}
          active={
            prediction.data?.prediction ===
            'DRAW'
          }
        />

        <Probability
          label="2"
          value={awayProbability}
          active={
            prediction.data?.prediction ===
            'AWAY'
          }
        />
      </div>


      {/* ====================================================
          FOOTER
      ==================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          justify-center
          gap-1.5
          border-t
          border-border
          px-3
          py-2
          text-[9px]
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

        Settled Win
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
            alt={name}
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
          min-h-[26px]
          w-full
          text-center
          text-[10px]
          font-semibold
          leading-3
        "
        title={name}
      >
        {name}
      </p>
    </div>
  );
}


// ============================================================
// PROBABILITY
// ============================================================

function Probability({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={`
        rounded-md
        border
        px-1.5
        py-1.5
        text-center
        ${
          active
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-muted/20'
        }
      `}
    >
      <div
        className="
          flex
          items-center
          justify-center
          gap-1
        "
      >
        <span
          className={`
            text-[10px]
            font-black
            ${
              active
                ? 'text-primary'
                : 'text-muted-foreground'
            }
          `}
        >
          {label}
        </span>

        <span
          className={`
            text-[10px]
            font-bold
            tabular-nums
            ${
              active
                ? 'text-primary'
                : 'text-foreground'
            }
          `}
        >
          {value}%
        </span>
      </div>

      <div
        className="
          mt-1
          h-1
          overflow-hidden
          rounded-full
          bg-muted
        "
      >
        <div
          className={`
            h-full
            rounded-full
            ${
              active
                ? 'bg-primary'
                : 'bg-primary/40'
            }
          `}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}