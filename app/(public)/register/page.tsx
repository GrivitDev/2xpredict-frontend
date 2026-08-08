'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, } from 'next/navigation';
import toast from 'react-hot-toast';

import { registerUser } from '@/services/auth.service';

import {
  User,
  AtSign,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Trophy,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';

export default function RegisterPage() {
  const router = useRouter();
const [referralCode, setReferralCode] = useState('');
const [promoCode, setPromoCode] = useState('');

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  setReferralCode(
    params.get('referralCode') ??
      params.get('ref') ??
      '',
  );

  setPromoCode(
    params.get('promoCode') ??
      params.get('promo') ??
      '',
  );
}, []);

const disposableEmailDomains = [
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'fakeinbox.com',
];


const validateEmail = (value: string) => {
  const cleanEmail = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


  if (!emailRegex.test(cleanEmail)) {
    return {
      valid: false,
      message: 'Please enter a valid email address.',
    };
  }


  const domain =
    cleanEmail.split('@')[1];


  if (
    disposableEmailDomains.includes(domain)
  ) {
    return {
      valid: false,
      message:
        'Disposable email addresses are not allowed.',
    };
  }


  return {
    valid: true,
    email: cleanEmail,
  };
};



const validatePhone = (value: string) => {

  const cleanPhone =
    value
      .trim()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '');


  const phoneRegex =
    /^(\+?\d{10,15})$/;


  if (!phoneRegex.test(cleanPhone)) {
    return {
      valid: false,
      message:
        'Please enter a valid phone number.',
    };
  }


  return {
    valid: true,
    phone: cleanPhone,
  };
};

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const handleRegister = async (
  e: React.FormEvent,
) => {

  e.preventDefault();


  const emailValidation =
    validateEmail(email);


  if (!emailValidation.valid) {

    toast.error(
      emailValidation.message || 'Invalid email'
    );

    return;
  }



  const phoneValidation =
    validatePhone(phoneNumber);


  if (!phoneValidation.valid) {

    toast.error(
      phoneValidation.message || 'Invalid phone number'
    );

    return;
  }



  if (password !== confirmPassword) {

    toast.error(
      'Passwords do not match.'
    );

    return;
  }



  if (password.length < 6) {

    toast.error(
      'Password must be at least 6 characters.'
    );

    return;
  }
    

if (password !== confirmPassword) {
  toast.error('Passwords do not match.');
  return;
}

if (password.length < 6) {
  toast.error('Password must be at least 6 characters.');
  return;
}


    try {
  setLoading(true);

const response = await registerUser({

  fullName:
    fullName.trim(),

  username:
    username.trim().toLowerCase(),

  phoneNumber:
    phoneValidation.phone!,

  email:
    emailValidation.email!,

  password,

  referralCode:
    referralCode.trim() || undefined,

  promoCode:
    promoCode.trim() || undefined,

});

  setSuccess(true);

  toast.success(
    'Account created successfully! Check your email for verification.',
    {
      duration: 5000,
    },
  );

  setTimeout(() => {
    router.push(
      `/verify-email?email=${encodeURIComponent(emailValidation.email!)}`,
    );
  }, 1500);

} catch (error: any) {

  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Registration failed. Please try again.';

  if (Array.isArray(message)) {

    message.forEach((msg) => {
      toast.error(msg);
    });

  } else {

    toast.error(message);

  }

} finally {

  setLoading(false);

}

};

  const fields = [
    fullName,
    username,
    phoneNumber,
    email,
    password,
    confirmPassword,
  ];

  const progress = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100,
  );

  const passwordStrength =
    password.length < 6
      ? 'Weak'
      : password.length < 10
      ? 'Medium'
      : 'Strong';

  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-12 pb-12 text-foreground">

      {/* Background */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[180px]" />

        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[180px]" />

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/5 blur-[220px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />

      </div>
<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6">

        {/* LEFT SIDE */}

        <div className="hidden flex-1 lg:block">

          <div className="max-w-xl">

            <div className="mb-4 flex justify-center">
              <Image
                src="/images/ball1.png"
                alt="Premium Football Predictions"
                width={460}
                height={170}
                className="max-w-full object-contain"
                priority
              />
            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight">
              Join
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-cyan-500 bg-clip-text text-6xl text-transparent">
                The Winning Team.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Create your account to unlock expert predictions,
              VIP tips, match analytics and live football updates.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-5">

              <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur-xl">
                <Trophy className="mb-3 h-7 w-7 text-yellow-500" />
                <h3 className="text-2xl font-bold">
                  150+
                </h3>
                <p className="text-sm text-muted-foreground">
                  Matches Analysed
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur-xl">
                <TrendingUp className="mb-3 h-7 w-7 text-primary" />
                <h3 className="text-2xl font-bold">
                  89%
                </h3>
                <p className="text-sm text-muted-foreground">
                  Accuracy
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur-xl">
                <ShieldCheck className="mb-3 h-7 w-7 text-cyan-500" />
                <h3 className="text-2xl font-bold">
                  24/7
                </h3>
                <p className="text-sm text-muted-foreground">
                  Live Updates
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* REGISTER */}

        <div className="flex flex-1 justify-center lg:justify-end">

          <form
            onSubmit={handleRegister}
            className="w-full max-w-md rounded-3xl border border-border bg-card/70 p-10 shadow-2xl backdrop-blur-2xl"
          >

            <div className="mb-8 text-center">

              <div className="mb-5 flex justify-center">
                <Image
                  src="/logo1.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                  priority
                />
              </div>

              <h2 className="text-4xl font-black">
                Create Account
              </h2>

              <p className="mt-2 text-muted-foreground">
                Create your account to continue.
              </p>

            </div>

            {/* FULL NAME */}

            <div className="relative mb-5">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              />
            </div>

            {/* USERNAME */}

            <div className="relative mb-5">
              <AtSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              />
            </div>

            {/* PHONE */}

            <div className="relative mb-5">
              <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(
                    e.target.value
                      .replace(/[^\d+]/g, '')
                  )
                }
                className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              />
            </div>

            {/* EMAIL */}

            <div className="relative mb-5">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                        .trimStart()
                        .replace(/\s+/g, '')
                        .toLowerCase()
                    )
                  }
                className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              />
            </div>
                          {/* REFERRAL CODE */}

              {referralCode && (
                <div className="relative mb-5">

                  <AtSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />

                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="
                      h-14
                      w-full
                      rounded-xl
                      border
                      border-primary/30
                      bg-primary/5
                      pl-12
                      pr-32
                      text-foreground
                      outline-none
                      cursor-not-allowed
                    "
                  />

                  <span className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    font-semibold
                    text-primary
                  ">
                    Referral Applied
                  </span>

                </div>
              )}


              {/* PROMO CODE */}

              {promoCode && (
                <div className="relative mb-5">

                  <Trophy className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500" />

                  <input
                    type="text"
                    value={promoCode}
                    readOnly
                    className="
                      h-14
                      w-full
                      rounded-xl
                      border
                      border-cyan-500/30
                      bg-cyan-500/5
                      pl-12
                      pr-4
                      text-foreground
                      outline-none
                      cursor-not-allowed
                    "
                  />

                  <span className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    font-semibold
                    text-cyan-500
                  ">
                    Promo Applied
                  </span>

                </div>
              )}

                        {/* PASSWORD */}

            <div className="relative mb-3">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-14 text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {password && (
              <div className="mb-5">

                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Password Strength
                  </span>

                  <span
                    className={
                      passwordStrength === 'Strong'
                        ? 'font-semibold text-green-500'
                        : passwordStrength === 'Medium'
                        ? 'font-semibold text-yellow-500'
                        : 'font-semibold text-red-500'
                    }
                  >
                    {passwordStrength}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">

                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength === 'Strong'
                        ? 'w-full bg-green-500'
                        : passwordStrength === 'Medium'
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-1/3 bg-red-500'
                    }`}
                  />

                </div>

              </div>
            )}

            {/* CONFIRM PASSWORD */}

            <div className="relative mb-2">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-14 text-foreground placeholder:text-muted-foreground outline-none transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="mb-5 text-sm font-medium text-destructive">
                Passwords do not match.
              </p>
            )}

            {confirmPassword && password === confirmPassword && (
              <p className="mb-5 text-sm font-medium text-green-500">
                ✓ Passwords match.
              </p>
            )}


            {/* PROFILE COMPLETION */}

            <div className="mb-8">

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Profile Completion
                </span>

                <span className="font-medium">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">

                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />

              </div>

            </div>

            {success ? (

  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">

    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-500">
      ✓
    </div>

    <h3 className="font-bold text-green-500">
      Account Created
    </h3>

    <p className="mt-2 text-sm text-muted-foreground">
      We sent a verification code to your email.
    </p>

  </div>

) : (

  <button
    type="submit"
    disabled={loading || password !== confirmPassword}
    className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary text-lg font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:opacity-90 disabled:pointer-events-none disabled:opacity-60"
  >

    {loading ? (

      <>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />

        Creating Account...
      </>

    ) : (

      <>
        Create Account
        <ArrowRight size={20} />
      </>

    )}

  </button>

)}

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary transition hover:opacity-80"
              >
                Login
              </Link>
            </p>

          </form>

        </div>

      </div>

    </main>
  );
}