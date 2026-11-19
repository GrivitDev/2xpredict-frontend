'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight, FaEnvelope } from 'react-icons/fa6';
import api from '@/lib/axios';
import AuthShell, { AuthFeedback, authButtonClassName, authInputClassName } from '@/components/auth/AuthShell';

function getErrorMessage(error: unknown): string {
  const value = error as { response?: { data?: { message?: unknown } }; message?: string };
  const message = value?.response?.data?.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  if (typeof message === 'string' && message.trim()) return message;
  return value?.message || 'Unable to send a reset link. Please try again.';
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/request-password-reset', { email: normalizedEmail });
      setSuccess(response.data?.message || 'Password reset instructions have been sent.');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email. When an account matches, we’ll send a secure reset link."
      footer={<Link href="/login" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"><FaArrowLeft className="h-3 w-3" /> Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reset-request-email" className="mb-1.5 block text-xs font-semibold">Email address</label>
          <div className="relative">
            <FaEnvelope aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="reset-request-email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); setSuccess(''); }} placeholder="you@example.com" className={`${authInputClassName} pl-10`} required />
          </div>
        </div>

        {error ? <div role="alert"><AuthFeedback kind="error">{error}</AuthFeedback></div> : null}
        {success ? <div role="status"><AuthFeedback kind="success">{success}<p className="mt-1 text-xs opacity-85">Check your inbox and spam folder. When an account matches, the reset link expires after 30 minutes.</p></AuthFeedback></div> : null}

        <button type="submit" className={authButtonClassName} disabled={loading}>
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
          {loading ? 'Sending link…' : success ? 'Send another link' : 'Send reset link'}
          {!loading ? <FaArrowRight className="h-3.5 w-3.5" /> : null}
        </button>
      </form>
    </AuthShell>
  );
}
