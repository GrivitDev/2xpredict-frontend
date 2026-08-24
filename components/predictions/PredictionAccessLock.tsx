'use client';

import {
  Clock3,
  Crown,
  Lock,
} from 'lucide-react';

export type PredictionPlan =
  | 'free'
  | 'regular'
  | 'vip';

export type PredictionAccessState =
  | 'subscription'
  | 'purchased'
  | 'locked'
  | 'upgrade_required'
  | 'login_required';

interface AccessInfo {
  allowed?: boolean;
  state?: PredictionAccessState | string;
  plan?: PredictionPlan | string;
  released?: boolean;
  releaseAt?: number | null;
  message?: string | null;
}

interface LockInfoParams {
  access: AccessInfo;
  predictionPlan: PredictionPlan | string;
}

export interface PredictionLockInfo {
  title: string;
  description: string;
  icon: 'lock' | 'crown' | 'clock';
  requiredPlan?: 'regular' | 'vip';
}

/* =========================================================
   PLAN LEVELS
========================================================= */

export const PLAN_LEVELS: Record<
  PredictionPlan,
  number
> = {
  free: 1,
  regular: 2,
  vip: 3,
};


/* =========================================================
   NORMALIZE PLAN
========================================================= */

export function normalizePlan(
  plan?: string,
): PredictionPlan {
  switch (
    plan?.toLowerCase()
  ) {
    case 'vip':
      return 'vip';

    case 'regular':
      return 'regular';

    default:
      return 'free';
  }
}


/* =========================================================
   LOCK INFORMATION
========================================================= */

export function getPredictionLockInfo({
  access,
  predictionPlan,
}: LockInfoParams): PredictionLockInfo {

  const userPlan =
    normalizePlan(
      access.plan,
    );

  const requiredPlan =
    normalizePlan(
      predictionPlan,
    );

  const state =
    access.state ?? '';

  const released =
    access.released === true;


  /* =======================================================
     LOGIN
  ======================================================= */

  if (
    state ===
    'login_required'
  ) {
    return {
      title: 'Login required',

      description:
        'Login to view this prediction.',

      icon: 'lock',
    };
  }


  /* =======================================================
     USER PLAN IS TOO LOW
  ======================================================= */

  if (
    state ===
      'upgrade_required' ||
    PLAN_LEVELS[userPlan] <
      PLAN_LEVELS[requiredPlan]
  ) {

    /*
     * VIP prediction
     */

    if (
      requiredPlan ===
      'vip'
    ) {

      /*
       * Regular → VIP
       */

      if (
        userPlan ===
        'regular'
      ) {
        return {
          title:
            'VIP Required',

          description:
            'Upgrade to VIP to access this prediction.',

          icon: 'crown',

          requiredPlan:
            'vip',
        };
      }


      /*
       * Free → Regular or VIP
       */

      return {
        title:
          'VIP Access',

        description:
          'Upgrade to Regular or VIP to access this prediction.',

        icon: 'crown',

        requiredPlan:
          'vip',
      };
    }


    /*
     * Regular prediction
     */

    if (
      requiredPlan ===
      'regular'
    ) {

      return {
        title:
          'Regular Access',

        description:
          'Upgrade to Regular or VIP to access this prediction.',

        icon: 'lock',

        requiredPlan:
          'regular',
      };
    }
  }


  /* =======================================================
     SAME PLAN BUT NOT RELEASED
  ======================================================= */

  if (
    state === 'locked' &&
    !released
  ) {

    /*
     * Regular user looking at a Regular
     * prediction before its release window.
     */

    if (
      requiredPlan ===
        'regular' &&
      userPlan ===
        'regular'
    ) {

      return {
        title:
          'Not released to Regular',

        description:
          'Upgrade to VIP to see this prediction earlier.',

        icon: 'crown',

        requiredPlan:
          'vip',
      };
    }


    /*
     * Free/Regular user looking at VIP
     * should normally have been caught by
     * upgrade_required, but keep this safe.
     */

    if (
      requiredPlan ===
        'vip' &&
      userPlan !==
        'vip'
    ) {

      return {
        title:
          'Not released to your plan',

        description:
          userPlan ===
          'regular'
            ? 'Upgrade to VIP to see this prediction earlier.'
            : 'Upgrade to Regular or VIP to access this prediction.',

        icon:
          userPlan ===
          'regular'
            ? 'crown'
            : 'lock',

        requiredPlan:
          userPlan ===
          'regular'
            ? 'vip'
            : 'regular',
      };
    }


    /*
     * Free prediction that simply hasn't
     * reached its release time.
     */

    return {
      title:
        'Not released yet',

      description:
        access.message ??
        'This prediction will be available closer to kickoff.',

      icon:
        'clock',
    };
  }


  /* =======================================================
     FALLBACK
  ======================================================= */

  return {
    title:
      'Prediction locked',

    description:
      access.message ??
      'This prediction is currently unavailable.',

    icon:
      'lock',
  };
}


/* =========================================================
   ICON
========================================================= */

export function PredictionLockIcon({
  type,
  size = 12,
}: {
  type: PredictionLockInfo['icon'];
  size?: number;
}) {

  if (
    type === 'crown'
  ) {
    return (
      <Crown
        size={size}
      />
    );
  }

  if (
    type === 'clock'
  ) {
    return (
      <Clock3
        size={size}
      />
    );
  }

  return (
    <Lock
      size={size}
    />
  );
}


/* =========================================================
   RELEASE DATE
========================================================= */

export function formatReleaseDate(
  timestamp?: number | null,
) {
  if (!timestamp) {
    return null;
  }

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  );
}