'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaAt, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone, FaTag, FaUser } from 'react-icons/fa6';

import AuthShell, { AuthFeedback, authButtonClassName, authInputClassName, authSecondaryButtonClassName } from '@/components/auth/AuthShell';
import { registerUser } from '@/services/auth.service';

function getErrorMessage(error: unknown): string {
  const value = error as { response?: { data?: { message?: unknown } }; message?: string };
  const message = value?.response?.data?.message;
  if (Array.isArray(message)) return message.map(String).join(' ');
  if (typeof message === 'string' && message.trim()) return message;
  return value?.message || 'Unable to create your account. Please try again.';
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReferralCode((params.get('referralCode') ?? params.get('ref') ?? '').trim());
    setPromoCode((params.get('promoCode') ?? params.get('promo') ?? '').trim());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const normalizedName = fullName.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPhone = phoneNumber.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedUsername || !normalizedPhone || !normalizedEmail || !password) {
      setError('Complete all required fields.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      setError('Username may contain only letters, numbers and underscores.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        fullName: normalizedName,
        username: normalizedUsername,
        phoneNumber: normalizedPhone,
        email: normalizedEmail,
        password,
        ...(referralCode ? { referralCode } : {}),
        ...(promoCode ? { promoCode } : {}),
      });
      setRegisteredEmail(normalizedEmail);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  if (registeredEmail) {
    return (
      <AuthShell eyebrow="Account created" title="You’re all set" description={`A verification code has been sent to ${registeredEmail}. You can sign in now and verify later.`}>
        <div className="space-y-4">
          <AuthFeedback kind="success">Your account is ready. Sign in with your email and password to start using 2xPredict. Email verification can be completed now or later, but actions that require a verified email will remain locked until then.</AuthFeedback>
          <button type="button" className={authButtonClassName} onClick={() => router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)}>
            Verify email now <FaArrowRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={authSecondaryButtonClassName} onClick={() => router.push('/login')}>
            Continue to sign in
          </button>
          <p className="text-center text-xs leading-5 text-muted-foreground">You can verify later from your account reminder. The verification code expires after 20 minutes; check your spam folder if it is not in your inbox.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Join 2xPredict"
      description="A few details are all you need to get started."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="register-fullname" className="mb-1.5 block text-xs font-semibold">Full name</label>
          <div className="relative">
            <FaUser aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="register-fullname" name="fullName" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setError(''); }} placeholder="Your full name" className={`${authInputClassName} pl-10`} required />
          </div>
        </div>

        <div>
          <label htmlFor="register-username" className="mb-1.5 block text-xs font-semibold">Username</label>
          <div className="relative">
            <FaAt aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="register-username" name="username" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value.replace(/\s+/g, '').toLowerCase()); setError(''); }} placeholder="Choose a username" className={`${authInputClassName} pl-10`} required aria-describedby="username-help" />
          </div>
          <p id="username-help" className="mt-1 text-[10px] text-muted-foreground">Letters, numbers and underscores only.</p>
        </div>

        <div>
          <label htmlFor="register-phone" className="mb-1.5 block text-xs font-semibold">Phone number</label>
          <div className="relative">
            <FaPhone aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="register-phone" name="phoneNumber" type="tel" autoComplete="tel" inputMode="tel" value={phoneNumber} onChange={(event) => { setPhoneNumber(event.target.value); setError(''); }} placeholder="Phone number" className={`${authInputClassName} pl-10`} required />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold">Email address</label>
          <div className="relative">
            <FaEnvelope aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="register-email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="you@example.com" className={`${authInputClassName} pl-10`} required />
          </div>
        </div>

        {(referralCode || promoCode) ? (
          <div className="flex flex-wrap gap-2">
            {referralCode ? <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] text-foreground"><FaTag className="h-3 w-3 text-primary" /> Referral: <strong className="truncate">{referralCode}</strong></span> : null}
            {promoCode ? <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[11px] text-foreground"><FaTag className="h-3 w-3 text-primary" /> Promo: <strong className="truncate">{promoCode}</strong></span> : null}
          </div>
        ) : null}

        <div>
          <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold">Password</label>
          <div className="relative">
            <FaLock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="At least 6 characters" className={`${authInputClassName} pl-10 pr-11`} minLength={6} required />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">{showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}</button>
          </div>
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="mb-1.5 block text-xs font-semibold">Confirm password</label>
          <div className="relative">
            <FaLock aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input id="register-confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }} placeholder="Enter password again" className={`${authInputClassName} pl-10 pr-11`} required />
            <button type="button" onClick={() => setShowConfirmPassword((shown) => !shown)} aria-label={showConfirmPassword ? 'Hide confirmation' : 'Show confirmation'} className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">{showConfirmPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}</button>
          </div>
        </div>

        {error ? <div role="alert"><AuthFeedback kind="error">{error}</AuthFeedback></div> : null}

        <button type="submit" className={authButtonClassName} disabled={loading}>
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
          {loading ? 'Creating account…' : 'Create account'}
          {!loading ? <FaArrowRight className="h-3.5 w-3.5" /> : null}
        </button>

        <p className="px-1 text-[11px] leading-4 text-muted-foreground">Email verification is not required to sign in, but some account actions remain unavailable until you verify.</p>
      </form>
    </AuthShell>
  );
}
