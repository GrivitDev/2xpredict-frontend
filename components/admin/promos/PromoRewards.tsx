'use client';

import {
  useQuery,
} from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Badge,
} from '@/components/ui/badge';

import {
  Skeleton,
} from '@/components/ui/skeleton';

import {
  getPromoRewards,
} from '@/services/admin-promos.service';

interface Props {
  promoId: string;
}

export default function PromoRewards({
  promoId,
}: Props) {
  const {
    data: rewards = [],
    isLoading,
  } = useQuery({
    queryKey: [
      'promo-rewards',
      promoId,
    ],

    queryFn: () =>
      getPromoRewards(promoId),

    enabled: Boolean(promoId),
  });

  if (isLoading) {
    return (
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>
            Reward History
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                rounded-2xl
                border
                border-border
                p-4
              "
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>
          Reward History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!rewards.length ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-border
              bg-muted/20
              p-8
              text-center
            "
          >
            <p className="text-s font-semibold">
              No rewards generated
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Rewards will appear here when users claim this promo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward: any) => {
              const userName =
                reward.userId?.username ??
                reward.userId?.email ??
                'Unknown user';

              const rewardLabel =
                reward.type === 'subscription'
                  ? `${reward.plan?.toUpperCase() ?? 'PLAN'} ${
                      reward.durationDays ?? 0
                    } days`
                  : `₦${Number(
                      reward.amount ?? 0,
                    ).toLocaleString()}`;

              return (
                <div
                  key={reward._id}
                  className="
                    flex
                    flex-col
                    gap-3
                    rounded-2xl
                    border
                    border-border
                    bg-background
                    p-4
                    transition
                    hover:bg-muted/20
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="min-w-0">
                    <p className="truncate text-s font-semibold">
                      {userName}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Claim #{reward.claimNumber}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <Badge variant="secondary">
                      {rewardLabel}
                    </Badge>

                    <Badge>
                      {reward.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}