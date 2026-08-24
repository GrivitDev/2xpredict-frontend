'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  GitBranch,
  List,
  Trophy,
} from 'lucide-react';

import type {
  CompetitionStandingsResponse,
} from '@/services/sports.service';

import LeagueTable from './LeagueTable';
import KnockoutBracket from './KnockoutBracket';


// ============================================================
// TYPES
// ============================================================

interface Props {
  competition: CompetitionStandingsResponse;
}


type CupView =
  | 'groups'
  | 'knockout';


// ============================================================
// COMPONENT
// ============================================================

export default function CupCompetition({
  competition,
}: Props) {

  const groups =
    useMemo(
      () =>
        competition.groups ?? [],
      [
        competition.groups,
      ],
    );


  const knockout =
    useMemo(
      () =>
        competition.knockout ?? [],
      [
        competition.knockout,
      ],
    );


  const knockoutStarted =
    useMemo(
      () =>
        knockout.some(
          stage =>
            stage.matches.some(
              match =>
                match.status === 'FINISHED' ||
                match.status === 'IN_PLAY' ||
                match.status === 'PAUSED' ||
                match.status === 'LIVE',
            ),
        ),
      [
        knockout,
      ],
    );


  const hasGroups =
    groups.length > 0;


  const hasKnockout =
    knockout.length > 0;


  const [
    view,
    setView,
  ] = useState<CupView>(
    hasGroups
      ? 'groups'
      : 'knockout',
  );


  const sortedGroups =
    useMemo(
      () =>
        [...groups].sort(
          (
            a,
            b,
          ) =>
            a.group.localeCompare(
              b.group,
              undefined,
              {
                numeric: true,
              },
            ),
        ),
      [
        groups,
      ],
    );


  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !hasGroups &&
    !hasKnockout
  ) {

    return (

      <section
        className="
          rounded-3xl
          border
          border-border
          bg-card/60
          p-4
          shadow-xl
          backdrop-blur-xl
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            py-10
            text-center
          "
        >

          <Trophy
            className="
              mb-3
              h-8
              w-8
              text-muted-foreground
            "
          />


          <p
            className="
              text-sm
              font-semibold
              text-foreground
            "
          >
            Competition data unavailable
          </p>


          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            No group or knockout information is available yet.
          </p>

        </div>

      </section>

    );

  }


  const showingGroups =
    view === 'groups';


  const showingKnockout =
    view === 'knockout';


  return (

    <section
      className="
        relative
        space-y-3
      "
    >

      {/* ======================================================
          COMPETITION HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-2.5
        "
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
            bg-yellow-500/10
            text-yellow-500
          "
        >

          <Trophy
            className="
              h-4
              w-4
            "
          />

        </div>


        <div
          className="
            min-w-0
          "
        >

          <h2
            className="
              truncate
              text-base
              font-bold
              text-foreground
            "
          >
            {
              competition
                .competition
                .name
            }
          </h2>


          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            {knockoutStarted
              ? 'Group and knockout stages'
              : hasGroups
                ? 'Group stage'
                : 'Knockout stage'}
          </p>

        </div>

      </div>


      {/* ======================================================
          VIEW SWITCH
      ====================================================== */}

      {knockoutStarted &&
        hasGroups &&
        hasKnockout && (

          <div
            className="
              flex
              w-full
              items-center
              gap-1
              rounded-xl
              border
              border-border/60
              bg-muted/30
              p-1
            "
          >

            <button
              type="button"
              onClick={() =>
                setView('groups')
              }
              className={`
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-semibold
                transition
                ${
                  showingGroups
                    ? `
                      bg-background
                      text-foreground
                      shadow-sm
                    `
                    : `
                      text-muted-foreground
                      hover:text-foreground
                    `
                }
              `}
            >

              <List
                className="
                  h-4
                  w-4
                "
              />

              Groups

            </button>


            <button
              type="button"
              onClick={() =>
                setView('knockout')
              }
              className={`
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-lg
                px-3
                py-1.5
                text-xs
                font-semibold
                transition
                ${
                  showingKnockout
                    ? `
                      bg-background
                      text-foreground
                      shadow-sm
                    `
                    : `
                      text-muted-foreground
                      hover:text-foreground
                    `
                }
              `}
            >

              <GitBranch
                className="
                  h-4
                  w-4
                "
              />

              Knockout

            </button>

          </div>

        )}


      {/* ======================================================
          GROUPS
      ====================================================== */}

      {showingGroups &&
        hasGroups && (

          <div
            className="
              space-y-3
            "
          >

            {sortedGroups.map(
              group => (

                <LeagueTable
                  key={
                    `${group.stage}-${group.group}`
                  }
                  table={
                    group.table
                  }
                  title={
                    group.group
                  }
                  subtitle="Group standings"
                />

              ),
            )}

          </div>

        )}


      {/* ======================================================
          KNOCKOUT
      ====================================================== */}

      {showingKnockout &&
        hasKnockout && (

          <KnockoutBracket
            stages={
              knockout
            }
          />

        )}

    </section>

  );

}