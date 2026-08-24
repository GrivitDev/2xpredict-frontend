'use client';

import {
  useEffect,
  useState,
} from 'react';

import Image from 'next/image';
import clsx from 'clsx';

import {
  getPredictionAccess,
  PredictionDetails,
  PredictionPlan,
} from '@/services/prediction.service';

import PredictionMatchCell from './PredictionMatchCell';
import PredictionPredictionCell from './PredictionPredictionCell';
import PredictionProbabilityCell from './PredictionProbabilityCell';
import PredictionMarketsCell from './PredictionMarketsCell';
import PredictionStatusBadge from './PredictionStatusBadge';


/* =========================================================
   SUBSCRIPTION DATA
========================================================= */

export interface SubscriptionRequiredData {
  predictionId: string;

  requiredPlan:
    | 'regular'
    | 'vip';

  feature:
    | 'prediction'
    | 'markets';

  userPlan:
    | 'free'
    | 'regular'
    | 'vip';

  predictionPlan:
    | 'free'
    | 'regular'
    | 'vip';

  released: boolean;

  releaseAt:
    | number
    | null;

  accessState: string;

  accessMessage:
    | string
    | null;
}


/* =========================================================
   PROPS
========================================================= */

interface Props {
  prediction: any;

  highlighted?: boolean;

