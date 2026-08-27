'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  Match,
} from '@/services/sports.service';


// ============================================================
// TYPES
// ============================================================

interface Props {
  fixtures: Match[];
}


// ============================================================
// HELPERS
// ============================================================

function getFixtureDate(
  fixture: Match,
): Date | null {
  if (!fixture.date) {
    return null;
  }

  const date =
    new Date(
      fixture.date,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}


// ============================================================
// DATE KEY
// ============================================================

function getDateKey(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// ============================================================
// DATE LABEL
// ============================================================

function formatDateLabel(
  date: Date,
): string {
  const today =
    new Date();

  const yesterday =
    new Date(today);

  yesterday.setDate(
    today.getDate() - 1,
  );

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    today.getDate() + 1,
  );

  const key =
    getDateKey(date);

  if (
    key ===
    getDateKey(today)
  ) {
    return 'Today';
  }

  if (
    key ===
    getDateKey(yesterday)
  ) {
    return 'Yesterday';
  }

  if (
    key ===
    getDateKey(tomorrow)
  ) {
    return 'Tomorrow';
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    },
  ).format(date);
}


// ============================================================
// START OF DAY
// ============================================================

function startOfDay(
  date: Date,
): Date {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}


// ============================================================
// COMPONENT
// ============================================================

export default function UpcomingFixtures({
  fixtures,
}: Props) {

  // ==========================================================
  // AVAILABLE DATES
  // ==========================================================

  const availableDates =
    useMemo(() => {
      const map =
        new Map<
          string,
          Date
        >();

      for (
        const fixture of fixtures
      ) {
        const date =
          getFixtureDate(
            fixture,
          );

        if (!date) {
          continue;
        }

        const normalized =
          startOfDay(
            date,
          );

        const key =
          getDateKey(
            normalized,
          );

        if (!map.has(key)) {
          map.set(
            key,
            normalized,
          );
        }
      }

      return Array.from(
        map.entries(),
      )
        .sort(
          (
            [, a],
            [, b],
          ) =>
            a.getTime() -
            b.getTime(),
        )
        .map(
          ([
            key,
            date,
          ]) => ({
            key,
            date,
          }),
        );
    }, [fixtures]);


  // ==========================================================
  // INITIAL DATE
  // ==========================================================

  const firstAvailableDate =
    availableDates[0];


  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    firstAvailableDate?.key ??
      getDateKey(
        new Date(),
      ),
  );


  // ==========================================================
  // ACTIVE DATE
  // ==========================================================

  const activeDate =
    availableDates.find(
      item =>
        item.key ===
        selectedDate,
    );


  const effectiveDate =
    activeDate ??
    firstAvailableDate;


  // ==========================================================
  // SELECTED DATE INDEX
  // ==========================================================

  const selectedDateIndex =
    availableDates.findIndex(
      item =>
        item.key ===
        effectiveDate?.key,
    );


  // ==========================================================
  // FILTER FIXTURES
  // ==========================================================

  const dateFixtures =
    useMemo(() => {
      if (!effectiveDate) {
        return [];
      }

      return fixtures
        .filter(
          fixture => {
            const date =
              getFixtureDate(
                fixture,
              );

            if (!date) {
              return false;
            }

            return (
              getDateKey(date) ===
              effectiveDate.key
            );
          },
        )
        .sort(
          (
            a,
            b,
          ) => {
            const aDate =
              getFixtureDate(a);

            const bDate =
              getFixtureDate(b);

            if (
              !aDate &&
              !bDate
            ) {
              return 0;
            }

            if (!aDate) {
              return 1;
            }

            if (!bDate) {
              return -1;
            }

            return (
              aDate.getTime() -
              bDate.getTime()
            );
          },
        );
    }, [
      fixtures,
      effectiveDate,
    ]);


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goPrevious =
    () => {
      if (
        selectedDateIndex <=
        0
      ) {
        return;
      }

      setSelectedDate(
        availableDates[
          selectedDateIndex - 1
        ].key,
      );
    };


  const goNext =
    () => {
      if (
        selectedDateIndex ===
          -1 ||
        selectedDateIndex >=
          availableDates.length - 1
      ) {
        return;
      }

      setSelectedDate(
        availableDates[
          selectedDateIndex + 1
        ].key,
      );
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        sm:rounded-3xl
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
          sm:p-5
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
            bg-green-500/10
            text-green-500
            sm:h-10
            sm:w-10
          "
        >

          <CalendarClock
            size={19}
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
            Match Fixtures
          </h2>


          <p
            className="
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            Scheduled matches
          </p>

        </div>

      </div>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      {fixtures.length === 0 ? (

        <div
          className="
            p-6
            text-center
            text-xs
            text-muted-foreground
            sm:p-8
          "
        >
          No upcoming fixtures
        </div>

      ) : (

        <>

          {/* ==================================================
              DATE SELECTOR
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-center
              border-b
              border-border
              px-3
              py-3
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-1
                rounded-xl
                border
                border-border
                bg-background
                p-1
                shadow-sm
              "
            >

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={
                  goPrevious
                }
                disabled={
                  selectedDateIndex <=
                  0
                }
                aria-label="Previous date"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                  disabled:pointer-events-none
                  disabled:opacity-30
                "
              >

                <ChevronLeft
                  className="
                    h-4
                    w-4
                  "
                />

              </button>


              {/* DATE */}

              <div
                className="
                  min-w-[130px]
                  px-3
                  text-center
                "
              >

                <p
                  className="
                    text-xs
                    font-bold
                    leading-none
                    text-foreground
                  "
                >
                  {effectiveDate
                    ? formatDateLabel(
                        effectiveDate.date,
                      )
                    : 'Today'}
                </p>


                <p
                  className="
                    mt-1
                    text-[9px]
                    font-medium
                    text-muted-foreground
                  "
                >
                  {dateFixtures.length}{' '}
                  {dateFixtures.length ===
                  1
                    ? 'fixture'
                    : 'fixtures'}
                </p>

              </div>


              {/* NEXT */}

              <button
                type="button"
                onClick={
                  goNext
                }
                disabled={
                  selectedDateIndex ===
                    -1 ||
                  selectedDateIndex >=
                    availableDates.length -
                      1
                }
                aria-label="Next date"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                  disabled:pointer-events-none
                  disabled:opacity-30
                "
              >

                <ChevronRight
                  className="
                    h-4
                    w-4
                  "
                />

              </button>

            </div>

          </div>


          {/* ==================================================
              NO FIXTURES
          ================================================== */}

          {dateFixtures.length ===
            0 ? (

            <div
              className="
                p-6
                text-center
                sm:p-8
              "
            >

              <CalendarClock
                className="
                  mx-auto
                  h-6
                  w-6
                  text-muted-foreground
                "
              />


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                No fixtures for this date
              </p>


              <p
                className="
                  mt-1
                  text-[11px]
                  text-muted-foreground
                "
              >
                Try another date.
              </p>

            </div>

          ) : (

            /* ==================================================
               TABLE
            ================================================== */

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
                  sm:text-xs
                "
              >

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
                      sm:text-[10px]
                    "
                  >

                    {/* TIME */}

                    <th
                      className="
                        px-2
                        py-2.5
                        font-medium
                        sm:px-4
                        sm:py-3
                      "
                    >
                      Time
                    </th>


                    {/* HOME */}

                    <th
                      className="
                        px-2
                        py-2.5
                        font-medium
                        sm:px-4
                        sm:py-3
                      "
                    >
                      Home
                    </th>


                    {/* AWAY */}

                    <th
                      className="
                        px-2
                        py-2.5
                        font-medium
                        sm:px-4
                        sm:py-3
                      "
                    >
                      Away
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {dateFixtures.map(
                    match => (

                      <tr
                        key={
                          match.id
                        }
                        className="
                          border-b
                          border-border/50
                          last:border-0
                          hover:bg-muted/30
                        "
                      >

                        {/* TIME */}

                        <td
                          className="
                            whitespace-nowrap
                            px-2
                            py-2.5
                            font-semibold
                            text-foreground
                            sm:px-4
                            sm:py-3
                          "
                        >

                          {match.time}

                        </td>


                        {/* HOME */}

                        <td
                          className="
                            px-2
                            py-2.5
                            sm:px-4
                            sm:py-3
                          "
                        >

                          <div
                            className="
                              flex
                              min-w-0
                              items-center
                              gap-2
                            "
                          >

                            {match.homeTeamBadge ? (

                              <Image
                                src={
                                  match.homeTeamBadge
                                }
                                alt=""
                                width={24}
                                height={24}
                                className="
                                  h-6
                                  w-6
                                  shrink-0
                                  object-contain
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
                                "
                              />

                            )}


                            <span
                              className="
                                min-w-0
                                max-w-[130px]
                                truncate
                                font-medium
                                text-foreground
                                sm:max-w-none
                              "
                            >
                              {match.homeTeam}
                            </span>

                          </div>

                        </td>


                        {/* AWAY */}

                        <td
                          className="
                            px-2
                            py-2.5
                            sm:px-4
                            sm:py-3
                          "
                        >

                          <div
                            className="
                              flex
                              min-w-0
                              items-center
                              gap-2
                            "
                          >

                            {match.awayTeamBadge ? (

                              <Image
                                src={
                                  match.awayTeamBadge
                                }
                                alt=""
                                width={24}
                                height={24}
                                className="
                                  h-6
                                  w-6
                                  shrink-0
                                  object-contain
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
                                "
                              />

                            )}


                            <span
                              className="
                                min-w-0
                                max-w-[130px]
                                truncate
                                font-medium
                                text-foreground
                                sm:max-w-none
                              "
                            >
                              {match.awayTeam}
                            </span>

                          </div>

                        </td>

                      </tr>

                    ),
                  )}

                </tbody>

              </table>

            </div>

          )}

        </>

      )}

    </section>

  );
}