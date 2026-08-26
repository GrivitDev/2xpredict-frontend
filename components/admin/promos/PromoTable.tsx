'use client';

import type { Promo } from '@/types/promo';

import PromoActions from './PromoActions';
import PromoStatusBadge from './PromoStatusBadge';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  PROMO_CAMPAIGN_LABELS,
  PROMO_REQUIREMENT_LABELS,
} from '@/constants/promo';

interface Props {
  promos: Promo[];
}

function getRewardText(promo: Promo) {
  if (promo.rewardType === 'subscription') {
    return [
      promo.rewardPlan?.toUpperCase(),
      promo.rewardDurationDays
        ? `${promo.rewardDurationDays} Days`
        : null,
    ]
      .filter(Boolean)
      .join(' ');
  }

  return `₦${(
    promo.rewardAmount ?? 0
  ).toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    'en-NG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

export default function PromoTable({
  promos,
}: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base">
          Promo Campaigns
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {promos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="
                      h-28
                      text-center
                      text-s
                      text-muted-foreground
                    "
                  >
                    No promo campaigns found.
                  </TableCell>
                </TableRow>
              ) : (
                promos.map((promo) => (
                  <TableRow
                    key={promo._id}
                    className="
                      transition-colors
                      hover:bg-muted/30
                    "
                  >
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate text-s font-semibold">
                          {promo.name}
                        </p>

                        {promo.promoCode && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {promo.promoCode}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-s">
                        {
                          PROMO_CAMPAIGN_LABELS[
                            promo.campaignType
                          ]
                        }
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-s">
                        {
                          PROMO_REQUIREMENT_LABELS[
                            promo.requirement
                          ]
                        }
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold">
                        {getRewardText(promo)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="whitespace-nowrap text-xs">
                        <p>
                          {formatDate(promo.startDate)}
                        </p>

                        <p className="my-0.5 text-muted-foreground">
                          to
                        </p>

                        <p>
                          {formatDate(promo.endDate)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <PromoStatusBadge promo={promo} />
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end">
                        <PromoActions promo={promo} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}