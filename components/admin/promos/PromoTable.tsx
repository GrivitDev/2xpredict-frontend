'use client';

import type { Promo } from '@/types/promo';

import PromoActions from './PromoActions';
import PromoStatusBadge from './PromoStatusBadge';

import {
  AlertCircle,
} from 'lucide-react';

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


/* =========================================================
   HELPERS
========================================================= */

function getRewardText(
  promo: Promo,
): string {
  if (promo.rewardType === 'subscription') {
    const plan =
      promo.rewardPlan?.toUpperCase();

    const duration =
      promo.rewardDurationDays
        ? `${promo.rewardDurationDays} Days`
        : null;

    const reward = [
      plan,
      duration,
    ]
      .filter(Boolean)
      .join(' ');

    return reward || 'Subscription reward';
  }

  if (promo.rewardType === 'cash') {
    return `₦${(
      promo.rewardAmount ?? 0
    ).toLocaleString('en-NG')}`;
  }

  return 'Reward unavailable';
}


function formatDate(
  date?: string,
): string {
  if (!date) {
    return '—';
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return 'Invalid date';
  }

  return parsedDate.toLocaleDateString(
    'en-NG',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}


function getCampaignLabel(
  campaignType: Promo['campaignType'],
): string {
  return (
    PROMO_CAMPAIGN_LABELS[
      campaignType
    ] ?? 'Unknown campaign'
  );
}


function getRequirementLabel(
  requirement: Promo['requirement'],
): string {
  return (
    PROMO_REQUIREMENT_LABELS[
      requirement
    ] ?? 'Unknown requirement'
  );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function PromoTable({
  promos,
}: Props) {
  /*
   * Defensive validation.
   *
   * This prevents the table from crashing if an unexpected
   * API response reaches the component.
   */
  if (!Array.isArray(promos)) {
    return (
      <PromoTableError />
    );
  }


  return (
    <Card
      className="
        overflow-hidden
        border-border
        bg-card
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <CardHeader
        className="
          border-b
          border-border
          px-4
          py-4
          sm:px-6
        "
      >
        <CardTitle className="text-base">
          Promo Campaigns
        </CardTitle>
      </CardHeader>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <CardContent className="p-0">
        {promos.length === 0 ? (
          <PromoTableEmpty />
        ) : (
          <div
            className="
              w-full
              overflow-x-auto
            "
          >
            <Table
              className="
                min-w-[900px]
              "
            >
              <TableHeader>
                <TableRow
                  className="
                    bg-muted/40
                    hover:bg-muted/40
                  "
                >
                  <TableHead>
                    Name
                  </TableHead>

                  <TableHead>
                    Campaign
                  </TableHead>

                  <TableHead>
                    Requirement
                  </TableHead>

                  <TableHead>
                    Reward
                  </TableHead>

                  <TableHead>
                    Duration
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead
                    className="text-right"
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>


              <TableBody>
                {promos.map(
                  (promo) => (
                    <PromoRow
                      key={promo._id}
                      promo={promo}
                    />
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


/* =========================================================
   PROMO ROW
========================================================= */

function PromoRow({
  promo,
}: {
  promo: Promo;
}) {
  return (
    <TableRow
      className="
        transition-colors
        hover:bg-muted/30
      "
    >
      {/* ===================================================
          NAME
      =================================================== */}

      <TableCell>
        <div
          className="
            min-w-0
            max-w-[220px]
          "
        >
          <p
            className="
              truncate
              text-sm
              font-semibold
            "
            title={promo.name}
          >
            {promo.name || 'Unnamed promo'}
          </p>

          {promo.promoCode && (
            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-muted-foreground
              "
              title={promo.promoCode}
            >
              {promo.promoCode}
            </p>
          )}
        </div>
      </TableCell>


      {/* ===================================================
          CAMPAIGN
      =================================================== */}

      <TableCell>
        <span className="text-sm">
          {getCampaignLabel(
            promo.campaignType,
          )}
        </span>
      </TableCell>


      {/* ===================================================
          REQUIREMENT
      =================================================== */}

      <TableCell>
        <span className="text-sm">
          {getRequirementLabel(
            promo.requirement,
          )}
        </span>
      </TableCell>


      {/* ===================================================
          REWARD
      =================================================== */}

      <TableCell>
        <span
          className="
            whitespace-nowrap
            text-sm
            font-semibold
          "
        >
          {getRewardText(promo)}
        </span>
      </TableCell>


      {/* ===================================================
          DURATION
      =================================================== */}

      <TableCell>
        <div
          className="
            whitespace-nowrap
            text-xs
          "
        >
          <p>
            {formatDate(
              promo.startDate,
            )}
          </p>

          <p
            className="
              my-0.5
              text-muted-foreground
            "
          >
            to
          </p>

          <p>
            {formatDate(
              promo.endDate,
            )}
          </p>
        </div>
      </TableCell>


      {/* ===================================================
          STATUS
      =================================================== */}

      <TableCell>
        <PromoStatusBadge
          promo={promo}
        />
      </TableCell>


      {/* ===================================================
          ACTIONS
      =================================================== */}

      <TableCell>
        <div className="flex justify-end">
          <PromoActions
            promo={promo}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function PromoTableEmpty() {
  return (
    <div
      className="
        flex
        min-h-40
        flex-col
        items-center
        justify-center
        px-6
        py-10
        text-center
      "
    >
      <div
        className="
          mb-3
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-muted
        "
      >
        <AlertCircle
          className="
            h-5
            w-5
            text-muted-foreground
          "
        />
      </div>

      <p
        className="
          text-sm
          font-medium
        "
      >
        No promo campaigns found
      </p>

      <p
        className="
          mt-1
          max-w-sm
          text-xs
          leading-5
          text-muted-foreground
        "
      >
        There are currently no promotional
        campaigns available.
      </p>
    </div>
  );
}


/* =========================================================
   ERROR STATE
========================================================= */

function PromoTableError() {
  return (
    <Card
      className="
        overflow-hidden
        border-destructive/20
      "
    >
      <CardContent
        className="
          flex
          min-h-40
          flex-col
          items-center
          justify-center
          px-6
          py-10
          text-center
        "
      >
        <div
          className="
            mb-3
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-destructive/10
            text-destructive
          "
        >
          <AlertCircle className="h-5 w-5" />
        </div>

        <p
          className="
            text-sm
            font-semibold
          "
        >
          Unable to display promotions
        </p>

        <p
          className="
            mt-1
            max-w-sm
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          The promotions data received from the
          server is invalid. Please refresh the
          page and try again.
        </p>
      </CardContent>
    </Card>
  );
}