'use client';

import Image from 'next/image';

import {
  CalendarDays,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import { formatMatchTime } from '@/lib/formatMatchTime';

import type {
  PredictionItem,
} from './dashboard.types';


// ============================================================
// COMPONENT
// ============================================================

export function TopPredictionsCard({
  items = [],
}: {
  items?: PredictionItem[];
}) {
  if (!items.length) {
    return (
      <div
        className="
          flex
          min-h-[110px]
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-border/60
          bg-muted/10
          px-4
          py-5
          text-center
        "
      >
        <div className="space-y-1">
          <TrendingUp
            className="
              mx-auto
              h-5
              w-5
              text-muted-foreground/60
            "
          />

          <p
            className="
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            No predictions available today.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        grid
        gap-2.5
        sm:grid-cols-2
        xl:grid-cols-3
      "
    >
      {items.map((item, index) => {
        const home =
          item.homeTeam || 'Home';

        const away =
          item.awayTeam || 'Away';

        const confidence = Math.min(
          100,
          Math.max(
            0,
            Number(item.confidence || 0),
          ),
        );

        return (
          <div
            key={
              item._id ||
              `${home}-${away}-${index}`
            }
            className="
              overflow-hidden
              rounded-2xl
              border
              border-border/60
              bg-card
              shadow-sm
            "
          >
            {/* League Header */}

            <div
              className="
                flex
                items-center
                gap-2.5
                border-b
                border-border/50
                bg-muted/[0.025]
                px-4
                py-2.5
              "
            >
              {item.league?.emblem && (
                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-border/50
                    bg-background/70
                    p-1
                  "
                >
                  <Image
                    src={item.league.emblem}
                    alt={
                      item.league.name ||
                      'League'
                    }
                    width={20}
                    height={20}
                    className="
                      h-full
                      w-full
                      object-contain
                    "
                  />
                </div>
              )}

              <p
                className="
                  min-w-0
                  flex-1
                  truncate
                  text-xs
                  font-medium
                  text-muted-foreground
                "
              >
                {item.league?.name ||
                  'Football League'}
              </p>

              <span
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1
                  rounded-full
                  border
                  border-primary/20
                  bg-primary/10
                  px-2
                  py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-primary
                "
              >
                <TrendingUp
                  className="h-3 w-3"
                />

                Top
              </span>
            </div>

            {/* Match */}

            <div
              className="
                px-4
                pb-3.5
                pt-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <TeamMini
                  name={home}
                  badge={item.homeTeamBadge}
                />

                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border/60
                    bg-muted/20
                  "
                >
                  <span
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-muted-foreground
                    "
                  >
                    VS
                  </span>
                </div>

                <TeamMini
                  name={away}
                  badge={item.awayTeamBadge}
                  align="right"
                />
              </div>

              {/* Match Meta */}

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-border/40
                  pt-3
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-1.5
                  "
                >
                  <CalendarDays
                    className="
                      h-3.5
                      w-3.5
                      shrink-0
                      text-primary
                    "
                  />

                  <span
                    className="
                      truncate
                      text-xs
                      font-medium
                      text-muted-foreground
                    "
                  >
                    {item.matchDate
                      ? formatMatchTime(
                          item.matchDate,
                        )
                      : 'TBA'}
                  </span>
                </div>

                <Confidence
                  confidence={confidence}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ============================================================
// TEAM
// ============================================================

function TeamMini({
  name,
  badge,
  align = 'left',
}: {
  name: string;
  badge?: string;
  align?: 'left' | 'right';
}) {
  const isRight =
    align === 'right';

  return (
    <div
      className={`
        flex
        min-w-0
        flex-1
        items-center
        gap-2
        ${isRight ? 'flex-row-reverse' : ''}
      `}
    >
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
          border-border/50
          bg-muted/10
          p-1
        "
      >
        {badge ? (
          <Image
            src={badge}
            alt={name}
            width={28}
            height={28}
            className="
              h-full
              w-full
              object-contain
            "
          />
        ) : (
          <ShieldCheck
            className="
              h-4
              w-4
              text-muted-foreground
            "
          />
        )}
      </div>

      <p
        className={`
          min-w-0
          flex-1
          truncate
          text-xs
          font-semibold
          leading-snug
          ${isRight ? 'text-right' : 'text-left'}
        `}
      >
        {name}
      </p>
    </div>
  );
}


// ============================================================
// CONFIDENCE
// ============================================================

function Confidence({
  confidence,
}: {
  confidence: number;
}) {
  return (
    <div
      className="
        flex
        shrink-0
        items-center
        gap-2
      "
    >
      <div
        className="
          h-1.5
          w-10
          overflow-hidden
          rounded-full
          bg-muted
          sm:w-12
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

      <span
        className="
          text-xs
          font-semibold
          tabular-nums
          text-primary
        "
      >
        {confidence}%
      </span>
    </div>
  );
}