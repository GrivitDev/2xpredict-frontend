'use client';

import { FaCircleUser, FaCrown, FaEnvelope, FaShieldHalved } from 'react-icons/fa6';
import type { User } from '@/types/auth';

interface ProfileHeroProps {
  user: User;
  plan: string;
}

const planLabels: Record<string, string> = {
  free: 'Free plan',
  regular: 'Regular plan',
  vip: 'VIP plan',
  premium: 'Premium plan',
};

export default function ProfileHero({ user, plan }: ProfileHeroProps) {
  const displayName = user.fullName?.trim() || user.username?.trim() || user.email;
  const initials = displayName.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
  const normalizedPlan = plan.toLowerCase();

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <FaCircleUser className="text-primary" /> My profile
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-[10px] font-semibold capitalize text-muted-foreground">
          <FaCrown className="text-amber-500" /> {planLabels[normalizedPlan] ?? `${plan} plan`}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5 sm:py-5">
        <div className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-2xl bg-primary/10 text-xl font-bold text-primary ring-1 ring-primary/15">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">{displayName}</h1>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground"><FaEnvelope className="shrink-0" /> {user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            {user.username ? <span>@{user.username}</span> : null}
            {user.country ? <span>{user.country}</span> : null}
            <span className="inline-flex items-center gap-1"><FaShieldHalved className={user.isVerified ? 'text-emerald-600' : 'text-amber-600'} /> {user.isVerified ? 'Verified account' : 'Verification pending'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
