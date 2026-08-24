'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type {
  Match,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

interface Props {
  matches: Match[];
}


// ============================================================
// CONSTANTS
// ============================================================

const MAX_VISIBLE_MATCHES = 10;

const NIGERIA_TIMEZONE = 'Africa/Lagos';


// ============================================================
// HELPERS
// ============================================================

function getNigeriaDate(
  date: Date,
): string {

  return date.toLocaleDateString(
    'en-CA',
    {
      timeZone: NIGERIA_TIMEZONE,
    },
  );

}


function formatMatchTime(
  date: string,
): string {

  return new Date(date).toLocaleTimeString(
    'en-NG',
    {
      timeZone: NIGERIA_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );

}


function formatTodayDate(): string {

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: NIGERIA_TIMEZONE,
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(new Date());

}


// ============================================================
// COMPONENT
// ============================================================

export default function TodayMatches({
  matches,
}: Props) {

  const [
    expanded,
    setExpanded,
  ] = useState(false);


  // ==========================================================
  // TODAY'S MATCHES
  // ==========================================================

  const todayMatches = useMemo(() => {

    const today =
      getNigeriaDate(new Date());


    return matches.filter(
      match => {

        return (
          getNigeriaDate(
            new Date(match.date),
          ) === today
        );

      },
    );

  }, [
    matches,
  ]);


  // ==========================================================
  // VISIBLE MATCHES
  // ==========================================================

  const visibleMatches =
    expanded
      ? todayMatches
      : todayMatches.slice(
          0,
          MAX_VISIBLE_MATCHES,
        );


  // ==========================================================
  // DATE
  // ==========================================================

  const formattedDate =
    formatTodayDate();


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/30
      "
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-border
          p-3
          sm:gap-3
          sm:p-6
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
            bg-blue-500/10
            text-blue-500
            sm:h-11
            sm:w-11
            sm:rounded-2xl
          "
        >

          <CalendarDays
            size={19}
            className="
              sm:h-[22px]
              sm:w-[22px]
            "
          />

        </div>


        <div>

          <h2
            className="
              text-base
              font-bold
              text-foreground
              sm:text-lg
            "
          >
            Matches for Today
          </h2>


          <p
            className="
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            {formattedDate}
          </p>

        </div>

      </div>


      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {todayMatches.length === 0 ? (

        <div
          className="
            p-7
            text-center
            sm:p-10
          "
        >

          <h3
            className="
              text-lg
              font-semibold
              text-foreground
            "
          >
            No matches today
          </h3>


          <p
            className="
              mt-2
              text-s
              text-muted-foreground
            "
          >
            There are no fixtures scheduled
            for today in this league.
          </p>

        </div>

      ) : (

        <>

          {/* ==================================================
              MATCH TABLE
          ================================================== */}

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                min-w-[500px]
                text-[11px]
                sm:min-w-[650px]
                sm:text-s
              "
            >

              {/* ==============================================
                  TABLE HEADER
              ============================================== */}

              <thead>

                <tr
                  className="
                    border-b
                    border-border
                    text-left
                    text-[9px]
                    uppercase
                    tracking-wide
                    text-muted-foreground
                    sm:text-xs
                  "
                >

                  {/* TIME */}

                  <th
                    className="
                      w-[65px]
                      px-2
                      py-2
                      sm:w-auto
                      sm:px-6
                      sm:py-4
                    "
                  >
                    Time
                  </th>


                  {/* HOME */}

                  <th
                    className="
                      w-[145px]
                      px-1.5
                      py-2
                      sm:w-auto
                      sm:px-4
                      sm:py-4
                    "
                  >
                    Home
                  </th>


                  {/* AWAY */}

                  <th
                    className="
                      w-[145px]
                      px-1.5
                      py-2
                      sm:w-auto
                      sm:px-4
                      sm:py-4
                    "
                  >
                    Away
                  </th>


                  {/* VENUE */}

                  <th
                    className="
                      w-[130px]
                      px-1.5
                      py-2
                      sm:w-auto
                      sm:px-4
                      sm:py-4
                    "
                  >
                    Venue
                  </th>

                </tr>

              </thead>


              {/* ==============================================
                  TABLE BODY
              ============================================== */}

              <tbody>

                {visibleMatches.map(
                  match => (

                    <tr
                      key={match.id}
                      className="
                        border-b
                        border-border/50
                        transition
                        hover:bg-muted/40
                      "
                    >

                      {/* ====================================
                          TIME
                      ==================================== */}

                      <td
                        className="
                          whitespace-nowrap
                          px-2
                          py-2.5
                          font-bold
                          text-foreground
                          sm:px-6
                          sm:py-5
                        "
                      >
                        {formatMatchTime(
                          match.date,
                        )}
                      </td>


                      {/* ====================================
                          HOME
                      ==================================== */}

                      <td
                        className="
                          w-[145px]
                          px-1.5
                          py-2.5
                          sm:w-auto
                          sm:px-4
                          sm:py-5
                        "
                      >

                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                            font-semibold
                            text-foreground
                            sm:gap-3
                          "
                        >

                          {match.homeTeamBadge ? (

                            <Image
                              src={
                                match.homeTeamBadge
                              }
                              alt={
                                `${match.homeTeam} badge`
                              }
                              width={32}
                              height={32}
                              className="
                                h-6
                                w-6
                                shrink-0
                                object-contain
                                sm:h-8
                                sm:w-8
                              "
                            />

                          ) : (

                            <div
                              className="
                                h-6
                                w-6
                                shrink-0
                                rounded-full
                                bg-muted
                                sm:h-8
                                sm:w-8
                              "
                            />

                          )}


                          <span
                            className="
                              min-w-0
                              max-w-[100px]
                              truncate
                              sm:max-w-none
                            "
                          >
                            {match.homeTeam}
                          </span>

                        </div>

                      </td>


                      {/* ====================================
                          AWAY
                      ==================================== */}

                      <td
                        className="
                          w-[145px]
                          px-1.5
                          py-2.5
                          sm:w-auto
                          sm:px-4
                          sm:py-5
                        "
                      >

                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                            font-semibold
                            text-foreground
                            sm:gap-3
                          "
                        >

                          {match.awayTeamBadge ? (

                            <Image
                              src={
                                match.awayTeamBadge
                              }
                              alt={
                                `${match.awayTeam} badge`
                              }
                              width={32}
                              height={32}
                              className="
                                h-6
                                w-6
                                shrink-0
                                object-contain
                                sm:h-8
                                sm:w-8
                              "
                            />

                          ) : (

                            <div
                              className="
                                h-6
                                w-6
                                shrink-0
                                rounded-full
                                bg-muted
                                sm:h-8
                                sm:w-8
                              "
                            />

                          )}


                          <span
                            className="
                              min-w-0
                              max-w-[100px]
                              truncate
                              sm:max-w-none
                            "
                          >
                            {match.awayTeam}
                          </span>

                        </div>

                      </td>


                      {/* ====================================
                          VENUE
                      ==================================== */}

                      <td
                        className="
                          w-[130px]
                          max-w-[130px]
                          px-1.5
                          py-2.5
                          text-muted-foreground
                          sm:w-auto
                          sm:max-w-[220px]
                          sm:px-4
                          sm:py-5
                        "
                      >

                        <span
                          className="
                            block
                            max-w-[115px]
                            truncate
                            sm:max-w-none
                          "
                        >
                          {match.venue ??
                            'Not available'}
                        </span>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>


          {/* ==================================================
              EXPAND BUTTON
          ================================================== */}

          {todayMatches.length >
            MAX_VISIBLE_MATCHES && (

            <button
              type="button"
              onClick={() =>
                setExpanded(
                  current => !current,
                )
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                border-t
                border-border
                py-3
                text-xs
                font-semibold
                text-foreground
                transition
                hover:bg-muted/40
                sm:py-4
                sm:text-s
              "
            >

              {expanded ? (

                <>
                  Show Less
                  <ChevronUp
                    size={15}
                  />
                </>

              ) : (

                <>
                  Show All Matches
                  ({todayMatches.length})
                  <ChevronDown
                    size={15}
                  />
                </>

              )}

            </button>

          )}

        </>

      )}

    </section>

  );

}