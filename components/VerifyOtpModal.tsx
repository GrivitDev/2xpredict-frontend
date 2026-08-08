'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  motion,
} from 'framer-motion';

import {
  CheckCircle2,
  Mail,
  ShieldCheck,
  TriangleAlert,
  ArrowRight,
} from 'lucide-react';

import {
  resendOtp,
  verifyOtp,
} from '@/services/auth.service';


interface Props {

  email: string;

  onClose: () => void;

}



export default function VerifyOtpModal({
  email,
}: Props) {


  const router = useRouter();


  const inputRefs =
    useRef<Array<HTMLInputElement | null>>([]);



  const [otp, setOtp] =
    useState([
      '',
      '',
      '',
      '',
      '',
      '',
    ]);



  const [loading, setLoading] =
    useState(false);



  const [resending, setResending] =
    useState(false);



  const [countdown, setCountdown] =
    useState(30);



  const [error, setError] =
    useState('');



  const [success, setSuccess] =
    useState('');




  const code =
    otp.join('');



  const isComplete =
    code.length === 6;




  useEffect(() => {


    if (countdown <= 0) {
      return;
    }



    const timer =
      setTimeout(() => {

        setCountdown(
          (prev) => prev - 1,
        );

      },1000);



    return () =>
      clearTimeout(timer);



  },[countdown]);







  const handleChange = (
    value:string,
    index:number,
  ) => {


    if (!/^\d*$/.test(value)) {
      return;
    }



    const newOtp =
      [...otp];



    newOtp[index] =
      value.slice(-1);



    setOtp(newOtp);



    setError('');



    if (
      value &&
      index < 5
    ) {

      inputRefs.current[index + 1]?.focus();

    }


  };







  const handleKeyDown = (
    e:React.KeyboardEvent<HTMLInputElement>,
    index:number,
  ) => {


    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {

      inputRefs.current[index - 1]?.focus();

    }


  };







  const handlePaste = (
    e:React.ClipboardEvent<HTMLInputElement>,
  ) => {


    const pasted =
      e.clipboardData
        .getData('text')
        .replace(/\D/g,'')
        .slice(0,6);



    if (!pasted) {
      return;
    }



    const values =
      pasted
        .split('');



    const newOtp =
      [
        ...otp,
      ];



    values.forEach(
      (value,index)=>{
        newOtp[index]=value;
      },
    );



    setOtp(newOtp);



    inputRefs.current[
      Math.min(values.length,5)
    ]?.focus();


  };







  const handleVerify =
    async () => {


      if (!isComplete) {

        setError(
          'Please enter the complete 6 digit verification code.',
        );

        return;

      }



      try {


        setLoading(true);

        setError('');



        const response =
          await verifyOtp({
            email,
            code,
          });



        setSuccess(
          response.message ||
          'Email verified successfully.',
        );



        setTimeout(() => {

          router.push('/login');

        },1500);



      } catch(error:any) {


        setError(
          error?.response?.data?.message ||
          'Verification failed. Please try again.',
        );


      } finally {

        setLoading(false);

      }


    };







  const handleResend =
    async () => {


      try {


        setResending(true);

        setError('');



        const response =
          await resendOtp(email);



        setSuccess(
          response.message ||
          'OTP resent successfully.',
        );



        setCountdown(30);



      } catch(error:any) {


        setError(
          error?.response?.data?.message ||
          'Unable to resend OTP.',
        );


      } finally {


        setResending(false);


      }


    };



  return (

    <motion.div
      initial={{
        opacity:0,
        y:40,
        scale:0.96,
      }}
      animate={{
        opacity:1,
        y:0,
        scale:1,
      }}
      transition={{
        duration:0.6,
      }}
      className="w-full max-w-md"
    >


      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 p-10 shadow-2xl backdrop-blur-2xl">


        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />


        <div className="text-center">


          <div className="mb-5 flex justify-center">


            <div className="rounded-2xl bg-primary/10 p-4">

              <Mail className="h-10 w-10 text-primary" />

            </div>


          </div>


          <h1 className="text-4xl font-black">
            Verify Email
          </h1>


          <p className="mt-3 text-muted-foreground">

            Enter the 6 digit code sent to

            <br />

            <span className="font-semibold text-foreground">
              {email}
            </span>

          </p>


        </div>





        {/* OTP INPUTS */}

        <div className="mt-10 flex justify-center gap-3">


          {otp.map((digit,index)=>(

            <input
              key={index}
              ref={(element)=>{
                inputRefs.current[index]=element;
              }}
              value={digit}
              onChange={(e)=>
                handleChange(
                  e.target.value,
                  index,
                )
              }
              onKeyDown={(e)=>
                handleKeyDown(
                  e,
                  index,
                )
              }
              onPaste={handlePaste}
              maxLength={1}
              inputMode="numeric"
              className={`h-14 w-12 rounded-xl border bg-background text-center text-xl font-bold outline-none transition-all duration-300 focus:ring-2 ${
                digit
                  ? 'border-primary text-primary shadow-lg shadow-primary/20'
                  : 'border-input'
              }`}
            />

          ))}


        </div>





        {/* OTP STATUS */}

        {isComplete && !error && (

          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-green-500 animate-in fade-in">

            <CheckCircle2 className="h-4 w-4" />

            Verification code complete

          </div>

        )}






        {/* ERROR */}

        {error && (

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive animate-in slide-in-from-top-2">


            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />


            <p className="text-sm font-medium">

              {error}

            </p>


          </div>

        )}






        {/* SUCCESS */}

        {success && (

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-green-500 animate-in slide-in-from-top-2">


            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />


            <p className="text-sm font-medium">

              {success}

            </p>


          </div>

        )}






        {/* VERIFY BUTTON */}

        <button
          onClick={handleVerify}
          disabled={loading || !isComplete}
          className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary text-lg font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >

          {loading ? (

            <>

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />

              Verifying Email...

            </>


          ) : (

            <>

              Verify Email

              <ArrowRight size={20}/>

            </>

          )}

        </button>






        {/* RESEND */}

        <button
          onClick={handleResend}
          disabled={
            resending ||
            countdown > 0
          }
          className="mt-4 h-14 w-full rounded-xl border border-border bg-muted/40 font-semibold transition-all hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >

          {resending ? (

            'Sending New Code...'

          ) : countdown > 0 ? (

            `Resend code in ${countdown}s`

          ) : (

            'Resend Verification Code'

          )}

        </button>






        {/* SECURITY CARD */}

        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">


          <h3 className="mb-3 flex items-center gap-2 font-semibold">

            <ShieldCheck className="h-5 w-5 text-primary" />

            Security Notice

          </h3>



          <ul className="space-y-2 text-sm text-muted-foreground">


            <li>
              • Never share your verification code.
            </li>


            <li>
              • Codes expire for your protection.
            </li>


            <li>
              • Your account remains secure.
            </li>


          </ul>


        </div>

        {/* FOOTER */}

        <p className="mt-8 text-center text-sm text-muted-foreground">


          Wrong email address?{' '}


          <button
            onClick={() =>
              router.push('/register')
            }
            className="font-semibold text-primary hover:opacity-80"
          >
            Register again
          </button>


        </p>


      </div>


    </motion.div>

  );

}