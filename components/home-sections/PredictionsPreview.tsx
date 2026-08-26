'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  ArrowRight,
  ChevronDown,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import {
  getPredictions,
  getPredictionAccess,
  PredictionDetails,
} from '@/services/prediction.service';

import PredictionPreviewCard from './PredictionPreviewCard';

import {
  useAuth,
} from '@/providers/auth-provider';

import {
  getApiErrorMessage,
} from '@/lib/getApiErrorMessage';

import {
  toast,
} from 'sonner';


// ============================================================
// TYPES
// ============================================================

interface PredictionsPreviewProps {
  search: string;
  selectedDate: string;
  goalFilter: string;
  resultFilter:
    | 'all'
    | 'home'
    | 'away'
    | 'draw';
}


// ============================================================
// CONSTANTS
// ============================================================

const INITIAL_VISIBLE_COUNT = 10;


// ============================================================
// HELPERS
// ============================================================

function getPredictionDate(
  prediction: PredictionDetails,
): string | undefined {

  if (
    typeof prediction.matchId === 'object' &&
    prediction.matchId !== null
  ) {

    return (
      prediction.matchId as {
        utcDate?: string;
      }
    ).utcDate;

  }

  return (
    prediction.match?.utcDate ??
    prediction.matchDate ??
    prediction.date
  );
}


// ============================================================
// COMPONENT
// ============================================================

