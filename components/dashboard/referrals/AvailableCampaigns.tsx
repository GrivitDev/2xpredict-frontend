'use client';

import {
  ArrowRight,
  CalendarDays,
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
import { useAnalytics } from '@/hooks/use-analytics';


// ============================================================
// TYPES
// ============================================================

type Campaign = {
  _id: string;
  name: string;
  description?: string;
  targetCount: number;
  rewardType: 'cash' | string;
  rewardAmount?: number;
  rewardPlan?: string;
  rewardDurationDays?: number;
  maxClaims?: number;
  endDate?: string;
};


// ============================================================
// COMPONENT
// ============================================================

export function AvailableCampaigns() {
  const {
    data: campaigns = [],
    isLoading,
    isError,
  } = useReferralPromos();

  const joinMutation = useJoinPromo();
const analytics = useAnalytics();
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

  if (isError) {
    return (
      <EmptyState
        icon={Gift}
        title="Unable to load campaigns"
        description="Please try again later."
        destructive
      />
    );
  }

  if (!campaigns.length) {
    return (
      <EmptyState
        icon={Gift}
        title="No Campaigns Available"
        description="No active referral campaigns at the moment."
      />
    );
  }

  const handleJoin = (campaignId: string) => {
    if (!campaignId) {
      toast.error('Invalid campaign');
      return;
    }

    joinMutation.mutate(campaignId, {
        onSuccess: () => {
          analytics.track({
            eventType: 'promo_claim',
            eventName: 'promo_join',
            properties: {
              promoId: campaignId,
            },
          });

          toast.success(
            'Campaign joined successfully',
          );
        },
      onError: () => {
        toast.error('Unable to join campaign');
      },
    });
  };

  return (
    <div
      className="
        grid
        gap-2
        sm:grid-cols-2
      "
    >
      {campaigns.map((campaign: Campaign) => {
        const isJoining =
          joinMutation.isPending &&
          joinMutation.variables === campaign._id;

        return (
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
                  variant="outline"
                  className="
                    shrink-0
                    rounded-full
                    border-emerald-500/20
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

            <CardContent
              className="
                space-y-2
                p-3
              "
            >
              <p
                className="
                  line-clamp-1
                  text-[10px]
                  leading-relaxed
                  text-muted-foreground
                "
              >
                {campaign.description ||
                  'Join this campaign and complete the requirements to earn your reward.'}
              </p>

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
                      ? formatCurrency(
                          campaign.rewardAmount,
                        )
                      : campaign.rewardPlan ||
                        'Subscription'
                  }
                  description={
                    campaign.rewardType !== 'cash'
                      ? `${campaign.rewardDurationDays ?? 0} days`
                      : undefined
                  }
                />
              </div>

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
                  value={formatEndDate(campaign.endDate)}
                />
              </div>

              <Button
                type="button"
                className="
                  h-8
                  w-full
                  rounded-md
                  text-[10px]
                  font-semibold
                "
                disabled={joinMutation.isPending}
                onClick={() =>
                  handleJoin(campaign._id)
                }
              >
                {isJoining ? (
                  'Joining...'
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
        );
      })}
    </div>
  );
}


// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon: Icon,
  title,
  description,
  destructive = false,
}: {
  icon: typeof Gift;
  title: string;
  description: string;
  destructive?: boolean;
}) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-lg
        border
        border-dashed
        px-3
        py-6
        text-center
        ${
          destructive
            ? `
              border-destructive/30
              bg-destructive/5
            `
            : `
              border-border/60
              bg-muted/10
            `
        }
      `}
    >
      <Icon
        className={`
          mb-1.5
          h-5
          w-5
          ${
            destructive
              ? 'text-destructive'
              : 'text-muted-foreground'
          }
        `}
      />

      <p className="text-xs font-semibold">
        {title}
      </p>

      <p
        className="
          mt-0.5
          text-[10px]
          text-muted-foreground
        "
      >
        {description}
      </p>
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
  icon: typeof Users;
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
  icon: typeof Target;
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
        <Icon className="h-2.5 w-2.5" />
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


// ============================================================
// HELPERS
// ============================================================

function formatCurrency(
  amount: number = 0,
) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}


function formatEndDate(
  date?: string,
) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
    },
  );
}