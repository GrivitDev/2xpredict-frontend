'use client';

import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { FaCircleInfo, FaFloppyDisk, FaRotate } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/hooks/use-users';
import type { UserProfile, UpdateProfilePayload } from '@/types/users';

const fieldClass = 'mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';

export default function AccountPersonalDetails() {
  const { user, refreshUser } = useAuth();
  const profileQuery = useGetProfileQuery<Partial<UserProfile>>({ enabled: Boolean(user), staleTime: 30_000 });
  const updateProfile = useUpdateProfileMutation();
  const profile = (profileQuery.data ?? user ?? {}) as Partial<UserProfile>;

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setFullName(String(profile.fullName ?? ''));
    setUsername(String(profile.username ?? ''));
    setPhoneNumber(String(profile.phoneNumber ?? ''));
  }, [profile.fullName, profile.username, profile.phoneNumber]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: UpdateProfilePayload = {
      fullName: fullName.trim(),
      username: username.trim(),
      phoneNumber: phoneNumber.trim(),
    };

    if (!payload.fullName) {
      toast.error('Enter your full name.');
      return;
    }

    try {
      await updateProfile.mutateAsync({ body: payload } as never);
      await Promise.all([profileQuery.refetch(), refreshUser()]);
      toast.success('Personal details updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update your personal details.');
    }
  }

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent">Your account</p>
            <h2 className="mt-1 text-base font-bold">Personal information</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Update the details supported by your 2xPredict account.</p>
          </div>
          <button type="button" onClick={() => void profileQuery.refetch()} disabled={profileQuery.isFetching} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50">
            <FaRotate className={profileQuery.isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {profileQuery.isError ? (
          <div role="alert" className="mt-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
            Your latest profile details could not be loaded. The account information currently available in your session is shown where possible.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-foreground">
              Full name
              <input className={fieldClass} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={100} required />
            </label>
            <label className="block text-xs font-semibold text-foreground">
              Username
              <input className={fieldClass} autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={40} />
            </label>
            <label className="block text-xs font-semibold text-foreground sm:col-span-2">
              Phone number
              <input className={fieldClass} type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} maxLength={30} />
            </label>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/35 p-3">
            <div className="flex items-start gap-2">
              <FaCircleInfo className="mt-0.5 shrink-0 text-brand-accent" />
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3">
                <ReadOnlyField label="Email address" value={String(profile.email ?? user?.email ?? '—')} />
                <ReadOnlyField label="Country" value={String(profile.country ?? user?.country ?? '—')} />
                <ReadOnlyField label="Account currency" value={String(profile.currency ?? user?.currency ?? '—')} />
              </div>
            </div>
            <p className="mt-2 text-[9px] leading-4 text-muted-foreground">Email changes are verified through Security. Country and currency are shown from your account record and are not editable through the current user-profile endpoint.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-[10px] text-muted-foreground">Only full name, username and phone number are editable here.</p>
            <button type="submit" disabled={updateProfile.isPending || profileQuery.isFetching} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              <FaFloppyDisk /> {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <h3 className="text-sm font-bold">Profile identity</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Your account identity uses your initials. No profile-photo upload is included.</p>
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/15 to-muted text-lg font-extrabold text-brand-accent">
            {getInitials(fullName, username, String(profile.email ?? user?.email ?? ''))}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{fullName.trim() || username.trim() || profile.email || user?.email || '2xPredict member'}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Initials update automatically when your name or username changes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-all text-[11px] font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

function getInitials(fullName: string, username: string, email: string): string {
  const source = fullName.trim() || username.trim() || email.trim() || 'User';
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

