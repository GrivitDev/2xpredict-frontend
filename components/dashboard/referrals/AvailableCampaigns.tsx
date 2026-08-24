'use client';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Crown,
  Gift,
  Target,
  Users,
  Wallet,
} from 'lucide-react';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';

import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  useJoinPromo,
  useReferralPromos,
} from '@/hooks/use-promos';


// ============================================================
// COMPONENT
// ============================================================

export function AvailableCampaigns() {

  // ==========================================================
  // REFERRAL CAMPAIGNS
  // ==========================================================

  const {
    data: campaigns = [],
    isLoading,
    isError,
    error,
  } = useReferralPromos();


  // ==========================================================
  // JOIN CAMPAIGN
  // ==========================================================

  const joinMutation = useJoinPromo();


  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    'REFERRAL CAMPAIGNS:',
    campaigns,
  );

  console.log(
    'REFERRAL ERROR:',
    error,
  );


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
          rounded-lg
          border
          border-border/50
          bg-card
          text-[11px]
          text-muted-foreground
        "
      >
        Loading...
      </div>
    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (isError) {

    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-lg
          border
          border-dashed
          border-destructive/30
          bg-destructive/5
          px-3
          py-6
          text-center
        "
      >

        <Gift
          className="
            mb-1.5
            h-5
            w-5
            text-destructive
          "
        />

        <p className="text-xs font-semibold">
          Unable to load campaigns
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            text-muted-foreground
          "
        >
          Please try again later.
        </p>

      </div>
    );

  }


  // ==========================================================
  // EMPTY
  // ==========================================================

  if (campaigns.length === 0) {

    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-lg
          border
          border-dashed
          border-border/60
          bg-muted/10
          px-3
          py-6
          text-center
        "
      >

        <Gift
          className="
            mb-1.5
            h-5
            w-5
            text-muted-foreground
          "
        />

        <p className="text-xs font-semibold">
          No Campaigns Available
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            text-muted-foreground
          "
        >
          No active referral campaigns at the moment.
        </p>

      </div>
    );

  }


  // ==========================================================
  // CAMPAIGNS
  // ==========================================================

  return (

    <div
      className="
        grid
        gap-2
        sm:grid-cols-2
      "
    >

      {campaigns.map((campaign) => (

        <div
          key={campaign._id}
          className="
            overflow-hidden
            rounded-lg
            border
            border-border/60
            bg-card
          "
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <CardHeader
            className="
              border-b
              border-border/40
              px-3
              py-2
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-2
              "
            >

              <CardTitle
                className="
                  flex
                  min-w-0
                  items-center
                  gap-1.5
                  text-xs
                "
              >

                <div
                  className="
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    bg-primary/10
                    text-primary
                  "
                >

                  <Gift className="h-3 w-3" />

                </div>

                <span className="truncate">
                  {campaign.name}
                </span>

              </CardTitle>


              <Badge
                className="
                  shrink-0
                  rounded-full
                  bg-emerald-500/10
                  px-1.5
                  py-0
                  text-[8px]
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                Active
              </Badge>

            </div>

          </CardHeader>


          {/* ==================================================
              CONTENT
          ================================================== */}

          <CardContent
            className="
              space-y-2
              p-3
            "
          >

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p
              className="
                line-clamp-1
                text-[10px]
                leading-relaxed
                text-muted-foreground
              "
            >
              {campaign.description}
            </p>


            {/* =================================================
                REQUIREMENT + REWARD
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                gap-1.5
              "
            >

              <CampaignInfo
                icon={Target}
                title="Requirement"
                value={campaign.targetCount}
                description="referrals"
              />


              <CampaignInfo
                icon={
                  campaign.rewardType === 'cash'
                    ? Wallet
                    : Crown
                }
                title="Reward"
                value={
                  campaign.rewardType === 'cash'
                    ? new Intl.NumberFormat(
                        'en-GB',
                        {
                          style: 'currency',
                          currency: 'NGN',
                          maximumFractionDigits: 0,
                        },
                      ).format(
                        campaign.rewardAmount ?? 0,
                      )
                    : campaign.rewardPlan ?? 'Subscription'
                }
                description={
                  campaign.rewardType !== 'cash'
                    ? `${campaign.rewardDurationDays ?? 0} days`
                    : undefined
                }
              />

            </div>


            {/* =================================================
                META
            ================================================= */}

            <div
              className="
                divide-y
                divide-border/40
                rounded-md
                border
                border-border/40
                bg-muted/15
                px-2
              "
            >

              <MetaRow
                icon={Users}
                label="Max claims"
                value={
                  campaign.maxClaims === 0
                    ? 'Unlimited'
                    : campaign.maxClaims ?? 1
                }
              />


              <MetaRow
                icon={CalendarDays}
                label="Ends"
                value={
                  campaign.endDate
                    ? new Date(
                        campaign.endDate,
                      ).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                        },
                      )
                    : '—'
                }
              />

            </div>


            {/* =================================================
                ACTION
            ================================================= */}

            <Button
              className="
                h-8
                w-full
                rounded-md
                text-[10px]
                font-semibold
              "
              disabled={
                joinMutation.isPending
              }
              onClick={() => {

                if (!campaign._id) {
                  toast.error(
                    'Invalid campaign',
                  );

                  return;
                }

                joinMutation.mutate(
                  campaign._id,
                  {
                    onSuccess: () => {

                      toast.success(
                        'Campaign joined successfully',
                      );

                    },

                    onError: () => {

                      toast.error(
                        'Unable to join campaign',
                      );

                    },
                  },
                );

              }}
            >

              {joinMutation.isPending ? (

                <>
                  Joining...
                </>

              ) : (

                <>
                  Join Campaign

                  <ArrowRight
                    className="
                      ml-auto
                      h-3
                      w-3
                    "
                  />

                </>

              )}

            </Button>

          </CardContent>

        </div>

      ))}

    </div>

  );
}


// ============================================================
// META ROW
// ============================================================

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        gap-2
        py-1
        text-[9px]
      "
    >

      <div
        className="
          flex
          min-w-0
          items-center
          gap-1
          text-muted-foreground
        "
      >

        <Icon
          className="
            h-2.5
            w-2.5
            shrink-0
          "
        />

        <span className="truncate">
          {label}
        </span>

      </div>


      <span className="shrink-0 font-semibold">
        {value}
      </span>

    </div>

  );
}


// ============================================================
// CAMPAIGN INFO
// ============================================================

function CampaignInfo({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: any;
  title: string;
  value: string | number;
  description?: string;
}) {

  return (

    <div
      className="
        min-w-0
        rounded-md
        border
        border-border/40
        bg-muted/15
        p-2
      "
    >

      <div
        className="
          flex
          h-5
          w-5
          items-center
          justify-center
          rounded
          bg-primary/10
          text-primary
        "
      >

        <Icon
          className="
            h-2.5
            w-2.5
          "
        />

      </div>


      <p
        className="
          mt-1
          truncate
          text-[8px]
          font-medium
          text-muted-foreground
        "
      >
        {title}
      </p>


      <p
        className="
          mt-0.5
          truncate
          text-[11px]
          font-bold
        "
      >
        {value}
      </p>


      {description && (

        <p
          className="
            mt-0.5
            truncate
            text-[8px]
            text-muted-foreground
          "
        >
          {description}
        </p>

      )}

    </div>

  );
}