'use client';

import {
  CalendarDays,
  Clock,
  Crown,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';

import { format } from 'date-fns';

import { DashboardCard } from '@/components/dashboard/shared/DashboardCard';
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge';

import type { User } from '@/types/user';

interface Props {
  user: User;
  plan: 'free' | 'regular' | 'vip';
}

export default function ProfileHero({
  user,
  plan,
}: Props) {

  const initials =
    user.fullName
      .split(' ')
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (

    <DashboardCard
      className="
        relative
        overflow-hidden
        border-border/60
        bg-gradient-to-br
        from-background
        via-background
        to-primary/5
        p-6
        lg:p-8
      "
    >

      {/* Background */}

      <div
        className="
          absolute
          -left-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-violet-500/10
          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-24
          -right-24
          h-72
          w-72
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "
      />

      <div className="relative">

        {/* Status */}

        <div className="flex justify-end">

          <StatusBadge
            status={user.status}
          />

        </div>

        {/* Hero */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
          "
        >

          {/* Avatar */}

          <div
            className="
              relative
              mx-auto
              lg:mx-0
            "
          >

            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-gradient-to-r
                from-violet-500
                via-blue-500
                to-cyan-500
                blur-xl
                opacity-50
              "
            />

            <div
              className="
                relative
                flex
                h-28
                w-28
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-violet-600
                via-blue-600
                to-cyan-500
                text-4xl
                font-bold
                text-white
                shadow-2xl
                ring-4
                ring-background
              "
            >

              {initials}

            </div>

          </div>

          {/* Info */}

          <div className="flex-1 text-center lg:text-left">

            <div
              className="
                mb-2
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                bg-muted/40
                px-3
                py-1
                text-xs
                font-medium
              "
            >

              <Sparkles className="h-3.5 w-3.5 text-primary" />

              Welcome back

            </div>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                lg:text-4xl
              "
            >

              {user.fullName}

            </h1>

            <p
              className="
                mt-1
                text-muted-foreground
              "
            >

              @{user.username}

            </p>

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
              "
            >

              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                    text-blue-500
                  "
                >

                  <Mail className="h-5 w-5" />

                </div>

                <div className="min-w-0">

                  <p className="text-xs text-muted-foreground">

                    Email

                  </p>

                  <p className="truncate font-medium">

                    {user.email}

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500/10
                    text-emerald-500
                  "
                >

                  <Phone className="h-5 w-5" />

                </div>

                <div>

                  <p className="text-xs text-muted-foreground">

                    Phone

                  </p>

                  <p className="font-medium">

                    {user.phoneNumber || 'N/A'}

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Stats */}

        <div
          className="
            mt-8
            grid
            gap-4
            md:grid-cols-3
          "
        >

          <div
            className="
              rounded-2xl
              border
              bg-muted/30
              p-5
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <div className="mb-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-500/10
                  text-violet-500
                "

              >

                <CalendarDays className="h-5 w-5" />

              </div>

              <span className="text-sm text-muted-foreground">

                Member Since

              </span>

            </div>

            <p className="font-semibold">

              {format(
                new Date(user.createdAt),
                'PPP',
              )}

            </p>

          </div>

          <div
            className="
              rounded-2xl
              border
              bg-muted/30
              p-5
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <div className="mb-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-500/10
                  text-amber-500
                "

              >

                <Crown className="h-5 w-5" />

              </div>

              <span className="text-sm text-muted-foreground">

                Subscription

              </span>

            </div>

            <StatusBadge status={plan} />

          </div>

          <div
            className="
              rounded-2xl
              border
              bg-muted/30
              p-5
              transition-all
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <div className="mb-4 flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-500/10
                  text-cyan-500
                "

              >

                <Clock className="h-5 w-5" />

              </div>

              <span className="text-sm text-muted-foreground">

                Last Login

              </span>

            </div>

            <p className="font-semibold">

              {user.lastLoginAt
                ? format(
                    new Date(user.lastLoginAt),
                    'PPP p',
                  )
                : 'Never'}

            </p>

          </div>

        </div>

      </div>

    </DashboardCard>

  );

}