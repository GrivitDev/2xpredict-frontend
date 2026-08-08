'use client';

import {
  Gift,
  Users,
  Crown,
  Wallet,
  CheckCircle,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Badge,
} from '@/components/ui/badge';

import {
  Progress,
} from '@/components/ui/progress';

import {
  Button,
} from '@/components/ui/button';


import {
  useMyPromoProgress,
} from '@/hooks/use-promos';


import {
  PromoProgress,
  RewardType,
  PromoRequirement,
} from '@/types/promo';



export default function UserPromosPage() {


  const {
    data: promos = [],
    isLoading,
  } = useMyPromoProgress();




  if(isLoading){

    return (

      <div className="p-6">

        Loading promotions...

      </div>

    );

  }






  return (

    <div className="space-y-6 p-6">



      <div>


        <h1 className="text-2xl font-bold">

          Promotions

        </h1>


        <p className="text-muted-foreground">

          Complete promo tasks and unlock rewards.

        </p>


      </div>






      {
        promos.length === 0 && (

          <Card>

            <CardContent className="p-6 text-center">

              No active promotions available.

            </CardContent>

          </Card>

        )
      }






      <div className="grid gap-6">


        {
          promos.map((promo)=>{


            const percentage =
              Math.min(
                100,
                (
                  promo.currentProgress /
                  promo.targetCount
                ) * 100
              );



            return (

              <Card

                key={
                  promo.promoId
                }

              >


                <CardHeader>


                  <div className="flex justify-between">


                    <CardTitle>

                      {promo.name}

                    </CardTitle>



                    {
                      promo.completed && (

                        <Badge>

                          Completed

                        </Badge>

                      )
                    }


                  </div>


                </CardHeader>







                <CardContent className="space-y-5">



                  <p className="text-muted-foreground">

                    {promo.description}

                  </p>







                  <div className="grid md:grid-cols-3 gap-4">



                    <InfoCard

                      icon={
                        <Users/>
                      }

                      title="Requirement"

                      value={
                        formatRequirement(
                          promo.requirement
                        )
                      }

                    />




                    <InfoCard

                      icon={
                        promo.rewardType === 'cash'
                        ?
                        <Wallet/>
                        :
                        <Crown/>
                      }


                      title="Reward"


                      value={
                        promo.rewardType === 'cash'

                        ?

                        `₦${promo.rewardAmount}`

                        :

                        `${promo.rewardPlan} ${promo.rewardDurationDays} days`

                      }

                    />





                    <InfoCard

                      icon={
                        <Gift/>
                      }

                      title="Completed"

                      value={
                        `${promo.completedClaims}`
                      }

                    />




                  </div>









                  {
                    promo.requirement !== 'register'&& (

                      <div className="space-y-2">


                        <div className="flex justify-between text-sm">


                          <span>

                            Progress

                          </span>



                          <span>

                            {
                              promo.qualifiedReferrals
                            }

                            /

                            {
                              promo.targetCount
                            }

                          </span>


                        </div>



                        <Progress

                          value={
                            percentage
                          }

                        />




                        <p className="text-sm text-muted-foreground">


                          {

                            promo.remainingToNextReward

                          }

                          more qualified action(s)
                          needed.


                        </p>


                      </div>


                    )
                  }









                  {
                    promo.completed && (

                      <div className="flex items-center gap-2 text-sm">


                        <CheckCircle className="h-4 w-4"/>


                        Reward unlocked.


                      </div>


                    )
                  }






                  {
                    promo.requirement !== 'register' && (

                      <Button

                        variant="outline"

                      >

                        Share Referral Link

                      </Button>

                    )
                  }




                </CardContent>


              </Card>

            );


          })
        }



      </div>


    </div>

  );

}






function InfoCard({

  icon,

  title,

  value,

}:{

  icon:React.ReactNode;

  title:string;

  value:string;

}){


  return (

    <div className="rounded-lg border p-4">


      <div className="flex items-center gap-2 text-sm text-muted-foreground">


        {icon}


        {title}


      </div>



      <p className="font-semibold mt-2">

        {value}

      </p>



    </div>

  );


}







function formatRequirement(
  requirement:string
){


  return requirement
    .replaceAll('_',' ')
    .replace(
      /\b\w/g,
      char =>
        char.toUpperCase()
    );

}