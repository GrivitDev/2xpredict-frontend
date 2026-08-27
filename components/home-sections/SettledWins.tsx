'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Trophy,
} from 'lucide-react';

import {
  getSettledWins,
  PredictionDetails,
} from '@/services/prediction.service';

import {
  getPastResultsByIds,
  Match,
} from '@/services/sports.service';

import {
  createResultMap,
  MatchScore,
} from './features/Results';

import SettledWinCard from './SettledWinCard';


// ============================================================
// CONSTANTS
// ============================================================

const DESKTOP_INITIAL_COUNT = 10;

const MAX_WINS_PER_DATE = 20;


// ============================================================
// HELPERS
// ============================================================

function getPredictionDate(
  prediction: PredictionDetails,
): Date | null {
  const value =
    prediction.matchDate ??
    prediction.match?.utcDate ??
    prediction.date;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}


// ============================================================
// DATE KEY
// ============================================================

function getDateKey(
  date: Date,
): string {
  const year = date.getFullYear();

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
// TODAY KEY
// ============================================================

function getTodayKey(): string {
  return getDateKey(
    new Date(),
  );
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
// NORMALIZE DATE
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
// SORT WINS
// ============================================================

function sortWins(
  predictions: PredictionDetails[],
): PredictionDetails[] {
  return [...predictions].sort(
    (a, b) => {
      const aDate =
        getPredictionDate(a);

      const bDate =
        getPredictionDate(b);

      if (!aDate && !bDate) {
        return 0;
      }

      if (!aDate) {
        return 1;
      }

      if (!bDate) {
        return -1;
      }

      return (
        bDate.getTime() -
        aDate.getTime()
      );
    },
  );
}


// ============================================================
// SELECT DATE
// ============================================================

function findInitialDate(
  predictions: PredictionDetails[],
): string {
  const dates =
    predictions
      .map(getPredictionDate)
      .filter(
        (
          date,
        ): date is Date =>
          date !== null,
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.getTime() -
          a.getTime(),
      );

  if (!dates.length) {
    return getTodayKey();
  }

  return getDateKey(
    dates[0],
  );
}


// ============================================================
// COMPONENT
// ============================================================

export default function SettledWins() {
  const [
    predictions,
    setPredictions,
  ] = useState<
    PredictionDetails[]
  >([]);

  const [
    results,
    setResults,
  ] = useState<Match[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(false);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getTodayKey(),
  );

  const [
    expanded,
    setExpanded,
  ] = useState(false);


  // ==========================================================
  // LOAD
  // ==========================================================

  const loadWins =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(false);

          // ==================================================
          // 1. GET ALL SETTLED PREDICTIONS
          // ==================================================

          const settledData =
            await getSettledWins();

          // ==================================================
          // 2. ONLY WON PREDICTIONS
          // ==================================================

          const wonPredictions =
            settledData.filter(
              prediction =>
                prediction.status ===
                'won',
            );

          // ==================================================
          // 3. SORT BY DATE
          // ==================================================

          const sortedWins =
            sortWins(
              wonPredictions,
            );

          setPredictions(
            sortedWins,
          );

          // ==================================================
          // 4. SELECT INITIAL DATE
          // ==================================================

          if (sortedWins.length) {
            setSelectedDate(
              current => {
                const currentExists =
                  sortedWins.some(
                    prediction => {
                      const date =
                        getPredictionDate(
                          prediction,
                        );

                      return (
                        date !== null &&
                        getDateKey(date) ===
                          current
                      );
                    },
                  );

                return currentExists
                  ? current
                  : findInitialDate(
                      sortedWins,
                    );
              },
            );
          }

          // ==================================================
          // 5. EXTRACT MATCH IDS
          // ==================================================

          const matchIds =
            sortedWins
              .map(
                prediction =>
                  prediction.matchId,
              )
              .filter(
                (
                  matchId,
                ): matchId is string =>
                  matchId !==
                    undefined &&
                  matchId !== null &&
                  String(
                    matchId,
                  ).trim() !== '',
              );

          // ==================================================
          // 6. FETCH EXACT MATCHES
          // ==================================================

          if (!matchIds.length) {
            setResults([]);
            return;
          }

          const resultsData =
            await getPastResultsByIds(
              matchIds,
            );

          setResults(
            resultsData,
          );
        } catch (error) {
          console.error(
            'Failed to load settled wins:',
            error,
          );

          setPredictions([]);
          setResults([]);
          setError(true);
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {
      const timeoutId =
        window.setTimeout(
          () => {
            void loadWins();
          },
          0,
        );

      return () => {
        window.clearTimeout(
          timeoutId,
        );
      };
    },
    [loadWins],
  );


  // ==========================================================
  // RESULT MAP
  // ==========================================================

  const resultMap =
    useMemo(
      () =>
        createResultMap(
          results,
        ),
      [results],
    );


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
        const prediction of
          predictions
      ) {
        const date =
          getPredictionDate(
            prediction,
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
    }, [predictions]);


  // ==========================================================
  // SELECTED DATE INDEX
  // ==========================================================

  const selectedDateIndex =
    availableDates.findIndex(
      item =>
        item.key ===
        selectedDate,
    );


  // ==========================================================
  // SELECTED DATE
  // ==========================================================

  const selectedDateObject =
    availableDates[
      selectedDateIndex
    ]?.date ??
    new Date(
      `${selectedDate}T00:00:00`,
    );


  // ==========================================================
  // DATE WINS
  // ==========================================================

  const dateWins =
    useMemo(() => {
      return predictions
        .filter(
          prediction => {
            const date =
              getPredictionDate(
                prediction,
              );

            if (!date) {
              return false;
            }

            return (
              getDateKey(date) ===
              selectedDate
            );
          },
        )
        .slice(
          0,
          MAX_WINS_PER_DATE,
        );
    }, [
      predictions,
      selectedDate,
    ]);


  // ==========================================================
  // VISIBLE WINS
  // ==========================================================

  const visibleWins =
    useMemo(() => {
      const initial =
        expanded
          ? MAX_WINS_PER_DATE
          : DESKTOP_INITIAL_COUNT;

      return dateWins.slice(
        0,
        initial,
      );
    }, [
      dateWins,
      expanded,
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

      setExpanded(false);

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

      setExpanded(false);

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
        rounded-2xl
        bg-background
        py-3
        text-foreground
        sm:py-4
      "
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          mb-4
          flex
          items-center
          gap-2
        "
      >
        <Trophy
          className="
            h-5
            w-5
            shrink-0
            text-primary
          "
        />

        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex
              items-baseline
              gap-1.5
            "
          >
            <h2
              className="
                text-lg
                font-bold
                tracking-tight
                sm:text-xl
              "
            >
              Our{' '}

              <span
                className="
                  text-primary
                "
              >
                Wins
              </span>
            </h2>

            <span
              className="
                hidden
                text-[11px]
                font-semibold
                text-muted-foreground
                sm:inline
              "
            >
              · Proven Results
            </span>
          </div>

          <p
            className="
              mt-0.5
              text-[11px]
              text-muted-foreground
              sm:text-xs
            "
          >
            Recently settled predictions
            that landed.
          </p>
        </div>
      </div>


      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading && (
        <div
          className="
            flex
            min-h-[160px]
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-card/50
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              text-muted-foreground
            "
          >
            <Loader2
              className="
                h-4
                w-4
                animate-spin
                text-primary
              "
            />

            Loading wins...
          </div>
        </div>
      )}


      {/* ====================================================
          ERROR
      ==================================================== */}

      {!loading &&
        error && (
          <div
            className="
              rounded-xl
              border
              border-border
              bg-card
              p-6
              text-center
            "
          >
            <p
              className="
                text-sm
                font-semibold
              "
            >
              Unable to load settled wins.
            </p>

            <button
              type="button"
              onClick={loadWins}
              className="
                mt-3
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-border
                px-3
                py-2
                text-xs
                font-semibold
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >
              <RefreshCw
                className="
                  h-3.5
                  w-3.5
                "
              />

              Try again
            </button>
          </div>
        )}


      {/* ====================================================
          EMPTY
      ==================================================== */}

      {!loading &&
        !error &&
        predictions.length ===
          0 && (
          <div
            className="
              rounded-xl
              border
              border-border
              bg-card
              p-6
              text-center
            "
          >
            <Trophy
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
              "
            >
              No settled wins available yet.
            </p>
          </div>
        )}


      {/* ====================================================
          CONTENT
      ==================================================== */}

      {!loading &&
        !error &&
        predictions.length > 0 && (
          <>

            {/* ==================================================
                DATE SELECTOR
            ================================================== */}

            <div
              className="
                mb-4
                flex
                items-center
                justify-center
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
                  bg-card
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
                    min-w-[120px]
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
                    {formatDateLabel(
                      selectedDateObject,
                    )}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[9px]
                      font-medium
                      text-muted-foreground
                    "
                  >
                    {dateWins.length}{' '}
                    {dateWins.length ===
                    1
                      ? 'win'
                      : 'wins'}
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
                NO WINS FOR DATE
            ================================================== */}

            {dateWins.length ===
              0 && (
              <div
                className="
                  rounded-xl
                  border
                  border-border
                  bg-card
                  px-4
                  py-8
                  text-center
                "
              >
                <Trophy
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
                  "
                >
                  No settled wins for this
                  date.
                </p>
              </div>
            )}


            {/* ==================================================
                GRID
            ================================================== */}

            {dateWins.length >
              0 && (
              <>
                <div
                  className="
                    grid
                    grid-cols-1
                    gap-2
                    sm:grid-cols-2
                    lg:grid-cols-5
                  "
                >
                  {visibleWins.map(
                    prediction => {
                      const score:
                        MatchScore =
                        resultMap.get(
                          String(
                            prediction.matchId,
                          ),
                        ) ?? {
                          home: null,
                          away: null,
                        };

                      return (
                        <SettledWinCard
                          key={
                            prediction._id
                          }
                          prediction={
                            prediction
                          }
                          score={
                            score
                          }
                        />
                      );
                    },
                  )}
                </div>


                {/* ==================================================
                    SHOW MORE
                ================================================== */}

                {dateWins.length >
                  6 && (
                  <div
                    className="
                      mt-4
                      flex
                      justify-center
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(
                          current =>
                            !current,
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-border
                        bg-card
                        px-3.5
                        py-2
                        text-xs
                        font-semibold
                        shadow-sm
                        transition
                        hover:border-primary/40
                        hover:bg-primary/5
                      "
                    >
                      {expanded
                        ? 'Show less'
                        : `Show all ${Math.min(
                            dateWins.length,
                            MAX_WINS_PER_DATE,
                          )} wins`}

                      <ChevronDown
                        className={`
                          h-3.5
                          w-3.5
                          transition-transform
                          ${
                            expanded
                              ? 'rotate-180'
                              : ''
                          }
                        `}
                      />
                    </button>
                  </div>
                )}

              </>
            )}

          </>
        )}

    </section>
  );
}