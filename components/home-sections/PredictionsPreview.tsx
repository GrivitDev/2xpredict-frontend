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
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  ChevronDown,
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

const MOBILE_INITIAL_COUNT = 6;
const MOBILE_MAX_COUNT = 10;

const DESKTOP_INITIAL_COUNT = 10;
const DESKTOP_MAX_COUNT = 20;


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
// DATE KEY
// ============================================================

function getDateKey(
  value: string | Date,
): string {

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date
    .toISOString()
    .slice(0, 10);
}


// ============================================================
// DATE LABEL
// ============================================================

function formatDateLabel(
  dateKey: string,
): string {

  const date =
    new Date(
      `${dateKey}T12:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return dateKey;
  }

  const today =
    new Date();

  const todayKey =
    getDateKey(today);

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1,
  );

  const tomorrowKey =
    getDateKey(tomorrow);

  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1,
  );

  const yesterdayKey =
    getDateKey(yesterday);

  if (dateKey === yesterdayKey) {
    return 'Yesterday';
  }

  if (dateKey === todayKey) {
    return 'Today';
  }

  if (dateKey === tomorrowKey) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(
    'en-NG',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    },
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

  const loadPredictions =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError(false);

          const response =
            await getPredictions();

          let data:
            PredictionDetails[] =
            [];

          if (
            Array.isArray(response)
          ) {

            data = response;

          } else if (
            Array.isArray(
              response?.data,
            )
          ) {

            data =
              response.data;

          } else if (
            Array.isArray(
              response?.predictions,
            )
          ) {

            data =
              response.predictions;

          }


          const now =
            Date.now();


          const upcoming =
            data
              .filter(
                prediction =>
                  Boolean(
                    prediction?._id,
                  ),
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
                    !Number.isNaN(
                      timestamp,
                    ) &&
                    timestamp >= now
                  );

                },
              )
              .sort(
                (a, b) => {

                  const first =
                    new Date(
                      getPredictionDate(a) ??
                        '',
                    ).getTime();

                  const second =
                    new Date(
                      getPredictionDate(b) ??
                        '',
                    ).getTime();

                  return (
                    first - second
                  );

                },
              );


          setPredictions(
            upcoming,
          );

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
      void loadPredictions();
    },
    [loadPredictions],
  );


  // ==========================================================
  // AVAILABLE DATES
  // ==========================================================

  const availableDates =
    useMemo(
      () => {

        const dates =
          new Set<string>();

        for (
          const prediction of
            predictions
        ) {

          const dateValue =
            getPredictionDate(
              prediction,
            );

          if (!dateValue) {
            continue;
          }

          const dateKey =
            getDateKey(
              dateValue,
            );

          if (dateKey) {
            dates.add(dateKey);
          }

        }

        return Array.from(
          dates,
        ).sort();

      },
      [predictions],
    );


  // ==========================================================
  // ACTIVE DATE
  // ==========================================================

  const activeDate =
    useMemo(
      () => {

        if (
          selectedDate &&
          availableDates.includes(
            selectedDate,
          )
        ) {
          return selectedDate;
        }

        return (
          availableDates[0] ??
          ''
        );

      },
      [
        selectedDate,
        availableDates,
      ],
    );


  // ==========================================================
  // ACTIVE DATE INDEX
  // ==========================================================

  const activeDateIndex =
    availableDates.indexOf(
      activeDate,
    );


  const canGoPrevious =
    activeDateIndex > 0;


  const canGoNext =
    activeDateIndex >= 0 &&
    activeDateIndex <
      availableDates.length - 1;


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
            // DATE
            // ----------------------------------------------

            const dateValue =
              getPredictionDate(
                prediction,
              );

            if (!dateValue) {
              return false;
            }

            const predictionDate =
              getDateKey(
                dateValue,
              );

            if (
              activeDate &&
              predictionDate !==
                activeDate
            ) {
              return false;
            }


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
                prediction.homeScore ??
                0;

              const away =
                prediction.awayScore ??
                0;

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
        activeDate,
        search,
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
          DESKTOP_INITIAL_COUNT,
        );


  // ==========================================================
  // RESET EXPANSION
  // ==========================================================

  useEffect(
    () => {
      setExpanded(false);
    },
    [
      activeDate,
      search,
      goalFilter,
      resultFilter,
    ],
  );


  // ==========================================================
  // DATE NAVIGATION
  // ==========================================================

  const goToDate =
    useCallback(
      (
        direction:
          | 'previous'
          | 'next',
      ) => {

        if (
          activeDateIndex < 0
        ) {
          return;
        }

        const nextIndex =
          direction === 'previous'
            ? activeDateIndex - 1
            : activeDateIndex + 1;

        if (
          nextIndex < 0 ||
          nextIndex >=
            availableDates.length
        ) {
          return;
        }

        const nextDate =
          availableDates[
            nextIndex
          ];

        if (!nextDate) {
          return;
        }

        // The parent owns selectedDate.
        // Navigation is therefore exposed through
        // the browser URL only if the parent uses
        // controlled state. For local behavior,
        // we keep the active date internally below.

      },
      [
        activeDateIndex,
        availableDates,
      ],
    );


  // ==========================================================
  // LOCAL DATE STATE
  // ==========================================================

  const [
    internalDate,
    setInternalDate,
  ] = useState('');


  useEffect(
    () => {

      if (
        selectedDate &&
        availableDates.includes(
          selectedDate,
        )
      ) {

        setInternalDate(
          selectedDate,
        );

        return;

      }

      if (
        !internalDate &&
        availableDates.length
      ) {

        setInternalDate(
          availableDates[0],
        );

      }

    },
    [
      selectedDate,
      availableDates,
      internalDate,
    ],
  );


  const currentDate =
    internalDate &&
    availableDates.includes(
      internalDate,
    )
      ? internalDate
      : activeDate;


  const currentDateIndex =
    availableDates.indexOf(
      currentDate,
    );


  const displayedPredictions =
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


        return predictions
          .filter(
            prediction => {

              const dateValue =
                getPredictionDate(
                  prediction,
                );

              if (!dateValue) {
                return false;
              }

              if (
                getDateKey(
                  dateValue,
                ) !== currentDate
              ) {
                return false;
              }


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


              if (
                minimumGoals !== null &&
                (
                  (prediction.homeScore ?? 0) +
                  (prediction.awayScore ?? 0)
                ) < minimumGoals
              ) {
                return false;
              }


              if (
                resultFilter !== 'all'
              ) {

                const home =
                  prediction.homeScore ??
                  0;

                const away =
                  prediction.awayScore ??
                  0;

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
        currentDate,
        search,
        goalFilter,
        resultFilter,
      ],
    );


  // ==========================================================
  // RESPONSIVE VISIBLE COUNT
  // ==========================================================

  const mobileVisible =
    displayedPredictions.slice(
      0,
      expanded
        ? MOBILE_MAX_COUNT
        : MOBILE_INITIAL_COUNT,
    );


  const desktopVisible =
    displayedPredictions.slice(
      0,
      expanded
        ? DESKTOP_MAX_COUNT
        : DESKTOP_INITIAL_COUNT,
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
        prediction:
          PredictionDetails,
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
  // DATE NAVIGATION HANDLERS
  // ==========================================================

  const handlePreviousDate =
    () => {

      if (
        currentDateIndex <= 0
      ) {
        return;
      }

      const date =
        availableDates[
          currentDateIndex - 1
        ];

      if (!date) {
        return;
      }

      setInternalDate(date);
      setExpanded(false);

    };


  const handleNextDate =
    () => {

      if (
        currentDateIndex < 0 ||
        currentDateIndex >=
          availableDates.length - 1
      ) {
        return;
      }

      const date =
        availableDates[
          currentDateIndex + 1
        ];

      if (!date) {
        return;
      }

      setInternalDate(date);
      setExpanded(false);

    };


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
      "
    >

      {/* BACKGROUND */}

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
            gap-4
            lg:flex-row
            lg:items-center
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
            <span className="text-primary">
              Predictions
            </span>
          </h2>


          <button
            type="button"
            onClick={handleViewAll}
            disabled={authLoading}
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-border
              bg-card
              px-4
              py-2.5
              text-xs
              font-semibold
              text-foreground
              shadow-sm
              transition
              hover:border-primary/40
              hover:bg-primary/5
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
                text-sm
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
                text-sm
                font-semibold
              "
            >
              Unable to load predictions.
            </p>


            <p
              className="
                mt-2
                text-sm
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
                text-sm
                font-semibold
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
            CONTENT
        ================================================== */}

        {!loading &&
          !error &&
          predictions.length > 0 && (

          <>

            {/* =================================================
                DATE SELECTOR
            ================================================= */}

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
                  flex
                  w-full
                  max-w-sm
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-border
                  bg-card
                  px-1.5
                  py-1.5
                  shadow-sm
                "
              >

                <button
                  type="button"
                  onClick={
                    handlePreviousDate
                  }
                  disabled={
                    !canGoPrevious
                  }
                  aria-label="Previous date"
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
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

                  <ArrowLeft
                    className="
                      h-4
                      w-4
                    "
                  />

                </button>


                <div
                  className="
                    min-w-0
                    flex-1
                    text-center
                  "
                >

                  <p
                    className="
                      truncate
                      text-sm
                      font-bold
                      text-foreground
                    "
                  >
                    {currentDate
                      ? formatDateLabel(
                          currentDate,
                        )
                      : 'No date'}
                  </p>


                  <p
                    className="
                      mt-0.5
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-wider
                      text-muted-foreground
                    "
                  >
                    {displayedPredictions.length}{' '}
                    {displayedPredictions.length === 1
                      ? 'prediction'
                      : 'predictions'}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    handleNextDate
                  }
                  disabled={
                    !canGoNext
                  }
                  aria-label="Next date"
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
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

                  <ArrowRight
                    className="
                      h-4
                      w-4
                    "
                  />

                </button>

              </div>

            </div>


            {/* =================================================
                EMPTY DATE
            ================================================= */}

            {displayedPredictions.length === 0 ? (

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
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  No upcoming fixtures for this date.
                </p>

              </div>

            ) : (

              <>

                {/* =================================================
                    MOBILE
                ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-2
                    sm:hidden
                  "
                >

                  {mobileVisible.map(
                    prediction => {

                      const predictionId =
                        prediction._id;

                      const isOpening =
                        openingPredictionId ===
                        predictionId;

                      return (

                        <div
                          key={
                            predictionId
                          }
                          className="
                            relative
                          "
                        >

                          <PredictionPreviewCard
                            prediction={
                              prediction
                            }
                            onClick={() => {

                              if (
                                !isOpening
                              ) {

                                void handlePredictionClick(
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
                                rounded-xl
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
                    DESKTOP
                ================================================= */}

                <div
                  className="
                    hidden
                    grid-cols-2
                    gap-3
                    sm:grid
                    lg:grid-cols-4
                  "
                >

                  {desktopVisible.map(
                    prediction => {

                      const predictionId =
                        prediction._id;

                      const isOpening =
                        openingPredictionId ===
                        predictionId;

                      return (

                        <div
                          key={
                            predictionId
                          }
                          className="
                            relative
                          "
                        >

                          <PredictionPreviewCard
                            prediction={
                              prediction
                            }
                            onClick={() => {

                              if (
                                !isOpening
                              ) {

                                void handlePredictionClick(
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

                {displayedPredictions.length >
                  MOBILE_INITIAL_COUNT && (

                  <div
                    className="
                      mt-5
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
                        gap-2
                        rounded-xl
                        border
                        border-border
                        bg-card
                        px-4
                        py-2
                        text-xs
                        font-semibold
                        text-foreground
                        shadow-sm
                        transition
                        hover:border-primary/40
                        hover:bg-primary/5
                      "
                    >

                      <span className="sm:hidden">
                        {expanded
                          ? 'Show less'
                          : `Show all ${Math.min(
                              displayedPredictions.length,
                              MOBILE_MAX_COUNT,
                            )} fixtures`}
                      </span>

                      <span className="hidden sm:inline">
                        {expanded
                          ? 'Show less'
                          : `Show all ${Math.min(
                              displayedPredictions.length,
                              DESKTOP_MAX_COUNT,
                            )} fixtures`}
                      </span>

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

          </>

        )}

      </div>

    </section>
  );
}