'use client';

import { useQuery } from '@tanstack/react-query';

import {
  CalendarDays,
  Crown,
  ShoppingBag,
  UserPlus,
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
  StatusBadge,
} from '@/components/dashboard/shared/StatusBadge';

import {
  getMyReferrals,
} from '@/services/referrals.service';



export function ReferralActivity() {


  const {
    data: referrals = [],
    isLoading,
  } = useQuery({

    queryKey:[
      'my-referrals',
    ],

    queryFn:
      getMyReferrals,

  });





  if(isLoading){

    return (

      <LoadingCard
        text="Loading referral activity..."
      />

    );

  }





  if(referrals.length === 0){

    return (

      <EmptyState

        title="No Referrals Yet"

        description="
          Share your referral link and start inviting users.
        "

        icon={UserPlus}

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

        title="Referral Activity"

        description="
          Track how your referrals are progressing.
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
                rounded-xl
                bg-primary/10
                text-primary
              "
            >

              <UserPlus
                className="
                  h-5
                  w-5
                "
              />

            </div>



            My Referral Network


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
            referrals.map(
              (referral:any)=>{


                const user =
                  referral.referredUserId;



                const initials =
                  (
                    user?.username ||
                    'U'
                  )
                  .slice(
                    0,
                    2,
                  )
                  .toUpperCase();



                return (

                  <div

                    key={
                      referral._id
                    }

                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border/50
                      bg-gradient-to-br
                      from-background
                      via-background
                      to-primary/5
                      p-4
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-lg
                      sm:p-5
                    "

                  >


                    <div
                      className="
                        absolute
                        -right-10
                        -top-10
                        h-32
                        w-32
                        rounded-full
                        bg-primary/10
                        blur-3xl
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



                      <div

                        className="
                          flex
                          items-center
                          gap-4
                          min-w-0
                        "

                      >

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-primary/20
                            to-cyan-500/20
                            font-black
                            text-primary
                          "
                        >

                          {initials}

                        </div>




                        <div
                          className="
                            min-w-0
                          "
                        >

                          <h3

                            className="
                              truncate
                              font-bold
                            "

                          >

                            {
                              user?.username ??
                              'Unknown User'
                            }


                          </h3>




                          <p

                            className="
                              truncate
                              text-sm
                              text-muted-foreground
                            "

                          >

                            {
                              user?.email ??
                              'No email'
                            }

                          </p>





                          <div

                            className="
                              mt-2
                              flex
                              items-center
                              gap-2
                              text-xs
                              text-muted-foreground
                            "

                          >

                            <CalendarDays

                              className="
                                h-4
                                w-4
                              "

                            />


                            Joined


                            <span>

                              {
                                new Date(
                                  referral.createdAt,
                                )
                                .toLocaleDateString(
                                  'en-GB',
                                  {
                                    day:'2-digit',
                                    month:'short',
                                    year:'numeric',
                                  },
                                )
                              }

                            </span>


                          </div>


                        </div>


                      </div>







                      <div

                        className="
                          flex
                          flex-wrap
                          gap-2
                        "

                      >


                        {
                          referral.registered && (

                            <StatusBadge

                              status="Registered"

                            />

                          )
                        }




                        {
                          referral.regularSubscription && (

                            <Badge

                              variant="secondary"

                              className="
                                rounded-full
                              "

                            >

                              Regular

                            </Badge>

                          )
                        }





                        {
                          referral.vipSubscription && (

                            <Badge

                              className="
                                rounded-full
                                bg-amber-500/10
                                text-amber-600
                                dark:text-amber-400
                              "

                            >

                              <Crown

                                className="
                                  mr-1
                                  h-3.5
                                  w-3.5
                                "

                              />

                              VIP

                            </Badge>

                          )
                        }





                        {
                          referral.predictionPurchased && (

                            <Badge

                              variant="secondary"

                              className="
                                rounded-full
                              "

                            >

                              <ShoppingBag

                                className="
                                  mr-1
                                  h-3.5
                                  w-3.5
                                "

                              />

                              Purchased


                            </Badge>

                          )
                        }





                        {
                          referral.vipSubscription && (

                            <Sparkles

                              className="
                                h-5
                                w-5
                                text-primary
                              "

                            />

                          )
                        }


                      </div>




                    </div>


                  </div>

                );


              },
            )
          }


        </CardContent>


      </DashboardCard>


    </div>

  );

}