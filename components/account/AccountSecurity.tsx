'use client';

import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { FaLaptop, FaLock, FaShieldHalved, FaTrash } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';
import {
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useVerifyCurrentEmailForChangeMutation,
  useVerifyNewEmailForChangeMutation,
} from '@/hooks/use-auth';
import { useGetMySessionsQuery, useLogoutAllMutation, useLogoutCurrentMutation } from '@/hooks/use-user-session';
import { useDeleteAccountMutation } from '@/hooks/use-users';
import type { UserSession } from '@/types/sessions';

const inputClass = 'mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';

type EmailStep = 'request' | 'verify-current' | 'verify-new';

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}

function dateLabel(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AccountSecurity() {
  const { user, logout, refreshUser } = useAuth();
  const sessionsQuery = useGetMySessionsQuery({ enabled: Boolean(user), staleTime: 15_000 });
  const changePassword = useChangePasswordMutation();
  const requestEmailChange = useRequestEmailChangeMutation();
  const verifyCurrentEmail = useVerifyCurrentEmailForChangeMutation();
  const verifyNewEmail = useVerifyNewEmailForChangeMutation();
  const logoutCurrent = useLogoutCurrentMutation();
  const logoutAll = useLogoutAllMutation();
  const deleteAccount = useDeleteAccountMutation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailStep, setEmailStep] = useState<EmailStep>('request');

  const sessions = sessionsQuery.data ?? [];

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Your new password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('The new passwords do not match.');
      return;
    }
    try {
      await changePassword.mutateAsync({ body: { currentPassword, newPassword } as never });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully.');
    } catch (error) {
      toast.error(messageOf(error, 'Unable to change your password.'));
    }
  }

  async function submitEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (emailStep === 'request') {
        await requestEmailChange.mutateAsync({ body: { currentPassword: emailCurrentPassword, newEmail: newEmail.trim() } as never });
        setEmailStep('verify-current');
        setVerificationCode('');
        toast.success('Verification code sent to your current email address.');
        return;
      }
      if (emailStep === 'verify-current') {
        await verifyCurrentEmail.mutateAsync({ body: { code: verificationCode.trim() } as never });
        setEmailStep('verify-new');
        setVerificationCode('');
        toast.success('Current email verified. Enter the code sent to your new address.');
        return;
      }
      await verifyNewEmail.mutateAsync({ body: { code: verificationCode.trim() } as never });
      await refreshUser();
      setEmailStep('request');
      setEmailCurrentPassword('');
      setNewEmail('');
      setVerificationCode('');
      toast.success('Email address updated successfully.');
    } catch (error) {
      toast.error(messageOf(error, 'Unable to complete the email-change step.'));
    }
  }

  async function signOutCurrentDevice() {
    try {
      await logoutCurrent.mutateAsync();
      await logout();
    } catch (error) {
      toast.error(messageOf(error, 'Unable to sign out this device.'));
    }
  }

  async function signOutAllDevices() {
    try {
      await logoutAll.mutateAsync();
      await logout();
    } catch (error) {
      toast.error(messageOf(error, 'Unable to sign out all devices.'));
    }
  }

  async function removeAccount() {
    const confirmed = window.confirm('Delete your 2xPredict account? This action will deactivate your sessions and cannot be undone from this screen.');
    if (!confirmed) return;
    try {
      await deleteAccount.mutateAsync();
      await logout();
    } catch (error) {
      toast.error(messageOf(error, 'Unable to delete your account.'));
    }
  }

  const emailBusy = requestEmailChange.isPending || verifyCurrentEmail.isPending || verifyNewEmail.isPending;

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FaLock /></span>
          <div>
            <h2 className="text-sm font-bold">Change password</h2>
            <p className="text-[10px] text-muted-foreground">Use your current password to set a new one.</p>
          </div>
        </div>
        <form onSubmit={submitPassword} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold sm:col-span-2">Current password<input className={inputClass} type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
          <label className="block text-xs font-semibold">New password<input className={inputClass} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></label>
          <label className="block text-xs font-semibold">Confirm new password<input className={inputClass} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></label>
          <div className="sm:col-span-2"><button type="submit" disabled={changePassword.isPending} className="min-h-9 rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-60">{changePassword.isPending ? 'Updating…' : 'Update password'}</button></div>
        </form>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FaShieldHalved /></span>
          <div>
            <h2 className="text-sm font-bold">Change email address</h2>
            <p className="text-[10px] text-muted-foreground">Your current and new addresses must both be verified.</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground">Current email: <span className="font-semibold text-foreground">{user?.email ?? '—'}</span></div>
        <form onSubmit={submitEmailChange} className="mt-3 grid gap-3 sm:grid-cols-2">
          {emailStep === 'request' ? (
            <>
              <label className="block text-xs font-semibold">Current password<input className={inputClass} type="password" autoComplete="current-password" value={emailCurrentPassword} onChange={(event) => setEmailCurrentPassword(event.target.value)} required /></label>
              <label className="block text-xs font-semibold">New email address<input className={inputClass} type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required /></label>
            </>
          ) : (
            <label className="block text-xs font-semibold sm:col-span-2">{emailStep === 'verify-current' ? 'Code sent to your current email' : 'Code sent to your new email'}<input className={inputClass} inputMode="numeric" autoComplete="one-time-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} required /></label>
          )}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" disabled={emailBusy} className="min-h-9 rounded-lg bg-primary px-4 py-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-60">{emailBusy ? 'Verifying…' : emailStep === 'request' ? 'Request email change' : emailStep === 'verify-current' ? 'Verify current email' : 'Verify new email'}</button>
            {emailStep !== 'request' ? <button type="button" onClick={() => { setEmailStep('request'); setVerificationCode(''); }} className="min-h-9 rounded-lg border border-border px-4 py-2 text-[11px] font-semibold">Cancel</button> : null}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FaLaptop /></span>
            <div><h2 className="text-sm font-bold">Active sessions</h2><p className="text-[10px] text-muted-foreground">Devices currently associated with your account.</p></div>
          </div>
          <button type="button" onClick={() => void sessionsQuery.refetch()} disabled={sessionsQuery.isFetching} className="rounded-lg border border-border px-3 py-2 text-[10px] font-semibold text-muted-foreground hover:bg-muted">{sessionsQuery.isFetching ? 'Refreshing…' : 'Refresh sessions'}</button>
        </div>

        {sessionsQuery.isLoading ? <p className="py-4 text-xs text-muted-foreground">Loading sessions…</p> : null}
        {sessionsQuery.isError ? <div className="py-4 text-xs text-destructive">Your sessions could not be loaded. <button type="button" onClick={() => void sessionsQuery.refetch()} className="font-semibold underline">Try again</button></div> : null}
        {!sessionsQuery.isLoading && !sessionsQuery.isError && sessions.length === 0 ? <p className="py-4 text-xs text-muted-foreground">No session records were returned.</p> : null}
        {sessions.length > 0 ? (
          <div className="mt-2 divide-y divide-border/60">
            {sessions.map((session) => {
              const isCurrent = session._id === user?.sessionId;
              const location = [session.location?.city, session.location?.country].filter(Boolean).join(', ');
              return (
                <article key={session._id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold">{session.device || session.userAgent || 'Unknown device'}</p>{isCurrent ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">THIS DEVICE</span> : null}</div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{location || session.ipAddress || 'Location unavailable'}</p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">Last active {dateLabel(session.lastActiveAt)} · Expires {dateLabel(session.expiresAt)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${session.isActive && !session.expired ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{session.isActive && !session.expired ? 'ACTIVE' : 'INACTIVE'}</span>
                </article>
              );
            })}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <button type="button" onClick={() => void signOutCurrentDevice()} disabled={logoutCurrent.isPending} className="min-h-9 rounded-lg border border-border px-3 py-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-60">{logoutCurrent.isPending ? 'Signing out…' : 'Sign out this device'}</button>
          <button type="button" onClick={() => void signOutAllDevices()} disabled={logoutAll.isPending} className="min-h-9 rounded-lg border border-border px-3 py-2 text-[10px] font-semibold hover:bg-muted disabled:opacity-60">{logoutAll.isPending ? 'Signing out…' : 'Sign out all devices'}</button>
        </div>
      </section>

      <section className="rounded-xl border border-destructive/25 bg-destructive/[0.025] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive"><FaTrash /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold">Delete account</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">The backend soft-deletes your user account and deactivates its sessions. This cannot be reversed from this page.</p>
            <button type="button" onClick={() => void removeAccount()} disabled={deleteAccount.isPending} className="mt-3 min-h-9 rounded-lg border border-destructive/30 px-3 py-2 text-[10px] font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-60">{deleteAccount.isPending ? 'Deleting account…' : 'Delete my account'}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

