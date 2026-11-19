'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaCheck, FaEnvelope, FaRotate } from 'react-icons/fa6';

import { resendOtp, verifyOtp } from '@/services/auth.service';
import { useAuth } from '@/providers/auth-provider';
import { AuthFeedback, authButtonClassName, authInputClassName, authSecondaryButtonClassName } from '@/components/auth/AuthShell';

interface Props {
  email: string;
  returnTo?: string;
  onClose?: () => void;
  onResend?: () => void;
  onVerified?: () => void;
}

function errorMessage(error: unknown, fallback: string): string {
  const value = error as { response?: { data?: { message?: unknown } }; message?: string };
  const message = value?.response?.data?.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  if (typeof message === 'string' && message.trim()) return message;
  return value?.message || fallback;
}

function safeReturnPath(value?: string) {
  const path = value?.trim() ?? '';
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null;

  try {
    const safeOrigin = 'https://2xpredict.local';
    const target = new URL(path, safeOrigin);
    return target.origin === safeOrigin
      ? `${target.pathname}${target.search}${target.hash}`
      : null;
  } catch {
    return null;
  }
}

export default function VerifyOtpModal({ email, returnTo, onResend, onVerified }: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      inputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({ email, code });
      setSuccess(response?.message || 'Your email has been verified.');
      onVerified?.();

      if (user && user.email?.toLowerCase() === email.toLowerCase()) {
        // Verification has already succeeded; refresh failure should not undo that result.
        try {
          await refreshUser();
        } catch {
          // The persistent verification status banner remains available if refresh fails.
        }
      }

      const nextPath = safeReturnPath(returnTo);
      window.setTimeout(() => {
        if (user && user.email?.toLowerCase() === email.toLowerCase()) {
          router.replace(nextPath || '/dashboard');
        } else {
          router.replace('/login?verified=1');
        }
      }, 900);
    } catch (verifyError) {
      setError(errorMessage(verifyError, 'Unable to verify this code. Check it and try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setSuccess('');
    try {
      setResending(true);
      const response = await resendOtp(email);
      setSuccess(response?.message || 'A new verification code has been sent.');
      setCode('');
      setCountdown(60);
      onResend?.();
      inputRef.current?.focus();
    } catch (resendError) {
      const message = errorMessage(resendError, 'Unable to send another code. Please try again.');
      if (message.toLowerCase().includes('wait') || message.toLowerCase().includes('cooldown')) {
        setCountdown(60);
      }
      setError(message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FaEnvelope className="h-4 w-4" /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Check your inbox</p>
          <p className="mt-0.5 break-all text-xs leading-5 text-muted-foreground">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>. The code is valid for 20 minutes.</p>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-3" noValidate>
        <div>
          <label htmlFor="verification-code" className="mb-1.5 block text-xs font-semibold">Verification code</label>
          <input
            ref={inputRef}
            id="verification-code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            placeholder="000000"
            className={`${authInputClassName} h-14 text-center text-xl font-bold tracking-[0.45em]`}
            aria-describedby="verification-code-help"
            required
          />
          <p id="verification-code-help" className="mt-1 text-[11px] text-muted-foreground">You can paste the entire code into this field.</p>
        </div>

        {error ? <div role="alert"><AuthFeedback kind="error">{error}</AuthFeedback></div> : null}
        {success ? <div role="status"><AuthFeedback kind="success">{success}</AuthFeedback></div> : null}

        <button type="submit" className={authButtonClassName} disabled={loading || code.length !== 6 || !!success}>
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
          {loading ? 'Verifying…' : success ? 'Email verified' : 'Verify email'}
          {!loading && success ? <FaCheck className="h-3.5 w-3.5" /> : !loading ? <FaArrowRight className="h-3.5 w-3.5" /> : null}
        </button>
      </form>

      <button type="button" onClick={handleResend} className={authSecondaryButtonClassName} disabled={resending || countdown > 0 || !!success}>
        {resending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <FaRotate className="h-3 w-3" />}
        {resending ? 'Sending code…' : countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
      </button>

      <p className="text-center text-[11px] leading-4 text-muted-foreground">No email yet? Check your spam or junk folder before requesting another code.</p>
      <p className="text-center text-xs text-muted-foreground"><Link href="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
    </div>
  );
}
