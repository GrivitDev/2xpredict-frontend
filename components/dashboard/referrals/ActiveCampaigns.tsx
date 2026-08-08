'use client';

import { useQuery } from '@tanstack/react-query';

import {
  CheckCircle2,
  Crown,
  Gift,
  Target,
  Trophy,
  Wallet,
  Sparkles,
} from 'lucide-react';

import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Badge,
} from '@/components/ui/badge';

import {
  DashboardCard,
} from '@/components/dashboard/shared/DashboardCard';

import {
  EmptyState,
} from '@/components/dashboard/shared/EmptyState';

import {
  LoadingCard,
} from '@/components/dashboard/shared/LoadingCard';

import {
  AnimatedProgress,
} from '@/components/dashboard/shared/AnimatedProgress';

import {
  SectionTitle,
} from '@/components/dashboard/shared/SectionTitle';

import {
  getMyPromoProgress,
} from '@/services/promos.service';



export function ActiveCampaigns() {


  const {
    data: campaigns = [],
    isLoading,
  } = useQuery({

    queryKey:[
      'promo-progress',
    ],

    queryFn:
      getMyPromoProgress,

  });



  if(isLoading){

    return (

      <LoadingCard
        text="Loading campaign progress..."
      />

    );

  }



  if(campaigns.length === 0){

    return (

      <EmptyState

        title="No Active Campaigns"

        description="
          Join a referral campaign to start tracking your progress.
        "

        icon={Gift}

      />

    );

  }



  return (

    <div
      className="
        space-y-6
      "
    >


      <SectionTitle

        title="My Active Campaigns"

        description="
          Track your referral progress and unlocked rewards.
        "

      />



      <div
        className="
          space-y-6
        "
      >

        {
          campaigns.map(
            (campaign:any)=>{


              const percentage =
                campaign.targetCount === 0

                  ? 0

                  :

                    Math.min(
                      100,
                      Math.round(
                        (
                          campaign.currentProgress /
                          campaign.targetCount
                        )
                        *
                        100,
                      ),
                    );



              return (

                <DashboardCard

                  key={
                    campaign.promoId
                  }

                  className="
                    relative
                    overflow-hidden
                    border-border/60
                    bg-gradient-to-br
                    from-background
                    via-background
                    to-primary/5
                  "

                >


                  <div
                    className="
                      pointer-events-none
                      absolute
                      -right-20
                      -top-20
                      h-64
                      w-64
                      rounded-full
                      bg-primary/20
                      blur-3xl
                    "
                  />



                  <CardHeader

                    className="
                      relative
                      border-b
                      border-border/50
                      px-5
                      py-5
                      sm:px-6
                    "

                  >

                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >


                      <CardTitle

                        className="
                          flex
                          items-center
                          gap-3
                          text-base
                          sm:text-xl
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
                            bg-gradient-to-br
                            from-violet-500/20
                            to-cyan-500/20
                            text-primary
                          "
                        >

                          <Gift
                            className="
                              h-6
                              w-6
                            "
                          />

                        </div>



                        <span className="truncate">

                          {campaign.name}

                        </span>


                      </CardTitle>



                      <Badge

                        className="
                          w-fit
                          rounded-full
                          px-4
                          py-1.5
                        "

                      >

                        {
                          campaign.completed
                            ? 'Completed'
                            : 'Active'
                        }


                      </Badge>


                    </div>


                  </CardHeader>




                  <CardContent

                    className="
                      relative
                      space-y-6
                      p-5
                      sm:p-6
                    "

                  >



                    <p
                      className="
                        text-sm
                        leading-relaxed
                        text-muted-foreground
                      "
                    >

                      {campaign.description}

                    </p>




                    <div
                      className="
                        rounded-2xl
                        border
                        border-border/50
                        bg-muted/20
                        p-5
                      "
                    >


                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <span
                          className="
                            text-sm
                            text-muted-foreground
                          "
                        >

                          Campaign Progress

                        </span>



                        <span
                          className="
                            font-bold
                            tabular-nums
                          "
                        >

                          {campaign.currentProgress}

                          /

                          {campaign.targetCount}

                        </span>


                      </div>



                      <AnimatedProgress

                        value={
                          percentage
                        }

                      />


                      <p
                        className="
                          mt-3
                          text-right
                          text-xs
                          text-muted-foreground
                        "
                      >

                        {percentage}% completed

                      </p>


                    </div>





                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                        xl:grid-cols-4
                      "
                    >

                      <InfoCard

                        icon={Target}

                        title="Completed"

                        value={
                          campaign.currentProgress
                        }

                        color="
                          text-blue-500
                          bg-blue-500/10
                        "

                      />



                      <InfoCard

                        icon={Trophy}

                        title="Claims"

                        value={
                          campaign.completedClaims
                        }

                        color="
                          text-amber-500
                          bg-amber-500/10
                        "

                      />



                      <InfoCard

                        icon={
                          campaign.rewardType === 'cash'
                            ? Wallet
                            : Crown
                        }

                        title="Reward"

                        value={

                          campaign.rewardType === 'cash'

                            ? `₦${Number(
                                campaign.rewardAmount,
                              ).toLocaleString('en-GB')}`

                            :

                              campaign.rewardPlan

                        }

                        color="
                          text-emerald-500
                          bg-emerald-500/10
                        "

                      />



                      <InfoCard

                        icon={Gift}

                        title="Remaining"

                        value={
                          campaign.remainingToNextReward
                        }

                        color="
                          text-violet-500
                          bg-violet-500/10
                        "

                      />


                    </div>





                    {
                      campaign.completed && (

                        <div

                          className="
                            flex
                            flex-col
                            gap-4
                            rounded-2xl
                            border
                            border-emerald-500/20
                            bg-emerald-500/10
                            p-5
                            sm:flex-row
                            sm:items-center
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
                              bg-emerald-500/20
                              text-emerald-500
                            "
                          >

                            <CheckCircle2
                              className="
                                h-6
                                w-6
                              "
                            />

                          </div>



                          <div>

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                font-bold
                              "
                            >

                              Campaign Completed

                              <Sparkles
                                className="
                                  h-4
                                  w-4
                                  text-emerald-500
                                "
                              />

                            </div>


                            <p
                              className="
                                mt-1
                                text-sm
                                text-muted-foreground
                              "
                            >

                              Your reward has been unlocked.

                            </p>


                          </div>


                        </div>

                      )
                    }



                  </CardContent>


                </DashboardCard>

              );


            },
          )
        }


      </div>


    </div>

  );

}





function InfoCard({

  icon:Icon,

  title,

  value,

  color,

}:{

  icon:any;

  title:string;

  value:string | number;

  color:string;

}){


  return (

    <div

      className="
        rounded-2xl
        border
        border-border/50
        bg-muted/20
        p-4
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "

    >


      <div

        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${color}
        `}

      >

        <Icon
          className="
            h-5
            w-5
          "
        />

      </div>



      <p

        className="
          mt-3
          text-sm
          text-muted-foreground
        "

      >

        {title}

      </p>



      <p

        className="
          mt-1
          break-words
          text-xl
          font-black
        "

      >

        {value}

      </p>


    </div>

  );

}