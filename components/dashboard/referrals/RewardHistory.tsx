'use client';

import { useQuery } from '@tanstack/react-query';

import {
  CheckCircle2,
  Crown,
  Gift,
  Wallet,
} from 'lucide-react';

import { getMyRewards } from '@/services/promos.service';


// ============================================================
// COMPONENT
// ============================================================

export function RewardHistory() {

  const {
    data: rewards = [],
    isLoading,
  } = useQuery({
    queryKey: ['my-rewards'],
    queryFn: getMyRewards,
  });


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div
        className="
          flex
          min-h-20
          items-center
          justify-center
          rounded-xl
          border
          border-border/50
          bg-card
          text-[10px]
          text-muted-foreground
        "
      >
        Loading rewards...
      </div>
    );
  }


  // ==========================================================
  // EMPTY
  // ==========================================================

  if (rewards.length === 0) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-xl
          border
          border-dashed
          border-border/60
          bg-muted/[0.03]
          px-4
          py-7
          text-center
        "
      >

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-primary/15
            bg-primary/10
            text-primary
          "
        >
          <Gift className="h-4 w-4" />
        </div>


        <p
          className="
            mt-2.5
            text-xs
            font-semibold
          "
        >
          No Rewards Yet
        </p>


        <p
          className="
            mt-1
            max-w-xs
            text-[10px]
            leading-relaxed
            text-muted-foreground
          "
        >
          Complete referral campaigns to start
          earning rewards.
        </p>

      </div>
    );
  }


  // ==========================================================
  // CONTENT
  // ==========================================================

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-border/60
        bg-card
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-border/50
          bg-muted/[0.02]
          px-3
          py-2.5
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

          <div
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-primary/15
              bg-primary/10
              text-primary
            "
          >
            <Gift className="h-3.5 w-3.5" />
          </div>


          <div className="min-w-0">

            <p
              className="
                text-xs
                font-semibold
                tracking-tight
              "
            >
              Reward History
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-[9px]
                text-muted-foreground
              "
            >
              Your earned rewards
            </p>

          </div>

        </div>


        <span
          className="
            shrink-0
            rounded-full
            border
            border-primary/15
            bg-primary/5
            px-2
            py-0.5
            text-[8px]
            font-semibold
            text-primary
          "
        >
          {rewards.length}
          {rewards.length === 1
            ? ' reward'
            : ' rewards'}
        </span>

      </div>


      {/* ======================================================
          REWARDS
      ====================================================== */}

      <div className="divide-y divide-border/40">

        {rewards.map((reward: any) => {

          const isCash =
            reward.type === 'cash';


          const date =
            new Date(
              reward.createdAt,
            ).toLocaleDateString(
              'en-GB',
              {
                day: '2-digit',
                month: 'short',
              },
            );


          return (
            <div
              key={reward._id}
              className="
                group
                flex
                items-center
                justify-between
                gap-3
                px-3
                py-2.5
                transition-colors
                hover:bg-muted/[0.03]
              "
            >

              {/* =================================================
                  REWARD INFO
              ================================================= */}

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                "
              >

                {/* Icon */}

                <div
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    ${
                      isCash
                        ? `
                          border-emerald-500/15
                          bg-emerald-500/10
                          text-emerald-500
                        `
                        : `
                          border-primary/15
                          bg-primary/10
                          text-primary
                        `
                    }
                  `}
                >

                  {isCash ? (
                    <Wallet className="h-3.5 w-3.5" />
                  ) : (
                    <Crown className="h-3.5 w-3.5" />
                  )}

                </div>


                {/* Details */}

                <div className="min-w-0">

                  <p
                    className="
                      truncate
                      text-[10px]
                      font-semibold
                    "
                  >
                    {reward.promoId?.name ??
                      'Referral Reward'}
                  </p>


                  <div
                    className="
                      mt-0.5
                      flex
                      min-w-0
                      items-center
                      gap-1.5
                    "
                  >

                    <p
                      className={`
                        truncate
                        text-[10px]
                        font-bold
                        ${
                          isCash
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-primary'
                        }
                      `}
                    >
                      {isCash
                        ? `₦${Number(
                            reward.amount ?? 0,
                          ).toLocaleString('en-GB')}`
                        : `${reward.plan} Subscription`}
                    </p>


                    <span
                      className="
                        shrink-0
                        text-[8px]
                        text-muted-foreground/60
                      "
                    >
                      •
                    </span>


                    <span
                      className="
                        shrink-0
                        text-[8px]
                        text-muted-foreground
                      "
                    >
                      {isCash
                        ? date
                        : `${reward.durationDays} days`}
                    </span>

                  </div>


                  {!isCash && (
                    <p
                      className="
                        mt-0.5
                        flex
                        items-center
                        gap-1
                        text-[8px]
                        text-muted-foreground
                      "
                    >
                      <span>
                        Earned
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        {date}
                      </span>
                    </p>
                  )}

                </div>

              </div>


              {/* =================================================
                  STATUS
              ================================================= */}

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-1
                  rounded-full
                  border
                  border-emerald-500/15
                  bg-emerald-500/5
                  px-1.5
                  py-0.5
                "
              >

                <CheckCircle2
                  className="
                    h-2.5
                    w-2.5
                    text-emerald-500
                  "
                />

                <span
                  className="
                    text-[8px]
                    font-semibold
                    text-emerald-600
                    dark:text-emerald-400
                  "
                >
                  Completed
                </span>

              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
}