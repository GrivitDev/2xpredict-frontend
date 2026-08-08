import {
  PredictionDetails,
} from '@/services/prediction.service';


/*
 * ========================================
 * GET PREDICTION MATCH DATE
 * ========================================
 *
 * Change this function if your API uses
 * a different property for the match date.
 */

export function getPredictionDate(
  prediction: PredictionDetails,
): Date | null {

  const dateValue =
    prediction.match?.utcDate;


  if (
    !dateValue
  ) {

    return null;

  }


  const date =
    new Date(
      dateValue,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return null;

  }


  return date;

}



/*
 * ========================================
 * NORMALIZE DATE
 * ========================================
 *
 * Returns the beginning of the local day.
 */

export function normalizeDate(
  date: Date,
): Date {

  const normalized =
    new Date(
      date,
    );


  normalized.setHours(
    0,
    0,
    0,
    0,
  );


  return normalized;

}



/*
 * ========================================
 * SHUFFLE ARRAY
 * ========================================
 */

export function shufflePredictions(
  predictions: PredictionDetails[],
): PredictionDetails[] {

  const shuffled = [
    ...predictions,
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


  return shuffled;

}



/*
 * ========================================
 * GET FIRST AVAILABLE FUTURE PREDICTIONS
 * ========================================
 *
 * Priority:
 *
 * 1. Today
 * 2. Tomorrow
 * 3. Next available day
 *
 * Past predictions are NEVER returned.
 */

export function getFirstAvailableFuturePredictions(
  predictions: PredictionDetails[],
  limit = 4,
): PredictionDetails[] {

  /*
   * Today's local date.
   */

  const today =
    normalizeDate(
      new Date(),
    );



  /*
   * Remove invalid and past predictions.
   */

  const futurePredictions =
    predictions.filter(
      (
        prediction,
      ) => {

        const predictionDate =
          getPredictionDate(
            prediction,
          );


        if (
          !predictionDate
        ) {

          return false;

        }


        const normalizedPredictionDate =
          normalizeDate(
            predictionDate,
          );


        /*
         * This guarantees that
         * yesterday and all earlier
         * dates can never appear.
         */

        return (
          normalizedPredictionDate.getTime() >=
          today.getTime()
        );

      },
    );



  /*
   * No future predictions.
   */

  if (
    futurePredictions.length === 0
  ) {

    return [];

  }



  /*
   * Find the earliest available
   * prediction day.
   */

  const earliestDate =
    futurePredictions.reduce(
      (
        earliest,
        prediction,
      ) => {

        const predictionDate =
          getPredictionDate(
            prediction,
          );


        if (
          !predictionDate
        ) {

          return earliest;

        }


        const normalizedDate =
          normalizeDate(
            predictionDate,
          );


        if (
          !earliest ||
          normalizedDate.getTime() <
          earliest.getTime()
        ) {

          return normalizedDate;

        }


        return earliest;

      },
      null as Date | null,
    );



  /*
   * Safety check.
   */

  if (
    !earliestDate
  ) {

    return [];

  }



  /*
   * Get only predictions from
   * the earliest available day.
   *
   * This is important because we do
   * NOT mix today with tomorrow,
   * or tomorrow with another day.
   */

  const predictionsForSelectedDay =
    futurePredictions.filter(
      (
        prediction,
      ) => {

        const predictionDate =
          getPredictionDate(
            prediction,
          );


        if (
          !predictionDate
        ) {

          return false;

        }


        const normalizedDate =
          normalizeDate(
            predictionDate,
          );


        return (
          normalizedDate.getTime() ===
          earliestDate.getTime()
        );

      },
    );



  /*
   * Randomize only the selected day,
   * then return a maximum of 4.
   */

  return shufflePredictions(
    predictionsForSelectedDay,
  ).slice(
    0,
    limit,
  );

}