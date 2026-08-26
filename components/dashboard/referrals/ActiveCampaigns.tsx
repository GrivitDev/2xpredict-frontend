'use client';

import { useQuery } from '@tanstack/react-query';

import {
  CheckCircle2,
  Crown,
  Gift,
  Target,
  Trophy,
  Wallet,
} from 'lucide-react';

import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { getMyPromoProgress } from '@/services/promos.service';


// ============================================================
// TYPES
// ============================================================

interface Campaign {
  promoId: string;
  name: string;
  description?: string | null;
  targetCount: number;
  currentProgress: number;
  remainingToNextReward: number;
  completed: boolean;
  completedClaims: number;
  rewardType: string;
  rewardAmount?: number | null;
  rewardPlan?: string | null;
}


// ============================================================
// COMPONENT
// ============================================================

export function ActiveCampaigns() {
  const {
    data: campaigns = [],
    isLoading,
  } = useQuery<Campaign[]>({
    queryKey: ['promo-progress'],
    queryFn: getMyPromoProgress,
  });

  if (isLoading) {
    return (
      <div
        className="
          flex
          min-h-24
          items-center
          justify-center
          rounded-xl
          border
          border-border/60
          bg-card
          text-sm
          text-muted-foreground
        "
      >
        Loading campaigns...
      </div>
    );
  }

  if (!campaigns.length) {
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
          bg-muted/[0.08]
          px-4
          py-8
          text-center
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-primary/15
            bg-primary/10
            text-primary
          "
        >
          <Gift className="h-5 w-5" />
        </div>

        <p className="mt-3 text-sm font-semibold">
          No Active Campaigns
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Join a campaign to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => {
        const percentage =
          campaign.targetCount > 0
            ? Math.min(
                100,
                Math.round(
                  (campaign.currentProgress /
                    campaign.targetCount) *
                    100,
                ),
              )
            : 0;

        const completed = Boolean(campaign.completed);

        return (
          <CampaignCard
            key={campaign.promoId}
            campaign={campaign}
            percentage={percentage}
            completed={completed}
          />
        );
      })}
    </div>
  );
}


// ============================================================
// CAMPAIGN CARD
// ============================================================

function CampaignCard({
  campaign,
  percentage,
  completed,
}: {
  campaign: Campaign;
  percentage: number;
  completed: boolean;
}) {
  const RewardIcon =
    campaign.rewardType === 'cash'
      ? Wallet
      : Crown;

  const rewardValue =
    campaign.rewardType === 'cash'
      ? `₦${Number(
          campaign.rewardAmount || 0,
        ).toLocaleString('en-NG')}`
      : campaign.rewardPlan || 'Subscription';

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-border/60
        bg-card
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-primary/25
        hover:shadow-md
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/50
          to-transparent
        "
      />

      <CardHeader
        className="
          border-b
          border-border/50
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <CardTitle
            className="
              flex
              min-w-0
              items-center
              gap-2.5
              text-sm
              font-semibold
            "
          >
            <div
              className="
                flex
                h-9
                w-9
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
              <Gift className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate">
                {campaign.name}
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  font-normal
                  text-muted-foreground
                "
              >
                Promotional campaign
              </p>
            </div>
          </CardTitle>

          <Badge
            variant="outline"
            className={`
              shrink-0
              rounded-full
              px-2.5
              py-1
              text-xs
              font-semibold
              ${
                completed
                  ? `
                    border-emerald-500/20
                    bg-emerald-500/10
                    text-emerald-600
                    dark:text-emerald-400
                  `
                  : `
                    border-primary/20
                    bg-primary/10
                    text-primary
                  `
              }
            `}
          >
            {completed ? 'Completed' : 'Active'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <p
          className="
            line-clamp-2
            text-xs
            leading-relaxed
            text-muted-foreground
          "
        >
          {campaign.description ||
            'Complete the campaign requirements to unlock your reward.'}
        </p>

        <ProgressCard
          current={campaign.currentProgress}
          target={campaign.targetCount}
          percentage={percentage}
          remaining={campaign.remainingToNextReward}
        />

        <div
          className="
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-4
          "
        >
          <InfoCard
            icon={Target}
            title="Completed"
            value={campaign.currentProgress}
            iconClass="text-blue-500 bg-blue-500/10"
          />

          <InfoCard
            icon={Trophy}
            title="Claims"
            value={campaign.completedClaims}
            iconClass="text-amber-500 bg-amber-500/10"
          />

          <InfoCard
            icon={RewardIcon}
            title="Reward"
            value={rewardValue}
            iconClass="text-emerald-500 bg-emerald-500/10"
          />

          <InfoCard
            icon={Gift}
            title="To Next Reward"
            value={campaign.remainingToNextReward}
            iconClass="text-violet-500 bg-violet-500/10"
          />
        </div>

        {completed && <CompletedNotice />}
      </CardContent>
    </div>
  );
}


// ============================================================
// PROGRESS CARD
// ============================================================

function ProgressCard({
  current,
  target,
  percentage,
  remaining,
}: {
  current: number;
  target: number;
  percentage: number;
  remaining: number;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border/50
        bg-muted/[0.12]
        px-3.5
        py-3
      "
    >
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />

          <span
            className="
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            Campaign Progress
          </span>
        </div>

        <span className="text-sm font-bold tabular-nums">
          {current}
          <span className="font-normal text-muted-foreground">
            /{target}
          </span>
        </span>
      </div>

      <div
        className="
          h-1.5
          overflow-hidden
          rounded-full
          bg-muted
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-primary
            transition-[width]
            duration-500
          "
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div
        className="
          mt-1.5
          flex
          justify-between
          text-[11px]
          text-muted-foreground
        "
      >
        <span>{percentage}% complete</span>

        <span>{remaining} remaining</span>
      </div>
    </div>
  );
}


// ============================================================
// COMPLETED NOTICE
// ============================================================

function CompletedNotice() {
  return (
    <div
      className="
        flex
        items-center
        gap-2.5
        rounded-xl
        border
        border-emerald-500/20
        bg-emerald-500/[0.05]
        px-3
        py-2.5
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
          rounded-full
          bg-emerald-500/10
          text-emerald-500
        "
      >
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold">
          Campaign completed
        </p>

        <p
          className="
            mt-0.5
            text-[11px]
            text-muted-foreground
          "
        >
          Your reward has been unlocked.
        </p>
      </div>
    </div>
  );
}


// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon: Icon,
  title,
  value,
  iconClass,
}: {
  icon: typeof Target;
  title: string;
  value: string | number;
  iconClass: string;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-lg
        border
        border-border/50
        bg-muted/[0.08]
        px-2.5
        py-2.5
      "
    >
      <div
        className={`
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          ${iconClass}
        `}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p
        className="
          mt-2
          truncate
          text-[11px]
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
          text-sm
          font-semibold
          tracking-tight
        "
      >
        {value}
      </p>
    </div>
  );
}