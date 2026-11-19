'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaArrowRight, FaEnvelope } from 'react-icons/fa6';
import { useAuth } from '@/providers/auth-provider';

export default function EmailVerificationBanner() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user || user.isVerified !== false || !user.email) return null;

  const returnPath = pathname.startsWith('/verify-email') ? '/dashboard' : pathname;
  const verificationHref = `/verify-email?email=${encodeURIComponent(user.email)}&returnTo=${encodeURIComponent(returnPath)}`;

  return (
    <aside className="mx-3 mt-2 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5 sm:mx-5 sm:px-4 lg:mx-6" role="status" aria-live="polite">
      <div className="flex min-w-0 items-start gap-2.5">
        <FaEnvelope aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="min-w-0 text-xs leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground">Verify your email.</span>{' '}
          Some account actions are unavailable until your email is confirmed.
        </p>
      </div>
      <Link href={verificationHref} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 py-2 text-[11px] font-semibold text-primary-foreground transition hover:opacity-90 sm:px-3 sm:text-xs">
        Verify <FaArrowRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
