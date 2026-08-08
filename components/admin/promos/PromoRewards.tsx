'use client';


import {
  useQuery,
} from '@tanstack/react-query';


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
  Skeleton,
} from '@/components/ui/skeleton';


import {
  getPromoRewards,
} from '@/services/admin-promos.service';





interface Props {

  promoId:string;

}





export default function PromoRewards({
  promoId,
}:Props){


  const {
    data:rewards = [],

    isLoading,

  } = useQuery({


    queryKey:[
      'promo-rewards',
      promoId,
    ],


    queryFn:()=>getPromoRewards(
      promoId,
    ),


    enabled:!!promoId,


  });





  if(isLoading){


    return (

      <Card>


        <CardHeader>

          <CardTitle>

            Rewards

          </CardTitle>

        </CardHeader>


        <CardContent className="space-y-4">


          <Skeleton className="h-12 w-full"/>

          <Skeleton className="h-12 w-full"/>

          <Skeleton className="h-12 w-full"/>


        </CardContent>


      </Card>

    );

  }





  return (

    <Card>


      <CardHeader>


        <CardTitle>

          Reward History

        </CardTitle>


      </CardHeader>





      <CardContent>


        {
          rewards.length === 0 ? (

            <p className="text-sm text-muted-foreground">

              No rewards generated yet.

            </p>

          ) : (


            <div className="space-y-4">


              {
                rewards.map(
                  reward => (


                    <div

                      key={reward._id}

                      className="
                      flex
                      items-center
                      justify-between
                      rounded-lg
                      border
                      p-4
                      "

                    >



                      <div className="space-y-1">


                        <p className="font-medium">

                          {
                            reward.userId?.username ??
                            reward.userId?.email
                          }

                        </p>



                        <p className="text-sm text-muted-foreground">

                          Claim #{reward.claimNumber}

                        </p>



                      </div>





                      <div className="flex items-center gap-3">


                        {
                          reward.type === 'subscription' ? (

                            <Badge variant="secondary">


                              {
                                reward.plan?.toUpperCase()
                              }


                              {' '}


                              {
                                reward.durationDays
                              } days


                            </Badge>


                          ) : (


                            <Badge variant="secondary">

                              ₦
                              {
                                reward.amount
                              }


                            </Badge>


                          )
                        }




                        <Badge>


                          {
                            reward.status
                          }

                        </Badge>



                      </div>



                    </div>


                  )

                )
              }


            </div>


          )
        }


      </CardContent>


    </Card>

  );

}