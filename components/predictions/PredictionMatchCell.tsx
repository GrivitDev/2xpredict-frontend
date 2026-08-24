'use client';

import Image from 'next/image';

interface Props {
  prediction: any;
}

export default function PredictionMatchCell({
  prediction,
}: Props) {
  return (
    <div
      className="
        flex
        min-w-0
        flex-col
        gap-0.5
      "
    >
      {/* HOME TEAM */}

      <TeamRow
        badge={prediction.homeTeamBadge}
        name={prediction.homeTeam}
      />

      {/* VS */}

      <div
        className="
          flex
          items-center
          gap-1.5
          pl-7
        "
      >
        <div
          className="
            h-px
            min-w-0
            flex-1
            bg-border
          "
        />

        <span
          className="
            shrink-0
            text-[8px]
            font-black
            tracking-[0.18em]
            text-muted-foreground
          "
        >
          VS
        </span>

        <div
          className="
            h-px
            min-w-0
            flex-1
            bg-border
          "
        />
      </div>

      {/* AWAY TEAM */}

      <TeamRow
        badge={prediction.awayTeamBadge}
        name={prediction.awayTeam}
      />
    </div>
  );
}


/* =========================================================
   TEAM
========================================================= */

function TeamRow({
  badge,
  name,
}: {
  badge?: string;
  name: string;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        max-w-full
        items-center
        gap-1.5
      "
    >
      {/* TEAM LOGO */}

      {badge ? (
        <Image
          src={badge}
          alt={name}
          width={20}
          height={20}
          className="
            h-5
            w-5
            shrink-0
            rounded-full
            border
            border-border
            bg-background
            object-contain
            p-0.5
          "
        />
      ) : (
        <div
          className="
            flex
            h-5
            w-5
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-muted
            text-[8px]
            font-bold
            text-muted-foreground
          "
        >
          {name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>
      )}

      {/* TEAM NAME */}

      <span
        className="
          min-w-0
          truncate
          text-[11px]
          font-semibold
          leading-4
          text-foreground
        "
        title={name}
      >
        {name}
      </span>
    </div>
  );
}