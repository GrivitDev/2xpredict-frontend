'use client';

import clsx from 'clsx';

import {
  CheckCircle2,
  Clock3,
  Trophy,
  XCircle,
  MinusCircle,
  Radio,
} from 'lucide-react';

interface Props {
  prediction: any;
}

export default function PredictionStatusBadge({
  prediction,
}: Props) {
  const status =
    String(
      prediction.status ?? '',
    ).toLowerCase();

  const outcome =
    String(
      prediction.outcome ??
        prediction.result ??
        '',
    ).toLowerCase();

  const settled =
    prediction.settled === true ||
    prediction.isSettled === true ||
    ['won', 'lost', 'void'].includes(
      status,
    ) ||
    ['won', 'lost', 'void'].includes(
      outcome,
    );

  /*
   * SETTLED
   */

  if (settled) {
    const finalOutcome =
      ['won', 'lost', 'void'].includes(
        outcome,
      )
        ? outcome
        : status;

    switch (finalOutcome) {
      case 'won':
        return (
          <Badge
            icon={
              <Trophy size={12} />
            }
            label="Won"
            className="
              border-emerald-500/30
              bg-emerald-500/10
              text-emerald-600
              dark:text-emerald-400
            "
          />
        );

      case 'lost':
        return (
          <Badge
            icon={
              <XCircle size={12} />
            }
            label="Lost"
            className="
              border-red-500/30
              bg-red-500/10
              text-red-600
              dark:text-red-400
            "
          />
        );

      case 'void':
        return (
          <Badge
            icon={
              <MinusCircle size={12} />
            }
            label="Void"
            className="
              border-slate-500/30
              bg-slate-500/10
              text-slate-600
              dark:text-slate-400
            "
          />
        );
    }
  }

  /*
   * LIVE
   */

  if (
    status === 'live' ||
    status === 'in_progress'
  ) {
    return (
      <Badge
        icon={
          <Radio size={12} />
        }
        label="Live"
        pulse
        className="
          border-red-500/30
          bg-red-500/10
          text-red-600
          dark:text-red-400
        "
      />
    );
  }

  /*
   * FINISHED
   */

  if (
    status === 'finished' ||
    status === 'completed'
  ) {
    return (
      <Badge
        icon={
          <CheckCircle2 size={12} />
        }
        label="Finished"
        className="
          border-blue-500/30
          bg-blue-500/10
          text-blue-600
          dark:text-blue-400
        "
      />
    );
  }

  /*
   * UPCOMING
   */

  return (
    <Badge
      icon={
        <Clock3 size={12} />
      }
      label="Upcoming"
      className="
        border-amber-500/30
        bg-amber-500/10
        text-amber-600
        dark:text-amber-400
      "
    />
  );
}


/* =========================================================
   BADGE
========================================================= */

function Badge({
  icon,
  label,
  className,
  pulse = false,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={clsx(
        `
          inline-flex
          items-center
          justify-center
          gap-1.5
          whitespace-nowrap
          rounded-full
          border
          px-2
          py-1
          text-[9px]
          font-bold
          leading-none
        `,
        className,
      )}
    >
      <span
        className={
          pulse
            ? 'animate-pulse'
            : ''
        }
      >
        {icon}
      </span>

      {label}
    </div>
  );
}