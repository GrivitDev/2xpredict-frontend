'use client';

import Image from 'next/image';
import { Trophy } from 'lucide-react';

import type { PredictionDetails } from '@/services/prediction.service';

interface PredictionPreviewCardProps {
  prediction: PredictionDetails;
  onClick: () => void;
}

function clampPercentage(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
}

function getPredictionLabel(prediction: PredictionDetails): string {
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

function getConfidenceStyle(value: number) {
  if (value >= 85) {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500',
    };
  }

  if (value >= 80) {
    return {
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500',
    };
  }

  if (value >= 65) {
    return {
      text: 'text-lime-600 dark:text-lime-400',
      bg: 'bg-lime-500',
    };
  }

  return {
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500',
  };
}

function getProbabilityStyle(value: number) {
  if (value >= 60) {
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500',
      soft: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    };
  }

  if (value >= 46) {
    return {
      text: 'text-lime-600 dark:text-lime-400',
      bg: 'bg-lime-500',
      soft: 'bg-lime-500/10',
      border: 'border-lime-500/20',
    };
  }

  if (value >= 36) {
    return {
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-500',
      soft: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    };
  }

  if (value >= 26) {
    return {
      text: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-500',
      soft: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    };
  }

  return {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500',
    soft: 'bg-red-500/10',
    border: 'border-red-500/20',
  };
}

export default function PredictionPreviewCard({
  prediction,
  onClick,
}: PredictionPreviewCardProps) {
  const leagueName =
    prediction.league?.name ??
    prediction.leagueCode ??
    'Football';

  const probabilities = prediction.data?.probabilities;

  const homeProbability = clampPercentage(probabilities?.home);
  const drawProbability = clampPercentage(probabilities?.draw);
  const awayProbability = clampPercentage(probabilities?.away);

  const confidence = clampPercentage(prediction.confidence);
  const confidenceStyle = getConfidenceStyle(confidence);
  const predictionLabel = getPredictionLabel(prediction);

  const selectedPrediction = prediction.data?.prediction;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open prediction for ${prediction.homeTeam} versus ${prediction.awayTeam}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
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
        text-card-foreground
        shadow-sm
        transition
        hover:border-primary/30
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-primary/30
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/60">
            {prediction.league?.emblem ? (
              <Image
                src={prediction.league.emblem}
                alt=""
                width={18}
                height={18}
                className="h-4 w-4 object-contain"
              />
            ) : (
              <Trophy className="h-3 w-3 text-muted-foreground" />
            )}
          </div>

          <span
            className="min-w-0 truncate text-[11px] font-semibold text-muted-foreground"
            title={leagueName}
          >
            {leagueName}
          </span>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
          Free
        </span>
      </div>

      {/* TEAMS */}
      <div className="px-3 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Team
            name={prediction.homeTeam}
            badge={prediction.homeTeamBadge}
          />

          <div className="flex min-w-[44px] items-center justify-center">
            <span className="rounded-lg bg-muted px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider">
              VS
            </span>
          </div>

          <Team
            name={prediction.awayTeam}
            badge={prediction.awayTeamBadge}
          />
        </div>
      </div>

      {/* PREDICTION */}
      <div className="mx-3 mt-3 rounded-lg bg-primary/5 px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            Prediction
          </span>

          <span
            className={`text-[11px] font-bold ${confidenceStyle.text}`}
          >
            {confidence}%
          </span>
        </div>

        <p
          className="mt-0.5 truncate text-sm font-bold leading-tight text-foreground"
          title={predictionLabel}
        >
          {predictionLabel}
        </p>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${confidenceStyle.bg}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* PROBABILITIES */}
      <div className="mx-3 mb-3 mt-3 grid grid-cols-3 gap-1.5">
        <Probability
          label="1"
          value={homeProbability}
          active={selectedPrediction === 'HOME'}
        />

        <Probability
          label="X"
          value={drawProbability}
          active={selectedPrediction === 'DRAW'}
        />

        <Probability
          label="2"
          value={awayProbability}
          active={selectedPrediction === 'AWAY'}
        />
      </div>
    </article>
  );
}

function Team({
  name,
  badge,
}: {
  name: string;
  badge?: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
        {badge ? (
          <Image
            src={badge}
            alt=""
            width={36}
            height={36}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
            ?
          </div>
        )}
      </div>

      <p
        className="line-clamp-2 min-h-[26px] w-full text-center text-[10px] font-semibold leading-3"
        title={name}
      >
        {name}
      </p>
    </div>
  );
}

function Probability({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  const style = getProbabilityStyle(value);

  return (
    <div
      className={`
        rounded-md
        border
        px-1.5
        py-1.5
        text-center
        transition-colors
        ${
          active
            ? `${style.soft} ${style.border}`
            : 'border-border bg-muted/20'
        }
      `}
    >
      <div className="flex items-center justify-center gap-1">
        <span
          className={`
            text-[10px]
            font-black
            ${active ? style.text : 'text-muted-foreground'}
          `}
        >
          {label}
        </span>

        <span
          className={`
            text-[10px]
            font-bold
            tabular-nums
            ${active ? style.text : 'text-foreground'}
          `}
        >
          {value}%
        </span>
      </div>

      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${
            active ? style.bg : 'bg-primary/40'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}