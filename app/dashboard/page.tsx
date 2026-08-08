'use client';

import {
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { useDashboardStats } from '@/hooks/useDashboardStats';

import LoadingState from '@/components/dashboard/LoadingState';

import {
  DashboardSection,
  IdentityCard,
  PlanCard,
  TopPredictionsCard,
  PromosCard,
} from '@/components/dashboard';
import { InternalAds } from '@/components/ads/IntAds/InternalAds';
import { AdPage } from '@/constants/ads/ad-page';
import { AdPosition } from '@/constants/ads/ad-position';
import { DashboardAds } from '@/components/ads/ExtAds/positions/DashboardAds';



export default function DashboardPage() {


  const {
    loading,
    error,
    user,
    subscription,
    topPredictions,
    availablePromos,
  } = useDashboardStats() as any;



  if (loading) {
    return <LoadingState />;
  }



  if (error) {
    return (

      <div
        className="
          rounded-3xl
          border
          border-destructive/30
          bg-destructive/10
          p-5
          text-sm
          text-destructive
        "
      >
        {error}
      </div>

    );
  }



  return (

    <div
      className="
        relative
        space-y-8
      "
    >


      {/* Ambient Background */}

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          right-0
          h-72
          w-72
          rounded-full
          bg-primary/10
          blur-3xl
        "
      />


      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-96
          h-60
          w-60
          rounded-full
          bg-primary/5
          blur-3xl
        "
      />




      {/* Welcome Hero */}

      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-border/60
          bg-card/70
          p-5
          shadow-sm
          backdrop-blur-xl
          sm:p-7
        "
      >

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-primary/10
            via-transparent
            to-transparent
          "
        />


        <div
          className="
            relative
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >


          <div>

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
                text-xs
                font-semibold
                uppercase
                tracking-widest
                text-primary
              "
            >

              <Sparkles
                className="
                  h-4
                  w-4
                "
              />

              Member Dashboard

            </div>



            <h1
              className="
                text-2xl
                font-black
                tracking-tight
                sm:text-3xl
                lg:text-4xl
              "
            >

              Welcome back,{' '}

              {user?.fullName || 'User'}

            </h1>



            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-relaxed
                text-muted-foreground
                sm:text-base
              "
            >

              Manage your subscription, access predictions,
              track rewards and stay ahead with premium football insights.

            </p>


          </div>



          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-border
              bg-background/60
              px-4
              py-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-primary/10
              "
            >

              <TrendingUp
                className="
                  h-5
                  w-5
                  text-primary
                "
              />

            </div>



            <div>

              <p
                className="
                  text-xs
                  text-muted-foreground
                "
              >
                Account Status
              </p>


              <p
                className="
                  font-semibold
                  capitalize
                "
              >
                {subscription?.plan || 'free'}
              </p>


            </div>


          </div>


        </div>


      </div>






      {/* Identity */}

      <IdentityCard

        name={
          user?.fullName
        }

        username={
          user?.username
        }

        email={
          user?.email
        }

        phoneNumber={
          user?.phoneNumber
        }

        plan={
          subscription?.plan
        }

      />






      {/* Membership + Promos */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-2
        "
      >


        <PlanCard

          plan={
            subscription?.plan
          }

          startDate={
            subscription?.startDate
          }

          expiresAt={
            subscription?.expiryDate
          }

          revenue={
            subscription?.amount
          }

        />



        <DashboardSection

          title="Available Promos"

          subtitle="Exclusive campaigns available for your account"

        >

          <PromosCard

            items={
              availablePromos || []
            }

          />

        </DashboardSection>


      </div>






      {/* Predictions */}

      <DashboardSection

        title="Top Predictions"

        subtitle="Highest confidence picks available today"

      >

        <TopPredictionsCard

          items={
            topPredictions || []
          }

        />


      </DashboardSection>

      <DashboardAds />

      <InternalAds
  page={AdPage.HOME}
  position={AdPosition.BOTTOM}
/>

<InternalAds
  page={AdPage.HOME}
  position={AdPosition.POPUP}
/>
    </div>

  );

}