  onSubscriptionRequired: (
    params: SubscriptionRequiredData,
  ) => void;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function PredictionRow({
  prediction,
  highlighted = false,
  onSubscriptionRequired,
}: Props) {

  const predictionId =
    String(
      prediction._id ??
      prediction.id ??
      '',
    );


  /* =======================================================
     ACCESS
  ======================================================= */

  const [
    access,
    setAccess,
  ] = useState<PredictionDetails | null>(
    null,
  );


  const [
    accessLoading,
    setAccessLoading,
  ] = useState(true);


  const [
    accessError,
    setAccessError,
  ] = useState(false);


  useEffect(() => {

    let mounted = true;


    const checkAccess = async () => {

      if (!predictionId) {

        if (mounted) {
          setAccessLoading(false);
        }

        return;

      }


      try {

        setAccessLoading(true);
        setAccessError(false);


        const result =
          await getPredictionAccess(
            predictionId,
          );


        if (!mounted) {
          return;
        }


        setAccess(result);

      } catch (error) {

        if (!mounted) {
          return;
        }


        console.error(
          'Prediction access check failed:',
          predictionId,
          error,
        );


        setAccess(null);
        setAccessError(true);

      } finally {

        if (mounted) {
          setAccessLoading(false);
        }

      }

    };


    checkAccess();


    return () => {
      mounted = false;
    };

  }, [
    predictionId,
  ]);


  /* =======================================================
     ACCESS INFORMATION
  ======================================================= */

  const userAccess =
    access?.access;


  const allowed =
    userAccess?.allowed === true;


  const userPlan: PredictionPlan =
    userAccess?.plan ??
    'free';


  const predictionPlan: PredictionPlan =
    access?.accessType ??
    prediction.accessType ??
    'free';


  const released =
    userAccess?.released === true;


  const releaseAt =
    userAccess?.releaseAt ??
    null;


  const accessState =
    userAccess?.state ??
    'locked';


  const accessMessage =
    userAccess?.message ??
    null;


  /* =======================================================
     PROTECTED DATA
  ======================================================= */

  const protectedPrediction =
    allowed
      ? access?.data?.prediction
      : undefined;


  const protectedMarkets =
    allowed
      ? access?.data?.markets
      : undefined;


  const protectedProbabilities =
    allowed
      ? access?.data?.probabilities
      : undefined;


  /* =======================================================
     CELL DATA
  ======================================================= */

  const cellPrediction = {
    ...prediction,

    prediction:
      protectedPrediction,

    markets:
      protectedMarkets,

    probabilities:
      protectedProbabilities,

    access:
      userAccess,

    accessLoading,

    accessError,

    accessType:
      predictionPlan,

    userPlan,

    released,

    releaseAt,

    accessState,

    accessMessage,
  };


  /* =======================================================
     CONFIDENCE
  ======================================================= */

  const confidence =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          prediction.confidence ??
          0,
        ),
      ),
    );


  /* =======================================================
     ROW STATUS
  ======================================================= */

  const settled =
    prediction.settled ??
    prediction.isSettled ??
    false;


  const outcome =
    String(
      prediction.outcome ??
      prediction.result ??
      prediction.status ??
      '',
    ).toLowerCase();


  const rowClass =
    getRowClass({
      confidence,
      settled,
      outcome,
    });


  /* =======================================================
     SUBSCRIPTION HANDLER
  ======================================================= */

  const handleSubscriptionRequired =
    (
      feature:
        | 'prediction'
        | 'markets',
    ) => {

      let requiredPlan:
        | 'regular'
        | 'vip';


      /* ---------------------------------------------------
         LOGIN REQUIRED
      --------------------------------------------------- */

      if (
        accessState ===
        'login_required'
      ) {

        requiredPlan =
          'regular';

      }


      /* ---------------------------------------------------
         REGULAR USER WAITING
         FOR EARLY ACCESS
      --------------------------------------------------- */

      else if (
        predictionPlan ===
          'regular' &&
        userPlan ===
          'regular' &&
        !released
      ) {

        requiredPlan =
          'vip';

      }


      /* ---------------------------------------------------
         VIP CONTENT
      --------------------------------------------------- */

      else if (
        predictionPlan ===
        'vip'
      ) {

        requiredPlan =
          'vip';

      }


      /* ---------------------------------------------------
         REGULAR CONTENT
         FOR FREE USERS
      --------------------------------------------------- */

      else if (
        predictionPlan ===
          'regular' &&
        userPlan ===
          'free'
      ) {

        requiredPlan =
          'regular';

      }


      /* ---------------------------------------------------
         BACKEND EXPLICITLY REQUIRES UPGRADE
      --------------------------------------------------- */

      else if (
        accessState ===
        'upgrade_required'
      ) {

        requiredPlan =
          'regular';

      }


      /* ---------------------------------------------------
         FALLBACK
      --------------------------------------------------- */

      else {

        requiredPlan =
          'regular';

      }


      onSubscriptionRequired({

        predictionId,

        requiredPlan,

        feature,

        userPlan,

        predictionPlan,

        released,

        releaseAt,

        accessState,

        accessMessage,

      });

    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <tr
      id={`prediction-${predictionId}`}
      className={clsx(
        `
          group
          border-b
          border-border
          last:border-b-0
          transition-colors
          duration-200
        `,
        rowClass,

        highlighted &&
          `
            ring-2
            ring-inset
            ring-primary
            animate-pulse
          `,
      )}
    >

      {/* =================================================
          DATE
      ================================================= */}

      <td
        className="
          px-2
          py-1.5
          align-middle
        "
      >

        <DateTimeCell
          date={
            prediction.matchDate
          }
        />

      </td>


      {/* =================================================
          LEAGUE
      ================================================= */}

      <td
        className="
          px-2
          py-1.5
          align-middle
        "
      >

        <LeagueCell
          prediction={
            prediction
          }
        />

      </td>


      {/* =================================================
          MATCH
      ================================================= */}

      <td
        className="
          px-2
          py-1.5
          align-middle
        "
      >

        <div
          className="
            relative
            min-w-0
          "
        >

          <div
            className="
              absolute
              right-0
              top-0
              z-10
              scale-[0.78]
              origin-top-right
            "
          >

            <PredictionStatusBadge
              prediction={
                prediction
              }
            />

          </div>


          <PredictionMatchCell
            prediction={
              prediction
            }
          />

        </div>

      </td>


      {/* =================================================
          PREDICTION
      ================================================= */}

      <td
        className="
          px-2
          py-1.5
          align-middle
        "
      >

        <PredictionPredictionCell
          prediction={
            cellPrediction
          }

          onSubscriptionRequired={() =>
            handleSubscriptionRequired(
              'prediction',
            )
          }
        />

      </td>


      {/* =================================================
          PROBABILITY
      ================================================= */}

      <td
        className="
          px-2
          py-1.5
          align-middle
        "
      >

        <PredictionProbabilityCell
          prediction={
            cellPrediction
          }
        />

      </td>


      {/* =================================================
          MARKETS
      ================================================= */}

      <td
        className="
          px-2
          py-1.5
          align-middle
        "
      >

        <PredictionMarketsCell
          prediction={
            cellPrediction
          }

          onSubscriptionRequired={() =>
            handleSubscriptionRequired(
              'markets',
            )
          }
        />

      </td>

    </tr>

  );

}


