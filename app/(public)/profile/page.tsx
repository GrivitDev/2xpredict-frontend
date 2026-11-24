'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  FaCircleUser,
  FaCreditCard,
  FaGift,
  FaShieldHalved,
  FaSliders,
  FaUser,
  FaWallet,
} from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { useAuth } from '@/providers/auth-provider';
import { useGetStatusQuery } from '@/hooks/use-subscriptions';
function ProfilePanelLoading() {
  return (
    <div aria-busy="true" className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
      <div className="h-5 w-36 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-muted/70" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-muted/70" />
      <div className="h-24 w-full animate-pulse rounded-lg bg-muted/70" />
    </div>
  );
}

// Account sections are loaded only when the member opens that tab.
const AccountBillingPanel = dynamic(() => import('@/components/account/AccountBillingPanel'), { loading: () => <ProfilePanelLoading /> });
const AccountPersonalDetails = dynamic(() => import('@/components/account/AccountPersonalDetails'), { loading: () => <ProfilePanelLoading /> });
const AccountRewardsReferrals = dynamic(() => import('@/components/account/AccountRewardsReferrals'), { loading: () => <ProfilePanelLoading /> });
const AccountBetLabWallet = dynamic(() => import('@/components/account/AccountBetLabWallet'), { loading: () => <ProfilePanelLoading /> });
const AccountSecurity = dynamic(() => import('@/components/account/AccountSecurity'), { loading: () => <ProfilePanelLoading /> });
const AccountNotificationPreferences = dynamic(() => import('@/components/account/AccountNotificationPreferences'), { loading: () => <ProfilePanelLoading /> });

type ProfileTab =
  | 'overview'
  | 'personal'
  | 'billing'
  | 'rewards'
  | 'wallet'
  | 'security'
  | 'preferences';

type TabDefinition = {
  id: ProfileTab;
  label: string;
  description: string;
  hash: string;
  icon: IconType;
};

const tabs: TabDefinition[] = [
  { id: 'overview', label: 'Overview', description: 'Your account at a glance', hash: 'overview', icon: FaCircleUser },
  { id: 'personal', label: 'Personal details', description: 'Your registered information', hash: 'personal-details', icon: FaUser },
  { id: 'billing', label: 'Subscription & payments', description: 'Plan access and transaction history', hash: 'account-billing', icon: FaCreditCard },
  { id: 'rewards', label: 'Rewards & referrals', description: 'Bonuses and referral activity', hash: 'rewards', icon: FaGift },
  { id: 'wallet', label: 'Bet Lab wallet', description: 'Virtual points and wallet ledger', hash: 'wallet', icon: FaWallet },
  { id: 'security', label: 'Security', description: 'Password, email and sessions', hash: 'security', icon: FaShieldHalved },
  { id: 'preferences', label: 'Preferences', description: 'Email notification settings', hash: 'preferences', icon: FaSliders },
];

