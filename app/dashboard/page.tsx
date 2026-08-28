'use client';

import {
  useDashboardStats,
} from '@/hooks/useDashboardStats';

import LoadingState from '@/components/dashboard/LoadingState';

import {
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



  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <LoadingState />;
  }



  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (
      <div
        className="
          rounded-xl
          border
          border-destructive/30
          bg-destructive/10
          px-3
          py-2.5
          text-xs
          text-destructive
        "
      >
        {error}
      </div>
    );

  }



  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
  <div
    className="
      mx-auto
      w-full
      max-w-6xl
      min-w-0
      space-y-3
      overflow-x-hidden
    "
  >

      {/* ======================================================
          IDENTITY
          ====================================================== */}

      <IdentityCard
        name={user?.fullName}
        username={user?.username}
        email={user?.email}
        phoneNumber={user?.phoneNumber}
        plan={subscription?.plan}
      />



      {/* ======================================================
          MEMBERSHIP + PROMOTIONS
          ====================================================== */}

      <div
        className="
          grid
          gap-3
          xl:grid-cols-2
        "
      >

        <PlanCard
          plan={subscription?.plan}
          startDate={subscription?.startDate}
          expiresAt={subscription?.expiryDate}
          revenue={subscription?.amount}
        />


        <div className="min-w-0">

          <div
            className="
              mb-1.5
              flex
              items-center
              justify-between
            "
          >

            <h2
              className="
                text-xs
                font-semibold
              "
            >
              Available Promos
            </h2>

          </div>


          <PromosCard
            items={availablePromos || []}
          />

        </div>

      </div>



      {/* ======================================================
          TOP PREDICTIONS
          ====================================================== */}

      <div className="min-w-0">

        <div
          className="
            mb-1.5
            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              text-xs
              font-semibold
            "
          >
            Top Predictions
          </h2>

        </div>


        <TopPredictionsCard
          items={topPredictions || []}
        />

      </div>



      {/* ======================================================
          EXTERNAL ADS
          ====================================================== */}

      <DashboardAds />

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4276900328805915"
     crossOrigin="anonymous"></script>
{/*<!-- Dashboard -->*/}
<ins className="adsbygoogle"
  style={{ display: 'block' }}
     data-ad-client="ca-pub-4276900328805915"
     data-ad-slot="3733070258"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

      {/* ======================================================
          INTERNAL ADS
          ====================================================== */}

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