'use client';

import { useQuery } from '@tanstack/react-query';

import {
  Copy,
  Link2,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';

import {
  toast,
} from 'sonner';

import {
  Button,
} from '@/components/ui/button';

import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  DashboardCard,
} from '@/components/dashboard/shared/DashboardCard';

import {
  getMyReferralLink,
} from '@/services/referrals.service';



export function ReferralLinkCard() {


  const {
    data,
    isLoading,
  } = useQuery({

    queryKey:[
      'my-referral-link',
    ],

    queryFn:
      getMyReferralLink,

  });





  async function copyLink(){

    if(!data?.referralUrl){

      return;

    }


    await navigator.clipboard.writeText(
      data.referralUrl,
    );


    toast.success(
      'Referral link copied',
    );

  }





  async function shareLink(){

    if(!data?.referralUrl){

      return;

    }



    if(
      navigator.share
    ){

      await navigator.share({

        title:
          'Join Football Prediction Platform',

        text:
          'Join using my referral link and earn rewards.',

        url:
          data.referralUrl,

      });


      return;

    }



    copyLink();

  }





  if(isLoading){

    return (

      <DashboardCard>

        <CardContent

          className="
            flex
            min-h-52
            items-center
            justify-center
            text-sm
            text-muted-foreground
          "

        >

          Loading referral link...

        </CardContent>

      </DashboardCard>

    );

  }





  return (

    <DashboardCard

      className="
        relative
        overflow-hidden
        border-primary/20
        bg-gradient-to-br
        from-primary/15
        via-background
        to-background
      "

    >


      <div

        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-primary/25
          blur-3xl
        "

      />



      <div

        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-32
          w-32
          rounded-full
          bg-cyan-500/10
          blur-3xl
        "

      />





      <CardHeader

        className="
          relative
          px-5
          sm:px-6
        "

      >

        <CardTitle

          className="
            flex
            items-center
            gap-3
            text-lg
          "

        >

          <div

            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-primary/10
              text-primary
            "

          >

            <Link2

              className="
                h-6
                w-6
              "

            />

          </div>




          <div>

            <p className="font-black">

              My Referral Link

            </p>


            <p

              className="
                text-sm
                font-normal
                text-muted-foreground
              "

            >

              Invite users and earn rewards

            </p>


          </div>


        </CardTitle>


      </CardHeader>






      <CardContent

        className="
          relative
          space-y-6
          p-5
          sm:p-6
        "

      >




        <div

          className="
            rounded-3xl
            border
            border-primary/20
            bg-primary/5
            p-5
          "

        >

          <div

            className="
              flex
              items-center
              justify-between
              gap-3
            "

          >

            <p

              className="
                text-sm
                text-muted-foreground
              "

            >

              Referral Code

            </p>



            <Sparkles

              className="
                h-5
                w-5
                text-primary
              "

            />


          </div>




          <p

            className="
              mt-4
              break-all
              text-2xl
              font-black
              tracking-[0.25em]
            "

          >

            {data?.referralCode}


          </p>


        </div>







        <div>

          <div

            className="
              mb-3
              flex
              items-center
              gap-2
            "

          >

            <Users

              className="
                h-4
                w-4
                text-primary
              "

            />


            <p

              className="
                text-sm
                text-muted-foreground
              "

            >

              Your invitation URL

            </p>


          </div>





          <div

            className="
              overflow-hidden
              rounded-2xl
              border
              border-border/50
              bg-muted/20
              p-4
            "

          >

            <p

              className="
                break-all
                text-sm
                leading-relaxed
              "

            >

              {data?.referralUrl}

            </p>


          </div>


        </div>






        <div

          className="
            grid
            gap-3
            sm:grid-cols-2
          "

        >


          <Button

            onClick={copyLink}

            className="
              h-12
              rounded-xl
              font-bold
            "

          >

            <Copy

              className="
                mr-2
                h-5
                w-5
              "

            />


            Copy Link


          </Button>





          <Button

            variant="outline"

            onClick={shareLink}

            className="
              h-12
              rounded-xl
              font-bold
            "

          >

            <Share2

              className="
                mr-2
                h-5
                w-5
              "

            />


            Share


          </Button>


        </div>





      </CardContent>



    </DashboardCard>

  );

}