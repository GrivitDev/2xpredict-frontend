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
  getAllClaimedRewards,
} from '@/services/admin-promo-rewards.service';

interface ClaimedReward {
  _id: string;

  userId?: {
    fullName?: string;
    username?: string;
    email?: string;
  };

  promoId?: {
    campaignType?: string;
  };

  type: string;

  plan?: string;

  durationDays?: number;

  amount?: number;

  claimNumber?: string | number;

  status?: string;
}

export default function AdminClaimedRewardsTable() {
  const {
    data: rewards = [],
    isLoading,
    isError,
  } = useQuery<ClaimedReward[]>({
    queryKey: ['claimed-rewards'],
    queryFn: getAllClaimedRewards,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-s text-muted-foreground">
            Loading rewards...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-s text-destructive">
            Failed to load claimed rewards.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!rewards.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            All Claimed Rewards
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div
            className="
              rounded-xl
              border
              border-dashed
              border-border
              bg-muted/20
              p-8
              text-center
            "
          >
            <p className="text-s font-medium">
              No claimed rewards found.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Claimed promotional rewards will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          All Claimed Rewards
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-s">
            <thead>
              <tr
                className="
                  border-b
                  border-border
                  bg-muted/40
                "
              >
                <TableHeader align="left">
                  User
                </TableHeader>

                <TableHeader>
                  Campaign
                </TableHeader>

                <TableHeader>
                  Reward
                </TableHeader>

                <TableHeader>
                  Claim
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {rewards.map((reward) => (
                <RewardRow
                  key={reward._id}
                  reward={reward}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RewardRow({
  reward,
}: {
  reward: ClaimedReward;
}) {
  const userName =
    reward.userId?.fullName ||
    reward.userId?.username ||
    'Unknown user';

  const campaign =
    reward.promoId?.campaignType ||
    '—';

  const rewardValue =
    reward.type === 'subscription'
      ? [
          reward.plan,
          reward.durationDays
            ? `${reward.durationDays} days`
            : null,
        ]
          .filter(Boolean)
          .join(' ') || 'Subscription'
      : `₦${Number(
          reward.amount || 0,
        ).toLocaleString('en-NG')}`;

  return (
    <tr
      className="
        border-b
        border-border/70
        transition-colors
        last:border-0
        hover:bg-muted/30
      "
    >
      <td className="p-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {userName}
          </p>

          {reward.userId?.email && (
            <p className="truncate text-xs text-muted-foreground">
              {reward.userId.email}
            </p>
          )}
        </div>
      </td>

      <td className="p-3 text-center">
        <span className="capitalize text-muted-foreground">
          {campaign}
        </span>
      </td>

      <td className="p-3 text-center font-medium">
        {rewardValue}
      </td>

      <td className="p-3 text-center">
        <span className="font-mono text-xs">
          #{reward.claimNumber ?? '—'}
        </span>
      </td>

      <td className="p-3 text-center">
        <Badge variant="secondary">
          {reward.status || 'Unknown'}
        </Badge>
      </td>
    </tr>
  );
}

function TableHeader({
  children,
  align = 'center',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <th
      className={`
        whitespace-nowrap
        p-3
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-muted-foreground
        ${
          align === 'left'
            ? 'text-left'
            : 'text-center'
        }
      `}
    >
      {children}
    </th>
  );
}