function tabFromHash(hash: string): ProfileTab {
  const normalized = hash.replace(/^#/, '').toLowerCase();
  if (['account-billing', 'subscriptions', 'purchases'].includes(normalized)) return 'billing';
  if (['rewards', 'referrals', 'bonuses'].includes(normalized)) return 'rewards';
  if (normalized === 'personal-details') return 'personal';
  if (normalized === 'wallet') return 'wallet';
  if (normalized === 'security') return 'security';
  if (normalized === 'preferences' || normalized === 'settings') return 'preferences';
  return 'overview';
}

function getInitials(fullName?: string | null, username?: string | null, email?: string | null): string {
  const source = fullName?.trim() || username?.trim() || email?.trim() || 'User';
  const words = source.split(/[\s@._-]+/).filter(Boolean);
  if (words.length > 1) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-4 px-3 py-5 sm:px-5 lg:px-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-2xl border border-border/60 bg-card" />
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="h-80 animate-pulse rounded-xl border border-border/60 bg-card" />
        <div className="h-80 animate-pulse rounded-xl border border-border/60 bg-card" />
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const subscription = useGetStatusQuery({ enabled: Boolean(user) });

  const displayName = useMemo(
    () => user?.fullName?.trim() || user?.username?.trim() || user?.email || '2xPredict member',
    [user?.fullName, user?.username, user?.email],
  );
  const initials = useMemo(
    () => getInitials(user?.fullName, user?.username, user?.email),
    [user?.fullName, user?.username, user?.email],
  );
  const currentPlan = subscription.data?.plan ?? 'free';

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login?next=%2Fprofile');
  }, [loading, user, router]);

  useEffect(() => {
    const syncTab = () => setActiveTab(tabFromHash(window.location.hash));
    syncTab();
    window.addEventListener('hashchange', syncTab);
    return () => window.removeEventListener('hashchange', syncTab);
  }, []);

  function selectTab(tabId: ProfileTab) {
    const tab = tabs.find((item) => item.id === tabId);
    if (!tab) return;
    setActiveTab(tab.id);
    window.history.replaceState(null, '', `${window.location.pathname}#${tab.hash}`);
    window.setTimeout(() => {
      document.getElementById('profile-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  if (loading) return <ProfileLoading />;
  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-4 px-3 py-5 pb-28 sm:px-5 sm:py-7 lg:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Your account</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Profile</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Manage your account, access, payments and preferences in one place.</p>
        </div>
        <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-[10px] font-semibold capitalize text-muted-foreground">
          {currentPlan} plan
        </span>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/10 to-muted text-2xl font-extrabold tracking-tight text-primary shadow-inner sm:h-[84px] sm:w-[84px] sm:text-3xl">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="max-w-full truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">{displayName}</h2>
              <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${user.isVerified ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                {user.isVerified ? 'VERIFIED' : 'VERIFICATION PENDING'}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              {user.username ? <span>@{user.username}</span> : null}
              {user.country ? <span>{user.country}</span> : null}
              {user.currency ? <span>{user.currency}</span> : null}
              <span className="capitalize">{currentPlan} membership</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => selectTab('personal')}
            className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/80 px-3 py-2 text-[11px] font-semibold text-foreground transition hover:bg-muted"
          >
            Edit personal details
          </button>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Profile sections" className="min-w-0 rounded-xl border border-border/70 bg-card p-1.5 lg:h-fit lg:sticky lg:top-24">
          <div className="flex gap-1 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  aria-pressed={active}
                  onClick={() => selectTab(tab.id)}
                  className={`flex min-h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left transition lg:w-full ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap text-[11px] font-semibold lg:whitespace-normal">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <section id="profile-content" className="min-w-0 scroll-mt-24">
          {activeTab === 'overview' ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Account overview</p>
                <h2 className="mt-1 text-base font-bold tracking-tight">Welcome back, {displayName.split(' ')[0]}</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">Your account information, subscription access, payment records, rewards and security controls are organised here.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <OverviewCard label="Membership" value={`${currentPlan.charAt(0).toUpperCase()}${currentPlan.slice(1)}`} detail="Current subscription plan" />
                  <OverviewCard label="Email status" value={user.isVerified ? 'Verified' : 'Pending'} detail={user.isVerified ? 'Email verification complete' : 'Some account actions may require verification'} />
                  <OverviewCard label="Account currency" value={user.currency ?? '—'} detail="Currency currently saved to your account" />
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">Account management</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Go directly to the information you need.</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {tabs.filter((tab) => tab.id !== 'overview').map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button key={tab.id} type="button" onClick={() => selectTab(tab.id)} className="group flex min-h-[66px] items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 text-left transition hover:border-primary/30 hover:bg-muted/50">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-foreground">{tab.label}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">{tab.description}</span></span>
                        <span className="text-xs text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">›</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'personal' ? <AccountPersonalDetails /> : null}
          {activeTab === 'billing' ? <AccountBillingPanel enabled={Boolean(user)} /> : null}
          {activeTab === 'rewards' ? <AccountRewardsReferrals /> : null}
          {activeTab === 'wallet' ? <AccountBetLabWallet /> : null}
          {activeTab === 'security' ? <AccountSecurity /> : null}
          {activeTab === 'preferences' ? <AccountNotificationPreferences /> : null}
        </section>
      </div>
    </main>
  );
}

function OverviewCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-lg border border-border/60 bg-background/75 px-3 py-3">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold capitalize text-foreground">{value}</p>
      <p className="mt-0.5 text-[9px] text-muted-foreground">{detail}</p>
    </article>
  );
}