/* =========================================================
   DATE / TIME
========================================================= */

function DateTimeCell({
  date,
}: {
  date: string;
}) {

  const matchDate =
    new Date(date);


  if (
    Number.isNaN(
      matchDate.getTime(),
    )
  ) {

    return (

      <div
        className="
          text-[10px]
          text-muted-foreground
        "
      >
        —
      </div>

    );

  }


  const formattedDate =
    matchDate
      .toLocaleDateString(
        'en-GB',
        {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        },
      )
      .toUpperCase();


  const formattedTime =
    matchDate.toLocaleTimeString(
      'en-GB',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    );


  return (

    <div
      className="
        whitespace-nowrap
        leading-tight
      "
    >

      <p
        className="
          text-[9px]
          font-semibold
          uppercase
          text-muted-foreground
        "
      >
        {formattedDate}
      </p>


      <p
        className="
          mt-0.5
          text-xs
          font-bold
          tabular-nums
        "
      >
        {formattedTime}
      </p>

    </div>

  );

}


/* =========================================================
   LEAGUE
========================================================= */

function LeagueCell({
  prediction,
}: {
  prediction: any;
}) {

  const emblem =
    prediction.league?.emblem;


  const leagueName =
    prediction.league?.name ??
    prediction.leagueCode ??
    'Unknown League';


  const country =
    prediction.league?.country;


  return (

    <div
      className="
        flex
        min-w-0
        items-center
        gap-1.5
      "
    >

      {emblem ? (

        <Image
          src={emblem}
          alt=""
          width={24}
          height={24}
          className="
            h-5
            w-5
            shrink-0
            rounded-md
            bg-muted
            object-contain
            p-0.5
          "
        />

      ) : (

        <div
          className="
            h-5
            w-5
            shrink-0
            rounded-md
            bg-muted
          "
        />

      )}


      <div
        className="
          min-w-0
        "
      >

        <p
          className="
            truncate
            text-[10px]
            font-semibold
          "
          title={leagueName}
        >
          {leagueName}
        </p>


        {country && (

          <p
            className="
              truncate
              text-[8px]
              text-muted-foreground
            "
          >
            {country}
          </p>

        )}

      </div>

    </div>

  );

}


/* =========================================================
   ROW COLOR
========================================================= */

function getRowClass({
  confidence,
  settled,
  outcome,
}: {
  confidence: number;
  settled: boolean;
  outcome: string;
}) {

  if (settled) {

    if (
      outcome === 'won' ||
      outcome === 'win'
    ) {

      return `
        bg-emerald-500/[0.035]
        hover:bg-emerald-500/[0.07]
      `;

    }


    if (
      outcome === 'lost' ||
      outcome === 'loss'
    ) {

      return `
        bg-red-500/[0.035]
        hover:bg-red-500/[0.07]
      `;

    }


    if (
      outcome === 'void'
    ) {

      return `
        bg-slate-500/[0.035]
        hover:bg-slate-500/[0.07]
      `;

    }

  }


  if (
    confidence >= 80
  ) {

    return `
      bg-emerald-500/[0.025]
      hover:bg-emerald-500/[0.06]
    `;

  }


  if (
    confidence >= 65
  ) {

    return `
      bg-amber-500/[0.025]
      hover:bg-amber-500/[0.06]
    `;

  }


  return `
    bg-orange-500/[0.02]
    hover:bg-orange-500/[0.05]
  `;

}