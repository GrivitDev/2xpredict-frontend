'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaArrowRight, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6';
import api from '@/lib/axios';
import AuthShell, { AuthFeedback, authButtonClassName, authInputClassName } from '@/components/auth/AuthShell';

function getErrorMessage(error: unknown): string {
  const value = error as { response?: { data?: { message?: unknown } }; message?: string };
  const message = value?.response?.data?.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  if (typeof message === 'string' && message.trim()) {
    if (message.toLowerCase().includes('expired')) return 'This reset link has expired. Request a new one to continue.';
    if (message.toLowerCase().includes('invalid token') || message.toLowerCase().includes('invalid or expired')) return 'This reset link is invalid or has expired. Request a new one to continue.';
    if (message.toLowerCase().includes('user not found')) return 'No account was found for this email address.';
    return message;
  }
  return value?.message || 'Unable to reset your password. Please try again.';
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !token) {
      setError('This reset link is incomplete. Request a new password reset link.');
      return;
    }
    if (password.length < 6) {
      setError('Your new password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', { email, token, newPassword: password });
      setSuccess(response.data?.message || 'Your password has been updated. You can now sign in.');
      setPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="Secure account recovery" title="Choose a new password" description={email ? `Resetting the password for ${email}.` : 'Use the password reset link sent to your email address.'}>
      {success ? (
        <div className="space-y-4">
          <AuthFeedback kind="success">{success}</AuthFeedback>
          <Link href="/login" className={authButtonClassName}>Continue to sign in <FaArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      ) : !email || !token ? (
        <div className="space-y-4">
          <AuthFeedback kind="error">This password reset link is missing required details or has been opened incorrectly.</AuthFeedback>
          <Link href="/forgot-password" className={authButtonClassName}>Request a new link <FaArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold">New password</label>
            <div className="relative">
              <FaLock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input id="new-password" name="newPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="At least 6 characters" minLength={6} className={`${authInputClassName} pl-10 pr-11`} required />
              <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">{showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}</button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-1.5 block text-xs font-semibold">Confirm new password</label>
            <div className="relative">
              <FaLock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input id="confirm-new-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }} placeholder="Enter it again" className={`${authInputClassName} pl-10 pr-11`} required />
              <button type="button" onClick={() => setShowConfirmPassword((shown) => !shown)} aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'} className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">{showConfirmPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}</button>
            </div>
          </div>

          {error ? <div role="alert"><AuthFeedback kind="error">{error}</AuthFeedback></div> : null}
          <p className="text-[11px] leading-4 text-muted-foreground">Use at least 6 characters. For security, your other sessions will be signed out after the password changes.</p>
          <button type="submit" className={authButtonClassName} disabled={loading}>
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
            {loading ? 'Updating password…' : 'Update password'}
            {!loading ? <FaArrowRight className="h-3.5 w-3.5" /> : null}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
