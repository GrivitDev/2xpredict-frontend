'use client';

import { useQuery } from '@tanstack/react-query';

import {
  Copy,
  Link2,
  Share2,
  Users,
} from 'lucide-react';

import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import {
  getMyReferralLink,
} from '@/services/referrals.service';


// ============================================================
// COMPONENT
// ============================================================

export function ReferralLinkCard() {

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['my-referral-link'],
    queryFn: getMyReferralLink,
  });


  // ==========================================================
  // COPY
  // ==========================================================

  async function copyLink() {

    if (!data?.referralLink) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        data.referralLink,
      );

      toast.success(
        'Referral link copied',
      );

    } catch {

      toast.error(
        'Unable to copy referral link',
      );

    }

  }


  // ==========================================================
  // SHARE
  // ==========================================================

  async function shareLink() {

    if (!data?.referralLink) {
      return;
    }

    if (
      typeof navigator !== 'undefined' &&
      navigator.share
    ) {

      try {

        await navigator.share({
          title:
            'Join Football Prediction Platform',

          text:
            'Join using my referral link and earn rewards.',

          url:
            data.referralLink,
        });

      } catch {
        // User cancelled native share.
      }

      return;
    }

    await copyLink();

  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {

    return (

      <div
        className="
          animate-pulse
          rounded-xl
          border
          border-primary/10
          bg-primary/[0.02]
          p-3
        "
      >

        <div
          className="
            mb-2.5
            flex
            items-center
            gap-2
          "
        >

          <div
            className="
              h-7
              w-7
              rounded-lg
              bg-muted/40
            "
          />

          <div
            className="
              h-3
              w-24
              rounded
              bg-muted/40
            "
          />

        </div>


        <div
          className="
            grid
            gap-2
            sm:grid-cols-[auto_1fr_auto]
            sm:items-center
          "
        >

          <div
            className="
              h-8
              rounded-lg
              bg-muted/30
            "
          />

          <div
            className="
              h-8
              min-w-0
              rounded-lg
              bg-muted/30
            "
          />

          <div
            className="
              grid
              grid-cols-2
              gap-1.5
            "
          >

            <div
              className="
                h-8
                w-full
                rounded-lg
                bg-muted/30
              "
            />

            <div
              className="
                h-8
                w-full
                rounded-lg
                bg-muted/30
              "
            />

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // CONTENT
  // ==========================================================

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        border
        border-primary/15
        bg-primary/[0.03]
        p-3
      "
    >

      {/* Premium accent */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/60
          to-transparent
        "
      />


      {/* Header */}

      <div
        className="
          relative
          mb-2.5
          flex
          items-center
          gap-2
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
            rounded-lg
            border
            border-primary/15
            bg-primary/10
            text-primary
          "
        >
          <Link2 className="h-3.5 w-3.5" />
        </div>


        <div className="min-w-0">

          <span
            className="
              text-xs
              font-semibold
            "
          >
            Referral Link
          </span>

          <p
            className="
              text-[9px]
              text-muted-foreground
            "
          >
            Invite users and earn rewards
          </p>

        </div>

      </div>


      {/* Details */}

      <div
        className="
          relative
          grid
          gap-2
          sm:grid-cols-[auto_1fr_auto]
          sm:items-center
        "
      >

        {/* Code */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
            rounded-lg
            border
            border-border/50
            bg-muted/20
            px-2.5
            py-1.5
          "
        >

          <Users
            className="
              h-3.5
              w-3.5
              shrink-0
              text-primary
            "
          />

          <span
            className="
              text-[10px]
              text-muted-foreground
            "
          >
            Code
          </span>

          <span
            className="
              truncate
              text-xs
              font-bold
              tracking-wider
            "
          >
            {data?.referralCode || '—'}
          </span>

        </div>


        {/* URL */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
            rounded-lg
            border
            border-border/50
            bg-muted/20
            px-2.5
            py-1.5
          "
        >

          <span
            className="
              shrink-0
              text-[10px]
              text-muted-foreground
            "
          >
            Link
          </span>

          <span
            className="
              min-w-0
              flex-1
              truncate
              text-[11px]
            "
          >
            {data?.referralLink || '—'}
          </span>

        </div>


        {/* Actions */}

        <div
          className="
            grid
            grid-cols-2
            gap-1.5
          "
        >

          <Button
            type="button"
            onClick={copyLink}
            disabled={!data?.referralLink}
            className="
              h-8
              rounded-lg
              px-3
              text-[11px]
            "
          >
            <Copy
              className="
                mr-1.5
                h-3.5
                w-3.5
              "
            />

            Copy
          </Button>


          <Button
            type="button"
            variant="outline"
            onClick={shareLink}
            disabled={!data?.referralLink}
            className="
              h-8
              rounded-lg
              px-3
              text-[11px]
            "
          >
            <Share2
              className="
                mr-1.5
                h-3.5
                w-3.5
              "
            />

            Share
          </Button>

        </div>

      </div>

    </div>

  );
}