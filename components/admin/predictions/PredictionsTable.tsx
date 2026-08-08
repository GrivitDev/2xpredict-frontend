'use client';

import Image from 'next/image';

import type {
  AdminPrediction,
} from '@/types/prediction.types';

import {
  getLeagueName,
} from '@/constants/leagues';

import {
  getMatchStatus,
  getPredictionLabel,
} from '@/utils/prediction.utils';

interface Props {
  predictions: AdminPrediction[];
  onSelect: (prediction: AdminPrediction) => void;
}

const statusOrder: Record<string, number> = {
  'In Play': 0,
  Upcoming: 1,
  'Needs Settlement': 2,
  Settled: 3,
};

function formatAdminDate(date: string) {
  const matchDate = new Date(date);

  return {
    day: matchDate.toLocaleDateString('en-US', {
      weekday: 'short',
    }),

    date: matchDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),

    time: matchDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

function getStatusClasses(status: string) {
  if (status === 'Settled') {
    return 'bg-emerald-500/10 text-emerald-600';
  }

  if (status === 'In Play') {
    return 'bg-blue-500/10 text-blue-600';
  }

  if (status === 'Needs Settlement') {
    return 'bg-amber-500/10 text-amber-600';
  }

  return 'bg-muted text-muted-foreground';
}

function getAccessClasses(accessType: string) {
  if (accessType === 'vip') {
    return 'bg-yellow-500/15 text-yellow-700';
  }

  if (accessType === 'regular') {
    return 'bg-blue-500/15 text-blue-700';
  }

  return 'bg-emerald-500/15 text-emerald-700';
}

function getPredictionHero(prediction: AdminPrediction) {
  switch (prediction.prediction) {
    case 'HOME':
      return {
        badge: prediction.homeTeamBadge,
        title: `${prediction.homeTeam} To Win`,
      };

    case 'AWAY':
      return {
        badge: prediction.awayTeamBadge,
        title: `${prediction.awayTeam} To Win`,
      };

    case 'DRAW':
      return {
        badge: undefined,
        title: 'Draw',
      };

    default:
      return {
        badge: undefined,
        title: getPredictionLabel(prediction),
      };
  }
}

export default function PredictionsTable({
  predictions,
  onSelect,
}: Props) {
  const sortedPredictions = [...predictions].sort(
    (first, second) =>
      (statusOrder[getMatchStatus(first)] ?? 99) -
      (statusOrder[getMatchStatus(second)] ?? 99),
  );

  if (!sortedPredictions.length) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-dashed
          border-border
          bg-card
          p-10
          text-center
        "
      >
        <p className="font-semibold">
          No predictions found
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Create a prediction or adjust the active filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card
        shadow-sm
      "
    >
      {/* Mobile cards */}

      <div className="space-y-3 p-3 lg:hidden">
        {sortedPredictions.map((prediction) => {
          const date = formatAdminDate(prediction.matchDate);
          const status = getMatchStatus(prediction);
          const predictionHero = getPredictionHero(prediction);

          const leagueName =
            prediction.league?.name ||
            getLeagueName(prediction.leagueCode);

          return (
            <button
              key={prediction._id}
              type="button"
              onClick={() => onSelect(prediction)}
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-background
                p-4
                text-left
                shadow-sm
                transition
                active:scale-[0.99]
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    {prediction.league?.emblem && (
                      <Image
                        src={prediction.league.emblem}
                        alt={`${leagueName} emblem`}
                        width={22}
                        height={22}
                        className="shrink-0 object-contain"
                      />
                    )}

                    <p className="truncate text-sm font-bold">
                      {leagueName}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {date.day}, {date.date} · {date.time}
                  </p>
                </div>

                <span
                  className={`
                    shrink-0
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    ${getStatusClasses(status)}
                  `}
                >
                  {status}
                </span>
              </div>

              <div
                className="
                  my-5
                  grid
                  grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
                  items-center
                  gap-3
                "
              >
                <div className="flex min-w-0 items-center justify-end gap-2">
                  <span className="truncate text-right text-sm font-semibold">
                    {prediction.homeTeam}
                  </span>

                  {prediction.homeTeamBadge && (
                    <Image
                      src={prediction.homeTeamBadge}
                      alt={prediction.homeTeam}
                      width={26}
                      height={26}
                      className="shrink-0 object-contain"
                    />
                  )}
                </div>

                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-muted/50
                    text-[10px]
                    font-black
                    text-muted-foreground
                  "
                >
                  VS
                </span>

                <div className="flex min-w-0 items-center gap-2">
                  {prediction.awayTeamBadge && (
                    <Image
                      src={prediction.awayTeamBadge}
                      alt={prediction.awayTeam}
                      width={26}
                      height={26}
                      className="shrink-0 object-contain"
                    />
                  )}

                  <span className="truncate text-sm font-semibold">
                    {prediction.awayTeam}
                  </span>
                </div>
              </div>

              <div
                className="
                  grid
                  grid-cols-[minmax(0,1fr)_auto]
                  gap-3
                  border-t
                  border-border
                  pt-3
                "
              >
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Prediction
                  </p>

                  <div className="mt-1 flex min-w-0 items-center gap-2 text-primary">
                    {predictionHero.badge && (
                      <Image
                        src={predictionHero.badge}
                        alt={predictionHero.title}
                        width={22}
                        height={22}
                        className="shrink-0 object-contain"
                      />
                    )}

                    <p className="truncate text-sm font-bold">
                      {predictionHero.title}
                    </p>
                  </div>
                </div>

                <span
                  className={`
                    h-fit
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    capitalize
                    ${getAccessClasses(prediction.accessType)}
                  `}
                >
                  {prediction.accessType}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop table */}

      <div className="hidden overflow-hidden lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead
            className="
              border-b
              border-border
              bg-muted/50
            "
          >
            <tr>
              <TableHeader>Date & Time</TableHeader>
              <TableHeader>League</TableHeader>
              <TableHeader>Fixture</TableHeader>
              <TableHeader>Prediction</TableHeader>
              <TableHeader>Access</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>

          <tbody>
            {sortedPredictions.map((prediction) => {
              const date = formatAdminDate(prediction.matchDate);
              const status = getMatchStatus(prediction);
              const predictionHero = getPredictionHero(prediction);

              const leagueName =
                prediction.league?.name ||
                getLeagueName(prediction.leagueCode);

              return (
                <tr
                  key={prediction._id}
                  onClick={() => onSelect(prediction)}
                  className="
                    cursor-pointer
                    border-b
                    border-border/70
                    transition-colors
                    last:border-0
                    hover:bg-primary/[0.04]
                  "
                >
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold">
                      {date.day}
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {date.date}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {date.time}
                    </div>
                  </td>

                  <td className="max-w-[190px] px-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-border
                          bg-background
                        "
                      >
                        {prediction.league?.emblem ? (
                          <Image
                            src={prediction.league.emblem}
                            alt={`${leagueName} emblem`}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-xs font-black text-primary">
                            L
                          </span>
                        )}
                      </div>

                      <span className="truncate text-sm font-semibold">
                        {leagueName}
                      </span>
                    </div>
                  </td>

                  <td className="min-w-[220px] px-4 py-4">
                    <div className="space-y-2">
                      <TeamRow
                        name={prediction.homeTeam}
                        badge={prediction.homeTeamBadge}
                      />

                      <div className="pl-8 text-[10px] font-bold tracking-widest text-muted-foreground">
                        VS
                      </div>

                      <TeamRow
                        name={prediction.awayTeam}
                        badge={prediction.awayTeamBadge}
                      />
                    </div>
                  </td>

                  <td className="max-w-[230px] px-4 py-4">
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-primary/15
                        bg-primary/[0.06]
                        px-3
                        py-2.5
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
                          rounded-lg
                          bg-background
                        "
                      >
                        {predictionHero.badge ? (
                          <Image
                            src={predictionHero.badge}
                            alt={predictionHero.title}
                            width={22}
                            height={22}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-xs font-black text-primary">
                            P
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-primary">
                          {predictionHero.title}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {prediction.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        capitalize
                        ${getAccessClasses(prediction.accessType)}
                      `}
                    >
                      {prediction.accessType}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        ${getStatusClasses(status)}
                      `}
                    >
                      {status === 'In Play' && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      )}

                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      className="
        whitespace-nowrap
        px-4
        py-4
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-muted-foreground
        first:px-5
        last:px-5
      "
    >
      {children}
    </th>
  );
}

function TeamRow({
  name,
  badge,
}: {
  name: string;
  badge?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className="
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
        "
      >
        {badge ? (
          <Image
            src={badge}
            alt={name}
            width={20}
            height={20}
            className="object-contain"
          />
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground">
            •
          </span>
        )}
      </div>

      <span className="truncate text-sm font-medium">
        {name}
      </span>
    </div>
  );
}