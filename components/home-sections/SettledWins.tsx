'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChevronDown,
  Loader2,
  RefreshCw,
  Trophy,
} from 'lucide-react';

import {
  getSettledWins,
  PredictionDetails,
} from '@/services/prediction.service';

import SettledWinCard from './SettledWinCard';


// ============================================================
// CONSTANTS
// ============================================================

const INITIAL_VISIBLE_COUNT = 8;

const MIN_WINS = 20;

const MAX_WINS = 50;


// ============================================================
// HELPERS
// ============================================================

function getDate(
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

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


// ============================================================
// LAST MONTH
// ============================================================

function isLastMonth(
  date: Date,
): boolean {

  const now = new Date();

  const previousMonth =
    new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

  const start =
    new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth(),
      1,
    );

  const end =
    new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth() + 1,
      1,
    );

  return (
    date >= start &&
    date < end
  );
}


// ============================================================
// RANDOMIZED QUALITY ORDER
// ============================================================

function selectWins(
  predictions: PredictionDetails[],
): PredictionDetails[] {

  const won =
    predictions.filter(
      prediction =>
        prediction.status === 'won',
    );

  if (!won.length) {
    return [];
  }

  const recent =
    won.filter(
      prediction => {

        const date =
          getDate(prediction);

        return (
          date !== null &&
          isLastMonth(date)
        );
      },
    );

  const older =
    won.filter(
      prediction => {

        const date =
          getDate(prediction);

        return (
          date !== null &&
          !isLastMonth(date)
        );
      },
    );


  // ----------------------------------------------------------
  // SCORE QUALITY
  // ----------------------------------------------------------

  const score =
    (
      prediction: PredictionDetails,
    ) => {

      const confidence =
        Number(
          prediction.confidence ?? 0,
        );

      const probability =
        prediction.data?.probabilities;

      const selection =
        prediction.data?.prediction;

      let winningProbability = 0;

      if (selection === 'HOME') {
        winningProbability =
          Number(
            probability?.home ?? 0,
          );
      }

      if (selection === 'DRAW') {
        winningProbability =
          Number(
            probability?.draw ?? 0,
          );
      }

      if (selection === 'AWAY') {
        winningProbability =
          Number(
            probability?.away ?? 0,
          );
      }

      return (
        confidence * 0.55 +
        winningProbability * 0.45
      );
    };


  // ----------------------------------------------------------
  // QUALITY POOL
  // ----------------------------------------------------------

  const sortByQuality =
    (
      a: PredictionDetails,
      b: PredictionDetails,
    ) =>
      score(b) - score(a);

  const recentSorted =
    [...recent]
      .sort(sortByQuality);

  const olderSorted =
    [...older]
      .sort(sortByQuality);


  // ----------------------------------------------------------
  // PREFER LAST MONTH
  // ----------------------------------------------------------

  let pool =
    recentSorted.slice(
      0,
      MAX_WINS,
    );


  // ----------------------------------------------------------
  // SUPPLEMENT IF LESS THAN 20
  // ----------------------------------------------------------

  if (pool.length < MIN_WINS) {

    const needed =
      MIN_WINS -
      pool.length;

    pool = [
      ...pool,
      ...olderSorted.slice(
        0,
        needed,
      ),
    ];
  }


  // ----------------------------------------------------------
  // NEVER EXCEED 50
  // ----------------------------------------------------------

  pool =
    pool.slice(
      0,
      MAX_WINS,
    );


  // ----------------------------------------------------------
  // CONTROLLED RANDOM DISPLAY
  // ----------------------------------------------------------

  return [...pool].sort(
    () =>
      Math.random() - 0.5,
  );
}


// ============================================================
// COMPONENT
// ============================================================

export default function SettledWins() {

  const [
    predictions,
    setPredictions,
  ] =
    useState<PredictionDetails[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState(false);

  const [
    expanded,
    setExpanded,
  ] =
    useState(false);


  // ==========================================================
  // LOAD
  // ==========================================================

const loadWins =
  useCallback(
    async () => {

      try {

        setLoading(true);

        setError(false);

        const data =
          await getSettledWins();

        setPredictions(
          selectWins(data),
        );

      } catch (error) {

        console.error(
          'Failed to load settled wins:',
          error,
        );

        setPredictions([]);

        setError(true);

      } finally {

        setLoading(false);

      }

    },
    [],
  );


  useEffect(
    () => {
      const promise =
        Promise.resolve().then(
          () => loadWins(),
        );

      return () => {
        void promise;
      };
    },
    [loadWins],
  );


  // ==========================================================
  // VISIBLE
  // ==========================================================

  const visibleWins =
    useMemo(
      () => {

        if (expanded) {
          return predictions;
        }

        return predictions.slice(
          0,
          INITIAL_VISIBLE_COUNT,
        );

      },
      [
        predictions,
        expanded,
      ],
    );


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

      {/* =====================================================
          COMPACT HEADER
      ===================================================== */}

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
            h-4
            w-4
            shrink-0
            text-primary
          "
        />

        <div className="min-w-0">

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
              Our
              {' '}
              <span className="text-primary">
                Wins
              </span>
            </h2>

            <span
              className="
                hidden
                text-[10px]
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
              text-[10px]
              text-muted-foreground
              sm:text-xs
            "
          >
            Recently settled predictions that landed.
          </p>

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (

        <div
          className="
            flex
            min-h-[180px]
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
              text-xs
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


      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (

        <div
          className="
            rounded-xl
            border
            border-border
            bg-card
            p-5
            text-center
          "
        >

          <p
            className="
              text-xs
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
              py-1.5
              text-xs
              font-semibold
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


      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!loading &&
        !error &&
        predictions.length === 0 && (

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
                text-xs
                font-semibold
              "
            >
              No settled wins available yet.
            </p>

          </div>

        )}


      {/* =====================================================
          GRID
      ===================================================== */}

      {!loading &&
        !error &&
        predictions.length > 0 && (

          <>

            <div
              className="
                grid
                grid-cols-1
                gap-2.5
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >

              {visibleWins.map(
                prediction => (

                  <SettledWinCard
                    key={prediction._id}
                    prediction={prediction}
                  />

                ),
              )}

            </div>


            {/* =================================================
                SHOW MORE
            ================================================= */}

            {predictions.length >
              INITIAL_VISIBLE_COUNT && (

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
                      py-1.5
                      text-xs
                      font-semibold
                      shadow-sm
                      hover:border-primary/40
                      hover:bg-primary/5
                    "
                  >

                    {expanded
                      ? 'Show less'
                      : `Show all ${predictions.length} wins`}

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

    </section>

  );
}