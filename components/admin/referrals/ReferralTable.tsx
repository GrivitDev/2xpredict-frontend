'use client';

import { Referral } from '@/types/referral';

import ReferralStatusBadge from './ReferralStatusBadge';

interface ReferralTableProps {
  referrals: Referral[];
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const PROGRESS = [
  {
    label: 'Registered',
    key: 'registered',
  },
  {
    label: 'Regular',
    key: 'regularSubscription',
  },
  {
    label: 'VIP',
    key: 'vipSubscription',
  },
  {
    label: 'Prediction',
    key: 'predictionPurchased',
  },
] as const;

export default function ReferralTable({
  referrals,
}: ReferralTableProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-lg
        border
        border-border/60
        bg-card
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th
                scope="col"
                className="px-3 py-2.5 text-left font-medium text-muted-foreground"
              >
                Referrer
              </th>

              <th
                scope="col"
                className="px-3 py-2.5 text-left font-medium text-muted-foreground"
              >
                Referred User
              </th>

              <th
                scope="col"
                className="px-3 py-2.5 text-left font-medium text-muted-foreground"
              >
                Progress
              </th>

              <th
                scope="col"
                className="px-3 py-2.5 text-left font-medium text-muted-foreground"
              >
                Reward
              </th>

              <th
                scope="col"
                className="px-3 py-2.5 text-left font-medium text-muted-foreground"
              >
                Date
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/50">
            {referrals.map((referral) => (
              <tr
                key={referral._id}
                className="
                  transition-colors
                  hover:bg-muted/20
                "
              >
                <td className="px-3 py-3 align-middle">
                  <div className="max-w-[180px]">
                    <p className="truncate font-medium text-foreground">
                      {referral.referrerId?.username ?? 'Unknown'}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {referral.referrerId?.email ?? '—'}
                    </p>
                  </div>
                </td>

                <td className="px-3 py-3 align-middle">
                  <div className="max-w-[180px]">
                    <p className="truncate font-medium text-foreground">
                      {referral.referredUserId?.username ?? 'Unknown'}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {referral.referredUserId?.email ?? '—'}
                    </p>
                  </div>
                </td>

                <td className="px-3 py-3 align-middle">
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-1
                    "
                  >
                    {PROGRESS.map(({ label, key }) => (
                      <ReferralStatusBadge
                        key={key}
                        label={label}
                        active={referral[key]}
                      />
                    ))}
                  </div>
                </td>

                <td className="px-3 py-3 align-middle">
                  <ReferralStatusBadge
                    label="Claimed"
                    active={referral.rewardClaimed}
                  />
                </td>

                <td className="whitespace-nowrap px-3 py-3 align-middle text-muted-foreground">
                  {formatDate(referral.createdAt)}
                </td>
              </tr>
            ))}

            {referrals.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="
                    px-3
                    py-10
                    text-center
                    text-xs
                    text-muted-foreground
                  "
                >
                  No referrals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}