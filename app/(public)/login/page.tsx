'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { loginUser } from '@/services/auth.service';

import { useAuth } from '@/providers/auth-provider';

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Trophy,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';


export default function LoginPage() {

  const router = useRouter();

  const { login } = useAuth();


  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);


  const [errors, setErrors] =
    useState<Record<string, string>>({});


  const handleLogin = async (
    e: React.FormEvent,
  ) => {

    e.preventDefault();

    setErrors({});


    if (!email) {

      setErrors({
        email: 'Email is required',
      });

      return;

    }


    if (!password) {

      setErrors({
        password: 'Password is required',
      });

      return;

    }


    try {

      setLoading(true);


      const response =
        await loginUser({
          email,
          password,
        });


      login(response.token);


      toast.success(
        'Login successful. Welcome back!',
        {
          duration: 3000,
        },
      );


      if (
        response.user.role === 'admin'
      ) {

        router.push('/admin');

      } else {

        router.push('/dashboard');

      }


    } catch (error: any) {


      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';



      if (Array.isArray(message)) {

        message.forEach((msg) => {
          toast.error(msg);
        });


      } else {


        toast.error(message);


        if (
          message
            .toLowerCase()
            .includes('email')
        ) {

          setErrors({
            email: message,
          });

        }


        if (
          message
            .toLowerCase()
            .includes('password')
        ) {

          setErrors({
            password: message,
          });

        }

      }


    } finally {

      setLoading(false);

    }

  };


  return (

    <main className="relative min-h-screen overflow-hidden bg-background pt-12 pb-12 text-foreground">


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
            src="/images/ball2.png"
            alt="Premium Football Predictions"
            width={360}
            height={120}
            className="max-w-full h-auto object-contain"
            priority
          />

            </div>



            <h1 className="mt-8 text-4xl font-black leading-tight">

              Welcome

              <br />

              <span className="bg-gradient-to-r from-primary via-primary to-cyan-500 bg-clip-text text-6xl text-transparent">

                Back.

              </span>

            </h1>



            <p className="mt-6 text-lg leading-8 text-muted-foreground">

              Access expert predictions, live fixtures,
              VIP tips, analytics and everything you need
              to stay ahead.

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




        {/* LOGIN */}


        <div className="flex flex-1 justify-center lg:justify-end">


          <form
            onSubmit={handleLogin}
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
                Login
              </h2>


              <p className="mt-2 text-muted-foreground">
                Sign in to continue
              </p>


            </div>



            {/* EMAIL */}


            <div className="mb-5">

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />


                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />

              </div>


              {errors.email && (

                <p className="mt-2 text-sm text-destructive">
                  {errors.email}
                </p>

              )}

            </div>




            {/* PASSWORD */}


            <div className="mb-4">


              <div className="relative">


                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />



                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 w-full rounded-xl border border-input bg-background/80 pl-12 pr-14 outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                />



                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >

                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}

                </button>


              </div>


              {errors.password && (

                <p className="mt-2 text-sm text-destructive">
                  {errors.password}
                </p>

              )}


            </div>




            <div className="mb-8 flex items-center justify-between">


              <label className="flex items-center gap-2 text-sm text-muted-foreground">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />

                Remember me

              </label>



              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary"
              >
                Forgot Password?
              </Link>


            </div>




            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary text-lg font-bold text-primary-foreground transition hover:scale-[1.02] disabled:opacity-60"
            >


              {loading ? (

                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />

                  Signing in...

                </>


              ) : (

                <>
                  Login
                  <ArrowRight size={20} />
                </>

              )}


            </button>




            <p className="mt-8 text-center text-sm text-muted-foreground">

              Don't have an account?{' '}

              <Link
                href="/register"
                className="font-semibold text-primary"
              >
                Create Account
              </Link>


            </p>



          </form>


        </div>



      </div>


    </main>

  );

}