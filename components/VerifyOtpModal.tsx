'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MailWarning,
  TriangleAlert,
} from 'lucide-react';

import {
  resendOtp,
  verifyOtp,
} from '@/services/auth.service';

interface Props {
  email: string;
  onClose?: () => void;
  onResend?: () => void;
}

export default function VerifyOtpModal({
  email,
  onResend,
}: Props) {
  const router = useRouter();

  const inputRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showSpamNotice, setShowSpamNotice] =
    useState(false);

  const code = otp.join('');
  const isComplete = code.length === 6;

  // =====================================================
  // SPAM / JUNK REMINDER
  // =====================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSpamNotice(true);
    }, 60 * 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  // =====================================================
  // RESEND COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [countdown]);

  // =====================================================
  // OTP INPUT
  // =====================================================

  const handleChange = (
    value: string,
    index: number,
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =====================================================
  // KEYBOARD NAVIGATION
  // =====================================================

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      e.key === 'ArrowLeft' &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      e.key === 'ArrowRight' &&
      index < 5
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =====================================================
  // PASTE OTP
  // =====================================================

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pasted) return;

    const newOtp = [
      '',
      '',
      '',
      '',
      '',
      '',
    ];

    pasted.split('').forEach(
      (value, index) => {
        newOtp[index] = value;
      },
    );

    setOtp(newOtp);
    setError('');

    const nextIndex = Math.min(
      pasted.length,
      5,
    );

    inputRefs.current[nextIndex]?.focus();
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const handleVerify = async () => {
    if (!isComplete) {
      setError(
        'Please enter the complete 6 digit verification code.',
      );

      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await verifyOtp({
        email,
        code,
      });

      setSuccess(
        response.message ||
          'Email verified successfully.',
      );

      window.setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      const message =
        error?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message[0]
          : message ||
              'Verification failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResend = async () => {
    try {
      setResending(true);
      setError('');
      setSuccess('');

      const response = await resendOtp(email);

      setSuccess(
        response.message ||
          'OTP resent successfully.',
      );

      setCountdown(30);

      // Restart the one-minute reminder
      setShowSpamNotice(false);

      onResend?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message[0]
          : message ||
              'Unable to resend OTP.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card/70
          p-5
          shadow-xl
          backdrop-blur-2xl
          sm:p-6
        "
      >
        {/* TOP LINE */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-primary
            to-transparent
          "
        />

        {/* HEADER */}

        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Mail className="h-7 w-7 text-primary" />
            </div>
          </div>

          <h1 className="text-2xl font-black">
            Verify Email
          </h1>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            Enter the 6 digit code sent to
            <br />

            <span className="font-semibold text-foreground">
              {email}
            </span>
          </p>
        </div>

        {/* OTP INPUTS */}

        <div
          className="
            mt-6
            flex
            justify-center
            gap-1.5
            sm:gap-2
          "
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] =
                  element;
              }}
              value={digit}
              onChange={(e) =>
                handleChange(
                  e.target.value,
                  index,
                )
              }
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  index,
                )
              }
              onPaste={handlePaste}
              maxLength={1}
              inputMode="numeric"
              autoComplete={
                index === 0
                  ? 'one-time-code'
                  : 'off'
              }
              aria-label={`Verification digit ${
                index + 1
              }`}
              className={`
                h-11
                w-9
                rounded-lg
                border
                bg-background
                text-center
                text-lg
                font-bold
                outline-none
                transition
                focus:ring-2
                sm:h-12
                sm:w-11
                ${
                  digit
                    ? 'border-primary text-primary shadow-sm shadow-primary/20'
                    : 'border-input focus:border-ring'
                }
              `}
            />
          ))}
        </div>

        {/* COMPLETE */}

        {isComplete && !error && (
          <div
            className="
              mt-3
              flex
              items-center
              justify-center
              gap-1.5
              text-xs
              text-green-500
            "
          >
            <CheckCircle2 className="h-3.5 w-3.5" />

            Code complete
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            className="
              mt-4
              flex
              items-start
              gap-2
              rounded-xl
              border
              border-destructive/30
              bg-destructive/10
              p-3
              text-destructive
            "
            role="alert"
            aria-live="assertive"
          >
            <TriangleAlert
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
              "
            />

            <p
              className="
                text-xs
                font-medium
                leading-5
              "
            >
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="
              mt-4
              flex
              items-start
              gap-2
              rounded-xl
              border
              border-green-500/30
              bg-green-500/10
              p-3
              text-green-500
            "
            role="status"
            aria-live="polite"
          >
            <CheckCircle2
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
              "
            />

            <p
              className="
                text-xs
                font-medium
                leading-5
              "
            >
              {success}
            </p>
          </div>
        )}

        {/* SPAM / JUNK REMINDER */}

        {showSpamNotice && (
          <div
            className="
              mt-4
              flex
              items-start
              gap-2.5
              rounded-xl
              border
              border-amber-500/30
              bg-amber-500/10
              p-3
              text-amber-600
              shadow-sm
              dark:text-amber-400
            "
            role="status"
            aria-live="polite"
          >
            <MailWarning
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
              "
            />

            <div className="min-w-0">
              <p className="text-xs font-bold">
                Haven&apos;t received the code?
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-4
                  text-muted-foreground
                "
              >
                Check your{' '}
                <span className="font-semibold text-foreground">
                  Spam
                </span>{' '}
                or{' '}
                <span className="font-semibold text-foreground">
                  Junk
                </span>{' '}
                folder. If you still cannot
                receive it, you can register
                again after 30 minutes.
              </p>
            </div>
          </div>
        )}

        {/* VERIFY BUTTON */}

        <button
          type="button"
          onClick={handleVerify}
          disabled={
            loading ||
            !isComplete ||
            !!success
          }
          className="
            mt-4
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-4
            text-s
            font-bold
            text-primary-foreground
            transition
            hover:opacity-90
            active:scale-[0.98]
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          {loading ? (
            <>
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

              Verifying...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4" />

              Verified
            </>
          ) : (
            <>
              Verify Email

              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* RESEND */}

        <button
          type="button"
          onClick={handleResend}
          disabled={
            resending ||
            countdown > 0 ||
            !!success
          }
          className="
            mt-2
            h-10
            w-full
            rounded-xl
            border
            border-border
            bg-muted/40
            text-xs
            font-semibold
            transition
            hover:bg-muted
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          {resending
            ? 'Sending new code...'
            : countdown > 0
              ? `Resend code in ${countdown}s`
              : 'Resend Verification Code'}
        </button>

        {/* FOOTER */}

        <p
          className="
            mt-4
            text-center
            text-xs
            text-muted-foreground
          "
        >
          Wrong email address?{' '}

          <button
            type="button"
            onClick={() =>
              router.push('/register')
            }
            className="
              font-semibold
              text-primary
              hover:opacity-80
            "
          >
            Register again
          </button>
        </p>
      </div>
    </div>
  );
}