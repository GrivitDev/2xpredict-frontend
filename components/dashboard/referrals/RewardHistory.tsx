'use client';

import { useQuery } from '@tanstack/react-query';

import {
  CheckCircle2,
  Crown,
  Gift,
  Wallet,
  Sparkles,
} from 'lucide-react';

import {
  Badge,
} from '@/components/ui/badge';

import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  SectionTitle,
} from '@/components/dashboard/shared/SectionTitle';

import {
  getMyRewards,
} from '@/services/promos.service';



export function RewardHistory() {


  const {
    data: rewards = [],
    isLoading,
  } = useQuery({

    queryKey:[
      'my-rewards',
    ],

    queryFn:
      getMyRewards,

  });





  if(isLoading){

    return (

      <LoadingCard
        text="Loading reward history..."
      />

    );

  }





  if(rewards.length === 0){

    return (

      <EmptyState

        title="No Rewards Yet"

        description="
          Complete referral campaigns to start earning rewards.
        "

        icon={Gift}

      />

    );

  }





  return (

    <div
      className="
        space-y-5
        sm:space-y-6
      "
    >


      <SectionTitle

        title="Reward History"

        description="
          Track all rewards unlocked from your referral activity.
        "

      />





      <DashboardCard

        className="
          relative
          overflow-hidden
        "

      >


        <div

          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-60
            w-60
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
            bg-muted/20
            px-5
            py-5
            sm:px-6
          "

        >

          <CardTitle

            className="
              flex
              items-center
              gap-3
              text-base
              sm:text-lg
            "

          >

            <div

              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-2xl
                bg-primary/10
              "

            >

              <Gift

                className="
                  h-5
                  w-5
                  text-primary
                "

              />

            </div>


            My Rewards


            <Sparkles

              className="
                ml-auto
                h-5
                w-5
                text-primary
                opacity-70
              "

            />

          </CardTitle>


        </CardHeader>







        <CardContent

          className="
            relative
            space-y-4
            p-5
            sm:p-6
          "

        >


          {
            rewards.map((reward:any)=>{


              const isCash =
                reward.type === 'cash';



              return (

                <div

                  key={reward._id}

                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-border/50
                    bg-gradient-to-br
                    ${
                      isCash
                      ? 'from-emerald-500/10'
                      : 'from-primary/10'
                    }
                    via-background
                    to-background
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    sm:p-5
                  `}

                >


                  <div

                    className="
                      pointer-events-none
                      absolute
                      -right-8
                      -top-8
                      h-32
                      w-32
                      rounded-full
                      bg-primary/10
                      blur-3xl
                      opacity-0
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                    "

                  />





                  <div

                    className="
                      relative
                      flex
                      flex-col
                      gap-5
                      md:flex-row
                      md:items-center
                      md:justify-between
                    "

                  >



                    <div

                      className="
                        flex
                        min-w-0
                        items-start
                        gap-4
                      "

                    >


                      <div

                        className={`
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          shadow-lg
                          ${
                            isCash
                            ?
                            'border-emerald-500/30 bg-emerald-500/10'
                            :
                            'border-primary/30 bg-primary/10'
                          }
                        `}

                      >

                        {
                          isCash
                          ?

                          <Wallet

                            className="
                              h-6
                              w-6
                              text-emerald-500
                            "

                          />

                          :

                          <Crown

                            className="
                              h-6
                              w-6
                              text-primary
                            "

                          />

                        }


                      </div>





                      <div className="min-w-0">


                        <h3

                          className="
                            truncate
                            font-bold
                          "

                        >

                          {
                            reward.promoId?.name ??
                            'Referral Reward'
                          }

                        </h3>




                        <p

                          className="
                            mt-1
                            text-lg
                            font-black
                          "

                        >

                          {
                            isCash
                            ?
                            `₦${reward.amount?.toLocaleString('en-GB')}`
                            :
                            `${reward.plan} Subscription`
                          }

                        </p>





                        {
                          !isCash && (

                            <p

                              className="
                                text-sm
                                text-muted-foreground
                              "

                            >

                              {reward.durationDays} days access

                            </p>

                          )
                        }





                        <p

                          className="
                            mt-2
                            text-xs
                            text-muted-foreground
                          "

                        >

                          {
                            new Date(
                              reward.createdAt,
                            ).toLocaleDateString()
                          }

                        </p>



                      </div>



                    </div>






                    <div

                      className="
                        flex
                        items-center
                        gap-3
                      "

                    >


                      <Badge

                        variant="secondary"

                        className="
                          rounded-full
                          px-3
                        "

                      >

                        Completed

                      </Badge>




                      <CheckCircle2

                        className="
                          h-5
                          w-5
                          text-primary
                        "

                      />


                    </div>




                  </div>



                </div>

              );


            })
          }


        </CardContent>


      </DashboardCard>


    </div>

  );

}