export default function PredictionsPreview({
  search,
  selectedDate,
  goalFilter,
  resultFilter,
}: PredictionsPreviewProps) {

  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    predictions,
    setPredictions,
  ] = useState<PredictionDetails[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(false);

  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const [
    openingPredictionId,
    setOpeningPredictionId,
  ] = useState<string | null>(null);


  // ==========================================================
  // LOAD PREDICTIONS
  // ==========================================================

  const loadPredictions = useCallback(
    async () => {

      try {

        setLoading(true);
        setError(false);

        const response =
          await getPredictions();

        let data: PredictionDetails[] = [];

        if (Array.isArray(response)) {

          data = response;

        } else if (
          Array.isArray(response?.data)
        ) {

          data = response.data;

        } else if (
          Array.isArray(response?.predictions)
        ) {

          data = response.predictions;

        }


        const now = Date.now();

        const upcoming =
          data
            .filter(
              prediction =>
                Boolean(prediction?._id),
            )
            .filter(
              prediction => {

                const dateValue =
                  getPredictionDate(
                    prediction,
                  );

                if (!dateValue) {
                  return false;
                }

                const timestamp =
                  new Date(
                    dateValue,
                  ).getTime();

                return (
                  !Number.isNaN(timestamp) &&
                  timestamp >= now
                );

              },
            )
            .sort(
              (a, b) => {

                const first =
                  new Date(
                    getPredictionDate(a) ?? '',
                  ).getTime();

                const second =
                  new Date(
                    getPredictionDate(b) ?? '',
                  ).getTime();

                return first - second;

              },
            );

        setPredictions(upcoming);

      } catch (err) {

        console.error(
          'Failed to load predictions:',
          err,
        );

        setError(true);
        setPredictions([]);

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
      loadPredictions();
    },
    [loadPredictions],
  );


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredPredictions =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();

        const minimumGoals =
          goalFilter
            ? Number(goalFilter)
            : null;

        return predictions.filter(
          prediction => {

            // ----------------------------------------------
            // SEARCH
            // ----------------------------------------------

            if (query) {

              const matchesSearch =
                prediction.homeTeam
                  ?.toLowerCase()
                  .includes(query) ||

                prediction.awayTeam
                  ?.toLowerCase()
                  .includes(query) ||

                prediction.league?.name
                  ?.toLowerCase()
                  .includes(query) ||

                prediction.venue
                  ?.toLowerCase()
                  .includes(query);

              if (!matchesSearch) {
                return false;
              }

            }


            // ----------------------------------------------
            // DATE
            // ----------------------------------------------

            if (selectedDate) {

              const dateValue =
                getPredictionDate(
                  prediction,
                );

              if (!dateValue) {
                return false;
              }

              const predictionDate =
                new Date(
                  dateValue,
                )
                  .toISOString()
                  .slice(0, 10);

              if (
                predictionDate !==
                selectedDate
              ) {

                return false;

              }

            }


            // ----------------------------------------------
            // GOALS
            // ----------------------------------------------

            if (
              minimumGoals !== null &&
              (
                (prediction.homeScore ?? 0) +
                (prediction.awayScore ?? 0)
              ) < minimumGoals
            ) {

              return false;

            }


            // ----------------------------------------------
            // RESULT
            // ----------------------------------------------

            if (
              resultFilter !== 'all'
            ) {

              const home =
                prediction.homeScore ?? 0;

              const away =
                prediction.awayScore ?? 0;

              if (
                resultFilter === 'home' &&
                home <= away
              ) {
                return false;
              }

              if (
                resultFilter === 'away' &&
                away <= home
              ) {
                return false;
              }

              if (
                resultFilter === 'draw' &&
                home !== away
              ) {
                return false;
              }

            }


            return true;

          },
        );

      },
      [
        predictions,
        search,
        selectedDate,
        goalFilter,
        resultFilter,
      ],
    );


  // ==========================================================
  // VISIBLE PREDICTIONS
  // ==========================================================

  const visiblePredictions =
    expanded
      ? filteredPredictions
      : filteredPredictions.slice(
          0,
          INITIAL_VISIBLE_COUNT,
        );


  // ==========================================================
  // RESET EXPANSION WHEN FILTERS CHANGE
  // ==========================================================

  useEffect(
    () => {
      setExpanded(false);
    },
    [
      search,
      selectedDate,
      goalFilter,
      resultFilter,
    ],
  );


  // ==========================================================
  // VIEW ALL
  // ==========================================================

  const handleViewAll =
    useCallback(
      () => {

        if (authLoading) {
          return;
        }

        if (user) {

          router.push(
            '/dashboard/predictions',
          );

          return;

        }

        router.push(
          '/login?redirect=/dashboard/predictions',
        );

      },
      [
        authLoading,
        user,
        router,
      ],
    );


  // ==========================================================
  // OPEN PREDICTION
  // ==========================================================

  const handlePredictionClick =
    useCallback(
      async (
        prediction: PredictionDetails,
      ) => {

        const predictionId =
          prediction._id;

        if (!predictionId) {

          toast.error(
            'Unable to open prediction',
            {
              description:
                'This prediction does not have a valid database ID.',
            },
          );

          return;

        }


        if (authLoading) {

          toast.info(
            'Checking your account...',
          );

          return;

        }


        const dashboardUrl =
          `/dashboard/predictions?prediction=${encodeURIComponent(
            predictionId,
          )}`;


        if (!user) {

          router.push(
            `/login?redirect=${encodeURIComponent(
              dashboardUrl,
            )}`,
          );

          return;

        }


        try {

          setOpeningPredictionId(
            predictionId,
          );

          await getPredictionAccess(
            predictionId,
          );

          router.push(
            dashboardUrl,
          );

        } catch (err: unknown) {

          console.error(
            'Unable to access prediction:',
            err,
          );

          toast.error(
            'Unable to open prediction',
            {
              description:
                getApiErrorMessage(
                  err,
                  'Unable to open this prediction. Please try again.',
                ),
            },
          );

        } finally {

          setOpeningPredictionId(
            null,
          );

        }

      },
      [
        authLoading,
        user,
        router,
      ],
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-3xl
        bg-background
        py-4
        text-foreground
        sm:py-4
        lg:py-4
      "
    >

      {/* ====================================================
          LIGHTWEIGHT BACKGROUND DECORATION
      ==================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[300px]
          w-[300px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/10
          blur-2xl
        "
      />


      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          h-[180px]
          w-[180px]
          translate-x-1/3
          translate-y-1/3
          rounded-full
          bg-primary/5
          blur-2xl
        "
      />


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            mb-4
            flex
            flex-col
            gap-5
            sm:mb-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              tracking-tight
              text-foreground
              sm:text-3xl
            "
          >

            Our Latest{' '}

            <span
              className="
                text-primary
              "
            >
              Predictions
            </span>

          </h2>


          {/* DASHBOARD */}

          <button
            type="button"
            onClick={handleViewAll}
            disabled={authLoading}
            className="
              group
              inline-flex
              w-fit
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-border
              bg-card
              px-4
              py-2.5
              text-s
              font-semibold
              text-foreground
              shadow-sm
              transition
              hover:border-primary/40
              hover:bg-primary/5
              hover:shadow-md
              disabled:pointer-events-none
              disabled:opacity-60
            "
          >

            {authLoading
              ? 'Checking access...'
              : 'View Predictions in Dashboard'}

            {authLoading ? (

              <Loader2
                className="
                  h-4
                  w-4
                  animate-spin
                "
              />

            ) : (

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition-transform
                  group-hover:translate-x-1
                "
              />

            )}

          </button>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <div
            className="
              grid
              min-h-[260px]
              place-items-center
              rounded-2xl
              border
              border-border
              bg-card/50
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                text-s
                text-muted-foreground
              "
            >

              <Loader2
                className="
                  h-5
                  w-5
                  animate-spin
                  text-primary
                "
              />

              Loading predictions...

            </div>

          </div>

        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {!loading && error && (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-border
              bg-card/70
              p-8
              text-center
            "
          >

            <p
              className="
                text-s
                font-semibold
                text-foreground
              "
            >
              Unable to load predictions.
            </p>

            <p
              className="
                mt-2
                text-s
                text-muted-foreground
              "
            >
              Something went wrong while loading
              the latest predictions.
            </p>

            <button
              type="button"
              onClick={loadPredictions}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-border
                bg-background
                px-4
                py-2
                text-s
                font-semibold
                text-foreground
                transition
                hover:border-primary/40
                hover:bg-primary/5
              "
            >

              <RefreshCw
                className="
                  h-4
                  w-4
                "
              />

              Try again

            </button>

          </div>

        )}


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          filteredPredictions.length === 0 && (

            <div
              className="
                rounded-2xl
                border
                border-border
                bg-card/70
                p-8
                text-center
              "
            >

              <p
                className="
                  text-s
                  font-semibold
                  text-foreground
                "
              >
                No Latest predictions available.
              </p>

              <p
                className="
                  mt-2
                  text-s
                  text-muted-foreground
              "
              >
                Check Back Later.
              </p>

            </div>

          )}


        {/* ==================================================
            PREDICTIONS
        ================================================== */}

        {!loading &&
          !error &&
          filteredPredictions.length > 0 && (

            <>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >

                {visiblePredictions.map(
                  prediction => {

                    const predictionId =
                      prediction._id;

                    const isOpening =
                      openingPredictionId ===
                      predictionId;


                    return (

                      <div
                        key={predictionId}
                        className="
                          relative
                        "
                      >

                        <PredictionPreviewCard
                          prediction={prediction}
                          onClick={() => {

                            if (!isOpening) {

                              handlePredictionClick(
                                prediction,
                              );

                            }

                          }}
                        />


                        {isOpening && (

                          <div
                            className="
                              pointer-events-none
                              absolute
                              inset-0
                              flex
                              items-center
                              justify-center
                              rounded-2xl
                              bg-background/60
                              backdrop-blur-[2px]
                            "
                          >

                            <Loader2
                              className="
                                h-5
                                w-5
                                animate-spin
                                text-primary
                              "
                            />

                          </div>

                        )}

                      </div>

                    );

                  },
                )}

              </div>


              {/* =================================================
                  SHOW MORE / LESS
              ================================================= */}

              {filteredPredictions.length >
                INITIAL_VISIBLE_COUNT && (

                <div
                  className="
                    mt-7
                    flex
                    justify-center
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(
                        current => !current,
                      )
                    }
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-border
                      bg-card
                      px-5
                      py-2.5
                      text-s
                      font-semibold
                      text-foreground
                      shadow-sm
                      transition
                      hover:border-primary/40
                      hover:bg-primary/5
                      hover:shadow-md
                    "
                  >

                    {expanded
                      ? 'Show less'
                      : `Show all ${filteredPredictions.length} predictions`}

                    <ChevronDown
                      className={`
                        h-4
                        w-4
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

      </div>

    </section>

  );

}