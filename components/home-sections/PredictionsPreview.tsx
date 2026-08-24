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
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { toast } from 'sonner';


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
// COMPONENT
// ============================================================

export default function PredictionsPreview({

  search,

  selectedDate,

  goalFilter,

  resultFilter,

}: PredictionsPreviewProps) {


  // ==========================================================
  // ROUTER
  // ==========================================================

  const router =
    useRouter();


  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    user,
    loading: authLoading,
  } =
    useAuth();


  // ==========================================================
  // STATE
  // ==========================================================

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


  const [
    openingPredictionId,
    setOpeningPredictionId,
  ] =
    useState<string | null>(null);


  // ==========================================================
  // LOAD ALL PREDICTIONS
  // ==========================================================

  const loadPredictions =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError(false);


          const response =
            await getPredictions();


          // --------------------------------------------------
          // NORMALIZE RESPONSE
          // --------------------------------------------------

          let data:
            PredictionDetails[] = [];


          if (
            Array.isArray(response)
          ) {

            data =
              response;

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


          // --------------------------------------------------
          // VALID PREDICTIONS
          // --------------------------------------------------

            const validPredictions =
              data.filter(
                prediction =>
                  Boolean(
                    prediction?._id,
                  ),
              );


          // --------------------------------------------------
          // REMOVE PAST PREDICTIONS
          // --------------------------------------------------

          const now =
            Date.now();


          const upcomingPredictions =
            validPredictions
              .filter(
                prediction => {

                  const dateValue =
                    (typeof prediction.matchId === 'object' &&
                    prediction.matchId !== null
                      ? (prediction.matchId as { utcDate?: string }).utcDate
                      : undefined) ??
                    prediction.matchDate ??
                    prediction.date;


                  if (
                    !dateValue
                  ) {

                    return false;

                  }


                  const timestamp =
                    new Date(
                      dateValue,
                    ).getTime();


                  if (
                    Number.isNaN(timestamp)
                  ) {

                    return false;

                  }


                  return timestamp >= now;

                },
              )
              .sort(
                (
                  first,
                  second,
                ) => {

                  const firstDate =
                    new Date(
                      first.match?.utcDate ??
                      first.matchDate ??
                      first.date,
                    ).getTime();


                  const secondDate =
                    new Date(
                      second.match?.utcDate ??
                      second.matchDate ??
                      second.date,
                    ).getTime();


                  return (
                    firstDate -
                    secondDate
                  );

                },
              );


          setPredictions(
            upcomingPredictions,
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

      loadPredictions();

    },
    [
      loadPredictions,
    ],
  );


  // ==========================================================
  // FILTER PREDICTIONS
  // ==========================================================

  const filteredPredictions =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return predictions.filter(
          prediction => {

            // ----------------------------------------------
            // SEARCH
            // ----------------------------------------------

            if (query) {

              const homeTeam =
                prediction.homeTeam
                  ?.toLowerCase() ?? '';


              const awayTeam =
                prediction.awayTeam
                  ?.toLowerCase() ?? '';


              const league =
                prediction.league?.name
                  ?.toLowerCase() ?? '';


              const venue =
                prediction.venue
                  ?.toLowerCase() ?? '';


              const found =
                homeTeam.includes(query) ||
                awayTeam.includes(query) ||
                league.includes(query) ||
                venue.includes(query);


              if (!found) {

                return false;

              }

            }


            // ----------------------------------------------
            // DATE
            // ----------------------------------------------

            if (selectedDate) {

              const dateValue =
                prediction.match?.utcDate ??
                prediction.matchDate ??
                prediction.date;


              if (!dateValue) {

                return false;

              }


              const predictionDate =
                new Date(
                  dateValue,
                )
                  .toISOString()
                  .split('T')[0];


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

            if (goalFilter) {

              const goals =
                (prediction.homeScore ?? 0) +
                (prediction.awayScore ?? 0);


              if (
                goals <
                Number(goalFilter)
              ) {

                return false;

              }

            }


            // ----------------------------------------------
            // RESULT
            // ----------------------------------------------

            if (
              resultFilter !== 'all'
            ) {

              const homeScore =
                prediction.homeScore ?? 0;


              const awayScore =
                prediction.awayScore ?? 0;


              if (
                resultFilter === 'home' &&
                homeScore <= awayScore
              ) {

                return false;

              }


              if (
                resultFilter === 'away' &&
                awayScore <= homeScore
              ) {

                return false;

              }


              if (
                resultFilter === 'draw' &&
                homeScore !== awayScore
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
    useMemo(
      () => {

        if (
          expanded
        ) {

          return filteredPredictions;

        }


        return filteredPredictions.slice(
          0,
          INITIAL_VISIBLE_COUNT,
        );

      },
      [
        filteredPredictions,
        expanded,
      ],
    );


  // ==========================================================
  // FILTER CHANGE
  // ==========================================================
  //
  // Whenever filtering changes, collapse the list back to
  // the first 10 results.
  //
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
  // GO TO DASHBOARD
  // ==========================================================

  const handleViewAll =
    useCallback(
      () => {

        if (
          authLoading
        ) {

          return;

        }


        if (
          user
        ) {

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


      // ======================================================
      // INVALID PREDICTION
      // ======================================================

      if (!predictionId) {

        console.error(
          'Prediction is missing its database ID:',
          prediction,
        );

        toast.error(
          'Unable to open prediction',
          {
            description:
              'This prediction does not have a valid database ID.',
          },
        );

        return;

      }


      // ======================================================
      // AUTHENTICATION STILL LOADING
      // ======================================================

      if (authLoading) {

        toast.info(
          'Checking your account...',
        );

        return;

      }


      // ======================================================
      // LOGIN REQUIRED
      // ======================================================

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


      // ======================================================
      // CHECK ACCESS
      // ======================================================

      try {

        setOpeningPredictionId(
          predictionId,
        );


        await getPredictionAccess(
          predictionId,
        );


        // ====================================================
        // SUCCESS
        // Dashboard handles opening the modal.
        // ====================================================

        router.push(
          dashboardUrl,
        );


      } catch (error: unknown) {

        console.error(
          'Unable to access prediction:',
          error,
        );


        const message =
          getApiErrorMessage(
            error,
            'Unable to open this prediction. Please try again.',
          );


        toast.error(
          'Unable to open prediction',
          {
            description: message,
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
        bg-background
        py-4
        text-foreground
        transition-colors
        duration-300
        sm:py-4
        lg:py-4
        rounded-3xl
      "
    >

      {/* ====================================================
          BACKGROUND DECORATION
      ==================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            left-1/2
            top-0
            h-[420px]
            w-[420px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-primary/10
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            h-[280px]
            w-[280px]
            translate-x-1/3
            translate-y-1/3
            rounded-full
            bg-primary/5
            blur-3xl
          "
        />

      </div>



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

          <div
            className="
              max-w-2xl
            "
          >



            {/* TITLE */}

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-3xl
              "
            >

              Our Latest {' '}

              <span
                className="
                  text-primary
                "
              >
                Predictions
              </span>

            </h2>

          </div>



          {/* DASHBOARD BUTTON */}

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
              transition-all
              duration-200
              hover:border-primary/40
              hover:bg-primary/5
              hover:shadow-md
              disabled:pointer-events-none
              disabled:opacity-60
            "
          >

            {
              authLoading
                ? 'Checking access...'
                : 'View Predictions in Dashboard'
            }


            {
              authLoading
                ? (

                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                )
                : (

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                  />

                )
            }

          </button>

        </div>



        {/* ==================================================
            LOADING
        ================================================== */}

        {
          loading && (

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

          )
        }



        {/* ==================================================
            ERROR
        ================================================== */}

        {
          !loading &&
          error && (

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
                  transition-colors
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

          )
        }



        {/* ==================================================
            EMPTY
        ================================================== */}

        {
          !loading &&
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

                No upcoming predictions available.

              </p>


              <p
                className="
                  mt-2
                  text-s
                  text-muted-foreground
                "
              >

                Try adjusting your search or filters.

              </p>

            </div>

          )
        }



        {/* ==================================================
            PREDICTIONS
        ================================================== */}

        {
          !loading &&
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

                {
                  visiblePredictions.map(
                    (
                      prediction,
                    ) => {

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
                            prediction={
                              prediction
                            }
                            onClick={() => {

                              if (
                                !isOpening
                              ) {

                                handlePredictionClick(
                                  prediction,
                                );

                              }

                            }}
                          />


                          {
                            isOpening && (

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

                            )
                          }

                        </div>

                      );

                    },
                  )
                }

              </div>



              {/* =================================================
                  SHOW MORE / SHOW LESS
              ================================================= */}

              {
                filteredPredictions.length >
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
                      onClick={() => {

                        setExpanded(
                          current =>
                            !current,
                        );

                      }}
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
                        transition-all
                        duration-200
                        hover:border-primary/40
                        hover:bg-primary/5
                        hover:shadow-md
                      "
                    >

                      {
                        expanded
                          ? 'Show less'
                          : `Show all ${filteredPredictions.length} predictions`
                      }


                      <ChevronDown
                        className={`
                          h-4
                          w-4
                          transition-transform
                          duration-200
                          ${
                            expanded
                              ? 'rotate-180'
                              : ''
                          }
                        `}
                      />

                    </button>

                  </div>

                )
              }

            </>

          )
        }

      </div>

    </section>

  );

}