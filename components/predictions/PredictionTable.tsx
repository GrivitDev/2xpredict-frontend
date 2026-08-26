'use client';

import { useCallback } from 'react';

import clsx from 'clsx';

import PredictionRow, {
  SubscriptionRequiredData,
} from './PredictionRow';


interface Props {
  predictions: any[];

  highlightedId?: string | null;

  onSubscriptionRequired: (
    params: SubscriptionRequiredData,
  ) => void;
}


export default function PredictionTable({
  predictions,
  highlightedId,
  onSubscriptionRequired,
}: Props) {
  const handleSubscriptionRequired =
    useCallback(
      (params: SubscriptionRequiredData) => {
        onSubscriptionRequired(params);
      },
      [onSubscriptionRequired],
    );

  return (
    <div
      className="
        hidden
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        xl:block
      "
    >
      <table
        className="
          w-full
          table-fixed
          border-collapse
          text-xs
        "
      >
        <colgroup>
          <col className="w-[8%]" />
          <col className="w-[12%]" />
          <col className="w-[20%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[20%]" />
        </colgroup>

        <thead
          className="
            border-b
            border-border
            bg-muted/40
          "
        >
          <tr>
            <Header>Date & Time</Header>
            <Header>League</Header>
            <Header>Match</Header>
            <Header>Prediction</Header>
            <Header>Probability</Header>
            <Header>Markets</Header>
          </tr>
        </thead>

        <tbody>
          {predictions.map((prediction) => {
            const id = String(
              prediction?._id ??
                prediction?.id ??
                '',
            );

            return (
              <PredictionRow
                key={id}
                prediction={prediction}
                highlighted={
                  highlightedId === id
                }
                onSubscriptionRequired={
                  handleSubscriptionRequired
                }
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


/* =========================================================
   HEADER
========================================================= */

function Header({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <th
      scope="col"
      className={clsx(
        `
          px-2
          py-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-muted-foreground
        `,
        align === 'center' && 'text-center',
      )}
    >
      {children}
    </th>
  );
}