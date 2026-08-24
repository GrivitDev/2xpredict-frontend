'use client';

import {
  CalendarDays,
  Clock,
  Crown,
  Mail,
  Phone,
  Sparkles,
  MapPin,
  Coins,
  ShieldCheck,
  UserRound,
  CheckCircle2,
} from 'lucide-react';

import { format } from 'date-fns';

import type { User } from '@/types/user';

import EditProfileDialog from '@/components/dashboard/profile/EditProfileDialog';
import ChangePasswordDialog from '@/components/dashboard/profile/ChangePasswordDialog';
import LogoutDialog from '@/components/dashboard/profile/LogoutDialog';
import DeleteAccountDialog from '@/components/dashboard/profile/DeleteAccountDialog';


// ============================================================
// TYPES
// ============================================================

interface Props {
  user: User;
  plan: 'free' | 'regular' | 'vip';
}


// ============================================================
// COMPONENT
// ============================================================

export default function ProfileHero({
  user,
  plan,
}: Props) {

  const initials =
    user.fullName
      ?.split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';


  // ==========================================================
  // PLAN CONFIG
  // ==========================================================

  const planConfig = {

    vip: {
      label: 'VIP',
      icon: Crown,
      className:
        'border-amber-500/25 bg-amber-500/10 text-amber-500 dark:text-amber-400',
      glow:
        'bg-amber-500/15',
      avatar:
        'from-amber-500 via-orange-500 to-amber-600',
    },

    regular: {
      label: 'Regular',
      icon: ShieldCheck,
      className:
        'border-primary/25 bg-primary/10 text-primary',
      glow:
        'bg-primary/15',
      avatar:
        'from-primary via-blue-500 to-blue-700',
    },

    free: {
      label: 'Free',
      icon: Sparkles,
      className:
        'border-border/60 bg-muted/50 text-muted-foreground',
      glow:
        'bg-muted/40',
      avatar:
        'from-slate-500 via-slate-600 to-slate-700',
    },

  }[plan] || {

    label: 'Free',
    icon: Sparkles,
    className:
      'border-border/60 bg-muted/50 text-muted-foreground',
    glow:
      'bg-muted/40',
    avatar:
      'from-slate-500 via-slate-600 to-slate-700',

  };


  const PlanIcon = planConfig.icon;


  // ==========================================================
  // CURRENCY
  // ==========================================================

  const currencyLabel =
    user.currency === 'USD'
      ? 'US Dollar (USD)'
      : 'Nigerian Naira (NGN)';


  // ==========================================================
  // STATUS
  // ==========================================================

  const statusLabel =
    user.status
      ? user.status.charAt(0).toUpperCase() +
        user.status.slice(1)
      : 'Active';


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-border/60
        bg-card
        shadow-sm
      "
    >

      {/* ======================================================
          PREMIUM BACKGROUND
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-24
          -top-28
          h-72
          w-72
          rounded-full
          bg-primary/[0.08]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-24
          h-80
          w-80
          rounded-full
          bg-blue-500/[0.07]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-primary/30
          to-transparent
        "
      />


      {/* ======================================================
          HEADER BAR
          ====================================================== */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
          border-b
          border-border/50
          px-4
          py-3
          sm:px-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            text-[11px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-muted-foreground
          "
        >

          <div
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-md
              border
              border-primary/15
              bg-primary/[0.07]
              text-primary
            "
          >

            <UserRound className="h-3.5 w-3.5" />

          </div>

          Profile Overview

        </div>


        <PlanBadge
          icon={PlanIcon}
          label={planConfig.label}
          className={planConfig.className}
        />

      </div>


      {/* ======================================================
          PROFILE CONTENT
          ====================================================== */}

      <div
        className="
          relative
          p-4
          sm:p-5
        "
      >

        {/* ====================================================
            IDENTITY
            ==================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
          "
        >

          {/* Avatar */}

          <div
            className="
              relative
              mx-auto
              shrink-0
              sm:mx-0
            "
          >

            <div
              className={`
                absolute
                -inset-2
                rounded-[1.35rem]
                opacity-70
                blur-xl
                ${planConfig.glow}
              `}
            />

            <div
              className="
                absolute
                inset-0
                rounded-2xl
                border
                border-white/20
              "
            />

            <div
              className={`
                relative
                flex
                h-[76px]
                w-[76px]
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                text-xl
                font-bold
                tracking-wide
                text-white
                shadow-xl
                ring-4
                ring-background
                ${planConfig.avatar}
              `}
            >

              {initials}

            </div>


            {/* Online indicator */}

            <div
              className="
                absolute
                -bottom-1
                -right-1
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                border-2
                border-background
                bg-emerald-500
                shadow-sm
              "
            >

              <CheckCircle2
                className="
                  h-3
                  w-3
                  text-white
                "
              />

            </div>

          </div>


          {/* Identity information */}

          <div
            className="
              min-w-0
              flex-1
              text-center
              sm:text-left
            "
          >

            <div
              className="
                flex
                flex-wrap
                items-center
                justify-center
                gap-2
                sm:justify-start
              "
            >

              <h1
                className="
                  max-w-full
                  truncate
                  text-2xl
                  font-bold
                  tracking-tight
                "
              >
                {user.fullName}
              </h1>


              <PlanBadge
                icon={PlanIcon}
                label={planConfig.label}
                className={planConfig.className}
              />

            </div>


            <p
              className="
                mt-1
                text-s
                font-medium
                text-muted-foreground
              "
            >
              @{user.username}
            </p>


            {/* Contact information */}

            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                justify-center
                gap-x-5
                gap-y-2
                sm:justify-start
              "
            >

              <ContactItem
                icon={Mail}
                value={user.email}
                iconClass="text-primary"
              />


              <ContactItem
                icon={Phone}
                value={
                  user.phoneNumber ||
                  'No phone number'
                }
                iconClass="text-emerald-500"
              />

            </div>

          </div>

        </div>


        {/* ====================================================
            ACCOUNT INFORMATION
            ==================================================== */}

        <div
          className="
            mt-5
            border-t
            border-border/50
            pt-4
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

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-muted-foreground
              "
            >
              Account Information
            </span>

            <div className="h-px flex-1 bg-border/40" />

          </div>


          <div
            className="
              grid
              gap-2
              sm:grid-cols-3
            "
          >

            <InfoItem
              icon={MapPin}
              label="Country"
              value={
                user.country ||
                user.countryCode ||
                'Not specified'
              }
              iconClass="text-blue-500"
              iconBg="bg-blue-500/10"
            />


            <InfoItem
              icon={Coins}
              label="Currency"
              value={currencyLabel}
              iconClass="text-amber-500"
              iconBg="bg-amber-500/10"
            />


            <InfoItem
              icon={ShieldCheck}
              label="Account Status"
              value={statusLabel}
              iconClass="text-emerald-500"
              iconBg="bg-emerald-500/10"
            />

          </div>

        </div>


        {/* ====================================================
            ACCOUNT STATS
            ==================================================== */}

        <div
          className="
            mt-2
            grid
            gap-2
            sm:grid-cols-3
          "
        >

          <StatItem
            icon={CalendarDays}
            label="Member Since"
            value={
              user.createdAt
                ? format(
                    new Date(user.createdAt),
                    'MMM d, yyyy',
                  )
                : '—'
            }
            iconClass="text-violet-500"
            iconBg="bg-violet-500/10"
          />


          <StatItem
            icon={Crown}
            label="Subscription"
            value={planConfig.label}
            iconClass="text-amber-500"
            iconBg="bg-amber-500/10"
          />


          <StatItem
            icon={Clock}
            label="Last Login"
            value={
              user.lastLoginAt
                ? format(
                    new Date(user.lastLoginAt),
                    'MMM d, yyyy · p',
                  )
                : 'Never'
            }
            iconClass="text-cyan-500"
            iconBg="bg-cyan-500/10"
          />

        </div>


        {/* ====================================================
            ACCOUNT ACTIONS
            ==================================================== */}

        <div
          className="
            mt-4
            border-t
            border-border/50
            pt-4
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

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-muted-foreground
              "
            >
              Account Actions
            </span>

            <div className="h-px flex-1 bg-border/40" />

          </div>


          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <EditProfileDialog
              user={user}
            />

            <ChangePasswordDialog />

            <LogoutDialog />

            <DeleteAccountDialog />

          </div>

        </div>

      </div>

    </section>
  );
}


// ============================================================
// PLAN BADGE
// ============================================================

function PlanBadge({
  icon: Icon,
  label,
  className,
}: {
  icon: typeof Crown;
  label: string;
  className: string;
}) {

  return (

    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-bold
        uppercase
        tracking-wider
        ${className}
      `}
    >

      <Icon className="h-3 w-3" />

      {label}

    </span>
  );
}


// ============================================================
// CONTACT ITEM
// ============================================================

function ContactItem({
  icon: Icon,
  value,
  iconClass,
}: {
  icon: typeof Mail;
  value: string;
  iconClass: string;
}) {

  return (

    <div
      className="
        flex
        min-w-0
        items-center
        gap-2
        text-s
        text-muted-foreground
      "
    >

      <Icon
        className={`
          h-3.5
          w-3.5
          shrink-0
          ${iconClass}
        `}
      />

      <span
        className="
          max-w-[280px]
          truncate
        "
      >
        {value}
      </span>

    </div>
  );
}


// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  icon: Icon,
  label,
  value,
  iconClass,
  iconBg,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  iconClass: string;
  iconBg: string;
}) {

  return (

    <div
      className="
        group
        flex
        min-w-0
        items-center
        gap-3
        rounded-xl
        border
        border-border/50
        bg-muted/[0.16]
        px-3
        py-2.5
        transition-all
        duration-200
        hover:border-primary/15
        hover:bg-muted/[0.25]
      "
    >

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${iconBg}
          ${iconClass}
        `}
      >

        <Icon className="h-4 w-4" />

      </div>


      <div className="min-w-0">

        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-muted-foreground
          "
        >
          {label}
        </p>


        <p
          className="
            mt-0.5
            truncate
            text-s
            font-semibold
          "
        >
          {value}
        </p>

      </div>

    </div>
  );
}


// ============================================================
// STAT ITEM
// ============================================================

function StatItem({
  icon: Icon,
  label,
  value,
  iconClass,
  iconBg,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  iconClass: string;
  iconBg: string;
}) {

  return (

    <div
      className="
        group
        flex
        min-w-0
        items-center
        gap-3
        rounded-xl
        border
        border-border/50
        bg-card/60
        px-3
        py-2.5
        transition-all
        duration-200
        hover:border-primary/15
        hover:bg-muted/[0.15]
      "
    >

      <div
        className={`
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${iconBg}
          ${iconClass}
        `}
      >

        <Icon className="h-4 w-4" />

      </div>


      <div className="min-w-0">

        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.08em]
            text-muted-foreground
          "
        >
          {label}
        </p>


        <p
          className="
            mt-0.5
            truncate
            text-s
            font-semibold
          "
        >
          {value}
        </p>

      </div>

    </div>
  );
}