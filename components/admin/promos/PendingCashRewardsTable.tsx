'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Button,
} from '@/components/ui/button';

import {
  getPendingCashRewards,
  markCashRewardPaid,
} from '@/services/admin-promo-rewards.service';

interface PendingCashReward {
  _id: string;

  userId?: {
    fullName?: string;
    username?: string;
    email?: string;
  };

  amount?: number;

  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export default function PendingCashRewardsTable() {
  const queryClient = useQueryClient();

  const {
    data: rewards = [],
    isLoading,
    isError,
  } = useQuery<PendingCashReward[]>({
    queryKey: ['pending-cash'],
    queryFn: getPendingCashRewards,
  });

  const mutation = useMutation({
    mutationFn: markCashRewardPaid,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pending-cash'],
      });
    },
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          Cash Rewards Waiting Payment
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && (
          <div className="p-6">
            <p className="text-s text-muted-foreground">
              Loading pending cash rewards...
            </p>
          </div>
        )}

        {isError && (
          <div className="p-6">
            <p className="text-s text-destructive">
              Failed to load pending cash rewards.
            </p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          !rewards.length && (
            <div className="p-6">
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
                  No pending cash rewards.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  All cash rewards have been processed.
                </p>
              </div>
            </div>
          )}

        {!isLoading &&
          !isError &&
          rewards.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-s">
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
                      Amount
                    </TableHeader>

                    <TableHeader align="left">
                      Bank
                    </TableHeader>

                    <TableHeader>
                      Action
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {rewards.map((reward) => (
                    <RewardRow
                      key={reward._id}
                      reward={reward}
                      isPending={
                        mutation.isPending &&
                        mutation.variables === reward._id
                      }
                      onMarkPaid={() =>
                        mutation.mutate(reward._id)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

function RewardRow({
  reward,
  isPending,
  onMarkPaid,
}: {
  reward: PendingCashReward;
  isPending: boolean;
  onMarkPaid: () => void;
}) {
  const userName =
    reward.userId?.fullName ||
    reward.userId?.username ||
    'Unknown user';

  const amount = Number(
    reward.amount || 0,
  );

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
        <span className="font-semibold">
          ₦{amount.toLocaleString('en-NG')}
        </span>
      </td>

      <td className="p-3">
        <div className="space-y-0.5">
          <p className="font-medium">
            {reward.bankName || '—'}
          </p>

          <p className="text-xs text-muted-foreground">
            {reward.accountName || '—'}
          </p>

          <p className="font-mono text-xs text-muted-foreground">
            {reward.accountNumber || '—'}
          </p>
        </div>
      </td>

      <td className="p-3 text-center">
        <Button
          size="sm"
          type="button"
          disabled={isPending}
          onClick={onMarkPaid}
        >
          {isPending ? 'Processing...' : 'Mark Paid'}
        </Button>
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