'use client';

import Link from 'next/link';


import {
  Plus,
  Megaphone,
  CheckCircle,
  Eye,
  MousePointerClick,
} from 'lucide-react';



import {
  Button,
} from '@/components/ui/button';



import {
  useAdminAds,
  useAdminAdAnalytics,
  useDeleteAd,
  useToggleAd,
} from '@/hooks/useAdminAds';



import {
  AdTable,
} from '@/components/admin/ads/AdTable';



import {
  AdAnalyticsCard,
} from '@/components/admin/ads/AdAnalyticsCard';






export default function AdsPage(){



const {
  data: ads = [],
  isLoading: adsLoading,
  isError: adsError,
  error: adsRequestError,
} = useAdminAds();

const {
  data: analytics,
  isLoading: analyticsLoading,
  isError: analyticsError,
  error: analyticsRequestError,
} = useAdminAdAnalytics();

console.log('ADS DATA:', ads);
console.log('ADS ERROR:', adsRequestError);

console.log('ANALYTICS DATA:', analytics);
console.log('ANALYTICS ERROR:', analyticsRequestError);





  const deleteMutation =
    useDeleteAd();



  const toggleMutation =
    useToggleAd();







  function handleDelete(
    id:string,
  ){


    const confirmed =
      window.confirm(
        'Delete this advertisement?',
      );


    if(!confirmed){
      return;
    }


    deleteMutation.mutate(id);


  }







  function handleToggle(
    id:string,
  ){

    toggleMutation.mutate(id);

  }







  if(
    adsLoading ||
    analyticsLoading
  ){

    return (

      <div className="py-10 text-center text-muted-foreground">

        Loading advertisements...

      </div>

    );

  }




console.log('Ads:', ads);
console.log('Ads length:', ads.length);

  return (

    <div className="space-y-8">



      {/* Header */}


      <div
        className="
          flex
          items-center
          justify-between
        "
      >


        <div>


          <h1 className="text-3xl font-bold">

            Advertisements

          </h1>



          <p className="text-muted-foreground">

            Manage internal advertisements displayed across the platform.

          </p>


        </div>





        <Button asChild>


          <Link href="/admin/ads/create">


            <Plus className="mr-2 size-4"/>


            Create Ad


          </Link>


        </Button>


      </div>









      {/* Analytics */}



      <div
        className="
          grid
          gap-4
          md:grid-cols-4
        "
      >



        <AdAnalyticsCard

          title="Total Ads"

          value={
            analytics?.totalAds ?? 0
          }

          icon={Megaphone}

        />





        <AdAnalyticsCard

          title="Active Ads"

          value={
            analytics?.activeAds ?? 0
          }

          icon={CheckCircle}

        />





        <AdAnalyticsCard

          title="Impressions"

          value={
            analytics?.impressions ?? 0
          }

          icon={Eye}

        />





        <AdAnalyticsCard

          title="Clicks"

          value={
            analytics?.clicks ?? 0
          }

          icon={MousePointerClick}

        />


      </div>









      {/* Ads Table */}



      {
        ads.length > 0 ? (


          <AdTable

            ads={ads}

            onDelete={handleDelete}

            onToggle={handleToggle}

          />


        )

        :


        (

          <div
            className="
              rounded-xl
              border
              p-10
              text-center
              text-muted-foreground
            "
          >

            No advertisements found.


          </div>


        )

      }




    </div>

  );


}