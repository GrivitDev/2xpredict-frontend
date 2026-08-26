'use client';

import {
  Gift,
  Users,
  Crown,
  Wallet,
  CheckCircle,
} from 'lucide-react';

import { useMyPromoProgress } from '@/hooks/use-promos';

export default function UserPromosPage() {
  const {
    data: promos = [],
    isLoading,
  } = useMyPromoProgress();

  if (isLoading) {
    return (
      <div className="p-6">
        Loading promotions...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          Promotions
        </h1>

        <p className="text-muted-foreground">
          Complete promo tasks and unlock rewards.
        </p>
      </div>

      {promos.length === 0 && (
        <div
          className="
            rounded-xl
            border
            bg-card
            p-6
            text-center
          "
        >
          No active promotions available.
        </div>
      )}

      <div className="grid gap-6">

        {promos.map((promo) => {

          const percentage = Math.min(
            100,
            (promo.currentProgress / promo.targetCount) * 100,
          );

          return (
            <div
              key={promo.promoId}
              className="
                rounded-xl
                border
                bg-card
                text-card-foreground
                shadow-sm
              "
            >

              <div className="p-6 pb-4">

                <div className="flex items-center justify-between gap-4">

                  <h2 className="text-lg font-semibold">
                    {promo.name}
                  </h2>

                  {promo.completed && (
                    <span
                      className="
                        inline-flex
                        shrink-0
                        items-center
                        rounded-full
                        border
                        bg-primary
                        px-2.5
                        py-0.5
                        text-xs
                        font-semibold
                        text-primary-foreground
                      "
                    >
                      Completed
                    </span>
                  )}

                </div>

              </div>


              <div className="space-y-5 p-6 pt-0">

                <p className="text-muted-foreground">
                  {promo.description}
                </p>


                <div className="grid gap-4 md:grid-cols-3">

                  <InfoCard
                    icon={<Users className="h-4 w-4" />}
                    title="Requirement"
                    value={formatRequirement(
                      promo.requirement,
                    )}
                  />


                  <InfoCard
                    icon={
                      promo.rewardType === 'cash'
                        ? (
                          <Wallet className="h-4 w-4" />
                        )
                        : (
                          <Crown className="h-4 w-4" />
                        )
                    }
                    title="Reward"
                    value={
                      promo.rewardType === 'cash'
                        ? `₦${promo.rewardAmount}`
                        : `${promo.rewardPlan} ${promo.rewardDurationDays} days`
                    }
                  />


                  <InfoCard
                    icon={<Gift className="h-4 w-4" />}
                    title="Completed"
                    value={`${promo.completedClaims}`}
                  />

                </div>


                {promo.requirement !== 'register' && (
                  <div className="space-y-2">

                    <div
                      className="
                        flex
                        justify-between
                        text-sm
                      "
                    >
                      <span>
                        Progress
                      </span>

                      <span>
                        {promo.qualifiedReferrals}
                        /
                        {promo.targetCount}
                      </span>
                    </div>


                    <div
                      className="
                        h-2
                        w-full
                        overflow-hidden
                        rounded-full
                        bg-primary/10
                      "
                    >
                      <div
                        className="
                          h-full
                          rounded-full
                          bg-primary
                          transition-[width]
                        "
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>


                    <p className="text-sm text-muted-foreground">
                      {promo.remainingToNextReward} more
                      qualified action(s) needed.
                    </p>

                  </div>
                )}


                {promo.completed && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                    "
                  >
                    <CheckCircle className="h-4 w-4" />

                    Reward unlocked.
                  </div>
                )}


                {promo.requirement !== 'register' && (
                  <button
                    type="button"
                    className="
                      inline-flex
                      h-9
                      items-center
                      justify-center
                      rounded-md
                      border
                      bg-background
                      px-4
                      text-sm
                      font-medium
                      transition-colors
                      hover:bg-muted
                    "
                  >
                    Share Referral Link
                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}


function InfoCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        p-4
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
        {icon}

        {title}
      </div>

      <p className="mt-2 font-semibold">
        {value}
      </p>
    </div>
  );
}


function formatRequirement(requirement: string) {
  return requirement
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}