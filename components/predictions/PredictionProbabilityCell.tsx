'use client';

import clsx from 'clsx';
import { LockKeyhole } from 'lucide-react';

interface PredictionProbability {
  home: number;
  draw: number;
  away: number;
}

interface Props {
  prediction: {
    probabilities?: PredictionProbability | null;
    prediction?: string;
    access?: {
      allowed?: boolean;
      plan?: 'free' | 'regular' | 'vip';
    };
    userPlan?: 'free' | 'regular' | 'vip';
    accessLoading?: boolean;
  };
}

export default function PredictionProbabilityCell({
  prediction,
}: Props) {
  const allowed =
    prediction.access?.allowed === true;

  const probabilities =
    prediction.probabilities;

  const selected =
    String(prediction.prediction ?? '').toUpperCase();

  const hasAccess =
    allowed && Boolean(probabilities);

  const values = {
    home: hasAccess ? clamp(probabilities?.home) : 0,
    draw: hasAccess ? clamp(probabilities?.draw) : 0,
    away: hasAccess ? clamp(probabilities?.away) : 0,
  };

  return (
    <div
      className="
        min-w-0
        rounded-lg
        border
        border-border
        bg-muted/10
        px-2
        py-1.5
      "
    >
      <div className="space-y-1.5">
        <ProbabilityRow
          label="1"
          value={values.home}
          active={
            hasAccess &&
            selected === 'HOME'
          }
        />

        <ProbabilityRow
          label="X"
          value={values.draw}
          active={
            hasAccess &&
            selected === 'DRAW'
          }
        />

        <ProbabilityRow
          label="2"
          value={values.away}
          active={
            hasAccess &&
            selected === 'AWAY'
          }
        />
      </div>

      {!hasAccess && (
        <div
          className="
            mt-1.5
            flex
            items-center
            justify-center
            gap-1
            border-t
            border-border/60
            pt-1.5
            text-[8px]
            font-semibold
            text-muted-foreground
          "
        >
          <LockKeyhole
            size={9}
            className="shrink-0"
          />

          <span>Access required</span>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   PROBABILITY ROW
========================================================= */

function ProbabilityRow({
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
      className="
        grid
        grid-cols-[12px_1fr_32px]
        items-center
        gap-1.5
      "
    >
      <span
        className={clsx(
          'text-[11px] font-black leading-none',
          active
            ? 'text-foreground'
            : 'text-muted-foreground',
        )}
      >
        {label}
      </span>

      <div
        className="
          h-2
          overflow-hidden
          rounded-full
          bg-muted
        "
      >
        {value > 0 && (
          <div
            className={clsx(
              'h-full rounded-full',
              getProbabilityColor(value),
            )}
            style={{
              width: `${value}%`,
            }}
          />
        )}
      </div>

      <span
        className={clsx(
          `
            text-right
            text-[10px]
            font-bold
            tabular-nums
            leading-none
          `,
          active
            ? 'text-foreground'
            : 'text-muted-foreground',
        )}
      >
        {value}%
      </span>
    </div>
  );
}


/* =========================================================
   PROBABILITY COLOR
========================================================= */

function getProbabilityColor(value: number) {
  if (value >= 60) {
    return 'bg-emerald-500';
  }

  if (value >= 45) {
    return 'bg-green-500';
  }

  if (value >= 35) {
    return 'bg-amber-500';
  }

  return 'bg-orange-500';
}


/* =========================================================
   SAFE VALUE
========================================================= */

function clamp(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(number)),
  );
}