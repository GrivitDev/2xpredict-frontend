'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaCheck, FaEnvelope } from 'react-icons/fa6';
import VerifyOtpModal from '@/components/VerifyOtpModal';
import AuthShell, { authButtonClassName } from '@/components/auth/AuthShell';
import { useAuth } from '@/providers/auth-provider';

function getSafeReturnPath(value: string): string | undefined {
  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return undefined;

  try {
    const safeOrigin = 'https://2xpredict.local';
    const target = new URL(path, safeOrigin);
    return target.origin === safeOrigin ? `${target.pathname}${target.search}${target.hash}` : undefined;
  } catch {
    return undefined;
  }
}

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const queryEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const email = user?.email?.trim().toLowerCase() || queryEmail;
  const requestedReturnTo = searchParams.get('returnTo') || '';
  const returnTo = getSafeReturnPath(requestedReturnTo);

  if (loading) {
    return <div className="flex min-h-[100svh] items-center justify-center bg-background"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (user?.isVerified === true) {
    return (
      <AuthShell eyebrow="Email status" title="Your email is verified" description="Your account is ready for email-verified actions.">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <FaCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0"><p className="text-sm font-semibold">Verified account</p><p className="break-all text-xs text-muted-foreground">{email}</p></div>
          </div>
          <Link href={returnTo || '/dashboard'} className={authButtonClassName}>Continue to 2xPredict</Link>
        </div>
      </AuthShell>
    );
  }

  if (!email) {
    return (
      <AuthShell eyebrow="Email verification" title="Verify your email" description="Sign in first to verify the email address connected to your account, or open the verification link sent after registration.">
        <Link href="/login" className={authButtonClassName}>Sign in to continue</Link>
        <p className="mt-4 text-center text-xs text-muted-foreground">Need an account? <Link href="/register" className="font-semibold text-primary hover:underline">Create one</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Email verification" title="Confirm your email" description="This is a one-time step to unlock the account actions that require a verified email.">
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5 text-xs text-muted-foreground">
        <FaEnvelope className="h-4 w-4 shrink-0 text-primary" />
        <span>You can keep using the platform while your email is unverified.</span>
      </div>
      <VerifyOtpModal email={email} returnTo={returnTo} />
    </AuthShell>
  );
}
