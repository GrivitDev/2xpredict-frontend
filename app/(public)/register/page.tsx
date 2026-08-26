'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [referralCode, setReferralCode] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* ======================================== */
  /* REFERRAL / PROMO PARAMETERS */
  /* ======================================== */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

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

  /* ======================================== */
  /* EMAIL VALIDATION */
  /* ======================================== */

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
        message:
          'Please enter a valid email address.',
      };
    }

    const domain = cleanEmail.split('@')[1];

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

  /* ======================================== */
  /* PHONE VALIDATION */
  /* ======================================== */

  const validatePhone = (value: string) => {
    const cleanPhone = value
      .trim()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '');

    const phoneRegex = /^\+?\d{10,15}$/;

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

  /* ======================================== */
  /* REGISTER */
  /* ======================================== */

  const handleRegister = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const emailValidation =
      validateEmail(email);

    if (!emailValidation.valid) {
      toast.error(
        emailValidation.message ||
          'Invalid email',
      );

      return;
    }

    const phoneValidation =
      validatePhone(phoneNumber);

    if (!phoneValidation.valid) {
      toast.error(
        phoneValidation.message ||
          'Invalid phone number',
      );

      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        'Passwords do not match.',
      );

      return;
    }

    if (password.length < 6) {
      toast.error(
        'Password must be at least 6 characters.',
      );

      return;
    }

    try {
      setLoading(true);

      await registerUser({
        fullName: fullName.trim(),
        username: username
          .trim()
          .toLowerCase(),

        phoneNumber:
          phoneValidation.phone!,

        email:
          emailValidation.email!,

        password,

        referralCode:
          referralCode.trim() ||
          undefined,

        promoCode:
          promoCode.trim() ||
          undefined,
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
          `/verify-email?email=${encodeURIComponent(
            emailValidation.email!,
          )}`,
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

  /* ======================================== */
  /* PROFILE PROGRESS */
  /* ======================================== */

  const fields = [
    fullName,
    username,
    phoneNumber,
    email,
    password,
    confirmPassword,
  ];

  const progress = Math.round(
    (fields.filter(Boolean).length /
      fields.length) *
      100,
  );

  /* ======================================== */
  /* PASSWORD STRENGTH */
  /* ======================================== */

  const passwordStrength =
    password.length < 6
      ? 'Weak'
      : password.length < 10
        ? 'Medium'
        : 'Strong';

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-background
        text-foreground
      "
    >
      {/* ======================================== */}
      {/* LIGHTWEIGHT BACKGROUND */}
      {/* ======================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -left-32
            -top-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-primary/10
          "
        />

        <div
          className="
            absolute
            -bottom-32
            -right-32
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-500/5
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-transparent
            via-background/20
            to-background
          "
        />
      </div>

      {/* ======================================== */}
      {/* MAIN */}
      {/* ======================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          max-w-6xl
          items-center
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            grid
            w-full
            items-center
            gap-6
            lg:grid-cols-[1fr_430px]
            lg:gap-10
          "
        >
          {/* ======================================== */}
          {/* LEFT SIDE */}
          {/* ======================================== */}

          <div className="hidden lg:block">
            <div className="relative max-w-lg">

              {/* LABEL */}

              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    h-px
                    w-10
                    bg-primary
                  "
                />

                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.2em]
                    text-primary
                  "
                >
                  Join the Community
                </span>
              </div>

              {/* FOOTBALL IMAGE */}

              <div className="mb-1">
                <Image
                  src="/images/noder.png"
                  alt="Premium Football Predictions"
                  width={460}
                  height={170}
                  className="
                    h-auto
                    max-w-[300px]
                    object-contain
                  "
                  priority
                />
              </div>

              {/* TITLE */}

              <h1
                className="
                  text-4xl
                  font-black
                  leading-[0.95]
                  tracking-tight
                "
              >
                Join
                <br />

                <span
                  className="
                    bg-gradient-to-r
                    from-primary
                    via-primary
                    to-cyan-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  The Winning Team.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                Create your account and get access
                to football predictions, VIP tips,
                match analytics and live updates.
              </p>

              {/* ======================================== */}
              {/* BENEFITS */}
              {/* ======================================== */}

              <div
                className="
                  mt-6
                  grid
                  max-w-md
                  grid-cols-3
                  gap-2
                "
              >
                <StatCard
                  icon={<Trophy />}
                  value="150+"
                  label="Matches"
                />

                <StatCard
                  icon={<TrendingUp />}
                  value="89%"
                  label="Accuracy"
                />

                <StatCard
                  icon={<ShieldCheck />}
                  value="24/7"
                  label="Updates"
                />
              </div>

              {/* TRUST LINE */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-muted-foreground
                "
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />

                Built for football fans who want
                better information.
              </div>
            </div>
          </div>

          {/* ======================================== */}
          {/* REGISTER CARD */}
          {/* ======================================== */}

          <div className="flex justify-center">
            <form
              onSubmit={handleRegister}
              className="
                w-full
                max-w-[430px]
                rounded-2xl
                border
                border-border/70
                bg-card
                p-5
                shadow-2xl
                sm:p-6
              "
            >
              {/* ======================================== */}
              {/* HEADER */}
              {/* ======================================== */}

              <div className="mb-5 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                  "
                >
                  <Image
                    src="/logo.png"
                    alt="2xPredict"
                    width={52}
                    height={52}
                    className="
                      h-[52px]
                      w-[52px]
                      object-contain
                    "
                    priority
                  />
                </div>

                <div
                  className="
                    mb-1
                    inline-flex
                    items-center
                    gap-1.5
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-primary
                  "
                >
                  <Sparkles className="h-3 w-3" />

                  Create Your Account
                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  Join 2xPredict
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Create your account to get
                  started.
                </p>
              </div>

              {/* ======================================== */}
              {/* FULL NAME */}
              {/* ======================================== */}

              <InputField
                icon={<User />}
                placeholder="Full Name"
                value={fullName}
                onChange={setFullName}
              />

              {/* ======================================== */}
              {/* USERNAME */}
              {/* ======================================== */}

              <InputField
                icon={<AtSign />}
                placeholder="Username"
                value={username}
                onChange={(value) =>
                  setUsername(
                    value
                      .replace(/\s+/g, '')
                      .toLowerCase(),
                  )
                }
              />

              {/* ======================================== */}
              {/* PHONE */}
              {/* ======================================== */}

              <InputField
                icon={<Phone />}
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(value) =>
                  setPhoneNumber(
                    value.replace(
                      /[^\d+]/g,
                      '',
                    ),
                  )
                }
              />

              {/* ======================================== */}
              {/* EMAIL */}
              {/* ======================================== */}

              <InputField
                icon={<Mail />}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(value) =>
                  setEmail(
                    value
                      .trimStart()
                      .replace(/\s+/g, '')
                      .toLowerCase(),
                  )
                }
              />

              {/* ======================================== */}
              {/* REFERRAL */}
              {/* ======================================== */}

              {referralCode && (
                <CodeField
                  icon={<AtSign />}
                  value={referralCode}
                  label="Referral Applied"
                  variant="primary"
                />
              )}

              {/* ======================================== */}
              {/* PROMO */}
              {/* ======================================== */}

              {promoCode && (
                <CodeField
                  icon={<Trophy />}
                  value={promoCode}
                  label="Promo Applied"
                  variant="cyan"
                />
              )}

              {/* ======================================== */}
              {/* PASSWORD */}
              {/* ======================================== */}

              <PasswordField
                value={password}
                placeholder="Password"
                visible={showPassword}
                onToggle={() =>
                  setShowPassword(
                    !showPassword,
                  )
                }
                onChange={setPassword}
              />

              {/* ======================================== */}
              {/* PASSWORD STRENGTH */}
              {/* ======================================== */}

              {password && (
                <div className="mb-3">
                  <div
                    className="
                      mb-1.5
                      flex
                      items-center
                      justify-between
                      text-[11px]
                    "
                  >
                    <span className="text-muted-foreground">
                      Password Strength
                    </span>

                    <span
                      className={
                        passwordStrength ===
                        'Strong'
                          ? 'font-semibold text-green-500'
                          : passwordStrength ===
                              'Medium'
                            ? 'font-semibold text-yellow-500'
                            : 'font-semibold text-red-500'
                      }
                    >
                      {passwordStrength}
                    </span>
                  </div>

                  <div
                    className="
                      h-1.5
                      overflow-hidden
                      rounded-full
                      bg-muted
                    "
                  >
                    <div
                      className={`
                        h-full
                        rounded-full
                        ${
                          passwordStrength ===
                          'Strong'
                            ? 'w-full bg-green-500'
                            : passwordStrength ===
                                'Medium'
                              ? 'w-2/3 bg-yellow-500'
                              : 'w-1/3 bg-red-500'
                        }
                      `}
                    />
                  </div>
                </div>
              )}

              {/* ======================================== */}
              {/* CONFIRM PASSWORD */}
              {/* ======================================== */}

              <PasswordField
                value={confirmPassword}
                placeholder="Confirm Password"
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }
                onChange={setConfirmPassword}
              />

              {/* ======================================== */}
              {/* PASSWORD MATCH */}
              {/* ======================================== */}

              {confirmPassword && (
                <div
                  className={`
                    mb-3
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    ${
                      password ===
                      confirmPassword
                        ? 'text-green-500'
                        : 'text-destructive'
                    }
                  `}
                >
                  {password ===
                  confirmPassword ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />

                      Passwords match.
                    </>
                  ) : (
                    'Passwords do not match.'
                  )}
                </div>
              )}

              {/* ======================================== */}
              {/* PROFILE PROGRESS */}
              {/* ======================================== */}

              <div className="mb-4">
                <div
                  className="
                    mb-1.5
                    flex
                    items-center
                    justify-between
                    text-[11px]
                  "
                >
                  <span className="text-muted-foreground">
                    Profile Completion
                  </span>

                  <span className="font-semibold">
                    {progress}%
                  </span>
                </div>

                <div
                  className="
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-muted
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-primary
                    "
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* ======================================== */}
              {/* SUCCESS / REGISTER */}
              {/* ======================================== */}

              {success ? (
                <div
                  className="
                    rounded-xl
                    border
                    border-green-500/30
                    bg-green-500/10
                    p-4
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      mb-2
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-green-500/20
                      text-green-500
                    "
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <h3
                    className="
                      text-sm
                      font-bold
                      text-green-500
                    "
                  >
                    Account Created
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-muted-foreground
                    "
                  >
                    We sent a verification link
                    to your email.
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={
                    loading ||
                    password !==
                      confirmPassword
                  }
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary
                    text-sm
                    font-bold
                    text-primary-foreground
                    shadow-lg
                    shadow-primary/20
                    disabled:pointer-events-none
                    disabled:opacity-50
                  "
                >
                  {loading ? (
                    <>
                      {/* Native CSS loader */}
                      <div
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-current
                          border-t-transparent
                        "
                      />

                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account

                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              {/* ======================================== */}
              {/* FOOTER */}
              {/* ======================================== */}

              <p
                className="
                  mt-4
                  text-center
                  text-xs
                  text-muted-foreground
                "
              >
                Already have an account?{' '}

                <Link
                  href="/login"
                  className="
                    font-semibold
                    text-primary
                    hover:underline
                  "
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ======================================== */
/* STAT CARD */
/* ======================================== */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-border/70
        bg-card
        p-3
        shadow-sm
      "
    >
      <div className="mb-2 text-primary">
        {icon}
      </div>

      <p className="text-lg font-black">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ======================================== */
/* INPUT FIELD */
/* ======================================== */

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="relative mb-3">
      <span
        className="
          absolute
          left-3.5
          top-1/2
          -translate-y-1/2
          text-muted-foreground
        "
      >
        {icon}
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-input
          bg-background
          pl-10
          pr-4
          text-sm
          text-foreground
          outline-none
          placeholder:text-muted-foreground
          focus:border-primary/50
          focus:ring-2
          focus:ring-primary/10
        "
        required
      />
    </div>
  );
}

/* ======================================== */
/* PASSWORD FIELD */
/* ======================================== */

function PasswordField({
  value,
  placeholder,
  visible,
  onToggle,
  onChange,
}: {
  value: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative mb-3">
      <Lock
        className="
          absolute
          left-3.5
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
          h-11
          w-full
          rounded-xl
          border
          border-input
          bg-background
          pl-10
          pr-11
          text-sm
          text-foreground
          outline-none
          placeholder:text-muted-foreground
          focus:border-primary/50
          focus:ring-2
          focus:ring-primary/10
        "
        required
      />

      <button
        type="button"
        onClick={onToggle}
        className="
          absolute
          right-3.5
          top-1/2
          -translate-y-1/2
          text-muted-foreground
          hover:text-foreground
        "
        aria-label={
          visible
            ? 'Hide password'
            : 'Show password'
        }
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/* ======================================== */
/* CODE FIELD */
/* ======================================== */

function CodeField({
  icon,
  value,
  label,
  variant,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  variant: 'primary' | 'cyan';
}) {
  const isCyan = variant === 'cyan';

  return (
    <div
      className={`
        relative
        mb-3
        rounded-xl
        border
        ${
          isCyan
            ? 'border-cyan-500/30 bg-cyan-500/5'
            : 'border-primary/30 bg-primary/5'
        }
      `}
    >
      <span
        className={`
          absolute
          left-3.5
          top-1/2
          -translate-y-1/2
          ${
            isCyan
              ? 'text-cyan-500'
              : 'text-primary'
          }
        `}
      >
        {icon}
      </span>

      <input
        type="text"
        value={value}
        readOnly
        className="
          h-11
          w-full
          cursor-not-allowed
          bg-transparent
          pl-10
          pr-28
          text-sm
          text-foreground
          outline-none
        "
      />

      <span
        className={`
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-[10px]
          font-bold
          ${
            isCyan
              ? 'text-cyan-500'
              : 'text-primary'
          }
        `}
      >
        {label}
      </span>
    </div>
  );
}