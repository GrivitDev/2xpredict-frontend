'use client';

import clsx from 'clsx';

import {
  CheckCircle2,
  Clock3,
  MinusCircle,
  Radio,
  Trophy,
  XCircle,
} from 'lucide-react';

interface Props {
  prediction: any;
}

type StatusType =
  | 'won'
  | 'lost'
  | 'void'
  | 'live'
  | 'finished'
  | 'upcoming';

const SETTLED_STATUSES = [
  'won',
  'lost',
  'void',
] as const;

export default function PredictionStatusBadge({
  prediction,
}: Props) {
  const status = String(
    prediction?.status ?? '',
  ).toLowerCase();

  const outcome = String(
    prediction?.outcome ??
      prediction?.result ??
      '',
  ).toLowerCase();

  const settled =
    prediction?.settled === true ||
    prediction?.isSettled === true ||
    SETTLED_STATUSES.includes(
      status as (typeof SETTLED_STATUSES)[number],
    ) ||
    SETTLED_STATUSES.includes(
      outcome as (typeof SETTLED_STATUSES)[number],
    );

  const type = getStatusType({
    status,
    outcome,
    settled,
  });

  const config = STATUS_CONFIG[type];

  return (
    <Badge
      icon={config.icon}
      label={config.label}
      pulse={config.pulse}
      className={config.className}
    />
  );
}


/* =========================================================
   STATUS
========================================================= */

function getStatusType({
  status,
  outcome,
  settled,
}: {
  status: string;
  outcome: string;
  settled: boolean;
}): StatusType {
  if (settled) {
    if (
      SETTLED_STATUSES.includes(
        outcome as (typeof SETTLED_STATUSES)[number],
      )
    ) {
      return outcome as StatusType;
    }

    if (
      SETTLED_STATUSES.includes(
        status as (typeof SETTLED_STATUSES)[number],
      )
    ) {
      return status as StatusType;
    }
  }

  if (
    status === 'live' ||
    status === 'in_progress'
  ) {
    return 'live';
  }

  if (
    status === 'finished' ||
    status === 'completed'
  ) {
    return 'finished';
  }

  return 'upcoming';
}


/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG: Record<
  StatusType,
  {
    label: string;
    icon: React.ReactNode;
    pulse?: boolean;
    className: string;
  }
> = {
  won: {
    label: 'Won',
    icon: <Trophy size={12} />,
    className: `
      border-emerald-500/30
      bg-emerald-500/10
      text-emerald-600
      dark:text-emerald-400
    `,
  },

  lost: {
    label: 'Lost',
    icon: <XCircle size={12} />,
    className: `
      border-red-500/30
      bg-red-500/10
      text-red-600
      dark:text-red-400
    `,
  },

  void: {
    label: 'Void',
    icon: <MinusCircle size={12} />,
    className: `
      border-slate-500/30
      bg-slate-500/10
      text-slate-600
      dark:text-slate-400
    `,
  },

  live: {
    label: 'Live',
    icon: <Radio size={12} />,
    pulse: true,
    className: `
      border-red-500/30
      bg-red-500/10
      text-red-600
      dark:text-red-400
    `,
  },

  finished: {
    label: 'Finished',
    icon: <CheckCircle2 size={12} />,
    className: `
      border-blue-500/30
      bg-blue-500/10
      text-blue-600
      dark:text-blue-400
    `,
  },

  upcoming: {
    label: 'Upcoming',
    icon: <Clock3 size={12} />,
    className: `
      border-amber-500/30
      bg-amber-500/10
      text-amber-600
      dark:text-amber-400
    `,
  },
};


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
        className={clsx(
          pulse && 'animate-pulse',
        )}
      >
        {icon}
      </span>

      {label}
    </div>
  );
}