'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  ArrowRight,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import {
  getPredictions,
  PredictionDetails,
} from '@/services/prediction.service';

import PredictionPreviewCard from './PredictionPreviewCard';

import {
  useAuth,
} from '@/providers/auth-provider';


export default function PredictionsPreview() {


  const router = useRouter();


  const {
    user,
    loading: authLoading,
  } = useAuth();



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



  /*
   * ========================================
   * LOAD RANDOM PREDICTIONS
   * ========================================
   */


  const loadPredictions = useCallback(
    async () => {

      try {

        setLoading(true);

        setError(false);


        const response =
          await getPredictions();



        /*
         * Handle possible API response shapes
         */


        let data: PredictionDetails[] = [];


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



        /*
         * Keep only valid predictions
         */


        const validPredictions =
          data.filter(
            (
              prediction,
            ) =>
              Boolean(
                prediction?.id ??
                prediction?.matchId,
              ),
          );



        /*
         * Fisher-Yates shuffle
         */


        const shuffled = [
          ...validPredictions,
        ];


        for (
          let i =
            shuffled.length - 1;

          i > 0;

          i--
        ) {

          const j =
            Math.floor(
              Math.random() *
              (i + 1),
            );


          [
            shuffled[i],
            shuffled[j],
          ] = [
            shuffled[j],
            shuffled[i],
          ];

        }



        /*
         * Only show 4 random predictions
         */


        setPredictions(
          shuffled.slice(
            0,
            4,
          ),
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



  /*
   * ========================================
   * INITIAL LOAD
   * ========================================
   */


  useEffect(() => {

    const timer = window.setTimeout(() => {
      loadPredictions();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };

  }, [
    loadPredictions,
  ]);



  /*
   * ========================================
   * VIEW ALL PREDICTIONS
   * ========================================
   */


  const handleViewAll =
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

    };



  /*
   * ========================================
   * OPEN PREDICTION
   * ========================================
   */


  const handlePredictionClick =
    (
      prediction: PredictionDetails,
    ) => {

      const predictionId =
        prediction.id ??
        prediction.matchId;


      if (
        !predictionId
      ) {

        return;

      }


      router.push(
        `/predictions/${predictionId}`,
      );

    };



  return (

    <section
      className="
        relative
        overflow-hidden
        bg-background
        py-16
        text-foreground
        transition-colors
        duration-300
        sm:py-20
        lg:py-24
      "
    >


      {/* ======================================== */}
      {/* BACKGROUND DECORATION */}
      {/* ======================================== */}


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
            h-[500px]
            w-[500px]
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
            h-[300px]
            w-[300px]
            translate-x-1/3
            translate-y-1/3
            rounded-full
            bg-primary/5
            blur-3xl
          "
        />

      </div>



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


        {/* ======================================== */}
        {/* HEADER */}
        {/* ======================================== */}


        <div
          className="
            mb-10
            flex
            flex-col
            gap-6
            sm:mb-12
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


            {/* EYEBROW */}


            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-border
                bg-card/70
                px-3
                py-1.5
                text-xs
                font-semibold
                text-muted-foreground
                backdrop-blur-xl
              "
            >

              <Sparkles
                className="
                  h-3.5
                  w-3.5
                  text-primary
                "
              />

              Featured Predictions

            </div>



            {/* TITLE */}


            <h2
              className="
                text-3xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-4xl
                lg:text-5xl
              "
            >

              Today&apos;s{' '}

              <span
                className="
                  text-primary
                "
              >
                predictions
              </span>

            </h2>



            {/* DESCRIPTION */}


            <p
              className="
                mt-4
                max-w-xl
                text-sm
                leading-6
                text-muted-foreground
                sm:text-base
              "
            >

              Explore a selection of our latest
              football predictions, featuring
              upcoming matches and our confidence
              levels.

            </p>


          </div>



          {/* ======================================== */}
          {/* VIEW ALL */}
          {/* ======================================== */}


          <button
            type="button"

            onClick={
              handleViewAll
            }

            disabled={
              authLoading
            }

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
              text-sm
              font-semibold
              text-foreground
              shadow-sm
              transition-all
              duration-300
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
                : 'View all predictions'
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
                      duration-300
                      group-hover:translate-x-1
                    "
                  />

                )
            }

          </button>


        </div>



        {/* ======================================== */}
        {/* LOADING */}
        {/* ======================================== */}


        {
          loading && (

            <div
              className="
                grid
                min-h-[320px]
                place-items-center
                rounded-3xl
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

          )
        }



        {/* ======================================== */}
        {/* ERROR */}
        {/* ======================================== */}


        {
          !loading &&
          error && (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                rounded-3xl
                border
                border-border
                bg-card/70
                p-10
                text-center
                backdrop-blur-xl
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-foreground
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

                Something went wrong while
                loading the latest predictions.

              </p>


              <button
                type="button"

                onClick={
                  loadPredictions
                }

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



        {/* ======================================== */}
        {/* EMPTY */}
        {/* ======================================== */}


        {
          !loading &&
          !error &&
          predictions.length === 0 && (

            <div
              className="
                rounded-3xl
                border
                border-border
                bg-card/70
                p-10
                text-center
                backdrop-blur-xl
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-foreground
                "
              >

                No predictions available.

              </p>


              <p
                className="
                  mt-2
                  text-sm
                  text-muted-foreground
                "
              >

                Check back soon for upcoming
                predictions.

              </p>

            </div>

          )
        }



        {/* ======================================== */}
        {/* PREDICTIONS GRID */}
        {/* ======================================== */}


        {
          !loading &&
          !error &&
          predictions.length > 0 && (

            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >

              {
                predictions.map(
                  (
                    prediction,
                    index,
                  ) => (

                    <PredictionPreviewCard

                      key={
                        prediction.id ??
                        prediction.matchId ??
                        `prediction-${index}`
                      }

                      prediction={
                        prediction
                      }

                      onClick={() => {

                        handlePredictionClick(
                          prediction,
                        );

                      }}

                    />

                  ),
                )
              }

            </div>

          )
        }


      </div>


    </section>

  );

}